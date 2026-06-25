import { Link } from 'react-router-dom'
import { Badge } from '../UI/Badge'
import { Button } from '../UI/Button'
import { useUpdates } from '../../hooks/useUpdates'

export function ColonySidebar({ colony, catCount, neuteredCount, nearbyTraps, onClose }) {
  const { updates, loading: updatesLoading } = useUpdates(colony?.id)

  if (!colony) return null

  const neuteredPct = catCount > 0 ? Math.round((neuteredCount / catCount) * 100) : 0

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-2xl z-20 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-green-50">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-lg leading-tight">{colony.name}</h2>
            <div className="mt-1">
              <Badge status={colony.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white/60 transition-colors ml-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-3 gap-3 border-b border-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{catCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total cats</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-700">{neuteredCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">Neutered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">{neuteredPct}%</div>
          <div className="text-xs text-gray-500 mt-0.5">Progress</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${neuteredPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Neutering progress</p>
      </div>

      {/* Nearby traps */}
      {nearbyTraps.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Traps ({nearbyTraps.length})</p>
          <div className="space-y-1.5">
            {nearbyTraps.slice(0, 3).map(trap => (
              <div key={trap.id} className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-700">Trap</span>
                <Badge status={trap.status} />
                {trap.profiles?.name && <span className="text-xs text-gray-500">to {trap.profiles.name}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {colony.description && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs text-gray-600">{colony.description}</p>
        </div>
      )}

      {/* Activity Feed */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Live Activity
          <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </p>
        {updatesLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton h-10 rounded-lg" />
            ))}
          </div>
        ) : updates.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>
        ) : (
          <div className="space-y-2">
            {updates.slice(0, 15).map(update => (
              <div key={update.id} className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xs text-gray-700 leading-snug">{update.message}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-gray-400">
                    {update.profiles?.name || 'Unknown'} - {new Date(update.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <Link to={`/colony/${colony.id}`}>
          <Button className="w-full" size="sm">
            View Full Details
          </Button>
        </Link>
      </div>
    </div>
  )
}
