// Orienda Hospital — push notification dispatcher (Supabase Edge Function)
//
// HOW IT FITS THE FLOW:
//   1. A row is INSERTED into the `notifications` table.
//   2. The DB trigger `notify_notifications_insert` calls THIS function's URL,
//      sending the new row as `payload.record`.
//   3. This function finds each target patient's `onesignal_player_id` in
//      `profiles` and asks OneSignal to send the push.
//
// SECRETS (set in Supabase → Project Settings → Edge Functions, NOT in .env):
//   SUPABASE_URL                (provided automatically by Supabase)
//   SUPABASE_SERVICE_ROLE_KEY   (provided automatically by Supabase)
//   ONESIGNAL_APP_ID            (your app id: aa4ecaea-...)
//   ONESIGNAL_API_KEY           (REST API key, new "os_v2_app_..." format)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// App ID is public (shipped to the browser), so a hardcoded fallback is fine
// and avoids depending on a secret that's easy to mistype.
const ONESIGNAL_APP_ID =
  Deno.env.get("ONESIGNAL_APP_ID") ?? "aa4ecaea-dbe1-4520-b063-73ab39efe4f6";
const ONESIGNAL_API_KEY = Deno.env.get("ONESIGNAL_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// Shape of one row from the `notifications` table.
type NotificationRow = {
  id: string;
  audience: string | null;
  category: string | null;
  feature: string | null;
  source_type: string | null;
  source_id: string | null;
  title: string | null;
  body: string | null;
  data: unknown;
  created_at: string;
  user_id: string[] | null;
};

/**
 * Work out WHICH patients should receive this notification.
 * - If the row already lists `user_id`s → send only to them (personal push).
 * - Otherwise expand by `audience` using `profiles.user_type` (broadcast).
 *   Orienda only needs "customer" (patients) and "admin".
 */
async function resolveUserIds(n: NotificationRow): Promise<string[]> {
  // Case 1: explicit recipients on the row.
  if (Array.isArray(n.user_id) && n.user_id.length > 0) {
    return Array.from(
      new Set(n.user_id.map((v) => String(v).trim()).filter((v) => v.length > 0)),
    );
  }

  // Case 2: broadcast to an audience.
  // Notifications use hospital-friendly audience words; the senior's
  // profiles.user_type uses its own values — map between them here so we
  // never have to change that table.
  const AUDIENCE_TO_USER_TYPE: Record<string, string> = {
    patient: "Customer", // hospital term -> existing profiles.user_type value
    customer: "Customer", // backwards-compatible with older rows
    admin: "admin",
  };
  const audience = String(n.audience ?? "patient").toLowerCase();
  const userType = AUDIENCE_TO_USER_TYPE[audience] ?? audience;
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("user_type", userType);
  if (error) throw error;
  return (data ?? []).map((p: { id: string }) => p.id);
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Guard: confirm the OneSignal secrets are actually visible to the function.
    if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
      const msg =
        `Missing secrets — ONESIGNAL_APP_ID set: ${Boolean(ONESIGNAL_APP_ID)}, ` +
        `ONESIGNAL_API_KEY set: ${Boolean(ONESIGNAL_API_KEY)}`;
      console.error(msg);
      return new Response(msg, { status: 500 });
    }

    const payload = await req.json();
    const n = payload.record as NotificationRow | undefined;

    if (!n || !n.id) {
      return new Response("Missing notification record", { status: 400 });
    }
    if (!n.title || !n.body) {
      return new Response("No title/body, skipping push", { status: 200 });
    }

    // 1. Who gets it.
    const userIds = await resolveUserIds(n);

    // 2. Look up each recipient's stored OneSignal id from `profiles`.
    //    A 36-char UUID (with dashes) = web subscription_id; anything else = mobile player_id.
    const subscriptionIds: string[] = [];
    const playerIds: string[] = [];

    if (userIds.length > 0) {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, onesignal_player_id")
        .in("id", userIds);
      if (error) throw error;

      for (const p of (profiles ?? []) as { onesignal_player_id: string | null }[]) {
        const id = (p.onesignal_player_id ?? "").trim();
        if (!id) continue;
        if (id.length === 36 && id.includes("-")) subscriptionIds.push(id);
        else playerIds.push(id);
      }
    }

    if (userIds.length === 0 && subscriptionIds.length === 0 && playerIds.length === 0) {
      console.log("notifications-dispatch: no recipients for", n.audience);
      return new Response("No recipients", { status: 200 });
    }

    // 3. Extra data delivered alongside the push (handy for deep-linking in the app).
    const additionalData: Record<string, unknown> = {
      notification_id: n.id,
      audience: n.audience,
      category: n.category,
      feature: n.feature,
      source_type: n.source_type,
      source_id: n.source_id,
      ...(typeof n.data === "object" && n.data !== null
        ? (n.data as Record<string, unknown>)
        : {}),
    };

    // 4. Build the OneSignal request. Only include targeting fields that have
    //    values — OneSignal rejects empty targeting arrays.
    const oneSignalPayload: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      target_channel: "push",
      headings: { en: n.title },
      contents: { en: n.body },
      data: additionalData,
    };
    // Deep-link: clicking the push opens this URL (set by the publish hook).
    const clickUrl = (n.data as { url?: unknown } | null)?.url;
    if (typeof clickUrl === "string" && clickUrl) {
      oneSignalPayload.url = clickUrl;
    }

    // external_id works once the web client calls OneSignal.login(profileId).
    if (userIds.length > 0) oneSignalPayload.include_aliases = { external_id: userIds };
    if (subscriptionIds.length > 0) oneSignalPayload.include_subscription_ids = subscriptionIds;
    if (playerIds.length > 0) oneSignalPayload.include_player_ids = playerIds;

    // 5. Send it. New "os_v2_app_..." keys use the "Key" auth scheme.
    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify(oneSignalPayload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("OneSignal error:", res.status, text);
      // Surface the real reason so it shows up in the pg_net response log.
      return new Response(`OneSignal error ${res.status}: ${text}`, { status: 500 });
    }

    console.log(
      "notifications-dispatch: sent",
      "external_ids=", userIds.length,
      "subscription_ids=", subscriptionIds.length,
      "player_ids=", playerIds.length,
    );
    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("notifications-dispatch error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
