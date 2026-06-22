import { Platform } from "react-native";

export type SaveImageResult = { ok: true } | { ok: false; error: string };

const PERMISSION_DENIED_ERROR =
  "Photo library access is off. Enable it in Settings to save images.";

const NATIVE_MODULE_ERROR =
  "Save to photos needs a newer app build. Rebuild the dev client and try again.";

function sanitizeFilename(filename: string): string {
  const trimmed = filename.trim();
  if (!trimmed) return "newyou-preview.png";
  return trimmed.replace(/[^\w.-]+/g, "-");
}

async function saveImageOnWeb(
  imageUrl: string,
  filename: string,
): Promise<SaveImageResult> {
  try {
    const response = await fetch(imageUrl);
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

/** Save an image URL (https, data:, or file://) to the user's photo library. */
export async function saveImageToDevice(
  imageUrl: string,
  filename = "newyou-preview.png",
): Promise<SaveImageResult> {
  const trimmed = imageUrl.trim();
  if (!trimmed) {
    return { ok: false, error: "No image to save." };
  }

  const safeFilename = sanitizeFilename(filename);

  if (Platform.OS === "web") {
    return saveImageOnWeb(trimmed, safeFilename);
  }

  try {
    const [MediaLibrary, FileSystem] = await Promise.all([
      import("expo-media-library"),
      import("expo-file-system/legacy"),
    ]);

    const permission = await MediaLibrary.requestPermissionsAsync(true);
    if (permission.status !== "granted") {
      return { ok: false, error: PERMISSION_DENIED_ERROR };
    }

    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      return { ok: false, error: "Could not download the image." };
    }

    const localPath = `${cacheDir}${safeFilename}`;
    let localUri: string | null = null;

    if (trimmed.startsWith("data:")) {
      const base64 = trimmed.split(",")[1];
      if (!base64) {
        return { ok: false, error: "Could not download the image." };
      }
      await FileSystem.writeAsStringAsync(localPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      localUri = localPath;
    } else if (trimmed.startsWith("file://")) {
      localUri = trimmed;
    } else {
      const download = await FileSystem.downloadAsync(trimmed, localPath);
      if (download.status !== 200) {
        return { ok: false, error: "Could not download the image." };
      }
      localUri = download.uri;
    }

    if (!localUri) {
      return { ok: false, error: "Could not download the image." };
    }

    await MediaLibrary.Asset.create(localUri);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("ExpoMediaLibrary") || message.includes("native module")) {
      return { ok: false, error: NATIVE_MODULE_ERROR };
    }
    return { ok: false, error: "Could not save the image. Try again." };
  }
}
