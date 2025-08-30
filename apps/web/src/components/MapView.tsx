import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import * as L from 'leaflet'
import { iconForPoint } from '../lib/pins'

type Point = {
  id: string
  lat: number
  lng: number
  mood: string
  createdAt: string
  energy: number
  message?: string | null
}

function FitToUser({ coords }: { coords?: { lat: number; lng: number } }) {
  const map = useMap()
  useEffect(() => { if (coords) map.setView([coords.lat, coords.lng], 12) }, [coords, map])
  return null
}

export function MapView({
  points,
  userCoords,
  deletableIds = new Set<string>(),
  onDelete
}: {
  points: Array<Point>
  userCoords?: {lat:number; lng:number}
  deletableIds?: Set<string>
  onDelete?: (id: string) => void
}) {
  // disable default PNG icons (we use divIcons)
  // @ts-ignore
  delete (L.Icon.Default as any).prototype._getIconUrl

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <MapContainer center={[0,0]} zoom={2} style={{ height: 420 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToUser coords={userCoords} />
        {points.map((p) => (
          <Marker position={[p.lat, p.lng]} key={p.id} icon={iconForPoint(p as any)}>
            <Popup>
              <div className="text-sm leading-snug space-y-1">
                <div><strong>{p.mood}</strong> • energy {p.energy}</div>
                {p.message && <div className="italic opacity-90">&ldquo;{p.message}&rdquo;</div>}
                <div className="opacity-70">{new Date(p.createdAt).toLocaleString()}</div>
                {deletableIds.has(p.id) && onDelete && (
                  <button
                    className="mt-2 rounded-lg px-3 py-1 border border-red-400/50 text-red-300 hover:bg-red-500/10"
                    onClick={() => onDelete(p.id)}
                  >
                    Delete this pulse
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
