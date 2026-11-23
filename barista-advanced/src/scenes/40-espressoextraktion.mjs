import { chapter, scene, inner, kicker, film, notes, tbl, stats, why, rep, rng, defs, glass, f1, wave, steam, splash, glint , realFilm } from '../lib.mjs';
const CH = 4;
const BR = ['#5b3720', '#4a2c1a', '#6b4429', '#3a2114'];

// granular coffee bed inside a trapezoid (top y0, bottom y1, half widths w0 / w1 around cx)
const grains = (R, cx, y0, y1, w0, w1, n, r = 3.2) => rep(n, () => { const u = R(), y = y0 + u * (y1 - y0), hw = w0 + (w1 - w0) * u - 5; return `<circle cx="${f1(cx + (R() * 2 - 1) * hw)}" cy="${f1(y)}" r="${f1(r * (.6 + R() * .8))}" fill="${BR[Math.floor(R() * 4)]}"/>`; });

/* ---------- 4.1 extraction in cross-section ---------- */
const exSvg = () => { const R = rng(41), cx = 500; return defs + `
  <clipPath id="ex-puck"><path d="M354 132 L646 132 L628 300 L372 300 Z"/></clipPath>
  <!-- group head and basket -->
  <rect x="330" y="26" width="340" height="62" rx="10" fill="url(#g-steel-v)"/><rect x="476" y="26" width="48" height="62" fill="#e3704f" opacity=".55" data-k="o:0@.3 .55@1.2"/>
${glint(330, 26, 340, 62, 7)}
  <ellipse cx="500" cy="104" rx="170" ry="34" fill="#e3704f" filter="url(#f-glow)" data-k="o:0@.6 .45@2.8 .3@9 .45@12 .1@17.4"/>
  <path d="M344 92 H656" stroke="#f3eee8" stroke-width="3" stroke-dasharray="3 7"/>
  <g data-k="sy:0@.6 1@2.6" style="transform-origin:50% 0%"><path d="M350 94 L650 94 L646 132 L354 132 Z" fill="#e3704f" opacity=".5"/></g>
  <path d="M354 132 L646 132 L628 300 L372 300 Z" fill="#7a5238"/>
  ${grains(R, cx, 136, 296, 142, 126, 300)}
  <g clip-path="url(#ex-puck)">
    <g data-k="sy:0@3 1@9.4" style="transform-origin:50% 0%"><rect x="350" y="132" width="300" height="168" fill="#1d110a" opacity=".5"/></g>
    <g data-k="y:0@3 168@9.4;o:0@2.9 1@3.2 1@9 0@9.6"><rect x="350" y="129" width="300" height="5" fill="#e3704f"/></g>
    <g data-k="o:0@6 1@7.5">${rep(46, i => { const x = f1(366 + R() * 268), y = f1(140 + R() * 120), L = f1(1.6 + R() * 1.6); return `<circle cx="${x}" cy="${y}" r="${f1(2 + R() * 1.6)}" fill="#d9a35f" data-loop="${L}" data-off="${f1(R() * 3)}" data-k="y~:0@0 ${f1(40 + R() * 50)}@${L};o:0@0 1@${f1(L * .25)} 1@${f1(L * .7)} 0@${L}"/>`; })}</g>
  </g>
  <path d="M348 92 L370 304 Q371 310 378 310 L622 310 Q629 310 630 304 L652 92" fill="none" stroke="url(#g-steel)" stroke-width="7" stroke-linejoin="round"/>
  <path d="M374 305 H626" stroke="#17120f" stroke-width="3" stroke-dasharray="5 7"/>
  <!-- pressure -->
  <g data-k="o:0@2.6 1@3.2 1@16.5 0@17.4">${rep(3, i => `<g data-loop="1.4" data-off="${i * .2}" data-k="y:-6@0 8@.7 -6@1.4"><path d="M${420 + i * 80} 98 v20 m-7 -8 l7 9 l7 -9" fill="none" stroke="#f3eee8" stroke-width="3" stroke-linecap="round"/></g>`)}</g>
  <g transform="translate(170 250)"><circle r="74" fill="#1d1814" stroke="url(#g-steel)" stroke-width="6"/>
    ${rep(9, i => `<path d="M0 -60 v10" stroke="#f3eee8" stroke-width="${i > 5 ? 4 : 2}" stroke-opacity="${i > 5 ? 1 : .6}" transform="rotate(${-120 + i * 30})"/>`)}
    <g style="transform-origin:50% 100%" data-k="r^:-120@2.4 70@5.2 68@8 71@11 69@16.2 -120@17.4"><path d="M0 0 V-52" stroke="#f8cbad" stroke-width="5" stroke-linecap="round"/></g>
    <circle r="7" fill="#f8cbad"/><text y="108" class="tl mid">Druck</text></g>
  <!-- espresso leaves the basket -->
  <g data-k="o:0@9.4 1@10.2 1@13 0@13.6">${rep(7, i => `<ellipse cx="${410 + i * 30}" cy="316" rx="5" ry="6" fill="#7a4a28" data-k="sy:0@${f1(9.4 + (i % 3) * .3)} 1@${f1(10.6 + (i % 3) * .3)} 2.3@${f1(12.4 + (i % 4) * .2)};x:0@11.6 ${(3 - i) * 9}@13.2" style="transform-origin:50% 0%"/>`)}
    ${rep(5, i => `<ellipse cx="${440 + i * 30}" cy="322" rx="4" ry="6" fill="#7a4a28" data-loop="1.1" data-off="${f1(i * .27)}" data-k="y>:0@0 120@1.1;sy:.6@0 1.8@1;o:0@0 1@.15 1@.95 0@1.1"/>`)}</g>
  <g data-k="o:0@12.8 1@13.6 1@16.6 0@17.4"><g data-loop="1.1" data-k="sx:1@0 .93@.55 1@1.1"><path d="M404 312 Q500 356 494 392 L494 458 L506 458 L506 392 Q500 356 596 312 Z" fill="url(#g-espresso)"/>
    ${rep(3, i => `<path d="M${470 + i * 30} 316 Q500 356 ${498 + i * 2} 396 V456" fill="none" stroke="#f8cbad" stroke-width="1.5" stroke-opacity=".5" stroke-dasharray="26 34" data-loop="1.2" data-off="${f1(i * .4)}" data-k="d~:0@0 -60@1.2"/>`)}</g></g>
  <clipPath id="ex-cup"><path d="M440 384 L449 470 L551 470 L560 384 Z"/></clipPath>
  <g clip-path="url(#ex-cup)"><g data-k="sy:0@13.4 1@17" style="transform-origin:50% 100%"><path d="M451 420 L455 466 L545 466 L549 420 Z" fill="#3a2114"/><rect x="451" y="420" width="98" height="8" fill="#d9a35f"/>${wave(450, 420, 100, '#d9a35f', 3, 1.6)}</g>
    <g data-k="y:44@13.4 0@17;o:0@13.5 1@13.9 1@16.5 0@17.2">${splash(500, 421, '#f8cbad')}</g></g>
  ${steam(500, 386, 3, 'data-k="o:0@14.4 1@15.8 1@16.8 0@17.6"')}
  ${glass(438, 388, 124, 78)}
  <!-- labels -->
  <g class="ts"><text x="714" y="62">Brühgruppe</text><path class="lead-l" d="M706 56 H672"/>
    <text x="714" y="118" data-k="o:0@.6 1@1.4">heißes Wasser</text><path class="lead-l" d="M706 112 H654" data-k="o:0@.6 1@1.4"/>
    <text x="714" y="222">Kaffeepuck</text><path class="lead-l" d="M706 216 H640"/>
    <text x="714" y="312">Sieb</text><path class="lead-l" d="M706 306 H634"/>
    <text x="714" y="262" fill="#d9a35f" data-k="o:0@6.4 1@7.6" style="fill:#d9a35f">gelöste Bestandteile</text></g>`; };

/* ---------- 4.2 phases: one shot split over three glasses ---------- */
const phSvg = () => { const G = [[480, '#2a170d', .5, 2.4, 6.8, '0–10 s', 1], [680, '#5b3720', .82, 7.3, 14.3, '10–25 s', 0], [880, '#b08656', .36, 14.8, 17.6, '25–30+ s', 0]]; return defs + `
  <defs><linearGradient id="ph-bar" x1="0" x2="1"><stop offset="0" stop-color="#2a170d"/><stop offset=".33" stop-color="#5b3720"/><stop offset=".8" stop-color="#b08656"/><stop offset="1" stop-color="#e2c08f"/></linearGradient></defs>
  <!-- continuous colour bar -->
  <rect x="290" y="40" width="620" height="16" rx="8" fill="url(#ph-bar)" stroke="#f3eee8" stroke-opacity=".25"/>
  <path d="M490 34v28M790 34v28" stroke="#f3eee8" stroke-width="2"/>
  <text x="390" y="88" class="ts mid">0–10 s</text><text x="640" y="88" class="ts mid">10–25 s</text><text x="850" y="88" class="ts mid">25–30+ s</text>
  <g data-k="x~:0@2 620@17.5"><path d="M290 28 v40" stroke="#f8cbad" stroke-width="4" stroke-linecap="round"/></g>
  <!-- portafilter spout -->
  <rect x="380" y="118" width="200" height="34" rx="8" fill="url(#g-steel-v)"/><path d="M580 126 h150" stroke="url(#g-steel-v)" stroke-width="16" stroke-linecap="round"/>
  <path d="M462 152 h36 l-8 22 h-20 z" fill="url(#g-steel)"/>
  <g data-k="o:0@2 1@2.3 1@17.5 0@17.9"><g data-k="sy>:0@2 1@2.5" style="transform-origin:50% 0%"><g data-loop=".9" data-k="sx:1@0 .8@.45 1@.9"><rect x="474" y="174" width="12" height="262" rx="6" data-k="fill:#2a170d@2 #5b3720@7.5 #b08656@14.8 #e2c08f@17.6;sx:1@2 1@12 .55@17.5"/><rect x="478" y="174" width="2" height="262" fill="#f3eee8" opacity=".3"/></g></g></g>
  <!-- three glasses sliding under the spout -->
  <g data-k="x^:0@6.7 -200@7.4 -200@14.2 -400@14.9">${G.map(([cx, c, f, a, b, lab, crema], gi) => `
    <clipPath id="ph-c${gi}"><path d="M${cx - 53} 290 L${cx - 44} 441 L${cx + 44} 441 L${cx + 53} 290 Z"/></clipPath>
    <g clip-path="url(#ph-c${gi})"><g data-k="y:${f1(126 * f)}@${a} 0@${b};o:0@${a} 1@${f1(a + .3)} 1@${f1(b - .1)} 0@${f1(b + .3)}">${splash(cx, f1(436 - 126 * f), crema ? '#d9a35f' : '#c99a6b')}</g></g>
    <g clip-path="url(#ph-c${gi})"><g data-k="sy:0@${a} 1@${b}" style="transform-origin:50% 100%">${wave(cx - 55, f1(436 - 126 * f), 110, crema ? '#d9a35f' : c, 3.5, f1(1.7 + gi * .3))}<path d="M${cx - 50 + 9 * (1 - f)} ${f1(436 - 126 * f)} L${cx + 50 - 9 * (1 - f)} ${f1(436 - 126 * f)} L${cx + 41} 441 L${cx - 41} 441 Z" fill="${c}"/>${crema ? `<rect x="${cx - 46}" y="${f1(436 - 126 * f)}" width="92" height="9" fill="#d9a35f"/>` : `<rect x="${cx - 44}" y="${f1(436 - 126 * f)}" width="88" height="3" fill="#f3eee8" opacity=".3"/>`}</g></g>
    ${steam(cx, f1(430 - 126 * f), 2, `data-k="o:0@${f1(b - .6)} 1@${f1(b + .8)}"`)}
    ${glass(cx - 55, 300, 110, 136)}<text x="${cx}" y="476" class="ts mid">${lab}</text>`).join('')}</g>
  <text x="48" y="190" class="tl">Bezugszeit</text><text x="48" y="238" class="tb" style="font-size:46px" data-num="0@2 31@17.5" data-fmt="mm:ss"></text>`; };

/* ---------- 4.3 solubility ---------- */
const SOL = [
  ['Organische Säuren', 'Säure und Frische', i => `<path d="M0 -8 L8 6 L-8 6 Z" fill="#f8cbad"/>`],
  ['Zucker und Abbauprodukte', 'Süße und Karamell', i => `<path d="M-7 -4 L0 -8 L7 -4 L7 4 L0 8 L-7 4 Z" fill="#d9a35f"/>`],
  ['Aromastoffe', 'Fruchtige, florale, nussige Noten', i => `<circle r="6.5" fill="none" stroke="#f3eee8" stroke-width="2.5"/>`],
  ['Bitterstoffe', 'Bitterkeit', i => `<rect x="-6.5" y="-6.5" width="13" height="13" fill="#7a5238" stroke="#c99a6b" stroke-width="1.5"/>`],
  ['Lipide', 'Körper und Mundgefühl', i => `<path d="M0 -9 Q8 2 0 8 Q-8 2 0 -9 Z" fill="#c99a6b" stroke="#f8cbad" stroke-width="1.5"/>`],
  ['Melanoidine', 'Farbe, Körper und Röstaromen', i => `<circle cx="-5" r="5.5" fill="#6b4429" stroke="#c99a6b" stroke-width="1.5"/><circle cx="5" r="5.5" fill="#6b4429" stroke="#c99a6b" stroke-width="1.5"/>`]
];
const ST = i => f1(i * 2.2);
const solSvg = () => { const R = rng(43); return defs + `
  <path d="M96 290 C80 200 150 150 220 164 C300 150 340 230 322 300 C340 380 260 420 200 404 C130 420 96 360 96 290 Z" fill="url(#g-bean)" stroke="#2a170d" stroke-width="3"/>
  ${rep(26, () => `<circle cx="${f1(130 + R() * 160)}" cy="${f1(196 + R() * 180)}" r="${f1(3 + R() * 7)}" fill="#1d110a" opacity=".55"/>`)}
  <text x="210" y="456" class="ts mid">Kaffeepartikel</text>
  ${rep(6, i => { const y = 122 + i * 60, dy = y - 286; return `
    <g data-k="o:0@${ST(i)} 1@${f1(ST(i) + .6)}">${rep(5, j => `<g transform="translate(318 286)"><g data-loop="2.5" data-off="${f1(j * .5 + i * .13)}" data-k="x~:0@0 104@2.5;y~:0@0 ${dy}@2.5;o:0@0 1@.5 1@2.1 0@2.5;r~:0@0 ${120 + j * 40}@2.5">${SOL[i][2]()}</g></g>`)}</g>
    <g data-k="o:.22@${ST(i)} 1@${f1(ST(i) + .6)}"><g transform="translate(446 ${y})"><g data-k="s:1@${ST(i)} 1.5@${f1(ST(i) + .5)} 1.15@${f1(ST(i) + 1.4)}">${SOL[i][2]()}</g></g>
      <text x="476" y="${y + 2}" class="t">${SOL[i][0]}</text><text x="476" y="${y + 25}" class="ts">${SOL[i][1]}</text></g>`; })}`; };

/* ---------- 4.6 channeling ---------- */
const chSvg = () => { const R = rng(46);
  const basket = cx => `<path d="M${cx - 152} 124 L${cx - 138} 286 Q${cx - 137} 292 ${cx - 130} 292 L${cx + 130} 292 Q${cx + 137} 292 ${cx + 138} 286 L${cx + 152} 124" fill="none" stroke="url(#g-steel)" stroke-width="7" stroke-linejoin="round"/><path d="M${cx - 132} 287 H${cx + 132}" stroke="#17120f" stroke-width="3" stroke-dasharray="5 7"/>`;
  const bed = (cx, id) => `<clipPath id="${id}"><path d="M${cx - 146} 160 L${cx + 146} 160 L${cx + 136} 284 L${cx - 136} 284 Z"/></clipPath>
    <g data-k="sy:0@.4 1@2" style="transform-origin:50% 0%"><path d="M${cx - 149} 126 L${cx + 149} 126 L${cx + 146} 160 L${cx - 146} 160 Z" fill="#e3704f" opacity=".5"/></g>
    <path d="M${cx - 146} 160 L${cx + 146} 160 L${cx + 136} 284 L${cx - 136} 284 Z" fill="#7a5238"/>${grains(R, cx, 164, 280, 140, 132, 200, 3)}`;
  return defs + `
  <text x="250" y="104" class="tb mid">Gleichmäßig</text><text x="710" y="104" class="tb mid">Channeling</text>
  <!-- left: even -->
  ${bed(250, 'ch-a')}
  <g clip-path="url(#ch-a)"><g data-k="sy:0@2.4 1@8" style="transform-origin:50% 0%"><rect x="100" y="160" width="300" height="124" fill="#1d110a" opacity=".52"/></g>
    <g data-k="y:0@2.4 124@8;o:0@2.3 1@2.6 1@7.6 0@8.2"><rect x="100" y="157" width="300" height="5" fill="#e3704f"/></g></g>
  ${basket(250)}
  <g data-k="o:0@8 1@8.8 1@10.4 0@11">${rep(7, i => `<ellipse cx="${160 + i * 30}" cy="298" rx="5" ry="7" fill="#7a4a28" data-k="sy:0@${f1(8 + (i % 3) * .2)} 1@${f1(8.9 + (i % 3) * .2)} 2.2@${f1(10.2 + (i % 2) * .2)};x:0@9.6 ${(3 - i) * 8}@10.8" style="transform-origin:50% 0%"/>`)}</g>
  <g data-k="o:0@10.2 1@11"><g data-loop="1.2" data-k="sx:1@0 .94@.6 1@1.2"><path d="M150 294 Q250 344 244 384 L244 470 L256 470 L256 384 Q250 344 350 294 Z" fill="url(#g-espresso)"/>
    ${rep(3, i => `<path d="M${215 + i * 35} 298 Q250 344 ${248 + i * 2} 388 V468" fill="none" stroke="#f8cbad" stroke-width="1.5" stroke-opacity=".5" stroke-dasharray="26 34" data-loop="1.2" data-off="${f1(i * .4)}" data-k="d~:0@0 -60@1.2"/>`)}</g></g>
  <!-- right: channel -->
  ${bed(710, 'ch-b')}
  <g clip-path="url(#ch-b)">
    <g data-k="sy:0@2.4 .42@9 .5@15" style="transform-origin:50% 0%"><rect x="560" y="160" width="300" height="124" fill="#1d110a" opacity=".52"/></g>
    <g data-k="sy:0@3.6 1@5.2" style="transform-origin:50% 0%"><path d="M748 160 L792 160 L800 284 L770 284 Z" fill="#1d110a" opacity=".6"/></g>
    <path d="M770 160 L764 190 L776 214 L768 244 L782 284" fill="none" stroke="#e2c08f" stroke-width="5" stroke-linejoin="round" class="draw" pathLength="1" data-k="d:1@2.6 0@4.4"/>
    <g data-k="o:0@5 1@5.6">${rep(8, i => `<circle cx="${768 + (i % 3) * 5}" cy="170" r="3" fill="#cfe3f2" data-loop=".8" data-off="${f1(i * .1)}" data-k="y~:0@0 112@.8;o:1@0 1@.7 0@.8"/>`)}</g>
  </g>
  ${basket(710)}
  <g data-k="o:0@5 1@5.5">
    ${[[-22, 1], [14, 1.3], [34, .9]].map(([a, L], i) => `<g transform="translate(782 292)"><g style="transform-origin:50% 0%" data-loop="${L}" data-k="r:${a - 5}@0 ${a + 6}@${f1(L / 2)} ${a - 5}@${L}"><path d="M0 0 Q4 80 -2 172" fill="none" stroke="#e2c08f" stroke-width="${4 - i}" stroke-linecap="round"/></g></g>`).join('')}
    ${rep(10, i => { const L = f1(.7 + R() * .6), dx = f1(R() * 160 - 60); return `<circle cx="782" cy="296" r="${f1(2 + R() * 2)}" fill="#e2c08f" data-loop="${L}" data-off="${f1(R())}" data-k="x~:0@0 ${dx}@${L};y>:0@0 ${f1(60 + R() * 110)}@${L};o:1@0 1@${f1(L * .7)} 0@${L}"/>`; })}
  </g>
  <g data-k="o:0@9 1@10"><text x="620" y="262" class="ts mid" style="fill:#f3eee8">trocken</text><text x="876" y="230" class="ts" style="fill:#e2c08f">Kanal</text><path class="lead-l" d="M870 224 L794 216"/></g>`; };

/* ---------- 4.4 four mini loops ---------- */
const mini = (dur, svg) => `<div data-film data-bare data-dur="${dur}"><svg class="dg ic" viewBox="0 0 240 132" aria-hidden="true">${svg}</svg></div>`;
const R4 = rng(44);
const dots = (x0, n, r) => rep(n, () => `<circle cx="${f1(x0 + r + R4() * (84 - 2 * r))}" cy="${f1(26 + r + R4() * (58 - 2 * r))}" r="${r}" fill="#6b4429"/>`);
const MINI = [
  mini(4, `<rect x="22" y="22" width="92" height="66" rx="6" fill="#f3eee8" stroke="#262626" stroke-width="2"/>${dots(26, 70, 2.2)}<rect x="128" y="22" width="92" height="66" rx="6" fill="#f3eee8" stroke="#262626" stroke-width="2"/>${dots(132, 13, 7)}
    <ellipse cx="68" cy="98" rx="3" ry="5" fill="#7a5238" data-loop="4" data-k="y~:0@0 26@4;o:0@0 1@.6 1@3.4 0@4"/>${rep(3, i => `<ellipse cx="${160 + i * 14}" cy="98" rx="3" ry="5" fill="#7a5238" data-loop="1" data-off="${f1(i * .33)}" data-k="y~:0@0 26@1;o:1@0 1@.8 0@1"/>`)}
    <text x="68" y="14" class="tl mid">fein</text><text x="174" y="14" class="tl mid">grob</text>`),
  mini(4, [[66, 4, 'niedriger', '#7fb4dc'], [174, 1.3, 'höher', '#b8452a']].map(([cx, L, lab, col]) => `<circle cx="${cx}" cy="66" r="19" fill="#6b4429"/>${rep(8, i => `<g transform="translate(${cx} 66) rotate(${i * 45})"><circle r="3.4" fill="#c99a6b" stroke="#262626" data-loop="${L}" data-off="${f1(i * L / 8)}" data-k="x~:20@0 44@${L};o:0@0 1@${f1(L * .3)} 0@${L}"/></g>`)}<rect x="${cx - 30}" y="118" width="60" height="5" rx="2.5" fill="${col}"/><text x="${cx}" y="14" class="tl mid">${lab}</text>`).join('')),
  mini(3, `<rect x="60" y="54" width="120" height="44" rx="6" fill="#6b4429" stroke="#262626" stroke-width="2"/>${rep(4, i => `<g data-loop="1.5" data-off="${f1(i * .15)}" data-k="y:-5@0 7@.75 -5@1.5"><path d="M${78 + i * 28} 14 v24 m-7 -9 l7 10 l7 -10" fill="none" stroke="#262626" stroke-width="3" stroke-linecap="round"/></g>`)}
    ${rep(4, i => `<ellipse cx="${78 + i * 28}" cy="106" rx="3" ry="5" fill="#7a5238" data-loop="1.5" data-off="${f1(i * .37)}" data-k="y~:0@0 22@1.5;o:1@0 1@1.2 0@1.5"/>`)}`),
  mini(6, `<circle cx="120" cy="70" r="46" fill="#f3eee8" stroke="#262626" stroke-width="2.5"/><rect x="112" y="10" width="16" height="12" rx="3" fill="#262626"/>
    <g transform="rotate(-90 120 70)"><circle cx="120" cy="70" r="23" fill="none" stroke="#7a5238" stroke-width="46" stroke-dasharray="144.5" data-k="d~:144.5@0 0@6" opacity=".5"/></g>
    <g style="transform-box:view-box;transform-origin:120px 70px" data-k="r~:0@0 360@6"><path d="M120 70 V30" stroke="#262626" stroke-width="3.5" stroke-linecap="round"/></g><circle cx="120" cy="70" r="4" fill="#262626"/>`)
];
const PARAMS = [
  ['1. Mahlgrad', ['<b>Fein:</b> mehr Oberfläche, höherer Widerstand.', '<b>Grob:</b> weniger Oberfläche, schnellerer Durchfluss.']],
  ['2. Temperatur', ['<b>Höher:</b> schnellere Lösung vieler Bestandteile.', '<b>Niedriger:</b> langsamere Extraktion.']],
  ['3. Druck', ['Ermöglicht den Wasserfluss durch den Puck.', 'Beeinflusst den Durchfluss.']],
  ['4. Kontaktzeit', ['Bestimmt die Dauer des Stoffaustauschs.']]
];
const slider = (id, l, r, min, max, val, step = 1) => `<div class="slider"><div class="ends"><span>${l}</span><span>${r}</span></div><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${l}"></div>`;

export const css = `
.c4-calc{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(10px,1.6vw,26px)}
.c4-calc .slider .ends span:last-child{font-family:var(--mono);color:var(--strong)}
@media (max-width:760px){.c4-calc{grid-template-columns:minmax(0,1fr)}}
.c4-zone{min-height:4.6em}
.c4-band{position:relative;height:44px}
.c4-band .bar{position:absolute;left:0;right:0;top:16px;height:8px;border-radius:4px;background:var(--line)}
.c4-band .ok{position:absolute;top:10px;height:20px;border:2px solid var(--ink);border-radius:6px;left:40%;width:20%}
.c4-band .nd{position:absolute;top:6px;width:3px;height:28px;border-radius:2px;background:var(--brown);left:50%;transition:left .25s var(--ease)}
.c4-band .cap{position:absolute;top:34px;left:50%;transform:translateX(-50%);font-size:12px;color:var(--mute);white-space:nowrap;margin:0}
.c4-params .card{gap:8px}
.c4-params .card h3{font-size:clamp(18px,1vw + 10px,28px)}
`;

export const html = chapter(CH) +

film({ id: 'extraktion', ch: CH, title: '4.1 Grundlagen der Extraktion', name: 'Was im Puck passiert', dur: 18, rate: .5, still: 12,
  marks: [
    ['Heißes Wasser trifft auf den Puck', 0, 'Heißes Wasser füllt den Raum über dem verdichteten Kaffeemehl.'],
    ['Druck baut sich auf', 2.6, 'Das Wasser wird <b>unter Druck</b> durch den Puck gepresst.'],
    ['Wasser durchdringt das Kaffeemehl', 5.6, 'Die Front wandert gleichmäßig von oben nach unten.'],
    ['Lösliche Bestandteile lösen sich', 9.4, 'Dabei werden <b>lösliche Bestandteile</b> herausgelöst.'],
    ['Espresso verlässt das Sieb', 13, 'Aus vielen Tropfen wird ein Strahl.']
  ], svg: exSvg(),
  extra: `<span class="label">Entscheidende Faktoren</span><div class="chips" style="margin-top:8px">${['Mahlgrad', 'Temperatur', 'Druck', 'Kontaktzeit', 'Durchfluss', 'Brew Ratio', 'Puck Preparation'].map(c => `<span class="chip">${c}</span>`).join('')}</div>` }) +

film({ id: 'phasen', ch: CH, title: '4.2 Extraktionsphasen', name: 'Ein Bezug, drei Gläser', dur: 19, rate: .5, still: 16,
  marks: [
    ['Vor dem Bezug', 0, 'Vereinfachtes Modell eines Espressobezugs: wir fangen ihn in drei Gläsern auf.'],
    ['0–10 Sekunden', 2, '<b>Benetzung und erste Extraktion.</b> Leicht lösliche Bestandteile kommen zuerst.'],
    ['10–25 Sekunden', 7.1, '<b>Hauptphase der Extraktion.</b> Weitere Aromastoffe und lösliche Verbindungen folgen.'],
    ['25–30+ Sekunden', 14.6, '<b>Weitere Extraktion und zunehmende Verdünnung.</b> Der Strahl wird heller und dünner.']
  ], svg: phSvg() }) +

scene({ id: 'phasen-modell', ch: CH, title: 'Extraktionsphasen: das Modell', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Fließend, nicht in Stufen</h2>
      <div class="rv" style="--d:2">${tbl(['Zeitbereich', 'Vorgang'], [['0–10 Sekunden', 'Benetzung und erste Extraktion'], ['10–25 Sekunden', 'Hauptphase der Extraktion'], ['25–30+ Sekunden', 'Weitere Extraktion und zunehmende Verdünnung']])}</div>
      <div class="rv" style="--d:3">${why('<b>Hinweis:</b> Die Extraktion verläuft kontinuierlich, nicht in strikt getrennten Phasen.')}</div>
    </div>
    <div class="stack">
      <span class="label rv" style="--d:2">Grundsätzlich</span>
      <div class="rv" style="--d:3">${notes(['Leicht lösliche Bestandteile werden schnell extrahiert.', 'Weitere Aromastoffe und lösliche Verbindungen folgen.', 'Zu starke oder ungleichmäßige Extraktion kann Bitterkeit und Adstringenz verstärken.'])}</div>
      <div class="rv-img" style="--d:4"><svg class="dg" viewBox="0 0 620 120" role="img" aria-label="Farbverlauf eines Bezugs von dunkel nach hell">
        <defs><linearGradient id="pm-g" x1="0" x2="1"><stop offset="0" stop-color="#2a170d"/><stop offset=".33" stop-color="#5b3720"/><stop offset=".8" stop-color="#b08656"/><stop offset="1" stop-color="#e2c08f"/></linearGradient></defs>
        <rect x="10" y="20" width="600" height="34" rx="17" fill="url(#pm-g)" stroke="#262626" stroke-width="2"/>
        <path d="M204 12v50M494 12v50" stroke="#262626" stroke-width="1.5" stroke-dasharray="4 5"/>
        <text x="10" y="92" class="tm">0 s</text><text x="204" y="92" class="tm mid">10 s</text><text x="494" y="92" class="tm mid">25 s</text><text x="610" y="92" class="tm end">30+ s</text>
        <text x="10" y="114" class="ts">konzentriert, dunkel</text><text x="610" y="114" class="ts end">verdünnt, hell</text></svg></div>
    </div>
  </div>`)) +

film({ id: 'loeslichkeit', ch: CH, title: '4.3 Löslichkeit der Kaffeebestandteile', name: 'Was sich aus dem Kaffee löst', dur: 17, rate: 1, still: 16,
  marks: [...SOL.map((s, i) => [s[0], ST(i), `<b>${s[0]}</b> → ${s[1]}`]), ['Ziel: Balance', 13.6, '<b>Ziel:</b> ein ausgewogenes Verhältnis der extrahierten Bestandteile.']], svg: solSvg() }) +

scene({ id: 'parameter', ch: CH, title: '4.4 Die vier Extraktionsparameter', light: true }, inner(`
  <div class="stack">
    ${kicker(CH)}
    <h2 class="title rv" style="--d:1">Vier Hebel für jede Extraktion</h2>
    <div class="cmp c4-params" style="--n:4">${rep(4, i => `<div class="card rv" style="--d:${i + 2}">${MINI[i]}<h3>${PARAMS[i][0]}</h3>${notes(PARAMS[i][1], 'sm')}</div>`)}</div>
  </div>`)) +

scene({ id: 'ey-tds', ch: CH, title: '4.5 Extraction Yield und TDS', light: true }, inner(`
  <div class="split rev">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Extraktion messen</h2>
      <div class="grid2 rv" style="--d:2">
        <div class="card"><span class="label acc">TDS – Total Dissolved Solids</span><p style="margin-top:6px">Anteil gelöster Feststoffe im fertigen Kaffee. Angabe in Prozent.</p></div>
        <div class="card"><span class="label acc">Extraction Yield</span><p style="margin-top:6px">Anteil der ursprünglichen Kaffeemasse, der extrahiert wurde.</p></div>
      </div>
      <p class="formula rv" style="--d:3">Extraction Yield = (TDS × Getränkemasse) / Kaffeemasse</p>
      <div class="c4-calc rv" style="--d:4">
        ${slider('ey-dose', 'Kaffee', '18 g', 14, 22, 18, .5)}${slider('ey-out', 'Espresso', '36 g', 20, 60, 36)}${slider('ey-tds', 'TDS', '10 %', 6, 13, 10, .1)}
      </div>
      <p class="formula rv" style="--d:5" id="ey-calc" aria-live="polite"></p>
      <button class="chip rv" style="--d:6" id="ey-reset">Beispiel aus dem Kurs: 18 g · 36 g · 10 %</button>
    </div>
    <div class="stack rv-img" style="--d:2;align-items:center;text-align:center">
      <svg class="dg" viewBox="0 0 300 190" style="max-width:340px" role="img" aria-label="Refraktometer">
        <rect x="40" y="30" width="220" height="130" rx="26" fill="#f3eee8" stroke="#262626" stroke-width="2.5"/><rect x="66" y="52" width="110" height="52" rx="8" fill="#262626"/>
        <text x="121" y="88" class="mid" fill="#f8cbad" font-family="JetBrains Mono, monospace" font-size="25" id="ey-disp">10,0 %</text>
        <circle cx="216" cy="78" r="24" fill="#b0a7a1" stroke="#262626" stroke-width="2.5"/><circle cx="216" cy="78" r="10" fill="#6b4429"/>
        <path d="M216 4 Q228 22 216 30 Q204 22 216 4 Z" fill="#6b4429" class="pulse"/><text x="150" y="140" class="tl mid">Refraktometer</text>
      </svg>
      <div><div class="big-num" style="font-size:clamp(60px,7vw,130px)" id="ey-val">20 %</div><span class="label">Extraction Yield</span></div>
      <div class="c4-band" style="width:min(100%,360px)"><div class="bar"></div><div class="ok"></div><div class="nd" id="ey-nd"></div><p class="cap">Markiert: 18–22 % (Richtwert)</p></div>
    </div>
  </div>`)) +

film({ id: 'channeling', ch: CH, title: '4.6 Channeling', name: 'Channeling in Zeitlupe', dur: 16, rate: .5, still: 12,
  marks: [
    ['Zwei Pucks, gleiches Wasser', 0, '<b>Channeling:</b> ungleichmäßiger Wasserfluss durch den Kaffeepuck.'],
    ['Schwachstelle im Puck', 2.6, 'Klumpen, Hohlräume oder schiefes Tampen hinterlassen eine Schwachstelle.'],
    ['Wasser nimmt den leichtesten Weg', 5, 'Im Kanal schießt das Wasser durch. Der Rest bleibt unterextrahiert.'],
    ['Spritzen am Bottomless-Siebträger', 8, 'Links ein ruhiger Strahl, rechts <b>Spritzen</b> und unregelmäßiger Durchfluss.'],
    ['Ergebnis in der Tasse', 11.4, 'Ungleichmäßige Extraktion: <b>bittere und saure</b> Eindrücke gleichzeitig.']
  ], svg: chSvg() }) +

scene({ id: 'channeling-ursachen', ch: CH, title: 'Channeling: Ursachen und Folgen', light: true }, inner(`
  <div class="stack">
    ${kicker(CH)}
    <h2 class="title rv" style="--d:1">Der Weg des geringsten Widerstands</h2>
    <p class="lead wide rv" style="--d:2"><b>Definition:</b> Ungleichmäßiger Wasserfluss durch den Kaffeepuck.</p>
    <div class="grid2">
      <div class="card rv" style="--d:3"><span class="label acc">Ursachen</span><div style="margin-top:10px">${notes(['Ungleichmäßige Mahlgutverteilung.', 'Klumpenbildung.', 'Schiefes Tampen.', 'Hohlräume im Kaffeepuck.', 'Fehlerhafte Puck Preparation.'])}</div></div>
      <div class="card rv" style="--d:4"><span class="label acc">Folgen</span><div style="margin-top:10px">${notes(['Ungleichmäßige Extraktion.', 'Bittere und saure Eindrücke gleichzeitig.', 'Unregelmäßiger Durchfluss.', 'Spritzen beim Bottomless-Siebträger.'])}</div></div>
    </div>
  </div>`)) +

scene({ id: 'widerstand', ch: CH, title: '4.7 Puck-Widerstand und Durchfluss', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Der Puck bremst das Wasser</h2>
      <p class="lead wide rv" style="--d:2">Der Kaffeepuck erzeugt Widerstand für das Wasser.</p>
      <div class="rv" style="--d:3"><span class="label">Einflussfaktoren</span><div class="chips" style="margin-top:8px">${['Mahlgrad', 'Partikelverteilung', 'Kaffeemenge', 'Verdichtung', 'Siebgeometrie'].map(c => `<span class="chip">${c}</span>`).join('')}</div></div>
      <div class="rv" style="--d:4">${slider('pw-r', 'Zu geringer Widerstand', 'Zu hoher Widerstand', 0, 100, 50)}</div>
      <div class="card c4-zone rv" style="--d:5"><span class="label acc" id="pw-h"></span><p id="pw-t" style="margin-top:6px"></p></div>
    </div>
    <div class="stack rv-img" style="--d:2">
      <svg class="dg" viewBox="0 0 560 330" role="img" aria-label="Wasserfluss durch den Puck">${(() => { const R = rng(47); return `
        <path d="M110 30 L450 30 L436 60 L124 60 Z" fill="#b8452a" opacity=".45"/>
        <path d="M124 60 L436 60 L420 190 L140 190 Z" fill="#7a5238"/><g id="pw-grains">${grains(R, 280, 64, 186, 150, 136, 150, 4)}</g>
        ${rep(7, i => `<path class="flow pw-f" d="M${154 + i * 42} 40 V${250}" fill="none" stroke="#f3eee8" stroke-width="3" stroke-linecap="round"/>`)}
        <path d="M106 26 L136 196 Q137 204 146 204 L414 204 Q423 204 424 196 L454 26" fill="none" stroke="#262626" stroke-width="4" stroke-linejoin="round"/>
        <path d="M214 262 L220 318 L340 318 L346 262" fill="#f3eee8" stroke="#262626" stroke-width="3" stroke-linejoin="round"/><rect x="221" y="262" width="118" height="56" fill="#6b4429" id="pw-cup" style="transform-box:fill-box;transform-origin:50% 100%;transition:transform .4s"/>`; })()}
      </svg>
      <div class="readout">
        <div><div class="big-num" id="pw-time">30 s</div><span class="u">Bezugszeit für 36 g (Beispielrechnung)</span></div>
        <div><div class="big-num" id="pw-flow">1,2 g/s</div><span class="u">Durchfluss</span></div>
      </div>
    </div>
  </div>`)) +

scene({ id: 'brew-ratio', ch: CH, title: '4.8 Brew Ratio, Durchfluss und Bezugszeit', light: true, steps: 3 }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Rezept in drei Zahlen</h2>
      <p class="formula rv" style="--d:2">Brew Ratio = Kaffee : Getränkemasse</p>
      <div class="rv" style="--d:3"><span class="label">Ratio wählen · Beispiel bei 18 g Kaffee</span><div class="tabs" style="margin-top:8px" role="group" aria-label="Brew Ratio">${['1:1,5', '1:2', '1:2,5', '1:3'].map((r, i) => `<button data-go="${i}" aria-pressed="false">${r}</button>`).join('')}</div></div>
      <div class="rv" style="--d:4">${tbl(['Ratio', 'Beispiel bei 18 g Kaffee'], [['1:1,5', '27 g Espresso'], ['1:2', '36 g Espresso'], ['1:2,5', '45 g Espresso'], ['1:3', '54 g Espresso']])}</div>
    </div>
    <div class="stack rv-img" style="--d:2">
      <svg class="dg" viewBox="0 0 560 250" role="img" aria-label="Kaffee und Getränk auf der Waage">
        <rect x="40" y="206" width="200" height="30" rx="8" fill="#262626"/><text x="140" y="227" class="mid" fill="#f8cbad" font-family="JetBrains Mono, monospace" font-size="17">18,0 g</text>
        <path d="M70 150 L78 200 L202 200 L210 150 Z" fill="#6b4429" stroke="#262626" stroke-width="2.5"/><path d="M60 150 H220" stroke="#262626" stroke-width="5" stroke-linecap="round"/><text x="140" y="130" class="t mid">Kaffee</text>
        <text x="280" y="170" class="mid" font-size="46" fill="#7a5238">:</text>
        <rect x="320" y="206" width="200" height="30" rx="8" fill="#262626"/><text x="420" y="227" class="mid" fill="#f8cbad" font-family="JetBrains Mono, monospace" font-size="17" id="br-scale">36,0 g</text>
        <rect x="363" y="72" width="114" height="128" fill="#6b4429" id="br-fill" style="transform-box:fill-box;transform-origin:50% 100%;transition:transform .8s cubic-bezier(.2,.7,.1,1)"/>
        <path d="M356 66 L364 200 L476 200 L484 66" fill="none" stroke="#262626" stroke-width="3" stroke-linejoin="round"/><text x="420" y="46" class="t mid">Getränk</text>
      </svg>
      <div class="card"><span class="label acc">Durchfluss berechnen</span>
        <p class="formula" style="margin-top:8px;background:none;padding:0" id="br-calc"></p>
        ${slider('br-t', 'Bezugszeit', '30 s', 20, 40, 30)}
      </div>
    </div>
  </div>`));

export const js = `
(() => {
  // 4.5 extraction yield calculator
  const dose = $('#ey-dose'), out = $('#ey-out'), tds = $('#ey-tds');
  const ends = el => $('.ends span:last-child', el.closest('.slider'));
  function ey() {
    const d = +dose.value, o = +out.value, t = +tds.value, y = t / 100 * o / d;
    ends(dose).textContent = de(d, 1) + ' g'; ends(out).textContent = de(o) + ' g'; ends(tds).textContent = de(t, 1) + ' %';
    $('#ey-calc').innerHTML = '(' + de(t / 100, 3).replace(/0$/, '') + ' × ' + de(o) + ') / ' + de(d, 1).replace(',0', '') + ' = ' + de(y, 3).replace(/0$/, '') + ' → <b>Extraction Yield = ' + de(y * 100, 1).replace(',0', '') + ' %</b>';
    $('#ey-val').textContent = de(y * 100, 1).replace(',0', '') + ' %'; $('#ey-disp').textContent = de(t, 1) + ' %';
    $('#ey-nd').style.left = clamp((y * 100 - 10) / 20 * 100, 0, 100) + '%';
  }
  [dose, out, tds].forEach(el => el.addEventListener('input', ey));
  $('#ey-reset').addEventListener('click', () => { dose.value = 18; out.value = 36; tds.value = 10; ey(); });
  ey();

  // 4.7 puck resistance
  const pw = $('#pw-r'), ZT = [
    ['Zu geringer Widerstand', 'Schneller Durchfluss. Kürzere Kontaktzeit. Potenziell unausgewogene Extraktion.'],
    ['Im Zielbereich', 'Das Wasser fließt gleichmäßig. Die Kontaktzeit passt zum Rezept.'],
    ['Zu hoher Widerstand', 'Langsamer Durchfluss. Lange Bezugszeit. Potenziell ungleichmäßige Extraktion.']];
  function res() {
    const v = +pw.value, time = 30 * Math.pow(2, (v - 50) / 45), z = v < 34 ? 0 : v > 66 ? 2 : 1;
    $('#pw-time').textContent = de(time) + ' s'; $('#pw-flow').textContent = de(36 / time, 1) + ' g/s';
    $('#pw-h').textContent = ZT[z][0]; $('#pw-t').textContent = ZT[z][1];
    $$('.pw-f').forEach(p => { p.style.animationDuration = (time / 27).toFixed(2) + 's'; p.style.opacity = clamp(1.25 - v / 110, .3, 1); });
    $('#pw-grains').style.opacity = .55 + v / 220; $('#pw-cup').style.transform = 'scaleY(' + clamp(1.5 - v / 80, .35, 1) + ')';
  }
  pw.addEventListener('input', res); res();

  // 4.8 brew ratio and flow
  const RAT = [1.5, 2, 2.5, 3], bt = $('#br-t'); let br = 1;
  function flow() {
    const o = 18 * RAT[br], t = +bt.value;
    $('#br-scale').textContent = de(o, 1) + ' g'; $('#br-fill').style.transform = 'scaleY(' + (o / 54) + ')';
    $('.ends span:last-child', bt.closest('.slider')).textContent = t + ' s';
    $('#br-calc').innerHTML = de(o) + ' g Getränk / ' + t + ' Sekunden = <b>' + de(o / t, 1) + ' g/s</b>';
    $$('#s-brew-ratio .tbl tbody tr').forEach((r, k) => r.classList.toggle('hl', k === br));
  }
  bt.addEventListener('input', flow);
  hooks['brew-ratio'] = { enter(sc) { setTimeout(() => { if (state.step === 0) setStep(1); }, 0); }, step(sc, n) { br = n; flow(); } };
  flow();
})();
`;

export const quiz = [
  { q: '18 g Kaffee, 36 g Espresso, 10 % TDS. Wie hoch ist der Extraction Yield?', o: ['10 %', '20 %', '36 %'], a: 1, e: '(0,10 × 36) / 18 = 0,20. Der Extraction Yield liegt bei <b>20 %</b>.', go: 'ey-tds' },
  { q: 'Woran erkennst du Channeling am Bottomless-Siebträger?', o: ['An einem ruhigen, zentrierten Strahl.', 'An besonders dunkler Crema.', 'An Spritzen und unregelmäßigem Durchfluss.'], a: 2, e: 'Das Wasser nimmt den leichtesten Weg. Die Folge: <b>Spritzen</b>, ungleichmäßige Extraktion, bitter und sauer zugleich.', go: 'channeling' }
];
