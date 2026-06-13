---
name: RN-8-01 Progress core extract + weight chart tab shell
epic: RN-8
story: 01
status: done
swarm_order: 1
swarm_branch: epic-rn-8/progress-check-ins
---

# Story 8.01: Progress core extract + weight chart tab shell

Status: ready-for-dev

## Story

**As a** developer  
**I want** weight progress pure logic in `packages/core` and a body-weight chart on the Progress tab  
**So that** downstream RN-8 stories share tested foundations and users see weight trend on Progress

## Acceptance Criteria

1. **Given** PWA `weightProgress.ts`, **When** extracted to `packages/core`, **Then** PWA re-exports unchanged API and colocated Vitest passes
2. **Given** onboarded user with `weightLog`, **When** I open Progress tab, **Then** placeholder is replaced with body weight card (today value, delta vs start, unit labels)
3. **Given** ≥2 weight entries, **When** chart renders, **Then** `WeightLineChart` shows trend line via `react-native-svg` (port PWA `LineChart` behavior)
4. **Given** &lt;2 entries, **When** chart area renders, **Then** empty state shows "Log two weigh-ins to unlock the trend line"
5. **Given** goal from onboarding, **When** delta displays, **Then** color/sentiment uses `weightDeltaSentiment` + `deltaColorForSentiment` (goal-aware cut/bulk/maintain)
6. **Given** Maestro tab-nav, **When** `npm run test:e2e:tab-nav` runs, **Then** Progress tab reachable with `testID="tab-progress"`

## Tasks / Subtasks

- [x] Extract to `packages/core/src/progress/` (AC: 1)
  - [x] `weightProgress.ts` + test (from `apps/pwa/src/fitness/weightProgress.ts`)
  - [x] Export from `packages/core/src/index.ts`; PWA file becomes thin re-export
  - [x] Map CSS color tokens to RN theme colors in UI layer (core returns sentiment enum; mobile maps colors)
- [x] Replace `(tabs)/progress.tsx` placeholder (AC: 2–5)
  - [x] `ScreenHeader` with title "Progress" (match Nutrition tab pattern)
  - [x] Body weight card: "Log weight" / "Update weight" CTA (`testID="progress-log-weight"`)
  - [x] CTA opens weigh-in stub until RN-8-02 (Alert or no-op OK; wire state in RN-8-02)
  - [x] `WeightLineChart` component in `components/progress/` using `react-native-svg`
  - [x] Sort `weightLog` by `dateKey`; chart series respects `unitPreferences.weightUnit`
  - [x] Remove "ships in RN-8" placeholder copy
- [x] Run gates (AC: 1, 6)

## Dev Notes

### Current state

| File | Today | This story |
|------|-------|------------|
| `apps/mobile/app/(tabs)/progress.tsx` | `TabPlaceholderScreen` | Progress shell + weight card |
| `packages/core/src/progress/` | Does not exist | `weightProgress.ts` |
| `apps/pwa/src/fitness/weightProgress.ts` | Source of truth | Re-export from core |
| `FitnessProvider` | RN-5 done | Read `weightLog`, `progressGoal`, `unitPreferences` |

**Blocks RN-8-02..07** — no progress UI beyond weight card until core extract lands.

### PWA parity reference

```134:228:apps/pwa/src/fitness/screens/ScreenProgress.tsx
// Body weight card: today display, delta, LineChart, log weight CTA
```

```12:38:apps/pwa/src/fitness/weightProgress.ts
// weightDeltaSentiment, deltaColorForSentiment, MAINTAIN_WEIGHT_BAND_LBS
```

```127:180:apps/pwa/src/fitness/shared.tsx
// LineChart — port path generation + padding (CHART_PAD_LEFT/RIGHT = 12/36)
```

### Architecture compliance

- Route: `(tabs)/progress` per `architecture-rn-migration.md` §3
- Reuse `ScreenHeader` from `components/home/ScreenHeader.tsx`
- Reuse `formatWeightFromLbs` / unit helpers from `@/lib/unitConversions` or core exports
- Do not implement weigh-in sheet content here (RN-8-02)

### Anti-patterns

- **Do not** port full `ScreenProgress.tsx` monolith in this story
- **Do not** add calendar, PR board, Sunday flow (RN-8-03..07)
- **Do not** break `npm run test:e2e:tab-nav` or nutrition/workout regressions

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run test --workspace=@newyouai/pwa   # weightProgress.test.ts via re-export
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:tab-nav
```

### References

- [sprint-rn-8-progress-plan.md](sprint-rn-8-progress-plan.md) RN-8-01
- PWA: `ScreenProgress.tsx`, `weightProgress.ts`, `shared.tsx` LineChart
- Mobile: `app/(tabs)/progress.tsx`, `components/home/MacroRing.tsx` (SVG pattern)
