import {
  FEATURE_REQUEST_INPUT_LABEL,
  FEATURE_REQUEST_INPUT_PLACEHOLDER,
  FEATURE_REQUEST_SHEET_BODY,
  FEATURE_REQUEST_SHEET_TITLE,
  FEATURE_REQUEST_SUBMIT_LABEL,
  FEATURE_REQUEST_SUCCESS_MESSAGE,
  ISSUE_REPORT_ERROR_MESSAGE,
  ISSUE_REPORT_MESSAGE_MAX,
} from "@newyouai/core";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { CenterDialog } from "@/components/motion";
import { AlignedTextInput } from "@/components/ui/AlignedTextInput";
import { OnboardingContinueButton } from "@/components/onboarding/OnboardingContinueButton";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { submitIssueReport } from "@/lib/issueReportService";

type Props = {
  open: boolean;
  onClose: () => void;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const FEATURE_REQUEST_DIALOG_PANEL = {
  padding: 0,
  maxWidth: 360,
  width: "100%" as const,
  maxHeight: "85%" as const,
};

const CONTENT_PADDING = 24;
const SECTION_GAP = 20;
const FIELD_GAP = 10;
const HEADER_GAP = 10;

export function RequestFeatureDialog({ open, onClose }: Props) {
  const { colors, ob } = useOnboardingTheme();
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedMessage = message.trim();
  const canSubmit = trimmedMessage.length > 0 && submitState !== "submitting";

  function resetForm() {
    setMessage("");
    setSubmitState("idle");
    setErrorMessage(null);
  }

  function closeDialog() {
    onClose();
    resetForm();
  }

  async function onSubmit() {
    if (!trimmedMessage) return;

    setSubmitState("submitting");
    setErrorMessage(null);
    try {
      await submitIssueReport({
        category: "feature",
        message: trimmedMessage,
      });
      setSubmitState("success");
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(error instanceof Error ? error.message : ISSUE_REPORT_ERROR_MESSAGE);
    }
  }

  return (
    <CenterDialog open={open} onClose={closeDialog} panelStyle={FEATURE_REQUEST_DIALOG_PANEL}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          testID="feature-request-sheet"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: CONTENT_PADDING,
            paddingTop: CONTENT_PADDING,
            paddingBottom: CONTENT_PADDING,
          }}
        >
          {submitState === "success" ?
            <View style={{ gap: SECTION_GAP }}>
              <View style={{ gap: HEADER_GAP }}>
                <Text
                  className="text-lg font-bold tracking-tight"
                  style={{ color: colors.textPrimary }}
                >
                  {FEATURE_REQUEST_SHEET_TITLE}
                </Text>
                <Text
                  className="text-sm leading-[1.5]"
                  style={{ color: colors.textSecondary }}
                  accessibilityRole="text"
                >
                  {FEATURE_REQUEST_SUCCESS_MESSAGE}
                </Text>
              </View>
              <OnboardingContinueButton label="Done" onPress={closeDialog} />
            </View>
          : <View style={{ gap: SECTION_GAP }}>
              <View style={{ gap: HEADER_GAP }}>
                <Text
                  className="text-lg font-bold tracking-tight"
                  style={{ color: colors.textPrimary }}
                >
                  {FEATURE_REQUEST_SHEET_TITLE}
                </Text>
                <Text className="text-sm leading-[1.5]" style={{ color: colors.textSecondary }}>
                  {FEATURE_REQUEST_SHEET_BODY}
                </Text>
              </View>

              <View style={{ gap: FIELD_GAP }}>
                <Text className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
                  {FEATURE_REQUEST_INPUT_LABEL}
                </Text>
                <AlignedTextInput
                  testID="feature-request-message"
                  value={message}
                  onChangeText={setMessage}
                  placeholder={FEATURE_REQUEST_INPUT_PLACEHOLDER}
                  placeholderTextColor={ob.mutedFg}
                  multiline
                  multilineMinHeight={120}
                  editable={submitState !== "submitting"}
                  maxLength={ISSUE_REPORT_MESSAGE_MAX}
                  shellStyle={{
                    borderColor: ob.inputBorder,
                    backgroundColor: ob.optionBg,
                    paddingHorizontal: 14,
                  }}
                  inputStyle={{ color: colors.textPrimary }}
                  style={{ fontSize: 15, lineHeight: 22 }}
                />
              </View>

              {submitState === "error" && errorMessage ?
                <Text
                  className="text-[13px] leading-[1.5]"
                  style={{ color: "#dc2626", marginTop: -8 }}
                  accessibilityRole="alert"
                >
                  {errorMessage}
                </Text>
              : null}

              <View style={{ gap: 12 }}>
                <OnboardingContinueButton
                  label={submitState === "submitting" ? "Sending…" : FEATURE_REQUEST_SUBMIT_LABEL}
                  disabled={!canSubmit}
                  tone="gold"
                  onPress={() => void onSubmit()}
                />
                {submitState === "submitting" ?
                  <ActivityIndicator color={colors.textPrimary} />
                : null}
              </View>
            </View>
          }
        </ScrollView>
      </KeyboardAvoidingView>
    </CenterDialog>
  );
}
