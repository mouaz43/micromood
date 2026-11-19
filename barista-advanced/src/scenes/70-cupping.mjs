import { chapter, scene, inner, kicker, film, notes, tbl, why, rep, rng, defs, bean, f1, wave, steam, splash, glint } from '../lib.mjs';
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
  const lbl = (y, x0, t) => `<path class="ln" d="M${x0} ${y}H522" stroke-width="1.5"/><circle cx="${x0}" cy="${y}" r="3.5" fill="#262626"/><text x="532" y="${y + 6}" class="ts c7-lb">${t}</text>`;
  return `<svg class="dg c7-tbl" viewBox="0 0 716 520" role="img" aria-label="Cupping-Tisch von oben: drei Kaffees mit je drei Schalen, Röstproben, Löffel, Spülgläser und Bewertungsbögen">${defs}
  <defs><radialGradient id="c7-puff"><stop offset="0" stop-color="#f3eee8" stop-opacity=".75"/><stop offset="1" stop-color="#f3eee8" stop-opacity="0"/></radialGradient></defs>
  <rect x="8" y="8" width="500" height="504" rx="26" fill="#7a5238" opacity=".2"/>
  ${rep(6, i => `<path d="M30 ${70 + i * 78}q120 ${i % 2 ? 8 : -8} 240 0t226 0" fill="none" stroke="#7a5238" stroke-opacity=".16" stroke-width="2"/>`)}
  ${rep(3, i => `<g class="c7-pop" style="--d:${i}"><rect x="${cx[i] - 48}" y="38" width="96" height="58" rx="10" fill="#f3eee8" stroke="#262626" stroke-width="2"/>
    ${rep(8, k => bean(f1(cx[i] - 33 + (k % 4) * 22 + R() * 5), f1(57 + Math.floor(k / 4) * 21 + R() * 4), 8, Math.round(R() * 180)))}
    <text x="${cx[i]}" y="121" class="tm mid" style="fill:#262626">Kaffee ${'ABC'[i]}</text></g>`)}
  ${rep(3, j => rep(3, i => `<g transform="translate(${cx[i]} ${cy[j]})"><g class="c7-pop" style="--d:${3 + j * 2 + i}">
    <circle r="38" fill="#f3eee8" stroke="#262626" stroke-width="2.5"/><circle r="30" fill="${COF[i]}"/><circle r="30" fill="none" stroke="#c99a6b" stroke-opacity=".55" stroke-width="2"/>
    <circle r="9" fill="none" stroke="#f3eee8" stroke-width="1.2" data-loop="6" data-off="${f1(R() * 6)}" data-k="s<:.4@0 3@4.2;o:0@0 .3@.5 0@4.2"/>
    <path d="M-19 -11 A22 22 0 0 1 5 -21" fill="none" stroke="#f3eee8" stroke-width="3" stroke-linecap="round" data-loop="6" data-off="${f1(R() * 6)}" data-k="o:.25@0 .55@3 .25@6"/>
    <circle r="17" fill="url(#c7-puff)" data-loop="4" data-off="${f1(R() * 4)}" data-k="o:0@0 .85@1.3 0@4;x:-8@0 ${f1(R() * 8 - 2)}@2 ${f1(8 + R() * 8)}@4;y<:8@0 ${-f1(12 + R() * 8)}@4;s:.5@0 1.6@4"/></g></g>`))}
  ${[170, 330].map((y, k) => `<g class="c7-pop" style="--d:${6 + k * 3}"><circle cx="452" cy="${y}" r="24" fill="#f3eee8" stroke="#262626" stroke-width="2.5"/><circle cx="452" cy="${y}" r="18" fill="#7fb4dc" fill-opacity=".5"/>
    <ellipse cx="447" cy="${y + 5}" rx="8" ry="10" fill="#cfc9c3" stroke="#262626" stroke-width="1.2" transform="rotate(40 447 ${y + 5})"/><path d="M452 ${y - 1}L486 ${y - 40}" stroke="#262626" stroke-width="8" stroke-linecap="round"/><path d="M452 ${y - 1}L486 ${y - 40}" stroke="#cfc9c3" stroke-width="5" stroke-linecap="round"/></g>`).join('')}
  <g class="c7-pop" style="--d:11">${sheet(52, -4, [3, 2, 4, 3, 3])}${sheet(192, 3, [2, 4, 3, 2, 4])}
    <g transform="rotate(-32 262 470)"><rect x="222" y="466" width="70" height="8" rx="2" fill="#d9a35f" stroke="#262626" stroke-width="1.5"/><path d="M292 466l12 4l-12 4z" fill="#f3eee8" stroke="#262626" stroke-width="1.5" stroke-linejoin="round"/></g></g>
  <g class="c7-pop" style="--d:12"><rect x="384" y="442" width="98" height="8" rx="4" fill="#cfc9c3" stroke="#262626" stroke-width="1.5"/><ellipse cx="374" cy="446" rx="17" ry="12" fill="#cfc9c3" stroke="#262626" stroke-width="1.5"/><ellipse cx="373" cy="446" rx="11" ry="7" fill="#e2ddd8"/></g>
  ${lbl(67, 404, 'Röstproben')}${lbl(170, 476, 'Spülgläser')}${lbl(266, 394, 'Cupping-Schalen')}${lbl(446, 482, 'Cupping-Löffel')}${lbl(490, 312, 'Bewertungsbögen')}
  </svg>`;
};

/* ---------- 7.2 one bowl, six stages ---------- */
const spoon = (inside = '') => `<path d="M20 -9 L150 -150" fill="none" stroke="url(#g-steel)" stroke-width="7" stroke-linecap="round"/><path d="M34 -27 L132 -134" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M-25 -11 C-22 9 22 9 25 -11 C12 -5 -12 -5 -25 -11 Z" fill="url(#g-steel)" stroke="#f3eee8" stroke-opacity=".45"/>${inside}`;
const wisp = (h, w) => { let d = 'M0 0'; const n = Math.round(h / 44); for (let i = 0; i < n; i++) { const s = i % 2 ? 1 : -1; d += ` c${f1(s * w)} -14 ${f1(s * w)} -30 0 -44`; } return d; };
const CAV = 'M390 246 L424 404 Q430 426 452 426 L588 426 Q610 426 616 404 L650 246 Z';
const ablaufSvg = () => {
  const R = rng(72);
  // one half of the crust: swells, is pushed aside by the spoon, then swept to the middle and lifted out
  const half = (x0, x1, left) => { const dl = left ? 0 : .14, T = v => f1(v + dl); let top = ''; for (let x = x0; x <= x1; x += 14) top += ` L${x} ${x === 520 ? 262 : f1(265 - R() * 5)}`;
    const body = left ? `M${x0} 292${top} L${x1} 279 Q${x1} 292 ${x1 - 16} 292 Z` : `M${x0 + 16} 292 Q${x0} 292 ${x0} 279 L${top.slice(2)} L${x1} 292 Z`;
    return `<g style="transform-origin:${left ? '0%' : '100%'} 100%" data-k="o:0@${T(6.2)} 1@${T(8.4)} 1@${T(20.2)} 0@${T(20.8)};x:0@${T(18.9)} ${left ? 110 : -110}@${T(20.3)};sx<:1@${T(14.3)} .68@${T(16.4)} .68@${T(18.9)} .25@${T(20.3)};sy:.3@${T(6.2)} 1@${T(9)} 1.35@${T(12.8)} 1.35@${T(14.2)} .85@${T(16.6)} .85@${T(18.9)} .6@${T(20.6)}">
      <path d="${body}" fill="#8a5a36"/><path d="M${top.slice(2)}" fill="none" stroke="#c99a6b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      ${rep(16, () => grit(x0 + (left ? 8 : 14) + R() * (x1 - x0 - 26), 272 + R() * 14, 3 + R() * 2.5, BR[Math.floor(R() * 3)]))}</g>`; };
  return defs + `<defs><clipPath id="c7-cav"><path d="${CAV}"/></clipPath><clipPath id="c7-fun"><path d="M468 96 L572 96 L542 150 L498 150 Z"/></clipPath>
    <filter id="c7-blur" x="-100%" y="-10%" width="300%" height="120%"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
  <ellipse cx="520" cy="449" rx="136" ry="9" fill="#000" opacity=".55" filter="url(#f-soft)"/>
  <path d="M250 446H790" stroke="#5a4f47" stroke-width="2"/>
  <!-- bowl in cross-section -->
  <path d="M376 246 L412 412 Q419 444 452 444 L588 444 Q621 444 628 412 L664 246 Z" fill="#f3eee8" fill-opacity=".16"/>
  <path d="${CAV}" fill="#17120f"/>
  <path d="M390 246H376 L412 412 Q419 444 452 444 L588 444 Q621 444 628 412 L664 246H650" fill="none" stroke="#f3eee8" stroke-opacity=".75" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M390 246 L424 404 Q430 426 452 426 L588 426 Q610 426 616 404 L650 246" fill="none" stroke="#f3eee8" stroke-opacity=".3" stroke-width="1.5"/>
  <!-- heat above the bowl -->
  <ellipse cx="520" cy="258" rx="118" ry="20" fill="#e3704f" filter="url(#f-glow)" data-k="o:0@4.5 .26@7 .1@12 .26@15 .1@19 .22@23 .04@27.4"/>
  <!-- 2 hot water: the kettle tips in, the stream falls and thins out -->
  <g data-k="o:0@3.5 1@4 1@7.9 0@8.6"><g style="transform-box:view-box;transform-origin:960px 64px" data-k="r:13@3.5 -2@4.2 0@4.45 0@7.6 13@8.5"><path d="M960 64 C870 64 820 150 730 128 C680 116 650 98 606 112" fill="none" stroke="url(#g-steel)" stroke-width="16" stroke-linecap="round"/><path d="M952 58 C872 58 824 142 734 121 C690 110 660 95 622 101" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2" stroke-linecap="round"/></g>
    <text x="700" y="206" class="t" data-k="o:0@4.3 1@4.8">heißes Wasser</text></g>
  <g data-k="o:0@4.35 1@4.45 1@7.55 0@7.8"><g style="transform-origin:50% 0%" data-k="sy>:0@4.35 1@4.62"><path d="M600 114 Q560 130 548 420" fill="none" stroke="#e3704f" stroke-linecap="round" data-loop=".8" data-k="@stroke-width:6.5@0 4.6@.4 6.5@.8"/></g></g>
  <g clip-path="url(#c7-cav)">
    <!-- the liquid rises, sloshes once and keeps a living surface -->
    <g data-k="y<:150@4.6 0@7.8;fill:#c98a6a@4.6 #7a4a28@7.5 #5b3720@11"><g data-k="y:0@7.8 -4@8.15 2@8.5 0@8.9 0@14.4 4@14.7 -2@15.2 0@15.8"><rect x="380" y="276" width="280" height="180" fill="inherit"/>${wave(380, 276, 280, 'inherit', 3, 2.6)}</g></g>
    <g data-k="y<:150@4.6 0@7.8;o:0@4.6 1@4.8 1@7.5 0@7.8">${splash(548, 277, '#f8cbad')}</g>
    <!-- grounds: bed, floating up, sinking again -->
    <g style="transform-origin:50% 100%" data-k="sy<:0@.9 1@3.5 1@5 .3@8.6 .3@14.2 1@17.4">
      <path d="M400 398 Q440 388 480 394 Q520 386 560 393 Q600 388 640 398 L640 430 L400 430 Z" data-k="fill:#9a6a44@4.7 #2a170d@6.2"/>
      ${rep(22, () => grit(432 + R() * 170, 400 + R() * 18, 4 + R() * 3, R() > .5 ? '#c99a6b' : '#1d110a', 'opacity=".45"'))}</g>
    ${rep(26, () => { const x = 432 + R() * 172, y0 = 402 + R() * 16, D = f1(y0 - 270 - R() * 14), a = f1(5.1 + R() * 1.2), b = f1(14.3 + R() * 1.1), dx = f1(R() * 30 - 15);
      return `<g data-k="y<:0@${a} ${-D}@${f1(a + 2.5)};x:0@${a} ${dx}@${f1(a + 1.2)} 0@${f1(a + 2.5)};o:0@4.9 1@5.4 1@8.6 0@9.4 0@14.1 1@14.4 1@16.9 0@17.6"><g data-k="y<:0@${b} ${D}@${f1(b + 2.7)};r~:0@${a} ${Math.round(R() * 260 - 130)}@${f1(a + 2.5)} ${Math.round(R() * 260 - 130)}@${b} ${Math.round(R() * 500 - 250)}@${f1(b + 2.7)}">${grit(x, y0, 4 + R() * 3, BR[Math.floor(R() * 4)])}</g></g>`; })}
    ${half(380, 520, true)}${half(520, 660, false)}
  </g>
  ${steam(520, 258, 3, 'data-k="o:0@5.2 .9@7 .3@9.5 .3@14 0@14.6 0@20.8 1@22.2 1@23.6 .3@27.4"')}
  <!-- 1 grinding: coarse grounds fall into the bowl -->
  <g data-k="o:0@.1 1@.5 1@3.1 0@3.8"><path d="M468 96 L572 96 L542 150 L498 150 Z" fill="url(#g-steel)"/><rect x="500" y="150" width="40" height="14" rx="3" fill="url(#g-steel)"/>
    <g clip-path="url(#c7-fun)">${glint(468, 96, 104, 54, 3.2)}</g>
    ${rep(12, i => grit(508 + R() * 22, 166, 6 + R() * 3.5, BR[i % 4], `data-loop="1.1" data-off="${f1(i * .092 + R() * .05)}" data-k="y>:0@0 ${f1(226 + R() * 12)}@1;x~:0@0 ${f1(R() * 76 - 38)}@1;r~:0@0 ${Math.round(R() * 400 - 200)}@1;o:0@0 1@.08 1@.96 0@1.02"`))}
    <text x="640" y="150" class="t" data-k="o:0@.6 1@1.1">relativ grob</text><path class="lead-l" d="M632 144 L556 176" data-k="o:0@.6 1@1.1"/></g>
  <!-- 3 crust: the coffee swells, CO2 bubbles swell and pop -->
  <g data-k="o:0@8.2 1@9 1@12.9 0@13.6">${rep(12, () => { const L = f1(1.3 + R() * 1.3); return `<circle cx="${f1(418 + R() * 204)}" cy="${f1(254 - R() * 5)}" r="${f1(3 + R() * 4)}" fill="rgba(243,238,232,.1)" stroke="#f3eee8" stroke-width="1.5" data-loop="${L}" data-off="${f1(R() * 2.4)}" data-k="y~:0@0 ${-f1(6 + R() * 14)}@${L};s:.3@0 1.15@${f1(L * .78)} 1.8@${L};o:0@0 .9@${f1(L * .15)} .9@${f1(L * .78)} 0@${L}"/>`; })}
    <text x="716" y="218" class="tb" data-k="o:0@8.8 1@9.3">CO₂</text><path class="lead-l" d="M708 212 L626 244" data-k="o:0@8.8 1@9.3"/>
    <text x="716" y="250" class="ts" data-k="o:0@9.4 1@9.9">Kaffee quillt auf</text></g>
  <!-- 4 breaking the crust: aromas rise -->
  <g data-k="o:0@14.3 1@15.1 1@17.6 0@18.6">${[494, 521, 549].map((x, i) => `<g transform="translate(${x} 240)"><path d="${wisp(132, 13)}" class="draw" pathLength="1" fill="none" stroke="#f3eee8" stroke-width="${5 + i}" stroke-linecap="round" filter="url(#c7-blur)" data-loop="${f1(2.6 + i * .3)}" data-off="${f1(i * .9)}" data-k="d<:1@0 0@1.5;y~:0@0 -36@2.6;x:0@0 ${i * 9 - 12}@1.3 ${i * 7 - 2}@2.6;o:0@0 .6@.6 .5@1.6 0@2.6"/></g>`).join('')}
    <text x="404" y="138" class="t end">Aromen</text><path class="lead-l" d="M412 132 L480 156"/></g>
  <g transform="translate(520 276)"><g data-k="x:90@13.1 6@13.8 0@14.05 0@14.6 40@15.4 -32@16.2 -26@16.5 70@17.5;y:-210@13.1 -42@13.8 -54@14.08 17@14.45 11@14.8 11@16.2 5@16.5 -210@17.5;r:8@13.1 0@13.8 -3@14.08 4@14.45 0@14.8 -6@15.4 6@16.2 0@16.6;o:0@13.1 1@13.5 1@17.1 0@17.5">${spoon()}</g></g>
  <!-- 5 skimming with two spoons, a beat apart -->
  ${[0, .14].map((dl, k) => { const T = v => f1(v + dl); return `<g transform="translate(520 276)${k ? ' scale(-1 1)' : ''}"><g data-k="x:150@${T(18)} 112@${T(18.75)} 119@${T(18.95)} 14@${T(20.3)} 18@${T(20.6)} 150@${T(21.8)};y:-170@${T(18)} 5@${T(18.75)} 0@${T(18.95)} 2@${T(20.3)} -38@${T(20.9)} -190@${T(21.8)};r:6@${T(18)} 0@${T(18.75)} -5@${T(20.3)} 4@${T(20.9)} 0@${T(21.8)};o:0@${T(18)} 1@${T(18.4)} 1@${T(21.4)} 0@${T(21.8)}">${spoon(`<ellipse cx="0" cy="-10" rx="19" ry="6" fill="#c99a6b" data-k="o:0@${T(19.2)} 1@${T(20.3)}"/>`)}</g></g>`; }).join('')}
  <!-- 6 tasting at different temperatures: three sips, a drop falls back each time -->
  ${[23.75, 25.55, 27.1].map(t => `<ellipse cx="514" cy="222" rx="2.6" ry="3.6" fill="#7a4a28" data-k="y>:0@${t} 52@${f1(t + .34)};sy:1@${t} 1.7@${f1(t + .3)};o:0@${f1(t - .05)} 1@${t} 1@${f1(t + .3)} 0@${f1(t + .36)}"/>`).join('')}
  <g transform="translate(520 276)"><g data-k="x:70@22.6 0@23.3;y:-170@22.6 12@23.3 7@23.5 -74@24.05 -70@24.5 12@25.1 7@25.3 -74@25.85 -70@26.3 12@26.75 7@26.9 -74@27.4;r:6@22.6 0@23.3 0@23.5 -11@24.05 -11@24.5 0@25.1 0@25.3 -11@25.85 -11@26.3 0@26.75 0@26.9 -11@27.4;o:0@22.6 1@23">${spoon(`<ellipse cx="0" cy="-7" rx="18" ry="4.5" fill="#7a4a28" data-k="o:0@23.3 1@23.5"/>`)}</g></g>
  <g data-k="o:0@22.5 1@23.2"><text x="766" y="132" class="tl">Temperatur</text>
    <rect x="780" y="150" width="20" height="216" rx="10" fill="rgba(243,238,232,.05)" stroke="#f3eee8" stroke-opacity=".7" stroke-width="2"/><circle cx="790" cy="376" r="18" fill="#17120f" stroke="#f3eee8" stroke-opacity=".7" stroke-width="2"/>
    <circle cx="790" cy="376" r="12" data-k="fill:#e3704f@24.4 #d9a35f@25 #d9a35f@26.1 #7fb4dc@26.7"/>
    <rect x="785" width="10" rx="5" data-k="@y^:170@24.4 236@25.1 236@26.1 302@26.8;@height^:200@24.4 134@25.1 134@26.1 68@26.8;fill:#e3704f@24.4 #d9a35f@25 #d9a35f@26.1 #7fb4dc@26.7"/>
    ${glint(780, 150, 20, 216, 4)}
    ${[['heiß', 170, 'o:1@24.4 .35@25'], ['warm', 236, 'o:.35@24.4 1@25 1@26.1 .35@26.7'], ['kühl', 302, 'o:.35@26.1 1@26.7']].map(([t, y, k]) => `<g data-k="${k}"><path d="M808 ${y}h14" stroke="#f3eee8" stroke-width="2"/><text x="832" y="${y + 8}" class="t">${t}</text></g>`).join('')}</g>
  <!-- timer -->
  <g data-k="o:0@3.8 1@4.5 1@17.4 0@18.4"><text x="48" y="150" class="tl">Zeit</text><text x="48" y="196" class="tb" style="font-size:46px" data-num="0@4.6 240@13" data-fmt="mm:ss" data-k="fill:#f3eee8@12.6 #f8cbad@13"></text>
    <text x="48" y="232" class="tm" data-k="o:0@12.6 1@13">ca. 4 Minuten</text></g>`;
};

/* ---------- breaking the crust, close-up ---------- */
const crustSvg = () => {
  const R = rng(73);
  const half = (x0, x1, left) => { let top = '', pops = ''; for (let x = x0; x <= x1; x += 16) { const y = x === 540 ? 233 : f1(248 - 13 * Math.sin(Math.PI * (x - 222) / 636) - R() * 5); top += ` L${x} ${y}`;
      if (R() > .4) { const t = f1(3 + R() * 4.6), pop = R() > .35; pops += `<circle cx="${f1(x + R() * 10)}" cy="${f1(y - 3)}" r="${f1(3 + R() * 4)}" fill="rgba(243,238,232,.14)" stroke="#f3eee8" stroke-opacity=".65" stroke-width="1.5"${pop ? ` data-k="s:1@${f1(t - .9)} 1.5@${t} 2.3@${f1(t + .22)};o:1@${t} 0@${f1(t + .22)}"` : ''}/>`; } }
    return `<g style="transform-origin:${left ? '0%' : '100%'} 100%" data-k="sx<:1@${left ? 3.3 : 3.42} .56@${left ? 9.2 : 9.5};sy:1@3.3 1.1@6 .8@13">
      <path d="${left ? `M${x0} 284${top} L${x1} 266 Q${x1} 284 ${x1 - 26} 284 Z` : `M${x0 + 26} 284 Q${x0} 284 ${x0} 266 L${top.slice(2)} L${x1} 284 Z`}" fill="url(#c7-crust)"/><path d="M${top.slice(2)}" fill="none" stroke="#c99a6b" stroke-width="6" stroke-linejoin="round" stroke-linecap="round" stroke-opacity=".9"/>
      ${rep(46, () => grit(x0 + (left ? 8 : 22) + R() * (x1 - x0 - 36), 254 + R() * 24, 3.5 + R() * 4, ['#4a2c1a', '#3a2114', '#a87648', '#2a170d'][Math.floor(R() * 4)]))}${pops}</g>`; };
  return defs + `<defs><clipPath id="c7-cav2"><path d="M222 214 L282 560 L798 560 L858 214 Z"/></clipPath><clipPath id="c7-wl"><path d="M196 214 L222 214 L282 560 L256 560 Z"/></clipPath>
    <linearGradient id="c7-liq" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#6b4429"/><stop offset=".5" stop-color="#3a2114"/><stop offset="1" stop-color="#1d110a"/></linearGradient>
    <linearGradient id="c7-crust" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#9a6a44"/><stop offset="1" stop-color="#5b3720"/></linearGradient>
    <radialGradient id="c7-glow"><stop offset="0" stop-color="#d9a35f" stop-opacity=".2"/><stop offset="1" stop-color="#d9a35f" stop-opacity="0"/></radialGradient>
    <radialGradient id="c7-puff2"><stop offset="0" stop-color="#f3eee8" stop-opacity=".2"/><stop offset="1" stop-color="#f3eee8" stop-opacity="0"/></radialGradient>
    <filter id="c7-blur2" x="-150%" y="-10%" width="400%" height="120%"><feGaussianBlur stdDeviation="4"/></filter></defs>
  <circle cx="548" cy="176" r="350" fill="url(#c7-glow)"/>
  <!-- bowl walls -->
  <path d="M196 214 L222 214 L282 560 L256 560 Z" fill="#f3eee8" fill-opacity=".13" stroke="#f3eee8" stroke-opacity=".45" stroke-width="2" stroke-linejoin="round"/>
  <path d="M884 214 L858 214 L798 560 L824 560 Z" fill="#f3eee8" fill-opacity=".13" stroke="#f3eee8" stroke-opacity=".45" stroke-width="2" stroke-linejoin="round"/>
  <g clip-path="url(#c7-wl)">${glint(190, 214, 100, 346, 6.5)}</g>
  <g clip-path="url(#c7-cav2)">
    <!-- the liquid dips under the spoon, swings back and settles -->
    <g data-k="y:0@3.1 6@3.6 -4@4.3 2.5@5 -1@5.8 0@6.6">${wave(222, 260, 636, '#c99a6b', 3.5, 3.2, 'opacity=".55"')}<rect x="200" y="262" width="680" height="320" fill="url(#c7-liq)"/>${wave(222, 262, 636, '#6b4429', 3.5, 3.2)}</g>
    <!-- bubbles rise through the opening -->
    <g data-k="o:0@3.3 1@4.1 1@9 0@11">${rep(11, () => { const L = f1(1.6 + R() * 1), H = f1(150 + R() * 110), w = f1(R() * 12 - 6); return `<circle cx="${f1(440 + R() * 200)}" cy="${f1(268 + H)}" r="${f1(2.5 + R() * 4)}" fill="none" stroke="#f3eee8" stroke-width="1.5" data-loop="${L}" data-off="${f1(R() * 2)}" data-k="y~:0@0 ${-H}@${L};x:0@0 ${w}@${f1(L * .33)} ${-w}@${f1(L * .66)} 0@${L};s:.6@0 1.15@${L};o:0@0 .7@${f1(L * .2)} .7@${f1(L * .85)} 0@${L}"/>`; })}</g>
    <!-- grounds tumble down and slow in the liquid -->
    ${rep(38, i => { const x = (i % 3 ? 410 + R() * 260 : 290 + R() * 500), a = f1(3.6 + R() * 4.8), e = f1(Math.min(13.5, a + 4.6 + R() * .8)), D = f1(190 + R() * 110), sw = f1(R() * 34 - 17);
      return `<g data-k="y<:0@${a} ${D}@${e};x:0@${a} ${sw}@${f1(a + (e - a) * .35)} ${-sw}@${f1(a + (e - a) * .7)} ${f1(sw * .5)}@${e};r~:0@${a} ${Math.round(R() * 360 - 180)}@${e};o:0@${f1(a - .2)} 1@${f1(a + .3)} 1@${f1(e - 1.6)} .15@${e}">${grit(x, 270 + R() * 10, 4 + R() * 4.5, ['#7a5238', '#5b3720', '#9a6a44', '#4a2c1a'][Math.floor(R() * 4)])}</g>`; })}
    ${half(204, 540, true)}${half(540, 876, false)}
  </g>
  <!-- warm glow where the crust opens -->
  <ellipse cx="540" cy="252" rx="150" ry="24" fill="#d9a35f" filter="url(#f-glow)" data-k="o:0@3.4 .4@5.2 .3@9 .12@13"/>
  <!-- bubbles swell and burst at the surface -->
  <g data-k="o:0@3.4 1@3.9 1@9.5 0@10.8">${rep(8, () => { const L = f1(1 + R() * .9); return `<circle cx="${f1(446 + R() * 188)}" cy="261" r="6" fill="rgba(243,238,232,.1)" stroke="#f3eee8" stroke-width="1.5" data-loop="${L}" data-off="${f1(R() * 2)}" data-k="s:.2@0 1@${f1(L * .55)} 2.1@${f1(L * .72)};o:0@0 .9@.12 .9@${f1(L * .55)} 0@${f1(L * .72)}"/>`; })}</g>
  <!-- aromatic steam: looped wisps and soft puffs that rise and drift -->
  <g data-k="o:0@4 1@5.6 1@12.4 0@13.4">
    ${rep(4, i => { const L = f1(4 + R() * 1.6); return `<g transform="translate(${460 + i * 56} 250)"><circle r="46" fill="url(#c7-puff2)" data-loop="${L}" data-off="${f1(i * 1.3)}" data-k="y<:0@0 -190@${L};x~:0@0 ${f1(30 + R() * 50)}@${L};s:.6@0 2.2@${L};o:0@0 1@${f1(L * .3)} 0@${L}"/></g>`; })}
    ${[428, 474, 518, 560, 604, 652].map((x, i) => { const L = f1(3.6 + R() * 1.6), h = 176 + Math.round(R() * 2) * 44, dx = f1(14 + R() * 34); return `<g transform="translate(${x} ${246 - (i % 2) * 6})"><path d="${wisp(h, 15 + R() * 8)}" class="draw" pathLength="1" fill="none" stroke="#f3eee8" stroke-width="${f1(6 + R() * 6)}" stroke-linecap="round" filter="url(#c7-blur2)" data-loop="${L}" data-off="${f1(i * .83)}" data-k="d<:1@0 0@${f1(L * .5)};y~:0@0 -64@${L};x:0@0 ${f1(-dx * .2)}@${f1(L * .3)} ${dx}@${L};sx:1@0 1.35@${L};o:0@0 .5@${f1(L * .22)} .38@${f1(L * .6)} 0@${L}"/></g>`; }).join('')}
    <text x="262" y="132" class="t" data-k="o:0@5.4 1@6">Aromen</text><path class="lead-l" d="M346 126 L420 150" data-k="o:0@5.4 1@6"/></g>
  <!-- drops fall back from the spoon -->
  ${[[8.75, 534, 214, 44], [9.2, 546, 150, 108], [9.55, 552, 96, 162]].map(([t, x, y, D]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="4" fill="#7a4a28" data-k="y>:0@${t} ${D}@${f1(t + .5)};sy:1@${t} 1.8@${f1(t + .45)};o:0@${f1(t - .06)} 1@${t} 1@${f1(t + .46)} 0@${f1(t + .52)}"/>
    <ellipse cx="${x}" cy="262" rx="6" ry="1.6" fill="none" stroke="#c99a6b" stroke-width="1.5" data-k="sx<:1@${f1(t + .5)} 5@${f1(t + 1.3)};sy<:1@${f1(t + .5)} 2.4@${f1(t + 1.3)};o:0@${f1(t + .46)} .9@${f1(t + .52)} 0@${f1(t + 1.3)}"/>`).join('')}
  <!-- cupping spoon: hovers, draws back a little, plunges, settles -->
  <g transform="translate(540 262)"><g data-k="x:150@1.2 8@2.3 0@2.65 0@4.1 10@6.4 0@8.6 60@10.4;y:-262@1.2 -66@2.3 -80@2.68 34@3.45 23@4.1 22@6.4 -44@8.6 -280@10.4;r:6@1.2 0@2.3 2@2.68 -8@3.45 -5@4.2 -5@6.4 0@8.6 6@10.4;o:0@1.2 1@1.7 1@9.8 0@10.4">
    <path d="M56 -22 L340 -306" fill="none" stroke="url(#g-steel)" stroke-width="15" stroke-linecap="round"/><path d="M76 -50 L330 -304" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M-62 -24 C-58 22 58 22 62 -24 C32 -11 -32 -11 -62 -24 Z" fill="url(#g-steel)" stroke="#f3eee8" stroke-opacity=".5" stroke-width="1.5"/>
    <path d="M-48 -12 C-30 8 30 8 48 -12" fill="none" stroke="#17120f" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/></g></g>
  <!-- labels -->
  <g data-k="o:1@2.2 0@3"><text x="48" y="262" class="t">Kruste</text><path class="lead-l" d="M124 256 L228 252"/></g>
  <text x="48" y="150" class="tl">Zeit</text><text x="48" y="196" class="tb" style="font-size:46px" data-num="237@0 240@2.7 246@14" data-fmt="mm:ss" data-k="fill:#f3eee8@2.3 #f8cbad@2.7"></text>`;
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
  <circle cx="300" cy="300" r="78" fill="transparent" data-go="0" style="cursor:pointer"><title>Auswahl aufheben</title></circle>
  </svg>`;
};

/* ---------- 7.3 radar around a tasting cup ---------- */
const CATS = [['Aroma', 'Geruch und Duftnoten'], ['Säure', 'Intensität und Charakter'], ['Süße', 'Wahrgenommene Süße'], ['Körper', 'Mundgefühl und Textur'], ['Balance', 'Zusammenspiel der Aromen'], ['Nachgeschmack', 'Länge und Qualität']];
const PROF = [
  { n: 'Heller Filterkaffee', v: [.86, .92, .62, .36, .66, .56], d: 'Viel Aroma und lebendige Säure, dazu ein leichter Körper.' },
  { n: 'Klassischer Espresso', v: [.7, .4, .6, .96, .72, .88], d: 'Dichter Körper, zurückhaltende Säure, langer Nachgeschmack.' },
  { n: 'Natural', v: [.9, .56, .94, .78, .56, .7], d: 'Häufig fruchtig, süß und körperreich.' }
];
const RC = [365, 236, 175];
const rpt = (k, r) => [f1(RC[0] + RC[2] * r * Math.cos((k * 60 - 90) * Math.PI / 180)), f1(RC[1] + RC[2] * r * Math.sin((k * 60 - 90) * Math.PI / 180))];
const hex = r => rep(6, k => rpt(k, r).join(',') + ' ');
const radarSvg = () => {
  const LB = [[365, 24, 'mid'], [532, 144, ''], [532, 330, ''], [365, 441, 'mid'], [198, 330, 'end'], [198, 144, 'end']];
  return `<svg class="dg c7-radar" viewBox="0 0 730 470" role="img" aria-label="Netzdiagramm mit sechs Bewertungskategorien rund um eine Verkostungstasse">
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
.c7-tbl .c7-lb{font-size:19px}
.c7-ph{display:none}
@media (max-width:980px),(max-aspect-ratio:1/1){
  .c7-ph{display:block}.c7-radar .c7-desc{display:none}.c7-tbl .c7-lb{font-size:23px}
  /* phones: the picture sits directly under the control that changes it */
  .c7-ord>.stack{display:contents}
  .c7-ord .kicker{order:1}.c7-ord .title{order:2}.c7-ord .c7-o3{order:3}.c7-ord .c7-o4{order:4}.c7-ord .c7-o5{order:5}.c7-ord .c7-o6{order:6}.c7-ord .c7-o7{order:7}
}
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
  <div class="split c7-ord">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Typische Aromen</h2>
      <p class="lead wide rv c7-o3" style="--d:2">Sechs Noten, die dir im Kaffee oft begegnen. Innen steht die Familie, außen die Note.</p>
      <div class="pane rv c7-o5" style="--d:3">
        <div data-only="0" class="card stack" style="gap:10px"><span class="label">Aromarad</span><p class="lead wide">Tippe auf ein Segment oder blättere weiter.</p>
          <div class="chips">${ARO.map(a => `<span class="chip"><i class="c7-sw" style="background:${a.c}"></i>${a.n}</span>`).join('')}</div></div>
        ${rep(6, k => `<div data-only="${k + 1}" class="card stack" style="gap:10px"><span class="label c7-fam"><i class="c7-sw" style="background:${ARO[k].c}"></i>Familie: ${FAM[ARO[k].f]}</span>
          <h3 class="c7-an">${ARO[k].n}</h3><p class="lead wide">${ARO[k].d}</p></div>`)}
      </div>
      <div class="rv c7-o6" style="--d:4">${why('<b>Wozu ein Aromarad?</b> Es gibt dir Worte für das, was du riechst und schmeckst – erst die Familie, dann die einzelne Note.')}</div>
    </div>
    <div class="rv-img c7-o4" style="--d:2;display:grid">${wheelSvg()}</div>
  </div>`)) +

scene({ id: 'sensorik', ch: CH, title: '7.3 Sensorische Bewertung', light: true, steps: 2 }, inner(`
  <div class="split c7-ord">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Sechs Kategorien, eine Tasse</h2>
      <p class="lead wide rv c7-o3" style="--d:2">Jede Kategorie beantwortet eine eigene Frage. Zusammen ergeben sie das Profil eines Kaffees.</p>
      <div class="c7-ph rv c7-o6" style="--d:2">${tbl(['Kategorie', 'Was wird beurteilt?'], CATS)}</div>
      <div class="stack rv c7-o4" style="--d:3;gap:10px"><span class="label">Drei Beispiele</span>
        <div class="tabs" role="group" aria-label="Beispielprofil wählen">${rep(3, i => `<button data-go="${i}" aria-pressed="false">${PROF[i].n}</button>`)}</div>
        <div class="pane">${rep(3, i => `<p data-only="${i}" class="lead wide">${PROF[i].d}</p>`)}</div></div>
      <div class="rv c7-o7" style="--d:4">${why('<b>Beispiele, rein qualitativ.</b> Je weiter außen, desto ausgeprägter. Jeder Kaffee zeichnet sein eigenes Profil.')}</div>
    </div>
    <div class="rv-img c7-o5" style="--d:2">${radarSvg()}</div>
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
let c7cur = C7P[0].slice(), c7tgt = C7P[0].slice(), c7raf = 0, c7last = 0;
const C7K = [7, 5.4, 6.4, 5, 6.8, 5.7]; // every corner follows at its own pace
const c7pt = (k, r) => { const a = (k * 60 - 90) * Math.PI / 180; return [C7C[0] + C7C[2] * r * Math.cos(a), C7C[1] + C7C[2] * r * Math.sin(a)]; };
const c7draw = () => {
  const pts = c7cur.map((r, k) => c7pt(k, r));
  c7poly.setAttribute('points', pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '));
  c7dots.forEach((d, k) => { d.setAttribute('cx', pts[k][0].toFixed(1)); d.setAttribute('cy', pts[k][1].toFixed(1)); });
};
// interruptible: each frame the shape moves a part of the way to its target, so a new tab simply retargets it
const c7loop = now => {
  const dt = Math.min(.05, (now - c7last) / 1000); c7last = now; let far = 0;
  c7cur = c7cur.map((v, k) => { const n = v + (c7tgt[k] - v) * (1 - Math.exp(-dt * C7K[k])); far = Math.max(far, Math.abs(c7tgt[k] - n)); return n; });
  if (far < .002) { c7cur = c7tgt.slice(); c7raf = 0; } else c7raf = requestAnimationFrame(c7loop);
  c7draw();
};
const c7to = target => {
  c7tgt = target.slice();
  if (reduce) { c7cur = c7tgt.slice(); c7draw(); return; }
  if (!c7raf) { c7last = performance.now(); c7raf = requestAnimationFrame(c7loop); }
};
hooks['sensorik'] = {
  step: (sc, n) => c7to(C7P[n] || C7P[0]),
  enter: sc => { if (reduce) return; c7cur = c7cur.map(() => .12); c7draw(); c7to(C7P[state.step] || C7P[0]); },
  leave: () => { cancelAnimationFrame(c7raf); c7raf = 0; }
};
`;

export const quiz = [
  { q: 'Wann wird beim Cupping die Kruste aufgebrochen?', o: ['Direkt nach dem Aufgießen.', 'Nach ca. 4 Minuten.', 'Erst nach dem Abschöpfen.'], a: 1, e: 'Nach <b>ca. 4 Minuten</b> brichst du die Kruste auf und beurteilst die aufsteigenden Aromen. Danach wird abgeschöpft.', go: 'crust' },
  { q: 'Was beurteilst du in der Kategorie „Körper“?', o: ['Mundgefühl und Textur', 'Geruch und Duftnoten', 'Länge und Qualität'], a: 0, e: '<b>Körper</b> steht für Mundgefühl und Textur. Geruch und Duftnoten gehören zum Aroma, Länge und Qualität zum Nachgeschmack.', go: 'sensorik' }
];
