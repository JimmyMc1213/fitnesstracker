---
name: RN-9-03 Detail view + poll + reveal
epic: RN-9
story: 03
status: ready-for-dev
swarm_order: 3
swarm_branch: epic-rn-9/future-you
---

# Story 9.03: Detail view + generation poll + reveal image

Status: review

<!-- Ultimate context engine analysis completed -->

## Story

**As a** user with a Future You job  
**I want** detail view with live generation status and reveal image when ready  
**So that** I see my transformation progress and result on the tab

## Acceptance Criteria

1. **Given** gallery tile selected, **When** `view === "detail"`, **Then** `FutureYouDetailView` shows back toolbar, hero, AI disclaimer label
2. **Given** job queued/generating, **When** detail active and tab focused, **Then** `useFutureYouGenerationPoll` updates draft status; hero shows loading/silhouette
3. **Given** job ready + `subscriptionTier === "pro"`, **When** entitled, **Then** `useFutureYouRevealImage` loads `resultSignedUrl` and hero shows unblurred image
4. **Given** non-pro tier, **When** reveal would show, **Then** paywall gate per `futureYouPaywallModel` / `isFutureYouPostPayEntitled` (blur or upsell copy)
5. **Given** back affordance, **When** tapped, **Then** return to gallery; reset `selectedItemId` optional
6. **Given** poll runs, **When** tab not active, **Then** polling stops (match PWA `active` + `pollEnabled` props)

## Tasks / Subtasks

- [x] Extract to core if not done in RN-9-01 (AC: 3–4)
  - [x] `futureYouPaywallModel.ts`, `futureYouSilhouettes.ts`, `futureYouRevealPlaceholder.ts` + tests
  - [x] `futureYouGenerationPillModel.ts` (`shouldPollFutureYouGeneration`, poll interval) + test
- [x] Create `apps/mobile/hooks/useFutureYouGenerationPoll.ts` (AC: 2, 6)
  - [x] Port from PWA `useFutureYouGenerationPoll.ts`; use `setTimeout` not `window.setTimeout`
  - [x] Call `pollFutureYouJobStatus` + `patchGenerationReadyAt` + `mergeFutureYouDraft` via `setFitnessState`
  - [x] Skip `previewMode` path unless E2E flag (RN-9-09)
- [x] Upgrade existing `useFutureYouRevealImage.ts` (AC: 3)
  - [x] Import from `@newyouai/core` after model extract; align `imageUri` prop naming with detail hero
- [x] Port `FutureYouDetailView` → `components/future-you/FutureYouDetailView.tsx` (AC: 1, 5)
  - [x] Reuse `OnboardingFutureYouSuccessHero` from onboarding components for hero block
  - [x] `FUTURE_YOU_SUCCESS_AI_LABEL` under hero
  - [x] Save-to-photos button: use `expo-media-library` or defer with disabled + "Coming soon" — **prefer** port `saveImageToDevice` pattern if RN-8 has none; PWA uses `saveImageToDevice.ts`
  - [x] Stub `FutureYouDeleteButton` / `FutureYouReportButton` as no-op or placeholder until RN-9-07/08
  - [x] `testID="future-you-detail"`, `testID="future-you-detail-back"`
- [x] Wire poll + reveal in `FutureYouScreen` when `view === "detail"` or gallery tile building
- [x] Run typecheck + core tests

## Dev Notes

### Current state

| File | Today | This story |
|------|-------|------------|
| `hooks/useFutureYouRevealImage.ts` | Exists (onboarding) | Shared with tab detail |
| `hooks/useFutureYouGenerationPoll.ts` | **Missing** | Create from PWA |
| `lib/futureYouPollService.ts` | Mobile adapter | Unchanged |
| Detail view | Not ported | `FutureYouDetailView` |

### PWA parity reference

```29:116:apps/pwa/src/fitness/FutureYouDetailView.tsx
// toolbar, hero, save, report stub
```

```21:94:apps/pwa/src/fitness/useFutureYouGenerationPoll.ts
// poll loop + patchGenerationReadyAt
```

```19:72:apps/mobile/hooks/useFutureYouRevealImage.ts
// existing mobile reveal hook
```

### Anti-patterns

- **Do not** poll when tab blurred — pass `useIsFocused()` from `@react-navigation/native` or expo-router focus
- **Do not** implement delete/report flows (RN-9-07/08) — stub buttons OK
- **Do not** break onboarding paywall hero (RN-4) when changing shared hooks

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:onboarding   # FY regression
npm run test:e2e:tab-nav
```

### References

- [rn-9-02-gallery-view-tiles.md](rn-9-02-gallery-view-tiles.md)
- PWA: `futureYouPaywallModel.ts`, `OnboardingFutureYouSuccessHero.tsx`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- Extracted paywall, generation pill, silhouette, and reveal placeholder models to `packages/core/src/future-you/` with PWA/mobile re-exports
- Added `useFutureYouGenerationPoll` (tab-focus gated via `useFocusEffect`) and upgraded `useFutureYouRevealImage` to use core entitlement
- Ported `FutureYouDetailView`, `OnboardingFutureYouSuccessHero`, and `OnboardingFutureYouHeroImage`; wired poll + reveal in `FutureYouScreen`
- Save-to-photos deferred (disabled "Coming soon"); delete/report stubbed for RN-9-07/08
- Gates: `npm run test --workspace=@newyouai/core` (282 pass), `npm run typecheck --workspace=@newyouai/mobile` (green)

### File List

- packages/core/src/future-you/paywallModel.ts (+ test)
- packages/core/src/future-you/generationPillModel.ts (+ test)
- packages/core/src/future-you/silhouettes.ts (+ test)
- packages/core/src/future-you/revealPlaceholder.ts (+ test)
- packages/core/src/index.ts
- apps/pwa/src/fitness/futureYouPaywallModel.ts
- apps/pwa/src/fitness/futureYouGenerationPillModel.ts
- apps/pwa/src/fitness/futureYouSilhouettes.ts
- apps/pwa/src/fitness/futureYouRevealPlaceholder.ts
- apps/mobile/lib/futureYouPaywallModel.ts
- apps/mobile/lib/futureYouGenerationPillModel.ts
- apps/mobile/lib/futureYouSilhouettes.ts
- apps/mobile/lib/futureYouSuccessModel.ts
- apps/mobile/hooks/useFutureYouGenerationPoll.ts
- apps/mobile/hooks/useFutureYouRevealImage.ts
- apps/mobile/components/onboarding/OnboardingFutureYouHeroImage.tsx
- apps/mobile/components/onboarding/OnboardingFutureYouSuccessHero.tsx
- apps/mobile/components/future-you/FutureYouDetailView.tsx
- apps/mobile/components/future-you/FutureYouScreen.tsx
