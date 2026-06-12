---
name: RN-3-06 Deep link handler stub
epic: RN-3
story: 06
status: ready-for-dev
swarm_order: 6
swarm_branch: epic-rn-3/core-navigation-app-shell
---

# Story 3.06: Deep link handler stub

Status: ready-for-dev

## Story

**As a** user opening a `newyouai://` link  
**I want** the app to route to the correct shell screen  
**So that** marketing links and OAuth coexist without navigation conflicts

## Acceptance Criteria

1. **Given** app running signed in, **When** `newyouai://settings/account` opens, **Then** settings account panel stub renders
2. **Given** app running, **When** `newyouai://home` opens, **Then** home tab is active
3. **Given** Google OAuth via `WebBrowser.openAuthSessionAsync` (RN-2-03), **When** sign-in completes, **Then** session is set with no regression (primary path unchanged)
4. **Given** cold-start URL `newyouai://auth/callback#access_token=…`, **When** app opens, **Then** `deepLinkRouter` delegates to OAuth session handler (does not route to tabs)
5. **Given** unknown path, **When** deep link opens, **Then** app falls back to home or logs in dev (no crash)
6. **Given** epic close, **When** `npm run test:e2e:auth-all` runs, **Then** OAuth flows still pass

## Tasks / Subtasks

- [ ] Add `lib/deepLinkRouter.ts` — pure path → route action (AC: 1, 2, 5)
  - [ ] Parse `newyouai://` paths; ignore query/hash for stub routes
  - [ ] Routes: `home`, `settings/:panel`, `stretch` → home with mobility placeholder param
  - [ ] OAuth prefix detection → delegate, do not consume
- [ ] Add `useDeepLinkHandler` in root layout (AC: 1, 2, 5, 6)
  - [ ] Listen to `Linking` initial URL + `url` events
  - [ ] Wait until shell gate resolved before navigating
  - [ ] Map actions to `router.push` / `router.replace`
- [ ] OAuth URLs delegate before generic routing (AC: 3–4, 6)
  - [ ] Export or wrap `completeOAuthRedirect` from `AuthContext` for Linking cold-start
  - [ ] Reuse `parseOAuthRedirectUrl` from `lib/authOAuth.ts`
  - [ ] Match `auth/callback` paths + URLs with `#access_token` / `?access_token`
  - [ ] Do **not** move Google OAuth off `WebBrowser.openAuthSessionAsync` — that path stays primary
- [ ] Confirm `app.config.ts` `scheme: "newyouai"`; document in `docs/env-matrix.md` (AC: 1–2)
- [ ] Vitest for `deepLinkRouter` path parsing (AC: 5 — unknown/fallback paths)
  - [ ] Colocate `deepLinkRouter.test.ts` beside `lib/deepLinkRouter.ts`
  - [ ] Add `vitest` + `"test": "vitest run"` to `apps/mobile/package.json` (mobile currently has `"test": "echo no-tests"`)
- [ ] Epic close sweep: tab-nav + auth-all Maestro; mark `epic-rn-3` done in sprint status (AC: 6)

## Dev Notes

### Scheme already configured

```9:9:apps/mobile/app.config.ts
  scheme: "newyouai",
```

Architecture: bundle `app.newyouai.mobile`, universal links deferred to RN-STORE.

### Deep link routing priority

```
1. OAuth redirect URLs (access_token in hash/query) → AuthContext handler
2. Known app paths → deepLinkRouter
3. Unknown → fallback home + __DEV__ console.warn
```

OAuth today lives in `AuthContext.completeOAuthRedirect` (private), invoked from `WebBrowser.openAuthSessionAsync` — **not** a global `Linking` listener. RN-3-06 adds Linking for marketing routes; OAuth delegation covers cold-start `auth/callback` only.

### deepLinkRouter API (suggested)

```typescript
export type DeepLinkAction =
  | { type: "oauth"; url: string }
  | { type: "navigate"; href: "/(tabs)/home" | "/(tabs)/settings/account" | ... }
  | { type: "fallback" };

export function resolveDeepLink(url: string): DeepLinkAction;
```

Path mapping per architecture:

| URL path | Action |
|----------|--------|
| `home` | `/(tabs)/home` |
| `settings/account` | `/(tabs)/settings/account` |
| `stretch` | `/(tabs)/home?mobility=1` (param stub only) |
| `#access_token=…` | oauth delegate |

### Shell gate coordination

Deep links must not navigate before `sessionResolved` and shell gate picks `(auth)` | `(onboarding)` | `(tabs)`. Queue URL or no-op until ready — prevents flash to tabs while signed out.

### File structure requirements

**Create:**

- `apps/mobile/lib/deepLinkRouter.ts`
- `apps/mobile/lib/deepLinkRouter.test.ts`
- `apps/mobile/hooks/useDeepLinkHandler.ts`

**Update:**

- `apps/mobile/app/_layout.tsx` — mount `useDeepLinkHandler`
- `docs/env-matrix.md` — document `newyouai://` scheme
- `_bmad-output/implementation-artifacts/sprint-status-rn-migration.yaml` — epic-rn-3 → done

### PWA reference

- `FitnessApp.tsx` — `navigate('stretch')`, URL param handling for mobility preview

### Previous story intelligence

- RN-3-04: settings `[panel]` route must exist for `settings/account` deep link
- RN-3-02: shell gate determines whether deep link to tabs is allowed
- RN-2-05: OAuth deep link edge cases — preserve cancel/error paths

### Testing requirements

```bash
npm run test --workspace=@newyouai/mobile   # deepLinkRouter Vitest (add vitest to mobile in this story)
npm run typecheck --workspace=@newyouai/mobile
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
```

Manual simulator:

```bash
xcrun simctl openurl booted "newyouai://settings/account"
xcrun simctl openurl booted "newyouai://home"
```

### Epic close checklist

- [ ] `rn-tab-navigation.yaml` green (tabs + FAB + log-food modal)
- [ ] `npm run test:e2e:auth-all` green
- [ ] Manual onboarding stub toggle (RN-3-02)
- [ ] Manual settings stack + deep link
- [ ] Mark `epic-rn-3` → `done` in sprint status

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Custom scheme routing stub | Universal links (RN-STORE) |
| OAuth coexistence | Marketing attribution |
| Unit tests for parser | Full stretch/mobility UI |

### References

- [architecture-rn-migration.md §3–4](../planning-artifacts/architecture-rn-migration.md)
- [sprint-rn-3-app-shell-plan.md](sprint-rn-3-app-shell-plan.md) RN-3-06 + epic close gates
- `apps/mobile/lib/authOAuth.ts`

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
