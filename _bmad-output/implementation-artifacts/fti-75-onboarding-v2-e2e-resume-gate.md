# FTI-75 - Onboarding v2 E2E + resume gate

**Status:** done  
**Sprint:** 11  
**Branch:** `epic-fti-sprint-11/gymmy-onboarding-v2`

## Summary

Playwright coverage for Gymmy onboarding v2 happy path, draft resume on reload, and week calendar validation.

## Deliverables

- `e2e/onboarding-v2.spec.ts`
- `clearFitnessStorage` helper in `e2e/helpers/seed.ts`

## Tests

- Happy path (maintain): welcome → paywall → Home (`Today's plan`)
- Resume: advance to calendar, reload, same step + draft step label
- Week calendar: 2-day selection disables Continue; Pick for me restores valid 4-day spread

## Acceptance

- [x] E2E spec added
- [x] `npm test` + `npm run build` pass
