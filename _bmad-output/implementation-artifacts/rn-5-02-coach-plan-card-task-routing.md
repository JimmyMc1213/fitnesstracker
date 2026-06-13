---
name: RN-5-02 Coach plan card + task routing
epic: RN-5
story: 02
status: done
swarm_order: 2
swarm_branch: epic-rn-5/home-coach
---

# Story 5.02: Coach plan card + task routing

Status: done

## Story

**As an** onboarded user viewing Home today  
**I want** to see my coach plan with actionable tasks  
**So that** I can follow daily guidance and jump to the right tab

## Acceptance Criteria

1. **Given** today view, **When** Home renders, **Then** `getHomeCoachPlan(buildCoachContext(...))` drives visible plan copy
2. **Given** coach plan with tasks, **When** I view the card, **Then** `TodaysCoachPlanCard` shows headline, subline, and task CTAs matching PWA layout
3. **Given** a coach task (e.g. `log_fuel`), **When** I tap its CTA, **Then** `resolveCoachTaskNavigation` routes to the correct tab/modal via expo-router
4. **Given** historical date view, **When** Home renders, **Then** coach plan card is hidden
5. **Given** rest day plan, **When** carousel coach slide renders, **Then** rest-day focus tags appear (hydration, protein, sleep)

## Tasks / Subtasks

- [ ] Port `TodaysCoachPlanCard` to `apps/mobile/components/home/` (AC: 2)
  - [ ] NativeWind + theme tokens; `PrimaryButton` for primary task
  - [ ] `testID="coach-plan-card"`; per-task `coach-task-{kind}`
- [ ] Port `coachTaskActions.ts` → `apps/mobile/lib/coachTaskActions.ts` (AC: 3)
  - [ ] Map task kinds to `router.push` targets: nutrition, workout, progress, log-food modal, etc.
  - [ ] Skip navigation for already-completed tasks (PWA guard)
- [ ] Add `HomeDashboardCarousel` shell with coach/training slide (AC: 1, 5)
  - [ ] Slide 2: plan headline, `homePlanSubline`, start workout CTA, session estimate
  - [ ] Fuel slide placeholder until RN-5-03
- [ ] Wire coach plan below Sunday/weigh-in zone per PWA stack order (AC: 4)
- [ ] Run typecheck + `npm run test --workspace=@newyouai/core -- --run coachEngine` (AC: 1)

## Dev Notes

### Dependencies

- **Requires RN-5-01** `useFitnessState` for `AppState` shape

### PWA parity reference

- `TodaysCoachPlanCard.tsx`, `coachTaskActions.ts`, `HomeDashboardCarousel.tsx` coach slide
- `coachEngine.test.ts` — do not change engine behavior; wire only

### Anti-patterns

- **Do not** hardcode coach copy — engine strings only
- **Do not** implement fuel/macro slide (RN-5-03)
- **Do not** add quick-log sheet (removed in PWA nutrition-os-v2)

### References

- [sprint-rn-5-home-coach-plan.md](sprint-rn-5-home-coach-plan.md)
- Core: `buildCoachContext`, `getHomeCoachPlan`, `estimateRoutineSessionSeconds`
