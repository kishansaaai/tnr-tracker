import { useState } from 'react'
import { Badge } from '../UI/Badge'
import { Button } from '../UI/Button'

export function TrapList({ traps, onUpdate, onDelete, isAdmin }) {
  return (
    <div className="space-y-3">
      {traps.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-sm font-bold tracking-wide text-gray-400 mb-2">TRAPS</div>
          <p className="text-sm text-gray-500">No traps linked to this colony yet</p>
        </div>
      ) : (
        traps.map(trap => (
          <TrapItem key={trap.id} trap={trap} onUpdate={onUpdate} onDelete={onDelete} isAdmin={isAdmin} />
        ))
      )}
    </div>
  )
}

function TrapItem({ trap, onUpdate, onDelete, isAdmin }) {
  const [updating, setUpdating] = useState(false)

  async function handleStatusChange(status) {
    setUpdating(true)
    try {
      await onUpdate(trap.id, { status })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-amber-700">Trap</span>
          <div>
            <div className="flex items-center gap-2">
              <Badge status={trap.status} />
              {trap.profiles?.name && (
                <span className="text-xs text-gray-500">to {trap.profiles.name}</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {trap.lat.toFixed(4)}, {trap.lng.toFixed(4)}
              {trap.notes && ` - ${trap.notes}`}
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => onDelete(trap.id)}
            className="text-gray-300 hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Quick status update */}
      <div className="mt-3 flex gap-2">
        {['available', 'in_use', 'needs_pickup'].map(s => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            disabled={updating || trap.status === s}
            className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
              trap.status === s
                ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-default'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-500 hover:text-green-700'
            }`}
          >
            {s === 'available' ? 'Available' : s === 'in_use' ? 'In Use' : 'Needs Pickup'}
          </button>
        ))}
      </div>
    </div>
  )
}
