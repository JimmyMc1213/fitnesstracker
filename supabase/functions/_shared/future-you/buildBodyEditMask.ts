import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

import { estimateCollarboneY } from "./estimateCollarboneY.ts";

/**
 * OpenAI mask: transparent pixels = editable, opaque = preserved.
 * We preserve head/face/background edges; only the central torso+limbs are editable.
 */
export async function buildBodyEditMask(width: number, height: number): Promise<Uint8Array> {
  const mask = new Image(width, height);
  mask.fill(0xffffffff);

  const collarboneY = estimateCollarboneY(height, width);
  const sideMargin = Math.max(1, Math.round(width * 0.07));
  const bottomMargin = Math.max(1, Math.round(height * 0.02));

  for (let y = collarboneY; y < height - bottomMargin; y++) {
    for (let x = sideMargin; x < width - sideMargin; x++) {
      mask.setPixelAt(x + 1, y + 1, 0x00000000);
    }
  }

  return await mask.encode();
}
