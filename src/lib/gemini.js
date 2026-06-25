const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'

function buildPrompt({ colony, cats, updates }) {
  const catSummary = cats.map(cat =>
    `- ${cat.name || 'Unnamed'} (${cat.gender}, ${cat.neutered ? 'neutered' : 'not neutered'}${cat.health_notes ? `, notes: ${cat.health_notes}` : ''})`
  ).join('\n')

  const updatesSummary = updates.slice(0, 10).map(update =>
    `- ${new Date(update.created_at).toLocaleDateString()}: ${update.message}`
  ).join('\n')

  return `You are a compassionate and experienced TNR (Trap-Neuter-Return) coordinator assistant. Analyze the following colony data and provide a structured health report.

Colony Name: ${colony.name}
Status: ${colony.status}
Description: ${colony.description || 'No description provided'}
Total Cats: ${cats.length}
Neutered: ${cats.filter(cat => cat.neutered).length}

Cat List:
${catSummary || 'No cats logged yet.'}

Recent Activity (last 10 updates):
${updatesSummary || 'No recent activity.'}

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
}

export async function analyseColonyHealth({ colony, cats, updates }) {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing Gemini API key. Add VITE_GEMINI_API_KEY to your .env file.')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{
            text: 'You help TNR volunteers manage community cat colonies humanely and effectively. Always be practical, specific, and encouraging.',
          }],
        },
        contents: [{
          role: 'user',
          parts: [{ text: buildPrompt({ colony, cats, updates }) }],
        }],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 1500,
        },
      }),
    }
  )

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error?.message || 'Gemini API request failed')
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim()

  if (!text) {
    throw new Error('Gemini returned an empty report.')
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
