import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessDescription, industry, phoneNumber } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Cliente Supabase autenticado (el del usuario)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Obtener usuario autenticado
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    console.log("Generating AI configuration for:", { businessDescription, industry });

    // Llamada a Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Eres un experto en configurar asistentes de WhatsApp para negocios. 
Genera respuestas en español, útiles, claras y profesionales.`,
          },
          {
            role: "user",
            content: `Configura un asistente de WhatsApp para este negocio:

Descripción: ${businessDescription}
Industria: ${industry}

Genera:
1. Un nombre atractivo
2. Instrucciones para el bot
3. 5 FAQs
4. 3 respuestas automáticas
5. Mensaje de bienvenida

Formato JSON:
{
  "name": "...",
  "instructions": "...",
  "faqs": [{"question": "...", "answer": "..."}],
  "autoResponses": {
    "welcome": "...",
    "offHours": "...",
    "goodbye": "..."
  },
  "welcomeMessage": "..."
}`
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI API error: ${aiResponse.status} - ${errText}`);
    }

    const aiData = await aiResponse.json();
    console.log("Full AI response:", JSON.stringify(aiData, null, 2));
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error("Invalid AI response structure:", aiData);
      throw new Error("Invalid AI response structure");
    }
    
    let config;
    const message = aiData.choices[0].message;
    
    if (message.tool_calls && message.tool_calls.length > 0) {
      // Tool call response format
      config = JSON.parse(message.tool_calls[0].function.arguments);
    } else if (message.content) {
      // Regular text response - try to extract JSON
      try {
        const jsonMatch = message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          config = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in AI response");
        }
      } catch (e) {
        console.error("Failed to parse JSON from AI response:", message.content);
        throw new Error("Invalid JSON in AI response");
      }
    } else {
      throw new Error("No tool call or content found in AI response");
    }
    console.log("Generated config:", config);

    // ⚡ Usar la función SQL create_ai_assistant que bypasa RLS
    const { data: rpcResult, error: rpcError } = await supabaseClient.rpc("create_ai_assistant", {
      p_user_id: user.id,
      p_name: config.name,
      p_description: businessDescription,
      p_industry: industry,
      p_phone_number: phoneNumber ?? null,
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
      throw rpcError;
    }
    
    const assistant = rpcResult?.assistant;
    if (!assistant) {
      throw new Error("No se pudo crear el asistente");
    }

    // Insertar configuraciones adicionales (FAQs, autoResponses, etc.)
    if (config.faqs?.length > 0) {
      await supabaseClient.from("faqs").insert(
        config.faqs.map((faq: any, index: number) => ({
          assistant_id: assistant.id,
          question: faq.question,
          answer: faq.answer,
          order_index: index,
          is_active: true,
        }))
      );
    }

    if (config.autoResponses) {
      await supabaseClient.from("auto_responses").insert([
        { assistant_id: assistant.id, type: "welcome", message: config.autoResponses.welcome },
        { assistant_id: assistant.id, type: "off_hours", message: config.autoResponses.offHours },
        { assistant_id: assistant.id, type: "goodbye", message: config.autoResponses.goodbye },
      ]);
    }

    return new Response(
      JSON.stringify({ success: true, assistant, config }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

