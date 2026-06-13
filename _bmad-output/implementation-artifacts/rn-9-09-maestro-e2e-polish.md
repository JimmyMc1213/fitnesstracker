---
name: RN-9-09 Maestro E2E + epic polish
epic: RN-9
story: 09
status: done
swarm_order: 9
swarm_branch: epic-rn-9/future-you
---

# Story 9.09: Maestro E2E + AI disclosure audit + epic polish

Status: done

<!-- Ultimate context engine analysis completed -->

## Story

**As a** maintainer  
**I want** Maestro coverage, disclosure audit, and epic regression gate  
**So that** FR-M7 ships with evidence and RN-9 can close

## Acceptance Criteria

1. **Given** `.maestro/rn-future-you-upload.yaml`, **When** run on simulator, **Then** sign-in → Future You tab → gallery or upload smoke passes
2. **Given** `npm run test:e2e:future-you`, **When** executed, **Then** provisions test user + runs Maestro (mirror `run-progress-maestro.mjs`)
3. **Given** `EXPO_PUBLIC_E2E_MOCK_FUTURE_YOU=true`, **When** set on Metro, **Then** upload/generate can bypass camera (mock path documented in flow)
4. **Given** disclosure checklist, **When** audited against `ai-transformation-photo-risks.md`, **Then** consent, 18+, disclaimer, delete path marked implemented in completion notes
5. **Given** epic close regression, **When** `npm run test:e2e:epic-rn9-close` runs, **Then** future-you + auth-all + tab-nav + onboarding + coach-nutrition + workout-session + nutrition-log + progress + sunday-check-in green
6. **Given** epic complete, **When** searched, **Then** no "ships in RN-9" placeholder strings; `epic-rn-9` → `done` in sprint-status

## Test plan (Maestro)

**Prerequisites:** JDK 17+, Maestro CLI, iOS simulator + dev client, Supabase env for user provision.

```bash
# Terminal 1
cd apps/mobile && EXPO_PUBLIC_E2E_MOCK_FUTURE_YOU=true EXPO_PUBLIC_E2E_FITNESS_SEED=future-you npx expo start --dev-client --port 8082

# Terminal 2
cd apps/mobile && npm run test:e2e:future-you
```

**Epic close:**

```bash
npm run test:e2e:epic-rn9-close
npm run typecheck --workspace=@newyouai/mobile
```

| Flow | Key assertions |
|------|----------------|
| `rn-future-you-upload.yaml` | Tab future-you visible; gallery empty or upload CTA; optional mock upload completes |
| Regression | All prior epic Maestro scripts unchanged green |

## Tasks / Subtasks

- [x] E2E seed (AC: 1–3)
  - [x] Add `future-you` to `E2eFitnessSeedName` in `lib/e2e/fitnessPersistSeed.ts`
  - [x] Seed: `onboardingComplete: true`, `subscriptionTier: "pro"`, minimal profile; optional pre-ready job for gallery case
  - [x] Wire `EXPO_PUBLIC_E2E_FITNESS_SEED=future-you`
  - [x] Optional mock: when `EXPO_PUBLIC_E2E_MOCK_FUTURE_YOU`, stub upload/generate in dev-only branch (mirror PWA E2E patterns)
- [x] Maestro flow (AC: 1)
  - [x] `.maestro/rn-future-you-upload.yaml` — document testIDs: `tab-future-you`, `future-you-gallery`, `future-you-create-cta`, `future-you-upload-photo`, `future-you-consent-checkbox`, `future-you-detail`
  - [x] Reuse `subflows/auth-sign-in-credentials.yaml`, `subflows/dev-client-connect.yaml`
  - [x] Tap FAB or tab bar Future You entry (match `TabBarDock` testIDs)
- [x] Scripts (AC: 2, 5)
  - [x] `scripts/run-future-you-maestro.mjs` (provision user pattern from `run-progress-maestro.mjs`)
  - [x] `scripts/run-epic-rn9-close.mjs` orchestration
  - [x] `package.json`: `"test:e2e:future-you"`, `"test:e2e:epic-rn9-close"`
- [x] Disclosure audit checklist in completion notes (AC: 4)
  - [x] Explicit opt-in consent at upload
  - [x] Illustrative disclaimer on detail
  - [x] 18+ blocked UI (not hidden)
  - [x] Delete path (RN-9-07)
  - [x] Report path (RN-9-08)
  - [x] Privacy policy link
- [x] Epic polish (AC: 5–6)
  - [x] Remove placeholder copy (`FutureYouGenerationPill`, `future-you.tsx`)
  - [x] Update `sprint-status-rn-migration.yaml`: all RN-9 stories `done`, epic `done`
  - [x] Run full regression sweep

## Dev Notes

### Trace matrix

[`testarch-trace-rn-migration.md`](testarch-trace-rn-migration.md) FR-M7 → `rn-future-you-upload.yaml`

### Maestro pattern reference

```1:35:apps/mobile/.maestro/rn-progress.yaml
# launch → auth → tab → assert testIDs
```

```1:45:apps/mobile/scripts/run-progress-maestro.mjs
# provision Supabase user + spawn maestro
```

### Disclosure audit template (complete in Dev Agent Record)

| Requirement | Implemented in | Evidence |
|-------------|----------------|----------|
| Opt-in consent | RN-9-04 | `future-you-consent-checkbox` |
| Illustrative disclaimer | RN-9-03 detail | `FUTURE_YOU_SUCCESS_AI_LABEL` |
| 18+ gate | RN-9-01/04 | blocked lede |
| Delete | RN-9-07 | delete flow |
| Report | RN-9-08 | report sheet |
| Privacy link | RN-9-04/08 | `FUTURE_YOU_PRIVACY_POLICY_URL` |

### Anti-patterns

- **Do not** require real camera in CI — mock flag mandatory
- **Do not** mark epic done without full regression green
- **Do not** skip updating sprint-status all 9 stories

### References

- [sprint-rn-9-future-you-plan.md](sprint-rn-9-future-you-plan.md) epic close gate
- [rn-8-07-sunday-history-maestro-e2e.md](rn-8-07-sunday-history-maestro-e2e.md) Maestro pattern
- PWA: `apps/pwa/e2e/onboarding-paywall-future-you.spec.ts` (reference only)

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- `npm run typecheck --workspace=@newyouai/mobile`
- `npm run test --workspace=@newyouai/core`

### Completion Notes List

- Added `future-you` E2E fitness seed (pro tier, onboarding complete, empty gallery).
- `EXPO_PUBLIC_E2E_MOCK_FUTURE_YOU=true` stubs upload/generate/poll in `lib/e2e/futureYouMock.ts` and bypasses camera/gallery picker in `FutureYouScreen`.
- Maestro flow `rn-future-you-upload.yaml`: sign-in → FAB → empty gallery → mock upload → detail.
- Epic close script `run-epic-rn9-close.mjs` runs future-you + RN-3..8 Maestro regressions.
- No "ships in RN-9" strings remain in app code; sprint status marks epic-rn-9 and all 9 stories done.

### Disclosure audit

| Requirement | Implemented in | Evidence |
|-------------|----------------|----------|
| Opt-in consent | RN-9-04 | `future-you-consent-checkbox` on upload photo step; Maestro taps before mock pick |
| Illustrative disclaimer | RN-9-03 detail | `FUTURE_YOU_SUCCESS_AI_LABEL` on detail view |
| 18+ gate | RN-9-01/04 | `isFutureYouPhotoBlocked` overlay "Future You is only for users 18+" — visible, not hidden |
| Delete | RN-9-07 | `future-you-delete-trigger` + confirm sheet on detail |
| Report | RN-9-08 | `future-you-report-trigger` + report sheet |
| Privacy link | RN-9-04/08 | `FUTURE_YOU_PRIVACY_POLICY_URL` in consent copy + legal footer |

### File List

- apps/mobile/.maestro/rn-future-you-upload.yaml (new)
- apps/mobile/scripts/run-future-you-maestro.mjs (new)
- apps/mobile/scripts/run-epic-rn9-close.mjs (new)
- apps/mobile/package.json
- apps/mobile/.env.example
- apps/mobile/lib/e2e/futureYouMock.ts (new)
- apps/mobile/lib/e2e/fitnessPersistSeed.ts
- apps/mobile/lib/futureYouUploadService.ts
- apps/mobile/lib/futureYouGenerateService.ts
- apps/mobile/lib/futureYouPollService.ts
- apps/mobile/lib/futureYouRevealPlaceholder.ts
- apps/mobile/components/future-you/FutureYouScreen.tsx
- _bmad-output/implementation-artifacts/sprint-status-rn-migration.yaml
- _bmad-output/implementation-artifacts/rn-9-09-maestro-e2e-polish.md
