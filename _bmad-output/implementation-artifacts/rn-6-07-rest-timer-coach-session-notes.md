---
name: RN-6-07 Rest timer coach session notes
epic: RN-6
story: 07
status: done
swarm_order: 7
swarm_branch: epic-rn-6/workout-domain
---

# Story 6.07: Rest timer + coach card + session notes

Status: ready-for-dev

## Story

**As a** user between sets  
**I want** a rest timer, coach guidance, and per-exercise session notes  
**So that** in-session coaching matches PWA FTI-54 rule-based notes (no LLM)

## Acceptance Criteria

1. **Given** I complete a working set, **When** rest timer rules apply, **Then** `RestTimerSheet` opens with countdown from exercise/rest prefs
2. **Given** rest timer active, **When** I pause/skip, **Then** timer state updates and sheet dismisses correctly
3. **Given** session start, **When** coach card renders, **Then** pre-workout brief shows in `WorkoutCoachCard` (expand/collapse parity)
4. **Given** exercises in session, **When** notes generated, **Then** rule-based copy from `buildSessionCoachNotesByExerciseId` displays per exercise (FTI-54)
5. **Given** session ends, **When** returning idle, **Then** session notes cleared (not persisted across sessions)

## Tasks / Subtasks

- [ ] Port `RestTimerSheet` with `AppState` background tick / interval (AC: 1–2)
  - [ ] Use `restDurationForExercise` / prefs from state
  - [ ] `testID="workout-rest-timer"`
- [ ] Port `WorkoutCoachCard` — pre-workout + in-session modes (AC: 3)
  - [ ] Coach blue tokens from theme / `workoutUiTokens` equivalent
- [ ] Wire session notes on start / add / swap (AC: 4–5)
  - [ ] `buildSessionCoachNotesByExerciseId` from core (RN-6-01)
  - [ ] Store in `workout.sessionCoachNotesByExerciseId` for session duration only
- [ ] Trigger rest timer from set complete handler (AC: 1)

## Dev Notes

### Previous story intelligence (RN-6-05/06)

- Set complete handler must call rest timer start hook after marking set done

### PWA parity reference

PWA: `RestTimerSheet.tsx`, `WorkoutCoachCard.tsx`, `exerciseSessionNotes.ts`, `preWorkoutCoachBrief.ts`.

FTI-54: rule-based notes only — **LLM notes (FTI-55) out of scope** for RN-6.

Core already has `getFirstSessionCoachNote`, `progressiveOverloadInsight` in `coachEngine.ts`.

### Anti-patterns

- **Do not** add Claude/LLM API calls
- **Do not** persist `sessionCoachNotesByExerciseId` to AsyncStorage slice across sessions

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
```

Manual: complete set → rest sheet appears; coach note visible on exercise card.

### References

- [sprint-rn-6-workout-plan.md](sprint-rn-6-workout-plan.md) RN-6-07
- PWA: `RestTimerSheet.tsx`, `WorkoutCoachCard.tsx`, FTI-54 story file
