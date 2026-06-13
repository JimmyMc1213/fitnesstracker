---
name: RN-9-04 Upload photo + consent
epic: RN-9
story: 04
status: review
swarm_order: 4
swarm_branch: epic-rn-9/future-you
---

# Story 9.04: Upload flow — photo, consent, compress, upload

Status: review

<!-- Ultimate context engine analysis completed -->

## Story

**As a** pro user  
**I want** to capture a selfie with explicit AI consent on the Future You tab  
**So that** my photo uploads securely before generation

## Acceptance Criteria

1. **Given** `view === "upload"` step `"photo"`, **When** rendered, **Then** `FutureYouNewPicView` photo step uses `OnboardingFutureYouPhoto` (reuse RN-4 component)
2. **Given** photo selected, **When** consent unchecked, **Then** Continue disabled; checking records `photoAiConsentAt` via `mergeFutureYouDraft`
3. **Given** consent + photo, **When** Continue, **Then** image compresses (`compressImageToJpegDataUrl`) and `uploadFutureYouPhoto` succeeds; draft gets `photoStoragePath`, `uploadId`
4. **Given** `openFutureYouUpload=1` from Home, **When** tab opens, **Then** upload photo step auto-shows (RN-9-01 param wiring preserved)
5. **Given** upload failure, **When** error, **Then** retry + clear photo paths work; user can close back to gallery
6. **Given** consent UI, **When** rendered, **Then** includes illustrative disclaimer + link to `FUTURE_YOU_PRIVACY_POLICY_URL` per `ai-transformation-photo-risks.md`

## Tasks / Subtasks

- [x] Port `FutureYouNewPicView` shell → `components/future-you/FutureYouNewPicView.tsx` (AC: 1, 6)
  - [x] Header: close → gallery, title `FUTURE_YOU_PAGE_SHEET_TITLE_PHOTO`
  - [x] Body: reuse `OnboardingFutureYouPhoto` with camera/gallery callbacks from `expo-image-picker` (same as onboarding)
  - [x] `testID="future-you-upload-photo"`, `testID="future-you-consent-checkbox"`, `testID="future-you-upload-confirm"`
- [x] Wire upload handlers in `FutureYouScreen` (AC: 3–5)
  - [x] `onPickPhoto` → compress → local preview state
  - [x] `onConfirmPhoto` → `uploadFutureYouPhoto` from `@/lib/futureYouUploadService`
  - [x] Persist via `mergeFutureYouDraft`; on success advance `uploadStep` to `"motivation"` stub (RN-9-05 completes generate)
  - [x] Map `FutureYouUploadError` to user-facing strings (auth, size, format)
- [x] Block upload when `isFutureYouPhotoBlocked(age)` — show blocked copy, no picker
- [x] Run typecheck + api-client tests if touched

## Dev Notes

### Reuse (do not rewrite)

| Asset | Path |
|-------|------|
| Photo UI + consent | `components/onboarding/OnboardingFutureYouPhoto.tsx` |
| Upload service | `lib/futureYouUploadService.ts` → `@newyouai/api-client` |
| Age guard | `lib/futureYouAge.ts` |
| Legal URL | `lib/futureYouLegal.ts` |
| Image compress | onboarding adapter (search `compressImageToJpegDataUrl` in mobile) |

### PWA parity reference

```37:120:apps/pwa/src/fitness/FutureYouNewPicView.tsx
// photo step delegates to OnboardingFutureYouPhoto
```

```238:242:apps/pwa/src/fitness/FutureYouPageContent.tsx
// openUploadPage guard photoBlocked
```

### Disclosure copy (minimum)

- Illustrative only, not medical advice
- Third-party AI processing
- Link to privacy policy
- 18+ gate messaging when blocked

See [ai-transformation-photo-risks.md](../planning-artifacts/ai-transformation-photo-risks.md) § Legal & regulatory.

### Anti-patterns

- **Do not** call `startFutureYouGeneration` in this story (RN-9-05)
- **Do not** duplicate photo picker logic — reuse onboarding handlers
- **Do not** store raw photo in persist JSONB long-term — storage path only

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test --workspace=@newyouai/api-client
npm run test:e2e:onboarding
```

Manual: Home header → upload param → photo step; consent gate; skip blocked teen profile.

### References

- [rn-9-03-detail-poll-reveal.md](rn-9-03-detail-poll-reveal.md)
- RN-4-05 onboarding FY photo story

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- Ported `FutureYouNewPicView` with photo step reusing `OnboardingFutureYouPhoto`; motivation step stubbed for RN-9-05
- Wired compress/upload/consent/retry/clear handlers in `FutureYouScreen`; `openFutureYouUpload=1` preserved
- Added optional `consentTestID` / `confirmTestID` props to onboarding photo component for Maestro hooks
- Gate: `npm run typecheck --workspace=@newyouai/mobile` (green)

### File List

- apps/mobile/components/future-you/FutureYouNewPicView.tsx (added)
- apps/mobile/components/future-you/FutureYouScreen.tsx (modified)
- apps/mobile/components/onboarding/OnboardingFutureYouPhoto.tsx (modified)
- _bmad-output/implementation-artifacts/rn-9-04-upload-photo-consent.md (modified)
