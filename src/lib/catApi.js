import { supabase } from './supabase'

export async function getRandomCat() {
  try {
    const { data, error } = await supabase.functions.invoke('cat-api-proxy', {
      body: { action: 'image' }
    })
    if (error) throw error
    return data
  } catch (error) {
    return null
  }
}

export async function getRandomCatGif() {
  try {
    const { data, error } = await supabase.functions.invoke('cat-api-proxy', {
      body: { action: 'gif' }
    })
    if (error) throw error
    return data
  } catch (error) {
    return null
  }
}
