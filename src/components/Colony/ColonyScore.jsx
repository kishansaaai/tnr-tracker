import React from 'react'

export function ColonyScore({ cats, colony }) {
  // Calculate Happiness & Health Index
  const totalCats = cats.length
  const neuteredCount = cats.filter(cat => cat.neutered).length
  const neuteredPct = totalCats > 0 ? (neuteredCount / totalCats) * 100 : 0
  
  // Status points (Managed = 30, In Progress = 15, Unmanaged = 0)
  const statusPoints = colony.status === 'managed' ? 30 : colony.status === 'in_progress' ? 15 : 0
  
  // Base 20 points, minus 5 for each cat with health notes (cap at 0 for this section)
  const healthIssuesCount = cats.filter(cat => cat.health_notes).length
  const healthPoints = Math.max(0, 20 - (healthIssuesCount * 5))

  // Total Score
  let score = Math.round((neuteredPct * 0.5) + statusPoints + healthPoints)
  if (totalCats === 0) score = 0 // Empty colony
  
  // Determine text and color based on score
  let label = "Struggling 😿"
  let color = "bg-rose-500"
  let bgLight = "bg-rose-50"
  let textColor = "text-rose-700"
  
  if (score >= 80) {
    label = "Thriving 😸"
    color = "bg-emerald-500"
    bgLight = "bg-emerald-50"
    textColor = "text-emerald-700"
  } else if (score >= 50) {
    label = "Improving 😺"
    color = "bg-amber-500"
    bgLight = "bg-amber-50"
    textColor = "text-amber-700"
  }

  return (
    <div className={`rounded-xl border p-4 ${bgLight} border-${color.split('-')[1]}-200 flex items-center justify-between shadow-sm transition-all hover:scale-[1.01]`}>
      <div className="flex-1">
        <h4 className={`text-sm font-bold ${textColor} mb-1 flex items-center gap-2`}>
          <span>💖 Happiness & Health Index</span>
          <span className="text-lg">{label}</span>
        </h4>
        <div className="w-full bg-white/60 rounded-full h-3 mb-1 overflow-hidden shadow-inner border border-black/5">
          <div 
            className={`h-3 rounded-full ${color} transition-all duration-1000 ease-out relative overflow-hidden`} 
            style={{ width: `${score}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
        <p className={`text-xs ${textColor} opacity-80`}>
          Based on neuter rate ({Math.round(neuteredPct)}%), active management, and general health notes.
        </p>
      </div>
      <div className="ml-6 flex flex-col items-center justify-center">
        <span className={`text-3xl font-black ${textColor}`}>{score}%</span>
      </div>
    </div>
  )
}
