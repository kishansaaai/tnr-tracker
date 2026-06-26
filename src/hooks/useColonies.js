import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook to fetch all colony locations and manage real-time updates.
 * Provides helper functions to create, update, and delete colonies.
 * Uses realtime updates as the single source of truth for local state updates.
 * 
 * @returns {object} Hook utilities: { colonies, loading, error, fetchColonies, createColony, updateColony, deleteColony }
 */
export function useColonies() {
  const [colonies, setColonies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchColonies()
    
    const channel = supabase
      .channel('colonies-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'colonies' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setColonies(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setColonies(prev => prev.map(c => c.id === payload.new.id ? payload.new : c))
        } else if (payload.eventType === 'DELETE') {
          setColonies(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchColonies() {
    setLoading(true)
    setError(null)
    const { data, error: fetchErr } = await supabase
      .from('colonies')
      .select('*')
      .order('created_at', { ascending: false })
    if (!fetchErr) setColonies(data || [])
    else setError(fetchErr)
    setLoading(false)
  }

  async function createColony(colonyData) {
    const { data, error } = await supabase
      .from('colonies')
      .insert(colonyData)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function updateColony(id, updates) {
    const { data, error } = await supabase
      .from('colonies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function deleteColony(id) {
    const { error } = await supabase.from('colonies').delete().eq('id', id)
    if (error) throw error
  }

  return { colonies, loading, error, fetchColonies, createColony, updateColony, deleteColony }
}

/**
 * Custom hook to fetch and manage a single colony location.
 * Uses realtime updates as the single source of truth for incremental updates.
 * 
 * @param {string} id - UUID of the colony to fetch.
 * @returns {object} Hook utilities: { colony, loading, error, fetchColony, updateColony, deleteColony }
 */
export function useColony(id) {
  const [colony, setColony] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    fetchColony()

    const channel = supabase
      .channel(`colony-single-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'colonies', filter: `id=eq.${id}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setColony(null)
        } else {
          setColony(payload.new)
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  async function fetchColony() {
    setLoading(true)
    setError(null)
    const { data, error: fetchErr } = await supabase
      .from('colonies')
      .select('*')
      .eq('id', id)
      .single()
    if (!fetchErr) setColony(data)
    else setError(fetchErr)
    setLoading(false)
  }

  async function updateColony(updates) {
    const { data, error } = await supabase
      .from('colonies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function deleteColony() {
    const { error } = await supabase.from('colonies').delete().eq('id', id)
    if (error) throw error
  }

  return { colony, loading, error, fetchColony, updateColony, deleteColony }
}
