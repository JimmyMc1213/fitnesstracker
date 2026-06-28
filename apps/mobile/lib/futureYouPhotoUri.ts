const LOCAL_PHOTO_URI_RE = /^(file:|content:|ph:|assets-library:)/i;

export function isLocalFutureYouPhotoUri(value: string): boolean {
  return LOCAL_PHOTO_URI_RE.test(value.trim());
}

export function isFutureYouPhotoDataUrl(value: string): boolean {
  return /^data:image\//i.test(value.trim());
}
