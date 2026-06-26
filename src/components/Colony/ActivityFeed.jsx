import { useState } from 'react'
import { Button } from '../UI/Button'
import { useAuth } from '../../hooks/useAuth.jsx'

export function ActivityFeed({ updates, loading, onPost }) {
  const [message, setMessage] = useState('')
  const [posting, setPosting] = useState(false)
  const { user } = useAuth()

  async function handlePost(e) {
    e.preventDefault()
    if (!message.trim()) return
    setPosting(true)
    try {
      await onPost(message.trim(), user.id)
      setMessage('')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div>
      {/* Post new update */}
      <form onSubmit={handlePost} className="mb-4">
        <div className="flex gap-2">
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={1000}
            placeholder="Post an update (sighting, trap check, etc.)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
          />
          <Button type="submit" size="sm" loading={posting} disabled={!message.trim()}>
            Post
          </Button>
        </div>
      </form>

      {/* Feed */}
      <div className="space-y-2">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))
        ) : updates.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="text-sm font-bold tracking-wide text-gray-400 mb-2">FEED</div>
            <p className="text-sm text-gray-500">No updates yet. Be the first to post.</p>
          </div>
        ) : (
          updates.map(update => (
            <div key={update.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p className="text-sm text-gray-800">{update.message}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold">
                  {update.profiles?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-xs text-gray-500">
                  {update.profiles?.name || 'Unknown'} - {new Date(update.created_at).toLocaleString()}
                </span>
                <span className="ml-auto text-green-400 text-xs">Live</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
