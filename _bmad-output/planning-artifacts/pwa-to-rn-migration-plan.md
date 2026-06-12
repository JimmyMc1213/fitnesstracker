---
name: PWA → React Native Migration Plan (Master)
phase: 9
status: complete
created: 2026-06-08
readiness: READY WITH NOTES
next_action: /bmad-swarm epic-rn-3 — Core navigation & app shell
---

# PWA → React Native Migration Plan

## 1. Executive summary

- Migrate **New You AI** from production PWA (`apps/pwa`) to **Expo React Native iOS app** (`apps/mobile`)
- **RN branding lock:** user-facing name is **NewYou** / **New You AI** only — no Gymmy (or Fitcoach) in `apps/mobile`, RN stories, or RN Maestro flows
- PWA is the **parity baseline** — 90+ flows inventoried, 97 Vitest + 7 Playwright specs
- **Expo + Expo Router + NativeWind + Supabase + RevenueCat + Maestro**
- ~40% TS logic shareable via `packages/*`; UI rebuilt
- **107 stories** across 15 epics; **~24–28 weeks** implementation (solo + AI)
- **IAP required** for App Store (RevenueCat → `subscriptionTier: pro`)
- PWA stays live until RN-PARITY gate
- **Planning complete** — begin `/bmad-dev-story` on RN-0-01

## 2. Current state

- Monorepo: `apps/pwa`, `apps/web`, `apps/admin`; stub `packages/*`
- Tab-state PWA, Supabase backend, no `apps/mobile`
- See [`pwa-codebase-inventory.md`](pwa-codebase-inventory.md)

## 3. Target state

- `apps/mobile` Expo dev client + EAS Build
- Shared: `packages/types`, `api-client`, `core`, `config`
- See [`architecture-rn-migration.md`](architecture-rn-migration.md)

## 4. Feature parity matrix (summary)

| PWA | RN route | FR |
|-----|----------|-----|
| Auth shell | `(auth)/*` | FR-M1 |
| Onboarding 31 steps | `(onboarding)/[step]` | FR-M2 |
| 6 tabs + FY FAB | `(tabs)/*` | FR-M3–M7, M10 |
| Log Food overlay | `(modals)/log-food` | FR-M5 |
| Sunday check-in | `(modals)/sunday-check-in` | FR-M8 |
| Settings 13 panels | `settings/[panel]` | FR-M10 |

Full map: inventory §1.2

## 5. Epic roadmap

RN-0 → RN-1 → RN-2/RN-3 → RN-4…RN-10 → RN-PUSH/RN-OFFLINE → RN-STORE → RN-PARITY

See [`epics-rn-migration.md`](epics-rn-migration.md)

## 6. Test strategy

Two complementary layers — **regular testing first**, **Maestro E2E on top**. Neither replaces the other.

### Layer 1: Regular testing (every PR, blocking)

| Gate | Tool | Scope |
|------|------|-------|
| Typecheck | `turbo typecheck` | Monorepo including `apps/mobile` |
| Unit / integration | Vitest (`turbo test`) | `packages/core`, `packages/api-client` — port PWA logic before RN UI |
| Component (selective) | Vitest + RNTL | Critical RN components only |

- Shared logic **must** have Vitest coverage before the RN screen ships
- CI blocks merge on typecheck + unit test failure (RN-0-05+)
- PWA baseline: 97 Vitest + 7 Playwright specs to port or trace

### Layer 2: Maestro E2E (on top of Layer 1)

| Gate | Tool | Scope |
|------|------|-------|
| Smoke | Maestro | App launch + home visible (`smoke.yaml`) — RN-0-03 |
| Critical paths | Maestro | 9 flows on iOS simulator/dev client |
| Per-story DoD | Maestro | New flow when story touches a critical path |

**Maestro flows** (`apps/mobile/.maestro/`):

| Flow | File | Epic |
|------|------|------|
| Auth gate | `rn-auth-gate.yaml`, `rn-auth-gate-sign-in.yaml` | RN-2 |
| Auth sign-up | `rn-auth-sign-up.yaml` | RN-2 |
| Auth sign-out | `rn-auth-sign-out.yaml` | RN-2 |
| Onboarding v2 | `rn-onboarding-v2.yaml` | RN-4 |
| Onboarding plan | `rn-onboarding-plan.yaml` | RN-4 |
| Paywall + Future You | `rn-onboarding-fy.yaml` | RN-4, RN-9 |
| Workout session | `rn-workout-session.yaml` | RN-6 |
| Nutrition log | `rn-nutrition-log.yaml` | RN-7 |
| Coach → nutrition | `rn-coach-nutrition.yaml` | RN-5, RN-7 |
| Cloud sync | `rn-sync-signin.yaml` | RN-OFFLINE |
| Future You upload | `rn-future-you-upload.yaml` | RN-9 |

- Maestro runs against dev client on iOS simulator (local + EAS `e2e-test` profile)
- `testID` convention: `{screen}-{element}` on all Maestro-targeted elements
- Progress/Settings/Sunday: add Maestro flows in RN-8/RN-10 or UAT checklist

### Traceability

- 100% FR-M1–M13 mapped to ≥1 test (unit and/or Maestro)
- Full matrix: [`testarch-trace-rn-migration.md`](../implementation-artifacts/testarch-trace-rn-migration.md)
- Test design detail: [`testarch-rn-migration-test-design.md`](../implementation-artifacts/testarch-rn-migration-test-design.md)

## 7. Timeline

~24–28 weeks implementation. See [`rn-migration-timeline.md`](rn-migration-timeline.md)

## 8. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| App Store IAP rejection | RevenueCat + sandbox before submit |
| Future You AI rejection | Disclosures per ai-transformation-photo-risks.md |
| CSS rebuild scope | NativeWind + vertical slices |
| Timeline slip | PWA feature freeze after RN-3 |
| PWA/FTI backlog collision | Separate RN sprint tracker |

## 9. Open questions

- [ ] Exact bundle ID / App Store Connect app record
- [ ] PWA feature freeze date (recommend post RN-3)
- [ ] Server-side push token registry (deferred post-MVP)

## 10. Next action

```
/bmad-dev-story
Story: RN-0-01 — Init Expo app in monorepo
File: _bmad-output/implementation-artifacts/rn-0-01-init-expo-monorepo.md
```

## Artifact index

| Phase | Artifact |
|-------|----------|
| 0 | [pwa-to-rn-migration-brief.md](pwa-to-rn-migration-brief.md) |
| 1 | [pwa-codebase-inventory.md](pwa-codebase-inventory.md), [docs/index.md](../../docs/index.md) |
| 2 | [research/pwa-to-react-native-migration-research.md](research/pwa-to-react-native-migration-research.md) |
| 3 | [architecture-rn-migration.md](architecture-rn-migration.md) |
| 4 | [prd-rn-migration.md](prd-rn-migration.md) |
| 5 | [epics-rn-migration.md](epics-rn-migration.md) |
| 6 | [testarch-rn-migration-test-design.md](../implementation-artifacts/testarch-rn-migration-test-design.md), [testarch-trace-rn-migration.md](../implementation-artifacts/testarch-trace-rn-migration.md) |
| 7 | [implementation-readiness-rn-migration.md](implementation-readiness-rn-migration.md) |
| 8 | [rn-migration-timeline.md](rn-migration-timeline.md), [sprint-status-rn-migration.yaml](../implementation-artifacts/sprint-status-rn-migration.yaml) |
| 9 | This document |
