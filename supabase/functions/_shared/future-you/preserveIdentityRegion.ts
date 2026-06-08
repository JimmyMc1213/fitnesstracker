import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

import { identityFeatherPx } from "./estimateCollarboneY.ts";

type FaceRegion = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

function estimateFaceRegion(width: number, height: number): FaceRegion {
  const aspect = height / width;

  if (aspect >= 1.85) {
    return {
      cx: Math.round(width * 0.5),
      cy: Math.round(height * 0.1),
      rx: Math.round(width * 0.16),
      ry: Math.round(height * 0.1),
    };
  }

  if (aspect >= 1.45) {
    return {
      cx: Math.round(width * 0.5),
      cy: Math.round(height * 0.12),
      rx: Math.round(width * 0.19),
      ry: Math.round(height * 0.12),
    };
  }

  return {
    cx: Math.round(width * 0.5),
    cy: Math.round(height * 0.15),
    rx: Math.round(width * 0.22),
    ry: Math.round(height * 0.14),
  };
}

function facePreserveAlpha(
  x: number,
  y: number,
  region: FaceRegion,
  featherPx: number,
): number {
  const dx = (x - region.cx) / region.rx;
  const dy = (y - region.cy) / region.ry;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= 1) return 1;
  if (dist >= 1 + featherPx / region.ry) return 0;

  return 1 - (dist - 1) / (featherPx / region.ry);
}

function blendChannel(source: number, edited: number, sourceAlpha: number): number {
  return Math.round(edited + (source - edited) * sourceAlpha);
}

/**
 * Hard guarantee: paste the source face/head back over the model output.
 * gpt-image-1 regenerates the whole frame; prompts alone cannot stop face drift.
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
  const region = estimateFaceRegion(width, height);
  const featherPx = identityFeatherPx(height);
  const minY = Math.max(0, region.cy - region.ry - featherPx);
  const maxY = Math.min(height, region.cy + region.ry + featherPx);
  const minX = Math.max(0, region.cx - region.rx - featherPx);
  const maxX = Math.min(width, region.cx + region.rx + featherPx);

  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const sourceAlpha = facePreserveAlpha(x, y, region, featherPx);
      if (sourceAlpha <= 0) continue;

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
