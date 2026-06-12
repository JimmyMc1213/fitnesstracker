---
name: RN-3-03 Modal route shells
epic: RN-3
story: 03
status: ready-for-dev
swarm_order: 3
swarm_branch: epic-rn-3/core-navigation-app-shell
---

# Story 3.03: Modal routes — log-food, sunday-check-in shells

Status: ready-for-dev

## Story

**As a** signed-in user on the nutrition or home tab  
**I want** to open modal routes for log food and Sunday check-in  
**So that** later epics can drop in full flows without reworking navigation

## Acceptance Criteria

1. **Given** signed in on nutrition tab, **When** I tap "Log food" stub button, **Then** `(modals)/log-food` opens as presentation modal
2. **Given** log-food modal open, **When** I dismiss it, **Then** I return to the previous tab screen
3. **Given** signed in on home tab, **When** I tap "Sunday check-in" stub button, **Then** `(modals)/sunday-check-in` opens
4. **Given** each modal, **When** rendered, **Then** `testID` is `modal-log-food` or `modal-sunday-check-in`

## Tasks / Subtasks

- [ ] Add `(modals)/_layout.tsx` with `presentation: "modal"` stack (AC: 1–3)
- [ ] Add `(modals)/log-food.tsx` shell + header close affordance (AC: 1, 2, 4)
- [ ] Add `(modals)/sunday-check-in.tsx` shell + close affordance (AC: 3, 4)
- [ ] Wire stub buttons on tab placeholders (AC: 1, 3)
  - [ ] Nutrition tab: `router.push("/(modals)/log-food")` via `testID="open-log-food"`
  - [ ] Home tab: `router.push("/(modals)/sunday-check-in")` via `testID="open-sunday-check-in"`
- [ ] Register `(modals)` in root `_layout.tsx` Stack; remove/repurpose template `app/modal.tsx` (AC: 2)
- [ ] Extend Maestro `rn-tab-navigation.yaml` — nutrition → log-food → dismiss (AC: 1–2)

## Dev Notes

### Current state

- Root layout registers generic `modal` screen from Expo scaffold (`app/modal.tsx`)
- RN-3-01 nutrition/home tab stubs are placeholders — add minimal CTA buttons only

### Architecture compliance

| PWA overlay | Expo route |
|-------------|------------|
| `LogFoodScreen` | `(modals)/log-food` |
| `SundayWeeklyCheckInFlow` | `(modals)/sunday-check-in` |

Modal presentation hides tab bar via Expo Router overlay — no custom hide logic needed (unlike PWA `hideTabBar`).

Navigation API:

```typescript
import { router } from "expo-router";
router.push("/(modals)/log-food");
router.back(); // dismiss
```

### File structure requirements

**Create:**

- `apps/mobile/app/(modals)/_layout.tsx`
- `apps/mobile/app/(modals)/log-food.tsx`
- `apps/mobile/app/(modals)/sunday-check-in.tsx`

**Update:**

- `apps/mobile/app/_layout.tsx` — add `(modals)` Stack.Screen
- `apps/mobile/app/(tabs)/nutrition.tsx` — log food stub button
- `apps/mobile/app/(tabs)/home.tsx` — sunday check-in stub button
- `apps/mobile/.maestro/rn-tab-navigation.yaml`

**Delete or repurpose:**

- `apps/mobile/app/modal.tsx` — remove template; delete root Stack.Screen `modal`

### Modal shell content (minimal)

Each modal: title, one-line "Content ships in RN-X", close button (`testID="modal-close"`), root `testID`.

Do **not** port `LogFoodScreen` or `SundayWeeklyCheckInFlow` logic.

### PWA reference (content only — do not implement)

- `apps/pwa/src/fitness/LogFoodScreen.tsx`
- `apps/pwa/src/fitness/SundayWeeklyCheckInFlow.tsx`

### Previous story intelligence

- RN-3-02: user must reach `(tabs)` via shell gate before modals are reachable
- RN-3-01: tab testIDs must exist for Maestro navigation to nutrition/home

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:tab-nav   # extended flow
```

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Modal route shells + dismiss | Log food UI (RN-7) |
| Stub open buttons on tabs | Sunday check-in flow (RN-8) |
| Maestro open/dismiss smoke | Barcode scanner, food search |

### References

- [architecture-rn-migration.md §3 Modal mapping](../planning-artifacts/architecture-rn-migration.md)
- [sprint-rn-3-app-shell-plan.md](sprint-rn-3-app-shell-plan.md) RN-3-03

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
