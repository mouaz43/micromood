import React, { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav";
import Hero from "./components/Hero";
import MoodDial, { MoodKind } from "./components/MoodDial";
import MapView from "./components/MapView";

/** Define locally to avoid type-export issues during build. */
type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  mood: MoodKind;
  energy: number;
  text?: string;
  createdAt?: string;
};

// Minimal API helpers (works with your existing /api/moods)
async function sendMoodToApi(payload: {
  mood: MoodKind;
  energy: number;
  text?: string;
  lat: number;
  lng: number;
}) {
  const base = import.meta.env.VITE_API_URL || "";
  const url = `${base}/api/moods`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Failed to submit mood: ${res.status}`);
  }
  return res.json();
}

async function fetchRecentMoods(sinceMinutes = 720): Promise<MapPoint[]> {
  const base = import.meta.env.VITE_API_URL || "";
  const url = `${base}/api/moods?sinceMinutes=${sinceMinutes}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.data || data || []).map((d: any) => ({
    id: d.id ?? crypto.randomUUID(),
    lat: d.lat ?? d.latitude,
    lng: d.lng ?? d.longitude,
    mood: d.mood as MoodKind,
    energy: Number(d.energy ?? 0),
    text: d.text ?? d.message ?? undefined,
    createdAt: d.createdAt,
  }));
}

export default function App() {
  // allow tuple center to keep MapView happy
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [points, setPoints] = useState<MapPoint[]>([]);

  // geolocate (non-blocking)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 8_000 }
    );
  }, []);

  // initial fetch
  useEffect(() => {
    fetchRecentMoods().then(setPoints).catch(() => {});
  }, []);

  const handleSend = async (mood: MoodKind, energy: number, text?: string) => {
    // ensure we have some coordinates
    if (center[0] === 0 && center[1] === 0 && navigator.geolocation) {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCenter([pos.coords.latitude, pos.coords.longitude]);
            resolve();
          },
          () => resolve()
        );
      });
    }
    const [lat, lng] = center;

    const created = await sendMoodToApi({ mood, energy, text, lat, lng });

    const newPoint: MapPoint = {
      id: created?.id ?? crypto.randomUUID(),
      lat,
      lng,
      mood,
      energy,
      text,
      createdAt: new Date().toISOString(),
    };

    setPoints((p) => [newPoint, ...p]);
  };

  const memoPoints = useMemo(() => points, [points]);

  return (
    <>
      <TopNav />
      <Hero />
      <main className="content mx-auto max-w-6xl px-6 pb-20">
        <MoodDial onSend={handleSend} />
        {/* MapView now accepts tuple center OR {lat,lng}. We pass the tuple. */}
        <MapView center={center} points={memoPoints} />
      </main>
    </>
  );
}
