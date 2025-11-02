import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const { exportType, format } = await req.json();

    // Create export job
    const { data: job, error: jobError } = await supabaseClient
      .from("export_jobs")
      .insert({
        user_id: user.id,
        export_type: exportType,
        format: format,
        status: "pending",
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Fetch data based on type
    let data;
    let filename = `${exportType}_${new Date().toISOString()}.${format}`;

    switch (exportType) {
      case "conversations": {
        const { data: convData } = await supabaseClient
          .from("conversations")
          .select(`
            *,
            messages (*)
          `)
          .eq("assistant_id", (await supabaseClient
            .from("assistants")
            .select("id")
            .eq("user_id", user.id)
            .single()).data?.id || "");
        data = convData;
        break;
      }
      case "messages": {
        const { data: msgData } = await supabaseClient
          .from("messages")
          .select("*");
        data = msgData;
        break;
      }
      case "analytics": {
        const { data: analyticsData } = await supabaseClient
          .from("conversations")
          .select("*");
        data = analyticsData;
        break;
      }
      case "contacts": {
        const { data: contactsData } = await supabaseClient
          .from("conversations")
          .select("phone_number, started_at")
          .order("started_at", { ascending: false });
        data = contactsData;
        break;
      }
    }

    // Convert to requested format
    let fileContent: string;
    let contentType: string;

    if (format === "csv") {
      contentType = "text/csv";
      if (data && data.length > 0) {
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map((row: any) =>
          Object.values(row)
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
        );
        fileContent = [headers, ...rows].join("\n");
      } else {
        fileContent = "No data";
      }
    } else if (format === "json") {
      contentType = "application/json";
      fileContent = JSON.stringify(data, null, 2);
    } else {
      throw new Error("PDF export not yet implemented");
    }

    // For simplicity, we'll return the data directly
    // In production, you'd upload to storage and save the URL
    const blob = new Blob([fileContent], { type: contentType });
    
    // Update job status
    await supabaseClient
      .from("export_jobs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    // Create notification
    await supabaseClient
      .from("notifications")
      .insert({
        user_id: user.id,
        type: "export_complete",
        title: "Exportación completada",
        message: `Tu exportación de ${exportType} está lista para descargar`,
        data: { job_id: job.id },
      });

    return new Response(fileContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
