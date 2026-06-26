import { useCallback, useRef, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { AppTextField } from "@/components/ui/AppTextField";
import { useAppTheme } from "@/hooks/useAppTheme";

type Props = {
  onScan: (code: string) => void;
  onClose: () => void;
};

/** Manual barcode entry when expo-camera is unavailable (simulator / older dev client). */
export function BarcodeScannerManual({ onScan, onClose }: Props) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [manualCode, setManualCode] = useState("");
  const scannedRef = useRef(false);

  const handleClose = useCallback(() => {
    scannedRef.current = false;
    onClose();
  }, [onClose]);

  const handleManualSubmit = useCallback(() => {
    const trimmed = manualCode.trim();
    if (!trimmed || scannedRef.current) return;
    scannedRef.current = true;
    onScan(trimmed);
  }, [manualCode, onScan]);

  return (
    <ScannerShell insets={insets} colors={colors} onClose={handleClose}>
      <Text
        className="text-[11px] font-semibold uppercase tracking-widest"
        style={{ color: colors.textPrimary }}
      >
        Enter barcode
      </Text>
      <Text className="mt-2 text-center text-sm leading-5" style={{ color: colors.textSecondary }}>
        Type the barcode digits to look up a product (simulator / Maestro).
      </Text>
      <ManualBarcodeEntry
        colors={colors}
        manualCode={manualCode}
        onChangeManualCode={setManualCode}
        onSubmit={handleManualSubmit}
      />
    </ScannerShell>
  );
}

function ScannerShell({
  children,
  insets,
  colors,
  onClose,
}: {
  children: ReactNode;
  insets: { top: number; bottom: number };
  colors: ReturnType<typeof useAppTheme>["colors"];
  onClose: () => void;
}) {
  return (
    <View testID="barcode-scanner" style={{ flex: 1, backgroundColor: "#000" }}>
      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-5"
        style={{ top: insets.top + 12, zIndex: 2 }}
      >
        <Pressable
          onPress={onClose}
          testID="barcode-scanner-close"
          accessibilityLabel="Cancel scan"
          className="h-9 w-9 items-center justify-center rounded-full border"
          style={{ borderColor: colors.border, backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <Text className="text-lg" style={{ color: colors.textPrimary }}>
            ✕
          </Text>
        </Pressable>
        <Text className="text-[13px] font-semibold" style={{ color: colors.textPrimary }}>
          Scan barcode
        </Text>
        <View className="w-9" />
      </View>
      <View className="flex-1 items-center justify-center px-8" style={{ paddingTop: insets.top + 56 }}>
        {children}
      </View>
    </View>
  );
}

function ManualBarcodeEntry({
  colors,
  manualCode,
  onChangeManualCode,
  onSubmit,
}: {
  colors: ReturnType<typeof useAppTheme>["colors"];
  manualCode: string;
  onChangeManualCode: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View className="mt-6 w-full">
      <AppTextField
        value={manualCode}
        onChangeText={onChangeManualCode}
        testID="barcode-manual-input"
        accessibilityLabel="Barcode digits"
        placeholder="Enter barcode digits"
        keyboardType="number-pad"
        autoCorrect={false}
        backgroundColor={colors.card}
        style={{ fontVariant: ["tabular-nums"] }}
      />
      <PrimaryButton
        block
        testID="barcode-manual-submit"
        onPress={onSubmit}
        disabled={manualCode.replace(/\D/g, "").length < 8}
        style={{ marginTop: 12 }}
      >
        Look up barcode
      </PrimaryButton>
    </View>
  );
}
