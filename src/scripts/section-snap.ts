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
 */
import { motionIsFull } from './motion';

const QUIET_MS = 160;
const GLIDE_MS = 750;

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

  const go = (index: number) => {
    const target = sections[Math.max(0, Math.min(sections.length - 1, index))];
    if (!target) return;
    const behavior = motionIsFull() ? 'smooth' : 'auto';
    if (target.tagName === 'FOOTER') window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
    else target.scrollIntoView({ behavior, block: 'start' });
    lockedUntil = performance.now() + (behavior === 'smooth' ? GLIDE_MS : 0);
  };

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
