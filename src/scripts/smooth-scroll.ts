/**
 * Weighted wheel scrolling with Lenis, in full motion mode only.
 *
 * Lenis still scrolls the window itself, so the scrollbar, the keyboard and
 * the scroll scenes (scenes.ts reads the window's scroll events) work exactly
 * as before; only the wheel's steps are eased into a glide. Touch screens keep
 * their own scrolling, which is already smooth, and the reduced mode turns
 * Lenis off entirely. Like GSAP, it is downloaded only when it will run.
 */
import 'lenis/dist/lenis.css';
import { motionIsFull, onMotionChange } from './motion';

type LenisInstance = InstanceType<typeof import('lenis').default>;

export function initSmoothScroll(): void {
  const finePointer = window.matchMedia('(pointer: fine)');
  let lenis: LenisInstance | null = null;
  let loading = false;

  async function start(): Promise<void> {
    if (lenis || loading || !motionIsFull() || !finePointer.matches) return;
    loading = true;
    const { default: Lenis } = await import('lenis');
    loading = false;
    if (lenis || !motionIsFull()) return; // switched off while loading

    const header = document.querySelector<HTMLElement>('[data-header]');
    lenis = new Lenis({
      lerp: 0.12,
      autoRaf: true,
      // In-page links glide too, and stop below the sticky header.
      anchors: { offset: -(header?.offsetHeight ?? 64) },
    });
  }

  function stop(): void {
    lenis?.destroy();
    lenis = null;
  }

  onMotionChange(() => (motionIsFull() ? void start() : stop()));
  finePointer.addEventListener('change', () => (finePointer.matches ? void start() : stop()));
  void start();
}
