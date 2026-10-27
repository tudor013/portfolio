/**
 * The scroll scenes: one reader of the scroll position for the whole page,
 * handing each scene a number from 0 to 1.
 *
 * Progress runs from an element's top edge entering at the bottom of the
 * screen (0) to its bottom edge reaching the bottom of the screen (1):
 *   - for a held scene, a section (hold + 1) screens tall whose stage sticks
 *     to the screen (CSS `position: sticky`), that is the whole ride: the
 *     stage slides in, pins at 1 / (hold + 1), and lets go at 1. A scene can
 *     already be drawing while it slides into view;
 *   - for an ordinary element, 1 means "fully on screen".
 *
 * Nothing captures the wheel: the page always scrolls natively, so the
 * scrollbar, the keyboard and the trackpad behave exactly as everywhere else.
 * The scene only reads where the page is and draws accordingly, which also
 * means scrolling back up plays it backwards for free.
 *
 * Why not GSAP: each scene here is a handful of numbers mapped to a handful
 * of styles. A plain function per scene is shorter than a timeline, ships no
 * library, and can be read top to bottom.
 */

import { motionIsFull, onMotionChange } from './motion';

export type Render = (progress: number) => void;

type Scene = {
  element: HTMLElement;
  render: Render;
  last: number;
};

const scenes: Scene[] = [];
let queued = false;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

onMotionChange(() => {
  for (const scene of scenes) scene.last = -1;
  if (motionIsFull()) queue();
});

function update(): void {
  queued = false;
  if (!motionIsFull()) return;

  const viewport = window.innerHeight;

  for (const scene of scenes) {
    const box = scene.element.getBoundingClientRect();
    // Scenes far off screen keep their last frame; there is nothing to see.
    if (box.bottom < -viewport || box.top > viewport * 2) continue;

    const progress = clamp01((viewport - box.top) / Math.max(box.height, 1));
    if (Math.abs(progress - scene.last) < 0.0005) continue;

    scene.last = progress;
    scene.element.style.setProperty('--p', progress.toFixed(4));
    scene.render(progress);
  }
}

function queue(): void {
  if (queued) return;
  queued = true;
  requestAnimationFrame(update);
}

let listening = false;

/**
 * Registers a scene and draws its first frame straight away, so a page
 * reloaded halfway down shows the right state rather than the start.
 */
export function addScene(element: HTMLElement, render: Render): () => void {
  const scene: Scene = { element, render, last: -1 };
  scenes.push(scene);

  if (!listening) {
    listening = true;
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
  }

  queue();

  // Lets a scene ask for a redraw when something other than the scroll
  // changed (a slider in the market, a font finishing loading).
  return () => {
    scene.last = -1;
    queue();
  };
}

/**
 * Whether held scenes should run here. They need room: on a phone, or when
 * reduced motion is selected, the finished composition stays in place.
 */
export function canHold(minWidth = 75): boolean {
  return (
    window.matchMedia(`(min-width: ${minWidth}rem)`).matches &&
    motionIsFull()
  );
}

/** Progress inside one beat of a scene, 0 before it starts and 1 after it ends. */
export const beat = (progress: number, start: number, end: number): number =>
  clamp01((progress - start) / (end - start));

/** Quint ease-out: quick to start, gentle to land. */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 5);
