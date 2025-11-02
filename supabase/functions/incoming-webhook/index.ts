import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const url = new URL(req.url);
  const webhookPath = url.pathname.split("/").pop();
  
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get webhook config
    const { data: webhook, error: webhookError } = await supabase
      .from("incoming_webhooks")
      .select("*")
      .eq("webhook_url", webhookPath)
      .eq("is_active", true)
      .maybeSingle();

    if (webhookError || !webhook) {
      return new Response(
        JSON.stringify({ error: "Webhook not found or inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature
    const signature = req.headers.get("x-webhook-signature");
    const expectedSignature = req.headers.get("x-webhook-secret");
    
    if (signature !== webhook.secret_key && expectedSignature !== webhook.secret_key) {
      await supabase.from("incoming_webhook_logs").insert({
        webhook_id: webhook.id,
        payload: {},
        headers: Object.fromEntries(req.headers),
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
        status: "invalid_signature",
        error_message: "Invalid webhook signature",
        processing_time_ms: Date.now() - startTime,
      });

      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse payload
    const payload = await req.json();

    // Validate required fields
    if (!payload.action || !payload.data) {
      throw new Error("Missing required fields: action and data");
    }

    // Process based on action
    let result;
    switch (payload.action) {
      case "booking_created":
      case "booking_updated":
        result = await handleBookingUpdate(supabase, webhook.assistant_id, payload.data);
        break;
      case "status_changed":
        result = await handleStatusChange(supabase, payload.data);
        break;
      default:
        throw new Error(`Unknown action: ${payload.action}`);
    }

    // Update webhook stats
    await supabase
      .from("incoming_webhooks")
      .update({
        last_trigger: new Date().toISOString(),
        total_calls: webhook.total_calls + 1,
      })
      .eq("id", webhook.id);

    // Log success
    await supabase.from("incoming_webhook_logs").insert({
      webhook_id: webhook.id,
      payload,
      headers: Object.fromEntries(req.headers),
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
      status: "success",
      processing_time_ms: Date.now() - startTime,
    });

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleBookingUpdate(supabase: any, assistantId: string, data: any) {
  const bookingData = {
    assistant_id: assistantId,
    customer_phone: data.customer_phone,
    customer_name: data.customer_name || null,
    service_type: data.service_type,
    start_time: data.start_time,
    end_time: data.end_time,
    status: data.status || "pending",
    price: data.price || null,
    notes: data.notes || null,
    external_id: data.external_id || null,
  };

  // Check if booking exists by external_id
  if (data.external_id) {
    const { data: existing } = await supabase
      .from("bookings")
      .select("id")
      .eq("external_id", data.external_id)
      .maybeSingle();

    if (existing) {
      // Update
      const { error } = await supabase
        .from("bookings")
        .update(bookingData)
        .eq("id", existing.id);

      if (error) throw error;
      return { action: "updated", booking_id: existing.id };
    }
  }

  // Create new
  const { data: newBooking, error } = await supabase
    .from("bookings")
    .insert(bookingData)
    .select()
    .single();

  if (error) throw error;
  return { action: "created", booking_id: newBooking.id };
}

async function handleStatusChange(supabase: any, data: any) {
  if (!data.booking_id && !data.external_id) {
    throw new Error("booking_id or external_id required");
  }

  if (!data.status) {
    throw new Error("status required");
  }

  let query = supabase.from("bookings").update({ status: data.status });

  if (data.booking_id) {
    query = query.eq("id", data.booking_id);
  } else {
    query = query.eq("external_id", data.external_id);
  }

  const { error, data: updated } = await query.select().single();

  if (error) throw error;

  // Check for notification triggers
  await checkAndTriggerNotifications(supabase, updated);

  return { action: "status_changed", booking: updated };
}

async function checkAndTriggerNotifications(supabase: any, booking: any) {
  // Verificar si existe conversación activa (últimas 24h)
  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, started_at")
    .eq("phone_number", booking.customer_phone)
    .eq("assistant_id", booking.assistant_id)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!conversation) {
    console.log("No active conversation found for", booking.customer_phone, "- notification skipped");
    return;
  }

  const hoursSinceLastMessage = (Date.now() - new Date(conversation.started_at).getTime()) / (1000 * 60 * 60);
  if (hoursSinceLastMessage > 24) {
    console.log("24h window expired for", booking.customer_phone, "- notification skipped");
    return;
  }

  const { data: triggers } = await supabase
    .from("notification_triggers")
    .select("*")
    .eq("assistant_id", booking.assistant_id)
    .eq("is_active", true)
    .eq("trigger_type", "status_change");

  if (!triggers || triggers.length === 0) return;

  for (const trigger of triggers) {
    if (trigger.trigger_config?.target_status === booking.status) {
      // Replace template variables
      let message = trigger.message_template;
      message = message.replace(/\{\{customer_name\}\}/g, booking.customer_name || "Cliente");
      message = message.replace(/\{\{customer_phone\}\}/g, booking.customer_phone);
      message = message.replace(/\{\{service_type\}\}/g, booking.service_type);
      message = message.replace(/\{\{price\}\}/g, booking.price ? `€${booking.price}` : "");

      // TODO: Send WhatsApp message here via WhatsApp Business API
      console.log("✅ Sending notification:", message, "to", booking.customer_phone);
    }
  }
}
