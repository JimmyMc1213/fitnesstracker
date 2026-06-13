---
name: RN-8-02 Weigh-in sheet progress photo + Progress tab entry
epic: RN-8
story: 02
status: done
swarm_order: 2
swarm_branch: epic-rn-8/progress-check-ins
---

# Story 8.02: Weigh-in sheet progress photo + Progress tab entry

Status: ready-for-dev

## Story

**As a** user  
**I want** to attach an optional progress photo when logging weight  
**So that** my weigh-in history includes visual progress and Home + Progress both use one sheet

## Acceptance Criteria

1. **Given** PWA `progressPics.ts`, **When** extracted to `packages/core`, **Then** PWA re-exports unchanged and Vitest passes
2. **Given** weigh-in sheet open, **When** I tap add photo, **Then** camera or photo library opens via `expo-image-picker` (dynamic import pattern from onboarding)
3. **Given** photo selected, **When** I save weigh-in, **Then** `progressPics` entry persisted with `data:image/` URL and linked `dateKey`
4. **Given** weigh-in with photo on weight entry, **When** saved, **Then** `weightLog` entry includes `progressPhotoDataUrl` when PWA shape expects it
5. **Given** Progress tab, **When** I tap "Log weight" / "Update weight", **Then** same `WeighInSheet` opens as Home (RN-5-05)
6. **Given** weigh-in sheet, **When** rendered, **Then** stub copy "Optional progress photo ships in RN-8" is removed

## Tasks / Subtasks

- [ ] Extract `progressPics.ts` to `packages/core/src/progress/` + test (AC: 1)
  - [ ] `normalizeProgressPics`, `collectProgressPicGalleryItems`, `newProgressPicId`, lock helpers
  - [ ] Export from core index; PWA thin re-export
- [ ] Extend `WeighInSheet` (AC: 2–4, 6)
  - [ ] Photo preview thumbnail + Add/Change/Remove affordances
  - [ ] `pickFromCamera` / `pickFromGallery` — mirror `useFutureYouOnboarding.ts` permission handling
  - [ ] Compress via existing `lib/imageCompress.ts` if needed for persist size
  - [ ] On save: append `progressPics` + optional `progressPhotoDataUrl` on `WeightEntry`
  - [ ] `testID="weigh-in-add-photo"`, `testID="weigh-in-photo-preview"`
- [ ] Wire Progress tab CTA (AC: 5)
  - [ ] Share sheet state from `ProgressScreen` or lift to shared hook
  - [ ] `todayEntry` from `weightLog` for `dateKeyToday`
- [ ] Run gates

## Dev Notes

### Dependencies

**Requires RN-8-01** (Progress tab shell + log weight CTA).

### Current state

| File | Today | This story |
|------|-------|------------|
| `components/home/WeighInSheet.tsx` | Weight only, photo stub text | Full photo affordance |
| `apps/mobile/lib/sundayCheckInHome.ts` | Separate from progressPics | No change |
| `expo-image-picker` | Installed; used in onboarding FY photo | Reuse pattern |

### PWA parity reference

```1:50:apps/pwa/src/fitness/progressPics.ts
// normalizeProgressPics, collectProgressPicGalleryItems
```

PWA `WeighInSheet.tsx` — photo attach block on save.

### Anti-patterns

- **Do not** fork a second weigh-in sheet for Progress tab
- **Do not** implement gallery fullscreen (RN-8-05)
- **Do not** upload photos to cloud (local `data:image/` persist only)

### Testing requirements

```bash
npm run test --workspace=@newyouai/core
npm run typecheck --workspace=@newyouai/mobile
```

Manual: log weight + photo on Home and Progress; verify `progressPics` in fitness slice.

### References

- [sprint-rn-8-progress-plan.md](sprint-rn-8-progress-plan.md) RN-8-02
- Mobile: `WeighInSheet.tsx`, `hooks/useFutureYouOnboarding.ts`, `lib/imageCompress.ts`
- PWA: `WeighInSheet.tsx`, `progressPics.ts`
