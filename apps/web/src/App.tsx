import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TopNav } from './components/TopNav'
import { MoodDial } from './components/MoodDial'
import { MapView } from './components/MapView'
import { SiteFooter } from './components/SiteFooter'
import { submitMood, fetchMoods, MoodPoint } from './lib/api'

export function App() {
  const [points, setPoints] = useState<MoodPoint[]>([])
  const [coords, setCoords] = useState<{lat:number; lng:number}>()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(undefined)
    )
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMoods({ sinceMinutes: 720 })
        setPoints(res.data)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  const onSubmit = async (mood: string, energy: number, text?: string) => {
    if (!coords) {
      setMessage('Please allow location to send a mood.')
      return
    }
    setLoading(true)
    try {
      await submitMood({ mood, energy, ...coords, message: text })
      setMessage('Mood sent!')
      const res = await fetchMoods({ sinceMinutes: 720 })
      setPoints(res.data)
    } catch (e: any) {
      console.error(e)
      setMessage(e?.message || 'Failed to send mood.')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(null), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <TopNav />
      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-6">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Feel the world in real time.
            </h1>
            <p className="opacity-80 max-w-prose">
              MicroMood lets anyone send an anonymous mood pulse that lights up the global map—with a short thought to make it human.
            </p>
            <MoodDial onSubmit={onSubmit} loading={loading} />
            {message && <div className="text-sm opacity-90">{message}</div>}
            <div className="text-xs opacity-60">
              By sending a pulse you agree it’s anonymous and may be displayed on the map.
            </div>
            <SiteFooter />
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <MapView points={points} userCoords={coords} />
          </motion.section>
        </div>
      </main>
    </div>
  )
}
