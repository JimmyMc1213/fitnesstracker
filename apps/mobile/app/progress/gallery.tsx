import { router } from "expo-router";
import { Text, View } from "react-native";

import { ScreenProgressPicsGallery } from "@/components/progress/ScreenProgressPicsGallery";
import { useFitnessState } from "@/context/FitnessContext";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function ProgressPicsGalleryScreen() {
  const { colors } = useAppTheme();
  const { state, setFitnessState } = useFitnessState();

  if (!state) {
    return (
      <View
        testID="progress-pics-gallery"
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Text style={{ color: colors.textSecondary }}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScreenProgressPicsGallery
      state={state}
      setFitnessState={setFitnessState}
      onBack={() => router.back()}
    />
  );
}
