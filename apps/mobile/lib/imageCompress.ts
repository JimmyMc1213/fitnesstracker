/** Resize and compress to JPEG data URL for draft storage / upload. */
export async function compressImageToJpegDataUrl(
  uri: string,
  maxWidth = 960,
  quality = 0.82,
): Promise<string> {
  const ImageManipulator = await import("expo-image-manipulator");
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
