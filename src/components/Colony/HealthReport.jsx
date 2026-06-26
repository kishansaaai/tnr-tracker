import { useState } from 'react'
import { Button } from '../UI/Button'
import { analyseColonyHealth, parseHealthReport } from '../../lib/gemini'
import { friendlyError } from '../../lib/utils'

function renderBoldText(text) {
  if (!text) return ''
  const parts = text.split(/\*\*([^*]+)\*\*/g)
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return (
        <strong key={index} className="font-semibold text-gray-900">
          {part}
        </strong>
      )
    }
    return part
  })
}

function formatContent(text, color) {
  if (!text) return null

  const colorClasses = {
    blue: { bg: 'bg-blue-50 text-blue-700 border border-blue-100', bullet: 'bg-blue-500' },
    red: { bg: 'bg-rose-50 text-rose-700 border border-rose-100', bullet: 'bg-rose-500' },
    green: { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-100', bullet: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50 text-amber-700 border border-amber-100', bullet: 'bg-amber-500' },
  }

  const classes = colorClasses[color] || colorClasses.blue
  const lines = text.split('\n')

  return (
    <div className="space-y-3 mt-1">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return null

        // Match numbered lists: "1. **Title:** text" or "1. text"
        const numListMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
        // Match bullet lists: "- **Title:** text" or "* text"
        const bulletListMatch = trimmed.match(/^[-*]\s+(.*)$/)

        if (numListMatch) {
          const num = numListMatch[1]
          const content = numListMatch[2]
          return (
            <div key={idx} className="flex gap-3 items-start pl-1">
              <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mt-0.5 shadow-sm ${classes.bg}`}>
                {num}
              </span>
              <div className="text-sm text-gray-700 leading-relaxed flex-1">
                {renderBoldText(content)}
              </div>
            </div>
          )
        }

        if (bulletListMatch) {
          const content = bulletListMatch[1]
          return (
            <div key={idx} className="flex gap-3 items-start pl-1">
              <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${classes.bullet}`} />
              <div className="text-sm text-gray-700 leading-relaxed flex-1">
                {renderBoldText(content)}
              </div>
            </div>
          )
        }

        return (
          <p key={idx} className="text-sm text-gray-700 leading-relaxed">
            {renderBoldText(trimmed)}
          </p>
        )
      })}
    </div>
  )
}

export function HealthReport({ colony, cats, updates }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyse() {
    setLoading(true)
    setError(null)
    try {
      const raw = await analyseColonyHealth({ colony, cats, updates })
      setReport(parseHealthReport(raw))
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    {
      key: 'statusSummary',
      title: 'Colony Status Summary',
      color: 'blue',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      ),
    },
    {
      key: 'healthConcerns',
      title: 'Health Concerns',
      color: 'red',
      icon: (
        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      key: 'neuteringProgress',
      title: 'Neutering Progress',
      color: 'green',
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      key: 'nextSteps',
      title: 'Recommended Next Steps',
      color: 'amber',
      icon: (
        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      ),
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
      {!report && !loading && (
        <div className="text-center py-8 px-4 bg-gradient-to-br from-green-50/50 via-emerald-50/20 to-amber-50/30 rounded-2xl border border-emerald-100/50 shadow-inner">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm mb-4">
            <span className="animate-spin text-[10px]">✨</span>
            GEMINI AI
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1.5">AI Colony Health Analysis</h3>
          <p className="text-sm text-gray-600 mb-5 max-w-md mx-auto leading-relaxed">
            Get an instant, data-driven report covering medical warnings, sterilization progress, and optimized action items for this colony.
          </p>
          <Button onClick={handleAnalyse} variant="amber" className="shadow-md font-semibold px-6 py-2.5 hover:scale-102 transition-transform">
            Analyze Colony Health
          </Button>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 px-4 bg-gray-50/40 rounded-2xl border border-gray-100">
          <div className="flex justify-center mb-4 relative">
            <div className="w-12 h-12 rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />
            <span className="absolute text-lg top-2.5 animate-pulse">✨</span>
          </div>
          <p className="text-sm font-semibold text-gray-700">Running AI Diagnostics...</p>
          <p className="text-xs text-gray-500 mt-1">Compiling colony history and health charts</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-rose-800 font-bold">Analysis Failed</p>
          <p className="text-xs text-rose-600 mt-1 max-w-md mx-auto leading-relaxed">{error}</p>
          <Button size="sm" variant="secondary" onClick={handleAnalyse} className="mt-4 shadow-sm">
            Try again
          </Button>
        </div>
      )}

      {report && (
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <h3 className="font-bold text-gray-900">AI Health Report</h3>
            </div>
            <button
              onClick={() => {
                setReport(null)
                handleAnalyse()
              }}
              className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-800 transition-colors bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Re-Analyze
            </button>
          </div>

          <div className="space-y-4">
            {sections.map(({ key, title, color, icon }) => (
              report[key] ? (
                <div
                  key={key}
                  className={`rounded-2xl p-5 border transition-all duration-300 hover:shadow-md ${
                    color === 'blue' ? 'bg-blue-50/20 border-blue-100/60 border-l-4 border-l-blue-500' :
                    color === 'red' ? 'bg-rose-50/20 border-rose-100/60 border-l-4 border-l-rose-500' :
                    color === 'green' ? 'bg-emerald-50/20 border-emerald-100/60 border-l-4 border-l-emerald-500' :
                    'bg-amber-50/25 border-amber-100/60 border-l-4 border-l-amber-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    {icon}
                    <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
                  </div>
                  {formatContent(report[key], color)}
                </div>
              ) : null
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-400">
              ⚡ Generated securely by Gemini AI • Always consult a veterinary expert for critical medical care.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
