import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useColonies() {
  const [colonies, setColonies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchColonies()
  }, [])

  async function fetchColonies() {
    setLoading(true)
    const { data, error } = await supabase
      .from('colonies')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setColonies(data || [])
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

  return { colonies, loading, fetchColonies, createColony, updateColony, deleteColony }
}

export function useColony(id) {
  const [colony, setColony] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchColony()
  }, [id])

  async function fetchColony() {
    setLoading(true)
    const { data, error } = await supabase
      .from('colonies')
      .select('*')
      .eq('id', id)
      .single()
    if (!error) setColony(data)
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

  return { colony, loading, fetchColony, updateColony, deleteColony }
}
