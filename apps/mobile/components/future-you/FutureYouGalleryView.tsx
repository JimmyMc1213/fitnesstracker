import {
  FUTURE_YOU_GALLERY_COUNT_ONE,
  FUTURE_YOU_GALLERY_EMPTY_TITLE,
  FUTURE_YOU_GALLERY_TAP_HINT,
  FUTURE_YOU_GALLERY_TRY_CTA_LABEL,
  type FutureYouGalleryItem,
} from "@newyouai/core";
import type { UserGender } from "@newyouai/types";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";
import { futureYouRevealPlaceholderSource } from "@/lib/futureYouRevealPlaceholder";

type Props = {
  items: FutureYouGalleryItem[];
  gender: UserGender | undefined;
  pageLede: string;
  pageRedoLede: string | null;
  showEmptyTryCta: boolean;
  onOpenItem: (item: FutureYouGalleryItem) => void;
  onTryNewYou: () => void;
};

function tileImageSource(
  imageSrc: string | null,
  placeholder: ImageSourcePropType | null,
): ImageSourcePropType | null {
  if (imageSrc) return { uri: imageSrc };
  return placeholder;
}

export function FutureYouGalleryView({
  items,
  gender,
  pageLede,
  pageRedoLede,
  showEmptyTryCta,
  onOpenItem,
  onTryNewYou,
}: Props) {
  const { colors } = useAppTheme();
  const placeholder = futureYouRevealPlaceholderSource(gender);

  return (
    <View testID="future-you-gallery" className="gap-3">
      {items.length > 0 ? (
        <View className="items-center gap-1">
          <Text
            className="max-w-[22rem] px-1 pt-1 text-center text-sm leading-[1.45]"
            style={{ color: colors.textSecondary }}
          >
            {pageLede}
          </Text>
          {pageRedoLede ? (
            <Text
              className="max-w-[22rem] px-1 text-center text-sm leading-[1.45]"
              style={{ color: colors.textSecondary }}
            >
              {pageRedoLede}
            </Text>
          ) : null}
        </View>
      ) : null}

      {items.length > 0 ? (
        <>
          <Text
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textTertiary }}
          >
            {FUTURE_YOU_GALLERY_COUNT_ONE}
          </Text>
          <View className="mt-2.5 flex-row flex-wrap gap-2.5">
            {items.map((item) => {
              const source = tileImageSource(item.imageSrc, placeholder);
              return (
                <Pressable
                  key={item.id}
                  testID="future-you-gallery-tile"
                  accessibilityRole="button"
                  accessibilityState={{ busy: item.loading }}
                  onPress={() => onOpenItem(item)}
                  className="relative min-w-0 overflow-hidden rounded-[14px] border-[0.5px]"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    width: "48%",
                    aspectRatio: 3 / 4,
                  }}
                >
                  {source ? (
                    <Image
                      source={source}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                      accessibilityIgnoresInvertColors
                    />
                  ) : null}
                  {item.loading ? (
                    <View
                      className="absolute inset-0 items-center justify-center"
                      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                    >
                      <ActivityIndicator color="#fff" />
                    </View>
                  ) : null}
                  <View
                    className="absolute bottom-0 left-0 right-0 gap-0.5 px-2 pb-2 pt-5"
                    style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
                  >
                    <Text className="text-[10px] font-semibold text-white/85">{item.dateLabel}</Text>
                    <Text className="text-[11px] font-semibold leading-[1.25] text-white">
                      {item.caption}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Text className="-mt-1 text-center text-xs" style={{ color: colors.textTertiary }}>
            {FUTURE_YOU_GALLERY_TAP_HINT}
          </Text>
        </>
      ) : (
        <View
          className="mt-3 items-center gap-2 rounded-[14px] border px-5 py-6"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          {placeholder ? (
            <Image
              source={placeholder}
              style={{ width: 120, height: 120, opacity: 0.55, marginBottom: 4 }}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          ) : null}
          <Text className="text-base font-bold" style={{ color: colors.textPrimary }}>
            {FUTURE_YOU_GALLERY_EMPTY_TITLE}
          </Text>
          {showEmptyTryCta ? (
            <Pressable
              testID="future-you-create-cta"
              accessibilityRole="button"
              onPress={onTryNewYou}
              className="mt-2 w-full max-w-[18rem] items-center rounded-full px-6 py-3.5"
              style={{ backgroundColor: colors.accent, minHeight: 52 }}
            >
              <Text className="text-lg font-semibold" style={{ color: colors.background }}>
                {FUTURE_YOU_GALLERY_TRY_CTA_LABEL}
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}
