---
name: RN-9-05 Upload generate + poll
epic: RN-9
story: 05
status: review
swarm_order: 5
swarm_branch: epic-rn-9/future-you
---

# Story 9.05: Upload flow — generate, poll, complete

Status: review

<!-- Ultimate context engine analysis completed -->

## Story

**As a** user who uploaded a photo on the Future You tab  
**I want** to pick motivation, start generation, and see completion in-flow  
**So that** I get a new transformation without leaving the tab

## Acceptance Criteria

1. **Given** upload succeeded, **When** step `"motivation"`, **Then** `OnboardingFutureYouMotivation` chip grid renders with goal/gender filters
2. **Given** motivation selected, **When** Generate tapped, **Then** `startFutureYouGeneration` via `@/lib/futureYouGenerateService` + draft patch (`generationJobId`, `generationStatus: queued`)
3. **Given** generation in flight, **When** upload view active, **Then** inline poll (reuse `useFutureYouGenerationPoll`) until `ready` or `failed`
4. **Given** existing ready transformation, **When** overwrite, **Then** `shouldPromptFutureYouReplaceDialog` triggers prompt (Alert OK until RN-9-07 wires dialog)
5. **Given** success, **When** job ready, **Then** navigate to `detail` view; gallery tile updates on return
6. **Given** generation failed, **When** error shown, **Then** retry affordance; user can exit to gallery

## Tasks / Subtasks

- [x] Complete `FutureYouNewPicView` motivation step (AC: 1–2)
  - [x] Reuse `OnboardingFutureYouMotivation.tsx`
  - [x] CTA: `FUTURE_YOU_PAGE_GENERATE_LABEL`; disabled when no `motivationId` or `generating`
  - [x] `testID="future-you-upload-generate"`
- [x] Wire generate in `FutureYouScreen` (AC: 2–6)
  - [x] `buildFutureYouGenerateProfile` from draft + onboarding profile
  - [x] `startFutureYouGeneration` with `photoStoragePath`, `motivationId`, timeline
  - [x] On replace prompt: Alert with keep/delete options → RN-9-07 replaces with dialog
  - [x] Poll while `view === "upload"` && job active
  - [x] On ready: `setView("detail")`, set `selectedItemId`
- [x] Handle generate errors (`FutureYouGenerateError`) with copy from PWA service
- [x] Run typecheck + core/api tests

## Dev Notes

### PWA parity reference

```95:117:apps/pwa/src/fitness/FutureYouNewPicView.tsx
// motivation step + generate CTA
```

```250:350:apps/pwa/src/fitness/FutureYouPageContent.tsx
// handleGenerate, replace dialog trigger, poll during upload
```

### Mobile services (existing)

- `lib/futureYouGenerateService.ts`
- `lib/futureYouPollService.ts`
- `hooks/useFutureYouGenerationPoll.ts` (RN-9-03)

### Anti-patterns

- **Do not** block tab navigation on failure
- **Do not** skip motivation on redo if draft lacks `motivationId`
- **Do not** implement full replace dialog UI here — Alert stub acceptable

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test --workspace=@newyouai/core
npm run test --workspace=@newyouai/api-client
```

### References

- [rn-9-04-upload-photo-consent.md](rn-9-04-upload-photo-consent.md)
- PWA: `futureYouGenerateService.ts`, `futureYouPageModel.ts` (`shouldPromptFutureYouReplaceDialog`)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- Completed motivation step in `FutureYouNewPicView` with chip grid, generate CTA (`testID="future-you-upload-generate"`), and error display
- Wired `executeGeneration` in `FutureYouScreen` via `startFutureYouGeneration`; replace overwrite uses Alert stub (keep/delete/cancel) until RN-9-07
- Extended poll to upload view while job is queued/generating; navigates to detail on ready
- Failed generation shows retry via Generate button; user can exit to gallery without blocking tab
- Gate: `npm run typecheck --workspace=@newyouai/mobile`, core + api-client tests (green)

### File List

- apps/mobile/components/future-you/FutureYouNewPicView.tsx (modified)
- apps/mobile/components/future-you/FutureYouScreen.tsx (modified)
- _bmad-output/implementation-artifacts/rn-9-05-upload-generate-poll.md (modified)
