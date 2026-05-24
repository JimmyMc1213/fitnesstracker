function visibleViewportBounds() {
  const vv = window.visualViewport;
  if (!vv) {
    return { top: 0, bottom: window.innerHeight };
  }
  return { top: vv.offsetTop, bottom: vv.offsetTop + vv.height };
}

/** Scroll a focused field into view inside the onboarding body (not the whole page). */
export function scrollOnboardingFieldIntoView(body: HTMLElement, field: HTMLElement): void {
  const { top: visibleTop, bottom: visibleBottom } = visibleViewportBounds();
  const fieldRect = field.getBoundingClientRect();
  const inset = 20;

  if (fieldRect.bottom > visibleBottom - inset) {
    body.scrollTop += fieldRect.bottom - (visibleBottom - inset);
  } else if (fieldRect.top < visibleTop + inset) {
    body.scrollTop -= visibleTop + inset - fieldRect.top;
  }
}

export function isOnboardingTextField(target: EventTarget | null): target is HTMLElement {
  return (
    target instanceof HTMLElement &&
    target.matches('input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]')
  );
}

/** Re-run scroll after the iOS keyboard finishes animating open. */
export function scheduleOnboardingFieldScroll(body: HTMLElement, field: HTMLElement): void {
  const run = () => scrollOnboardingFieldIntoView(body, field);
  window.requestAnimationFrame(run);
  window.setTimeout(run, 120);
  window.setTimeout(run, 320);
}
