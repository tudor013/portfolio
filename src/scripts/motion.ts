/**
 * The page's two motion modes, as CLAUDE.md asks: full (scroll scenes,
 * entrances, the badge's drop and sway) and reduced (every section in its
 * finished state). The first visit follows the operating system's
 * `prefers-reduced-motion`; a choice made with the header's button is stored
 * and wins from then on.
 *
 * The current mode lives on <html data-motion="full | reduced">. An inline
 * script in BaseLayout sets it before the first paint, so a page never draws
 * in the wrong mode and then jumps. Scripts read it with motionIsFull() and
 * hear about changes through onMotionChange().
 */
export type MotionMode = 'full' | 'reduced';

/** Also read by the inline script in BaseLayout.astro; keep the two equal. */
const STORAGE_KEY = 'portfolio-motion';
const MOTION_EVENT = 'portfolio:motionchange';

function readSavedMode(): MotionMode | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'full' || saved === 'reduced' ? saved : null;
  } catch {
    // Storage can be blocked (private windows, strict settings); the
    // operating-system preference still applies.
    return null;
  }
}

export function motionIsFull(): boolean {
  return document.documentElement.dataset.motion === 'full';
}

export function onMotionChange(callback: () => void): () => void {
  window.addEventListener(MOTION_EVENT, callback);
  return () => window.removeEventListener(MOTION_EVENT, callback);
}

/**
 * Wires the header's toggle. Its accessible name is the constant "Motion" and
 * its state is aria-pressed, so a screen reader hears "Motion, toggle button,
 * pressed". The visible "on" / "off" beside the name is for sighted readers
 * and hidden from assistive technology, which already has the state.
 */
export function initMotionToggle(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  const state = button?.querySelector<HTMLElement>('[data-motion-state]');
  if (!button || !state) return;

  const root = document.documentElement;
  const system = window.matchMedia('(prefers-reduced-motion: reduce)');
  let chosen = readSavedMode() !== null;

  const show = (): void => {
    const full = motionIsFull();
    button.setAttribute('aria-pressed', String(full));
    state.textContent = full ? 'on' : 'off';
  };

  const apply = (mode: MotionMode, byVisitor: boolean): void => {
    root.dataset.motion = mode;
    root.dataset.motionChoice = byVisitor ? 'user' : 'system';
    show();
    window.dispatchEvent(new Event(MOTION_EVENT));
  };

  // The inline script has already applied the saved or system mode.
  show();
  // The control exists only once it can do something; without a script the
  // page simply follows the operating system.
  button.hidden = false;

  button.addEventListener('click', () => {
    const next: MotionMode = motionIsFull() ? 'reduced' : 'full';
    chosen = true;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice still holds for this visit.
    }
    apply(next, true);
  });

  system.addEventListener('change', (event) => {
    if (chosen) return;
    apply(event.matches ? 'reduced' : 'full', false);
  });
}
