/**
 * Verlet-integrated lanyard for the hero ID badge.
 *
 * Why this and not a 3D physics library: the usual implementation of this
 * effect pulls in React, three.js and a rapier WASM build — roughly half a
 * megabyte before the badge draws a single pixel. The rope here is a chain of
 * points integrated by position rather than velocity, which fits in a few
 * hundred bytes of logic, and the badge itself stays a real DOM element, so
 * its text is selectable, translatable and reachable by a screen reader.
 */

interface Point {
  x: number;
  y: number;
  /** Previous position. Verlet derives velocity from the gap between the two. */
  px: number;
  py: number;
}

const SEGMENTS = 14;
const GRAVITY = 0.75;
/** Below 1 so the swing loses energy and settles instead of oscillating forever. */
const DAMPING = 0.985;
/** More passes mean a stiffer, less rubbery strap. Eight is past the point of
 *  visible improvement for this length. */
const RELAX_PASSES = 8;

export function initBadge(root: HTMLElement): () => void {
  const strap = root.querySelector<SVGPathElement>('[data-strap]');
  const card = root.querySelector<HTMLElement>('[data-card]');
  if (!strap || !card) return () => {};

  const anchorX = root.clientWidth / 2;
  const restLength = (root.clientHeight * 0.42) / SEGMENTS;

  const points: Point[] = Array.from({ length: SEGMENTS + 1 }, (_, i) => ({
    x: anchorX,
    y: i * restLength,
    px: anchorX,
    py: i * restLength,
  }));

  let pointer: { x: number; y: number } | null = null;
  let frame = 0;

  function step() {
    for (let i = 1; i < points.length; i++) {
      const p = points[i]!;
      const vx = (p.x - p.px) * DAMPING;
      const vy = (p.y - p.py) * DAMPING;
      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy + GRAVITY;
    }

    for (let pass = 0; pass < RELAX_PASSES; pass++) {
      // The top point is the clip on the wall: it never moves.
      points[0]!.x = anchorX;
      points[0]!.y = 0;

      // While dragging, the far end is pinned to the cursor and the rope is
      // solved between the two fixed ends.
      if (pointer) {
        const last = points[points.length - 1]!;
        last.x = pointer.x;
        last.y = pointer.y;
      }

      for (let i = 0; i < points.length - 1; i++) {
        const a = points[i]!;
        const b = points[i + 1]!;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        // Each pass moves both points half of the error, which converges on
        // segments of the right length without any point dominating.
        const correction = (dist - restLength) / dist / 2;
        const ox = dx * correction;
        const oy = dy * correction;
        if (i > 0) {
          a.x += ox;
          a.y += oy;
        }
        if (i + 1 < points.length - 1 || !pointer) {
          b.x -= ox;
          b.y -= oy;
        }
      }
    }

    render();
    frame = requestAnimationFrame(step);
  }

  function render() {
    strap!.setAttribute('d', points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '));

    const tip = points[points.length - 1]!;
    const prev = points[points.length - 2]!;
    // The card hangs along the last segment, so it tilts with the rope rather
    // than staying stubbornly upright while the strap swings.
    const angle = (Math.atan2(tip.x - prev.x, tip.y - prev.y) * 180) / Math.PI;
    const half = card!.offsetWidth / 2;
    card!.style.transform = `translate(${tip.x - half}px, ${tip.y}px) rotate(${-angle}deg)`;
  }

  function toLocal(event: PointerEvent) {
    const rect = root.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onDown(event: PointerEvent) {
    pointer = toLocal(event);
    card!.setPointerCapture(event.pointerId);
    root.dataset.dragging = 'true';
  }
  function onMove(event: PointerEvent) {
    if (pointer) pointer = toLocal(event);
  }
  function onUp(event: PointerEvent) {
    pointer = null;
    card!.releasePointerCapture(event.pointerId);
    delete root.dataset.dragging;
  }

  card.addEventListener('pointerdown', onDown);
  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerup', onUp);
  card.addEventListener('pointercancel', onUp);

  root.dataset.live = 'true';
  frame = requestAnimationFrame(step);

  return () => {
    cancelAnimationFrame(frame);
    card.removeEventListener('pointerdown', onDown);
    card.removeEventListener('pointermove', onMove);
    card.removeEventListener('pointerup', onUp);
    card.removeEventListener('pointercancel', onUp);
    delete root.dataset.live;
  };
}
