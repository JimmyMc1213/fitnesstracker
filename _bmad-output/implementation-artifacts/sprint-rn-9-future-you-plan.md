# Sprint RN-9 — Future You

**Planned:** 2026-06-12  
**Last updated:** 2026-06-12 (swarm-ready — all 9 story files created)  
**Epic:** `epic-rn-9`  
**Swarm branch:** `epic-rn-9/future-you`  
**Goal:** Replace the `(tabs)/future-you` placeholder with PWA-parity Future You — gallery, detail, upload (photo + consent + generate + poll), fullscreen viewer, replace/delete, report offensive, Home entry deep links with pro gating, App Store AI disclosures, and Maestro `rn-future-you-upload.yaml`.

**PRD:** [`prd-rn-migration.md`](../planning-artifacts/prd-rn-migration.md) FR-M7 (Future You)  
**Architecture:** [`architecture-rn-migration.md`](../planning-artifacts/architecture-rn-migration.md) §3 `(tabs)/future-you` + FAB  
**Epic spec:** [`epics-rn-migration.md`](../planning-artifacts/epics-rn-migration.md) RN-9 (9 stories)  
**Risk doc:** [`ai-transformation-photo-risks.md`](../planning-artifacts/ai-transformation-photo-risks.md)  
**PWA reference:** `FutureYouPageContent.tsx`, `FutureYouGalleryView.tsx`, `FutureYouDetailView.tsx`, `FutureYouNewPicView.tsx`, all `futureYou*Service.ts` / `futureYou*Model.ts`  
**Tracking:** [`sprint-status-rn-migration.yaml`](sprint-status-rn-migration.yaml)

---

## Sprint goal (one sentence)

An onboarded pro user opens Future You from the tab or Home entry, uploads a selfie with consent, generates and views their AI transformation in gallery/detail/fullscreen, can replace or delete it, report bad output, and Maestro `rn-future-you-upload.yaml` passes on simulator.

---

## BMad swarm alignment

| Field | Value |
|-------|--------|
| Swarm mode | `epic-rn-9` |
| Branch | `epic-rn-9/future-you` |
| Start story | **RN-9-01** (`rn-9-01-future-you-core-extract-tab-shell.md`) |
| Story files | Under `implementation-artifacts/rn-9-*.md` |
| Gate (every story) | `npm run typecheck --workspace=@newyouai/mobile` |
| Gate (logic stories) | `npm run test --workspace=@newyouai/core` when touching `packages/core` |
| Gate (api stories) | `npm run test --workspace=@newyouai/api-client` when touching `packages/api-client` |
| Gate (epic close) | `rn-future-you-upload.yaml` + `npm run test:e2e:auth-all` + `npm run test:e2e:tab-nav` + `npm run test:e2e:coach-nutrition` + `npm run test:e2e:onboarding` + `npm run test:e2e:workout-session` + `npm run test:e2e:nutrition-log` + `npm run test:e2e:progress` + `npm run test:e2e:sunday-check-in` green |

**Kickoff:** `/bmad-swarm epic-rn-9` or `dev this story rn-9-01-future-you-core-extract-tab-shell.md`

**Swarm order (strict):**

```
RN-9-01 → RN-9-02 → RN-9-03 → RN-9-04 → RN-9-05 → RN-9-06 → RN-9-07 → RN-9-08 → RN-9-09 → epic-rn-9-retrospective
```

---

## Starting point

| Item | Status | Notes |
|------|--------|-------|
| RN-0 … RN-8 | **Done** | Foundation through progress/check-ins complete |
| `(tabs)/future-you` | **Placeholder** | `TabPlaceholderScreen`; `testID="tab-future-you"` |
| Onboarding FY (RN-4) | **Done** | OB-10b photo, 10c motivation, generation start, paywall hero, 28b success |
| `packages/core/sync/futureYouDraft` | **Partial** | Draft merge only; page/gallery models still PWA + mobile dupes |
| `packages/api-client/invoke/futureYou` | **Done (RN-1-07)** | upload, generate, status, delete, report |
| Mobile `lib/futureYou*` | **Partial** | Onboarding services duplicated from PWA; not consolidated in core |
| Home FY entry | **Done (RN-5)** | Header button + skipper pill → `/(tabs)/future-you?openFutureYouUpload=1` |
| Generation pill (onboarding) | **Stub (RN-4)** | Poll/reveal minimal; full tab poll lands RN-9-03 |
| Maestro Future You | **Missing** | Trace expects `rn-future-you-upload.yaml` (RN-9-09) |
| App Store disclosures | **Spec only** | `ai-transformation-photo-risks.md`; UI in RN-9-04 + RN-9-09 |

---

## Execute in this order

| # | Story | Story file | PWA section | PR target | Status |
|---|-------|------------|-------------|-----------|--------|
| 1 | **RN-9-01** | `rn-9-01-future-you-core-extract-tab-shell.md` | Core models + tab shell | 1 PR | ready-for-dev |
| 2 | **RN-9-02** | `rn-9-02-gallery-view-tiles.md` | FY-01 gallery | 1 PR | ready-for-dev |
| 3 | **RN-9-03** | `rn-9-03-detail-poll-reveal.md` | FY-02 detail + poll | 1 PR | ready-for-dev |
| 4 | **RN-9-04** | `rn-9-04-upload-photo-consent.md` | FY-03 photo step | 1 PR | ready-for-dev |
| 5 | **RN-9-05** | `rn-9-05-upload-generate-poll.md` | FY-03 generate step | 1 PR | ready-for-dev |
| 6 | **RN-9-06** | `rn-9-06-fullscreen-viewer.md` | FY-04 fullscreen | 1 PR | ready-for-dev |
| 7 | **RN-9-07** | `rn-9-07-replace-delete.md` | FY-05 replace + delete | 1 PR | ready-for-dev |
| 8 | **RN-9-08** | `rn-9-08-report-home-gating.md` | FY-06 report + Home + pro gate | 1 PR | ready-for-dev |
| 9 | **RN-9-09** | `rn-9-09-maestro-e2e-polish.md` | Maestro + disclosures audit | 1 PR | ready-for-dev |
| 10 | Retro | `epic-rn-9-retrospective` | — | — | optional |

---

## RN-9-01 — Future You core extract + tab shell

**Story file:** `rn-9-01-future-you-core-extract-tab-shell.md`

**Deliverables:**

- Extract to `packages/core/src/future-you/` (PWA re-exports unchanged):
  - `futureYouPageModel.ts`, `futureYouGalleryModel.ts`, `homeFutureYouModel.ts`, `futureYouTimeline.ts`, `futureYouStatus.ts`, `futureYouHeroCopy.ts`, `futureYouUploadGuards.ts`, `futureYouGenerateGuards.ts`, `futureYouReportGuards.ts` + colocated Vitest
- Replace `(tabs)/future-you.tsx` placeholder with `FutureYouScreen` shell:
  - `ScreenHeader` + page view state machine (`gallery` | `detail` | `upload`)
  - Read `futureYou`, `onboardingProfile`, `subscriptionTier` from `FitnessProvider`
  - Empty gallery lede per `futureYouPageLede` / `getHomeFutureYouEntryMode`
  - Preserve `testID="tab-future-you"`
- Mobile `@/lib/homeFutureYouModel.ts` → re-export from core (delete duplicate logic)

**PWA ref:** `FutureYouPageContent.tsx` state setup (lines 73–120), `futureYouPageModel.ts`, `futureYouGalleryModel.ts`  
**Do not:** Upload UI, detail image load, Maestro (later stories)

**Story gate:** typecheck + `npm run test --workspace=@newyouai/core` + `npm run test --workspace=@newyouai/pwa` (re-export tests)

---

## RN-9-02 — Gallery view + tiles

**Story file:** `rn-9-02-gallery-view-tiles.md`

**Deliverables:**

- Port `FutureYouGalleryView` + `FutureYouNewChip`
- Gallery tiles from `buildFutureYouGalleryItem` / `shouldShowFutureYouGalleryTile`
- CTA: "Create your Future You" / redo lede when eligible (`futureYouPageRedoLede`, redo countdown)
- Tap tile → `detail` view + `selectedItemId`
- Under-18 / photo-blocked: blocked lede (not hidden tab)

**PWA ref:** `FutureYouGalleryView.tsx`, `FutureYouNewChip.tsx`  
**Do not:** Full upload flow (RN-9-04/05); poll/reveal image (RN-9-03)

---

## RN-9-03 — Detail view + generation poll + reveal image

**Story file:** `rn-9-03-detail-poll-reveal.md`

**Deliverables:**

- Port `FutureYouDetailView` with timeline + motivation label
- Wire `useFutureYouGenerationPoll` (upgrade RN-4 stub) + `useFutureYouRevealImage`
- Silhouette placeholder via `futureYouRevealPlaceholderImage` while generating
- Pro tier blur/gate on reveal image when `subscriptionTier !== "pro"` (match PWA paywall model)
- Back navigation gallery ↔ detail

**PWA ref:** `FutureYouDetailView.tsx`, `useFutureYouGenerationPoll.ts`, `useFutureYouRevealImage.ts`, `futureYouPaywallModel.ts`  
**Core ref:** Port `futureYouPaywallModel.ts`, `futureYouSilhouettes.ts` if not in RN-9-01

---

## RN-9-04 — Upload flow: photo, consent, compress, upload

**Story file:** `rn-9-04-upload-photo-consent.md`

**Deliverables:**

- Port `FutureYouNewPicView` step `"photo"` (camera + library via `expo-image-picker`)
- Consent checkbox + illustrative disclaimer copy per `ai-transformation-photo-risks.md`
- `compressImageToJpegDataUrl` mobile adapter (reuse RN-4 onboarding path)
- `uploadFutureYouPhoto` via `@newyouai/api-client`; persist draft via `mergeFutureYouDraft`
- Handle `openFutureYouUpload=1` route param from Home header / skipper pill
- Upload errors surfaced with retry + cancel

**PWA ref:** `FutureYouNewPicView.tsx`, `futureYouUploadService.ts`, `futureYouUploadGuards.ts`  
**Do not:** Start generation until RN-9-05 (OK to land on motivation step stub)

---

## RN-9-05 — Upload flow: generate, poll, complete

**Story file:** `rn-9-05-upload-generate-poll.md`

**Deliverables:**

- Upload step `"motivation"` for redo path (reuse motivation chips from onboarding or read draft)
- `startFutureYouGeneration` + inline poll until `ready` / `failed`
- `shouldPromptFutureYouReplaceDialog` → open replace dialog before overwrite (RN-9-07 implements dialog; stub Alert OK until then)
- On success: navigate to `detail` with new job; gallery tile updates
- Generation errors: retry affordance; never block tab exit

**PWA ref:** `FutureYouPageContent.tsx` upload/generate handlers, `futureYouGenerateService.ts`, `futureYouPollService.ts`  
**Story gate:** api-client tests if invoke touched

---

## RN-9-06 — Fullscreen viewer

**Story file:** `rn-9-06-fullscreen-viewer.md`

**Deliverables:**

- Port `FutureYouFullscreenViewer` (modal overlay from gallery or detail)
- Pinch/zoom optional; minimum: fullscreen image + close + swipe dismiss
- `testID="future-you-fullscreen-viewer"`

**PWA ref:** `FutureYouFullscreenViewer.tsx`  
**Pattern:** Match progress pics gallery fullscreen from RN-8-05

---

## RN-9-07 — Replace dialog + delete transformation

**Story file:** `rn-9-07-replace-delete.md`

**Deliverables:**

- Port `FutureYouReplaceDialog` + `FutureYouDeleteButton`
- `deleteFutureYou` via api-client; `onFutureYouDeleted` clears draft + returns to gallery
- Redo cooldown: `canRedoFutureYouTransformation`, `msUntilFutureYouRedoEligible` countdown in gallery lede
- Replace flow: delete then continue upload/generate

**PWA ref:** `FutureYouReplaceDialog.tsx`, `futureYouDeleteService.ts`, `futureYouDeleteModel.ts`, `futureYouPageModel.ts` redo helpers

---

## RN-9-08 — Report offensive + Home entry + pro gating polish

**Story file:** `rn-9-08-report-home-gating.md`

**Deliverables:**

- Port `FutureYouReportButton` + report flow (`futureYouReportService`)
- Report entry on detail view + post-upload success (PWA parity)
- Home entry polish:
  - Header button modes route correctly (upload vs reveal vs gallery)
  - Skipper reminder pill dismiss persist (already RN-5; verify with live tab)
- `futureYouLegal.ts` links (privacy / terms) in consent + detail footer
- Upgrade onboarding `FutureYouGenerationPill` to use shared poll hook from RN-9-03

**PWA ref:** `FutureYouReportButton.tsx`, `futureYouReportModel.ts`, `homeFutureYouModel.ts`, `futureYouLegal.ts`  
**Do not:** Real RevenueCat / StoreKit (RN-STORE); dev stub tier OK

---

## RN-9-09 — Maestro E2E + AI disclosure audit + epic polish

**Story file:** `rn-9-09-maestro-e2e-polish.md`

**Deliverables:**

- `.maestro/rn-future-you-upload.yaml` — onboarded pro user: tab → upload intent → photo (mock/skip camera in E2E if needed) → gallery/detail smoke
- `npm run test:e2e:future-you` script in `apps/mobile/package.json`
- E2E env: mock upload/generate if needed (`EXPO_PUBLIC_E2E_MOCK_FUTURE_YOU` — mirror PWA patterns)
- Disclosure audit checklist from `ai-transformation-photo-risks.md` (consent, 18+, illustrative disclaimer, delete path)
- Epic regression sweep: all existing Maestro flows green
- Remove all "ships in RN-9" placeholder copy

**PWA ref:** `apps/pwa/e2e/onboarding-paywall-future-you.spec.ts` (reference only — tab upload is new)  
**Test arch:** [`testarch-trace-rn-migration.md`](testarch-trace-rn-migration.md) FR-M7 row

**Story gate:** Maestro green + full regression green

---

## Scope locks

| In scope | Out of scope |
|----------|--------------|
| Full Future You tab MVP (gallery, detail, upload, viewer) | Real IAP / RevenueCat production (RN-STORE) |
| Report + delete + replace flows | Admin `/future-you` job monitor |
| Home header + skipper pill → live tab | Cloud sync hydration restore (RN-OFFLINE) |
| App Store AI disclosure UI copy | Privacy manifest + App Store Connect (RN-STORE) |
| Maestro `rn-future-you-upload.yaml` | Progress pics (RN-8 — separate pipeline) |
| Core extract of FY pure models/guards | Settings account delete wipe (RN-10; verify delete-user already wipes storage) |
| Pro tier gating on reveal (dev stub tier OK) | Auto-moderation / content ML |
| Onboarding generation pill upgrade | Push reminders for FY (RN-PUSH) |

---

## Maestro runbook (swarm / local)

**Prerequisites:** JDK 17+, dev client on simulator, onboarded pro user seed or E2E mock flags

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Terminal 1 — add mock flag when RN-9-09 lands
cd apps/mobile && EXPO_PUBLIC_E2E_MOCK_FUTURE_YOU=true npx expo start --dev-client --port 8082

# Terminal 2 — epic gate (RN-9-09)
npm run test:e2e:future-you
npm run test:e2e:auth-all
npm run test:e2e:tab-nav
npm run test:e2e:onboarding
npm run test:e2e:coach-nutrition
npm run test:e2e:workout-session
npm run test:e2e:nutrition-log
npm run test:e2e:progress
npm run test:e2e:sunday-check-in
```

**FY testing:** Seed must include `onboardingComplete: true`, `subscriptionTier: "pro"`, optional pre-seeded `futureYou.generationJobId` for detail/gallery cases. Reuse onboarding Maestro subflow or dedicated persist seed JSON.

---

## Quality gates

### Per story (blocking)

```bash
npm run typecheck --workspace=@newyouai/mobile
```

When touching `packages/core`:

```bash
npm run test --workspace=@newyouai/core
```

When touching `packages/api-client`:

```bash
npm run test --workspace=@newyouai/api-client
```

### Epic close (RN-9-09)

- [ ] `rn-future-you-upload.yaml` green
- [ ] Full Maestro regression suite green (see epic close gate above)
- [ ] Manual: upload from Home header opens upload view
- [ ] Manual: pro user sees unblurred reveal; non-pro sees gate
- [ ] Manual: delete removes gallery tile; report submits without crash
- [ ] AI disclosure checklist signed off against risk doc
- [ ] `epic-rn-9` → `done` in `sprint-status-rn-migration.yaml`

---

## Dev workflow (swarm)

1. Checkout / create branch `epic-rn-9/future-you`
2. Run `/bmad-create-story` for RN-9-01 if story file missing, then swarm or `dev this story rn-9-01-*.md` in order
3. One focused PR per story (epic bundle OK if swarm defaults)
4. `npm run typecheck --workspace=@newyouai/mobile` before story done
5. Update `sprint-status-rn-migration.yaml` story → `done`
6. RN-9-09: run FY Maestro + full regression + mark epic `done`

---

## Definition of done (epic)

1. Future You tab shows live gallery (not placeholder) with correct entry modes.
2. User uploads photo with consent, generates transformation, views in detail + fullscreen.
3. User can replace (with dialog), delete, and report offensive output.
4. Home header / skipper pill deep links open upload or reveal as appropriate.
5. Pro gating on reveal matches PWA paywall model.
6. App Store AI disclosure copy present at upload consent + detail.
7. Maestro `rn-future-you-upload.yaml` + full regression suite green.

---

## Unblocks

| Downstream | Needs from RN-9 |
|------------|-----------------|
| RN-STORE | FY disclosure UI + delete path for review checklist |
| RN-PARITY | FR-M7 trace row + Maestro evidence |
| RN-10 | Account delete should wipe FY storage (verify edge fn; settings UI RN-10) |
| RN-OFFLINE | `futureYou` draft merge shape stable in core |

---

## Risks

| Risk | Mitigation |
|------|------------|
| App Store AI rejection | Follow `ai-transformation-photo-risks.md`; RN-9-04 consent + RN-9-09 audit |
| Camera flaky in Maestro | `EXPO_PUBLIC_E2E_MOCK_FUTURE_YOU` mock upload path in RN-9-09 |
| Large PWA monolith port | Vertical slice stories; RN-9-01 core extract blocks semantics |
| Duplicate mobile/PWA FY libs | RN-9-01 consolidates to core; mobile re-exports |
| Generation poll battery drain | Poll only when tab active + detail/upload view (match PWA `active` prop) |
