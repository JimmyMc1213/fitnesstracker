---
name: RN-5-07 Maestro coach-nutrition E2E
epic: RN-5
story: 07
status: ready-for-dev
swarm_order: 7
swarm_branch: epic-rn-5/home-coach
---

# Story 5.07: Maestro coach-nutrition + integration polish

Status: ready-for-dev

## Story

**As a** QA engineer / CI pipeline  
**I want** a Maestro flow proving coach fuel task navigates to nutrition logging  
**So that** FR-M3 Home coach routing stays regression-safe

## Acceptance Criteria

1. **Given** seeded onboarded user with coach fuel task, **When** Maestro runs `rn-coach-nutrition.yaml`, **Then** Home shows coach plan and "Log fuel" tap succeeds
2. **Given** fuel task tap, **When** flow continues, **Then** Nutrition tab is active and log-food modal is reachable
3. **Given** epic close, **When** regression runs, **Then** auth-all + tab-nav + onboarding remain green
4. **Given** Home integration complete, **When** I audit testIDs, **Then** all Maestro-targeted elements have stable `testID`s

## Tasks / Subtasks

- [ ] Create `.maestro/rn-coach-nutrition.yaml` (AC: 1–2)
  - [ ] Port `apps/pwa/e2e/coach-task-nutrition.spec.ts` steps
  - [ ] Subflow: sign-in + onboarding skip OR persist seed with coach plan
- [ ] Add Maestro fitness seed helper (AC: 1)
  - [ ] Port pattern from PWA `fuelQuickLogPersistSeed` / `seedPersist`
  - [ ] Document env vars in `docs/env-matrix.md` if needed
- [ ] Add `npm run test:e2e:coach-nutrition` in `apps/mobile/package.json` (AC: 1)
- [ ] Remove any remaining home placeholder/dev UI (AC: 4)
- [ ] Epic regression sweep + update `sprint-status-rn-migration.yaml` epic → done (AC: 3)

## Dev Notes

### Dependencies

All RN-5-01..06 stories complete. Log-food modal is RN-3 shell — flow may assert modal `testID` from `(modals)/log-food` stub until RN-7 fills content.

### PWA parity reference

```5:18:apps/pwa/e2e/coach-task-nutrition.spec.ts
test("coach task Log fuel opens Nutrition tab and Log Food overlay", async ({ page }) => {
  await seedPersist(page, fuelQuickLogPersistSeed());
  ...
  await page.getByRole("button", { name: /Log fuel/i }).first().click();
  await expect(page.getByRole("heading", { name: "Log Food" })).toBeVisible();
```

### Epic close checklist

```bash
npm run test:e2e:coach-nutrition
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:onboarding
npm run typecheck --workspace=@newyouai/mobile
```

### References

- [sprint-rn-5-home-coach-plan.md](sprint-rn-5-home-coach-plan.md)
- [testarch-trace-rn-migration.md](testarch-trace-rn-migration.md) FR-M3
