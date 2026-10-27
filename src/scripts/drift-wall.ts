/**
 * DriftWall, ported from React Bits to a plain function for this site: an
 * endless wall of tiles on a tilted plane, each column drifting past at its
 * own speed, the tile under the pointer lifting towards the viewer.
 *
 * Port notes (what changed from the React component):
 *   - the tiles are rendered at build time by DriftWall.astro, so the wall
 *     exists without a script; initDriftWall(root, options) only moves it and
 *     returns the clean-up function;
 *   - the reduced-motion check follows the site's motion setting
 *     (scripts/motion.ts) and can change while the page is open;
 *   - the wall is a picture of Tudor's design work, not a menu, so the tiles
 *     are not focusable (the component made every repeated copy a button);
 *   - the drift, parallax and lift are otherwise unchanged.
 *
 * Original: https://reactbits.dev/components/drift-wall
 *
 * MIT + Commons Clause License Condition v1.0
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software as part of
 * an application, website, or product, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * Commons Clause Restriction: you may use this Software, including for any
 * commercial purpose, so long as you do not sell, sublicense, or redistribute
 * the components themselves, whether alone, in a bundle, or as a ported
 * version.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { motionIsFull, onMotionChange } from './motion';

export interface DriftWallOptions {
  tilt?: number;
  turn?: number;
  roll?: number;
  depth?: number;
  speed?: number;
  direction?: 'up' | 'down';
  variance?: number;
  parallax?: number;
  pauseOnHover?: boolean;
}

const columnFactor = (index: number, variance: number): number => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
};

export function initDriftWall(root: HTMLElement, options: DriftWallOptions = {}): () => void {
  const {
    tilt = 16,
    turn = -14,
    roll = 0,
    depth = 120,
    speed = 42,
    direction = 'up',
    variance = 0.45,
    parallax = 0.6,
    pauseOnHover = false,
  } = options;

  const plane = root.querySelector<HTMLElement>('.drift-wall__plane')!;
  const tracks = [...root.querySelectorAll<HTMLElement>('.drift-wall__track')];

  let reduced = !motionIsFull();
  let raf = 0;
  let last: number | null = null;
  let visible = true;
  let wallHovered = false;
  let hoveredCol = -1;
  let active: HTMLElement | null = null;
  const pointer = { x: 0, y: 0 };
  const damped = { x: 0, y: 0 };

  // One copy of a column's tiles: the track holds several and loops by it.
  const copyHeights = tracks.map((track) => {
    const copies = Number(track.dataset.copies) || 1;
    return track.scrollHeight / copies;
  });

  const dirSign = direction === 'up' ? 1 : -1;
  const baseVelocities = tracks.map((_, c) => speed * columnFactor(c, variance) * dirSign * (c % 2 === 0 ? 1 : -1));
  const offsets = copyHeights.map((h, c) => h * ((c * 0.37) % 1));
  const velocities = tracks.map(() => 0);

  const applyPlane = (px: number, py: number) => {
    plane.style.transform =
      `translate(-50%, -50%) scale(1.18) ` +
      `rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg) ` +
      `translateZ(${-depth}px)`;
  };

  const animate = (ts: number) => {
    raf = 0;
    if (last === null) last = ts;
    const dt = Math.min(0.05, Math.max(0, ts - last) / 1000);
    last = ts;

    const maxTilt = parallax * 8;
    const damp = 1 - Math.exp(-dt / 0.12);
    damped.x += (pointer.x * maxTilt - damped.x) * damp;
    damped.y += (-pointer.y * maxTilt - damped.y) * damp;
    applyPlane(damped.x, damped.y);

    for (let c = 0; c < tracks.length; c++) {
      if (!reduced) {
        const paused = wallHovered && pauseOnHover;
        const target = baseVelocities[c] * (paused || hoveredCol === c ? 0 : 1);
        const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
        velocities[c] += (target - velocities[c]) * ease;
        const h = copyHeights[c];
        offsets[c] = ((((offsets[c] + velocities[c] * dt) % h) + h) % h);
      }
      tracks[c].style.transform = `translate3d(0, ${-offsets[c]}px, 0)`;
    }

    // Under reduced motion only the parallax settles, then the loop stops.
    const settling = Math.abs(damped.x - pointer.x * maxTilt) + Math.abs(damped.y + pointer.y * maxTilt) > 0.01;
    if (visible && (!reduced || settling)) raf = requestAnimationFrame(animate);
  };

  const start = () => {
    if (raf || !visible) return;
    last = null;
    raf = requestAnimationFrame(animate);
  };

  const setActive = (tile: HTMLElement | null) => {
    if (tile === active) return;
    active?.classList.remove('is-active');
    active = tile;
    active?.classList.add('is-active');
    hoveredCol = tile ? Number(tile.dataset.col) : -1;
  };

  const onMove = (e: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    if (parallax > 0 && !reduced) {
      pointer.x = (e.clientX - rect.left) / rect.width - 0.5;
      pointer.y = (e.clientY - rect.top) / rect.height - 0.5;
    }
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const tile = hit?.closest<HTMLElement>('.drift-wall__tile') ?? null;
    if (tile) setActive(tile);
    start();
  };
  const onEnter = () => {
    wallHovered = true;
  };
  const onLeave = () => {
    wallHovered = false;
    pointer.x = 0;
    pointer.y = 0;
    setActive(null);
    start();
  };

  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerenter', onEnter);
  root.addEventListener('pointerleave', onLeave);

  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  });
  intersection.observe(root);
  const stopMotion = onMotionChange(() => {
    reduced = !motionIsFull();
    pointer.x = 0;
    pointer.y = 0;
    start();
  });

  root.classList.add('is-live');
  start();

  return () => {
    cancelAnimationFrame(raf);
    raf = 0;
    intersection.disconnect();
    stopMotion();
    root.removeEventListener('pointermove', onMove);
    root.removeEventListener('pointerenter', onEnter);
    root.removeEventListener('pointerleave', onLeave);
    root.classList.remove('is-live');
  };
}
