import { chapter, scene, inner, kicker, film, notes, tbl, stats, why, rep, rng, defs, glass, f1, wave, steam, splash, glint , realFilm } from '../lib.mjs';
const CH = 1;

/* ---------- 1.1 six brewing methods, same glass ---------- */
const DRINKS = [
  { n: 'Filterkaffee', d: 'klar, aromatisch', c: '#8a4a22', a: .78, f: .82, m: [2, 5, 1] },
  { n: 'Handbrew', d: 'manuell aufgebrühter Filterkaffee', c: '#9c5527', a: .66, f: .82, m: [2, 5, 1] },
  { n: 'Cold Brew', d: 'kalt extrahierter Kaffee', c: '#4a2a18', a: .9, f: .82, m: [3, 4, 2], ice: 1 },
  { n: 'French Press', d: 'vollmundig, körperreich', c: '#5b3720', a: 1, f: .82, m: [4, 2, 2], specks: 1 },
  { n: 'Mokka', d: 'vollmundig, schwer, dicht', c: '#2a170d', a: 1, f: .5, m: [4, 2, 4], specks: 1 },
  { n: 'Espresso', d: 'konzentriert, intensiv, hoher Körper', c: '#3a2114', a: 1, f: .3, m: [5, 2, 5], crema: 1 }
];
const MC = ['#c99a6b', '#f3eee8', '#f8cbad'];
const T0 = i => f1(.6 + i * 2.8);
const liquid = (x, y, w, h, f, o) => { const yt = y + h * (1 - f), tl = w * .08 * (1 - f), b = w * .08; return `<path d="M${f1(x + tl)} ${f1(yt)} L${f1(x + w - tl)} ${f1(yt)} L${f1(x + w - b)} ${y + h + 5} L${f1(x + b)} ${y + h + 5} Z" ${o}/>`; };
const artenSvg = () => { const R = rng(7); return defs + rep(6, i => {
  const D = DRINKS[i], cx = 105 + i * 150, x = cx - 44, y = 140, w = 88, h = 160, t = T0(i), yt = y + h * (1 - D.f);
  return `<g data-k="o:.3@${f1(t - .4)} 1@${t}">
    <clipPath id="ar-c${i}"><path d="M${x + 2} ${y - 30} L${f1(x + w * .08 + 1)} ${y + h + 5} L${f1(x + w * .92 - 1)} ${y + h + 5} L${x + w - 2} ${y - 30} Z"/></clipPath>
    <g data-k="o:0@${t} .95@${f1(t + .12)} .95@${f1(t + 1.75)} 0@${f1(t + 2)}"><g data-k="sy>:0@${f1(t - .25)} 1@${f1(t + .1)}" style="transform-origin:50% 0%"><g data-loop=".7" data-k="sx:1@0 .78@.35 1@.7"><rect x="${cx - 3}" y="62" width="6" height="${y + h - 62}" rx="3" fill="${D.c}"/><rect x="${cx - 1}" y="62" width="1.5" height="${y + h - 62}" fill="#f3eee8" opacity=".35"/></g></g></g>
    <g clip-path="url(#ar-c${i})"><g data-k="sy<:0@${t} 1@${f1(t + 1.9)}" style="transform-origin:50% 100%">
      ${wave(x, f1(yt), w, D.c, 3.5, f1(1.8 + i * .13), `opacity="${D.a}" data-k="sy:1@${f1(t + 1.9)} .25@${f1(t + 3.4)}" style="transform-origin:50% 100%"`)}
      <g data-k="o:0@${f1(t + .2)} 1@${f1(t + .5)} 1@${f1(t + 1.8)} 0@${f1(t + 2.1)}">${splash(cx, f1(yt + 2), D.crema ? '#d9a35f' : '#c99a6b')}</g>
      ${liquid(x, y, w, h, D.f, `fill="${D.c}" fill-opacity="${D.a}"`)}
      ${D.crema ? `<rect x="${x + 6}" y="${f1(yt)}" width="${w - 12}" height="11" rx="3" fill="#d9a35f"/>` : `<rect x="${f1(x + w * .08 * (1 - D.f) + 2)}" y="${f1(yt)}" width="${f1(w - w * .16 * (1 - D.f) - 4)}" height="3" fill="#f3eee8" opacity=".35"/>`}
      ${D.specks ? rep(16, () => `<circle cx="${f1(x + 14 + R() * (w - 28))}" cy="${f1(yt + 8 + R() * (h * D.f - 14))}" r="${f1(1 + R() * 1.6)}" fill="#1d110a" opacity=".8"/>`) : ''}
      ${D.ice ? `<g data-loop="3.2" data-k="y:0@0 -5@1.6 0@3.2;r:-2@0 3@1.6 -2@3.2"><rect x="${cx - 26}" y="${f1(yt - 10)}" width="26" height="26" rx="5" fill="#f3eee8" opacity=".35" transform="rotate(-12 ${cx - 13} ${yt})"/><rect x="${cx + 2}" y="${f1(yt + 2)}" width="24" height="24" rx="5" fill="#f3eee8" opacity=".28" transform="rotate(14 ${cx + 14} ${yt + 14})"/></g>` : ''}
    </g></g>
    ${D.ice ? '' : steam(cx, f1(yt - 4), 2, `data-k="o:0@${f1(t + 1.7)} 1@${f1(t + 2.8)}"`)}
    ${glass(x, y, w, h)}${glint(x + 6, y, w - 12, h, f1(5.5 + i * .7), `data-k="o:0@${t} 1@${f1(t + 1)}"`)}
    <text x="${cx}" y="352" class="t mid">${D.n}</text>
    <g data-k="o:0@${f1(t + 1.5)} 1@${f1(t + 2.2)}">${rep(3, r => rep(5, j => `<circle cx="${cx - 32 + j * 16}" cy="${384 + r * 24}" r="5.5" fill="${j < D.m[r] ? MC[r] : 'none'}" stroke="${MC[r]}" stroke-opacity=".5"/>`))}</g>
  </g>`; }) + `
  <g transform="translate(250 484)">${rep(3, r => `<circle cx="${r * 170}" cy="-6" r="6" fill="${MC[r]}"/><text x="${r * 170 + 14}" y="0" class="ts">${['Körper', 'Klarheit', 'Konzentration'][r]}</text>`)}</g>`; };

/* ---------- cross-section panes ---------- */
const CUTS = [
  { n: 'Espresso', tds: 'ca. 8–12 %', oil: 'hoch', sus: 'mittel', c: '#2a170d', sol: 90, o: 26, s: 26, txt: 'Sehr konzentriert. Öle und feinste Partikel bilden die Crema.' },
  { n: 'Filterkaffee', tds: 'ca. 1,2–1,5 %', oil: 'gering', sus: 'gering', c: '#8a4a22', sol: 14, o: 2, s: 2, txt: 'Der Papierfilter hält Öle und Schwebstoffe zurück: klar und aromatisch.' },
  { n: 'Handbrew', tds: 'ca. 1,2–1,5 %', oil: 'gering', sus: 'gering', c: '#9c5527', sol: 14, o: 2, s: 3, txt: 'Wie Filterkaffee, aber von Hand gesteuert: jede Variable liegt bei dir.' },
  { n: 'Cold Brew', tds: 'je nach Rezeptur', oil: 'gering', sus: 'gering', c: '#4a2a18', sol: 24, o: 3, s: 5, txt: 'Kalt und lange extrahiert. Konzentration hängt von Ratio und Verdünnung ab.' },
  { n: 'French Press', tds: 'wie Filter', oil: 'hoch', sus: 'hoch', c: '#5b3720', sol: 16, o: 20, s: 40, txt: 'Das Metallsieb lässt Öle und Schwebstoffe durch: vollmundig, körperreich.' }
];
const cutSvg = () => { const R = rng(11); return `<svg class="dg" viewBox="0 0 590 440" role="img" aria-label="Getränk im Querschnitt">${defs}
  ${rep(5, i => { const C = CUTS[i]; return `<g data-only="${i}">
    <path d="M150 70 L172 380 L348 380 L370 70 Z" fill="${C.c}" fill-opacity="${C.sol > 50 ? 1 : .55 + C.sol / 100}"/>
    ${rep(C.sol, () => `<circle cx="${f1(175 + R() * 170)}" cy="${f1(95 + R() * 270)}" r="2.2" fill="#f8cbad" opacity=".55"/>`)}
    ${rep(C.s, () => { const x = 178 + R() * 164, y = 100 + R() * 268; return `<path d="M${f1(x)} ${f1(y)}l4 -2l3 3l-3 4z" fill="#120f0d"/>`; })}
    ${rep(C.o, () => `<circle cx="${f1(165 + R() * 190)}" cy="${f1(74 + R() * 22)}" r="${f1(3 + R() * 3)}" fill="#d9a35f" stroke="#7a5238"/>`)}
  </g>`; })}
  <path d="M146 56 L170 384 Q171 392 180 392 L340 392 Q349 392 350 384 L374 56" fill="none" stroke="#262626" stroke-width="3" stroke-linejoin="round"/>
  <g class="ts"><path class="ln" d="M374 84h46" stroke-width="1.5"/><text x="426" y="80">Öle</text><text x="426" y="100" class="tm" id="cut-oil"></text>
  <path class="ln" d="M362 210h58" stroke-width="1.5"/><text x="426" y="206">Gelöste Stoffe</text><text x="426" y="226" class="tm" id="cut-tds"></text>
  <path class="ln" d="M354 330h66" stroke-width="1.5"/><text x="426" y="326">Schwebstoffe</text><text x="426" y="346" class="tm" id="cut-sus"></text>
  <text x="130" y="230" class="end">Wasser</text><path class="ln" d="M136 224h28" stroke-width="1.5"/></g></svg>`; };

/* ---------- 1.2 handbrew film ---------- */
const hbSvg = () => { const R = rng(3); return defs + `
  <rect x="300" y="468" width="360" height="34" rx="10" fill="#2b2420" stroke="#5a4f47"/><rect x="430" y="476" width="100" height="18" rx="5" fill="#120f0d"/>
  <text x="480" y="491" class="tm mid" style="font-size:15px" data-num="0@2.4 40@5.2 40@12.6 240@19" data-fmt="{} g"></text>
  <!-- server -->
  <clipPath id="hb-srv"><path d="M398 330 L410 466 L550 466 L562 330 Z"/></clipPath>
  <g clip-path="url(#hb-srv)"><g data-k="sy:0@5 .12@12 .12@13.2 1@19.6" style="transform-origin:50% 100%"><path d="M412 372 L420 462 L540 462 L548 372 Z" fill="#7a4420"/>${wave(404, 372, 152, '#7a4420', 4, 2.3)}</g>
    <g data-k="y:86@5.6 78@12 78@13.4 0@19.6;o:0@5.6 1@6 1@19.6 0@20">${splash(480, 372, '#c99a6b')}</g></g>
  ${glass(396, 340, 168, 122)}
  <!-- dripper -->
  <path d="M352 168 L608 168 L512 322 L448 322 Z" fill="rgba(243,238,232,.06)" stroke="#f3eee8" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M362 176 L598 176 L508 318 L452 318 Z" fill="none" stroke="#f3eee8" stroke-opacity=".35" stroke-width="1.5"/>
  <rect x="408" y="322" width="144" height="12" rx="4" fill="url(#g-steel)"/>
  <!-- water standing in the cone -->
  <clipPath id="hb-cone"><path d="M362 176 L598 176 L508 318 L452 318 Z"/></clipPath>
  <g clip-path="url(#hb-cone)" data-k="o:0@13 .8@14 .8@18.6 .25@20"><g data-k="y:34@13 0@15.5 6@18.6 30@20"><path d="M380 222 L580 222 L540 270 L420 270 Z" fill="#7a4a28"/>${wave(380, 222, 200, '#7a4a28', 4, 1.9)}</g></g>
  <!-- coffee bed: dry, then wet and swelling -->
  <g data-k="sy:1@2.6 1.3@6.4 1.24@7.2 1.27@8 1.2@12 1@14" style="transform-origin:50% 100%"><path d="M424 262 L536 262 L508 318 L452 318 Z" data-k="fill:#9a6a44@2.5 #4a2c1a@5.5"/>
    <path d="M424 262 Q480 250 536 262" fill="none" stroke="#c99a6b" stroke-width="3" data-k="o:0@5 1@7 1@11 0@13"/></g>
  <!-- CO2 bubbles -->
  <g data-k="o:0@4.6 1@5.6 1@11 0@12.4">${rep(16, i => { const x = f1(436 + R() * 88), L = f1(1.4 + R() * 1.4); return `<circle cx="${x}" cy="252" r="${f1(3 + R() * 5)}" fill="none" stroke="#f3eee8" stroke-width="1.5" data-loop="${L}" data-off="${f1(R() * 2)}" data-k="y<:0@0 ${-f1(50 + R() * 50)}@${L};o:0@0 .9@${f1(L * .2)} .9@${f1(L * .85)} 0@${L};x:0@0 ${f1(R() * 16 - 8)}@${L};s:.5@0 1@${f1(L * .5)} 1@${f1(L * .85)} 1.7@${L}"/>`; })}
    <text x="640" y="214" class="tb">CO₂</text><path class="lead-l" d="M632 206 L540 216"/></g>
  <!-- kettle -->
  <g style="transform-box:view-box;transform-origin:960px 40px" data-k="r:-3@0 0@2.2 0@5 -1.5@6.5 -1.5@11.6 0@12.8 0@19 -3@20.5"><path d="M960 40 C860 40 800 150 700 120 C640 104 600 70 548 96" fill="none" stroke="url(#g-steel)" stroke-width="16" stroke-linecap="round"/></g>
  <g data-k="o:0@2.3 1@2.5 1@5 0@5.3"><g data-k="sy>:0@2.3 1@2.7" style="transform-origin:50% 0%"><g data-loop=".8" data-k="sx:1@0 .7@.4 1@.8"><path d="M540 100 Q520 120 516 258" fill="none" stroke="#cfe3f2" stroke-width="5" stroke-linecap="round"/></g></g>${splash(516, 258, '#cfe3f2', 'data-k="o:0@2.7 1@2.9"')}</g>
  <g data-k="o:0@12.8 1@13 1@19 0@19.3"><g data-loop="2.4" data-k="x:-34@0 30@1.2 -34@2.4"><g data-loop=".8" data-k="sx:1@0 .7@.4 1@.8"><path d="M540 100 Q520 120 516 226" fill="none" stroke="#cfe3f2" stroke-width="6" stroke-linecap="round"/></g>${splash(516, 226, '#cfe3f2')}</g></g>
  ${steam(480, 196, 3, 'data-k="o:0@3 1@4.6 1@19.6 0@20.6"')}
  <!-- drips -->
  <g data-k="o:0@5.4 1@6 1@19.8 0@20">${rep(3, i => `<ellipse cx="480" cy="338" rx="3.5" ry="6" fill="#7a4420" data-loop=".9" data-off="${i * .3}" data-k="y>:0@0 62@.9;sy:.5@0 1.5@.8 .6@.9;o:0@0 1@.12 1@.8 0@.9"/>`)}</g>
  <!-- readouts -->
  <text x="48" y="150" class="tl">Zeit</text><text x="48" y="194" class="tb" style="font-size:44px" data-num="0@2.5 40@12.8 170@20" data-fmt="mm:ss"></text>
  <text x="48" y="250" class="tl">Wasser</text><text x="48" y="294" class="tb" style="font-size:44px" data-num="0@2.4 40@5.2 40@12.6 240@19" data-fmt="{} g"></text>
  <g data-k="o:0@2.4 1@2.9 1@12 0@12.8"><text x="48" y="344" class="tm">Blooming</text></g>`; };

/* ---------- 1.3 cold brew film (time lapse) ---------- */
const cbSvg = () => { const R = rng(21); return defs + `
  <!-- jar -->
  <clipPath id="cb-jar"><rect x="232" y="110" width="236" height="356" rx="14"/></clipPath>
  <g clip-path="url(#cb-jar)"><g data-k="sy:0@3 1@5.6 1@12.4 .1@16.4" style="transform-origin:50% 100%"><g data-k="fill:#a9c9de@3 #a9c9de@6 #7a4a28@8.5 #4a2a18@12" fill-opacity=".92"><rect x="236" y="170" width="228" height="290" fill="inherit"/>${wave(236, 170, 228, 'inherit', 5, 2.6, 'data-k="sy:1@5.6 .3@7.5 .3@12.3 1@13 1@16.4" style="transform-origin:50% 100%"')}</g></g></g>
  ${rep(46, i => { const x = f1(250 + R() * 200), y0 = f1(430 + R() * 26 - (i % 6) * 9), up = -f1(R() * 220), t = f1(.3 + R() * 2.2); return `<g data-k="y:-440@${f1(t - .01)} -436@${t} -60@${f1(t + .4)} 0@${f1(t + .55)} -9@${f1(t + .68)} 0@${f1(t + .8)} 0@3.4 ${up}@5.6 ${f1(up * .6)}@12 0@16.4;r:0@${t} ${f1(R() * 300)}@16"><path d="M${x} ${y0}l9 -4l7 6l-5 9l-9 -2z" fill="${R() > .5 ? '#5b3720' : '#3a2114'}"/></g>`; })}
  <path d="M230 120 L230 452 Q230 468 246 468 L454 468 Q470 468 470 452 L470 120" fill="rgba(243,238,232,.05)" stroke="#f3eee8" stroke-width="2.5" stroke-opacity=".75"/>
  <rect x="222" y="104" width="256" height="18" rx="6" fill="url(#g-steel)" data-k="o:0@5.4 1@6 1@12 0@12.6"/>
  <!-- water in -->
  <g data-k="o:0@3 1@3.2 1@5.4 0@5.7"><g data-k="sy>:0@3 1@3.3" style="transform-origin:50% 0%"><g data-loop=".7" data-k="sx:1@0 .75@.35 1@.7"><rect x="345" y="0" width="10" height="440" rx="5" fill="#cfe3f2"/></g></g><g data-k="y:0@3.3 -250@5.5">${splash(350, 448, '#cfe3f2', 'transform="scale(1)"')}</g><text x="376" y="60" class="ts">kaltes Wasser</text></g>
  <!-- clock -->
  <g data-k="o:.25@5.6 1@6.2 1@12 .25@12.8"><circle cx="760" cy="150" r="78" fill="none" stroke="#f3eee8" stroke-width="2.5"/>
    ${rep(12, i => `<path d="M760 80v10" stroke="#f3eee8" stroke-width="2" transform="rotate(${i * 30} 760 150)"/>`)}
    <g style="transform-box:view-box;transform-origin:760px 150px" data-k="r~:0@6 540@12"><path d="M760 150V104" stroke="#f8cbad" stroke-width="5" stroke-linecap="round"/></g>
    <g style="transform-box:view-box;transform-origin:760px 150px" data-k="r~:0@6 6480@12"><path d="M760 150V86" stroke="#f3eee8" stroke-width="2.5" stroke-linecap="round"/></g>
    <circle cx="760" cy="150" r="5" fill="#f8cbad"/>
    <text x="760" y="270" class="tb mid" style="font-size:40px" data-num="0@6 18@12" data-fmt="{} h"></text></g>
  <!-- filter and serving glass -->
  <g data-k="o:0@12.2 1@12.8"><path d="M470 430 L600 430 L600 300" fill="none" stroke="url(#g-steel)" stroke-width="12"/><path d="M574 286 L626 286 L608 322 L592 322 Z" fill="#f3eee8" fill-opacity=".85"/><text x="640" y="310" class="ts">Filter</text>
    <g data-k="o:0@12.8 1@13 1@16.2 0@16.5"><path d="M600 322V470" stroke="#2a170d" stroke-width="6" stroke-linecap="round"/></g>
    <clipPath id="cb-gl"><path d="M538 350 L548 488 L652 488 L662 350 Z"/></clipPath>
    <g clip-path="url(#cb-gl)"><g data-k="sy:0@13 1@16.4" style="transform-origin:50% 100%"><path d="M548 388 L556 484 L644 484 L652 388 Z" fill="#4a2a18"/>${wave(548, 388, 104, '#4a2a18', 4, 2)}</g>
      <g data-k="y:90@13 0@16.4;o:0@13 1@13.3 1@16.2 0@16.6">${splash(600, 390, '#c99a6b')}</g></g>
    <g data-loop="3" data-k="y:0@0 -5@1.5 0@3;r:-3@0 3@1.5 -3@3"><rect x="566" y="396" width="30" height="30" rx="6" fill="#f3eee8" opacity=".4"/></g><g data-loop="3.6" data-off="1" data-k="y:0@0 -4@1.8 0@3.6;r:4@0 -3@1.8 4@3.6"><rect x="602" y="410" width="28" height="28" rx="6" fill="#f3eee8" opacity=".32"/></g>
    ${glass(536, 360, 128, 124)}</g>`; };

export const html = chapter(CH) +

film({ id: 'arten', ch: CH, title: '1.1 Arten der Kaffeezubereitung', name: 'Sechs Wege, ein Glas', dur: 18, rate: 1, still: 17.5,
  marks: DRINKS.map((D, i) => [D.n, f1(T0(i) - .4), `<b>${D.n}</b> – ${D.d}`]), svg: artenSvg() }) +

scene({ id: 'querschnitt', ch: CH, title: 'Getränke im Querschnitt', light: true, steps: 4 }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Was steckt im Glas?</h2>
      <div class="tabs rv" style="--d:2" role="group" aria-label="Getränk wählen">${rep(5, i => `<button data-go="${i}" aria-pressed="false">${CUTS[i].n}</button>`)}</div>
      <div class="pane rv" style="--d:3">${rep(5, i => `<div data-only="${i}" class="stack" style="gap:10px"><p class="lead wide">${CUTS[i].txt}</p>
        ${stats([[CUTS[i].tds, 'Gelöste Stoffe (TDS)'], [CUTS[i].oil, 'Öle'], [CUTS[i].sus, 'Schwebstoffe']])}</div>`)}</div>
      ${why('<b>Richtwerte.</b> Jede Methode löst andere Mengen aus dem Kaffee. Der Filter entscheidet, was im Glas landet.')}
    </div>
    <div class="rv-img" style="--d:2">${cutSvg()}</div>
  </div>`)) +

film({ id: 'handbrew', ch: CH, title: '1.2 Handbrew: manuelle Filterzubereitung', name: 'Handbrew in Zeitlupe', dur: 21, rate: .5, still: 8,
  marks: [
    ['Trockenes Kaffeebett', 0, '15 g Kaffee, gleichmäßig im Filter verteilt.'],
    ['Erste Wasserzugabe', 2.4, 'Blooming: ca. das <b>2–3-Fache</b> der Kaffeemenge aufgießen.'],
    ['CO₂ entweicht', 5.2, 'Das Kaffeebett quillt auf und setzt <b>CO₂</b> frei.'],
    ['30–45 Sekunden warten', 8.5, 'Gleichmäßige Vorbenetzung. Erst dann geht es weiter.'],
    ['Aufgießen bis 240 g', 12.8, 'In ruhigen Kreisen aufgießen. Brühzeit <b>2:30–3:00 min</b>.']
  ], svg: hbSvg() }) +

scene({ id: 'handbrew-werte', ch: CH, title: 'Handbrew: Richtwerte und Einflussfaktoren', light: true, steps: 5 }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Fünf Stellschrauben am Filter</h2>
      <div class="rv" style="--d:2">${tbl(['Parameter', 'Richtwert'], [['Brew Ratio', '1:16'], ['Kaffee', '15 g'], ['Wasser', '240 g'], ['Temperatur', '92–96 °C'], ['Brühzeit', '2:30–3:00 min']])}</div>
    </div>
    <div class="rv-img" style="--d:2">
      <svg class="dg" viewBox="0 0 620 470" role="img" aria-label="Arbeitsplatz von oben mit fünf Einflussfaktoren">
        <rect x="180" y="110" width="260" height="290" rx="22" fill="#262626" opacity=".12"/><rect x="250" y="360" width="120" height="26" rx="8" fill="#262626" opacity=".7"/>
        <circle cx="310" cy="235" r="112" fill="#f3eee8" stroke="#262626" stroke-width="2.5"/><circle cx="310" cy="235" r="92" fill="none" stroke="#262626" stroke-opacity=".3"/>
        <circle cx="310" cy="235" r="70" fill="#6b4429"/><circle cx="310" cy="235" r="44" fill="none" stroke="#f3eee8" stroke-width="3" class="flow slow"/><circle cx="310" cy="235" r="20" fill="none" stroke="#f3eee8" stroke-width="3" class="flow slow"/>
        <path d="M398 150 q30 -10 48 12" fill="none" stroke="#262626" stroke-width="12" stroke-linecap="round"/>
        <path d="M560 40 C470 50 420 120 350 200" fill="none" stroke="#7a736d" stroke-width="12" stroke-linecap="round"/><circle cx="574" cy="40" r="34" fill="#cfc9c3" stroke="#262626" stroke-width="2.5"/>
        <g data-s="1"><circle cx="262" cy="210" r="15" fill="#7a5238"/><text x="262" y="217" class="mid" fill="#f3eee8" font-size="17">1</text><text x="40" y="70" class="t"><tspan class="tm">1 </tspan>Mahlgrad</text><text x="40" y="94" class="ts">Oberfläche und Durchfluss</text></g>
        <g data-s="2"><circle cx="574" cy="40" r="15" fill="#7a5238"/><text x="574" y="47" class="mid" fill="#f3eee8" font-size="17">2</text><text x="470" y="110" class="t"><tspan class="tm">2 </tspan>Wassertemperatur</text><text x="470" y="134" class="ts">92–96 °C</text></g>
        <g data-s="3"><circle cx="402" cy="150" r="15" fill="#7a5238"/><text x="402" y="157" class="mid" fill="#f3eee8" font-size="17">3</text><text x="456" y="200" class="t"><tspan class="tm">3 </tspan>Gießgeschwindigkeit</text><text x="456" y="224" class="ts">ruhig und gleichmäßig</text></g>
        <g data-s="4"><circle cx="310" cy="373" r="15" fill="#7a5238"/><text x="310" y="380" class="mid" fill="#f3eee8" font-size="17">4</text><text x="310" y="430" class="t mid"><tspan class="tm">4 </tspan>Kontaktzeit</text><text x="310" y="454" class="ts mid">2:30–3:00 min</text></g>
        <g data-s="5"><circle cx="310" cy="235" r="15" fill="#7a5238"/><text x="310" y="242" class="mid" fill="#f3eee8" font-size="17">5</text><text x="40" y="330" class="t"><tspan class="tm">5 </tspan>Blooming</text><text x="40" y="354" class="ts">30–45 s Vorbenetzung</text></g>
      </svg>
    </div>
  </div>`)) +

film({ id: 'coldbrew', ch: CH, title: '1.3 Cold Brew: kalte Kaffeeextraktion', name: 'Cold Brew im Zeitraffer', dur: 17.5, rate: 1, still: 11, labels: ['Zeitraffer', 'Halbes Tempo', 'Viertel-Tempo'],
  marks: [
    ['Kaffee grob mahlen', 0, 'Grober Mahlgrad: wenig Oberfläche, langsame Extraktion.'],
    ['Mit kaltem Wasser vermischen', 3, 'Brew Ratio <b>1:8 bis 1:12</b>. Alles gut durchfeuchten.'],
    ['12–18 Stunden ziehen lassen', 6, 'Zeit ersetzt Temperatur: <b>12–18 Stunden</b> Kontaktzeit.'],
    ['Filtern und servieren', 12.4, 'Filtern, auf Eis servieren. Je nach Rezeptur verdünnen.']
  ], svg: cbSvg() }) +

scene({ id: 'coldbrew-werte', ch: CH, title: 'Cold Brew: Richtwerte und Charakteristik', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Kalt, lang, mild</h2>
      <div class="rv" style="--d:2">${tbl(['Parameter', 'Richtwert'], [['Brew Ratio', '1:8–1:12'], ['Mahlgrad', 'Grob'], ['Temperatur', 'Kalt'], ['Kontaktzeit', '12–18 Stunden']])}</div>
    </div>
    <div class="stack">
      <span class="label rv" style="--d:2">Charakteristik</span>
      <div class="rv" style="--d:3">${notes(['Häufig weichere Säurewahrnehmung.', 'Milde, süßliche Aromatik.', 'Weniger ausgeprägte Bitterkeit möglich.', 'Koffeingehalt abhängig von Rezeptur und Konzentration.'])}</div>
      <div class="rv" style="--d:4">${why('<b>Warum so lange?</b> Kaltes Wasser löst langsamer. Die Zeit gleicht die fehlende Temperatur aus.')}</div>
    </div>
  </div>`));

export const js = `
const CUTS = ${JSON.stringify(CUTS.map(c => [c.tds, c.oil, c.sus]))};
hooks['querschnitt'] = { step: (sc, n) => { const c = CUTS[n]; $('#cut-tds').textContent = c[0]; $('#cut-oil').textContent = c[1]; $('#cut-sus').textContent = c[2]; } };
`;

export const quiz = [
  { q: 'Was passiert in der Blooming-Phase beim Handbrew?', o: ['Der Kaffee wird ein zweites Mal gemahlen.', 'Das Kaffeebett wird vorbenetzt und setzt CO₂ frei.', 'Das Wasser wird auf 100 °C nachgeheizt.'], a: 1, e: 'Mit dem <b>2–3-Fachen</b> der Kaffeemenge vorbenetzen, CO₂ entweichen lassen, 30–45 Sekunden warten.', go: 'handbrew' },
  { q: 'Wie lange zieht ein Cold Brew typischerweise?', o: ['2–3 Minuten', '30–45 Sekunden', '12–18 Stunden'], a: 2, e: 'Kaltes Wasser löst langsam: <b>12–18 Stunden</b> bei grobem Mahlgrad und Ratio 1:8–1:12.', go: 'coldbrew' }
];
