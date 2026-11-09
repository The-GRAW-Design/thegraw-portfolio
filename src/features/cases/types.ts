/** A rectangle in Figma pixels of the 1276×655 collage. */
export type CollageRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CollageSlot = {
  rect: CollageRect;
};

/** A piece around the main image: it floats, follows the cursor and blinks. */
export type CollagePiece = CollageSlot & {
  /** Drawn under the main image (Figma layer order). */
  behind?: boolean;
  /** 0–1: how far it travels with the cursor (× 70px). */
  depth: number;
  /** 0–1 seeds for x and y: speed, phase and size of the idle float, and how fast it catches the cursor. */
  seed: readonly [number, number];
};

export type CaseCollage = {
  main: CollageSlot;
  pieces: readonly CollagePiece[];
};
