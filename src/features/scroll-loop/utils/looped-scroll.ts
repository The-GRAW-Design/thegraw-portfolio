/**
 * Scroll position of a looping page as if the loop were unrolled: each time
 * the page wraps back to its start (or, going up, past its end), one period is
 * added (or taken away), so readers such as the header see one steady scroll
 * instead of a jump.
 */
let period = 0;
let last = 0;
let turns = 0;

/** Height of one turn of the loop; 0 when the page does not loop. */
export function setLoopPeriod(next: number) {
  period = next;
  if (next <= 0) turns = 0;
}

export function getLoopPeriod() {
  return period;
}

export function loopedScroll(scroll: number) {
  if (period > 0 && Math.abs(scroll - last) > period / 2) {
    turns += scroll < last ? 1 : -1;
  }
  last = scroll;
  return scroll + turns * period;
}
