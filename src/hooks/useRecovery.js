import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook to fetch and manage veterinary recovery records and associated medications.
 * Uses realtime subscriptions as the single source of truth for incremental state updates.
 * Exposes a standard error state.
 * 
 * @returns {object} Hook utilities: { recoveries, activeRecoveries, loading, error, fetchRecoveries, createRecovery, updateRecovery, deleteRecovery, addMedication, updateMedication, deleteMedication }
 */
export function useRecoveries() {
  const [recoveries, setRecoveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 500
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchRecoveries()

    const channel = supabase
      .channel('recoveries-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recoveries' }, (payload) => {
        handleRealtimeEvent(payload)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medications' }, (payload) => {
        handleMedicationRealtimeEvent(payload)
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function handleRealtimeEvent(payload) {
    if (payload.eventType === 'DELETE') {
      setRecoveries(prev => prev.filter(r => r.id !== payload.old.id))
      return
    }
    const { data, error } = await supabase
      .from('recoveries')
      .select('*, cats(name, gender, photo_url, colony_id), colonies(name), profiles:public_profiles(name), medications(*)')
      .eq('id', payload.new.id)
      .single()
    if (!error && data) {
      if (payload.eventType === 'INSERT') {
        setRecoveries(prev => [data, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setRecoveries(prev => prev.map(r => r.id === data.id ? data : r))
      }
    }
  }

  async function handleMedicationRealtimeEvent(payload) {
    const recoveryId = payload.eventType === 'DELETE' ? payload.old.recovery_id : payload.new.recovery_id
    if (!recoveryId) {
      fetchRecoveries()
      return
    }
    const { data, error } = await supabase
      .from('recoveries')
      .select('*, cats(name, gender, photo_url, colony_id), colonies(name), profiles:public_profiles(name), medications(*)')
      .eq('id', recoveryId)
      .single()
    if (!error && data) {
      setRecoveries(prev => prev.map(r => r.id === recoveryId ? data : r))
    }
  }

  async function fetchRecoveries(append = false, targetPage = 0) {
    if (!append) {
      setLoading(true)
      setPage(0)
    }
    setError(null)
    const { data, error: fetchErr } = await supabase
      .from('recoveries')
      .select('*, cats(name, gender, photo_url, colony_id), colonies(name), profiles:public_profiles(name), medications(*)')
      .order('created_at', { ascending: false })
      .range(targetPage * PAGE_SIZE, (targetPage + 1) * PAGE_SIZE - 1)
    if (!fetchErr) {
      if (append) {
        setRecoveries(prev => [...prev, ...(data || [])])
      } else {
        setRecoveries(data || [])
      }
      setHasMore((data || []).length === PAGE_SIZE)
    }
    else setError(fetchErr)
    setLoading(false)
  }

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchRecoveries(true, nextPage)
  }

  async function createRecovery(recoveryData) {
    const { data, error } = await supabase
      .from('recoveries')
      .insert(recoveryData)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function updateRecovery(id, updates) {
    const { data, error } = await supabase
      .from('recoveries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function deleteRecovery(id) {
    const { error } = await supabase.from('recoveries').delete().eq('id', id)
    if (error) throw error
  }

  async function addMedication(medData) {
    const { data, error } = await supabase
      .from('medications')
      .insert(medData)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function updateMedication(id, updates) {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function deleteMedication(id) {
    const { error } = await supabase.from('medications').delete().eq('id', id)
    if (error) throw error
  }

  const activeRecoveries = recoveries.filter(r => r.status === 'recovering')

  return {
    recoveries,
    activeRecoveries,
    loading,
    error,
    fetchRecoveries,
    createRecovery,
    updateRecovery,
    deleteRecovery,
    addMedication,
    updateMedication,
    deleteMedication,
    hasMore,
    loadMore,
  }
}

/**
 * Calculates time urgency details for veterinary recovery holds.
 * 
 * @param {string} releaseDate - ISO date string of scheduled release.
 * @returns {object} Recovery urgency tracking properties.
 */
export function getRecoveryUrgency(releaseDate) {
  if (!releaseDate) return { label: 'No release date', color: 'gray', hours: null }
  const now = new Date()
  const release = new Date(releaseDate)
  const diffMs = release - now
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffMs < 0) return { label: `Overdue by ${Math.abs(hours)}h`, color: 'red', hours, overdue: true }
  if (hours < 12) return { label: `${hours}h ${minutes}m remaining`, color: 'red', hours, overdue: false }
  if (hours < 24) return { label: `${hours}h ${minutes}m remaining`, color: 'amber', hours, overdue: false }
  return { label: `${hours}h remaining`, color: 'green', hours, overdue: false }
}
