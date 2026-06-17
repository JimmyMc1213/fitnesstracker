import { FUTURE_YOU_FULLSCREEN_DONE_LABEL } from "@newyouai/core";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FullScreenOverlay } from "@/components/motion";

type Props = {
  open: boolean;
  imageUri: string | null;
  onClose: () => void;
};

export function FutureYouFullscreenViewer({ open, imageUri, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const visible = open && Boolean(imageUri);

  return (
    <FullScreenOverlay
      open={visible}
      motionVariant="fade"
      edgeToEdge
      onRequestClose={onClose}
      style={{ backgroundColor: "#000" }}
    >
      {imageUri ? (
        <View testID="future-you-fullscreen-viewer" className="flex-1">
          <View
            className="flex-row items-center px-4 pb-2"
            style={{ paddingTop: insets.top + 12 }}
          >
            <Pressable
              testID="future-you-fullscreen-done"
              accessibilityRole="button"
              onPress={onClose}
              className="p-2"
            >
              <Text className="text-[15px] font-semibold text-white">
                {FUTURE_YOU_FULLSCREEN_DONE_LABEL}
              </Text>
            </Pressable>
          </View>

          <View
            className="min-h-0 flex-1 items-center justify-center px-3"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <Image
              source={{ uri: imageUri }}
              style={{ maxWidth: "100%", maxHeight: "100%" }}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>
        </View>
      ) : null}
    </FullScreenOverlay>
  );
}
