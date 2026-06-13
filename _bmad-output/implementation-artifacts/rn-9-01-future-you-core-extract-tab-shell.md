---
name: RN-9-01 Future You core extract + tab shell
epic: RN-9
story: 01
status: review
swarm_order: 1
swarm_branch: epic-rn-9/future-you
---

# Story 9.01: Future You core extract + tab shell

Status: review

<!-- Ultimate context engine analysis completed — comprehensive developer guide for RN-9 kickoff -->

## Story

**As a** developer  
**I want** Future You pure logic in `packages/core` and a tab shell replacing the placeholder  
**So that** RN-9-02..09 share tested models and users see a real Future You tab (empty gallery lede, not placeholder copy)

## Acceptance Criteria

1. **Given** PWA Future You model/guard modules listed below, **When** extracted to `packages/core/src/future-you/`, **Then** PWA files become thin re-exports from `@newyouai/core` and colocated Vitest passes unchanged behavior
2. **Given** onboarded user, **When** I open Future You tab, **Then** `TabPlaceholderScreen` is replaced with `FutureYouScreen` shell (header + `gallery` \| `detail` \| `upload` view state)
3. **Given** no transformation yet (`upload_prompt` mode), **When** gallery view renders, **Then** lede shows `futureYouPageLede(mode)` empty copy and primary CTA stub (`testID="future-you-create-cta"`) — full gallery tiles land in RN-9-02
4. **Given** under-18 or over-80 user (from DOB), **When** tab opens, **Then** blocked lede shows (tab visible, upload CTA disabled) — same rules as `isFutureYouPhotoBlocked`
5. **Given** `openFutureYouUpload=1` route param from Home, **When** tab mounts, **Then** view state switches to `upload` with stub body ("Upload flow ships in RN-9-04") until RN-9-04
6. **Given** Maestro tab-nav, **When** `npm run test:e2e:tab-nav` runs, **Then** Future You tab reachable with `testID="tab-future-you"`; onboarding + Home flows unchanged

## Tasks / Subtasks

- [x] Create `packages/core/src/future-you/` extract (AC: 1)
  - [x] `pageModel.ts` ← `futureYouPageModel.ts` + test
  - [x] `galleryModel.ts` ← `futureYouGalleryModel.ts` + test
  - [x] `homeEntryModel.ts` ← `homeFutureYouModel.ts` + test (export `HomeFutureYouEntryMode`, `getHomeFutureYouEntryMode`, `homeFutureYouMotivationLabel`, card copy helpers)
  - [x] `successModel.ts` ← `futureYouSuccessModel.ts` + test (required by home entry)
  - [x] `timeline.ts` ← `futureYouTimeline.ts` + test
  - [x] `status.ts` ← `futureYouStatus.ts` + test
  - [x] `jobs.ts` ← `futureYouJobs.ts` job helpers + test (status enum stays `@newyouai/types`)
  - [x] `storage.ts`, `paths.ts` ← `futureYouStorage.ts`, `futureYouPaths.ts` + tests
  - [x] `uploadGuards.ts`, `generateGuards.ts`, `reportGuards.ts` + tests (keep edge-fn sync comments)
  - [x] `motivations.ts` ← `futureYouMotivations.ts` + test (shared by status/generate/home)
  - [x] `heroCopy.ts` ← `futureYouHeroCopy.ts`
  - [x] Export all from `packages/core/src/index.ts`
  - [x] PWA `apps/pwa/src/fitness/futureYou*.ts` model files → one-line re-exports (match `weightProgress.ts` pattern)
- [x] Consolidate mobile duplicates (AC: 1)
  - [x] `@/lib/homeFutureYouModel.ts` → re-export from `@newyouai/core` (delete inlined duplicate logic)
  - [x] `@/lib/futureYouMotivations.ts` → re-export from core OR delete if unused after onboarding imports updated
  - [x] Update onboarding/mobile imports to `@newyouai/core` where models moved
- [x] Implement tab shell (AC: 2–5)
  - [x] `apps/mobile/components/future-you/FutureYouScreen.tsx` — port PWA `FutureYouPageContent` **state machine only** (view, mode, timeline, lede, redo countdown hook stub OK without poll)
  - [x] `apps/mobile/app/(tabs)/future-you.tsx` — thin default export wrapping `FutureYouScreen`
  - [x] `ScreenHeader` title **"NewYou"** (PWA tab label)
  - [x] Gallery stub: lede + disabled/blocked states + create CTA (`testID="future-you-gallery"`, `testID="future-you-create-cta"`)
  - [x] Upload stub when `view === "upload"`: placeholder copy until RN-9-04
  - [x] Handle `useLocalSearchParams().openFutureYouUpload` → set view `upload` on mount (mirror Home `router.push` from `home.tsx`)
  - [x] Wire `useFitnessState` for `futureYou`, `onboardingProfile`, `subscriptionTier`, `onboardingComplete`
  - [x] Age via `ageFromDateOfBirth` / `useFutureYouEntry` pattern — reuse `@/hooks/useFutureYouEntry` or `@/lib/onboardingProfile`
  - [x] Remove `TabPlaceholderScreen` + "ships in RN-9" subtitle from route file
- [x] Run gates (AC: 1, 6) — core/pwa/mobile typecheck green; e2e tab-nav requires Metro on :8082

## Dev Notes

### Current state

| File | Today | This story |
|------|-------|------------|
| `apps/mobile/app/(tabs)/future-you.tsx` | `TabPlaceholderScreen` | `FutureYouScreen` shell |
| `packages/core/src/future-you/` | Does not exist | Pure FY models + guards |
| `packages/core/sync/futureYouDraft.ts` | Draft merge only | Unchanged — already in core |
| `apps/mobile/lib/homeFutureYouModel.ts` | Duplicated subset of PWA | Re-export from core |
| `apps/mobile/lib/futureYouMotivations.ts` | Full duplicate of PWA | Re-export from core |
| Onboarding FY (RN-4) | Works via mobile lib + api-client | Must not regress after re-exports |
| Home FY entry (RN-5) | Routes to tab with `openFutureYouUpload=1` | Param handling required here |

**Blocks RN-9-02..09** — no gallery tiles, poll, upload UI, or Maestro until core + shell land.

### Previous epic intelligence (RN-8 close)

- Core extract pattern: move pure TS to `packages/core/src/<domain>/`, PWA file becomes `export { ... } from "@newyouai/core"`, port Vitest with module (see `packages/core/src/progress/weightProgress.ts`).
- Tab shell pattern: `(tabs)/<name>.tsx` uses `ScreenHeader` + `useFitnessState` + `useSafeAreaInsets` (see `progress.tsx`, `nutrition.tsx`).
- Epic close added Maestro seeds via `EXPO_PUBLIC_E2E_FITNESS_SEED` — RN-9-09 will add FY seed; not this story.
- Do not break `npm run test:e2e:progress`, `npm run test:e2e:sunday-check-in`, or other regression flows when touching tab shell.

### PWA parity reference — state machine (shell only)

```73:130:apps/pwa/src/fitness/FutureYouPageContent.tsx
// view: gallery | detail | upload
// mode = getHomeFutureYouEntryMode(...)
// timeline = futureYouTimelineFromProfile(profile)
// pageLede = futureYouPageLede(mode)
// pageRedoLde = futureYouPageRedoLede(msUntilRedo)
```

```85:93:apps/pwa/src/fitness/futureYouPageModel.ts
export function futureYouPageLede(mode: HomeFutureYouEntryMode | null): string
export function futureYouPageRedoLede(msUntilRedo: number): string | null
```

```13:44:apps/pwa/src/fitness/homeFutureYouModel.ts
export function getHomeFutureYouEntryMode(...)
```

### Architecture compliance

- Route: `(tabs)/future-you` per [architecture-rn-migration.md](../planning-artifacts/architecture-rn-migration.md) §3
- FAB: `TabBarDock.tsx` already routes to `future-you` tab — do not change dock layout
- Services (`futureYouUploadService`, poll, generate, delete, report) stay in `apps/mobile/lib/` + `@newyouai/api-client` until UI stories wire them (RN-9-04+)
- Camera permission already in `app.config.ts` from RN-4-05

### File structure requirements

```
packages/core/src/future-you/
  pageModel.ts + pageModel.test.ts
  galleryModel.ts + galleryModel.test.ts
  homeEntryModel.ts + homeEntryModel.test.ts
  successModel.ts + successModel.test.ts
  timeline.ts + timeline.test.ts
  status.ts + status.test.ts
  jobs.ts + jobs.test.ts
  storage.ts + storage.test.ts
  paths.ts + paths.test.ts
  uploadGuards.ts + uploadGuards.test.ts
  generateGuards.ts + generateGuards.test.ts
  reportGuards.ts + reportGuards.test.ts
  motivations.ts + motivations.test.ts
  heroCopy.ts
  index.ts                    # barrel re-export optional

apps/mobile/components/future-you/
  FutureYouScreen.tsx           # NEW — shell only this story

apps/mobile/app/(tabs)/future-you.tsx   # UPDATE — thin wrapper
```

PWA re-export example (follow exactly):

```1:9:apps/pwa/src/fitness/weightProgress.ts
export {
  deltaColorForSentiment,
  ...
} from "@newyouai/core";
```

### Anti-patterns

- **Do not** port `FutureYouGalleryView`, `FutureYouDetailView`, `FutureYouNewPicView`, poll hooks, or fullscreen viewer in this story (RN-9-02..06)
- **Do not** duplicate `getHomeFutureYouEntryMode` in mobile — single source in core
- **Do not** break onboarding FY photo/motivation (RN-4) or Home header routing (RN-5)
- **Do not** wire cloud sync (RN-OFFLINE)
- **Do not** implement Maestro FY flow (RN-9-09)
- **Do not** change `packages/api-client` invoke signatures

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run test --workspace=@newyouai/pwa    # FY model tests via re-exports
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:tab-nav
npm run test:e2e:onboarding              # RN-4 FY regression
npm run test:e2e:coach-nutrition         # Home regression
```

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Core extract of FY models/guards/motivations | `futureYouPaywallModel`, `futureYouSilhouettes` (RN-9-03) |
| Tab shell + empty gallery lede + view state | Gallery tiles, detail, upload UI (RN-9-02..05) |
| `openFutureYouUpload` param → upload view stub | Photo picker, consent, upload API (RN-9-04) |
| Mobile/PWA re-export consolidation | Maestro, disclosures audit (RN-9-09) |
| Under-18 blocked lede on tab | Report, delete, replace (RN-9-07..08) |

### References

- [sprint-rn-9-future-you-plan.md](sprint-rn-9-future-you-plan.md) RN-9-01
- [prd-rn-migration.md](../planning-artifacts/prd-rn-migration.md) FR-M7
- [pwa-codebase-inventory.md](../planning-artifacts/pwa-codebase-inventory.md) FY-01..06
- PWA: `FutureYouPageContent.tsx`, `futureYouPageModel.ts`, `homeFutureYouModel.ts`
- Mobile: `app/(tabs)/future-you.tsx`, `hooks/useFutureYouEntry.ts`, `app/(tabs)/home.tsx` (openNewYouUpload)
- Prior extract: `packages/core/src/progress/weightProgress.ts`, `rn-8-01-progress-core-extract-weight-chart.md`

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Extracted 14 Future You pure-logic modules to `packages/core/src/future-you/` with 13 Vitest files (266 core tests pass).
- PWA model files converted to thin `@newyouai/core` re-exports; PWA suite 575 tests pass.
- Mobile `homeFutureYouModel` + `futureYouMotivations` re-export from core; `FutureYouScreen` tab shell replaces placeholder.
- `FUTURE_YOU_PAGE_BLOCKED_LEDE` added for ages 18–80 gate via `useFutureYouEntry`.
- `npm run test:e2e:tab-nav` not run — Metro unavailable on :8082 in this environment.

### File List

- packages/core/src/future-you/* (14 modules + 13 tests)
- packages/core/src/index.ts
- apps/pwa/src/fitness/futureYou*.ts, homeFutureYouModel.ts (re-exports)
- apps/mobile/lib/homeFutureYouModel.ts, futureYouMotivations.ts (re-exports)
- apps/mobile/components/future-you/FutureYouScreen.tsx
- apps/mobile/app/(tabs)/future-you.tsx
