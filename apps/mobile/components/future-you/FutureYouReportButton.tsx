import {
  FUTURE_YOU_REPORT_CATEGORY_OPTIONS,
  FUTURE_YOU_REPORT_ERROR_MESSAGE,
  FUTURE_YOU_REPORT_MESSAGE_MAX,
  FUTURE_YOU_REPORT_SHEET_BODY,
  FUTURE_YOU_REPORT_SHEET_TITLE,
  FUTURE_YOU_REPORT_SUBMIT_LABEL,
  FUTURE_YOU_REPORT_SUCCESS_MESSAGE,
  FUTURE_YOU_REPORT_TRIGGER_LABEL,
  type FutureYouReportCategory,
  type FutureYouReportContext,
} from "@newyouai/core";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { CenterDialog } from "@/components/motion";
import { AlignedTextInput } from "@/components/ui/AlignedTextInput";
import { OnboardingContinueButton } from "@/components/onboarding/OnboardingContinueButton";
import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import {
  ONBOARDING_OPTION_GAP,
  onboardingOptionColors,
} from "@/lib/onboardingTheme";
import { submitFutureYouReport } from "@/lib/futureYouReportService";

type Props = {
  jobId?: string;
  context: FutureYouReportContext;
  previewMode?: boolean;
  onReported?: (jobId: string) => void;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const REPORT_DIALOG_PANEL = {
  padding: 0,
  maxWidth: 360,
  maxHeight: "85%" as const,
};

export function FutureYouReportButton({ jobId, context, previewMode = false, onReported }: Props) {
  const { colors, ob } = useOnboardingTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [category, setCategory] = useState<FutureYouReportCategory>("not_accurate");
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function resetForm() {
    setCategory("not_accurate");
    setMessage("");
    setSubmitState("idle");
    setErrorMessage(null);
  }

  function closeSheet() {
    setSheetOpen(false);
    resetForm();
  }

  async function onSubmit() {
    setSubmitState("submitting");
    setErrorMessage(null);
    try {
      await submitFutureYouReport(
        {
          jobId,
          context,
          category,
          message: message.trim() || undefined,
        },
        { previewMode },
      );
      setSubmitState("success");
      if (jobId?.trim()) onReported?.(jobId.trim());
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(error instanceof Error ? error.message : FUTURE_YOU_REPORT_ERROR_MESSAGE);
    }
  }

  return (
    <>
      <Pressable
        testID="future-you-report-trigger"
        accessibilityRole="button"
        onPress={() => {
          resetForm();
          setSheetOpen(true);
        }}
        className="items-center py-1"
      >
        <Text
          className="text-xs font-medium"
          style={{
            color: ob.mutedFg,
            textDecorationLine: "underline",
            textDecorationColor: ob.mutedFg,
          }}
        >
          {FUTURE_YOU_REPORT_TRIGGER_LABEL}
        </Text>
      </Pressable>

      <CenterDialog open={sheetOpen} onClose={closeSheet} panelStyle={REPORT_DIALOG_PANEL}>
        <ScrollView
          testID="future-you-report-sheet"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20 }}
        >
          <Text className="text-lg font-bold tracking-tight" style={{ color: colors.textPrimary }}>
            {FUTURE_YOU_REPORT_SHEET_TITLE}
          </Text>

          {submitState === "success" ?
            <>
              <Text
                className="mt-3 text-sm leading-[1.45]"
                style={{ color: colors.textSecondary }}
                accessibilityRole="text"
              >
                {FUTURE_YOU_REPORT_SUCCESS_MESSAGE}
              </Text>
              <View className="mt-5">
                <OnboardingContinueButton label="Done" onPress={closeSheet} />
              </View>
            </>
          : <>
              <Text className="mt-3 text-sm leading-[1.45]" style={{ color: colors.textSecondary }}>
                {FUTURE_YOU_REPORT_SHEET_BODY}
              </Text>

              <Text className="mb-1 mt-4 text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
                What went wrong?
              </Text>
              <View style={{ gap: ONBOARDING_OPTION_GAP, marginBottom: 16 }}>
                {FUTURE_YOU_REPORT_CATEGORY_OPTIONS.map((option) => {
                  const selected = category === option.id;
                  const optionColors = onboardingOptionColors(ob, selected);
                  return (
                    <PressableScale
                      key={option.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => setCategory(option.id)}
                      activeScale={0.98}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        borderColor: optionColors.borderColor,
                        backgroundColor: optionColors.backgroundColor,
                      }}
                    >
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 999,
                          borderWidth: 2,
                          borderColor: selected ? optionColors.color : ob.optionBorder,
                        }}
                      >
                        {selected ?
                          <View
                            style={{
                              height: 10,
                              width: 10,
                              borderRadius: 999,
                              backgroundColor: optionColors.color,
                            }}
                          />
                        : null}
                      </View>
                      <Text
                        className={`flex-1 text-sm leading-[1.4] ${selected ? "font-semibold" : "font-medium"}`}
                        style={{ color: optionColors.color }}
                      >
                        {option.label}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              <Text className="mb-1.5 text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
                Details (optional)
              </Text>
              <AlignedTextInput
                testID="future-you-report-message"
                value={message}
                onChangeText={setMessage}
                placeholder="Anything else we should know?"
                placeholderTextColor={ob.mutedFg}
                multiline
                multilineMinHeight={88}
                editable={submitState !== "submitting"}
                maxLength={FUTURE_YOU_REPORT_MESSAGE_MAX}
                shellStyle={{
                  borderColor: ob.inputBorder,
                  backgroundColor: ob.optionBg,
                }}
                inputStyle={{ color: colors.textPrimary }}
                style={{ fontSize: 14, lineHeight: 20 }}
              />

              {submitState === "error" && errorMessage ?
                <Text className="mt-3 text-[13px] leading-[1.45]" style={{ color: "#dc2626" }} accessibilityRole="alert">
                  {errorMessage}
                </Text>
              : null}

              <View className="mt-5">
                <OnboardingContinueButton
                  label={submitState === "submitting" ? "Sending…" : FUTURE_YOU_REPORT_SUBMIT_LABEL}
                  disabled={submitState === "submitting"}
                  onPress={() => void onSubmit()}
                />
                {submitState === "submitting" ?
                  <ActivityIndicator className="mt-3" color={colors.textPrimary} />
                : null}
              </View>
            </>
          }
        </ScrollView>
      </CenterDialog>
    </>
  );
}
