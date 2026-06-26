import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook to fetch and manage trap data for a colony.
 * Supports paginated loading, filtering by colony, and creating, updating, or deleting traps.
 * 
 * @param {string} [colonyId] - Optional UUID of the colony to filter traps by.
 * @returns {object} Hook utilities including traps state, loading/error states, and management functions.
 */
export function useTraps(colonyId) {
  const [traps, setTraps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchTraps()
  }, [colonyId])

  /**
   * Fetches traps from the database with pagination support.
   * 
   * @param {boolean} [append=false] - Whether to append new results to the existing state (useful for loadMore).
   * @param {number} [targetPage=0] - The zero-indexed page number to fetch.
   * @returns {Promise<void>}
   */
  async function fetchTraps(append = false, targetPage = 0) {
    if (!append) {
      setLoading(true)
      setPage(0)
    }
    setError(null)
    let query = supabase
      .from('traps')
      .select('*, profiles:public_profiles(name)')
      .order('created_at', { ascending: false })
      .range(targetPage * PAGE_SIZE, (targetPage + 1) * PAGE_SIZE - 1)
    if (colonyId) query = query.eq('colony_id', colonyId)
    const { data, error: fetchErr } = await query
    if (!fetchErr) {
      if (append) {
        setTraps(prev => [...prev, ...(data || [])])
      } else {
        setTraps(data || [])
      }
      setHasMore((data || []).length === PAGE_SIZE)
    }
    else setError(fetchErr)
    setLoading(false)
  }

  /**
   * Increments the page number and fetches the next batch of traps.
   */
  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchTraps(true, nextPage)
  }

  /**
   * Creates a new trap record in the database and updates local state.
   * 
   * @param {object} trapData - The fields for the new trap.
   * @returns {Promise<object>} The newly created trap object.
   */
  async function createTrap(trapData) {
    const { data, error } = await supabase
      .from('traps')
      .insert(trapData)
      .select('*, profiles:public_profiles(name)')
      .single()
    if (error) throw error
    setTraps(prev => [data, ...prev])
    return data
  }

  /**
   * Updates an existing trap record in the database and updates local state.
   * 
   * @param {string} id - The UUID of the trap to update.
   * @param {object} updates - The fields/values to update.
   * @returns {Promise<object>} The updated trap object.
   */
  async function updateTrap(id, updates) {
    const { data, error } = await supabase
      .from('traps')
      .update(updates)
      .eq('id', id)
      .select('*, profiles:public_profiles(name)')
      .single()
    if (error) throw error
    setTraps(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  /**
   * Deletes a trap record from the database and updates local state.
   * 
   * @param {string} id - The UUID of the trap to delete.
   * @returns {Promise<void>}
   */
  async function deleteTrap(id) {
    const { error } = await supabase.from('traps').delete().eq('id', id)
    if (error) throw error
    setTraps(prev => prev.filter(t => t.id !== id))
  }

  return { traps, loading, error, fetchTraps, createTrap, updateTrap, deleteTrap, hasMore, loadMore }
}

