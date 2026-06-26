import React, { useState, useEffect } from 'react'
import { Button } from '../UI/Button'
import toast from 'react-hot-toast'

/**
 * Component to manage structured feeding schedules, caregiver logs, and historical feed events.
 * Persists schedules locally and parses historical feeds from the activity feed.
 * 
 * @param {object} props - Component properties.
 * @param {string} props.colonyId - UUID of the colony.
 * @param {Array} props.updates - Array of activity log updates.
 * @param {function} props.onPostFeed - Callback to post a new feed update.
 */
export function FeedingManager({ colonyId, updates, onPostFeed }) {
  const [schedules, setSchedules] = useState([])
  const [caregiver, setCaregiver] = useState('')
  const [foodType, setFoodType] = useState('Dry Kibble')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  
  // Schedule Form State
  const [showAddSchedule, setShowAddSchedule] = useState(false)
  const [schedTime, setSchedTime] = useState('')
  const [schedCaregiver, setSchedCaregiver] = useState('')

  // Load schedule from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`feeding_schedule_${colonyId}`)
    if (stored) {
      try {
        setSchedules(JSON.parse(stored))
      } catch (e) {
        setSchedules([])
      }
    } else {
      // Default placeholder schedules
      const defaults = [
        { id: '1', time: '08:00', caregiver: 'Primary Caregiver' },
        { id: '2', time: '17:00', caregiver: 'Secondary volunteer' }
      ]
      setSchedules(defaults)
      localStorage.setItem(`feeding_schedule_${colonyId}`, JSON.stringify(defaults))
    }
  }, [colonyId])

  const saveSchedules = (newScheds) => {
    setSchedules(newScheds)
    localStorage.setItem(`feeding_schedule_${colonyId}`, JSON.stringify(newScheds))
  }

  const handleAddSchedule = (e) => {
    e.preventDefault()
    if (!schedTime || !schedCaregiver.trim()) return
    const newSched = {
      id: Date.now().toString(),
      time: schedTime,
      caregiver: schedCaregiver.trim()
    }
    const updated = [...schedules, newSched].sort((a, b) => a.time.localeCompare(b.time))
    saveSchedules(updated)
    setSchedTime('')
    setSchedCaregiver('')
    setShowAddSchedule(false)
    toast.success('Schedule added')
  }

  const handleDeleteSchedule = (id) => {
    const updated = schedules.filter(s => s.id !== id)
    saveSchedules(updated)
    toast.success('Schedule removed')
  }

  const handleLogFeed = async (e) => {
    e.preventDefault()
    if (!caregiver.trim() || !quantity.trim()) {
      toast.error('Caregiver name and quantity are required')
      return
    }

    const formattedMessage = `[FEED] Caregiver: ${caregiver.trim()} | Food: ${foodType} | Quantity: ${quantity.trim()}${notes.trim() ? ` | Notes: ${notes.trim()}` : ''} 🐟`
    
    try {
      await onPostFeed(formattedMessage)
      toast.success('Feeding logged successfully')
      setCaregiver('')
      setQuantity('')
      setNotes('')
    } catch (e) {
      toast.error('Failed to log feeding')
    }
  }

  // Parse feeding history from general updates list
  const feedingLogs = updates
    .filter(u => u.message && u.message.startsWith('[FEED]'))
    .map(u => {
      // Format: [FEED] Caregiver: Kishan | Food: Dry Kibble | Quantity: 2 scoops | Notes: notes 🐟
      const content = u.message.replace('[FEED] ', '').replace(' 🐟', '')
      const parts = content.split(' | ')
      const logData = {
        id: u.id,
        date: new Date(u.created_at).toLocaleString(),
        caregiver: 'Unknown',
        food: 'Food',
        quantity: 'N/A',
        notes: ''
      }
      parts.forEach(p => {
        const [key, val] = p.split(': ')
        if (key && val) {
          if (key.trim() === 'Caregiver') logData.caregiver = val.trim()
          if (key.trim() === 'Food') logData.food = val.trim()
          if (key.trim() === 'Quantity') logData.quantity = val.trim()
          if (key.trim() === 'Notes') logData.notes = val.trim()
        }
      })
      return logData
    })

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Log structured feed */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🥣</span> Log Colony Feeding
          </h3>
          <form onSubmit={handleLogFeed} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Caregiver Name</label>
              <input
                type="text"
                value={caregiver}
                onChange={e => setCaregiver(e.target.value)}
                placeholder="Who fed the colony?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Food Type</label>
                <select
                  value={foodType}
                  onChange={e => setFoodType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                >
                  <option>Dry Kibble</option>
                  <option>Wet Canned</option>
                  <option>Mixed Dry/Wet</option>
                  <option>Raw Diet</option>
                  <option>Treats Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Quantity</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="e.g. 2 scoops, 3 cans"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sighting / Health Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any notable events (e.g. all cats accounted for, skittish behavior)?"
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
              />
            </div>
            <Button type="submit" size="sm" className="w-full justify-center">
              Log Structured Feed
            </Button>
          </form>
        </div>

        {/* Feeding Schedule & Caregivers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span>📅</span> Caregiver Schedule
              </h3>
              <Button size="xs" variant="secondary" onClick={() => setShowAddSchedule(!showAddSchedule)}>
                {showAddSchedule ? 'Cancel' : '+ Add Time'}
              </Button>
            </div>

            {showAddSchedule && (
              <form onSubmit={handleAddSchedule} className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Time</label>
                    <input
                      type="time"
                      value={schedTime}
                      onChange={e => setSchedTime(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Volunteer</label>
                    <input
                      type="text"
                      value={schedCaregiver}
                      onChange={e => setSchedCaregiver(e.target.value)}
                      placeholder="Caregiver name"
                      className="w-full border border-gray-300 rounded-lg px-2 py-1 text-xs outline-none"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" size="xs" className="w-full justify-center">Save Scheduled Slot</Button>
              </form>
            )}

            <div className="space-y-2">
              {schedules.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No scheduled feedings registered.</p>
              ) : (
                schedules.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 bg-gray-55 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">⏰ {s.time}</span>
                      <span className="text-sm text-gray-700 font-medium">{s.caregiver}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded-lg text-xs"
                      aria-label={`Remove schedule for ${s.caregiver}`}
                    >
                      ❌
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
            ℹ️ Scheduled reminders help coordinate feeding cycles and spay/neuter operations among community volunteers.
          </div>
        </div>

      </div>

      {/* Historical logs list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <span>📋</span> Feeding History
          </h3>
        </div>
        {feedingLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No structured feeding history logged yet. Use the logger above to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3">Date & Time</th>
                  <th className="px-6 py-3">Caregiver</th>
                  <th className="px-6 py-3">Food Diet</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Sighting/Activity Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {feedingLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap text-gray-500">{log.date}</td>
                    <td className="px-6 py-3.5 font-medium text-gray-900">{log.caregiver}</td>
                    <td className="px-6 py-3.5"><span className="bg-amber-50 text-amber-800 text-xs font-semibold px-2 py-1 rounded-md">{log.food}</span></td>
                    <td className="px-6 py-3.5 font-semibold">{log.quantity}</td>
                    <td className="px-6 py-3.5 text-gray-600 italic max-w-xs truncate">{log.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
