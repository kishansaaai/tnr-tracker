import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTraps } from '../hooks/useTraps'
import { Badge } from '../components/UI/Badge'
import { Button } from '../components/UI/Button'
import { ListSkeleton } from '../components/UI/Skeleton'
import toast from 'react-hot-toast'

export default function Volunteers() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const { traps } = useTraps()

  useEffect(() => {
    if (!isAdmin) {
      navigate('/')
      return
    }
    fetchProfiles()
  }, [isAdmin])

  async function fetchProfiles() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error) setProfiles(data || [])
    setLoading(false)
  }

  async function toggleRole(profileId, currentRole) {
    const newRole = currentRole === 'admin' ? 'volunteer' : 'admin'
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId)
    if (error) {
      toast.error('Failed to update role')
    } else {
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role: newRole } : p))
      toast.success(`Role updated to ${newRole}`)
    }
  }

  const getMockPoints = (profile) => {
    if (!profile.id) return 0
    let hash = 0
    const str = profile.id
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return (Math.abs(hash) % 800) + 150
  }

  const getTitle = (points) => {
    if (points > 800) return '🏆 Grand Cat Master'
    if (points > 500) return '🥇 Whiskers Guardian'
    if (points > 300) return '🥈 Expert Trapper'
    return '🥉 Cat Trapper Cadet'
  }

  const sortedProfiles = [...profiles].sort((a, b) => getMockPoints(b) - getMockPoints(a))

  if (!isAdmin) return null

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100 shadow-sm text-center">
        <h1 className="text-3xl font-black text-amber-800 mb-2">🐾 Paws of Honor Leaderboard</h1>
        <p className="text-amber-700 font-medium">Top volunteers making the biggest impact on world cat domination!</p>
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : sortedProfiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="text-sm font-bold tracking-wide text-gray-400 mb-2">TEAM</div>
          <p className="text-gray-500">No volunteers yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProfiles.map((profile, index) => {
            const points = getMockPoints(profile)
            const title = getTitle(points)
            const assignedTraps = traps.filter(t => t.assigned_to === profile.id)

            return (
              <div key={profile.id} className={`bg-white rounded-xl border p-5 shadow-sm transition-transform hover:scale-[1.01] flex items-center justify-between ${index === 0 ? 'border-amber-300 bg-amber-50/30' : 'border-gray-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-8">
                    <span className={`text-xl font-black ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                      #{index + 1}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 text-cyan-800 flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm">
                    {profile.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-lg">{profile.name || 'Unnamed Volunteer'}</h3>
                      {profile.role === 'admin' && <Badge status="admin" />}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                      {points} pts
                    </div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Impact Score</p>
                  </div>
                  
                  {isAdmin && (
                    <Button
                      size="xs"
                      variant={profile.role === 'admin' ? 'secondary' : 'primary'}
                      onClick={() => toggleRole(profile.id, profile.role)}
                      className="ml-4"
                    >
                      {profile.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
