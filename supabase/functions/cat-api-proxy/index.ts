import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const CAT_API_KEY = Deno.env.get('CAT_API_KEY')
const BASE_URL = 'https://api.thecatapi.com/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action } = await req.json()
    let endpoint = `${BASE_URL}/images/search?has_breeds=1`
    
    if (action === 'gif') {
      endpoint = `${BASE_URL}/images/search?mime_types=gif`
    }

    const headers: Record<string, string> = {}
    if (CAT_API_KEY) {
      headers['x-api-key'] = CAT_API_KEY
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
