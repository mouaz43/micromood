// apps/web/src/App.tsx
import { useEffect, useState } from "react";
import TopNav from "./components/TopNav";
import MoodDial from "./components/MoodDial";
import MapView from "./components/MapView";
import { getRecentMoods, sendMood, type MoodPoint } from "./lib/api";

export default function App() {
  const [points, setPoints] = useState<MoodPoint[]>([]);
  const [center, setCenter] = useState({ lat: 50.1109, lng: 8.6821 }); // default: Frankfurt

  // fetch moods
  useEffect(() => {
    async function load() {
      try {
        const moods = await getRecentMoods({ sinceMinutes: 720 });
        setPoints(moods);
      } catch (err) {
        console.error("Failed to fetch moods:", err);
      }
    }
    load();
  }, []);

  const handleSend = async (mood: string, energy: number, text?: string) => {
    try {
      if (!navigator.geolocation) {
        alert("Location permission required.");
        return;
      }
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const newPoint = await sendMood({
          mood,
          energy,
          text,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setPoints((prev) => [...prev, newPoint]);
      });
    } catch (err) {
      console.error("Send mood failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <TopNav />
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Feel the world in real time.</h1>
          <p className="opacity-80 mb-6">
            Share a mood with a short thought—anonymous, human, and alive.
          </p>
          <MoodDial onSend={handleSend} />
        </div>
        <div>
          <MapView center={center} points={points} />
        </div>
      </main>
    </div>
  );
}
