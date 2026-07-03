import { useMemo, useState } from "react";
import { Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconLock } from "@/components/icons/FitnessIcons";
import { futureYouSilhouettesForGender } from "@/lib/futureYouSilhouettes";
import { welcomePhoneScale } from "@/lib/welcomeHeroLayout";

const BASE_WIDTH = 270;
const GOLD_LIGHT = "#CAA668";
const SCREEN_BG = "#0F0E0A";
const SUBTITLE = "#8A8780";

/** Asset is PNG; keep the extension accurate so native decoders load it reliably. */
const BLUR_IMAGE = require("@/assets/images/futureyou-blur.png");
const FALLBACK_SILHOUETTE = futureYouSilhouettesForGender("male")?.after;

type FutureYouPhonePreviewProps = {
  /** Large centered hero for welcome landing screens. */
  size?: "default" | "hero";
  /** Auth welcome shows more CTAs — shrink the mockup further. */
  welcomePhase?: "landing" | "auth";
};

function usePhoneScale(size: "default" | "hero", welcomePhase: "landing" | "auth") {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(
    () => welcomePhoneScale(screenWidth, screenHeight, insets, size, welcomePhase),
    [insets.bottom, insets.top, screenHeight, screenWidth, size, welcomePhase],
  );
}

function BatteryIcon({ scale }: { scale: number }) {
  const s = (n: number) => n * scale;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: s(1.5) }}>
      <View
        style={{
          width: s(22),
          height: s(11),
          borderRadius: s(2),
          borderWidth: s(1.2),
          borderColor: "#ffffff",
          padding: s(1.4),
          opacity: 0.9,
        }}
      >
        <View
          style={{
            width: "78%",
            height: "100%",
            borderRadius: s(1),
            backgroundColor: "#ffffff",
          }}
        />
      </View>
      <View
        style={{
          width: s(1.5),
          height: s(4),
          borderTopRightRadius: s(1),
          borderBottomRightRadius: s(1),
          backgroundColor: "rgba(255,255,255,0.55)",
        }}
      />
    </View>
  );
}

function PhoneSideButtons({ scale }: { scale: number }) {
  const s = (n: number) => n * scale;
  const rail = "#48484a";

  return (
    <>
      <View style={[styles.sideButton, { left: s(-3), top: s(118), height: s(25), width: s(3.5), backgroundColor: rail }]} />
      <View style={[styles.sideButton, { left: s(-3), top: s(155), height: s(50), width: s(3.5), backgroundColor: rail }]} />
      <View style={[styles.sideButton, { left: s(-3), top: s(215), height: s(50), width: s(3.5), backgroundColor: rail }]} />
      <View style={[styles.sideButton, { right: s(-3), top: s(168), height: s(80), width: s(3.5), backgroundColor: rail }]} />
    </>
  );
}

/** Marketing-site Future You phone mockup (apps/web/components/marketing/PhoneMockups). */
export function FutureYouPhonePreview({
  size = "hero",
  welcomePhase = "landing",
}: FutureYouPhonePreviewProps) {
  const scale = usePhoneScale(size, welcomePhase);
  const s = (n: number) => n * scale;
  const width = s(BASE_WIDTH);
  const [blurImageFailed, setBlurImageFailed] = useState(false);
  const previewSource = blurImageFailed && FALLBACK_SILHOUETTE ? FALLBACK_SILHOUETTE : BLUR_IMAGE;
  const previewBlurRadius = blurImageFailed ? 14 : 0;

  return (
    <View
      accessibilityElementsHidden
      style={[styles.root, { width }]}
      testID="welcome-phone-preview"
    >
      <PhoneSideButtons scale={scale} />
      <View style={[styles.outerRail, { width, borderRadius: s(56), padding: s(4), backgroundColor: "#3c3c3e" }]}>
        <View style={[styles.bezel, { borderRadius: s(52), padding: s(10), backgroundColor: "#050505" }]}>
          <View style={[styles.screen, { height: s(546), borderRadius: s(43), backgroundColor: SCREEN_BG }]}>
            <View
              style={{
                position: "absolute",
                alignSelf: "center",
                top: s(12),
                zIndex: 2,
                width: s(92),
                height: s(30),
                borderRadius: s(16),
                paddingRight: s(10),
                backgroundColor: "#000000",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  width: s(7),
                  height: s(7),
                  borderRadius: s(3.5),
                  backgroundColor: "#2a2a32",
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: s(22),
                paddingTop: s(16),
                paddingBottom: s(4),
              }}
            >
              <Text style={{ color: "#ffffff", fontSize: s(13.5), fontWeight: "800", letterSpacing: -0.2 }}>
                9:41
              </Text>
              <BatteryIcon scale={scale} />
            </View>

            <View style={{ flex: 1, paddingHorizontal: s(18), paddingTop: s(6), paddingBottom: s(18) }}>
              <Text
                style={{
                  marginTop: s(8),
                  textAlign: "center",
                  color: GOLD_LIGHT,
                  fontSize: s(27),
                  fontWeight: "800",
                  letterSpacing: -0.3,
                }}
              >
                Future You
              </Text>
              <Text
                style={{
                  marginTop: s(2),
                  textAlign: "center",
                  color: SUBTITLE,
                  fontSize: s(14),
                  fontWeight: "600",
                }}
              >
                You in 3 months
              </Text>

              <View
                style={{
                  flex: 1,
                  marginTop: s(14),
                  borderRadius: s(18),
                  overflow: "hidden",
                  borderWidth: StyleSheet.hairlineWidth * 2,
                  borderColor: "rgba(202, 166, 104, 0.5)",
                  backgroundColor: "#1a1814",
                }}
              >
                <Image
                  source={previewSource}
                  style={styles.previewImage}
                  resizeMode="cover"
                  blurRadius={previewBlurRadius}
                  onError={() => setBlurImageFailed(true)}
                  accessibilityIgnoresInvertColors
                />
                <View
                  pointerEvents="none"
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: "rgba(20, 18, 12, 0.22)",
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: s(11),
                    left: s(11),
                    flexDirection: "row",
                    alignItems: "center",
                    gap: s(4),
                    paddingHorizontal: s(8),
                    paddingVertical: s(4),
                    borderRadius: 999,
                    backgroundColor: "rgba(20, 18, 12, 0.6)",
                  }}
                >
                  <IconLock size={s(11)} stroke={2.4} color="#ffffff" />
                  <Text style={{ color: "#ffffff", fontSize: s(11), fontWeight: "700" }}>Locked</Text>
                </View>
              </View>

              <Text
                style={{
                  marginTop: s(14),
                  textAlign: "center",
                  color: GOLD_LIGHT,
                  fontSize: s(17),
                  fontWeight: "800",
                  letterSpacing: -0.2,
                }}
              >
                Goal · Lose weight
              </Text>
              <Text
                style={{
                  marginTop: s(2),
                  marginBottom: s(2),
                  textAlign: "center",
                  color: "#ffffff",
                  fontSize: s(15),
                  fontWeight: "700",
                }}
              >
                -10 lb
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  root: {
    alignSelf: "center",
    position: "relative",
    flexShrink: 1,
    minHeight: 0,
  },
  sideButton: {
    position: "absolute",
    borderRadius: 2,
    zIndex: 2,
  },
  outerRail: {
    overflow: "hidden",
  },
  bezel: {
    overflow: "hidden",
  },
  screen: {
    overflow: "hidden",
    position: "relative",
  },
});
