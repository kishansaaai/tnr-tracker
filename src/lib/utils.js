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
 * Solves the Traveling Salesperson Problem using a nearest-neighbor greedy heuristic
 * followed by a 2-opt improvement pass. Uses Haversine distance for geospatial accuracy.
 * @param {Array<{id: string, lat: number, lng: number}>} traps - Array of trap coordinates.
 * @returns {Array} Ordered route of traps starting from traps[0].
 */
export function computeRoute(traps) {
  if (traps.length <= 1) return traps
  const remaining = [...traps]
  const route = [remaining.shift()]

  // Nearest-neighbor greedy
  while (remaining.length > 0) {
    const last = route[route.length - 1]
    let nearest = 0
    let nearestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineDistance(last.lat, last.lng, remaining[i].lat, remaining[i].lng)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = i
      }
    }
    route.push(remaining.splice(nearest, 1)[0])
  }

  // 2-opt improvement (max 50 iterations)
  let improved = true
  let iterations = 0
  while (improved && iterations < 50) {
    improved = false
    iterations++
    for (let i = 1; i < route.length - 1; i++) {
      for (let j = i + 1; j < route.length; j++) {
        const d1 = haversineDistance(route[i-1].lat, route[i-1].lng, route[i].lat, route[i].lng)
          + haversineDistance(route[j].lat, route[j].lng, route[Math.min(j+1, route.length-1)].lat, route[Math.min(j+1, route.length-1)].lng)
        const d2 = haversineDistance(route[i-1].lat, route[i-1].lng, route[j].lat, route[j].lng)
          + haversineDistance(route[i].lat, route[i].lng, route[Math.min(j+1, route.length-1)].lat, route[Math.min(j+1, route.length-1)].lng)
        if (d2 < d1) {
          const segment = route.splice(i, j - i + 1)
          segment.reverse()
          route.splice(i, 0, ...segment)
          improved = true
        }
      }
    }
  }

  return route
}

