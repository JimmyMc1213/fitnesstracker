import { StyleSheet } from "react-native";

import { borderRadius, spacing } from "@newyouai/config/tokens";

/** Shared auth / welcome layout, StyleSheet so screens render correctly without NativeWind. */
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
    flexShrink: 0,
    paddingTop: 4,
  },
  heroRow: {
    alignItems: "center",
    flexShrink: 0,
    marginTop: 12,
  },
  copyBlock: {
    flexShrink: 0,
    marginTop: 16,
    alignItems: "center",
  },
  headline: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
    textAlign: "center",
  },
  welcomeHeadline: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
    textAlign: "center",
  },
  subline: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  actions: {
    flexShrink: 0,
    marginTop: 16,
    gap: 10,
  },
  oauthStack: {
    gap: 12,
  },
  oauthDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
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
    paddingVertical: 14,
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
    paddingVertical: 14,
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
    marginTop: 10,
  },
  signInPrompt: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  welcomeLanding: {
    flexGrow: 1,
    gap: 2,
    minHeight: "100%",
    paddingTop: 4,
    paddingBottom: 12,
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
