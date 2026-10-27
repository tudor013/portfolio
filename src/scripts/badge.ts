/**
 * Verlet-integrated lanyard for the hero ID badge.
 *
 * Why not a 3D physics engine: the usual build of this effect (Vercel's Ship
 * '24 badge and the many copies of it) pulls in React, three.js and a Rapier
 * WASM build — roughly half a megabyte before anything draws. The rope here
 * is a chain of points integrated by position rather than velocity, which
 * fits in a few hundred bytes of logic, and the badge stays a real DOM
 * element, so its text is selectable and reachable by a screen reader.
 */

interface Point {
  x: number;
  y: number;
  /** Previous position. Verlet derives velocity from the gap between the two. */
  px: number;
  py: number;
}

const SEGMENTS = 14;
const GRAVITY = 0.55;
const DAMPING = 0.975;
const RELAX_PASSES = 8;

/**
 * Fraction of the remaining distance the grabbed point closes per *step*.
 *
 * This has to be applied once per step, not inside the relaxation loop: at
 * eight passes, a 0.22 follow closes 1 - 0.78^8 ≈ 86% of the gap every frame,
 * which is a teleport wearing a lerp's clothing. That bug is what made the
 * badge snap to the cursor on click.
 */
const DRAG_FOLLOW = 0.16;

/** Physics runs at a fixed rate so a 144Hz display behaves like a 60Hz one. */
const STEP_MS = 1000 / 120;
const MAX_STEPS_PER_FRAME = 5;

/**
 * The badge enters by having its anchor descend from above the viewport
 * rather than by being displaced sideways. Gravity and the rope do the rest,
 * so the card trails the clip on the way down and swings as it arrives —
 * which is what a badge dropped on a lanyard actually does.
 */
const DROP_HEIGHT = 900;
const DROP_MS = 900;

const SWAY_AMPLITUDE = 0.009;
const SWAY_PERIOD_MS = 5200;
/** Velocity, in pixels per step, given to the card when it is clicked. */
const NUDGE = 13;

export interface BadgeOptions {
  /**
   * Suppresses the entrance swing and the idle sway, leaving only motion the
   * visitor asks for. Reduced motion means no unprompted animation; it does
   * not mean the badge stops answering a pointer.
   */
  calm?: boolean;
}

export function initBadge(root: HTMLElement, options: BadgeOptions = {}): () => void {
  const calm = options.calm ?? false;
  const strap = root.querySelector<SVGPathElement>('[data-strap]');
  const card = root.querySelector<HTMLElement>('[data-card]');
  if (!strap || !card) return () => {};

  const anchorX = root.clientWidth / 2;
  const ropeLength = root.clientHeight * 0.34;
  const restLength = ropeLength / SEGMENTS;

  /** How far below the clip the card's weight acts. */
  const cardDrop = Math.max(60, card.offsetHeight * 0.45);

  // Reduced motion gets the badge already in place; everyone else watches it
  // arrive.
  const dropFrom = calm ? 0 : -DROP_HEIGHT;

  const rope: Point[] = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
    const y = dropFrom + i * restLength;
    return { x: anchorX, y, px: anchorX, py: y };
  });

  /**
   * The card is not glued to the strap's last segment — it hangs from it.
   *
   * `tail` is a second mass a little below the clip, held at a fixed distance
   * from it. The card's tilt comes from the line between the two, so it lags
   * the strap on the way out and overshoots on the way back, the way a real
   * badge does. Deriving the angle straight from the rope made the card feel
   * welded to the lanyard.
   */
  const clip = () => rope[rope.length - 1]!;
  const tailY = dropFrom + ropeLength + cardDrop;
  const tail: Point = { x: anchorX, y: tailY, px: anchorX, py: tailY };

  /** Set on pointerdown: where the clip should sit relative to the cursor. */
  let grab: { dx: number; dy: number } | null = null;
  let pointer: { x: number; y: number } | null = null;
  let travelled = 0;

  let frame = 0;
  let lastTime = 0;
  let accumulator = 0;
  let elapsed = 0;
  let turn = 0;

  function integrate(p: Point, sway: number) {
    const vx = (p.x - p.px) * DAMPING;
    const vy = (p.y - p.py) * DAMPING;
    p.px = p.x;
    p.py = p.y;
    p.x += vx + sway;
    p.y += vy + GRAVITY;
  }

  function link(a: Point, b: Point, length: number, pinA: boolean, pinB: boolean) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const correction = (dist - length) / dist;
    // A pinned end does not move, so the free end takes the whole correction.
    const shareA = pinA ? 0 : pinB ? 1 : 0.5;
    const shareB = pinB ? 0 : pinA ? 1 : 0.5;
    a.x += dx * correction * shareA;
    a.y += dy * correction * shareA;
    b.x -= dx * correction * shareB;
    b.y -= dy * correction * shareB;
  }

  function step() {
    elapsed += STEP_MS;
    const sway =
      pointer || calm ? 0 : Math.sin((elapsed / SWAY_PERIOD_MS) * Math.PI * 2) * SWAY_AMPLITUDE;

    for (let i = 1; i < rope.length; i++) integrate(rope[i]!, sway * i);
    integrate(tail, sway * SEGMENTS);

    // Once per step, not once per relaxation pass.
    if (pointer && grab) {
      const end = clip();
      end.x += (pointer.x + grab.dx - end.x) * DRAG_FOLLOW;
      end.y += (pointer.y + grab.dy - end.y) * DRAG_FOLLOW;
    }

    // The anchor travels down over DROP_MS, carrying everything with it.
    // easeOutCubic so it arrives without a hard stop.
    const t = Math.min(1, elapsed / DROP_MS);
    const eased = 1 - (1 - t) ** 3;
    const anchorY = dropFrom * (1 - eased);

    for (let pass = 0; pass < RELAX_PASSES; pass++) {
      rope[0]!.x = anchorX;
      rope[0]!.y = anchorY;
      for (let i = 0; i < rope.length - 1; i++) {
        link(rope[i]!, rope[i + 1]!, restLength, i === 0, false);
      }
      link(clip(), tail, cardDrop, false, false);
    }

    // Keep the whole assembly inside its own box. Moving the previous
    // position to the wall as well is what stops the boundary behaving like a
    // trampoline: a stale `px` reads as a large velocity.
    const margin = card!.offsetWidth / 2;
    for (const p of [clip(), tail]) {
      const bounded = Math.max(margin, Math.min(root.clientWidth - margin, p.x));
      if (bounded !== p.x) {
        p.px = bounded;
        p.x = bounded;
      }
    }
  }

  function render() {
    strap!.setAttribute(
      'd',
      rope.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
    );

    const end = clip();
    const angle = (Math.atan2(tail.x - end.x, tail.y - end.y) * 180) / Math.PI;

    // A real badge turns edge-on as it swings, which is most of what makes it
    // read as an object rather than a picture.
    const speed = tail.x - tail.px;
    turn += (Math.max(-26, Math.min(26, speed * 2.2)) - turn) * 0.08;

    const half = card!.offsetWidth / 2;
    card!.style.transform =
      `translate(${(end.x - half).toFixed(1)}px, ${end.y.toFixed(1)}px) ` +
      `rotateZ(${(-angle).toFixed(2)}deg) rotateY(${turn.toFixed(2)}deg)`;
  }

  function loop(now: number) {
    if (!lastTime) lastTime = now;
    // Clamped so a backgrounded tab does not return and run a thousand steps.
    accumulator = Math.min(accumulator + (now - lastTime), STEP_MS * MAX_STEPS_PER_FRAME);
    lastTime = now;

    while (accumulator >= STEP_MS) {
      step();
      accumulator -= STEP_MS;
    }

    render();
    frame = requestAnimationFrame(loop);
  }

  function toLocal(event: PointerEvent) {
    const rect = root.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onDown(event: PointerEvent) {
    const local = toLocal(event);
    const end = clip();
    // Remember where the clip sits relative to the cursor, so grabbing the
    // card does not move it at all — it only follows what the hand does next.
    grab = { dx: end.x - local.x, dy: end.y - local.y };
    pointer = local;
    travelled = 0;
    card!.setPointerCapture(event.pointerId);
    root.dataset.dragging = 'true';
  }

  function onMove(event: PointerEvent) {
    if (!pointer) return;
    const local = toLocal(event);
    travelled += Math.hypot(local.x - pointer.x, local.y - pointer.y);
    pointer = local;
  }

  function onUp(event: PointerEvent) {
    const wasPressed = pointer !== null;
    pointer = null;
    grab = null;
    card!.releasePointerCapture(event.pointerId);
    delete root.dataset.dragging;

    // A press that never travelled is a click. Holding a point where it
    // already was changes nothing, so give it a push instead — otherwise the
    // most obvious way to try the badge appears to do nothing.
    if (wasPressed && travelled < 5) {
      tail.px = tail.x + (tail.x < root.clientWidth / 2 ? -NUDGE : NUDGE);
    }
  }

  card.addEventListener('pointerdown', onDown);
  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerup', onUp);
  card.addEventListener('pointercancel', onUp);

  root.dataset.live = 'true';
  frame = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frame);
    card.removeEventListener('pointerdown', onDown);
    card.removeEventListener('pointermove', onMove);
    card.removeEventListener('pointerup', onUp);
    card.removeEventListener('pointercancel', onUp);
    delete root.dataset.live;
  };
}
