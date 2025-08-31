// apps/web/src/components/MyPulses.tsx
import type { MoodPoint } from "../lib/api";

export default function MyPulses({ items }: { items: MoodPoint[] }) {
  if (!items?.length) {
    return <div className="text-sm opacity-70">No pulses yet.</div>;
  }
  return (
    <ul className="space-y-3">
      {items.map((p) => (
        <li key={p.id} className="rounded-lg border border-white/10 p-3 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="font-medium">{p.mood} <span className="opacity-60 text-xs">energy {p.energy}</span></div>
            <div className="opacity-60 text-xs">{new Date(p.createdAt).toLocaleString()}</div>
          </div>
          {p.text && <div className="text-sm mt-1 opacity-90">{p.text}</div>}
        </li>
      ))}
    </ul>
  );
}
