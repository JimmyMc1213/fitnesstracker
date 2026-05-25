/** Scroll a focused field into view inside `.screen` instead of relying on iOS viewport pan. */
export function scrollInputIntoScreen(input: HTMLElement) {
  requestAnimationFrame(() => {
    const screen = input.closest(".screen");
    if (!screen) {
      input.scrollIntoView({ block: "nearest" });
      return;
    }

    const screenEl = screen as HTMLElement;
    const margin = 12;
    const screenRect = screenEl.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();

    if (inputRect.bottom > screenRect.bottom - margin) {
      screenEl.scrollTop += inputRect.bottom - screenRect.bottom + margin;
    } else if (inputRect.top < screenRect.top + margin) {
      screenEl.scrollTop -= screenRect.top + margin - inputRect.top;
    }
  });
}
