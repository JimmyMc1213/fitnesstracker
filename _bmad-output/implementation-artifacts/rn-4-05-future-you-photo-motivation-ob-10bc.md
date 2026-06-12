---
name: RN-4-05 Future You photo motivation OB-10bc
epic: RN-4
story: 05
status: done
swarm_order: 5
swarm_branch: epic-rn-4/onboarding-v2
---

# Story 4.05: Future You photo + motivation (OB-10b–10c)

Status: done

## Story

**As a** user in the goal phase  
**I want** to optionally upload a photo and share my motivation  
**So that** Future You generation can start before training questions

## Acceptance Criteria

1. **Given** step 100 (10b), **When** I upload via camera or gallery, **Then** photo compresses and stores in `futureYou` draft (`expo-image-picker`)
2. **Given** under-18 user (from DOB), **When** on step 10b, **Then** blocked UI shows (not hidden) with copy per spec
3. **Given** step 10b, **When** I tap Skip for now, **Then** advance to step 11 without starting generation
4. **Given** step 101 (10c), **When** I Continue with motivation selected, **Then** `startFutureYouGeneration` fires (api-client) and advance to step 11
5. **Given** step 11+ with generation running, **When** wizard chrome visible, **Then** generation pill shows (`FutureYouGenerationPill` stub acceptable — full poll RN-9)
6. **Given** permissions denied, **When** user picks photo, **Then** friendly error + skip path still works

## Tasks / Subtasks

- [x] Add `expo-image-picker` (+ document camera permission in `app.config.ts`) (AC: 1)
- [x] Port `OnboardingFutureYouPhoto.tsx` (AC: 1–3, 6)
- [x] Port `isFutureYouPhotoBlocked` from `futureYouAge.ts` (AC: 2)
- [x] Port `OnboardingFutureYouMotivation.tsx` (AC: 4)
- [x] Wire upload + generation services via `@newyouai/api-client` (AC: 4)
  - [x] Port/adapt `futureYouUploadService`, `futureYouGenerateService`, `compressImageToJpegDataUrl` to mobile adapter
- [x] Add `FutureYouGenerationPill` in wizard layout slot (AC: 5)
- [x] Back from 10c → 10b; back from 10b → pace or goal per `backStepFromFutureYouPhoto`
- [x] Run typecheck

## Dev Notes

### PWA reference

- `OnboardingFutureYouPhoto.tsx`, `OnboardingFutureYouMotivation.tsx`
- `futureYouDraft.ts`, `futureYouAge.ts`, `futureYouGenerateService.ts`
- Steps 100/101 in `OnboardingFlow.tsx` (~1153–1228)

### Architecture

- Camera permission matrix: [architecture-rn-migration.md §4](../planning-artifacts/architecture-rn-migration.md)
- Image compression stays in mobile adapter — not in `packages/core` if DOM-specific; extract pure logic to core if reusable

### Previous story intelligence (RN-4-04)

- Maintain users reach 10b directly from step 8
- Goal-lock prevents back to steps 8–10 from step 11
- `canRevisitFutureYouPhoto` allows photo revisit from step 11 if user skipped

### Anti-patterns

- **Do not** hide 10b for under-18 — show blocked state
- **Do not** block onboarding if generation API fails — queue/retry like PWA
- **Do not** wire RevenueCat here (RN-4-10)

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
```

Manual: skip path, maintain path, blocked teen UI on simulator.

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Photo upload + motivation + job start | Full generation polling UI (minimal pill OK) |
| Under-18 blocked state | Future You tab content (RN-9) |

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- `npm run typecheck --workspace=@newyouai/mobile` — pass
- `npm run test --workspace=@newyouai/mobile` — 16 tests pass

### Completion Notes List

- RN-4-05: Future You photo (10b) + motivation (10c) with camera/gallery picker, under-18 blocked UI, skip path, upload/generation via api-client, generation pill stub on step 11+

### File List

- apps/mobile/app.config.ts
- apps/mobile/app/(onboarding)/index.tsx
- apps/mobile/components/onboarding/FutureYouGenerationPill.tsx
- apps/mobile/components/onboarding/OnboardingFutureYouMotivation.tsx
- apps/mobile/components/onboarding/OnboardingFutureYouPhoto.tsx
- apps/mobile/components/onboarding/OnboardingShell.tsx
- apps/mobile/context/OnboardingWizardContext.tsx
- apps/mobile/hooks/useFutureYouOnboarding.ts
- apps/mobile/lib/futureYouAge.ts
- apps/mobile/lib/futureYouAge.test.ts
- apps/mobile/lib/futureYouGenerateService.ts
- apps/mobile/lib/futureYouGenerationPillModel.ts
- apps/mobile/lib/futureYouLegal.ts
- apps/mobile/lib/futureYouMotivations.ts
- apps/mobile/lib/futureYouTimeline.ts
- apps/mobile/lib/futureYouUploadService.ts
- apps/mobile/lib/imageCompress.ts
- apps/mobile/lib/onboardingWizardNavigation.ts
- apps/mobile/package.json
