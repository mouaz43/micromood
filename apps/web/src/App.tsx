import React, { useEffect, useState } from "react";
import TopNav from "./components/TopNav";
import Sky from "./components/Sky";
import MoodDial from "./components/MoodDial";
import MapView from "./components/MapView";
import { getRecentMoods, sendMood, type MoodPoint } from "./lib/api";

export default function App() {
  const [center, setCenter] = useState<{lat:number; lng:number}>({ lat: 50.1109, lng: 8.6821 }); // Frankfurt fallback
  const [points, setPoints] = useState<MoodPoint[]>([]);
  const [sending, setSending] = useState(false);

  // locate
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      p => setCenter({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy:true, timeout: 8000 }
    );
  }, []);

  // load + refresh
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const data = await getRecentMoods({ sinceMinutes: 720 });
        if (alive) setPoints(data);
      } catch (e) { console.error(e); }
    };
    load();
    const t = setInterval(load, 30000);
    const onDel = (e: any) => {
      const id = e.detail?.id;
      if (!id) return;
      setPoints(prev => prev.filter(p => p.id !== id));
    };
    window.addEventListener("micromood:deleted", onDel);
    return () => { alive=false; clearInterval(t); window.removeEventListener("micromood:deleted", onDel); };
  }, []);

  async function handleSend(mood: string, energy: number, text?: string) {
    setSending(true);
    try {
      // ensure fresh coords
      const loc = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 })
      );
      const created = await sendMood({
        mood, energy, text, lat: loc.coords.latitude, lng: loc.coords.longitude
      });
      setCenter({ lat: created.lat, lng: created.lng });
      setPoints(prev => [created, ...prev]);
    } catch (e:any) {
      console.error(e);
      alert(`Failed to submit mood: ${e?.message ?? "Unexpected error"}`);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Sky />
      <TopNav />
      <main className="max">
        <section style={{marginTop:24}}>
          <h1 className="h1">Feel the world in real time.</h1>
          <p className="sub">Share a mood with a short thought—anonymous, human, and alive.</p>
        </section>

        <section className="grid2" style={{marginTop:16}}>
          <MoodDial onSend={handleSend} loading={sending} />
          <MapView center={center} points={points} />
        </section>

        <footer>Built by Mouaz Almjarkesh</footer>
      </main>
    </>
  );
}
