// Authoring helpers for the scene files. Everything returns plain HTML strings.

export const CHAPTERS = [
  { n: '', name: 'Start' },
  { n: '01', clip: 'ch1-handbrew', name: 'Kaffeezubereitung', sub: 'Vom Filter bis zum Espresso.', amb: 'drops', items: ['Arten der Kaffeezubereitung', 'Handbrew – manuelle Filterzubereitung', 'Cold Brew – kalte Kaffeeextraktion'] },
  { n: '02', clip: 'ch2-maschine', name: 'Espresso­maschinen', sub: 'Wasser, Druck und Temperatur.', amb: 'steam', items: ['Aufbau einer Espressomaschine', 'Maschinentypen: Einkreiser, Zweikreiser und Dualboiler', 'PID-Steuerung', 'E61-Brühgruppe', 'Pre-Infusion und OPV', 'Dampfkessel und Pressostat', 'Pumpenarten: Vibrations- und Rotationspumpe'] },
  { n: '03', clip: 'ch3-roesten', name: 'Die Kaffeebohne', sub: 'Von der Kirsche bis zur Röstung.', amb: 'beans', items: ['Arabica und Robusta', 'Pflückmethoden', 'Aufbereitungsverfahren: Natural, Washed und Honey', 'Röstgrade', 'Helle Röstungen und ihre besonderen Herausforderungen'] },
  { n: '04', clip: 'ch4-bezug', name: 'Espresso­extraktion', sub: 'Was im Puck wirklich passiert.', amb: 'crema', items: ['Grundlagen der Extraktion', 'Extraktionsphasen', 'Löslichkeit der Kaffeebestandteile', 'Die vier Extraktionsparameter', 'Extraction Yield und TDS', 'Channeling', 'Puck-Widerstand und Durchfluss', 'Brew Ratio, Durchfluss und Bezugszeit'] },
  { n: '05', clip: 'ch5-mahlen', name: 'Kaffeemühlen', sub: 'Jedes Partikel zählt.', amb: 'grounds', items: ['Aufbau einer Kaffeemühle', 'Single Dosing', 'Retention und Totraum', 'Partikelgrößenverteilung und Fines', 'Mahlscheiben und Geometrie', 'Temperatur und statische Aufladung', 'Mahlgradkalibrierung', 'Klarheit und Körper'] },
  { n: '06', clip: 'ch6-puck', name: 'Puck Preparation', sub: 'Gleichmäßig schlägt kräftig.', amb: 'grounds', items: ['Grundlagen der Puck Preparation', 'Der Puck-Preparation-Prozess', 'WDT Tool', 'Leveler', 'Tampen', 'Tamper und Rillenprofile', 'Puck Screen und IMS Duschsieb', 'IMS Competition Siebe', 'Siebtypen und ihre Auswirkungen', 'Übersicht der Puck-Preparation-Tools'] },
  { n: '07', clip: 'ch7-dampf', name: 'Cupping', sub: 'Schmecken mit System.', amb: 'bubbles', items: ['Was ist Cupping?', 'Cupping-Ablauf', 'Sensorische Bewertung'] },
  { n: '', name: 'Abschluss' }
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
export const rep = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join('');
// small seeded random so every build draws the same picture
export function rng(seed = 1) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const f1 = v => Math.round(v * 10) / 10;

export function scene({ id, ch, title, light, cut, steps, cls = '' }, body) {
  return `\n<section class="scene${light ? ' light' : ''}${cls ? ' ' + cls : ''}" id="s-${id}" data-id="${id}" data-ch="${ch}" data-title="${esc(title)}"${steps ? ` data-steps="${steps}"` : ''}${cut ? ` data-cut="${cut}"` : ''}>${body}\n</section>`;
}
export const inner = html => `<div class="inner">${html}</div>`;
export const kicker = (ch, d = 0) => `<div class="kicker rv" style="--d:${d}"><span class="n">${CHAPTERS[ch].n}</span>${CHAPTERS[ch].name.replace('­', '')}</div>`;
export const notes = (items, cls = '') => `<ul class="notes ${cls}">${items.map(i => `<li><span>${i}</span></li>`).join('')}</ul>`;
export const tbl = (head, rows, cls = '') => `<table class="tbl ${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
export const stats = (items, cls = '') => `<div class="stats ${cls}">${items.map(([v, d]) => `<div class="stat"><span class="v">${v}</span><span class="d">${d}</span></div>`).join('')}</div>`;
export const why = html => `<p class="why">${html}</p>`;

// chapter title card
export function chapter(ch) {
  const C = CHAPTERS[ch];
  return scene({ id: `kapitel-${ch}`, ch, title: `Kapitel ${ch}: ${C.name.replace('­', '')}`, cut: 'leak', cls: 'chap' }, `
  ${C.clip ? bgVideo(C.clip, .5) : `<div class="amb" data-amb="${C.amb}"></div>`}<div class="chap-shade"></div>
  ${inner(`<div class="chap-grid">
    <div><div class="chap-n" aria-hidden="true">${C.n}</div><h2 class="chap-t rv" style="--d:2">${C.name}</h2><p class="chap-sub rv" style="--d:4">${C.sub}</p></div>
    <ol class="chap-list rv" style="--d:6">${C.items.map((t, k) => `<li><span class="i">${ch}.${k + 1}</span><span>${t}</span></li>`).join('')}</ol>
  </div>`)}`);
}

// real footage, graded in the BUNCA look. Files live in media/: <name>.mp4 (pre-slowed 4x), <name>.jpg (poster), <name>-s.mp4 (small loop)
export const bgVideo = (name, rate = 1, small = false) => `<div class="cine-bg real-bg"><video data-bg data-rate="${rate}" data-src="media/${name}${small ? '-s' : ''}.mp4" poster="media/${name}.jpg" muted loop playsinline preload="none" aria-hidden="true"></video></div>`;

// real-footage scene in the same layout as a film scene: phases, speeds, scrub bar and subtitles drive the video
export function realFilm({ id, ch, title, name, lead = '', clip, slow = 4, dur, rate = .5, marks = [], extra = '' }) {
  return scene({ id, ch, title, cls: 'real' }, inner(`
  <div class="fs">
    <div class="fs-side">
      ${kicker(ch)}
      <h2 class="fs-name rv" style="--d:1">${name || title}</h2>
      <span class="real-tag rv" style="--d:1">Echte Aufnahme</span>
      ${lead ? `<p class="mute rv fs-extra" style="--d:2">${lead}</p>` : ''}
      <div class="rv" style="--d:2" data-slot="phases"></div>
      <div class="fs-foot rv" style="--d:3"><div data-slot="speeds"></div><span class="time" data-slot="time">0,0 s</span></div>
      ${extra ? `<div class="rv fs-extra" style="--d:4">${extra}</div>` : ''}
    </div>
    <div class="fs-main rv-img" style="--d:1">
      <div class="film" data-film data-dur="${dur}" data-rate="${rate}" data-slow="${slow}" data-marks='${JSON.stringify(marks).replace(/'/g, '&#39;')}'>
        <video data-src="media/${clip}.mp4" poster="media/${clip}.jpg" muted loop playsinline preload="none" aria-label="${esc(title)}"></video>
      </div>
      <div data-slot="sub"></div>
    </div>
  </div>`));
}

// standard film scene: text + phases + speeds on the left, the motion graphic on the right
export function film({ id, ch, title, name, lead = '', dur, rate = 1, marks = [], svg, draw, extra = '', labels, still }) {
  return scene({ id, ch, title }, inner(`
  <div class="fs">
    <div class="fs-side">
      ${kicker(ch)}
      <h2 class="fs-name rv" style="--d:1">${name || title}</h2>
      ${lead ? `<p class="mute rv fs-extra" style="--d:2">${lead}</p>` : ''}
      <div class="rv" style="--d:2" data-slot="phases"></div>
      <div class="fs-foot rv" style="--d:3"><div data-slot="speeds"></div><span class="time" data-slot="time">0,0 s</span></div>
      ${extra ? `<div class="rv fs-extra" style="--d:4">${extra}</div>` : ''}
    </div>
    <div class="fs-main rv-img" style="--d:1">
      <div class="film" data-film data-dur="${dur}" data-rate="${rate}"${still ? ` data-still="${still}"` : ''} data-marks='${JSON.stringify(marks).replace(/'/g, '&#39;')}'${draw ? ` data-draw="${draw}"` : ''}${labels ? ` data-labels='${JSON.stringify(labels)}'` : ''}>
        ${draw ? '<canvas></canvas>' : `<svg class="mg" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(title)}">${svg}</svg>`}
      </div>
      <div data-slot="sub"></div>
    </div>
  </div>`));
}

// ---------- shared svg parts ----------
export const defs = `<defs>
  <linearGradient id="g-steel" x1="0" x2="1"><stop offset="0" stop-color="#6f6862"/><stop offset=".45" stop-color="#e2ddd8"/><stop offset="1" stop-color="#7a736d"/></linearGradient>
  <linearGradient id="g-steel-v" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#cfc9c3"/><stop offset="1" stop-color="#6f6862"/></linearGradient>
  <linearGradient id="g-espresso" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c99a6b"/><stop offset=".22" stop-color="#7a4a28"/><stop offset="1" stop-color="#2a170d"/></linearGradient>
  <linearGradient id="g-puck" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5b3720"/><stop offset="1" stop-color="#3a2114"/></linearGradient>
  <radialGradient id="g-bean" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#8a5a36"/><stop offset="1" stop-color="#3a2114"/></radialGradient>
  <filter id="f-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="f-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="12"/></filter>
  <linearGradient id="g-glint" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke" style="visibility:visible"/></marker>
</defs>`;
// a glass (tumbler): outline only, the liquid is drawn by the caller between y0 (top) and y1 (bottom)
export const glass = (x, y, w, h, o = '') => `<path d="M${x} ${y} L${x + w * .08} ${y + h} Q${x + w * .1} ${y + h + 8} ${x + w * .2} ${y + h + 8} L${x + w * .8} ${y + h + 8} Q${x + w * .9} ${y + h + 8} ${x + w * .92} ${y + h} L${x + w} ${y}" fill="rgba(243,238,232,.05)" stroke="#f3eee8" stroke-width="2" stroke-opacity=".7" ${o}/>`;
export const bean = (x, y, s, r = 0, o = '') => `<g transform="translate(${x} ${y}) rotate(${r})" ${o}><ellipse rx="${s}" ry="${f1(s * .68)}" fill="url(#g-bean)"/><path d="M${-s * .8} 0 C${-s * .3} ${-s * .3} ${s * .3} ${s * .3} ${s * .8} 0" fill="none" stroke="#1d110a" stroke-width="${f1(Math.max(1, s * .1))}" stroke-linecap="round"/></g>`;
export const arrow = (d, col = 'var(--peach)', o = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="2.5" marker-end="url(#arr)" ${o}/>`;

// ---------- parts that make a film feel alive (all clock-driven, so they slow down with the film) ----------
// living liquid surface: a travelling wave that sits on top of a liquid of colour `col`, between x and x+w at height y.
// Put it inside the group that scales the liquid (and inside a clip-path if the vessel is not rectangular).
export const wave = (x, y, w, col, amp = 4, L = 2.4, o = '') => { const n = Math.ceil(w / 40) + 2; let d = `M${x - 80} ${y}`; for (let i = 0; i < n * 2; i++) d += ` q10 ${i % 2 ? amp : -amp} 20 0`; return `<g ${o}><g data-loop="${L}" data-k="x~:0@0 40@${L}"><path d="${d} v${amp * 3} H${x - 80} Z" fill="${col}"/></g></g>`; };
// steam: soft wisps that rise and drift from (x, y); show it only while the liquid is hot via the wrapper keys in `o`
export const steam = (x, y, n = 3, o = '') => `<g ${o}>${rep(n, i => { const L = f1(3.2 + i * .7), dx = (i - (n - 1) / 2) * 22; return `<g transform="translate(${x + dx} ${y})"><path d="M0 0 q-12 -22 0 -44 t0 -44" fill="none" stroke="#f3eee8" stroke-width="9" stroke-linecap="round" filter="url(#f-soft)" data-loop="${L}" data-off="${f1(i * 1.1)}" data-k="y~:10@0 -46@${L};x:0@0 ${i % 2 ? 9 : -9}@${f1(L / 2)} 0@${L};o:0@0 .34@${f1(L * .3)} 0@${L};sy:.6@0 1.15@${L}"/></g>`; })}</g>`;
// splash where a stream hits a surface at (x, y): spreading rings and a few droplets thrown up and falling back
export const splash = (x, y, col = '#c99a6b', o = '') => `<g ${o}>${rep(3, i => `<ellipse cx="${x}" cy="${y}" rx="6" ry="1.6" fill="none" stroke="${col}" stroke-width="1.6" data-loop="1.2" data-off="${f1(i * .4)}" data-k="sx<:1@0 5.5@1.2;sy<:1@0 3@1.2;o:.9@0 0@1.2"/>`)}${rep(4, i => { const dx = [-16, 13, -7, 19][i], L = f1(.7 + i * .12); return `<circle cx="${x}" cy="${y - 2}" r="${f1(1.6 + (i % 2))}" fill="${col}" data-loop="${L}" data-off="${f1(i * .23)}" data-k="x~:0@0 ${dx}@${L};y<:0@0 ${-14 - i * 3}@${f1(L / 2)};o:1@0 1@${f1(L * .6)} 0@${L}"/>`; })}</g>`;
// a moving glint on glass or steel between x and x+w (rect of height h at y)
export const glint = (x, y, w, h, L = 5, o = '') => `<g ${o} style="mix-blend-mode:screen"><rect x="${x}" y="${y}" width="${f1(w * .22)}" height="${h}" fill="url(#g-glint)" data-loop="${L}" data-k="x:0@0 ${f1(w * .8)}@${f1(L * .45)} ${f1(w * .8)}@${L};o:0@0 .8@${f1(L * .15)} 0@${f1(L * .45)}"/></g>`;
