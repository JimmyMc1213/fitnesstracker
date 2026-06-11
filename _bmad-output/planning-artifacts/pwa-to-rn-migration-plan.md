---
name: PWA → React Native Migration Plan (Master)
phase: 9
status: complete
created: 2026-06-08
readiness: READY WITH NOTES
next_action: /bmad-dev-story RN-0-06 (NativeWind + tokens scaffold)
---

# PWA → React Native Migration Plan

## 1. Executive summary

- Migrate **New You AI** from production PWA (`apps/pwa`) to **Expo React Native iOS app** (`apps/mobile`)
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

- Vitest in `packages/*` before UI ports
- Maestro E2E on 9 critical flows
- 100% FR traceability — see [`testarch-trace-rn-migration.md`](../implementation-artifacts/testarch-trace-rn-migration.md)

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
