import { BottomSheet, bottomSheetPanelTheme } from "./motion";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function FutureYouGenerationUnlockSheet({ open, onClose }: Props) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabelledBy="future-you-unlock-title"
      panelStyle={{
        ...bottomSheetPanelTheme,
        padding: "20px 20px max(24px, env(safe-area-inset-bottom))",
      }}
    >
      <h2 id="future-you-unlock-title" className="future-you-unlock-sheet__title">
        Your Future You preview
      </h2>
      <p className="future-you-unlock-sheet__body">
        We&apos;re creating a personalized preview from your photo while you finish setup. You&apos;ll unlock the
        full image when you start your trial on the last step.
      </p>
      <button type="button" className="tap onboarding-continue onboarding-continue--blue" onClick={onClose}>
        Got it
      </button>
    </BottomSheet>
  );
}
