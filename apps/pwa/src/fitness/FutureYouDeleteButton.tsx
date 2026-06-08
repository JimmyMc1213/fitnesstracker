import { useMemo, useState } from "react";

import { DeleteConfirmSheet } from "./DeleteConfirmSheet";
import { IconTrash } from "./icons";
import { deleteFutureYou } from "./futureYouDeleteService";
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
} from "./futureYouDeleteModel";
import { msUntilFutureYouRedoEligible } from "./futureYouPageModel";

type Props = {
  previewMode?: boolean;
  className?: string;
  /** ISO timestamp for the 2-week redo window — preserved on delete so cooldown stays active. */
  redoAnchorIso?: string;
  onDeleted: () => void;
};

type ConfirmStep = "initial" | "final";

export function FutureYouDeleteButton({
  previewMode = false,
  className,
  redoAnchorIso,
  onDeleted,
}: Props) {
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
      await deleteFutureYou({ previewMode });
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
    confirmStep === "initial" ?
      <>
        {FUTURE_YOU_DELETE_CONFIRM_MESSAGE}
        {errorMessage ?
          <p role="alert" style={{ margin: "12px 0 0", color: "var(--danger, #dc2626)", fontSize: 13 }}>
            {errorMessage}
          </p>
        : null}
      </>
    : <>
        {FUTURE_YOU_DELETE_FINAL_BODY}
        {cooldownNotice ?
          <p style={{ margin: "12px 0 0", fontWeight: 600 }}>{cooldownNotice}</p>
        : null}
        {errorMessage ?
          <p role="alert" style={{ margin: "12px 0 0", color: "var(--danger, #dc2626)", fontSize: 13 }}>
            {errorMessage}
          </p>
        : null}
      </>;
  const confirmLabel =
    confirmStep === "initial" ? FUTURE_YOU_DELETE_CONFIRM_LABEL : FUTURE_YOU_DELETE_FINAL_CONFIRM_LABEL;
  const onConfirm = confirmStep === "initial" ? onFirstConfirm : () => void onFinalConfirm();

  return (
    <>
      <button
        type="button"
        className={`future-you-delete__trigger future-you-delete__trigger--icon tap${className ? ` ${className}` : ""}`}
        aria-label={FUTURE_YOU_DELETE_TRIGGER_LABEL}
        onClick={() => {
          setErrorMessage(null);
          setConfirmStep("initial");
          setConfirmOpen(true);
        }}
      >
        <IconTrash size={18} stroke={1.75} />
      </button>

      <DeleteConfirmSheet
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
