import { useState } from "react";

import type { FutureYouReportCategory, FutureYouReportContext } from "./futureYouReportGuards";
import { FUTURE_YOU_REPORT_MESSAGE_MAX } from "./futureYouReportGuards";
import {
  FUTURE_YOU_REPORT_CATEGORY_OPTIONS,
  FUTURE_YOU_REPORT_ERROR_MESSAGE,
  FUTURE_YOU_REPORT_SHEET_BODY,
  FUTURE_YOU_REPORT_SHEET_TITLE,
  FUTURE_YOU_REPORT_SUBMIT_LABEL,
  FUTURE_YOU_REPORT_SUCCESS_MESSAGE,
  FUTURE_YOU_REPORT_TRIGGER_LABEL,
} from "./futureYouReportModel";
import { submitFutureYouReport } from "./futureYouReportService";
import { CenterDialog, confirmCenterDialogPanelStyle } from "./motion";

const reportDialogPanelStyle = {
  ...confirmCenterDialogPanelStyle,
  maxWidth: 360,
  padding: 20,
  maxHeight: "min(85vh, 560px)",
  overflowY: "auto" as const,
};

type Props = {
  jobId?: string;
  context: FutureYouReportContext;
  previewMode?: boolean;
  className?: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

export function FutureYouReportButton({ jobId, context, previewMode = false, className }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
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

  function closeDialog() {
    setDialogOpen(false);
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
      <button
        type="button"
        className={`future-you-report__trigger tap${className ? ` ${className}` : ""}`}
        onClick={() => {
          resetForm();
          setDialogOpen(true);
        }}
      >
        {FUTURE_YOU_REPORT_TRIGGER_LABEL}
      </button>

      <CenterDialog
        open={dialogOpen}
        onClose={closeDialog}
        keyboardAware
        zIndex={1300}
        ariaLabelledBy="future-you-report-title"
        panelStyle={reportDialogPanelStyle}
      >
        <h2 id="future-you-report-title" className="future-you-report-sheet__title">
          {FUTURE_YOU_REPORT_SHEET_TITLE}
        </h2>

        {submitState === "success" ?
          <>
            <p className="future-you-report-sheet__success" role="status">
              {FUTURE_YOU_REPORT_SUCCESS_MESSAGE}
            </p>
            <button type="button" className="tap onboarding-continue onboarding-continue--blue" onClick={closeDialog}>
              Done
            </button>
          </>
        : <>
            <p className="future-you-report-sheet__body">{FUTURE_YOU_REPORT_SHEET_BODY}</p>

            <fieldset className="future-you-report-sheet__options">
              <legend className="future-you-report-sheet__legend">What went wrong?</legend>
              {FUTURE_YOU_REPORT_CATEGORY_OPTIONS.map((option) => (
                <label key={option.id} className="future-you-report-sheet__option">
                  <input
                    type="radio"
                    name="future-you-report-category"
                    value={option.id}
                    checked={category === option.id}
                    onChange={() => setCategory(option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>

            <label className="future-you-report-sheet__message-label" htmlFor="future-you-report-message">
              Details (optional)
            </label>
            <textarea
              id="future-you-report-message"
              className="future-you-report-sheet__message"
              rows={3}
              maxLength={FUTURE_YOU_REPORT_MESSAGE_MAX}
              value={message}
              placeholder="Anything else we should know?"
              onChange={(event) => setMessage(event.target.value)}
            />

            {submitState === "error" && errorMessage ?
              <p role="alert" className="future-you-report-sheet__error">
                {errorMessage}
              </p>
            : null}

            <button
              type="button"
              className="tap onboarding-continue onboarding-continue--blue"
              disabled={submitState === "submitting"}
              onClick={() => void onSubmit()}
            >
              {submitState === "submitting" ? "Sending…" : FUTURE_YOU_REPORT_SUBMIT_LABEL}
            </button>
          </>
        }
      </CenterDialog>
    </>
  );
}
