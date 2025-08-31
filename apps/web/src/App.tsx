// apps/web/src/App.tsx
// Wires the picker to the API and the map. Imports MoodDial as DEFAULT export.

import { useEffect, useMemo, useState } from "react";
import MoodDial from "./components/MoodDial";
import TopNav from "./TopNav";
import MapView from "./MapView";
import { sendMood, getRecentMoods, type MoodPoint } from "./lib/api";

export default function App() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [sending, setSending] = useState(false);
  const [moods, setMoods] = useState<MoodPoint[]>([]);
  const [sinceMinutes] = useState(720); // 12h window like before

  // grab location once
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 }
    );
  }, []);

  // fetch recent moods periodically
  useEffect(() => {
    let stop = false;

    const load = async () => {
      try {
        const data = await getRecentMoods({ sinceMinutes });
        if (!stop) setMoods(data);
      } catch (e) {
        // no-op (keep UI running)
        console.error("Failed to fetch moods", e);
      }
    };

    load();
    const t = setInterval(load, 30_000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [sinceMinutes]);

  const center = useMemo(
    () =>
      coords ?? {
        lat: 50.1109, // Frankfurt fallback
        lng: 8.6821,
      },
    [coords]
  );

  // called by MoodDial
  async function handleSubmit(mood: string, energy: number, text?: string) {
    if (!coords) {
      alert("Please allow location to send a mood.");
      return;
    }
    setSending(true);
    try {
      const created = await sendMood({
        mood,
        energy,
        lat: coords.lat,
        lng: coords.lng,
        text,
      });
      // optimistic update: add the new mood to the list so it appears immediately
      setMoods((prev) => [created, ...prev]);
    } catch (e: any) {
      console.error(e);
      alert(`Failed to submit mood (500): ${e?.message ?? "Unexpected error"}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f1a] to-[#0d1020] text-white">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <section className="grid md:grid-cols-2 gap-8 md:gap-10 items-start mt-10">
          <MoodDial onSubmit={handleSubmit} loading={sending} />
          <MapView center={center} points={moods} />
        </section>

        <footer className="mt-14 text-sm opacity-60 text-center">
          Built by Mouaz Almjarkesh
        </footer>
      </main>
    </div>
  );
}
