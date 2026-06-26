/**
 * Formats database errors into user-friendly messages.
 * @param {Error|object|string} err - The error object or string returned from supabase or network.
 * @returns {string} User-friendly error message.
 */
export function friendlyError(err) {
  if (!err) return 'Something went wrong. Please try again.'
  const msg = err.message || err.toString()
  if (msg.includes('duplicate key')) return 'This record already exists.'
  if (msg.includes('violates foreign key')) return 'Related record not found.'
  if (msg.includes('permission denied') || msg.includes('row-level security')) return 'You don\'t have permission to do that.'
  return 'Something went wrong. Please try again.'
}

/**
 * Calculates the geodetic distance between two points on the Earth's surface using the Haversine formula.
 * @param {number} lat1 - Latitude of the first point in decimal degrees.
 * @param {number} lng1 - Longitude of the first point in decimal degrees.
 * @param {number} lat2 - Latitude of the second point in decimal degrees.
 * @param {number} lng2 - Longitude of the second point in decimal degrees.
 * @returns {number} Geodetic distance in kilometers.
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth's mean radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Strips backticks and angle brackets from a string to prevent prompt injection
 * when embedding user-controlled data into AI prompts. Truncates to 500 chars.
 * @param {string} str - Raw user input to sanitize.
 * @returns {string} Sanitized string safe for AI prompt embedding.
 */
export function sanitizeForPrompt(str) {
  return String(str || '').replace(/[`<>]/g, '').slice(0, 500)
}

/**
 * Solves the Traveling Salesperson Problem (TSP) using a nearest-neighbor greedy heuristic
 * (using Euclidean distance calculations for rapid coordinate selection) followed by a
 * 2-opt improvement pass (using Haversine distance calculations for precise geodetic path refinement).
 * 
 * @param {Array<{id: string, lat: number, lng: number}>} traps - Array of trap coordinates.
 * @returns {Array} Ordered route of traps starting from traps[0].
 */
export function computeRoute(traps) {
  if (traps.length <= 1) return traps
  const remaining = [...traps]
  let route = [remaining.shift()]

  // Nearest-neighbor greedy using Euclidean distance
  while (remaining.length > 0) {
    const last = route[route.length - 1]
    let nearest = 0
    let nearestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      // Euclidean distance squared (faster than Math.sqrt)
      const dist = Math.pow(last.lat - remaining[i].lat, 2) + Math.pow(last.lng - remaining[i].lng, 2)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = i
      }
    }
    route.push(remaining.splice(nearest, 1)[0])
  }

  // Helper function to calculate total route distance in Haversine
  const getRouteDistance = (r) => {
    let d = 0
    for (let i = 0; i < r.length - 1; i++) {
      d += haversineDistance(r[i].lat, r[i].lng, r[i+1].lat, r[i+1].lng)
    }
    return d
  }

  // 2-opt refinement using Haversine distance (max 200 iterations or delta < 0.0001)
  let bestDist = getRouteDistance(route)
  let improved = true
  let iterations = 0
  
  while (improved && iterations < 200) {
    improved = false
    iterations++
    for (let i = 1; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const newRoute = [...route]
        const segment = newRoute.splice(i, j - i + 1)
        segment.reverse()
        newRoute.splice(i, 0, ...segment)
        
        const newDist = getRouteDistance(newRoute)
        if (bestDist - newDist > 0.0001) {
          route = newRoute
          bestDist = newDist
          improved = true
        }
      }
    }
  }

  return route
}

/**
 * Searches a text block for a keyword, ensuring it is not preceded by any negation terms
 * (e.g. "not", "never", "no longer") in the local preceding clause context.
 * 
 * @param {string} text - The text block (e.g. cat description or health notes) to search.
 * @param {string} keyword - The target word or trait to look for.
 * @returns {boolean} True if the keyword is found and is not negated; false otherwise.
 */
export function hasKeywordWithoutNegation(text, keyword) {
  let searchFrom = 0
  const normalized = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()
  
  while (true) {
    const idx = normalized.indexOf(lowerKeyword, searchFrom)
    if (idx === -1) return false
    
    const precedingAll = normalized.slice(0, idx)
    
    // Split sentences or conjunction clauses
    const clauseStartIdx = Math.max(
      precedingAll.lastIndexOf('.'),
      precedingAll.lastIndexOf(','),
      precedingAll.lastIndexOf(';'),
      precedingAll.lastIndexOf('!'),
      precedingAll.lastIndexOf('?'),
      precedingAll.lastIndexOf(' but '),
      precedingAll.lastIndexOf(' and '),
      precedingAll.lastIndexOf('\n')
    )
    const clauseStart = clauseStartIdx === -1 ? 0 : (clauseStartIdx + 1)
    const startOfSearch = Math.max(clauseStart, idx - 40)
    const precedingClauseText = precedingAll.slice(startOfSearch).trim()
    
    const words = precedingClauseText.split(/[\s\-_]+/).filter(Boolean)
    
    const denylist = [
      'not', 'no', 'never', "isn't", "aren't", "doesn't", "won't", 
      "wasn't", "couldn't", "shouldn't", "can't", 'hardly', 'barely', 
      'formerly', 'previously', 'used to be', 'no longer', 'not at all'
    ]
    
    const isNegated = denylist.some(neg => {
      if (neg.includes(' ')) {
        return precedingClauseText.includes(neg)
      }
      return words.includes(neg)
    })
    
    if (!isNegated) return true
    searchFrom = idx + lowerKeyword.length
  }
}

