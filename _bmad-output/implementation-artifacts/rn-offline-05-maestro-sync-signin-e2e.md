---
name: RN-OFFLINE-05 Maestro sync sign-in + epic polish
epic: RN-OFFLINE
story: 05
status: done
swarm_order: 5
swarm_branch: epic-rn-offline/cloud-sync
---

# Story OFFLINE-05: Maestro sync sign-in + epic polish

Status: ready-for-dev

## Story

**As a** developer  
**I want** a Maestro sync sign-in flow and full regression green  
**So that** FR-M11 cloud sync is verifiable in CI and the RN-OFFLINE epic can close

## Acceptance Criteria

1. **Given** dev client on simulator with Supabase configured, **When** `npm run test:e2e:sync` runs, **Then** `.maestro/rn-sync-signin.yaml` passes
2. **Given** sync flow, **When** user signs in, **Then** asserts home visible after hydration gate (`tab-home` or equivalent)
3. **Given** sync flow, **When** settings account opens, **Then** asserts sync status is not stub-only (e.g. `settings-sync-now` visible or last-uploaded text present)
4. **Given** `apps/mobile/package.json`, **When** inspected, **Then** `test:e2e:sync` script exists mirroring other e2e scripts
5. **Given** epic complete, **When** audited, **Then** no "sync ships in RN-OFFLINE" / "later release" placeholder copy remains in mobile settings
6. **Given** epic close gate, **When** full Maestro regression runs, **Then** auth-all, tab-nav, onboarding, coach-nutrition, workout-session, nutrition-log, progress, sunday-check-in, future-you, settings all green
7. **Given** epic complete, **When** tracker updated, **Then** all RN-OFFLINE stories `done`, `epic-rn-offline` → `done`

## Tasks / Subtasks

- [ ] Create `.maestro/rn-sync-signin.yaml` (AC: 1–3)
  - [ ] Reuse auth subflows / `MAESTRO_TEST_EMAIL` + `MAESTRO_TEST_PASSWORD` from `rn-auth-gate-sign-in.yaml`
  - [ ] Wait for home after sign-in (allow hydration delay ≤ 6s)
  - [ ] Navigate settings → account panel
  - [ ] Assert `settings-sync-now` or `settings-account-sync-status` with non-stub text
- [ ] E2E mock strategy (AC: 1)
  - [ ] Option A: `EXPO_PUBLIC_E2E_MOCK_FITNESS_SYNC=true` — inject mock remote row in dev (document in flow header)
  - [ ] Option B: dedicated test user with pre-seeded `fitness_user_data` (`onboardingComplete: true`)
  - [ ] Document chosen approach in yaml comments + sprint plan runbook
- [ ] Add `npm run test:e2e:sync` to `apps/mobile/package.json` (AC: 4)
- [ ] Optional: `apps/mobile/scripts/run-epic-rn-offline-close.mjs` (mirror `run-epic-rn10-close.mjs`)
- [ ] Remove placeholder sync copy (AC: 5)
  - [ ] `AccountPanel.tsx` helper text audit
  - [ ] Any other "RN-OFFLINE" deferral strings in mobile
- [ ] Update `testarch-trace-rn-migration.md` FR-M11 row — Maestro evidence (AC: 7)
- [ ] Epic regression sweep (AC: 6)
- [ ] Update `sprint-status-rn-migration.yaml` (AC: 7)

## Dev Notes

### Maestro prerequisites

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1
cd apps/mobile && EXPO_PUBLIC_E2E_MOCK_FITNESS_SYNC=true npx expo start --dev-client --port 8082

# Terminal 2
npm run test:e2e:sync
```

### Epic close regression (blocking)

```bash
npm run test:e2e:sync
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:onboarding
npm run test:e2e:coach-nutrition
npm run test:e2e:workout-session
npm run test:e2e:nutrition-log
npm run test:e2e:progress
npm run test:e2e:sunday-check-in
npm run test:e2e:future-you
npm run test:e2e:settings
```

### Reference flows

| Flow | File | Reuse |
|------|------|-------|
| Auth sign-in | `rn-auth-gate-sign-in.yaml` | Credentials subflow |
| Settings | `rn-settings.yaml` | Navigate to account |
| Tab nav | `rn-tab-navigation.yaml` | Home visible assert |

### testID checklist

| testID | Story |
|--------|-------|
| `settings-sync-now` | RN-OFFLINE-04 |
| `settings-account-sync-status` | RN-OFFLINE-04 |
| `tab-home` / `home-screen` | RN-5 |
| `settings-hub` | RN-10 |

### Anti-patterns

- **Do not** block epic on live Supabase if mock flag makes flow deterministic
- **Do not** change sync merge logic in this story — test only
- **Do not** skip full regression before marking epic done

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Maestro sync + regression | RN-PUSH / RN-STORE / RN-PARITY |
| Epic close scripts + tracker | New sync features beyond FR-M11 |

### References

- [sprint-rn-offline-sync-plan.md](sprint-rn-offline-sync-plan.md) RN-OFFLINE-05
- [testarch-trace-rn-migration.md](testarch-trace-rn-migration.md) FR-M11
- [pwa-to-rn-migration-plan.md](../planning-artifacts/pwa-to-rn-migration-plan.md) Maestro table
- Mobile: `.maestro/rn-auth-gate-sign-in.yaml`, `rn-settings.yaml`
- Scripts: `apps/mobile/scripts/run-epic-rn10-close.mjs` (pattern)

## Dev Agent Record

### Agent Model Used

### Completion Notes List

### File List
