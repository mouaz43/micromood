import React, { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav";
import Hero from "./components/Hero";
import MoodDial from "./components/MoodDial";
import MapView, { MapPoint, Bounds } from "./components/MapView";
import * as api from "./lib/api";
import { phaseForMood } from "./lib/moon";

type MoodKey = "happy" | "sad" | "stressed" | "calm" | "energized" | "tired";

const MOODS: { key: MoodKey; label: string }[] = [
  { key: "happy", label: "Happy" },
  { key: "sad", label: "Sad" },
  { key: "stressed", label: "Stressed" },
  { key: "calm", label: "Calm" },
  { key: "energized", label: "Energized" },
  { key: "tired", label: "Tired" },
];

export default function App() {
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [mood, setMood] = useState<MoodKey>("happy");
  const [energy, setEnergy] = useState(3);
  const [text, setText] = useState("");
  const [owner, setOwner] = useState<boolean>(false);
  const [sending, setSending] = useState(false);

  // geolocate
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setCenter([p.coords.latitude, p.coords.longitude]),
      () => setCenter([0, 0]),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  // load recent points
  async function load() {
    const res = await api.getRecentMoods(720);
    setPoints(res);
  }
  useEffect(() => void load(), []);

  // owner toggle reads key presence
  useEffect(() => {
    setOwner(Boolean(localStorage.getItem("mm_owner_key")));
  }, []);

  async function onSend() {
    if (!center) return;
    setSending(true);
    try {
      const { id, deleteToken } = await api.sendMood({
        mood,
        energy,
        text: text.trim() || undefined,
        lat: center[0],
        lng: center[1],
      });
      // keep delete token locally
      const bag = JSON.parse(localStorage.getItem("mm_tokens") || "{}");
      bag[id] = deleteToken;
      localStorage.setItem("mm_tokens", JSON.stringify(bag));
      setText("");
      await load();
    } catch (e) {
      alert("Failed to submit mood.");
    } finally {
      setSending(false);
    }
  }

  async function onDeleteSelf(id: string) {
    const bag = JSON.parse(localStorage.getItem("mm_tokens") || "{}");
    const token = bag[id];
    if (!token) return alert("No delete token.");
    await api.deleteMood(id, token);
    delete bag[id];
    localStorage.setItem("mm_tokens", JSON.stringify(bag));
    await load();
  }

  async function onOwnerDelete(bounds: Bounds) {
    const key = localStorage.getItem("mm_owner_key") || "";
    if (!key) return alert("No owner key set.");
    const n = await api.ownerDelete(bounds, key);
    alert(`Deleted ${n} pulses in selection.`);
    await load();
  }

  const phase = useMemo(() => phaseForMood(mood), [mood]);

  return (
    <div className="page">
      <TopNav
        onSetOwner={(k) => {
          if (k) {
            localStorage.setItem("mm_owner_key", k);
            setOwner(true);
          } else {
            localStorage.removeItem("mm_owner_key");
            setOwner(false);
          }
        }}
        owner={owner}
      />
      <Hero phase={phase} />
      <section className="panel">
        <h2>How do you feel?</h2>

        <div className="grid">
          {MOODS.map((m) => (
            <button
              key={m.key}
              className={`pill ${mood === m.key ? "active" : ""}`}
              onClick={() => setMood(m.key)}
            >
              <MoodDial size={28} phase={phaseForMood(m.key)} active={mood === m.key} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        <div className="row">
          <label>Energy: {energy}</label>
          <input
            type="range"
            min={1}
            max={5}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
          />
        </div>

        <textarea
          placeholder="A short thought, feeling, or moment (max 150 chars)"
          maxLength={150}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button className="send" onClick={onSend} disabled={sending}>
          {sending ? "Sending…" : "Send pulse"}
        </button>
      </section>

      <MapView
        center={center}
        points={points}
        owner={owner}
        onDeleteSelf={onDeleteSelf}
        onOwnerDelete={onOwnerDelete}
      />

      <footer className="credits">
        Built by <a href="https://micromood.onrender.com" target="_blank" rel="noreferrer">Mouaz Almjarkesh</a>
      </footer>
    </div>
  );
}
