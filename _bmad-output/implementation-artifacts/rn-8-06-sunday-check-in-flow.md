---
name: RN-8-06 Sunday weekly check-in 4-step flow
epic: RN-8
story: 06
status: done
swarm_order: 6
swarm_branch: epic-rn-8/progress-check-ins
---

# Story 8.06: Sunday weekly check-in 4-step flow

Status: done

## Story

**As a** user  
**I want** to complete the 4-step Sunday weekly check-in  
**So that** I review my week, see coach insights, and lock in commitments for the week ahead

## Acceptance Criteria

1. **Given** PWA `sundayCheckIn.ts` (+ coach content), **When** extracted to `packages/core`, **Then** PWA re-exports unchanged and Vitest passes
2. **Given** Sunday (or dev preview flag), **When** Home Sunday card tapped, **Then** full flow opens in `(modals)/sunday-check-in` (not stub)
3. **Given** flow open, **When** I navigate steps 0–3, **Then** Overview → Body weight → Coach read → Commitments match PWA `SUNDAY_CHECK_IN_STEPS`
4. **Given** commitments step, **When** I select options + lock in, **Then** `commitSundayCheckIn` updates `sundayReviewCompletedKey`, `weekFocusCommitments`, appends history
5. **Given** flow complete, **When** Home card re-renders, **Then** `completed` state true for current `sundayKey`
6. **Given** mobile `lib/sundayCheckInHome.ts`, **When** merged, **Then** card uses core `buildSundayCheckInData` / `shouldShowSundayCheckIn` — remove duplicate logic

## Tasks / Subtasks

- [x] Extract Sunday check-in domain to core (AC: 1)
  - [x] `sundayCheckIn.ts` + test
  - [x] `sundayCheckInCoachContent.ts` (or bundled per PWA structure)
  - [x] `sundayCheckInHistory.ts` helpers not already in core sync layer
  - [x] PWA re-exports; deprecate duplicate types in `lib/sundayCheckInHome.ts`
- [x] Port `SundayWeeklyCheckInFlow` UI (AC: 2–5)
  - [x] Replace `(modals)/sunday-check-in.tsx` stub
  - [x] Step transitions (forward/back), progress header, close with confirm if mid-flow
  - [x] Step 0: week summary metrics + day cells
  - [x] Step 1: body weight trend chart (reuse `WeightLineChart` if applicable)
  - [x] Step 2: coach read narrative cards
  - [x] Step 3: commitment multi-select, custom commitment, lock-in CTA
  - [x] `testID="modal-sunday-check-in"`, step-specific testIDs
- [x] Dev / E2E Sunday preview (AC: 2)
  - [x] `EXPO_PUBLIC_E2E_DEV_PREVIEW_SUNDAY` or URL param mirroring PWA `isDevPreviewSundayUrl`
  - [x] Wire `useSundayCheckInHome` to core exports
- [x] Run gates

## Dev Notes

### Dependencies

**Requires RN-8-01** (weight chart component optional for step 1). **Does not require** RN-8-05 gallery.

### Current state

| File | Today | This story |
|------|-------|------------|
| `(modals)/sunday-check-in.tsx` | Stub | Full 4-step flow |
| `hooks/useSundayCheckInHome.ts` | Partial card data | Core-backed |
| `lib/sundayCheckInHome.ts` | Simplified `SundayCheckInData` | Merge into PWA-shaped core types |
| PWA `SundayWeeklyCheckInFlow.tsx` | ~1000 lines | Port incrementally; don't one-shot |

### PWA parity reference

```60:80:apps/pwa/src/fitness/SundayWeeklyCheckInFlow.tsx
// Step state machine, SUNDAY_CHECK_IN_STEPS = 4
```

```1:30:apps/pwa/src/fitness/sundayCheckIn.ts
// buildSundayCheckInData, commitSundayCheckIn, shouldShowSundayCheckIn
```

Home card already routes: `router.push("/(modals)/sunday-check-in")` in `home.tsx`.

### Anti-patterns

- **Do not** implement Sunday history full page (RN-8-07)
- **Do not** keep parallel `SundayCheckInData` type in mobile if core type differs — unify
- **Do not** skip `weekFocusCommitments` persist on complete

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run test --workspace=@newyouai/pwa   # sundayCheckIn tests if present
npm run typecheck --workspace=@newyouai/mobile
```

Manual: set dev preview Sunday → complete flow → verify `sundayReviewCompletedKey`.

### References

- [sprint-rn-8-progress-plan.md](sprint-rn-8-progress-plan.md) RN-8-06
- PWA: `SundayWeeklyCheckInFlow.tsx`, `sundayCheckIn.ts`, `useSundayWeeklyCheckIn.ts`
- Mobile: `sunday-check-in.tsx`, `useSundayCheckInHome.ts`, `HomeSundayCheckInCard`
