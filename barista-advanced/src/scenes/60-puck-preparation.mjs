import { chapter, scene, inner, kicker, film, notes, why, rep, rng, defs, f1, wave, splash, glint , realFilm } from '../lib.mjs';
const CH = 6;

/* ---------- one basket for the whole chapter ----------
   Local units: rim at y 0, inner bottom at y 124, inner width 300 at the rim (think 58 mm).
   Every scene draws it inside <g transform="translate(cx rimY) scale(s)">. */
const D = 124;
const hx = y => 150 - 10 * y / D;                                   // inner half width at depth y
const BP = (d = D) => `M-178 -3 H-153 L-144 ${d - 12} Q-143 ${d + 3} -128 ${d + 3} H128 Q143 ${d + 3} 144 ${d - 12} L153 -3 H178`;
const basket = ({ bg = '#17120f', holes = 21, hw = 3.6, ink = false, d = D } = {}) =>
  (ink ? `<path d="${BP(d)}" fill="none" stroke="#262626" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>` : '') +
  `<path d="${BP(d)}" fill="none" stroke="url(#g-steel)" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M-150.5 2 L-142 ${d - 14}" stroke="#f3eee8" stroke-opacity=".35" stroke-width="1"/>` +
  rep(holes, i => `<rect x="${f1(-120 + i * 240 / (holes - 1) - hw / 2)}" y="${d - .6}" width="${hw}" height="${ink ? 8.4 : 6.8}" style="fill:${bg}"/>`);
const SIDE = 'L141 112 Q140 124 128 124 L-128 124 Q-140 124 -141 112 Z';
const bedD = (yl = 40, yr = yl) => `M${f1(-hx(yl))} ${f1(yl)} L${f1(hx(yr))} ${f1(yr)} ${SIDE}`;
const prof = (fn, x0 = -146, x1 = 146, st = 4) => { let s = ''; for (let x = x0; x <= x1 + .01; x += st) s += `${s ? 'L' : 'M'}${f1(x)} ${f1(fn(x))} `; return s; };
const bedProf = fn => `${prof(fn)}${SIDE}`;
const mound = fn => `${prof(fn)}L146 40 L-146 40 Z`;
const inCav = (x, y) => { const ax = Math.abs(x); if (y > 122.5 || ax > hx(y) - 1.5) return false; if (ax > 128 && y > 112) return (ax - 128) ** 2 + (y - 112) ** 2 < 110; return true; };
const GC = ['#2a170d', '#2a170d', '#1d110a', '#8a5a36', '#c99a6b'];
// granular coffee: seeded dots below the surface `top` (number or function of x)
const grains = (R, n, top, { y0 = 0, y1 = 124, x0 = -150, x1 = 150, free = false, skip = null } = {}) => rep(n, () => {
  const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), r = .8 + R() * 1.5, c = GC[Math.floor(R() * GC.length)], o = Math.round((.35 + R() * .4) * 100) / 100;
  const t = typeof top === 'function' ? top(x) : top;
  return y > t + r && (free || inCav(x, y)) && !(skip && skip(x, y)) ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${c}" opacity="${o}"/>` : '';
});
const clump = (R, x, y, r) => `<polygon points="${rep(11, i => { const a = i / 11 * 6.283, q = r * (.72 + R() * .42); return `${f1(x + Math.cos(a) * q * 1.15)},${f1(y + Math.sin(a) * q * .9)} `; })}" fill="#22120a" stroke="#9a6a44" stroke-opacity=".55" stroke-width=".9" stroke-linejoin="round"/>${rep(5, () => `<circle cx="${f1(x + (R() - .5) * r)}" cy="${f1(y + (R() - .5) * r * .8)}" r="${f1(.8 + R())}" fill="#7a5238" opacity=".7"/>`)}`;
// arrow heads with fixed colours (peach, brown, ink). A marker inherits `visibility` from where it is defined, and the first
// definition in the document usually sits in a hidden scene, so the head is forced visible.
const MK = `<defs>${[['p', '#f8cbad'], ['b', '#7a5238'], ['i', '#262626']].map(([n, c]) => `<marker id="c6-a${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}" style="visibility:visible"/></marker>`).join('')}</defs>`;
// a drop that forms at a hole, lets go, accelerates and stretches (clock-driven)
const drops = (n, x0, dx, y, fall, col = '#c99a6b') => rep(n, i => { const L = f1(.95 + ((i * 7) % 5) * .08), a = f1(L * .32);
  return `<ellipse cx="${f1(x0 + i * dx)}" cy="${y}" rx="2.3" ry="3.4" fill="${col}" style="transform-origin:50% 0" data-loop="${L}" data-off="${f1((i * .37) % 1)}" data-k="y>:0@0 0@${a} ${fall}@${L};sy:.3@0 1@${a} 1.7@${L};sx:1.35@0 1@${a} .8@${L};o:0@0 1@${f1(L * .1)} 1@${f1(L * .82)} 0@${L}"/>`; });
// tool comes in from above, decelerating; leaves accelerating
const inOut = (a, b, c, d, body, from = -340) => `<g data-k="y<:${from}@${f1(a)} 0@${f1(b)}"><g data-k="y>:0@${f1(c)} ${from}@${f1(d)}">${body}</g></g>`;

/* ---------- tools (same local units) ---------- */
// tamper: yb = y of the underside, pf(x) = profile of the underside (positive = lower)
const under = (y, pf) => { let s = ''; for (let i = 0; i <= 52; i++) { const x = 143 - i * 5.5; s += `L${f1(x)} ${f1(y + pf(x))} `; } return s; };
const tamper = (yb = 40, pf = () => 0, live = false) => `
  <path d="M-11 ${yb - 60} C-14 ${yb - 86} -32 ${yb - 100} -30 ${yb - 126} C-28 ${yb - 152} 28 ${yb - 152} 30 ${yb - 126} C32 ${yb - 100} 14 ${yb - 86} 11 ${yb - 60} Z" fill="#6b4429" stroke="#2a170d" stroke-width="1.5"/>
  <path d="M-19 ${yb - 126} C-16 ${yb - 140} 2 ${yb - 145} 14 ${yb - 139}" fill="none" stroke="#e9c9a8" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>
  <path d="M-12 ${yb - 62} H12 L18 ${yb - 22} H-18 Z" fill="url(#g-steel)"/>
  <path d="M-143 ${yb - 22} H143 ${under(yb, pf)}Z" fill="url(#g-steel)" stroke="#5a544f" stroke-width=".8" stroke-linejoin="round"/>
  <path d="M-141 ${yb - 20} H141" stroke="#f3eee8" stroke-opacity=".55" stroke-width="1.2"/>
  ${live ? glint(-143, yb - 22, 286, 21, 4.5) : ''}`;
const needles = (x = 0, y0 = -52, y1 = 118) => rep(7, i => { const u = i / 6 - .5; return `<path d="M${f1(x + u * 34)} ${y0} L${f1(x + u * 88)} ${y1}" stroke="#d8d2cc" stroke-width="1.3" stroke-linecap="round"/>`; });
const wdtHead = (x = 0, y = -64) => `<rect x="${x - 25}" y="${y}" width="50" height="14" rx="4" fill="url(#g-steel)"/>
  <rect x="${x - 18}" y="${y - 66}" width="36" height="68" rx="15" fill="#6b4429" stroke="#2a170d" stroke-width="1.5"/>
  <path d="M${x - 9} ${y - 54} V${y - 16}" stroke="#e9c9a8" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/>`;
const leveler = (id, live = true) => `
  <clipPath id="${id}"><rect x="-141" y="-3" width="282" height="44"/></clipPath>
  <rect x="-141" y="-8" width="282" height="36" fill="url(#g-steel)"/>
  <g clip-path="url(#${id})"><g data-loop="2" data-k="x~:0@0 94@2">${rep(5, i => `<path d="M${-376 + i * 94} 28 h94 v12 z" fill="#8f8882" stroke="#5a544f" stroke-width=".8"/>`)}</g></g>
  <rect x="-172" y="-40" width="344" height="37" rx="6" fill="url(#g-steel)" stroke="#5a544f" stroke-width=".8"/>
  ${rep(22, i => `<path d="M${-158 + i * 15} -34 v25" stroke="#5a544f" stroke-opacity=".45" stroke-width="1.2"/>`)}
  ${live ? glint(-172, -40, 344, 37, 3.6) : ''}`;

/* ---------- 6.1 even puck, even flow ---------- */
const grundSvg = () => { const R = rng(41); return `<svg class="dg c6-dg" style="--cut:270px" viewBox="0 0 700 340" role="img" aria-label="Siebträgersieb im Schnitt: Wasser fließt gleichmäßig durch einen gleichmäßigen Puck">${defs}
  <clipPath id="c6-cv0"><path d="${bedD(-80)}"/></clipPath>
  <g transform="translate(290 92) scale(1.12)">
    ${rep(9, i => { const x = -120 + i * 30, L = f1(.9 + (i * 3 % 4) * .07); return `<path d="M${x} -70 V38" stroke="#2f6f9f" stroke-width="2.6" stroke-dasharray="10 9" fill="none" data-loop="${L}" data-off="${f1(i * .23)}" data-k="d~:0@0 -19@${L};x:0@0 ${i % 2 ? .9 : -.9}@${f1(L / 2)} 0@${L}"/>`; })}
    <g clip-path="url(#c6-cv0)">${wave(-150, 36, 300, '#2f6f9f', 3, 2.6, 'opacity=".3"')}<rect x="-150" y="45" width="300" height="14" fill="#2f6f9f" opacity=".3"/></g>
    <path d="${bedD(58)}" fill="url(#g-puck)"/>${grains(R, 260, 58)}
    ${rep(9, i => { const x = -120 + i * 30, L = f1(1.3 + (i * 5 % 4) * .08); return `<path d="M${x} 62 V122" stroke="#f3eee8" stroke-opacity=".8" stroke-width="2" stroke-dasharray="7 9" fill="none" data-loop="${L}" data-off="${f1(i * .31)}" data-k="d~:0@0 -16@${L}"/>`; })}
    ${basket({ bg: 'var(--bg)', ink: true })}
    ${drops(9, -120, 30, 136, 44, '#6b4429')}
  </g>
  <text x="128" y="52" class="t end">Wasser</text>
  <path class="ln" d="M514 186 H456" stroke-width="1.5"/><text x="522" y="182" class="t">Kaffeepuck</text><text x="522" y="205" class="ts">gleichmäßig verteilt,</text><text x="522" y="226" class="ts">stabil</text>
  <text x="290" y="330" class="ts mid">gleichmäßiger Wasserfluss</text></svg>`; };

/* ---------- 6.2 the six steps, one basket ---------- */
const S = [0, 3.6, 7.2, 10.8, 14.4, 17.6], PD = 22.6;
const STEPS = ['Dosieren', 'WDT', 'Leveling', 'Tampen', 'Kontrolle', 'Bezug'];
const edge = x => 1 - (x / 146) ** 6;
const fA = x => 40 - (42 * Math.exp(-(((x + 38) / 58) ** 2)) + 7 * Math.exp(-(((x - 78) / 36) ** 2))) * edge(x);
const fB = x => 40 - (15 + 3 * Math.sin(x / 17) + 1.5 * Math.sin(x / 7 + 1)) * edge(x);
const prozessSvg = () => { const R = rng(61), t = (i, d = 0) => f1(S[i] + d);
  const CL = [[-72, 24, 9], [-22, 16, 8], [-100, 62, 10], [28, 54, 8], [92, 72, 9], [-34, 92, 10], [58, 100, 8], [-4, 60, 7]];
  return defs + MK + `<clipPath id="c6-cv1"><path d="${bedD(-60)}"/></clipPath>
  <g transform="translate(566 238) scale(1.4)">
    <!-- 1 dosing: chute, tumbling grounds under gravity -->
    <g data-k="o:1@0 1@2.9 0@3.3;y<:0@2.9 -30@3.3"><path d="M-80 -172 H4 L-10 -134 H-66 Z" fill="url(#g-steel)"/><path d="M-66 -134 H-10" stroke="#3a3531" stroke-width="2"/>${glint(-80, -172, 84, 38, 3)}</g>
    <g data-k="o:0@.5 1@.7 1@2.6 0@2.9">${rep(34, () => { const x = f1(-38 + (R() - .5) * 46), L = f1(.6 + R() * .3), w = f1(2 + R() * 2.6); return `<rect x="${x}" y="-134" width="${w}" height="${w}" fill="${R() > .5 ? '#8a5a36' : '#5b3720'}" data-loop="${L}" data-off="${f1(R())}" data-k="y>:0@0 252@${L};x~:0@0 ${f1((R() - .5) * 34)}@${L};r~:0@0 ${f1((R() - .5) * 700)}@${L}"/>`; })}</g>
    <!-- the bed: fills, is loosened, levelled, then compressed (with a small rebound) -->
    <g data-k="sy<:0@.7 .94@3 .94@${t(1, 1)} .97@${t(1, 2.6)} .97@${t(2, .9)} 1@${t(2, 2.4)}" style="transform-origin:50% 100%">
    <g data-k="sy^:1@${t(3, 1.05)} .643@${t(3, 2.1)}" style="transform-origin:50% 100%">
      <path d="${bedD(40)}" fill="url(#g-puck)"/>${grains(R, 300, 40)}
      <g data-k="o:0@${t(1, 1)} 1@${t(1, 1.8)};sy:1@${t(2, .9)} 0@${t(2, 2.4)}" style="transform-origin:50% 100%"><path d="${mound(fB)}" fill="#5b3720"/>${grains(R, 120, fB, { y0: 14, y1: 40 })}</g>
      <g data-k="sy<:0@1 1@2.9;o:1@${t(1, 1.4)} 0@${t(1, 2.8)}" style="transform-origin:50% 100%"><path d="${mound(fA)}" fill="#5b3720"/>${grains(R, 170, fA, { y0: -4, y1: 40 })}</g>
      ${CL.map(([x, y, r], i) => `<g data-k="o:0@${f1(1.2 + i * .19)} 1@${f1(1.6 + i * .19)} 1@${t(1, 1.1 + i * .17)} 0@${t(1, 1.9 + i * .17)};s:1@${t(1, 1.1 + i * .17)} .5@${t(1, 1.9 + i * .17)}">${clump(R, x, y, r)}</g>`).join('')}
      <path d="${bedD(40)}" fill="#1d110a" opacity=".62" data-k="sy:0@${t(5, 1.4)} 1@${t(5, 3.4)}" style="transform-origin:50% 0"/>
    </g></g>
    <!-- 6 water: shower, streams that start in the middle, a living surface, splashes -->
    <g data-k="o:0@${t(5, .15)} 1@${t(5, .5)};y<:-26@${t(5, .15)} 0@${t(5, .6)}"><rect x="-140" y="-22" width="280" height="10" rx="2" fill="url(#g-steel)"/>${glint(-140, -22, 280, 10, 3.4)}</g>
    ${rep(11, i => { const x = -125 + i * 25, a = t(5, .6 + Math.abs(i - 5) * .07), L = f1(.72 + (i * 3 % 5) * .05); return `<g data-k="o:0@${a} 1@${f1(+a + .25)}"><path d="M${x} -12 V60" stroke="#7fb4dc" stroke-width="2" stroke-dasharray="9 7" data-loop="${L}" data-off="${f1(i * .17)}" data-k="d~:0@0 -16@${L};x:0@0 ${i % 2 ? 1 : -1}@${f1(L / 2)} 0@${L}"/></g>`; })}
    ${[-75, 0, 75].map((x, i) => splash(x, 68, '#7fb4dc', `data-k="o:0@${t(5, .75 + i * .08)} 1@${t(5, .9 + i * .08)} 1@${t(5, 1.4)} 0@${t(5, 1.9)}"`)).join('')}
    <g clip-path="url(#c6-cv1)"><g data-k="sy<:0@${t(5, .9)} 1@${t(5, 1.9)}" style="transform-origin:50% 100%">${wave(-150, 51, 300, '#7fb4dc', 3, 2.2, 'opacity=".45"')}<rect x="-150" y="60" width="300" height="10" fill="#7fb4dc" opacity=".45"/></g></g>
    ${basket()}
    ${rep(9, i => `<g data-k="o:0@${t(5, 3.1 + (i * 5 % 9) * .07)} 1@${t(5, 3.3 + (i * 5 % 9) * .07)}">${drops(1, -112 + i * 28, 0, 136, 30).replace('data-off="0"', `data-off="${f1((i * .37) % 1)}"`)}</g>`)}
    <!-- 2 WDT: the head leads, the needles follow -->
    ${inOut(t(1, .1), t(1, .9), t(1, 2.8), t(1, 3.5), `<g data-k="x:0@${t(1, .9)} -52@${t(1, 1.2)} 50@${t(1, 1.5)} -42@${t(1, 1.8)} 54@${t(1, 2.1)} -26@${t(1, 2.4)} 0@${t(1, 2.75)}">
      <g style="transform-origin:50% 0" data-k="r:0@${t(1, .95)} -5@${t(1, 1.1)} 6@${t(1, 1.38)} -5.5@${t(1, 1.68)} 6@${t(1, 1.98)} -4@${t(1, 2.28)} 2.5@${t(1, 2.6)} -1@${t(1, 2.8)} 0@${t(1, 2.95)}">${needles()}</g>${wdtHead()}</g>`)}
    <!-- 3 leveler -->
    <g data-k="y<:-340@${t(2, .1)} -16@${t(2, .9)}"><g data-k="y:0@${t(2, .9)} 16@${t(2, 2.4)}"><g data-k="y>:0@${t(2, 2.8)} -340@${t(2, 3.5)}">${leveler('c6-lv-a')}
      <path d="M-70 -52 Q0 -74 70 -52" fill="none" stroke="#f8cbad" stroke-width="2" marker-end="url(#c6-ap)" data-k="o:0@${t(2, .8)} 1@${t(2, 1.1)} 1@${t(2, 2.4)} 0@${t(2, 2.7)}"/></g></g></g>
    <!-- 4 tamper: lands, compresses, rebounds a little -->
    ${inOut(t(3, .1), t(3, 1), t(3, 2.7), t(3, 3.5), `<g data-k="y^:0@${t(3, 1.05)} 30@${t(3, 2.1)}">${tamper(40, () => 0, true)}
      <g data-k="o:0@${t(3, .95)} 1@${t(3, 1.15)} 1@${t(3, 2)} 0@${t(3, 2.4)}"><path d="M-84 -46 V8" stroke="#f8cbad" stroke-width="2.5" marker-end="url(#c6-ap)"/><path d="M84 -46 V8" stroke="#f8cbad" stroke-width="2.5" marker-end="url(#c6-ap)" data-k="o:0@${t(3, 1.05)} 1@${t(3, 1.25)}"/></g></g>`)}
    <!-- 5 check -->
    <g data-k="o:0@${t(4, .2)} 1@${t(4, .5)} 1@${t(5)} 0@${t(5, .4)}">
      <path class="draw" pathLength="1" d="M-144 70 H144" stroke="#f8cbad" stroke-width="2.5" data-k="d<:1@${t(4, .4)} 0@${t(4, 1.4)}"/>
      ${[-104, 104].map((x, i) => `<g data-k="o:0@${t(4, 1.3 + i * .15)} 1@${t(4, 1.6 + i * .15)};y^:-8@${t(4, 1.3 + i * .15)} 0@${t(4, 1.8 + i * .15)}"><path d="M${x} 4 V64" stroke="#f8cbad" stroke-width="1.6" marker-start="url(#c6-ap)" marker-end="url(#c6-ap)"/><path d="M${x - 9} 0 h18" stroke="#f8cbad" stroke-width="1.6"/></g>`).join('')}
      <g data-k="o:0@${t(4, 2)} 1@${t(4, 2.3)};s^:.4@${t(4, 2)} 1@${t(4, 2.6)}"><circle cx="0" cy="33" r="20" fill="#17120f" stroke="#f8cbad" stroke-width="2"/><path d="M-9 33 l6 7 l12 -14" fill="none" stroke="#f8cbad" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>
    </g>
  </g>
  ${rep(6, i => `<g data-k="o:${i ? `0@${t(i)} 1@${t(i, .4)}` : '1@0'} 1@${f1((S[i + 1] ?? PD) - .35)} ${i < 5 ? `0@${t(i + 1)}` : `1@${PD}`}${i ? `;x<:-14@${t(i)} 0@${t(i, .5)}` : ''}"><text x="48" y="150" class="tl">Schritt ${i + 1} von 6</text><text x="48" y="198" class="tb" style="font-size:46px">${STEPS[i]}</text></g>`)}
  ${rep(6, i => `<circle cx="${55 + i * 26}" cy="232" r="6" fill="#3a2f29" data-k="fill:#3a2f29@${f1(Math.max(0, S[i] - .05))} #f8cbad@${t(i, .3)}${i ? `;s^:.6@${t(i)} 1@${t(i, .5)}` : ''}"/>`)}`; };

/* ---------- 6.3 WDT: before / after ---------- */
const wdtPic = after => { const R = rng(33), RC = rng(5);
  const fBefore = x => 30 - 24 * Math.exp(-(((x + 62) / 46) ** 2)) + 20 * Math.exp(-(((x - 84) / 38) ** 2)) + 3 * Math.sin(x / 11);
  const fAfter = x => 27 + 1.2 * Math.sin(x / 8), top = after ? fAfter : fBefore;
  const CL = [[-95, 42, 11], [-60, 24, 9], [-30, 72, 12], [22, 50, 8], [-110, 96, 9], [56, 96, 11], [112, 82, 9], [2, 106, 8], [96, 64, 7]];
  const VO = [[-70, 64, 14, 6], [32, 78, 16, 6], [78, 112, 12, 5], [-14, 38, 10, 5]];
  const inVoid = (x, y) => !after && VO.some(([vx, vy, a, b]) => ((x - vx) / a) ** 2 + ((y - vy) / b) ** 2 < 1.15);
  return `<svg class="mg${after ? '' : ' top'}" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${defs}<rect width="800" height="500" fill="#17120f"/>
  <g transform="translate(400 224) scale(1.86)">
    <path d="${bedProf(top)}" fill="url(#g-puck)"/>${grains(R, 620, top, { skip: inVoid })}
    ${after ? needles(84, -40, 116) + wdtHead(84, -52)
    : VO.map(([x, y, a, b], i) => `<ellipse cx="${x}" cy="${y}" rx="${a}" ry="${b}" fill="#120f0d" opacity=".82" transform="rotate(${[-12, 8, -6, 14][i]} ${x} ${y})"/>`).join('') + CL.map(([x, y, r]) => clump(RC, x, y, r)).join('')}
    ${basket()}
  </g>
  ${after ? `<text x="640" y="160" class="t">gleichmäßig</text><text x="640" y="188" class="t">verteilt</text><path class="lead-l" d="M668 200 L654 296"/>`
    : `<text x="58" y="160" class="t">Klumpen</text><path class="lead-l" d="M104 170 L212 295"/><text x="232" y="160" class="t">Hohlräume</text><path class="lead-l" d="M290 170 L274 331"/>`}
  </svg>`; };

/* ---------- 6.4 leveler: only the top layer moves ---------- */
const levSvg = () => { const R = rng(52), RC = rng(9);
  const fL = x => 40 - (13 + 5 * Math.sin(x / 21 + .6) + 3 * Math.sin(x / 8)) * edge(x);
  return `<svg class="dg c6-dg" style="--cut:60px" viewBox="0 0 680 400" role="img" aria-label="Leveler im Schnitt: nur die obere Schicht des Kaffeemehls wird bewegt">${defs}${MK}
  <clipPath id="c6-lv-c"><path d="${bedD(-30)}"/></clipPath>
  <g data-k="o:0@0 1@.5 1@7.4 0@7.9">
  <g transform="translate(252 176) scale(1.24)">
    <path d="${bedD(40)}" fill="url(#g-puck)"/>${grains(R, 250, 64)}
    <g clip-path="url(#c6-lv-c)">
      <g data-k="x:0@2 14@2.6 -12@3.2 12@3.8 -10@4.4 8@5 -3@5.5 0@5.9">${grains(R, 190, 40, { y1: 64, x0: -168, x1: 168, free: true })}</g>
      <g data-k="sy:1@2 0@4.4" style="transform-origin:50% 100%"><path d="${mound(fL)}" fill="#5b3720"/>${grains(R, 110, fL, { y0: 12, y1: 40 })}</g>
    </g>
    <ellipse cx="52" cy="100" rx="15" ry="6" fill="#120f0d" opacity=".75" transform="rotate(-8 52 100)"/>${clump(RC, -62, 96, 11)}
    <path d="M${-hx(64)} 64 H${hx(64)}" stroke="#f3eee8" stroke-opacity=".8" stroke-width="1.4" stroke-dasharray="5 5"/>
    <circle cx="-62" cy="96" r="19" fill="none" stroke="#f8cbad" stroke-width="2" data-k="o:0@5.6 1@5.9 1@7.2;s^:.5@5.6 1@6.2"/>
    ${basket({ bg: 'var(--bg)', ink: true })}
    <g data-k="y<:-92@.8 -14@1.8"><g data-k="y:0@1.8 14@4.4"><g data-k="y:0@5.7 -92@6.7">${leveler('c6-lv-b')}
      <path d="M-70 -52 Q0 -74 70 -52" fill="none" stroke="#7a5238" stroke-width="2.5" marker-end="url(#c6-ab)" data-k="o:0@1.8 1@2.2 1@5.4 0@5.8"/></g></g></g>
  </g>
  <path class="ln" d="M486 246 L442 246" stroke-width="1.5"/><text x="494" y="242" class="t">Obere Schicht</text><text x="494" y="265" class="ts">wird bewegt</text>
  <path class="ln" d="M486 310 L436 300" stroke-width="1.5"/><text x="494" y="314" class="t">Untere Schicht</text><text x="494" y="337" class="ts">bleibt, wie sie ist</text>
  </g></svg>`; };

/* ---------- 6.5 tamping: tilt slider ---------- */
const tampSvg = () => { const R = rng(73); return `<svg class="dg c6-dg" style="--cut:250px" viewBox="0 0 640 410" role="img" aria-label="Tamper über einem Puck im Schnitt, Neigung einstellbar">${defs}
  <defs><linearGradient id="c6-dens" x1="0" x2="1"><stop offset="0" stop-color="#b98a5c"/><stop offset=".5" stop-color="#5b3720" stop-opacity="0"/><stop offset="1" stop-color="#120b06"/></linearGradient>
  <clipPath id="c6-tp-clip"><path id="c6-tp-clipp" d="${bedD(64)}"/></clipPath></defs>
  <path d="M320 26 V296" stroke="#262626" stroke-opacity=".45" stroke-width="1.5" stroke-dasharray="4 5"/>
  <g transform="translate(320 215) scale(1.28)">
    <path id="c6-tp-puck" d="${bedD(64)}" fill="url(#g-puck)"/>
    <path id="c6-tp-dens" d="${bedD(64)}" fill="url(#c6-dens)" opacity="0"/>
    <g clip-path="url(#c6-tp-clip)">${grains(R, 330, 44)}</g>
    ${rep(9, i => { const x = -120 + i * 30; return `<line class="c6-tp-in" x1="${x}" x2="${x}" y1="66" y2="122" stroke="#f3eee8" stroke-width="2" stroke-dasharray="8 9"/><line class="c6-tp-out" x1="${x}" x2="${x}" y1="135" y2="152" stroke="#6b4429" stroke-width="2" stroke-dasharray="8 9"/>`; })}
    ${basket({ bg: 'var(--bg)', ink: true })}
    <g id="c6-tp-tool">${tamper(64)}<path d="M0 -92 V40" stroke="#f3eee8" stroke-opacity=".7" stroke-width="1.2" stroke-dasharray="4 5"/></g>
  </g>
  <text x="118" y="322" class="ts end" id="c6-tp-l" opacity="0">lockerer</text><text x="526" y="322" class="ts" id="c6-tp-r" opacity="0">dichter</text>
  <text x="380" y="52" class="tm" id="c6-tp-ang">0°</text></svg>`; };

/* ---------- 6.6 tamper bases and their imprint ---------- */
const PF = [() => 0, x => 7 * (1 - (x / 143) ** 2), x => 5 * Math.abs(((Math.abs(x) / 11) % 2) - 1)];
const PROFILES = [
  { n: 'Flacher Tamper', b: ['Ebene Unterseite.', 'Gleichmäßige Verdichtung.'], l: 'Ebene Unterseite', i: 'ebene Fläche' },
  { n: 'Convex Tamper', b: ['Leicht gewölbte Unterseite.', 'Veränderte Druckverteilung.'], l: 'Leicht gewölbte Unterseite', i: 'flache Mulde zur Mitte' },
  { n: 'Rillenprofile', b: ['Unterschiedliche Oberflächenstrukturen.', 'Verändern die Kontaktfläche.', '<b>Kein allgemeiner Nachweis für bessere Extraktion.</b>'], l: 'Strukturierte Unterseite', i: 'Rillen im Puck' }
];
const profSvg = () => { const RT = rng(88);
  const dots = rep(150, () => { const a = RT() * 6.283, q = Math.sqrt(RT()) * 76; return `<circle cx="${f1(565 + Math.cos(a) * q)}" cy="${f1(292 + Math.sin(a) * q)}" r="${f1(.9 + RT() * 1.4)}" fill="${GC[Math.floor(RT() * 5)]}" opacity=".5"/>`; });
  const over = (y, pf) => { let s = ''; for (let i = 0; i <= 52; i++) { const x = -143 + i * 5.5; s += `L${f1(x)} ${f1(y + pf(x))} `; } return s; };
  return `<svg class="dg c6-dg" style="--cut:60px" viewBox="0 0 680 430" role="img" aria-label="Tamper-Unterseite im Schnitt und ihr Abdruck im Puck">${defs}${MK}
  <defs><radialGradient id="c6-dish"><stop offset="0" stop-color="#22120a"/><stop offset=".7" stop-color="#4a2c1a"/><stop offset="1" stop-color="#6b4429"/></radialGradient></defs>
  <text x="34" y="44" class="tl">Im Schnitt</text><text x="565" y="176" class="tl mid">Abdruck von oben</text>
  <circle cx="565" cy="292" r="92" fill="url(#g-steel)" stroke="#262626" stroke-width="2.5"/>
  ${rep(3, k => { const R = rng(80 + k), R2 = rng(90 + k), pf = PF[k], P = PROFILES[k];
    return `<g data-only="${k}">
    <g transform="translate(232 254) scale(1.12)">
      <path d="M${f1(-hx(64))} 64 ${over(64, pf)}L${f1(hx(64))} 64 ${SIDE}" fill="url(#g-puck)"/>${grains(R, 250, x => 64 + pf(Math.max(-143, Math.min(143, x))))}
      <g data-k="o:1@2.35 0@2.6 0@6.8 1@7.3"><path d="${bedD(55)}" fill="url(#g-puck)"/>${grains(R2, 280, 55)}</g>
      ${basket({ bg: 'var(--bg)', ink: true })}
      <g data-k="y<:0@1 99@2.1"><g data-k="y^:0@2.1 9@2.9"><g data-k="y:0@3.7 -108@4.8">${tamper(-44, pf, true)}
        <g data-k="o:0@1.9 1@2.15 1@3.1 0@3.6">
        ${k === 0 ? rep(7, i => `<path d="M${-120 + i * 40} -36 V-14" stroke="#7a5238" stroke-width="2.2" marker-end="url(#c6-ab)"/>`) : ''}
        ${k === 1 ? rep(7, i => { const x = -120 + i * 40, a = x / 143 * .42, L = 16 + 12 * (1 - (x / 143) ** 2), y = -37 + pf(x); return `<path d="M${x} ${f1(y)} L${f1(x + Math.sin(a) * L)} ${f1(y + Math.cos(a) * L)}" stroke="#7a5238" stroke-width="2.2" marker-end="url(#c6-ab)"/>`; }) : ''}
        ${k === 2 ? `<path d="M143 -44 ${under(-44, pf)}" fill="none" stroke="#f8cbad" stroke-width="2.4" stroke-linejoin="round"/>` : ''}
        </g></g></g></g>
    </g>
    <circle cx="565" cy="292" r="80" fill="${k === 1 ? 'url(#c6-dish)' : '#4a2c1a'}"/>${dots}
    ${k === 2 ? rep(6, i => `<circle cx="565" cy="292" r="${10 + i * 13}" fill="none" stroke="#1d110a" stroke-width="3.2"/><circle cx="565" cy="292" r="${16.5 + i * 13}" fill="none" stroke="#9a6a44" stroke-opacity=".5" stroke-width="1.2"/>`) : ''}
    ${k === 1 ? `<circle cx="565" cy="292" r="52" fill="none" stroke="#1d110a" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="3 5"/>` : ''}
    <g data-k="o:1@3.8 0@4.7 0@6.8 1@7.3"><circle cx="565" cy="292" r="80" fill="#5b3720"/>${dots}</g>
    <text x="286" y="104" class="t">${P.l}</text><path class="ln" d="M300 114 L330 ${k === 1 ? 208 : 202}" stroke-width="1.5" data-k="o:1@1 0@1.4 0@4.6 1@5"/>
    <text x="565" y="412" class="ts mid">${P.i}</text></g>`; })}
  </svg>`; };

/* ---------- 6.7 group head cutaway ---------- */
const screenSvg = () => { const R = rng(67);
  const hl = (x, y, w, h, k) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="none" stroke="#f8cbad" stroke-width="1.8" data-k="o:${k}"/>`;
  const lab = (y, txt, x2, y2, a, k) => `<g data-k="o:0@${a} 1@${f1(a + .4)} ${k};x<:16@${a} 0@${f1(a + .5)}"><path class="lead-l" d="M692 ${y - 8} L${x2} ${y2}"/><text x="700" y="${y}" class="t" style="font-size:26px">${txt}</text></g>`;
  return defs + MK + `<clipPath id="c6-cv2"><path d="${bedD(25)}"/></clipPath>
  <g transform="translate(385 206) scale(1.45)">
    <rect x="-15" y="-152" width="30" height="80" fill="url(#g-steel)"/>
    <path d="M-190 -76 H190 V-12 H140 V14 H-140 V-12 H-190 Z" fill="url(#g-steel-v)" stroke="#5a544f" stroke-width="1"/>
    <path d="M-188 -74 H188" stroke="#f3eee8" stroke-opacity=".5" stroke-width="1.2"/>${glint(-190, -76, 380, 64, 6)}
    <rect x="-176" y="-12" width="26" height="6.5" fill="#2b2420" stroke="#5a4f47" stroke-width=".8"/><rect x="150" y="-12" width="26" height="6.5" fill="#2b2420" stroke="#5a4f47" stroke-width=".8"/>
    <rect x="-5" y="-152" width="10" height="166" fill="#120f0d"/><rect x="-136" y="14" width="272" height="6" fill="#120f0d"/>
    <!-- water: down the channel, spreading behind the shower screen -->
    <rect x="-5" y="-152" width="10" height="166" fill="#7fb4dc" data-k="sy~:0@4.7 1@5.5" style="transform-origin:50% 0"/>
    <rect x="-136" y="14" width="272" height="6" fill="#7fb4dc" data-k="sx<:0@5.5 1@6.4"/>
    <g clip-path="url(#c6-cv2)"><g data-k="sy<:0@7 1@8.8" style="transform-origin:50% 100%">${wave(-150, 27, 300, '#7fb4dc', 3, 2.4, 'opacity=".32"')}<rect x="-150" y="36" width="300" height="16" fill="#7fb4dc" opacity=".32"/></g></g>
    <path d="M-140 12 V25 H140 V12 H136 V20 H-136 V12 Z" fill="url(#g-steel)"/>
    ${rep(19, i => `<rect x="${f1(-126 + i * 14 - 1.4)}" y="19.6" width="2.8" height="5.8" fill="#120f0d"/>`)}
    ${rep(19, i => { const a = f1(6.3 + Math.abs(i - 9) * .06), L = f1(.56 + (i * 3 % 5) * .04); return `<g data-k="o:0@${a} 1@${f1(a + .25)}"><path d="M${-126 + i * 14} 20 V51" stroke="#7fb4dc" stroke-width="1.9" stroke-dasharray="5 4" data-loop="${L}" data-off="${f1(i * .13)}" data-k="d~:0@0 -9@${L};x:0@0 ${i % 2 ? .6 : -.6}@${f1(L / 2)} 0@${L}"/></g>`; })}
    ${[-84, -28, 28, 84].map((x, i) => splash(x, 50, '#7fb4dc', `data-k="o:0@${f1(6.5 + i * .09)} .9@${f1(6.7 + i * .09)} .9@7.3 0@8"`)).join('')}
    <path d="${bedD(58)}" fill="url(#g-puck)"/>${grains(R, 280, 58)}
    <path d="${bedD(58)}" fill="#1d110a" opacity=".6" data-k="sy:0@13.5 1@16.2" style="transform-origin:50% 0"/>
    ${rep(37, i => { const a = f1(9.9 + Math.abs(i - 18) * .035), L = f1(.55 + (i * 7 % 5) * .04); return `<g data-k="o:0@${a} 1@${f1(a + .3)} 1@15.6 .4@16.6"><path d="M${f1(-135 + i * 7.5)} 58 V73" stroke="#cfe3f2" stroke-width="1.1" stroke-dasharray="3 3" data-loop="${L}" data-off="${f1((i % 3) * .2)}" data-k="d~:0@0 -6@${L}"/></g>`; })}
    <g data-k="y^:-24@1.7 0@2.4"><rect x="-144.5" y="51" width="289" height="7" rx="1.5" fill="url(#g-steel)"/>
      ${rep(36, i => `<rect x="${f1(-140 + i * 8 - 1)}" y="52.2" width="2" height="4.6" fill="#3a3531"/>`)}${glint(-144, 51, 288, 7, 4.2)}</g>
    <g data-k="o:0@9.1 1@9.5 1@11.6 0@12.2"><path d="M-12 43 H-118" stroke="#f8cbad" stroke-width="2" marker-end="url(#c6-ap)" data-k="d<:1@9.1 0@9.9" class="draw" pathLength="1"/><path d="M12 43 H118" stroke="#f8cbad" stroke-width="2" marker-end="url(#c6-ap)" data-k="d<:1@9.2 0@10" class="draw" pathLength="1"/></g>
    ${basket()}
    ${hl(-144, 8, 288, 21, '0@1.1 1@1.4 0@2.1 0@4.3 1@4.7 1@8.6 0@9 0@18 1@18.4')}
    ${hl(-149, 47, 298, 15, '0@2.3 1@2.6 0@3.3 0@8.8 1@9.2 1@13.2 0@13.6 0@18.15 1@18.55')}
    ${rep(9, i => `<g data-k="o:0@${f1(16 + (i * 5 % 9) * .08)} 1@${f1(16.2 + (i * 5 % 9) * .08)}">${drops(1, -112 + i * 28, 0, 136, 50).replace('data-off="0"', `data-off="${f1((i * .37) % 1)}"`)}</g>`)}
  </g>
  ${lab(150, 'Brühgruppe', 664, 142, .5, '1@4.4 .4@4.8 .4@17.8 1@18.2')}
  ${lab(226, 'IMS Duschsieb', 592, 235, 1.1, '1@8.8 .4@9.2 .4@13.3 1@13.7')}
  ${lab(300, 'Puck Screen', 598, 286, 1.8, '1@4.4 .4@4.8 .4@8.8 1@9.2')}
  ${lab(368, 'Kaffeepuck', 596, 342, 2.5, '1@4.4 .4@4.8 .4@13.3 1@13.7')}
  ${lab(430, 'Sieb', 602, 392, 3.1, '1@4.4 .4@4.8 .4@13.3 1@13.7')}
  <text x="700" y="252" class="tm" data-k="o:0@18.2 1@18.7;x<:12@18.2 0@18.8">in der Brühgruppe</text><text x="700" y="326" class="tm" data-k="o:0@18.4 1@18.9;x<:12@18.4 0@19">auf dem Kaffee</text>`; };

/* ---------- 6.8 precision basket ---------- */
const siebSvg = () => { let holes = ''; const sp = 10.5, r = 2.1;
  for (let j = -13; j <= 13; j++) for (let i = -12; i <= 12; i++) { const x = i * sp + (j & 1 ? sp / 2 : 0), y = j * sp * .866; if (x * x + y * y < 112 * 112) holes += `M${f1(190 + x - r)} ${f1(200 + y)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`; }
  const Q = [[0, 0], [1, 0], [-1, 0], [.5, 1], [-.5, 1], [.5, -1], [-.5, -1], [2, 0], [-2, 0], [1.5, 1], [-1.5, 1], [1.5, -1], [-1.5, -1], [0, 2], [1, 2], [-1, 2], [0, -2], [1, -2], [-1, -2]];
  return `<svg class="dg c6-dg" style="--cut:60px" viewBox="0 0 700 420" role="img" aria-label="Präzisionssieb von unten mit vergrößerter Lochstruktur und drei Siebgrößen">${defs}
  <defs><clipPath id="c6-lens"><circle cx="535" cy="116" r="84"/></clipPath></defs>
  <circle cx="190" cy="200" r="150" fill="url(#g-steel)" stroke="#262626" stroke-width="2.5"/>
  <circle cx="190" cy="200" r="127" fill="#d9d4ce" stroke="#8f8882" stroke-width="1.5"/>
  <path d="${holes}" fill="#262626"/>
  <circle cx="190" cy="200" r="20" fill="none" stroke="#7a5238" stroke-width="3" data-k="@r<:6@.4 118@3.6;o:0@.4 .9@.9 .9@2.8 0@3.6"/>
  <text x="190" y="388" class="ts mid">Sieb von unten</text>
  <circle cx="262" cy="160" r="16" fill="none" stroke="#262626" stroke-width="2"/>
  <path class="ln" d="M272 147 L462 72 M274 171 L470 176" stroke-width="1.2" stroke-opacity=".6"/>
  <circle cx="535" cy="116" r="86" fill="#d9d4ce" stroke="#262626" stroke-width="2.5"/>
  <g clip-path="url(#c6-lens)">${Q.map(q => `<circle cx="${f1(535 + q[0] * 50)}" cy="${f1(116 + q[1] * 43.3)}" r="15" fill="#262626"/>`).join('')}</g>
  <g data-k="o:0@1.6 1@2 1@5 0@5.5"><path d="M520 116 H550 M520 109 v14 M550 109 v14" stroke="#f8cbad" stroke-width="2"/>
    <path d="M535 116 H585" stroke="#7a5238" stroke-width="1.6" stroke-dasharray="3 4"/><path d="M535 106 v20 M585 106 v20" stroke="#7a5238" stroke-width="1.6"/></g>
  <text x="535" y="230" class="ts mid">Lochstruktur, vergrößert</text>
  ${rep(3, i => `<g transform="translate(${430 + i * 105} 312) scale(.27)"><path d="${BP([92, 124, 160][i])}" fill="none" stroke="#262626" stroke-width="10" stroke-linejoin="round" stroke-linecap="round"/><path d="M-120 ${[92, 124, 160][i] + 3} H120" stroke="#b0a7a1" stroke-width="11" stroke-dasharray="6 14"/></g>`)}
  <text x="535" y="392" class="ts mid">Unterschiedliche Siebgrößen</text></svg>`; };

/* ---------- 6.9 basket types: interactive ---------- */
const typSvg = () => { let h = '<circle r="2.4" data-r="0" style="--c:0;--s:0"/>', g = '', fl = '';
  for (let k = 1; k <= 8; k++) for (let j = 0; j < 6 * k; j++) { const a = j / (6 * k) * 6.2832 + k * .26; h += `<circle r="2.4" data-r="${k}" style="--c:${(Math.cos(a) * k).toFixed(3)};--s:${(Math.sin(a) * k).toFixed(3)}"/>`; }
  for (let k = -8; k <= 8; k++) { g += `<rect x="-.5" y="123.2" width="1" height="8.6" data-r="${Math.abs(k)}" style="--k:${k}"/>`; fl += `<line x1="0" x2="0" y1="135" y2="186" data-r="${Math.abs(k)}" style="--k:${k}"/>`; }
  return `<svg class="dg c6-dg" id="c6-sv" style="--cut:330px" viewBox="0 0 700 300" role="img" aria-label="Sieb im Schnitt und von unten, Lochbild einstellbar">${defs}${MK}
  <path d="M52 44 H348" stroke="#262626" stroke-width="1.5" marker-start="url(#c6-ai)" marker-end="url(#c6-ai)"/><text x="200" y="34" class="ts mid">Durchmesser</text>
  <g transform="translate(200 72)">
    <path d="M-122 6 V118" stroke="#262626" stroke-width="1.5" marker-start="url(#c6-ai)" marker-end="url(#c6-ai)"/><text x="-108" y="40" class="ts">Siebtiefe</text>
    <text x="14" y="86" class="ts mid">Fassungsvermögen</text>
    <g id="c6-sv-flow">${fl}</g>
    ${basket({ holes: 0, ink: true })}
    <g id="c6-sv-gaps">${g}</g>
  </g>
  <circle cx="566" cy="150" r="106" fill="url(#g-steel)" stroke="#262626" stroke-width="2.5"/><circle cx="566" cy="150" r="91" fill="#d9d4ce" stroke="#8f8882" stroke-width="1.5"/>
  <g transform="translate(566 150)"><g id="c6-sv-holes" fill="#262626">${h}</g></g>
  <text x="566" y="284" class="ts mid">Sieb von unten</text></svg>`; };

/* ---------- 6.10 tool icons ---------- */
const IC = [
  '<path d="M11 11h26l-3 27H14z"/><path d="M12.6 22h22.8"/><path d="M19 28h.1M25 30h.1M29 26h.1M22 34h.1M28 34h.1" stroke-width="2.6"/>',
  '<path d="M7 10h34l-6 12H13z"/><path d="M13 22v10q0 6 6 6h10q6 0 6-6V22"/><path d="M17 30h14" stroke-dasharray="2 3"/>',
  '<rect x="18" y="5" width="12" height="13" rx="5"/><path d="M20 18l-6 24M22.5 18l-2.5 24M25.5 18l2.5 24M28 18l6 24"/>',
  '<rect x="7" y="13" width="34" height="10" rx="3"/><path d="M11 23l7 10h12l7-10"/><path d="M24 23v10"/><path d="M16 8q8-4 16 0"/>',
  '<path d="M19 22q-6-8-1-14q6-4 12 0q5 6-1 14"/><path d="M20 22h8v8h-8z"/><rect x="9" y="30" width="30" height="9" rx="2"/>',
  '<ellipse cx="24" cy="22" rx="18" ry="8"/><path d="M6 22v5q0 8 18 8t18-8v-5"/><path d="M16 21h.1M24 19h.1M32 21h.1M20 24h.1M28 24h.1" stroke-width="2.6"/>',
  '<path d="M5 12h6l2 20q.5 5 5.500 5h11q5 0 5.500-5l2-20h6"/><path d="M17 37v5M24 37v5M31 37v5" stroke-dasharray="2 2.500"/>',
  '<circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="3"/><path d="M24 13h.1M24 35h.1M13 24h.1M35 24h.1M16 16h.1M32 16h.1M16 32h.1M32 32h.1M18.500 24h.1M29.500 24h.1M24 18.500h.1M24 29.500h.1" stroke-width="2.6"/>'
];
const TOOLS = [['Dosierbecher', 'Dosierung'], ['Dosing Ring', 'Verhindert Mahlgutverlust'], ['WDT Tool', 'Verteilung'], ['Leveler', 'Oberfläche ebnen'], ['Tamper', 'Verdichtung'], ['Puck Screen', 'Schutz und Wasserverteilung'], ['Präzisionssieb', 'Siebgeometrie'], ['IMS Duschsieb', 'Wasserverteilung']];

const baArrows = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg>';

export const html = chapter(CH) +

scene({ id: 'puck-grundlagen', ch: CH, title: '6.1 Grundlagen der Puck Preparation', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title sm rv" style="--d:1">Grundlagen der Puck Preparation</h2>
      <p class="lead wide rv" style="--d:2"><b>Ziel:</b> Ein gleichmäßig verteilter und stabiler Kaffeepuck.</p>
      <span class="label rv" style="--d:3">Warum wichtig?</span>
      <div class="rv" style="--d:3">${notes(['Gleichmäßiger Wasserfluss.', 'Reduziertes Channeling-Risiko.', 'Reproduzierbare Extraktion.', 'Konstante Getränkequalität.'])}</div>
    </div>
    <div class="stack">
      <div class="rv-img" style="--d:2"><div data-film data-bare data-dur="12" data-still="5">${grundSvg()}</div></div>
      <span class="label rv" style="--d:4">Zwei Kategorien</span>
      <div class="grid2">
        <div class="card c6-cat rv" style="--d:5"><h3>Direkt</h3><p>Werkzeuge wirken unmittelbar auf das Kaffeemehl.</p><p class="ex">z. B. WDT Tool, Leveler, Tamper</p></div>
        <div class="card c6-cat rv" style="--d:6.5"><h3>Indirekt</h3><p>Komponenten beeinflussen die Bedingungen der Extraktion.</p><p class="ex">z. B. Puck Screen, Sieb, Duschsieb</p></div>
      </div>
    </div>
  </div>`)) +

film({ id: 'puck-prozess', ch: CH, title: '6.2 Der Puck-Preparation-Prozess', name: 'Die sechs Arbeitsschritte', dur: PD, rate: .5, still: 12.9,
  marks: [
    ['Dosieren', S[0], '<b>1. Dosieren.</b> Das Kaffeemehl fällt ins Sieb: ein Haufen, oft mit Klumpen.'],
    ['WDT', S[1], '<b>2. WDT.</b> Dünne Nadeln lockern das Kaffeemehl auf und brechen Klumpen auf.'],
    ['Leveling', S[2], '<b>3. Leveling.</b> Der Leveler ebnet die Oberfläche.'],
    ['Tampen', S[3], '<b>4. Tampen.</b> Der Tamper verdichtet das Kaffeemehl gleichmäßig.'],
    ['Kontrolle', S[4], '<b>5. Kontrolle.</b> Ist die Oberfläche eben und waagerecht?'],
    ['Bezug', S[5], '<b>6. Bezug.</b> Das Wasser fließt gleichmäßig durch den Puck.']
  ], svg: prozessSvg() }) +

realFilm({ id: 'puck-echt', ch: CH, title: "Puck Preparation in echt", name: "Verteilen, tampen, prüfen", clip: 'ch6-puck', dur: 15.5, rate: 0.5,
  lead: "Drei Handgriffe am Tresen, in Zeitlupe.",
  marks: [["WDT", 0, "Dünne Nadeln lockern das Kaffeemehl und <b>brechen Klumpen auf</b>."], ["Tampen", 5, "Tamper gerade ansetzen und <b>gleichmäßig verdichten</b>."], ["Kontrolle", 11.5, "Eine ebene, stabile Oberfläche: bereit für den Bezug."]] }) +

scene({ id: 'wdt', ch: CH, title: '6.3 WDT Tool', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">WDT Tool</h2>
      <p class="lead wide rv" style="--d:2"><b>Weiss Distribution Technique:</b> dünne Nadeln verteilen das Kaffeemehl im Sieb.</p>
      <div class="grid2">
        <div class="stack c6-tight rv" style="--d:3"><span class="label acc">Funktion</span>${notes(['Klumpen aufbrechen.', 'Kaffeemehl auflockern.', 'Gleichmäßige Verteilung.', 'Hohlräume reduzieren.'], 'sm')}</div>
        <div class="stack c6-tight rv" style="--d:4.5"><span class="label acc">Anwendung</span>${notes(['Dünne Nadeln verwenden.', 'Gesamtes Kaffeebett bearbeiten.', 'Gleichmäßig bis zum Boden arbeiten.', 'Keine unnötige Verdichtung.'], 'sm')}</div>
      </div>
    </div>
    <div class="stack c6-tight" style="align-items:center">
      <div class="ba wide c6-ba rv-img noswipe" style="--d:2">
        ${wdtPic(true)}${wdtPic(false)}
        <span class="tag l">Vorher</span><span class="tag r">Mit WDT</span>
        <div class="handle">${baArrows}</div>
        <input type="range" min="0" max="100" value="50" aria-label="Vergleich vorher und nachher verschieben">
      </div>
      <p class="mute c6-hint rv" style="--d:4">Regler ziehen: dasselbe Kaffeebett vor und nach dem WDT.</p>
    </div>
  </div>`)) +

scene({ id: 'leveler', ch: CH, title: '6.4 Leveler', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Leveler</h2>
      <p class="lead wide rv" style="--d:2"><b>Funktion:</b> Ebnet die Oberfläche des Kaffeemehls.</p>
      <div class="grid2">
        <div class="stack c6-tight rv" style="--d:3"><span class="label acc">Vorteile</span>${notes(['Gleichmäßigere Oberfläche.', 'Erleichtert das Tampen.', 'Reproduzierbare Vorbereitung.'], 'sm')}</div>
        <div class="stack c6-tight rv" style="--d:4.5"><span class="label acc">Nachteile</span>${notes(['Bewegt häufig nur die obere Schicht.', 'Ersetzt kein WDT.', 'Falsche Einstellung kann ungleichmäßig verdichten.'], 'sm')}</div>
      </div>
    </div>
    <div class="rv-img" style="--d:2"><div data-film data-bare data-dur="8" data-still="6.3">${levSvg()}</div></div>
  </div>`)) +

scene({ id: 'tampen', ch: CH, title: '6.5 Tampen', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Tampen</h2>
      <p class="lead wide rv" style="--d:2"><b>Ziel:</b> Gleichmäßige Verdichtung des Kaffeemehls.</p>
      <div class="grid2">
        <div class="stack c6-tight rv" style="--d:3"><span class="label acc">Wichtige Faktoren</span>${notes(['Gerader Tamper.', 'Waagerechte Ausrichtung.', 'Gleichmäßiger Druck.', 'Passender Durchmesser.'], 'sm')}</div>
        <div class="stack c6-tight rv" style="--d:4.5"><span class="label acc">Alignment Tamping</span>${notes(['Tamper gerade ansetzen.', 'Schräges Verdichten vermeiden.', 'Stabilen, ebenen Puck erzeugen.'], 'sm')}</div>
      </div>
      <div class="rv" style="--d:6">${why('<b>Wichtig:</b> Gleichmäßigkeit ist wichtiger als maximale Kraft.')}</div>
    </div>
    <div class="stack c6-tight">
      <div class="rv-img" style="--d:2">${tampSvg()}</div>
      <div class="slider rv noswipe" style="--d:3"><div class="ends"><span>gerade</span><span class="mid">Neigung des Tampers</span><span>schräg</span></div>
        <input type="range" id="c6-tilt" min="0" max="6" step="0.5" value="4" aria-label="Neigung des Tampers in Grad"></div>
      <div class="c6-read rv" style="--d:4">
        <div><span class="big-num" id="c6-tilt-v">0,0°</span><span class="u">Neigung</span></div>
        <div><span class="big-num" id="c6-tilt-mm">0,0 mm</span><span class="u">Höhenunterschied im Puck<br>(Richtwert, 58-mm-Sieb)</span></div>
        <p id="c6-tilt-t" aria-live="polite"></p>
      </div>
    </div>
  </div>`)) +

scene({ id: 'tamper-profile', ch: CH, title: '6.6 Tamper und Rillenprofile', light: true, steps: 2 }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title sm rv" style="--d:1">Tamper und Rillenprofile</h2>
      <div class="tabs rv" style="--d:2" role="group" aria-label="Tamper-Unterseite wählen">${rep(3, i => `<button data-go="${i}" aria-pressed="false">${PROFILES[i].n}</button>`)}</div>
      <div class="pane rv" style="--d:3">${rep(3, i => `<div data-only="${i}" class="stack c6-tight"><h3 class="c6-h3">${PROFILES[i].n}</h3>${notes(PROFILES[i].b)}</div>`)}</div>
      <div class="rv" style="--d:4">${why('Die Unterseite bestimmt, wie der Druck im Kaffeemehl ankommt und welchen Abdruck der Tamper hinterlässt.')}</div>
    </div>
    <div class="rv-img" style="--d:2"><div data-film data-bare data-dur="7.6" data-still="5.6">${profSvg()}</div></div>
  </div>`)) +

film({ id: 'puck-screen', ch: CH, title: '6.7 Puck Screen und IMS Duschsieb', name: 'Puck Screen und IMS Duschsieb', dur: 22, rate: .5, still: 19.5,
  marks: [
    ['Aufbau von oben nach unten', 0, 'Brühgruppe, Duschsieb, Puck Screen, Kaffeepuck, Sieb.'],
    ['IMS Duschsieb', 4.4, '<b>IMS Duschsieb:</b> sitzt in der Brühgruppe und verteilt das Brühwasser. Präzise gefertigte Lochstruktur.'],
    ['Puck Screen', 9, '<b>Puck Screen:</b> liegt direkt auf dem Kaffeepuck, schützt die Puckoberfläche und kann die Wasserverteilung beeinflussen.'],
    ['Durchfluss', 13.5, 'Das Wasser läuft gleichmäßig durch den Puck. Der Puck Screen hält das Duschsieb sauberer.'],
    ['Unterschied', 18, '<b>Unterschied:</b> Puck Screen = auf dem Kaffee / Duschsieb = in der Brühgruppe.']
  ], svg: screenSvg() }) +

scene({ id: 'siebe', ch: CH, title: '6.8 IMS Competition Siebe', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title sm rv" style="--d:1">IMS Competition Siebe</h2>
      <div class="grid2">
        <div class="stack c6-tight rv" style="--d:2"><span class="label acc">Besonderheiten</span>${notes(['Präzisionsgefertigte Lochstruktur.', 'Unterschiedliche Siebgrößen.', 'Unterschiedliche Lochdurchmesser.', 'Spezifische Geometrien.'], 'sm')}</div>
        <div class="stack c6-tight rv" style="--d:3.5"><span class="label acc">Einfluss auf</span>${notes(['Wasserabfluss.', 'Hydraulischen Widerstand.', 'Durchfluss.', 'Mahlgradanforderungen.'], 'sm')}</div>
      </div>
      <div class="rv" style="--d:5">${why('<b>Wichtig:</b> Ein Competition-Sieb benötigt eine passende Abstimmung der übrigen Brühparameter.')}</div>
    </div>
    <div class="rv-img" style="--d:2"><div data-film data-bare data-dur="6" data-still="2.4">${siebSvg()}</div></div>
  </div>`)) +

scene({ id: 'siebtypen', ch: CH, title: '6.9 Siebtypen und ihre Auswirkungen', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title sm rv" style="--d:1">Siebtypen und ihre Auswirkungen</h2>
      <span class="label rv" style="--d:2">Einfluss auf die Extraktion</span>
      <ol class="c6-ol">${['Siebgeometrie beeinflusst den Wasserabfluss.', 'Widerstand verändert sich.', 'Mahlgrad muss gegebenenfalls angepasst werden.', 'Extraktionsverhalten verändert sich.'].map((s, i) => `<li class="rv" style="--d:${2.5 + i * 1.3}">${s}</li>`).join('')}</ol>
      <div class="rv" style="--d:8">${why('<b>Feiner mahlen = mehr Extraktion,</b> aber nicht automatisch besserer Geschmack.')}</div>
    </div>
    <div class="stack c6-tight">
      <span class="label rv" style="--d:2">Wichtige Unterschiede</span>
      <div class="rv-img" style="--d:2">${typSvg()}</div>
      <div class="c6-ctl rv noswipe" style="--d:3">
        <div class="slider"><span class="label">Lochanzahl</span><input type="range" id="c6-sv-n" min="5" max="8" step="1" value="6" aria-label="Lochanzahl"><div class="ends"><span>wenige</span><span>viele</span></div></div>
        <div class="slider"><span class="label">Lochdurchmesser</span><input type="range" id="c6-sv-d" min="1.8" max="3" step="0.1" value="2.4" aria-label="Lochdurchmesser"><div class="ends"><span>klein</span><span>groß</span></div></div>
        <div class="slider"><span class="label">Lochverteilung</span><div class="c6-pick" role="group" aria-label="Lochverteilung"><button data-c6dist="0" class="on" aria-pressed="true">bis zum Rand</button><button data-c6dist="1" aria-pressed="false">mittig</button></div></div>
      </div>
      <div class="c6-meters rv" style="--d:4">
        <div class="c6-meter"><span>Offene Fläche <b id="c6-sv-x">×1,0</b></span><i><u id="c6-sv-a"></u></i></div>
        <div class="c6-meter"><span>Widerstand des Siebs</span><i><u id="c6-sv-r"></u></i></div>
        <div class="c6-meter"><span>Wasserabfluss</span><i><u id="c6-sv-f"></u></i></div>
      </div>
      <p class="c6-hint mute rv" style="--d:5" id="c6-sv-t" aria-live="polite"></p>
    </div>
  </div>`)) +

scene({ id: 'puck-tools', ch: CH, title: '6.10 Übersicht der Puck-Preparation-Tools', light: true }, inner(`
  <div class="stack">
    ${kicker(CH)}
    <h2 class="title sm rv" style="--d:1">Übersicht der Puck-Preparation-Tools</h2>
    <div class="c6-tools">${TOOLS.map(([n, f], i) => `<div class="card rv" style="--d:${f1(2 + i * 1.4)}"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[i]}</svg><div><span class="label">Werkzeug</span><h3>${n}</h3></div><div><span class="label">Funktion</span><p>${f}</p></div></div>`).join('')}</div>
  </div>`));

export const css = `
.c6-dg{max-height:calc(100dvh - var(--hud-h) - var(--dock-h) - var(--cut,60px));display:block}
.c6-tight{gap:10px}
.c6-cat{display:flex;flex-direction:column;gap:6px;font-size:clamp(14px,.5vw + 10px,18px)}
.c6-cat h3{font-size:clamp(18px,1vw + 10px,28px);font-weight:500;color:var(--brown)}
.c6-cat .ex{font-size:13px;color:var(--mute)}
.c6-h3{font-size:clamp(22px,1.4vw + 10px,36px);font-weight:400;line-height:1.05;color:var(--strong)}
.c6-hint{font-size:14px;margin:0;min-height:2.9em}
.c6-ba .tag{color:var(--milk)}
.c6-ba{box-shadow:0 18px 44px rgba(0,0,0,.28)}
.c6-ba .handle::after{transition:transform .25s var(--ease)}
.c6-ba:active .handle::after{transform:scale(1.12)}
.c6-read{display:grid;grid-template-columns:auto auto minmax(0,1fr);gap:clamp(14px,2vw,30px);align-items:start}
.c6-read .big-num{display:block;white-space:nowrap;font-size:clamp(28px,2vw + 10px,48px);min-width:3.4ch}
.c6-read .u{font-size:12px;color:var(--mute);display:block;margin-top:4px;line-height:1.3}
.c6-read p{font-size:clamp(14px,.5vw + 10px,18px);margin:0;border-left:2px solid var(--brown);padding-left:12px;min-height:4.4em}
.slider .ends .mid{letter-spacing:.2em;text-transform:uppercase;font-size:11px;font-weight:500}
.c6-ol{list-style:none;margin:0;padding:0;counter-reset:c6;display:flex;flex-direction:column;font-size:clamp(16px,.7vw + 10px,21px)}
.c6-ol li{counter-increment:c6;display:grid;grid-template-columns:34px minmax(0,1fr);gap:8px;padding:9px 0;border-top:1px solid var(--line)}
.c6-ol li:last-child{border-bottom:1px solid var(--line)}
.c6-ol li::before{content:counter(c6);font-family:var(--mono);font-size:13px;color:var(--brown);padding-top:.3em}
.c6-ctl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(12px,1.6vw,24px);align-items:start}
.c6-ctl .slider{gap:2px}
.c6-ctl .slider input[type=range]{height:28px}
.c6-pick{display:inline-flex;align-self:flex-start;border:1px solid var(--line);border-radius:999px;padding:3px;gap:2px;margin-top:3px;flex-wrap:wrap}
.c6-pick button{min-height:32px;padding:0 12px;border-radius:999px;font-size:13px;color:var(--mute);white-space:nowrap;transition:background .3s,color .3s,transform .25s var(--ease)}
.c6-pick button.on{background:var(--strong);color:var(--bg)}
.c6-pick button:active{transform:scale(.95)}
.c6-meters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(12px,1.6vw,24px)}
.c6-meter{display:flex;flex-direction:column;gap:6px;font-size:14px}
.c6-meter b{font-family:var(--mono);font-weight:500;color:var(--brown);margin-left:4px}
.c6-meter i{display:block;height:8px;border-radius:4px;background:var(--line);overflow:hidden}
.c6-meter u{display:block;height:100%;width:50%;border-radius:4px;background:var(--brown);transition:width .6s var(--ease)}
#c6-sv{--sp:13.7;--spx:18.8;--hr:2.4;--gw:5.3;--fw:2.2}
#c6-sv-holes circle{r:calc(var(--hr) * 1px);transform:translate(calc(var(--c) * var(--sp) * 1px),calc(var(--s) * var(--sp) * 1px));transition:transform .6s var(--ease),r .4s var(--ease),opacity .4s}
#c6-sv-gaps rect{fill:var(--bg);transform:translateX(calc(var(--k) * var(--spx) * 1px)) scaleX(var(--gw));transition:transform .6s var(--ease),opacity .4s}
#c6-sv-flow line{stroke:#2f6f9f;stroke-width:calc(var(--fw) * 1px);stroke-dasharray:9 9;transform:translateX(calc(var(--k) * var(--spx) * 1px));transition:transform .6s var(--ease),opacity .4s,stroke-width .4s}
#c6-sv .off{opacity:0}
.c6-tools{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(10px,1.2vw,18px)}
.c6-tools .card{display:flex;flex-direction:column;gap:10px;transition:transform .5s var(--ease),background .3s}
.c6-tools .card:hover{transform:translateY(-4px);background:rgba(38,38,38,.11)}
.c6-tools svg{width:clamp(36px,3.4vw,54px);height:auto;color:var(--brown);transition:transform .8s var(--ease)}
.c6-tools .card:hover svg{transform:scale(1.1) rotate(-4deg)}
.c6-tools h3{font-size:clamp(18px,1vw + 10px,28px);font-weight:500;line-height:1.1;color:var(--strong);overflow-wrap:anywhere}
.c6-tools p{font-size:clamp(14px,.5vw + 10px,18px);margin:0}
.c6-tools .label{font-size:10px}
@media (max-width:980px){.c6-tools{grid-template-columns:repeat(2,minmax(0,1fr))}.c6-read{grid-template-columns:auto minmax(0,1fr)}.c6-read p{grid-column:1/-1;min-height:0}}
@media (max-width:760px){.c6-ctl,.c6-meters{grid-template-columns:minmax(0,1fr)}.c6-dg{max-height:none}}
`;

export const js = `
/* chapter 6: a loop that only runs while its scene is on screen; everything eases toward a target, so input can interrupt at any time */
function c6loop(id, fn) {
  var raf = 0, last = 0;
  function tick(now) { var dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now; fn(dt, false); raf = requestAnimationFrame(tick); }
  hooks[id] = { enter: function () { cancelAnimationFrame(raf); last = performance.now(); fn(0, true); raf = requestAnimationFrame(tick); }, leave: function () { cancelAnimationFrame(raf); } };
}
function c6k(dt, sp) { return reduce ? 1 : 1 - Math.exp(-dt * sp); }

/* 6.3 before/after: the divider glides to the pointer; on entering it wipes in from the "before" side */
(function () {
  var ba = $('.c6-ba'); if (!ba) return;
  var inp = $('input', ba), cur = 50, tgt = 50, intro = 0;
  inp.addEventListener('input', function () { tgt = +inp.value; intro = 0; });
  c6loop('wdt', function (dt, first) {
    if (first && !reduce) { cur = 92; intro = 2.2; }
    intro = Math.max(0, intro - dt);
    cur += (tgt - cur) * c6k(dt, intro > 0 ? (intro < 1.7 ? 2.6 : 0) : 12);
    ba.style.setProperty('--x', cur.toFixed(2) + '%');
  });
})();

/* 6.5 tilt of the tamper */
(function () {
  var inp = $('#c6-tilt'); if (!inp) return;
  var hx = function (y) { return 150 - 10 * y / 124; }, xs = [-120, -90, -60, -30, 0, 30, 60, 90, 120];
  var ins = $$('.c6-tp-in'), outs = $$('.c6-tp-out'), ph = xs.map(function () { return 0; }), sq = xs.map(function () { return 1; });
  var cur = +inp.value, tgt = cur, shown = -1, wait = 0, vt = $('#c6-tilt-t');
  function say() { var a = tgt; vt.innerHTML = a === 0 ? '<b>Gerade.</b> Der Puck ist überall gleich dick und gleich dicht. Das Wasser fließt gleichmäßig.'
    : a <= 2 ? '<b>Leicht schräg.</b> Eine Seite bleibt lockerer. Dort fließt schon mehr Wasser.'
    : '<b>Schräg.</b> Das Wasser nimmt den Weg des geringsten Widerstands: durch die lockerere Seite.'; }
  function draw(a) {
    var tn = Math.tan(a * Math.PI / 180), yl = 64 - 146 * tn, yr = 64 + 146 * tn;
    var d = 'M' + (-hx(yl)).toFixed(1) + ' ' + yl.toFixed(1) + ' L' + hx(yr).toFixed(1) + ' ' + yr.toFixed(1) + ' L141 112 Q140 124 128 124 L-128 124 Q-140 124 -141 112 Z';
    ['#c6-tp-puck', '#c6-tp-clipp', '#c6-tp-dens'].forEach(function (s) { $(s).setAttribute('d', d); });
    $('#c6-tp-dens').setAttribute('opacity', (a / 6 * .85).toFixed(3));
    $('#c6-tp-tool').setAttribute('transform', 'rotate(' + a.toFixed(3) + ' 0 64)');
    // thicker side = less compressed = less resistance (illustrative model)
    var q = xs.map(function (x) { return Math.pow((60 - x * tn) / 60, 4); }), m = Math.max.apply(null, q), s = q.reduce(function (p, c) { return p + c; }, 0) / q.length;
    xs.forEach(function (x, i) {
      var u = q[i] / m, w = (1 + 3 * u).toFixed(2), o = (.18 + .82 * u).toFixed(2);
      sq[i] = q[i] / s;
      ins[i].setAttribute('y1', (66 + x * tn).toFixed(1)); ins[i].style.strokeWidth = w; ins[i].style.opacity = o;
      outs[i].setAttribute('y2', (142 + 16 * u).toFixed(1)); outs[i].style.strokeWidth = w; outs[i].style.opacity = o;
    });
    var lo = clamp(a / 2, 0, 1).toFixed(2); $('#c6-tp-l').setAttribute('opacity', lo); $('#c6-tp-r').setAttribute('opacity', lo);
    $('#c6-tp-ang').textContent = de(a, 1) + '°';
    $('#c6-tilt-v').textContent = de(a, 1) + '°';
    $('#c6-tilt-mm').textContent = de(58 * tn, 1) + ' mm';
  }
  inp.addEventListener('input', function () { tgt = +inp.value; wait = 0; say(); });
  say(); draw(cur);
  c6loop('tampen', function (dt, first) {
    if (first && !reduce) { cur = 0; wait = .9; }          // arrive straight, then tilt to the set angle
    wait = Math.max(0, wait - dt);
    if (!wait) { cur += (tgt - cur) * c6k(dt, 4.5); if (Math.abs(tgt - cur) < .003) cur = tgt; }
    if (cur !== shown) { draw(cur); shown = cur; }
    if (reduce) return;
    for (var i = 0; i < xs.length; i++) { ph[i] = (ph[i] + dt * 24 * (.3 + sq[i])) % 170; ins[i].style.strokeDashoffset = (-ph[i]).toFixed(1); outs[i].style.strokeDashoffset = (-ph[i]).toFixed(1); }
  });
})();

/* 6.9 hole pattern of the basket: positions and sizes are CSS transitions, the numbers ease in a loop */
(function () {
  var nI = $('#c6-sv-n'), dI = $('#c6-sv-d'); if (!nI) return;
  var svg = $('#c6-sv'), parts = $$('[data-r]', svg), lines = $$('#c6-sv-flow line'), dist = 0, btns = $$('[data-c6dist]');
  var relT = 1, rel = 1, ph = 0;
  function set() {
    var n = +nI.value, Rf = dist ? 52 : 82, sp = Rf / n, r = Math.min(+dI.value, sp * .42), N = 1 + 3 * n * (n + 1);
    svg.style.setProperty('--sp', sp.toFixed(2)); svg.style.setProperty('--spx', (sp * 113 / 82).toFixed(2));
    svg.style.setProperty('--hr', r.toFixed(2)); svg.style.setProperty('--gw', (r * 2.2).toFixed(2)); svg.style.setProperty('--fw', (r * .9).toFixed(2));
    parts.forEach(function (el) { el.classList.toggle('off', +el.dataset.r > n); });
    relT = N * r * r / (127 * 2.4 * 2.4);
    var pos = clamp(.5 + Math.log(relT) / Math.log(2.8) * .5, .05, 1);
    $('#c6-sv-a').style.width = (pos * 100) + '%'; $('#c6-sv-f').style.width = (pos * 100) + '%'; $('#c6-sv-r').style.width = ((1.05 - pos) * 100) + '%';
    $('#c6-sv-t').textContent = relT > 1.2 ? 'Mehr offene Fläche: Das Wasser läuft leichter ab. Mahlgrad gegebenenfalls feiner stellen.'
      : relT < .85 ? 'Weniger offene Fläche: Das Sieb bremst stärker. Mahlgrad gegebenenfalls gröber stellen.'
      : 'Ausgangssieb: Widerstand und Wasserabfluss im Gleichgewicht.';
  }
  btns.forEach(function (b) { b.addEventListener('click', function () { dist = +b.dataset.c6dist; btns.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); set(); }); });
  nI.addEventListener('input', set); dI.addEventListener('input', set); set();
  c6loop('siebtypen', function (dt) {
    rel += (relT - rel) * c6k(dt, 6); if (Math.abs(relT - rel) < .004) rel = relT;
    $('#c6-sv-x').textContent = '×' + de(rel, 1);
    if (reduce) return;
    ph = (ph + dt * 30 * Math.sqrt(rel)) % 180;
    for (var i = 0; i < lines.length; i++) lines[i].style.strokeDashoffset = (-ph - (i % 3) * 5).toFixed(1);
  });
})();
`;

export const quiz = [
  { q: 'Was zählt beim Tampen am meisten?', o: ['Maximale Kraft.', 'Gleichmäßigkeit: ein gerade angesetzter Tamper und ein ebener Puck.', 'Ein möglichst schwerer Tamper.'], a: 1, e: '<b>Gleichmäßigkeit ist wichtiger als maximale Kraft.</b> Schräges Verdichten vermeiden.', go: 'tampen' },
  { q: 'Wo liegt der Puck Screen?', o: ['In der Brühgruppe.', 'Unter dem Sieb.', 'Direkt auf dem Kaffeepuck.'], a: 2, e: 'Puck Screen = <b>auf dem Kaffee</b>, Duschsieb = in der Brühgruppe.', go: 'puck-screen' }
];
