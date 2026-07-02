import {
  EMAIL_ACCOUNT_SHEET_TITLE,
  EMAIL_CHANGE_REQUEST_BODY,
  EMAIL_CHANGE_REQUEST_INPUT_LABEL,
  EMAIL_CHANGE_REQUEST_INPUT_PLACEHOLDER,
  EMAIL_CHANGE_REQUEST_LINK,
  EMAIL_CHANGE_REQUEST_SUBMIT_LABEL,
  EMAIL_CHANGE_REQUEST_SUCCESS_MESSAGE,
  EMAIL_CHANGE_REQUEST_TITLE,
  formatEmailChangeRequestMessage,
  ISSUE_REPORT_ERROR_MESSAGE,
  ISSUE_REPORT_MESSAGE_MAX,
} from "@newyouai/core";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { CenterDialog } from "@/components/motion";
import { OnboardingContinueButton } from "@/components/onboarding/OnboardingContinueButton";
import { AlignedTextInput } from "@/components/ui/AlignedTextInput";
import { PressableScale } from "@/components/ui/PressableScale";
import { useOnboardingTheme } from "@/hooks/useOnboardingTheme";
import { submitIssueReport } from "@/lib/issueReportService";

type Props = {
  open: boolean;
  email: string;
  onClose: () => void;
};

type Step = "view" | "request" | "success";
type SubmitState = "idle" | "submitting" | "error";

const DIALOG_PANEL = {
  padding: 0,
  maxWidth: 360,
  width: "100%" as const,
  maxHeight: "85%" as const,
};

const CONTENT_PADDING = 24;
const SECTION_GAP = 20;
const FIELD_GAP = 10;

export function EmailAccountDialog({ open, email, onClose }: Props) {
  const { colors, ob } = useOnboardingTheme();
  const [step, setStep] = useState<Step>("view");
  const [reason, setReason] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedReason = reason.trim();
  const canSubmit = trimmedReason.length > 0 && submitState !== "submitting";

  useEffect(() => {
    if (!open) {
      setStep("view");
      setReason("");
      setSubmitState("idle");
      setErrorMessage(null);
    }
  }, [open]);

  function closeDialog() {
    onClose();
  }

  async function onSubmit() {
    if (!trimmedReason) return;

    setSubmitState("submitting");
    setErrorMessage(null);
    try {
      await submitIssueReport({
        category: "email-change",
        message: formatEmailChangeRequestMessage(email, trimmedReason),
      });
      setStep("success");
      setSubmitState("idle");
    } catch (error) {
      setSubmitState("error");
      setErrorMessage(error instanceof Error ? error.message : ISSUE_REPORT_ERROR_MESSAGE);
    }
  }

  return (
    <CenterDialog open={open} onClose={closeDialog} panelStyle={DIALOG_PANEL}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          testID="email-account-sheet"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: CONTENT_PADDING,
            paddingTop: CONTENT_PADDING,
            paddingBottom: CONTENT_PADDING,
          }}
        >
          {step === "view" ?
            <View style={{ gap: SECTION_GAP }}>
              <Text className="text-lg font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                {EMAIL_ACCOUNT_SHEET_TITLE}
              </Text>
              <Text
                testID="email-account-current-email"
                className="text-[15px] leading-[1.5]"
                style={{ color: colors.textPrimary }}
              >
                {email}
              </Text>
              <PressableScale
                testID="email-account-change-link"
                accessibilityRole="button"
                onPress={() => setStep("request")}
                activeScale={0.98}
              >
                <Text
                  className="text-sm"
                  style={{
                    color: colors.textSecondary,
                    textDecorationLine: "underline",
                  }}
                >
                  {EMAIL_CHANGE_REQUEST_LINK}
                </Text>
              </PressableScale>
            </View>
          : step === "success" ?
            <View style={{ gap: SECTION_GAP }}>
              <Text className="text-lg font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                {EMAIL_CHANGE_REQUEST_TITLE}
              </Text>
              <Text className="text-sm leading-[1.5]" style={{ color: colors.textSecondary }}>
                {EMAIL_CHANGE_REQUEST_SUCCESS_MESSAGE}
              </Text>
              <OnboardingContinueButton label="Done" onPress={closeDialog} />
            </View>
          : <View style={{ gap: SECTION_GAP }}>
              <Text className="text-lg font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                {EMAIL_CHANGE_REQUEST_TITLE}
              </Text>
              <Text className="text-sm leading-[1.5]" style={{ color: colors.textSecondary }}>
                {EMAIL_CHANGE_REQUEST_BODY}
              </Text>

              <View style={{ gap: FIELD_GAP }}>
                <Text className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
                  {EMAIL_CHANGE_REQUEST_INPUT_LABEL}
                </Text>
                <AlignedTextInput
                  testID="email-change-request-message"
                  value={reason}
                  onChangeText={setReason}
                  placeholder={EMAIL_CHANGE_REQUEST_INPUT_PLACEHOLDER}
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
                  label={submitState === "submitting" ? "Sending…" : EMAIL_CHANGE_REQUEST_SUBMIT_LABEL}
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
