import type { MoodPoint } from '../lib/api'

export function MyPulses({ points, deletableIds, onDelete }:{
  points: MoodPoint[]; deletableIds: Set<string>; onDelete: (id:string)=>void;
}) {
  const mine = points.filter(p => deletableIds.has(p.id))
  if (!mine.length) return null
  return (
    <div className="glass rounded-2xl p-4 shadow-glow">
      <h3 className="text-sm font-semibold mb-3">My pulses (this browser)</h3>
      <ul className="space-y-2">
        {mine.map(p => (
          <li key={p.id} className="flex items-center justify-between gap-3">
            <div className="text-sm min-w-0">
              <div className="truncate"><strong>{p.mood}</strong> • {p.message || '—'}</div>
              <div className="opacity-60 text-xs">{new Date(p.createdAt).toLocaleString()}</div>
            </div>
            <button className="rounded-lg px-3 py-1 border border-red-400/50 text-red-300 hover:bg-red-500/10" onClick={() => onDelete(p.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      <div className="opacity-60 text-xs mt-3">Only pulses created in this browser appear here.</div>
    </div>
  )
}
