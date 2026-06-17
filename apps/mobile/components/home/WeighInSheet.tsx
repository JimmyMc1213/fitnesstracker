import { buildCoachContext, getWeighInReaction, localDateKey } from "@newyouai/core";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, Text, TextInput, View } from "react-native";

import { BottomSheet } from "@/components/motion";

import { buildHabitsForDateKey, markWeighInHabitDone } from "@/lib/habits";
import { compressImageToJpegDataUrl } from "@/lib/imageCompress";
import { formatWeightFromLbs, isValidWeighInLbs, parseWeightToLbs } from "@/lib/unitConversions";
import { weightUnitLabel } from "@/lib/unitLabels";
import { useBottomActionPadding } from "@/lib/screenInsets";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { AppState, UnitPreferences, WeightEntry } from "@newyouai/types";

type Props = {
  open: boolean;
  onClose: () => void;
  dateKey: string;
  existing: WeightEntry | undefined;
  unitPreferences: UnitPreferences;
  setFitnessState: (updater: (prev: AppState) => AppState) => void;
};

function permissionDeniedMessage(kind: "camera" | "gallery"): string {
  return kind === "camera"
    ? "Camera access is off. Enable it in Settings or choose from gallery."
    : "Photo library access is off. Enable it in Settings or use the camera.";
}

export function WeighInSheet({
  open,
  onClose,
  dateKey,
  existing,
  unitPreferences,
  setFitnessState,
}: Props) {
  const { colors } = useAppTheme();
  const bottomActionPadding = useBottomActionPadding();
  const wUnit = unitPreferences.weightUnit;
  const [weightDraft, setWeightDraft] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setWeightDraft(
      existing ? formatWeightFromLbs(existing.weightLbs, wUnit, wUnit === "kg" ? 1 : 1) : "",
    );
    setPhotoPreview(existing?.photoDataUrl ?? null);
    setPhotoError(null);
  }, [open, dateKey, existing?.weightLbs, existing?.photoDataUrl, wUnit]);

  // compressImageToJpegDataUrl keeps photos within local-only persist budget (see mergePersistedFitnessSlices cap).
  const onPickImageUri = useCallback(async (uri: string) => {
    try {
      setPhotoError(null);
      const url = await compressImageToJpegDataUrl(uri);
      setPhotoPreview(url);
    } catch {
      setPhotoError("Could not read that photo. Try another image.");
    }
  }, []);

  const pickFromCamera = useCallback(async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setPhotoError(permissionDeniedMessage("camera"));
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
      setPhotoError(permissionDeniedMessage("camera"));
    }
  }, [onPickImageUri]);

  const pickFromGallery = useCallback(async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setPhotoError(permissionDeniedMessage("gallery"));
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
      setPhotoError(permissionDeniedMessage("gallery"));
    }
  }, [onPickImageUri]);

  function openPhotoPicker() {
    Alert.alert("Progress photo", "Add an optional progress photo for this weigh-in.", [
      { text: "Camera", onPress: () => void pickFromCamera() },
      { text: "Photo library", onPress: () => void pickFromGallery() },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function confirmRemovePhoto() {
    Alert.alert("Remove photo?", "Remove the progress photo from this weigh-in?", [
      { text: "Keep photo", style: "cancel" },
      { text: "Remove photo", style: "destructive", onPress: () => setPhotoPreview(null) },
    ]);
  }

  function save() {
    const display = parseFloat(weightDraft);
    const lbs = parseWeightToLbs(display, wUnit);
    if (!isValidWeighInLbs(lbs)) return;

    const loggedAtIso = new Date().toISOString();
    setFitnessState((s) => {
      const withoutDay = s.weightLog.filter((e) => e.dateKey !== dateKey);
      const draft: WeightEntry = {
        dateKey,
        weightLbs: lbs,
        loggedAtIso,
        photoDataUrl: photoPreview ?? undefined,
      };
      const ctx = buildCoachContext({ ...s, weightLog: withoutDay }, dateKey, new Date());
      const reaction = getWeighInReaction(ctx, draft);
      const entry: WeightEntry = {
        ...draft,
        ...(reaction?.message ? { coachMessage: reaction.message } : {}),
        ...(reaction?.macroNudge?.deltaCal != null
          ? {
              macroNudge: {
                deltaCal: reaction.macroNudge.deltaCal,
                reason: reaction.macroNudge.reason,
              },
            }
          : {}),
      };
      const nextLog = [...withoutDay, entry].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
      // Weigh-in photos live on weightLog.photoDataUrl only (PWA parity). progressPics is for standalone gallery adds.
      const habitsDoneByDay = markWeighInHabitDone(s.habitsDoneByDay, dateKey);
      const todayKey = localDateKey(new Date());
      const habits =
        dateKey === todayKey
          ? buildHabitsForDateKey(s.habitTemplates, habitsDoneByDay, dateKey, { weightLogged: true })
          : s.habits;
      return { ...s, weightLog: nextLog, habitsDoneByDay, habits };
    });
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      panelStyle={{ paddingHorizontal: 0, paddingBottom: bottomActionPadding, maxHeight: "82%" }}
    >
      <View testID="weigh-in-sheet" className="rounded-t-2xl px-5 pt-5">
          <Text
            className="mb-2 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            Weigh-in
          </Text>
          <Text className="mb-3.5 text-xs leading-[1.5]" style={{ color: colors.textSecondary }}>
            Morning scale, post-bathroom, before food. Optional progress photo, same stance and lighting when you can.
          </Text>

          <Text className="text-[10px] font-medium tracking-wider" style={{ color: colors.textTertiary }}>
            Weight ({weightUnitLabel(wUnit)})
          </Text>
          <TextInput
            testID="weigh-in-weight-input"
            value={weightDraft}
            onChangeText={setWeightDraft}
            keyboardType="decimal-pad"
            placeholder={wUnit === "kg" ? "78.2" : "172.4"}
            placeholderTextColor={colors.textTertiary}
            className="mt-1.5 rounded-xl border px-3 py-3 text-lg font-semibold"
            style={{
              borderColor: colors.border,
              color: colors.textPrimary,
              backgroundColor: colors.background,
            }}
          />

          <View className="mt-3 flex-row flex-wrap items-center gap-2">
            <Pressable
              testID="weigh-in-add-photo"
              onPress={openPhotoPicker}
              className="rounded-[10px] border px-3.5 py-2.5"
              style={{ borderColor: colors.border }}
            >
              <Text className="text-xs font-semibold" style={{ color: colors.textPrimary }}>
                {photoPreview ? "Change photo" : "Add progress photo"}
              </Text>
            </Pressable>
            {photoPreview ? (
              <Pressable onPress={confirmRemovePhoto}>
                <Text className="text-[11px] font-medium" style={{ color: colors.textTertiary }}>
                  Remove photo
                </Text>
              </Pressable>
            ) : null}
          </View>

          {photoError ? (
            <Text className="mt-2 text-xs" style={{ color: "#f87171" }}>
              {photoError}
            </Text>
          ) : null}

          {photoPreview ? (
            <View
              testID="weigh-in-photo-preview"
              className="mt-3.5 overflow-hidden rounded-xl border"
              style={{ borderColor: colors.border, maxHeight: 220 }}
            >
              <Image source={{ uri: photoPreview }} style={{ width: "100%", height: 200 }} resizeMode="cover" />
            </View>
          ) : null}

          <Pressable
            onPress={save}
            testID="weigh-in-save"
            className="mt-4 items-center rounded-xl py-3.5"
            style={{ backgroundColor: colors.accent }}
          >
            <Text className="text-sm font-semibold" style={{ color: colors.accentText }}>
              {existing ? "Update weigh-in" : "Save weigh-in"}
            </Text>
          </Pressable>

          <Pressable onPress={onClose} className="mt-2.5 items-center py-2.5">
            <Text className="text-[13px] font-semibold" style={{ color: colors.textTertiary }}>
              Cancel
            </Text>
          </Pressable>
      </View>
    </BottomSheet>
  );
}
