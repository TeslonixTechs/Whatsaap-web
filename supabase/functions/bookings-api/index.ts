import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const apiKey = req.headers.get("x-api-key");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify API key (stored in assistant config)
    const { data: config } = await supabase
      .from("assistant_config")
      .select("assistant_id, config_value")
      .eq("config_key", "api_key")
      .eq("config_value", JSON.stringify(apiKey))
      .maybeSingle();

    if (!config) {
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const assistantId = config.assistant_id;
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);

    // Routes
    if (req.method === "GET" && pathParts.length === 2) {
      // GET /bookings-api/bookings
      return await getBookings(supabase, assistantId, url.searchParams);
    }

    if (req.method === "GET" && pathParts.length === 3) {
      // GET /bookings-api/bookings/{id}
      const bookingId = pathParts[2];
      return await getBooking(supabase, assistantId, bookingId);
    }

    if (req.method === "POST" && pathParts.length === 2) {
      // POST /bookings-api/bookings
      const body = await req.json();
      return await createBooking(supabase, assistantId, body);
    }

    if (req.method === "PATCH" && pathParts.length === 3) {
      // PATCH /bookings-api/bookings/{id}
      const bookingId = pathParts[2];
      const body = await req.json();
      return await updateBooking(supabase, assistantId, bookingId, body);
    }

    if (req.method === "POST" && pathParts.length === 4 && pathParts[3] === "status") {
      // POST /bookings-api/bookings/{id}/status
      const bookingId = pathParts[2];
      const body = await req.json();
      return await updateStatus(supabase, assistantId, bookingId, body.status);
    }

    if (req.method === "DELETE" && pathParts.length === 3) {
      // DELETE /bookings-api/bookings/{id}
      const bookingId = pathParts[2];
      return await deleteBooking(supabase, assistantId, bookingId);
    }

    return new Response(
      JSON.stringify({ error: "Route not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getBookings(supabase: any, assistantId: string, params: URLSearchParams) {
  let query = supabase
    .from("bookings")
    .select("*")
    .eq("assistant_id", assistantId)
    .order("start_time", { ascending: true });

  if (params.get("status")) {
    query = query.eq("status", params.get("status"));
  }

  if (params.get("start_date")) {
    query = query.gte("start_time", params.get("start_date"));
  }

  if (params.get("end_date")) {
    query = query.lte("start_time", params.get("end_date"));
  }

  const { data, error } = await query;

  if (error) throw error;

  return new Response(
    JSON.stringify({ bookings: data }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getBooking(supabase: any, assistantId: string, bookingId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("assistant_id", assistantId)
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ booking: data }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function createBooking(supabase: any, assistantId: string, body: any) {
  // Validate required fields
  if (!body.customer_phone || !body.service_type || !body.start_time || !body.end_time) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      assistant_id: assistantId,
      customer_phone: body.customer_phone,
      customer_name: body.customer_name || null,
      service_type: body.service_type,
      start_time: body.start_time,
      end_time: body.end_time,
      status: body.status || "pending",
      price: body.price || null,
      notes: body.notes || null,
      external_id: body.external_id || null,
      metadata: body.metadata || {},
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ booking: data }),
    { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function updateBooking(supabase: any, assistantId: string, bookingId: string, body: any) {
  const updateData: any = {};

  if (body.customer_phone) updateData.customer_phone = body.customer_phone;
  if (body.customer_name !== undefined) updateData.customer_name = body.customer_name;
  if (body.service_type) updateData.service_type = body.service_type;
  if (body.start_time) updateData.start_time = body.start_time;
  if (body.end_time) updateData.end_time = body.end_time;
  if (body.status) updateData.status = body.status;
  if (body.price !== undefined) updateData.price = body.price;
  if (body.notes !== undefined) updateData.notes = body.notes;
  if (body.metadata) updateData.metadata = body.metadata;

  const { data, error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .eq("assistant_id", assistantId)
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ booking: data }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function updateStatus(supabase: any, assistantId: string, bookingId: string, status: string) {
  if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
    return new Response(
      JSON.stringify({ error: "Invalid status" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .eq("assistant_id", assistantId)
    .select()
    .single();

  if (error) throw error;

  // Check for notification triggers
  await checkAndTriggerNotifications(supabase, data);

  return new Response(
    JSON.stringify({ booking: data }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function deleteBooking(supabase: any, assistantId: string, bookingId: string) {
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId)
    .eq("assistant_id", assistantId);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
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
      let message = trigger.message_template;
      message = message.replace(/\{\{customer_name\}\}/g, booking.customer_name || "Cliente");
      message = message.replace(/\{\{customer_phone\}\}/g, booking.customer_phone);
      message = message.replace(/\{\{service_type\}\}/g, booking.service_type);
      message = message.replace(/\{\{price\}\}/g, booking.price ? `€${booking.price}` : "");

      // TODO: Send WhatsApp message via WhatsApp Business API
      console.log("✅ Sending notification:", message, "to", booking.customer_phone);
    }
  }
}
