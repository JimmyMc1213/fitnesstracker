import {
  FUTURE_YOU_DETAIL_BACK_LABEL,
  FUTURE_YOU_PAGE_GENERATE_LABEL,
  FUTURE_YOU_PAGE_SHEET_TITLE_MOTIVATION,
  FUTURE_YOU_PAGE_SHEET_TITLE_PHOTO,
} from "@newyouai/core";
import type { NutritionGoal, UserGender } from "@newyouai/types";
import { Pressable, Text, View } from "react-native";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { OnboardingFutureYouMotivation } from "@/components/onboarding/OnboardingFutureYouMotivation";
import { OnboardingFutureYouPhoto } from "@/components/onboarding/OnboardingFutureYouPhoto";
import { useAppTheme } from "@/hooks/useAppTheme";

export type FutureYouNewPicStep = "photo" | "motivation";

type Props = {
  step: FutureYouNewPicStep;
  goal: NutritionGoal;
  gender: UserGender | undefined;
  age: number | null;
  photoPreview: string | null;
  photoSaved: boolean;
  photoAiConsentAt: string | undefined;
  motivationId: string | undefined;
  uploading: boolean;
  uploadError: string | null;
  generating: boolean;
  generationActive: boolean;
  generateError: string | null;
  onClose: () => void;
  onBackToPhoto: () => void;
  onPickFromCamera: () => void | Promise<void>;
  onPickFromGallery: () => void | Promise<void>;
  onConfirmPhoto: () => void | Promise<void>;
  onRetryUpload: () => void | Promise<void>;
  onClearPhoto: () => void;
  onGrantAiConsent: () => void;
  onSelectMotivation: (motivationId: string, isGeneric: boolean) => void;
  onGenerate: () => void | Promise<void>;
};

export function FutureYouNewPicView({
  step,
  goal,
  gender,
  age,
  photoPreview,
  photoSaved,
  photoAiConsentAt,
  motivationId,
  uploading,
  uploadError,
  generating,
  generationActive,
  generateError,
  onClose,
  onBackToPhoto,
  onPickFromCamera,
  onPickFromGallery,
  onConfirmPhoto,
  onRetryUpload,
  onClearPhoto,
  onGrantAiConsent,
  onSelectMotivation,
  onGenerate,
}: Props) {
  const { colors } = useAppTheme();
  const title = step === "photo" ? FUTURE_YOU_PAGE_SHEET_TITLE_PHOTO : FUTURE_YOU_PAGE_SHEET_TITLE_MOTIVATION;
  const generateDisabled = !motivationId || generating || generationActive;
  const generateLabel =
    generating ? "Starting…"
    : generationActive ? "Creating your Future You…"
    : FUTURE_YOU_PAGE_GENERATE_LABEL;

  return (
    <View testID="future-you-upload-photo" className="mt-[18px] gap-4">
      <View className="flex-row items-center justify-between">
        {step === "motivation" ?
          <Pressable accessibilityRole="button" onPress={onBackToPhoto} className="py-1">
            <Text className="text-base font-semibold" style={{ color: colors.accent }}>
              Back
            </Text>
          </Pressable>
        : <Pressable accessibilityRole="button" onPress={onClose} className="py-1">
            <Text className="text-base font-semibold" style={{ color: colors.accent }}>
              ← {FUTURE_YOU_DETAIL_BACK_LABEL}
            </Text>
          </Pressable>
        }
        <Text className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
          {title}
        </Text>
        <View className="w-16" />
      </View>

      {step === "photo" ?
        <OnboardingFutureYouPhoto
          gender={gender}
          age={age}
          photoPreview={photoPreview}
          photoSaved={photoSaved}
          photoAiConsentAt={photoAiConsentAt}
          uploading={uploading}
          uploadError={uploadError}
          onPickFromCamera={onPickFromCamera}
          onPickFromGallery={onPickFromGallery}
          onConfirmPhoto={onConfirmPhoto}
          onRetryUpload={onRetryUpload}
          onClearPhoto={onClearPhoto}
          onGrantAiConsent={onGrantAiConsent}
          consentTestID="future-you-consent-checkbox"
          confirmTestID="future-you-upload-confirm"
        />
      : <View
          className="rounded-[14px] border p-[18px] gap-4"
          style={{ borderColor: colors.border, backgroundColor: colors.card }}
        >
          <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
            Choose the transformation you&apos;re working toward.
          </Text>
          <OnboardingFutureYouMotivation
            goal={goal}
            gender={gender ?? "other"}
            selectedId={motivationId}
            onSelect={onSelectMotivation}
          />
          {generateError ?
            <Text
              accessibilityRole="alert"
              className="text-sm leading-5"
              style={{ color: "#f87171" }}
            >
              {generateError}
            </Text>
          : null}
          <PrimaryButton
            block
            testID="future-you-upload-generate"
            disabled={generateDisabled}
            onPress={() => void onGenerate()}
          >
            {generateLabel}
          </PrimaryButton>
        </View>
      }
    </View>
  );
}
