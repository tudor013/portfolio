/**
 * Builds the airline schema as the reader scrolls (SchemaScene.astro).
 *
 * The section is 3 screens tall and its stage pins at a third of the way:
 *   0.06 – 0.38  the ten tables arrive, top row first, as the stage slides in
 *   0.38 – 0.62  the thirteen foreign keys draw from one table to the other
 *   0.62 – 1.00  three rules, one at a time, with their rows lit up
 *
 * Only transform, opacity and the stroke offset of the lines change; nothing
 * is laid out again while scrolling.
 */
import { RULES, TABLES, VIEWBOX, heightOf } from '../data/airline-schema';
import { addScene, beat, easeOut } from './scenes';
import { motionIsFull, onMotionChange } from './motion';

const TABLES_FROM = 0.06;
const TABLE_STAGGER = 0.026;
const TABLE_LENGTH = 0.08;

const KEYS_FROM = 0.38;
const KEY_STAGGER = 0.013;
const KEY_LENGTH = 0.07;

const RULES_FROM = 0.62;
const RULE_LENGTH = (1 - RULES_FROM) / RULES.length;

const SELF_REFERENCE = 'fk_d2026_ang_manager';

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
  const captions = [...root.querySelectorAll<HTMLElement>('[data-caption]')];
  const marks = [...root.querySelectorAll<SVGRectElement>('[data-row]')];

  function captionAt(progress: number): string {
    if (progress < KEYS_FROM) return 'tables';
    if (progress < RULES_FROM) return 'keys';
    const index = Math.min(RULES.length - 1, Math.floor((progress - RULES_FROM) / RULE_LENGTH));
    return RULES[index].id;
  }

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

    const current = captionAt(progress);
    for (const caption of captions) {
      caption.classList.toggle('is-current', caption.dataset.caption === current);
    }

    const rule = RULES.find((r) => r.id === current);
    const lit = new Set<string>(rule ? rule.rows.map(([table, field]) => `${table}.${field}`) : []);
    for (const mark of marks) mark.classList.toggle('is-lit', lit.has(mark.dataset.row ?? ''));

    for (const path of relations) {
      path.classList.toggle('is-lit', current === 'manager' && path.dataset.relation === SELF_REFERENCE);
    }
  }

  // Back to the finished drawing: no inline styles, every caption shown.
  function rest(): void {
    for (const el of [...tables, ...relations]) el.removeAttribute('style');
    for (const caption of captions) caption.classList.remove('is-current');
    for (const mark of marks) mark.classList.remove('is-lit');
    for (const path of relations) path.classList.remove('is-lit');
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
