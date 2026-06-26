import { collectProgressPicGalleryItems, formatProgressPicDate } from "@newyouai/core";
import type { AppState } from "@newyouai/types";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  state: AppState;
  onOpenGallery: () => void;
};

/** Tappable entry on Progress, opens the full gallery screen. */
export function ProgressPicsSection({ state, onOpenGallery }: Props) {
  const { colors } = useAppTheme();
  const isLocked = Boolean(state.progressPicsLock);
  const items = useMemo(
    () => collectProgressPicGalleryItems(state.progressPics, state.weightLog),
    [state.progressPics, state.weightLog],
  );
  const previewItems = items.slice(0, 3);

  return (
    <Pressable
      testID="progress-pics-section"
      accessibilityRole="button"
      accessibilityLabel={isLocked ? "Open locked progress pics gallery" : "Open progress pics gallery"}
      onPress={onOpenGallery}
      className="mt-3 rounded-[14px] border p-[18px]"
      style={{ borderColor: colors.border, backgroundColor: colors.card }}
    >
      <View className="mb-3 flex-row items-center justify-between">
        <Text
          className="text-[11px] font-medium uppercase tracking-widest"
          style={{ color: colors.textTertiary }}
        >
          Progress pics
        </Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
            {items.length > 0 ? `${items.length} photo${items.length === 1 ? "" : "s"}` : "Open gallery"}
          </Text>
          <SymbolView
            name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
            tintColor={colors.textPrimary}
            size={14}
          />
        </View>
      </View>

      <View
        className="relative overflow-hidden rounded-xl"
        style={{ minHeight: previewItems.length > 0 ? 88 : 56 }}
      >
        {previewItems.length > 0 ? (
          isLocked ? (
            <View className="flex-row gap-1.5">
              {previewItems.map((item) => (
                <View
                  key={item.key}
                  className="flex-1 overflow-hidden rounded-[10px] border"
                  style={{ aspectRatio: 3 / 4, borderColor: colors.border, backgroundColor: colors.border }}
                />
              ))}
            </View>
          ) : (
            <View className="flex-row gap-1.5">
              {previewItems.map((item) => (
                <View
                  key={item.key}
                  className="flex-1 overflow-hidden rounded-[10px] border"
                  style={{ aspectRatio: 3 / 4, borderColor: colors.border, backgroundColor: colors.card }}
                >
                  <Image
                    source={{ uri: item.photoDataUrl }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
          )
        ) : (
          <Text className="text-[13px] font-normal leading-5" style={{ color: colors.textTertiary }}>
            Store progress photos and compare changes over time.
          </Text>
        )}

        {isLocked ? (
          <View
            className="absolute inset-0 items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.1)" }}
            pointerEvents="none"
          >
            <View
              className="rounded-full border px-3.5 py-2"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
                Tap to unlock
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {!isLocked && items.length > 0 ? (
        <Text className="mt-2.5 text-xs font-medium" style={{ color: colors.textTertiary }}>
          Latest · {formatProgressPicDate(items[0]!.dateKey)}
        </Text>
      ) : null}
    </Pressable>
  );
}
