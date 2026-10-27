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
import { RULES } from '../data/airline-schema';
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
    const live = canRun.matches && motionIsFull();
    root.classList.toggle('is-live', live);
    if (!live) rest();
    redraw();
  }

  canRun.addEventListener('change', sync);
  onMotionChange(sync);
  sync();
}
