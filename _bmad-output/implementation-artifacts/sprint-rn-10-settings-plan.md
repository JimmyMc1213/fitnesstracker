# Sprint RN-10 — Settings & account

**Planned:** 2026-06-13  
**Last updated:** 2026-06-13 (swarm-ready — all 6 story files created)  
**Epic:** `epic-rn-10`  
**Swarm branch:** `epic-rn-10/settings-account`  
**Goal:** Replace the `(tabs)/settings` stub hub and placeholder panel shells with PWA-parity Settings — full hub (13 panels + sub-layers), account management (email, password, sign-out, delete), preferences (appearance, units), goals & tracking (fuel, hydration, goal, reminders, program), training prefs (rest timer, equipment), habits editor, legal/socials, and Maestro `rn-settings.yaml` + updated sign-out flow.

**PRD:** [`prd-rn-migration.md`](../planning-artifacts/prd-rn-migration.md) FR-M10 (Settings)  
**Architecture:** [`architecture-rn-migration.md`](../planning-artifacts/architecture-rn-migration.md) §3 `(tabs)/settings` + `[panel]` stack  
**Epic spec:** [`epics-rn-migration.md`](../planning-artifacts/epics-rn-migration.md) RN-10 (6 stories)  
**Inventory:** [`pwa-codebase-inventory.md`](../planning-artifacts/pwa-codebase-inventory.md) ST-00 … ST-13  
**PWA reference:** `ScreenSettings.tsx`, `SettingsLayout.tsx`, `goalSettings.ts`, `unitPreferences.ts`, `NotificationPreferencesPicker.tsx`, `RestTimerDurationPicker.tsx`, `EquipmentSetupPicker.tsx`, `GoalSettingsPicker.tsx`  
**Tracking:** [`sprint-status-rn-migration.yaml`](sprint-status-rn-migration.yaml)

---

## Sprint goal (one sentence)

An onboarded user opens Settings from the tab bar, navigates all hub sections and 13 panels with PWA-parity edits persisted to fitness state, can change password and email, sign out, delete their account via `delete-user`, and Maestro `rn-settings.yaml` + `rn-auth-sign-out.yaml` pass on simulator.

---

## BMad swarm alignment

| Field | Value |
|-------|--------|
| Swarm mode | `epic-rn-10` |
| Branch | `epic-rn-10/settings-account` |
| Start story | **RN-10-01** (`rn-10-01-settings-core-extract-hub-shell.md`) |
| Story files | Under `implementation-artifacts/rn-10-*.md` |
| Gate (every story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Gate (logic stories) | `npm run test --workspace=@newyouai/core` when touching `packages/core` |
| Gate (api stories) | `npm run test --workspace=@newyouai/api-client` when touching `packages/api-client` |
| Gate (epic close) | `rn-settings.yaml` + `rn-auth-sign-out.yaml` + full Maestro regression green |

**Kickoff:** `/bmad-swarm epic-rn-10` or `dev this story rn-10-01-settings-core-extract-hub-shell.md`

**Swarm order (strict):**

```
RN-10-01 → RN-10-02 → RN-10-03 → RN-10-04 → RN-10-05 → RN-10-06 → epic-rn-10-retrospective
```

---

## Starting point

| Item | Status | Notes |
|------|--------|-------|
| RN-0 … RN-9 | **Done** | Foundation through Future You complete |
| `(tabs)/settings` stack | **Scaffold (RN-3)** | `_layout.tsx` Stack; hub lists 2 sample panels only |
| `[panel].tsx` | **Stub** | Generic shell + "Settings panel content ships in RN-10." |
| Deep link `newyouai://settings/account` | **Done (RN-3)** | Routes to `[panel]` dynamic segment |
| `packages/core/sync/unitPreferences` | **Partial** | Normalizer in core; full picker UI not in settings |
| `goalSettings.ts` | **PWA-only** | Extract in RN-10-01; Vitest `goalSettings.test.ts` |
| `UnitPreferencePicker` | **Onboarding only** | `apps/mobile/components/onboarding/` — reuse in RN-10-03 |
| `useAppTheme` / theme toggle | **Partial** | Theme context exists; no settings panel |
| `AuthContext.signOut` | **Done (RN-2)** | No settings UI; Maestro still targets missing `home-sign-out` |
| `delete-user` Edge Function | **Shipped** | `supabase/functions/delete-user`; PWA `fitnessCloudSync.deleteAccount` |
| Fitness cloud sync adapter | **Out of scope** | RN-OFFLINE — account panel shows status; no full pull/push |
| Push notification scheduling | **Out of scope** | RN-PUSH — reminders panel UI only (toggles, permission status) |
| RevenueCat restore purchases | **Out of scope** | RN-STORE — account panel stub OK |
| Maestro settings | **Missing** | Trace matrix expects settings UAT or `rn-settings.yaml` |

---

## Execute in this order

| # | Story | Story file | PWA panels | PR target | Status |
|---|-------|------------|------------|-----------|--------|
| 1 | **RN-10-01** | `rn-10-01-settings-core-extract-hub-shell.md` | ST-00 hub + layout | 1 PR | ready-for-dev |
| 2 | **RN-10-02** | `rn-10-02-you-account-panels.md` | ST-01, ST-02, ST-03 | 1 PR | ready-for-dev |
| 3 | **RN-10-03** | `rn-10-03-appearance-units-panels.md` | ST-04, ST-05 | 1 PR | ready-for-dev |
| 4 | **RN-10-04** | `rn-10-04-fuel-hydration-goal-panels.md` | ST-06, ST-07, ST-08 | 1 PR | ready-for-dev |
| 5 | **RN-10-05** | `rn-10-05-reminders-training-habits-program.md` | ST-09–ST-13 | 1 PR | ready-for-dev |
| 6 | **RN-10-06** | `rn-10-06-hub-actions-maestro-polish.md` | Hub actions + Maestro | 1 PR | ready-for-dev |
| 7 | Retro | `epic-rn-10-retrospective` | — | — | optional |

---

## RN-10-01 — Settings core extract + hub shell

**Story file:** `rn-10-01-settings-core-extract-hub-shell.md`

**Deliverables:**

- Extract to `packages/core/src/settings/` (PWA re-exports unchanged):
  - `goalSettings.ts` + colocated Vitest (from `apps/pwa/src/fitness/goalSettings.ts`)
  - `macroLimits.ts` if not already shared (fuel panel dependency)
- Port `SettingsLayout` primitives → `apps/mobile/components/settings/`:
  - `SettingsHubSection`, `SettingsRow`, `SettingsProfileCard`, `SettingsComingSoonRow`
- Replace `settings/index.tsx` stub with full PWA hub (`renderHub()` sections):
  - Account, Preferences, Goals & tracking, Training, Habits, Legal, Socials, Account actions (sign-out/delete rows present; wire in RN-10-06)
- Register all 13 panel route IDs in hub + `[panel].tsx` shell router:
  - `you`, `account`, `appearance`, `units`, `fuel-targets`, `hydration`, `goal`, `reminders`, `rest-timer`, `equipment`, `habits`, `program`
- Panel shells: header back nav, title from `PANEL_TITLES`, body placeholder until story owns panel
- `testID` parity: `settings-hub`, `settings-panel-{id}`, `settings-profile-card`

**PWA ref:** `ScreenSettings.tsx` `renderHub()`, `SettingsLayout.tsx`, `goalSettings.ts`  
**Do not:** Panel form content (RN-10-02..05); delete/sign-out handlers (RN-10-06)

---

## RN-10-02 — You + Account panels

**Story file:** `rn-10-02-you-account-panels.md`

**Deliverables:**

- **You panel (ST-01):** display name edit, personal info rows, connected accounts (Apple/Google badges)
- **Change password sub-layer (ST-02):** nested stack or in-panel layer; Supabase `updateUser` password flow; error/success states
- **Account panel (ST-03):** email display + edit (`updateUser` email), sync status row (read-only last-synced label when sync unavailable)
- Wire `AuthContext` session email for account rows
- `testID`: `settings-you-display-name`, `settings-change-password`, `settings-account-email`

**PWA ref:** `ScreenSettings.tsx` you/account renderers, `FitnessSyncContext`  
**Do not:** Full cloud sync sign-in UI (RN-OFFLINE); delete account (RN-10-06)

---

## RN-10-03 — Appearance + Units panels

**Story file:** `rn-10-03-appearance-units-panels.md`

**Deliverables:**

- **Appearance (ST-04):** Light/Dark toggle via `useAppTheme` / theme context — match PWA `ThemeContext`
- **Units (ST-05):** Reuse `UnitPreferencePicker` from onboarding; persist `unitPreferences` + `unitPreferencesChosen` via `FitnessProvider`
- Hub trailing labels update live (weight + volume unit summary)
- Port/adapt `unitPreferences.test.ts` coverage via core if any logic moves

**PWA ref:** `ScreenSettings.tsx` appearance/units sections, `UnitPreferencePicker.tsx`  
**Do not:** Fuel/goal panels (RN-10-04)

---

## RN-10-04 — Fuel targets + Hydration + Goal panels

**Story file:** `rn-10-04-fuel-hydration-goal-panels.md`

**Deliverables:**

- **Fuel targets (ST-06):** macro inputs (cal/P/C/F) with `clampMacroInputString` / `macroLimits`; persist `nutritionTargets`
- **Hydration (ST-07):** water daily target presets + custom volume input; `normalizeWaterDailyTargetOz`
- **Goal (ST-08):** `GoalSettingsPicker` + draft dirty detection (`isGoalSettingsDirty`); save/discard confirm sheets (`SaveGoalConfirmSheet`, `DiscardGoalChangesConfirmSheet`); `applyGoalSettingsDraft` updates `onboardingProfile` + `progressGoal`
- Unblocks RN-8 Progress targets grid → editable source of truth
- Unblocks RN-7 nutrition dashboard target display consistency

**PWA ref:** `ScreenSettings.tsx` fuel/hydration/goal panels, `GoalSettingsPicker.tsx`, `GoalSettingsConfirmSheets.tsx`, `waterIntake.ts`  
**Do not:** Reminders/program (RN-10-05)

---

## RN-10-05 — Reminders + Training + Habits + Program panels

**Story file:** `rn-10-05-reminders-training-habits-program.md`

**Deliverables:**

- **Reminders (ST-09):** `NotificationPreferencesPicker` port; permission status row (`expo-notifications` getPermissionsAsync); Future You reminder toggle when eligible (`futureYouReminderSettingVisible` logic from PWA)
- **Rest timer (ST-10):** `RestTimerDurationPicker`; persist `restTimerDefaultSeconds`
- **Equipment (ST-11):** `EquipmentSetupPicker`; `rebuildWorkoutTemplatesForEquipment` on save
- **Habits (ST-12):** habit template list CRUD; icon picker; delete confirm sheet
- **Program (ST-13):** steps target editor; training program summary rows

**PWA ref:** `NotificationPreferencesPicker.tsx`, `RestTimerDurationPicker.tsx`, `EquipmentSetupPicker.tsx`, habits section in `ScreenSettings.tsx`  
**Do not:** Schedule local notifications (RN-PUSH); only persist preference toggles

---

## RN-10-06 — Hub actions + Maestro + epic polish

**Story file:** `rn-10-06-hub-actions-maestro-polish.md`

**Deliverables:**

- **Sign out:** confirm sheet on hub; wire `AuthContext.signOut`; `testID="settings-sign-out"`; update `.maestro/rn-auth-sign-out.yaml` to use settings path (remove broken `home-sign-out` dependency)
- **Delete account:** two-step warn/final confirms; invoke `delete-user` via api-client; clear local persist + sign out on success; verify FY storage wipe per edge fn
- **Legal:** Privacy policy + Terms links (`EXPO_PUBLIC_PRIVACY_POLICY_URL`, `EXPO_PUBLIC_TERMS_URL` from env-matrix)
- **Socials:** Instagram/TikTok/X link rows (open `Linking.openURL`)
- `.maestro/rn-settings.yaml` — hub navigation smoke: settings tab → fuel-targets → back → account panel visible
- `npm run test:e2e:settings` script in `apps/mobile/package.json`
- Remove all "ships in RN-10" placeholder copy
- Epic regression sweep: all existing Maestro flows green

**PWA ref:** `ScreenSettings.tsx` hub actions, `DeleteConfirmSheet`, `fitnessCloudSync.deleteAccount`  
**Test arch:** [`testarch-trace-rn-migration.md`](testarch-trace-rn-migration.md) FR-M10 row

---

## Scope locks

| In scope | Out of scope |
|----------|--------------|
| Full settings hub + 13 panels + change-password sub-layer | Full fitness cloud sync pull/push (RN-OFFLINE) |
| Email + password account management | RevenueCat restore purchases production (RN-STORE) |
| Sign out + delete account (`delete-user`) | Push notification scheduling (RN-PUSH) |
| Appearance, units, fuel, hydration, goal, reminders UI | Universal links / App Store metadata (RN-STORE) |
| Rest timer, equipment, habits, program panels | Admin user tools |
| Maestro `rn-settings.yaml` + sign-out path fix | Parity matrix sign-off (RN-PARITY) |
| Core extract `goalSettings` + tests | Re-onboarding flow changes |

---

## Maestro runbook (swarm / local)

**Prerequisites:** JDK 17+, dev client on simulator, onboarded user seed

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1
cd apps/mobile && npx expo start --dev-client --port 8082

# Terminal 2 — epic gate (RN-10-06)
npm run test:e2e:settings
npm run test:e2e:auth-sign-out
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:onboarding
npm run test:e2e:coach-nutrition
npm run test:e2e:workout-session
npm run test:e2e:nutrition-log
npm run test:e2e:progress
npm run test:e2e:sunday-check-in
npm run test:e2e:future-you
```

**Settings testing:** Seed must include `onboardingComplete: true` and populated `nutritionTargets`, `habitTemplates`. Reuse `EXPO_PUBLIC_E2E_FITNESS_SEED` pattern from RN-8.

---

## Quality gates

### Per story (blocking)

```bash
npm run typecheck --workspace=@newyouai/mobile
```

When touching `packages/core`:

```bash
npm run test --workspace=@newyouai/core
```

### Epic close (RN-10-06)

- [ ] `rn-settings.yaml` green
- [ ] `rn-auth-sign-out.yaml` green via settings sign-out
- [ ] Full Maestro regression suite green
- [ ] Manual: edit fuel targets → Nutrition tab reflects new cal target
- [ ] Manual: goal save updates Progress goal range
- [ ] Manual: delete account signs out and clears local state
- [ ] `epic-rn-10` → `done` in `sprint-status-rn-migration.yaml`

---

## Dev workflow (swarm)

1. Checkout / create branch `epic-rn-10/settings-account`
2. Run `/bmad-create-story` for RN-10-01 if story file missing, then swarm or `dev this story rn-10-01-*.md` in order
3. One focused PR per story (epic bundle OK if swarm defaults)
4. `npm run typecheck --workspace=@newyouai/mobile` before story done
5. Update `sprint-status-rn-migration.yaml` story → `done`
6. RN-10-06: run settings Maestro + full regression + mark epic `done`

---

## Definition of done (epic)

1. Settings tab shows full PWA hub (not 2-panel stub) with profile card and all sections.
2. User can open and edit all 13 panels with changes persisted to fitness state.
3. User can change password, update email, sign out, and delete account.
4. Goal save/discard and habit delete confirm sheets match PWA behavior.
5. Deep link `newyouai://settings/account` opens live account panel.
6. Maestro `rn-settings.yaml` + updated sign-out flow + full regression suite green.

---

## Unblocks

| Downstream | Needs from RN-10 |
|------------|------------------|
| RN-OFFLINE | Account sync UI hooks; settings persist keys stable |
| RN-PUSH | Reminders panel toggles wired to same preference keys |
| RN-STORE | Legal links, restore purchases row scaffold |
| RN-PARITY | FR-M10 trace row + settings UAT evidence |

---

## Risks

| Risk | Mitigation |
|------|------------|
| `home-sign-out` testID removed but Maestro still references it | RN-10-06 explicitly updates `rn-auth-sign-out.yaml` |
| Delete account without cloud sync adapter | Call `delete-user` directly via api-client; clear AsyncStorage slice locally |
| Goal panel dirty-state navigation | Port PWA `requestGoalPanelExit` + header save action |
| Equipment change rebuilds workout templates | Call `rebuildWorkoutTemplatesForEquipment` on save — verify RN-6 routines unaffected |
