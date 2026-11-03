/**
 * The design stills, changing by themselves (ArunaScene.astro).
 *
 * On a wide screen the section is one screen with one picture at a time; a
 * new one fades in every few seconds while the section is on screen, and
 * each pushes in slowly while it is shown (CSS). The cycle runs in full
 * motion mode and stops when the section leaves the screen or the tab is
 * hidden. The Pause button stops it for good (WCAG 2.2.2); in reduced motion
 * it starts paused, and Play still steps through the pictures.
 *
 * Without a script, or on a narrow screen, the pictures sit in a grid.
 */
import { motionIsFull, onMotionChange } from './motion';

const EVERY_MS = 3600;

export function initArunaScene(root: HTMLElement): void {
  const canRun = window.matchMedia('(min-width: 60rem)');
  const frames = [...root.querySelectorAll<HTMLElement>('[data-frame]')];
  const button = root.querySelector<HTMLButtonElement>('[data-cycle]')!;

  let current = 0;
  let timer = 0;
  let visible = false;
  let paused = !motionIsFull();

  const show = (index: number) => {
    current = (index + frames.length) % frames.length;
    frames.forEach((frame, i) => frame.classList.toggle('is-shown', i === current));
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = 0;
  };

  const start = () => {
    stop();
    if (paused || !visible || document.hidden || !root.classList.contains('is-live')) return;
    timer = window.setInterval(() => show(current + 1), EVERY_MS);
  };

  const label = () => {
    button.textContent = paused ? 'Play' : 'Pause';
    button.setAttribute('aria-pressed', String(paused));
  };

  button.addEventListener('click', () => {
    paused = !paused;
    if (!paused) show(current + 1);
    label();
    start();
  });

  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      start();
    },
    { threshold: 0.4 },
  ).observe(root);
  document.addEventListener('visibilitychange', start);

  function sync(): void {
    const live = canRun.matches;
    root.classList.toggle('is-live', live);
    button.hidden = !live;
    if (live) show(current);
    else for (const frame of frames) frame.classList.remove('is-shown');
    start();
  }

  canRun.addEventListener('change', sync);
  onMotionChange(() => {
    paused = !motionIsFull();
    label();
    sync();
  });
  label();
  sync();
}
