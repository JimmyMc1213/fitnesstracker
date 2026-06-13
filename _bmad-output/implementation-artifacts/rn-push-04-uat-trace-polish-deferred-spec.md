---
name: RN-PUSH-04 UAT checklist + FR-M12 trace + deferred spec
epic: RN-PUSH
story: 04
status: ready-for-dev
swarm_order: 4
swarm_branch: epic-rn-push/local-notifications
---

# Story PUSH-04: UAT checklist + FR-M12 trace + deferred spec

Status: ready-for-dev

<!-- Ultimate context engine analysis completed — epic close story; no new scheduling logic -->

## Story

**As a** release owner  
**I want** FR-M12 evidenced by UAT checklist + trace matrix update and production-ready copy  
**So that** RN-PARITY can sign off push notifications and RN-STORE TestFlight includes accurate user messaging

## Acceptance Criteria

1. **Given** `docs/uat-rn-push-notifications.md`, **When** reviewer executes checklist on iOS simulator or device, **Then** all scenarios pass or failures are documented with repro steps
2. **Given** `NotificationPreferencesPicker` onboarding and settings variants, **When** epic ships, **Then** stale copy "Reminders work while NewYou is open. Background notifications coming soon." is removed and replaced with accurate native messaging
3. **Given** [`testarch-trace-rn-migration.md`](testarch-trace-rn-migration.md) FR-M12 row, **When** this story completes, **Then** evidence cites `packages/core/.../notificationScheduler.test.ts` + UAT doc link (Maestro remains N/A)
4. **Given** post-MVP server push need, **When** `docs/deferred-apns-token-registry-spec.md` exists, **Then** it documents optional Supabase token table + Edge Function adapter only — **no implementation**
5. **Given** RN-PUSH-01..03 merged, **When** epic regression runs, **Then** existing Maestro bundle is green (auth-all, tab-nav, onboarding, settings, coach-nutrition, workout-session, nutrition-log, progress, sunday-check-in, future-you, sync-signin)

## Tasks / Subtasks

- [ ] Create `docs/uat-rn-push-notifications.md` (AC: 1)
  - [ ] Prerequisites: dev client build, notification permission, onboarded user
  - [ ] Scenario: onboarding opt-in → permission grant → notification at configured time (use +2 min test time or simulator date change)
  - [ ] Scenario: disable workout toggle → scheduled workout cancelled
  - [ ] Scenario: complete workout before reminder → no workout notification that day
  - [ ] Scenario: log food before nutrition reminder → no nutrition notification
  - [ ] Scenario: deny permission → app stable; Settings shows blocked copy; toggles persist
  - [ ] Scenario: change reminder time in Settings → rescheduled (verify via `getAllScheduledNotificationsAsync` dev snippet or visual fire)
  - [ ] Scenario: training rest day → no workout notification
  - [ ] Sign-off table: tester, date, build, pass/fail
- [ ] Update UI copy (AC: 2)
  - [ ] `apps/mobile/components/onboarding/NotificationPreferencesPicker.tsx` — onboarding footer + settings footer
  - [ ] Suggested replacement: "Reminders appear as notifications on this device when enabled. Change times anytime in Settings → Reminders."
- [ ] Update trace matrix (AC: 3)
  - [ ] `testarch-trace-rn-migration.md` FR-M12 evidence: core Vitest + `docs/uat-rn-push-notifications.md`
- [ ] Create deferred spec (AC: 4)
  - [ ] `docs/deferred-apns-token-registry-spec.md` — table schema sketch, register/unregister Edge Function, link user_id, explicit "not in MVP"
- [ ] Epic regression + sprint tracker (AC: 5)
  - [ ] Run Maestro regression per [sprint-rn-push-plan.md](sprint-rn-push-plan.md) runbook
  - [ ] Update `sprint-status-rn-migration.yaml`: `epic-rn-push` → `done`, stories RN-PUSH-01..04 → `done`
  - [ ] Update [sprint-rn-push-plan.md](sprint-rn-push-plan.md) last_updated + story statuses
- [ ] Run gates

## Dev Notes

### Previous story intelligence

| Story | Delivers |
|-------|----------|
| RN-PUSH-01 | Core Vitest — cite in trace matrix |
| RN-PUSH-02 | Local schedule adapter |
| RN-PUSH-03 | Live permission + reschedule + lastFired dedupe |

This story is **verification + docs + copy only** — avoid new scheduling logic unless UAT finds a blocker bug (fix in minimal follow-up commit).

### UAT tips (simulator)

```bash
# List scheduled notifications (dev-only REPL or temporary debug button)
import * as Notifications from "expo-notifications";
const all = await Notifications.getAllScheduledNotificationsAsync();
console.log(all);

# iOS simulator: Settings → New You AI → Notifications → Allow
# For time test: set workout reminder to 2 minutes from now, background app, wait
```

Document `xcrun simctl privacy booted grant notifications app.newyouai.mobile` if useful for CI-adjacent local runs.

### Copy locations to update

```235:237:apps/mobile/components/onboarding/NotificationPreferencesPicker.tsx
        Reminders work while NewYou is open. Background notifications coming soon.
```

```281:283:apps/mobile/components/onboarding/NotificationPreferencesPicker.tsx
        Reminders work while NewYou is open. Background notifications coming soon.
```

### Deferred APNs spec outline (AC: 4)

- **Problem:** Local notifications only fire on device where scheduled; no cross-device push
- **Adapter-only:** `push_device_tokens(user_id, apns_token, platform, updated_at)` — no fitness payload schema change
- **Edge Function:** `register-push-token` authenticated POST; `unregister` on sign-out
- **Client:** after RN-PUSH local ship, optional RN-STORE+ follow-up epic
- Reference: [research/pwa-to-react-native-migration-research.md](../planning-artifacts/research/pwa-to-react-native-migration-research.md) §7 backend gap

### Maestro regression command

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
cd apps/mobile
npx expo start --dev-client --port 8082
# separate terminal — use project's consolidated e2e script:
npm run test:e2e:all
```

No new `rn-push-*.yaml` flow — trace matrix already marks FR-M12 Maestro as UAT manual.

### Anti-patterns

- **Do not** implement server push token registry in this story
- **Do not** add morning/weekly scheduling to close UAT gaps — document as PWA parity (UI-only)
- **Do not** mark epic done without regression green

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test --workspace=@newyouai/core
npm run test:e2e:all   # or project equivalent
```

**Layer 1:** Core notificationScheduler tests green  
**Layer 2:** Full Maestro regression (no new push flow)

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| UAT checklist doc | APNs token implementation |
| Copy polish | New Maestro YAML |
| Trace matrix FR-M12 | RN-PARITY full matrix |
| Deferred spec doc | RN-STORE submission |

### References

- [sprint-rn-push-plan.md](sprint-rn-push-plan.md) RN-PUSH-04
- [prd-rn-migration.md](../planning-artifacts/prd-rn-migration.md) FR-M12
- [testarch-trace-rn-migration.md](testarch-trace-rn-migration.md)
- [pwa-to-rn-migration-plan.md](../planning-artifacts/pwa-to-rn-migration-plan.md) open question: server-side push token registry
- Depends: **RN-PUSH-01**, **RN-PUSH-02**, **RN-PUSH-03**

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
