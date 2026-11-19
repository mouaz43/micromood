import { CHAPTERS, scene, inner, rep } from '../lib.mjs';

const letters = (w, from = 0) => [...w].map((c, i) => `<span style="--i:${from + i}">${c}</span>`).join('');

const ICONS = [
  '', // 1 dripper
  '<path d="M10 14h44L38 40H26z"/><path d="M26 40v6h12v-6"/><path d="M20 50h24v6a6 6 0 01-6 6H26a6 6 0 01-6-6z"/><path d="M32 4v6"/>',
  // 2 machine
  '<rect x="8" y="8" width="48" height="16" rx="3"/><path d="M14 24v32h36V24"/><path d="M26 24v8h12v-8"/><path d="M24 36h16l-2 6H26z"/><path d="M26 50h12v6H26z"/><circle cx="46" cy="16" r="3"/>',
  // 3 bean
  '<ellipse cx="32" cy="32" rx="16" ry="24" transform="rotate(28 32 32)"/><path d="M22 14c12 8 4 26 20 36"/>',
  // 4 portafilter
  '<path d="M8 20h34v8a12 12 0 01-12 12H20A12 12 0 018 28z"/><path d="M42 23h16"/><path d="M25 46v6M25 58v2"/>',
  // 5 burrs
  '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="8"/><path d="M32 10v8M32 46v8M10 32h8M46 32h8M16.5 16.5l5.5 5.5M42 42l5.5 5.5M47.5 16.5L42 22M22 42l-5.5 5.5"/>',
  // 6 tamper
  '<path d="M24 6h16a4 4 0 014 4v6a8 8 0 01-8 8h-8a8 8 0 01-8-8v-6a4 4 0 014-4z"/><path d="M28 24v14h8V24"/><path d="M14 38h36v10H14z"/><path d="M8 56h48"/>',
  // 7 cupping
  '<path d="M8 30h36a18 18 0 01-36 0z"/><path d="M40 12c6 4 14 10 18 20"/><ellipse cx="38" cy="11" rx="5" ry="3" transform="rotate(30 38 11)"/><path d="M18 20c0-4 4-4 4-8M28 20c0-4 4-4 4-8"/>'
];

export const html =
scene({ id: 'start', ch: 0, title: 'Start' }, `
  <div class="amb soft" data-amb="crema"></div>
  ${inner(`
    <div class="stack">
      <span class="label rv" style="--d:0">BUNCA.ACADEMY · Workshop</span>
      <h1 class="hero-title long" aria-label="Barista Advanced">${letters('Barista')}<span class="br"></span>${letters('Advanced', 7)}</h1>
      <p class="tagline rv" style="--d:8">Good coffee is no accident.</p>
      <p class="lead wide rv" style="--d:9">Vertiefendes Wissen rund um Kaffee, Espresso und Technik. Sieben Kapitel, in Zeitlupe erklärt.</p>
      <div class="start-actions rv" style="--d:11">
        <button class="btn pri" data-action="trailer"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>Intro abspielen</button>
        <button class="btn" data-action="next">Direkt starten</button>
      </div>
    </div>
    <div class="hero-video rv-img" style="--d:3">
      <div data-film data-bare data-dur="27" data-draw="pour" data-rate="1" data-still="14">
        <canvas aria-label="Espressobezug in Zeitlupe" role="img"></canvas>
        <span class="cine-badge slow">Zeitlupe</span>
        <span class="tc">BEZUG <span data-num="0@3 28@24" data-fmt="mm:ss"></span> · <span data-num="0@4.2 36@23" data-fmt="{} g" data-dec="1"></span></span>
      </div>
    </div>`)}`) +

scene({ id: 'agenda', ch: 0, title: 'Die sieben Kapitel' }, inner(`
  <div class="stack">
    <div class="kicker rv" style="--d:0">Agenda</div>
    <div class="agenda seven">
      ${rep(7, k => { const C = CHAPTERS[k + 1]; return `<button class="ag rv" style="--d:${k + 1}" data-goto="kapitel-${k + 1}">
        <svg class="ico" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k + 1]}</svg>
        <span class="n">${C.n}</span><h3>${C.name}</h3><p>${C.items.length} Themen · ${C.sub}</p></button>`; })}
      <button class="ag fin rv" style="--d:8" data-goto="zusammenspiel"><span class="n">→</span><h3>Abschluss &amp; Quiz</h3><p>Die wichtigsten Zusammenhänge. Good coffee is no accident.</p></button>
    </div>
  </div>`));

export const shots = [
  { text: '<div class="sm">BUNCA.ACADEMY</div>', dur: 1900, amb: 'beans' },
  { text: '<div class="line">Eine Bohne.</div>', dur: 2200, amb: 'beans' },
  { text: '<div class="line">Tausend Entscheidungen.</div>', dur: 2400, amb: 'grounds' },
  { text: '<div class="line">Röstung. Mühle. Puck.</div>', dur: 2400, amb: 'grounds' },
  { text: '<div class="line">Druck. Temperatur. Zeit.</div>', dur: 2400, amb: 'steam' },
  { text: '<div class="line">Jeder Tropfen zählt.</div>', dur: 2400, amb: 'drops' },
  { text: '<div class="big">Barista Advanced</div><div class="tg">Good coffee is no accident.</div>', dur: 4200, hold: true, amb: 'crema' }
];

export const js = `
const mixc = (a, b, u) => 'rgb(' + a.map((v, i) => Math.round(lerp(v, b[i], u))) + ')';
// Hero: a bottomless-portafilter shot in slow motion. Everything is a function of t, so it loops cleanly.
DRAW.pour = (c, t, w, h) => {
  const cx = w / 2, on = clamp((t - 3.2) / 1.6, 0, 1) * clamp((24 - t) / 1.6, 0, 1);
  const lvl = clamp((t - 4.2) / 18.8, 0, 1), fade = clamp((27 - t) / .9, 0, 1) * clamp(t / .9, 0, 1);
  c.globalAlpha = 1; c.clearRect(0, 0, w, h);
  let g = c.createRadialGradient(cx, h * .32, 0, cx, h * .32, h * .85); g.addColorStop(0, '#30221a'); g.addColorStop(1, '#120f0d'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  c.globalAlpha = fade;
  c.save(); c.translate(Math.sin(t * .7) * w * .004, Math.sin(t * .53 + 1) * h * .003);   // a breath of hand-held camera
  const gx0 = w * .25, gx1 = w * .75, gy0 = h * .58, gy1 = h * .9, tap = w * .04;
  const xl = y => gx0 + tap * (y - gy0) / (gy1 - gy0), xr = y => gx1 - tap * (y - gy0) / (gy1 - gy0);
  const surf = gy1 - (gy1 - gy0) * .8 * lvl;
  const col = mixc([58, 33, 20], [217, 163, 95], Math.pow(lvl, 1.5));
  // basket
  const by = h * .1, brx = w * .36, bry = h * .028;
  c.fillStyle = '#1b130e'; c.beginPath(); c.ellipse(cx, by, brx, bry, 0, 0, 6.29); c.fill();
  const wet = clamp((t - .6) / 2.6, 0, 1);
  for (let i = 0; i < 46; i++) {
    const a = i * 2.39996, r = Math.sqrt((i + .5) / 46), x = cx + Math.cos(a) * r * brx * .9, y = by + Math.sin(a) * r * bry * .8;
    const s = clamp(wet * 1.6 - r * .5 - (i % 5) * .08, 0, 1);
    c.fillStyle = 'rgba(201,154,107,' + (.75 * s) + ')'; c.beginPath(); c.ellipse(x, y, w * .008 * s + .4, h * .004 * s + .3, 0, 0, 6.29); c.fill();
  }
  g = c.createLinearGradient(cx - brx, 0, cx + brx, 0); g.addColorStop(0, '#6f6862'); g.addColorStop(.45, '#e2ddd8'); g.addColorStop(1, '#7a736d');
  c.strokeStyle = g; c.lineWidth = Math.max(5, h * .016); c.beginPath(); c.ellipse(cx, by, brx, bry, 0, 0, 6.29); c.stroke();
  c.lineWidth = Math.max(8, h * .03); c.lineCap = 'round'; c.beginPath(); c.moveTo(cx + brx, by); c.lineTo(w * 1.05, by - h * .012); c.stroke();
  // stream
  const y0 = by + bry * .6, yEnd = lvl > 0 ? surf : gy1 - 2;
  if (on > 0.01) {
    const wn = w * .011 * (.55 + .45 * on), wt = brx * .62 * on, half = y => wn + (wt - wn) * Math.exp(-(y - y0) / (h * .055));
    const mid = y => cx + Math.sin(y * .018 + t * 1.7) * w * .004 * clamp((y - y0) / (h * .2), 0, 1);
    g = c.createLinearGradient(0, y0, 0, yEnd); g.addColorStop(0, '#3a2114'); g.addColorStop(.35, col); g.addColorStop(1, col);
    c.fillStyle = g; c.beginPath();
    for (let y = y0; y <= yEnd; y += 4) c.lineTo(mid(y) - half(y), y);
    for (let y = yEnd; y >= y0; y -= 4) c.lineTo(mid(y) + half(y), y);
    c.closePath(); c.fill();
    c.lineWidth = Math.max(1, w * .004); c.strokeStyle = 'rgba(248,203,173,.5)';
    for (let k = 0; k < 4; k++) { c.beginPath(); for (let y = y0; y <= yEnd; y += 5) c.lineTo(mid(y) + half(y) * .7 * Math.sin(y * .03 - t * 2.4 + k * 1.57), y); c.stroke(); }
  }
  // single drops before and after the stream
  for (let k = 0; k < 5; k++) {
    const t0 = k < 2 ? 2.2 + k * .55 : 24.2 + (k - 2) * .7, u = (t - t0) / .9;
    if (u > 0 && u < 1) { const y = y0 + (yEnd - y0) * u * u; c.fillStyle = k < 2 ? '#5b3720' : '#d9a35f'; c.beginPath(); c.ellipse(cx + (k % 2 ? 6 : -4), y, w * .012, w * .012 * (1 + u * 1.4), 0, 0, 6.29); c.fill(); }
  }
  // liquid
  if (lvl > 0) {
    g = c.createLinearGradient(0, surf, 0, gy1); g.addColorStop(0, '#7a4a28'); g.addColorStop(1, '#22130b'); c.fillStyle = g;
    c.beginPath(); c.moveTo(xl(surf), surf);
    for (let x = xl(surf); x <= xr(surf); x += 6) c.lineTo(x, surf + Math.sin(x * .09 + t * 3) * h * .0035 * on * Math.exp(-Math.abs(x - cx) / (w * .16)));
    c.lineTo(xr(surf), surf); c.lineTo(xr(gy1), gy1); c.lineTo(xl(gy1), gy1); c.closePath(); c.fill();
    const cr = h * (.008 + .03 * lvl);
    g = c.createLinearGradient(0, surf, 0, surf + cr * 2); g.addColorStop(0, '#d9a35f'); g.addColorStop(1, 'rgba(201,154,107,0)'); c.fillStyle = g; c.fillRect(xl(surf), surf, xr(surf) - xl(surf), cr * 2);
    for (let i = 0; i < 40; i++) { // crema cascade
      const px = xl(gy1) + (xr(gy1) - xl(gy1)) * ((i * .618) % 1), ph = (t * .13 + i * .37) % 1, y = surf + (gy1 - surf) * (i % 2 ? ph : 1 - ph);
      c.fillStyle = 'rgba(217,163,95,' + (.5 * Math.sin(ph * 3.14) * on) + ')'; c.beginPath(); c.arc(px, y, 1 + (i % 3) * .5, 0, 6.29); c.fill();
    }
    for (let k = 0; k < 3; k++) { const u = (t * .9 + k / 3) % 1; c.strokeStyle = 'rgba(248,203,173,' + (.55 * (1 - u) * on) + ')'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(cx, surf + 1, w * .03 + u * w * .16, h * .003 + u * h * .008, 0, 0, 6.29); c.stroke(); }
  }
  // glass
  c.strokeStyle = 'rgba(243,238,232,.75)'; c.lineWidth = 2; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(xl(gy0), gy0); c.lineTo(xl(gy1), gy1 + 6); c.lineTo(xr(gy1), gy1 + 6); c.lineTo(xr(gy0), gy0); c.stroke();
  c.strokeStyle = 'rgba(243,238,232,.18)'; c.lineWidth = w * .02; c.beginPath(); c.moveTo(xl(gy0) + w * .05, gy0 + 8); c.lineTo(xl(gy1) + w * .045, gy1 - 6); c.stroke();
  // droplets thrown up where the stream lands, and steam drifting off the fresh espresso
  if (lvl > 0 && on > .2) for (let k = 0; k < 7; k++) {
    const u = (t * 1.3 + k * .37) % 1, a = -1.57 + (k - 3) * .33, v = w * (.07 + (k % 3) * .02);
    c.fillStyle = 'rgba(217,163,95,' + (.8 * (1 - u) * on) + ')'; c.beginPath(); c.arc(cx + Math.cos(a) * v * u, surf + Math.sin(a) * v * u + h * .09 * u * u, 1.2 + (k % 2), 0, 6.29); c.fill();
  }
  for (let k = 0; k < 5; k++) {
    const u = (t * .11 + k * .2) % 1, sx = cx + (k - 2) * w * .07 + Math.sin(t * .6 + k * 2) * w * .03 * u, sy = gy0 - h * .02 - u * h * .24, r = w * (.07 + u * .13);
    g = c.createRadialGradient(sx, sy, 0, sx, sy, r); g.addColorStop(0, 'rgba(243,238,232,' + (.09 * Math.sin(u * 3.14) * lvl) + ')'); g.addColorStop(1, 'rgba(243,238,232,0)'); c.fillStyle = g; c.beginPath(); c.arc(sx, sy, r, 0, 6.29); c.fill();
  }
  c.restore();
  c.globalAlpha = 1;
};
`;
