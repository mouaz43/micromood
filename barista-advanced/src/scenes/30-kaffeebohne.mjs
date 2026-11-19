import { chapter, scene, inner, kicker, film, notes, why, rep, rng, defs, f1, wave, steam, splash } from '../lib.mjs';
const CH = 3;
const f2 = v => Math.round(v * 100) / 100;
const bz = (P, t) => { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]]; };
// a part that is knocked at time t and swings back to rest (damped)
const osc = (t, a, st = .2) => `0@${f2(t)} ${f1(a)}@${f2(t + st * .6)} ${f1(-a * .55)}@${f2(t + st * 1.7)} ${f1(a * .28)}@${f2(t + st * 2.8)} 0@${f2(t + st * 4)}`;

/* ---------- shared drawing parts of this chapter ---------- */
const HEXH = 9, HEXV = f1(HEXH * 1.732);
const D3 = `<defs>
  <radialGradient id="c3-ripe" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#e3704f"/><stop offset=".62" stop-color="#b8452a"/><stop offset="1" stop-color="#8f3420"/></radialGradient>
  <radialGradient id="c3-unripe" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="#ecc893"/><stop offset=".62" stop-color="#d9a35f"/><stop offset="1" stop-color="#b98a4c"/></radialGradient>
  <radialGradient id="c3-raw" cx=".4" cy=".3" r=".85"><stop offset="0" stop-color="#f3eee8"/><stop offset=".7" stop-color="#d8bd94"/><stop offset="1" stop-color="#c99a6b"/></radialGradient>
  <radialGradient id="c3-hi" cx=".3" cy=".24" r=".62"><stop offset="0" stop-color="#f3eee8" stop-opacity=".44"/><stop offset=".55" stop-color="#f3eee8" stop-opacity=".08"/><stop offset="1" stop-color="#f3eee8" stop-opacity="0"/></radialGradient>
  <radialGradient id="c3-sh" cx=".42" cy=".4" r=".68"><stop offset=".5" stop-color="#120f0d" stop-opacity="0"/><stop offset="1" stop-color="#120f0d" stop-opacity=".6"/></radialGradient>
  <radialGradient id="c3-drop"><stop offset="0" stop-color="#262626" stop-opacity=".32"/><stop offset="1" stop-color="#262626" stop-opacity="0"/></radialGradient>
  <linearGradient id="c3-basket" x1="0" x2="1"><stop offset="0" stop-color="#4a2c1a"/><stop offset=".38" stop-color="#8a5f3c"/><stop offset="1" stop-color="#3a2114"/></linearGradient>
  <linearGradient id="c3-leaf" x1="0" x2="1"><stop offset="0" stop-color="#3a2114"/><stop offset=".5" stop-color="#5b3720"/><stop offset="1" stop-color="#2a170d"/></linearGradient>
  <linearGradient id="c3-ramp" x1="0" x2="1"><stop offset="0" stop-color="#dccaa6"/><stop offset=".3" stop-color="#c0884f"/><stop offset=".65" stop-color="#6b4429"/><stop offset="1" stop-color="#33200f"/></linearGradient>
  <pattern id="c3-hex" width="${HEXH * 3}" height="${HEXV}" patternUnits="userSpaceOnUse"><path d="M0 ${f1(HEXV / 2)}L${HEXH / 2} 0L${HEXH * 1.5} 0L${HEXH * 2} ${f1(HEXV / 2)}L${HEXH * 1.5} ${HEXV}L${HEXH / 2} ${HEXV}ZM${HEXH * 2} ${f1(HEXV / 2)}L${HEXH * 3} ${f1(HEXV / 2)}" fill="none" stroke="#3a2114" stroke-width="1.3"/></pattern>
</defs>`;
const DEFS = defs + D3;

// roasted bean seen from its flat side: half-width a, half-height b, centred on 0,0
const beanD = (a, b) => `M0 ${-b}C${f1(a * .64)} ${-b} ${a} ${f1(-b * .5)} ${a} ${f1(b * .06)}C${a} ${f1(b * .62)} ${f1(a * .58)} ${b} ${f1(a * .02)} ${b}C${f1(-a * .6)} ${b} ${-a} ${f1(b * .58)} ${-a} ${f1(-b * .04)}C${-a} ${f1(-b * .56)} ${f1(-a * .62)} ${-b} 0 ${-b}Z`;
const cutD = (a, b, kind) => kind === 's'
  ? `M${f1(a * .02)} ${f1(-b * .86)}C${f1(a * .38)} ${f1(-b * .52)} ${f1(a * .3)} ${f1(-b * .16)} 0 0C${f1(-a * .3)} ${f1(b * .16)} ${f1(-a * .38)} ${f1(b * .52)} ${f1(-a * .02)} ${f1(b * .86)}`
  : `M${f1(a * .03)} ${f1(-b * .84)}C${f1(a * .1)} ${f1(-b * .3)} ${f1(-a * .1)} ${f1(b * .3)} ${f1(-a * .03)} ${f1(b * .84)}`;
function beanTop(a, b, kind, { base = '#855634', baseAttr = '', skin = .4, outline = '' } = {}) {
  const o = beanD(a, b), c = cutD(a, b, kind), w = f1(a * .14);
  return `<path d="${o}" fill="${base}" ${baseAttr}/><path d="${o}" fill="url(#c3-hi)"/><path d="${o}" fill="url(#c3-sh)" ${outline}/>
    <path d="${beanD(f1(a * .8), f1(b * .86))}" fill="none" stroke="#f3eee8" stroke-opacity=".06" stroke-width="${f1(a * .05)}"/>
    <path d="${c}" fill="none" stroke="#1d110a" stroke-width="${w}" stroke-linecap="round"/>
    <path d="${c}" fill="none" stroke="#0d0705" stroke-width="${f1(w * .5)}" stroke-linecap="round" transform="translate(${f1(-w * .16)} 0)"/>
    <path d="${c}" fill="none" stroke="#f3eee8" stroke-opacity=".2" stroke-width="${f1(w * .2)}" stroke-linecap="round" transform="translate(${f1(w * .62)} ${f1(w * .18)})"/>
    ${skin ? `<path d="${c}" fill="none" stroke="#ecd3aa" stroke-opacity="${skin}" stroke-width="${f1(w * .16)}" stroke-linecap="round" stroke-dasharray="${f1(b * .5)} ${f1(b * .07)} ${f1(b * .7)} ${f1(b * .05)} ${b}"/>` : ''}`;
}
// coffee leaf, base at 0,0, tip at 0,-L
const leafEdge = (L, W) => [[0, 0], [W, -L * .16], [W * 1.08, -L * .62], [W * .1, -L * .94]];
const leafD = (L, W) => { const e = leafEdge(L, W).map(p => p.map(f1)); return `M0 0C${e[1]} ${e[2]} ${e[3]}Q${f1(W * .02)} ${f1(-L * .975)} 0 ${-L}Q${f1(-W * .02)} ${f1(-L * .975)} ${-e[3][0]} ${e[3][1]}C${-e[2][0]} ${e[2][1]} ${-e[1][0]} ${e[1][1]} 0 0Z`; };
const leafVeins = (L, W, n = 6) => `M0 0V${f1(-L * .96)}` + rep(n, i => { const [x, y] = bz(leafEdge(L, W), .16 + i * .135), y0 = Math.min(-L * .03, y + L * .12); return `M0 ${f1(y0)}Q${f1(x * .5)} ${f1(y0 * .2 + y * .8 + L * .02)} ${f1(x * .9)} ${f1(y)}M0 ${f1(y0)}Q${f1(-x * .5)} ${f1(y0 * .2 + y * .8 + L * .02)} ${f1(-x * .9)} ${f1(y)}`; });
const leaf = (L, W, dark) => `<path d="${leafD(L, W)}" fill="${dark ? 'url(#c3-leaf)' : '#f3eee8'}" ${dark ? '' : 'fill-opacity=".5"'} stroke="${dark ? '#7a5238' : '#262626'}" stroke-width="${dark ? 1.4 : 1.6}" stroke-linejoin="round"/><path d="${leafVeins(L, W)}" fill="none" stroke="${dark ? '#8a5f3c' : '#262626'}" stroke-width="1" stroke-opacity=".75" stroke-linecap="round"/>`;
const cherry = (x, y, r, ripe) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="url(#c3-${ripe ? 'ripe' : 'unripe'})"/><ellipse cx="${f1(x - r * .34)}" cy="${f1(y - r * .4)}" rx="${f1(r * .27)}" ry="${f1(r * .15)}" fill="#f3eee8" opacity=".55" transform="rotate(-32 ${f1(x - r * .34)} ${f1(y - r * .4)})"/><circle cx="${f1(x + r * .08)}" cy="${f1(y + r * .74)}" r="${f1(r * .12)}" fill="#2a170d" opacity=".7"/>`;

/* ---------- 3.1 Arabica und Robusta ---------- */
const SPEC = [
  { n: 'Arabica', a: 56, b: 94, cut: 's', rot: -16, shape: 'länglich · geschwungener Schnitt', leaf: [176, 33, 44, 244, 30], caf: [1, 1.5], rows: ['Komplexere Aromatik', 'Häufig fruchtiger', 'Ca. 1–1,5 % Koffein', 'Weniger Körper', 'Anspruchsvoller Anbau'] },
  { n: 'Robusta', a: 58, b: 72, cut: 'i', rot: 13, shape: 'rundlich · gerader Schnitt', leaf: [176, 52, 250, 246, -32], caf: [2, 2.7], rows: ['Kräftiger, erdiger', 'Häufig bitterer', 'Ca. 2–2,7 % Koffein', 'Häufig mehr Körper', 'Robuster Anbau'] }
];
const ROWL = ['Aromatik', 'Geschmack', 'Koffein', 'Körper', 'Anbau'];
const specSvg = (S, k) => {
  const r = S.rot * Math.PI / 180, cx = S.a * .02, cy = -S.b * .86, tx = 150 + cx * Math.cos(r) - cy * Math.sin(r), ty = 136 + cx * Math.sin(r) + cy * Math.cos(r);
  return `<div data-film data-bare data-dur="${7 + k}"><svg class="dg" viewBox="0 0 300 252" role="img" aria-label="${S.n}-Bohne von der flachen Seite">${D3}
  <clipPath id="c3-sb${k}"><path d="${beanD(S.a, S.b)}"/></clipPath>
  <g transform="translate(${S.leaf[2]} ${S.leaf[3]}) rotate(${S.leaf[4]})" opacity=".6"><g data-k="r:-1.6@0 1.6@${f1((7 + k) / 2)} -1.6@${7 + k}" style="transform-box:fill-box;transform-origin:50% 100%">${leaf(S.leaf[0], S.leaf[1], false)}</g></g>
  <ellipse cx="156" cy="${f1(140 + S.b * .93)}" rx="${f1(S.a * 1.1)}" ry="9" fill="url(#c3-drop)" data-k="sx:1@0 .9@${f1((7 + k) / 2)} 1@${7 + k}"/>
  <g data-k="y:0@0 -5@${f1((7 + k) / 2)} 0@${7 + k}"><g transform="translate(150 136) rotate(${S.rot})">${beanTop(S.a, S.b, S.cut, { outline: 'stroke="#2a170d" stroke-width="1.6"' })}
    <g clip-path="url(#c3-sb${k})"><rect x="${-S.a - 40}" y="${-S.b}" width="34" height="${S.b * 2}" fill="#f3eee8" opacity=".16" transform="skewX(-14)" data-k="x:0@1.5 ${S.a * 2 + 80}@3.4"/></g></g>
    <path class="ln" d="M150 30L${f1(tx)} ${f1(ty + 4)}" stroke-width="1.2"/><circle cx="${f1(tx)}" cy="${f1(ty + 4)}" r="2.6" fill="#262626"/></g>
  <text x="150" y="20" class="tm mid" style="font-size:13.5px">${S.shape}</text></svg></div>`;
};
const cafBar = S => `<svg class="c3-cafsvg" viewBox="0 0 250 32" role="img" aria-label="Koffeingehalt ${S.rows[2]}">
  <rect x="1" y="4" width="240" height="9" rx="4.5" fill="#262626" opacity=".14"/>
  <g class="c3-caf"><rect x="1" y="4" width="${S.caf[0] * 80}" height="9" rx="4.5" fill="#7a5238"/><rect x="${1 + S.caf[0] * 80 - 5}" y="4" width="${f1((S.caf[1] - S.caf[0]) * 80 + 5)}" height="9" rx="4.5" fill="#b8452a"/></g>
  ${rep(4, i => `<path d="M${1 + i * 80} 15v5" stroke="#262626" stroke-opacity=".5"/><text x="${1 + i * 80}" y="31" font-size="10.5" font-family="var(--mono)" fill="#45403b" ${i ? 'text-anchor="middle"' : ''}>${i}${i === 3 ? ' %' : ''}</text>`)}</svg>`;

/* ---------- 3.2 picking film ---------- */
const STEM = [[-14, 224], [110, 200], [270, 186], [424, 162]];
const NT = [.2, .43, .65, .86], OFF = [[-16, 26], [15, 29], [-1, 55]], CR = 15;
const RIPE_L = [1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0], RIPE_R = [0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1];
const BY = 394, BXL = 235, BXR = 725, BRX = 98, BRY = 19, BD = 56;
const SL_L = [[-36, -11], [0, -13], [36, -11], [-18, 2], [18, 2], [0, -27]];
const SL_R = [[-62, -9], [-31, -13], [0, -14], [31, -13], [62, -9], [-46, 1], [-15, 3], [15, 3], [46, 1], [-31, -27], [0, -30], [31, -27]];
const basketBack = cx => `<ellipse cx="${cx}" cy="${BY + BD}" rx="${BRX - 6}" ry="10" fill="#000" opacity=".55" filter="url(#f-soft)"/><ellipse cx="${cx}" cy="${BY}" rx="${BRX}" ry="${BRY}" fill="#22130b" stroke="#8a5f3c" stroke-width="4.5"/>`;
const basketFront = cx => `<path d="M${cx - BRX} ${BY}A${BRX} ${BRY} 0 0 0 ${cx + BRX} ${BY}L${cx + BRX - 20} ${BY + BD - 8}Q${cx + BRX - 22} ${BY + BD} ${cx + BRX - 32} ${BY + BD}L${cx - BRX + 32} ${BY + BD}Q${cx - BRX + 22} ${BY + BD} ${cx - BRX + 20} ${BY + BD - 8}Z" fill="url(#c3-basket)"/>
  ${rep(4, j => `<path d="M${f1(cx - BRX + 2 + j * 4.6)} ${BY + 12 + j * 11}A${f1(BRX - 2 - j * 4.6)} ${BRY - 2} 0 0 0 ${f1(cx + BRX - 2 - j * 4.6)} ${BY + 12 + j * 11}" fill="none" stroke="#d9a35f" stroke-opacity=".32" stroke-width="1.6"/>`)}
  ${rep(9, k => { const u = (k - 4) * 22; return `<path d="M${cx + u} ${f1(BY + BRY * Math.sqrt(1 - (u / BRX) ** 2))}L${f1(cx + u * .8)} ${BY + BD - 1}" stroke="#2a170d" stroke-opacity=".55" stroke-width="2.2"/>`; })}
  <path d="M${cx - BRX} ${BY}A${BRX} ${BRY} 0 0 0 ${cx + BRX} ${BY}" fill="none" stroke="#c99a6b" stroke-width="5" stroke-linecap="round"/>`;
function pickSvg() {
  const R = rng(5);
  const T_PICK = i => f2(2.9 + i * 1.02), SW0 = 10, SW1 = 11.35, XS = 944, XE = 552;
  const side = flip => {
    const X = x => flip ? 960 - x : x, P = STEM.map(([x, y]) => [X(x), y]), ripe = flip ? RIPE_R : RIPE_L, sg = flip ? -1 : 1;
    const nodes = NT.map(t => bz(P, t)), ch = [];
    nodes.forEach((n, k) => OFF.forEach((o, j) => ch.push({ x: f1(n[0] + sg * o[0]), y: f1(n[1] + o[1]), nx: f1(n[0]), ny: f1(n[1]), node: k, ripe: ripe[k * 3 + j] })));
    return { P, nodes, ch, sg };
  };
  const L = side(false), Rt = side(true);
  // left: ripe cherries are picked one by one · right: everything is stripped when the hand passes
  L.ch.filter(c => c.ripe).forEach((c, i) => { c.t = T_PICK(i); c.slot = SL_L[i]; c.bx = BXL; c.T = .6; c.rot = (i % 2 ? -1 : 1) * (150 + i * 30); });
  [...Rt.ch].sort((a, b) => b.x - a.x).forEach((c, i) => { c.t = f2(SW0 + (XS - c.x) / (XS - XE) * (SW1 - SW0) + R() * .05); c.slot = SL_R[i]; c.bx = BXR; c.T = f2(.58 + R() * .22); c.rot = Math.round((R() - .5) * 700); });
  const knocks = (S, k) => S.ch.filter(c => c.node === k && c.t).map(c => c.t).sort((a, b) => a - b);
  const stem = S => `<path d="M${S.P[0]}C${S.P[1]} ${S.P[2]} ${S.P[3]}" fill="none" stroke="#5b3720" stroke-width="10" stroke-linecap="round"/><path d="M${S.P[0]}C${S.P[1]} ${S.P[2]} ${S.P[3]}" fill="none" stroke="#9a6a44" stroke-opacity=".6" stroke-width="2.2" stroke-linecap="round" transform="translate(0 -2.5)"/>
    ${S.nodes.map(n => `<circle cx="${f1(n[0])}" cy="${f1(n[1])}" r="7" fill="#5b3720"/>`).join('')}`;
  const leaves = (S, strip) => S.nodes.map((n, k) => { const kn = knocks(S, k); return [[-46 + R() * 14, 80 + R() * 12, 21], [28 + R() * 16, 74 + R() * 14, 20]].concat(k % 2 ? [] : [[(k ? -1 : 1) * (118 + R() * 12), 60, 17]]).map(([a, len, w], j) => { const Lp = f1(4.6 + R() * 2.4), amp = (j ? 1 : -1) * (strip ? 13 : 5);
      const rs = strip ? osc(kn[0] - .05, amp, .24) : kn.map(t => osc(t + .1, amp, .17)).join(' ');
      return `<g transform="translate(${f1(n[0])} ${f1(n[1] - 2)}) rotate(${f1(S.sg * a)})"><g data-loop="${Lp}" data-off="${f1(R() * 4)}" data-k="r:-1.5@0 1.5@${f1(Lp / 2)} -1.5@${Lp}" style="transform-box:fill-box;transform-origin:50% 100%"><g ${rs ? `data-k="r:${rs}"` : ''} style="transform-box:fill-box;transform-origin:50% 100%">${leaf(f1(len), w, true)}</g></g></g>`; }).join(''); }).join('')
    + `<g transform="translate(${f1(S.P[3][0])} ${S.P[3][1]}) rotate(${S.sg * 64})"><g data-loop="5.2" data-k="r:-2@0 2@2.6 -2@5.2" style="transform-box:fill-box;transform-origin:50% 100%">${leaf(58, 15, true)}</g></g><g transform="translate(${f1(S.P[3][0])} ${S.P[3][1]}) rotate(${S.sg * 18})"><g data-loop="6.1" data-k="r:2@0 -2@3 2@6.1" style="transform-box:fill-box;transform-origin:50% 100%">${leaf(48, 13, true)}</g></g>`;
  const pedicel = c => `<path d="M${c.nx} ${c.ny}Q${f1((c.nx + c.x) / 2 + 3)} ${f1((c.ny + c.y) / 2 - 4)} ${c.x} ${f1(c.y - CR + 2)}" fill="none" stroke="#6b4429" stroke-width="3" stroke-linecap="round"/>`;
  const one = (S, c) => {
    const mates = S.ch.filter(m => m.node === c.node && m.t && (!c.t || m.t < c.t - .3)).map(m => m.t).sort((a, b) => a - b);
    const swing = mates.length && S === L ? `data-k="r:${mates.map((t, q) => osc(t + .12, q % 2 ? -7 : 7, .19)).join(' ')}"` : '';
    const body = `<g ${swing} style="transform-box:view-box;transform-origin:${c.nx}px ${c.ny}px">${pedicel(c).replace('/>', c.t ? ` data-k="o:1@${c.t} 0@${f2(c.t + .2)}"/>` : '/>')}`;
    if (!c.t) return body + cherry(c.x, c.y, CR, c.ripe) + '</g>';
    const t0 = f2(c.t + (S === L ? .12 : 0)), t1 = f2(t0 + c.T), dx = f1(c.bx + c.slot[0] - c.x), dy = f1(BY + c.slot[1] - c.y);
    return body + `<g data-k="x~:0@${t0} ${dx}@${t1};y>:0@${t0} ${dy}@${t1};r~:0@${t0} ${c.rot}@${t1}"><g data-k="y:0@${t1} -5@${f2(t1 + .09)} 0@${f2(t1 + .22)}">${cherry(c.x, c.y, CR, c.ripe)}</g></g></g>`;
  };
  const order = S => [...S.ch].sort((a, b) => (a.t ? SL_R.concat(SL_L).indexOf(a.slot) : -1) - (b.t ? SL_R.concat(SL_L).indexOf(b.slot) : -1));
  const rp = L.ch.filter(c => c.ripe), last = rp[rp.length - 1].t;
  const ringX = `${rp[0].x}@2.2 ` + rp.map(c => `${c.x}@${f2(c.t - .36)} ${c.x}@${f2(c.t + .12)}`).join(' ');
  const ringY = `${rp[0].y}@2.2 ` + rp.map(c => `${c.y}@${f2(c.t - .36)} ${c.y}@${f2(c.t + .12)}`).join(' ');
  const ringS = rp.map(c => `1.55@${f2(c.t - .36)} 1@${f2(c.t)}`).join(' ');
  const stemAt = x => { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; (bz(Rt.P, m)[0] > x ? lo = m : hi = m); } return f1(bz(Rt.P, lo)[1]); };
  return DEFS + `
  <path d="M480 92V418" stroke="#f3eee8" stroke-opacity=".16" stroke-width="1.5"/>
  <text x="462" y="64" class="tb end">Hand Picking</text><text x="498" y="64" class="tb">Strip Picking</text>
  <g>${cherry(452, 440, 8, 1)}<text x="468" y="446" class="ts">reif</text>${cherry(452, 465, 8, 0)}<text x="468" y="471" class="ts">unreif</text></g>
  ${stem(L)}${leaves(L, false)}${stem(Rt)}${leaves(Rt, true)}
  ${basketBack(BXL)}${basketBack(BXR)}
  ${order(L).map(c => one(L, c)).join('')}${order(Rt).map(c => one(Rt, c)).join('')}
  ${basketFront(BXL)}${basketFront(BXR)}
  <g data-k="o:0@2.1 1@2.5 1@${f2(last + .2)} 0@${f2(last + .7)}"><g data-k="x:${ringX};y:${ringY};s^:${ringS}"><circle r="24" fill="rgba(248,203,173,.08)" stroke="#f8cbad" stroke-width="2.5"/><circle r="31" fill="none" stroke="#f8cbad" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="3 7"/></g></g>
  <g data-k="o:0@${SW0 - .55} 1@${SW0 - .25} 1@${SW1} 0@${SW1 + .3}"><g data-k="x~:${XS}@${SW0} ${XE}@${SW1};y~:${stemAt(XS)}@${SW0} ${stemAt(XE)}@${SW1};sx^:1.5@${SW0 - .5} 1@${SW0 - .1}">
    <rect x="-20" y="-30" width="40" height="114" rx="20" fill="rgba(248,203,173,.1)" stroke="#f8cbad" stroke-width="2.5"/><path d="M-36 26h-22M-34 6h-14M-34 46h-14" stroke="#f8cbad" stroke-opacity=".5" stroke-width="2" stroke-linecap="round" transform="translate(74 0)"/></g></g>
  <g data-k="o:0@12.8 1@13.4;y<:8@12.8 0@13.5"><text x="${BXL}" y="479" class="ts mid" style="fill:#f3eee8">gleichmäßigere Reifegrade</text></g>
  <g data-k="o:0@13 1@13.6;y<:8@13 0@13.7"><text x="${BXR}" y="479" class="ts mid" style="fill:#f3eee8">unterschiedliche Reifegrade</text></g>`;
}
// basket seen from above, for the comparison cards
const topBasket = mixed => { const R = rng(mixed ? 9 : 4), pos = [[0, 0]].concat(rep(6, i => `${f1(26 * Math.cos(i * Math.PI / 3))},${f1(26 * Math.sin(i * Math.PI / 3))};`).split(';').filter(Boolean).map(s => s.split(',').map(Number)), rep(12, i => `${f1(51 * Math.cos(i * Math.PI / 6 + .26))},${f1(51 * Math.sin(i * Math.PI / 6 + .26))};`).split(';').filter(Boolean).map(s => s.split(',').map(Number)));
  return `<svg class="ic dg" viewBox="0 0 180 160" role="img" aria-label="${mixed ? 'Korb mit reifen und unreifen Kirschen' : 'Korb mit gleichmäßig reifen Kirschen'}">${D3}
  <ellipse cx="94" cy="88" rx="78" ry="70" fill="url(#c3-drop)"/><circle cx="90" cy="80" r="76" fill="#6b4429" stroke="#262626" stroke-width="2"/><circle cx="90" cy="80" r="70" fill="none" stroke="#c99a6b" stroke-width="6" stroke-dasharray="7 4.5"/><circle cx="90" cy="80" r="65" fill="#2a170d"/>
  ${pos.map(([x, y], i) => `<g class="c3-ch" style="--i:${i}">${cherry(f1(90 + x + (R() - .5) * 3), f1(80 + y + (R() - .5) * 3), 12.4, mixed ? R() > .46 : 1)}</g>`).join('')}</svg>`; };

/* ---------- 3.3 processing film ---------- */
const halves = R => { const h = R * .5, w = R * .4, g = R * .075; return [-1, 1].map(s => `M${f1(s * g)} ${f1(-h)}C${f1(s * (g + w * 1.3))} ${f1(-h)} ${f1(s * (g + w * 1.3))} ${f1(h)} ${f1(s * g)} ${f1(h)}Z`).join(''); };
const grooves = R => { const h = R * .5, w = R * .4, g = R * .075; return [-1, 1].map(s => `M${f1(s * g)} ${f1(s * h * .04)}q${f1(s * w * .5)} ${f1(s * h * .03)} ${f1(s * w * .46)} ${f1(-s * h * .2)}`).join(''); };
const cutParts = (R, big) => ({
  pulp: `<circle r="${R}" fill="url(#c3-ripe)"/><circle r="${f1(R * .975)}" fill="none" stroke="#8f3420" stroke-width="${f1(R * .05)}"/>${big ? `<circle r="${f1(R * .82)}" fill="none" stroke="#e3704f" stroke-opacity=".3" stroke-width="${f1(R * .05)}"/>${rep(40, i => { const a = i * Math.PI / 20; return `<path d="M${f1(Math.cos(a) * R * .72)} ${f1(Math.sin(a) * R * .72)}L${f1(Math.cos(a) * R * .92)} ${f1(Math.sin(a) * R * .92)}" stroke="#8f3420" stroke-opacity=".18" stroke-width="1.2"/>`; })}<path d="M2 ${-R + 3}q6 -16 -4 -30" fill="none" stroke="#6b4429" stroke-width="8" stroke-linecap="round"/>` : ''}`,
  half: s => `<path d="M0 ${-R}A${R} ${R} 0 0 ${s > 0 ? 1 : 0} 0 ${R}Z" fill="url(#c3-ripe)"/>`,
  muc: `<circle r="${f1(R * .67)}" fill="#d9a35f"/><circle r="${f1(R * .67)}" fill="url(#c3-hi)"/>${big ? `<circle r="${f1(R * .61)}" fill="none" stroke="#f3eee8" stroke-opacity=".3" stroke-width="2" stroke-dasharray="26 40 60 34"/>` : ''}`,
  res: o => `<path d="${halves(R)}" fill="none" stroke="#d9a35f" stroke-width="${f1(R * .3)}" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="${f1(R * .5)} ${f1(R * .34)} ${f1(R * .22)} ${f1(R * .4)}" ${o}/>`,
  parch: `<path d="${halves(R)}" fill="#f3eee8" stroke="#f3eee8" stroke-width="${f1(R * .1)}" stroke-linejoin="round"/>`,
  beans: `<path d="${halves(R)}" fill="url(#c3-raw)" stroke="#b98a4c" stroke-width="${big ? 1.5 : .8}"/><path d="${grooves(R)}" fill="none" stroke="#b98a4c" stroke-width="${f1(Math.max(1, R * .026))}" stroke-linecap="round"/>`
});
const LANES = [{ n: 'Natural', y: 188, pulp: 0, wash: 0 }, { n: 'Washed', y: 302, pulp: 1, wash: 1 }, { n: 'Honey', y: 416, pulp: 1, wash: 0 }];
const PX = [172, 345, 520, 695, 880], TR = 32;
function procSvg() {
  const R = rng(17), A = cutParts(138, true), ax = 300, ay = 296;
  const lab = (i, txt, y, tx, ty) => { const t = f2(1.5 + i * .55); return `<g data-k="o:0@${t} 1@${f2(t + .35)}"><path class="lead-l draw" pathLength="1" d="M508 ${y - 7}L${tx} ${ty}" style="stroke-dasharray:1" data-k="d:1@${t} 0@${f2(t + .5)}"/><circle cx="${tx}" cy="${ty}" r="4.5" fill="#f8cbad" data-k="s^:0@${f2(t + .3)} 1@${f2(t + .7)}"/><g data-k="x<:14@${t} 0@${f2(t + .5)}"><text x="518" y="${y}" class="t">${txt}</text></g></g>`; };
  const tile = (x, y, t0, t1) => `<rect x="${x - 68}" y="${y - 52}" width="136" height="104" rx="15" fill="rgba(243,238,232,.045)" stroke="#f3eee8" stroke-opacity=".2"/><rect x="${x - 68}" y="${y - 52}" width="136" height="104" rx="15" fill="none" stroke="#f8cbad" stroke-width="1.5" data-k="o:0@${t0} .9@${f2(t0 + .4)} .9@${t1} 0@${f2(t1 + .5)}"/>`;
  const lane = (Ln, li) => {
    const d = li * .13, T = t => f2(t + d), y = Ln.y, P = cutParts(TR, false), X = i => PX[i] - PX[0];
    const move = `0@${T(5.5)} ${X(1)}@${T(6.7)} ${X(1)}@${T(8.7)} ${X(2)}@${T(9.9)} ${X(2)}@${T(11.9)} ${X(3)}@${T(13.1)} ${X(3)}@${T(16.4)} ${X(4)}@${T(17.5)}`;
    const roll = `0@${T(5.5)} 360@${T(6.7)} 360@${T(8.7)} 720@${T(9.9)} 720@${T(11.9)} 1080@${T(13.1)} 1080@${T(16.4)} 1440@${T(17.5)}`;
    const burst = `data-k="s<:1@${T(17.6)} 1.7@${T(18.05)};o:1@${T(17.6)} 0@${T(18.05)}"`;
    let st = '', tok = '';
    if (Ln.pulp) { // pulper: two rollers squeeze the beans out of the fruit
      st += tile(PX[1], y, T(6.6), T(8.1)) + [-1, 1].map(s => `<g data-loop="1.6" data-k="r~:0@0 ${s * 360}@1.6"><circle cx="${PX[1]}" cy="${y + s * 42}" r="8.5" fill="url(#g-steel-v)" stroke="#2b2420" stroke-width="1.5"/><path d="M${PX[1] - 8.5} ${y + s * 42}h17M${PX[1]} ${y + s * 42 - 8.5}v17" stroke="#2b2420" stroke-width="1.6"/><circle cx="${PX[1]}" cy="${y + s * 42}" r="2.4" fill="#2b2420"/></g>`).join('');
      tok += [-1, 1].map(s => `<g data-k="x<:0@${T(7)} ${s * 38}@${T(7.6)};y>:0@${T(7.05)} 74@${T(7.75)};r~:0@${T(7)} ${s * 110}@${T(7.75)};o:1@${T(7.45)} 0@${T(7.78)}">${P.half(s)}</g>`).join('')
        + rep(4, i => `<circle cx="${[-14, 10, -4, 18][i]}" cy="26" r="${2 + i % 2}" fill="#b8452a" data-k="y>:0@${T(7.05 + i * .07)} ${46 + i * 5}@${T(7.6 + i * .07)};o:0@${T(7 + i * .07)} 1@${T(7.08 + i * .07)} 1@${T(7.45 + i * .07)} 0@${T(7.6 + i * .07)}"/>`);
    } else tok += `<g ${burst}>${P.pulp}<circle r="${TR}" fill="#3a2114" data-k="o:0@${T(13.2)} .8@${T(16.2)}"/><path d="M-19 -12q9 6 3 17M12 -19q-8 10 3 18M-5 13q10 3 15 12" fill="none" stroke="#1d110a" stroke-width="1.8" stroke-linecap="round" data-k="o:0@${T(14.4)} .8@${T(16.2)}"/></g>`;
    if (Ln.wash) { // fermentation tank and washing channel: the mucilage dissolves
      st += tile(PX[2], y, T(9.8), T(11.7)) + `<clipPath id="c3-tk${li}"><rect x="${PX[2] - 60}" y="${y - 45}" width="120" height="90" rx="10"/></clipPath><g clip-path="url(#c3-tk${li})"><rect x="${PX[2] - 60}" y="${y - 16}" width="120" height="64" fill="#7fb4dc" opacity=".3"/><g opacity=".3">${wave(PX[2] - 60, y - 16, 120, '#7fb4dc', 3, 2.1)}</g>
        <g data-k="o:0@${T(10)} 1@${T(10.3)} 1@${T(11.4)} 0@${T(11.8)}">${rep(8, i => { const Lp = f1(.9 + R() * .7); return `<circle cx="${f1(PX[2] - 40 + R() * 80)}" cy="${y + 40}" r="${f1(1.6 + R() * 2.4)}" fill="none" stroke="#f3eee8" stroke-width="1.2" data-loop="${Lp}" data-off="${f1(R() * 2)}" data-k="y<:0@0 ${-f1(44 + R() * 10)}@${Lp};x:0@0 ${f1(R() * 8 - 4)}@${f1(Lp / 2)} 0@${Lp};o:0@0 .9@${f1(Lp * .2)} 0@${Lp}"/>`; })}</g></g>
        <g data-k="o:0@${T(9.95)} 1@${T(10.05)} 1@${T(10.7)} 0@${T(11)}">${splash(PX[2], y - 16, '#cfe3f2')}</g>`;
      tok += `<g data-k="o:1@${T(10.2)} 0@${T(11.5)}">${P.muc}</g><circle r="${TR}" fill="#d9a35f" filter="url(#f-soft)" data-k="o:0@${T(10.2)} .5@${T(10.7)} 0@${T(11.6)};s<:.8@${T(10.2)} 2@${T(11.6)}"/>`;
    } else if (Ln.pulp) tok += `<g data-k="o:1@${T(10.1)} 0@${T(11.3)}">${P.muc}</g>${[[-14, 1.1], [11, 1.45]].map(([x, o]) => `<ellipse cx="${x}" cy="24" rx="3.4" ry="5" fill="#d9a35f" data-k="y>:0@${T(10 + o * .5)} 50@${T(10.5 + o * .5)};sy:.6@${T(10 + o * .5)} 1.5@${T(10.4 + o * .5)};o:0@${T(9.9 + o * .5)} 1@${T(10 + o * .5)} 1@${T(10.35 + o * .5)} 0@${T(10.5 + o * .5)}"/>`).join('')}`;
    else tok += P.muc;
    if (Ln.pulp && !Ln.wash) tok += `<g ${burst}>${P.res(`data-k="stroke:#d9a35f@${T(13.2)} #9a6a44@${T(16.2)}"`)}</g>`;
    // drying bed with warm air
    st += tile(PX[3], y, T(13), T(16.3)) + `<ellipse cx="${PX[3]}" cy="${y + 36}" rx="50" ry="13" fill="#e3704f" filter="url(#f-glow)" data-k="o:0@${T(12.9)} .5@${T(13.6)} .32@${T(14.6)} .5@${T(15.5)} 0@${T(16.5)}"/>
      <path d="M${PX[3] - 54} ${y + 40}H${PX[3] + 54}" stroke="#c99a6b" stroke-width="3" stroke-linecap="round"/><path d="M${PX[3] - 50} ${y + 40}H${PX[3] + 50}" stroke="#2a170d" stroke-width="3" stroke-dasharray="2 5"/><path d="M${PX[3] - 46} ${y + 42}v7M${PX[3] + 46} ${y + 42}v7" stroke="#c99a6b" stroke-width="3" stroke-linecap="round"/>`;
    return `<path d="M${PX[0]} ${y}H${PX[4] - 50}" stroke="#f3eee8" stroke-opacity=".22" stroke-width="1.5" stroke-dasharray="2 8" stroke-linecap="round"/>${st}
      <text x="30" y="${y + 8}" class="t">${Ln.n}</text>
      <g transform="translate(${PX[0]} ${y})"><g data-k="x:${move};y:0@${T(9.9)} ${Ln.wash ? 10 : 0}@${T(10.25)} ${Ln.wash ? 10 : 0}@${T(11.5)} 0@${T(11.85)}"><ellipse cx="0" cy="${TR + 5}" rx="${TR - 4}" ry="4.5" fill="#000" opacity=".4" filter="url(#f-soft)"/><g data-k="r:${roll};s^:0@${T(5)} 1@${T(5.45)}"><g data-k="s:1@${T(13.2)} .9@${T(16.2)}">
        ${tok}<g ${burst}>${P.parch}</g><g data-k="s^:1@${T(17.6)} 1.4@${T(18.2)}">${P.beans}</g></g></g></g></g>
      <g transform="scale(.55)" style="transform-box:view-box;transform-origin:${PX[3]}px ${y - 30}px">${steam(PX[3], y - 30, 2, `data-k="o:0@${T(13.1)} 1@${T(13.8)} 1@${T(16)} 0@${T(16.5)}"`)}</g>`;
  };
  return DEFS + `
  <g data-k="o:0@.4 1@.9 1@4.6 0@5.1;s:1@4.5 .6@5.1">
    <ellipse cx="${ax + 6}" cy="${ay + 142}" rx="120" ry="12" fill="#000" opacity=".5" filter="url(#f-soft)"/>
    <g transform="translate(${ax} ${ay})"><g data-k="s^:.86@.4 1@1.2">${A.pulp}<g data-k="o:0@.9 1@1.5">${A.muc}${A.parch}${A.beans}</g>
      <g data-k="o:1@.9 0@1.5"><circle r="138" fill="url(#c3-ripe)"/><ellipse cx="-52" cy="-60" rx="34" ry="18" fill="#f3eee8" opacity=".4" transform="rotate(-34 -52 -60)"/></g></g></g>
    ${lab(0, 'Schale und Fruchtfleisch', 200, 401, 225)}${lab(1, 'Schleimschicht', 266, 383, 276)}${lab(2, 'Pergamenthaut', 332, 369, 304)}${lab(3, 'Bohne', 398, 336, 330)}
    <text x="${ax}" y="472" class="tl mid">Kaffeekirsche im Querschnitt</text>
  </g>
  <g data-k="o:0@4.9 1@5.4">
    ${['Kirsche', 'Entpulpen', '', 'Trocknen', 'Rohkaffee'].map((h, i) => h ? `<text x="${PX[i]}" y="120" class="ts mid">${h}</text>` : `<text x="${PX[i]}" y="99" class="ts mid">Fermentieren,</text><text x="${PX[i]}" y="120" class="ts mid">waschen</text>`).join('')}
    ${LANES.map(lane).join('')}
  </g>`;
}
// what is still on the bean when it dries (profile cards)
const dryIcon = (k) => { const P = cutParts(40, false); return `<div data-film data-bare data-dur="${6 + k}"><svg class="ic dg" viewBox="0 0 200 118" role="img" aria-label="${LANES[k].n}: Zustand bei der Trocknung">${defs}${D3}
  <ellipse cx="100" cy="100" rx="60" ry="12" fill="#b8452a" opacity=".3" filter="url(#f-soft)" data-k="o:.2@0 .42@${(6 + k) / 2} .2@${6 + k}"/>
  <path d="M30 100H170" stroke="#262626" stroke-width="3" stroke-linecap="round"/><path d="M36 100H164" stroke="#f3eee8" stroke-width="3" stroke-dasharray="2 6"/><path d="M42 102v10M158 102v10" stroke="#262626" stroke-width="3" stroke-linecap="round"/>
  ${rep(3, i => `<path d="M${64 + i * 36} 14q-7 -6 0 -12" fill="none" stroke="#262626" stroke-opacity=".5" stroke-width="2" stroke-linecap="round" data-loop="${f1(2.2 + i * .5)}" data-off="${i * .7}" data-k="y~:8@0 -6@${f1(2.2 + i * .5)};o:0@0 .8@.7 0@${f1(2.2 + i * .5)}"/>`)}
  <g transform="translate(100 58)">${k === 0 ? P.pulp + `<circle r="40" fill="#3a2114" opacity=".5"/>` : ''}${k === 0 ? P.muc : ''}${k === 2 ? P.res('') : ''}${P.parch}${P.beans}</g></svg></div>`; };
const layerBar = keep => `<div class="c3-layers" aria-hidden="true">${['Fruchtfleisch', 'Schleimschicht', 'Pergamenthaut', 'Bohne'].map((n, i) => `<span class="${keep[i] === 1 ? 'on' : keep[i] ? 'half' : 'off'}">${n}</span>`).join('')}</div>`;

/* ---------- 3.4 roasting film ---------- */
const RKEYS = [[0, '#dccaa6'], [3, '#d9b77c'], [6.5, '#c0884f'], [10, '#94623a'], [13.5, '#6b4429'], [16.5, '#4a2c1a'], [19.4, '#33200f']];
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const colAt = t => { let a = RKEYS[0], b = RKEYS[RKEYS.length - 1]; if (t <= a[0]) return a[1]; if (t >= b[0]) return b[1]; for (let i = 0; i < RKEYS.length - 1; i++) if (t < RKEYS[i + 1][0]) { a = RKEYS[i]; b = RKEYS[i + 1]; break; } let u = (t - a[0]) / (b[0] - a[0]); u = u * u * (3 - 2 * u); const A = hexRgb(a[1]), B = hexRgb(b[1]); return '#' + A.map((c, j) => Math.round(c + (B[j] - c) * u).toString(16).padStart(2, '0')).join(''); };
function roastSvg() {
  const R = rng(31), C = [[426, 398], [516, 246], [700, 182], [902, 150]], T0 = 1.4, T1 = 19.4;
  const pts = Array.from({ length: 241 }, (_, i) => bz(C, i / 240)), len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = f => { const s = f * len[240]; let i = 1; while (i < 240 && len[i] < s) i++; const u = (s - len[i - 1]) / (len[i] - len[i - 1] || 1); return [f1(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u), f1(pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u)]; };
  const fr = t => (t - T0) / (T1 - T0), ks = Array.from({ length: 25 }, (_, i) => T0 + (T1 - T0) * i / 24);
  const name = (txt, t0, t1) => `<g data-k="o:0@${t0} 1@${f2(t0 + .5)} 1@${f2(t1 - .3)} 0@${f2(t1 + .1)};y<:10@${t0} 0@${f2(t0 + .6)}"><text x="190" y="452" class="t mid">${txt}</text></g>`;
  const MK = [0, 3, 6.5, 10, 13.5, 16.5, 20.4], NM = ['Rohkaffee', 'Maillard-Reaktion', 'Karamellisierung', 'Neue Aromastoffe', 'Abbau organischer Säuren', 'Veränderung der Zellstruktur'];
  return DEFS + `
  <!-- heat under the bean -->
  <ellipse cx="190" cy="392" rx="96" ry="26" fill="#e3704f" filter="url(#f-glow)" data-k="o:0@.5 .34@2.5 .6@19"/><g data-loop="1.7" data-k="o:.5@0 1@.8 .5@1.7"><ellipse cx="190" cy="398" rx="70" ry="12" fill="#e3704f" opacity=".5" filter="url(#f-soft)" data-k="o:0@.5 .5@2.5 .8@19"/></g>
  ${steam(190, 200, 3, 'data-k="o:0@8 .6@11 1@16"')}
  <g data-k="o:0@9.8 1@10.8">${rep(11, i => { const Lp = f1(2 + R() * 1.6), x = f1(140 + R() * 100); return `<circle cx="${x}" cy="${f1(214 + R() * 30)}" r="${f1(2 + R() * 2.4)}" fill="${i % 3 ? '#f8cbad' : '#d9a35f'}" data-loop="${Lp}" data-off="${f1(R() * 3)}" data-k="y<:0@0 ${-f1(70 + R() * 50)}@${Lp};x:0@0 ${f1(R() * 30 - 15)}@${f1(Lp * .5)} ${f1(R() * 30 - 15)}@${Lp};o:0@0 .9@${f1(Lp * .25)} 0@${Lp}"/>`; })}</g>
  <!-- the bean: it tumbles gently, darkens and swells -->
  <ellipse cx="194" cy="398" rx="62" ry="9" fill="#000" opacity=".5" filter="url(#f-soft)"/>
  <g transform="translate(190 292)"><g data-loop="4.4" data-k="r:-18@0 -11@2.2 -18@4.4;y:0@0 -4@1.1 0@2.2 -3@3.3 0@4.4"><g data-k="s:.88@.5 .94@6 1@12 1.02@16.4 1.1@17.3 1.08@17.9 1.14@18.6"><g data-k="s^:1@16.6 1.03@16.9">
    ${beanTop(63, 93, 's', { baseAttr: `data-k="fill:${RKEYS.map(([t, c]) => c + '@' + t).join(' ')}"`, skin: .5 })}
    <path d="M-36 -30l11 9l-6 12l13 8M27 16l-9 11l8 11l-11 9M20 -52l9 11l-4 11" fill="none" stroke="#120f0d" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" data-k="o:0@16.7 .85@18.2"/>
    <ellipse cx="-22" cy="-40" rx="18" ry="8" fill="#f3eee8" transform="rotate(-38 -22 -40)" data-k="o:0@12 .3@19"/></g></g></g></g>
  <!-- two things that go down while the bean gets darker -->
  ${[['Säure', 326, '1@5 .3@19', 13.5], ['Dichte', 358, '1@2.5 .5@19', 16.5]].map(([n, y, k, t]) => `<g data-k="o:.45@${t - .4} 1@${t + .3}"><text x="700" y="${y + 6}" class="tl end">${n}</text><rect x="716" y="${y - 4}" width="180" height="8" rx="4" fill="#f3eee8" opacity=".16"/><rect x="716" y="${y - 4}" width="180" height="8" rx="4" fill="#f8cbad" data-k="sx:${k}" style="transform-origin:0 50%"/></g>`).join('')}
  ${NM.map((n, i) => name(n, i ? MK[i] : .5, MK[i + 1])).join('')}
  <!-- the roast curve -->
  <path d="M410 124V412H918" fill="none" stroke="#f3eee8" stroke-opacity=".5" stroke-width="2"/>
  <text x="424" y="136" class="tl">Temperatur</text><text x="424" y="158" class="ts" style="font-size:15px">schematisch</text>
  <rect x="426" y="420" width="478" height="7" rx="3.5" fill="url(#c3-ramp)"/><text x="426" y="452" class="tl">roh</text><text x="640" y="452" class="tl mid">hell</text><text x="904" y="452" class="tl end">dunkel</text>
  <path d="M${C[0]}C${C[1]} ${C[2]} ${C[3]}" fill="none" stroke="#f3eee8" stroke-opacity=".14" stroke-width="2" stroke-dasharray="3 7"/>
  <path class="draw" pathLength="1" d="M${C[0]}C${C[1]} ${C[2]} ${C[3]}" fill="none" stroke="#f3eee8" stroke-width="3.5" stroke-linecap="round" data-k="d~:1@${T0} 0@${T1}"/>
  ${MK.slice(1, 6).map((t, i) => { const [x, y] = at(fr(t)); return `<g data-k="o:0@${t - .1} 1@${t + .2}"><path d="M${x} 406v12" stroke="#f3eee8" stroke-opacity=".6" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="#17120f" stroke="#f3eee8" stroke-width="2" data-k="s^:0@${t - .1} 1@${t + .4}"/><text x="${f1(x + 10)}" y="${f1(y + 26)}" class="tm mid" style="font-size:15px">0${i + 2}</text></g>`; }).join('')}
  ${[4.6, 8.2, 11.7, 15, 18.7].map(t => { const [x, y] = at(fr(t)); return `<g transform="translate(${x} ${f1(y - 24)}) rotate(24)"><g data-k="s^:0@${t} 1@${f2(t + .6)};o:0@${t} 1@${f2(t + .2)}">${beanTop(11, 16, 's', { base: colAt(t), skin: 0 })}</g></g>`; }).join('')}
  <g data-k="x~:${ks.map(t => at(fr(t))[0] + '@' + f2(t)).join(' ')};y~:${ks.map(t => at(fr(t))[1] + '@' + f2(t)).join(' ')};o:0@${T0 - .3} 1@${T0 + .2}"><circle r="15" fill="#e3704f" opacity=".7" filter="url(#f-soft)"/><circle r="6.5" fill="#f8cbad"/></g>`;
}

/* ---------- 3.4 roast slider (light scene) ---------- */
const ROAST = [['Light Roast', 'Fruchtig', 'Häufig höhere Säure', 'Geringere Porosität', 'Höhere Dichte'], ['Medium Roast', 'Ausgewogen', 'Moderate Säure', 'Mittlere Porosität', 'Mittlere Dichte'], ['Dark Roast', 'Röstaromen', 'Häufig geringere Säure', 'Höhere Porosität', 'Geringere Dichte']];
function lensSvg() {
  const R = rng(12), P = []; let guard = 0;
  while (P.length < 46 && guard++ < 4000) { const a = R() * 6.283, d = Math.sqrt(R()) * 96, x = Math.cos(a) * d, y = Math.sin(a) * d, b = 5 + R() * 9; if (P.every(p => Math.hypot(p.x - x, p.y - y) > p.b + b + 2)) P.push({ x: f1(x), y: f1(y), a: f1(.9 + R() * 1.5), b: f1(b), t: P.length < 14 ? 0 : f2(.08 + R() * .6) }); }
  return `<svg class="dg c3-lens" viewBox="0 0 640 292" role="img" aria-label="Bohne und Zellstruktur je nach Röstgrad">${D3}
  <clipPath id="c3-lc"><circle cx="462" cy="138" r="116"/></clipPath>
  <ellipse cx="170" cy="268" rx="84" ry="10" fill="url(#c3-drop)"/>
  <path d="M214 96L424 30M214 198L424 246" stroke="#262626" stroke-opacity=".55" stroke-width="1.5" stroke-dasharray="3 6" fill="none"/>
  <g id="c3-rbean" transform="translate(166 146) rotate(-16)">${beanTop(74, 108, 's', { baseAttr: 'class="c3-rc"', outline: 'stroke="#2a170d" stroke-width="1.6"' })}<ellipse cx="-26" cy="-46" rx="22" ry="9" fill="#f3eee8" transform="rotate(-38 -26 -46)" id="c3-oil" opacity="0"/></g>
  <circle cx="210" cy="148" r="24" fill="none" stroke="#f3eee8" stroke-width="2.5"/><circle cx="210" cy="148" r="24" fill="none" stroke="#262626" stroke-width="1.2"/>
  <g clip-path="url(#c3-lc)"><rect x="340" y="16" width="244" height="244" class="c3-rc" fill="#855634"/><rect x="340" y="16" width="244" height="244" fill="url(#c3-hex)" opacity=".5"/>
    <g transform="translate(462 138)">${P.map(p => `<circle class="c3-pore" cx="${p.x}" cy="${p.y}" r="${p.a}" data-a="${p.a}" data-b="${p.b}" data-t="${p.t}" fill="#2a170d" stroke="#f3eee8" stroke-opacity=".28" stroke-width="1"/>`).join('')}
      <path id="c3-cracks" d="M-116 -30l34 12l18 -14l30 20l22 -6M30 116l-8 -36l16 -22l-10 -30M116 -64l-30 10l-16 26l-26 4" fill="none" stroke="#120f0d" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" opacity="0"/></g>
    <circle cx="462" cy="138" r="116" fill="url(#c3-sh)" opacity=".7"/><ellipse cx="420" cy="80" rx="60" ry="26" fill="#f3eee8" opacity=".12" transform="rotate(-30 420 80)"/></g>
  <circle cx="462" cy="138" r="116" fill="none" stroke="#262626" stroke-width="3"/>
  <text x="462" y="286" class="tl mid">Zellstruktur, vergrößert</text></svg>`;
}

/* ---------- 3.5 light vs dark particle film ---------- */
function partSvg() {
  const R = rng(44), W0 = 5.6;
  const blob = (cx, cy, r, n) => Array.from({ length: n }, (_, i) => { const a = (i + (R() - .5) * .55) / n * 6.283, q = r * (.83 + R() * .22); return [f1(cx + Math.cos(a) * q), f1(cy + Math.sin(a) * q * .95)]; });
  const inside = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > y) !== (P[j][1] > y) && x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
  const edgeDist = (P, x, y) => { let m = 1e9; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const ax = P[j][0], ay = P[j][1], bx = P[i][0] - ax, by = P[i][1] - ay, u = Math.max(0, Math.min(1, ((x - ax) * bx + (y - ay) * by) / (bx * bx + by * by))); m = Math.min(m, Math.hypot(x - ax - bx * u, y - ay - by * u)); } return m; };
  const part = (id, cx, cy, dark) => {
    const P = blob(cx, cy, 122, 13), d = 'M' + P.map(p => p.join(' ')).join('L') + 'Z', V = []; let g = 0;
    const depth = dark ? 126 : 24, tEnd = dark ? 11.4 : 16.6;                    // how deep and how fast the water gets in
    const tHit = dist => { const u = Math.min(1, dist / depth); return f2(W0 + (1 - Math.sqrt(1 - u)) * (tEnd - W0)); };   // inverse of the "<" easing
    while (V.length < (dark ? 46 : 12) && g++ < 6000) { const x = cx - 125 + R() * 250, y = cy - 125 + R() * 250, r = dark ? 4.5 + R() * 9.5 : 1.8 + R() * 1.7; if (!inside(P, x, y)) continue; const e = edgeDist(P, x, y); if (e < r + 5 || V.some(v => Math.hypot(v.x - x, v.y - y) < v.r + r + 3)) continue; V.push({ x: f1(x), y: f1(y), r: f1(r), e }); }
    const cracks = dark ? [1, 4, 6, 9, 11].map(i => { const a = P[i], b = P[(i + 1) % P.length], s = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; let p = s, q = `M${f1(s[0])} ${f1(s[1])}`; for (let k = 0; k < 4; k++) { const dx = cx - p[0], dy = cy - p[1], l = Math.hypot(dx, dy), st = 15 + R() * 10, j = (R() - .5) * 26; p = [p[0] + dx / l * st - dy / l * j, p[1] + dy / l * st + dx / l * j]; q += `L${f1(p[0])} ${f1(p[1])}`; } return q; }) : [];
    const out = Array.from({ length: dark ? 24 : 6 }, (_, k) => { const i = Math.floor(R() * P.length), a = P[i], b = P[(i + 1) % P.length], u = R(), x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u, l = Math.hypot(x - cx, y - cy), Lp = f1(2.4 + R() * 1.8), far = 34 + R() * 30;
      return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(2 + R() * 2)}" fill="${k % 3 ? '#f8cbad' : '#d9a35f'}" data-loop="${Lp}" data-off="${f1(R() * 4)}" data-k="x<:0@0 ${f1((x - cx) / l * far)}@${Lp};y~:0@0 ${f1((y - cy) / l * far + 26)}@${Lp};o:0@0 .95@${f1(Lp * .2)} .8@${f1(Lp * .6)} 0@${Lp}"/>`; }).join('');
    return `<clipPath id="c3-p${id}"><path d="${d}"/></clipPath>
    <ellipse cx="${cx}" cy="${cy + 128}" rx="100" ry="10" fill="#000" opacity=".45" filter="url(#f-soft)"/>
    <g data-loop="${dark ? 5.2 : 6.1}" data-k="y:0@0 ${dark ? -4 : -3}@${dark ? 2.6 : 3.05} 0@${dark ? 5.2 : 6.1}">
      <path d="${d}" fill="${dark ? '#4a2c1a' : '#b5855a'}" stroke-linejoin="round"/><path d="${d}" fill="url(#c3-hex)" opacity="${dark ? .5 : .42}"/>
      ${V.map(v => `<circle cx="${v.x}" cy="${v.y}" r="${v.r}" fill="${dark ? '#1d110a' : '#6b4429'}" stroke="${dark ? '#8a5f3c' : '#7a5238'}" stroke-opacity=".6" ${v.e < depth ? `data-k="fill:${dark ? '#1d110a' : '#6b4429'}@${tHit(v.e)} #6a9fc6@${f2(tHit(v.e) + .5)}"` : ''}/>`).join('')}
      ${cracks.map(q => `<path d="${q}" fill="none" stroke="#120f0d" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path class="draw" pathLength="1" d="${q}" fill="none" stroke="#7fb4dc" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" data-k="d<:1@${W0} 0@${f2(W0 + 1.5)}"/>`).join('')}
      <g clip-path="url(#c3-p${id})"><path d="${d}" fill="none" stroke="#7fb4dc" stroke-opacity=".5" stroke-linejoin="round" data-k="@stroke-width<:0@${W0} ${depth * 2}@${tEnd}"/><path d="${d}" fill="url(#c3-sh)" opacity=".8"/></g>
      <path d="${d}" fill="none" stroke="${dark ? '#8a5f3c' : '#d9a35f'}" stroke-width="2" stroke-linejoin="round"/>
      ${dark ? `<g data-k="o:0@${W0 + .2} 1@${W0 + .8} 1@9.6 0@10.6">${rep(6, i => { const v = V[i * 5 % V.length], Lp = f1(1.1 + R() * .8); return `<circle cx="${v.x}" cy="${v.y}" r="${f1(1.8 + R() * 1.8)}" fill="none" stroke="#f3eee8" stroke-width="1.2" data-loop="${Lp}" data-off="${f1(R() * 2)}" data-k="y<:0@0 ${-f1(24 + R() * 18)}@${Lp};o:0@0 .9@${f1(Lp * .25)} 0@${Lp}"/>`; })}</g>` : ''}
    </g>
    <g data-k="o:0@10 1@11">${out}</g>`;
  };
  const cap = (cx, t1, t2, bar) => `<text x="${cx}" y="436" class="t mid">${t1}</text><text x="${cx}" y="461" class="ts mid">${t2}</text>
    <g data-k="o:0@9.8 1@10.5"><text x="${cx - 96}" y="407" class="tl end" style="font-size:13px">gelöst</text><rect x="${cx - 86}" y="397" width="172" height="8" rx="4" fill="#f3eee8" opacity=".16"/><rect x="${cx - 86}" y="397" width="172" height="8" rx="4" fill="#f8cbad" data-k="sx<:0@10 ${bar}@16.4" style="transform-origin:0 50%"/></g>`;
  return DEFS + `
  <!-- water arrives from above and flows past both particles -->
  <rect x="0" y="0" width="960" height="540" fill="#7fb4dc" data-k="o:0@3.2 .15@5"/>
  <g data-k="o:0@3.2 1@4">${rep(18, i => { const x = f1(24 + i * 54 + R() * 20), Lp = f1(2.6 + R() * 2.2), h = f1(30 + R() * 50); return `<path d="M${x} -90v${h}" stroke="#cfe3f2" stroke-opacity=".3" stroke-width="2.5" stroke-linecap="round" data-loop="${Lp}" data-off="${f1(R() * 5)}" data-k="y~:0@0 660@${Lp};x:0@0 ${f1(R() * 14 - 7)}@${f1(Lp / 2)} 0@${Lp}"/>`; })}</g>
  ${part('a', 250, 256, false)}${part('b', 710, 256, true)}
  <g data-k="o:0@6.2 1@6.9;y<:8@6.2 0@6.9"><text x="250" y="116" class="tm mid">Wasser dringt langsam ein</text></g>
  <g data-k="o:0@6.5 1@7.2;y<:8@6.5 0@7.2"><text x="710" y="116" class="tm mid">schnell und tief</text></g>
  ${cap(250, 'Helle Röstung', 'dicht, wenige kleine Poren', .3)}${cap(710, 'Dunkle Röstung', 'porös und rissig', .92)}`;
}
// small living pictures for the three cards of 3.5: the beans, the problem, the answer
const adjSvg = k => {
  const R = rng(60 + k), dur = 6 + k;
  const streaks = n => rep(n, i => { const x = f1(14 + i * (212 / (n - 1)) + R() * 8 - 4), Lp = f1(2.2 + R() * 1.6); return `<path d="M${x} -34v${f1(14 + R() * 18)}" stroke="#2f6f9f" stroke-opacity=".45" stroke-width="2" stroke-linecap="round" data-loop="${Lp}" data-off="${f1(R() * 3)}" data-k="y~:0@0 196@${Lp}"/>`; });
  const part = (id, cx, cy, r, depth) => { const P = Array.from({ length: 9 }, (_, i) => { const a = (i + (R() - .5) * .5) / 9 * 6.283, q = r * (.84 + R() * .2); return [f1(cx + Math.cos(a) * q), f1(cy + Math.sin(a) * q * .95)]; }), d = 'M' + P.map(p => p.join(' ')).join('L') + 'Z';
    return `<clipPath id="c3-j${id}"><path d="${d}"/></clipPath><path d="${d}" fill="#b5855a"/><path d="${d}" fill="url(#c3-hex)" opacity=".4"/><g clip-path="url(#c3-j${id})"><path d="${d}" fill="none" stroke="#2f6f9f" stroke-opacity=".62" stroke-linejoin="round" data-k="@stroke-width:${f1(depth * 1.3)}@0 ${depth * 2}@${dur / 2} ${f1(depth * 1.3)}@${dur}"/></g><path d="${d}" fill="none" stroke="#262626" stroke-width="2" stroke-linejoin="round"/>`; };
  const dots = (cx, cy, r, n) => rep(n, () => { const a = R() * 6.283, Lp = f1(2 + R() * 1.4); return `<circle cx="${f1(cx + Math.cos(a) * r)}" cy="${f1(cy + Math.sin(a) * r)}" r="${f1(1.8 + R() * 1.2)}" fill="#7a5238" data-loop="${Lp}" data-off="${f1(R() * 3)}" data-k="x<:0@0 ${f1(Math.cos(a) * 15)}@${Lp};y~:0@0 ${f1(Math.sin(a) * 15 + 16)}@${Lp};o:0@0 1@${f1(Lp * .25)} 0@${Lp}"/>`; });
  const fine = [[58, 40, 22], [118, 82, 24], [176, 38, 21], [62, 98, 14], [188, 94, 16]];
  const body = k === 0
    ? `<ellipse cx="88" cy="114" rx="40" ry="6" fill="url(#c3-drop)"/><ellipse cx="162" cy="112" rx="34" ry="5" fill="url(#c3-drop)"/>
      <g data-k="y:0@0 -3@${dur / 2} 0@${dur}"><g transform="translate(160 72) rotate(22)">${beanTop(24, 37, 's', { base: '#3a2114', skin: 0, outline: 'stroke="#262626" stroke-width="1.4"' })}</g></g>
      <g data-k="y:-3@0 0@${dur / 2} -3@${dur}"><g transform="translate(86 70) rotate(-18)">${beanTop(27, 42, 's', { base: '#b5855a', outline: 'stroke="#262626" stroke-width="1.4"' })}</g></g>
      <text x="80" y="12" class="tm mid" style="font-size:12px">hell</text><text x="170" y="12" class="tm mid" style="font-size:12px">dunkel</text>`
    : `<rect width="240" height="124" rx="12" fill="#2f6f9f" opacity=".07"/>${streaks(8)}` + (k === 1 ? part('a', 120, 62, 46, 5) + dots(120, 62, 46, 3) : fine.map(([x, y, r], i) => part('b' + i, x, y, r, 8)).join('') + fine.map(([x, y, r]) => dots(x, y, r, 3)).join(''));
  return `<div data-film data-bare data-dur="${dur}"><svg class="ic dg" viewBox="0 0 240 124" role="img" aria-label="${['Helle und dunkle Bohne', 'Wasser dringt kaum in das dichte Partikel ein', 'Feiner gemahlen dringt Wasser weiter ein'][k]}"${k ? ' style="overflow:hidden;border-radius:12px"' : ''}>${D3}${body}</svg></div>`;
};
const adjIco = ['<path d="M9 3v11.5a4 4 0 104 0V3a2 2 0 00-4 0zM11 9v8" /><path d="M19 9V3m-3 3l3-3l3 3" />', '<circle cx="5" cy="7" r="1.6"/><circle cx="11" cy="5" r="1.6"/><circle cx="17" cy="8" r="1.6"/><circle cx="7" cy="13" r="1.6"/><circle cx="14" cy="13" r="1.6"/><circle cx="20" cy="14" r="1.6"/><circle cx="5" cy="19" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="18" cy="20" r="1.6"/>', '<path d="M4 20V11h5v9zM14 20V4h5v16z"/><path d="M2 20h20"/>'];

/* ======================= scenes ======================= */
export const html = chapter(CH) +

scene({ id: 'arabica-robusta', ch: CH, title: '3.1 Arabica und Robusta', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Zwei Arten, zwei Charaktere</h2>
      <p class="lead rv" style="--d:2">Aromatik, Koffein, Körper und Anbau im direkten Vergleich.</p>
      <div class="rv" style="--d:3">${why('<b>An der Bohne erkennbar:</b> Arabica ist meist länglich-oval mit geschwungenem Schnitt. Robusta ist rundlicher, der Schnitt verläuft eher gerade.')}</div>
    </div>
    <div class="c3-vs">${SPEC.map((S, k) => `<div class="c3-sp"><div class="rv-img" style="--d:${1 + k}">${specSvg(S, k)}</div>
      <h3 class="rv" style="--d:${2 + k}">${S.n}</h3>
      <ul class="c3-rows">${S.rows.map((r, i) => `<li class="rv" style="--d:${3 + i + k}"><span class="label">${ROWL[i]}</span><span class="v">${r}${i === 2 ? cafBar(S) : ''}</span></li>`).join('')}</ul></div>`).join('')}</div>
  </div>`)) +

film({ id: 'pflueckmethoden', ch: CH, title: '3.2 Pflückmethoden', name: 'Pflücken oder abstreifen', dur: 16.6, rate: .5, still: 14.5,
  marks: [
    ['Reife am Ast', 0, 'An einem Ast hängen reife und unreife Kirschen nebeneinander.'],
    ['Hand Picking', 2.3, '<b>Hand Picking:</b> manuelle Auswahl reifer Kaffeekirschen.'],
    ['Kirsche für Kirsche', 5.6, 'Das bringt gleichmäßigere Reifegrade, bedeutet aber <b>höheren Arbeitsaufwand</b>.'],
    ['Strip Picking', 9.3, '<b>Strip Picking:</b> Abstreifen aller Kirschen eines Astabschnitts. Schnelle und kostengünstige Ernte.'],
    ['Ergebnis im Korb', 12.7, 'Links <b>gleichmäßigere Reifegrade</b>, rechts <b>unterschiedliche Reifegrade</b>.']
  ], svg: pickSvg() }) +

scene({ id: 'pflueckmethoden-vergleich', ch: CH, title: 'Pflückmethoden im Vergleich', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Auswahl oder Tempo</h2>
      <p class="lead rv" style="--d:2">Derselbe Ast, zwei Arten zu ernten. Der Unterschied liegt im Korb.</p>
      <div class="c3-legend rv" style="--d:3"><span><i style="background:#b8452a"></i>reif</span><span><i style="background:#d9a35f"></i>unreif</span></div>
      <div class="rv" style="--d:4">${why('<b>Der Zielkonflikt:</b> Auswahl kostet Arbeit, Tempo kostet Gleichmäßigkeit.')}</div>
    </div>
    <div class="cmp c3-pick" style="--n:2">
      <div class="card rv" style="--d:2">${topBasket(false)}<h3>Hand Picking</h3>${notes(['Manuelle Auswahl reifer Kaffeekirschen.', 'Gleichmäßigere Reifegrade.', 'Höherer Arbeitsaufwand.'], 'sm')}</div>
      <div class="card rv" style="--d:4">${topBasket(true)}<h3>Strip Picking</h3>${notes(['Abstreifen aller Kirschen eines Astabschnitts.', 'Schnelle und kostengünstige Ernte.', 'Unterschiedliche Reifegrade.'], 'sm')}</div>
    </div>
  </div>`)) +

film({ id: 'aufbereitung', ch: CH, title: '3.3 Aufbereitungsverfahren: Natural, Washed und Honey', name: 'Drei Wege zum Rohkaffee', dur: 21, rate: 1, still: 15,
  marks: [
    ['Aufbau der Kirsche', 0, 'Von außen nach innen: Schale und Fruchtfleisch, Schleimschicht, Pergamenthaut, Bohne.'],
    ['Fruchtfleisch', 5, '<b>Washed</b> und <b>Honey:</b> Fruchtfleisch wird entfernt. <b>Natural:</b> die Kirsche bleibt ganz.'],
    ['Schleimschicht', 8.7, '<b>Washed:</b> Schleimschicht wird entfernt. <b>Honey:</b> Schleimschicht bleibt teilweise erhalten.'],
    ['Trocknung', 11.9, '<b>Natural:</b> ganze Kaffeekirsche wird getrocknet. Das Fruchtfleisch bleibt während der Trocknung erhalten.'],
    ['Rohkaffee', 16.4, 'Nach dem Trocknen wird die Hülle entfernt. Übrig bleibt die rohe Bohne.']
  ], svg: procSvg() }) +

scene({ id: 'aufbereitung-profile', ch: CH, title: 'Aufbereitung: Geschmacksprofile', light: true }, inner(`
  <div class="stack">
    ${kicker(CH)}
    <h2 class="title rv" style="--d:1">Was mittrocknet, prägt die Tasse</h2>
    <div class="cmp c3-prof" style="--n:3">
      ${[[['Ganze Kaffeekirsche wird getrocknet.', 'Fruchtfleisch bleibt während der Trocknung erhalten.'], 'Häufig fruchtig, süß und körperreich.', [1, 1, 1, 1]],
        [['Fruchtfleisch wird entfernt.', 'Schleimschicht wird entfernt.'], 'Häufig klar, sauber und säurebetont.', [0, 0, 1, 1]],
        [['Fruchtfleisch wird entfernt.', 'Schleimschicht bleibt teilweise erhalten.'], 'Häufig süßlich und fruchtig.', [0, .5, 1, 1]]].map(([n, fl, keep], k) => `<div class="card rv" style="--d:${2 + k * 2}">
        ${dryIcon(k)}<h3>${LANES[k].n}</h3>${layerBar(keep)}${notes(n, 'sm')}<p class="c3-taste"><span class="label">In der Tasse</span>${fl}</p></div>`).join('')}
    </div>
  </div>`)) +

film({ id: 'roesten', ch: CH, title: '3.4 Röstgrade: was beim Rösten passiert', name: 'Was beim Rösten passiert', lead: 'Chemische Veränderung beim Rösten: fünf Vorgänge, die ineinandergreifen.', dur: 20.4, rate: 1, still: 17.6,
  marks: [
    ['Rohkaffee', 0, 'Am Anfang ist die Bohne roh und dicht. Erst die Hitze setzt die Veränderung in Gang.'],
    ['Maillard-Reaktion', 3, '<b>Maillard-Reaktion:</b> Zucker und Aminosäuren reagieren. Die Bohne bräunt.'],
    ['Karamellisierung', 6.5, '<b>Karamellisierung:</b> Zucker zerfällt in der Hitze zu Karamell- und Röstnoten.'],
    ['Bildung neuer Aromastoffe', 10, '<b>Bildung neuer Aromastoffe:</b> aus diesen Reaktionen entsteht das typische Kaffeearoma.'],
    ['Abbau organischer Säuren', 13.5, '<b>Abbau organischer Säuren:</b> je länger geröstet wird, desto weniger Säure bleibt.'],
    ['Veränderung der Zellstruktur', 16.5, '<b>Veränderung der Zellstruktur:</b> die Bohne dehnt sich aus, wird poröser und verliert an Dichte.']
  ], svg: roastSvg() }) +

scene({ id: 'roestgrade', ch: CH, title: 'Röstgrade: Light, Medium und Dark Roast', light: true }, inner(`
  <div class="stack c3-rg">
    <div class="split">
      <div class="stack">
        ${kicker(CH)}
        <h2 class="title rv" style="--d:1">Hell, mittel, dunkel</h2>
        <div class="c3-now rv" style="--d:2">${['Röstgrad', 'Aromatik'].map((n, k) => `<div><span class="label">${n}</span><span class="pane">${ROAST.map((r, i) => `<b data-l="${i}" class="big-num">${r[k]}</b>`).join('')}</span></div>`).join('')}</div>
        <div class="rv" style="--d:3">${why('<b>Schieb den Regler:</b> Farbe, Poren und Tendenzen folgen dem Röstgrad. Die Balken zeigen Richtungen, keine Messwerte.')}</div>
      </div>
      <div class="stack c3-rs">
        <div class="rv-img" style="--d:2">${lensSvg()}</div>
        <div class="slider rv" style="--d:3"><div class="ends"><span>Light Roast</span><span>Medium Roast</span><span>Dark Roast</span></div><input type="range" id="c3-roast" min="0" max="100" value="12" step="1" aria-label="Röstgrad von hell bis dunkel"></div>
      </div>
    </div>
    <div class="rv" style="--d:4"><table class="tbl even c3-rt" id="c3-rt" data-lvl="0"><thead><tr><th></th>${ROAST.map(r => `<th>${r[0]}</th>`).join('')}</tr></thead>
      <tbody>${['Aromatik', 'Säure', 'Porosität', 'Dichte'].map((n, i) => `<tr><th scope="row">${n}${i ? `<span class="bar"><i id="c3-b${i - 1}"></i></span>` : ''}</th>${ROAST.map(r => `<td>${r[i + 1]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
  </div>`)) +

film({ id: 'helle-roestung', ch: CH, title: '3.5 Helle Röstungen und ihre besonderen Herausforderungen', name: 'Wasser trifft Struktur', dur: 17.4, rate: .5, still: 13,
  marks: [
    ['Zwei Partikel', 0, 'Zwei Kaffeepartikel unter der Lupe: helle Röstung dicht, dunkle Röstung porös und rissig.'],
    ['Wasser trifft ein', 3.2, 'Beim Brühen umströmt das Wasser beide Partikel gleich.'],
    ['Eindringen', 5.6, 'In die <b>poröse</b> Struktur dringt Wasser schnell und tief ein. In die <b>dichte</b> nur langsam.'],
    ['Lösen', 10, 'Entsprechend lösen sich die Stoffe: bei hellen Röstungen <b>häufig geringere Löslichkeit</b>.'],
    ['Konsequenz', 14, 'Darum sind bei hellen Röstungen <b>Mahlgrad und Temperatur</b> besonders wichtig.']
  ], svg: partSvg() }) +

scene({ id: 'helle-roestung-anpassen', ch: CH, title: 'Helle Röstungen: verstehen und anpassen', light: true, steps: 2 }, inner(`
  <div class="stack">
    ${kicker(CH)}
    <h2 class="title rv" style="--d:1">Helle Röstung: erst verstehen, dann anpassen</h2>
    <div class="cmp c3-chain" style="--n:3">
      <div class="rv" style="--d:2"><div class="card">${adjSvg(0)}<span class="c3-no">01</span><h3>Warum schmecken sie anders?</h3>${notes(['Mehr ursprüngliche Herkunftsaromen.', 'Häufig stärker wahrnehmbare Säure.', 'Weniger ausgeprägte Röstaromen.', 'Höhere strukturelle Dichte.'], 'sm')}</div></div>
      <div class="rv" style="--d:4"><div class="card" data-s="1">${adjSvg(1)}<span class="c3-no">02</span><h3>Herausforderungen bei der Extraktion</h3>${notes(['Häufig geringere Löslichkeit.', 'Höhere Anforderungen an die Puck Prep.', 'Mahlgrad und Temperatur besonders wichtig.'], 'sm')}</div></div>
      <div class="rv" style="--d:6"><div class="card" data-s="2">${adjSvg(2)}<span class="c3-no">03</span><h3>Mögliche Anpassungen</h3>
        <ul class="c3-adj">${['Höhere Brühtemperatur.', 'Feinere Mahlung.', 'Angepasstes Brew Ratio.'].map((t, i) => `<li style="--i:${i}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${adjIco[i]}</svg><span>${t}</span></li>`).join('')}</ul></div></div>
    </div>
    <div class="rv" style="--d:7"><div data-s="2">${why('<b>Das Ziel:</b> trotz dichter Struktur genug aus dem Kaffee lösen.')}</div></div>
  </div>`));

export const css = `
/* chapter 3 */
.c3-vs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,2.6vw,44px);align-items:start}
.c3-sp{display:flex;flex-direction:column;gap:6px;min-width:0}
.c3-sp svg.dg{max-height:36vh}
.c3-sp h3{font-size:clamp(26px,1.7vw + 10px,44px);font-weight:400;line-height:1;color:var(--strong)}
.c3-rows{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column}
.c3-rows li{display:grid;grid-template-columns:5.6em minmax(0,1fr);gap:10px;align-items:baseline;padding:9px 0;border-top:1px solid var(--line);font-size:clamp(15px,.6vw + 10px,20px)}
.c3-rows .v{color:var(--strong);min-width:0}
.c3-cafsvg{display:block;width:100%;max-width:250px;height:auto;margin-top:6px;overflow:visible}
.c3-caf{transform-box:fill-box;transform-origin:0 50%;transform:scaleX(0)}
.is-active .c3-caf{transform:scaleX(1);transition:transform 1.9s var(--ease) 1s}
.c3-legend{display:flex;gap:18px;font-size:14px;color:var(--mute)}
.c3-legend span{display:inline-flex;align-items:center;gap:7px}
.c3-legend i{width:12px;height:12px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(38,38,38,.35)}
.c3-ch{transform-box:fill-box;transform-origin:center;transform:translateY(-16px) scale(.6);opacity:0}
.is-active .c3-ch{transform:none;opacity:1;transition:transform .7s cubic-bezier(.3,1.5,.5,1),opacity .3s;transition-delay:calc(var(--i) * 45ms + 650ms)}
.c3-layers{display:flex;gap:3px}
.c3-layers span{flex:1 1 0;min-width:0;font-size:10.5px;letter-spacing:.02em;padding:5px 4px;text-align:center;border-radius:5px;background:var(--brown);color:var(--milk);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.c3-layers .off{background:none;box-shadow:inset 0 0 0 1px var(--line);color:var(--mute);text-decoration:line-through}
.c3-layers .half{background:repeating-linear-gradient(-45deg,var(--brown) 0 5px,rgba(122,82,56,.45) 5px 10px)}
.c3-taste{margin-top:auto;padding-top:10px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:4px;font-size:clamp(17px,.8vw + 10px,23px);color:var(--strong);line-height:1.2}
.c3-rt td,.c3-rt th{transition:opacity .35s,color .35s}
.c3-rg{gap:clamp(10px,1.8vh,22px)}
.c3-rt tbody th{padding:9px 14px 9px 0;border-top:1px solid var(--line);vertical-align:middle;width:20%}
.c3-rt td{padding-top:9px;padding-bottom:9px;width:26.6%}
.c3-rt .bar{display:block;height:5px;border-radius:3px;background:var(--line);overflow:hidden;margin-top:6px;max-width:150px}
.c3-rt .bar i{display:block;height:100%;width:100%;background:var(--brown);border-radius:3px;transform-origin:0 50%}
.c3-rt[data-lvl="0"] tr>:not(:nth-child(2)):not(:first-child),.c3-rt[data-lvl="1"] tr>:not(:nth-child(3)):not(:first-child),.c3-rt[data-lvl="2"] tr>:not(:nth-child(4)):not(:first-child){opacity:.5}
.c3-rt[data-lvl="0"] tr>:nth-child(2),.c3-rt[data-lvl="1"] tr>:nth-child(3),.c3-rt[data-lvl="2"] tr>:nth-child(4){color:var(--strong)}
.c3-rt[data-lvl="0"] td:nth-child(2),.c3-rt[data-lvl="1"] td:nth-child(3),.c3-rt[data-lvl="2"] td:nth-child(4){font-weight:500}
.c3-rs{gap:clamp(6px,1vh,14px)}
.c3-lens{max-height:min(34vh,340px)}
.c3-rs .slider .ends span:nth-child(2){text-align:center}
.c3-now{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(12px,2vw,30px)}
.c3-now>div{display:flex;flex-direction:column;gap:7px;border-top:1px solid var(--line);padding-top:9px;min-width:0}
.c3-now .big-num{font-size:clamp(24px,1.7vw + 8px,42px);font-weight:300}
.c3-now [data-l]{opacity:0;transition:opacity .4s,transform .5s var(--ease);transform:translateY(8px);grid-area:1/1}
.c3-now [data-l].on{opacity:1;transform:none}
.c3-chain>div{display:grid;min-width:0}
.c3-chain .card{position:relative}
.cmp.c3-chain .card svg.ic{max-height:clamp(84px,calc(100vh - 612px),190px)}
.cmp.c3-prof .card svg.ic{max-height:clamp(100px,calc(100vh - 584px),210px)}
.c3-no{font-family:var(--mono);font-size:12px;color:var(--brown)}
.c3-adj{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;font-size:clamp(15px,.6vw + 10px,19px)}
.c3-adj li{display:flex;align-items:center;gap:12px;transition:transform .6s var(--ease),opacity .5s;transition-delay:calc(var(--i) * 110ms + 120ms)}
.c3-adj svg{width:34px;height:34px;flex:none;padding:6px;border-radius:50%;background:var(--brown);color:var(--milk)}
[data-s]:not(.on) .c3-adj li{transform:translateX(-10px)}
@media (max-width:760px){.c3-rows li{grid-template-columns:minmax(0,1fr);gap:2px}.c3-layers span{font-size:9.5px}.cmp.c3-chain .card svg.ic,.cmp.c3-prof .card svg.ic,.cmp.c3-pick .card svg.ic{max-height:150px}.c3-rt{font-size:13.5px}.c3-rt tbody th{width:auto}.c3-rt .bar{max-width:60px}}
@media (prefers-reduced-motion:reduce){.c3-caf,.c3-ch{transform:none;opacity:1}}
`;

export const js = `
/* 3.4 roast slider: the picture eases toward the slider, so dragging never restarts anything */
(() => {
  const el = $('#c3-roast'); if (!el) return;
  const STOPS = [[181, 133, 90], [122, 82, 56], [58, 33, 20]];
  const col = u => { const k = u < .5 ? 0 : 1, v = u < .5 ? u * 2 : u * 2 - 1; return STOPS[k].map((c, i) => Math.round(lerp(c, STOPS[k + 1][i], v))); };
  const fills = $$('.c3-rc'), pores = $$('.c3-pore').map(e => [e, +e.dataset.a, +e.dataset.b, +e.dataset.t]);
  const bean = $('#c3-rbean'), cracks = $('#c3-cracks'), oil = $('#c3-oil'), tblEl = $('#c3-rt'), bars = [0, 1, 2].map(i => $('#c3-b' + i)), txt = $$('.c3-now [data-l]');
  const NAMES = ${JSON.stringify(ROAST.map(r => r[0]))};
  let cur = .12, raf = 0, lvl = -1;
  const paint = () => {
    const u = cur, c = col(u), rgb = 'rgb(' + c + ')', dark = 'rgb(' + c.map(x => Math.round(x * .36)) + ')';
    fills.forEach(e => e.style.fill = rgb);
    pores.forEach(p => { p[0].setAttribute('r', lerp(p[1], p[2], u * u * .4 + u * .6).toFixed(2)); p[0].style.opacity = p[3] ? clamp((u - p[3]) * 6, 0, 1) : 1; p[0].style.fill = dark; });
    bean.setAttribute('transform', 'translate(166 146) rotate(-16) scale(' + (.93 + u * .09).toFixed(4) + ')');
    cracks.style.opacity = clamp((u - .62) / .3, 0, 1); oil.style.opacity = clamp((u - .55) * .6, 0, .28);
    bars[0].style.transform = 'scaleX(' + lerp(.86, .3, u).toFixed(3) + ')'; bars[1].style.transform = 'scaleX(' + lerp(.24, .88, u).toFixed(3) + ')'; bars[2].style.transform = 'scaleX(' + lerp(.88, .34, u).toFixed(3) + ')';
  };
  const label = () => {
    const v = el.value / 100, l = v < .34 ? 0 : v < .67 ? 1 : 2; if (l === lvl) return; lvl = l;
    tblEl.dataset.lvl = l; txt.forEach(e => e.classList.toggle('on', +e.dataset.l === l)); el.setAttribute('aria-valuetext', NAMES[l]);
  };
  const loop = () => { const target = el.value / 100; cur += (target - cur) * .14; if (Math.abs(target - cur) < .0015) cur = target; paint(); raf = cur === target ? 0 : requestAnimationFrame(loop); };
  const kick = () => { label(); if (reduce) { cur = el.value / 100; paint(); } else if (!raf) raf = requestAnimationFrame(loop); };
  el.addEventListener('input', kick);
  hooks['roestgrade'] = { enter() { if (!reduce) cur = Math.max(0, el.value / 100 - .12); kick(); }, leave() { cancelAnimationFrame(raf); raf = 0; } };
  paint(); label();
})();
`;

export const quiz = [
  { q: 'Welche Beschreibung passt zu Arabica im Vergleich zu Robusta?', o: ['Kräftiger, erdiger und ca. 2–2,7 % Koffein', 'Komplexere Aromatik und ca. 1–1,5 % Koffein', 'Häufig bitterer und robuster im Anbau'], a: 1, e: 'Arabica: <b>komplexere Aromatik</b>, häufig fruchtiger, ca. 1–1,5 % Koffein, weniger Körper, anspruchsvoller Anbau.', go: 'arabica-robusta' },
  { q: 'Warum sind helle Röstungen schwieriger zu extrahieren?', o: ['Sie sind poröser und geben ihre Stoffe zu schnell ab.', 'Sie haben eine höhere strukturelle Dichte und häufig geringere Löslichkeit.', 'Sie enthalten kaum noch Säure.'], a: 1, e: 'Dichte Struktur, geringere Löslichkeit. Mögliche Anpassungen: <b>höhere Brühtemperatur, feinere Mahlung, angepasstes Brew Ratio</b>.', go: 'helle-roestung' }
];
