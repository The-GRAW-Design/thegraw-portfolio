"use client";

import { useEffect, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { SwordMode } from "@/features/hero-sword/types";
import { mixPose, slotPose } from "@/features/hero-sword/utils/pose";
import { resetSwordWake, SWORD_WAKE } from "@/features/hero-sword/utils/wake";
import { EASE, gsap, ScrollTrigger } from "@/lib/gsap";
import { asset } from "@/utils/asset";

const MAX_DPR = 2;
/** A narrow lens: the sword keeps the flat look of the Figma image. */
const FOV = 18;
/** Model units along x: blade tip and pommel end. */
const MODEL = { tip: -0.7461, pommel: 0.2351 };
const MODEL_LENGTH = MODEL.pommel - MODEL.tip;
const MODEL_MID = (MODEL.pommel + MODEL.tip) / 2;
/** The hero forms first: the sword flies in this long after the page starts. */
const INTRO_DELAY = 1.1;
/** Idle motion: float (px), roll around the blade and cursor tilt (rad). */
const IDLE = { float: 5, roll: 0.14, tiltX: 0.16, tiltY: 0.28 };
/**
 * Phones: the upright sword turns slowly around its blade in the hero (like
 * a model viewer turntable, 20°/s).
 */
const TURNTABLE_SPEED = THREE.MathUtils.degToRad(20);
/** Share of the room the hilt reflects (the blade reflects all of it). */
const HILT_REFLECTION = 0.3;
/** Blade speed (px/s) that stirs the hero dither at full strength. */
const WAKE_SPEED = 2600;

const dockEase = gsap.parseEase(EASE.inOut);
const Z_AXIS = new THREE.Vector3(0, 0, 1);

function setMode(stack: HTMLElement, mode: SwordMode) {
  stack.dataset.sword = mode;
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials: THREE.Material[] = Array.isArray(object.material)
      ? object.material
      : [object.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose();
      });
      material.dispose();
    });
  });
}

/**
 * The home sword in 3D, drawn on a fixed canvas over the hero stack. It rests
 * in the `[data-sword-slot]` boxes (hero, then "Projetos"), read live every
 * frame, so it moves with the page:
 * - entry: flies in tip first, spinning, and lands with a shockwave through
 *   the hero dither (`SWORD_WAKE`);
 * - scroll: while "Projetos" comes up, it turns over and settles into its
 *   slot there, upright on desktop, flat on phones;
 * - idle: floats, rolls a little and leans toward the cursor; on phones it
 *   turns slowly around its blade instead.
 * Renders only while the hero stack is on screen; disposes everything.
 */
export function useSwordScene(containerRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    const stack = container?.closest<HTMLElement>("[data-hero-stack]");
    const heroSlot = stack?.querySelector('[data-sword-slot="hero"]');
    const projectsSlot = stack?.querySelector('[data-sword-slot="projects"]');
    const projects = projectsSlot?.closest("section");
    if (!container || !stack || !heroSlot || !projectsSlot || !projects) return;

    const startedAt = performance.now();
    let disposed = false;
    let visible = true;
    let model: THREE.Object3D | null = null;
    /** The sword materials: each holds the room map, turned with the slot. */
    const materials: THREE.MeshStandardMaterial[] = [];

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1;
    const canvas = renderer.domElement;
    canvas.className = "block size-full";
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04).texture;
    // Set on each sword material once the model loads (see there).
    room.dispose();

    // The light and the reflections turn with the slot angle, so the sword
    // looks the same lying or upright (the Figma uses one photo, rotated).
    const KEY_DIRECTION = new THREE.Vector3(-0.25, 1, 0.45);
    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.copy(KEY_DIRECTION);
    // Little fill, so the hilt keeps deep shade on the side away from the key.
    const fill = new THREE.AmbientLight(0xffffff, 0.06);
    scene.add(key, fill);

    const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 10);
    const pivot = new THREE.Group();
    // Spin around the blade first, then lean, then lie at the slot angle.
    pivot.rotation.order = "ZYX";
    pivot.visible = false;
    scene.add(pivot);

    // Viewport px <-> world: z = 0 is the screen plane, 1 unit = 1 CSS px.
    const viewport = { width: 1, height: 1 };
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      viewport.width = width;
      viewport.height = height;
      renderer.setSize(width, height, false);
      const distance = height / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
      camera.aspect = width / height;
      camera.position.set(0, 0, distance);
      camera.near = distance * 0.05;
      camera.far = distance * 4;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // Scroll: 0 in the hero, 1 once "Projetos" is centred on screen.
    let dock = 0;
    const dockTrigger = ScrollTrigger.create({
      trigger: projects,
      start: "top bottom",
      end: "center center",
      onUpdate: (self) => {
        dock = self.progress;
      },
      onRefresh: (self) => {
        dock = self.progress;
      },
    });

    // GSAP-driven: entry flight and the shockwave it leaves.
    const intro = { travel: 1, spin: 0, quiver: 0 };
    const ring = { radius: 0, strength: 0 };

    const pointer = { x: 0, y: 0 };
    const tilt = { x: 0, y: 0 };
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / viewport.width) * 2 - 1;
      pointer.y = (event.clientY / viewport.height) * 2 - 1;
    };
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    let last: { x: number; y: number; time: number } | null = null;
    let turntableSpin = 0;
    const tick = (time: number, deltaTime: number) => {
      if (!model) return;
      const frames = Math.min(deltaTime / (1000 / 60), 4);

      // Rest pose: between the two slots, as the page scrolls.
      const eased = dockEase(dock);
      const heroPose = slotPose(heroSlot);
      const pose = mixPose(heroPose, slotPose(projectsSlot), eased);

      // Phones (upright in the hero): the turntable runs while the hero is
      // on screen alone and holds still once "Projetos" comes up; settling
      // there finishes the turn at the nearest flat side.
      const turntable = heroPose.angle > Math.PI / 4;
      if (turntable && dock < 0.001) {
        turntableSpin -= (deltaTime / 1000) * TURNTABLE_SPEED;
      }
      const flatSide = Math.round(turntableSpin / (Math.PI * 2)) * Math.PI * 2;
      const spin = turntable
        ? turntableSpin + (flatSide - turntableSpin) * eased
        : Math.sin(time * 0.6) * IDLE.roll;

      // Entry: from beyond the hilt end, along the blade, tip first. It
      // starts with the whole blade past the screen edge.
      const toHilt = { x: Math.cos(pose.angle), y: -Math.sin(pose.angle) };
      const toEdge =
        Math.abs(toHilt.x) * (toHilt.x > 0 ? viewport.width - pose.x : pose.x) +
        Math.abs(toHilt.y) * (toHilt.y > 0 ? viewport.height - pose.y : pose.y);
      const reach = toEdge + pose.length * 0.6;
      const x = pose.x + toHilt.x * reach * intro.travel;
      const y =
        pose.y +
        toHilt.y * reach * intro.travel +
        Math.sin(time * 0.9) * IDLE.float * (1 - intro.travel);

      const lag = 1 - Math.pow(0.92, frames);
      tilt.x += (pointer.y - tilt.x) * lag;
      tilt.y += (pointer.x - tilt.y) * lag;

      // Turns over once while it settles into "Projetos".
      const turn = eased * Math.PI * 2;
      const lift = Math.sin(Math.PI * eased) * pose.length * 0.22;
      pivot.position.set(x - viewport.width / 2, viewport.height / 2 - y, lift);
      pivot.rotation.set(
        intro.spin + turn + spin + tilt.x * IDLE.tiltX,
        tilt.y * IDLE.tiltY,
        pose.angle + Math.sin(time * 38) * 0.035 * intro.quiver,
      );
      pivot.scale.setScalar(pose.length / MODEL_LENGTH);
      materials.forEach((material) => {
        material.envMapRotation.z = pose.angle;
      });
      key.position.copy(KEY_DIRECTION).applyAxisAngle(Z_AXIS, pose.angle);
      renderer.render(scene, camera);

      // The blade, tip to pommel, pushes the hero dither while it moves.
      const half = pose.length / 2;
      SWORD_WAKE.a.x = x - toHilt.x * half;
      SWORD_WAKE.a.y = y - toHilt.y * half;
      SWORD_WAKE.b.x = x + toHilt.x * half;
      SWORD_WAKE.b.y = y + toHilt.y * half;
      const speed = last
        ? Math.hypot(x - last.x, y - last.y) / Math.max(time - last.time, 1e-3)
        : 0;
      last = { x, y, time };
      const target = Math.min(1, speed / WAKE_SPEED);
      SWORD_WAKE.strength +=
        (target - SWORD_WAKE.strength) * (1 - Math.pow(0.8, frames));
      SWORD_WAKE.ring = ring.radius;
      SWORD_WAKE.ringStrength = ring.strength;
    };

    const updateLoop = () => {
      gsap.ticker.remove(tick);
      if (visible && model && !disposed) {
        gsap.ticker.add(tick);
        canvas.style.visibility = "visible";
      } else {
        canvas.style.visibility = "hidden";
        resetSwordWake();
        last = null;
      }
    };
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateLoop();
    });
    intersectionObserver.observe(stack);

    let flight: gsap.core.Timeline | null = null;
    const loader = new GLTFLoader();
    loader
      .loadAsync(asset("/models/sword.glb"))
      .then((gltf) => {
        if (disposed) {
          disposeObject(gltf.scene);
          return;
        }
        const anisotropy = renderer.capabilities.getMaxAnisotropy();
        gltf.scene.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.frustumCulled = false;
          const material = object.material as THREE.MeshStandardMaterial;
          [material.map, material.normalMap, material.roughnessMap].forEach(
            (texture) => {
              if (texture) texture.anisotropy = anisotropy;
            },
          );
          // The room map is set on each material: three only applies
          // `envMapIntensity` to a material's own map, not to the scene's.
          // The hilt (grip, guard, ring, pommel) takes less of the room, so
          // the key light shapes it with visible shade; the blade keeps the
          // full reflection.
          material.envMap = environment;
          material.envMapIntensity = material.name.includes("Lamina")
            ? 1
            : HILT_REFLECTION;
          materials.push(material);
        });
        // Centred between the tip and the pommel end.
        gltf.scene.position.x = -MODEL_MID;
        pivot.add(gltf.scene);
        model = gltf.scene;
        setMode(stack, "live");

        const elapsed = (performance.now() - startedAt) / 1000;
        flight = gsap
          .timeline({
            delay: Math.max(0, INTRO_DELAY - elapsed),
            // Nothing shows before the flight.
            onStart: () => {
              pivot.visible = true;
            },
          })
          .fromTo(
            intro,
            { travel: 1, spin: Math.PI * 3 },
            { travel: 0, spin: 0, duration: 1.35, ease: EASE.expo },
          )
          // It bites in: the blade shivers and the shockwave runs out.
          .fromTo(
            intro,
            { quiver: 1 },
            { quiver: 0, duration: 0.9, ease: EASE.out },
            0.22,
          )
          .fromTo(
            ring,
            { radius: 0, strength: 1 },
            {
              radius: () => Math.hypot(viewport.width, viewport.height) * 0.75,
              strength: 0,
              duration: 1.6,
              ease: "power2.out",
            },
            0.2,
          );
        updateLoop();
      })
      .catch(() => {
        if (!disposed) setMode(stack, "static");
      });

    return () => {
      disposed = true;
      gsap.ticker.remove(tick);
      flight?.kill();
      dockTrigger.kill();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      if (model) disposeObject(model);
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      resetSwordWake();
      delete stack.dataset.sword;
    };
  }, [containerRef]);
}
