import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Helper to upload a cat photo to Supabase storage.
 * 
 * @param {File} file - The file to upload.
 * @param {string} catId - The UUID of the cat.
 * @returns {Promise<string>} Public URL of the uploaded image.
 */
export async function uploadCatPhoto(file, catId) {
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

/**
 * Custom hook to manage and fetch cats for a specific colony.
 * Realtime updates are used as the single source of truth for incremental updates.
 * 
 * @param {string} colonyId - The UUID of the colony to fetch cats for.
 * @returns {object} Hook utilities: { cats, loading, error, fetchCats, addCat, updateCat, deleteCat, uploadCatPhoto }
 */
export function useCats(colonyId) {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (colonyId) fetchCats()
    else setLoading(false)

    if (!colonyId) return

    const channel = supabase
      .channel(`cats-colony-${colonyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cats', filter: `colony_id=eq.${colonyId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCats(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setCats(prev => prev.map(c => c.id === payload.new.id ? payload.new : c))
        } else if (payload.eventType === 'DELETE') {
          setCats(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [colonyId])

  async function fetchCats(append = false, targetPage = 0) {
    if (!append) {
      setLoading(true)
      setPage(0)
    }
    setError(null)
    let query = supabase
      .from('cats')
      .select('*')
      .order('created_at', { ascending: false })
      .range(targetPage * PAGE_SIZE, (targetPage + 1) * PAGE_SIZE - 1)
    if (colonyId) query = query.eq('colony_id', colonyId)
    const { data, error: fetchErr } = await query
    if (!fetchErr) {
      if (append) {
        setCats(prev => [...prev, ...(data || [])])
      } else {
        setCats(data || [])
      }
      setHasMore((data || []).length === PAGE_SIZE)
    }
    else setError(fetchErr)
    setLoading(false)
  }

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchCats(true, nextPage)
  }

  async function addCat(catData) {
    const { data, error } = await supabase
      .from('cats')
      .insert(catData)
      .select()
      .single()
    if (error) throw error
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
    return data
  }

  async function deleteCat(id) {
    const { error } = await supabase.from('cats').delete().eq('id', id)
    if (error) throw error
  }

  return { cats, loading, error, fetchCats, addCat, updateCat, deleteCat, uploadCatPhoto, hasMore, loadMore }
}

/**
 * Custom hook to fetch all cats across all colonies.
 * Realtime updates are used as the single source of truth for incremental updates.
 * 
 * @returns {object} Hook utilities: { cats, loading, error, fetchAllCats, addCat, updateCat, deleteCat }
 */
export function useAllCats() {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 1000
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchAllCats()
    
    const channel = supabase
      .channel('cats-all-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cats' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCats(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setCats(prev => prev.map(c => c.id === payload.new.id ? payload.new : c))
        } else if (payload.eventType === 'DELETE') {
          setCats(prev => prev.filter(c => c.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchAllCats(append = false, targetPage = 0) {
    if (!append) {
      setLoading(true)
      setPage(0)
    }
    setError(null)
    const { data, error: fetchErr } = await supabase
      .from('cats')
      .select('*')
      .order('created_at', { ascending: false })
      .range(targetPage * PAGE_SIZE, (targetPage + 1) * PAGE_SIZE - 1)
    if (!fetchErr) {
      if (append) {
        setCats(prev => [...prev, ...(data || [])])
      } else {
        setCats(data || [])
      }
      setHasMore((data || []).length === PAGE_SIZE)
    }
    else setError(fetchErr)
    setLoading(false)
  }

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchAllCats(true, nextPage)
  }

  async function addCat(catData) {
    const { data, error } = await supabase
      .from('cats')
      .insert(catData)
      .select()
      .single()
    if (error) throw error
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
    return data
  }

  async function deleteCat(id) {
    const { error } = await supabase.from('cats').delete().eq('id', id)
    if (error) throw error
  }

  return { cats, loading, error, fetchAllCats, addCat, updateCat, deleteCat, hasMore, loadMore }
}
