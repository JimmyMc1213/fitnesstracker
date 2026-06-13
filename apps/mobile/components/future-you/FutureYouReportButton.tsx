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
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { submitFutureYouReport } from "@/lib/futureYouReportService";

type Props = {
  jobId?: string;
  context: FutureYouReportContext;
  previewMode?: boolean;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

export function FutureYouReportButton({ jobId, context, previewMode = false }: Props) {
  const { colors } = useAppTheme();
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
        className="items-center py-2"
      >
        <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
          {FUTURE_YOU_REPORT_TRIGGER_LABEL}
        </Text>
      </Pressable>

      <Modal visible={sheetOpen} transparent animationType="fade" onRequestClose={closeSheet}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <Pressable className="flex-1" onPress={closeSheet} accessibilityLabel="Close report sheet" />
          <View
            testID="future-you-report-sheet"
            className="max-h-[85%] rounded-t-2xl px-6 pb-8 pt-6"
            style={{ backgroundColor: colors.card }}
          >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                {FUTURE_YOU_REPORT_SHEET_TITLE}
              </Text>

              {submitState === "success" ?
                <>
                  <Text
                    className="mt-3 text-sm leading-5"
                    style={{ color: colors.textSecondary }}
                    accessibilityRole="text"
                  >
                    {FUTURE_YOU_REPORT_SUCCESS_MESSAGE}
                  </Text>
                  <View className="mt-6">
                    <PrimaryButton block onPress={closeSheet}>
                      Done
                    </PrimaryButton>
                  </View>
                </>
              : <>
                  <Text className="mt-3 text-sm leading-5" style={{ color: colors.textSecondary }}>
                    {FUTURE_YOU_REPORT_SHEET_BODY}
                  </Text>

                  <Text className="mb-2 mt-5 text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    What went wrong?
                  </Text>
                  {FUTURE_YOU_REPORT_CATEGORY_OPTIONS.map((option) => (
                    <Pressable
                      key={option.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: category === option.id }}
                      onPress={() => setCategory(option.id)}
                      className="mb-2 flex-row items-center gap-3 rounded-xl border px-3 py-3"
                      style={{
                        borderColor: category === option.id ? colors.accent : colors.border,
                        backgroundColor: category === option.id ? `${colors.accent}12` : "transparent",
                      }}
                    >
                      <View
                        className="h-5 w-5 items-center justify-center rounded-full border"
                        style={{ borderColor: category === option.id ? colors.accent : colors.border }}
                      >
                        {category === option.id ?
                          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />
                        : null}
                      </View>
                      <Text className="flex-1 text-sm" style={{ color: colors.textPrimary }}>
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}

                  <Text className="mb-2 mt-4 text-sm font-semibold" style={{ color: colors.textPrimary }}>
                    Details (optional)
                  </Text>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Anything else we should know?"
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    maxLength={FUTURE_YOU_REPORT_MESSAGE_MAX}
                    className="min-h-[88px] rounded-xl border px-3 py-3 text-sm"
                    style={{
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      textAlignVertical: "top",
                    }}
                  />

                  {submitState === "error" && errorMessage ?
                    <Text className="mt-3 text-sm" style={{ color: "#FF453A" }} accessibilityRole="alert">
                      {errorMessage}
                    </Text>
                  : null}

                  <View className="mt-6">
                    <PrimaryButton
                      block
                      disabled={submitState === "submitting"}
                      onPress={() => void onSubmit()}
                    >
                      {submitState === "submitting" ? "Sending…" : FUTURE_YOU_REPORT_SUBMIT_LABEL}
                    </PrimaryButton>
                    {submitState === "submitting" ?
                      <ActivityIndicator className="mt-3" color={colors.accent} />
                    : null}
                  </View>
                </>
              }
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
