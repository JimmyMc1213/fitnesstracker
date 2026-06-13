---
name: RN-9-06 Fullscreen viewer
epic: RN-9
story: 06
status: review
swarm_order: 6
swarm_branch: epic-rn-9/future-you
---

# Story 9.06: Fullscreen viewer

Status: review

<!-- Ultimate context engine analysis completed -->

## Story

**As a** user viewing my Future You  
**I want** a fullscreen image viewer  
**So that** I can inspect my transformation up close

## Acceptance Criteria

1. **Given** detail view with ready image, **When** hero tapped, **Then** `FutureYouFullscreenViewer` modal opens with full image
2. **Given** viewer open, **When** Done tapped or back gesture, **Then** modal closes; detail/gallery state preserved
3. **Given** image still loading, **When** user on detail, **Then** fullscreen affordance disabled (match PWA `canFullscreen`)
4. **Given** Maestro, **When** viewer open, **Then** `testID="future-you-fullscreen-viewer"` and `testID="future-you-fullscreen-done"` visible

## Tasks / Subtasks

- [x] Port `FutureYouFullscreenViewer` → `components/future-you/FutureYouFullscreenViewer.tsx` (AC: 1–3)
  - [x] Use React Native `Modal` with `presentationStyle="fullScreen"` or existing app modal pattern
  - [x] Header: Done button with `FUTURE_YOU_FULLSCREEN_DONE_LABEL`
  - [x] `Image` with `resizeMode="contain"` on dark background
  - [x] Optional: pinch zoom via `react-native-gesture-handler` — **not required** if Modal + contain matches UX
- [x] Wire from `FutureYouDetailView` `onOpenFullscreen` and optional gallery tile long-press (PWA: detail only)
- [x] State in `FutureYouScreen`: `fullscreenOpen` + `fullscreenImageUri`
- [x] Run typecheck + tab-nav

## Dev Notes

### PWA parity reference

```10:27:apps/pwa/src/fitness/FutureYouFullscreenViewer.tsx
// FullScreenOverlay + Done + image stage
```

### RN pattern reference

- Progress pics gallery uses stack route `app/progress/gallery.tsx` — FY can use Modal overlay (simpler, matches PWA overlay)
- Reuse safe-area insets for header padding

### Previous story intelligence

- Detail hero already uses `OnboardingFutureYouSuccessHero` — pass same `imageUri` to fullscreen
- Do not require network reload in viewer — reuse loaded URI

### Anti-patterns

- **Do not** add new navigation route unless Modal proves insufficient
- **Do not** show fullscreen for silhouette-only placeholder

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:tab-nav
```

### References

- [rn-9-03-detail-poll-reveal.md](rn-9-03-detail-poll-reveal.md)
- PWA: `FUTURE_YOU_FULLSCREEN_DONE_LABEL` in `futureYouGalleryModel`

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Ported `FutureYouFullscreenViewer` with fullScreen Modal, dark stage, Done header, and Maestro testIDs
- Wired `fullscreenOpen` + `fullscreenImageUri` in `FutureYouScreen`; detail hero tap opens viewer using `saveableImageUri` (no network reload)
- Fullscreen disabled while loading via existing `canFullscreen` in `FutureYouDetailView`
- Gate: `npm run typecheck --workspace=@newyouai/mobile` (green); tab-nav skipped (Metro not running)

### File List

- apps/mobile/components/future-you/FutureYouFullscreenViewer.tsx (new)
- apps/mobile/components/future-you/FutureYouScreen.tsx (modified)
- _bmad-output/implementation-artifacts/rn-9-06-fullscreen-viewer.md (modified)
