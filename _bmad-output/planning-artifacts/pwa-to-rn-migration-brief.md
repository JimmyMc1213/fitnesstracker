---
name: PWA → React Native Migration Brief
phase: 0
status: confirmed
stepsCompleted:
  - phase-0-kickoff-draft
  - phase-0-scope-confirmed
  - bmad-installed-2026-06-08
created: 2026-06-08
updated: 2026-06-08
---

# PWA → React Native Migration Brief

## Migration goal

Migrate **New You AI** from its production-ready Vite PWA (`apps/pwa`, `app.newyouai.app`) to a native **iOS App Store app** built with **Expo + React Native** (`apps/mobile`), preserving **100% of shipped PWA product functionality** as the parity baseline. The PWA remains the authoritative spec for behavior, UX flows, API contracts, and edge cases until the native app passes a documented parity gate. Android is optional and out of MVP unless explicitly added. Marketing (`apps/web`) and admin (`apps/admin`) remain separate web apps and are not part of this migration.

## Reference app

| Surface | Path | Domain | Role |
|---------|------|--------|------|
| **PWA (source of truth)** | `apps/pwa/` | `app.newyouai.app` | Product — all features, tests, UX |
| Marketing | `apps/web/` | `newyouai.app` | Out of scope |
| Admin | `apps/admin/` | `admin.newyouai.app` | Out of scope |
| Mobile (target) | `apps/mobile/` (not yet created) | App Store | New native iOS app |

**PWA entry points:**
- `apps/pwa/src/main.tsx` → `FitnessApp.tsx`
- Shell routing: `apps/pwa/src/fitness/appShellRouting.ts` (auth → onboarding → app)
- Tab navigation: `TabId` in `apps/pwa/src/fitness/types.ts` — `home`, `workout`, `nutrition`, `progress`, `future_you`, `stretch`, `settings`
- Backend: `supabase/` (migrations + Edge Functions at repo root)

## In scope

- Full feature parity with shipped PWA product flows
- Expo managed workflow + dev client + EAS Build (iOS first)
- Monorepo integration: `apps/mobile` + shared packages (`packages/types`, `packages/api-client`, `packages/core`, `packages/config`)
- Auth parity (Supabase GoTrue — same accounts as PWA)
- Cloud sync parity (`fitnessCloudSync`, local persist slice → native secure storage adapter)
- Native replacements for web-only capabilities: camera, barcode scan, push notifications, secure token storage, photo save/share
- **Future You full MVP** (upload, generate, gallery, paywall UI, report, delete)
- Test strategy: Vitest for shared logic; Maestro E2E for critical iOS paths
- App Store readiness: privacy manifest, TestFlight, review checklist
- Traceability: PWA screen → FR → epic → story → test

## Out of scope (default — confirmed)

- `apps/web` marketing site changes
- `apps/admin` staff dashboard
- Android / Google Play (explicitly deferred)
- Backend schema redesign (Supabase stays; adapter-only changes)
- PWA deprecation / sunsetting (PWA stays live until RN parity gate)
- Production migration code in this planning run

## Success criteria

| Gate | Criterion |
|------|-----------|
| **Feature parity** | Every in-scope PWA tab/flow has a mapped RN screen; trace matrix 100% for in-scope FRs |
| **Behavior parity** | Acceptance criteria reference PWA behavior; UAT sign-off on critical paths |
| **Test coverage** | Shared package logic unit-tested before UI port; E2E on auth, onboarding, workout session, nutrition log, sync |
| **App Store readiness** | TestFlight build approved; privacy manifest; Future You AI disclosures per risk doc |
| **Implementation readiness** | BMAD readiness report: READY or READY WITH NOTES |
| **No silent deferrals** | Any cut from PWA scope documented with PO sign-off |

## Assumptions (validated)

| Area | Decision |
|------|----------|
| **Backend** | Supabase unchanged — same Auth, Postgres+RLS, Storage, Edge Functions |
| **Monorepo** | Turborepo scaffold complete (Phases A–G+I on `main`); `packages/*` are stubs — extraction during RN migration |
| **Styling** | PWA uses ~7k-line global CSS; RN rebuild with NativeWind or StyleSheet (Phase 2 research) — no CSS port |
| **Code reuse** | ~35–45% TS business logic shareable; ~0% UI/CSS shareable |
| **Offline** | PWA uses `localStorage` persist + cloud merge — not offline-first; RN matches |
| **Push** | PWA uses Web Notifications + `notification-sw.js`; RN uses `expo-notifications` + APNs |
| **IAP / subscriptions** | **RevenueCat (`react-native-purchases`)** — required before App Store; maps entitlement `pro` → `subscriptionTier` |
| **Future You** | **Full MVP parity confirmed** |
| **Resourcing** | **Solo dev + AI assist** |
| **Linear** | Backlog source of truth remains Linear (FTI project); RN BMAD epics separate from active PWA sprint |

## Known technical constraints (from repo)

- No `react-router` — tab state machine in `FitnessApp.tsx`; RN needs Expo Router mapping
- Web-only deps: `@zxing/browser`, `framer-motion`, `@ark-ui/react`, `@dnd-kit/*`
- PWA manifest + notification SW only — no offline precache
- Apple OAuth wired in Supabase but Apple sign-in UI disabled in PWA — **enable on native**
- App Store risk: Future You AI body imagery — see `ai-transformation-photo-risks.md`

## Scope confirmation checklist

- [x] Confirm migration goal and in/out of scope above
- [x] Confirm PWA stays live until RN parity (default: yes)
- [ ] Confirm when to freeze PWA feature additions (recommend after RN-3 app shell)
- [x] Confirm MVP native scope for Future You (full MVP)
- [x] Confirm IAP/StoreKit — RevenueCat for App Store (research complete)
- [x] Confirm Android explicitly deferred
- [x] Confirm resourcing scenario (solo + AI)
- [x] Confirm target iOS minimum version — **iOS 15.0** (architecture)
- [x] Confirm BMAD reinstall — **installed 2026-06-08** (`bmm`, `bmb`, `tea`, `cis`; no Game Dev)

## BMAD configuration

- `_bmad/bmm/config.yaml` — installed
- `planning_artifacts` → `_bmad-output/planning-artifacts`
- `implementation_artifacts` → `_bmad-output/implementation-artifacts`
- `project_knowledge` → `docs/`

## Next step

**Planning complete (Phases 0–9).** Master plan: `pwa-to-rn-migration-plan.md`  
**Implementation:** `/bmad-dev-story` on **RN-0-01** (`rn-0-01-init-expo-monorepo.md`)
