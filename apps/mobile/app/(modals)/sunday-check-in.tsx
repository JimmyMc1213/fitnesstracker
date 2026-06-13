import { buildSundayCheckInData, commitSundayCheckIn } from "@newyouai/core";
import { router } from "expo-router";
import { Text, View } from "react-native";

import { SundayWeeklyCheckInFlow } from "@/components/sunday/SundayWeeklyCheckInFlow";
import { useFitnessState } from "@/context/FitnessContext";
import { useSundayCheckInHome } from "@/hooks/useSundayCheckInHome";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function SundayCheckInModalScreen() {
  const { colors } = useAppTheme();
  const { state, setFitnessState } = useFitnessState();
  const sundayCheckIn = useSundayCheckInHome(state);

  if (!state || !sundayCheckIn.data) {
    return (
      <View
        className="flex-1 items-center justify-center px-screen-x"
        style={{ backgroundColor: colors.background }}
        testID="modal-sunday-check-in"
      >
        <Text style={{ color: colors.textSecondary }}>Sunday check-in is not available right now.</Text>
      </View>
    );
  }

  const data =
    sundayCheckIn.data ??
    buildSundayCheckInData(state, sundayCheckIn.reviewClock);

  if (!data) {
    return (
      <View
        className="flex-1 items-center justify-center px-screen-x"
        style={{ backgroundColor: colors.background }}
        testID="modal-sunday-check-in"
      >
        <Text style={{ color: colors.textSecondary }}>Sunday check-in is not available right now.</Text>
      </View>
    );
  }

  return (
    <SundayWeeklyCheckInFlow
      data={data}
      unitPreferences={state.unitPreferences}
      onClose={() => router.back()}
      onComplete={(commitments) => {
        setFitnessState((prev) => (prev ? commitSundayCheckIn(prev, data, commitments) : prev));
        router.back();
      }}
    />
  );
}
