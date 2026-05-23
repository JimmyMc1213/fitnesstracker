# Story 8.2: Open Food Facts merge + branded results (FTI-61)

Status: done

## Story

As a user searching packaged or branded foods,
I want results from Open Food Facts merged with USDA,
so restaurant chains and grocery items show up with brand names.

## Acceptance Criteria

1. **Edge Function:** Parallel search USDA + Open Food Facts; merge + rank; dedupe similar names
2. **Branded results:** Show brand in results; OFF serving from per-100g or default portion
3. **All tab:** Branded rows distinguishable from generic USDA entries (brand subline)
4. **Error handling:** Partial failure (one API down) still returns results from the other source
5. **Quality:** Colocated Vitest for merge/rank helpers; `npm run build` + `npm test` pass

## Tasks / Subtasks

- [x] **Task 1: OFF search in edge function** (AC: 1, 2, 4)
- [x] **Task 2: Merge/rank/dedupe helpers + Vitest** (AC: 1, 5)
- [x] **Task 3: Partial failure handling** (AC: 4)
- [x] **Task 4: Verification** (AC: 5)

## Dev Agent Record

### Completion Notes

- Extended `food-search` edge function with parallel USDA + OFF fetch
- Added `foodSearchMerge.ts` with rank/dedupe helpers and Vitest coverage
- Partial API failure returns results from whichever source succeeded

### File List

- supabase/functions/food-search/index.ts
- supabase/functions/food-search/merge.ts
- src/fitness/foodSearchMerge.ts
- src/fitness/foodSearchMerge.test.ts
- src/fitness/foodSearchService.ts
