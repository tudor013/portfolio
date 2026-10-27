/**
 * Plays a short fade on elements the first time they come into view.
 *
 * The important property is that **nothing is ever hidden waiting to be
 * revealed**. An earlier version set opacity to 0 and cleared it on
 * intersection; measured, that left 7 of 10 project cards invisible after a
 * fast flick to the bottom of the page, because items that never had a frame
 * inside the observer's band never fired. On a portfolio, content that can
 * fail to appear is worse than no animation at all.
 *
 * So elements start visible. Entering view adds an attribute that plays an
 * animation *from* transparent; if the observer never fires, the element was
 * already correct. The effect is additive, and its failure mode is "no
 * animation" rather than "no content".
 */
export function initReveal(selector: string): () => void {
  const items = [...document.querySelectorAll<HTMLElement>(selector)];
  if (!items.length) return () => {};

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        (entry.target as HTMLElement).dataset.reveal = 'in';
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -5% 0px', threshold: 0.05 },
  );

  items.forEach((el) => {
    // Anything already on screen at load is left alone: animating it would
    // fade out content the reader is in the middle of looking at.
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;
    observer.observe(el);
  });

  return () => observer.disconnect();
}
