import { CHAPTERS, scene, inner, rep, bgVideo } from '../lib.mjs';
const CH = 8;

const FACTORS = [
  ['Bohne', 'Aromapotenzial.', 'kapitel-3', '<ellipse cx="32" cy="32" rx="15" ry="23" transform="rotate(28 32 32)"/><path d="M22 14c12 8 4 26 20 36"/>'],
  ['Röstung', 'Löslichkeit und Aromatik.', 'roestgrade', '<path d="M32 8c10 12 14 18 14 28a14 14 0 01-28 0c0-6 4-10 6-16 2 4 4 6 6 6 0-6 0-12 2-18z"/>'],
  ['Mühle', 'Partikelverteilung.', 'kapitel-5', '<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="8"/><path d="M32 10v8M32 46v8M10 32h8M46 32h8M16.5 16.5l5.5 5.5M42 42l5.5 5.5M47.5 16.5L42 22M22 42l-5.5 5.5"/>'],
  ['Puck Preparation', 'Gleichmäßigkeit.', 'kapitel-6', '<path d="M24 6h16a4 4 0 014 4v6a8 8 0 01-8 8h-8a8 8 0 01-8-8v-6a4 4 0 014-4z"/><path d="M28 24v14h8V24"/><path d="M14 38h36v10H14z"/><path d="M8 56h48"/>'],
  ['Maschine', 'Temperatur und Druck.', 'kapitel-2', '<rect x="8" y="8" width="48" height="16" rx="3"/><path d="M14 24v32h36V24"/><path d="M26 24v8h12v-8"/><path d="M24 36h16l-2 6H26z"/><circle cx="46" cy="16" r="3"/>'],
  ['Extraktion', 'Geschmack und Konzentration.', 'kapitel-4', '<path d="M8 20h34v8a12 12 0 01-12 12H20A12 12 0 018 28z"/><path d="M42 23h16"/><path d="M25 46v6M25 58v2"/>']
];

export const css = `
.c9-chain .lk{opacity:.25;transition:opacity .7s,transform .9s var(--ease);transform:translateY(14px);text-align:left;cursor:pointer}
.c9-chain .lk.on{opacity:1;transform:none}
.c9-chain .lk:hover h3{color:var(--acc)}
.c9-line{height:2px;background:var(--line);position:relative;overflow:hidden;border-radius:1px}
.c9-line i{position:absolute;inset:0;background:var(--acc);transform-origin:0 50%;transform:scaleX(var(--p,0));transition:transform 1.1s var(--ease)}
.c9-sum{opacity:0;transform:translateY(12px);transition:opacity .8s,transform 1s var(--ease)}
.c9-sum.on{opacity:1;transform:none}
.c9-fin .giant{font-size:clamp(52px,9.4vw,190px);color:var(--milk)}
.c9-fin .giant em{font-style:normal;color:var(--peach)}
`;

export const html =
scene({ id: 'zusammenspiel', ch: CH, title: '8.1 Die wichtigsten Zusammenhänge', light: true, steps: 6, cut: 'leak' }, inner(`
  <div class="stack">
    <div class="kicker rv" style="--d:0">Abschluss</div>
    <h2 class="title rv" style="--d:1">Die Qualität eines Espressos hängt von sechs Faktoren ab</h2>
    <div class="c9-line rv" style="--d:2"><i id="c9-bar"></i></div>
    <div class="chain c9-chain rv" style="--d:2">${rep(6, i => `<button class="lk" data-s="${i + 1}" data-goto="${FACTORS[i][2]}">
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${FACTORS[i][3]}</svg>
      <span class="no">0${i + 1}</span><h3>${FACTORS[i][0]}</h3><p>${FACTORS[i][1]}</p></button>`)}</div>
    <p class="lead wide c9-sum" data-s="6" style="max-width:60ch"><b>Entscheidend ist das Zusammenspiel aller Komponenten.</b></p>
  </div>`)) +

scene({ id: 'quiz', ch: CH, title: 'Quiz', light: true }, inner(`<div class="quiz" id="quiz"></div>`)) +

scene({ id: 'finale', ch: CH, title: '8.2 Good Coffee Is No Accident', cut: 'leak', cls: 'c9-fin fin-v' }, `
  <div class="amb" data-amb="beans"></div><div class="chap-shade"></div>
  ${inner(`<div class="stack">
    <span class="label rv" style="--d:0">BUNCA.ACADEMY · Barista Advanced</span>
    <h2 class="giant rv" style="--d:1">Good coffee is <em>no accident.</em></h2>
    <p class="tagline rv" style="--d:4">Qualität entsteht durch:</p>
    <div class="finale-list">${['Wissen', 'Präzision', 'Technik', 'Erfahrung', 'Reproduzierbarkeit'].map((w, i) => `<span style="--i:${i}">${w}</span>`).join('')}</div>
    <div class="start-actions rv" style="--d:14"><button class="btn pri" data-goto="start">Von vorn</button><button class="btn" data-action="overview">Zur Übersicht</button></div>
  </div>`)}`);

export const js = `
hooks['zusammenspiel'] = { step(sc, n) { $('#c9-bar').style.setProperty('--p', n / 6); } };
`;
