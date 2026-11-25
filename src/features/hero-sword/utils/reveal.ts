/**
 * When the site opens on the home, its hero shows the background alone: the
 * first scroll (this many px) brings in the words and the sword, while the
 * hero holds still. Coming back from another page, they come in on load.
 */
export const HERO_REVEAL_SCROLL = 8;

/** Seconds after the reveal before the sword flies in (the words lead). */
export const SWORD_REVEAL_DELAY = 0.2;

/** On load (back from another page): the knight forms first, then the sword. */
export const SWORD_LOAD_DELAY = 1.1;
