import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

/** Long edge for paywall teasers — full result stays behind entitlement. */
export const FUTURE_YOU_PREVIEW_MAX_LONG_EDGE_PX = 480;

/** Downscale a generated result PNG into a low-res teaser for non-entitled polls. */
export async function buildFutureYouPreviewPng(resultBytes: Uint8Array): Promise<Uint8Array> {
  const image = await Image.decode(resultBytes);
  const longEdge = Math.max(image.width, image.height);
  if (longEdge > FUTURE_YOU_PREVIEW_MAX_LONG_EDGE_PX) {
    const scale = FUTURE_YOU_PREVIEW_MAX_LONG_EDGE_PX / longEdge;
    image.resize(
      Math.max(1, Math.round(image.width * scale)),
      Math.max(1, Math.round(image.height * scale)),
    );
  }
  return await image.encode();
}
