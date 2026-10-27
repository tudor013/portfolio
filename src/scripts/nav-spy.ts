/**
 * Marks the section the reader is currently in.
 *
 * Uses IntersectionObserver rather than measuring offsets on every scroll
 * event: the browser does the geometry off the main thread and only calls back
 * when a section actually crosses the threshold, so reading the page costs
 * nothing between those moments.
 */
export function initNavSpy(links: NodeListOf<HTMLAnchorElement>): () => void {
  const byId = new Map<string, HTMLAnchorElement>();
  links.forEach((link) => {
    const id = link.dataset.spy;
    if (id) byId.set(id, link);
  });

  const targets = [...byId.keys()]
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  if (!targets.length) return () => {};

  const visible = new Set<string>();

  function mark() {
    // With several sections on screen the topmost one wins, which matches
    // what a reader would say they are looking at.
    let current: string | null = null;
    let best = Infinity;
    visible.forEach((id) => {
      const top = document.getElementById(id)?.getBoundingClientRect().top ?? Infinity;
      if (top < best) {
        best = top;
        current = id;
      }
    });

    byId.forEach((link, id) => {
      if (id === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      mark();
    },
    // The band sits below the sticky header and above the fold's lower half,
    // so a section counts as current while it occupies the reading area.
    { rootMargin: '-72px 0px -55% 0px', threshold: 0 },
  );

  targets.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}
