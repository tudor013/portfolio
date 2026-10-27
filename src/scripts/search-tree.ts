/**
 * Plays the hero's binary search tree (SearchTree.astro) with GSAP.
 *
 * On arrival each key is inserted in turn: the keys it is compared with light
 * up on the way down, then its edge grows out of the parent and the new node
 * settles at the end of it. Once the tree is whole, a second timeline looks a
 * key up every few seconds and lights the path, for as long as the hero is on
 * screen. Every step is the real algorithm: pathTo() walks the same tree the
 * page was built from.
 *
 * GSAP is loaded only when motion is on, so the reduced mode (the one the
 * Performance budget is measured in) never downloads it. Without a script, or
 * with motion off, the finished tree is simply there.
 */
import { INSERT_ORDER, SEARCHES, pathTo } from '../data/search-tree';
import { motionIsFull, onMotionChange } from './motion';

type Gsap = typeof import('gsap').gsap;
type Timeline = ReturnType<Gsap['timeline']>;

const HOP = 0.14; // seconds per comparison on the way down
const SETTLE = 0.34; // an edge growing and a node arriving
const SEARCH_GAP = 2.2; // seconds a found key stays lit before the next search

export function initSearchTree(root: HTMLElement): void {
  const nodes = new Map<number, HTMLElement>();
  for (const el of root.querySelectorAll<HTMLElement>('[data-node]')) {
    nodes.set(Number(el.dataset.node), el);
  }
  const edges = new Map<number, SVGLineElement>();
  for (const el of root.querySelectorAll<SVGLineElement>('[data-edge]')) {
    edges.set(Number(el.dataset.edge), el);
  }
  const caption = root.querySelector<HTMLElement>('[data-tree-caption]');
  if (!caption) return;
  const restingCaption = caption.textContent ?? '';

  let gsap: Gsap | null = null;
  let current: Timeline | null = null;
  let onScreen = true;

  const clearMarks = (): void => {
    for (const el of nodes.values()) el.classList.remove('is-compared', 'is-found');
    for (const el of edges.values()) el.classList.remove('is-path');
  };

  /** Adds the comparisons made looking for `key` to the timeline, in order. */
  function walk(tl: Timeline, key: number, present: boolean): void {
    const path = pathTo(key);
    if (!present) path.pop(); // a key being inserted is not in the tree yet
    path.forEach((at, i) => {
      tl.call(
        () => {
          nodes.get(at)?.classList.add('is-compared');
          if (i > 0) edges.get(at)?.classList.add('is-path');
        },
        [],
        i === 0 ? '>' : `>+${HOP}`,
      );
    });
    if (present) tl.call(() => nodes.get(key)?.classList.add('is-found'), [], `>+${HOP}`);
  }

  function building(g: Gsap): Timeline {
    const tl = g.timeline({ delay: 0.6 });

    // An empty sheet first: every node hidden, every edge collapsed onto its
    // parent's end.
    g.set([...nodes.values()], { autoAlpha: 0, scale: 0.6 });
    for (const edge of edges.values()) {
      g.set(edge, { attr: { x2: edge.x1.baseVal.value, y2: edge.y1.baseVal.value } });
    }

    for (const key of INSERT_ORDER) {
      tl.call(() => {
        clearMarks();
        caption!.textContent = `Binary search tree, inserting ${key}`;
      });
      walk(tl, key, false);

      const edge = edges.get(key);
      const node = nodes.get(key)!;
      if (edge) {
        tl.to(
          edge,
          { attr: { x2: Number(edge.dataset.x2), y2: Number(edge.dataset.y2) }, duration: SETTLE, ease: 'power2.out' },
          `>+${HOP}`,
        );
      }
      tl.to(node, { autoAlpha: 1, scale: 1, duration: SETTLE, ease: 'power3.out' }, edge ? '<0.15' : '>');
    }

    tl.call(() => {
      clearMarks();
      caption!.textContent = restingCaption;
    }, [], '+=0.5');
    return tl;
  }

  function searching(g: Gsap): Timeline {
    const tl = g.timeline({ repeat: -1, delay: 1 });
    for (const key of SEARCHES) {
      tl.call(() => {
        clearMarks();
        caption!.textContent = `Searching for ${key}: ${pathTo(key).length} comparisons`;
      });
      walk(tl, key, true);
      tl.to({}, { duration: SEARCH_GAP }); // hold the lit path
    }
    tl.call(() => clearMarks());
    return tl;
  }

  function stop(): void {
    current?.kill();
    current = null;
    clearMarks();
    caption!.textContent = restingCaption;
    // Only what GSAP animated: each node's place is its own inline left/top,
    // which 'all' would wipe.
    gsap?.set([...nodes.values()], { clearProps: 'opacity,visibility,transform' });
    // The edges' end points were animated as attributes; put them back.
    for (const edge of edges.values()) {
      edge.setAttribute('x2', edge.dataset.x2 ?? edge.getAttribute('x2')!);
      edge.setAttribute('y2', edge.dataset.y2 ?? edge.getAttribute('y2')!);
    }
  }

  const sync = (): void => {
    if (!current) return;
    if (onScreen && !document.hidden) current.play();
    else current.pause();
  };

  async function start(): Promise<void> {
    if (!gsap) gsap = (await import('gsap')).gsap;
    if (!motionIsFull()) return; // switched off while GSAP was loading
    stop();
    const g = gsap;
    current = building(g);
    current.eventCallback('onComplete', () => {
      current = searching(g);
      sync();
    });
    sync();
  }

  // Remember each edge's real end, so stopping mid-growth can restore it.
  for (const edge of edges.values()) {
    edge.dataset.x2 = edge.getAttribute('x2') ?? '';
    edge.dataset.y2 = edge.getAttribute('y2') ?? '';
  }

  // Nothing animates while nobody can see it.
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  }).observe(root);
  document.addEventListener('visibilitychange', sync);

  onMotionChange(() => (motionIsFull() ? void start() : stop()));
  if (motionIsFull()) void start();
}
