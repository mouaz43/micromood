import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TopNav } from "./components/TopNav";
import { MoodDial } from "./components/MoodDial";
import { MapView } from "./components/MapView";
import { SiteFooter } from "./components/SiteFooter";
import {
  submitMood, fetchMoods, deleteMood,
  loadDeleteTokens, saveDeleteToken, removeDeleteToken,
  type MoodPoint, adminDeleteMood
} from "./lib/api";

export function App() {
  const [points, setPoints] = useState<MoodPoint[]>([]);
  const [coords, setCoords] = useState<{ lat:number; lng:number }>();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});

  useEffect(() => { setTokens(loadDeleteTokens()); }, []);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setCoords(undefined)
    );
  }, []);

  async function refresh() {
    const r = await fetchMoods({ sinceMinutes: 720 });
    setPoints(r.data);
  }
  useEffect(() => { refresh().catch(console.error); }, []);

  const deletableIds = useMemo(() => new Set(Object.keys(tokens)), [tokens]);

  const onSubmit = async (mood:string, energy:number, text?:string) => {
    if (!coords) { setMsg("Please allow location to send a mood."); return; }
    setLoading(true);
    try {
      const r = await submitMood({ mood, energy, ...coords, message: text });
      saveDeleteToken(r.id, r.deleteToken);
      setTokens(loadDeleteTokens());
      try { await navigator.clipboard.writeText(r.deleteToken); } catch {}
      setMsg("Mood sent! Delete code copied to clipboard.");
      await refresh();
    } catch (e:any) {
      console.error(e); setMsg(e?.message || "Failed to send mood.");
    } finally {
      setLoading(false); setTimeout(()=>setMsg(null), 3500);
    }
  };

  const deleteOwn = async (id:string) => {
    const token = tokens[id]; if (!token) return;
    try {
      await deleteMood(id, token);
      removeDeleteToken(id);
      setTokens(loadDeleteTokens());
      await refresh();
      setMsg("Pulse deleted.");
    } catch (e:any) {
      console.error(e); setMsg(e?.message || "Delete failed.");
    } finally {
      setTimeout(()=>setMsg(null), 2500);
    }
  };

  const deleteWithCode = async (id:string, code:string) => {
    try {
      await deleteMood(id, code);
      if (tokens[id]) removeDeleteToken(id);
      setTokens(loadDeleteTokens());
      await refresh();
      setMsg("Pulse deleted.");
    } catch (e:any) {
      // Optional admin shortcut: hold Alt when clicking in MapView and paste your ADMIN secret here,
      // or call adminDeleteMood(id, adminSecret) if you set ADMIN_SECRET on the API.
      console.error(e); setMsg(e?.message || "Delete failed (invalid code).");
    } finally {
      setTimeout(()=>setMsg(null), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <TopNav />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-6">
          <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Feel the world in real time.</h1>
            <p className="opacity-80 max-w-prose">Share a mood with a short thought—anonymous, human, and alive.</p>
            <MoodDial onSubmit={onSubmit} loading={loading} />
            {msg && <div className="text-sm opacity-90">{msg}</div>}
            <div className="text-xs opacity-60">By sending a pulse you agree it’s anonymous and may be displayed on the map.</div>
            <SiteFooter />
          </motion.section>

          <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.05 }}>
            <MapView
              points={points}
              deletableIds={deletableIds}
              onDeleteOwn={deleteOwn}
              onDeleteWithCode={deleteWithCode}
            />
          </motion.section>
        </div>
      </main>
    </div>
  );
}
