import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTraps(colonyId) {
  const [traps, setTraps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTraps()
  }, [colonyId])

  async function fetchTraps() {
    setLoading(true)
    setError(null)
    let query = supabase.from('traps').select('*, profiles:public_profiles(name)').order('created_at', { ascending: false })
    if (colonyId) query = query.eq('colony_id', colonyId)
    const { data, error: fetchErr } = await query
    if (!fetchErr) setTraps(data || [])
    else setError(fetchErr)
    setLoading(false)
  }

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

  async function deleteTrap(id) {
    const { error } = await supabase.from('traps').delete().eq('id', id)
    if (error) throw error
    setTraps(prev => prev.filter(t => t.id !== id))
  }

  return { traps, loading, error, fetchTraps, createTrap, updateTrap, deleteTrap }
}
