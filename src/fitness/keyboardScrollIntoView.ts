function visibleViewportBounds() {
  const vv = window.visualViewport;
  if (!vv) {
    return { top: 0, bottom: window.innerHeight };
  }
  return { top: vv.offsetTop, bottom: vv.offsetTop + vv.height };
}

export function isTextInputField(target: EventTarget | null): target is HTMLElement {
  return (
    target instanceof HTMLElement &&
    target.matches(
      'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="button"]):not([type="submit"]), textarea, select, [contenteditable="true"]',
    )
  );
}

function findScrollContainer(field: HTMLElement): HTMLElement | null {
  let el: HTMLElement | null = field.parentElement;
  while (el) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight + 1) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

/** Scroll a focused field into the visible viewport inside its scroll container. */
export function scrollFieldIntoView(container: HTMLElement | null, field: HTMLElement): void {
  const { top: visibleTop, bottom: visibleBottom } = visibleViewportBounds();
  const fieldRect = field.getBoundingClientRect();
  const inset = 24;

  if (container) {
    if (fieldRect.bottom > visibleBottom - inset) {
      container.scrollTop += fieldRect.bottom - (visibleBottom - inset);
    } else if (fieldRect.top < visibleTop + inset) {
      container.scrollTop -= visibleTop + inset - fieldRect.top;
    }
    return;
  }

  field.scrollIntoView({ behavior: "smooth", block: "center" });
}

/** Re-run scroll after the iOS keyboard finishes animating open. */
export function scheduleFieldScrollIntoView(field: HTMLElement, container?: HTMLElement | null): void {
  const scrollContainer = container === undefined ? findScrollContainer(field) : container;
  const run = () => scrollFieldIntoView(scrollContainer, field);
  window.requestAnimationFrame(run);
  window.setTimeout(run, 300);
}

export function initKeyboardScrollIntoView(): void {
  document.addEventListener(
    "focusin",
    (event) => {
      if (!isTextInputField(event.target)) return;
      if (event.target.closest(".onboarding-shell__body")) return;
      scheduleFieldScrollIntoView(event.target);
    },
    true,
  );
}
