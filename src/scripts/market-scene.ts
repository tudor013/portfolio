/**
 * The live market (MarketScene.astro): runs the model, draws it on a canvas,
 * and lets the scroll decide how far into the run the chart has got.
 *
 * Time is mapped to scroll so that the run starts as the panel's top edge
 * enters the screen and reaches day 500 as the whole panel comes into view;
 * from then on the full run stays drawn and the controls can be used on it.
 * "Run with new news" plays a fresh run on a clock instead, for anyone who
 * would rather watch than scroll.
 */
import { DAYS, DEFAULTS, runMarket, type MarketRun, type MarketSettings } from './market-model';
import { addScene } from './scenes';

const PLAY_MS = 3200;

export function initMarketScene(root: HTMLElement): void {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-chart]');
  const panel = root.querySelector<HTMLElement>('.panel');
  const form = root.querySelector<HTMLFormElement>('[data-controls]');
  const context = canvas?.getContext('2d');
  if (!canvas || !panel || !form || !context) return;

  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  const readouts = {
    day: root.querySelector<HTMLElement>('[data-readout="day"]')!,
    price: root.querySelector<HTMLElement>('[data-readout="price"]')!,
    value: root.querySelector<HTMLElement>('[data-readout="value"]')!,
  };

  let seed = Number(root.dataset.seed) || 1;
  let settings: MarketSettings = { ...DEFAULTS };
  let run: MarketRun = runMarket(settings, seed);
  /** How much of the run is drawn, 0–1. */
  let shown = 1;
  let scrolled = 1;
  let playing = 0;

  // Colours come from the tokens, so the chart cannot drift from the page.
  const style = getComputedStyle(root);
  const colour = (name: string) => style.getPropertyValue(name).trim();
  const INK = colour('--ink');
  const MUTED = colour('--muted');
  const ACCENT = colour('--accent');
  const FONT = `13px ${style.getPropertyValue('--font')}`;

  function draw(): void {
    const ratio = window.devicePixelRatio || 1;
    const width = canvas!.clientWidth;
    const height = canvas!.clientHeight;
    if (canvas!.width !== Math.round(width * ratio)) canvas!.width = Math.round(width * ratio);
    if (canvas!.height !== Math.round(height * ratio)) canvas!.height = Math.round(height * ratio);

    const ctx = context!;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // The scale is fixed by the whole run, so the axis does not jump while
    // the line is still being drawn.
    let low = Infinity;
    let high = -Infinity;
    for (let d = 0; d <= DAYS; d++) {
      low = Math.min(low, run.price[d], run.value[d]);
      high = Math.max(high, run.price[d], run.value[d]);
    }
    const pad = (high - low) * 0.08 || 1;
    low -= pad;
    high += pad;

    const left = 44;
    const top = 8;
    const plotWidth = width - left - 8;
    const plotHeight = height - top - 8;
    const x = (day: number) => left + (day / DAYS) * plotWidth;
    const y = (v: number) => top + (1 - (v - low) / (high - low)) * plotHeight;

    // Three price labels, rounded to something a person would write.
    ctx.font = FONT;
    ctx.fillStyle = MUTED;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    const stepGuess = (high - low) / 3;
    const magnitude = 10 ** Math.floor(Math.log10(stepGuess));
    const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= stepGuess) ?? stepGuess;
    for (let v = Math.ceil(low / step) * step; v <= high; v += step) {
      ctx.fillText(String(Math.round(v)), left - 10, y(v));
    }

    const lastDay = Math.round(shown * DAYS);

    const line = (series: Float64Array, stroke: string, width: number) => {
      ctx.beginPath();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      for (let d = 0; d <= lastDay; d++) {
        if (d === 0) ctx.moveTo(x(d), y(series[d]));
        else ctx.lineTo(x(d), y(series[d]));
      }
      ctx.stroke();
    };

    // The price swings around the value nearly every day (all fundamentalists
    // act together), so it is drawn as a hairline underneath and the value as
    // a heavy line on top; otherwise the price would bury it.
    line(run.price, INK, 1);
    line(run.value, ACCENT, 3);

    // Where the market is now.
    ctx.fillStyle = INK;
    ctx.fillRect(x(lastDay) - 4, y(run.price[lastDay]) - 4, 8, 8);

    readouts.day.textContent = String(lastDay);
    readouts.price.textContent = run.price[lastDay].toFixed(1);
    readouts.value.textContent = run.value[lastDay].toFixed(1);
  }

  function rerun(): void {
    run = runMarket(settings, seed);
    draw();
  }

  // ---- Scroll: time follows the panel coming into view --------------------

  addScene(panel, (progress) => {
    scrolled = progress;
    if (playing || still.matches) return;
    shown = progress;
    draw();
  });

  // ---- Controls ------------------------------------------------------------

  form.hidden = false;
  root.classList.add('is-live');

  form.addEventListener('input', (event) => {
    const input = event.target as HTMLInputElement;
    if (input.type !== 'range') return;
    settings = { ...settings, [input.name]: Number(input.value) };
    const output = form.querySelector<HTMLOutputElement>(`[data-output="${input.name}"]`);
    if (output) output.textContent = `${input.value}${input.dataset.unit ?? ''}`;
    rerun();
  });

  form.querySelector('[data-reset]')?.addEventListener('click', () => {
    settings = { ...DEFAULTS };
    for (const input of form.querySelectorAll<HTMLInputElement>('input[type="range"]')) {
      input.value = String(DEFAULTS[input.name as keyof MarketSettings]);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  form.querySelector('[data-rerun]')?.addEventListener('click', () => {
    seed += 1;
    run = runMarket(settings, seed);

    if (still.matches) {
      shown = 1;
      draw();
      return;
    }

    // Played on a clock, then handed back to the scroll.
    cancelAnimationFrame(playing);
    const started = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / PLAY_MS);
      shown = t;
      draw();
      if (t < 1) playing = requestAnimationFrame(tick);
      else {
        playing = 0;
        shown = scrolled;
        draw();
      }
    };
    playing = requestAnimationFrame(tick);
  });

  // The canvas follows its box when the window is resized.
  new ResizeObserver(() => draw()).observe(canvas);
  draw();
}
