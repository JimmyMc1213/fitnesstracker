export type TabId = "home" | "nutrition" | "workout" | "progress" | "future_you" | "stretch" | "settings";

export type NavigateOptions = {
  /** When navigating to Nutrition, open the Log Food overlay after tab switch. */
  openLogFood?: boolean;
  /** When navigating to Home, open the mobility preview sheet. */
  openMobilityPreview?: boolean;
  /** When navigating to NewYou, open the photo upload flow after tab switch. */
  openFutureYouUpload?: boolean;
};

export type NavigateFn = (tab: TabId, options?: NavigateOptions) => void;
