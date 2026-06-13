import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { AccountPanel } from "@/components/settings/panels/AccountPanel";
import { AppearancePanel } from "@/components/settings/panels/AppearancePanel";
import { EquipmentPanel } from "@/components/settings/panels/EquipmentPanel";
import { FuelTargetsPanel } from "@/components/settings/panels/FuelTargetsPanel";
import { GoalPanel, type GoalPanelHandle } from "@/components/settings/panels/GoalPanel";
import { HabitsPanel } from "@/components/settings/panels/HabitsPanel";
import { HydrationPanel } from "@/components/settings/panels/HydrationPanel";
import { ProgramPanel } from "@/components/settings/panels/ProgramPanel";
import { RemindersPanel } from "@/components/settings/panels/RemindersPanel";
import { RestTimerPanel } from "@/components/settings/panels/RestTimerPanel";
import { SettingsPanelPlaceholder } from "@/components/settings/panels/SettingsPanelPlaceholder";
import { UnitsPanel } from "@/components/settings/panels/UnitsPanel";
import { YouPanel } from "@/components/settings/panels/YouPanel";
import { useAppTheme } from "@/hooks/useAppTheme";
import { isSettingsPanelId, PANEL_TITLES } from "@/lib/settingsPanelRegistry";

export default function SettingsPanelScreen() {
  const { colors } = useAppTheme();
  const { panel } = useLocalSearchParams<{ panel: string }>();
  const panelId = typeof panel === "string" ? panel : "";
  const valid = isSettingsPanelId(panelId);
  const title = valid ? PANEL_TITLES[panelId] : "Settings";
  const goalPanelRef = useRef<GoalPanelHandle>(null);
  const [goalSavable, setGoalSavable] = useState(false);

  const handleBack = () => {
    if (valid && panelId === "goal") {
      goalPanelRef.current?.handleBack(() => router.back());
      return;
    }
    router.back();
  };

  return (
    <ScrollView
      className="px-screen-x"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}
      testID={valid ? `settings-panel-${panelId}` : "settings-panel-invalid"}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <Pressable
          onPress={handleBack}
          className="self-start rounded-full border px-4 py-2"
          style={{ borderColor: colors.border }}
          testID="settings-panel-back"
        >
          <Text style={{ color: colors.textPrimary }}>Back</Text>
        </Pressable>
        {valid && panelId === "goal" ? (
          <Pressable
            onPress={() => goalPanelRef.current?.openSaveConfirm()}
            disabled={!goalSavable}
            className="rounded-full px-4 py-2"
            style={{ opacity: goalSavable ? 1 : 0.45 }}
            testID="settings-goal-save"
            accessibilityLabel="Save goal changes"
          >
            <Text className="text-[15px] font-semibold" style={{ color: colors.accent }}>
              Save
            </Text>
          </Pressable>
        ) : (
          <View className="w-[52px]" />
        )}
      </View>

      {valid && panelId === "you" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <YouPanel />
        </>
      ) : valid && panelId === "account" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <AccountPanel />
        </>
      ) : valid && panelId === "appearance" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <AppearancePanel />
        </>
      ) : valid && panelId === "units" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <UnitsPanel />
        </>
      ) : valid && panelId === "fuel-targets" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <FuelTargetsPanel />
        </>
      ) : valid && panelId === "hydration" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <HydrationPanel />
        </>
      ) : valid && panelId === "goal" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <GoalPanel
            ref={goalPanelRef}
            onSavableChange={setGoalSavable}
            onDismiss={() => router.back()}
          />
        </>
      ) : valid && panelId === "reminders" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <RemindersPanel />
        </>
      ) : valid && panelId === "rest-timer" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <RestTimerPanel />
        </>
      ) : valid && panelId === "equipment" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <EquipmentPanel />
        </>
      ) : valid && panelId === "habits" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <HabitsPanel />
        </>
      ) : valid && panelId === "program" ? (
        <>
          <Text className="mb-4 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          <ProgramPanel />
        </>
      ) : valid ? (
        <SettingsPanelPlaceholder panelId={panelId} title={title} />
      ) : (
        <View>
          <Text className="mb-2 text-[24px] font-bold" style={{ color: colors.textPrimary }}>
            Unknown panel
          </Text>
          <Text style={{ color: colors.textSecondary }}>This settings section is not available.</Text>
        </View>
      )}
    </ScrollView>
  );
}
