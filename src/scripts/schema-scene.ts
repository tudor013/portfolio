/**
 * Builds the airline schema as the reader scrolls (SchemaScene.astro).
 *
 * The section is 3 screens tall and its stage pins at a third of the way:
 *   0.06 – 0.42  the ten tables arrive, top row first, as the stage slides in
 *   0.42 – 0.80  the thirteen foreign keys draw from one table to the other
 *   0.80 – 1.00  the finished schema holds, under its title
 *
 * Only transform, opacity and the stroke offset of the lines change; nothing
 * is laid out again while scrolling.
 */
import { TABLES, VIEWBOX, heightOf } from '../data/airline-schema';
import { addScene, beat, easeOut } from './scenes';
import { motionIsFull, onMotionChange } from './motion';

const TABLES_FROM = 0.06;
const TABLE_STAGGER = 0.028;
const TABLE_LENGTH = 0.1;

const KEYS_FROM = 0.42;
const KEY_STAGGER = 0.022;
const KEY_LENGTH = 0.1;

// The drawing's empty corner, in drawDB units: everything below the bottom of
// PASAGERI and right of the last line (the crew-to-flight key ends at x 816).
const PASAGERI = TABLES.find((t) => t.id === 'PASAGERI')!;
const CORNER_TOP = PASAGERI.y + heightOf(PASAGERI);
const CORNER_LEFT = 850;
/** Clear space between the drawing and its title block, in pixels. */
const AIR = 48;
const TITLE_MAX = 640;
/** Below this scale the 22-unit labels would drop under 13px. */
const MIN_SCALE = 13 / 22;

export function initSchemaScene(root: HTMLElement): void {
  // Holding needs a wide screen (the drawing is wide) and a reader who has
  // not asked for less motion. Everyone else gets the finished drawing.
  const canRun = window.matchMedia('(min-width: 75rem)');

  const tables = [...root.querySelectorAll<SVGGElement>('[data-table]')];
  const relations = [...root.querySelectorAll<SVGPathElement>('[data-relation]')];

  const stage = root.querySelector<HTMLElement>('.stage')!;
  const svg = root.querySelector<SVGSVGElement>('.drawing svg')!;
  const title = root.querySelector<HTMLElement>('.title-block')!;

  /**
   * Places the title block in the drawing's empty bottom-right corner with
   * AIR to spare, shrinking the drawing if the screen is too short for both.
   * The block's height depends on its width, and its width on the drawing's
   * size, so it settles in a few passes.
   */
  function fit(): number {
    if (!root.classList.contains('is-live')) return 0;

    const style = getComputedStyle(stage);
    const padTop = parseFloat(style.paddingTop);
    const padBottom = parseFloat(style.paddingBottom);
    const padX = parseFloat(style.paddingLeft);
    const innerWidth = stage.clientWidth - padX * 2;
    const innerBottom = stage.clientHeight - padBottom;

    const ratio = VIEWBOX.height / VIEWBOX.width;
    const cornerShare = (CORNER_TOP - VIEWBOX.y) / VIEWBOX.height;
    let height = Math.min(innerWidth * ratio, innerBottom - padTop);

    for (let pass = 0; pass < 3; pass++) {
      const scale = height / VIEWBOX.height;
      const drawingLeft = padX + (innerWidth - VIEWBOX.width * scale) / 2;
      const left = Math.max(drawingLeft + (CORNER_LEFT - VIEWBOX.x) * scale, padX + innerWidth - TITLE_MAX);
      title.style.left = `${left}px`;
      title.style.width = `${padX + innerWidth - left}px`;

      const room = (innerBottom - padTop - AIR - title.offsetHeight) / cornerShare;
      if (room >= height) break;
      height = room;
    }

    svg.style.height = `${height}px`;
    title.style.top = `${padTop + height * cornerShare + AIR}px`;
    return height / VIEWBOX.height;
  }

  function unfit(): void {
    svg.style.removeProperty('height');
    for (const prop of ['top', 'left', 'width']) title.style.removeProperty(prop);
  }

  function render(progress: number): void {
    if (!root.classList.contains('is-live')) return;

    for (const table of tables) {
      const order = Number(table.dataset.order);
      const start = TABLES_FROM + order * TABLE_STAGGER;
      const t = easeOut(beat(progress, start, start + TABLE_LENGTH));
      table.style.opacity = String(t);
      table.style.transform = `translateY(${(1 - t) * 28}px)`;
    }

    relations.forEach((path, i) => {
      const start = KEYS_FROM + i * KEY_STAGGER;
      const t = beat(progress, start, start + KEY_LENGTH);
      path.style.strokeDasharray = '1';
      path.style.strokeDashoffset = String(1 - t);
    });
  }

  // Back to the finished drawing: no inline styles, every caption shown.
  function rest(): void {
    for (const el of [...tables, ...relations]) el.removeAttribute('style');
  }

  const redraw = addScene(root, render);

  function sync(): void {
    root.classList.toggle('is-live', canRun.matches && motionIsFull());
    // A screen too short to hold the drawing and its title at a readable
    // size gets the finished composition instead, as a tablet does.
    if (root.classList.contains('is-live') && fit() < MIN_SCALE) root.classList.remove('is-live');
    if (!root.classList.contains('is-live')) {
      rest();
      unfit();
    }
    redraw();
  }

  // The window, not the stage: holding and letting go change the stage's own
  // size, and observing it would loop.
  window.addEventListener('resize', sync);
  // The title's height depends on the real font, which may arrive late.
  void document.fonts.ready.then(sync);
  canRun.addEventListener('change', sync);
  onMotionChange(sync);
  sync();
}
