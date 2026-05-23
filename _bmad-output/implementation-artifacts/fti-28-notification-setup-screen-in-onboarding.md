# Story 2.3: Notification setup in onboarding (FTI-28)

Status: done

## Story

As a new user finishing onboarding,
I want to configure workout and nutrition check-in reminders with preferred times,
so the app keeps me accountable without needing another tool.

## Acceptance Criteria

1. **Onboarding screen:** Given the user reaches the final onboarding steps, when they continue past Nutrition targets (step 8), then a dedicated Reminders step (step 9) appears before entering the main app.

2. **Workout reminder controls:** Given the Reminders step is visible, when the user toggles workout reminders on, then a time picker is shown (default `07:00` local); when toggled off, the time picker is hidden/disabled and no workout reminder fires.

3. **Nutrition check-in controls:** Given the Reminders step is visible, when the user toggles daily nutrition check-in on, then a time picker is shown (default `20:00` local); when toggled off, no nutrition check-in reminder fires.

4. **OS permission:** Given either reminder toggle is enabled when the user taps Continue / Finish setup, when `Notification` API is available, then the app calls `Notification.requestPermission()` once at this step; if denied or unsupported, preferences still save but inline copy explains reminders may not appear until permission is granted (Settings link).

5. **Persistence & sync:** Given the user completes onboarding or edits reminders in Settings, when `setState` updates notification preferences, then values flow through the full persistence pipeline (`types.ts` → `persistFitnessSlice.ts` → `buildAppStateFromPersisted()` → `mergePersistedFitnessSlices.ts`) and sync to Supabase JSONB automatically via existing cloud sync, no SQL migration.

6. **Notifications fire at correct times:** Given permission is `granted` and a reminder is enabled, when the local clock passes the configured HH:mm on an eligible day, then a Web Notification is shown exactly once per reminder type per local calendar day:
   - **Workout:** only on scheduled training days (derive from `workoutTemplates` + `onboardingProfile.workoutDaysPerWeek`; skip Sat/Sun for default splits; skip if user already finished a workout today via `workoutsCompletedByDay[dateKey]`)
   - **Nutrition check-in:** every day; skip if user already logged nutrition for today (`nutritionItemsByDay[dateKey]` non-empty OR manual totals entered for today)

7. **Post-onboarding settings:** Given the user opens Settings from Home, when they scroll to the Reminders section, then the same toggles and time pickers are editable and changes persist/sync immediately; optional “Enable notifications” button re-requests permission if currently `denied`/`default`.

8. **Build gate:** `npm run build` passes with strict TypeScript.

## Tasks / Subtasks

- [x] **Task 1: Notification preferences domain + persistence pipeline** (AC: 5)
  - [x] 1.1 Add `NotificationPreferences` type to `src/fitness/types.ts`:
    ```ts
    export type NotificationPreferences = {
      workoutReminderEnabled: boolean;
      workoutReminderTime: string; // "HH:mm" 24h local
      nutritionCheckInEnabled: boolean;
      nutritionCheckInTime: string; // "HH:mm" 24h local
      /** Last local date keys a reminder was shown, prevents duplicate fires per day */
      lastFiredWorkoutReminderDateKey: string | null;
      lastFiredNutritionReminderDateKey: string | null;
    };
    ```
  - [x] 1.2 Add `notificationPreferences: NotificationPreferences` to `AppState`
  - [x] 1.3 Create `src/fitness/notificationPreferences.ts` with `DEFAULT_NOTIFICATION_PREFERENCES`, `normalizeNotificationPreferences(raw)`, `normalizeTimeHHmm(raw, fallback)`, `mergeNotificationPreferences(local, remote)` (prefer remote for toggles/times; merge `lastFired*` with max dateKey or OR, remote wins on conflict for fired keys)
  - [x] 1.4 Wire through `persistFitnessSlice.ts` (`PersistedFitnessSlice` Pick + `sliceFromAppState`)
  - [x] 1.5 Default in `buildAppStateFromPersisted()` via `normalizeNotificationPreferences(persisted?.notificationPreferences)`
  - [x] 1.6 Merge in `mergePersistedFitnessSlices.ts`

- [x] **Task 2: Permission + display helpers** (AC: 4, 7)
  - [x] 2.1 Create `src/fitness/notificationPermission.ts` with `isNotificationSupported()`, `getNotificationPermission(): NotificationPermission | "unsupported"`, `requestNotificationPermission(): Promise<NotificationPermission | "unsupported">`, `permissionStatusLabel()` for UI copy
  - [x] 2.2 Create `formatNotificationTimeDisplay(hhmm: string): string` (e.g. `7:00 AM`) in `notificationPreferences.ts` using `Intl` or manual parse, no new dependencies

- [x] **Task 3: Eligibility + scheduler module** (AC: 6)
  - [x] 3.1 Create `src/fitness/notificationScheduler.ts` with pure helpers:
    - `isTrainingDay(date: Date, templates: WorkoutRoutineTemplate[], daysPerWeek: WorkoutDaysPerWeek): boolean`: map template `dayLabel` (Mon–Sat) to weekday; fallback Mon–Fri when labels missing
    - `shouldFireWorkoutReminder(now, state): boolean`: enabled + granted + training day + not completed today + time >= configured + `lastFiredWorkoutReminderDateKey !== todayKey`
    - `shouldFireNutritionReminder(now, state): boolean`: enabled + granted + not logged today + time >= configured + `lastFiredNutritionReminderDateKey !== todayKey`
    - `buildWorkoutNotificationPayload(state)` / `buildNutritionNotificationPayload(state)`: title/body/icon (`/icon-192.png`), tag ids `fitcoach-workout`, `fitcoach-nutrition`
  - [x] 3.2 Export `checkAndFireDueNotifications(state, setState)`: evaluates both reminders, calls show API, updates `lastFired*` date keys in state

- [x] **Task 4: Service worker + show path** (AC: 6)
  - [x] 4.1 Add `public/notification-sw.js`: minimal SW: `self.addEventListener("notificationclick", …)` focuses/opens `/`; `onmessage` handler calls `self.registration.showNotification(title, options)`
  - [x] 4.2 Create `src/fitness/registerNotificationServiceWorker.ts`: register `/notification-sw.js` once on app boot (idempotent); export `showFitcoachNotification(title, body, tag)` posting to active SW or falling back to `new Notification(...)` when SW unavailable
  - [x] 4.3 Call registration from `FitnessApp.tsx` inside `useEffect` (after auth/onboarding gates OK or at root mount, SW can register early)

- [x] **Task 5: Shared Reminders UI component** (AC: 2, 3, 4, 7)
  - [x] 5.1 Create `src/fitness/NotificationPreferencesPicker.tsx`: props `{ value: NotificationPreferences; onChange; showPermissionHint?: boolean }`
  - [x] 5.2 Two `.card` rows: toggle + `<input type="time">` per reminder (use native time input, matches project patterns; no new component library)
  - [x] 5.3 Muted helper text when permission not `granted`; optional button to call `requestNotificationPermission()` when `showPermissionHint`
  - [x] 5.4 Disable time inputs when corresponding toggle is off; use existing dark input styling from onboarding/settings

- [x] **Task 6: Onboarding step 9 (Reminders)** (AC: 1, 2, 3, 4, 5)
  - [x] 6.1 Add `"Reminders"` to `STEP_LABELS` in `OnboardingFlow.tsx` (step index 9); `totalSteps` becomes 10
  - [x] 6.2 Change step 8 (Nutrition) `onContinue` from `finish` to `goNext`
  - [x] 6.3 Add step 9 shell: title `"Stay on track"`, subtitle about optional reminders; render `NotificationPreferencesPicker`
  - [x] 6.4 Local `useState` for draft prefs initialized from `DEFAULT_NOTIFICATION_PREFERENCES`
  - [x] 6.5 On Finish setup: if either toggle enabled, await `requestNotificationPermission()`; merge `notificationPreferences` into `finish()` `setState` patch alongside existing fields
  - [x] 6.6 Update FTI-30 step index comments in Dev Notes if referenced elsewhere (nutrition = step 8, reminders = step 9)

- [x] **Task 7: Settings Reminders section** (AC: 7, 5)
  - [x] 7.1 Add `<SectionLabel>Reminders</SectionLabel>` + explanatory copy in `SettingsSheet.tsx` (after Rest timer or before Equipment, match settings density)
  - [x] 7.2 Bind `NotificationPreferencesPicker` to `state.notificationPreferences` via `setState`
  - [x] 7.3 “Turn on notifications” secondary action when permission ≠ `granted`

- [x] **Task 8: Runtime scheduler hook in app shell** (AC: 6)
  - [x] 8.1 In `FitnessApp.tsx`, add `useEffect` interval (e.g. 60s) + run on `visibilitychange` when visible, call `checkAndFireDueNotifications(state, setState)` only when `onboardingComplete && !needsOnboarding`
  - [x] 8.2 Also run once shortly after mount post-onboarding to catch open-tab cases
  - [x] 8.3 Do not call `savePersistedSlice` manually, rely on existing `syncSig` auto-save

- [x] **Task 9: Verification** (AC: 8)
  - [x] 9.1 Run `npm run build`: must pass `tsc -b` and Vite build
  - [x] 9.2 Manual smoke with `?previewOnboarding=1`: walk to step 9, toggle reminders, finish; open Settings and confirm values; with permission granted, set time 1-2 min ahead and confirm single notification fires (document browser tab must be open for v1, see platform limits)

## Dev Notes

### Scope & placement

- **Onboarding insertion:** Current flow ends at step 8 Nutrition with `finish()`. This story adds **step 9 Reminders** as the new terminal step with `finish()`: keeps nutrition target review before reminders, matching “near end of onboarding.”
- **Do not** implement FTI-31 (macro rings) or FTI-32 (water) in this story.
- **Do not** add push notification server, email/SMS, or third-party notification SDKs.

### Prior story learnings (FTI-29, FTI-30)

- FTI-29/30 pattern: small pure helper module + thin UI wiring + full persistence when new `AppState` fields are introduced.
- FTI-30 onboarding indices: schedule = step 6, template review = step 7, nutrition = step 8; **this story adds reminders = step 9**.
- FTI-30 explicitly scoped out FTI-28: this story owns all notification UX and scheduling.

### Persistence & architecture (from project-context.md)

- **Mandatory pipeline** for `notificationPreferences`: all five steps (types → slice → buildAppState → merge → auto cloud sync).
- **Do not** write fitness data directly to localStorage from screens.
- **Merge policy:** toggles/times, prefer most recently synced remote values via existing merge timestamp pattern (follow `mergeUnitPreferences` / `normalizeRestTimerDefaultSeconds` style); `lastFired*` keys: keep latest dateKey per field to avoid duplicate notifications across devices.
- **No Tailwind, no test runner**, verification is `npm run build` only + manual smoke.
- **Styling:** `.card`, inline styles, muted `rgba(255,255,255,0.45)` secondary copy, match `SettingsSheet` Rest timer section and onboarding cards.
- **Strict TS:** satisfy `noUnusedLocals` / `noUnusedParameters`.

### Workout-day eligibility (recommended)

Reuse template weekday labels from `workoutSplitByDays.ts` / `WorkoutRoutineTemplate.dayLabel`:

| `workoutDaysPerWeek` | Training weekdays (default mapping) |
| --- | --- |
| 3 | Mon, Tue, Thu |
| 4 | Mon–Thu |
| 5 | Mon–Fri |
| 6 | Mon–Sat |

Helper should compare today's short weekday (`Mon`, `Tue`, …) to template `dayLabel` values when present; fallback to table above using `onboardingProfile.workoutDaysPerWeek`.

### Notification delivery (v1, client-only PWA)

There is **no service worker registered today** and **no backend** for push. v1 implementation:

1. Register minimal `public/notification-sw.js` for `showNotification` when tab backgrounded (Chrome/Android/desktop).
2. Poll every ~60s while app is open + on `document.visibilitychange` → `visible`.
3. Track `lastFired*DateKey` in persisted preferences to enforce once-per-day.

**This is intentional v1 scope**, not a gap to “fix” with Supabase Edge Functions unless product explicitly expands scope later.

### Platform limits (document for user-facing copy + Dev Notes)

| Platform | Limit |
| --- | --- |
| **iOS Safari (browser tab)** | Web Notifications not supported, show inline “Add to Home Screen to enable reminders on iOS” |
| **iOS PWA (standalone, iOS 16.4+)** | Web Push supported only with installed PWA + permission; **scheduled local reminders without a push server are unreliable**, user may only receive reminders while app has been opened recently |
| **Android Chrome / desktop** | Best support for Notification API + service worker while installed or tab open |
| **Permission denied** | Save preferences; reminders no-op until user enables in OS settings |
| **Background closed app** | Without push server, reminders **will not fire** if app has not run recently, set expectations in onboarding subtitle and Settings copy |

Include a short muted disclaimer on onboarding step 9 and Settings Reminders section. Do **not** create a new markdown doc file, inline UI copy only.

### Default preference values

| Field | Default |
| --- | --- |
| `workoutReminderEnabled` | `true` |
| `workoutReminderTime` | `"07:00"` |
| `nutritionCheckInEnabled` | `true` |
| `nutritionCheckInTime` | `"20:00"` |
| `lastFiredWorkoutReminderDateKey` | `null` |
| `lastFiredNutritionReminderDateKey` | `null` |

### Existing code to reuse

| Area | File | Notes |
| --- | --- | --- |
| Onboarding shell | `OnboardingFlow.tsx` | Step pattern, `finish()` state patch |
| Settings sections | `SettingsSheet.tsx` | `SectionLabel`, toggle/button styling from Rest timer |
| Date keys | `dailyPlan.ts` `localDateKey()` | Reminder dedupe + eligibility |
| Workout done | `workoutsCompletedByDay` | Skip workout reminder if true today |
| Nutrition logged | `nutritionItemsByDay`, `nutritionManualByDay` | Skip nutrition reminder if logged |
| Split / days | `workoutSplitByDays.ts`, `onboardingProfile.workoutDaysPerWeek` | Training day detection |
| PWA manifest | `public/site.webmanifest` | Already standalone, icon path for notifications |
| Preference pattern | `restTimerPreferences.ts`, `unitPreferences.ts` | normalize + merge helpers |

### Linear issue (primary product input)

- **linear:** FTI-28
- **linear_url:** https://linear.app/ftiness-tracker/issue/FTI-28/notification-setup-screen-in-onboarding
- **Title:** Notification setup screen in onboarding
- **Status (Linear):** Todo | **Priority:** Medium
- **Linear-only details:** Description lists post-onboarding edit in “profile/settings”, implement under existing `SettingsSheet` (gear on Home), not a separate profile screen.

### Concerns / ambiguities for dev

1. **“Notifications fire at correct times” vs PWA reality:** AC6 is satisfied for **app-open / recently-active** sessions with v1 scheduler; true background scheduling on iOS requires future push infrastructure, document in UI, do not block story on server push.
2. **Workout-day mapping for custom templates:** If user renames `dayLabel` on review step, eligibility follows labels, edge case acceptable for v1.
3. **Time zone:** Use device local time for HH:mm comparison and `localDateKey()` for day boundaries, consistent with rest of app (not Arizona helpers unless product asks).
4. **Service worker scope:** Keep SW file static in `public/`; Vite serves as-is. No vite-plugin-pwa required for this story.
5. **Preview onboarding:** Ensure step 9 appears with `?previewOnboarding=1`; prefs should persist on finish like other onboarding fields.

### Parallel implementation groups

| Group | Tasks | Can run in parallel with |
| --- | --- | --- |
| A, Domain + persistence | Task 1 (all subtasks) |, (start here) |
| B, Permission helpers | Task 2 | After 1.1 types exist |
| C, Scheduler logic | Task 3 | After Task 1 (needs types + normalize) |
| D, Service worker | Task 4 | Parallel with B/C once show API contract agreed |
| E, Shared UI picker | Task 5 | After 1.1 + 2.1 (types + permission labels) |
| F, Onboarding step | Task 6 | After Task 5 |
| G, Settings section | Task 7 | After Task 5 (parallel with F) |
| H, App scheduler hook | Task 8 | After Tasks 3 + 4 |
| I, Verification | Task 9 | After all implementation groups |

**Suggested parallel dev split:**
- Dev A: Tasks 1 → 2 → 3 → 8 (backend-ish client logic)
- Dev B: Tasks 4 → 5 → 6 + 7 (UI surfaces), can start Task 5 mock UI once types land

### Project Structure Notes

```
src/fitness/
  notificationPreferences.ts      ← NEW (types helpers, defaults, normalize, merge)
  notificationPermission.ts       ← NEW (permission API wrapper)
  notificationScheduler.ts        ← NEW (eligibility + fire logic)
  registerNotificationServiceWorker.ts ← NEW (SW register + show)
  NotificationPreferencesPicker.tsx ← NEW (shared UI)
  OnboardingFlow.tsx              ← MODIFY (step 9, finish patch)
  SettingsSheet.tsx               ← MODIFY (Reminders section)
  FitnessApp.tsx                  ← MODIFY (SW register + scheduler interval)
  types.ts                        ← MODIFY (NotificationPreferences + AppState field)
  persistFitnessSlice.ts          ← MODIFY
  buildAppState.ts                ← MODIFY
  mergePersistedFitnessSlices.ts  ← MODIFY
public/
  notification-sw.js              ← NEW (minimal SW)
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3]
- [Source: _bmad-output/project-context.md#Persistence pipeline]
- [Source: _bmad-output/project-context.md#Framework-Specific Rules]
- [Source: _bmad-output/project-context.md#Critical Don't-Miss Rules]
- [Source: src/fitness/OnboardingFlow.tsx]
- [Source: src/fitness/SettingsSheet.tsx]
- [Source: src/fitness/dailyPlan.ts#localDateKey]
- [Source: src/fitness/workoutSplitByDays.ts]
- [Source: src/fitness/restTimerPreferences.ts]
- [Source: _bmad-output/implementation-artifacts/fti-29-personalized-home-screen-greeting-post-onboarding.md]
- [Source: _bmad-output/implementation-artifacts/fti-30-estimated-session-time-shown-per-split-in-onboarding.md]
- Linear: https://linear.app/ftiness-tracker/issue/FTI-28/notification-setup-screen-in-onboarding

## Dev Agent Record

### Agent Model Used

Composer (swarm story-dev, Tasks 1-3); Composer (Task 4: service worker + show path); Composer (Tasks 5-9, UI surfaces, scheduler hook, verification)

### Debug Log References

(none)

## Senior Developer Review (AI)

- **F1 (HIGH):** Retargeted notification/manifest icons from missing `/icon-192.png` to `/favicon.svg`.
- **F2 (HIGH):** Added actionable Settings → Reminders copy/button in `NotificationPreferencesPicker`.
- **F3/F4/F6 (MEDIUM):** `checkAndFireDueNotifications` now awaits successful show before `lastFired*`; scheduler mutex in `FitnessApp`; `registration.showNotification` when SW active.
- **F5 (MEDIUM):** Controlled `permission` prop + visibility/focus refresh in picker; Settings uses `showPermissionHint`.
- **F7 (LOW):** Nutrition skip treats manual day entry as logged.

## Review Follow-ups (AI)

- [x] All review findings above addressed; `npm run build` PASS.

### Completion Notes List

- **Tasks 1-3:** `NotificationPreferences` on `AppState`; full persistence pipeline (slice, buildAppState, merge). `notificationPreferences.ts` (defaults, normalize, merge, `formatNotificationTimeDisplay`). `notificationPermission.ts` (support/permission/request/labels). `notificationScheduler.ts` (training-day eligibility, `shouldFire*`, payloads, `checkAndFireDueNotifications` with `new Notification()` until Task 4 show path wired). Build PASS.
- **Task 4:** Added `public/notification-sw.js` with `notificationclick` (focus/open `/`) and `message` handler for `SHOW_NOTIFICATION` → `registration.showNotification`. Created `registerNotificationServiceWorker.ts` with idempotent registration and `showFitcoachNotification(title, body, tag)`: posts to active SW when ready, falls back to `new Notification()` when SW unavailable. Wired `registerNotificationServiceWorker()` in `FitnessApp.tsx` root `useEffect` on mount. Build PASS.
- **Tasks 5-9:** `NotificationPreferencesPicker.tsx`: shared toggles + native time inputs, permission hint/button, platform disclaimer. `OnboardingFlow.tsx`: step 9 Reminders (10 steps total); nutrition step 8 continues; finish requests permission when toggles on and persists `notificationPreferences`. `SettingsSheet.tsx`: Reminders section after Rest timer with live `setState` binding + “Turn on notifications” button. `notificationScheduler.ts`: wired `showFitcoachNotification` from SW module (removed raw `new Notification()`). `FitnessApp.tsx`: 60s interval + visibilitychange + 1.5s post-onboarding mount check via `stateRef`; gated on `onboardingComplete`. Build PASS. Manual smoke: code review of onboarding step indices and settings binding; live notification fire requires browser tab open + granted permission (v1 platform limit documented in UI copy).

### File List

- `src/fitness/types.ts` (MODIFIED)
- `src/fitness/notificationPreferences.ts` (NEW)
- `src/fitness/notificationPermission.ts` (NEW)
- `src/fitness/notificationScheduler.ts` (MODIFIED, SW show path)
- `src/fitness/persistFitnessSlice.ts` (MODIFIED)
- `src/fitness/buildAppState.ts` (MODIFIED)
- `src/fitness/mergePersistedFitnessSlices.ts` (MODIFIED)
- `public/notification-sw.js` (NEW)
- `src/fitness/registerNotificationServiceWorker.ts` (NEW)
- `src/fitness/NotificationPreferencesPicker.tsx` (NEW)
- `src/fitness/OnboardingFlow.tsx` (MODIFIED, step 9 Reminders)
- `src/fitness/SettingsSheet.tsx` (MODIFIED, Reminders section)
- `src/fitness/FitnessApp.tsx` (MODIFIED, SW registration + scheduler hook)
