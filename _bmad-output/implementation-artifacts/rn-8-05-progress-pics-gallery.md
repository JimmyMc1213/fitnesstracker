---
name: RN-8-05 Progress pics section + fullscreen gallery
epic: RN-8
story: 05
status: done
swarm_order: 5
swarm_branch: epic-rn-8/progress-check-ins
---

# Story 8.05: Progress pics section + fullscreen gallery

Status: done

## Story

**As a** user  
**I want** to preview progress photos on Progress and open a fullscreen gallery  
**So that** I can review visual progress alongside weight data

## Acceptance Criteria

1. **Given** progress pics and weigh-in photos in slice, **When** Progress renders, **Then** `ProgressPicsSection` shows up to 3 preview thumbnails + "Progress pics" header
2. **Given** `progressPicsLock` set, **When** section renders, **Then** lock affordance visible (PIN unlock UI can stub — full PIN flow if PWA has it)
3. **Given** section tapped, **When** gallery opens, **Then** fullscreen `ScreenProgressPicsGallery` shows all items sorted by date
4. **Given** gallery item, **When** delete confirmed, **Then** entry removed from `progressPics` or weigh-in photo cleared (PWA parity)
5. **Given** gallery open, **When** back pressed, **Then** returns to Progress tab; tab bar hide if using fullscreen stack (match workout overlay pattern)

## Tasks / Subtasks

- [x] `ProgressPicsSection` on Progress tab (AC: 1–2)
  - [x] `collectProgressPicGalleryItems(progressPics, weightLog)` from core
  - [x] Preview row + chevron; `testID="progress-pics-section"`
- [x] Fullscreen gallery (AC: 3–5)
  - [x] Option A: `app/progress/gallery.tsx` stack route (matches `workout/history` shell)
  - [x] Port `ScreenProgressPicsGallery` layout: date label, weigh-in context, image viewer
  - [x] Delete with confirm sheet
  - [x] `testID="progress-pics-gallery"`, `testID="progress-pics-back"`
- [x] Tab bar visibility (AC: 5)
  - [x] Root stack route outside `(tabs)` hides tab bar (same as workout history)

## Dev Notes

### Dependencies

**Requires RN-8-02** (`progressPics` persist shape + photo on weigh-in).

### PWA parity reference

```230:230:apps/pwa/src/fitness/screens/ScreenProgress.tsx
<ProgressPicsSection state={state} onOpenGallery={() => setShowPicsGalleryPage(true)} />
```

`ScreenProgressPicsGallery.tsx`, `ProgressPicsSection.tsx`

### Anti-patterns

- **Do not** upload pics to Supabase (local persist only)
- **Do not** confuse with Future You gallery (RN-9)
- **Do not** re-implement `collectProgressPicGalleryItems` in mobile

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
```

Manual: weigh-in with photo (RN-8-02) → preview appears → gallery opens → delete works.

### References

- [sprint-rn-8-progress-plan.md](sprint-rn-8-progress-plan.md) RN-8-05
- PWA: `ProgressPicsSection.tsx`, `ScreenProgressPicsGallery.tsx`
- Core: `progressPics.ts` (RN-8-02)
