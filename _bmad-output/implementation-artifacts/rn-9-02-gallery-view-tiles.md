---
name: RN-9-02 Gallery view + tiles
epic: RN-9
story: 02
status: ready-for-dev
swarm_order: 2
swarm_branch: epic-rn-9/future-you
---

# Story 9.02: Gallery view + tiles

Status: review

<!-- Ultimate context engine analysis completed -->

## Story

**As an** onboarded user  
**I want** a Future You gallery with create/redo CTAs and transformation tiles  
**So that** I can see my preview or start a new one from the tab

## Acceptance Criteria

1. **Given** RN-9-01 shell with `view === "gallery"`, **When** gallery renders, **Then** `FutureYouGalleryView` replaces stub lede-only body
2. **Given** no completed job (`upload_prompt` mode), **When** gallery renders, **Then** empty state shows `FUTURE_YOU_GALLERY_EMPTY_TITLE` + gold "Try NewYou" CTA when `canRedoFutureYouTransformation` allows
3. **Given** reveal mode or in-flight job, **When** gallery renders, **Then** tile built via `buildFutureYouGalleryItem` when `shouldShowFutureYouGalleryTile` is true (silhouette/placeholder OK until RN-9-03 poll)
4. **Given** redo cooldown active, **When** gallery renders, **Then** `futureYouPageRedoLede(msUntilRedo)` shows under main lede; create CTA disabled
5. **Given** gallery tile tap, **When** selected, **Then** parent sets `view` to `detail` and `selectedItemId` to item id
6. **Given** `FutureYouNewChip`, **When** new job indicator applies, **Then** chip renders per PWA (optional if no new-job signal yet)

## Tasks / Subtasks

- [x] Port `FutureYouGalleryView` → `apps/mobile/components/future-you/FutureYouGalleryView.tsx` (AC: 1–5)
  - [x] Map PWA CSS classes to NativeWind + theme tokens (match Nutrition/Progress card patterns)
  - [x] Tile: image, loading spinner overlay, date + caption foot
  - [x] Empty state: silhouette art via `futureYouRevealPlaceholderImage(gender)` from core (extract in RN-9-03 if not in RN-9-01)
  - [x] `testID="future-you-gallery"`, `testID="future-you-gallery-tile"`, `testID="future-you-create-cta"` (Try NewYou)
- [x] Port `FutureYouNewChip` if used by page content (AC: 6)
- [x] Wire into `FutureYouScreen`: pass `galleryItems`, `pageLede`, `pageRedoLede`, `onOpenItem`, `onTryNewYou` → `setView("upload")` when redo allowed
- [x] Compute `galleryItems` in screen (mirror PWA `FutureYouPageContent` lines 139–163) — image src may be silhouette only until RN-9-03
- [x] Run typecheck + tab-nav

## Dev Notes

### Depends on RN-9-01

- `FutureYouScreen` view state machine, `getHomeFutureYouEntryMode`, `futureYouPageLede`, `canRedoFutureYouTransformation`, `msUntilFutureYouRedoEligible`
- Core exports: `futureYouGalleryModel`, `futureYouPageModel`, `homeEntryModel`

### Previous story intelligence (RN-9-01)

- Tab shell must stay working: `testID="tab-future-you"`, `openFutureYouUpload` param
- Do not re-extract models already in `packages/core/src/future-you/`

### PWA parity reference

```21:91:apps/pwa/src/fitness/FutureYouGalleryView.tsx
// empty vs tile grid, lede block, Try NewYou CTA
```

```139:163:apps/pwa/src/fitness/FutureYouPageContent.tsx
// galleryItem + galleryItems memo
```

### Anti-patterns

- **Do not** wire `useFutureYouRevealImage` or full poll here (RN-9-03)
- **Do not** implement upload steps (RN-9-04/05)
- **Do not** hide tab for under-18 — empty/blocked lede only (RN-9-01)

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:tab-nav
```

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Gallery + empty state + tile tap → detail | Detail view content (RN-9-03) |
| Redo lede + disabled CTA during cooldown | Replace dialog (RN-9-07) |
| Silhouette placeholder on tile | Signed URL reveal (RN-9-03) |

### References

- [sprint-rn-9-future-you-plan.md](sprint-rn-9-future-you-plan.md) RN-9-02
- [rn-9-01-future-you-core-extract-tab-shell.md](rn-9-01-future-you-core-extract-tab-shell.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- Ported `FutureYouGalleryView` and `FutureYouNewChip` with NativeWind + `useAppTheme` card/tile styling
- `galleryItems` computed from draft `generationStatus` + silhouette placeholder (no poll until RN-9-03)
- Mobile silhouette helpers at `lib/futureYouSilhouettes.ts` + `lib/futureYouRevealPlaceholder.ts` (core extract deferred to RN-9-03)
- `npm run typecheck --workspace=@newyouai/mobile` passes

### File List

- apps/mobile/components/future-you/FutureYouGalleryView.tsx (added)
- apps/mobile/components/future-you/FutureYouNewChip.tsx (added)
- apps/mobile/components/future-you/FutureYouScreen.tsx (modified)
- apps/mobile/lib/futureYouSilhouettes.ts (added)
- apps/mobile/lib/futureYouRevealPlaceholder.ts (added)
- apps/mobile/assets/future-you/*.png (added, copied from PWA)
- _bmad-output/implementation-artifacts/rn-9-02-gallery-view-tiles.md (modified)
- _bmad-output/implementation-artifacts/sprint-status-rn-migration.yaml (modified)
