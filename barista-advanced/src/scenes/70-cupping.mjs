import { chapter, scene, inner, kicker, film, notes, tbl, why, rep, rng, defs, bean, f1 } from '../lib.mjs';
const CH = 7;

/* a coarse coffee particle */
const grit = (x, y, s, c, o = '') => `<path d="M${f1(x)} ${f1(y)}l${f1(s)} ${f1(-s * .5)}l${f1(s * .8)} ${f1(s * .7)}l${f1(-s * .6)} ${f1(s)}l${f1(-s)} ${f1(-s * .2)}z" fill="${c}" ${o}/>`;
const BR = ['#5b3720', '#4a2c1a', '#3a2114', '#7a5238'];

/* ---------- 7.1 the cupping table from above ---------- */
const tableSvg = () => {
  const R = rng(71), COF = ['#7a4a28', '#5b3720', '#3a2114'], cx = [108, 232, 356], cy = [176, 266, 356];
  const sheet = (x, rot, picks) => `<g transform="rotate(${rot} ${x + 59} 456)"><rect x="${x}" y="412" width="118" height="88" rx="4" fill="#f3eee8" stroke="#262626" stroke-width="2"/>
    <path d="M${x + 10} 426h52" stroke="#262626" stroke-width="3"/>
    ${rep(5, r => `<path d="M${x + 10} ${440 + r * 11}h32" stroke="#262626" stroke-opacity=".45" stroke-width="2"/>${rep(5, j => `<circle cx="${x + 58 + j * 11}" cy="${440 + r * 11}" r="3" fill="${j === picks[r] ? '#7a5238' : 'none'}" stroke="#7a5238" stroke-width="1.2"/>`)}`)}</g>`;
  const lbl = (y, x0, t) => `<path class="ln" d="M${x0} ${y}H522" stroke-width="1.5"/><circle cx="${x0}" cy="${y}" r="3.5" fill="#262626"/><text x="532" y="${y + 6}" class="ts" style="font-size:19px">${t}</text>`;
  return `<svg class="dg" viewBox="0 0 712 520" role="img" aria-label="Cupping-Tisch von oben: drei Kaffees mit je drei Schalen, Röstproben, Löffel, Spülgläser und Bewertungsbögen">${defs}
  <defs><radialGradient id="c7-puff"><stop offset="0" stop-color="#f3eee8" stop-opacity=".75"/><stop offset="1" stop-color="#f3eee8" stop-opacity="0"/></radialGradient></defs>
  <rect x="8" y="8" width="500" height="504" rx="26" fill="#7a5238" opacity=".2"/>
  ${rep(6, i => `<path d="M30 ${70 + i * 78}q120 ${i % 2 ? 8 : -8} 240 0t226 0" fill="none" stroke="#7a5238" stroke-opacity=".16" stroke-width="2"/>`)}
  ${rep(3, i => `<g class="c7-pop" style="--d:${i}"><rect x="${cx[i] - 48}" y="38" width="96" height="58" rx="10" fill="#f3eee8" stroke="#262626" stroke-width="2"/>
    ${rep(8, k => bean(f1(cx[i] - 33 + (k % 4) * 22 + R() * 5), f1(57 + Math.floor(k / 4) * 21 + R() * 4), 8, Math.round(R() * 180)))}
    <text x="${cx[i]}" y="121" class="tm mid">Kaffee ${'ABC'[i]}</text></g>`)}
  ${rep(3, j => rep(3, i => `<g transform="translate(${cx[i]} ${cy[j]})"><g class="c7-pop" style="--d:${3 + j * 2 + i}">
    <circle r="38" fill="#f3eee8" stroke="#262626" stroke-width="2.5"/><circle r="30" fill="${COF[i]}"/><circle r="30" fill="none" stroke="#c99a6b" stroke-opacity=".55" stroke-width="2"/>
    <path d="M-19 -11 A22 22 0 0 1 5 -21" fill="none" stroke="#f3eee8" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/>
    <circle r="17" fill="url(#c7-puff)" data-loop="4" data-off="${f1(R() * 4)}" data-k="o:0@0 .85@1.3 0@4;x~:-8@0 ${f1(8 + R() * 8)}@4;y~:8@0 ${-f1(12 + R() * 8)}@4;s:.5@0 1.6@4"/></g></g>`))}
  ${[170, 330].map((y, k) => `<g class="c7-pop" style="--d:${6 + k * 3}"><circle cx="452" cy="${y}" r="24" fill="#f3eee8" stroke="#262626" stroke-width="2.5"/><circle cx="452" cy="${y}" r="18" fill="#7fb4dc" fill-opacity=".5"/>
    <ellipse cx="447" cy="${y + 5}" rx="8" ry="10" fill="#cfc9c3" stroke="#262626" stroke-width="1.2" transform="rotate(40 447 ${y + 5})"/><path d="M452 ${y - 1}L486 ${y - 40}" stroke="#262626" stroke-width="8" stroke-linecap="round"/><path d="M452 ${y - 1}L486 ${y - 40}" stroke="#cfc9c3" stroke-width="5" stroke-linecap="round"/></g>`).join('')}
  <g class="c7-pop" style="--d:11">${sheet(52, -4, [3, 2, 4, 3, 3])}${sheet(192, 3, [2, 4, 3, 2, 4])}
    <g transform="rotate(-32 262 470)"><rect x="222" y="466" width="70" height="8" rx="2" fill="#d9a35f" stroke="#262626" stroke-width="1.5"/><path d="M292 466l12 4l-12 4z" fill="#f3eee8" stroke="#262626" stroke-width="1.5" stroke-linejoin="round"/></g></g>
  <g class="c7-pop" style="--d:12"><rect x="384" y="442" width="98" height="8" rx="4" fill="#cfc9c3" stroke="#262626" stroke-width="1.5"/><ellipse cx="374" cy="446" rx="17" ry="12" fill="#cfc9c3" stroke="#262626" stroke-width="1.5"/><ellipse cx="373" cy="446" rx="11" ry="7" fill="#e2ddd8"/></g>
  ${lbl(67, 404, 'Röstproben')}${lbl(170, 476, 'Spülgläser')}${lbl(266, 394, 'Cupping-Schalen')}${lbl(446, 482, 'Cupping-Löffel')}${lbl(490, 312, 'Bewertungsbögen')}
  </svg>`;
};

/* ---------- 7.2 one bowl, six stages ---------- */
const spoon = (inside = '') => `<path d="M20 -9 L150 -150" fill="none" stroke="url(#g-steel)" stroke-width="7" stroke-linecap="round"/>
  <path d="M-25 -11 C-22 9 22 9 25 -11 C12 -5 -12 -5 -25 -11 Z" fill="url(#g-steel)" stroke="#f3eee8" stroke-opacity=".45"/>${inside}`;
const wisp = (h, w) => { let d = 'M0 0'; const n = Math.round(h / 44); for (let i = 0; i < n; i++) { const s = i % 2 ? 1 : -1; d += ` c${s * w} -14 ${s * w} -30 0 -44`; } return d; };
const CAV = 'M390 246 L424 404 Q430 426 452 426 L588 426 Q610 426 616 404 L650 246 Z';
const ablaufSvg = () => {
  const R = rng(72);
  const half = (x0, x1, origin) => { let top = ''; for (let x = x0; x <= x1; x += 14) top += ` L${x} ${f1(265 - R() * 5)}`;
    return `<g style="transform-origin:${origin} 100%" data-k="o:0@6.2 1@8.4 1@17 .85@18.8 0@20.8;sx:1@13.9 .68@16.4;sy:.3@6.2 1@9 1.35@12.8 1.35@13.9 .85@16.6 .85@18.8 .3@20.8">
      <path d="M${x0} 292${top} L${x1} 292 Z" fill="#8a5a36"/><path d="M${top.slice(2)}" fill="none" stroke="#c99a6b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      ${rep(16, () => grit(x0 + 8 + R() * (x1 - x0 - 20), 272 + R() * 14, 3 + R() * 2.5, BR[Math.floor(R() * 3)]))}</g>`; };
  return defs + `<defs><clipPath id="c7-cav"><path d="${CAV}"/></clipPath>
    <filter id="c7-blur" x="-100%" y="-10%" width="300%" height="120%"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
  <g data-k="o:0@0 1@.5 1@27.3 0@28">
  <path d="M250 446H790" stroke="#5a4f47" stroke-width="2"/>
  <!-- bowl in cross-section -->
  <path d="M376 246 L412 412 Q419 444 452 444 L588 444 Q621 444 628 412 L664 246 Z" fill="#f3eee8" fill-opacity=".16"/>
  <path d="${CAV}" fill="#17120f"/>
  <path d="M390 246H376 L412 412 Q419 444 452 444 L588 444 Q621 444 628 412 L664 246H650" fill="none" stroke="#f3eee8" stroke-opacity=".75" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M390 246 L424 404 Q430 426 452 426 L588 426 Q610 426 616 404 L650 246" fill="none" stroke="#f3eee8" stroke-opacity=".3" stroke-width="1.5"/>
  <!-- 2 hot water -->
  <g data-k="o:0@3.6 1@4.2 1@7.9 0@8.6"><path d="M960 64 C870 64 820 150 730 128 C680 116 650 98 606 112" fill="none" stroke="url(#g-steel)" stroke-width="16" stroke-linecap="round"/>
    <text x="700" y="206" class="t">heißes Wasser</text></g>
  <path d="M598 116 Q560 132 548 420" fill="none" stroke="#e3704f" stroke-width="6" stroke-linecap="round" data-k="o:0@4.3 .9@4.5 .9@7.6 0@7.9"/>
  <g clip-path="url(#c7-cav)">
    <rect x="380" width="280" data-k="@y:426@4.5 276@7.8;@height:0@4.5 152@7.8;fill:#c98a6a@4.5 #7a4a28@7.5 #5b3720@11" fill-opacity=".95"/>
    <rect x="380" y="276" width="280" height="3" fill="#c99a6b" data-k="o:0@20.4 .7@21.4"/>
    <!-- grounds: bed, floating up, sinking again -->
    <g style="transform-origin:50% 100%" data-k="sy:0@.9 1@3.5 1@5 .3@8.6 .3@13.8 1@17.2">
      <path d="M400 398 Q440 388 480 394 Q520 386 560 393 Q600 388 640 398 L640 430 L400 430 Z" data-k="fill:#9a6a44@4.6 #2a170d@6.2"/>
      ${rep(22, () => grit(432 + R() * 170, 400 + R() * 18, 4 + R() * 3, R() > .5 ? '#c99a6b' : '#1d110a', 'opacity=".45"'))}</g>
    ${rep(26, () => { const x = 432 + R() * 172, y0 = 402 + R() * 16, D = -f1(y0 - 270 - R() * 14), a = f1(5 + R()), b = f1(13.8 + R() * .9);
      return `<g data-k="y:0@${a} ${D}@${f1(a + 2.6)} ${D}@${b} 0@${f1(b + 2.6)};o:0@4.9 1@5.3 1@8.6 0@9.4 0@13.5 1@13.8 1@16.5 0@17.3">${grit(x, y0, 4 + R() * 3, BR[Math.floor(R() * 4)])}</g>`; })}
    ${half(380, 520, '0%')}${half(520, 660, '100%')}
  </g>
  <!-- 1 grinding: coarse grounds fall into the bowl -->
  <g data-k="o:0@0 1@.4 1@3.1 0@3.8"><path d="M468 96 L572 96 L542 150 L498 150 Z" fill="url(#g-steel)"/><rect x="500" y="150" width="40" height="14" rx="3" fill="url(#g-steel)"/>
    ${rep(10, i => grit(508 + R() * 22, 166, 6 + R() * 3, BR[i % 4], `data-loop="1.1" data-off="${f1(i * .11)}" data-k="y~:0@0 232@1.1;x~:0@0 ${f1(R() * 70 - 35)}@1.1;r~:0@0 ${Math.round(R() * 240)}@1.1;o:1@0 1@.95 0@1.1"`))}
    <text x="640" y="150" class="t">relativ grob</text><path class="lead-l" d="M632 144 L556 176"/></g>
  <!-- 3 crust: CO2 escapes -->
  <g data-k="o:0@8.2 1@9 1@12.8 0@13.5">${rep(11, () => { const L = f1(1.2 + R() * 1.2); return `<circle cx="${f1(420 + R() * 200)}" cy="256" r="${f1(3 + R() * 4)}" fill="none" stroke="#f3eee8" stroke-width="1.5" data-loop="${L}" data-off="${f1(R() * 2)}" data-k="y~:0@0 ${-f1(26 + R() * 30)}@${L};o:0@0 .9@${f1(L * .2)} 0@${L};s:.5@0 1.2@${L}"/>`; })}
    <text x="716" y="218" class="tb">CO₂</text><path class="lead-l" d="M708 212 L626 244"/>
    <text x="716" y="250" class="ts">Kaffee quillt auf</text></g>
  <!-- 4 breaking the crust: aromas rise -->
  <g data-k="o:0@14.2 1@15 1@17.6 0@18.6">${[472, 510, 548].map((x, i) => `<g transform="translate(${x} 240)"><path d="${wisp(132, 13)}" class="draw" pathLength="1" fill="none" stroke="#f3eee8" stroke-width="${5 + i}" stroke-linecap="round" filter="url(#c7-blur)" data-loop="2.8" data-off="${f1(i * .9)}" data-k="d:1@0 0@1.5;y~:0@0 -36@2.8;x~:0@0 ${i * 9 - 6}@2.8;o:0@0 .6@.6 .5@1.6 0@2.8"/></g>`).join('')}
    <text x="404" y="138" class="t end">Aromen</text><path class="lead-l" d="M412 132 L462 154"/></g>
  <g transform="translate(520 276)"><g data-k="x:90@13 0@13.8 0@14.4 38@15.3 -30@16.2 70@17.4;y:-210@13 -44@13.8 14@14.4 10@15.3 10@16.2 -210@17.4;o:0@13 1@13.4 1@17 0@17.5">${spoon()}</g></g>
  <!-- 5 skimming with two spoons -->
  ${['', ' scale(-1 1)'].map(m => `<g transform="translate(520 276)${m}"><g data-k="x:150@18 112@18.8 16@20.3 16@20.8 150@21.9;y:-170@18 2@18.8 2@20.3 -34@20.8 -190@21.9;o:0@18 1@18.4 1@21.5 0@22">${spoon(`<ellipse cx="0" cy="-10" rx="19" ry="6" fill="#c99a6b" data-k="o:0@19 1@20.3"/>`)}</g></g>`).join('')}
  <!-- 6 tasting at different temperatures -->
  <g transform="translate(520 276)"><g data-k="x:70@22.6 0@23.3;y:-170@22.6 8@23.3 -74@24 -74@24.5 8@25.1 -74@25.8 -74@26.3 8@26.9 -74@27.6;o:0@22.6 1@23">${spoon(`<ellipse cx="0" cy="-7" rx="18" ry="4.5" fill="#7a4a28" data-k="o:0@23.2 1@23.4"/>`)}</g></g>
  <g data-k="o:0@22.4 1@23.1"><text x="766" y="132" class="tl">Temperatur</text>
    <rect x="780" y="150" width="20" height="216" rx="10" fill="rgba(243,238,232,.05)" stroke="#f3eee8" stroke-opacity=".7" stroke-width="2"/><circle cx="790" cy="376" r="18" fill="#17120f" stroke="#f3eee8" stroke-opacity=".7" stroke-width="2"/>
    <circle cx="790" cy="376" r="12" data-k="fill:#e3704f@24.4 #d9a35f@25 #d9a35f@26.2 #7fb4dc@26.8"/>
    <rect x="785" width="10" rx="5" data-k="@y:170@24.4 236@25 236@26.2 302@26.8;@height:200@24.4 134@25 134@26.2 68@26.8;fill:#e3704f@24.4 #d9a35f@25 #d9a35f@26.2 #7fb4dc@26.8"/>
    ${[['heiß', 170, 'o:1@24.4 .35@25'], ['warm', 236, 'o:.35@24.4 1@25 1@26.2 .35@26.8'], ['kühl', 302, 'o:.35@26.2 1@26.8']].map(([t, y, k]) => `<g data-k="${k}"><path d="M808 ${y}h14" stroke="#f3eee8" stroke-width="2"/><text x="832" y="${y + 8}" class="t">${t}</text></g>`).join('')}</g>
  <!-- timer -->
  <g data-k="o:0@3.8 1@4.5 1@17.4 0@18.4"><text x="48" y="150" class="tl">Zeit</text><text x="48" y="196" class="tb" style="font-size:46px" data-num="0@4.5 240@13" data-fmt="mm:ss" data-k="fill:#f3eee8@12.6 #f8cbad@13"></text>
    <text x="48" y="232" class="tm" data-k="o:0@12.6 1@13">ca. 4 Minuten</text></g>
  </g>`;
};

/* ---------- breaking the crust, close-up ---------- */
const crustSvg = () => {
  const R = rng(73);
  const half = (x0, x1, origin) => { let top = '', pops = ''; for (let x = x0; x <= x1; x += 16) { const y = f1(248 - 13 * Math.sin(Math.PI * (x - 222) / 636) - R() * 5); top += ` L${x} ${y}`;
      if (R() > .45) { const t = f1(2.9 + R() * 4.6), pop = R() > .4; pops += `<circle cx="${f1(x + R() * 10)}" cy="${f1(y - 3)}" r="${f1(3 + R() * 4)}" fill="rgba(243,238,232,.14)" stroke="#f3eee8" stroke-opacity=".65" stroke-width="1.5"${pop ? ` data-k="s:1@${t} 2@${f1(t + .35)};o:1@${t} 0@${f1(t + .35)}"` : ''}/>`; } }
    return `<g style="transform-origin:${origin} 100%" data-k="sx:1@3.3 .56@9.2;sy:1@3.3 1.1@6 .8@13">
      <path d="M${x0} 284${top} L${x1} 284 Z" fill="url(#c7-crust)"/><path d="M${top.slice(2)}" fill="none" stroke="#c99a6b" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" stroke-opacity=".9"/>
      ${rep(46, () => grit(x0 + 8 + R() * (x1 - x0 - 22), 254 + R() * 24, 3.5 + R() * 4, ['#4a2c1a', '#3a2114', '#a87648', '#2a170d'][Math.floor(R() * 4)]))}${pops}</g>`; };
  return defs + `<defs><clipPath id="c7-cav2"><path d="M222 214 L282 560 L798 560 L858 214 Z"/></clipPath>
    <linearGradient id="c7-liq" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6b4429"/><stop offset=".5" stop-color="#3a2114"/><stop offset="1" stop-color="#1d110a"/></linearGradient>
    <linearGradient id="c7-crust" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9a6a44"/><stop offset="1" stop-color="#5b3720"/></linearGradient>
    <radialGradient id="c7-glow"><stop offset="0" stop-color="#d9a35f" stop-opacity=".2"/><stop offset="1" stop-color="#d9a35f" stop-opacity="0"/></radialGradient>
    <radialGradient id="c7-puff2"><stop offset="0" stop-color="#f3eee8" stop-opacity=".2"/><stop offset="1" stop-color="#f3eee8" stop-opacity="0"/></radialGradient>
    <filter id="c7-blur2" x="-150%" y="-10%" width="400%" height="120%"><feGaussianBlur stdDeviation="4"/></filter></defs>
  <g data-k="o:0@0 1@.6 1@13.4 0@14">
  <circle cx="548" cy="176" r="350" fill="url(#c7-glow)"/>
  <!-- bowl walls -->
  <path d="M196 214 L222 214 L282 560 L256 560 Z" fill="#f3eee8" fill-opacity=".16" stroke="#f3eee8" stroke-opacity=".7" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M884 214 L858 214 L798 560 L824 560 Z" fill="#f3eee8" fill-opacity=".16" stroke="#f3eee8" stroke-opacity=".7" stroke-width="2.5" stroke-linejoin="round"/>
  <g clip-path="url(#c7-cav2)">
    <rect x="200" y="262" width="680" height="300" fill="url(#c7-liq)"/>
    <rect x="200" y="262" width="680" height="3" fill="#c99a6b" opacity=".6"/>
    <!-- bubbles rise through the opening -->
    <g data-k="o:0@3.2 1@4 1@9 0@11">${rep(11, () => { const L = f1(1.6 + R() * 1), H = f1(150 + R() * 110); return `<circle cx="${f1(440 + R() * 200)}" cy="${f1(268 + H)}" r="${f1(2.5 + R() * 4)}" fill="none" stroke="#f3eee8" stroke-width="1.5" data-loop="${L}" data-off="${f1(R() * 2)}" data-k="y~:0@0 ${-H}@${L};x:0@0 ${f1(R() * 20 - 10)}@${L};o:0@0 .7@${f1(L * .2)} .7@${f1(L * .85)} 0@${L}"/>`; })}</g>
    <!-- grounds sink -->
    ${rep(38, i => { const x = (i % 3 ? 410 + R() * 260 : 290 + R() * 500), a = f1(3.5 + R() * 4.9), e = f1(Math.min(13.9, a + 4.6 + R() * .8)), D = f1(190 + R() * 110);
      return `<g data-k="y:0@${a} ${D}@${e};x:0@${a} ${f1(R() * 50 - 25)}@${e};r:0@${a} ${Math.round(R() * 300 - 150)}@${e};o:0@${f1(a - .2)} 1@${f1(a + .3)} 1@${f1(e - 1.6)} .15@${e}">${grit(x, 270 + R() * 10, 4 + R() * 4.5, ['#7a5238', '#5b3720', '#9a6a44', '#4a2c1a'][Math.floor(R() * 4)])}</g>`; })}
    ${half(206, 540, '0%')}${half(540, 874, '100%')}
  </g>
  <!-- bubbles burst at the surface -->
  <g data-k="o:0@3.3 1@3.8 1@9.5 0@10.8">${rep(7, () => { const L = f1(1 + R() * .8); return `<circle cx="${f1(450 + R() * 180)}" cy="262" r="7" fill="none" stroke="#f3eee8" stroke-width="1.5" data-loop="${L}" data-off="${f1(R() * 2)}" data-k="s:.3@0 1.9@${f1(L * .6)};o:0@0 .9@.12 0@${f1(L * .6)}"/>`; })}</g>
  <!-- aromatic steam: looped wisps and soft puffs -->
  <g data-k="o:0@4 1@5.6 1@12.4 0@13.6">
    ${rep(4, i => { const L = f1(4 + R() * 1.6); return `<g transform="translate(${460 + i * 56} 250)"><circle r="46" fill="url(#c7-puff2)" data-loop="${L}" data-off="${f1(i * 1.3)}" data-k="y~:0@0 -190@${L};x~:0@0 ${f1(30 + R() * 50)}@${L};s:.6@0 2.2@${L};o:0@0 1@${f1(L * .3)} 0@${L}"/></g>`; })}
    ${[428, 474, 518, 560, 604, 652].map((x, i) => { const L = f1(3.6 + R() * 1.6), h = 176 + Math.round(R() * 2) * 44; return `<g transform="translate(${x} ${246 - (i % 2) * 6})"><path d="${wisp(h, 15 + R() * 8)}" class="draw" pathLength="1" fill="none" stroke="#f3eee8" stroke-width="${f1(6 + R() * 6)}" stroke-linecap="round" filter="url(#c7-blur2)" data-loop="${L}" data-off="${f1(i * .83)}" data-k="d:1@0 0@${f1(L * .5)};y~:0@0 -64@${L};x~:0@0 ${f1(14 + R() * 34)}@${L};o:0@0 .5@${f1(L * .22)} .38@${f1(L * .6)} 0@${L}"/></g>`; }).join('')}
    <text x="262" y="132" class="t">Aromen</text><path class="lead-l" d="M346 126 L420 150"/></g>
  <!-- cupping spoon -->
  <g transform="translate(540 262)"><g data-k="x:150@1.2 0@3;y:-262@1.2 -62@2.6 -14@3.2 26@4.2 22@6.4 -44@8.6 -280@10.4;r:0@2.6 -7@4.2 0@8;o:0@1.2 1@1.7 1@9.8 0@10.4">
    <path d="M56 -22 L340 -306" fill="none" stroke="url(#g-steel)" stroke-width="15" stroke-linecap="round"/>
    <path d="M-62 -24 C-58 22 58 22 62 -24 C32 -11 -32 -11 -62 -24 Z" fill="url(#g-steel)" stroke="#f3eee8" stroke-opacity=".5" stroke-width="1.5"/>
    <path d="M-48 -12 C-30 8 30 8 48 -12" fill="none" stroke="#17120f" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/></g></g>
  <!-- labels -->
  <g data-k="o:1@2.2 0@3"><text x="48" y="262" class="t">Kruste</text><path class="lead-l" d="M124 256 L228 252"/></g>
  <text x="48" y="150" class="tl">Zeit</text><text x="48" y="196" class="tb" style="font-size:46px" data-num="237@0 240@2.6 246@14" data-fmt="mm:ss" data-k="fill:#f3eee8@2.2 #f8cbad@2.6"></text>
  </g>`;
};

/* ---------- 7.3 aroma wheel ---------- */
const FAM = ['Nussig / Kakao', 'Süß', 'Fruchtig', 'Floral'];
const ARO = [
  { n: 'Schokolade', f: 0, c: '#3a2114', t: '#f3eee8', d: 'Erinnert an Kakao und dunkle Schokolade: weich, rund, röstig-süß.' },
  { n: 'Nuss', f: 0, c: '#7a5238', t: '#f3eee8', d: 'Erinnert an Haselnuss oder Mandel: warm, trocken, vertraut.' },
  { n: 'Karamell', f: 1, c: '#d9a35f', t: '#262626', d: 'Erinnert an gebräunten Zucker: süß, mit feiner Röstnote.' },
  { n: 'Zitrus', f: 2, c: '#ecd9a8', t: '#262626', d: 'Erinnert an Zitrone oder Orange: frisch, mit lebendiger Säure.' },
  { n: 'Beeren', f: 2, c: '#b8452a', t: '#f3eee8', d: 'Erinnert an rote und dunkle Beeren: saftig, fruchtig, süß-säuerlich.' },
  { n: 'Blüten', f: 3, c: '#f8cbad', t: '#262626', d: 'Erinnert an Jasmin und andere Blüten: zart, duftig, leicht.' }
];
const wheelSvg = () => {
  const P = (r, a) => [f1(300 + r * Math.cos(a * Math.PI / 180)), f1(300 + r * Math.sin(a * Math.PI / 180))];
  const ring = (r0, r1, a0, a1) => { const p0 = P(r1, a0), p1 = P(r1, a1), p2 = P(r0, a1), p3 = P(r0, a0); return `M${p0} A${r1} ${r1} 0 0 1 ${p1} L${p2} A${r0} ${r0} 0 0 0 ${p3} Z`.replace(/,/g, ' '); };
  const FA = [[-90, 30], [30, 90], [90, 210], [210, 270]];
  const arc = (r, a0, a1) => { const mid = ((a0 + a1) / 2 + 360) % 360, ccw = mid > 0 && mid < 180, s = P(r, ccw ? a1 : a0), e = P(r, ccw ? a0 : a1); return `M${s} A${r} ${r} 0 0 ${ccw ? 0 : 1} ${e}`.replace(/,/g, ' '); };
  return `<svg class="dg wheel c7-wheel" id="c7-wheel" viewBox="0 0 600 600" role="group" aria-label="Aromarad mit sechs typischen Aromen">
  <defs>${rep(4, k => `<path id="c7-fp${k}" d="${arc(112, FA[k][0], FA[k][1])}"/>`)}</defs>
  ${rep(4, k => `<path data-fam="${k}" d="${ring(86, 142, FA[k][0], FA[k][1])}" fill="#f3eee8" stroke="#b0a7a1" stroke-width="4" stroke-linejoin="round" style="cursor:default"/>`)}
  ${rep(6, k => `<path data-go="${k + 1}" role="button" tabindex="0" aria-pressed="false" aria-label="${ARO[k].n}, Familie ${FAM[ARO[k].f]}" d="${ring(148, 288, k * 60 - 90, k * 60 - 30)}" fill="${ARO[k].c}" stroke="#b0a7a1" stroke-width="4" stroke-linejoin="round"/>`)}
  ${rep(4, k => `<text data-t="f${k}" class="tl mid" dy="5" style="font-size:15px;fill:#262626"><textPath href="#c7-fp${k}" startOffset="50%">${FAM[k]}</textPath></text>`)}
  ${rep(6, k => { const p = P(220, k * 60 - 60); return `<text data-t="${k + 1}" x="${p[0]}" y="${p[1] + 8}" class="mid sl" fill="${ARO[k].t}">${ARO[k].n}</text>`; })}
  <circle cx="300" cy="300" r="78" fill="#f3eee8" stroke="#262626" stroke-width="2.5"/><circle cx="300" cy="300" r="64" fill="#2a170d"/><circle cx="300" cy="300" r="64" fill="none" stroke="#c99a6b" stroke-opacity=".6" stroke-width="2"/>
  <text id="c7-wc" x="300" y="302" class="mid" fill="#f3eee8" style="font-size:21px">Aromen</text>
  <text id="c7-wf" x="300" y="326" class="mid" fill="#f8cbad" style="font-size:12px;letter-spacing:.16em;text-transform:uppercase">antippen</text>
  </svg>`;
};

/* ---------- 7.3 radar around a tasting cup ---------- */
const CATS = [['Aroma', 'Geruch und Duftnoten'], ['Säure', 'Intensität und Charakter'], ['Süße', 'Wahrgenommene Süße'], ['Körper', 'Mundgefühl und Textur'], ['Balance', 'Zusammenspiel der Aromen'], ['Nachgeschmack', 'Länge und Qualität']];
const PROF = [
  { n: 'Heller Filterkaffee', v: [.86, .92, .62, .36, .66, .56], d: 'Viel Aroma und lebendige Säure, dazu ein leichter Körper.' },
  { n: 'Klassischer Espresso', v: [.7, .4, .6, .96, .72, .88], d: 'Dichter Körper, zurückhaltende Säure, langer Nachgeschmack.' },
  { n: 'Natural', v: [.9, .56, .94, .78, .56, .7], d: 'Häufig fruchtig, süß und körperreich.' }
];
const RC = [354, 214, 150];
const rpt = (k, r) => [f1(RC[0] + RC[2] * r * Math.cos((k * 60 - 90) * Math.PI / 180)), f1(RC[1] + RC[2] * r * Math.sin((k * 60 - 90) * Math.PI / 180))];
const hex = r => rep(6, k => rpt(k, r).join(',') + ' ');
const radarSvg = () => {
  const LB = [[354, 28, 'mid'], [498, 134, ''], [498, 294, ''], [354, 394, 'mid'], [210, 294, 'end'], [210, 134, 'end']];
  return `<svg class="dg c7-radar" viewBox="0 0 708 428" role="img" aria-label="Netzdiagramm mit sechs Bewertungskategorien rund um eine Verkostungstasse">
  <polygon points="${hex(1)}" fill="#f3eee8" fill-opacity=".4" stroke="#262626" stroke-opacity=".55" stroke-width="2" stroke-linejoin="round"/>
  ${[.34, .67].map(r => `<polygon points="${hex(r)}" fill="none" stroke="#262626" stroke-opacity=".22" stroke-width="1.5"/>`).join('')}
  ${rep(6, k => `<path d="M${RC[0]} ${RC[1]}L${rpt(k, 1).join(' ')}" stroke="#262626" stroke-opacity=".22" stroke-width="1.5"/>`)}
  <polygon id="c7-poly" points="${rep(6, k => rpt(k, PROF[0].v[k]).join(',') + ' ')}" fill="#7a5238" fill-opacity=".5" stroke="#4a2c1a" stroke-width="3" stroke-linejoin="round"/>
  ${rep(6, k => { const p = rpt(k, PROF[0].v[k]); return `<circle class="c7-dot" cx="${p[0]}" cy="${p[1]}" r="6.5" fill="#f3eee8" stroke="#262626" stroke-width="2"/>`; })}
  <!-- tasting cup from above -->
  <path d="M${RC[0] + 18} ${RC[1] - 6}h14a6 6 0 0 1 0 12h-14" fill="none" stroke="#262626" stroke-width="5"/><path d="M${RC[0] + 18} ${RC[1] - 6}h14a6 6 0 0 1 0 12h-14" fill="none" stroke="#f3eee8" stroke-width="2"/>
  <circle cx="${RC[0]}" cy="${RC[1]}" r="23" fill="#f3eee8" stroke="#262626" stroke-width="2.5"/><circle cx="${RC[0]}" cy="${RC[1]}" r="16" fill="#3a2114"/>
  <path d="M${RC[0] - 10} ${RC[1] - 5}a11 11 0 0 1 12 -6" fill="none" stroke="#f3eee8" stroke-opacity=".5" stroke-width="2.5" stroke-linecap="round"/>
  ${rep(6, k => `<text x="${LB[k][0]}" y="${LB[k][1]}" class="t ${LB[k][2]}" style="font-weight:500">${CATS[k][0]}</text><text x="${LB[k][0]}" y="${LB[k][1] + 22}" class="ts c7-desc ${LB[k][2]}">${CATS[k][1]}</text>`)}
  </svg>`;
};

export const css = `
.c7-pop{opacity:0;transform-box:fill-box;transform-origin:center}
.is-active .c7-pop{animation:c7pop .9s var(--ease) both;animation-delay:calc(var(--d,0) * 80ms + 450ms)}
@keyframes c7pop{from{opacity:0;transform:scale(.72)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.c7-pop{opacity:1}}
.c7-def{font-size:clamp(24px,1.7vw + 12px,44px);font-weight:500;line-height:1.1;letter-spacing:-.01em;color:var(--strong);overflow-wrap:anywhere}
.c7-def em{font-style:normal;color:var(--brown)}
.c7-wheel text{pointer-events:none;transition:opacity .3s}
.c7-wheel .sl{font-size:22px;font-weight:500}
.c7-wheel.sel text[data-t]:not(.on){opacity:.4}
.c7-wheel path:focus-visible{outline:none;stroke:#262626;stroke-width:5}
.c7-an{font-size:clamp(34px,3vw + 10px,64px);font-weight:300;line-height:1;color:var(--strong)}
.c7-fam{display:flex;align-items:center;gap:10px}
.c7-sw{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--ink);flex:none}
.c7-ph{display:none}
@media (max-width:980px),(max-aspect-ratio:1/1){.c7-ph{display:block}.c7-radar .c7-desc{display:none}}
`;

export const html = chapter(CH) +

scene({ id: 'cupping-was', ch: CH, title: '7.1 Was ist Cupping?', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="c7-def rv" style="--d:1"><em>Cupping</em> = standardisierte sensorische Kaffeebewertung</h2>
      <div class="stack rv" style="--d:2;gap:8px"><span class="label">Ziel</span>
        ${notes(['Qualität der Bohne beurteilen.', 'Aromaprofil erkennen.', 'Unterschiedliche Kaffees vergleichen.', 'Fehler und Defekte identifizieren.'], 'sm')}</div>
      <div class="stack rv" style="--d:3;gap:8px"><span class="label">Bewertungskriterien</span>
        <div class="chips">${['Aroma', 'Geschmack', 'Säure', 'Süße', 'Körper', 'Nachgeschmack', 'Balance'].map(c => `<span class="chip">${c}</span>`).join('')}</div></div>
      <div class="rv" style="--d:4">${why('<b>Standardisiert</b> heißt: Jede Schale wird gleich behandelt. Nur so lassen sich Kaffees fair vergleichen.')}</div>
    </div>
    <div class="rv-img" style="--d:2" data-film data-bare data-dur="12" data-still="5">${tableSvg()}</div>
  </div>`)) +

film({ id: 'cupping-ablauf', ch: CH, title: '7.2 Cupping-Ablauf', name: 'Sechs Schritte, eine Schale', dur: 28, rate: 1, still: 15.4,
  marks: [
    ['Mahlen', 0, 'Relativ <b>grober Mahlgrad</b>. Das Kaffeemehl kommt direkt in die Schale.'],
    ['Aufgießen', 4, '<b>Heißes Wasser</b> direkt auf das Kaffeemehl.'],
    ['Krustenbildung', 8, 'Der Kaffee quillt auf, <b>CO₂</b> entweicht. Oben bildet sich die Kruste.'],
    ['Breaking the Crust', 13, 'Nach <b>ca. 4 Minuten</b> Kruste aufbrechen. Aufsteigende Aromen beurteilen.'],
    ['Abschöpfen', 18, '<b>Kruste und Schaum</b> entfernen. Die Oberfläche ist jetzt sauber.'],
    ['Verkosten', 22.5, 'Bei <b>verschiedenen Temperaturen</b> probieren: heiß, warm und kühl.']
  ], svg: ablaufSvg() }) +

film({ id: 'crust', ch: CH, title: 'Breaking the Crust in Zeitlupe', name: 'Breaking the Crust in Zeitlupe', lead: 'Der Schlüsselmoment im Cupping, ganz langsam.', dur: 14, rate: .5, still: 7.4,
  marks: [
    ['Die Kruste steht', 0, 'Nach <b>ca. 4 Minuten</b> Kruste aufbrechen.'],
    ['Der Löffel taucht ein', 2.6, 'Der Löffel teilt die Kruste. Bläschen platzen, <b>CO₂</b> entweicht.'],
    ['Aromen steigen auf', 5.2, '<b>Aufsteigende Aromen beurteilen.</b> Jetzt ist der Duft am intensivsten.'],
    ['Das Kaffeemehl sinkt', 9.6, 'Das Kaffeemehl sinkt ab. Die Oberfläche beruhigt sich.']
  ], svg: crustSvg() }) +

scene({ id: 'aromarad', ch: CH, title: '7.3 Sensorische Bewertung – Aromarad', light: true, steps: 6 }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Typische Aromen</h2>
      <p class="lead wide rv" style="--d:2">Sechs Noten, die dir im Kaffee oft begegnen. Innen steht die Familie, außen die Note.</p>
      <div class="pane rv" style="--d:3">
        <div data-only="0" class="card stack" style="gap:10px"><span class="label">Aromarad</span><p class="lead wide">Tippe auf ein Segment oder blättere weiter.</p>
          <div class="chips">${ARO.map(a => `<span class="chip"><i class="c7-sw" style="background:${a.c}"></i>${a.n}</span>`).join('')}</div></div>
        ${rep(6, k => `<div data-only="${k + 1}" class="card stack" style="gap:10px"><span class="label c7-fam"><i class="c7-sw" style="background:${ARO[k].c}"></i>Familie: ${FAM[ARO[k].f]}</span>
          <h3 class="c7-an">${ARO[k].n}</h3><p class="lead wide">${ARO[k].d}</p></div>`)}
      </div>
      <div class="rv" style="--d:4">${why('<b>Wozu ein Aromarad?</b> Es gibt dir Worte für das, was du riechst und schmeckst – erst die Familie, dann die einzelne Note.')}</div>
    </div>
    <div class="rv-img" style="--d:2;display:grid">${wheelSvg()}</div>
  </div>`)) +

scene({ id: 'sensorik', ch: CH, title: '7.3 Sensorische Bewertung', light: true, steps: 2 }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Sechs Kategorien, eine Tasse</h2>
      <p class="lead wide rv" style="--d:2">Jede Kategorie beantwortet eine eigene Frage. Zusammen ergeben sie das Profil eines Kaffees.</p>
      <div class="c7-ph rv" style="--d:2">${tbl(['Kategorie', 'Was wird beurteilt?'], CATS)}</div>
      <div class="stack rv" style="--d:3;gap:10px"><span class="label">Drei Beispiele</span>
        <div class="tabs" role="group" aria-label="Beispielprofil wählen">${rep(3, i => `<button data-go="${i}" aria-pressed="false">${PROF[i].n}</button>`)}</div>
        <div class="pane">${rep(3, i => `<p data-only="${i}" class="lead wide">${PROF[i].d}</p>`)}</div></div>
      <div class="rv" style="--d:4">${why('<b>Beispiele, rein qualitativ.</b> Je weiter außen, desto ausgeprägter. Jeder Kaffee zeichnet sein eigenes Profil.')}</div>
    </div>
    <div class="rv-img" style="--d:2">${radarSvg()}</div>
  </div>`));

export const js = `
/* 7.3 aroma wheel: the segments are data-go buttons, the hook adds family and labels */
const C7A = ${JSON.stringify(ARO.map(a => [a.n, a.f, FAM[a.f]]))};
hooks['aromarad'] = { step: (sc, n) => {
  const w = $('#c7-wheel'), a = n ? C7A[n - 1] : null;
  w.classList.toggle('sel', !!a);
  $$('[data-fam]', w).forEach(p => p.classList.toggle('on', !!a && +p.dataset.fam === a[1]));
  $$('text[data-t]', w).forEach(t => t.classList.toggle('on', !!a && (t.dataset.t === String(n) || t.dataset.t === 'f' + a[1])));
  $('#c7-wc').textContent = a ? a[0] : 'Aromen';
  $('#c7-wf').textContent = a ? a[2] : 'antippen';
} };
$$('#c7-wheel [data-go]').forEach(p => p.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault(); e.stopPropagation(); p.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}));

/* 7.3 radar: morph between the example profiles */
const C7P = ${JSON.stringify(PROF.map(p => p.v))}, C7C = ${JSON.stringify(RC)};
const c7poly = $('#c7-poly'), c7dots = $$('.c7-dot');
let c7cur = C7P[0].slice(), c7raf = 0;
const c7pt = (k, r) => { const a = (k * 60 - 90) * Math.PI / 180; return [C7C[0] + C7C[2] * r * Math.cos(a), C7C[1] + C7C[2] * r * Math.sin(a)]; };
const c7draw = () => {
  const pts = c7cur.map((r, k) => c7pt(k, r));
  c7poly.setAttribute('points', pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '));
  c7dots.forEach((d, k) => { d.setAttribute('cx', pts[k][0].toFixed(1)); d.setAttribute('cy', pts[k][1].toFixed(1)); });
};
const c7to = (target, ms) => {
  cancelAnimationFrame(c7raf);
  if (reduce) { c7cur = target.slice(); c7draw(); return; }
  const from = c7cur.slice(), t0 = performance.now();
  const tick = now => { let u = clamp((now - t0) / ms, 0, 1); u = u * u * (3 - 2 * u); c7cur = from.map((v, k) => lerp(v, target[k], u)); c7draw(); if (u < 1) c7raf = requestAnimationFrame(tick); };
  c7raf = requestAnimationFrame(tick);
};
hooks['sensorik'] = {
  step: (sc, n) => c7to(C7P[n] || C7P[0], 900),
  enter: sc => { if (reduce) return; c7cur = c7cur.map(() => .1); c7draw(); c7to(C7P[state.step] || C7P[0], 1500); },
  leave: () => cancelAnimationFrame(c7raf)
};
`;

export const quiz = [
  { q: 'Wann wird beim Cupping die Kruste aufgebrochen?', o: ['Direkt nach dem Aufgießen.', 'Nach ca. 4 Minuten.', 'Erst nach dem Abschöpfen.'], a: 1, e: 'Nach <b>ca. 4 Minuten</b> brichst du die Kruste auf und beurteilst die aufsteigenden Aromen. Danach wird abgeschöpft.', go: 'crust' },
  { q: 'Was beurteilst du in der Kategorie „Körper“?', o: ['Mundgefühl und Textur', 'Geruch und Duftnoten', 'Länge und Qualität'], a: 0, e: '<b>Körper</b> steht für Mundgefühl und Textur. Geruch und Duftnoten gehören zum Aroma, Länge und Qualität zum Nachgeschmack.', go: 'sensorik' }
];
