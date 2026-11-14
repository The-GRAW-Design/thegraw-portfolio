import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";

type ProgressiveBlurProps = {
  /** Gradient direction, in CSS degrees. */
  angle: number;
  /** Where the blur starts and where it reaches `blur`, in % of the gradient. */
  from: number;
  to: number;
  /** Strongest blur, in design px. */
  blur: number;
  /** Layers used to build the ramp. */
  steps?: number;
  className?: string;
};

/**
 * Figma progressive background blur: the radius grows linearly from 0 at
 * `from` to `blur` at `to`. Built from stacked backdrop blurs, each one
 * fading in where the previous one is fully on; since each layer blurs what
 * the ones below already blurred, their radii add up as √(r₁² + r₂² + …).
 */
export function ProgressiveBlur({
  angle,
  from,
  to,
  blur,
  steps = 5,
  className,
}: ProgressiveBlurProps) {
  const stop = (step: number) => from + ((to - from) * step) / steps;
  const total = (step: number) => (blur * step) / steps;

  return (
    <div aria-hidden className={cn("absolute inset-0", className)}>
      {Array.from({ length: steps }, (_, index) => {
        const step = index + 1;
        const radius = Math.sqrt(total(step) ** 2 - total(index) ** 2);
        const mask = `linear-gradient(${angle}deg, transparent ${stop(index)}%, var(--color-black) ${stop(step)}%)`;
        const style: CSSProperties = {
          backdropFilter: `blur(calc(var(--spacing) * ${radius.toFixed(2)}))`,
          WebkitBackdropFilter: `blur(calc(var(--spacing) * ${radius.toFixed(2)}))`,
          maskImage: mask,
          WebkitMaskImage: mask,
        };
        return <div key={step} className="absolute inset-0" style={style} />;
      })}
    </div>
  );
}
