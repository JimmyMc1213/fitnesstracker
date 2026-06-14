# Deferred — APNs token registry (post-MVP)

**Status:** Not in MVP. Local scheduled notifications ship in RN-PUSH; this spec describes an optional adapter for cross-device push later.

## Problem

`expo-notifications` local schedules fire only on the device where they were created. Users with multiple devices or reinstalls do not receive server-initiated reminders unless tokens are registered server-side.

## Adapter-only scope

Do **not** change fitness payload schema (`fitness_user_data`, nutrition, workouts). Add a separate table and Edge Functions only.

### Suggested table: `push_device_tokens`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → auth.users |
| `apns_token` | text | Hex token from native client |
| `platform` | text | `ios` \| `android` |
| `updated_at` | timestamptz | Last registration |
| `revoked_at` | timestamptz | Nullable; set on sign-out |

Unique constraint on `(user_id, apns_token)` or `(user_id, platform)` depending on product rule.

## Edge Functions (sketch)

### `register-push-token`

- **Auth:** Supabase JWT required
- **Body:** `{ token: string, platform: "ios" | "android" }`
- **Action:** Upsert row for `user_id`

### `unregister-push-token`

- **Auth:** Supabase JWT required
- **Body:** `{ token?: string }` — omit token to revoke all for user
- **Action:** Set `revoked_at` or delete rows

## Client hook (future epic)

After local notifications ship (RN-PUSH) and App Store submission (RN-STORE):

1. On permission grant + sign-in, call `Notifications.getDevicePushTokenAsync()` (or Expo push token if using FCM/APNs bridge).
2. POST to `register-push-token`.
3. On sign-out, call `unregister-push-token`.

## References

- [pwa-to-react-native-migration-research.md](../_bmad-output/planning-artifacts/research/pwa-to-react-native-migration-research.md) §7 backend gap
- PRD FR-M12: local notifications first; server push optional post-MVP

**Explicit:** No implementation in RN-PUSH, RN-STORE, or RN-PARITY epics unless product re-prioritizes.
