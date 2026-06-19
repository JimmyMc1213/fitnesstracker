import type { UserGender } from "@newyouai/types";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from "react-native";

import { FutureYouLegalFooter } from "@/components/future-you/FutureYouLegalFooter";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { isFutureYouPhotoBlocked } from "@/lib/futureYouAge";
import { FUTURE_YOU_PRIVACY_POLICY_URL, PAYWALL_TERMS_URL } from "@/lib/futureYouLegal";
import { futureYouSilhouettesForGender } from "@/lib/futureYouSilhouettes";
import {
  FUTURE_YOU_PANEL_BG,
} from "@/lib/futureYouTokens";

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
    maxHeight,
    borderRadius: PANEL_RADIUS,
    ...panelCornerStyle,
    overflow: "hidden",
    backgroundColor: uri ? colors.card : FUTURE_YOU_PANEL_BG,
    borderWidth: isAfter ? 1 : StyleSheet.hairlineWidth,
    borderColor: isAfter ? ob.gold : colors.border,
  };

  const panel = (
    <View style={shellStyle}>
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : silhouetteSource ? (
        <View style={[StyleSheet.absoluteFill, { justifyContent: "flex-end" }]}>
          <Image
            source={silhouetteSource}
            style={{ width: "100%", height: "92%" }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
      ) : null}
    </View>
  );

  if (!isAfter) return panel;

  return (
    <View
      style={{
        width: "100%",
        borderRadius: PANEL_RADIUS,
        ...panelCornerStyle,
        shadowColor: ob.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.32,
        shadowRadius: 11,
        elevation: 4,
      }}
    >
      {panel}
    </View>
  );
}

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
      <View className="min-h-0 flex-1 justify-center pt-6">
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
                  <Pressable onPress={onClearPhoto} disabled={!canUpload} className="py-1">
                    <Text className="text-sm font-medium" style={{ color: ob.gold }}>
                      Remove photo
                    </Text>
                  </Pressable>
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
      </View>

      {!blocked ? (
        <View className="mt-5 shrink-0">
          <Text className="mb-3 text-center text-sm" style={{ color: colors.textSecondary }}>
            Your photo is only used to create your Future You, never shared or sold.
          </Text>

          <Pressable
            testID={consentTestID}
            onPress={() => {
              const checked = !aiConsentChecked;
              setAiConsentChecked(checked);
              if (checked) onGrantAiConsent();
            }}
            disabled={uploading}
            className="mb-4 flex-row items-start gap-3"
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
          </Pressable>

          {canRetry ? (
            <Pressable
              onPress={() => void onRetryUpload()}
              disabled={!canUpload}
              className="items-center rounded-full py-4"
              style={{ backgroundColor: canUpload ? ob.gold : colors.border }}
            >
              <Text className="text-base font-semibold" style={{ color: ob.goldOn }}>
                Try again
              </Text>
            </Pressable>
          ) : awaitingConfirm ? (
            <Pressable
              testID={confirmTestID}
              onPress={onConfirmClick}
              disabled={!canUpload || !confirmReady}
              className="items-center rounded-full py-4"
              style={{
                backgroundColor: canUpload && confirmReady ? ob.gold : colors.border,
                opacity: canUpload && confirmReady ? 1 : 0.6,
              }}
            >
              <Text className="text-base font-semibold" style={{ color: ob.goldOn }}>
                Use this photo →
              </Text>
            </Pressable>
          ) : (
            <View className="gap-2">
              <Pressable
                onPress={() => void onPickFromCamera()}
                disabled={!canUpload}
                className="items-center rounded-full py-4"
                style={{ backgroundColor: canUpload ? ob.gold : colors.border }}
              >
                <Text className="text-base font-semibold" style={{ color: ob.goldOn }}>
                  {uploading ? "Uploading…" : "Take a photo"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void onPickFromGallery()}
                disabled={!canUpload}
                className="items-center rounded-full border py-4"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
                  Choose from gallery
                </Text>
              </Pressable>
            </View>
          )}

          {uploadError ? (
            <Text className="mt-3 text-center text-sm" style={{ color: "#f87171" }}>
              {uploadError}
            </Text>
          ) : null}
        </View>
      ) : null}

      <FutureYouLegalFooter className="mt-4 shrink-0" />
    </View>
  );
}
