import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCats(colonyId) {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (colonyId) fetchCats()
    else setLoading(false)
  }, [colonyId])

  async function fetchCats() {
    setLoading(true)
    const query = supabase.from('cats').select('*').order('created_at', { ascending: false })
    if (colonyId) query.eq('colony_id', colonyId)
    const { data, error } = await query
    if (!error) setCats(data || [])
    setLoading(false)
  }

  async function addCat(catData) {
    const { data, error } = await supabase
      .from('cats')
      .insert(catData)
      .select()
      .single()
    if (error) throw error
    setCats(prev => [data, ...prev])
    return data
  }

  async function updateCat(id, updates) {
    const { data, error } = await supabase
      .from('cats')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setCats(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  async function deleteCat(id) {
    const { error } = await supabase.from('cats').delete().eq('id', id)
    if (error) throw error
    setCats(prev => prev.filter(c => c.id !== id))
  }

  async function uploadCatPhoto(file, catId) {
    const ext = file.name.split('.').pop()
    const path = `${catId}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('cat-photos')
      .upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('cat-photos').getPublicUrl(path)
    return data.publicUrl
  }

  return { cats, loading, fetchCats, addCat, updateCat, deleteCat, uploadCatPhoto }
}

export function useAllCats() {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllCats()
  }, [])

  async function fetchAllCats() {
    setLoading(true)
    const { data, error } = await supabase
      .from('cats')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setCats(data || [])
    setLoading(false)
  }

  return { cats, loading, fetchAllCats }
}
