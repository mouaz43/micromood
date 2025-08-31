import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TopNav } from './components/TopNav'
import { MoodDial } from './components/MoodDial'
import { MapView } from './components/MapView'
import { SiteFooter } from './components/SiteFooter'
import { MyPulses } from './components/MyPulses'
import {
  submitMood, fetchMoods, deleteMood,
  loadDeleteTokens, saveDeleteToken, removeDeleteToken,
  type MoodPoint
} from './lib/api'

export function App() {
  const [points, setPoints] = useState<MoodPoint[]>([])
  const [coords, setCoords] = useState<{lat:number; lng:number}>()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [tokens, setTokens] = useState<Record<string, string>>({})

  useEffect(() => { setTokens(loadDeleteTokens()) }, [])
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(undefined)
    )
  }, [])

  async function refresh() {
    const res = await fetchMoods({ sinceMinutes: 720 })
    setPoints(res.data)
  }
  useEffect(() => { refresh().catch(console.error) }, [])

  const onSubmit = async (mood: string, energy: number, text?: string) => {
    if (!coords) { setMessage('Please allow location to send a mood.'); return }
    setLoading(true)
    try {
      const r = await submitMood({ mood, energy, ...coords, message: text })
      saveDeleteToken(r.id, r.deleteToken)
      setTokens(loadDeleteTokens())
      setMessage('Mood sent! (Delete token copied to clipboard)')
      try { await navigator.clipboard.writeText(r.deleteToken) } catch {}
      await refresh()
    } catch (e: any) {
      console.error(e); setMessage(e?.message || 'Failed to send mood.')
    } finally {
      setLoading(false); setTimeout(()=>setMessage(null), 3500)
    }
  }

  const deletableIds = useMemo(() => new Set(Object.keys(tokens)), [tokens])

  const handleDelete = async (id: string) => {
    let token = tokens[id]
    if (!token) {
      const input = window.prompt('Enter the delete token for this pulse:')
      if (!input) return
      token = input.trim()
    }
    try {
      await deleteMood(id, token)
      if (tokens[id]) { removeDeleteToken(id); setTokens(loadDeleteTokens()) }
      await refresh()
      setMessage('Pulse deleted.'); setTimeout(()=>setMessage(null), 1500)
    } catch (e: any) {
      console.error(e); setMessage(e?.message || 'Failed to delete. Token may be invalid.')
      setTimeout(()=>setMessage(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <TopNav />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-6">
          <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }} className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">Feel the world in real time.</h1>
            <p className="opacity-80 max-w-prose">Share a mood with a short thought—anonymous, human, and alive.</p>
            <MoodDial onSubmit={onSubmit} loading={loading} />
            {message && <div className="text-sm opacity-90">{message}</div>}
            <MyPulses points={points} deletableIds={deletableIds} onDelete={handleDelete} />
            <div className="text-xs opacity-60">By sending a pulse you agree it’s anonymous and may be displayed on the map.</div>
            <SiteFooter />
          </motion.section>

          <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.05 }}>
            <MapView points={points} userCoords={coords} deletableIds={deletableIds} onDelete={handleDelete} />
          </motion.section>
        </div>
      </main>
    </div>
  )
}
