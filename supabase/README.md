# AquaTracker Server Push Setup

This project now supports real server-side Web Push notifications through Supabase. The existing localStorage data, manual export/import, and automatic local backups remain in place.

## Architecture

- Frontend: static PWA in `index.html`, `app.js`, `sw.js`.
- Local safety: existing `waterFilters`, `filterHistory`, export/import, and `BackupManager` remain untouched.
- Backend: Supabase Postgres plus Edge Functions.
- Scheduler: Supabase cron or any trusted scheduler calls `aquatracker-send-notifications`.
- Delivery: Web Push with VAPID keys.

## Files

- `supabase/migrations/202606220001_server_push_notifications.sql` creates profiles, filters, replacement logs, preferences, push subscriptions, and delivery logs.
- `supabase/functions/aquatracker-push-subscriptions/index.ts` stores or disables browser push subscriptions for the signed-in user.
- `supabase/functions/aquatracker-send-notifications/index.ts` checks active filters server-side and sends due reminders.
- `icons/` contains the generated app icon sizes, including `icon-180.png` for iOS Home Screen.

## Required Supabase setup

1. Create a Supabase project.
2. Enable anonymous sign-ins in Supabase Auth, or replace the frontend anonymous flow with your preferred login flow.
3. Run the migration:
   ```bash
   supabase db push
   ```
4. Deploy functions:
   ```bash
   supabase functions deploy aquatracker-push-subscriptions
   supabase functions deploy aquatracker-send-notifications --no-verify-jwt
   ```
5. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```
6. Set Edge Function secrets:
   ```bash
   supabase secrets set AQUATRACKER_VAPID_SUBJECT=mailto:you@example.com
   supabase secrets set AQUATRACKER_VAPID_PUBLIC_KEY=...
   supabase secrets set AQUATRACKER_VAPID_PRIVATE_KEY=...
   supabase secrets set AQUATRACKER_CRON_SECRET=choose-a-long-random-value
   ```
7. In the app Settings page, save:
   - Supabase URL
   - Supabase anon key
   - VAPID public key

## Scheduled worker

Call the function daily or hourly. Hourly is safer if you later add time-of-day preferences.

Example HTTP call:

```bash
curl -X POST \
  -H "x-cron-secret: $CRON_SECRET" \
  "https://YOUR_PROJECT.functions.supabase.co/aquatracker-send-notifications"
```

## Local data migration behavior

- The app calls the existing `BackupManager.performBackup()` before cloud migration.
- Local filters are upserted by `legacy_local_id`, so repeated syncs do not duplicate rows.
- Local history is upserted by `legacy_local_id`, so replacement logs are idempotent.
- LocalStorage stays available as an offline cache and recovery source.

## Notification states

The scheduled worker supports:

- `purchase-needed`: sent on the configured purchase lead day.
- `due-soon`: sent once per replacement cycle within the user preference window.
- `due-today`: sent once on the expected replacement date.
- `overdue`: sent at most once per local day until replacement.

`notification_delivery_log.dedupe_key` prevents duplicate sends.

## iOS PWA notes

- iOS Web Push requires a compatible iOS/iPadOS version and the PWA installed to the Home Screen.
- The user must grant notification permission from the installed PWA.
- Browser tabs that are not installed as PWAs may not receive push on iOS.

## Test checklist

- Export all data from Settings and verify the JSON contains filters/history.
- Save cloud config and run Sync Local Data twice; verify no duplicate database rows.
- Enable Server Push and confirm `push_subscriptions` has one active row.
- Run the scheduled function manually and verify `notification_delivery_log` entries.
- Move a test filter due date to today and confirm a push appears while the app is closed.
- Mark the filter replaced and verify the expected replacement date advances and old-cycle reminders stop.
- Disable Server Push and verify the subscription row becomes inactive.

## What goes where

- Browser/public config: SUPABASE_URL, SUPABASE_ANON_KEY, and VAPID_PUBLIC_KEY in config.local.js or deployment-generated runtime config.
- Server secrets: SUPABASE_SERVICE_ROLE_KEY, VAPID_PRIVATE_KEY, and CRON_SECRET in Supabase secrets only.
- Never put private keys in index.html, pp.js, manifest.json, or localStorage.

