import L from 'leaflet'

export const COLONY_MARKER_COLORS = {
  unmanaged: '#dc2626',
  in_progress: '#f59e0b',
  managed: '#16a34a',
}

export const TRAP_MARKER_COLORS = {
  available: '#16a34a',
  in_use: '#f59e0b',
  needs_pickup: '#dc2626',
}

function markerHtml({ color, shape, label, size }) {
  const radius = shape === 'circle' ? '50%' : '6px'

  return `<div style="
    width: ${size}px; height: ${size}px;
    background: ${color};
    color: white;
    border: 3px solid white;
    border-radius: ${radius};
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
    font-family: Inter, system-ui, sans-serif;
  ">${label}</div>`
}

export function createColonyIcon(status) {
  const color = COLONY_MARKER_COLORS[status] || '#6b7280'

  return L.divIcon({
    className: '',
    html: markerHtml({ color, shape: 'circle', label: 'C', size: 32 }),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

export function createTrapIcon(status) {
  const color = TRAP_MARKER_COLORS[status] || '#6b7280'

  return L.divIcon({
    className: '',
    html: markerHtml({ color, shape: 'square', label: 'T', size: 28 }),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}
