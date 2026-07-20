import * as ImageManipulator from "expo-image-manipulator";

/** Resize and compress to JPEG on disk for upload (avoids huge base64 JSON payloads). */
export async function compressImageToJpegFile(
  uri: string,
  maxWidth = 960,
  quality = 0.82,
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  if (!result.uri) {
    throw new Error("image compress");
  }

  return result.uri;
}

/** Resize and compress to JPEG data URL for draft storage / upload. */
export async function compressImageToJpegDataUrl(
  uri: string,
  maxWidth = 960,
  quality = 0.82,
): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );

  if (!result.base64) {
    throw new Error("image compress");
  }

  return `data:image/jpeg;base64,${result.base64}`;
}
