const KEYPAD_MARGIN = 16;

function workoutKeypadHeight(): number {
  const keypad = document.querySelector(".workout-keypad");
  if (keypad instanceof HTMLElement) {
    return keypad.getBoundingClientRect().height;
  }

  const raw = getComputedStyle(document.documentElement).getPropertyValue("--workout-keypad-chrome").trim();
  if (!raw) return 248;

  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;height:${raw};pointer-events:none;`;
  document.body.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();
  return height > 0 ? height : 248;
}

/** Keep the active set field visible above the custom workout keypad. */
export function scrollWorkoutFieldIntoView(fieldEl: HTMLElement, attempt = 0) {
  const screen = fieldEl.closest(".screen");
  if (!(screen instanceof HTMLElement)) return;

  const keypad = document.querySelector(".workout-keypad");
  if (!keypad && attempt < 4) {
    window.requestAnimationFrame(() => scrollWorkoutFieldIntoView(fieldEl, attempt + 1));
    return;
  }

  const keypadHeight = workoutKeypadHeight();
  const visibleBottom = window.innerHeight - keypadHeight - KEYPAD_MARGIN;
  const visibleTop = KEYPAD_MARGIN;
  const fieldRect = fieldEl.getBoundingClientRect();
  const screenRect = screen.getBoundingClientRect();

  let nextScrollTop = screen.scrollTop;

  if (fieldRect.bottom > visibleBottom) {
    nextScrollTop += fieldRect.bottom - visibleBottom;
  } else if (fieldRect.top < screenRect.top + visibleTop) {
    nextScrollTop -= screenRect.top + visibleTop - fieldRect.top;
  } else {
    return;
  }

  screen.scrollTo({
    top: Math.max(0, nextScrollTop),
    behavior: "smooth",
  });
}
