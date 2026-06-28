import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

import { estimateCollarboneY, identityFeatherPx } from "./estimateCollarboneY.ts";

function blendChannel(source: number, edited: number, sourceAlpha: number): number {
  return Math.round(edited + (source - edited) * sourceAlpha);
}

/** Alpha for pasting source pixels: 1 above the preserve line, feathered at the seam. */
function upperBodyPreserveAlpha(y: number, collarboneY: number, featherPx: number): number {
  if (y <= collarboneY - featherPx) return 1;
  if (y >= collarboneY + featherPx) return 0;
  return 1 - (y - (collarboneY - featherPx)) / (2 * featherPx);
}

/**
 * Hard guarantee: paste the source head, neck, and upper body back over the model output.
 * Image-edit models regenerate the whole frame and often shrink the torso or drift the
 * face; prompts alone cannot stop that, so this composite runs on every provider output.
 *
 * Uses a horizontal preserve band aligned with buildBodyEditMask (above collarbone),
 * not a small face ellipse — otherwise a shrunk torso makes the head look oversized.
 */
export async function preserveIdentityRegion(
  sourceBytes: Uint8Array,
  editedBytes: Uint8Array,
): Promise<Uint8Array> {
  const [sourceImage, editedImage] = await Promise.all([
    Image.decode(sourceBytes),
    Image.decode(editedBytes),
  ]);

  if (!sourceImage.width || !sourceImage.height || !editedImage.width || !editedImage.height) {
    throw new Error("Could not decode images for identity preservation.");
  }

  if (sourceImage.width !== editedImage.width || sourceImage.height !== editedImage.height) {
    sourceImage.resize(editedImage.width, editedImage.height);
  }

  const width = editedImage.width;
  const height = editedImage.height;
  const collarboneY = estimateCollarboneY(height, width);
  const featherPx = identityFeatherPx(height);
  const maxY = Math.min(height, collarboneY + featherPx);

  for (let y = 0; y < maxY; y++) {
    const sourceAlpha = upperBodyPreserveAlpha(y, collarboneY, featherPx);
    if (sourceAlpha <= 0) continue;

    for (let x = 0; x < width; x++) {
      const sourcePixel = sourceImage.getPixelAt(x + 1, y + 1);
      const editedPixel = editedImage.getPixelAt(x + 1, y + 1);
      const [sr, sg, sb] = Image.colorToRGBA(sourcePixel);
      const [er, eg, eb, ea] = Image.colorToRGBA(editedPixel);

      editedImage.setPixelAt(
        x + 1,
        y + 1,
        Image.rgbaToColor(
          blendChannel(sr, er, sourceAlpha),
          blendChannel(sg, eg, sourceAlpha),
          blendChannel(sb, eb, sourceAlpha),
          ea,
        ),
      );
    }
  }

  return await editedImage.encode();
}
