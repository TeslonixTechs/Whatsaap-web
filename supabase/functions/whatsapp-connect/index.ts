import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // ✅ CORRECCIÓN: Manejar tanto POST como body de Supabase Functions
    let body;
    try {
      body = await req.json();
    } catch (e) {
      // Si no hay body JSON, intentar obtener de query params para GET
      const url = new URL(req.url);
      const assistantId = url.searchParams.get('assistantId');
      const action = url.searchParams.get('action');
      
      if (assistantId && action) {
        body = { assistantId, action };
      } else {
        throw new Error('No se pudo parsear el body de la solicitud');
      }
    }

    const { assistantId, action } = body;
    
    if (!assistantId || !action) {
      return new Response(
        JSON.stringify({ error: 'assistantId and action are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const WHATSAPP_SERVER_URL = Deno.env.get('WHATSAPP_SERVER_URL') || 'https://tamariki.es'

    if (action === 'init') {
      console.log(`[EDGE] Iniciando conexión WhatsApp para assistant: ${assistantId}`)
      
      const response = await fetch(`${WHATSAPP_SERVER_URL}/api/whatsapp/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Error iniciando WhatsApp')
      }

      const data = await response.json()
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'status') {
      console.log(`[EDGE] Verificando estado WhatsApp para assistant: ${assistantId}`)
      
      const response = await fetch(`${WHATSAPP_SERVER_URL}/api/whatsapp/status/${assistantId}`)

      if (!response.ok) {
        throw new Error('Error obteniendo estado')
      }

      const data = await response.json()
      
      if (data.status === 'ready') {
        await supabaseClient
          .from('assistants')
          .update({ 
            whatsapp_session_data: { status: 'ready', connectedAt: new Date().toISOString() },
            is_active: true 
          })
          .eq('id', assistantId)
      }
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'disconnect') {
      console.log(`[EDGE] Desconectando WhatsApp para assistant: ${assistantId}`)
      
      const response = await fetch(`${WHATSAPP_SERVER_URL}/api/whatsapp/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Error desconectando WhatsApp')
      }

      const { error: dbError } = await supabaseClient
        .from('assistants')
        .update({ 
          whatsapp_session_data: null,
          is_active: false 
        })
        .eq('id', assistantId)

      if (dbError) throw dbError

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in whatsapp-connect:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})