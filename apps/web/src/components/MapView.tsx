import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import * as L from 'leaflet'
import { iconForPoint } from '../lib/pins'

function FitToUser({ coords }: { coords?: { lat: number; lng: number } }) {
  const map = useMap()
  useEffect(() => { if (coords) map.setView([coords.lat, coords.lng], 12) }, [coords, map])
  return null
}

type P = { lat:number; lng:number; mood:string; createdAt:string; energy:number; message?: string | null; id?: string }

export function MapView({
  points,
  userCoords
}: {
  points: Array<P>
  userCoords?: {lat:number; lng:number}
}) {
  // fix default icon images issue by disabling them entirely (we use divIcons)
  // (kept here in case any Leaflet plugin tries to request marker images)
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
        {points.map((p, i) => (
          <Marker position={[p.lat, p.lng]} key={p.id ?? i} icon={iconForPoint(p as any)}>
            <Popup>
              <div className="text-sm leading-snug">
                <div><strong>{p.mood}</strong> • energy {p.energy}</div>
                {p.message && <div className="mt-1 italic opacity-90">&ldquo;{p.message}&rdquo;</div>}
                <div className="opacity-70 mt-1">{new Date(p.createdAt).toLocaleString()}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
