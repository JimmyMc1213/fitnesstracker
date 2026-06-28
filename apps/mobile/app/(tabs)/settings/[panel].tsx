import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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
import { SettingsScreenChrome } from "@/components/settings/SettingsScreenChrome";
import { TabScreenFade } from "@/components/motion/TabScreenFade";
import { useAppTheme } from "@/hooks/useAppTheme";
import { isSettingsPanelId, PANEL_TITLES } from "@/lib/settingsPanelRegistry";
import { useTabScreenInsets } from "@/lib/tabScreenInsets";

export default function SettingsPanelScreen() {
  const { colors } = useAppTheme();
  const { contentPaddingBottom } = useTabScreenInsets();
  const { panel } = useLocalSearchParams<{ panel: string }>();
  const panelId = typeof panel === "string" ? panel : "";
  const valid = isSettingsPanelId(panelId);
  const title = valid ? PANEL_TITLES[panelId] : "Settings";
  const goalPanelRef = useRef<GoalPanelHandle>(null);
  const [goalSavable, setGoalSavable] = useState(false);

  useEffect(() => {
    if (panelId === "account") {
      router.replace("/(tabs)/settings/you");
    }
  }, [panelId]);

  const handleBack = () => {
    if (valid && panelId === "goal") {
      goalPanelRef.current?.handleBack(() => router.back());
      return;
    }
    router.back();
  };

  return (
    <TabScreenFade>
    <SettingsScreenChrome
      title={title}
      onBack={handleBack}
      backLabel={valid && panelId === "goal" ? "Back to settings" : "Back"}
      trailing={
        valid && panelId === "goal" ? (
          <Pressable
            onPress={() => goalPanelRef.current?.openSaveConfirm()}
            disabled={!goalSavable}
            className="rounded-full px-2 py-2"
            style={{ opacity: goalSavable ? 1 : 0.45 }}
            testID="settings-goal-save"
            accessibilityLabel="Save goal changes"
          >
            <Text className="text-[15px] font-semibold" style={{ color: colors.textPrimary }}>
              Save
            </Text>
          </Pressable>
        ) : null
      }
      testID={valid ? `settings-panel-${panelId}` : "settings-panel-invalid"}
    >
      <ScrollView
        className="px-screen-x"
        style={{ flex: 1 }}
        nestedScrollEnabled={panelId === "reminders"}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: contentPaddingBottom }}
      >
      {valid && panelId === "you" ? (
        <>
          <YouPanel />
        </>
      ) : valid && panelId === "appearance" ? (
        <>
          <AppearancePanel />
        </>
      ) : valid && panelId === "units" ? (
        <>
          <UnitsPanel />
        </>
      ) : valid && panelId === "fuel-targets" ? (
        <>
          <FuelTargetsPanel />
        </>
      ) : valid && panelId === "hydration" ? (
        <>
          <HydrationPanel />
        </>
      ) : valid && panelId === "goal" ? (
        <>
          <GoalPanel
            ref={goalPanelRef}
            onSavableChange={setGoalSavable}
            onDismiss={() => router.back()}
          />
        </>
      ) : valid && panelId === "reminders" ? (
        <>
          <RemindersPanel />
        </>
      ) : valid && panelId === "rest-timer" ? (
        <>
          <RestTimerPanel />
        </>
      ) : valid && panelId === "equipment" ? (
        <>
          <EquipmentPanel />
        </>
      ) : valid && panelId === "habits" ? (
        <>
          <HabitsPanel />
        </>
      ) : valid && panelId === "program" ? (
        <>
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
    </SettingsScreenChrome>
    </TabScreenFade>
  );
}
