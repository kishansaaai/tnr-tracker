import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useColony } from '../hooks/useColonies'
import { useCats } from '../hooks/useCats'
import { useTraps } from '../hooks/useTraps'
import { useUpdates } from '../hooks/useUpdates'
import { useAuth } from '../hooks/useAuth.jsx'
import { Badge } from '../components/UI/Badge'
import { Button } from '../components/UI/Button'
import { CatCard } from '../components/Cats/CatCard'
import { AddCatForm } from '../components/Cats/AddCatForm'
import { TrapList } from '../components/Traps/TrapList'
import { ActivityFeed } from '../components/Colony/ActivityFeed'
import { HealthReport } from '../components/Colony/HealthReport'
import { ColonyScore } from '../components/Colony/ColonyScore'
import { FeedAnimation } from '../components/Colony/FeedAnimation'
import { TNROverlay } from '../components/Colony/TNROverlay'
import { CardSkeleton, CatSkeleton } from '../components/UI/Skeleton'
import { openVetSummary } from '../lib/vetExport'
import toast from 'react-hot-toast'
import { friendlyError } from '../lib/utils'

export default function ColonyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { colony, loading: colonyLoading, updateColony, deleteColony } = useColony(id)
  const { cats, loading: catsLoading, addCat, deleteCat, uploadCatPhoto } = useCats(id)
  const { traps, updateTrap, deleteTrap } = useTraps(id)
  const { updates, postUpdate } = useUpdates(id)
  const { user, isAdmin } = useAuth()

  const [activeTab, setActiveTab] = useState('cats')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [showAddCat, setShowAddCat] = useState(false)
  const [isFeeding, setIsFeeding] = useState(false)
  const [showTNR, setShowTNR] = useState(false)
  const [visibleCatsCount, setVisibleCatsCount] = useState(10)

  const neuteredCount = cats.filter(cat => cat.neutered).length
  const neuteredPct = cats.length > 0 ? Math.round((neuteredCount / cats.length) * 100) : 0

  async function handleAddCat(formData, photoFile) {
    try {
      let photo_url = ''
      if (photoFile) {
        const tempId = `temp-${Date.now()}`
        photo_url = await uploadCatPhoto(photoFile, tempId)
      }

      await addCat({
        ...formData,
        colony_id: id,
        logged_by: user.id,
        photo_url,
      })

      const catName = formData.name ? ` - ${formData.name}` : ''
      await postUpdate(`New cat logged${catName} (${formData.neutered ? 'neutered' : 'intact'})`, user.id)
      
      if (formData.neutered) {
        setShowTNR(true)
      } else {
        toast.success('Cat logged')
      }
      setShowAddCat(false)
    } catch (e) {
      toast.error(friendlyError(e))
      throw e
    }
  }

  async function handleDeleteCat(catId) {
    try {
      await deleteCat(catId)
      toast.success('Cat removed')
    } catch (e) {
      toast.error(friendlyError(e))
    }
  }

  async function handleUpdateColony(e) {
    e.preventDefault()
    try {
      await updateColony(editForm)
      toast.success('Colony updated')
      setEditing(false)
    } catch (e) {
      toast.error(friendlyError(e))
    }
  }

  async function handleDeleteColony() {
    if (!window.confirm('Are you sure you want to delete this colony? This will remove all associated cat records and traps.')) return
    try {
      await deleteColony()
      toast.success('Colony deleted')
      navigate('/')
    } catch (e) {
      toast.error(friendlyError(e))
    }
  }

  async function handleFeedColony() {
    setIsFeeding(true)
    try {
      await postUpdate(`Colony was fed 🐟`, user?.id)
      toast.success('Feeding logged')
    } catch (e) {
      toast.error('Failed to log feed')
    }
  }

  if (colonyLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <CardSkeleton />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  if (!colony) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-sm font-bold tracking-wide text-gray-400 mb-4">NOT FOUND</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Colony not found</h2>
        <Link to="/" className="text-green-700 hover:underline text-sm">Back to map</Link>
      </div>
    )
  }

  const tabs = [
    { id: 'cats', label: `Cats (${cats.length})`, short: 'Cats' },
    { id: 'traps', label: `Traps (${traps.length})`, short: 'Traps' },
    { id: 'activity', label: 'Activity', short: 'Feed' },
    { id: 'health', label: 'AI Report', short: 'AI' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/" className="text-sm text-gray-500 hover:text-green-700 transition-colors inline-flex items-center gap-1 mb-4">
        Back to map
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
        {editing ? (
          <form onSubmit={handleUpdateColony} className="space-y-4">
            <input
              value={editForm.name || ''}
              onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full text-2xl font-bold border-b border-gray-300 pb-1 focus:outline-none focus:border-green-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editForm.status || ''}
                  onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="unmanaged">Unmanaged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="managed">Managed</option>
                </select>
              </div>
            </div>
            <textarea
              value={editForm.description || ''}
              onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              placeholder="Description..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
            <div className="flex gap-3">
              <Button type="submit" size="sm" aria-label="Save colony changes">Save changes</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)} aria-label="Cancel editing colony">Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{colony.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge status={colony.status} />
                  <span className="text-sm text-gray-500">
                    {colony.lat.toFixed(4)}, {colony.lng.toFixed(4)}
                  </span>
                </div>
                {colony.description && (
                  <p className="text-sm text-gray-600 mt-2">{colony.description}</p>
                )}
              </div>
              <div className="flex gap-2 items-start">
                <Button 
                  size="sm" 
                  onClick={handleFeedColony}
                  className="bg-blue-500 hover:bg-blue-600 text-white border-blue-600 shadow-sm transition-transform active:scale-95"
                  aria-label="Feed colony"
                >
                  Feed Colony 🐟
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditForm(colony)
                        setEditing(true)
                      }}
                      aria-label="Edit colony details"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDeleteColony}
                      aria-label="Delete colony"
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{cats.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Total Cats</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{neuteredCount}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Neutered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{traps.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Traps</div>
              </div>
            </div>

            <div className="mt-6 pt-2">
              <ColonyScore cats={cats} colony={colony} />
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${neuteredPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {neuteredCount} of {cats.length} cats neutered
                {neuteredPct >= 70 && ' - great progress'}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 px-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow text-green-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.short}</span>
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'cats' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Cat Roster</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => openVetSummary(cats, [colony])} aria-label="Export colony data for veterinarian">
                  🏥 Vet Export
                </Button>
                <Button size="sm" onClick={() => setShowAddCat(!showAddCat)} aria-label={showAddCat ? 'Cancel logging cat' : 'Log a new cat to this colony'}>
                  {showAddCat ? 'Cancel' : '+ Log Cat'}
                </Button>
              </div>
            </div>

            {showAddCat && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4 shadow-sm">
                <h3 className="font-medium text-gray-900 mb-4">Log a new cat</h3>
                <AddCatForm onAdd={handleAddCat} />
              </div>
            )}

            {catsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <CatSkeleton key={i} />)}
              </div>
            ) : cats.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-sm font-bold tracking-wide text-gray-400 mb-3">CAT ROSTER</div>
                <h3 className="font-medium text-gray-900 mb-1">No cats logged yet</h3>
                <p className="text-sm text-gray-500">Be the first to add a cat to this colony.</p>
                <Button size="sm" className="mt-4" onClick={() => setShowAddCat(true)}>
                  Log first cat
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {cats.slice(0, visibleCatsCount).map(cat => (
                  <CatCard key={cat.id} cat={cat} onDelete={handleDeleteCat} isAdmin={isAdmin} />
                ))}
                {cats.length > visibleCatsCount && (
                  <div className="sm:col-span-2 flex justify-center mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setVisibleCatsCount(prev => prev + 10)}
                      aria-label="Load more cats in roster"
                    >
                      Load More Cats
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'traps' && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">Traps</h2>
            <TrapList
              traps={traps}
              onUpdate={async (trapId, updates) => {
                try {
                  await updateTrap(trapId, updates)
                  toast.success('Trap status updated')
                } catch (e) {
                  toast.error(friendlyError(e))
                }
              }}
              onDelete={async (trapId) => {
                try {
                  await deleteTrap(trapId)
                  toast.success('Trap removed')
                } catch (e) {
                  toast.error(friendlyError(e))
                }
              }}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">
              Activity Feed
              <span className="ml-2 text-xs text-gray-400 font-normal">Live updates</span>
            </h2>
            <ActivityFeed updates={updates} loading={false} onPost={postUpdate} />
          </div>
        )}

        {activeTab === 'health' && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-4">AI Health Analysis</h2>
            <HealthReport colony={colony} cats={cats} updates={updates} />
          </div>
        )}
      </div>

      {/* Micro-animation */}
      <FeedAnimation active={isFeeding} onComplete={() => setIsFeeding(false)} />
      <TNROverlay active={showTNR} onComplete={() => setShowTNR(false)} />
    </div>
  )
}
