/**
 * The Aruna stills, crossfading with the scroll (ArunaScene.astro).
 *
 * The section is 3 screens tall and pins at a third of the way. The four frames
 * hand over at three points; each crossfade takes 7% of the ride, and each
 * picture pushes in by 6% over the time it is on screen, so there is always
 * something moving under the reader's hand, slowly, like light in a room.
 */
import { addScene, beat } from './scenes';

const HANDOVERS = [0.4, 0.6, 0.8];
const FADE = 0.07;
const PUSH = 0.06;

export function initArunaScene(root: HTMLElement): void {
  const canRun = window.matchMedia('(min-width: 60rem) and (prefers-reduced-motion: no-preference)');
  const frames = [...root.querySelectorAll<HTMLElement>('[data-frame]')];
  const pictures = frames.map((frame) => frame.querySelector<HTMLImageElement>('img'));
  const captions = frames.map((frame) => frame.querySelector<HTMLElement>('figcaption'));

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

      // Captions are words, and two sets of words on top of each other are
      // unreadable: the outgoing one leaves in the first half of the fade,
      // the incoming one arrives in the second.
      const caption = captions[i];
      if (caption) {
        const arriving = i === 0 ? 1 : Math.min(1, Math.max(0, fadeIn * 2 - 1));
        const leaving = Math.min(1, fadeOut * 2);
        caption.style.opacity = String(arriving * (1 - leaving));
      }

      const { from, to } = windows[i];
      const push = beat(progress, from, to);
      const picture = pictures[i];
      if (picture) picture.style.transform = `scale(${1 + push * PUSH})`;
    });
  }

  function rest(): void {
    for (const frame of frames) frame.removeAttribute('style');
    for (const picture of pictures) picture?.style.removeProperty('transform');
    for (const caption of captions) caption?.style.removeProperty('opacity');
  }

  const redraw = addScene(root, render);

  function sync(): void {
    root.classList.toggle('is-live', canRun.matches);
    if (!canRun.matches) rest();
    redraw();
  }

  canRun.addEventListener('change', sync);
  sync();
}
