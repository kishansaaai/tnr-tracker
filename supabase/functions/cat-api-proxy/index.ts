import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const CAT_API_KEY = Deno.env.get('CAT_API_KEY')
const BASE_URL = 'https://api.thecatapi.com/v1'

const cooldowns = new Map<string, number>()

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') || ''
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1')
  const allowedOrigin = isLocal ? origin : 'https://tnr-tracker.vercel.app'
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Rate Limiting (5 seconds per user for Cat API to prevent abuse)
    const now = Date.now()
    const lastCall = cooldowns.get(user.id) || 0
    if (now - lastCall < 5000) {
      return new Response(JSON.stringify({ error: 'Rate limited. Please wait 5 seconds.' }), { 
        status: 429, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }
    cooldowns.set(user.id, now)

    const { action } = await req.json()
    let endpoint = `${BASE_URL}/images/search?has_breeds=1`
    
    if (action === 'gif') {
      endpoint = `${BASE_URL}/images/search?mime_types=gif`
    }

    if (!CAT_API_KEY) {
      throw new Error("Missing CAT_API_KEY configuration in server environment.")
    }

    const headers: Record<string, string> = {
      'x-api-key': CAT_API_KEY
    }

    const res = await fetch(endpoint, { headers })
    
    if (!res.ok) {
      throw new Error(`Cat API returned ${res.status}`)
    }
    
    const data = await res.json()
    
    return new Response(
      JSON.stringify(data[0] || null),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
