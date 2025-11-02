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
    const url = new URL(req.url)
    const assistantId = url.searchParams.get('assistantId')
    if (!assistantId) {
      return new Response('assistantId is required', { status: 400, headers: corsHeaders })
    }

    const WHATSAPP_SERVER_URL = Deno.env.get('WHATSAPP_SERVER_URL') || 'https://tamariki.es'

    // Obtener estado actual (incluye QR en base64 si existe)
    const resp = await fetch(`${WHATSAPP_SERVER_URL}/api/whatsapp/status/${assistantId}`)
    if (!resp.ok) {
      return new Response('Failed to fetch status', { status: 502, headers: corsHeaders })
    }
    const data = await resp.json()

    const rawQr = data?.qr || data?.qrCode
    if (!rawQr) {
      // No hay QR disponible ahora mismo
      return new Response('No QR', { status: 204, headers: corsHeaders })
    }

    // Normalizar y decodificar base64 → binario PNG
    const base64 = typeof rawQr === 'string' && rawQr.startsWith('data:')
      ? rawQr.split(',')[1] ?? ''
      : String(rawQr)

    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))

    return new Response(bytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (e) {
    console.error('whatsapp-qr error:', e)
    const msg = e instanceof Error ? e.message : 'unknown error'
    return new Response(msg, { status: 500, headers: corsHeaders })
  }
})
