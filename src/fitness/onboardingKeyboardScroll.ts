/** Scroll a focused field into view inside the onboarding body (not the whole page). */
export function scrollOnboardingFieldIntoView(body: HTMLElement, field: HTMLElement): void {
  const bodyRect = body.getBoundingClientRect();
  const fieldRect = field.getBoundingClientRect();
  const inset = 16;

  if (fieldRect.bottom > bodyRect.bottom - inset) {
    body.scrollTop += fieldRect.bottom - bodyRect.bottom + inset;
  } else if (fieldRect.top < bodyRect.top + inset) {
    body.scrollTop -= bodyRect.top + inset - fieldRect.top;
  }
}

export function isOnboardingTextField(target: EventTarget | null): target is HTMLElement {
  return (
    target instanceof HTMLElement &&
    target.matches('input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]')
  );
}
