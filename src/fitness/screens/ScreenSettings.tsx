import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { DeleteConfirmSheet } from "../DeleteConfirmSheet";
import { MOTION_DURATIONS, ScreenTransition } from "../motion";
import { localDateKey } from "../dailyPlan";
import { buildHabitsForDateKey } from "../data";
import { useFitnessSync } from "../FitnessSyncContext";
import {
  IconBell,
  IconBolt,
  IconChevL,
  IconDocument,
  IconDroplet,
  IconDumbbell,
  IconFlag,
  IconFork,
  IconHabits,
  IconLogout,
  IconMail,
  IconMegaphone,
  IconMoon,
  IconRun,
  IconScale,
  IconSettings,
  IconShield,
  IconSun,
  IconSync,
  IconUser,
} from "../icons";
import {
  SettingsComingSoonRow,
  SettingsHubSection,
  SettingsProfileCard,
  SettingsRow,
} from "../SettingsLayout";
import { useTheme } from "../ThemeContext";
import type { AppTheme } from "../theme";
import { UnitPreferencePicker } from "../UnitPreferencePicker";
import { EquipmentSetupPicker } from "../EquipmentSetupPicker";
import { rebuildWorkoutTemplatesForEquipment } from "../workoutTemplateBuilder";
import { EQUIPMENT_SETUP_LABELS } from "../equipmentSetup";
import { NotificationPreferencesPicker } from "../NotificationPreferencesPicker";
import { getNotificationPermission } from "../notificationPermission";
import { REST_TIMER_PRESETS } from "../restTimerPreferences";
import { PRESET_SELECTED_BG, PRESET_SELECTED_BORDER, PRESET_SELECTED_COLOR } from "../workoutUiTokens";
import {
  formatWaterVolumeAlt,
  formatVolumeFromOz,
  normalizeWaterDailyTargetOz,
  parseVolumeToOz,
  waterTargetPresets,
  formatWaterPreset,
} from "../waterIntake";
import {
  formatWeightFromLbs,
  heightUnitLabel,
  volumeUnitLabel,
  weightUnitLabel,
} from "../unitPreferences";
import type { EquipmentSetup, HabitTemplate, MacroTotals, ScreenProps, UnitPreferences } from "../types";
import { sanitizeUserText } from "../userText";

type SettingsPanel =
  | null
  | "you"
  | "account"
  | "appearance"
  | "units"
  | "fuel-targets"
  | "hydration"
  | "reminders"
  | "rest-timer"
  | "equipment"
  | "habits"
  | "program";

const PANEL_TITLES: Record<Exclude<SettingsPanel, null>, string> = {
  you: "You",
  account: "Account",
  appearance: "Appearance",
  units: "Units",
  "fuel-targets": "Fuel targets",
  hydration: "Hydration",
  reminders: "Reminders",
  "rest-timer": "Rest timer",
  equipment: "Equipment",
  habits: "Habits checklist",
  program: "Program",
};

function rowIcon(node: ReactNode) {
  return node;
}

function newHabitId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function iconButton(icon: HabitTemplate["icon"], selected: boolean, onPick: () => void) {
  const Comp = icon === "drop" ? IconDroplet : icon === "run" ? IconRun : icon === "bolt" ? IconBolt : IconMoon;
  return (
    <button
      key={icon}
      type="button"
      className="tap"
      onClick={onPick}
      aria-label={`Icon ${icon}`}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        display: "grid",
        placeItems: "center",
        border: selected ? "1px solid var(--border-strong)" : "0.5px solid var(--border)",
        background: selected ? "var(--surface-4)" : "var(--surface-1)",
        color: selected ? "var(--text-primary)" : "var(--text-faint-soft)",
      }}
    >
      <Comp size={14} stroke={1.6} />
    </button>
  );
}

function SettingsHelper({ children }: { children: ReactNode }) {
  return <p className="settings-detail-helper">{children}</p>;
}

export function ScreenSettings({ state, setState, navigate }: ScreenProps) {
  const todayKey = localDateKey(new Date());
  const T = state.nutritionTargets;

  const [panel, setPanel] = useState<SettingsPanel>(null);
  const [titleKey, setTitleKey] = useState<Exclude<SettingsPanel, null> | "hub">("hub");
  const [calIn, setCalIn] = useState(String(T.cal));
  const [pIn, setPIn] = useState(String(T.p));
  const [cIn, setCIn] = useState(String(T.c));
  const [fIn, setFIn] = useState(String(T.f));

  const volumeUnit = state.unitPreferences.volumeUnit;

  const [waterTargetIn, setWaterTargetIn] = useState(() =>
    formatVolumeFromOz(state.waterDailyTargetOz, volumeUnit),
  );

  const sync = useFitnessSync();
  const { theme, setTheme } = useTheme();
  const [syncEmail, setSyncEmail] = useState("");
  const [syncPassword, setSyncPassword] = useState("");
  const [syncHint, setSyncHint] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission);
  const [pendingHabitRemove, setPendingHabitRemove] = useState<{ id: string; name: string } | null>(null);
  const activeScrollElRef = useRef<HTMLDivElement | null>(null);
  const hubScrollTopRef = useRef(0);

  function bindSettingsScrollRef(layerKey: SettingsPanel | "hub") {
    return (el: HTMLDivElement | null) => {
      if (layerKey !== (panel ?? "hub")) return;
      activeScrollElRef.current = el;
      if (!el) return;
      el.style.overflow = "";
      el.scrollTop = layerKey === "hub" ? hubScrollTopRef.current : 0;
    };
  }

  useEffect(() => {
    if (panel === null) {
      setTitleKey("hub");
      return;
    }
    const id = window.setTimeout(() => setTitleKey(panel), MOTION_DURATIONS.tab);
    return () => window.clearTimeout(id);
  }, [panel]);

  function openPanel(next: Exclude<SettingsPanel, null>) {
    if (panel === null && activeScrollElRef.current) {
      hubScrollTopRef.current = activeScrollElRef.current.scrollTop;
    }
    setPanel(next);
  }

  function closePanel() {
    setPanel(null);
  }

  function handleHeaderBack() {
    if (panel) {
      closePanel();
      return;
    }
    const scrollEl = activeScrollElRef.current;
    if (scrollEl) {
      scrollEl.style.overflow = "hidden";
    }
    navigate("home");
  }

  useEffect(() => {
    setCalIn(String(T.cal));
    setPIn(String(T.p));
    setCIn(String(T.c));
    setFIn(String(T.f));
  }, [T.cal, T.p, T.c, T.f]);

  useEffect(() => {
    setWaterTargetIn(formatVolumeFromOz(state.waterDailyTargetOz, volumeUnit));
  }, [state.waterDailyTargetOz, volumeUnit]);

  function commitWaterTarget(raw: string) {
    const n = volumeUnit === "L" ? parseFloat(raw) : parseInt(raw, 10);
    const ozRaw = volumeUnit === "L" ? parseVolumeToOz(n, "L") : n;
    const val = normalizeWaterDailyTargetOz(Number.isFinite(ozRaw) ? ozRaw : undefined);
    setWaterTargetIn(formatVolumeFromOz(val, volumeUnit));
    setState((s) => ({
      ...s,
      waterDailyTargetOz: val,
    }));
  }

  function commit(patch: Partial<MacroTotals>) {
    setState((s) => ({
      ...s,
      nutritionTargets: { ...s.nutritionTargets, ...patch },
    }));
  }

  function macroFieldProps(key: keyof MacroTotals, raw: string, setRaw: (v: string) => void) {
    return {
      value: raw,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setRaw(v);
        if (v === "" || v === "-") return;
        const n = parseFloat(v);
        if (Number.isFinite(n) && n >= 0) commit({ [key]: n } as Partial<MacroTotals>);
      },
      onBlur: () => {
        const n = parseFloat(raw);
        const val = Number.isFinite(n) && n >= 0 ? n : 0;
        setRaw(String(val));
        commit({ [key]: val } as Partial<MacroTotals>);
      },
      inputMode: "decimal" as const,
      className: "input",
      style: { marginTop: 8, fontVariantNumeric: "tabular-nums" as const },
    };
  }

  const headerTitle = titleKey === "hub" ? "Settings" : PANEL_TITLES[titleKey];

  function renderHub() {
    const accountTrailing = !sync.configured
      ? "Not configured"
      : sync.sessionEmail
        ? sync.lastSyncedLabel ?? "Signed in"
        : "Sign in";

    return (
      <>
        <SettingsProfileCard name={state.displayName} onClick={() => openPanel("you")} />

        <SettingsHubSection title="Account">
          <SettingsRow
            icon={rowIcon(<IconSync size={16} stroke={1.6} />)}
            label="Sync & backup"
            trailing={accountTrailing}
            onClick={() => openPanel("account")}
          />
        </SettingsHubSection>

        <SettingsHubSection title="Preferences">
          <SettingsRow
            icon={rowIcon(theme === "dark" ? <IconMoon size={16} stroke={1.6} /> : <IconSun size={16} stroke={1.6} />)}
            label="Appearance"
            trailing={theme === "dark" ? "Dark" : "Light"}
            onClick={() => openPanel("appearance")}
          />
          <SettingsRow
            icon={rowIcon(<IconScale size={16} stroke={1.6} />)}
            label="Units"
            trailing={`${weightUnitLabel(state.unitPreferences.weightUnit)}, ${volumeUnitLabel(state.unitPreferences.volumeUnit)}`}
            onClick={() => openPanel("units")}
          />
        </SettingsHubSection>

        <SettingsHubSection title="Goals & tracking">
          <SettingsRow
            icon={rowIcon(<IconFork size={16} stroke={1.6} />)}
            label="Fuel targets"
            trailing={`${T.cal} kcal`}
            onClick={() => openPanel("fuel-targets")}
          />
          <SettingsRow
            icon={rowIcon(<IconDroplet size={16} stroke={1.6} />)}
            label="Hydration"
            trailing={formatVolumeFromOz(state.waterDailyTargetOz, volumeUnit)}
            onClick={() => openPanel("hydration")}
          />
          {state.progressGoal ? (
            <SettingsRow
              icon={rowIcon(<IconFlag size={16} stroke={1.6} />)}
              label="Goal range"
              trailing={`${formatWeightFromLbs(state.progressGoal.goalWeightLowLbs, state.unitPreferences.weightUnit)}–${formatWeightFromLbs(state.progressGoal.goalWeightHighLbs, state.unitPreferences.weightUnit)} ${weightUnitLabel(state.unitPreferences.weightUnit)}`}
              disabled
            />
          ) : null}
          <SettingsRow
            icon={rowIcon(<IconBell size={16} stroke={1.6} />)}
            label="Tracking reminders"
            onClick={() => openPanel("reminders")}
          />
          <SettingsRow
            icon={rowIcon(<IconRun size={16} stroke={1.6} />)}
            label="Program"
            trailing={`${state.stepsTarget.toLocaleString()} steps`}
            onClick={() => openPanel("program")}
          />
        </SettingsHubSection>

        <SettingsHubSection title="Training">
          <SettingsRow
            icon={rowIcon(<IconSettings size={16} stroke={1.6} />)}
            label="Rest timer"
            trailing={`${state.restTimerDefaultSeconds}s`}
            onClick={() => openPanel("rest-timer")}
          />
          <SettingsRow
            icon={rowIcon(<IconDumbbell size={16} stroke={1.6} />)}
            label="Equipment"
            trailing={EQUIPMENT_SETUP_LABELS[state.equipmentSetup]}
            onClick={() => openPanel("equipment")}
          />
        </SettingsHubSection>

        <SettingsHubSection title="Habits">
          <SettingsRow
            icon={rowIcon(<IconHabits size={16} stroke={1.6} />)}
            label="Daily habits checklist"
            trailing={`${state.habitTemplates.length} habits`}
            onClick={() => openPanel("habits")}
          />
        </SettingsHubSection>

        <SettingsHubSection title="Legal">
          <SettingsComingSoonRow icon={rowIcon(<IconDocument size={16} stroke={1.6} />)} label="Terms of service" />
          <SettingsComingSoonRow icon={rowIcon(<IconShield size={16} stroke={1.6} />)} label="Privacy policy" />
          <SettingsComingSoonRow icon={rowIcon(<IconMail size={16} stroke={1.6} />)} label="Support email" />
          <SettingsComingSoonRow icon={rowIcon(<IconMegaphone size={16} stroke={1.6} />)} label="Request a feature" />
        </SettingsHubSection>

        <SettingsHubSection title="Socials">
          <SettingsComingSoonRow icon={rowIcon(<IconUser size={16} stroke={1.6} />)} label="Instagram" />
          <SettingsComingSoonRow icon={rowIcon(<IconUser size={16} stroke={1.6} />)} label="TikTok" />
          <SettingsComingSoonRow icon={rowIcon(<IconUser size={16} stroke={1.6} />)} label="X" />
        </SettingsHubSection>

        {sync.sessionEmail ? (
          <SettingsHubSection title="Account actions">
            <div className="settings-sign-out-row">
              <SettingsRow
                icon={rowIcon(<IconLogout size={16} stroke={1.6} />)}
                label="Sign out"
                trailing={null}
                onClick={() => void sync.signOut()}
              />
            </div>
          </SettingsHubSection>
        ) : null}
      </>
    );
  }

  function renderYouPanel() {
    return (
      <>
        <SettingsHelper>Your first name appears in the home greeting.</SettingsHelper>
        <div className="card settings-detail-card">
          <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            First name
            <input
              className="input"
              style={{ marginTop: 8 }}
              value={state.displayName}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  displayName: sanitizeUserText(e.target.value),
                }))
              }
              placeholder="Your name"
              autoCapitalize="words"
              aria-label="Display name"
            />
          </label>
        </div>
      </>
    );
  }

  function renderAccountPanel() {
    return (
      <>
        <SettingsHelper>
          Sign in with the same account on your phone and computer. Data merges when both sides edit, and the cloud copy is updated after changes (about a second delay).
        </SettingsHelper>
        {!sync.configured ? (
          <div className="card settings-detail-card" style={{ fontSize: 13, lineHeight: 1.55, color: "var(--text-secondary)" }}>
            <p style={{ margin: "0 0 10px" }}>
              Cloud sync is off, the app does not see valid Supabase env vars. Fix this, then restart{" "}
              <code style={{ fontSize: 12, color: "var(--text-soft)" }}>npm run dev</code>.
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                File must be named <code style={{ fontSize: 12 }}>.env</code> in the project root (same folder as{" "}
                <code style={{ fontSize: 12 }}>package.json</code>), not inside <code style={{ fontSize: 12 }}>src</code>.
              </li>
              <li>
                Exact lines: <code style={{ fontSize: 12 }}>VITE_SUPABASE_URL=https://…supabase.co</code> and{" "}
                <code style={{ fontSize: 12 }}>VITE_SUPABASE_ANON_KEY=…</code> (anon JWT <code style={{ fontSize: 11 }}>eyJ…</code>), or{" "}
                <code style={{ fontSize: 12 }}>VITE_SUPABASE_PUBLISHABLE_KEY=…</code>. Never the secret JWT. No spaces around{" "}
                <code style={{ fontSize: 12 }}>=</code>.
              </li>
              <li>
                URL must start with <code style={{ fontSize: 12 }}>https://</code>. Restart the dev server after saving.
              </li>
              <li style={{ color: "var(--text-ghost)", fontSize: 12 }}>
                Dev hint: open the browser console, if env still fails, you’ll see a short{" "}
                <code style={{ fontSize: 11 }}>[Fitcoach]</code> message about what’s missing.
              </li>
            </ul>
          </div>
        ) : !sync.sessionEmail ? (
          <div className="card settings-detail-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Email
              <input
                className="input"
                style={{ marginTop: 8 }}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={syncEmail}
                onChange={(e) => setSyncEmail(e.target.value)}
                aria-label="Email"
              />
            </label>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Password
              <input
                className="input"
                style={{ marginTop: 8 }}
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={syncPassword}
                onChange={(e) => setSyncPassword(e.target.value)}
                aria-label="Password"
              />
            </label>
            {syncHint ? (
              <p style={{ margin: 0, fontSize: 13, color: "rgba(120,200,255,0.95)", lineHeight: 1.45 }}>{syncHint}</p>
            ) : null}
            {sync.lastError ? (
              <p style={{ margin: 0, fontSize: 13, color: "rgba(248,113,113,0.95)", lineHeight: 1.45 }}>{sync.lastError}</p>
            ) : null}
            <button
              type="button"
              className="tap"
              disabled={sync.busy || !syncEmail.includes("@") || !syncPassword}
              onClick={async () => {
                setSyncHint(null);
                const r = await sync.signInWithPassword(syncEmail, syncPassword);
                if (r.error) setSyncHint(r.error);
                else setSyncHint("Signed in. Sync continues automatically.");
              }}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                background: sync.busy || !syncEmail.includes("@") || !syncPassword ? "var(--btn-disabled-bg)" : "var(--surface-selected)",
                color: "var(--text-primary)",
              }}
            >
              Sign in
            </button>
          </div>
        ) : (
          <div className="card settings-detail-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Signed in</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{sync.sessionEmail}</div>
            {sync.lastSyncedLabel ? (
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Last uploaded · {sync.lastSyncedLabel}</div>
            ) : (
              <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Waiting for first upload…</div>
            )}
            {sync.busy ? (
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Syncing…</div>
            ) : null}
            {sync.lastError ? (
              <p style={{ margin: 0, fontSize: 13, color: "rgba(248,113,113,0.95)", lineHeight: 1.45 }}>{sync.lastError}</p>
            ) : null}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="tap"
                disabled={sync.busy}
                onClick={() => void sync.syncNow()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  border: "none",
                  background: "var(--surface-selected)",
                  color: "var(--text-primary)",
                }}
              >
                Sync now
              </button>
              <button
                type="button"
                className="tap"
                onClick={() => void sync.signOut()}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 13,
                  border: "none",
                  background: "var(--surface-3)",
                  color: "var(--text-secondary)",
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  function renderAppearancePanel() {
    return (
      <>
        <SettingsHelper>Choose light or dark mode for the app interface.</SettingsHelper>
        <div className="card settings-detail-card" style={{ display: "flex", gap: 8 }}>
          {(["dark", "light"] as AppTheme[]).map((option) => {
            const active = theme === option;
            return (
              <button
                key={option}
                type="button"
                className="tap"
                aria-pressed={active}
                onClick={() => setTheme(option)}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  border: active ? "2px solid #3B82F6" : "1px solid var(--border)",
                  background: active ? "rgba(59, 130, 246, 0.12)" : "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                {option === "dark" ? "Dark" : "Light"}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  function renderUnitsPanel() {
    return (
      <>
        <SettingsHelper>
          Weight, height, and hydration display units. Logged values are stored consistently; switching units only changes how numbers are shown.
        </SettingsHelper>
        <div className="card settings-detail-card">
          <UnitPreferencePicker
            value={state.unitPreferences}
            onChange={(next: UnitPreferences) =>
              setState((s) => ({
                ...s,
                unitPreferences: next,
              }))
            }
          />
        </div>
      </>
    );
  }

  function renderRestTimerPanel() {
    return (
      <>
        <SettingsHelper>Default rest between sets. Tap the timer line on any exercise to change it for that exercise.</SettingsHelper>
        <div className="card settings-detail-card">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {REST_TIMER_PRESETS.map((sec) => {
              const selected = state.restTimerDefaultSeconds === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  className="tap"
                  aria-pressed={selected}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      restTimerDefaultSeconds: sec,
                    }))
                  }
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: selected ? `0.5px solid ${PRESET_SELECTED_BORDER}` : "0.5px solid var(--border)",
                    background: selected ? PRESET_SELECTED_BG : "var(--surface-1)",
                    color: selected ? PRESET_SELECTED_COLOR : "var(--text-muted-soft)",
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {sec}s
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  function renderRemindersPanel() {
    return (
      <NotificationPreferencesPicker
        value={state.notificationPreferences}
        onChange={(notificationPreferences) =>
          setState((s) => ({
            ...s,
            notificationPreferences,
          }))
        }
        permission={notificationPermission}
        onPermissionChange={setNotificationPermission}
        showPermissionHint
      />
    );
  }

  function renderHydrationPanel() {
    return (
      <>
        <SettingsHelper>Daily water intake target on the Nutrition tab. Display follows your volume unit in Preferences.</SettingsHelper>
        <div className="card settings-detail-card">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {waterTargetPresets(volumeUnit).map((preset) => {
              const presetOz =
                volumeUnit === "L"
                  ? normalizeWaterDailyTargetOz(parseVolumeToOz(preset, "L"))
                  : preset;
              const selected = state.waterDailyTargetOz === presetOz;
              return (
                <button
                  key={preset}
                  type="button"
                  className="tap"
                  aria-pressed={selected}
                  onClick={() => commitWaterTarget(String(preset))}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: selected ? `0.5px solid ${PRESET_SELECTED_BORDER}` : "0.5px solid var(--border)",
                    background: selected ? PRESET_SELECTED_BG : "var(--surface-1)",
                    color: selected ? PRESET_SELECTED_COLOR : "var(--text-muted-soft)",
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatWaterPreset(preset, volumeUnit)}
                </button>
              );
            })}
          </div>
          <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Custom target ({volumeUnitLabel(volumeUnit)})
            <input
              type="number"
              min={volumeUnit === "L" ? 0.5 : 16}
              max={volumeUnit === "L" ? 7.5 : 256}
              step={volumeUnit === "L" ? 0.1 : 1}
              inputMode="decimal"
              className="input"
              style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
              value={waterTargetIn}
              onChange={(e) => {
                const v = e.target.value;
                setWaterTargetIn(v);
                if (v === "" || v === "-") return;
                const n = volumeUnit === "L" ? parseFloat(v) : parseInt(v, 10);
                if (!Number.isFinite(n)) return;
                const ozRaw = volumeUnit === "L" ? parseVolumeToOz(n, "L") : n;
                if (ozRaw >= 16 && ozRaw <= 256) {
                  setState((s) => ({
                    ...s,
                    waterDailyTargetOz: Math.round(ozRaw),
                  }));
                }
              }}
              onBlur={() => commitWaterTarget(waterTargetIn)}
              aria-label={`Daily water target in ${volumeUnitLabel(volumeUnit)}`}
            />
          </label>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginTop: 8 }}>
            {formatWaterVolumeAlt(state.waterDailyTargetOz, volumeUnit)}
          </div>
        </div>
      </>
    );
  }

  function renderEquipmentPanel() {
    return (
      <>
        <SettingsHelper>Workout templates swap exercises to match what you have available.</SettingsHelper>
        <div className="card settings-detail-card">
          <EquipmentSetupPicker
            value={state.equipmentSetup}
            onChange={(next: EquipmentSetup) =>
              setState((s) => ({
                ...s,
                equipmentSetup: next,
                equipmentSetupChosen: true,
                workoutTemplates: rebuildWorkoutTemplatesForEquipment(s, s.experienceLevel, next),
              }))
            }
          />
        </div>
      </>
    );
  }

  function renderFuelTargetsPanel() {
    return (
      <>
        <SettingsHelper>Daily calorie and macro goals used on Home, Fuel, habits copy, and weekly review math.</SettingsHelper>
        <div className="card settings-detail-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Calories (kcal)
            <input aria-label="Target calories" {...macroFieldProps("cal", calIn, setCalIn)} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Protein (g)
              <input aria-label="Target protein grams" {...macroFieldProps("p", pIn, setPIn)} />
            </label>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Carbs (g)
              <input aria-label="Target carbs grams" {...macroFieldProps("c", cIn, setCIn)} />
            </label>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Fat (g)
              <input aria-label="Target fat grams" {...macroFieldProps("f", fIn, setFIn)} />
            </label>
          </div>
        </div>
      </>
    );
  }

  function renderHabitsPanel() {
    return (
      <>
        <SettingsHelper>
          Rename, pick an icon, or add rows. The runner icon shows your steps goal on the Home daily habits card.
        </SettingsHelper>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {state.habitTemplates.map((h) => (
            <div key={h.id} className="card" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                className="input"
                value={h.name}
                onChange={(e) => {
                  const name = sanitizeUserText(e.target.value);
                  setState((s) => {
                    const templates = s.habitTemplates.map((x) => (x.id === h.id ? { ...x, name } : x));
                    return {
                      ...s,
                      habitTemplates: templates,
                      habits: buildHabitsForDateKey(templates, s.habitsDoneByDay, todayKey),
                    };
                  });
                }}
                aria-label="Habit name"
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", marginRight: 4 }}>ICON</span>
                {(["drop", "run", "bolt", "moon"] as const).map((ic) =>
                  iconButton(ic, h.icon === ic, () => {
                    setState((s) => {
                      const templates = s.habitTemplates.map((x) => (x.id === h.id ? { ...x, icon: ic } : x));
                      return {
                        ...s,
                        habitTemplates: templates,
                        habits: buildHabitsForDateKey(templates, s.habitsDoneByDay, todayKey),
                      };
                    });
                  }),
                )}
                <button
                  type="button"
                  className="tap"
                  onClick={() => setPendingHabitRemove({ id: h.id, name: h.name.trim() || "this habit" })}
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "rgba(248,113,113,0.95)",
                    padding: "6px 10px",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="tap"
            onClick={() => {
              setState((s) => {
                const templates = [...s.habitTemplates, { id: newHabitId(), name: "New habit", icon: "bolt" }];
                return {
                  ...s,
                  habitTemplates: templates,
                  habits: buildHabitsForDateKey(templates, s.habitsDoneByDay, todayKey),
                };
              });
            }}
            style={{
              border: "0.5px dashed var(--border)",
              borderRadius: 12,
              padding: 14,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-secondary)",
              background: "transparent",
            }}
          >
            + Add habit
          </button>
        </div>
      </>
    );
  }

  function renderProgramPanel() {
    return (
      <>
        {state.progressGoal ? (
          <>
            <h2 className="settings-inline-label">Goal range</h2>
            <div className="card settings-detail-card" style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {formatWeightFromLbs(state.progressGoal.goalWeightLowLbs, state.unitPreferences.weightUnit)}–
              {formatWeightFromLbs(state.progressGoal.goalWeightHighLbs, state.unitPreferences.weightUnit)}{" "}
              {weightUnitLabel(state.unitPreferences.weightUnit)} · height in {heightUnitLabel(state.unitPreferences.heightUnit)}
            </div>
          </>
        ) : null}
        <div className="card settings-detail-card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Steps goal
            <input
              type="number"
              inputMode="numeric"
              className="input"
              style={{ marginTop: 8, fontVariantNumeric: "tabular-nums" }}
              value={state.stepsTarget}
              min={1000}
              max={100000}
              step={500}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (!Number.isFinite(n)) return;
                const stepsTarget = Math.min(100_000, Math.max(1000, n));
                setState((s) => ({
                  ...s,
                  stepsTarget,
                }));
              }}
              aria-label="Daily steps goal"
            />
          </label>
        </div>
      </>
    );
  }

  function renderPanelByKey(panelKey: SettingsPanel | "hub") {
    switch (panelKey) {
      case "you":
        return renderYouPanel();
      case "account":
        return renderAccountPanel();
      case "appearance":
        return renderAppearancePanel();
      case "units":
        return renderUnitsPanel();
      case "fuel-targets":
        return renderFuelTargetsPanel();
      case "hydration":
        return renderHydrationPanel();
      case "reminders":
        return renderRemindersPanel();
      case "rest-timer":
        return renderRestTimerPanel();
      case "equipment":
        return renderEquipmentPanel();
      case "habits":
        return renderHabitsPanel();
      case "program":
        return renderProgramPanel();
      default:
        return renderHub();
    }
  }

  return (
    <div className="settings-screen">
      <header className="settings-sheet-header">
        <div className="settings-sheet-header__side">
          <button
            type="button"
            className="tap settings-sheet-header__icon-btn"
            onClick={handleHeaderBack}
            aria-label={panel ? "Back to settings" : "Back to home"}
          >
            <IconChevL size={20} stroke={1.8} />
          </button>
        </div>
        <h1 id="settings-title" className="settings-sheet-header__title">
          {headerTitle}
        </h1>
        <div className="settings-sheet-header__side">
          <span className="settings-sheet-header__spacer" aria-hidden />
        </div>
      </header>

      <ScreenTransition activeKey={panel ?? "hub"} variant="fade">
        {(layerKey) => (
          <div ref={bindSettingsScrollRef(layerKey as SettingsPanel | "hub")} className="settings-sheet-body">
            {renderPanelByKey(layerKey as SettingsPanel | "hub")}
          </div>
        )}
      </ScreenTransition>
      {pendingHabitRemove ? (
        <DeleteConfirmSheet
          title="Remove habit?"
          cancelLabel="Keep habit"
          confirmLabel="Remove habit"
          zIndex={1300}
          message={
            <>
              Remove <strong style={{ color: "var(--text-primary)" }}>{pendingHabitRemove.name}</strong> from your
              daily checklist? This can&apos;t be undone.
            </>
          }
          onCancel={() => setPendingHabitRemove(null)}
          onConfirm={() => {
            const habitId = pendingHabitRemove.id;
            setState((s) => {
              const templates = s.habitTemplates.filter((x) => x.id !== habitId);
              const nextDoneByDay = { ...s.habitsDoneByDay };
              for (const dk of Object.keys(nextDoneByDay)) {
                const m = nextDoneByDay[dk];
                if (!m || typeof m !== "object") continue;
                if (habitId in m) {
                  const { [habitId]: _, ...rest } = m;
                  nextDoneByDay[dk] = rest;
                }
              }
              return {
                ...s,
                habitTemplates: templates,
                habitsDoneByDay: nextDoneByDay,
                habits: buildHabitsForDateKey(templates, nextDoneByDay, todayKey),
              };
            });
            setPendingHabitRemove(null);
          }}
        />
      ) : null}
    </div>
  );
}
