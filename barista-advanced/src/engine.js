(() => {
'use strict';
const DATA = JSON.parse(document.getElementById('ba-data').textContent);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, u) => a + (b - a) * u;
const de = (v, dec = 0) => v.toFixed(dec).replace('.', ',');
const ICON = {
  play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>'
};

/* ---------------- sound (WebAudio) ---------------- */
const state = { i: 0, step: 0, sound: false };
const sfx = {
  ctx: null,
  ensure() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; },
  noise(c, dur) { const b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; return s; },
  whoosh(vol = .06) {
    if (!state.sound) return; const c = this.ensure(); if (!c) return; const t = c.currentTime;
    const n = this.noise(c, .7), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2400, t + .45);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .18); g.gain.exponentialRampToValueAtTime(.0001, t + .65);
    n.connect(f).connect(g).connect(c.destination); n.start(t); n.stop(t + .7);
  },
  hit(vol = .22) {
    if (!state.sound) return; const c = this.ensure(); if (!c) return; const t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(42, t + 1.2);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 1.6);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + 1.7);
  }
};

const scenes = $$('.scene');
const ids = scenes.map(s => s.dataset.id);
const CH = DATA.chapters;

/* ---------------- timeline: data-k="o:0@1 1@2;y:30@1 0@2" (value@second) ----------------
   Every moving part of a motion graphic is a pure function of the film clock, so a film can be
   paused, scrubbed and slowed down without losing a frame. */
const hex = h => { h = h.slice(1); if (h.length === 3) h = [...h].map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16, n >> 8 & 255, n & 255]; };
// easing per track: default smooth · "~" linear · ">" accelerate (gravity) · "<" decelerate · "^" overshoot and settle
const EASE = { s: u => u * u * (3 - 2 * u), '~': u => u, '>': u => u * u, '<': u => 1 - (1 - u) * (1 - u), '^': u => 1 + 2.4 * Math.pow(u - 1, 3) + 1.4 * Math.pow(u - 1, 2) };
function parseTracks(str) {
  return str.split(';').map(seg => {
    const j = seg.indexOf(':'); if (j < 0) return null;
    let p = seg.slice(0, j).trim(), e = 's'; const m = p.match(/[~<>^]$/); if (m) { e = m[0]; p = p.slice(0, -1); }
    const k = seg.slice(j + 1).trim().split(/\s+/).map(s => { const a = s.lastIndexOf('@'), v = s.slice(0, a); return [v[0] === '#' ? hex(v) : +v, +s.slice(a + 1)]; });
    return { p, e, k };
  }).filter(Boolean);
}
function sample(tr, t) {
  const k = tr.k; let a = k[0], b = k[k.length - 1];
  if (t <= a[1]) return a[0]; if (t >= b[1]) return b[0];
  for (let i = 0; i < k.length - 1; i++) if (t < k[i + 1][1]) { a = k[i]; b = k[i + 1]; break; }
  const u = EASE[tr.e]((t - a[1]) / (b[1] - a[1] || 1));
  return Array.isArray(a[0]) ? a[0].map((c, j) => Math.round(lerp(c, b[0][j], u))) : lerp(a[0], b[0], u);
}
const mmss = v => { v = Math.max(0, v); const m = Math.floor(v / 60), s = Math.floor(v % 60); return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); };
class Tl {
  constructor(root) {
    this.items = $$('[data-k],[data-num]', root).map(el => ({
      el, tr: el.dataset.k ? parseTracks(el.dataset.k) : [], loop: +el.dataset.loop || 0, off: +el.dataset.off || 0,
      num: el.dataset.num ? parseTracks('n~:' + el.dataset.num)[0] : null, fmt: el.dataset.fmt || '{}', dec: +el.dataset.dec || 0, last: null
    }));
    for (const it of this.items) if (it.tr.some(t => ['x', 'y', 's', 'sx', 'sy', 'r'].includes(t.p))) it.el.classList.add('tf');
  }
  set(t) {
    for (const it of this.items) {
      let lt = t; if (it.loop) lt = ((t - it.off) % it.loop + it.loop) % it.loop;
      const st = it.el.style; let tf = null;
      for (const tr of it.tr) {
        const v = sample(tr, lt);
        switch (tr.p) {
          case 'o': st.opacity = v; break;
          case 'x': case 'y': case 's': case 'sx': case 'sy': case 'r': (tf = tf || {})[tr.p] = v; break;
          case 'd': st.strokeDashoffset = v; break;
          case 'fill': st.fill = `rgb(${v})`; break;
          case 'stroke': st.stroke = `rgb(${v})`; break;
          default: if (tr.p[0] === '@') it.el.setAttribute(tr.p.slice(1), v); else st.setProperty(tr.p, v);
        }
      }
      if (tf) st.transform = `translate(${tf.x || 0}px,${tf.y || 0}px) rotate(${tf.r || 0}deg) scale(${tf.sx ?? tf.s ?? 1},${tf.sy ?? tf.s ?? 1})`;
      if (it.num) {
        const v = sample(it.num, lt), s = it.fmt === 'mm:ss' ? mmss(v) : it.fmt.replace('{}', de(v, it.dec));
        if (s !== it.last) { it.last = s; it.el.textContent = s; }
      }
    }
  }
}

/* ---------------- film player (motion graphics with slow motion) ---------------- */
const DRAW = {};          // canvas films: DRAW.name = (ctx, t, w, h, film) => {}
const films = new Map();
const SPEEDS = [['1', 'Normal'], ['0.5', 'Zeitlupe ½×'], ['0.25', 'Super-Zeitlupe ¼×']];
class Film {
  constructor(root) {
    this.root = root; this.scene = root.closest('.scene');
    this.dur = +root.dataset.dur || 10; this.marks = JSON.parse(root.dataset.marks || '[]');
    this.bare = root.hasAttribute('data-bare');
    this.base = +(root.dataset.rate || 1); this.rate = this.base;
    this.labels = root.dataset.labels ? JSON.parse(root.dataset.labels) : null;
    this.t = reduce ? +(root.dataset.still || this.dur * .7) : 0;
    this.playing = !reduce; this.active = false; this.fn = DRAW[root.dataset.draw] || null;
    this.cur = reduce ? 0 : this.base; this.seek = null; this.fd = 1;
    // real footage: the file is pre-slowed by data-slow (frame-interpolated), so 1/4x plays at the file's own rate
    this.vid = $('video', root); this.slow = +(root.dataset.slow || 1);
    if (this.vid) { this.vid.muted = true; this.vid.loop = true; this.vid.playsInline = true; }
    this.build();
  }
  build() {
    const r = this.root, sc = this.scene;
    this.cv = $('canvas', r);
    if (this.cv) { this.ctx = this.cv.getContext('2d'); new ResizeObserver(() => this.size()).observe(this.cv); }
    this.tl = new Tl(r);
    if (this.bare) return;
    const fr = document.createElement('div'); fr.className = 'film-frame';
    while (r.firstChild) fr.appendChild(r.firstChild); r.appendChild(fr);
    fr.insertAdjacentHTML('beforeend', `<span class="cine-badge"></span><button class="cine-hit" aria-label="Abspielen oder pausieren"></button><div class="cine-big"><span></span></div>
      <div class="cine-scrub"><div class="tr"></div><div class="fi"></div>${this.marks.map(m => `<i class="mk" style="left:${m[1] / this.dur * 100}%"></i>`).join('')}<input type="range" min="0" max="${this.dur}" step="0.01" value="0" aria-label="Position im Film"></div>`);
    this.badge = $('.cine-badge', fr); this.big = $('.cine-big', fr); this.fill = $('.fi', fr); this.range = $('input', fr);
    $('.cine-hit', fr).addEventListener('click', () => this.toggle());
    this.media = $('svg,canvas,video', fr);
    this.range.addEventListener('input', () => { this.seek = +this.range.value; });
    ['change', 'pointerup', 'touchend', 'blur'].forEach(ev => this.range.addEventListener(ev, () => { if (this.seek !== null) { this.t = lerp(this.t, this.seek, .6); this.seek = null; } }));
    const sp = $('[data-slot="speeds"]', sc);
    if (sp) {
      sp.innerHTML = `<div class="speeds" role="group" aria-label="Geschwindigkeit">${SPEEDS.map((o, k) => `<button data-sp="${o[0]}" aria-pressed="false">${this.labels ? this.labels[k] : o[1]}</button>`).join('')}</div>`;
      this.spBtns = $$('[data-sp]', sp);
      this.spBtns.forEach(b => b.addEventListener('click', () => { this.setRate(+b.dataset.sp); this.play(); }));
    }
    const ph = $('[data-slot="phases"]', sc);
    if (ph && this.marks.length) {
      ph.innerHTML = `<ol class="phases">${this.marks.map((m, k) => `<li><button data-k="${k}"><span class="pn">0${k + 1}</span><span class="pt">${m[0]}</span><span class="pc">${de(m[1], 1)} s</span></button></li>`).join('')}</ol>`;
      this.phBtns = $$('button', ph);
      this.phBtns.forEach(b => b.addEventListener('click', () => { this.jump = this.marks[+b.dataset.k][1] + .05; this.play(); }));
    }
    const sub = $('[data-slot="sub"]', sc);
    if (sub && this.marks.some(m => m[2])) { sub.classList.add('subs'); sub.innerHTML = this.marks.map(m => `<p>${m[2] || ''}</p>`).join(''); this.subs = $$('p', sub); }
    this.timeEl = $('[data-slot="time"]', sc);
    this.setRate(this.base);
  }
  size() { const d = Math.min(devicePixelRatio || 1, 2), w = this.cv.clientWidth, h = this.cv.clientHeight; if (!w) return; this.cv.width = w * d; this.cv.height = h * d; this.ctx.setTransform(d, 0, 0, d, 0, 0); this.w = w; this.h = h; this.paint(); }
  setRate(r) {
    this.rate = r; if (this.bare) return;
    const k = SPEEDS.findIndex(o => +o[0] === r);
    (this.spBtns || []).forEach(b => b.setAttribute('aria-pressed', +b.dataset.sp === r));
    this.badge.textContent = (this.labels || SPEEDS.map(o => o[1]))[k < 0 ? 0 : k]; this.badge.classList.toggle('slow', r !== 1);
  }
  flash(icon) { $('span', this.big).innerHTML = icon; this.big.classList.add('show'); clearTimeout(this._fl); this._fl = setTimeout(() => this.big.classList.remove('show'), 600); }
  toggle() { if (this.playing) { this.playing = false; this.flash(ICON.pause); } else { this.play(); this.flash(ICON.play); } }
  play() { this.playing = true; }
  enter() {
    if (this.active) return; this.active = true; this.last = performance.now();
    const tick = now => {
      if (!this.active) return;
      const dt = Math.min(.1, (now - this.last) / 1000); this.last = now;
      // nothing snaps: speed changes ramp like a camera, pausing coasts to a stop, scrubbing and phase jumps glide
      const goal = this.playing && this.seek === null && this.jump == null ? this.rate : 0;
      this.cur += (goal - this.cur) * (1 - Math.exp(-dt * 7)); if (Math.abs(goal - this.cur) < .002) this.cur = goal;
      this.t += dt * this.cur;
      if (this.seek !== null) this.t += (this.seek - this.t) * (1 - Math.exp(-dt * 16));
      if (this.jump != null) { this.t += (this.jump - this.t) * (1 - Math.exp(-dt * 9)); if (Math.abs(this.jump - this.t) < .03) { this.t = this.jump; this.jump = null; } }
      if (this.vid) this.drive();
      else { if (this.t >= this.dur) this.t = this.t % this.dur; if (this.t < 0) this.t = 0; }
      this.paint(); this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
  leave() { this.active = false; cancelAnimationFrame(this.raf); if (this.vid) this.vid.pause(); }
  // video follows the same eased clock: the playback rate ramps, pause coasts, scrubbing and phase jumps seek
  drive() {
    const v = this.vid; armVideo(v);
    const target = this.seek !== null ? this.seek : this.jump != null ? this.jump : null;
    if (target !== null) {
      if (Math.abs(v.currentTime / this.slow - target) > .04 && !v.seeking && v.readyState > 0) v.currentTime = target * this.slow;
      if (this.jump != null && Math.abs(v.currentTime / this.slow - this.jump) < .08) this.jump = null;
      if (!v.paused) v.pause();
    } else {
      const pr = this.cur * this.slow;
      if (pr < .06 || reduce) { if (!v.paused) v.pause(); }
      else { if (Math.abs(v.playbackRate - pr) > .01) v.playbackRate = clamp(pr, .0625, 16); if (v.paused && v.readyState > 1) v.play().catch(() => {}); }
    }
    if (v.readyState > 0) this.t = Math.min(this.dur - .001, v.currentTime / this.slow);
  }
  reset() { if (this.vid && !reduce && this.vid.readyState > 0) this.vid.currentTime = 0; this.t = reduce ? this.t : 0; this.playing = !reduce; this.seek = this.jump = null; if (!this.bare) this.setRate(this.base); this.cur = reduce ? 0 : this.rate; }
  paint() {
    const t = this.t;
    this.tl.set(t);
    if (this.fn && this.w) this.fn(this.ctx, t, this.w, this.h, this);
    if (this.bare) return;
    if (this.media && !reduce) { // dissolve across the loop point, and a slow push-in while the film runs
      const edge = Math.min(t, this.dur - t), want = this.cur > .05 && this.seek === null && this.jump == null ? clamp(edge / .45, 0, 1) : 1;
      this.fd += (want - this.fd) * .25; this.media.style.opacity = this.fd.toFixed(3);
      this.media.style.transform = 'scale(' + (1 + .022 * t / this.dur).toFixed(4) + ')';
    }
    this.fill.style.width = (t / this.dur * 100) + '%';
    if (this.seek === null) this.range.value = t;
    if (this.timeEl) this.timeEl.textContent = de(t, 1) + ' s';
    let k = -1; this.marks.forEach((m, j) => { if (t >= m[1]) k = j; });
    if (k !== this._k) { this._k = k; (this.phBtns || []).forEach((b, j) => b.classList.toggle('on', j === k)); (this.subs || []).forEach((p, j) => p.classList.toggle('on', j === k)); }
  }
}

/* ---------------- real footage: lazy loading and background loops ---------------- */
function armVideo(v) { if (v && !v.getAttribute('src') && v.dataset.src) { v.preload = 'auto'; v.src = v.dataset.src; } }
function bgPlay(sc, on) {
  for (const v of sc.querySelectorAll('video[data-bg]')) {
    if (!on) { v.pause(); continue; }
    armVideo(v); v.muted = true; v.loop = true; v.playsInline = true;
    if (reduce) continue;
    const go = () => { v.playbackRate = +(v.dataset.rate || 1); v.play().catch(() => {}); };
    if (v.readyState > 1) go(); else v.addEventListener('canplay', go, { once: true });
  }
}
function preloadNext(sc) { if (!sc) return; for (const v of sc.querySelectorAll('video[data-src]')) if (!v.getAttribute('src')) { v.preload = 'metadata'; v.src = v.dataset.src; } }

/* ---------------- ambient slow-motion backdrops ---------------- */
const AMB = {
  beans: { n: [26, 14, 7], size: [10, 22, 46], vy: [.012, .022, .04], vx: 0, spin: .25 },
  drops: { n: [30, 18, 8], size: [5, 9, 16], vy: [.05, .09, .15], vx: 0, spin: 0 },
  steam: { n: [10, 8, 5], size: [90, 150, 230], vy: [-.012, -.02, -.03], vx: .01, spin: 0 },
  grounds: { n: [90, 50, 22], size: [1.6, 3, 6], vy: [.004, .008, .014], vx: .006, spin: .4 },
  bubbles: { n: [30, 18, 9], size: [4, 8, 15], vy: [-.015, -.028, -.045], vx: .004, spin: 0 },
  crema: { n: [9, 7, 4], size: [120, 190, 280], vy: [.004, -.006, .008], vx: .012, spin: 0 }
};
const ambs = new Map();
const ptr = { x: .5, y: .5, ex: .5, ey: .5 };
addEventListener('pointermove', e => { ptr.x = e.clientX / innerWidth; ptr.y = e.clientY / innerHeight; }, { passive: true });
class Amb {
  constructor(el) {
    this.el = el; this.mode = el.dataset.amb; this.on = false; this.t = Math.random() * 100;
    this.cvs = ['blur(6px)', 'blur(2px)', 'none'].map(f => { const c = document.createElement('canvas'); c.style.filter = f; el.appendChild(c); return c; });
    this.seed(); new ResizeObserver(() => this.size()).observe(el);
  }
  seed() { const P = AMB[this.mode]; this.parts = P.n.map((n, z) => Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), k: .6 + Math.random() * .8, a: Math.random() * 6.28, w: Math.random() * 6.28 }))); }
  setMode(m) { if (m === this.mode) return; this.mode = m; this.seed(); }
  size() { const d = Math.min(devicePixelRatio || 1, 1.5), w = this.el.clientWidth, h = this.el.clientHeight; if (!w) return; this.w = w; this.h = h; this.cvs.forEach(c => { c.width = w * d; c.height = h * d; c.getContext('2d').setTransform(d, 0, 0, d, 0, 0); }); this.draw(0); }
  start() { if (this.on) return; this.on = true; if (reduce) { this.draw(0); return; } let last = performance.now(); const loop = now => { if (!this.on) return; const dt = Math.min(.05, (now - last) / 1000); last = now; this.draw(dt); this.raf = requestAnimationFrame(loop); }; this.raf = requestAnimationFrame(loop); }
  stop() { this.on = false; cancelAnimationFrame(this.raf); }
  draw(dt) {
    if (!this.w) return; const P = AMB[this.mode], w = this.w, h = this.h, u = Math.min(w, h) / 700; this.t += dt;
    ptr.ex += (ptr.x - ptr.ex) * .06; ptr.ey += (ptr.y - ptr.ey) * .06;
    this.cvs.forEach((cv, z) => {
      cv.style.transform = `translate3d(${((.5 - ptr.ex) * (z + 1) * 14).toFixed(1)}px,${((.5 - ptr.ey) * (z + 1) * 9).toFixed(1)}px,0) scale(1.04)`;
      const c = cv.getContext('2d'); c.clearRect(0, 0, w, h);
      for (const q of this.parts[z]) {
        q.y += P.vy[z] * q.k * dt * 2.2; q.x += Math.sin(this.t * .5 + q.w) * P.vx * dt; q.a += P.spin * q.k * dt * (q.w > 3 ? 1 : -1);
        if (q.y > 1.15) { q.y = -.15; q.x = Math.random(); } if (q.y < -.15) { q.y = 1.15; q.x = Math.random(); }
        const x = q.x * w, y = q.y * h, s = P.size[z] * q.k * Math.max(.7, u);
        c.save(); c.translate(x, y);
        if (this.mode === 'beans') {
          c.rotate(q.a); c.scale(1, .5 + .5 * Math.abs(Math.cos(q.a * .7 + q.w)));
          const g = c.createLinearGradient(-s, -s, s, s); g.addColorStop(0, '#8a5a36'); g.addColorStop(1, '#3a2114');
          c.fillStyle = g; c.globalAlpha = .5 + z * .22; c.beginPath(); c.ellipse(0, 0, s, s * .68, 0, 0, 6.29); c.fill();
          c.strokeStyle = 'rgba(20,12,8,.8)'; c.lineWidth = Math.max(1, s * .09); c.beginPath(); c.moveTo(-s * .8, 0); c.bezierCurveTo(-s * .3, -s * .28, s * .3, s * .28, s * .8, 0); c.stroke();
        } else if (this.mode === 'drops') {
          c.globalAlpha = .35 + z * .25; const g = c.createLinearGradient(0, -s * 2.4, 0, s); g.addColorStop(0, 'rgba(201,154,107,0)'); g.addColorStop(.6, '#8a5a36'); g.addColorStop(1, '#c99a6b');
          c.fillStyle = g; c.beginPath(); c.moveTo(0, -s * 2.6); c.quadraticCurveTo(s, 0, 0, s); c.quadraticCurveTo(-s, 0, 0, -s * 2.6); c.fill();
          c.fillStyle = 'rgba(248,203,173,.7)'; c.beginPath(); c.arc(-s * .25, s * .2, s * .16, 0, 6.29); c.fill();
        } else if (this.mode === 'steam' || this.mode === 'crema') {
          const col = this.mode === 'steam' ? '243,238,232' : (q.w > 3 ? '201,154,107' : '122,82,56');
          const g = c.createRadialGradient(0, 0, 0, 0, 0, s); g.addColorStop(0, `rgba(${col},${this.mode === 'steam' ? .11 : .22})`); g.addColorStop(1, `rgba(${col},0)`);
          c.fillStyle = g; c.scale(1 + .3 * Math.sin(this.t * .3 + q.w), 1.5); c.beginPath(); c.arc(0, 0, s, 0, 6.29); c.fill();
        } else if (this.mode === 'grounds') {
          c.rotate(q.a); c.globalAlpha = .35 + z * .25; c.fillStyle = q.w > 5.6 ? '#f8cbad' : q.w > 3 ? '#8a5a36' : '#5b3720';
          c.beginPath(); c.moveTo(-s, -s * .4); c.lineTo(s * .3, -s); c.lineTo(s, s * .2); c.lineTo(-s * .2, s); c.closePath(); c.fill();
        } else {
          c.globalAlpha = .25 + z * .2; c.strokeStyle = '#f3eee8'; c.lineWidth = 1 + z * .5; c.beginPath(); c.arc(0, 0, s, 0, 6.29); c.stroke();
          c.fillStyle = 'rgba(243,238,232,.5)'; c.beginPath(); c.arc(-s * .35, -s * .35, s * .16, 0, 6.29); c.fill();
        }
        c.restore();
      }
    });
  }
}

/* ---------------- quiz ---------------- */
// The closing quiz asks everything; a "Kurz-Check" at the end of each chapter asks that chapter's questions.
class Quiz {
  constructor(el) { this.el = el; this.ch = el.dataset.quiz ? +el.dataset.quiz : 0; this.Q = this.ch ? DATA.quiz.filter(q => q.ch === this.ch) : DATA.quiz; this.i = 0; this.res = []; this.render(); }
  render() {
    const el = this.el, Q = this.Q, short = !!this.ch, name = short ? 'Kurz-Check' : 'Quiz';
    const prog = `<div class="qprog" aria-hidden="true">${Q.map((_, k) => `<i class="${k < this.res.length ? (this.res[k] ? 'ok' : 'no') : k === this.i ? 'cur' : ''}"></i>`).join('')}</div>`;
    if (this.i >= Q.length) {
      const n = this.res.filter(Boolean).length;
      const msg = n === Q.length ? (short ? 'Sitzt. Weiter zum nächsten Kapitel.' : 'Alles richtig. Ab an die Maschine.') : n >= Q.length * .7 ? 'Stark. Die Theorie sitzt, jetzt kommt die Praxis.' : n >= Q.length * .4 ? 'Guter Anfang. Schau dir die markierten Szenen nochmal an.' : 'Noch mal durch die Szenen, dann klappt es.';
      const wrong = Q.filter((q, k) => !this.res[k]);
      el.innerHTML = `<div class="qhead"><span class="label">${name} · Ergebnis</span>${prog}</div>
        <div class="score">${n}<span style="font-size:.4em;color:var(--mute)"> / ${Q.length}</span></div>
        <p class="qtext">${msg}</p>
        ${wrong.length ? `<div class="stack" style="gap:8px"><span class="label">Nochmal ansehen</span><div style="display:flex;flex-wrap:wrap;gap:8px">${[...new Set(wrong.map(w => w.go))].map(g => `<button class="chip" data-goto="${g}">${scenes[ids.indexOf(g)].dataset.title}</button>`).join('')}</div></div>` : ''}
        <div class="qfoot"><button class="btn" data-again>Nochmal</button><button class="btn pri" data-action="next">${short ? 'Weiter' : 'Zum Abschluss'}</button></div>`;
      $('[data-again]', el).addEventListener('click', () => { this.i = 0; this.res = []; this.render(); });
      return;
    }
    const q = Q[this.i];
    el.innerHTML = `<div class="qhead"><span class="label">${name} · Frage ${this.i + 1} von ${Q.length}</span>${prog}</div>
      <p class="qtext">${q.q}</p>
      <div class="opts">${q.o.map((o, k) => `<button class="opt" data-k="${k}"><span class="k">${'ABC'[k]}</span><span>${o}</span></button>`).join('')}</div>
      <p class="explain" data-ex></p>
      <div class="qfoot"><button class="btn pri" data-nx hidden>${this.i === Q.length - 1 ? 'Ergebnis' : 'Nächste Frage'}</button><button class="chip" data-goto="${q.go}" data-gs hidden>Szene ansehen</button></div>`;
    $$('.opt', el).forEach(b => b.addEventListener('click', () => {
      const k = +b.dataset.k, ok = k === q.a;
      this.res[this.i] = ok;
      $$('.opt', el).forEach(x => { x.disabled = true; if (+x.dataset.k === q.a) x.classList.add('ok'); });
      if (!ok) b.classList.add('no');
      $('[data-ex]', el).innerHTML = (ok ? 'Richtig. ' : 'Nicht ganz. ') + q.e;
      $('[data-nx]', el).hidden = false; $('[data-gs]', el).hidden = false; $('[data-nx]', el).focus({ preventScroll: true });
      if (ok) sfx.whoosh(.03);
    }));
    $('[data-nx]', el).addEventListener('click', () => { this.i++; this.render(); });
  }
}

/* ---------------- scene hooks (filled by the scene files) ---------------- */
const hooks = {};
/*__SCENE_JS__*/

$$('[data-film]').forEach(r => films.set(r, new Film(r)));
$$('[data-amb]').forEach(el => { if (!el.closest('#trailer')) ambs.set(el, new Amb(el)); });
const filmsIn = sc => [...films.values()].filter(f => f.scene === sc);
const ambsIn = sc => [...ambs.values()].filter(a => a.el.closest('.scene') === sc);
$$('.quiz').forEach(el => new Quiz(el));

/* ---------------- progress & overview ---------------- */
const prog = $('#prog');
prog.innerHTML = scenes.map((s, k) => {
  const first = k > 0 && s.dataset.ch !== scenes[k - 1].dataset.ch ? ' ch1' : '';
  return `<button aria-label="${k + 1}: ${s.dataset.title}" title="${s.dataset.title}" data-k="${k}" class="${first}"></button>`;
}).join('');
$$('button', prog).forEach(b => b.addEventListener('click', () => go(+b.dataset.k)));
const ovCols = $('#ov-cols');
ovCols.innerHTML = CH.map((c, ch) => {
  const list = scenes.map((s, k) => [s, k]).filter(([s]) => +s.dataset.ch === ch);
  return `<div><h3>${c.n ? `<span class="n">${c.n}</span>` : ''}${c.name}</h3><ol>${list.map(([s, k]) => `<li><button data-k="${k}"><span class="i">${String(k + 1).padStart(2, '0')}</span><span>${s.dataset.title}</span></button></li>`).join('')}</ol></div>`;
}).join('');
$$('button', ovCols).forEach(b => b.addEventListener('click', () => { closeOverview(); go(+b.dataset.k); }));
function openOverview() { $$('button', ovCols).forEach(b => b.classList.toggle('cur', +b.dataset.k === state.i)); $('#overview').hidden = false; $('#overview .close').focus(); const c = $('button.cur', ovCols); if (c) c.scrollIntoView({ block: 'center' }); }
function closeOverview() { $('#overview').hidden = true; }

/* ---------------- scene lifecycle ---------------- */
function setStep(n) {
  const sc = scenes[state.i], h = hooks[sc.dataset.id];
  state.step = n; sc.dataset.step = n;
  $$('[data-s]', sc).forEach(e => e.classList.toggle('on', n >= +e.dataset.s));
  $$('[data-only]', sc).forEach(e => e.classList.toggle('on', e.dataset.only.split(',').includes(String(n))));
  $$('[data-go]', sc).forEach(b => { b.classList.toggle('on', +b.dataset.go === n); if (b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', +b.dataset.go === n); });
  if (h && h.step) h.step(sc, n);
}
// Scene changes use the View Transitions API where the browser has it: the old scene is snapshotted, shared parts
// (chapter kicker, film frame) morph into their new place, and a new cut can start at any moment – it simply takes
// over from the running one. Without the API the same change runs on plain CSS transitions, which retarget mid-way.
const VT = !!document.startViewTransition && !reduce;
const startVT = fn => { const t = document.startViewTransition(fn); t.ready.catch(() => {}); t.finished.catch(() => {}); return t; };   // a skipped transition is expected, not an error
document.documentElement.classList.toggle('vt', VT);
const vtParts = sc => [['kicker', $('.kicker', sc)], ['film', $('.film-frame', sc)]];
const vtName = (sc, on) => vtParts(sc).forEach(([n, el]) => { if (el) el.style.viewTransitionName = on ? 'ba-' + n : ''; });
function go(i, opts = {}) {
  if (i < 0 || i >= scenes.length) return;
  const prev = scenes[state.i], next = scenes[i], back = i < state.i, change = prev !== next;
  state.i = i;
  const swap = () => {
    if (change) {
      vtName(prev, false);
      prev.classList.remove('is-active', 'back');
      if (!VT) { prev.classList.add('is-leaving'); setTimeout(() => prev.classList.remove('is-leaving'), 780); }
      filmsIn(prev).forEach(f => f.leave()); ambsIn(prev).forEach(a => a.stop()); bgPlay(prev, false);
      const hp = hooks[prev.dataset.id]; if (hp && hp.leave) hp.leave(prev);
      next.classList.toggle('back', back);
      void next.offsetWidth;
      next.classList.add('is-active');
      $('.inner', next) && ($('.inner', next).scrollTop = 0);
      filmsIn(next).forEach(f => f.reset());
    }
    if (scenes[state.i] !== next) return;                 // a newer cut has already taken over
    vtName(next, true);
    const steps = +(next.dataset.steps || 0);
    setStep(opts.step === 'max' ? steps : (opts.step || 0));
    filmsIn(next).forEach(f => { f.enter(); f.paint(); }); ambsIn(next).forEach(a => a.start()); bgPlay(next, true); preloadNext(scenes[i + 1]);
    const hn = hooks[next.dataset.id]; if (hn && hn.enter && (change || !next._entered)) hn.enter(next);
    next._entered = true;
    hud();
  };
  if (change) {
    if (next.dataset.cut === 'leak' && !reduce) { const l = $('#leak'); l.classList.remove('go'); void l.offsetWidth; l.classList.add('go'); sfx.hit(.16); }
    else sfx.whoosh(.035);
  }
  if (VT && change && !opts.instant) {
    const root = document.documentElement; root.dataset.dir = back ? 'back' : 'fwd'; root.dataset.cut = next.dataset.cut || (next.dataset.ch !== prev.dataset.ch ? 'chapter' : '');
    vtName(prev, true);
    try { startVT(swap); } catch (e) { swap(); }
  } else swap();
  try { history.replaceState(null, '', '#' + next.dataset.id); } catch (e) {}
}
// steps inside a scene: with tabs, the active pill glides to its new place and the panes dissolve
function stepTo(n) {
  const sc = scenes[state.i], tabs = $('.tabs', sc);
  if (!VT || !tabs) return setStep(n);
  const mark = on => { const b = $('button.on', tabs); if (b) b.style.viewTransitionName = on ? 'ba-pill' : ''; };
  document.documentElement.dataset.cut = 'step'; mark(true);
  try { startVT(() => { mark(false); setStep(n); mark(true); }).finished.finally(() => $$('button', tabs).forEach(b => { b.style.viewTransitionName = ''; })); } catch (e) { setStep(n); }
}
function hud() {
  const s = scenes[state.i], ch = CH[s.dataset.ch];
  document.body.dataset.tone = s.classList.contains('light') ? 'light' : 'dark';
  $('#where').innerHTML = (ch.n ? `<em>${ch.n} ${ch.name}</em> · ` : '') + s.dataset.title;
  $('#count').textContent = `${state.i + 1} / ${scenes.length}`;
  $$('button', prog).forEach((b, k) => { b.classList.toggle('cur', k === state.i); b.classList.toggle('done', k < state.i); });
}
function next() {
  const sc = scenes[state.i], steps = +(sc.dataset.steps || 0);
  if (state.step < steps) { stepTo(state.step + 1); sfx.whoosh(.02); }
  else go(state.i + 1);
}
function prev() {
  if (state.step > 0 && +(scenes[state.i].dataset.steps || 0)) stepTo(state.step - 1);
  else go(state.i - 1, { step: 'max' });
}

/* ---------------- sound toggle ---------------- */
function setSound(on) {
  state.sound = on;
  const b = $('[data-action="sound"]'); b.setAttribute('aria-pressed', on);
  $('.lbl', b).textContent = on ? 'Ton an' : 'Ton aus';
  $('.w', b).style.display = on ? '' : 'none'; $('.x', b).style.display = on ? 'none' : '';
  if (on) sfx.ensure();
}

/* ---------------- intro (title cards over slow-motion backdrops) ---------------- */
const SHOTS = DATA.shots;
const tr = { el: $('#trailer'), run: 0, amb: null };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function trailer() {
  closeOverview();
  const run = ++tr.run, cur = scenes[state.i];
  filmsIn(cur).forEach(f => f.leave()); ambsIn(cur).forEach(a => a.stop()); bgPlay(cur, false);
  tr.el.hidden = false; $('#ttl').innerHTML = '';
  if (!tr.amb) tr.amb = new Amb($('#tr-amb'));
  tr.amb.size(); tr.amb.start();
  $('#tr-snd').textContent = state.sound ? 'Ton aus' : 'Ton an';
  requestAnimationFrame(() => tr.el.classList.add('in'));
  // real footage shots cross-fade on two video layers above the particle backdrop
  const layers = [$('#tr-v0'), $('#tr-v1')]; let flip = 0;
  const cue = name => { const v = layers[flip]; v.src = 'media/' + name + '.mp4'; v.muted = true; v.playsInline = true; v.load(); return v; };
  let nextV = SHOTS[0].vid ? cue(SHOTS[0].vid) : null;
  for (let k = 0; k < SHOTS.length; k++) {
    const S = SHOTS[k];
    if (S.amb) tr.amb.setMode(S.amb);
    layers.forEach(v => v.classList.remove('on'));
    if (S.vid && nextV) {
      const v = nextV, start = () => { try { v.currentTime = S.from || 0; } catch (e) {} v.playbackRate = S.rate || 1; v.play().catch(() => {}); v.classList.add('on'); };
      if (v.readyState > 0) start(); else v.addEventListener('loadedmetadata', start, { once: true });
      flip = 1 - flip;
    }
    const N = SHOTS[k + 1]; nextV = N && N.vid ? cue(N.vid) : null;
    $('#ttl').innerHTML = `<div class="${S.hold ? 'hold' : 'show'}" style="animation-duration:${S.dur}ms">${S.text}</div>`;
    sfx.hit(S.hold ? .26 : .12);
    await sleep(S.dur); if (run !== tr.run) return;
  }
  trEnd(true);
}
function trEnd(toAgenda) {
  tr.run++; tr.el.classList.remove('in'); if (tr.amb) tr.amb.stop(); tr.el.hidden = true;
  ['#tr-v0', '#tr-v1'].forEach(id => { const v = $(id); v.pause(); v.classList.remove('on'); v.removeAttribute('src'); v.load(); });
  if (toAgenda && state.i === 0) go(1); else go(state.i, { instant: true });
}

/* ---------------- events ---------------- */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-action]'), g = e.target.closest('[data-goto]'), st = e.target.closest('[data-go]');
  if (g) { closeOverview(); go(ids.indexOf(g.dataset.goto)); return; }
  if (st && st.closest('.scene') === scenes[state.i]) { stepTo(+st.dataset.go); sfx.whoosh(.02); return; }
  if (!a) return;
  const act = a.dataset.action;
  if (act === 'next') next();
  else if (act === 'prev') prev();
  else if (act === 'overview') openOverview();
  else if (act === 'overview-close') closeOverview();
  else if (act === 'sound') setSound(!state.sound);
  else if (act === 'fullscreen') toggleFs();
  else if (act === 'trailer') { if (a.closest('#s-start')) setSound(true); trailer(); }
  else if (act === 'trailer-skip') trEnd(true);
  else if (act === 'trailer-sound') { setSound(!state.sound); $('#tr-snd').textContent = state.sound ? 'Ton aus' : 'Ton an'; }
});
function toggleFs() { const d = document; try { if (!d.fullscreenElement) { const p = d.documentElement.requestFullscreen && d.documentElement.requestFullscreen(); if (p) p.catch(() => {}); } else { d.exitFullscreen && d.exitFullscreen().catch(() => {}); } } catch (e) {} }
document.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = e.target.tagName;
  if (!tr.el.hidden) { if (e.key === 'Escape' || e.key === 'ArrowRight') { e.preventDefault(); trEnd(true); } return; }
  if (!$('#overview').hidden) { if (e.key === 'Escape' || e.key === 'o') closeOverview(); return; }
  const inRange = tag === 'INPUT';
  if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && inRange) return;
  if (e.key === ' ' && (tag === 'BUTTON' || inRange)) return;
  switch (e.key) {
    case 'ArrowRight': case 'PageDown': case ' ': e.preventDefault(); next(); break;
    case 'ArrowLeft': case 'PageUp': e.preventDefault(); prev(); break;
    case 'Home': go(0); break;
    case 'End': go(scenes.length - 1); break;
    case 'o': case 'O': openOverview(); break;
    case 't': case 'T': setSound(!state.sound); break;
    case 'f': case 'F': toggleFs(); break;
    case 'i': case 'I': trailer(); break;
    case 'k': case 'K': { const f = filmsIn(scenes[state.i]).find(x => !x.bare); if (f) f.toggle(); break; }
  }
});
let sx = null, sy = null, st0 = 0;
document.addEventListener('touchstart', e => { if (e.target.closest('input, canvas, .cine-scrub, .noswipe')) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; st0 = Date.now(); }, { passive: true });
document.addEventListener('touchend', e => {
  if (sx === null || !tr.el.hidden || !$('#overview').hidden) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - st0 < 700) { dx < 0 ? next() : prev(); }
  sx = null;
}, { passive: true });
window.addEventListener('hashchange', () => { const k = ids.indexOf(location.hash.slice(1)); if (k >= 0 && k !== state.i) go(k); });
document.addEventListener('visibilitychange', () => { const sc = scenes[state.i]; if (document.hidden) { filmsIn(sc).forEach(f => f.leave()); ambsIn(sc).forEach(a => a.stop()); bgPlay(sc, false); } else if (tr.el.hidden) { filmsIn(sc).forEach(f => f.enter()); ambsIn(sc).forEach(a => a.start()); bgPlay(sc, true); } });
let wake = null;
document.addEventListener('click', () => { if (!wake && navigator.wakeLock) navigator.wakeLock.request('screen').then(w => { wake = w; w.addEventListener('release', () => wake = null); }).catch(() => {}); }, { passive: true });
if (!(document.documentElement.requestFullscreen && document.fullscreenEnabled)) $$('[data-action="fullscreen"]').forEach(b => b.hidden = true);

(function grain() {
  const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'); const d = x.createImageData(160, 160);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0); $('#grain').style.backgroundImage = `url(${c.toDataURL()})`;
})();

setSound(false);
const startK = Math.max(0, ids.indexOf(location.hash.slice(1)));
state.i = startK; scenes[startK].classList.add('is-active');
go(startK, { instant: true });
window.__ba = { go: (k, o = {}) => go(k, { ...o, instant: true }), ids, films, state };
})();
