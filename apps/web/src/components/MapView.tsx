import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { iconForPoint } from "../lib/pins";

type Point = {
  id: string;
  lat: number;
  lng: number;
  mood: string;
  createdAt: string;
  energy: number;
  message?: string | null;
};

export function MapView({
  points,
  deletableIds = new Set<string>(),
  onDelete,
}: {
  points: Point[];
  deletableIds?: Set<string>;
  onDelete?: (id: string) => void;
}) {
  // @ts-ignore
  delete (L.Icon.Default as any).prototype._getIconUrl;

  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: 420 }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={iconForPoint(p as any)}>
          <Popup>
            <div className="text-sm space-y-1">
              <div>
                <strong>{p.mood}</strong> • energy {p.energy}
              </div>
              {p.message && <div className="italic">“{p.message}”</div>}
              <div>{new Date(p.createdAt).toLocaleString()}</div>
              {onDelete && deletableIds.has(p.id) && (
                <button
                  className="mt-2 px-3 py-1 border border-red-500 text-red-500 rounded"
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
  );
}
