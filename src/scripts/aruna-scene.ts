/**
 * The design stills, crossfading with the scroll (ArunaScene.astro).
 *
 * The section pins as it arrives and its frames hand over at points spread
 * evenly between FIRST and LAST, however many frames there are. Each
 * crossfade takes 6% of the ride, and each picture pushes in by 6% over the
 * time it is on screen, so there is always something moving under the
 * reader's hand, slowly, like light in a room.
 */
import { addScene, beat } from './scenes';
import { motionIsFull, onMotionChange } from './motion';

const FIRST = 0.32;
const LAST = 0.84;
const FADE = 0.06;
const PUSH = 0.06;

export function initArunaScene(root: HTMLElement): void {
  const canRun = window.matchMedia('(min-width: 60rem)');
  const frames = [...root.querySelectorAll<HTMLElement>('[data-frame]')];
  const pictures = frames.map((frame) => frame.querySelector<HTMLImageElement>('img'));
  const HANDOVERS = frames
    .slice(1)
    .map((_, i) => (frames.length > 2 ? FIRST + (i * (LAST - FIRST)) / (frames.length - 2) : FIRST));

  // The window of the ride each frame is on screen for, fades included.
  const windows = frames.map((_, i) => ({
    from: i === 0 ? 0 : HANDOVERS[i - 1],
    to: i === frames.length - 1 ? 1 : HANDOVERS[i] + FADE,
  }));

  function render(progress: number): void {
    if (!root.classList.contains('is-live')) return;

    frames.forEach((frame, i) => {
      const fadeIn = i === 0 ? 1 : beat(progress, HANDOVERS[i - 1], HANDOVERS[i - 1] + FADE);
      const fadeOut = i === frames.length - 1 ? 0 : beat(progress, HANDOVERS[i], HANDOVERS[i] + FADE);
      // Only the incoming frame fades; the outgoing one stays opaque beneath
      // it until it is covered, so the two never show the ground between them.
      frame.style.opacity = String(fadeOut >= 1 ? 0 : fadeIn);

      const { from, to } = windows[i];
      const push = beat(progress, from, to);
      const picture = pictures[i];
      if (picture) picture.style.transform = `scale(${1 + push * PUSH})`;
    });
  }

  function rest(): void {
    for (const frame of frames) frame.removeAttribute('style');
    for (const picture of pictures) picture?.style.removeProperty('transform');
  }

  const redraw = addScene(root, render);

  function sync(): void {
    const live = canRun.matches && motionIsFull();
    root.classList.toggle('is-live', live);
    if (!live) rest();
    redraw();
  }

  canRun.addEventListener('change', sync);
  onMotionChange(sync);
  sync();
}
