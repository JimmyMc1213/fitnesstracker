---
name: RN-5-05 Weigh-in sheet + coach reaction
epic: RN-5
story: 05
status: done
swarm_order: 5
swarm_branch: epic-rn-5/home-coach
---

# Story 5.05: Weigh-in card + sheet + coach reaction

Status: done

## Story

**As an** onboarded user  
**I want** to log my morning weigh-in from Home and see coach feedback  
**So that** I can track weight and get plan adjustments

## Acceptance Criteria

1. **Given** today with no weight entry, **When** Home renders, **Then** full morning weigh-in card is visible and tappable
2. **Given** weigh-in card tap, **When** sheet opens, **Then** `WeighInSheet` allows weight entry with unit preference (lbs/kg)
3. **Given** saved weigh-in, **When** sheet closes, **Then** `weightLog` persists in fitness slice
4. **Given** logged weigh-in today, **When** coach adjustment applies, **Then** `WeighInCoachReaction` shows compact coach message
5. **Given** entry exists, **When** habits card renders, **Then** inline weigh-in status shown (density mode); full card hidden

## Tasks / Subtasks

- [ ] Port `WeighInSheet` as bottom sheet / modal (AC: 2–3)
  - [ ] Weight input with unit conversion; `testID="weigh-in-sheet"`
  - [ ] Progress photo affordance stub (camera RN-8)
- [ ] Morning weigh-in full card (AC: 1)
  - [ ] `testID="weigh-in-card"`; opens sheet
- [ ] Port `WeighInCoachReaction` (AC: 4)
  - [ ] Wire `getWeighInReactionForDisplay(coachCtx, dayEntry)`
- [ ] Inline weigh-in on habits card when entry exists (AC: 5)
- [ ] Run typecheck + core coach weigh-in tests if touched

## Dev Notes

### PWA parity reference

- `WeighInSheet.tsx`, `WeighInCoachReaction.tsx`
- `ScreenHome.tsx` lines ~119–323 weigh-in + reaction blocks
- FTI-43 home density — inline vs full card logic

### Anti-patterns

- **Do not** implement progress photo capture (RN-8)
- **Do not** duplicate weigh-in form on Progress tab (RN-8)

### References

- [sprint-rn-5-home-coach-plan.md](sprint-rn-5-home-coach-plan.md)
- Core: `getWeighInReaction`, `getWeighInReactionForDisplay`
