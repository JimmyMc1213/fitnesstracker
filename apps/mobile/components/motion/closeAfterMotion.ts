import { MOTION_DURATIONS } from "./tokens";

export function closeAfterMotion(clear: () => void, durationMs: number = MOTION_DURATIONS.sheetExit) {
  setTimeout(clear, durationMs);
}
