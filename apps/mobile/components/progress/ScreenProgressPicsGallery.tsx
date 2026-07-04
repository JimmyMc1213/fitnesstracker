import {
  collectProgressPicGalleryItems,
  formatProgressPicDate,
  localDateKey,
  newProgressPicId,
  type ProgressPicGalleryItem,
} from "@newyouai/core";
import type { AppState } from "@newyouai/types";
import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FullScreenOverlay } from "@/components/motion";

import { ScreenHeader } from "@/components/home/ScreenHeader";
import { ProgressPicsDeleteConfirmSheet } from "@/components/progress/ProgressPicsDeleteConfirmSheet";
import { compressImageToJpegDataUrl } from "@/lib/imageCompress";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  state: AppState;
  setFitnessState: (updater: (prev: AppState) => AppState) => void;
  onBack: () => void;
};

function permissionDeniedMessage(kind: "camera" | "gallery"): string {
  return kind === "camera"
    ? "Camera access is off. Enable it in Settings or choose from gallery."
    : "Photo library access is off. Enable it in Settings or use the camera.";
}

export function ScreenProgressPicsGallery({ state, setFitnessState, onBack }: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [viewerItem, setViewerItem] = useState<ProgressPicGalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProgressPicGalleryItem | null>(null);

  const isLocked = Boolean(state.progressPicsLock);
  const showGallery = !isLocked;

  const items = useMemo(
    () => collectProgressPicGalleryItems(state.progressPics, state.weightLog),
    [state.progressPics, state.weightLog],
  );

  const displayItems = isLocked ? items.slice(0, 9) : items;

  const onPickImageUri = useCallback(
    async (uri: string) => {
      try {
        // compressImageToJpegDataUrl keeps photos within local-only persist budget (see mergePersistedFitnessSlices cap).
        const photoDataUrl = await compressImageToJpegDataUrl(uri);
        const dateKey = localDateKey(new Date());
        const entry = {
          id: newProgressPicId(),
          dateKey,
          photoDataUrl,
          addedAtIso: new Date().toISOString(),
        };
        setFitnessState((s) => ({ ...s, progressPics: [...(s.progressPics ?? []), entry] }));
      } catch {
        /* ignore */
      }
    },
    [setFitnessState],
  );

  const pickFromCamera = useCallback(async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Camera", permissionDeniedMessage("camera"));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      if (result.canceled || !result.assets[0]?.uri) return;
      await onPickImageUri(result.assets[0].uri);
    } catch {
      Alert.alert("Camera", permissionDeniedMessage("camera"));
    }
  }, [onPickImageUri]);

  const pickFromGallery = useCallback(async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Photos", permissionDeniedMessage("gallery"));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      if (result.canceled || !result.assets[0]?.uri) return;
      await onPickImageUri(result.assets[0].uri);
    } catch {
      Alert.alert("Photos", permissionDeniedMessage("gallery"));
    }
  }, [onPickImageUri]);

  function openPhotoPicker() {
    Alert.alert("Add progress pic", "Choose a photo source.", [
      { text: "Camera", onPress: () => void pickFromCamera() },
      { text: "Photo library", onPress: () => void pickFromGallery() },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function removeItem(item: ProgressPicGalleryItem) {
    setFitnessState((s) => {
      if (item.source === "gallery" && item.galleryId) {
        return { ...s, progressPics: (s.progressPics ?? []).filter((p) => p.id !== item.galleryId) };
      }
      if (item.source === "weigh-in" && item.weighInDateKey) {
        const weightLog = s.weightLog.map((e) =>
          e.dateKey === item.weighInDateKey ? { ...e, photoDataUrl: undefined } : e,
        );
        // Clear legacy weigh-in duplicates in progressPics (same date + photo URL).
        const progressPics = (s.progressPics ?? []).filter(
          (p) => !(p.dateKey === item.weighInDateKey && p.photoDataUrl === item.photoDataUrl),
        );
        return { ...s, weightLog, progressPics };
      }
      return s;
    });
    setViewerItem(null);
    setDeleteTarget(null);
  }

  function openUnlockStub() {
    Alert.alert(
      "Unlock gallery",
      "Enter your PIN to view progress photos. Full PIN unlock ships in a follow-up. Set your lock from the web app for now.",
    );
  }

  return (
    <View
      testID="progress-pics-gallery"
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        className="flex-1 px-screen-x"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-1 flex-row items-center justify-between">
          <Pressable
            testID="progress-pics-back"
            accessibilityRole="button"
            accessibilityLabel="Back to progress"
            onPress={onBack}
            className="-ml-2 p-2"
          >
            <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
              ← Back
            </Text>
          </Pressable>
          <View className="flex-row items-center gap-2">
            {showGallery ? (
              <Pressable
                testID="progress-pics-gallery-add"
                accessibilityRole="button"
                accessibilityLabel="Add progress photo"
                onPress={openPhotoPicker}
                className="flex-row items-center gap-1 px-2.5 py-2"
              >
                <SymbolView
                  name={{ ios: "plus", android: "add", web: "add" }}
                  tintColor={colors.textPrimary}
                  size={13}
                />
                <Text className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
                  Add
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isLocked ? "Unlock gallery" : "Gallery lock"}
              onPress={() => {
                if (isLocked) {
                  openUnlockStub();
                } else {
                  Alert.alert(
                    "Gallery lock",
                    "PIN lock settings ship in a follow-up. Photos can be hidden with a lock from the web app.",
                  );
                }
              }}
              className="h-9 w-9 items-center justify-center rounded-lg border"
              style={{
                borderColor: colors.border,
                backgroundColor: "transparent",
              }}
            >
              <SymbolView
                name={
                  isLocked
                    ? { ios: "lock.fill", android: "lock", web: "lock" }
                    : { ios: "lock.open.fill", android: "lock_open", web: "lock_open" }
                }
                tintColor={isLocked ? colors.textPrimary : colors.textTertiary}
                size={16}
              />
            </Pressable>
          </View>
        </View>

        <ScreenHeader eyebrow="PROGRESS" title="Progress pics" titleTestID="progress-pics-gallery-title" />

        <Text className="mb-4 mt-1 text-[13px] font-medium" style={{ color: colors.textTertiary }}>
          {items.length > 0
            ? `${items.length} photo${items.length === 1 ? "" : "s"} · weigh-in photos included`
            : "Add photos to track visual changes over time."}
        </Text>

        <View
          className="relative overflow-hidden rounded-xl"
          style={{ minHeight: items.length === 0 && showGallery ? 120 : 160 }}
        >
          <View pointerEvents={showGallery ? "auto" : "none"}>
            {displayItems.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {displayItems.map((item) => (
                  <Pressable
                    key={item.key}
                    accessibilityRole="button"
                    onPress={() => showGallery && setViewerItem(item)}
                    className="overflow-hidden rounded-[10px] border"
                    style={{
                      width: "31%",
                      aspectRatio: 3 / 4,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    }}
                  >
                    {showGallery ? (
                      <>
                        <Image
                          source={{ uri: item.photoDataUrl }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                        <View
                          className="absolute bottom-0 left-0 right-0 px-1.5 py-1"
                          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                        >
                          <Text className="text-[9px] font-semibold text-white">
                            {formatProgressPicDate(item.dateKey)}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={{ width: "100%", height: "100%", backgroundColor: colors.border }} />
                    )}
                  </Pressable>
                ))}
              </View>
            ) : (
              <View
                className="items-center rounded-xl border p-7"
                style={{ borderColor: colors.border, backgroundColor: colors.card }}
              >
                <Text className="text-center text-sm leading-5" style={{ color: colors.textTertiary }}>
                  {showGallery
                    ? "No photos yet. Tap Add to upload your first progress pic."
                    : "Your gallery is locked."}
                </Text>
              </View>
            )}
          </View>

          {isLocked ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Unlock progress pics"
              onPress={openUnlockStub}
              className="absolute inset-0 items-center justify-center"
              style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
            >
              <View
                className="rounded-full border px-4 py-2.5"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.12,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Tap to unlock
                </Text>
              </View>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <FullScreenOverlay
        open={viewerItem != null && showGallery}
        motionVariant="fade"
        onRequestClose={() => setViewerItem(null)}
      >
        {viewerItem ? (
          <View
            className="flex-1"
            style={{
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 24,
              paddingHorizontal: 16,
            }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Pressable onPress={() => setViewerItem(null)} className="p-2">
                <Text className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                  Done
                </Text>
              </Pressable>
              <Text className="text-[13px] font-semibold" style={{ color: colors.textSecondary }}>
                {formatProgressPicDate(viewerItem.dateKey)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete photo"
                onPress={() => setDeleteTarget(viewerItem)}
                className="h-9 w-9 items-center justify-center rounded-lg border"
                style={{ borderColor: colors.border }}
              >
                <SymbolView
                  name={{ ios: "trash", android: "delete", web: "delete" }}
                  tintColor={colors.textTertiary}
                  size={16}
                />
              </Pressable>
            </View>

            <View className="min-h-0 flex-1 items-center justify-center">
              <Image
                source={{ uri: viewerItem.photoDataUrl }}
                style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12 }}
                resizeMode="contain"
              />
            </View>

            {viewerItem.source === "weigh-in" ? (
              <Text className="mt-3 text-center text-[11px]" style={{ color: colors.textTertiary }}>
                From weigh-in · deleting removes the photo from that entry
              </Text>
            ) : null}

            {items.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mt-4"
                contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
              >
                {items.map((item) => (
                  <Pressable
                    key={item.key}
                    accessibilityRole="button"
                    onPress={() => setViewerItem(item)}
                    className="overflow-hidden rounded-lg"
                    style={{
                      width: 56,
                      height: 74,
                      borderWidth: item.key === viewerItem.key ? 2 : 0.5,
                      borderColor: item.key === viewerItem.key ? colors.textPrimary : colors.border,
                      opacity: item.key === viewerItem.key ? 1 : 0.7,
                    }}
                  >
                    <Image
                      source={{ uri: item.photoDataUrl }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
          </View>
        ) : null}
      </FullScreenOverlay>

      <ProgressPicsDeleteConfirmSheet
        open={deleteTarget != null}
        item={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeItem(deleteTarget)}
      />
    </View>
  );
}
