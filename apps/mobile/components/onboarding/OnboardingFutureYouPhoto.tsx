import type { UserGender } from "@newyouai/types";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type ViewStyle,
} from "react-native";

import { FutureYouLegalFooter } from "@/components/future-you/FutureYouLegalFooter";
import { PressableScale } from "@/components/ui/PressableScale";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { isFutureYouPhotoBlocked } from "@/lib/futureYouAge";
import { FUTURE_YOU_PRIVACY_POLICY_URL, PAYWALL_TERMS_URL } from "@/lib/futureYouLegal";
import { futureYouSilhouettesForGender } from "@/lib/futureYouSilhouettes";

type Props = {
  gender: UserGender | undefined;
  age: number | null;
  photoPreview: string | null;
  photoSaved: boolean;
  photoAiConsentAt: string | undefined;
  uploading: boolean;
  uploadError: string | null;
  onPickFromCamera: () => void | Promise<void>;
  onPickFromGallery: () => void | Promise<void>;
  onConfirmPhoto: () => void | Promise<void>;
  onRetryUpload: () => void | Promise<void>;
  onClearPhoto: () => void;
  onGrantAiConsent: () => void;
  consentTestID?: string;
  confirmTestID?: string;
};

function panelMaxHeight(windowHeight: number) {
  return Math.min(320, Math.max(220, windowHeight * 0.42));
}

/** Floor so the aspect-ratio panel never collapses inside a flex/scroll host. */
const PANEL_MIN_HEIGHT = 200;

const PANEL_RADIUS = 14;

const panelCornerStyle: ViewStyle =
  Platform.OS === "ios" ? { borderCurve: "continuous" } : {};

function PhotoPanel({
  uri,
  silhouetteSource,
  variant = "before",
  maxHeight,
}: {
  uri?: string | null;
  silhouetteSource?: ImageSourcePropType;
  variant?: "before" | "after";
  maxHeight: number;
}) {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const isAfter = variant === "after";

  const shellStyle: ViewStyle = {
    width: "100%",
    aspectRatio: 9 / 16,
    minHeight: PANEL_MIN_HEIGHT,
    maxHeight,
    borderRadius: PANEL_RADIUS,
    ...panelCornerStyle,
    overflow: "hidden",
    // Silhouette PNGs are dark-on-white; match that backing so no seam shows.
    backgroundColor: uri ? colors.card : "#ffffff",
    borderWidth: 1,
    borderColor: isAfter ? ob.gold : colors.border,
    ...(isAfter ?
      {
        shadowColor: ob.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
        elevation: 3,
      }
    : {}),
  };

  return (
    <View style={shellStyle}>
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : silhouetteSource ? (
        <View style={silhouetteFrameStyle}>
          <Image
            source={silhouetteSource}
            style={silhouetteImageStyle}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
      ) : null}
    </View>
  );
}

/** Matches PWA `.future-you-photo-step__silhouette` — feet anchored, ~88% scale. */
const silhouetteFrameStyle: ViewStyle = {
  ...StyleSheet.absoluteFill,
  alignItems: "center",
  justifyContent: "flex-end",
};

const silhouetteImageStyle: ImageStyle = {
  width: "88%",
  height: "88%",
};

export function OnboardingFutureYouPhoto({
  gender,
  age,
  photoPreview,
  photoSaved,
  photoAiConsentAt,
  uploading,
  uploadError,
  onPickFromCamera,
  onPickFromGallery,
  onConfirmPhoto,
  onRetryUpload,
  onClearPhoto,
  onGrantAiConsent,
  consentTestID,
  confirmTestID,
}: Props) {
  const { colors } = useAppTheme();
  const { ob } = useOnboardingTheme();
  const { height: windowHeight } = useWindowDimensions();
  const suppressConfirmClickRef = useRef(false);
  const [aiConsentChecked, setAiConsentChecked] = useState(Boolean(photoAiConsentAt));
  const [confirmReady, setConfirmReady] = useState(false);
  const blocked = isFutureYouPhotoBlocked(age);
  const hasPhoto = Boolean(photoPreview || photoSaved);
  const canRetry = Boolean(uploadError && hasPhoto);
  const canUpload = aiConsentChecked && !uploading && !blocked;
  const awaitingConfirm = Boolean(photoPreview && !photoSaved && !canRetry);
  const silhouettes = futureYouSilhouettesForGender(gender);
  const maxPanelHeight = panelMaxHeight(windowHeight);

  useEffect(() => {
    if (!awaitingConfirm) {
      setConfirmReady(false);
      return;
    }
    suppressConfirmClickRef.current = true;
    setConfirmReady(false);
    const id = setTimeout(() => {
      suppressConfirmClickRef.current = false;
      setConfirmReady(true);
    }, 400);
    return () => clearTimeout(id);
  }, [awaitingConfirm, photoPreview]);

  function onConfirmClick() {
    if (uploading || !canUpload || !confirmReady || suppressConfirmClickRef.current) return;
    void onConfirmPhoto();
  }

  return (
    <View className="flex-1">
      <View className="flex-1 justify-center gap-6 pt-3">
        <View className="relative pb-9">
          <View className={`flex-row items-center gap-2.5${blocked ? " opacity-40" : ""}`}>
            <View className="relative min-w-0 flex-1">
              <PhotoPanel
                uri={photoPreview}
                silhouetteSource={silhouettes?.before}
                maxHeight={maxPanelHeight}
              />
              <View
                className="absolute left-0 right-0 top-full mt-2 min-h-7 items-center justify-center"
                pointerEvents="box-none"
              >
                {hasPhoto && !uploading && !blocked ? (
                  <PressableScale onPress={onClearPhoto} disabled={!canUpload} style={{ paddingVertical: 4 }}>
                    <Text className="text-sm font-medium" style={{ color: ob.gold }}>
                      Remove photo
                    </Text>
                  </PressableScale>
                ) : (
                  <View className="h-7" />
                )}
              </View>
            </View>
            <Text className="text-lg font-medium" style={{ color: ob.gold }}>
              →
            </Text>
            <View className="min-w-0 flex-1">
              <PhotoPanel silhouetteSource={silhouettes?.after} variant="after" maxHeight={maxPanelHeight} />
            </View>
          </View>

          {blocked ? (
            <View
              className="absolute inset-0 items-center justify-center rounded-[14px] px-6"
              style={{ backgroundColor: `${colors.background}cc` }}
            >
              <Text className="text-center text-base font-semibold" style={{ color: colors.textPrimary }}>
                Future You is only for users 18+.
              </Text>
            </View>
          ) : null}
        </View>

      {!blocked ? (
        <View>
          <Text className="mb-3 text-center text-sm" style={{ color: colors.textSecondary }}>
            Your photo is only used to create your Future You, never shared or sold.
          </Text>

          <PressableScale
            testID={consentTestID}
            onPress={() => {
              const checked = !aiConsentChecked;
              setAiConsentChecked(checked);
              if (checked) onGrantAiConsent();
            }}
            disabled={uploading}
            style={{ marginBottom: 16, flexDirection: "row", alignItems: "flex-start", gap: 12 }}
          >
            <View
              className="mt-0.5 h-5 w-5 items-center justify-center rounded border"
              style={{
                borderColor: aiConsentChecked ? ob.gold : colors.border,
                backgroundColor: aiConsentChecked ? ob.gold : "transparent",
              }}
            >
              {aiConsentChecked ? (
                <Text className="text-xs font-bold" style={{ color: ob.goldOn }}>
                  ✓
                </Text>
              ) : null}
            </View>
            <Text className="flex-1 text-sm leading-5" style={{ color: colors.textPrimary }}>
              My photo will be processed by AI to generate my transformation.{" "}
              <Text
                style={{ color: ob.gold }}
                onPress={() => void Linking.openURL(FUTURE_YOU_PRIVACY_POLICY_URL)}
              >
                Privacy Policy
              </Text>
              {" · "}
              <Text style={{ color: ob.gold }} onPress={() => void Linking.openURL(PAYWALL_TERMS_URL)}>
                Terms
              </Text>
            </Text>
            </PressableScale>

          {canRetry ? (
            <PressableScale
              onPress={() => void onRetryUpload()}
              disabled={!canUpload}
              style={{
                alignItems: "center",
                borderRadius: 9999,
                paddingVertical: 16,
                backgroundColor: canUpload ? ob.gold : colors.border,
              }}
            >
              <Text className="text-base font-semibold" style={{ color: ob.goldOn }}>
                Try again
              </Text>
            </PressableScale>
          ) : awaitingConfirm ? (
            <PressableScale
              testID={confirmTestID}
              onPress={onConfirmClick}
              disabled={!canUpload || !confirmReady}
              style={{
                alignItems: "center",
                borderRadius: 9999,
                paddingVertical: 16,
                backgroundColor: canUpload && confirmReady ? ob.gold : colors.border,
                opacity: canUpload && confirmReady ? 1 : 0.6,
              }}
            >
              <Text className="text-base font-semibold" style={{ color: ob.goldOn }}>
                Use this photo →
              </Text>
            </PressableScale>
          ) : (
            <View className="gap-2">
              <PressableScale
                onPress={() => void onPickFromCamera()}
                disabled={!canUpload}
                style={{
                  alignItems: "center",
                  borderRadius: 9999,
                  paddingVertical: 16,
                  backgroundColor: canUpload ? ob.gold : colors.border,
                }}
              >
                <Text className="text-base font-semibold" style={{ color: ob.goldOn }}>
                  {uploading ? "Uploading…" : "Take a photo"}
                </Text>
              </PressableScale>
              <PressableScale
                onPress={() => void onPickFromGallery()}
                disabled={!canUpload}
                style={{
                  alignItems: "center",
                  borderRadius: 9999,
                  borderWidth: 1,
                  paddingVertical: 16,
                  borderColor: colors.border,
                }}
              >
                <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
                  Choose from gallery
                </Text>
              </PressableScale>
            </View>
          )}

          {uploadError ? (
            <Text className="mt-3 text-center text-sm" style={{ color: "#f87171" }}>
              {uploadError}
            </Text>
          ) : null}
        </View>
      ) : null}
      </View>

      <FutureYouLegalFooter className="pt-5 shrink-0" accentColor={colors.textPrimary} />
    </View>
  );
}
