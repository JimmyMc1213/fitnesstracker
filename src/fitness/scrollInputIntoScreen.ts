/** Scroll a focused field into the visible area inside `.screen` without moving the app shell. */
export function scrollInputIntoScreen(input: HTMLElement) {
  window.scrollTo(0, 0);

  requestAnimationFrame(() => {
    window.scrollTo(0, 0);

    const vv = window.visualViewport;
    const visibleTop = vv?.offsetTop ?? 0;
    const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    const margin = 16;

    const screen = input.closest(".screen") as HTMLElement | null;
    if (!screen) return;

    const inputRect = input.getBoundingClientRect();
    if (inputRect.bottom > visibleBottom - margin) {
      screen.scrollTop += inputRect.bottom - (visibleBottom - margin);
    } else if (inputRect.top < visibleTop + margin) {
      screen.scrollTop -= visibleTop + margin - inputRect.top;
    }
  });
}
