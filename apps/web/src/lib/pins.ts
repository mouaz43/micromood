import * as L from 'leaflet'
import type { MoodPoint } from './api'

// map energy (1–5) to a color
function colorForEnergy(n: number) {
  const clamped = Math.min(5, Math.max(1, n))
  const stops = ['#60a5fa', '#22d3ee', '#34d399', '#a78bfa', '#f472b6'] // blue→teal→green→violet→pink
  return stops[clamped - 1]
}

function snippet(msg?: string | null, max = 18) {
  if (!msg) return ''
  const s = msg.trim()
  if (!s) return ''
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

export function iconForPoint(p: MoodPoint) {
  const color = colorForEnergy(p.energy)
  const text = snippet(p.message)
  const html = `
  <div class="mood-pin">
    <svg width="44" height="56" viewBox="0 0 44 56" class="mood-pin__svg">
      <defs>
        <radialGradient id="g-${p.id}" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.2"/>
        </radialGradient>
        <filter id="shadow-${p.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <!-- glow blob -->
      <circle cx="22" cy="20" r="14" fill="url(#g-${p.id})" filter="url(#shadow-${p.id})"/>
      <!-- pin tail -->
      <path d="M22 36 L17 55 L22 50 L27 55 Z" fill="${color}" fill-opacity="0.6"/>
      <!-- inner core -->
      <circle cx="22" cy="20" r="6" fill="#fff" fill-opacity="0.9"/>
    </svg>
    ${text ? `<div class="mood-pin__tag" style="border-color:${color}">${text}</div>` : ''}
  </div>`
  return L.divIcon({
    className: 'mood-pin-wrap', // don't let Leaflet add default classes
    html,
    iconSize: [44, 56],
    iconAnchor: [22, 48], // tip of the tail sits on the coordinate
    popupAnchor: [0, -30]
  })
}
