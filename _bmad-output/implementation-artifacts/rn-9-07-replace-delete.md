---
name: RN-9-07 Replace + delete
epic: RN-9
story: 07
status: ready-for-dev
swarm_order: 7
swarm_branch: epic-rn-9/future-you
---

# Story 9.07: Replace dialog + delete transformation

Status: review

<!-- Ultimate context engine analysis completed -->

## Story

**As a** user with an existing Future You  
**I want** to replace or delete my transformation with clear confirmations  
**So that** I control my AI photos on my terms

## Acceptance Criteria

1. **Given** overwrite upload when redo eligible, **When** generate would start, **Then** `FutureYouReplaceDialog` opens with keep vs remove copy from `futureYouPageModel`
2. **Given** user chooses remove current, **When** confirmed, **Then** delete runs then upload/generate continues; busy state on dialog
3. **Given** detail view, **When** delete icon tapped, **Then** two-step `DeleteConfirmSheet` flow per `FutureYouDeleteButton`
4. **Given** delete success, **When** complete, **Then** `deleteFutureYou` clears storage + draft; `onFutureYouDeleted` returns to gallery empty state; Home entry mode updates
5. **Given** delete during redo cooldown, **When** final confirm, **Then** `futureYouDeleteCooldownNotice` shows preserved 2-week window
6. **Given** replace cancel, **When** tapped, **Then** upload flow aborts without side effects

## Tasks / Subtasks

- [x] Extract `futureYouDeleteModel.ts` to core if not in RN-9-01 + test (AC: 3, 5)
- [x] Port `FutureYouReplaceDialog` → `components/future-you/FutureYouReplaceDialog.tsx` (AC: 1, 2, 6)
  - [x] Use existing `ConfirmSheet` / center dialog pattern from workout RN-6 confirm sheets
  - [x] `testID="future-you-replace-dialog"`, action testIDs for keep/delete/cancel
- [x] Port `FutureYouDeleteButton` → `components/future-you/FutureYouDeleteButton.tsx` (AC: 3–5)
  - [x] Reuse `DeleteConfirmSheet` or workout delete sheet pattern
  - [x] Wire `deleteFutureYou` from `@/lib/futureYouDeleteService`
  - [x] Pass `redoAnchorIso={futureYouRedoAnchorIso(futureYou)}`
  - [x] `testID="future-you-delete-trigger"`
- [x] Replace RN-9-05 Alert stub with real dialog in `FutureYouScreen`
- [x] Wire delete into `FutureYouDetailView` (remove stub from RN-9-03)
- [x] `onFutureYouDeleted`: clear `futureYou` slice fields via core helper or `EMPTY_FUTURE_YOU_DRAFT` merge pattern
- [x] Run typecheck + core/api tests

## Dev Notes

### PWA parity reference

```23:65:apps/pwa/src/fitness/FutureYouReplaceDialog.tsx
```

```30:127:apps/pwa/src/fitness/FutureYouDeleteButton.tsx
```

### Mobile services

- `lib/futureYouDeleteService.ts` → `@newyouai/api-client` invoke

### Anti-patterns

- **Do not** skip two-step delete confirm (App Store / risk doc expectation)
- **Do not** reset redo cooldown on delete — preserve `generationReadyAt` anchor per PWA `futureYouDeleteModel`
- **Do not** leave orphaned Storage files — api-client delete must wipe paths

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test --workspace=@newyouai/core
npm run test --workspace=@newyouai/api-client
```

Manual: replace keep vs remove; delete from detail; verify gallery empty + Home header shows upload prompt.

### References

- [rn-9-05-upload-generate-poll.md](rn-9-05-upload-generate-poll.md)
- PWA: `futureYouDeleteModel.ts`, `futureYouPageModel.ts`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

- Extracted `deleteModel.ts` + `futureYouDraftAfterUserDelete` to `@newyouai/core` with tests
- Ported `FutureYouReplaceDialog` and `FutureYouDeleteButton` (two-step confirm, cooldown notice)
- Replaced Alert stub in `FutureYouScreen`; wired delete in `FutureYouDetailView`
- `onFutureYouDeleted` preserves `generationReadyAt` cooldown anchor per PWA parity
- typecheck + core (287) + api-client (33) tests pass

### File List

- packages/core/src/future-you/deleteModel.ts
- packages/core/src/future-you/deleteModel.test.ts
- packages/core/src/sync/futureYouDraft.ts
- packages/core/src/sync/futureYouDraft.test.ts
- packages/core/src/index.ts
- apps/mobile/lib/futureYouDeleteService.ts
- apps/mobile/components/future-you/FutureYouDeleteConfirmSheet.tsx
- apps/mobile/components/future-you/FutureYouReplaceDialog.tsx
- apps/mobile/components/future-you/FutureYouDeleteButton.tsx
- apps/mobile/components/future-you/FutureYouScreen.tsx
- apps/mobile/components/future-you/FutureYouDetailView.tsx
- _bmad-output/implementation-artifacts/rn-9-07-replace-delete.md
- _bmad-output/implementation-artifacts/sprint-status-rn-migration.yaml
