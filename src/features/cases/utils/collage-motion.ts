import type { CaseCollage } from "@/features/cases/types";

/** Parallax of the whole case and of the pieces (× their depth), in px. */
export const MAIN_PARALLAX = 16;
export const PIECE_PARALLAX = 70;
/** A hovered piece pushes the others away: strength and falloff, in px. */
const REPEL_STRENGTH = 185;
const REPEL_RANGE = 1000;
/** Share of the push covered per 60fps frame. */
const REPEL_FOLLOW = 0.02;
/**
 * With the cursor over the main image the pieces make room: each one moves
 * this far (design px) away from the cursor, eased in and out.
 */
const ROOM_PUSH = 110;
const ROOM_FOLLOW = 0.07;

type Point = { x: number; y: number };

export type PieceMotionFrame = {
  /** 60fps frames since the last one. */
  frames: number;
  /** Seconds, for the idle float. */
  time: number;
  /** 0 with reduced motion: the pieces rest in place. */
  still: number;
  /** −1…1: what the pieces follow (the cursor, or the phone tilt). */
  input: Point;
  /** The mouse in collage design px, while it is over the stage. */
  cursor: Point | null;
  /** Design px → CSS px. */
  unit: number;
  /** Scale of the parallax, float and push (1: px, as on the cases page). */
  amplitude: number;
  /** Travel of a piece of depth 1, before `amplitude`. */
  parallax?: number;
  /** The hovered piece, which pushes the others away. */
  repel: number | null;
};

/**
 * The motion of the collage pieces, as on julia-paternostro.com: they float,
 * follow the cursor (each at its depth and pace), back away from the hovered
 * one and make room while the cursor is over the main image. Returns a step
 * that gives each piece's offset, in CSS px, for one frame.
 */
export function createPieceMotion(collage: CaseCollage) {
  const centers = collage.pieces.map(({ rect }) => ({
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  }));
  const main = collage.main.rect;
  const drift = collage.pieces.map(() => ({ x: 0, y: 0 }));
  const push = collage.pieces.map(() => ({ x: 0, y: 0 }));
  const offsets = collage.pieces.map(() => ({ x: 0, y: 0 }));
  /** 0–1: how much the pieces are making room, and around which point. */
  let room = 0;
  const roomFrom = { x: 0, y: 0 };

  return (frame: PieceMotionFrame): readonly Point[] => {
    const { frames, time, still, input, cursor, unit, amplitude, repel } =
      frame;
    const parallax = (frame.parallax ?? PIECE_PARALLAX) * amplitude;

    // Pieces overlap the main image: with the cursor on one of them nothing
    // makes room, or the piece would run from the cursor hovering it. Nor
    // where a piece rests: there the room closes again and the piece comes
    // back under the cursor, instead of backing off as fast as it reaches.
    let overMain = false;
    if (still && cursor && repel === null) {
      const onPiece = collage.pieces.some(({ rect }, index) => {
        const x = cursor.x - drift[index].x / unit;
        const y = cursor.y - drift[index].y / unit;
        return (
          x >= rect.x &&
          x <= rect.x + rect.width &&
          y >= rect.y &&
          y <= rect.y + rect.height
        );
      });
      overMain =
        !onPiece &&
        cursor.x >= main.x &&
        cursor.x <= main.x + main.width &&
        cursor.y >= main.y &&
        cursor.y <= main.y + main.height;
      if (overMain) {
        roomFrom.x = cursor.x;
        roomFrom.y = cursor.y;
      }
    }
    room +=
      ((overMain ? 1 : 0) - room) * (1 - Math.pow(1 - ROOM_FOLLOW, frames));

    const source = still ? repel : null;
    const pushLag = 1 - Math.pow(1 - REPEL_FOLLOW, frames);
    collage.pieces.forEach((piece, index) => {
      const [seedX, seedY] = piece.seed;
      const followX = Math.min(1, (0.045 + 0.12 * seedX) * frames);
      const followY = Math.min(1, (0.045 + 0.12 * seedY) * frames);
      const goalX = input.x * still * piece.depth * parallax;
      const goalY = input.y * still * piece.depth * parallax;
      drift[index].x += (goalX - drift[index].x) * followX;
      drift[index].y += (goalY - drift[index].y) * followY;
      const floatX =
        still *
        Math.sin(time * (0.3 + 0.5 * seedX) + Math.PI * 2 * seedX) *
        (4 + 9 * seedX) *
        amplitude;
      const floatY =
        still *
        Math.cos(time * (0.28 + 0.5 * seedY) + Math.PI * 2 * seedY) *
        (4 + 9 * seedY) *
        amplitude;

      // Away from the hovered piece, harder the closer it is.
      let pushX = 0;
      let pushY = 0;
      if (source !== null && source !== index) {
        let awayX = (centers[index].x - centers[source].x) * unit;
        let awayY = (centers[index].y - centers[source].y) * unit;
        let distance = Math.hypot(awayX, awayY);
        if (distance < 1) {
          awayX = Math.cos(Math.PI * 2 * seedX);
          awayY = Math.sin(Math.PI * 2 * seedX);
          distance = 1;
        }
        const force =
          REPEL_STRENGTH * amplitude * Math.exp(-distance / REPEL_RANGE);
        pushX = (awayX / distance) * force;
        pushY = (awayY / distance) * force;
      }
      push[index].x += (pushX - push[index].x) * pushLag;
      push[index].y += (pushY - push[index].y) * pushLag;

      // Away from the cursor while it is over the main image.
      let roomX = 0;
      let roomY = 0;
      if (room > 0.001) {
        let awayX = centers[index].x - roomFrom.x;
        let awayY = centers[index].y - roomFrom.y;
        let distance = Math.hypot(awayX, awayY);
        if (distance < 1) {
          awayX = Math.cos(Math.PI * 2 * seedX);
          awayY = Math.sin(Math.PI * 2 * seedX);
          distance = 1;
        }
        const reach = ROOM_PUSH * unit * room;
        roomX = (awayX / distance) * reach;
        roomY = (awayY / distance) * reach;
      }

      offsets[index].x = drift[index].x + floatX + push[index].x + roomX;
      offsets[index].y = drift[index].y + floatY + push[index].y + roomY;
    });
    return offsets;
  };
}
