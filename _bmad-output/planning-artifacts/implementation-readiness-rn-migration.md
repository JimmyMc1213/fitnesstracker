---
name: RN Migration Implementation Readiness Report
project: fitnesstracker
date: 2026-06-08
verdict: READY WITH NOTES
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
scope: PWA → React Native migration planning
---

# Implementation Readiness Assessment — RN Migration

**Date:** 2026-06-08  
**Project:** fitnesstracker (New You AI)  
**Verdict:** **READY WITH NOTES** (planning complete — implementation may begin at RN-0-01)

---

## 1. Document discovery

### RN migration artifacts (required)

| Document | Expected path | Status |
|----------|---------------|--------|
| Migration brief | `pwa-to-rn-migration-brief.md` | ✅ Confirmed |
| PWA codebase inventory | `pwa-codebase-inventory.md` | ✅ Created (Phase 1) |
| Technical research | `research/pwa-to-react-native-migration-research.md` | ✅ Complete |
| RN architecture | `architecture-rn-migration.md` | ✅ Complete |
| RN migration PRD | `prd-rn-migration.md` | ✅ Complete |
| RN epics & stories | `epics-rn-migration.md` | ✅ Complete |
| Test design | `implementation-artifacts/testarch-rn-migration-test-design.md` | ✅ Complete |
| Trace matrix | `implementation-artifacts/testarch-trace-rn-migration.md` | ✅ Complete |
| Sprint status (RN) | `implementation-artifacts/sprint-status-rn-migration.yaml` | ✅ Complete |
| Master plan | `pwa-to-rn-migration-plan.md` | ✅ Complete |

### Legacy Fitcoach artifacts (PWA maintenance — not RN migration)

| Document | Path | Notes |
|----------|------|-------|
| Fitcoach PRD | `prd.md` | Stale brand; non-goals list App Store as out of scope — conflicts with RN brief |
| Fitcoach epics | `epics.md` | FTI sprint epics; separate from RN migration |
| Turborepo plan | `turborepo-migration-plan.md` | Monorepo scaffold done; Phase H mobile pending |
| Onboarding specs | `gymmy-onboarding-flow-v2.md` (legacy PWA filename), `future-you-onboarding-spec.md` | UX reference for RN-4; **RN copy uses NewYou / New You AI only** |
| App Store risks | `ai-transformation-photo-risks.md` | Required for RN-9 Future You |

### Duplicates / conflicts

| Issue | Severity | Resolution |
|-------|----------|------------|
| `prd.md` vs `prd-rn-migration.md` (future) | Medium | Keep separate; do not merge Fitcoach PRD into RN PRD |
| `epics.md` vs `epics-rn-migration.md` (future) | Medium | RN epics use RN-* prefix; FTI epics remain for PWA |
| Fitcoach PRD non-goals vs migration brief | High | RN brief supersedes for native scope; note in `prd-rn-migration.md` |

### Missing project knowledge

| Document | Status |
|----------|--------|
| `docs/index.md` | ✅ Created (Phase 1) |
| `architecture.md` (general) | ❌ Missing (turborepo plan flagged) |

---

## 2. PRD analysis

**RN migration PRD does not exist yet.**

Fitcoach `prd.md` (2026-05-23) covers PWA only. Gaps vs RN brief:

| RN requirement area | Fitcoach PRD coverage | Gap |
|---------------------|----------------------|-----|
| Native iOS app | Listed as non-goal (Sprint 2) | ❌ Must create FR-M* in `prd-rn-migration.md` |
| IAP / StoreKit | Non-goal | ❌ TBD Phase 2 research |
| Future You full MVP | Partial (specs exist separately) | ⚠️ Consolidate in RN PRD |
| Maestro E2E | NFR-4 Layer 2 (on top of Vitest) | ✅ Addressed in `prd-rn-migration.md` |
| SecureStore / native auth | Not mentioned | ❌ Add to NFRs |
| App Store compliance | Not mentioned | ❌ Add FR-M13 |

**Blocking:** Phase 4 `/bmad-prd` must produce `prd-rn-migration.md` with 13+ FR-M requirements mapped to Phase 1 inventory.

---

## 3. Epic coverage validation

**RN epics do not exist yet.**

Fitcoach `epics.md` + 50+ `fti-*.md` story files cover PWA sprint work (Sprint 11 onboarding v2 in progress). No RN-0…RN-PARITY epics.

| PWA domain (from inventory) | Mapped epic | Status |
|------------------------------|-------------|--------|
| Auth + shell | RN-2, RN-3 | ❌ Not created |
| Onboarding (31 steps) | RN-4 | ❌ Not created |
| Home / coach | RN-5 | ❌ Not created |
| Workout (30+ overlays) | RN-6 | ❌ Not created |
| Nutrition / Log Food | RN-7 | ❌ Not created |
| Progress / Sunday check-in | RN-8 | ❌ Not created |
| Future You | RN-9 | ❌ Not created |
| Settings (13 panels) | RN-10 | ❌ Not created |
| Push / sync / App Store / parity | RN-PUSH, RN-OFFLINE, RN-STORE, RN-PARITY | ❌ Not created |

**Blocking:** Phase 5 `/bmad-create-epics-and-stories` after architecture + PRD.

---

## 4. UX alignment

**PWA is the UX reference** — no separate UX spec required for RN migration.

| Area | PWA reference | RN alignment note |
|------|---------------|-------------------|
| Onboarding v2 | `OnboardingFlow.tsx`, `gymmy-onboarding-flow-v2.md` | 31 steps must map 1:1; rebrand all user-facing copy to **NewYou** / **New You AI** |
| Tab shell | `FitnessApp.tsx` | Expo Router tabs + floating Future You button |
| Log Food overlay | `LogFoodScreen.tsx` | Modal stack with 4 tabs + barcode |
| Workout session | `ScreenWorkout.tsx` | Highest overlay count; DnD reorder native replacement |
| Future You | `FutureYouPageContent.tsx` | App Store AI disclosure required |
| Settings panel stack | `ScreenSettings.tsx` | 13 panels + sub-layers |

**Open UX decisions:** IAP paywall behavior (stub vs StoreKit), iOS min version, Dynamic Type scaling targets.

---

## 5. Epic quality review (pre-flight)

Cannot assess RN story quality — epics not yet created.

**Pre-flight requirements for Phase 5:**
- Every story references PWA component path from `pwa-codebase-inventory.md`
- Given/When/Then acceptance criteria cite PWA behavior
- Test tasks name Vitest file to port + Maestro flow ID
- Stories ≤3 dev days (solo + AI)
- Dependencies: RN-0 → RN-1 → RN-2/RN-3 → feature epics

---

## 6. Final assessment

### Verdict: READY WITH NOTES

Planning **complete**. All Phase 0–9 artifacts exist. Implementation may begin at **RN-0-01**.

### Completed

- ✅ BMAD installed (`bmm`, `bmb`, `tea`, `cis`)
- ✅ Migration brief confirmed
- ✅ PWA codebase inventory + `docs/index.md`
- ✅ Technical research (Expo, NativeWind, RevenueCat IAP, Maestro)
- ✅ Architecture, PRD (FR-M1–M13), epics (~107 stories)
- ✅ Test design + trace matrix (100% FR coverage)
- ✅ Timeline, sprint tracker, master plan
- ✅ RN-0-01 story template validated

### Notes (non-blocking)

- PWA feature freeze date still open (recommend after RN-3)
- Bundle ID / App Store Connect app record TBD
- Server-side push token registry deferred post-MVP
- Progress/Settings/Sunday need Maestro flows or UAT during RN-8/RN-10
- Fitcoach `prd.md` non-goals superseded by `prd-rn-migration.md` for native only

### Next action

```
/bmad-dev-story — RN-0-01 Init Expo app in monorepo
```

---

## Traceability preview (Phase 1 → future FRs)

| Inventory domain | Screen count | Proposed FR |
|------------------|--------------|-------------|
| Auth | 2 views | FR-M1 |
| Onboarding | 31 steps | FR-M2 |
| Home tab | 1 + overlays | FR-M3 |
| Workout | 1 + 25+ overlays | FR-M4 |
| Nutrition | 1 + Log Food stack | FR-M5 |
| Progress | 1 + 3 overlays | FR-M6 |
| Future You | 3 views + dialogs | FR-M7 |
| Sunday check-in | 4 steps | FR-M8 |
| Stretch/mobility | session flow | FR-M9 |
| Settings | 13 panels | FR-M10 |
| Cloud sync | cross-cutting | FR-M11 |
| Push notifications | cross-cutting | FR-M12 |
| App Store ship | cross-cutting | FR-M13 |
