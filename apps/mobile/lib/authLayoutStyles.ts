import { StyleSheet } from "react-native";

import { borderRadius, spacing } from "@newyouai/config/tokens";

/** Shared auth / welcome layout — StyleSheet so screens render correctly without NativeWind. */
export const authLayout = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenPadding: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
  },
  brandRow: {
    alignItems: "center",
    paddingTop: 24,
  },
  heroPreview: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 240,
    aspectRatio: 9 / 16,
    borderRadius: 28,
    borderWidth: 1.5,
    alignSelf: "center",
  },
  heroPreviewLabel: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  copyBlock: {
    marginTop: 32,
    alignItems: "center",
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    textAlign: "center",
  },
  subline: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  oauthStack: {
    gap: 12,
  },
  oauthDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  oauthDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  oauthDividerText: {
    fontSize: 12,
  },
  oauthButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.pill,
    paddingVertical: 16,
    borderWidth: 1,
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.pill,
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  signInRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  signInPrompt: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  welcomeLanding: {
    flex: 1,
    justifyContent: "space-evenly",
    paddingVertical: 16,
  },
  input: {
    borderRadius: borderRadius.pill,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  inputStack: {
    marginTop: 32,
    gap: 12,
  },
  footerActions: {
    marginTop: "auto",
    gap: 16,
    paddingTop: 24,
  },
});
