/**
 * Section entrances: the parts of a section ([data-enter] > *) arrive in
 * reading order the first time the section comes into view. The staggering
 * itself is CSS (global.css); this only decides when.
 *
 * Content is never hidden before this runs. The hiding rule is keyed to the
 * `enter-ready` class this function adds, so with the script blocked or
 * broken the page is simply still. Groups already on screen when it starts
 * are marked as arrived first, so nothing the reader is looking at blinks out.
 */
export function initEnter(): void {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const groups = [...document.querySelectorAll<HTMLElement>('[data-enter]')];
  if (groups.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    // Fires when the group's top is about 90% of the way down the screen.
    { rootMargin: '0px 0px -10% 0px' },
  );

  const height = window.innerHeight;
  for (const group of groups) {
    const box = group.getBoundingClientRect();
    if (box.top < height && box.bottom > 0) group.classList.add('is-in');
    else observer.observe(group);
  }

  document.documentElement.classList.add('enter-ready');
}
