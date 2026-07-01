import { supabase } from './supabase'

export async function analyseColonyHealth({ colony, cats, updates }) {
  const promptText = `System Instruction: You help TNR volunteers manage community cat colonies humanely and effectively. Always be practical, specific, and encouraging.

You are a compassionate and experienced TNR (Trap-Neuter-Return) coordinator assistant. Analyze the following colony data and provide a structured health report.

Colony Name: ${colony.name || ''}
Status: ${colony.status || ''}
Description: ${colony.description || 'No description provided'}
Total Cats: ${cats.length}
Neutered: ${cats.filter(c => c.neutered).length}

Cat List:
${cats.map(cat => `- ${cat.name || 'Unnamed'} (${cat.gender}, ${cat.neutered ? 'neutered' : 'not neutered'}${cat.health_notes ? `, notes: ${cat.health_notes}` : ''})`).join('\n') || 'No cats logged yet.'}

Recent Activity (last 10 updates):
${updates.slice(0, 10).map(update => `- ${new Date(update.created_at).toLocaleDateString()}: ${update.message}`).join('\n') || 'No recent activity.'}

Please provide a structured report with EXACTLY these four sections, each clearly labeled:

## Colony Status Summary
Brief overview of the colony's current state and management level.

## Health Concerns
Any health issues noted, patterns in health notes, and general welfare assessment.

## Neutering Progress
Analysis of the TNR progress, percentage neutered, and what that means for colony stabilization.

## Recommended Next Steps
Specific, actionable recommendations for the volunteers managing this colony.

Be practical, compassionate, and specific. Use the actual data provided.`

  // 1. Try Groq API first if VITE_GROQ_API_KEY is present
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY
  const groqModel = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile'

  if (groqApiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            {
              role: 'user',
              content: promptText
            }
          ],
          temperature: 0.3
        })
      })

      if (response.ok) {
        const resData = await response.json()
        const text = resData.choices?.[0]?.message?.content?.trim()
        if (text) {
          return text
        }
      } else {
        const errData = await response.json().catch(() => ({}))
        console.warn("Groq API request failed, falling back to Gemini...", errData.error?.message || response.statusText)
      }
    } catch (e) {
      console.warn("Groq API invocation failed, falling back to Gemini...", e)
    }
  }

  // 2. Try invoking the hosted Supabase Edge Function
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { action: 'health_report', colony, cats, updates }
    })

    if (!error && data?.text) {
      return data.text
    }
    console.warn("Edge Function returned error or empty response. Falling back to direct Gemini API call...", error)
  } catch (e) {
    console.warn("Edge Function invocation failed. Falling back to direct Gemini API call...", e)
  }

  // 3. Direct Fallback using VITE_GEMINI_API_KEY from environment variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  let model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash-latest'

  if (!apiKey) {
    throw new Error('Analysis failed: both Groq/hosted Edge Function and local direct API key are unavailable.')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: promptText }]
        }],
        generationConfig: {
          maxOutputTokens: 1500,
        },
      }),
    }
  )

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error?.message || 'Direct Gemini API request failed')
  }

  const resData = await response.json()
  const text = resData.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim()

  if (!text) {
    throw new Error('Gemini returned an empty report.')
  }

  return text
}

export async function analyseCatPhoto(imageBase64, mimeType) {
  // 1. Try invoking the hosted Supabase Edge Function first
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: {
        action: 'analyze_photo',
        imageBase64,
        mimeType
      }
    })

    if (!error && data?.text) {
      return data.text
    }
    console.warn("Edge Function returned error. Falling back to direct Gemini API call...", error)
  } catch (e) {
    console.warn("Edge Function invocation failed. Falling back to direct Gemini API call...", e)
  }

  // 2. Direct Fallback using VITE_GEMINI_API_KEY
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  let model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash-latest'

  if (!apiKey) {
    throw new Error('Analysis failed: both hosted Edge Function and local direct API key are unavailable.')
  }

  const promptText = `System Instruction: You are an expert feline veterinarian and TNR specialist. You strictly reply in JSON format. Only return the raw JSON object, without any markdown formatting.

Analyze this cat photo. Is the ear tipped or clipped (universal sign of a TNR neutered cat)? What is the breed or coat pattern? Respond ONLY with a valid JSON object in this format: {"has_ear_tip": boolean, "breed": "string", "reason": "brief explanation"}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: promptText },
            { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } }
          ]
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens: 500,
        },
      }),
    }
  )

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error?.message || 'Direct Gemini API request failed')
  }

  const resData = await response.json()
  const text = resData.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim()

  if (!text) {
    throw new Error('Gemini returned an empty response.')
  }

  return text
}

export function parseHealthReport(text) {
  const sections = {
    statusSummary: '',
    healthConcerns: '',
    neuteringProgress: '',
    nextSteps: '',
  }

  const sectionMap = [
    { key: 'statusSummary', heading: 'Colony Status Summary' },
    { key: 'healthConcerns', heading: 'Health Concerns' },
    { key: 'neuteringProgress', heading: 'Neutering Progress' },
    { key: 'nextSteps', heading: 'Recommended Next Steps' },
  ]

  for (let i = 0; i < sectionMap.length; i++) {
    const { key, heading } = sectionMap[i]
    const nextHeading = sectionMap[i + 1]?.heading
    const startPattern = new RegExp(`##\\s*${heading}\\s*\\n`, 'i')
    const startMatch = text.match(startPattern)

    if (startMatch) {
      const startIdx = startMatch.index + startMatch[0].length
      let endIdx = text.length

      if (nextHeading) {
        const endPattern = new RegExp(`##\\s*${nextHeading}`, 'i')
        const endMatch = text.slice(startIdx).match(endPattern)
        if (endMatch) endIdx = startIdx + endMatch.index
      }

      sections[key] = text.slice(startIdx, endIdx).trim()
    }
  }

  if (!sections.statusSummary && !sections.healthConcerns) {
    sections.statusSummary = text
  }

  return sections
}
