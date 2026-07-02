import { type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/hooks/useAppTheme";

type FullScreenOverlayProps = {
  open: boolean;
  motionVariant?: "fade" | "page" | "push" | "dismiss";
  edgeToEdge?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  onRequestClose?: () => void;
};

function fullScreenAnimationType(variant: FullScreenOverlayProps["motionVariant"]): "none" | "slide" | "fade" {
  if (variant === "push" || variant === "dismiss" || variant === "page") return "slide";
  return "fade";
}

/** Full-screen layer using native modal transitions (avoids opacity-0 flash). */
export function FullScreenOverlay({
  open,
  motionVariant = "fade",
  edgeToEdge = false,
  style,
  children,
  onRequestClose,
}: FullScreenOverlayProps) {
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={open}
      animationType={fullScreenAnimationType(motionVariant)}
      presentationStyle="fullScreen"
      onRequestClose={onRequestClose}
    >
      <View
        style={[
          styles.root,
          {
            backgroundColor: colors.background,
            paddingTop: edgeToEdge ? 0 : undefined,
          },
          style,
        ]}
      >
        {children}
      </View>
    </Modal>
  );
}

type BottomSheetProps = {
  open: boolean;
  onClose?: () => void;
  /** Centered modal by default; use `bottom` for the pre-workout routine preview. */
  placement?: "center" | "bottom";
  panelStyle?: StyleProp<ViewStyle>;
  backdropStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function BottomSheet({
  open,
  onClose,
  placement = "center",
  panelStyle,
  backdropStyle,
  children,
}: BottomSheetProps) {
  const { colors } = useAppTheme();

  if (placement === "bottom") {
    return (
      <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={styles.sheetRoot}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button">
            <View style={[styles.backdrop, backdropStyle]} />
          </Pressable>
          <View
            style={[
              styles.sheetPanel,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              panelStyle,
            ]}
          >
            {children}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  return (
    <CenterDialog
      open={open}
      onClose={onClose}
      backdropStyle={backdropStyle}
      panelStyle={[styles.sheetAsDialogPanel, panelStyle]}
    >
      {children}
    </CenterDialog>
  );
}

type CenterDialogProps = {
  open: boolean;
  onClose?: () => void;
  panelStyle?: StyleProp<ViewStyle>;
  backdropStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function CenterDialog({ open, onClose, panelStyle, backdropStyle, children }: CenterDialogProps) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.dialogRoot}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        pointerEvents="box-none"
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button">
          <View style={[styles.backdrop, backdropStyle]} />
        </Pressable>
        <View
          pointerEvents="box-none"
          style={[
            styles.dialogPanel,
            {
              backgroundColor: colors.card,
              borderColor: "rgba(255,255,255,0.08)",
            },
            panelStyle,
          ]}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const CONFIRM_DESTRUCTIVE_COLOR = "#FF6961";

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  dialogRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheetPanel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    paddingBottom: 16,
    maxHeight: "85%",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 2,
  },
  sheetAsDialogPanel: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "85%",
    borderRadius: 20,
    borderWidth: 0.5,
    paddingHorizontal: 12,
    paddingBottom: 16,
    flexDirection: "column",
    overflow: "hidden",
  },
  dialogPanel: {
    width: "100%",
    maxWidth: 280,
    borderRadius: 16,
    borderWidth: 0.5,
    padding: 28,
    zIndex: 2,
  },
});
