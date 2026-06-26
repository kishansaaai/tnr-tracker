import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRecoveries() {
  const [recoveries, setRecoveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecoveries()
  }, [])

  async function fetchRecoveries() {
    setLoading(true)
    setError(null)
    const { data, error: fetchErr } = await supabase
      .from('recoveries')
      .select('*, cats(name, gender, photo_url, colony_id), colonies(name), profiles:public_profiles(name), medications(*)')
      .order('created_at', { ascending: false })
    if (!fetchErr) setRecoveries(data || [])
    else setError(fetchErr)
    setLoading(false)
  }

  async function createRecovery(recoveryData) {
    const { data, error } = await supabase
      .from('recoveries')
      .insert(recoveryData)
      .select('*, cats(name, gender, photo_url, colony_id), colonies(name), profiles:public_profiles(name), medications(*)')
      .single()
    if (error) throw error
    setRecoveries(prev => [data, ...prev])
    return data
  }

  async function updateRecovery(id, updates) {
    const { data, error } = await supabase
      .from('recoveries')
      .update(updates)
      .eq('id', id)
      .select('*, cats(name, gender, photo_url, colony_id), colonies(name), profiles:public_profiles(name), medications(*)')
      .single()
    if (error) throw error
    setRecoveries(prev => prev.map(r => r.id === id ? data : r))
    return data
  }

  async function deleteRecovery(id) {
    const { error } = await supabase.from('recoveries').delete().eq('id', id)
    if (error) throw error
    setRecoveries(prev => prev.filter(r => r.id !== id))
  }

  async function addMedication(medData) {
    const { data, error } = await supabase
      .from('medications')
      .insert(medData)
      .select()
      .single()
    if (error) throw error
    setRecoveries(prev => prev.map(r => {
      if (r.id === medData.recovery_id) {
        return { ...r, medications: [...(r.medications || []), data] }
      }
      return r
    }))
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
    setRecoveries(prev => prev.map(r => ({
      ...r,
      medications: (r.medications || []).map(m => m.id === id ? data : m)
    })))
    return data
  }

  async function deleteMedication(id) {
    const { error } = await supabase.from('medications').delete().eq('id', id)
    if (error) throw error
    setRecoveries(prev => prev.map(r => ({
      ...r,
      medications: (r.medications || []).filter(m => m.id !== id)
    })))
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
  }
}

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
