/**
 * The binary search tree drawn in the hero. Ten keys go in, in this order,
 * through the ordinary insert: smaller to the left, larger to the right. The
 * same function runs at build time (to place the finished tree) and in the
 * browser (to replay each insertion and search step by step), so the drawing
 * and the animation cannot disagree.
 */

export const INSERT_ORDER = [40, 20, 70, 10, 30, 55, 85, 50, 62, 90] as const;

/** Keys the idle animation looks up once the tree is built, in turn. */
export const SEARCHES = [62, 30, 90, 50, 10, 85] as const;

export type TreeNode = {
  key: number;
  parent: number | null;
  depth: number;
  /** Position in sorted order, which gives the node its column. */
  rank: number;
};

type Links = Map<number, { left?: number; right?: number }>;

function insertAll(keys: readonly number[]): { root: number; links: Links } {
  const links: Links = new Map();
  const root = keys[0];
  links.set(root, {});

  for (const key of keys.slice(1)) {
    let at = root;
    for (;;) {
      const node = links.get(at)!;
      const side = key < at ? 'left' : 'right';
      const next = node[side];
      if (next === undefined) {
        node[side] = key;
        links.set(key, {});
        break;
      }
      at = next;
    }
  }

  return { root, links };
}

const { root: ROOT, links: LINKS } = insertAll(INSERT_ORDER);

/** The keys visited, root first, when looking for `key` (the key included). */
export function pathTo(key: number): number[] {
  const path: number[] = [];
  let at: number | undefined = ROOT;
  while (at !== undefined) {
    path.push(at);
    if (at === key) break;
    const node: { left?: number; right?: number } = LINKS.get(at)!;
    at = key < at ? node.left : node.right;
  }
  return path;
}

export const NODES: TreeNode[] = (() => {
  const sorted = [...INSERT_ORDER].sort((a, b) => a - b);
  return INSERT_ORDER.map((key) => {
    const path = pathTo(key);
    return {
      key,
      parent: path.length > 1 ? path[path.length - 2] : null,
      depth: path.length - 1,
      rank: sorted.indexOf(key),
    };
  });
})();

export const DEPTH = Math.max(...NODES.map((n) => n.depth));

/** Where a node sits in the drawing, as percentages of its box. */
export function placeOf(node: TreeNode): { x: number; y: number } {
  return {
    x: ((node.rank + 0.5) / NODES.length) * 100,
    y: 8 + (node.depth / DEPTH) * 70,
  };
}
