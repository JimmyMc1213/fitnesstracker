# Epic Retrospective: RN-PUSH Push Notifications

**Epic key:** `epic-rn-push`  
**Project:** fitnesstracker (NewYou AI mobile migration)  
**Date:** 2026-06-14  
**Facilitator:** Amelia (Developer)  
**Participants:** Jimmymccarthy (Project Lead)

---

## Epic summary

**Goal:** Deliver FR-M12 push notification parity on React Native — shared scheduler logic, `expo-notifications` local reminders, permission + reschedule lifecycle, UAT evidence for trace matrix.

| Metric | Value |
| --- | --- |
| Stories completed | 4 / 4 (RN-PUSH-01 → RN-PUSH-04) |
| Swarm branch | `epic-rn-push/local-notifications` |
| Quality gate (per story) | `npm run typecheck --workspace=@newyouai/mobile` ✅ |
| Quality gate (logic) | `notificationScheduler.test.ts` — 18 tests ✅ |
| Epic status | **done** |

### Stories delivered

| Story | Theme |
| --- | --- |
| RN-PUSH-01 | Scheduler core extract + Vitest port to `packages/core` |
| RN-PUSH-02 | `expo-notifications` schedule/cancel adapter |
| RN-PUSH-03 | `NotificationSchedulerContext` + OB/settings permission wiring |
| RN-PUSH-04 | UAT checklist, FR-M12 trace update, deferred APNs spec, copy polish |

**Execution order:** RN-PUSH-01 → 02 → 03 → 04

---

## What went well

- **Core-first extraction** — PWA polling scheduler logic moved to pure core with injectable permission; PWA and RN share one test suite.
- **Scope discipline** — Workout + nutrition reminders only; morning/weekly toggles remain UI-only matching PWA behavior.
- **Lifecycle wiring** — Reschedule on preference changes, workout completion, and food logging prevents duplicate/stale notifications.
- **Documentation shipped with code** — `docs/uat-rn-push-notifications.md` and `docs/deferred-apns-token-registry-spec.md` unblock RN-PARITY and RN-STORE without extra stories.

---

## Challenges

| Challenge | Impact | Resolution / status |
| --- | --- | --- |
| No Maestro push flow | FR-M12 evidence is manual UAT | Documented in UAT checklist; trace matrix cites Vitest + UAT doc |
| iOS simulator timing | Hard to verify fire-at-time without date tricks | UAT doc includes +2 min test time + `getAllScheduledNotificationsAsync` snippet |
| Stale onboarding copy | "Background notifications coming soon" misleading post-ship | Removed in RN-PUSH-04 |
| Server-side APNs | Not MVP | Deferred spec only — no implementation |

---

## Technical debt & deferrals

| Item | Deferred to | Priority |
| --- | --- | --- |
| Server-side APNs token registry | Post-MVP | Low |
| Morning / weekly review OS notifications | Backlog (PWA never fired) | Low |
| Future You home pill OS push | Out of scope (in-app only) | — |
| Maestro notification permission flow | RN-PARITY manual UAT | Medium |

---

## Key insights

1. **Local notifications ≠ server push** — MVP is `expo-notifications` daily triggers; token registry is a separate epic/post-MVP decision.
2. **Reschedule is the hard part** — Adapter is straightforward; keeping schedules in sync with fitness state changes required a dedicated provider.
3. **UAT on device is mandatory** — Vitest proves logic; only manual checklist proves OS integration.

---

## Action items

| # | Action | Owner | Success criteria |
| --- | --- | --- | --- |
| 1 | Execute `docs/uat-rn-push-notifications.md` on iOS device/simulator | Jimmymccarthy | Sign-off table completed in UAT doc |
| 2 | Merge `epic-rn-push/local-notifications` → `rn-migration` | Jimmymccarthy | PR merged |
| 3 | Begin visual parity pass (separate branch) | Amelia | Home tab browser parity close |
| 4 | Sprint plan RN-STORE before TestFlight | PO | `sprint-rn-store-plan.md` + story files |

---

## Readiness assessment

| Area | Status | Notes |
| --- | --- | --- |
| Story completion | ✅ | All 4 stories done |
| Automated tests | ✅ | Core scheduler Vitest green |
| Typecheck | ✅ | Mobile workspace passes |
| Manual UAT | ⚠️ | Checklist doc ready; execution pending |
| Unblocks RN-PARITY | ✅ | FR-M12 evidence path defined |

**Verdict:** Epic RN-PUSH is **complete for development**. Manual UAT sign-off required before RN-PARITY FR-M12 row is fully green.

---

## Next steps

1. Merge RN-PUSH PR into `rn-migration`
2. Run push UAT checklist on device
3. Continue visual parity on `epic-rn-parity/visual-parity-home`
4. Plan **RN-STORE** then **RN-PARITY**

---

## Epic status: **DONE** (retro complete)
