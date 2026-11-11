/**
 * Scrolls every scrollable ancestor of `el`, and the window, back to the top.
 * The app shell scrolls an inner `overflow-y-auto` div rather than the window,
 * so `window.scrollTo` alone does nothing on most pages.
 */
export function scrollToTopOf(el: HTMLElement | null): void {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") node.scrollTop = 0;
  }
  window.scrollTo({ top: 0 });
}
