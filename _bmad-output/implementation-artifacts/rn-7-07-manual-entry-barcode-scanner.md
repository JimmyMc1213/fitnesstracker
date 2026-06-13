---
name: RN-7-07 Manual entry + barcode scanner
epic: RN-7
story: 07
status: ready-for-dev
swarm_order: 7
swarm_branch: epic-rn-7/nutrition-os
---

# Story 7.07: Manual entry + barcode scanner

Status: done

## Story

**As a** user  
**I want** to manually enter food macros or scan a barcode  
**So that** I can log items not found in search

## Acceptance Criteria

1. **Given** Manual Add from Log Food header, **When** form opens, **Then** fields for name, calories, protein, carbs, fat with PWA validation
2. **Given** valid manual entry, **When** Log food tapped, **Then** item logs via `buildNutritionLoggedItem` + optional save to My foods
3. **Given** Scan from header, **When** camera permission granted, **Then** barcode scanner view opens using `expo-camera`
4. **Given** barcode detected, **When** lookup succeeds, **Then** serving picker opens with OFF/USDA result
5. **Given** simulator or denied camera, **When** scan unavailable, **Then** manual barcode text fallback works for dev/Maestro
6. **Given** barcode lookup, **When** implemented, **Then** `lookupFoodByBarcode` lives in `@newyouai/api-client` with Vitest

## Tasks / Subtasks

- [x] Manual entry form (AC: 1–2)
  - [x] Port macro input clamping from `macroLimits.ts`
  - [x] Serving label optional field
  - [x] Wire to RN-7-04 log + toast pipeline
- [x] Extend api-client (AC: 4, 6)
  - [x] Extract `lookupFoodByBarcode` from PWA `foodSearchService.ts` to `packages/api-client`
  - [x] Mobile adapter + E2E mock path if needed
  - [x] Colocated Vitest
- [x] Barcode scanner UI (AC: 3–5)
  - [x] Add `expo-camera` (and barcode scanning module if not bundled) to mobile
  - [x] Port permission + error UX from PWA `BarcodeScanner.tsx`
  - [x] Simulator fallback: text field to enter barcode digits
  - [x] Community food submit hook (`communityFoods.ts`) if scan misses — match PWA optional flow
- [x] Document camera permission in `docs/eas-ios.md` if new entitlements needed

## Dev Notes

### Dependencies

**Requires RN-7-04** (log pipeline). Can parallelize with RN-7-05/06 if picker stable.

### PWA parity reference

Manual add E2E:

```18:22:apps/pwa/e2e/nutrition-log-food.spec.ts
await page.getByRole("button", { name: "Manual Add" }).click();
await page.getByLabel("Food name").fill("E2E shake");
await page.getByLabel("Calories").fill("300");
await page.locator("button.tap", { hasText: "Log food" }).click();
```

Barcode lookup source:

```253:253:apps/pwa/src/fitness/foodSearchService.ts
export async function lookupFoodByBarcode(barcode: string): Promise<FoodSearchResult | null>
```

Architecture: Camera permission for Future You + barcode per `architecture-rn-migration.md` §4.

### Anti-patterns

- **Do not** invoke Edge Function directly from mobile — use api-client
- **Do not** block Maestro on physical camera — manual entry path is epic-close critical
- **Do not** add separate Scan tab route — scan lives inside Log Food modal (PWA inventory N-10)

### Testing requirements

```bash
npm run test --workspace=@newyouai/api-client
npm run typecheck --workspace=@newyouai/mobile
```

Device QA: real barcode on dev client build.

### References

- [sprint-rn-7-nutrition-plan.md](sprint-rn-7-nutrition-plan.md) RN-7-07
- PWA: `LogFoodScreen.tsx` manual entry, `BarcodeScanner.tsx`, `foodSearchService.ts`
- `docs/eas-ios.md` permissions matrix
