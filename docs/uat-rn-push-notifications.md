# UAT — RN local push notifications (FR-M12)

Manual verification checklist for the `epic-rn-push` local notification epic. Run on iOS simulator or physical device with a **dev client** build (not Expo Go).

## Prerequisites

- Dev client installed (`npx expo run:ios` or EAS dev build)
- Onboarded test user (`onboardingComplete: true`)
- Metro: `npx expo start --dev-client --port 8082`
- Optional simulator grant: `xcrun simctl privacy booted grant notifications app.newyouai.mobile`

## Debug snippet (list scheduled notifications)

```javascript
import * as Notifications from "expo-notifications";
const all = await Notifications.getAllScheduledNotificationsAsync();
console.log(JSON.stringify(all, null, 2));
```

## Scenarios

| # | Scenario | Steps | Expected | Pass |
|---|----------|-------|----------|------|
| 1 | Onboarding opt-in | Enable workout or nutrition on OB-25 → **Set up notifications** → allow OS prompt → finish onboarding | Permission granted; scheduled notifications exist for enabled kinds | |
| 2 | Workout toggle off | Settings → Reminders → disable workout reminder | `fitcoach-workout` cancelled (not in scheduled list) | |
| 3 | Workout completed | Complete workout before reminder time on training day | No workout notification that day; `lastFiredWorkoutReminderDateKey` set or workout ID cancelled | |
| 4 | Nutrition logged | Log food before nutrition reminder time | No nutrition notification that day | |
| 5 | Permission denied | Deny OS prompt or revoke in iOS Settings | App stable; Settings shows blocked copy; toggles persist; no scheduled fitcoach IDs | |
| 6 | Reschedule time | Change workout or nutrition time in Settings → Reminders | Scheduled trigger hour/minute updates (re-check via debug snippet or wait for fire) | |
| 7 | Rest day | On Sunday (5-day default), with workout reminder enabled | Workout notification not scheduled while on rest day (sync cancels `fitcoach-workout`) | |
| 8 | Foreground reconcile | Set reminder time to current time + 1 min, background app, return to foreground | Optional immediate banner if due (PWA visibility parity) | |

### Time-test tip

Set reminder to **2 minutes from now**, background the app, wait for notification. Alternatively adjust simulator date/time in **Features → Time**.

## Sign-off

| Tester | Date | Build / commit | Result | Notes |
|--------|------|----------------|--------|-------|
| | | | Pass / Fail | |

## Out of scope (document only)

- Morning check-in and weekly review toggles (UI only; no scheduler in PWA or RN)
- Server-side APNs / cross-device push — see [deferred-apns-token-registry-spec.md](./deferred-apns-token-registry-spec.md)

## Automated evidence

- `packages/core/src/notifications/notificationScheduler.test.ts` (Vitest)
- Maestro: no dedicated push flow; epic regression via `npm run test:e2e:all`
