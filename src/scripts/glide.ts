/**
 * Whether the landing page is gliding from one section to the next
 * (section-snap.ts). Entrances and scenes that start "on arrival" wait for
 * the glide to land, so a section slides in still and only then comes alive.
 */
let gliding = false;
const waiting: Array<() => void> = [];

export const isGliding = (): boolean => gliding;

export function setGliding(value: boolean): void {
  gliding = value;
  if (!value) for (const run of waiting.splice(0)) run();
}

/** Runs `run` now, or as soon as the current glide lands. */
export function afterGlide(run: () => void): void {
  if (gliding) waiting.push(run);
  else run();
}
