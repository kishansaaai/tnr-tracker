import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const CAT_API_KEY = Deno.env.get('CAT_API_KEY')
const BASE_URL = 'https://api.thecatapi.com/v1'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

if (!CAT_API_KEY) {
  Deno.serve((req) => {
    const origin = req.headers.get('Origin') || ''
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1')
    const allowedOrigin = (isLocal || origin === 'https://tnr-tracker.vercel.app') ? origin : 'https://tnr-tracker.vercel.app'
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration: CAT_API_KEY not set' }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  })
} else {
  Deno.serve(async (req) => {
    const origin = req.headers.get('Origin') || ''
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1')
    const allowedOrigin = (isLocal || origin === 'https://tnr-tracker.vercel.app') ? origin : 'https://tnr-tracker.vercel.app'
    
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

      // Input Validation
      const body = await req.json()
      const { action } = body

      if (action !== undefined && action !== 'gif' && action !== 'image') {
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      }

      // Database-backed Atomic Rate Limiting (5 seconds per user for Cat API)
      const { data: allowed, error: limitError } = await supabaseAdmin.rpc(
        'check_and_increment_rate_limit',
        { p_user_id: user.id, p_limit_seconds: 5, p_max_calls: 1 }
      )

      if (limitError || !allowed) {
        return new Response(JSON.stringify({ error: 'Rate limited. Please wait 5 seconds.' }), { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        })
      }

      let endpoint = `${BASE_URL}/images/search?has_breeds=1`
      if (action === 'gif') {
        endpoint = `${BASE_URL}/images/search?mime_types=gif`
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
      console.error('Edge Function Error:', error)
      const isUserFriendly = error.message && (
        error.message.includes('Cat API') || 
        error.message.includes('Rate limit') || 
        error.message.includes('action')
      )
      const message = isUserFriendly ? error.message : 'An unexpected error occurred'
      return new Response(JSON.stringify({ error: message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      })
    }
  })
}
