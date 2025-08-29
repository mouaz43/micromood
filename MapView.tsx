import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

function FitToUser({ coords }: { coords?: { lat: number; lng: number } }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.setView([coords.lat, coords.lng], 12)
  }, [coords, map])
  return null
}

export function MapView({ points, userCoords }: { points: Array<{lat:number; lng:number; mood:string; createdAt:string; energy:number}>, userCoords?: {lat:number; lng:number} }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <MapContainer center={[0,0]} zoom={2} style={{ height: 420 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToUser coords={userCoords} />
        {points.map((p, i) => (
          <Marker position={[p.lat, p.lng]} key={i}>
            <Popup>
              <div className="text-sm">
                <div><strong>{p.mood}</strong> • energy {p.energy}</div>
                <div className="opacity-70">{new Date(p.createdAt).toLocaleString()}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}