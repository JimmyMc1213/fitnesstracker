# Epic Retrospective: RN-2 Authentication & Session

**Epic key:** `epic-rn-2`  
**Project:** fitnesstracker (NewYou AI mobile migration)  
**Date:** 2026-06-12  
**Facilitator:** Amelia (Developer)  
**Participants:** Jimmymccarthy (Project Lead), Alice (Product Owner), Charlie (Senior Dev), Dana (QA Engineer), Elena (Junior Dev)

---

## Epic summary

**Goal:** Complete native auth entry + session lifecycle (email, Google, Apple, sign-out) so RN-3 app shell can assume a signed-in user.

| Metric | Value |
| --- | --- |
| Stories completed | 5 / 5 (RN-2-01 → RN-2-05) |
| Swarm branch | `epic-rn-2/authentication-session` |
| Quality gate (per story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Quality gate (epic close) | `npm run test:e2e:auth-all` ✅ (2026-06-12) |
| Epic status | **done** |

### Stories delivered

| Story | Theme |
| --- | --- |
| RN-2-01 | Supabase + SecureStore, auth gate, sign-in, Maestro gate flows |
| RN-2-02 | Email sign-up with PWA-parity duplicate-email + `needsConfirmation` |
| RN-2-03 | Google OAuth via `expo-auth-session` + shared `AuthOAuthButtons` |
| RN-2-04 | Apple Sign-In via `expo-apple-authentication` + EAS capability |
| RN-2-05 | Sign-out affordance, `AppState` refresh, OAuth error mapping, Maestro sign-out |

**Execution order:** RN-2-02 → 03 → 04 → 05 (RN-2-01 done pre-swarm)

---

## Previous retro continuity (RN-1)

No RN-1 retrospective was recorded. This is the first RN migration epic retro. Patterns from PWA Sprint 10 (CI + E2E depth) informed Maestro orchestration (`run-auth-maestro.mjs`) but were not tracked as formal action-item follow-through.

---

## What went well

- **Auth gate as single routing authority** — Removing manual `router.replace` after sign-in/sign-up and letting `useAuthGate` react to session updates eliminated navigation races (RN-2-01 review finding applied across the epic).
- **PWA logic port, not reinvent** — `signUpWithEmail` duplicate-email handling, OAuth redirect parsing, and sign-out best-effort parity came straight from `fitnessCloudSync.ts` patterns; low surprise for downstream RN-OFFLINE.
- **Shared OAuth shell** — RN-2-03 built `AuthOAuthButtons` + `lib/authOAuth.ts`; RN-2-04 only extended Apple. One PR worth of redirect plumbing reused cleanly.
- **Maestro investment paid off** — Four auth YAML flows + `run-auth-maestro.mjs` + subflows (`dev-client-connect`, `dismiss-ios-password-prompt`) give a repeatable epic-close gate without Playwright on native.
- **Epic swarm sequencing** — Strict 02 → 05 order on one branch matched sprint plan; typecheck gate caught issues before Maestro runs.
- **NewYou branding lock** — No Gymmy/Fitcoach copy leaked into mobile auth screens.

---

## Challenges

| Challenge | Impact | Resolution / status |
| --- | --- | --- |
| Metro port conflict (`8081` vs `8082`) | Maestro `openLink` fails if Metro port mismatches | Runbook: always `--port 8082` when 8081 occupied; YAML hardcoded to `:8082` |
| Maestro requires Java 17 | Local E2E blocked without `JAVA_HOME` | Documented in sprint plan + `run-auth-maestro.mjs` |
| Apple Sign-In external deps | Code shipped; cannot fully validate until Apple Developer account approved | Pending checklist in sprint status + RN-2-04 story |
| Google OAuth provider creds | Manual sign-in not verified in all environments | Supabase dashboard + `docs/env-matrix.md` — owner: Project Lead |
| Simulator vs device for Apple | Apple auth unreliable on simulator | TestFlight / physical device gate documented in `docs/eas-ios.md` |
| Post-auth routing still stub | Signed-in users land on `(tabs)` placeholder, not onboarding-aware shell | **Expected** — `appShellRouting` is RN-3-02 |

### Story-level gaps (manual, not blocking epic close)

- RN-2-02: duplicate-email and `needsConfirmation` paths — manual only
- RN-2-03: Google OAuth on dev client — manual gate
- RN-2-04: Apple Sign-In on device/TestFlight — blocked on Apple Dev approval
- RN-2-05: kill → relaunch session persist; OAuth cancel paths — manual

---

## Technical debt & deferrals

| Item | Deferred to | Priority |
| --- | --- | --- |
| Full sign-out in Settings IA | RN-10 | Low (dev stub on tabs home suffices for RN-3) |
| Maestro onboarding-bypass parity (`onboardingComplete` seed) | RN-4 | Medium |
| SecureStore keychain accessibility hardening | Backlog | Low |
| RevenueCat `Purchases.logIn` after auth | RN-4 paywall | Medium |
| Fitness cloud sync on auth | RN-OFFLINE | High (not RN-2 scope) |
| `oauthReturnCapture` full parity (Save Progress OAuth) | RN-4 | Medium |

---

## Key insights

1. **Let the auth gate own navigation** — Any auth form that manually navigates after async session update will race `useAuthGate`. RN-3 shell routing should follow the same pattern.
2. **Maestro is the native E2E layer** — Port PWA Playwright patterns as YAML + env vars (`MAESTRO_TEST_*`); orchestration script beats one-off npm scripts per flow.
3. **OAuth stories should share one redirect module** — `lib/authOAuth.ts` centralizes parse/error mapping; RN-4 onboarding OAuth should extend it, not fork.
4. **External platform gates are real blockers** — Apple/Google need ops checklists in sprint plans, not buried in story notes.

---

## RN-3 preview & dependencies

**Next epic:** RN-3 — Core navigation & app shell (6 stories)

| RN-3 story | Depends on RN-2 |
| --- | --- |
| RN-3-01 Tab bar + FY FAB | Signed-in user can reach tabs |
| RN-3-02 `appShellRouting` | Stable `AuthContext` + session; **replaces tabs stub routing** |
| RN-3-03 Modal shells | Auth gate + tab shell |
| RN-3-04 Settings stack | Tab navigation |
| RN-3-05 Error/loading boundaries | Root layout + auth loading gate |
| RN-3-06 Deep link stub | OAuth deep links from RN-2-05 |

**RN-3 does not require** Apple/Google manual validation to start RN-3-01, but **RN-4 onboarding** benefits from Apple Dev + Google creds being live.

---

## Action items

### Process

| # | Action | Owner | Success criteria |
| --- | --- | --- | --- |
| 1 | Run **sprint planning for RN-3** before swarm (`sprint-rn-3-app-shell-plan.md`) | Amelia / PO | Plan doc + updated `sprint-status-rn-migration.yaml` |
| 2 | Copy Maestro runbook block (Java, Metro `:8082`, env vars) into RN-3 sprint plan | Charlie | RN-3 plan has runbook section |
| 3 | **Create story files** for RN-3-01 through RN-3-06 before `/bmad-swarm epic-rn-3` | Amelia | Six `rn-3-*.md` files exist |

### Technical / ops

| # | Action | Owner | Success criteria |
| --- | --- | --- | --- |
| 4 | Complete Apple Sign-In external setup when Developer account approved | Jimmymccarthy | Manual Apple sign-in works on device; checklist in sprint status cleared |
| 5 | Verify Google OAuth redirect URIs in Supabase + manual Google sign-in on dev client | Jimmymccarthy | Google OAuth succeeds on iOS dev client |
| 6 | Rebuild dev client after OAuth native deps if not already on latest build | Charlie | `eas build --profile development --platform ios` if Apple capability changed |

### RN-3 preparation (critical path)

| # | Task | Owner |
| --- | --- | --- |
| 7 | Read PWA `appShellRouting` / `FitnessApp.tsx` tab bar for RN-3-01/02 parity | Amelia |
| 8 | Define Maestro tab-navigation smoke for RN-3 epic close | Dana |
| 9 | Keep post-auth routing in `useAuthGate` / shell router — no form-level `router.replace` | Charlie |

---

## Readiness assessment

| Area | Status | Notes |
| --- | --- | --- |
| Story completion | ✅ | All 5 stories `done` |
| Automated tests | ✅ | `test:e2e:auth-all` green |
| Typecheck | ✅ | Per-story gate met |
| Manual OAuth validation | ⚠️ | Apple blocked on account approval; Google pending manual verify |
| Production / App Store | — | Dev client only; RN-STORE epic |
| Unblocks RN-3 | ✅ | Auth gate + session stable for shell work |

**Verdict:** Epic RN-2 is **complete for development purposes**. Proceed to RN-3 sprint planning + swarm. Complete Apple/Google manual validation in parallel with RN-3-01/02.

---

## Significant discoveries

No fundamental change to RN-3 epic definition required. Confirmed assumptions:

- Post-auth routing belongs in RN-3-02 (`appShellRouting`), not RN-2.
- Maestro + Metro port discipline is mandatory for every RN epic with E2E gates.
- Native OAuth needs ops runbooks alongside code stories.

---

## Next steps

1. Mark `epic-rn-2-retrospective` → `done` in `sprint-status-rn-migration.yaml`
2. **`bmad-sprint-planning`** for RN-3
3. **`bmad-create-story`** for RN-3-01
4. **`/bmad-swarm epic-rn-3`** on branch `epic-rn-3/core-navigation-app-shell`

---

## Epic status: **DONE** (retro complete)
