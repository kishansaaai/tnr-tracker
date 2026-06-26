import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook to fetch all colony locations and manage real-time updates.
 * Provides helper functions to create, update, and delete colonies.
 * 
 * @returns {object} Hook utilities: { colonies, loading, fetchColonies, createColony, updateColony, deleteColony }
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
    setColonies(prev => [data, ...prev])
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
    setColonies(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  async function deleteColony(id) {
    const { error } = await supabase.from('colonies').delete().eq('id', id)
    if (error) throw error
    setColonies(prev => prev.filter(c => c.id !== id))
  }

  return { colonies, loading, error, fetchColonies, createColony, updateColony, deleteColony }
}

/**
 * Custom hook to fetch and manage a single colony location.
 * 
 * @param {string} id - UUID of the colony to fetch.
 * @returns {object} Hook utilities: { colony, loading, fetchColony, updateColony, deleteColony }
 */
export function useColony(id) {
  const [colony, setColony] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    fetchColony()
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
    setColony(data)
    return data
  }

  async function deleteColony() {
    const { error } = await supabase.from('colonies').delete().eq('id', id)
    if (error) throw error
  }

  return { colony, loading, error, fetchColony, updateColony, deleteColony }
}
