import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook to fetch and manage update feed messages for a colony.
 * Subscribes to real-time updates to display new updates instantly.
 * 
 * @param {string} colonyId - UUID of the colony to manage updates for.
 * @returns {object} Hook utilities including updates state, loading, posting functions, and fetch updates.
 */
export function useUpdates(colonyId) {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!colonyId) { setLoading(false); return }
    
    fetchUpdates()

    // Real-time subscription
    const channel = supabase
      .channel(`updates:${colonyId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'updates',
        filter: `colony_id=eq.${colonyId}`
      }, async (payload) => {
        // Fetch the full update with profile info
        const { data } = await supabase
          .from('updates')
          .select('*, profiles:public_profiles(name)')
          .eq('id', payload.new.id)
          .single()
        if (data) setUpdates(prev => {
          if (prev.find(u => u.id === data.id)) return prev
          return [data, ...prev]
        })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [colonyId])

  /**
   * Fetches the initial list of updates for the specified colony.
   * 
   * @returns {Promise<void>}
   */
  async function fetchUpdates() {
    setLoading(true)
    const { data, error } = await supabase
      .from('updates')
      .select('*, profiles:public_profiles(name)')
      .eq('colony_id', colonyId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (!error) setUpdates(data || [])
    setLoading(false)
  }

  /**
   * Posts a new update/message to the colony feed.
   * 
   * @param {string} message - The text content of the update (max 1000 chars).
   * @param {string} userId - The UUID of the user posting the update.
   * @returns {Promise<object>} The newly posted update.
   */
  async function postUpdate(message, userId) {
    if (!message?.trim()) throw new Error('Message cannot be empty')
    if (message.length > 1000) throw new Error('Message must be under 1000 characters')

    const { data, error } = await supabase
      .from('updates')
      .insert({ colony_id: colonyId, message, posted_by: userId })
      .select('*, profiles:public_profiles(name)')
      .single()
    if (error) throw error
    // Real-time will also fire, but we add locally for instant feel
    setUpdates(prev => {
      const exists = prev.find(u => u.id === data.id)
      if (exists) return prev
      return [data, ...prev]
    })
    return data
  }

  return { updates, loading, postUpdate, fetchUpdates }
}
