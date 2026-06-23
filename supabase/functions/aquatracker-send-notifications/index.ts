import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

type Profile = { id: string; timezone: string | null };
type Preferences = {
  user_id: string;
  push_enabled: boolean;
  due_soon_days: number;
  overdue_cooldown_hours: number;
  purchase_cooldown_hours: number;
};
type Filter = {
  id: string;
  user_id: string;
  name: string;
  location: string | null;
  expected_replacement_date: string;
  purchase_reminder_lead_days: number;
  replacement_status: string;
  reminders_enabled: boolean;
  notification_settings: Record<string, any> | null;
};
type PushSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

type Candidate = {
  userId: string;
  filter: Filter;
  type: "purchase-needed" | "due-soon" | "due-today" | "overdue";
  targetDate: string;
  cycleKey: string;
  title: string;
  body: string;
  dedupeScope: "daily" | "cycle";
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function localDateParts(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    hour: Number(value("hour")),
  };
}

function diffDays(target: string, localDate: string) {
  const targetUtc = Date.parse(`${target}T00:00:00Z`);
  const localUtc = Date.parse(`${localDate}T00:00:00Z`);
  return Math.round((targetUtc - localUtc) / 86400000);
}

function locationSuffix(filter: Filter) {
  return filter.location ? ` at ${filter.location}` : "";
}

function buildCandidates(filter: Filter, prefs: Preferences, localDate: string): Candidate[] {
  if (!filter.reminders_enabled || filter.replacement_status === "disabled") return [];

  const settings = filter.notification_settings ?? {};
  const daysUntilDue = diffDays(filter.expected_replacement_date, localDate);
  const cycleKey = `${filter.id}:${filter.expected_replacement_date}`;
  const candidates: Candidate[] = [];

  const buyEnabled = settings.buyReminder?.enabled !== false;
  const replaceEnabled = settings.replaceReminder?.enabled !== false;
  const leadDays = Number(filter.purchase_reminder_lead_days ?? settings.buyReminder?.timing ?? 14);

  if (buyEnabled && daysUntilDue === leadDays && filter.replacement_status !== "purchased") {
    candidates.push({
      userId: filter.user_id,
      filter,
      type: "purchase-needed",
      targetDate: filter.expected_replacement_date,
      cycleKey,
      title: `Time to buy ${filter.name}`,
      body: `${filter.name}${locationSuffix(filter)} is due in ${leadDays} days. Order the replacement now.`,
      dedupeScope: "cycle",
    });
  }

  if (replaceEnabled && daysUntilDue > 0 && daysUntilDue <= prefs.due_soon_days) {
    candidates.push({
      userId: filter.user_id,
      filter,
      type: "due-soon",
      targetDate: filter.expected_replacement_date,
      cycleKey,
      title: `${filter.name} is due soon`,
      body: `${filter.name}${locationSuffix(filter)} is due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}.`,
      dedupeScope: "cycle",
    });
  }

  if (replaceEnabled && daysUntilDue === 0) {
    candidates.push({
      userId: filter.user_id,
      filter,
      type: "due-today",
      targetDate: filter.expected_replacement_date,
      cycleKey,
      title: `Replace ${filter.name} today`,
      body: `${filter.name}${locationSuffix(filter)} is due for replacement today.`,
      dedupeScope: "cycle",
    });
  }

  if (replaceEnabled && daysUntilDue < 0) {
    const overdueDays = Math.abs(daysUntilDue);
    candidates.push({
      userId: filter.user_id,
      filter,
      type: "overdue",
      targetDate: localDate,
      cycleKey,
      title: `${filter.name} is overdue`,
      body: `${filter.name}${locationSuffix(filter)} is ${overdueDays} day${overdueDays === 1 ? "" : "s"} overdue.`,
      dedupeScope: "daily",
    });
  }

  return candidates;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const cronSecret = Deno.env.get("AQUATRACKER_CRON_SECRET");
  if (cronSecret && req.headers.get("x-cron-secret") !== cronSecret) {
    return json({ error: "Forbidden" }, 403);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const vapidSubject = Deno.env.get("AQUATRACKER_VAPID_SUBJECT");
  const vapidPublicKey = Deno.env.get("AQUATRACKER_VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("AQUATRACKER_VAPID_PRIVATE_KEY");

  if (!supabaseUrl || !serviceRoleKey || !vapidSubject || !vapidPublicKey || !vapidPrivateKey) {
    return json({ error: "Missing required environment variables" }, 500);
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const now = new Date();

  const [{ data: profiles, error: profilesError }, { data: prefsRows, error: prefsError }, { data: filters, error: filtersError }, { data: subscriptions, error: subscriptionsError }] = await Promise.all([
    supabase.schema("aquatracker").from("profiles").select("id, timezone"),
    supabase.schema("aquatracker").from("notification_preferences").select("user_id, push_enabled, due_soon_days, overdue_cooldown_hours, purchase_cooldown_hours"),
    supabase.schema("aquatracker").from("filters").select("id, user_id, name, location, expected_replacement_date, purchase_reminder_lead_days, replacement_status, reminders_enabled, notification_settings").in("replacement_status", ["active", "purchased"]),
    supabase.schema("aquatracker").schema("aquatracker").from("push_subscriptions").select("id, user_id, endpoint, p256dh, auth").eq("is_active", true),
  ]);

  if (profilesError || prefsError || filtersError || subscriptionsError) {
    console.error({ profilesError, prefsError, filtersError, subscriptionsError });
    return json({ error: "Failed to load notification data" }, 500);
  }

  const prefsByUser = new Map<string, Preferences>();
  for (const pref of (prefsRows ?? []) as Preferences[]) prefsByUser.set(pref.user_id, pref);

  const subsByUser = new Map<string, PushSubscriptionRow[]>();
  for (const sub of (subscriptions ?? []) as PushSubscriptionRow[]) {
    const rows = subsByUser.get(sub.user_id) ?? [];
    rows.push(sub);
    subsByUser.set(sub.user_id, rows);
  }

  let considered = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const profile of (profiles ?? []) as Profile[]) {
    const prefs = prefsByUser.get(profile.id) ?? {
      user_id: profile.id,
      push_enabled: true,
      due_soon_days: 7,
      overdue_cooldown_hours: 24,
      purchase_cooldown_hours: 168,
    };
    if (!prefs.push_enabled) continue;

    const userSubs = subsByUser.get(profile.id) ?? [];
    if (!userSubs.length) continue;

    const { date: localDate } = localDateParts(now, profile.timezone ?? "UTC");
    const userFilters = ((filters ?? []) as Filter[]).filter((filter) => filter.user_id === profile.id);

    for (const filter of userFilters) {
      for (const candidate of buildCandidates(filter, prefs, localDate)) {
        considered += 1;
        const dedupeDate = candidate.dedupeScope === "daily" ? candidate.targetDate : filter.expected_replacement_date;
        const dedupeKey = `${candidate.userId}:${candidate.filter.id}:${candidate.type}:${dedupeDate}`;

        const { data: inserted, error: insertError } = await supabase
          .schema("aquatracker").from("notification_delivery_log")
          .insert({
            user_id: candidate.userId,
            filter_id: candidate.filter.id,
            notification_type: candidate.type,
            target_date: candidate.targetDate,
            cycle_key: candidate.cycleKey,
            dedupe_key: dedupeKey,
            title: candidate.title,
            body: candidate.body,
            status: "pending",
          })
          .select("id")
          .single();

        if (insertError) {
          if (insertError.code === "23505") skipped += 1;
          else {
            failed += 1;
            console.error("delivery insert failed", insertError);
          }
          continue;
        }

        const payload = JSON.stringify({
          title: candidate.title,
          body: candidate.body,
          icon: "icons/icon-192.png",
          badge: "icons/icon-192.png",
          tag: dedupeKey,
          data: {
            type: candidate.type,
            filterId: candidate.filter.id,
            url: `/?filter=${candidate.filter.id}`,
          },
          requireInteraction: candidate.type === "due-today" || candidate.type === "overdue",
          actions: [{ action: "view-filter", title: "View" }, { action: "dismiss", title: "Dismiss" }],
        });

        const results = [];
        for (const sub of userSubs) {
          try {
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
            sent += 1;
            results.push({ subscriptionId: sub.id, ok: true });
          } catch (error: any) {
            failed += 1;
            const statusCode = error?.statusCode;
            results.push({ subscriptionId: sub.id, ok: false, statusCode, message: error?.message });
            if (statusCode === 404 || statusCode === 410) {
              await supabase.schema("aquatracker").schema("aquatracker").from("push_subscriptions").update({ is_active: false }).eq("id", sub.id);
            }
          }
        }

        await supabase
          .schema("aquatracker").from("notification_delivery_log")
          .update({
            status: results.some((result) => result.ok) ? "sent" : "failed",
            sent_at: results.some((result) => result.ok) ? new Date().toISOString() : null,
            provider_response: results,
            error: results.some((result) => result.ok) ? null : "All push subscriptions failed",
          })
          .eq("id", inserted.id);
      }
    }
  }

  return json({ ok: true, considered, sent, skipped, failed });
});

