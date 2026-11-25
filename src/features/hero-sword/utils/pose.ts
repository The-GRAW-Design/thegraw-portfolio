import type { SwordPose } from "@/features/hero-sword/types";

/**
 * The pose of the sword resting in a slot: the slot box wraps the sword, which
 * lies along its longer side, hilt to the right or up.
 */
export function slotPose(element: Element): SwordPose {
  const box = element.getBoundingClientRect();
  const flat = box.width >= box.height;
  return {
    x: box.left + box.width / 2,
    y: box.top + box.height / 2,
    length: flat ? box.width : box.height,
    angle: flat ? 0 : Math.PI / 2,
  };
}

const mix = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

export function mixPose(
  from: SwordPose,
  to: SwordPose,
  amount: number,
): SwordPose {
  return {
    x: mix(from.x, to.x, amount),
    y: mix(from.y, to.y, amount),
    length: mix(from.length, to.length, amount),
    angle: mix(from.angle, to.angle, amount),
  };
}
