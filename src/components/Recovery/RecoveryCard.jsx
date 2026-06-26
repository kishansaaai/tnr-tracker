import { useState, useEffect } from 'react'
import { getRecoveryUrgency } from '../../hooks/useRecovery'
import { Badge } from '../UI/Badge'
import { Button } from '../UI/Button'

/**
 * Component representing a card in the post-operative recovery ward dashboard.
 * Displays spay/neuter hold timelines, urgent recovery conditions, and allows logging medications.
 * 
 * @param {object} props - Component properties.
 * @param {object} props.recovery - The recovery record including the cat details and medications.
 * @param {function} props.onRelease - Callback function to release the cat back to its colony.
 * @param {function} props.onAddMed - Callback to register a new medication for the cat.
 * @param {function} props.onMarkMed - Callback to toggle a medication administration status.
 * @param {function} props.onDelete - Callback to delete the recovery record.
 */
export function RecoveryCard({ recovery, onRelease, onAddMed, onMarkMed, onDelete }) {
  const [timeLeft, setTimeLeft] = useState(getRecoveryUrgency(recovery.release_date))
  const [showMedForm, setShowMedForm] = useState(false)
  const [medForm, setMedForm] = useState({ name: '', dosage: '', frequency: 'daily' })

  useEffect(() => {
    let cancelled = false
    const interval = setInterval(() => {
      if (!cancelled) setTimeLeft(getRecoveryUrgency(recovery.release_date))
    }, 60000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [recovery.release_date])

  const urgencyColors = {
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
  }

  const surgeryLabels = {
    spay_neuter: 'Spay/Neuter',
    medical: 'Medical',
    dental: 'Dental',
    other: 'Other',
  }

  function handleAddMed(e) {
    e.preventDefault()
    onAddMed(recovery.id, medForm)
    setMedForm({ name: '', dosage: '', frequency: 'daily' })
    setShowMedForm(false)
  }

  const meds = recovery.medications || []
  const pendingMeds = meds.filter(m => !m.completed)
  const isReleased = recovery.status === 'released'

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
      isReleased ? 'opacity-60' : ''
    } ${timeLeft.overdue && !isReleased ? 'ring-2 ring-red-300 animate-pulse' : ''}`}>
      {/* Header with countdown */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${urgencyColors[timeLeft.color]}`}>
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold">⏱️</div>
          <div>
            <div className="text-sm font-bold">{timeLeft.label}</div>
            {recovery.release_date && (
              <div className="text-xs opacity-75">
                Release: {new Date(recovery.release_date).toLocaleString()}
              </div>
            )}
          </div>
        </div>
        <Badge status={recovery.status === 'released' ? 'managed' : recovery.status === 'complications' ? 'unmanaged' : 'in_progress'}>
          {recovery.status === 'released' ? 'Released' : recovery.status === 'complications' ? 'Complications' : 'Recovering'}
        </Badge>
      </div>

      {/* Cat info */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {recovery.cats?.photo_url ? (
            <img src={recovery.cats.photo_url} alt={recovery.cats?.name} className="w-12 h-12 rounded-lg object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-xl font-bold text-green-600">
              🐱
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900">{recovery.cats?.name || 'Unnamed Cat'}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{surgeryLabels[recovery.surgery_type]}</span>
              <span>•</span>
              <span>{recovery.colonies?.name || 'Unknown colony'}</span>
            </div>
          </div>
        </div>

        {recovery.vet_notes && (
          <div className="bg-blue-50 rounded-lg p-2.5 mb-3 text-xs text-blue-700">
            <span className="font-medium">Vet Notes:</span> {recovery.vet_notes}
          </div>
        )}

        {/* Medication checklist */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Medications ({pendingMeds.length} pending)
            </h4>
            {!isReleased && (
              <button
                onClick={() => setShowMedForm(!showMedForm)}
                className="text-xs text-green-700 hover:text-green-800 font-medium"
              >
                {showMedForm ? 'Cancel' : '+ Add'}
              </button>
            )}
          </div>

          {showMedForm && (
            <form onSubmit={handleAddMed} className="bg-gray-50 rounded-lg p-3 mb-2 space-y-2">
              <input
                required
                value={medForm.name}
                onChange={e => setMedForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Medication name (e.g. Meloxicam)"
                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex gap-2">
                <input
                  value={medForm.dosage}
                  onChange={e => setMedForm(p => ({ ...p, dosage: e.target.value }))}
                  placeholder="Dosage (e.g. 0.5ml)"
                  className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
                <select
                  value={medForm.frequency}
                  onChange={e => setMedForm(p => ({ ...p, frequency: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="once">Once</option>
                  <option value="daily">Daily</option>
                  <option value="twice_daily">2x Daily</option>
                  <option value="every_8h">Every 8h</option>
                </select>
              </div>
              <Button type="submit" size="xs" className="w-full">Add Medication</Button>
            </form>
          )}

          {meds.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No medications scheduled</p>
          ) : (
            <div className="space-y-1.5">
              {meds.map(med => (
                <div
                  key={med.id}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-all ${
                    med.completed ? 'bg-green-50 line-through text-gray-400' : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  <button
                    onClick={() => onMarkMed(med.id, !med.completed)}
                    disabled={isReleased}
                    aria-label={med.completed ? `Mark ${med.name} as incomplete` : `Mark ${med.name} as completed`}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      med.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {med.completed && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{med.name}</span>
                    {med.dosage && <span className="text-xs text-gray-500 ml-1">({med.dosage})</span>}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{med.frequency}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isReleased && (
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <Button 
              size="xs" 
              className="flex-1" 
              onClick={() => onRelease(recovery.id)}
              aria-label="Release recovered cat back to colony"
            >
              ✅ Release Cat
            </Button>
            <Button size="xs" variant="danger" onClick={() => onDelete(recovery.id)} aria-label="Delete recovery record">
              🗑️
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
