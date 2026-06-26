import { supabase } from './supabase'

export async function analyseColonyHealth({ colony, cats, updates }) {
  const { data, error } = await supabase.functions.invoke('gemini-proxy', {
    body: { action: 'health_report', colony, cats, updates }
  })

  if (error) {
    let msg = error.message || 'Failed to fetch analysis from Edge Function.'
    if (error.context) {
      try {
        // Parse JSON error response if possible
        const body = await error.context.clone().json()
        if (body?.error) {
          msg = body.error
        }
      } catch (e) {
        try {
          const text = await error.context.clone().text()
          if (text) msg = text
        } catch (t_err) {}
      }
    }
    throw new Error(msg)
  }

  if (!data?.text) {
    throw new Error('Edge Function returned an empty report.')
  }

  return data.text
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
