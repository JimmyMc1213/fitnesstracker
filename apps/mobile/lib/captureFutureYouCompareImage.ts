import type { RefObject } from "react";
import type { View } from "react-native";

const COMPARE_EXPORT_WIDTH = 1800;

/** Capture the side-by-side compare panel as a PNG file URI. */
export async function captureFutureYouCompareImage(
  ref: RefObject<View | null>,
): Promise<string | null> {
  if (!ref.current) return null;

  try {
    const { captureRef } = await import("react-native-view-shot");
    return await captureRef(ref, {
      format: "png",
      quality: 1,
      result: "tmpfile",
      width: COMPARE_EXPORT_WIDTH,
    });
  } catch {
    return null;
  }
}
