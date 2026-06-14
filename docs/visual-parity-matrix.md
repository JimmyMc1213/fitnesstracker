# PWA → RN Visual Parity Matrix

Branch: `epic-rn-parity/visual-parity-home`  
Seed: `coach-nutrition` · Theme: dark · Frame: 393px  
Last updated: 2026-06-14

Legend: ✅ match · ⚠️ partial · ❌ gap · ⏭ deferred (intentional)

## Shell & navigation

| Area | PWA reference | RN file(s) | Visual | Functional | Notes |
|------|---------------|------------|--------|------------|-------|
| Tab order | Home → Nutrition → Workout → Progress → Settings (gear) → FY FAB | `TabBarDock.tsx`, `(tabs)/_layout.tsx` | ✅ | ✅ | Matches PWA order |
| Tab bar tokens | `.tabbar-*` in `index.css` | `futureYouTokens.ts`, `TabBarDock.tsx` | ✅ | ✅ | Prior branch work |
| Visual parity frame | phone ~393px centered | `_layout.tsx`, `visualParity.ts` | ✅ | ⚠️ | Auth bypass fixed — use `/home` or restart Metro after env change |
| Boot splash | animated | `BootSplash.tsx` | ✅ | ✅ | Skipped in visual-parity web frame |

## Home (`coach-nutrition`)

| Area | PWA reference | RN file(s) | Visual | Functional | Notes |
|------|---------------|------------|--------|------------|-------|
| Header + FY pill + settings gear | `FitnessApp.tsx` | `home.tsx`, `FutureYouSkipperReminderPill.tsx` | ✅ | ✅ | |
| Skipper reminder | PWA pill | `FutureYouSkipperReminderPill.tsx` | ✅ | ✅ | |
| Sunday card | Home sunday entry | `home.tsx` | ✅ | ✅ | |
| Weigh-in card | Home weigh-in | `home.tsx`, `WeighInSheet.tsx` | ✅ | ✅ | |
| Fuel/training carousel | `HomeDashboardCarousel.tsx` | `HomeDashboardCarousel.tsx` | ✅ | ✅ | REST focus tags use emoji on both PWA and RN |
| Mobility card | `IconMobilityRunner` | `HomeDailyHabitsCard.tsx` | ✅ | ✅ | Ported mask PNG + tint |
| Daily habit icons | `habitIcons.tsx` (Tabler/SVG) | `habitIcons.tsx`, `FitnessIcons.tsx` | ✅ | ✅ | **Fixed** — was emoji |
| Habit Edit mode | reorder + add + remove | `HomeDailyHabitsCard.tsx`, `AddHabitSheet.tsx` | ✅ | ✅ | **Fixed** — was label-only |
| Daily habits toggles | toggle + action rows | `HomeDailyHabitsCard.tsx` | ✅ | ✅ | Check/chev trailing icons ported |

## Nutrition (`nutrition-log` seed — not re-run this pass)

| Area | PWA reference | RN file(s) | Visual | Functional | Notes |
|------|---------------|------------|--------|------------|-------|
| Dashboard + macro rings | Nutrition OS | `(tabs)/nutrition.tsx` | ⚠️ | ⚠️ | Needs seed-specific audit |
| Water tracker icon | `IconDroplet` | `WaterTrackerCard.tsx` | ✅ | ✅ | **Fixed** — was 💧 emoji |
| Log-food modal | all tabs | `(modals)/log-food.tsx` | ⚠️ | ⚠️ | Barcode gate only — not fully audited |

## Workout (`workout-session` seed — not re-run this pass)

| Area | PWA reference | RN file(s) | Visual | Functional | Notes |
|------|---------------|------------|--------|------------|-------|
| Idle dashboard | `ScreenWorkout.tsx` | `(tabs)/workout.tsx` | ⚠️ | ⚠️ | Needs seed audit |
| History action sheet icons | `IconBolt`, `IconBook`, `IconTrash` | `WorkoutHistorySessionActionSheet.tsx` | ❌ | ✅ | Still emoji — port pending |
| Session card volume/PR | text + icons | `WorkoutHistorySessionCard.tsx` | ❌ | ✅ | 🏋/🏆 emoji — port pending |
| Active session flow | full stack | `app/workout/*` | ⚠️ | ⚠️ | Not audited this pass |

## Progress (`progress` seed — not re-run this pass)

| Area | PWA reference | RN file(s) | Visual | Functional | Notes |
|------|---------------|------------|--------|------------|-------|
| Weight chart + PR board | Progress tab | `(tabs)/progress.tsx` | ⚠️ | ⚠️ | Needs seed audit |
| Sunday check-in modal | 4 steps | `(modals)/sunday-check-in.tsx` | ⚠️ | ⚠️ | Not audited this pass |
| Sunday history bullets | ✅/🚨 emoji | `SundayCheckInHistorySection.tsx` | ✅ | ✅ | PWA also uses emoji here |
| PR section trophy | varies | `PersonalRecordsSection.tsx` | ⚠️ | ✅ | RN uses 🏆 — verify PWA |

## Settings

| Area | PWA reference | RN file(s) | Visual | Functional | Notes |
|------|---------------|------------|--------|------------|-------|
| Hub row icons | Tabler/custom SVG in 32×32 tile | `settings/index.tsx`, `SettingsRowIcon.tsx` | ✅ | ✅ | **Fixed** — was emoji/text |
| Social rows | Coming soon + brand SVG | `settings/index.tsx` | ⚠️ | ⚠️ | **Aligned to PWA** — coming soon; RN had live links (PWA wins) |
| Legal rows | Coming soon in PWA | `settings/index.tsx` | ⚠️ | ⚠️ | RN opens URLs; PWA shows coming soon — product question |
| All 13 panels | `ScreenSettings.tsx` | `settings/panels/*` | ⚠️ | ⚠️ | Hub done; panel internals not fully audited |
| Habits panel icons | SVG picker | `HabitsPanel.tsx` | ✅ | ✅ | **Fixed** |

## Future You (no API)

| Area | PWA reference | RN file(s) | Visual | Functional | Notes |
|------|---------------|------------|--------|------------|-------|
| Tab shell + empty gallery | FY tab | `(tabs)/future-you.tsx` | ⏭ | ⏭ | Deferred — no upload/generate |
| Home header entry | FY pill | `home.tsx` | ✅ | ✅ | Navigation only |

## Token & icon audit

| Item | Status | Notes |
|------|--------|-------|
| `packages/config/tokens.ts` vs PWA CSS vars | ⚠️ | Spot-check only; tabbar + macro colors aligned on prior work |
| `FitnessIcons.tsx` (RN) vs `icons.tsx` (PWA) | ✅ | Core set ported for habits, settings, water |
| `habitIcons.tsx` parity | ✅ | Matches PWA mapping |
| `IconMobilityRunner` | ✅ | PNG + tintColor |

## Tests run

| Gate | Result |
|------|--------|
| `npm run typecheck --workspace=@newyouai/mobile` | ✅ Pass |
| Maestro e2e bundle | ⏭ Not run this pass (requires simulator + Metro :8082) |

## Remaining gaps / questions

1. **Legal & social settings behavior** — PWA marks Terms/Privacy/Support/Socials as "Coming soon"; RN opens live URLs. Which is the shipping target?
2. **Workout history / food log / PR icons** — still emoji in several RN sheets; PWA uses `IconTrash`, `IconBolt`, etc.
3. **Tab-specific seeds** — nutrition-log, workout-session, progress, future-you screens need dedicated audit passes with matching seeds.
4. **iOS simulator pass** — fonts, safe areas, native sheets not verified yet.
5. **FY upload/generate** — intentionally skipped per scope.
