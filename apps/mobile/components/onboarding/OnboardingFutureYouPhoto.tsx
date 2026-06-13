import type { UserGender } from "@newyouai/types";
import { useEffect, useRef, useState } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";

import { FutureYouLegalFooter } from "@/components/future-you/FutureYouLegalFooter";
import { useAppTheme } from "@/hooks/useAppTheme";
import { isFutureYouPhotoBlocked } from "@/lib/futureYouAge";
import { FUTURE_YOU_PRIVACY_POLICY_URL, PAYWALL_TERMS_URL } from "@/lib/futureYouLegal";

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

function PhotoPanel({
  uri,
  placeholderLabel,
  variant = "before",
}: {
  uri?: string | null;
  placeholderLabel?: string;
  variant?: "before" | "after";
}) {
  const { colors } = useAppTheme();

  return (
    <View
      className="aspect-[3/4] flex-1 items-center justify-center overflow-hidden rounded-2xl border"
      style={{
        borderColor: colors.border,
        backgroundColor: variant === "after" ? `${colors.accent}18` : colors.card,
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : placeholderLabel ? (
        <Text className="text-xs font-medium uppercase tracking-wide" style={{ color: colors.textTertiary }}>
          {placeholderLabel}
        </Text>
      ) : null}
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
  const suppressConfirmClickRef = useRef(false);
  const [aiConsentChecked, setAiConsentChecked] = useState(Boolean(photoAiConsentAt));
  const [confirmReady, setConfirmReady] = useState(false);
  const blocked = isFutureYouPhotoBlocked(age);
  const hasPhoto = Boolean(photoPreview || photoSaved);
  const canRetry = Boolean(uploadError && hasPhoto);
  const canUpload = aiConsentChecked && !uploading && !blocked;
  const awaitingConfirm = Boolean(photoPreview && !photoSaved && !canRetry);

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

  const afterLabel = gender === "male" ? "Future you" : "Future you";

  return (
    <View>
      <View className="relative">
        <View className={`flex-row items-center gap-2${blocked ? " opacity-40" : ""}`}>
          <View className="flex-1">
            <PhotoPanel uri={photoPreview} placeholderLabel="You" />
            {hasPhoto && !uploading && !blocked ? (
              <Pressable onPress={onClearPhoto} disabled={!canUpload} className="mt-2 items-center py-1">
                <Text className="text-sm" style={{ color: colors.accent }}>
                  Remove photo
                </Text>
              </Pressable>
            ) : (
              <View className="mt-2 h-7" />
            )}
          </View>
          <Text style={{ color: colors.textTertiary }}>→</Text>
          <PhotoPanel placeholderLabel={afterLabel} variant="after" />
        </View>

        {blocked ? (
          <View
            className="absolute inset-0 items-center justify-center rounded-2xl px-6"
            style={{ backgroundColor: `${colors.background}cc` }}
          >
            <Text className="text-center text-base font-semibold" style={{ color: colors.textPrimary }}>
              Future You is only for users 18+.
            </Text>
          </View>
        ) : null}
      </View>

      {!blocked ? (
        <View className="mt-5">
          <Text className="mb-3 text-center text-sm" style={{ color: colors.textSecondary }}>
            Your photo is only used to create your Future You — never shared or sold.
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
                borderColor: aiConsentChecked ? colors.accent : colors.border,
                backgroundColor: aiConsentChecked ? colors.accent : "transparent",
              }}
            >
              {aiConsentChecked ? (
                <Text className="text-xs font-bold" style={{ color: colors.accentText }}>
                  ✓
                </Text>
              ) : null}
            </View>
            <Text className="flex-1 text-sm leading-5" style={{ color: colors.textPrimary }}>
              My photo will be processed by AI to generate my transformation.{" "}
              <Text
                style={{ color: colors.accent }}
                onPress={() => void Linking.openURL(FUTURE_YOU_PRIVACY_POLICY_URL)}
              >
                Privacy Policy
              </Text>
              {" · "}
              <Text style={{ color: colors.accent }} onPress={() => void Linking.openURL(PAYWALL_TERMS_URL)}>
                Terms
              </Text>
            </Text>
          </Pressable>

          {canRetry ? (
            <Pressable
              onPress={() => void onRetryUpload()}
              disabled={!canUpload}
              className="items-center rounded-full py-4"
              style={{ backgroundColor: canUpload ? colors.accent : colors.border }}
            >
              <Text className="text-base font-semibold" style={{ color: colors.accentText }}>
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
                backgroundColor: canUpload && confirmReady ? colors.accent : colors.border,
                opacity: canUpload && confirmReady ? 1 : 0.6,
              }}
            >
              <Text className="text-base font-semibold" style={{ color: colors.accentText }}>
                Use this photo →
              </Text>
            </Pressable>
          ) : (
            <View className="gap-2">
              <Pressable
                onPress={() => void onPickFromCamera()}
                disabled={!canUpload}
                className="items-center rounded-full py-4"
                style={{ backgroundColor: canUpload ? colors.accent : colors.border }}
              >
                <Text className="text-base font-semibold" style={{ color: colors.accentText }}>
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

      <FutureYouLegalFooter className="mt-4" />
    </View>
  );
}
