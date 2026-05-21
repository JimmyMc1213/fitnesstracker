import { useEffect, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";

import { generateDailyTasksForDate, localDateKey } from "./dailyPlan";
import { buildHabitsForDateKey } from "./data";
import { refreshStateAfterJimmySeed } from "./jimmy-seed-data";
import { useFitnessSync } from "./FitnessSyncContext";
import { IconBolt, IconDroplet, IconMoon, IconRun, IconX } from "./icons";
import { UnitPreferencePicker } from "./UnitPreferencePicker";
import { EquipmentSetupPicker } from "./EquipmentSetupPicker";
import { buildWorkoutTemplates } from "./workoutTemplateBuilder";
import { NotificationPreferencesPicker } from "./NotificationPreferencesPicker";
import { getNotificationPermission } from "./notificationPermission";
import { SectionLabel } from "./shared";
import { REST_TIMER_PRESETS } from "./restTimerPreferences";
import {
  formatWeightFromLbs,
  heightUnitLabel,
  weightUnitLabel,
} from "./unitPreferences";
import type { AppState, EquipmentSetup, HabitTemplate, MacroTotals, UnitPreferences } from "./types";

function newHabitId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function isValidPlanStartIso(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00`));
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
        border: selected ? "1px solid rgba(255,255,255,0.45)" : "0.5px solid var(--border)",
        background: selected ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
        color: selected ? "#fff" : "rgba(255,255,255,0.45)",
      }}
    >
      <Comp size={14} stroke={1.6} />
    </button>
  );
}

export function SettingsSheet({
  state,
  setState,
  onClose,
}: {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  onClose: () => void;
}) {
  const todayKey = localDateKey(new Date());
  const T = state.nutritionTargets;

  const [calIn, setCalIn] = useState(String(T.cal));
  const [pIn, setPIn] = useState(String(T.p));
  const [cIn, setCIn] = useState(String(T.c));
  const [fIn, setFIn] = useState(String(T.f));

  const sync = useFitnessSync();
  const [syncEmail, setSyncEmail] = useState("");
  const [syncPassword, setSyncPassword] = useState("");
  const [syncHint, setSyncHint] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission);

  useEffect(() => {
    setCalIn(String(T.cal));
    setPIn(String(T.p));
    setCIn(String(T.c));
    setFIn(String(T.f));
  }, [T.cal, T.p, T.c, T.f]);

  function commit(patch: Partial<MacroTotals>) {
    setState((s) => {
      const nutritionTargets = { ...s.nutritionTargets, ...patch };
      return {
        ...s,
        nutritionTargets,
        dailyTasks: generateDailyTasksForDate(
          new Date(),
          nutritionTargets,
          s.planStartIso,
          s.stepsTarget,
          s.workoutTemplates,
        ),
      };
    });
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="page-transition"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 250,
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 4px 10px 16px",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <div id="settings-title" style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em" }}>
          Settings
        </div>
        <button
          type="button"
          className="tap"
          onClick={onClose}
          aria-label="Close settings"
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          <IconX size={20} stroke={1.8} />
        </button>
      </div>

      <div className="screen" style={{ flex: 1, overflow: "auto", paddingBottom: 28 }}>
        <SectionLabel>Sync & backup</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
          Sign in with the same account on your phone and computer. Data merges when both sides edit, and the cloud copy is updated after changes (about a second delay).
        </p>
        {!sync.configured ? (
          <div className="card" style={{ padding: "16px 18px", marginBottom: 18, fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.5)" }}>
            <p style={{ margin: "0 0 10px" }}>
              Cloud sync is off — the app does not see valid Supabase env vars. Fix this, then restart{" "}
              <code style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>npm run dev</code>.
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
              <li style={{ color: "rgba(255,255,255,0.38)", fontSize: 12 }}>
                Dev hint: open the browser console — if env still fails, you’ll see a short{" "}
                <code style={{ fontSize: 11 }}>[Fitcoach]</code> message about what’s missing.
              </li>
            </ul>
          </div>
        ) : !sync.sessionEmail ? (
          <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
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
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
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
                background: sync.busy || !syncEmail.includes("@") || !syncPassword ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.14)",
                color: "#fff",
              }}
            >
              Sign in
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Signed in</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{sync.sessionEmail}</div>
            {sync.lastSyncedLabel ? (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Last uploaded · {sync.lastSyncedLabel}</div>
            ) : (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Waiting for first upload…</div>
            )}
            {sync.busy ? (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Syncing…</div>
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
                  background: "rgba(255,255,255,0.14)",
                  color: "#fff",
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
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        <SectionLabel>Units</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
          Weight and height display units. Logged values are stored consistently — switching units only changes how numbers are shown.
        </p>
        <div className="card" style={{ padding: "16px 18px", marginBottom: 18 }}>
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

        <SectionLabel>Rest timer</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
          Default rest between sets when you mark a set complete. Override per exercise during a workout from the timer bar.
        </p>
        <div className="card" style={{ padding: "16px 18px", marginBottom: 18 }}>
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
                    border: selected ? "0.5px solid rgba(10,132,255,0.55)" : "0.5px solid var(--border)",
                    background: selected ? "rgba(10,132,255,0.15)" : "rgba(255,255,255,0.04)",
                    color: selected ? "#0A84FF" : "rgba(255,255,255,0.65)",
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

        <SectionLabel>Reminders</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
          Workout and nutrition check-in reminders at your chosen times. Reminders appear while Fitcoach is open or
          recently active.
        </p>
        <div style={{ marginBottom: 18 }}>
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
        </div>

        <SectionLabel>Equipment</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
          Workout templates swap exercises to match what you have available.
        </p>
        <div className="card" style={{ padding: "16px 18px", marginBottom: 18 }}>
          <EquipmentSetupPicker
            value={state.equipmentSetup}
            onChange={(next: EquipmentSetup) =>
              setState((s) => ({
                ...s,
                equipmentSetup: next,
                equipmentSetupChosen: true,
                workoutTemplates: buildWorkoutTemplates(s.experienceLevel, next),
              }))
            }
          />
        </div>

        {state.progressGoal ? (
          <>
            <SectionLabel>Goal range</SectionLabel>
            <div className="card" style={{ padding: "16px 18px", marginBottom: 18, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
              {formatWeightFromLbs(state.progressGoal.goalWeightLowLbs, state.unitPreferences.weightUnit)}–
              {formatWeightFromLbs(state.progressGoal.goalWeightHighLbs, state.unitPreferences.weightUnit)}{" "}
              {weightUnitLabel(state.unitPreferences.weightUnit)} · height in {heightUnitLabel(state.unitPreferences.heightUnit)}
            </div>
          </>
        ) : null}

        <SectionLabel>You</SectionLabel>
        <div className="card" style={{ padding: "16px 18px" }}>
          <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            First name (home greeting)
            <input
              className="input"
              style={{ marginTop: 8 }}
              value={state.displayName}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  displayName: e.target.value,
                }))
              }
              placeholder="Jimmy"
              autoCapitalize="words"
              aria-label="Display name"
            />
          </label>
        </div>

        <SectionLabel>Fuel targets</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
          Daily calorie and macro goals used on Home, Fuel, habits copy, and weekly review math.
        </p>
        <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Calories (kcal)
            <input aria-label="Target calories" {...macroFieldProps("cal", calIn, setCalIn)} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Protein (g)
              <input aria-label="Target protein grams" {...macroFieldProps("p", pIn, setPIn)} />
            </label>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Carbs (g)
              <input aria-label="Target carbs grams" {...macroFieldProps("c", cIn, setCIn)} />
            </label>
            <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Fat (g)
              <input aria-label="Target fat grams" {...macroFieldProps("f", fIn, setFIn)} />
            </label>
          </div>
        </div>

        <SectionLabel>Habits checklist</SectionLabel>
        <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.45)", fontWeight: 400 }}>
          Rename, pick an icon, or add rows. The runner icon shows your steps goal and program week on the Habits tab.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {state.habitTemplates.map((h) => (
            <div key={h.id} className="card" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                className="input"
                value={h.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setState((s) => {
                    const templates = s.habitTemplates.map((x) => (x.id === h.id ? { ...x, name } : x));
                    return {
                      ...s,
                      habitTemplates: templates,
                      habits: buildHabitsForDateKey(templates, s.habitsDoneByDay, todayKey),
                    };
                  });
                }}
                aria-label={`Habit name`}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", marginRight: 4 }}>ICON</span>
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
                  onClick={() => {
                    setState((s) => {
                      const templates = s.habitTemplates.filter((x) => x.id !== h.id);
                      const nextDoneByDay = { ...s.habitsDoneByDay };
                      for (const dk of Object.keys(nextDoneByDay)) {
                        const m = nextDoneByDay[dk];
                        if (!m || typeof m !== "object") continue;
                        if (h.id in m) {
                          const { [h.id]: _, ...rest } = m;
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
                  }}
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
              color: "rgba(255,255,255,0.55)",
              background: "transparent",
            }}
          >
            + Add habit
          </button>
        </div>

        <SectionLabel>Program</SectionLabel>
        <div className="card" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Block start date
            <input
              type="date"
              className="input"
              style={{ marginTop: 8 }}
              value={state.planStartIso}
              onChange={(e) => {
                const v = e.target.value;
                if (!isValidPlanStartIso(v)) return;
                setState((s) => ({
                  ...s,
                  planStartIso: v,
                  dailyTasks: generateDailyTasksForDate(new Date(), s.nutritionTargets, v, s.stepsTarget, s.workoutTemplates),
                }));
              }}
              aria-label="Program start date"
            />
          </label>
          <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
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
                  dailyTasks: generateDailyTasksForDate(
                    new Date(),
                    s.nutritionTargets,
                    s.planStartIso,
                    stepsTarget,
                    s.workoutTemplates,
                  ),
                }));
              }}
              aria-label="Daily steps goal"
            />
          </label>
          <button
            type="button"
            className="tap"
            onClick={() => {
              if (
                typeof window !== "undefined" &&
                !window.confirm(
                  "Load Jimmy’s summer plan? This replaces workouts, Saved nutrition presets, habits, macro targets, and goal range. Logs (weight, meals, completions) are kept.",
                )
              )
                return;
              setState(refreshStateAfterJimmySeed());
            }}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              background: "rgba(10,132,255,0.22)",
              color: "#fff",
            }}
          >
            Load my summer plan
          </button>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: "rgba(255,255,255,0.38)", fontWeight: 400 }}>
            Applies 2,000 kcal / 175P targets, Jimmy’s routines (warm-ups included), meal-prep presets, and the 160–165 lb goal band.
          </p>
        </div>
      </div>
    </div>
  );
}
