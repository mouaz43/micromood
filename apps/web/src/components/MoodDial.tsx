import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

const MOODS = [
  { label: '😊 Happy', value: 'happy' },
  { label: '😔 Sad', value: 'sad' },
  { label: '😤 Stressed', value: 'stressed' },
  { label: '😌 Calm', value: 'calm' },
  { label: '⚡ Energized', value: 'energized' },
  { label: '🥱 Tired', value: 'tired' },
]

export function MoodDial({
  onSubmit,
  loading,
}: {
  onSubmit: (mood: string, energy: number, message?: string) => void
  loading?: boolean
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [energy, setEnergy] = useState<number>(3)
  const [message, setMessage] = useState<string>('')

  const remaining = useMemo(() => 150 - message.length, [message])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 shadow-glow max-w-md w-full">
      <h2 className="text-xl font-semibold mb-4">How do you feel?</h2>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {MOODS.map((m) => (
          <button
            key={m.value}
            onClick={() => setSelected(m.value)}
            className={`rounded-xl px-3 py-2 text-left border ${selected === m.value ? 'border-aurora-2 bg-white/10' : 'border-white/10 hover:border-white/20'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <label className="text-sm opacity-75">Energy: {energy}</label>
        <input type="range" min={1} max={5} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full" />
      </div>

      <div className="mb-2">
        <label className="text-sm opacity-75">What’s on your mind? <span className="opacity-60">(optional)</span></label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0,150))}
          placeholder="A short thought, feeling, or moment (max 150 chars)"
          className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 p-3 outline-none focus:border-aurora-3"
          rows={3}
        />
        <div className="text-xs mt-1 opacity-60 text-right">{remaining} chars left</div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => selected && onSubmit(selected, energy, message.trim() || undefined)}
          disabled={!selected || !!loading}
          className="rounded-xl px-4 py-2 border border-white/10 hover:border-aurora-3 enabled:shadow-glow disabled:opacity-40"
        >
          {loading ? 'Sending…' : 'Send pulse'}
        </button>
      </div>
    </motion.div>
  )
}
