const API_KEY = import.meta.env.VITE_CAT_API_KEY
const BASE_URL = 'https://api.thecatapi.com/v1'

const headers = {
  'x-api-key': API_KEY
}

export async function getRandomCat() {
  try {
    const res = await fetch(`${BASE_URL}/images/search?has_breeds=1`, { headers })
    if (!res.ok) throw new Error('Failed to fetch cat')
    const data = await res.json()
    return data[0] // { id, url, width, height, breeds: [...] }
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getRandomCatGif() {
  try {
    const res = await fetch(`${BASE_URL}/images/search?mime_types=gif`, { headers })
    if (!res.ok) throw new Error('Failed to fetch cat gif')
    const data = await res.json()
    return data[0]
  } catch (error) {
    console.error(error)
    return null
  }
}
