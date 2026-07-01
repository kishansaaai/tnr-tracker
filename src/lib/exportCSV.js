/**
 * Compiles colony and cat data into a structured CSV and initiates a browser file download.
 * Pairs cats with their corresponding colonies in a flat relational layout.
 * 
 * Format: Comma-Separated Values (CSV), RFC 4180 compliant with double quote escaping.
 * Encoding: UTF-8 (pre-configured via Blob constructor).
 * Columns:
 *  - Colony ID: UUID of the colony
 *  - Colony Name: Name of the colony (escaped)
 *  - Status: Current status (e.g. Active, Pending)
 *  - Latitude: Floating point latitude coordinate
 *  - Longitude: Floating point longitude coordinate
 *  - Description: Summary description of the colony (escaped)
 *  - Cat ID: UUID of the cat (empty if colony has no cats)
 *  - Cat Name: Name of the cat or 'Unnamed' (escaped)
 *  - Gender: Cat gender (Male, Female, Unknown)
 *  - Neutered: Yes / No value indicating spay/neuter status
 *  - Health Notes: Description of the cat's health status (escaped)
 *  - Cat Added: Locale-formatted date when the cat was added
 * 
 * @param {Array} colonies - Array of colony objects to export.
 * @param {Array} cats - Array of all cat objects.
 */
export function exportColoniesCSV(colonies, cats) {
  const rows = []
  
  // Header
  rows.push([
    'Colony ID', 'Colony Name', 'Status', 'Latitude', 'Longitude', 'Description',
    'Cat ID', 'Cat Name', 'Gender', 'Neutered', 'Health Notes', 'Cat Added'
  ].join(','))

  if (colonies.length === 0) {
    rows.push('No data available')
  }

  for (const colony of colonies) {
    const colonyCats = cats.filter(c => c.colony_id === colony.id)
    
    if (colonyCats.length === 0) {
      rows.push([
        colony.id, escapeCSV(colony.name), colony.status,
        colony.lat, colony.lng, escapeCSV(colony.description || ''),
        '', '', '', '', '', ''
      ].join(','))
    } else {
      for (const cat of colonyCats) {
        rows.push([
          colony.id, escapeCSV(colony.name), colony.status,
          colony.lat, colony.lng, escapeCSV(colony.description || ''),
          cat.id, escapeCSV(cat.name || 'Unnamed'),
          cat.gender, cat.neutered ? 'Yes' : 'No',
          escapeCSV(cat.health_notes || ''),
          new Date(cat.created_at).toLocaleDateString()
        ].join(','))
      }
    }
  }

  const csv = rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `tnr-tracker-export-${new Date().toISOString().slice(0,10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Safely escapes double quotes, commas, and newlines in a string according to CSV format specs.
 * 
 * @param {string|any} str - Input value to escape.
 * @returns {string} Escaped and formatted CSV value.
 */
function escapeCSV(str) {
  if (str == null) return ''
  let s = String(str)
  // CSV Formula Injection mitigation: prefix leading = + - @ with a single quote
  if (/^[=+\-@]/.test(s)) {
    s = `'${s}`
  }
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}
