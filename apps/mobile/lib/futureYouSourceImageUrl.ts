import {
  cacheFutureYouSourceUrl,
  getCachedFutureYouSourceUrl,
} from "@/lib/futureYouImagePreload";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";

const FUTURE_YOU_BUCKET = "future-you";
const SIGNED_URL_TTL_SEC = 3600;

/** Display URL for a persisted source selfie path (client storage only — no status API). */
export async function resolveFutureYouSourceImageUrl(storagePath: string): Promise<string | null> {
  const path = storagePath.trim();
  if (!path) return null;

  const cached = getCachedFutureYouSourceUrl(path);
  if (cached) return cached;

  if (!isSupabaseConfigured()) return null;
  const sb = getSupabase();
  if (!sb) return null;

  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) return null;

  const { data, error } = await sb.storage.from(FUTURE_YOU_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SEC);
  if (!error && data?.signedUrl) {
    cacheFutureYouSourceUrl(path, data.signedUrl);
    return data.signedUrl;
  }

  const { data: blob, error: downloadError } = await sb.storage.from(FUTURE_YOU_BUCKET).download(path);
  if (downloadError || !blob) return null;

  const FileSystem = await import("expo-file-system/legacy");
  const cacheDir = `${FileSystem.cacheDirectory ?? ""}future-you-source/`;
  await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true }).catch(() => undefined);

  const safeName = path.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const fileUri = `${cacheDir}${safeName}`;

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read source photo."));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read source photo."));
    reader.readAsDataURL(blob);
  });

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  cacheFutureYouSourceUrl(path, fileUri);
  return fileUri;
}
