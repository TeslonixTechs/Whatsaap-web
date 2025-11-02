import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = "";
    let tools: any[] = [];

    if (type === "suggest") {
      systemPrompt = "Eres un experto en atención al cliente via WhatsApp. Analiza las conversaciones y sugiere mejoras específicas para las respuestas automáticas, FAQs, y flujos de trabajo.";
      tools = [
        {
          type: "function",
          function: {
            name: "suggest_improvements",
            description: "Sugiere mejoras para el asistente de WhatsApp",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string", enum: ["faq", "response", "workflow", "intent"] },
                      title: { type: "string" },
                      description: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                    },
                    required: ["category", "title", "description", "priority"],
                  },
                },
              },
              required: ["suggestions"],
            },
          },
        },
      ];
    } else if (type === "analyze") {
      systemPrompt = "Eres un analista de datos especializado en métricas de atención al cliente. Analiza los datos y proporciona insights accionables.";
    } else {
      systemPrompt = "Eres un asistente inteligente que ayuda a optimizar la atención al cliente via WhatsApp.";
    }

    const body: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    };

    if (tools.length > 0) {
      body.tools = tools;
      body.tool_choice = { type: "function", function: { name: "suggest_improvements" } };
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data));

    // Extract suggestions from tool call or regular response
    let result = data.choices[0].message;

    if (result.tool_calls && result.tool_calls[0]) {
      const toolCall = result.tool_calls[0];
      const suggestions = JSON.parse(toolCall.function.arguments);
      result = suggestions;
    } else {
      result = { content: result.content };
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in ai-assistant:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
