import * as ImagePicker from "expo-image-picker";
import type { ImagePickerOptions } from "expo-image-picker";

import { compressImageToJpegFile } from "@/lib/imageCompress";
import {
  E2E_MOCK_FUTURE_YOU_JPEG_DATA_URL,
  isE2eMockFutureYouCameraEnabled,
} from "@/lib/e2e/futureYouMock";

export function futureYouPhotoPermissionDeniedMessage(kind: "camera" | "gallery"): string {
  return kind === "camera" ?
      "Camera access is off. Enable it in Settings or choose from gallery, or skip for now."
    : "Photo library access is off. Enable it in Settings or use the camera, or skip for now.";
}

type PickResult = { preview: string } | { error: string } | null;

const pickerOptions: Pick<ImagePickerOptions, "mediaTypes" | "allowsEditing" | "aspect" | "quality"> = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [9, 16],
  quality: 1,
};

export async function pickFutureYouPhotoFromCamera(): Promise<PickResult> {
  if (isE2eMockFutureYouCameraEnabled()) {
    return { preview: E2E_MOCK_FUTURE_YOU_JPEG_DATA_URL };
  }

  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return { error: futureYouPhotoPermissionDeniedMessage("camera") };
    }

    const result = await ImagePicker.launchCameraAsync({
      ...pickerOptions,
      cameraType: ImagePicker.CameraType.front,
    });
    if (result.canceled || !result.assets[0]?.uri) return null;

    try {
      const preview = await compressImageToJpegFile(result.assets[0].uri);
      return { preview };
    } catch {
      return { error: "Could not read that photo. Try another image." };
    }
  } catch {
    return { error: futureYouPhotoPermissionDeniedMessage("camera") };
  }
}

export async function pickFutureYouPhotoFromGallery(): Promise<PickResult> {
  if (isE2eMockFutureYouCameraEnabled()) {
    return { preview: E2E_MOCK_FUTURE_YOU_JPEG_DATA_URL };
  }

  try {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { error: futureYouPhotoPermissionDeniedMessage("gallery") };
    }

    const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
    if (result.canceled || !result.assets[0]?.uri) return null;

    try {
      const preview = await compressImageToJpegFile(result.assets[0].uri);
      return { preview };
    } catch {
      return { error: "Could not read that photo. Try another image." };
    }
  } catch {
    return { error: futureYouPhotoPermissionDeniedMessage("gallery") };
  }
}
