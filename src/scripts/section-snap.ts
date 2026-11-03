/**
 * One wheel gesture, one section: the landing page's scroll (global.css,
 * "The landing page moves one section per scroll").
 *
 * CSS scroll snapping already handles the keys, touch and the trackpad's
 * long swipes, but a single notch of a mouse wheel (about 100px) is too
 * short for it: the browser decides the page was not really scrolled and
 * snaps back. So the wheel is taken over here, on a desktop only: a gesture
 * downwards glides to the next section, upwards to the previous one, and
 * the rest of the gesture (a trackpad's inertia, a fast wheel) is absorbed
 * so it cannot skip a section. A section taller than the screen is first
 * scrolled through normally, and only its edge hands over to the next.
 *
 * The move itself is a 0.9 s glide drawn here (ease in and out), the same
 * for the wheel, the trackpad and the keys; under reduced motion it is a
 * straight cut.
 */
import { motionIsFull } from './motion';

const QUIET_MS = 160;
const GLIDE_MS = 900;

/** Slow out of the first section, slow into the next: a glide, not a jump. */
const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function initSectionSnap(): void {
  const root = document.documentElement;
  if (!root.classList.contains('landing')) return;

  const desktop = window.matchMedia('(min-width: 60rem) and (min-height: 36rem)');
  const header = document.querySelector<HTMLElement>('[data-header]');
  const sections = [
    ...document.querySelectorAll<HTMLElement>('main > section:not(.intro), main > .intro > .screen'),
    ...document.querySelectorAll<HTMLElement>('body > footer'),
  ];

  let lockedUntil = 0;
  let lastWheel = 0;
  /** The current gesture already moved the page; the rest of it is absorbed. */
  let consumed = false;

  const top = () => header?.getBoundingClientRect().bottom ?? 0;

  /** The section the reader is in: the last one whose top has passed the header. */
  const currentIndex = () => {
    const line = top() + 2;
    let index = 0;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= line) index = i;
    });
    return index;
  };

  let raf = 0;

  /**
   * Glides the page to `y` frame by frame. The browser's own smooth scrolling
   * is not used: some browsers turn it into a jump when the page snaps, so the
   * glide is drawn here, with snapping switched off until it lands.
   */
  const glide = (y: number) => {
    cancelAnimationFrame(raf);
    const from = window.scrollY;
    const distance = y - from;
    if (!motionIsFull() || Math.abs(distance) < 1) {
      window.scrollTo({ top: y, behavior: 'instant' });
      lockedUntil = performance.now() + 50;
      return;
    }
    root.style.scrollSnapType = 'none';
    root.style.scrollBehavior = 'auto';
    const started = performance.now();
    lockedUntil = started + GLIDE_MS;
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / GLIDE_MS);
      window.scrollTo({ top: from + distance * easeInOut(t), behavior: 'instant' });
      if (t < 1) raf = requestAnimationFrame(step);
      else {
        raf = 0;
        root.style.removeProperty('scroll-snap-type');
        root.style.removeProperty('scroll-behavior');
      }
    };
    raf = requestAnimationFrame(step);
  };

  /** Where the page stops for a section: its top just under the header. */
  const stopFor = (section: HTMLElement) => {
    if (section.tagName === 'FOOTER') return document.documentElement.scrollHeight - window.innerHeight;
    return window.scrollY + section.getBoundingClientRect().top - top();
  };

  const go = (index: number) => {
    const target = sections[Math.max(0, Math.min(sections.length - 1, index))];
    if (target) glide(stopFor(target));
  };

  // The keys move a section at a time too, with the same glide. Keys typed
  // into a control (the market's sliders, a link's Enter) are left alone.
  window.addEventListener('keydown', (event) => {
    if (!desktop.matches || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, button, [contenteditable]')) return;
    const down = ['PageDown', 'ArrowDown', ' '].includes(event.key) && !event.shiftKey;
    const up = ['PageUp', 'ArrowUp'].includes(event.key) || (event.key === ' ' && event.shiftKey);
    if (!down && !up) return;
    if (performance.now() < lockedUntil) {
      event.preventDefault();
      return;
    }
    const index = currentIndex();
    const box = sections[index].getBoundingClientRect();
    if (down && box.bottom > window.innerHeight + 2) return;
    if (up && box.top < top() - 2) return;
    event.preventDefault();
    go(index + (down ? 1 : -1));
  });

  window.addEventListener(
    'wheel',
    (event) => {
      if (!desktop.matches || event.ctrlKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      const now = performance.now();
      // A pause between wheel events ends a gesture; the next one may move.
      if (now - lastWheel > QUIET_MS) consumed = false;
      lastWheel = now;

      if (now < lockedUntil || consumed) {
        event.preventDefault();
        return;
      }
      if (Math.abs(event.deltaY) < 4) return;

      const index = currentIndex();
      const box = sections[index].getBoundingClientRect();
      const down = event.deltaY > 0;

      // A section taller than the screen scrolls normally until its edge.
      if (down && box.bottom > window.innerHeight + 2) return;
      if (!down && box.top < top() - 2) return;

      event.preventDefault();
      consumed = true;
      go(index + (down ? 1 : -1));
    },
    { passive: false },
  );
}
