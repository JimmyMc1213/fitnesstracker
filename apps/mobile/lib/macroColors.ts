/** PWA parity — apps/pwa/src/index.css --macro-* tokens */
export const MACRO_COLORS = {
  protein: "#c9a876",
  carbs: "#e85d5d",
  fat: "#6db88a",
  hydration: "#5a9ae8",
} as const;

export type MacroColorKey = keyof typeof MACRO_COLORS;
