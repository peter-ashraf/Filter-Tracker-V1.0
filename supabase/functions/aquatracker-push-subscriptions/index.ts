import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Supabase environment is not configured" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: "Unauthorized" }, 401);
  }

  const user = userData.user;

  try {
    if (req.method === "POST") {
      const body = await req.json();
      const subscription = body.subscription;

      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return json({ error: "Invalid push subscription" }, 400);
      }

      const { error } = await supabase
        .schema("aquatracker").from("push_subscriptions")
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: body.userAgent ?? null,
          is_active: true,
          last_seen_at: new Date().toISOString(),
        }, { onConflict: "user_id,endpoint" });

      if (error) throw error;
      return json({ ok: true });
    }

    if (req.method === "DELETE") {
      const body = await req.json().catch(() => ({}));
      const endpoint = body.endpoint;
      if (!endpoint) return json({ error: "Missing endpoint" }, 400);

      const { error } = await supabase
        .schema("aquatracker").from("push_subscriptions")
        .update({ is_active: false, last_seen_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("endpoint", endpoint);

      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("push-subscriptions error", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
