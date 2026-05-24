import {
  isTextInputField,
  scheduleFieldScrollIntoView,
  scrollFieldIntoView,
} from "./keyboardScrollIntoView";

/** Scroll a focused field into view inside the onboarding body (not the whole page). */
export function scrollOnboardingFieldIntoView(body: HTMLElement, field: HTMLElement): void {
  scrollFieldIntoView(body, field);
}

export function isOnboardingTextField(target: EventTarget | null): target is HTMLElement {
  return isTextInputField(target);
}

/** Re-run scroll after the iOS keyboard finishes animating open. */
export function scheduleOnboardingFieldScroll(body: HTMLElement, field: HTMLElement): void {
  scheduleFieldScrollIntoView(field, body);
}
