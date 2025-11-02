import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessDescription, industry } = await req.json();
    
    if (!businessDescription) {
      throw new Error('Business description is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prompt personalizado según la industria
    const systemPrompt = `Eres un experto en crear preguntas frecuentes (FAQs) para asistentes de WhatsApp Business.
Tu tarea es generar preguntas frecuentes relevantes y sus respuestas basándote en la descripción del negocio.

Las FAQs deben:
- Ser específicas para el tipo de negocio
- Incluir preguntas sobre horarios, servicios, precios, ubicación, contacto
- Para empresas de transporte/paquetería: incluir preguntas sobre seguimiento, tiempos de entrega, zonas de cobertura
- Para inmobiliarias: incluir preguntas sobre disponibilidad, visitas, documentación
- Ser claras y concisas
- Tener un tono profesional pero amigable

Devuelve EXACTAMENTE 8-12 pares de pregunta-respuesta en formato JSON:
{
  "faqs": [
    {
      "question": "¿Pregunta?",
      "answer": "Respuesta detallada..."
    }
  ]
}`;

    const userPrompt = `Negocio: ${businessDescription}
Industria: ${industry || 'General'}

Genera las FAQs más relevantes para este negocio.`;

    console.log('Calling Lovable AI to generate FAQs...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Response received');

    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Extraer JSON del contenido (puede venir con markdown)
    let faqsData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        faqsData = JSON.parse(jsonMatch[0]);
      } else {
        faqsData = JSON.parse(content);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!faqsData.faqs || !Array.isArray(faqsData.faqs)) {
      throw new Error('Invalid FAQs format from AI');
    }

    return new Response(
      JSON.stringify({ faqs: faqsData.faqs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-faqs function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
