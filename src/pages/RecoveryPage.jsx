import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecoveries } from '../hooks/useRecovery'
import { useAllCats } from '../hooks/useCats'
import { useColonies } from '../hooks/useColonies'
import { useAuth } from '../hooks/useAuth.jsx'
import { RecoveryCard } from '../components/Recovery/RecoveryCard'
import { ReleaseOverlay } from '../components/Recovery/ReleaseOverlay'
import { Button } from '../components/UI/Button'
import { CardSkeleton } from '../components/UI/Skeleton'
import toast from 'react-hot-toast'
import { friendlyError } from '../lib/utils'

export default function RecoveryPage() {
  const { recoveries, activeRecoveries, loading, createRecovery, updateRecovery, deleteRecovery, addMedication, updateMedication } = useRecoveries()
  const { cats } = useAllCats()
  const { colonies } = useColonies()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    cat_id: '',
    colony_id: '',
    surgery_type: 'spay_neuter',
    release_date: '',
    vet_notes: '',
  })
  const [showReleased, setShowReleased] = useState(false)
  const [showReleaseAnimation, setShowReleaseAnimation] = useState(false)

  const availableCats = cats.filter(cat => {
    const alreadyRecovering = activeRecoveries.some(r => r.cat_id === cat.id)
    return !alreadyRecovering
  })

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const releaseDate = form.release_date ? new Date(form.release_date).toISOString() : null
      await createRecovery({
        cat_id: form.cat_id,
        colony_id: form.colony_id,
        surgery_type: form.surgery_type,
        release_date: releaseDate,
        vet_notes: form.vet_notes,
        created_by: user.id,
      })
      toast.success('Recovery entry created')
      setShowForm(false)
      setForm({ cat_id: '', colony_id: '', surgery_type: 'spay_neuter', release_date: '', vet_notes: '' })
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleRelease(id) {
    if (!window.confirm('Mark this cat as released and recovered?')) return
    try {
      await updateRecovery(id, { status: 'released' })
      setShowReleaseAnimation(true)
      toast.success('Cat released! 🎉')
    } catch (err) {
      toast.error('Failed to release cat')
    }
  }

  async function handleAddMed(recoveryId, medData) {
    try {
      await addMedication({
        recovery_id: recoveryId,
        name: medData.name,
        dosage: medData.dosage,
        frequency: medData.frequency,
        next_due: new Date().toISOString(),
      })
      toast.success('Medication added')
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleMarkMed(medId, completed) {
    try {
      await updateMedication(medId, { completed })
    } catch (err) {
      toast.error(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this recovery entry?')) return
    try {
      await deleteRecovery(id)
      toast.success('Recovery entry deleted')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const displayedRecoveries = showReleased
    ? recoveries
    : activeRecoveries

  const releasedCount = recoveries.filter(r => r.status === 'released').length
  const complicationsCount = recoveries.filter(r => r.status === 'complications').length

  function handleCatSelect(catId) {
    const cat = cats.find(c => c.id === catId)
    setForm(prev => ({
      ...prev,
      cat_id: catId,
      colony_id: cat?.colony_id || prev.colony_id,
    }))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 relative">
      <ReleaseOverlay active={showReleaseAnimation} onComplete={() => setShowReleaseAnimation(false)} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recovery Ward</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeRecoveries.length} cats recovering • {releasedCount} released
            {complicationsCount > 0 && <span className="text-red-600"> • {complicationsCount} with complications</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowReleased(!showReleased)}
          >
            {showReleased ? 'Active Only' : 'Show All'}
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Recovery'}
          </Button>
        </div>
      </div>

      {/* Add recovery form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Log New Recovery</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cat *</label>
                <select
                  required
                  value={form.cat_id}
                  onChange={e => handleCatSelect(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a cat...</option>
                  {availableCats.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name || 'Unnamed'} ({cat.gender})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colony *</label>
                <select
                  required
                  value={form.colony_id}
                  onChange={e => setForm(p => ({ ...p, colony_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select colony...</option>
                  {colonies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surgery Type</label>
                <select
                  value={form.surgery_type}
                  onChange={e => setForm(p => ({ ...p, surgery_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="spay_neuter">Spay/Neuter</option>
                  <option value="medical">Medical Procedure</option>
                  <option value="dental">Dental</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Release</label>
                <input
                  type="datetime-local"
                  value={form.release_date}
                  onChange={e => setForm(p => ({ ...p, release_date: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vet Notes</label>
              <textarea
                value={form.vet_notes}
                onChange={e => setForm(p => ({ ...p, vet_notes: e.target.value }))}
                rows={2}
                placeholder="Post-op instructions, observations..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
            <Button type="submit" size="sm">Log Recovery</Button>
          </form>
        </div>
      )}

      {/* Recovery cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : displayedRecoveries.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-3">🏥</div>
          <h3 className="font-semibold text-gray-900 mb-1">No cats in recovery</h3>
          <p className="text-sm text-gray-500 mb-4">When a cat comes back from the vet, log their recovery here.</p>
          <Button size="sm" onClick={() => setShowForm(true)}>+ New Recovery</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayedRecoveries.map(recovery => (
            <RecoveryCard
              key={recovery.id}
              recovery={recovery}
              onRelease={handleRelease}
              onAddMed={handleAddMed}
              onMarkMed={handleMarkMed}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
