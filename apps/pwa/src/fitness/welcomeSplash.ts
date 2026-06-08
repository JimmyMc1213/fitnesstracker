/** Welcome marketing splash — once per browser session (resets on full page reload). */
let played = false;

export function welcomeSplashAlreadyPlayed(): boolean {
  return played;
}

export function markWelcomeSplashPlayed(): void {
  played = true;
}
