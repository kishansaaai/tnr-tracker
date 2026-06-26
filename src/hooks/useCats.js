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
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    
    if (file.size > MAX_SIZE) throw new Error('Photo must be under 5MB')
    if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Only JPEG, PNG, WebP, or GIF allowed')
    
    const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[file.type]
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('You must be logged in to upload photos')
    
    const path = `${user.id}/${catId}-${Date.now()}.${ext}`
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
    
    const channel = supabase
      .channel('cats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cats' }, () => {
        fetchAllCats()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
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
