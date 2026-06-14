import { useEffect, useState, type ComponentType } from "react";
import { ActivityIndicator, View } from "react-native";

import { BarcodeScannerManual } from "@/components/nutrition/BarcodeScannerManual";
import { useAppTheme } from "@/hooks/useAppTheme";
import { isExpoCameraAvailable } from "@/lib/expoNativeModules";

type Props = {
  onScan: (code: string) => void;
  onClose: () => void;
};

/** Loads camera scanner when native module exists; otherwise manual entry only. */
export function BarcodeScannerGate({ onScan, onClose }: Props) {
  const { colors } = useAppTheme();
  const [CameraScanner, setCameraScanner] = useState<ComponentType<Props> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!isExpoCameraAvailable()) {
      setReady(true);
      return () => {
        mounted = false;
      };
    }
    import("@/components/nutrition/BarcodeScanner")
      .then((mod) => {
        if (!mounted) return;
        setCameraScanner(() => mod.BarcodeScanner);
      })
      .catch(() => {
        /* expo-camera not linked — manual fallback */
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (CameraScanner) {
    return <CameraScanner onScan={onScan} onClose={onClose} />;
  }

  return <BarcodeScannerManual onScan={onScan} onClose={onClose} />;
}
