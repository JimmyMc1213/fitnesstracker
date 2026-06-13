---
name: RN-5-01 Fitness state + home shell
epic: RN-5
story: 01
status: ready-for-dev
swarm_order: 1
swarm_branch: epic-rn-5/home-coach
---

# Story 5.01: Fitness state + home shell

Status: ready-for-dev

## Story

**As an** onboarded user  
**I want** the Home tab to load my fitness profile and show a personalized header  
**So that** subsequent home features have real state to render against

## Acceptance Criteria

1. **Given** onboarding completed, **When** I open Home, **Then** fitness slice loads from AsyncStorage (`FITNESS_LOCAL_STORAGE_KEY`) and hydrates UI state
2. **Given** `displayName` in slice, **When** viewing today, **Then** header shows time-of-day greeting with first name (e.g. "Good morning, Jimmy")
3. **Given** historical date selected, **When** header renders, **Then** title shows weekday + long date; "Back to today" returns to today view
4. **Given** Home header, **When** I tap settings gear, **Then** I navigate to `/(tabs)/settings`
5. **Given** RN-4 Maestro flows, **When** `npm run test:e2e:onboarding` runs, **Then** user still lands on Home after onboarding

## Tasks / Subtasks

- [ ] Extract `homeGreeting.ts` to `packages/core/src/coach/homeGreeting.ts` (AC: 2)
  - [ ] Export `homeGreetingTitle`, `greetingFirstName`, `timeOfDayBucket`
  - [ ] PWA `homeGreeting.ts` re-exports from core; run existing tests
- [ ] Add `FitnessProvider` + `useFitnessState` (AC: 1)
  - [ ] Load `PersistedFitnessSlice` on mount via `loadPersistedSlice` + AsyncStorage adapter
  - [ ] `setFitnessState` patches state and `savePersistedSlice` on meaningful changes
  - [ ] Wrap `(tabs)` or root app layout inside provider
- [ ] Replace `(tabs)/home.tsx` placeholder (AC: 2–4)
  - [ ] ScrollView shell with `ScreenHeader` (eyebrow from `formatDateKeyEyebrow`, title, settings)
  - [ ] `viewDateKey` state + clock tick for today detection
  - [ ] Remove sign-out-centric placeholder; preserve `testID="tab-home"`
- [ ] Run `npm run typecheck --workspace=@newyouai/mobile` (AC: 5)

## Dev Notes

### Current state

| File | Today | This story |
|------|-------|------------|
| `apps/mobile/app/(tabs)/home.tsx` | Dev placeholder + sign-out | Scrollable home shell |
| `apps/mobile/lib/finishOnboarding.ts` | Writes fitness slice | Unchanged — RN-5-01 reads it |
| `packages/core` | `loadPersistedSlice`, `savePersistedSlice` | Add `homeGreeting` export |

No `useFitnessState` exists — **this story blocks RN-5-02..07**.

### PWA parity reference

```108:115:apps/pwa/src/fitness/screens/ScreenHome.tsx
  const headerEyebrow = formatDateKeyEyebrow(activeDateKey);
  const headerTitle = isViewingToday
    ? homeGreetingTitle(greetingName, todayForGreeting)
    : new Date(activeDateKey.replace(/-/g, "/")).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
```

### Anti-patterns

- **Do not** wire cloud sync / `fitnessHydrated` restore (RN-OFFLINE)
- **Do not** implement coach cards, carousel, habits (RN-5-02+)
- **Do not** break onboarding Maestro landing on Home

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:onboarding
```

### References

- [sprint-rn-5-home-coach-plan.md](sprint-rn-5-home-coach-plan.md)
- PWA: `ScreenHome.tsx` header, `buildAppState.ts`
- Core: `packages/core/src/sync/persistFitnessSlice.ts`
