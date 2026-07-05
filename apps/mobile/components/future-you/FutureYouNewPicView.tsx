import {
  FUTURE_YOU_DETAIL_BACK_LABEL,
  FUTURE_YOU_PAGE_GENERATE_LABEL,
  FUTURE_YOU_PAGE_SHEET_TITLE_MOTIVATION,
  FUTURE_YOU_PAGE_SHEET_TITLE_PHOTO,
} from "@newyouai/core";
import type { FutureYouJobStatus, NutritionGoal, UserGender } from "@newyouai/types";
import { Text, View } from "react-native";
import { HapticPressable as Pressable } from "@/components/ui/HapticPressable";
import { FutureYouGenerationLoadingView } from "@/components/future-you/FutureYouGenerationLoadingView";
import { PrimaryButton } from "@/components/home/PrimaryButton";
import { OnboardingFutureYouMotivation } from "@/components/onboarding/OnboardingFutureYouMotivation";
import { OnboardingFutureYouPhoto } from "@/components/onboarding/OnboardingFutureYouPhoto";
import { useAppTheme } from "@/hooks/useAppTheme";
import { futureYouRevealPlaceholderSource } from "@/lib/futureYouRevealPlaceholder";

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
  generationStatus: FutureYouJobStatus | "idle";
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
  generationStatus,
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
  const showGenerationLoading = generating || generationActive;
  const title = step === "photo" ? FUTURE_YOU_PAGE_SHEET_TITLE_PHOTO : FUTURE_YOU_PAGE_SHEET_TITLE_MOTIVATION;
  const generateDisabled = !motivationId || showGenerationLoading;
  const generateLabel =
    generating ? "Creating your Future You… (up to 2 min)"
    : generationActive ? "Creating your Future You…"
    : FUTURE_YOU_PAGE_GENERATE_LABEL;
  const placeholderSource = futureYouRevealPlaceholderSource(gender);

  if (showGenerationLoading) {
    return (
      <View testID="future-you-upload-photo" className="mt-1 flex-1">
        <View className="flex-row items-center gap-2 px-4 pb-1 pt-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Leave and keep generating in the background"
            onPress={onClose}
            hitSlop={10}
            className="py-1.5"
          >
            <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              ← {FUTURE_YOU_DETAIL_BACK_LABEL}
            </Text>
          </Pressable>
          <Text
            className="min-w-0 flex-1 text-right text-xs"
            style={{ color: colors.textSecondary }}
          >
            Keeps going if you leave
          </Text>
        </View>
        <FutureYouGenerationLoadingView
          fill
          goal={goal}
          gender={gender}
          motivationId={motivationId}
          generationStatus={generationStatus}
          imageUri={photoPreview}
          placeholderSource={placeholderSource}
        />
      </View>
    );
  }

  return (
    <View testID="future-you-upload-photo" className="mt-1 flex-1">
      <View
        className="flex-row items-center gap-2 border-b px-4 pb-2 pt-3"
        style={{ borderColor: colors.border }}
      >
        <View className="min-w-[4.5rem]">
          {step === "motivation" ?
            <Pressable accessibilityRole="button" onPress={onBackToPhoto} className="py-1.5">
              <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                Back
              </Text>
            </Pressable>
          : <Pressable accessibilityRole="button" onPress={onClose} className="py-1.5">
              <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                ← {FUTURE_YOU_DETAIL_BACK_LABEL}
              </Text>
            </Pressable>
          }
        </View>
        <Text
          className="min-w-0 flex-1 text-center text-base font-bold tracking-tight"
          style={{ color: colors.textPrimary }}
        >
          {title}
        </Text>
        <View className="min-w-[4.5rem]" />
      </View>

      <View className={step === "photo" ? "flex-1 pt-3" : "gap-4 pt-3"}>
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
    </View>
  );
}
