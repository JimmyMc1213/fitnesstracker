/** E2E / dev: show Sunday check-in card and flow on any day of the week. */
export function isDevPreviewSundayEnabled(): boolean {
  return process.env.EXPO_PUBLIC_E2E_DEV_PREVIEW_SUNDAY === "true";
}
