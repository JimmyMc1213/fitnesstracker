# Sprint RN-PUSH — Local push notifications

**Planned:** 2026-06-13  
**Last updated:** 2026-06-13 (swarm-ready — all 4 story files created)  
**Epic:** `epic-rn-push`  
**Swarm branch:** `epic-rn-push/local-notifications`  
**Goal:** Deliver FR-M12 push notification parity on React Native — extract `notificationScheduler` logic to shared core, schedule workout + nutrition reminders via `expo-notifications`, wire permission + reschedule lifecycle from onboarding and Settings, and produce UAT evidence for the trace matrix.

**PRD:** [`prd-rn-migration.md`](../planning-artifacts/prd-rn-migration.md) FR-M12 (Push notifications)  
**Architecture:** [`architecture-rn-migration.md`](../planning-artifacts/architecture-rn-migration.md) § adapters — `expo-notifications`  
**Epic spec:** [`epics-rn-migration.md`](../planning-artifacts/epics-rn-migration.md) RN-PUSH (4 stories)  
**Research:** [`research/pwa-to-react-native-migration-research.md`](../planning-artifacts/research/pwa-to-react-native-migration-research.md) §7 Push notifications  
**Inventory:** [`pwa-codebase-inventory.md`](../planning-artifacts/pwa-codebase-inventory.md) OB-24/25, ST-09  
**PWA reference:** `notificationScheduler.ts`, `notificationPermission.ts`, `notificationPreferences.ts`, `FitnessApp.tsx` scheduler loop, `NotificationPreferencesPicker.tsx`  
**Tracking:** [`sprint-status-rn-migration.yaml`](sprint-status-rn-migration.yaml)

---

## Sprint goal (one sentence)

An onboarded user who opts into reminders receives context-aware workout and nutrition local notifications on iOS (background-capable via `expo-notifications`), preference toggles and times from onboarding OB-24/25 and Settings ST-09 reschedule notifications immediately, and FR-M12 is evidenced by Vitest + manual UAT checklist.

---

## BMad swarm alignment

| Field | Value |
|-------|--------|
| Swarm mode | `epic-rn-push` |
| Branch | `epic-rn-push/local-notifications` |
| Start story | **RN-PUSH-01** (`rn-push-01-scheduler-core-extract-vitest.md`) |
| Story files | Create under `implementation-artifacts/rn-push-*.md` |
| Gate (every story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Gate (logic stories) | `npm run test --workspace=@newyouai/core` when touching `packages/core` |
| Gate (epic close) | UAT checklist signed + `notificationScheduler.test.ts` green in core + full Maestro regression green (no new Maestro flow required for push) |

**Kickoff:** `/bmad-create-story RN-PUSH-01` then `/bmad-swarm epic-rn-push` or `dev this story rn-push-01-scheduler-core-extract-vitest.md`

**Swarm order (strict):**

```
RN-PUSH-01 → RN-PUSH-02 → RN-PUSH-03 → RN-PUSH-04 → epic-rn-push-retrospective
```

---

## Starting point

| Item | Status | Notes |
|------|--------|-------|
| RN-0 … RN-10 | **Done** | Feature tabs + settings shipped |
| RN-OFFLINE | **Done** | Persist keys stable; `notificationPreferences` syncs via merge |
| `packages/core/sync/notificationPreferences.ts` | **Done (RN-1/RN-10)** | Defaults, normalize, merge |
| `packages/core/coach/coachEngine.ts` | **Done** | `buildCoachContext`, `getNotificationBody` — scheduler deps already in core |
| `packages/core/training/trainingCalendar.ts` | **Done** | `isTrainingDay` |
| `apps/mobile/lib/notificationPermission.ts` | **Done (RN-4/RN-10)** | Lazy `expo-notifications` import; get/request permission |
| `apps/mobile/lib/notificationPreferences.ts` | **Done (RN-4)** | Display helpers + onboarding defaults |
| OB-24/25 UI | **Done (RN-4-09)** | Prompt + picker; **stores prefs only** — no OS permission on opt-in yet |
| ST-09 Reminders panel | **Done (RN-10-05)** | Toggles + permission status row; **no scheduling** |
| `notificationScheduler.ts` | **PWA-only** | Pure logic + async fire path; must extract to core |
| `notificationScheduler.test.ts` | **PWA-only** | Port to `packages/core` with permission inject |
| PWA scheduler runtime | **Polling** | 60s interval + visibility while app open; web `Notification` API |
| RN scheduler runtime | **Missing** | Need `expo-notifications` daily triggers + reschedule on state change |
| `expo-notifications` dep | **Installed** | `apps/mobile/package.json`; plugin in `app.config.ts` |
| iOS permission strings | **Partial** | Plugin present; add user-facing `NSUserNotificationsUsageDescription` if missing after first dev build |
| UI copy | **Stale** | Picker still says "Background notifications coming soon." — remove in RN-PUSH-04 |
| Morning / weekly review toggles | **UI only** | PWA scheduler fires **workout + nutrition only** — match that scope |
| Future You home reminders | **In-app pill** | `futureYou.remindersMuted` — **not** OS push; out of scope |
| Server-side APNs token registry | **Deferred** | Post-MVP; document spec only in RN-PUSH-04 |
| Maestro push flow | **Not planned** | Trace matrix: FR-M12 → UAT manual |

---

## Execute in this order

| # | Story | Story file | Scope | PR target | Status |
|---|-------|------------|-------|-----------|--------|
| 1 | **RN-PUSH-01** | `rn-push-01-scheduler-core-extract-vitest.md` | Core extract + Vitest port | 1 PR | ready-for-dev |
| 2 | **RN-PUSH-02** | `rn-push-02-expo-local-notification-adapter.md` | expo-notifications schedule/cancel | 1 PR | ready-for-dev |
| 3 | **RN-PUSH-03** | `rn-push-03-reschedule-lifecycle-permission-wiring.md` | Provider + OB/settings permission | 1 PR | ready-for-dev |
| 4 | **RN-PUSH-04** | `rn-push-04-uat-trace-polish-deferred-spec.md` | UAT checklist + copy + trace | 1 PR | ready-for-dev |
| 5 | Retro | `epic-rn-push-retrospective` | — | — | optional |

---

## RN-PUSH-01 — Scheduler core extract + Vitest

**Story file:** `rn-push-01-scheduler-core-extract-vitest.md`

**Deliverables:**

- Extract pure scheduler to `packages/core/src/notifications/notificationScheduler.ts`:
  - `isAtOrPastHHmm`, `shouldFireWorkoutReminder`, `shouldFireNutritionReminder`
  - `buildWorkoutNotificationPayload`, `buildNutritionNotificationPayload`
  - Re-export `isTrainingDay` from `trainingCalendar` (match PWA public API)
- **Permission inject:** replace sync `getNotificationPermission()` with parameter or `NotificationPermissionPort` (`isGranted(): boolean`) so core stays DOM-free
- Port `checkAndFireDueNotifications` **signature** to core as pure `computeNotificationPatches(state, now, permissionGranted)` returning `{ workoutPayload?, nutritionPayload?, prefsPatch? }` — native adapter applies side effects in RN-PUSH-02
- Colocated Vitest in `packages/core` — port cases from PWA `notificationScheduler.test.ts` (training day, already fired, before/after time, nutrition logged skip, payload copy)
- PWA `apps/pwa/src/fitness/notificationScheduler.ts` → thin re-exports + web fire wrapper calling existing `showFitcoachNotification`
- Export from `packages/core/src/index.ts`

**PWA ref:** `notificationScheduler.ts`, `notificationScheduler.test.ts`, `testFixtures/appStateFixtures.ts`  
**Do not:** `expo-notifications` imports in core; React hooks; Maestro

---

## RN-PUSH-02 — expo-notifications local adapter

**Story file:** `rn-push-02-expo-local-notification-adapter.md`

**Deliverables:**

- `apps/mobile/lib/localNotifications.ts` (or `notifications/localNotificationScheduler.ts`):
  - Stable identifiers: `fitcoach-workout`, `fitcoach-nutrition` (match PWA tags)
  - `scheduleWorkoutReminder(state)`, `scheduleNutritionReminder(state)`, `cancelAllFitcoachReminders()`
  - Use `Notifications.scheduleNotificationAsync` with **daily** calendar trigger at user HH:mm (timezone-local)
  - Body/title from core payload builders at schedule time; **reschedule** when fitness state changes (workout done, nutrition logged, training day change)
  - Skip scheduling when permission not granted or toggle off
- Configure notification handler (foreground presentation) in app entry / root layout
- `app.config.ts`: ensure iOS notification permission copy; set plugin `icon` / `color` if needed for brand parity
- Unit tests where feasible (mock `expo-notifications` module); logic-heavy cases remain in core Vitest

**PWA ref:** `registerNotificationServiceWorker.ts` show path — replaced by native schedule  
**Do not:** Server push / APNs token upload; morning/weekly review scheduling (not in PWA scheduler); Future You OS reminders

---

## RN-PUSH-03 — Reschedule lifecycle + permission wiring

**Story file:** `rn-push-03-reschedule-lifecycle-permission-wiring.md`

**Deliverables:**

- `NotificationSchedulerProvider` (or hook used from `_layout.tsx` inside `FitnessProvider`):
  - When `onboardingComplete` and permission `granted`: run full reschedule from current `AppState`
  - Debounced reschedule on `notificationPreferences` changes and relevant state (`workoutsCompletedByDay`, `nutritionItemsByDay`, `nutritionManualByDay`, `workoutTemplates`, `onboardingProfile.workoutDaysPerWeek`)
  - On permission revoke: cancel all scheduled notifications
  - Optional foreground reconcile: on `AppState` `active`, call core `computeNotificationPatches` + present immediate notification if due (parity with PWA visibility refresh — keep lightweight)
- **Onboarding OB-24/25:** when user enables any reminder on step 25, call `requestNotificationPermission()` before persisting opt-in (match user expectation from "Set up notifications" CTA)
- **Settings ST-09:** wire "Enable notifications" affordance in `NotificationPreferencesPicker` to `requestNotificationPermission()` (already partially present — ensure reschedule runs after grant)
- Update `lastFiredWorkoutReminderDateKey` / `lastFiredNutritionReminderDateKey` in fitness state when notification fires (listener or post-present hook) — keeps PWA dedupe semantics if user opens app after fire

**PWA ref:** `FitnessApp.tsx` lines 273–302 (scheduler loop + mutex)  
**Do not:** Rebuild reminders UI (RN-10 owns panels); cloud sync changes (RN-OFFLINE)

---

## RN-PUSH-04 — UAT checklist + trace polish + deferred spec

**Story file:** `rn-push-04-uat-trace-polish-deferred-spec.md`

**Deliverables:**

- Manual UAT checklist (`docs/uat-rn-push-notifications.md` or section in existing UAT doc):
  - Fresh install → onboarding opt-in → iOS permission prompt → notification appears at configured time (simulator time travel or short test time)
  - Toggle off workout reminder → notification cancelled
  - Complete workout before reminder time → no workout notification that day
  - Log nutrition before evening reminder → no nutrition notification
  - Denied permission → Settings copy + no crash; toggles persist
  - Settings time change → rescheduled
- Remove stale copy: "Reminders work while NewYou is open. Background notifications coming soon." from `NotificationPreferencesPicker` (onboarding + settings variants)
- Update [`testarch-trace-rn-migration.md`](testarch-trace-rn-migration.md) FR-M12 evidence column (core tests + UAT checklist link)
- **Deferred spec only:** one-page note for post-MVP server-side APNs token registry + Edge Function (no implementation)
- Epic regression sweep: auth-all, tab-nav, onboarding, settings, coach-nutrition, workout-session, nutrition-log, progress, sunday-check-in, future-you, sync-signin

**PWA ref:** FR-M12 acceptance in PRD  
**Test arch:** Maestro **not required** for push (OS dialog not reliable in CI); UAT manual per trace matrix

---

## Scope locks

| In scope | Out of scope |
|----------|--------------|
| Workout + nutrition local notifications (PWA scheduler parity) | Morning check-in + weekly review **scheduling** (UI toggles exist; PWA never fires them) |
| Context-aware copy via `coachEngine` at schedule/reschedule time | Future You home pill / `remindersMuted` OS push |
| Permission prompt on onboarding opt-in + Settings | Server-side APNs token registry (post-MVP doc only) |
| Reschedule on preference + fitness state changes | Android push polish (iOS MVP first; expo-notifications supports both but epic gates on iOS simulator) |
| `lastFired*` dedupe keys in persist slice | Sunday check-in push reminders (not in PWA scheduler) |
| Core Vitest port | Maestro flow for notification permission |
| Remove "coming soon" UI copy | RevenueCat / App Store (RN-STORE) |
| FR-M12 trace matrix update | Parity sign-off (RN-PARITY) |

---

## PWA vs RN scheduling strategy

| Aspect | PWA | RN (this epic) |
|--------|-----|----------------|
| Permission | `Notification.requestPermission()` | `expo-notifications` `requestPermissionsAsync()` |
| Delivery | Poll 60s while tab visible + `new Notification()` | `scheduleNotificationAsync` daily triggers |
| Background | Limited on iOS PWA | Native local notifications when granted |
| Copy | Built at fire time from live state | Built at schedule time; reschedule on state/pref changes |
| Dedupe | `lastFired*DateKey` in state | Same keys + cancel/reschedule |

---

## Dependencies

| Upstream (must be done) | Provides |
|-------------------------|----------|
| RN-4 OB-24/25 | Notification preference UI + persist shape |
| RN-10 ST-09 | Settings reminders panel + permission row |
| RN-1 / core | `notificationPreferences`, `coachEngine`, `trainingCalendar` |
| RN-OFFLINE | Synced `notificationPreferences` across devices (scheduling is local either way) |

| Downstream | Needs from RN-PUSH |
|------------|-------------------|
| RN-STORE | Real device notification permission for TestFlight UAT |
| RN-PARITY | FR-M12 trace row complete |

---

## Unblocks

RN-PUSH completes the last **feature** epic before ship track (`RN-STORE` → `RN-PARITY`). Cloud sync (RN-OFFLINE) already landed; push does not block store submission but FR-M12 must be green for parity gate.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Context-aware copy stale at fire time | Reschedule on debounced fitness state changes; optional foreground reconcile |
| iOS permission denied permanently | Settings panel copy + deep link hint; toggles still persist |
| Simulator notification timing flaky | UAT doc: use near-future times + `simctl` date change instructions |
| `expo-notifications` requires dev client rebuild | Document rebuild after plugin/permission string changes |
| Morning/weekly toggles confuse users | No change to UI; document as UI-only until future epic (matches PWA) |
| Core extract breaks PWA import cycle | Keep PWA re-export shim; run PWA Vitest in CI |

---

## Maestro / local runbook

No new Maestro flow. Epic close runs existing regression bundle:

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
cd apps/mobile
npx expo start --dev-client --port 8082
# separate terminal:
npm run test:e2e:all   # or project’s consolidated Maestro script
```

Push UAT: physical device or simulator with manual time adjustment — see RN-PUSH-04 checklist.
