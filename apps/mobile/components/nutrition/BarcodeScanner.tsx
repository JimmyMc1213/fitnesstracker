import { useEffect, useState, type ComponentType } from "react";
import { ActivityIndicator, View } from "react-native";

import { BarcodeScannerManual } from "@/components/nutrition/BarcodeScannerManual";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useLogFoodAccent } from "@/hooks/useLogFoodAccent";

type Props = {
  onScan: (code: string) => void;
  onClose: () => void;
};

/** Lazy-loads expo-camera so simulators without the native module do not crash at import time. */
export function BarcodeScanner(props: Props) {
  const { colors } = useAppTheme();
  const { accent } = useLogFoodAccent();
  const [CameraScanner, setCameraScanner] = useState<ComponentType<Props> | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    import("@/components/nutrition/BarcodeScannerCamera")
      .then((mod) => {
        if (!mounted) return;
        setCameraScanner(() => mod.BarcodeScannerCamera);
      })
      .catch(() => {
        /* expo-camera not linked */
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
        <ActivityIndicator color={accent} />
      </View>
    );
  }

  if (CameraScanner) {
    return <CameraScanner {...props} />;
  }

  return <BarcodeScannerManual {...props} />;
}
