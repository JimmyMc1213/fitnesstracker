---
name: RN-4-09 Launch plan ready OB-23-26
epic: RN-4
story: 09
status: ready-for-dev
swarm_order: 9
swarm_branch: epic-rn-4/onboarding-v2
---

# Story 4.09: Launch screens through plan ready (OB-23–26)

Status: done

## Story

**As a** user in the launch phase  
**I want** split summary, notification preferences, and plan ready teaser  
**So that** I understand my plan before paywall

## Acceptance Criteria

1. **Given** step 23, **When** split summary renders, **Then** copy matches PWA "Here's your training plan" with template summary
2. **Given** step 24–25, **When** notification prompt + picker complete, **Then** prefs saved to draft (`NotificationPreferences`) — **no OS scheduling yet**
3. **Given** step 26 plan ready, **When** rendered, **Then** macro/split numbers match step 21 targets (plan consistency)
4. **Given** Future You ready during launch phase, **When** on eligible screen, **Then** ready banner may show (`FutureYouReadyBanner` — port or stub)
5. **Given** step 26 Continue, **When** tapped, **Then** advance to paywall step (`ONBOARDING_STEP_PAYWALL` = 27)

## Tasks / Subtasks

- [x] Port step 23 split summary screen (AC: 1)
- [x] Port `OnboardingNotificationPrompt` + `NotificationPreferencesPicker` (AC: 2)
  - [x] Request permission optional — store prefs only; RN-PUSH schedules later
- [x] Port `OnboardingPlanReady.tsx` with locked Future You teaser (AC: 3–4)
  - [x] Use `onboardingPlanSnapshot` / shared snapshot helper from core if extracted
- [x] Wire steps 23–26; Continue from 26 → paywall
- [x] Run typecheck

## Dev Notes

### PWA reference

- Steps 23–26 in `OnboardingFlow.tsx` (~1485–1558)
- `OnboardingPlanReady.tsx`, `OnboardingNotificationPrompt.tsx`
- `notificationPreferences.ts`, `onboardingPlanSnapshot.ts`

Phase: **Launch** from step 24 through success/paywall.

### Previous story intelligence (RN-4-08)

- Macro targets finalized on step 21 — plan ready must read same draft fields
- Future You generation pill visible steps 11–28 per spec

### Anti-patterns

- **Do not** schedule notifications (RN-PUSH)
- **Do not** drift macro numbers between 26 and 28 — single snapshot source

### Testing requirements

```bash
npm run typecheck --workspace=@newyouai/mobile
```

Manual: compare macro ring numbers on 26 vs draft JSON.

### Scope locks

| In scope | Out of scope |
|----------|--------------|
| Notification UI + prefs persist | APNs + scheduler |
| Plan ready teaser | Paywall IAP (RN-4-10) |

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
