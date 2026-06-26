import { useState } from 'react'
import { Badge } from '../UI/Badge'
import { Button } from '../UI/Button'
import { CatAvatar } from './CatAvatar'

export function CatCard({ cat, onDelete, isAdmin }) {
  const [showDelete, setShowDelete] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3 hover:shadow-sm transition-shadow">
      {/* Photo */}
      <div className="flex-shrink-0">
        {cat.photo_url ? (
          <img
            src={cat.photo_url}
            alt={cat.name || 'Cat'}
            className="w-16 h-16 rounded-lg object-cover bg-gray-100"
          />
        ) : (
          <CatAvatar seed={cat.name || cat.id} className="w-16 h-16" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 truncate">
            {cat.name || <span className="text-gray-400 font-normal italic">Unnamed</span>}
          </h3>
          {isAdmin && (
            <button
              onClick={() => setShowDelete(!showDelete)}
              aria-label="Toggle remove cat prompt"
              className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <Badge status={cat.gender} />
          <Badge
            status={cat.neutered ? 'managed' : 'unmanaged'}
            className="!border-0"
          >
            {cat.neutered ? 'Neutered' : 'Intact'}
          </Badge>
          {cat.pipeline_status && cat.pipeline_status !== 'tnr' && (
            <Badge status={cat.pipeline_status} />
          )}
        </div>

        {cat.health_notes && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">{cat.health_notes}</p>
        )}

        {showDelete && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-red-600">Remove this cat?</span>
            <button
              onClick={() => { onDelete(cat.id); setShowDelete(false) }}
              className="text-xs text-red-600 font-medium hover:underline"
              aria-label={`Confirm remove cat ${cat.name || 'unnamed'}`}
            >
              Yes, remove
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="text-xs text-gray-500 hover:underline"
              aria-label={`Cancel remove cat ${cat.name || 'unnamed'}`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
