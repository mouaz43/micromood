import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { iconForPoint } from "../lib/pins";

type Point = {
  id: string; lat: number; lng: number; mood: string; createdAt: string; energy: number; message?: string | null;
};

export function MapView({
  points,
  deletableIds = new Set<string>(),
  ownerMode = false,
  onDelete,
}:{
  points: Point[];
  deletableIds?: Set<string>;
  ownerMode?: boolean;
  onDelete?: (id:string)=>void;
}) {
  // @ts-ignore
  delete (L.Icon.Default as any).prototype._getIconUrl;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10">
      <MapContainer center={[0,0]} zoom={2} style={{ height: 420 }}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={iconForPoint(p as any)}>
            <Popup>
              <div className="text-sm leading-snug space-y-1">
                <div><strong>{p.mood}</strong> • energy {p.energy}</div>
                {p.message && <div className="italic opacity-90">&ldquo;{p.message}&rdquo;</div>}
                <div className="opacity-70">{new Date(p.createdAt).toLocaleString()}</div>
                {(ownerMode || deletableIds.has(p.id)) && onDelete && (
                  <button
                    className="mt-2 rounded-lg px-3 py-1 border border-red-400/50 text-red-300 hover:bg-red-500/10"
                    onClick={() => onDelete(p.id)}
                    title={ownerMode ? "Owner delete" : "Delete (you own this pulse)"}
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
  );
}
