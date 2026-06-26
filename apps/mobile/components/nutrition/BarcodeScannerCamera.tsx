import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { useCallback, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/home/PrimaryButton";
import { AppTextField } from "@/components/ui/AppTextField";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLogFoodAccent } from "@/hooks/useLogFoodAccent";

type Props = {
  onScan: (code: string) => void;
  onClose: () => void;
};

const BARCODE_TYPES = ["ean13", "ean8", "upc_a", "upc_e", "code128"] as const;

export function BarcodeScannerCamera({ onScan, onClose }: Props) {
  const { colors } = useAppTheme();
  const { accent } = useLogFoodAccent();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const scannedRef = useRef(false);

  const handleClose = useCallback(() => {
    scannedRef.current = false;
    onClose();
  }, [onClose]);

  const deliverCode = useCallback(
    (code: string) => {
      const trimmed = code.trim();
      if (!trimmed || scannedRef.current) return;
      scannedRef.current = true;
      onScan(trimmed);
    },
    [onScan],
  );

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      deliverCode(result.data);
    },
    [deliverCode],
  );

  const handleManualSubmit = useCallback(() => {
    deliverCode(manualCode);
  }, [deliverCode, manualCode]);

  const cameraUnavailable =
    showManualEntry ||
    permission?.granted === false ||
    cameraError != null ||
    (Platform.OS === "ios" && !permission?.granted && permission?.canAskAgain === false);

  if (!permission) {
    return (
      <ScannerShell insets={insets} colors={colors} onClose={handleClose}>
        <ActivityIndicator color={accent} />
        <Text className="mt-3 text-sm" style={{ color: colors.textSecondary }}>
          Checking camera permission…
        </Text>
      </ScannerShell>
    );
  }

  if (!permission.granted && !showManualEntry) {
    return (
      <ScannerShell insets={insets} colors={colors} onClose={handleClose}>
        <Text
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: "#ffb4b4" }}
        >
          Camera unavailable
        </Text>
        <Text className="mt-2 text-center text-sm leading-5" style={{ color: colors.textSecondary }}>
          Allow camera access to scan barcodes, or enter the digits manually below.
        </Text>
        <PrimaryButton block onPress={() => void requestPermission()} style={{ marginTop: 20 }}>
          Allow camera
        </PrimaryButton>
        <ManualBarcodeEntry
          colors={colors}
          manualCode={manualCode}
          onChangeManualCode={setManualCode}
          onSubmit={handleManualSubmit}
        />
      </ScannerShell>
    );
  }

  if (cameraUnavailable) {
    return (
      <ScannerShell insets={insets} colors={colors} onClose={handleClose}>
        <Text
          className="text-[11px] font-semibold uppercase tracking-widest"
          style={{ color: cameraError ? "#ffb4b4" : colors.textPrimary }}
        >
          {cameraError ? "Camera unavailable" : "Enter barcode"}
        </Text>
        <Text className="mt-2 text-center text-sm leading-5" style={{ color: colors.textSecondary }}>
          {cameraError ?? "Type the barcode digits to look up a product (simulator / Maestro)."}
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

  return (
    <View testID="barcode-scanner" style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        onBarcodeScanned={scannedRef.current ? undefined : handleBarcodeScanned}
        onMountError={(event) => {
          setCameraError(event.message || "Unable to access camera");
          setShowManualEntry(true);
        }}
      />

      <View
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" }}
      />

      <View
        className="absolute left-0 right-0 flex-row items-center justify-between px-5"
        style={{ top: insets.top + 12 }}
      >
        <Pressable
          onPress={handleClose}
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

      <View
        pointerEvents="none"
        className="absolute left-1/2 top-[42%] h-40 w-[260px] -translate-x-1/2 -translate-y-1/2"
      >
        <View
          className="absolute left-0 top-0 h-7 w-7 border-l-2 border-t-2"
          style={{ borderColor: accent }}
        />
        <View
          className="absolute right-0 top-0 h-7 w-7 border-r-2 border-t-2"
          style={{ borderColor: accent }}
        />
        <View
          className="absolute bottom-0 left-0 h-7 w-7 border-b-2 border-l-2"
          style={{ borderColor: accent }}
        />
        <View
          className="absolute bottom-0 right-0 h-7 w-7 border-b-2 border-r-2"
          style={{ borderColor: accent }}
        />
      </View>

      <View className="absolute left-0 right-0 px-8" style={{ top: "58%" }}>
        {cameraError ? (
          <>
            <Text
              className="text-center text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "#ffb4b4" }}
            >
              Camera unavailable
            </Text>
            <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>
              {cameraError}
            </Text>
          </>
        ) : (
          <>
            <Text
              className="text-center text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: colors.textPrimary }}
            >
              Searching…
            </Text>
            <Text className="mt-2 text-center text-sm" style={{ color: colors.textSecondary }}>
              Center the barcode inside the frame
            </Text>
          </>
        )}
      </View>

      <View
        className="absolute bottom-0 left-0 right-0 px-5"
        style={{ paddingBottom: insets.bottom + 20, paddingTop: 20 }}
      >
        <Pressable
          onPress={() => setShowManualEntry(true)}
          testID="barcode-scanner-manual-entry"
          accessibilityLabel="Enter barcode manually"
          className="mb-3 items-center rounded-xl border px-4 py-3"
          style={{ borderColor: colors.border, backgroundColor: "rgba(20,20,20,0.85)" }}
        >
          <Text className="text-[13px] font-medium" style={{ color: colors.textPrimary }}>
            Enter barcode manually
          </Text>
        </Pressable>
        <Pressable
          onPress={handleClose}
          className="items-center rounded-xl border px-4 py-3.5"
          style={{ borderColor: colors.border, backgroundColor: "rgba(20,20,20,0.85)" }}
        >
          <Text className="text-[13px] font-medium" style={{ color: colors.textPrimary }}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
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
