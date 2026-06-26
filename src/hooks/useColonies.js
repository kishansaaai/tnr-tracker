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
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 1000
  const [hasMore, setHasMore] = useState(true)

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

  /**
   * Fetches colonies from the database with pagination support.
   * 
   * @param {boolean} [append=false] - Whether to append new results to the existing state.
   * @param {number} [targetPage=0] - The zero-indexed page number to fetch.
   * @returns {Promise<void>}
   */
  async function fetchColonies(append = false, targetPage = 0) {
    if (!append) {
      setLoading(true)
      setPage(0)
    }
    setError(null)
    const { data, error: fetchErr } = await supabase
      .from('colonies')
      .select('*')
      .order('created_at', { ascending: false })
      .range(targetPage * PAGE_SIZE, (targetPage + 1) * PAGE_SIZE - 1)
    if (!fetchErr) {
      if (append) {
        setColonies(prev => [...prev, ...(data || [])])
      } else {
        setColonies(data || [])
      }
      setHasMore((data || []).length === PAGE_SIZE)
    }
    else setError(fetchErr)
    setLoading(false)
  }

  /**
   * Increments the page number and fetches the next batch of colonies.
   */
  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchColonies(true, nextPage)
  }

  /**
   * Inserts a new colony into the database.
   * Note: The realtime subscription will automatically update the local state.
   * 
   * @param {object} colonyData - The fields for the new colony.
   * @returns {Promise<object>} The newly created colony object.
   */
  async function createColony(colonyData) {
    const { data, error } = await supabase
      .from('colonies')
      .insert(colonyData)
      .select()
      .single()
    if (error) throw error
    return data
  }

  /**
   * Updates an existing colony in the database.
   * Note: The realtime subscription will automatically update the local state.
   * 
   * @param {string} id - The UUID of the colony to update.
   * @param {object} updates - The fields/values to update.
   * @returns {Promise<object>} The updated colony object.
   */
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

  /**
   * Deletes a colony from the database.
   * Note: The realtime subscription will automatically update the local state.
   * 
   * @param {string} id - The UUID of the colony to delete.
   * @returns {Promise<void>}
   */
  async function deleteColony(id) {
    const { error } = await supabase.from('colonies').delete().eq('id', id)
    if (error) throw error
  }

  return { colonies, loading, error, fetchColonies, createColony, updateColony, deleteColony, hasMore, loadMore }
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
