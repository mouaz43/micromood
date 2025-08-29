import { motion } from 'framer-motion'
import { Globe2 } from 'lucide-react'

export function TopNav() {
  return (
    <motion.header initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe2 className="w-6 h-6" />
          <span className="text-lg font-semibold tracking-wide">MicroMood</span>
        </div>
        <div className="text-xs opacity-70">Anonym • Realtime • Global</div>
      </div>
    </motion.header>
  )
}
