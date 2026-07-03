import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "NewYou AI",
  slug: "newyouai-mobile",
  version: "0.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "newyouai",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: false,
    bundleIdentifier: "app.newyouai.mobile",
    appleTeamId: "YJ77689737",
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsLocalNetworking: true,
      },
      NSCameraUsageDescription:
        "NewYou AI uses your camera to scan food barcodes and capture photos for your Future You transformation preview.",
      NSPhotoLibraryUsageDescription:
        "NewYou AI uses your photo library so you can choose a picture for your Future You preview.",
      NSPhotoLibraryAddUsageDescription:
        "NewYou AI saves your NewYou preview to your photo library when you tap Save to photos.",
      NSUserNotificationsUsageDescription:
        "NewYou AI sends workout and nutrition reminders you choose in Settings.",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    package: "app.newyouai.mobile",
    predictiveBackGestureEnabled: false,
    permissions: ["CAMERA"],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-dev-client",
    "expo-router",
    "expo-secure-store",
    "expo-apple-authentication",
    [
      "expo-camera",
      {
        cameraPermission:
          "NewYou AI uses your camera to scan food barcodes and capture photos for your Future You preview.",
        barcodeScannerEnabled: true,
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "NewYou AI uses your photo library so you can choose a picture for your Future You preview.",
        cameraPermission:
          "NewYou AI uses your camera to scan food barcodes and capture photos for your Future You preview.",
      },
    ],
    [
      "expo-media-library",
      {
        photosPermission:
          "NewYou AI uses your photo library so you can choose a picture for your Future You preview.",
        savePhotosPermission:
          "NewYou AI saves your NewYou preview to your photo library when you tap Save to photos.",
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#0a0a0a",
      },
    ],
    [
      "expo-notifications",
      {
        color: "#E6F4FE",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: "2fe54137-703a-4c3f-bd01-5ceabee0268d",
    },
  },
};

export default config;
