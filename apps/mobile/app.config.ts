import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "New You AI",
  slug: "newyouai-mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "newyouai",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: false,
    bundleIdentifier: "app.newyouai.mobile",
    buildNumber: "35",
    appleTeamId: "YJ77689737",
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsLocalNetworking: true,
      },
      NSCameraUsageDescription:
        "New You AI uses your camera to scan food barcodes and capture photos for your Future You transformation preview.",
      NSPhotoLibraryUsageDescription:
        "New You AI uses your photo library so you can choose a picture for your Future You preview.",
      NSPhotoLibraryAddUsageDescription:
        "New You AI saves your NewYou preview to your photo library when you tap Save to photos.",
      NSUserNotificationsUsageDescription:
        "New You AI sends workout and nutrition reminders you choose in Settings.",
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
    [
      "expo-dev-client",
      {
        launchMode: "most-recent",
        defaultLaunchURL: "http://127.0.0.1:8082",
        ios: {
          defaultLaunchURL: "http://127.0.0.1:8082",
        },
      },
    ],
    "expo-router",
    "expo-secure-store",
    "expo-apple-authentication",
    [
      "expo-camera",
      {
        cameraPermission:
          "New You AI uses your camera to scan food barcodes and capture photos for your Future You preview.",
        barcodeScannerEnabled: true,
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "New You AI uses your photo library so you can choose a picture for your Future You preview.",
        cameraPermission:
          "New You AI uses your camera to scan food barcodes and capture photos for your Future You preview.",
      },
    ],
    [
      "expo-media-library",
      {
        photosPermission:
          "New You AI uses your photo library so you can choose a picture for your Future You preview.",
        savePhotosPermission:
          "New You AI saves your NewYou preview to your photo library when you tap Save to photos.",
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
