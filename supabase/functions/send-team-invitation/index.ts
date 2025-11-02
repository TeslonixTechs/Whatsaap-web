import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  role: string;
  assistantId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { email, role, assistantId }: InvitationRequest = await req.json();

    console.log("Processing invitation for:", email, "role:", role, "assistant:", assistantId);

    // Generate unique token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to accept

    // Create invitation in database
    const { data: invitation, error: dbError } = await supabase
      .from("team_invitations")
      .insert({
        email,
        role,
        assistant_id: assistantId,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    console.log("Invitation created:", invitation.id);

    // Get assistant info
    const { data: assistant } = await supabase
      .from("assistants")
      .select("name")
      .eq("id", assistantId)
      .single();

    // Build invitation URL
    const invitationUrl = `${Deno.env.get("SUPABASE_URL")?.replace("/rest/v1", "")}/accept-invitation?token=${token}`;

    // Send email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "WhatsApp Assistant <onboarding@resend.dev>",
        to: [email],
        subject: `Invitación al equipo de ${assistant?.name || "WhatsApp Assistant"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Invitación al Equipo</h1>
            <p>Has sido invitado a unirte al equipo de <strong>${assistant?.name || "WhatsApp Assistant"}</strong> como <strong>${role}</strong>.</p>
            
            <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
            
            <a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
              Aceptar Invitación
            </a>
            
            <p style="color: #666; font-size: 14px;">Esta invitación expira en 7 días.</p>
            <p style="color: #666; font-size: 14px;">Si no esperabas esta invitación, puedes ignorar este correo.</p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.json();
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent:", emailData);

    return new Response(
      JSON.stringify({ success: true, invitationId: invitation.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-team-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
