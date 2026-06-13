---
name: RN-9-08 Report + Home gating
epic: RN-9
story: 08
status: review
swarm_order: 8
swarm_branch: epic-rn-9/future-you
baseline_commit: 8d06b221d5c3bcb5345125e7cc151443a461faf8
---

# Story 9.08: Report offensive + Home entry + pro gating polish

Status: review

<!-- Ultimate context engine analysis completed -->

## Story

**As a** user  
**I want** to report bad AI output and reach Future You correctly from Home  
**So that** I can flag issues and use entry points with proper pro gating

## Acceptance Criteria

1. **Given** detail view, **When** report tapped, **Then** `FutureYouReportButton` opens category sheet and submits via `submitFutureYouReport`
2. **Given** report success, **When** submitted, **Then** success message + dismiss; errors show retry copy
3. **Given** Home header `HomeNewYouHeaderButton`, **When** modes differ, **Then** routes to tab gallery, upload (`openFutureYouUpload=1`), or detail/reveal as per `getHomeFutureYouEntryMode`
4. **Given** skipper pill Open, **When** tapped, **Then** upload view opens on tab (existing param — verify end-to-end)
5. **Given** onboarding step 11+ with active job, **When** wizard visible, **Then** `FutureYouGenerationPill` uses shared `useFutureYouGenerationPoll` (not stub)
6. **Given** consent/detail footer, **When** rendered, **Then** privacy + terms links from `futureYouLegal.ts`

## Tasks / Subtasks

- [x] Extract `futureYouReportModel.ts` to core if not in RN-9-01 + test (AC: 1)
- [x] Port `FutureYouReportButton` → `components/future-you/FutureYouReportButton.tsx` (AC: 1–2)
  - [x] Category radio list from `FUTURE_YOU_REPORT_CATEGORY_OPTIONS`
  - [x] Optional message textarea (max 500)
  - [x] `submitFutureYouReport` from `@/lib/futureYouReportService`
  - [x] Context prop: `"home"` on detail tab
  - [x] `testID="future-you-report-trigger"`
- [x] Wire into `FutureYouDetailView` (remove RN-9-03 stub)
- [x] Home entry polish (AC: 3–4)
  - [x] Audit `apps/mobile/app/(tabs)/home.tsx` `openNewYouUpload` + header button handler
  - [x] For `reveal` mode: navigate to `/(tabs)/future-you` without upload param; optionally auto-open detail
- [x] Upgrade `FutureYouGenerationPill.tsx` (AC: 5)
  - [x] Remove "ships in RN-9" comment; wire poll hook + rotating phrases from `futureYouMotivations`
- [x] Add legal footer links on upload consent + detail (AC: 6)
- [x] Run typecheck + onboarding e2e

## Dev Notes

### PWA parity reference

```34:158:apps/pwa/src/fitness/FutureYouReportButton.tsx
```

```163:178:apps/mobile/app/(tabs)/home.tsx
// openNewYouUpload → router.push with openFutureYouUpload
```

### Scope lock

- Real RevenueCat / StoreKit is **RN-STORE** — `subscriptionTier: "pro"` dev stub OK
- Pro gating on reveal already in RN-9-03 — verify Home header doesn't bypass

### Risk doc alignment

Report flow satisfies "human review path for reports" in [ai-transformation-photo-risks.md](../planning-artifacts/ai-transformation-photo-risks.md) § Ethical & user harm.

### Anti-patterns

- **Do not** require jobId for skip-photo users if PWA allows report without — follow PWA guards
- **Do not** break pill layout on onboarding wizard

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:onboarding
npm run test:e2e:coach-nutrition
npm run test:e2e:tab-nav
```

### References

- [rn-9-07-replace-delete.md](rn-9-07-replace-delete.md)
- RN-5-06 Home FY entry story

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Extracted `reportModel.ts` to `@newyouai/core` with category labels + unit test
- Ported `FutureYouReportButton` with bottom sheet modal, category radios, optional message, success/error states
- Added `futureYouReportService.ts` mirroring PWA (dev fallback when Supabase unavailable)
- Wired report + `FutureYouLegalFooter` into `FutureYouDetailView`; removed RN-9-03 stub
- Home `openNewYou` routes by mode: `upload_prompt` → `openFutureYouUpload=1`, `reveal` → `openFutureYouDetail=1`, else gallery tab
- `FutureYouScreen` handles `openFutureYouDetail` param to auto-open detail when gallery tile exists
- Onboarding wizard uses `useFutureYouGenerationPoll` for pill status (steps 11–27)
- Consent checkbox + detail footer show Privacy Policy + Terms from `futureYouLegal.ts`
- `npm run typecheck --workspace=@newyouai/mobile` passes

### File List

- packages/core/src/future-you/reportModel.ts
- packages/core/src/future-you/reportModel.test.ts
- packages/core/src/index.ts
- apps/pwa/src/fitness/futureYouReportModel.ts
- apps/mobile/lib/futureYouReportService.ts
- apps/mobile/components/future-you/FutureYouReportButton.tsx
- apps/mobile/components/future-you/FutureYouLegalFooter.tsx
- apps/mobile/components/future-you/FutureYouDetailView.tsx
- apps/mobile/components/future-you/FutureYouScreen.tsx
- apps/mobile/app/(tabs)/home.tsx
- apps/mobile/app/(onboarding)/index.tsx
- apps/mobile/components/onboarding/FutureYouGenerationPill.tsx
- apps/mobile/components/onboarding/OnboardingFutureYouPhoto.tsx
