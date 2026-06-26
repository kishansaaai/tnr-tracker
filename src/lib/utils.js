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

