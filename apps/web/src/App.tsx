import React, { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav";
import Hero from "./components/Hero";
import MoodDial, { MoodKind } from "./components/MoodDial";
import MapView, { MapPoint } from "./components/MapView";

// If you already have a central API util, you can swap these with those functions.
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
  // adapt to MapPoint shape if needed
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
    const [lat, lng] = center;
    if (!lat && !lng) {
      // Try to fetch a quick geolocation if we don't have one yet
      await new Promise<void>((resolve) => {
        if (!navigator.geolocation) return resolve();
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCenter([pos.coords.latitude, pos.coords.longitude]);
            resolve();
          },
          () => resolve()
        );
      });
    }
    const [useLat, useLng] = center;

    const created = await sendMoodToApi({ mood, energy, text, lat: useLat, lng: useLng });

    const newPoint: MapPoint = {
      id: created?.id ?? crypto.randomUUID(),
      lat: useLat,
      lng: useLng,
      mood,
      energy,
      text,
      createdAt: new Date().toISOString(),
    };

    // optimistic update
    setPoints((p) => [newPoint, ...p]);
  };

  const memoPoints = useMemo(() => points, [points]);

  return (
    <>
      <TopNav />
      <Hero />
      <main className="content mx-auto max-w-6xl px-6 pb-20">
        <MoodDial onSend={handleSend} />
        <MapView center={center} points={memoPoints} />
      </main>
    </>
  );
}
