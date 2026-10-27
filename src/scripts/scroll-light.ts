/**
 * Moves the page's light with the reader.
 *
 * The page is a drafting sheet and this is the lamp over it. It is the only
 * ambient motion on the site, so it stays cheap: one custom property, written
 * at most once per frame, consumed by a single `transform`. Transform is the
 * one property the compositor can animate without re-running layout or paint,
 * which is why the glow is moved rather than repositioned.
 */
export function initScrollLight(target: HTMLElement): () => void {
  let frame = 0;
  let queued = false;

  function apply() {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    // A page shorter than the viewport has nowhere to scroll; treat it as the
    // top of the sheet rather than dividing by zero.
    const progress = max > 0 ? window.scrollY / max : 0;

    // The lamp travels about two thirds of the viewport, so it leads the
    // reader down the page instead of sitting locked behind the text.
    target.style.setProperty('--light-y', String(progress * window.innerHeight * 0.66));

    // It also brightens toward the middle of the page and fades at both ends,
    // which gives the scroll a shape rather than a constant wash.
    const arc = 0.72 + Math.sin(progress * Math.PI) * 0.45;
    target.style.setProperty('--light-strength', arc.toFixed(3));

    // One listener feeds the reading-progress rule in the header too, rather
    // than adding a second scroll handler for two pixels of bar.
    target.style.setProperty('--read-progress', progress.toFixed(4));
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    frame = requestAnimationFrame(apply);
  }

  apply();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
}
