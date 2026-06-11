---
name: RN Migration Timeline
phase: 8
created: 2026-06-08
resourcing: solo dev + AI
estimate_weeks: 24-28
---

# RN Migration Timeline

## Phased rollout

| Phase | Weeks | Goal | Exit criteria |
|-------|-------|------|---------------|
| **Planning** | 1 | Phases 0–9 artifacts | Readiness READY WITH NOTES ✅ |
| **Foundation** | 2–3 | RN-0, RN-0 Maestro | Dev client on simulator, CI green |
| **Platform** | 2–3 | RN-1 package extraction | Vitest green in packages/* |
| **Auth + shell** | 2–3 | RN-2, RN-3 | Auth E2E + tab shell |
| **Vertical slice** | 2–3 | Onboarding[0-5] + home | First Maestro parity path |
| **Feature parity** | 12–14 | RN-4–RN-10, RN-PUSH, RN-OFFLINE | Trace matrix verified |
| **Hardening** | 2–3 | Performance, a11y, edge cases | UAT sign-off |
| **App Store** | 2–3 | RN-STORE, RN-PARITY | TestFlight → production approved |

**Total implementation:** ~24–28 weeks after planning (solo + AI)

## Epic sequence & dependencies

```mermaid
flowchart TD
  RN0[RN-0 Foundation] --> RN1[RN-1 Shared packages]
  RN0 --> RN2[RN-2 Auth]
  RN1 --> RN2
  RN2 --> RN3[RN-3 App shell]
  RN3 --> VS[Vertical slice]
  RN1 --> RN4[RN-4 Onboarding]
  RN3 --> RN4
  RN4 --> RN5[RN-5 Home]
  RN4 --> RN9[RN-9 Future You]
  RN3 --> RN6[RN-6 Workout]
  RN3 --> RN7[RN-7 Nutrition]
  RN3 --> RN8[RN-8 Progress]
  RN3 --> RN10[RN-10 Settings]
  RN1 --> RNOFF[RN-OFFLINE Sync]
  RN5 --> RNPUSH[RN-PUSH]
  RN4 --> RNSTORE[RN-STORE IAP]
  RN5 --> RNPAR[RN-PARITY]
  RN6 --> RNPAR
  RN7 --> RNPAR
  RN9 --> RNPAR
```

## Parallel workstreams

| Stream | Rule |
|--------|------|
| PWA maintenance | Bugfixes only after RN-3 complete |
| PWA feature freeze | Recommend week 8 of implementation |
| FTI Linear sprint | Separate RN backlog; don't mix with Sprint 11 |

## Milestones (relative)

| Milestone | Target week | Deliverable |
|-----------|-------------|-------------|
| M1 Dev client runs | Week 3 | RN-0 complete |
| M2 Auth E2E green | Week 8 | RN-2 + Maestro auth |
| M3 Vertical slice | Week 11 | Onboarding partial + home |
| M4 Feature complete | Week 22 | All FR-M* implemented |
| M5 TestFlight | Week 25 | RN-STORE |
| M6 App Store | Week 28 | RN-PARITY signed |

## Story counts by epic

See `epics-rn-migration.md` — 107 stories total, ~2.5 stories/week sustained
