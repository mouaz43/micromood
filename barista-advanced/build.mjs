// Builds index.html from src/. Run: node build.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { CHAPTERS, defs } from './src/lib.mjs';

const dir = new URL('./src/', import.meta.url);
const read = f => readFileSync(new URL(f, dir), 'utf8');
// --only=20-name builds the start scenes plus that one chapter file; --out=path writes somewhere else
const arg = k => (process.argv.find(a => a.startsWith('--' + k + '=')) || '').split('=')[1];
const only = arg('only'), outFile = arg('out');
const files = readdirSync(new URL('scenes/', dir)).filter(f => f.endsWith('.mjs') && (!only || f.startsWith('00-') || f.startsWith(only))).sort();
let html = '', js = '', css = '', quiz = [], shots = [];
for (const f of files) {
  const m = await import(new URL('scenes/' + f, dir));
  html += m.html || ''; css += m.css || ''; js += m.js ? `\n/* ${f} */\n${m.js}\n` : '';
  if (m.quiz) quiz = quiz.concat(m.quiz); if (m.shots) shots = m.shots;
}
const data = { chapters: CHAPTERS.map(c => ({ n: c.n, name: c.name.replace('\u00ad', '') })), quiz, shots };
const ids = [...html.matchAll(/data-id="([^"]+)"/g)].map(m => m[1]);
const dup = ids.filter((x, i) => ids.indexOf(x) !== i); if (dup.length) throw new Error('duplicate scene ids: ' + dup);
if (!only) for (const q of quiz) if (!ids.includes(q.go)) throw new Error('quiz points to unknown scene: ' + q.go);

const ico = {
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><g class="w"><path d="M15.5 9.5a3.5 3.5 0 010 5"/><path d="M18 7a7 7 0 010 10"/></g><g class="x"><path d="M16 9.5l5 5M21 9.5l-5 5"/></g></svg>',
  fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 5.5L8 12l6.5 6.5"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 5.5L16 12l-6.5 6.5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

const out = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Barista Advanced</title>
<meta name="author" content="Cengiz · BUNCA.ACADEMY">
<meta name="description" content="BUNCA.ACADEMY · Barista Advanced: vertiefendes Wissen rund um Kaffee, Espresso und Technik, mit Motion Graphics in Zeitlupe, interaktiven Grafiken und Quiz.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
${read('base.css')}${read('extra.css')}${css}</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">${defs}</svg>
<div id="stage">${html}
</div>
<div id="leak" aria-hidden="true"></div><div id="grain" aria-hidden="true"></div><div class="vignette" aria-hidden="true"></div>
<header class="hud">
  <div class="mark"><b>BUNCA</b><b style="color:var(--peach)">.</b><span>ACADEMY</span></div>
  <div class="hud-where" id="where"></div>
  <div class="hud-btns">
    <button class="hbtn" data-action="overview" aria-label="Übersicht öffnen">${ico.grid}<span class="lbl">Übersicht</span></button>
    <button class="hbtn" data-action="sound" aria-pressed="false" aria-label="Ton an oder aus">${ico.sound}<span class="lbl">Ton aus</span></button>
    <button class="hbtn" data-action="fullscreen" aria-label="Vollbild">${ico.fs}</button>
  </div>
</header>
<footer class="dock">
  <button class="nav" data-action="prev" aria-label="Zurück">${ico.left}</button>
  <div class="prog" id="prog"></div>
  <span class="count" id="count"></span>
  <button class="nav next" data-action="next" aria-label="Weiter">${ico.right}</button>
</footer>
<div id="overview" hidden role="dialog" aria-label="Übersicht">
  <button class="hbtn close" data-action="overview-close" aria-label="Übersicht schließen">${ico.close}<span class="lbl">Schließen</span></button>
  <div class="ov-cols" id="ov-cols"></div>
  <div class="keys"><span><kbd>←</kbd><kbd>→</kbd>Blättern</span><span><kbd>O</kbd>Übersicht</span><span><kbd>K</kbd>Film anhalten</span><span><kbd>T</kbd>Ton</span><span><kbd>F</kbd>Vollbild</span><span><kbd>I</kbd>Intro</span></div>
</div>
<div id="trailer" class="bars" hidden>
  <div class="amb" id="tr-amb" data-amb="beans"></div>
  <div class="ttl" id="ttl"></div>
  <div class="tr-ui"><button class="hbtn" data-action="trailer-sound" id="tr-snd">Ton an</button><button class="hbtn" data-action="trailer-skip">Überspringen</button></div>
</div>
<script type="application/json" id="ba-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script>
${read('engine.js').replace('/*__SCENE_JS__*/', () => js)}
</script>
</body>
</html>
`;
// --artifact: the same page without the document skeleton (the host adds its own)
const page = process.argv.includes('--artifact')
  ? out.replace(/^[\s\S]*?<title>/, '<title>').replace('<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n', '').replace('</head>\n<body>\n', '').replace('</body>\n</html>\n', '').replace('<title>Barista Advanced</title>', '<title>Barista Advanced</title>\n<meta name="claude:viewport-fit-sides" content="cover">')
  : out;
writeFileSync(outFile || new URL('./index.html', import.meta.url), page);
console.log(`built ${outFile || 'index.html'} · ${ids.length} scenes · ${quiz.length} quiz questions · ${(out.length / 1024).toFixed(0)} KB`);
