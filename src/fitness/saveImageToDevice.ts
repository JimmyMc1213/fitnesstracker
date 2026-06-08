/** Save an image URL (https or data:) to the user's device via download or share sheet. */
export async function saveImageToDevice(
  imageUrl: string,
  filename = "newyou-preview.png",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return { ok: false, error: "No image to save." };
  }

  try {
    const response = await fetch(trimmed);
    if (!response.ok) {
      return { ok: false, error: "Could not download the image." };
    }

    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type || "image/png" });

    if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "NewYou preview" });
      return { ok: true };
    }

    const objectUrl = URL.createObjectURL(blob);
    try {
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      return { ok: true };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return { ok: false, error: "Could not save the image. Try again." };
  }
}
