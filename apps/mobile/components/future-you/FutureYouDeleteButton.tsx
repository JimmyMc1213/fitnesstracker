import {
  FUTURE_YOU_DELETE_CANCEL_LABEL,
  FUTURE_YOU_DELETE_CONFIRM_LABEL,
  FUTURE_YOU_DELETE_CONFIRM_MESSAGE,
  FUTURE_YOU_DELETE_CONFIRM_TITLE,
  FUTURE_YOU_DELETE_ERROR_MESSAGE,
  FUTURE_YOU_DELETE_FINAL_BODY,
  FUTURE_YOU_DELETE_FINAL_CONFIRM_LABEL,
  FUTURE_YOU_DELETE_FINAL_TITLE,
  FUTURE_YOU_DELETE_TRIGGER_LABEL,
  futureYouDeleteCooldownNotice,
  msUntilFutureYouRedoEligible,
} from "@newyouai/core";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { FutureYouDeleteConfirmSheet } from "@/components/future-you/FutureYouDeleteConfirmSheet";
import { useAppTheme } from "@/hooks/useAppTheme";
import { deleteFutureYou } from "@/lib/futureYouDeleteService";

type Props = {
  /** When set, deletes only this preview; otherwise wipes all Future You data. */
  jobId?: string;
  /** ISO timestamp for the 2-week redo window, preserved on delete so cooldown stays active. */
  redoAnchorIso?: string;
  onDeleted: () => void;
};

type ConfirmStep = "initial" | "final";

export function FutureYouDeleteButton({ jobId, redoAnchorIso, onDeleted }: Props) {
  const { colors } = useAppTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmStep, setConfirmStep] = useState<ConfirmStep>("initial");
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const msUntilRedo = useMemo(
    () => msUntilFutureYouRedoEligible(redoAnchorIso),
    [redoAnchorIso],
  );
  const cooldownNotice = futureYouDeleteCooldownNotice(msUntilRedo);

  function closeConfirm() {
    if (busy) return;
    setConfirmOpen(false);
    setConfirmStep("initial");
    setErrorMessage(null);
  }

  function onFirstConfirm() {
    setErrorMessage(null);
    setConfirmStep("final");
  }

  async function onFinalConfirm() {
    setBusy(true);
    setErrorMessage(null);
    try {
      await deleteFutureYou(jobId);
      closeConfirm();
      onDeleted();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : FUTURE_YOU_DELETE_ERROR_MESSAGE);
    } finally {
      setBusy(false);
    }
  }

  const sheetTitle =
    confirmStep === "initial" ? FUTURE_YOU_DELETE_CONFIRM_TITLE : FUTURE_YOU_DELETE_FINAL_TITLE;
  const sheetMessage =
    confirmStep === "initial" ? (
      <View>
        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
          {FUTURE_YOU_DELETE_CONFIRM_MESSAGE}
        </Text>
        {errorMessage ? (
          <Text className="mt-3 text-[13px]" style={{ color: "#FF453A" }}>
            {errorMessage}
          </Text>
        ) : null}
      </View>
    ) : (
      <View>
        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
          {FUTURE_YOU_DELETE_FINAL_BODY}
        </Text>
        {cooldownNotice ? (
          <Text className="mt-3 text-sm font-semibold" style={{ color: colors.textPrimary }}>
            {cooldownNotice}
          </Text>
        ) : null}
        {errorMessage ? (
          <Text className="mt-3 text-[13px]" style={{ color: "#FF453A" }}>
            {errorMessage}
          </Text>
        ) : null}
      </View>
    );
  const confirmLabel =
    confirmStep === "initial" ? FUTURE_YOU_DELETE_CONFIRM_LABEL : FUTURE_YOU_DELETE_FINAL_CONFIRM_LABEL;
  const onConfirm = confirmStep === "initial" ? onFirstConfirm : () => void onFinalConfirm();

  return (
    <>
      <Pressable
        testID="future-you-delete-trigger"
        accessibilityRole="button"
        accessibilityLabel={FUTURE_YOU_DELETE_TRIGGER_LABEL}
        onPress={() => {
          setErrorMessage(null);
          setConfirmStep("initial");
          setConfirmOpen(true);
        }}
        className="h-9 w-9 items-center justify-center rounded-lg border"
        style={{ borderColor: colors.border }}
      >
        <SymbolView
          name={{ ios: "trash", android: "delete", web: "delete" }}
          tintColor={colors.textTertiary}
          size={16}
        />
      </Pressable>

      <FutureYouDeleteConfirmSheet
        open={confirmOpen}
        title={sheetTitle}
        message={sheetMessage}
        cancelLabel={FUTURE_YOU_DELETE_CANCEL_LABEL}
        confirmLabel={confirmLabel}
        confirmBusy={busy}
        onCancel={closeConfirm}
        onConfirm={onConfirm}
      />
    </>
  );
}
