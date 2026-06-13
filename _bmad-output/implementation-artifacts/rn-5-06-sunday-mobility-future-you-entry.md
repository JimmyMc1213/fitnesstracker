---
name: RN-5-06 Sunday card + mobility + Future You entry
epic: RN-5
story: 06
status: ready-for-dev
swarm_order: 6
swarm_branch: epic-rn-5/home-coach
---

# Story 5.06: Sunday card + mobility preview + Future You entry

Status: ready-for-dev

## Story

**As an** onboarded user  
**I want** Sunday check-in entry, mobility preview, and Future You reminders on Home  
**So that** I can access weekly review and key actions from the dashboard

## Acceptance Criteria

1. **Given** Sunday + check-in data available, **When** viewing today, **Then** `HomeSundayCheckInCard` renders with review CTA
2. **Given** Sunday card CTA, **When** tapped, **Then** `(modals)/sunday-check-in` opens
3. **Given** coach/habits stretch CTA, **When** tapped, **Then** mobility preview sheet opens
4. **Given** deep link `/(tabs)/home?mobility=1`, **When** app opens, **Then** mobility preview opens
5. **Given** Future You entry rules, **When** conditions match, **Then** header NewYou button and/or reminder pill render per `futureYouHomeEntryModel`
6. **Given** reminder pill dismiss, **When** tapped, **Then** `futureYou.reminderDismissedDateKey` persists

## Tasks / Subtasks

- [ ] Port `HomeSundayCheckInCard` (AC: 1–2)
  - [ ] `useSundayCheckInHome` hook — availability + data (card only; flow RN-8)
  - [ ] `testID="sunday-check-in-card"`
- [ ] `MobilityPreviewSheet` shell (AC: 3–4)
  - [ ] Open from carousel stretch CTA, habits mobility, coach tasks
  - [ ] Full stretch session player **out of scope** — placeholder or minimal preview list
  - [ ] Handle `mobility=1` search param on home route
- [ ] Future You home entry (AC: 5–6)
  - [ ] Port `shouldShowHomeNewYouHeaderButton`, `shouldShowFutureYouSkipperReminderPill`
  - [ ] `HomeNewYouHeaderButton` → `/(tabs)/future-you` with upload intent param
  - [ ] `FutureYouSkipperReminderPill` dismiss persist
- [ ] Run typecheck

## Dev Notes

### PWA parity reference

- `HomeSundayCheckInCard.tsx`, `MobilityRoutineFlow.tsx` preview mode
- `futureYouHomeEntryModel.ts`, `HomeNewYouHeaderButton.tsx`, `FutureYouSkipperReminderPill.tsx`
- Architecture: `stretch` tab → `home?mobility=1`

### Scope lock

Full `MobilityRoutineFlow` active session is **not** this story. RN-6 may own workout-adjacent mobility or a follow-on stretch story.

### Anti-patterns

- **Do not** implement Sunday check-in 4-step flow (RN-8)
- **Do not** implement Future You upload MVP (RN-9)

### References

- [sprint-rn-5-home-coach-plan.md](sprint-rn-5-home-coach-plan.md)
- RN-3: `(modals)/sunday-check-in` shell
