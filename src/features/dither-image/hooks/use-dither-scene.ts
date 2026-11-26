"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { DITHER_BAKE_FRAGMENT_SHADER } from "@/features/dither-image/shaders/dither-bake-fragment";
import { DITHER_PRESENT_FRAGMENT_SHADER } from "@/features/dither-image/shaders/dither-present-fragment";
import { DITHER_VERTEX_SHADER } from "@/features/dither-image/shaders/dither-vertex";
import type {
  DitherDisturbance,
  DitherFrame,
  DitherPalette,
  DitherQuantize,
} from "@/features/dither-image/types";
import {
  BAYER_SIZE,
  createBayerThresholds,
} from "@/features/dither-image/utils/bayer";
import { ditherCellSize } from "@/features/dither-image/utils/color";
import {
  MAX_PALETTE_STOPS,
  resolvePalette,
} from "@/features/dither-image/utils/palette";
import { gsap } from "@/lib/gsap";

const MAX_DPR = 2;
const QUANTIZE_MODE: Record<DitherQuantize, number> = {
  none: 0,
  ordered: 1,
  posterize: 2,
};
/**
 * Motion with the effect's own pixels: share of cells showing another baked
 * variant, cells hopping in calm air, and the wind (gust drift speed, max cells
 * blown to the right, gust scale).
 */
const MOTION = {
  boil: 0.12,
  swap: 0.03,
  windSpeed: 0.9,
  windStrength: 6,
  windScale: 2.5,
};
/** Bayer phase (in cells) of each baked variant; variant 0 is the Figma one. */
const VARIANT_PHASES = [
  [0, 0],
  [7, 3],
  [3, 11],
] as const;
/** The motion re-renders this many times per second when nothing else moves. */
const TICKS_PER_SECOND = 24;

/** Uniforms driven by GSAP (entry, scroll, cursor). */
export type DitherUniforms = {
  uReveal: THREE.IUniform<number>;
  uEntryCoarse: THREE.IUniform<number>;
  uScrollCoarse: THREE.IUniform<number>;
  uMouse: THREE.IUniform<THREE.Vector2>;
  uMouseStrength: THREE.IUniform<number>;
};

type DitherSceneOptions = {
  src: string;
  /** Played instead of `src`, baked again on each of its frames. */
  video?: string;
  palette: DitherPalette;
  pixelSize: number;
  opacity: number;
  offset: number;
  scatter: number;
  quantize: DitherQuantize;
  levels: number;
  /** Figma "Dither" brightness (%) and contrast. */
  brightness: number;
  contrast: number;
  frame: DitherFrame;
  /** Keep the image moving while visible, or render it once. */
  continuous: boolean;
  /** Read every frame: cells pushed away from a moving segment. */
  disturbance?: DitherDisturbance;
};

function createBayerTexture() {
  const texture = new THREE.DataTexture(
    createBayerThresholds(),
    BAYER_SIZE,
    BAYER_SIZE,
    THREE.RedFormat,
    THREE.FloatType,
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createBakeTarget() {
  return new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    generateMipmaps: false,
  });
}

/**
 * Owns the Three.js renderer for one dither image. The Figma look is baked
 * once per size (bake pass); every frame a light pass animates it. Handles
 * texture loading, resize, DPR cap, pausing off-screen and full disposal.
 * A fresh canvas is created per mount, so a lost context is never reused.
 * Returns the GSAP-driven uniforms of the current scene once its image is
 * ready: a new object per scene, so animations rebind when it is rebuilt.
 */
export function useDitherScene(
  containerRef: RefObject<HTMLDivElement | null>,
  {
    src,
    video,
    palette,
    pixelSize,
    opacity,
    offset,
    scatter,
    quantize,
    levels,
    brightness,
    contrast,
    frame,
    continuous,
    disturbance,
  }: DitherSceneOptions,
) {
  const [uniforms, setUniforms] = useState<DitherUniforms | null>(null);
  // A mutable object written by its owner: read live, never a dependency.
  const disturbanceRef = useRef(disturbance);
  useEffect(() => {
    disturbanceRef.current = disturbance;
  }, [disturbance]);
  // Props from Server Components arrive as new objects on every navigation:
  // compare them by value so an unchanged palette or frame keeps the scene.
  const paletteKey = JSON.stringify(palette);
  const frameKey = JSON.stringify(frame);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.className = "block size-full";
    container.appendChild(canvas);

    let disposed = false;
    let visible = false;
    let loaded = false;
    let imageTexture: THREE.Texture | null = null;
    // A video source: a new frame to bake, and where it was last seen
    // (browsers without `requestVideoFrameCallback` follow its clock).
    let player: HTMLVideoElement | null = null;
    let frameRequest = 0;
    let frameReady = false;
    let followClock = false;
    let lastVideoTime = -1;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
    renderer.setClearColor(0x000000, 0);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const bayerTexture = createBayerTexture();
    const resolved = resolvePalette(JSON.parse(paletteKey) as DitherPalette);
    const sceneFrame = JSON.parse(frameKey) as DitherFrame;
    const toVector = (rgb: readonly number[] | undefined) =>
      new THREE.Vector3(...(rgb ?? [0, 0, 0]));
    const resolution = new THREE.Vector2(1, 1);
    const bakeTargets = VARIANT_PHASES.map(() => createBakeTarget());
    const paletteColors = Array.from({ length: MAX_PALETTE_STOPS }, (_, i) =>
      toVector(resolved.colors[i]),
    );
    const paletteStops = Array.from(
      { length: MAX_PALETTE_STOPS },
      (_, i) => resolved.positions[i] ?? 1,
    );

    const bakeMaterial = new THREE.ShaderMaterial({
      vertexShader: DITHER_VERTEX_SHADER,
      fragmentShader: DITHER_BAKE_FRAGMENT_SHADER,
      uniforms: {
        uImage: { value: null },
        uBayer: { value: bayerTexture },
        uResolution: { value: resolution },
        uImageSize: { value: new THREE.Vector2(1, 1) },
        uFrame: {
          value: new THREE.Vector4(
            sceneFrame.x,
            sceneFrame.y,
            sceneFrame.width,
            sceneFrame.height,
          ),
        },
        uColors: { value: paletteColors },
        uStops: { value: paletteStops },
        uStopCount: { value: resolved.colors.length },
        uPixelSize: { value: 1 },
        uSubsamples: { value: 1 },
        uOffset: { value: offset },
        uScatter: { value: scatter },
        uSeed: { value: 0 },
        uPhase: { value: new THREE.Vector2() },
        uQuantize: { value: QUANTIZE_MODE[quantize] },
        uLevels: { value: levels },
        // Figma "Dither": brightness shifts by (b - 100) / 200, contrast
        // scales around 0.5.
        uBrightness: { value: (brightness - 100) / 200 },
        uContrast: { value: contrast },
      },
      depthTest: false,
      depthWrite: false,
    });

    const animated: DitherUniforms = {
      uReveal: { value: continuous ? 0 : 1 },
      uEntryCoarse: { value: 1 },
      uScrollCoarse: { value: 1 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseStrength: { value: 0 },
    };
    const presentMaterial = new THREE.ShaderMaterial({
      vertexShader: DITHER_VERTEX_SHADER,
      fragmentShader: DITHER_PRESENT_FRAGMENT_SHADER,
      uniforms: {
        ...animated,
        uBake0: { value: bakeTargets[0].texture },
        uBake1: { value: bakeTargets[1].texture },
        uBake2: { value: bakeTargets[2].texture },
        uBayer: { value: bayerTexture },
        uResolution: { value: resolution },
        uCell: { value: 1 },
        uOpacity: { value: opacity },
        uTime: { value: 0 },
        uLive: { value: continuous ? 1 : 0 },
        uBoil: { value: MOTION.boil },
        uSwap: { value: MOTION.swap },
        uWindSpeed: { value: MOTION.windSpeed },
        uWindStrength: { value: MOTION.windStrength },
        uWindScale: { value: MOTION.windScale },
        uMouseRadius: { value: 0.22 },
        uPixelRatio: { value: 1 },
        uWakeA: { value: new THREE.Vector2() },
        uWakeB: { value: new THREE.Vector2() },
        uWake: { value: 0 },
        uWakeRing: { value: 0 },
        uWakeRingStrength: { value: 0 },
      },
      blending: THREE.NoBlending,
      depthTest: false,
      depthWrite: false,
    });

    const bakeScene = new THREE.Scene();
    bakeScene.add(new THREE.Mesh(geometry, bakeMaterial));
    const presentScene = new THREE.Scene();
    presentScene.add(new THREE.Mesh(geometry, presentMaterial));

    const bake = () => {
      const uniforms = bakeMaterial.uniforms;
      bakeTargets.forEach((target, index) => {
        uniforms.uSeed.value = index;
        uniforms.uPhase.value.set(...VARIANT_PHASES[index]);
        renderer.setRenderTarget(target);
        renderer.render(bakeScene, camera);
      });
      renderer.setRenderTarget(null);
    };

    const present = () => {
      if (loaded) renderer.render(presentScene, camera);
    };

    // The disturbance segment, in drawing-buffer px from the top left.
    const wake = presentMaterial.uniforms;
    const readDisturbance = () => {
      const source = disturbanceRef.current;
      if (!source || (source.strength < 0.001 && source.ringStrength < 0.001)) {
        wake.uWake.value = 0;
        wake.uWakeRingStrength.value = 0;
        return "";
      }
      const rect = container.getBoundingClientRect();
      const ratio = rect.width ? resolution.x / rect.width : 1;
      wake.uWakeA.value.set(
        (source.a.x - rect.left) * ratio,
        (source.a.y - rect.top) * ratio,
      );
      wake.uWakeB.value.set(
        (source.b.x - rect.left) * ratio,
        (source.b.y - rect.top) * ratio,
      );
      wake.uWake.value = source.strength;
      wake.uWakeRing.value = source.ring * ratio;
      wake.uWakeRingStrength.value = source.ringStrength;
      return [
        wake.uWakeA.value.x,
        wake.uWakeA.value.y,
        wake.uWakeB.value.x,
        wake.uWakeB.value.y,
        source.strength,
        source.ring,
        source.ringStrength,
      ].join();
    };

    // Re-render only when the random motion re-rolls, a GSAP uniform moved
    // or the video shows a new frame (baked again first).
    let lastTick = -1;
    let lastState = "";
    const tick = (_time: number, deltaTime: number) => {
      const time = (presentMaterial.uniforms.uTime.value += deltaTime / 1000);
      if (player && followClock) {
        frameReady ||= player.currentTime !== lastVideoTime;
        lastVideoTime = player.currentTime;
      }
      if (frameReady) {
        frameReady = false;
        bake();
        lastTick = -1;
      }
      const motionTick = Math.floor(time * TICKS_PER_SECOND);
      const state = [
        animated.uReveal.value,
        animated.uEntryCoarse.value,
        animated.uScrollCoarse.value,
        animated.uMouse.value.x,
        animated.uMouse.value.y,
        animated.uMouseStrength.value,
        readDisturbance(),
      ].join();
      if (motionTick === lastTick && state === lastState) return;
      lastTick = motionTick;
      lastState = state;
      present();
    };

    const updateLoop = () => {
      gsap.ticker.remove(tick);
      if (continuous && visible && loaded && !disposed) gsap.ticker.add(tick);
      // The video only plays while it can be seen.
      if (!player) return;
      if (visible && !disposed) player.play().catch(() => {});
      else player.pause();
    };

    const drawingBuffer = new THREE.Vector2();
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      renderer.getDrawingBufferSize(drawingBuffer);
      resolution.copy(drawingBuffer);
      bakeTargets.forEach((target) =>
        target.setSize(drawingBuffer.x, drawingBuffer.y),
      );

      const { cell, subsamples } = ditherCellSize(
        pixelSize,
        renderer.getPixelRatio(),
      );
      bakeMaterial.uniforms.uPixelSize.value = cell;
      bakeMaterial.uniforms.uSubsamples.value = subsamples;
      presentMaterial.uniforms.uCell.value = Math.max(cell, 1);
      presentMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
      if (loaded) {
        bake();
        present();
      }
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateLoop();
    });
    intersectionObserver.observe(container);

    const show = (texture: THREE.Texture, width: number, height: number) => {
      // Raw values: the bake shader converts them like Figma does.
      texture.colorSpace = THREE.NoColorSpace;
      // UVs use a top-left origin, like the CSS layout.
      texture.flipY = false;
      texture.minFilter = THREE.LinearFilter;
      // Figma enlarges the image under its effects without smoothing: each
      // source pixel shows as a block (≈3.4px in the hero), with the fine
      // dither over it. The fallback samples it the same way.
      texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      bakeMaterial.uniforms.uImage.value = texture;
      bakeMaterial.uniforms.uImageSize.value.set(width, height);
      imageTexture = texture;
      loaded = true;
      bake();
      present();
      updateLoop();
      setUniforms(animated);
    };

    if (video) {
      // Muted and inline, so browsers let it play on its own.
      const element = document.createElement("video");
      element.muted = true;
      element.loop = true;
      element.playsInline = true;
      element.preload = "auto";
      element.crossOrigin = "anonymous";
      element.src = video;
      player = element;
      followClock = !("requestVideoFrameCallback" in element);
      if (!followClock) {
        const nextFrame = () => {
          frameReady = true;
          frameRequest = element.requestVideoFrameCallback(nextFrame);
        };
        frameRequest = element.requestVideoFrameCallback(nextFrame);
      }
      element.addEventListener(
        "loadeddata",
        () => {
          if (disposed) return;
          const texture = new THREE.VideoTexture(element);
          // Its first frame is there even before it plays.
          texture.needsUpdate = true;
          show(texture, element.videoWidth, element.videoHeight);
        },
        { once: true },
      );
      updateLoop();
    } else {
      new THREE.TextureLoader()
        .loadAsync(src)
        .then((texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          const image = texture.image as { width: number; height: number };
          show(texture, image.width, image.height);
        })
        .catch(() => {
          // Leave the container background visible if the image fails.
        });
    }

    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      geometry.dispose();
      bakeMaterial.dispose();
      presentMaterial.dispose();
      bakeTargets.forEach((target) => target.dispose());
      bayerTexture.dispose();
      imageTexture?.dispose();
      if (player) {
        if (!followClock) player.cancelVideoFrameCallback(frameRequest);
        player.pause();
        player.removeAttribute("src");
        player.load();
      }
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      setUniforms(null);
    };
  }, [
    containerRef,
    src,
    video,
    paletteKey,
    pixelSize,
    opacity,
    offset,
    scatter,
    quantize,
    levels,
    brightness,
    contrast,
    frameKey,
    continuous,
  ]);

  return uniforms;
}
