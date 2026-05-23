# Fitcoach, Product Requirements (summary)

**Project:** fitnesstracker  
**Product:** Fitcoach, mobile-first PWA personal fitness OS  
**Last updated:** 2026-05-21

---

## Product overview

**Positioning:** Fitcoach is the all-in-one fitness app that coaches you through every workout, meal, and check-in, so you never need another app to hit your goals.

Fitcoach is a **mobile PWA** for tracking workouts, nutrition, habits, and progress. It targets **multiple users** with Supabase auth and per-user cloud sync (not a single hardcoded profile). Coaching is rule-based and contextual today (`coach.ts`); AI session notes (FTI-13) are deferred until the voice is defined.

### Core capabilities

| Area | Description |
| --- | --- |
| **Onboarding** | New users configure goal, stats, activity, split, equipment, experience, units, and nutrition before entering the app |
| **Workouts** | Log sets/reps/weight, finish sessions, history, edit routines, rest timer, mid-workout swap |
| **Progress** | Weight log (optional photo), calendar, PR board, streaks, weekly summary |
| **Sync** | Local persist slice + Supabase JSONB payload with merge across devices |
| **UX** | Dark theme, tab navigation (Home, Workout, Progress, Settings), iOS PWA-safe layout |

### Users

- **New accounts:** onboarding flow → personalized templates and macro targets
- **Legacy / existing data:** skip onboarding (`VITE_LEGACY_USER_EMAILS`, existing fitness payload)
- **Offline / no Supabase:** demo seed for local-only dev

### Non-goals (Sprint 2)

- Native App Store wrapper, subscriptions / IAP (Sprint 3)
- Social features, coach marketplace
- FTI-13 AI coach API (Sprint 3+, extend rule-based coaching first)
- Automated test suite (gate is `npm run build` only)

---

## Authoritative backlog (Linear)

**Team:** Ftiness Tracker  
**Project key:** FTI  
**Linear workspace:** https://linear.app/ftiness-tracker

Detailed acceptance criteria, priorities, and status live in Linear. BMad story files and `sprint-status.yaml` mirror execution order; **Linear is source of truth** for scope changes.

| ID | Title | URL |
| --- | --- | --- |
| FTI-14 | New user onboarding, workout template selection + nutrition setup | https://linear.app/ftiness-tracker/issue/FTI-14/new-user-onboarding-workout-template-selection-nutrition-setup |
| FTI-15 | Save workouts and workout history | https://linear.app/ftiness-tracker/issue/FTI-15/save-workouts-and-workout-history |
| FTI-16 | Rebuild weigh-in, simple logging with optional progress photo | https://linear.app/ftiness-tracker/issue/FTI-16/rebuild-weigh-in-simple-logging-with-optional-progress-photo |
| FTI-17 | Clean up edit workout UI | https://linear.app/ftiness-tracker/issue/FTI-17/clean-up-edit-workout-ui |
| FTI-18 | Drag and drop lift effect on exercise reorder | https://linear.app/ftiness-tracker/issue/FTI-18/drag-and-drop-lift-effect-on-exercise-reorder |
| FTI-19 | Workout screen UI cleanup | https://linear.app/ftiness-tracker/issue/FTI-19/workout-screen-ui-cleanup |
| FTI-20 | Rest timer between sets | https://linear.app/ftiness-tracker/issue/FTI-20/rest-timer-between-sets |
| FTI-21 | Swap exercise mid-workout | https://linear.app/ftiness-tracker/issue/FTI-21/swap-exercise-mid-workout |
| FTI-22 | Personal records board | https://linear.app/ftiness-tracker/issue/FTI-22/personal-records-board |
| FTI-23 | Streak tracker | https://linear.app/ftiness-tracker/issue/FTI-23/streak-tracker |
| FTI-24 | Weekly summary card | https://linear.app/ftiness-tracker/issue/FTI-24/weekly-summary-card |
| FTI-25 | Unit preference (lbs/kg) in onboarding and settings | https://linear.app/ftiness-tracker/issue/FTI-25/unit-preference-lbskg-in-onboarding-and-settings |
| FTI-26 | Experience level selection in onboarding | https://linear.app/ftiness-tracker/issue/FTI-26/experience-level-selection-in-onboarding |
| FTI-27 | Equipment selection in onboarding | https://linear.app/ftiness-tracker/issue/FTI-27/equipment-selection-in-onboarding |
| FTI-28 | Notification setup screen in onboarding | https://linear.app/ftiness-tracker/issue/FTI-28/notification-setup-screen-in-onboarding |
| FTI-29 | Personalized home screen greeting post-onboarding | https://linear.app/ftiness-tracker/issue/FTI-29/personalized-home-screen-greeting-post-onboarding |
| FTI-30 | Estimated session time shown per split in onboarding | https://linear.app/ftiness-tracker/issue/FTI-30/estimated-session-time-shown-per-split-in-onboarding |
| FTI-31 | Animated macro rings on home dashboard | https://linear.app/ftiness-tracker/issue/FTI-31/animated-macro-rings-on-home-dashboard |
| FTI-32 | Water intake tracking | https://linear.app/ftiness-tracker/issue/FTI-32/water-intake-tracking |

**Sprint 1 (done):** FTI-15, FTI-25 → 26 → 27 → 14 → 16 → 19 → 17 → 18 → 20 → 21 → 22 → 23 → 24  
**Sprint 2 (active):** FTI-29 → 30 → 28 → 31 → 32 (see `epics.md` and `sprint-status.yaml`)  
**Backlog:** FTI-13 (AI coach notes per exercise)

---

## Success criteria (release)

- New user can complete onboarding and land on a configured home dashboard
- Workouts persist and appear in history and progress calendar
- Unit preference and profile fields sync via Supabase payload
- `npm run build` passes on main branch

---

## References

- Architecture: `planning-artifacts/architecture.md`
- Epics & stories: `planning-artifacts/epics.md`
- Sprint status: `implementation-artifacts/sprint-status.yaml`
- Implementation rules: `_bmad-output/project-context.md`
