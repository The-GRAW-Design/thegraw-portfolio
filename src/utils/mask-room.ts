/**
 * Room for glyphs around SplitText masks: tight Figma line heights push
 * ascenders and descenders out of the line box, and negative tracking pushes
 * the last letter past its end. Negative margins keep the text in place.
 */
export const MASK_ROOM = {
  padding: "0.12em 0.15em 0.18em",
  margin: "-0.12em -0.15em -0.18em",
} as const;

/**
 * The same room for line masks. They stack as blocks, whose touching margins
 * collapse to the larger one instead of adding up, so every mask after the
 * first takes the whole 0.3em it adds (top and bottom padding) on its top.
 */
export const LINE_MASK_ROOM = {
  padding: MASK_ROOM.padding,
  marginTop: (index: number) => (index === 0 ? "-0.12em" : "-0.3em"),
  marginRight: "-0.15em",
  marginBottom: "-0.18em",
  marginLeft: "-0.15em",
} as const;
