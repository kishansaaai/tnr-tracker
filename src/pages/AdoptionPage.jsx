import { useState, useEffect } from 'react'
import { useAllCats } from '../hooks/useCats'
import { useColonies } from '../hooks/useColonies'
import { Badge } from '../components/UI/Badge'
import { friendlyError } from '../lib/utils'
import toast from 'react-hot-toast'

const PIPELINE_STAGES = [
  { id: 'tnr', label: 'TNR (Return)', icon: '🔄', color: 'bg-gray-50 border-gray-200' },
  { id: 'socializing', label: 'Socializing', icon: '💕', color: 'bg-blue-50 border-blue-200' },
  { id: 'adoption_ready', label: 'Ready for Adoption', icon: '🏠', color: 'bg-amber-50 border-amber-200' },
  { id: 'adopted', label: 'Adopted', icon: '🎉', color: 'bg-green-50 border-green-200' },
]

function PipelineCatCard({ cat, colonies, onMove, stages }) {
  const [showMove, setShowMove] = useState(false)
  const colony = colonies.find(c => c.id === cat.colony_id)
  const currentIdx = stages.findIndex(s => s.id === cat.pipeline_status)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2.5">
        {cat.photo_url ? (
          <img src={cat.photo_url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-lg">🐱</div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm truncate">{cat.name || 'Unnamed'}</h4>
          <div className="flex items-center gap-1.5">
            <Badge status={cat.gender} />
            {colony && <span className="text-xs text-gray-400 truncate">{colony.name}</span>}
          </div>
        </div>
        <button
          onClick={() => setShowMove(!showMove)}
          className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={`Move ${cat.name || 'unnamed cat'} in pipeline`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {cat.health_notes && (
        <p className="text-xs text-gray-500 mt-2 line-clamp-1">{cat.health_notes}</p>
      )}

      {cat.pipeline_status === 'adopted' && cat.adoption_date && (
        <p className="text-xs text-green-600 mt-1 font-medium">
          Adopted {new Date(cat.adoption_date).toLocaleDateString()}
        </p>
      )}

      {cat.foster_name && (
        <p className="text-xs text-blue-600 mt-1">Foster: {cat.foster_name}</p>
      )}

      {showMove && (
        <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
          <p className="text-xs text-gray-500 font-medium mb-1">Move to:</p>
          {stages.filter((_, i) => i !== currentIdx).map(stage => (
            <button
              key={stage.id}
              onClick={() => { onMove(cat.id, stage.id); setShowMove(false) }}
              className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
              aria-label={`Move cat to ${stage.label}`}
            >
              <span>{stage.icon}</span>
              <span>{stage.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdoptionPage() {
  const { cats, loading, updateCat, error, hasMore, loadMore } = useAllCats()
  const { colonies } = useColonies()
  const [filterColony, setFilterColony] = useState('')

  useEffect(() => {
    document.title = 'TNR Tracker — Adoption Pipeline'
  }, [])

  const filteredCats = filterColony
    ? cats.filter(c => c.colony_id === filterColony)
    : cats

  async function handleMoveCat(catId, newStatus) {
    try {
      const updates = { pipeline_status: newStatus }
      if (newStatus === 'adopted') {
        updates.adoption_date = new Date().toISOString()
      }
      await updateCat(catId, updates)
      toast.success(`Cat moved to ${PIPELINE_STAGES.find(s => s.id === newStatus)?.label}`)
    } catch (err) {
      toast.error(friendlyError(err))
    }
  }

  const stageCounts = PIPELINE_STAGES.map(stage => ({
    ...stage,
    count: filteredCats.filter(c => (c.pipeline_status || 'tnr') === stage.id).length,
  }))

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adoption Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track cats from TNR through socialization to adoption
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterColony}
            onChange={e => setFilterColony(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Filter pipeline by colony"
          >
            <option value="">All Colonies</option>
            {colonies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stageCounts.map(stage => (
          <div key={stage.id} className={`rounded-xl border p-3 text-center ${stage.color}`}>
            <div className="text-2xl mb-1">{stage.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{stage.count}</div>
            <div className="text-xs text-gray-600 mt-0.5">{stage.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 text-sm">
          Failed to load adoption data. Please try again.
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse bg-gray-100 h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto pb-4 -mx-4 px-4">
            <div className="flex gap-4 min-w-[800px] lg:grid lg:grid-cols-4 lg:min-w-0">
              {PIPELINE_STAGES.map((stage, stageIdx) => {
                const stageCats = filteredCats.filter(c => (c.pipeline_status || 'tnr') === stage.id)

                return (
                  <div key={stage.id} className={`flex-shrink-0 w-[220px] lg:w-auto rounded-2xl border-2 border-dashed p-3 min-h-[300px] flex flex-col justify-between ${stage.color}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200/50">
                        <span className="text-lg">{stage.icon}</span>
                        <h3 className="font-semibold text-gray-800 text-sm">{stage.label}</h3>
                        {stageIdx < PIPELINE_STAGES.length - 1 && (
                          <span className="ml-2 lg:hidden text-gray-300">→</span>
                        )}
                        <span className="ml-auto bg-white/80 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          {stageCats.length}
                        </span>
                      </div>

                      {stageCats.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-8 italic">No cats in this stage</p>
                      ) : (
                        <div className="space-y-2">
                          {stageCats.map(cat => (
                            <PipelineCatCard
                              key={cat.id}
                              cat={cat}
                              colonies={colonies}
                              onMove={handleMoveCat}
                              stages={PIPELINE_STAGES}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer"
                aria-label="Load more cats globally"
              >
                Load More Cats
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
