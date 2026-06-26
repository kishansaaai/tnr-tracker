import { useState, useMemo, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap, Circle, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useColonies } from '../hooks/useColonies'
import { useTraps } from '../hooks/useTraps'
import { useAllCats } from '../hooks/useCats'
import { useAuth } from '../hooks/useAuth.jsx'
import { createColonyIcon, createTrapIcon } from '../components/Map/markers'
import { ColonySidebar } from '../components/Map/ColonySidebar'
import { AddColonyModal, AddTrapModal } from '../components/Map/AddPinModals'
import { Button } from '../components/UI/Button'
import { haversineDistance, computeRoute, friendlyError } from '../lib/utils'
import toast from 'react-hot-toast'

import L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

function MapClickHandler({ onMapClick, isPlacingPin }) {
  useMapEvents({
    click: (e) => {
      if (isPlacingPin) onMapClick(e.latlng)
    },
  })
  return null
}

function MapBoundsController({ colonies, loading }) {
  const map = useMap()
  useEffect(() => {
    if (!loading && colonies && colonies.length > 0) {
      const bounds = colonies.map(c => [c.lat, c.lng])
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }
  }, [colonies, loading, map])
  return null
}


function createRouteNumberIcon(number) {
  return L.divIcon({
    className: '',
    html: `<div style="width:26px;height:26px;border-radius:50%;background:#7c3aed;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${number}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

export default function MapPage() {
  const { colonies, loading: coloniesLoading, createColony } = useColonies()
  const { traps, createTrap } = useTraps()
  const { cats } = useAllCats()
  const { user } = useAuth()

  const [selectedColony, setSelectedColony] = useState(null)
  const [pendingCoords, setPendingCoords] = useState(null)
  const [pinMode, setPinMode] = useState(null)
  const [showColonyModal, setShowColonyModal] = useState(false)
  const [showTrapModal, setShowTrapModal] = useState(false)
  const [showRoute, setShowRoute] = useState(false)
  const [showHeatmap, setShowHeatmap] = useState(false)

  function handleMapClick(latlng) {
    setPendingCoords(latlng)
    if (pinMode === 'colony') setShowColonyModal(true)
    if (pinMode === 'trap') setShowTrapModal(true)
    setPinMode(null)
  }

  useEffect(() => {
    document.title = 'TNR Tracker — Colony Map'
  }, [])

  async function handleAddColony(data) {
    try {
      await createColony({ ...data, created_by: user.id })
      toast.success(`Colony "${data.name}" added`)
    } catch (e) {
      toast.error(friendlyError(e))
      throw e
    }
  }

  async function handleAddTrap(data) {
    try {
      await createTrap(data)
      toast.success('Trap placed')
    } catch (e) {
      toast.error(friendlyError(e))
      throw e
    }
  }

  const selectedCats = selectedColony
    ? cats.filter(cat => cat.colony_id === selectedColony.id)
    : []
  const nearbyTraps = selectedColony
    ? traps.filter(trap => trap.colony_id === selectedColony.id)
    : []

  // Route planner
  const routeTraps = useMemo(() => {
    if (!showRoute || traps.length === 0) return []
    const activeTraps = traps.filter(t => t.status === 'in_use' || t.status === 'needs_pickup')
    return computeRoute(activeTraps)
  }, [showRoute, traps])

  const heatmapData = useMemo(() => {
    if (!showHeatmap || !cats || !colonies) return []
    return colonies.map(colony => {
      const colonyCats = cats.filter(c => c.colony_id === colony.id)
      const intactCount = colonyCats.filter(c => c.neutered === false || c.neutered === 'false' || !c.neutered).length
      return { ...colony, intactCount, total: colonyCats.length }
    }).filter(c => c.intactCount > 0)
  }, [showHeatmap, cats, colonies])

  const routePositions = routeTraps.map(t => [t.lat, t.lng])

  const totalDistance = useMemo(() => {
    let dist = 0
    for (let i = 1; i < routeTraps.length; i++) {
      dist += haversineDistance(
        routeTraps[i - 1].lat, routeTraps[i - 1].lng,
        routeTraps[i].lat, routeTraps[i].lng
      )
    }
    return dist.toFixed(1)
  }, [routeTraps])

  return (
    <div className="relative flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {!coloniesLoading && colonies.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-[300] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center max-w-sm pointer-events-auto border border-emerald-100">
            <div className="text-5xl mb-3">🗺️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No colonies yet</h2>
            <p className="text-gray-500 text-sm mb-4">
              Click <strong>"+ Add Colony"</strong> below, then tap anywhere on the map to place your first colony pin.
            </p>
            <button
              onClick={() => setPinMode('colony')}
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              Add First Colony
            </button>
          </div>
        </div>
      )}

      <div className={`flex-1 ${pinMode ? 'cursor-crosshair' : ''}`}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onMapClick={handleMapClick} isPlacingPin={!!pinMode} />
          <MapBoundsController colonies={colonies} loading={coloniesLoading} />

          {colonies.map(colony => (
            <Marker
              key={colony.id}
              position={[colony.lat, colony.lng]}
              icon={createColonyIcon(colony.status)}
              eventHandlers={{ click: () => setSelectedColony(colony) }}
            />
          ))}

          {traps.map(trap => (
            <Marker
              key={trap.id}
              position={[trap.lat, trap.lng]}
              icon={createTrapIcon(trap.status)}
            />
          ))}

          {/* Route planner polyline and numbered markers */}
          {showRoute && routePositions.length > 0 && (
            <>
              {routePositions.length > 1 && (
                <Polyline
                  positions={routePositions}
                  pathOptions={{
                    color: '#7c3aed',
                    weight: 3,
                    dashArray: '10 6',
                    opacity: 0.8,
                  }}
                />
              )}
              {routeTraps.map((trap, idx) => (
                <Marker
                  key={`route-${trap.id}`}
                  position={[trap.lat, trap.lng]}
                  icon={createRouteNumberIcon(idx + 1)}
                />
              ))}
            </>
          )}

          {/* Priority Heatmap */}
          {showHeatmap && heatmapData.map(colony => {
            const pct = colony.intactCount / colony.total
            const radius = 100 + (colony.intactCount * 50)
            let color = '#f97316' // orange
            if (pct > 0.5) color = '#ef4444' // red
            if (colony.intactCount > 5) color = '#b91c1c' // dark red
            
            return (
              <CircleMarker
                key={`heatmap-${colony.id}`}
                center={[colony.lat, colony.lng]}
                radius={Math.min(10 + (colony.intactCount * 4), 60)} // cap max radius at 60px
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.5,
                  weight: 0
                }}
              />
            )
          })}
        </MapContainer>
      </div>

      {pinMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-3 border border-green-200">
          <span className="text-sm font-medium text-green-800">
            {pinMode === 'colony' ? 'Click map to place colony' : 'Click map to place trap'}
          </span>
          <button
            onClick={() => setPinMode(null)}
            className="text-gray-400 hover:text-gray-600 text-xs underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Active Banners Container */}
      {(showRoute || showHeatmap) && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 items-center pointer-events-none">
          {showRoute && (
            <div className="pointer-events-auto bg-blue-600 text-white shadow-lg rounded-full px-4 py-2 flex items-center gap-3">
              <span className="text-sm font-medium">
                🗺️ Route: {routeTraps.length} traps • {totalDistance} km
              </span>
              <button
                onClick={() => setShowRoute(false)}
                className="text-blue-200 hover:text-white text-xs underline"
              >
                Hide
              </button>
            </div>
          )}

          {showHeatmap && (
            <div className="pointer-events-auto bg-orange-600 text-white shadow-lg rounded-full px-4 py-2 flex items-center gap-3">
              <span className="text-sm font-medium">
                🔥 TNR Priority Zones Active
              </span>
              <button
                onClick={() => setShowHeatmap(false)}
                className="text-orange-200 hover:text-white text-xs underline"
              >
                Hide
              </button>
            </div>
          )}
        </div>
      )}

      {/* Map Tools - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-gray-100">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            showHeatmap 
              ? 'bg-orange-100 text-orange-800 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          aria-label="Toggle priority heatmap"
        >
          🔥 Priority Heatmap
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1"></div>
        <button
          onClick={() => setShowRoute(!showRoute)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
            showRoute 
              ? 'bg-blue-100 text-blue-800 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          aria-label="Toggle route planner"
        >
          🗺️ Route Planner
        </button>
      </div>

      {/* Action Buttons - Bottom Left */}
      <div className="absolute bottom-6 left-4 z-[400] flex flex-col gap-3">
        <Button
          onClick={() => setPinMode('colony')}
          variant={pinMode === 'colony' ? 'amber' : 'primary'}
          size="lg"
          aria-label="Add Colony Pin"
          className="shadow-xl font-bold px-8 py-3 text-sm"
        >
          + Add Colony
        </Button>
        <Button
          onClick={() => setPinMode('trap')}
          variant={pinMode === 'trap' ? 'amber' : 'secondary'}
          size="lg"
          aria-label="Add Trap Pin"
          className="shadow-xl font-bold px-8 py-3 text-sm bg-white"
        >
          + Add Trap
        </Button>
      </div>

      <div className="absolute bottom-6 right-4 z-20 bg-white rounded-xl shadow-lg p-3 text-xs space-y-1.5">
        <p className="font-medium text-gray-700 mb-2">Legend</p>
        {[
          { color: '#dc2626', label: 'Unmanaged' },
          { color: '#f59e0b', label: 'In Progress' },
          { color: '#16a34a', label: 'Managed' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-white shadow" style={{ background: color }} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
          <div className="w-3 h-3 rounded bg-amber-500 border border-white shadow" />
          <span className="text-gray-600">Trap</span>
        </div>
        {showRoute && (
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <div className="w-3 h-3 rounded-full bg-purple-600 border border-white shadow" />
            <span className="text-gray-600">Route Stop</span>
          </div>
        )}
      </div>

      {selectedColony && (
        <ColonySidebar
          colony={selectedColony}
          catCount={selectedCats.length}
          neuteredCount={selectedCats.filter(cat => cat.neutered).length}
          nearbyTraps={nearbyTraps}
          onClose={() => setSelectedColony(null)}
        />
      )}

      <AddColonyModal
        isOpen={showColonyModal}
        onClose={() => setShowColonyModal(false)}
        onSubmit={handleAddColony}
        coords={pendingCoords}
      />
      <AddTrapModal
        isOpen={showTrapModal}
        onClose={() => setShowTrapModal(false)}
        onSubmit={handleAddTrap}
        coords={pendingCoords}
        colonies={colonies}
      />
    </div>
  )
}
