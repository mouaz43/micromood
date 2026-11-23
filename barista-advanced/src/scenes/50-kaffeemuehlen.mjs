import { chapter, scene, inner, kicker, film, notes, tbl, why, rep, rng, defs, glass, bean, wave, splash, glint, f1 , realFilm } from '../lib.mjs';
const CH = 5;

/* ---------- shared drawing parts ---------- */
const D = defs + `<defs>
  <pattern id="c5-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#17120f" stroke-width="1.5" stroke-opacity=".42"/></pattern>
  <pattern id="c5-hatch-l" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#262626" stroke-width="1.2" stroke-opacity=".28"/></pattern>
  <linearGradient id="c5-body" x1="0" x2="1"><stop offset="0" stop-color="#2b2420"/><stop offset=".3" stop-color="#5a4f47"/><stop offset="1" stop-color="#241e1a"/></linearGradient>
  <linearGradient id="c5-wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#8a817a"/><stop offset="1" stop-color="#5a524c"/></linearGradient>
  <linearGradient id="c5-burr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e2ddd8"/><stop offset="1" stop-color="#a39a93"/></linearGradient>
  ${[['p', '#f8cbad'], ['m', '#f3eee8'], ['i', '#262626'], ['b', '#7a5238']].map(([k, c]) => `<marker id="c5-a${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${c}" style="visibility:visible"/></marker>`).join('')}
  <radialGradient id="c5-heat"><stop offset="0" stop-color="#e3704f" stop-opacity=".8"/><stop offset=".45" stop-color="#e3704f" stop-opacity=".32"/><stop offset="1" stop-color="#e3704f" stop-opacity="0"/></radialGradient>
</defs>`;
// cut housing parts (hatched) and burrs (bright steel)
const wall = d => `<path d="${d}" fill="url(#c5-wall)"/><path d="${d}" fill="url(#c5-hatch)" stroke="#f3eee8" stroke-opacity=".5" stroke-width="1.5" stroke-linejoin="round"/>`;
const burr = d => `<path d="${d}" fill="url(#c5-burr)" stroke="#f3eee8" stroke-opacity=".75" stroke-width="1.2" stroke-linejoin="round"/>`;
const chip = (x, y, s, fill, o = '') => `<path d="M${f1(x - s)} ${f1(y - s * .3)}l${f1(s * 1.2)} ${f1(-s * .7)}l${f1(s * .8)} ${f1(s * .9)}l${f1(-s * 1.1)} ${f1(s * .9)}z" fill="${fill}" ${o}/>`;
const cbean = (x, y, s, r, fill, line = '#1d110a') => `<g transform="translate(${x} ${y}) rotate(${r})"><ellipse rx="${s}" ry="${f1(s * .68)}" fill="${fill}"/><path d="M${f1(-s * .8)} 0C${f1(-s * .3)} ${f1(-s * .3)} ${f1(s * .3)} ${f1(s * .3)} ${f1(s * .8)} 0" fill="none" stroke="${line}" stroke-width="${f1(Math.max(1, s * .1))}" stroke-linecap="round"/></g>`;
let cpN = 0;
// a turning part seen from the side: slanted tooth lines that march sideways (run / rest = opacity keys)
const spinner = (x, y, w, h, o = {}) => {
  const { p = 16, T = .5, col = '#2a2420', slant = .35, clip, run, rest, dir = 1 } = o;
  const id = `c5-cp${++cpN}`, n = Math.ceil(w / p) + 4;
  const lines = rep(n, i => `<path d="M${f1(x - 2 * p + i * p)} ${y}l${f1(-h * slant)} ${h}" stroke="${col}" stroke-width="2.2" stroke-opacity=".6"/>`);
  return `<clipPath id="${id}">${clip || `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`}</clipPath><g clip-path="url(#${id})">${rest ? `<g data-k="o:${rest}">${lines}</g>` : ''}<g${run ? ` data-k="o:${run}"` : ''}><g data-loop="${T}" data-k="x~:0@0 ${dir * p}@${T}">${lines}</g></g></g>`;
};
// a highlight that wanders over a steel or glass part of any outline
const shine = (d, x, y, w, h, L = 6, off = 0) => { const id = `c5-cp${++cpN}`; return `<clipPath id="${id}"><path d="${d}"/></clipPath>${glint(x, y, w, h, L, `clip-path="url(#${id})" data-off="${off}"`)}`; };
// something that falls under gravity and tumbles: one loop of length L
const drop = (inner, L, off, dy, rot, fade = '') => `<g data-loop="${L}" data-off="${off}" data-k="y>:0@0 ${dy}@${f1(L * .9)};o:0@0 1@${f1(L * .12)} 1@${f1(L * .74)} 0@${f1(L * .9)}${fade}"><g data-loop="${L}" data-off="${off}" data-k="r~:0@0 ${rot}@${L}">${inner}</g></g>`;
const C1 = '#8a5a36', C2 = '#d9a35f';

/* ---------- 5.1 exploded view ---------- */
const aufbauSvg = () => {
  const R = rng(51), A = 380;
  const RUN = '0@12.9 1@13.4 1@21.2 0@21.6', REST = '1@12.9 0@13.4 0@21.2 1@21.6';
  // parts leave one after the other and snap back in reverse order (k = place in the queue)
  const ex = (a, dy, dx, k) => { const e0 = f1(11.05 + k * .13), e1 = f1(e0 + 1); return `${dx ? `x^:0@${a} ${dx}@${f1(a + 1)} ${dx}@${e0} 0@${e1}${dy ? ';' : ''}` : ''}${dy ? `y^:0@${a} ${dy}@${f1(a + 1)} ${dy}@${e0} 0@${e1}` : ''}`; };
  const lab = (t, x, y, txt, lx, ly) => `<g data-k="o:0@${t} 1@${f1(t + .4)} 1@10.6 0@11"><path class="lead-l" d="M${x - 8} ${y - 8}L${lx} ${ly}"/><circle cx="${lx}" cy="${ly}" r="3.5" fill="#f8cbad" data-k="s^:0@${t} 1@${f1(t + .6)}"/><text x="${x}" y="${y}" class="t">${txt}</text></g>`;
  const dot = (x, y, n, a) => `<g data-k="o:0@${a} 1@${f1(a + .3)};s^:.3@${a} 1@${f1(a + .6)}"><circle cx="${x}" cy="${y}" r="14" fill="#f8cbad"/><text x="${x}" y="${y + 7}" class="mid" fill="#262626" font-size="20" font-weight="500">${n}</text></g>`;
  const stp = (n, y, txt, a, b) => `<g data-k="o:.35@${a} 1@${f1(a + .4)}${b ? ` 1@${b} .4@${f1(b + .4)}` : ''}"><text x="640" y="${y}" class="t"><tspan class="tm">${n}</tspan><tspan dx="12">${txt}</tspan></text></g>`;
  const pile = rows => rows.map(([y, n]) => rep(n, i => bean(f1(A - (n - 1) * 10.5 + i * 21 + R() * 5 - 2.5), f1(y + R() * 4 - 2), 9.5, Math.round(R() * 180)))).join('');
  const hop = 'M296 94V132Q296 150 326 166L358 186H402L434 166Q464 150 464 132V94Z';
  return D + `
  <path d="M40 453H920" stroke="#5a4f47" stroke-width="2" data-k="o:1@2.6 0@3.2 0@12 1@12.8"/>
  <path class="lead-l" d="M${A} 16V482" data-k="o:0@2.6 .8@3.4 .8@10.6 0@11.2"/>
  <g data-k="o:1@1.9 0@2.5"><text x="640" y="236" class="tb">Kaffeemühle</text><text x="640" y="266" class="ts">sechs zentrale Komponenten</text></g>
  <!-- motor -->
  <g data-k="${ex(7.6, 70, 0, 0)}">
    <rect x="${A - 6}" y="262" width="12" height="40" fill="url(#g-steel)"/>
    ${spinner(A - 6, 266, 12, 30, { p: 8, T: .3, slant: .5, run: RUN, rest: REST })}
    <rect x="318" y="296" width="124" height="104" rx="10" fill="url(#c5-body)" stroke="#8a817a" stroke-width="1.5"/>
    ${rep(7, i => `<path d="M326 ${311 + i * 13}H434" stroke="#17120f" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>`)}
    <rect x="334" y="398" width="92" height="10" rx="3" fill="url(#g-steel)"/>
    ${shine('M318 296H442V400H318Z', 318, 296, 124, 104, 7, 2.5)}
  </g>
  <!-- grind chamber with the lower burr -->
  <g data-k="${ex(5.2, 28, 0, 2)}">
    <rect x="304" y="212" width="152" height="62" fill="#120f0d"/>
    ${wall('M292 212H304V274H372V284H292Z M388 274H456V268H468V284H388Z M456 212H468V248H456Z')}
    ${burr('M312 250L362 256H398L448 250V266H312Z')}
    ${spinner(312, 257, 136, 9, { p: 12, T: .4, run: RUN, rest: REST })}
    <rect x="332" y="266" width="96" height="8" fill="url(#g-steel)"/>
  </g>
  <!-- upper burr -->
  <g data-k="${ex(5.3, -6, 0, 2.6)}">
    ${burr('M312 224H362V238L312 246Z M398 224H448V246L398 238Z')}
    ${rep(4, i => `<path d="M${322 + i * 11} 226v${f1(16 - i * 1.6)}M${438 - i * 11} 226v${f1(16 - i * 1.6)}" stroke="#2a2420" stroke-opacity=".5" stroke-width="2"/>`)}
    ${shine('M312 224H362V238L312 246Z M398 224H448V246L398 238Z', 312, 224, 136, 22, 6, 1)}
  </g>
  <!-- friction heat between the burrs while the grinder runs -->
  <ellipse cx="${A}" cy="249" rx="62" ry="9" fill="#e3704f" filter="url(#f-glow)" data-k="o:0@16 .55@17.6 .55@21 0@21.6"/>
  <!-- chute -->
  <g data-k="${ex(6.8, 44, 66, 1)}">
    <path d="M466 258H500Q520 258 527 276L552 338" fill="none" stroke="url(#g-steel-v)" stroke-width="24"/>
    <path d="M466 258H500Q520 258 527 276L552 338" fill="none" stroke="#120f0d" stroke-width="15"/>
  </g>
  <!-- adjustment collar -->
  <g data-k="${ex(4.4, -28, 0, 3.6)}">
    <rect x="300" y="186" width="160" height="26" rx="5" fill="url(#g-steel)" stroke="#f3eee8" stroke-opacity=".4"/>
    ${rep(31, i => `<path d="M${305 + i * 5} 189V198" stroke="#17120f" stroke-opacity=".4" stroke-width="1.5"/>`)}
    ${rep(15, i => `<path d="M${310 + i * 10} ${i % 5 ? 205 : 202}V209" stroke="#17120f" stroke-opacity=".7" stroke-width="1.5"/>`)}
    ${shine('M300 186H460V212H300Z', 300, 186, 160, 26, 5, 3.4)}
  </g>
  <!-- hopper: the pile sinks a little while the grinder feeds -->
  <g data-k="${ex(3.6, -56, 0, 4.6)}">
    ${pile([[178, 2], [165, 4], [151, 6]])}
    <g data-k="y~:0@13.4 9@21 9@21.3 0@21.9">${pile([[137, 7], [123, 7], [110, 7]])}</g>
    <path d="${hop}" fill="rgba(243,238,232,.07)" stroke="#f3eee8" stroke-width="2" stroke-opacity=".7" stroke-linejoin="round"/>
    <rect x="290" y="86" width="180" height="9" rx="4" fill="url(#g-steel)"/>
    <path d="M308 102V128" stroke="#f3eee8" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>
    ${shine(hop, 296, 94, 168, 92, 6)}
  </g>
  <!-- housing -->
  <g data-k="x^:0@2.6 -230@3.6 -230@11.75 0@12.75">
    <ellipse cx="${A}" cy="456" rx="128" ry="6" fill="#000" opacity=".6" filter="url(#f-soft)"/>
    <g data-k="o:1@12.9 .13@13.4 .13@21.1 1@21.6">
      <rect x="280" y="212" width="200" height="230" rx="24" fill="url(#c5-body)"/>
      <rect x="262" y="438" width="236" height="15" rx="5" fill="url(#g-steel)"/>
      <rect x="464" y="244" width="16" height="30" rx="4" fill="#120f0d"/>
      <circle cx="316" cy="402" r="9" fill="#17120f" stroke="#8a817a" stroke-width="1.5"/><path d="M316 396v6" stroke="#f8cbad" stroke-width="2" stroke-linecap="round"/>
      <path d="M300 240V380" stroke="#f3eee8" stroke-opacity=".1" stroke-width="5" stroke-linecap="round"/>
      ${shine('M304 212H456Q480 212 480 236V442H280V236Q280 212 304 212Z', 280, 212, 200, 230, 8, .6)}
    </g>
    <rect x="280" y="212" width="200" height="230" rx="24" fill="none" stroke="#8a817a" stroke-width="1.5"/>
    <g data-k="o:0@3.4 1@3.9 1@10.6 0@11"><text x="${A}" y="196" class="t mid">Gehäuse</text></g>
  </g>
  <!-- labels of the exploded view -->
  ${lab(4.3, 650, 78, 'Bohnenbehälter', 468, 66)}
  ${lab(5.1, 650, 180, 'Mahlgradverstellung', 464, 171)}
  ${lab(5.9, 650, 238, 'Mahlscheiben', 452, 229)}
  ${lab(6.5, 650, 294, 'Mahlkammer', 472, 262)}
  ${lab(7.5, 650, 356, 'Auswurfschacht', 622, 349)}
  ${lab(8.3, 650, 424, 'Motor', 446, 414)}
  <!-- the grinder at work -->
  <g data-k="o:${RUN}">
    <rect x="${A - 16}" y="186" width="32" height="40" fill="#120f0d" opacity=".92"/>
    <text x="640" y="150" class="tl">Funktionsweise</text>
    ${stp(1, 194, 'Bohnen ins Mahlwerk', 13.4, 15.8)}
    ${stp(2, 232, 'Bohnen zerkleinern', 16, 18.8)}
    ${stp(3, 270, 'Mahlgut auswerfen', 19)}
    ${dot(492, 176, 1, 13.4)}${dot(252, 250, 2, 16)}${dot(604, 330, 3, 19)}
  </g>
  <g data-k="o:0@13.3 1@13.7 1@21 0@21.5">${rep(4, i => drop(bean(f1(A - 8 + R() * 16), 170, 8.5, Math.round(R() * 180)), 1, f1(i * .25 + R() * .08), 82, i % 2 ? 230 : -190))}</g>
  <g data-k="o:0@15.8 1@16.3 1@21 0@21.5">${rep(14, i => { const sg = i % 2 ? 1 : -1, L = f1(1 + R() * .5), off = f1(R() * 2), x0 = f1(A + sg * (6 + R() * 8)); return `<g data-loop="${L}" data-off="${off}" data-k="x~:0@0 ${sg * 62}@${L};y~:0@0 -5@${L};s:1@0 .3@${f1(L * .8)};o:0@0 1@${f1(L * .15)} 1@${f1(L * .85)} 0@${L}"><g data-loop="${L}" data-off="${off}" data-k="r~:0@0 ${sg * 300}@${L}">${chip(x0, 252, 4.5, i % 3 ? C1 : '#c99a6b')}</g></g>`; })}</g>
  <g data-k="o:0@18.6 1@19 1@21 0@21.5">
    ${rep(18, i => { const L = f1(1.3 + R() * .5), off = f1(R() * 2), j = f1(R() * 6 - 3); return `<g data-loop="${L}" data-off="${off}" data-k="x~:0@0 40@${f1(L * .22)} 66@${f1(L * .38)} 90@${f1(L * .66)} ${f1(92 + j)}@${L};y~:0@0 0@${f1(L * .22)} 18@${f1(L * .38)} 80@${f1(L * .66)};o:0@0 1@${f1(L * .1)} 1@${f1(L * .92)} 0@${L}"><circle cx="462" cy="${f1(258 + j)}" r="${f1(1.8 + R() * 1.4)}" fill="${i % 3 ? C1 : '#c99a6b'}" data-loop="${L}" data-off="${off}" data-k="y>:0@${f1(L * .66)} 106@${L}"/></g>`; })}
    <g data-k="sy<:0@19.3 1@21.2" style="transform-origin:50% 100%"><path d="M523 450Q552 408 581 450Z" fill="#7a5238"/></g>
  </g>
  <g data-k="o:${RUN}">${glass(514, 386, 76, 58)}${shine('M516 386H588L582 452H522Z', 514, 386, 76, 66, 5, 1.2)}</g>`;
};

/* ---------- 5.2 two workflows ---------- */
const wheel = (x, y) => `<circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#f3eee8" stroke-opacity=".8" stroke-width="2"/>${rep(6, i => `<path d="M${x} ${y}L${f1(x + 17 * Math.cos(i * 1.047))} ${f1(y + 17 * Math.sin(i * 1.047))}" stroke="#f3eee8" stroke-opacity=".8" stroke-width="2"/>`)}`;
const wfSingle = () => {
  const B = [[66, 232], [80, 233], [94, 232], [73, 222], [88, 222], [80, 212], [95, 213]];
  return `<svg class="dg c5-wf" viewBox="0 0 320 300" role="img" aria-label="Single Dosing: eine Dosis abwiegen und komplett mahlen">${D}
  <path d="M8 272H312" stroke="#262626" stroke-opacity=".35" stroke-width="2"/>
  <rect x="20" y="248" width="120" height="24" rx="7" fill="#262626" opacity=".85"/>
  <g data-k="y^:0@.8 1.5@1 0@1.4"><rect x="28" y="240" width="104" height="8" rx="3" fill="#7a736d" stroke="#262626" stroke-width="1.5"/></g>
  <rect x="50" y="253" width="60" height="15" rx="3" fill="#f3eee8"/>
  <text x="80" y="265" class="tm mid" style="font-size:12px" data-num="0@.8 18@2.9 18@3.4 0@4.4" data-fmt="{} g" data-dec="1">18,0 g</text>
  <rect x="248" y="150" width="30" height="116" rx="5" fill="#262626" opacity=".8"/>
  <rect x="176" y="264" width="112" height="8" rx="4" fill="#262626"/>
  <rect x="192" y="120" width="86" height="64" rx="12" fill="#3a342f" stroke="#262626" stroke-width="2"/>
  <g data-k="r:0@4.7 760@6.9 780@7.3">${wheel(238, 152)}</g>
  <circle cx="206" cy="134" r="4.5" data-k="fill:#7a736d@4.6 #f8cbad@4.8 #f8cbad@6.9 #7a736d@7.1"/>
  <path d="M218 184L222 200H242L246 184Z" fill="#7a736d" stroke="#262626" stroke-width="2"/>
  ${rep(7, i => { const [x, y] = B[i], a = f1(.5 + i * .31 + (i % 2) * .05), h = f1(3.2 + i * .12), tx = 222 + (i % 3) * 9, ty = 100 + (i % 2) * 6, dx = tx - x, dy = ty - y;
    return `<g data-k="x~:0@${h} ${dx}@${f1(h + .8)};y>:-230@${a} 0@${f1(a + .42)};o:0@${a} 1@${f1(a + .1)} 1@5 0@5.5"><g data-k="y<:0@${f1(a + .42)} -6@${f1(a + .53)} 0@${f1(a + .66)} 0@${h} ${dy - 46}@${f1(h + .4)}"><g data-k="y>:0@${f1(h + .4)} 46@${f1(h + .8)} 46@4.8 62@5.5;r~:0@${a} ${i % 2 ? 150 : -120}@${f1(a + .5)} ${i % 2 ? 150 : -120}@${h} ${i % 2 ? 420 : -380}@${f1(h + .8)}">${bean(x, y, 7, (i * 47) % 180)}</g></g></g>`; })}
  <path d="M52 192L58 240H102L108 192" fill="rgba(243,238,232,.4)" stroke="#262626" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M204 86L214 120H250L260 86" fill="rgba(243,238,232,.4)" stroke="#262626" stroke-width="2.5" stroke-linejoin="round"/>
  <g data-k="o:0@4.8 1@4.9 1@6.8 0@6.9">${rep(5, i => `<circle cx="${229 + (i % 3) * 3}" cy="202" r="${i % 2 ? 2.2 : 1.7}" fill="#6b4429" data-loop=".5" data-off="${f1(i * .1)}" data-k="y>:0@0 24@.5"/>`)}</g>
  <g data-k="o:1@7.5 0@7.9"><g data-k="sy<:0@4.9 1@6.9" style="transform-origin:50% 100%"><path d="M206 229Q232 204 258 229Z" fill="#6b4429"/></g></g>
  <rect x="150" y="229" width="52" height="8" rx="4" fill="#262626"/>
  <path d="M204 232H260L256 252H208Z" fill="#7a736d" stroke="#262626" stroke-width="2"/><rect x="200" y="228" width="64" height="6" rx="2" fill="#262626"/>
  <text x="80" y="294" class="ts mid">abwiegen</text><text x="232" y="294" class="ts mid">alles mahlen</text></svg>`;
};
const wfHopper = () => {
  const R = rng(52), G = 'o:0@1 1@1.1 1@2.9 0@3 0@4.8 1@4.9 1@6.7 0@6.8', hop = 'M112 34V72Q112 90 136 104L152 120H188L204 104Q228 90 228 72V34Z';
  return `<svg class="dg c5-wf" viewBox="0 0 320 300" role="img" aria-label="Hopper: voller Bohnenbehälter, Mahlen auf Abruf">${D}
  <path d="M8 272H312" stroke="#262626" stroke-opacity=".35" stroke-width="2"/>
  <rect x="186" y="150" width="30" height="116" rx="5" fill="#262626" opacity=".8"/>
  <rect x="114" y="264" width="112" height="8" rx="4" fill="#262626"/>
  <rect x="130" y="120" width="86" height="64" rx="12" fill="#3a342f" stroke="#262626" stroke-width="2"/>
  <g data-k="r:0@1 740@3 760@3.4 760@4.8 1500@6.8 1520@7.2">${wheel(176, 152)}</g>
  <circle cx="144" cy="134" r="4.5" data-k="fill:#7a736d@.9 #f8cbad@1 #f8cbad@3 #7a736d@3.1 #7a736d@4.7 #f8cbad@4.8 #f8cbad@6.8 #7a736d@6.9"/>
  <circle cx="144" cy="134" r="5" fill="none" stroke="#7a5238" stroke-width="2" data-k="@r<:5@.7 16@1.3 5@1.31 5@4.5 16@5.1;o:0@.6 1@.7 0@1.3 0@4.4 1@4.5 0@5.1"/>
  <path d="M156 184L160 200H180L184 184Z" fill="#7a736d" stroke="#262626" stroke-width="2"/>
  ${[[112, 2], [100, 4], [88, 5], [76, 5], [64, 5], [52, 5], [41, 5]].map(([y, n]) => rep(n, i => bean(f1(170 - (n - 1) * 9.5 + i * 19 + R() * 4 - 2), f1(y + R() * 3), 8, Math.round(R() * 180)))).join('')}
  <path d="${hop}" fill="rgba(243,238,232,.3)" stroke="#262626" stroke-width="2.5" stroke-linejoin="round"/>
  ${shine(hop, 112, 34, 116, 86, 4, .4)}
  <rect x="106" y="26" width="128" height="9" rx="4" fill="#262626"/>
  <g data-k="${G}">${rep(5, i => `<circle cx="${167 + (i % 3) * 3}" cy="202" r="${i % 2 ? 2.2 : 1.7}" fill="#6b4429" data-loop=".5" data-off="${f1(i * .1)}" data-k="y>:0@0 24@.5"/>`)}</g>
  <g data-k="x^:0@3.3 -170@3.9 170@3.92 0@4.6;o:1@3.3 0@3.85 0@3.95 1@4.4">
    <g data-k="sy<:0@1.1 1@3 1@3.9 0@3.92 0@4.9 1@6.8" style="transform-origin:50% 100%"><path d="M144 229Q170 204 196 229Z" fill="#6b4429"/></g>
    <rect x="88" y="229" width="52" height="8" rx="4" fill="#262626"/>
    <path d="M142 232H198L194 252H146Z" fill="#7a736d" stroke="#262626" stroke-width="2"/><rect x="138" y="228" width="64" height="6" rx="2" fill="#262626"/>
  </g>
  <text x="242" y="62" class="ts">voller</text><text x="242" y="82" class="ts">Hopper</text>
  <text x="170" y="294" class="ts mid">auf Abruf mahlen</text></svg>`;
};

/* ---------- 5.3 retention ---------- */
const retSvg = () => {
  const R = rng(53);
  const RUN = '1@6.6 0@7.2 0@14.6 1@15.2 1@20 0@20.6', REST = '0@6.6 1@7.2 1@14.6 0@15.2 0@20 1@20.6';
  // carried through the burr gap and along the channel, then gravity takes over in the chute
  const stream = (n, col) => rep(n, i => { const L = f1(2 + R() * .8), off = f1(R() * 3), x0 = f1(296 + R() * 14), y0 = f1(246 + R() * 8), j = f1(R() * 14 - 7), ex = f1(652 + R() * 16 - 8 - x0);
    return `<g data-loop="${L}" data-off="${off}" data-k="x~:0@0 ${f1(422 - x0)}@${f1(L * .18)} ${f1(626 - x0)}@${f1(L * .56)} ${ex}@${f1(L * .66)};y~:0@0 ${f1(239 - y0)}@${f1(L * .18)} ${f1(240 + j - y0)}@${f1(L * .3)};o:0@0 1@${f1(L * .06)} 1@${f1(L * .93)} 0@${L}"><circle cx="${x0}" cy="${y0}" r="${f1(1.8 + R() * 1.5)}" fill="${col}" data-loop="${L}" data-off="${off}" data-k="y>:0@${f1(L * .56)} ${f1(210 - j)}@${L}"/></g>`; });
  const left = (n, col) => rep(n, i => { const L = f1(1.4 + R() * .5), x0 = f1(250 + R() * 14), y0 = f1(246 + R() * 8);
    return `<circle cx="${x0}" cy="${y0}" r="${f1(1.8 + R() * 1.3)}" fill="${col}" data-loop="${L}" data-off="${f1(R() * 3)}" data-k="x~:0@0 ${f1(138 - x0)}@${f1(L * .7)} ${f1(124 - x0)}@${L};y~:0@0 ${f1(239 - y0)}@${f1(L * .7)} ${f1(262 - y0)}@${L};o:0@0 1@${f1(L * .1)} 1@${f1(L * .8)} 0@${L}"/>`; });
  const feed = (fn, gate) => `<g data-k="o:${gate}">${rep(3, i => drop(fn(f1(270 + i * 10), 60, 10, 30 + i * 50), 1.2, f1(i * .4 + R() * .1), 186, i % 2 ? 260 : -210))}</g>`;
  // what stays behind
  const active = rep(30, i => { const x0 = f1(458 + R() * 168), y0 = f1(250 + R() * 5.5), ta = f1(2.8 + R() * 3.6), ts = f1(15.3 + (626 - x0) / 168 * 1.4);
    return `<g data-k="o:0@${ta} 1@${f1(ta + .4)} 1@${f1(ts + 1)} 0@${f1(ts + 1.1)};x>:0@${ts} ${f1(652 - x0)}@${f1(ts + .5)}">${chip(x0, y0, 2.8, C1, `data-k="y>:0@${f1(ts + .45)} 196@${f1(ts + 1.1)};r~:0@${ts} 300@${f1(ts + 1.1)}"`)}</g>`; });
  const fresh = rep(24, i => { const x0 = f1(458 + R() * 168), y0 = f1(250 + R() * 5.5), ta = f1(17 + R() * 2.8); return chip(x0, y0, 2.8, C2, `data-k="o:0@${ta} 1@${f1(ta + .4)}"`); });
  const stay = (x, y) => chip(f1(x), f1(y), 2.8, C1, `data-k="o:0@${f1(2.8 + R() * 3.6)} 1@${f1(6.6 + R() * .4)}"`);
  const passive = rep(18, () => { const x = 424 + R() * 22; return stay(x, 317 - R() * (7 + 24 * (x - 422) / 26)); }) +
    rep(15, () => { const x = 114 + R() * 22; return stay(x, 317 - R() * (7 + 22 * (138 - x) / 26)); }) +
    rep(7, () => { const x = 658 + R() * 9; return stay(x, 225 + R() * (x - 656)); }) +
    rep(5, () => stay(426 + R() * 20, 174 + R() * 8));
  const up = 'M140 170H250V214L140 236Z M310 170H420V236L310 214Z', cup = 'M600 398H704L696 466H608Z';
  return D + `
  <!-- hollow spaces -->
  <path d="M110 170H450V320H110Z M250 120H310V170H250Z M450 222H670V372H634V258H450Z" fill="#0d0a08"/>
  <path d="M230 78L250 120M330 78L310 120" stroke="url(#g-steel)" stroke-width="5" stroke-linecap="round"/>
  ${feed((x, y, s, r) => bean(x, y, s, r), '0@.6 1@1 1@6 0@6.5')}
  ${feed((x, y, s, r) => cbean(x, y, s, r, C2, '#7a5238'), '0@14.6 1@15 1@19 0@19.5')}
  <!-- burrs -->
  ${burr(up)}
  ${burr('M140 242L250 262H310L420 242V286H140Z')}
  <path d="M250 262L280 247L310 262Z" fill="#a39a93"/>
  ${spinner(140, 268, 280, 18, { p: 18, T: .55, run: RUN, rest: REST })}
  ${shine(up, 140, 170, 280, 66, 6.5, 1.5)}
  <rect x="160" y="286" width="240" height="14" fill="url(#g-steel)"/>
  <rect x="268" y="300" width="24" height="76" fill="url(#g-steel)"/><rect x="254" y="368" width="52" height="14" rx="4" fill="url(#c5-body)" stroke="#8a817a"/>
  <ellipse cx="280" cy="240" rx="120" ry="10" fill="#e3704f" filter="url(#f-glow)" data-k="o:0@2 .4@4.5 .4@6.4 0@8 0@15 .4@17.5 .4@20 0@21.4"/>
  <!-- cut walls -->
  ${wall('M80 120H250V170H110V320H268V360H80Z M310 120H480V222H450V170H310Z M292 320H450V258H480V360H292Z')}
  ${wall('M480 206H686V372H670V222H480Z M480 258H634V372H618V274H480Z')}
  <text x="150" y="110" class="ts mid">Mahlkammer</text><text x="566" y="194" class="ts mid">Auswurfschacht</text>
  <!-- dose tags -->
  <g data-k="o:0@.5 1@1.1 1@12.6 0@13.2"><circle cx="354" cy="90" r="8" fill="${C1}" data-k="s^:0@.5 1@1.2"/><text x="370" y="98" class="t">Dosis 1</text></g>
  <g data-k="o:0@13.8 1@14.4 1@21.3 0@21.6"><circle cx="354" cy="90" r="8" fill="${C2}" data-k="s^:0@13.8 1@14.5"/><text x="370" y="98" class="t">Dosis 2</text></g>
  <!-- streams -->
  <g data-k="o:0@1.6 1@2.2 1@6.4 0@7">${stream(26, C1)}${left(7, C1)}</g>
  <g data-k="o:0@14.8 1@15.4 1@19.4 0@20">${stream(26, C2)}${left(7, C2)}</g>
  ${passive}${active}${fresh}
  <!-- cups -->
  <ellipse cx="652" cy="469" rx="60" ry="4" fill="#000" opacity=".6" filter="url(#f-soft)"/>
  <g data-k="o:1@12.6 0@13.3;x>:0@12.6 70@13.4">
    <g data-k="sy<:0@2.8 1@7" style="transform-origin:50% 100%"><path d="M607 464Q652 402 697 464Z" fill="${C1}"/></g>
    ${glass(598, 398, 108, 60)}${shine(cup, 598, 398, 108, 68, 5.5, .8)}
  </g>
  <g data-k="o:0@13.3 1@13.9;x^:-70@13.3 0@14.2">
    <g data-k="sy<:0@16.8 1@20" style="transform-origin:50% 100%"><path d="M607 464Q652 398 697 464Z" fill="${C2}"/></g>
    <g data-k="sy<:0@15.9 1@17.3" style="transform-origin:50% 100%"><path d="M607 464Q652 440 697 464Z" fill="${C1}"/></g>
    <g data-k="o:0@17.4 1@18.6">${rep(9, i => chip(f1(630 + R() * 44), f1(440 + R() * 10), 2.6, C1))}</g>
    ${glass(598, 398, 108, 60)}${shine(cup, 598, 398, 108, 68, 5.5, 3.3)}
  </g>
  <!-- zones -->
  <g data-k="o:0@7 1@7.6 1@9.1 0@9.5"><text x="706" y="236" class="tb">Retention</text><text x="706" y="262" class="ts">Mahlgut bleibt zurück</text></g>
  <g data-k="o:0@9.5 1@10.1 1@21.2 0@21.6">
    <rect x="453" y="241" width="186" height="20" rx="7" fill="none" stroke="#f8cbad" stroke-width="2" stroke-dasharray="6 5" data-k="s^:.8@9.5 1@10.3"/>
    <text x="706" y="236" class="tb">Aktiver Totraum</text><text x="706" y="262" class="ts">im Weg des Mahlguts</text><path class="lead-l" d="M700 240L644 250"/>
  </g>
  <g data-k="o:0@12 1@12.6 1@21.2 0@21.6">
    <rect x="417" y="278" width="36" height="45" rx="7" fill="none" stroke="#f3eee8" stroke-width="2" stroke-dasharray="6 5" data-k="s^:.7@12 1@12.8"/>
    <rect x="107" y="280" width="36" height="43" rx="7" fill="none" stroke="#f3eee8" stroke-width="2" stroke-dasharray="6 5" data-k="s^:.7@12.15 1@12.95"/>
    <path class="lead-l" d="M150 398L128 326M330 398L432 326"/>
    <text x="96" y="426" class="tb">Passiver Totraum</text><text x="96" y="452" class="ts">in Ecken und Winkeln</text>
  </g>
  <g data-k="o:0@17.6 1@18.4 1@21.2 0@21.6"><text x="724" y="432" class="ts">Alt und neu</text><text x="724" y="456" class="ts">im selben Becher</text></g>`;
};

/* ---------- 5.4 particle size distribution ---------- */
function c5curve(a) {
  const X0 = 40, W = 330, Y0 = 250, H = 185, g = (x, m, s) => Math.exp(-((x - m) * (x - m)) / (2 * s * s));
  const comp = [x => a * g(x, .13, .05), x => g(x, .58, .115), x => .12 * g(x, .9, .035)];
  const pt = (x, v) => (X0 + x * W).toFixed(1) + ' ' + (Y0 - v * H).toFixed(1);
  const path = (fn, close) => { let d = ''; for (let i = 0; i <= 66; i++) { const x = i / 66; d += (i ? 'L' : 'M') + pt(x, fn(x)); } return close ? d + 'L' + (X0 + W) + ' ' + Y0 + 'L' + X0 + ' ' + Y0 + 'Z' : d; };
  return { f: path(comp[0], 1), m: path(comp[1], 1), b: path(comp[2], 1), all: path(x => comp[0](x) + comp[1](x) + comp[2](x)), fy: Y0 - a * H };
}
const FTXT = [
  ['wenig', '<b>Wenig Fines:</b> Die Zwischenräume bleiben eher offen. Tendenz: schnellerer Durchfluss, mehr Klarheit, weniger Körper.'],
  ['mittel', '<b>Mittlerer Fines-Anteil:</b> Fines füllen einen Teil der Zwischenräume. Durchfluss, Körper und Klarheit halten sich die Waage.'],
  ['viel', '<b>Viele Fines:</b> Sie füllen die Zwischenräume und können den Puck-Widerstand erhöhen. Tendenz: langsamerer Durchfluss, mehr Körper, weniger Klarheit.']
];
const partSvg = () => {
  const R = rng(59), cx = 525, cy = 148, RR = 108, P = [], C = c5curve(.08 + .35 * .52);
  const poly = (x, y, r, n) => { let d = ''; const a0 = R() * 6.28; for (let i = 0; i < n; i++) { const a = a0 + i / n * 6.283, q = r * (.74 + R() * .4); d += (i ? 'L' : 'M') + f1(x + Math.cos(a) * q) + ' ' + f1(y + Math.sin(a) * q); } return d + 'Z'; };
  const place = (r, tries) => { for (let k = 0; k < tries; k++) { const a = R() * 6.283, d = Math.sqrt(R()) * (RR - r - 4), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d; if (P.every(p => Math.hypot(p.x - x, p.y - y) > p.r + r + 1.6)) { const p = { x, y, r }; P.push(p); return p; } } return null; };
  const draw = (n, r0, r1, v, tries, attr) => rep(n, () => { const p = place(r0 + R() * r1, tries); return p ? `<path d="${poly(p.x, p.y, p.r, v)}" ${attr()}/>` : ''; });
  const boulders = draw(5, 15, 6, 8, 600, () => 'fill="#3a2114"');
  const main = draw(44, 6, 3.6, 7, 400, () => `fill="${R() > .5 ? '#6b4429' : '#7a5238'}"`);
  const fines = draw(200, 1.5, 1.6, 5, 80, () => 'class="c5-fine" fill="#5b3720"');
  return `<svg class="dg c5-dg" style="--c5-rest:210px" viewBox="0 0 650 322" role="img" aria-label="Partikelgrößenverteilung als Kurve und Partikel unter dem Mikroskop">
  <defs><clipPath id="c5-revc"><rect id="c5-rev" x="36" y="20" width="350" height="240"/></clipPath><clipPath id="c5-lens"><circle cx="${cx}" cy="${cy}" r="${RR}"/></clipPath>
    <marker id="c5-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#262626"/></marker>
    <radialGradient id="c5-lensg" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fbf8f4"/><stop offset="1" stop-color="#e4dcd3"/></radialGradient></defs>
  <g clip-path="url(#c5-revc)">
    <path id="c5-pm" d="${C.m}" fill="#7a5238" fill-opacity=".45"/>
    <path id="c5-pb" d="${C.b}" fill="#3a2114" fill-opacity=".6"/>
    <path id="c5-pf" d="${C.f}" fill="#f8cbad" fill-opacity=".85"/>
    <path id="c5-pall" d="${C.all}" fill="none" stroke="#262626" stroke-width="3" stroke-linejoin="round"/>
  </g>
  <path d="M40 40V250H384" fill="none" stroke="#262626" stroke-width="2" marker-end="url(#c5-arr)"/>
  <text x="40" y="276" class="ts">fein</text><text x="384" y="276" class="ts end">grob</text><text x="212" y="276" class="tl mid">Partikelgröße</text>
  <text x="28" y="150" class="tl mid" transform="rotate(-90 28 150)">Anteil</text>
  <text id="c5-flab" x="83" y="${f1(Math.min(226, C.fy - 12))}" class="t mid">Fines</text>
  <text x="232" y="48" class="t mid">Hauptanteil</text>
  <text x="350" y="200" class="t mid">Boulders</text>
  <circle cx="${cx}" cy="${cy}" r="${RR}" fill="url(#c5-lensg)"/>
  <g clip-path="url(#c5-lens)"><g class="c5-drift">${boulders}${main}</g><g class="c5-drift b">${fines}</g></g>
  <circle cx="${cx}" cy="${cy}" r="${RR}" fill="none" stroke="#262626" stroke-width="7"/><circle cx="${cx}" cy="${cy}" r="${RR + 7}" fill="none" stroke="#262626" stroke-opacity=".3" stroke-width="2"/>
  <path d="M${cx - 78} ${cy - 62}A100 100 0 0 1 ${cx - 30} ${cy - 96}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="4" stroke-linecap="round"/>
  <g font-size="15" fill="#45403b"><path d="${poly(417, 288, 9, 8)}" fill="#3a2114"/><text x="431" y="293">Boulders</text><path d="${poly(506, 288, 5.5, 7)}" fill="#6b4429"/><text x="516" y="293">Hauptanteil</text><path d="${poly(606, 288, 2.6, 5)}" fill="#5b3720"/><text x="613" y="293">Fines</text></g>
  <text x="${cx}" y="316" class="tl mid">Unter dem Mikroskop</text></svg>`;
};

/* ---------- 5.5 flat and conical burrs ---------- */
const mahlSvg = () => {
  const R = rng(55), fx = 250, kx = 710, col = i => i % 3 ? C1 : '#c99a6b';
  const FL = 'o:0@3 1@3.5 1@8.6 0@9 0@15 1@15.4 1@17.3 0@17.6', KO = 'o:0@9 1@9.5 1@17.3 0@17.6';
  const cone = 'M696 204Q710 188 724 204L746 344H674Z', fu = 'M112 196H226V232L112 250Z M274 196H388V250L274 232Z', ring = 'M596 176H646L670 344H596Z M824 176H774L750 344H824Z';
  // a fragment is carried along the narrowing gap (and shrinks), then falls out of the burr set
  const frag = (x0, y0, L, off, xs, ys, t1, fallY, i, sg) => `<g data-loop="${L}" data-off="${off}" data-k="x~:${xs};y~:${ys};o:0@0 1@${f1(L * .08)} 1@${f1(L * .9)} 0@${L}"><g data-loop="${L}" data-off="${off}" data-k="y>:0@${t1} ${fallY}@${L};s:1@0 .26@${t1};r~:0@0 ${sg * 420}@${L}">${chip(x0, y0, 8, col(i))}</g></g>`;
  return D + `
  <g data-k="o:1@8.7 .28@9.3 .28@14.6 1@15.2">
    <ellipse cx="${fx}" cy="376" rx="110" ry="5" fill="#000" opacity=".5" filter="url(#f-soft)"/>
    <path d="M112 182H226V196H112Z M274 182H388V196H274Z" fill="url(#g-steel)"/>
    ${burr(fu)}<path d="${fu}" fill="url(#c5-hatch)"/>
    ${burr('M112 256L226 276H274L388 256V296H112Z')}
    <path d="M226 276L250 262L274 276Z" fill="#a39a93"/>
    ${spinner(112, 280, 276, 16, { p: 18, T: .55 })}
    ${shine(fu, 112, 196, 276, 54, 6, .5)}
    <rect x="132" y="296" width="236" height="12" fill="url(#g-steel)"/><rect x="240" y="308" width="20" height="62" fill="url(#g-steel)"/>
    ${spinner(240, 312, 20, 54, { p: 9, T: .28, slant: .2 })}
    <path d="M196 340A56 12 0 0 0 304 340" fill="none" stroke="#f3eee8" stroke-opacity=".6" stroke-width="2" marker-end="url(#c5-am)"/>
    <ellipse cx="${fx}" cy="254" rx="118" ry="7" fill="#e3704f" filter="url(#f-glow)" data-k="o:0@3.4 .4@5.5 .4@8.4 0@9.2 0@15 .4@16.4 .4@17.2 0@17.7"/>
    <g data-k="${FL}">
      ${rep(3, i => drop(bean(f1(244 + i * 6), 104, 10, 20 + i * 55), 1.5, f1(i * .5 + R() * .1), 152, i % 2 ? 250 : -200))}
      ${rep(20, i => { const sg = i % 2 ? 1 : -1, L = f1(1.7 + R() * .7), a = 4 + R() * 9, x0 = f1(fx + sg * a), y0 = f1(256 + R() * 6), t1 = f1(L * .74); return frag(x0, y0, L, f1(R() * 3), `0@0 ${f1(sg * (136 - a))}@${t1} ${f1(sg * (160 - a))}@${L}`, `0@0 ${f1(253 - y0)}@${t1}`, t1, 80, i, sg); })}
    </g>
    <g data-k="o:0@3.4 1@4"><path d="M222 164H132" fill="none" stroke="#f8cbad" stroke-width="2.5" marker-end="url(#c5-ap)" class="draw" pathLength="1" data-k="d<:1@3.4 0@4.2"/><path d="M278 164H368" fill="none" stroke="#f8cbad" stroke-width="2.5" marker-end="url(#c5-ap)" class="draw" pathLength="1" data-k="d<:1@3.55 0@4.35"/></g>
    <text x="${fx}" y="424" class="t mid">Flache Mahlscheiben</text><text x="${fx}" y="450" class="ts mid">von innen nach außen</text>
  </g>
  <g data-k="o:1@2.7 .28@3.3 .28@8.6 1@9.2">
    <ellipse cx="${kx}" cy="400" rx="110" ry="5" fill="#000" opacity=".5" filter="url(#f-soft)"/>
    ${wall(ring)}
    ${burr(cone)}
    ${spinner(660, 190, 100, 154, { p: 15, T: .5, slant: -.22, clip: `<path d="${cone}"/>` })}
    ${shine(ring, 596, 176, 228, 168, 7, 2.2)}
    <rect x="700" y="344" width="20" height="50" fill="url(#g-steel)"/>
    ${spinner(700, 348, 20, 42, { p: 9, T: .28, slant: .2 })}
    <path d="M656 366A56 12 0 0 0 764 366" fill="none" stroke="#f3eee8" stroke-opacity=".6" stroke-width="2" marker-end="url(#c5-am)"/>
    <ellipse cx="${kx}" cy="330" rx="46" ry="12" fill="#e3704f" filter="url(#f-glow)" data-k="o:0@9.4 .4@11.5 .4@17.2 0@17.7"/>
    <g data-k="${KO}">
      ${rep(4, i => drop(bean(i % 2 ? 748 : 672, 104, 10, 20 + i * 55), 1.5, f1(i * .375 + R() * .1), 88, i % 2 ? 220 : -180))}
      ${rep(20, i => { const sg = i % 2 ? 1 : -1, L = f1(1.7 + R() * .7), a = 38 + R() * 14 - 7, x0 = f1(kx + sg * a), y0 = f1(186 + R() * 10), t1 = f1(L * .76); return frag(x0, y0, L, f1(R() * 3), `0@0 ${f1(sg * (38 - a))}@${t1} ${f1(sg * (42 - a))}@${L}`, `0@0 ${f1(342 - y0)}@${t1}`, t1, 66, i, sg); })}
    </g>
    <g data-k="o:0@9.4 1@10"><path d="M576 200V320" fill="none" stroke="#f8cbad" stroke-width="2.5" marker-end="url(#c5-ap)" class="draw" pathLength="1" data-k="d<:1@9.4 0@10.2"/><path d="M844 200V320" fill="none" stroke="#f8cbad" stroke-width="2.5" marker-end="url(#c5-ap)" class="draw" pathLength="1" data-k="d<:1@9.55 0@10.35"/></g>
    <text x="${kx}" y="424" class="t mid">Konische Mahlscheiben</text><text x="${kx}" y="450" class="ts mid">von oben nach unten</text>
  </g>`;
};

/* ---------- 5.5 the five factors on one burr ---------- */
const faktSvg = () => {
  const cx = 215, cy = 222, pol = (r, a) => `${f1(cx + r * Math.cos(a * Math.PI / 180))} ${f1(cy + r * Math.sin(a * Math.PI / 180))}`;
  const badge = (x, y, n) => `<circle cx="${x}" cy="${y}" r="15" fill="#7a5238"/><text x="${x}" y="${y + 6}" class="mid" fill="#f3eee8" font-size="17">${n}</text>`;
  return `<svg class="dg c5-dg" viewBox="0 0 680 450" role="img" aria-label="Mahlscheibe von oben mit den fünf entscheidenden Faktoren">${D}
  <ellipse cx="${cx + 6}" cy="${cy + 10}" rx="152" ry="150" fill="#262626" opacity=".28" filter="url(#f-soft)"/>
  <circle cx="${cx}" cy="${cy}" r="150" fill="#cfc9c3" stroke="#262626" stroke-width="2.5"/>
  <g class="spin c5-slow">
    <circle cx="${cx}" cy="${cy}" r="150" fill="none"/>
    ${rep(48, i => `<path d="M${pol(100, i * 7.5)}L${pol(148, i * 7.5 + 7)}" stroke="#262626" stroke-opacity=".55" stroke-width="2"/>`)}
    ${rep(12, i => `<path d="M${pol(54, i * 30)}L${pol(100, i * 30 + 24)}" stroke="#262626" stroke-opacity=".7" stroke-width="3.5" stroke-linecap="round"/>`)}
    ${rep(3, i => { const [x, y] = pol(76, i * 120 + 12).split(' '); return `<circle cx="${x}" cy="${y}" r="6.5" fill="#7a736d" stroke="#262626" stroke-width="1.5"/>`; })}
  </g>
  <path d="M${pol(146, 205)}A146 146 0 0 1 ${pol(146, 250)}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>
  <circle cx="${cx}" cy="${cy}" r="100" fill="none" stroke="#262626" stroke-opacity=".35" stroke-width="1.5"/>
  <circle cx="${cx}" cy="${cy}" r="50" fill="#b0a7a1" stroke="#262626" stroke-width="2.5"/>
  <g data-s="1"><path d="M65 222V34M365 222V34" stroke="#262626" stroke-opacity=".4" stroke-width="1.5" stroke-dasharray="4 4"/><path d="M69 44H361" fill="none" stroke="#262626" stroke-width="2" marker-start="url(#c5-ai)" marker-end="url(#c5-ai)"/>
    ${badge(120, 22, 1)}<text x="144" y="30" class="t">Durchmesser</text></g>
  <g data-s="2"><path class="ln" d="M330 150L398 112" stroke-width="1.5"/>${badge(420, 104, 2)}<text x="444" y="112" class="t">Schneidengeometrie</text></g>
  <g data-s="3"><path d="M${pol(100, 0)}L${pol(160, 0)}" stroke="#262626" stroke-width="1.5" stroke-dasharray="4 4"/><path d="M${pol(100, 0)}L${pol(152, 14)}" stroke="#7a5238" stroke-width="4" stroke-linecap="round"/><path d="M${pol(140, 0)}A40 40 0 0 1 ${pol(139, 10)}" fill="none" stroke="#7a5238" stroke-width="2"/>
    <path class="ln" d="M380 228L398 222" stroke-width="1.5"/>${badge(420, 214, 3)}<text x="444" y="222" class="t">Winkel und Ausrichtung</text></g>
  <g data-s="4">
    <path d="M430 318H520V334L430 346Z M548 318H638V346L548 334Z" fill="#cfc9c3" stroke="#262626" stroke-width="2" stroke-linejoin="round"/><path d="M430 318H520V334L430 346Z M548 318H638V346L548 334Z" fill="url(#c5-hatch-l)"/>
    <path d="M430 356L520 368H548L638 356V384H430Z" fill="#cfc9c3" stroke="#262626" stroke-width="2" stroke-linejoin="round"/>
    <path d="M654 334V345M654 368V357" fill="none" stroke="#7a5238" stroke-width="2" marker-end="url(#c5-ab)"/><path d="M642 346H666M642 356H666" stroke="#7a5238" stroke-width="2"/>
    ${badge(420, 282, 4)}<text x="444" y="290" class="t">Abstand der Mahlscheiben</text></g>
  <g data-s="5"><path d="M${pol(170, 168)}A170 170 0 0 0 ${pol(170, 122)}" fill="none" stroke="#7a5238" stroke-width="3" marker-end="url(#c5-ab)"/>${badge(56, 414, 5)}<text x="80" y="422" class="t">Drehzahl</text></g>
  </svg>`;
};

/* ---------- 5.6 heat, static and RDT ---------- */
const statSvg = () => {
  const R = rng(57), ON = '0@.6 1@1.2 1@10.6 0@11.2 0@14.8 1@15.4 1@21 0@21.5', OFF = '1@.6 0@1.2 0@10.6 1@11.2 1@14.8 0@15.4 0@21 1@21.5';
  const tube = 'M486 179H556L650 292', col = i => i % 3 ? C1 : '#c99a6b';
  const cl = (x, y, n = 3) => { const t = f1(1.5 + R() * 8); return `<g data-k="o:0@${t} 1@${f1(t + .3)};s^:.2@${t} 1@${f1(t + .6)}">${rep(n, () => `<circle cx="${f1(x + R() * 8 - 4)}" cy="${f1(y + R() * 8 - 4)}" r="${f1(2 + R() * 1.8)}" fill="${R() > .4 ? C1 : '#c99a6b'}"/>`)}</g>`; };
  const beans = (fn) => [[362, 96], [386, 96], [354, 82], [374, 80], [394, 82], [364, 66], [386, 66]].map(([x, y], i) => fn(x, y, 8.5, (i * 53) % 180)).join('');
  const cup = 'M598 392H722L712 466H608Z';
  return D + `
  <path d="M278 132H470V224H278Z M356 104H392V132H356Z M470 166H486V192H470Z" fill="#0d0a08"/>
  <path d="M332 52L356 104M416 52L392 104" stroke="url(#g-steel)" stroke-width="5" stroke-linecap="round"/>
  <g data-k="y~:0@1 36@9.5;o:1@7.5 0@9.6">${beans((x, y, s, r) => bean(x, y, s, r))}</g>
  <g data-k="y~:0@15.2 36@20.4;o:0@11.8 1@12.4 1@18.6 0@20.4"><g data-k="y^:0@13.08 2.5@13.2 0@13.7">${beans((x, y, s, r) => bean(x, y, s, r))}
    <g data-k="o:0@13.1 .9@13.5 .9@15 0@16.5">${beans((x, y, s) => `<ellipse cx="${x}" cy="${y}" rx="${s + 1.5}" ry="${f1(s * .68 + 1.5)}" fill="none" stroke="#7fb4dc" stroke-width="1.5"/>`)}</g></g></g>
  ${burr('M292 132H356V158L292 172Z M392 132H456V172L392 158Z')}
  ${burr('M292 178L356 192H392L456 178V206H292Z')}
  ${spinner(292, 193, 164, 13, { p: 14, T: .4, run: ON, rest: OFF })}
  <rect x="308" y="206" width="132" height="8" fill="url(#g-steel)"/><rect x="366" y="214" width="16" height="46" fill="url(#g-steel)"/>
  <rect x="318" y="256" width="112" height="78" rx="10" fill="url(#c5-body)" stroke="#8a817a" stroke-width="1.5"/>${rep(5, i => `<path d="M326 ${270 + i * 13}H422" stroke="#17120f" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>`)}
  <path d="${tube}" fill="none" stroke="url(#c5-wall)" stroke-width="32" stroke-linejoin="round"/><path d="${tube}" fill="none" stroke="#0d0a08" stroke-width="21" stroke-linejoin="round"/>
  ${wall('M262 104H356V132H278V224H366V240H262Z M392 104H486V166H470V132H392Z M382 224H470V192H486V240H382Z')}
  ${shine('M262 104H486V240H262Z', 262, 104, 224, 136, 7, 3)}
  <!-- friction heat: a glow that breathes with the burrs -->
  <g data-k="o:0@.6 .95@3 .95@10.6 0@11.6 0@14.8 .95@16.6 .95@21 0@21.6"><circle cx="374" cy="176" r="116" fill="url(#c5-heat)" data-loop="1.6" data-k="s:1@0 1.09@.8 1@1.6"/>
    <ellipse cx="374" cy="176" rx="78" ry="7" fill="#e3704f" filter="url(#f-glow)" data-loop="1.1" data-k="o:.5@0 .9@.55 .5@1.1"/></g>
  <g data-k="o:0@.5 1@1.1 1@21.2 0@21.6">
    <rect x="160" y="150" width="20" height="134" rx="10" fill="none" stroke="#f3eee8" stroke-opacity=".7" stroke-width="2"/><circle cx="170" cy="294" r="15" fill="#e3704f"/><circle cx="170" cy="294" r="20" fill="#e3704f" opacity=".5" filter="url(#f-soft)"/>
    <rect x="165" y="160" width="10" height="126" rx="5" fill="#e3704f" style="transform-origin:50% 100%" data-k="sy<:.12@.6 .82@5.5 .82@10.6 .4@14.6 .82@19.5"/>
    <text x="170" y="134" class="ts mid">Reibung</text><text x="170" y="344" class="tb mid">Wärme</text>
  </g>
  <!-- grounds inside the chute -->
  <g data-k="o:${ON}">${rep(10, i => { const L = f1(.9 + R() * .4), j = f1(R() * 8 - 4); return `<circle cx="474" cy="${f1(179 + j)}" r="${f1(1.8 + R() * 1.3)}" fill="${col(i)}" data-loop="${L}" data-off="${f1(R() * 2)}" data-k="x~:0@0 82@${f1(L * .45)} 174@${L};y~:0@0 0@${f1(L * .45)} 110@${L};o:0@0 1@${f1(L * .15)} 1@${L}"/>`; })}</g>
  <!-- run 1: charged grounds repel each other, fly apart and cling -->
  <g data-k="o:0@.8 1@1.4 1@10.6 0@11.2">
    ${rep(36, i => { const L = f1(1.1 + R() * .8), off = f1(R() * 3), tx = 536 + R() * 268, inCup = tx > 608 && tx < 712, ty = inCup ? 440 + R() * 18 : tx > 590 && tx < 730 ? 398 + R() * 50 : 461, up = R() < .3 ? f1(12 + R() * 26) : 0, t1 = f1(L * .32), dx = f1(tx - 650), dy = f1(ty - 292 + up);
      return `<g data-loop="${L}" data-off="${off}" data-k="x~:0@0 ${dx}@${L};${up ? `y<:0@0 ${-up}@${t1};` : ''}o:0@0 1@${f1(L * .1)} 1@${f1(L * .88)} 0@${L}"><circle cx="650" cy="292" r="${f1(1.8 + R() * 1.5)}" fill="${col(i)}" data-loop="${L}" data-off="${off}" data-k="y>:0@${up ? t1 : 0} ${dy}@${L}"/></g>`; })}
    ${[[694, 300, '+'], [606, 332, '–'], [726, 352, '+'], [574, 376, '+'], [690, 258, '–']].map(([x, y, s], i) => `<text x="${x}" y="${y}" class="tm mid" data-loop="1.4" data-off="${f1(i * .28)}" data-k="o:0@0 1@.3 1@.7 0@1.1;s^:.4@0 1@.5">${s}</text>`).join('')}
  </g>
  <g data-k="o:1@11.4 0@12.2">
    ${[[664, 281], [671, 289], [640, 305], [633, 299], [655, 303], [647, 309], [592, 247], [606, 264], [620, 282], [634, 245], [645, 259], [598, 394], [722, 394], [592, 420], [729, 426], [716, 404]].map(([x, y]) => cl(x, y)).join('')}
    ${rep(16, i => { const x = i % 2 ? 524 + R() * 62 : 734 + R() * 88; return cl(f1(x), 461, 1); })}
  </g>
  <g data-k="o:1@11.6 0@12.4"><g data-k="sy<:0@1.4 1@10.6" style="transform-origin:50% 100%"><path d="M610 464Q660 420 710 464Z" fill="#7a5238"/></g></g>
  <g data-k="o:0@.8 1@1.4 1@11 0@11.6"><text x="716" y="150" class="tb">ohne RDT</text><g data-k="o:0@6 1@6.6"><text x="716" y="178" class="ts">Mahlgut fliegt auseinander</text><text x="716" y="202" class="ts">und bleibt hängen</text></g></g>
  <!-- RDT: one drop of water, stretched while it falls, a small splash where it lands -->
  <g data-k="y>:-70@12.45 0@13.08;o:0@12.45 1@12.6 1@13.08 0@13.14"><path d="M374 30C366 44 364 50 374 56C384 50 382 44 374 30Z" fill="#7fb4dc" style="transform-origin:50% 100%" data-k="sy>:.9@12.45 1.3@13;sx>:1@12.45 .85@13"/></g>
  ${splash(374, 62, '#7fb4dc', 'data-k="o:0@13.06 1@13.12 1@13.9 0@14.3"')}
  <g data-k="o:0@12 1@12.6 1@14.4 0@14.9"><text x="440" y="62" class="tb">RDT</text><text x="440" y="88" class="ts">ein Tropfen Wasser auf die Bohnen</text></g>
  <!-- run 2: clean, compact stream with a slight wobble -->
  <g data-k="o:0@15 1@15.6 1@21 0@21.5"><g data-loop="1.7" data-k="x:0@0 1.8@.85 0@1.7">
    ${rep(28, i => { const L = f1(.8 + R() * .4), j = f1(R() * 8 - 4); return `<circle cx="650" cy="292" r="${f1(1.8 + R() * 1.5)}" fill="${col(i)}" data-loop="${L}" data-off="${f1(R() * 2)}" data-k="x<:0@0 ${f1(13 + j)}@${L};y>:0@0 162@${L};o:0@0 1@${f1(L * .1)} 1@${f1(L * .9)} 0@${L}"/>`; })}
  </g></g>
  <g data-k="o:0@15 1@15.4 1@21.2 0@21.6"><g data-k="sy<:0@15.4 1@21" style="transform-origin:50% 100%"><path d="M606 464Q660 384 714 464Z" fill="#7a5238"/></g></g>
  <g data-k="o:0@14.8 1@15.4 1@21.2 0@21.6"><text x="716" y="150" class="tb">mit RDT</text><text x="716" y="178" class="ts">kompakter, sauberer Strahl</text></g>
  <ellipse cx="660" cy="469" rx="70" ry="4" fill="#000" opacity=".6" filter="url(#f-soft)"/>
  ${glass(596, 392, 128, 66)}${shine(cup, 596, 392, 128, 74, 6, 2)}
  <path d="M603 424H717" stroke="#f3eee8" stroke-opacity=".75" stroke-width="1.5" stroke-dasharray="4 5"/><text x="738" y="430" class="ts">Zieldosis</text>
  <path d="M500 467H900" stroke="#5a4f47" stroke-width="2"/>`;
};

/* ---------- 5.7 calibration ---------- */
const teeth = (x1, y1, x2, y2, n, amp, sharp) => {
  const dx = (x2 - x1) / n, dy = (y2 - y1) / n, l = Math.hypot(dx, dy), nx = -dy / l * amp, ny = dx / l * amp; let d = `M${f1(x1)} ${f1(y1)}`;
  for (let i = 0; i < n; i++) { const mx = x1 + dx * (i + .5) + nx, my = y1 + dy * (i + .5) + ny, ex = x1 + dx * (i + 1), ey = y1 + dy * (i + 1); d += sharp ? `L${f1(mx)} ${f1(my)}L${f1(ex)} ${f1(ey)}` : `Q${f1(mx)} ${f1(my)} ${f1(ex)} ${f1(ey)}`; }
  return d;
};
const kalSvg = () => {
  const tk = (a, r0, r1) => { const q = a * Math.PI / 180; return `M${f1(540 + r0 * Math.sin(q))} ${f1(130 - r0 * Math.cos(q))}L${f1(540 + r1 * Math.sin(q))} ${f1(130 - r1 * Math.cos(q))}`; };
  const set = (up, sharp) => { const y = up ? [246.4, 232, 232, 246.4] : [253.6, 268, 268, 253.6], s = up ? 1 : -1, a = sharp ? 3.2 : 1.6;
    return `<path d="${teeth(120, y[0], 200, y[1], 8, s * a, sharp)}${teeth(260, y[2], 340, y[3], 8, s * a, sharp)}" fill="none" stroke="${sharp ? '#262626' : '#7a5238'}" stroke-width="1.7" stroke-linejoin="${sharp ? 'miter' : 'round'}"/>`; };
  const lo = 'M100 250L200 268H260L360 250V292H100Z', hi = 'M100 196H200V232L100 250Z M260 196H360V250L260 232Z';
  return `<svg class="dg c5-dg" style="--c5-rest:236px" viewBox="0 0 640 404" role="img" aria-label="Zwei Mahlscheiben im Schnitt, der Abstand folgt der Mahlgradeinstellung">${D}
  <g transform="translate(-20 -62) scale(1.25)">
    <ellipse cx="230" cy="338" rx="120" ry="5" fill="#262626" opacity=".3" filter="url(#f-soft)"/>
    <path d="${lo}" fill="#cfc9c3" stroke="#262626" stroke-width="2" stroke-linejoin="round"/><path d="${lo}" fill="url(#c5-hatch-l)"/>
    <rect x="120" y="292" width="220" height="10" fill="#7a736d" stroke="#262626" stroke-width="1.6"/><rect x="220" y="302" width="20" height="30" fill="#7a736d" stroke="#262626" stroke-width="1.6"/>
    <g data-only="0">${set(0, 1)}</g><g data-only="1">${set(0, 0)}</g>
    <g id="c5-kal-up">
      <path d="M100 180H200V196H100Z M260 180H360V196H260Z" fill="#7a736d" stroke="#262626" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="${hi}" fill="#cfc9c3" stroke="#262626" stroke-width="2" stroke-linejoin="round"/><path d="${hi}" fill="url(#c5-hatch-l)"/>
      <path d="M108 202H192M268 202H352" stroke="#fff" stroke-opacity=".6" stroke-width="2.5" stroke-linecap="round"/>
      <g data-only="0">${set(1, 1)}</g><g data-only="1">${set(1, 0)}</g>
    </g>
  </g>
  <path d="M8 250.5H452" stroke="#7a5238" stroke-width="1.5" stroke-dasharray="5 5"/><text x="8" y="274" class="tm">Nullpunkt</text>
  <g id="c5-kal-zero" style="opacity:0"><path d="M438 250.5l11 -8M438 250.5l14 0M438 250.5l11 8" stroke="#7a5238" stroke-width="2.5" stroke-linecap="round"/></g>
  <path id="c5-kal-dim" d="M76 235H92M84 235V250.5M76 250.5H92" fill="none" stroke="#262626" stroke-width="2"/>
  <text id="c5-kal-lab" x="68" y="240" class="ts end">Abstand</text>
  <text x="105" y="392" class="ts">Mahlgut</text><text id="c5-kal-none" x="196" y="392" class="tm" style="opacity:0">Mahlscheiben berühren sich</text>
  <g id="c5-kal-dots">${rep(9, i => `<circle cx="${206 + i * 26}" cy="386" r="4" fill="#6b4429"/>`)}</g>
  <!-- dial -->
  <circle cx="543" cy="135" r="74" fill="#262626" opacity=".25" filter="url(#f-soft)"/>
  <circle cx="540" cy="130" r="74" fill="#f3eee8" stroke="#262626" stroke-width="2.5"/>
  <path d="${tk(-135, 70, 70).split('L')[0]}A70 70 0 0 1 ${tk(-120, 70, 70).split('L')[1]}" fill="none" stroke="#7a5238" stroke-width="6"/>
  ${rep(21, i => `<path d="${tk(-135 + i * 13.5, i % 5 ? 62 : 56, 70)}" stroke="#262626" stroke-width="${i % 5 ? 1.5 : 2.5}"/>`)}
  <text x="505" y="172" class="ts mid">0</text>
  <text x="476" y="226" class="ts">fein</text><text x="604" y="226" class="ts end">grob</text>
  <g id="c5-kal-ptr" transform="rotate(-40.5 540 130)"><path d="M540 78l-7 15h14z" fill="#7a5238"/><circle cx="540" cy="130" r="36" fill="#cfc9c3" stroke="#262626" stroke-width="2.5"/>${rep(18, i => `<path d="${tk(i * 20, 30, 36)}" stroke="#262626" stroke-opacity=".5" stroke-width="1.5"/>`)}<path d="M540 100v18" stroke="#7a5238" stroke-width="4" stroke-linecap="round"/></g>
  <path d="M518 108A30 30 0 0 1 548 99" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>
  <text x="540" y="262" class="ts mid">Mahlgradeinstellung</text><text x="540" y="296" class="t mid" id="c5-kal-val" style="font-size:28px">3,5</text>
  </svg>`;
};

/* ---------- 5.8 clarity and body ---------- */
const klarSvg = () => {
  const R = rng(61), liq = 'M75 128L245 128L223 362Q222 370 212 370H108Q98 370 97 362Z';
  const parts = rep(70, i => { const y = 146 + R() * 212, e = (y - 80) / 280 * 26 + 8, x = 70 + e + R() * (180 - 2 * e), L = [4, 6, 8][i % 3]; return `<g data-loop="${L}" data-off="${f1(R() * 6)}" data-k="y:0@0 ${f1(-3 - R() * 4)}@${f1(L / 2)} 0@${L};x:0@0 ${f1(R() * 6 - 3)}@${f1(L / 2)} 0@${L}"><circle class="c5-kp" cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.1 + R() * 1.7)}" fill="${i % 4 ? '#1d110a' : '#d9a35f'}" style="opacity:0"/></g>`; });
  const row = (y, name, id, v) => `<path class="ln" d="M${f1(250 - (y - 80) / 280 * 26 + 4)} ${y - 6}H304" stroke-width="1.5"/><text x="312" y="${y - 10}" class="tl">${name}</text><text x="312" y="${y + 12}" class="tm" id="${id}">${v}</text>`;
  return `<svg class="dg c5-dg" style="--c5-rest:190px" viewBox="0 0 470 400" role="img" aria-label="Tasse im Schnitt: von klar und durchscheinend bis dicht und cremig">${D}
  <defs><clipPath id="c5-kkc"><path d="${liq}"/></clipPath></defs>
  <ellipse cx="160" cy="376" rx="84" ry="6" fill="#262626" opacity=".35" filter="url(#f-soft)"/>
  <rect x="26" y="92" width="268" height="252" rx="12" fill="#f3eee8"/>
  ${rep(9, i => `<path d="M42 ${118 + i * 26}H278" stroke="#262626" stroke-opacity=".55" stroke-width="2"/>`)}
  <path id="c5-kk-liq" d="${liq}" fill="#9c5527" fill-opacity=".6"/>
  <g clip-path="url(#c5-kkc)">
    <g id="c5-kk-swirl" style="opacity:.5" fill="none" stroke="#c99a6b" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"><path d="M98 190q30 -14 62 0t62 0" data-loop="6" data-k="x:0@0 7@3 0@6"/><path d="M104 250q28 14 56 0t56 0" data-loop="8" data-k="x:0@0 -8@4 0@8"/><path d="M110 310q24 -12 50 0t50 0" data-loop="6" data-off="2" data-k="x:0@0 6@3 0@6"/></g>
    ${parts}
    <rect id="c5-kk-crema" x="70" y="128" width="180" height="12" fill="#d9a35f"/>
    <g id="c5-kk-wave">${wave(75, 128, 170, '#d9a35f', 2.2, 3)}</g>
  </g>
  <path d="M70 80L96 360Q98 372 110 372H210Q222 372 224 360L250 80" fill="rgba(243,238,232,.12)" stroke="#262626" stroke-width="3" stroke-linejoin="round"/>
  <path d="M88 96L104 280" stroke="#f3eee8" stroke-opacity=".7" stroke-width="4" stroke-linecap="round"/>
  ${shine('M70 80H250L224 372H96Z', 70, 80, 180, 292, 6, 1)}
  ${row(176, 'Trübung', 'c5-kk-t1', 'mittel')}${row(256, 'Textur', 'c5-kk-t2', 'rund')}${row(336, 'Intensität', 'c5-kk-t3', 'mittel')}
  </svg>`;
};
const KTXT = [
  ['wenig', 'leicht', 'dezent', '<b>Klar:</b> durchscheinende Tasse, differenzierte Aromatik, häufig weniger Trübung.'],
  ['mittel', 'rund', 'mittel', '<b>Ausgewogen:</b> etwas von beidem. Viele Rezepte suchen genau diese Mitte.'],
  ['mehr', 'cremig', 'hoch', '<b>Körperreich:</b> dichte Tasse, vollmundiges Mundgefühl, cremigere Textur, höhere wahrgenommene Intensität.']
];
// texts that cross-fade when a slider passes a threshold
const sw = (id, list, on) => `<div class="c5-sw why" id="${id}">${list.map((t, i) => `<p${i === on ? ' class="on"' : ''}>${t}</p>`).join('')}</div>`;

/* ================= scenes ================= */
export const html = chapter(CH) +

film({ id: 'aufbau-muehle', ch: CH, title: '5.1 Aufbau einer Kaffeemühle', name: 'Die Mühle, zerlegt', dur: 22, rate: 1, still: 9.6,
  marks: [
    ['Von außen', 0, 'Außen ein Gehäuse. Innen arbeiten die <b>zentralen Komponenten</b> auf einer Achse zusammen.'],
    ['Zentrale Komponenten', 2.6, '<b>Bohnenbehälter</b>, <b>Mahlgradverstellung</b>, <b>Mahlscheiben</b> in der <b>Mahlkammer</b>, <b>Auswurfschacht</b> und <b>Motor</b>.'],
    ['Bohnen gelangen ins Mahlwerk', 13, '<b>1.</b> Die Bohnen gelangen aus dem Bohnenbehälter ins Mahlwerk.'],
    ['Mahlscheiben zerkleinern die Bohnen', 16, '<b>2.</b> Der Motor treibt die Mahlscheiben an. Sie zerkleinern die Bohnen.'],
    ['Mahlgut wird ausgeworfen', 19, '<b>3.</b> Das Mahlgut wird über den Auswurfschacht ausgeworfen.']
  ], svg: aufbauSvg() }) +

realFilm({ id: 'mahlen-echt', ch: CH, title: "Mahlen in echt", name: "Direkt ins Sieb", clip: 'ch5-mahlen', dur: 9, rate: 0.5,
  lead: "Bohnen gelangen ins Mahlwerk, die Mahlscheiben zerkleinern sie, das Mahlgut fällt ins Sieb.",
  marks: [["Siebträger in der Gabel", 0, "Der Siebträger sitzt direkt unter dem Auswurfschacht."], ["Mahlgut fällt", 1.4, "Die Mahlscheiben zerkleinern die Bohnen, das <b>Mahlgut wird ausgeworfen</b>."], ["Auswurf abklopfen", 3.2, "Ein leichtes Klopfen löst Mahlgut, das im Schacht hängen bleibt (<b>Retention</b>)."]] }) +

scene({ id: 'single-dosing', ch: CH, title: '5.2 Single Dosing', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Single Dosing</h2>
      <div class="rv" style="--d:2"><span class="label">Definition</span><p class="lead wide" style="margin-top:4px">Einzelportionen werden direkt vor dem Mahlen abgewogen.</p></div>
      <div class="grid2 rv" style="--d:3">
        <div class="stack" style="gap:8px"><span class="label acc">Vorteile</span>${notes(['Flexibler Bohnenwechsel.', 'Weniger Bohnen im Hopper.', 'Kontrollierte Dosierung.', 'Ideal für unterschiedliche Kaffeesorten.'], 'sm')}</div>
        <div class="stack" style="gap:8px"><span class="label">Nachteile</span>${notes(['Zusätzlicher Wiegeaufwand.', 'Teilweise längere Zubereitung.', 'Restkaffee im Mahlwerk möglich.'], 'sm')}</div>
      </div>
    </div>
    <div class="cmp rv-img" style="--d:2;--n:2" data-film data-bare data-dur="8" data-still="6.9">
      <div class="card">${wfSingle()}<h3>Single Dosing</h3><p class="mute c5-cap">Eine Dosis abwiegen, einfüllen, komplett durchmahlen. Beispiel: 18 g.</p></div>
      <div class="card">${wfHopper()}<h3>Hopper</h3><p class="mute c5-cap">Der Bohnenbehälter ist gefüllt. Gemahlen wird auf Abruf, Portion für Portion.</p></div>
    </div>
  </div>`)) +

film({ id: 'retention', ch: CH, title: '5.3 Retention und Totraum', name: 'Was in der Mühle bleibt', dur: 22, rate: .5, still: 18.6,
  marks: [
    ['Dosis 1 wird gemahlen', 0, 'Die erste Dosis läuft durch Mahlkammer und Auswurfschacht in den Becher.'],
    ['Retention', 7, '<b>Retention:</b> Mahlgut, das nach dem Mahlen in der Mühle zurückbleibt.'],
    ['Aktiver Totraum', 9.5, '<b>Aktiver Totraum:</b> Mahlgut wird durch folgende Mahlvorgänge wieder ausgetragen.'],
    ['Passiver Totraum', 12, '<b>Passiver Totraum:</b> Mahlgut verbleibt über längere Zeit in der Mühle.'],
    ['Dosis 2 trägt Altes aus', 14.6, 'Die neue Dosis schiebt den Rest aus dem aktiven Totraum vor sich her: <b>Vermischung alter und neuer Bohnen</b>.'],
    ['Mögliche Auswirkungen', 19.6, 'Vermischung alter und neuer Bohnen, <b>schwankende Dosierung</b>, <b>beeinträchtigte Reproduzierbarkeit</b>.']
  ], svg: retSvg() }) +

scene({ id: 'partikel', ch: CH, title: '5.4 Partikelgrößenverteilung und Fines', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title sm rv" style="--d:1">Partikelgrößen&shy;verteilung und Fines</h2>
      <p class="lead wide rv" style="--d:2">Beim Mahlen entstehen unterschiedlich große Partikel. <b>Fines</b> = besonders feine Kaffeepartikel.</p>
      <div class="stack rv" style="--d:3;gap:8px"><span class="label acc">Eigenschaften der Fines</span>${notes(['Große Oberfläche im Verhältnis zum Volumen.', 'Schnelle Extraktion.', 'Können Zwischenräume füllen.', 'Erhöhen unter Umständen den Puck-Widerstand.'], 'sm')}</div>
      <div class="stack rv" style="--d:4;gap:8px"><span class="label">Einfluss auf den Espresso</span><div class="chips">${['Durchfluss', 'Körper', 'Klarheit', 'Extraktionsverhalten'].map(c => `<span class="chip">${c}</span>`).join('')}</div></div>
    </div>
    <div class="stack rv-img" style="--d:2;gap:12px">
      ${partSvg()}
      <div class="slider"><div class="ends"><span>wenig Fines</span><span class="label">Fines-Anteil: <b id="c5-fines-word">mittel</b></span><span>viele Fines</span></div><input type="range" id="c5-fines" min="0" max="100" value="35" aria-label="Fines-Anteil"></div>
      ${sw('c5-fines-txt', FTXT.map(t => t[1]), 1)}
    </div>
  </div>`)) +

film({ id: 'mahlscheiben', ch: CH, title: '5.5 Mahlscheiben und Geometrie', name: 'Flach oder konisch', dur: 18, rate: .5, still: 16.5,
  marks: [
    ['Zwei Bauformen', 0, 'Zwei Geometrien im Schnitt: <b>flache</b> und <b>konische</b> Mahlscheiben.'],
    ['Flache Mahlscheiben', 3, 'Zwei horizontale Scheiben. Die Bohnen treten in der Mitte ein und wandern <b>nach außen</b>.'],
    ['Konische Mahlscheiben', 9, 'Ein Kegel dreht sich in einem Ring. Die Bohnen wandern <b>nach unten</b>.'],
    ['Der Spalt wird enger', 15, 'In beiden Bauformen wird der Spalt entlang des Weges enger. Die Partikel werden <b>kleiner</b>.']
  ], svg: mahlSvg() }) +

scene({ id: 'mahlscheiben-faktoren', ch: CH, title: 'Mahlscheiben: Faktoren und Einfluss', light: true, steps: 5 }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title sm rv" style="--d:1">Auf die Geometrie kommt es an</h2>
      <div class="stack rv" style="--d:2;gap:8px"><span class="label acc">Entscheidende Faktoren</span>
        <ol class="c5-num">${['Durchmesser.', 'Schneidengeometrie.', 'Winkel und Ausrichtung.', 'Abstand der Mahlscheiben.', 'Drehzahl.'].map((t, i) => `<li data-s="${i + 1}"><span class="n">${i + 1}</span><span>${t}</span></li>`).join('')}</ol></div>
      <div class="stack rv" style="--d:3;gap:8px"><span class="label">Einfluss auf</span><div class="chips">${['Partikelverteilung', 'Fines-Anteil', 'Mahlgeschwindigkeit', 'Klarheit und Körper'].map(c => `<span class="chip">${c}</span>`).join('')}</div></div>
      <div class="rv" style="--d:4">${why('<b>Wichtig:</b> Größere Mahlscheiben bedeuten nicht automatisch bessere Mahlqualität.')}</div>
    </div>
    <div class="rv-img" style="--d:2">${faktSvg()}</div>
  </div>`)) +

film({ id: 'statik-rdt', ch: CH, title: '5.6 Temperatur und statische Aufladung', name: 'Wärme, Statik und ein Tropfen Wasser', dur: 22, rate: .5, still: 8.5,
  marks: [
    ['Reibung erzeugt Wärme', 0, '<b>Mahlguttemperatur:</b> Reibung erzeugt Wärme. Drehzahl und Mahlgeschwindigkeit beeinflussen die Erwärmung.'],
    ['Wärme und Reproduzierbarkeit', 3.5, 'Hohe Temperaturen können die <b>Reproduzierbarkeit</b> beeinflussen.'],
    ['Statische Aufladung', 6, '<b>Statische Aufladung:</b> Mahlgut bleibt am Auswurf hängen. Mehr Rückstände, ungenaue Dosierung.'],
    ['RDT: ein Tropfen Wasser', 11.6, '<b>RDT – Ross Droplet Technique:</b> minimale Wassermenge auf die Bohnen geben.'],
    ['Sauberer Auswurf', 14.8, 'RDT reduziert die statische Aufladung und sorgt für einen <b>saubereren Mahlgutauswurf</b>.']
  ], svg: statSvg() }) +

scene({ id: 'kalibrierung', ch: CH, title: '5.7 Mahlgradkalibrierung', light: true, steps: 1 }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title sm rv" style="--d:1">Mahlgrad&shy;kalibrierung</h2>
      <p class="lead wide rv" style="--d:2"><b>Ziel:</b> reproduzierbare Mahlgradeinstellungen.</p>
      <div class="rv" style="--d:3">${tbl(['Wichtige Faktoren', 'Was dahintersteckt'], [
        ['Abstand der Mahlscheiben', 'Je kleiner der Abstand, desto feiner das Mahlgut.'],
        ['Nullpunkt', 'Die Mahlscheiben berühren sich gerade. Von hier aus wird gezählt.'],
        ['Mahlgradeinstellung', 'Die Position am Verstellring, bezogen auf den Nullpunkt.'],
        ['Zustand der Mahlscheiben', 'Abnutzung verändert das Mahlgut bei gleicher Einstellung.']])}</div>
    </div>
    <div class="stack rv-img" style="--d:2;gap:10px">
      ${kalSvg()}
      <div class="slider"><div class="ends"><span>Nullpunkt</span><span class="label">Verstellring drehen</span><span>grob</span></div><input type="range" id="c5-kal" min="0" max="100" value="35" aria-label="Mahlgradeinstellung"></div>
      <div class="c5-row"><div class="tabs" role="group" aria-label="Zustand der Mahlscheiben"><button data-go="0" aria-pressed="false">Scharfe Schneiden</button><button data-go="1" aria-pressed="false">Abgenutzte Schneiden</button></div>
        <div class="pane c5-cap"><p data-only="0">Gleiche Einstellung, gleiches Mahlgut.</p><p data-only="1">Gleiche Einstellung, ungleichmäßigeres Mahlgut. Neu kalibrieren.</p></div></div>
    </div>
  </div>`)) +

scene({ id: 'klarheit-koerper', ch: CH, title: '5.8 Klarheit und Körper', light: true }, inner(`
  <div class="split rev">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Klarheit und Körper</h2>
      <div class="grid2 rv" style="--d:2">
        <div class="card stack" style="gap:10px"><h3 class="c5-h3">Klarheit</h3><div class="c5-bar"><i id="c5-kk-b1"></i></div>${notes(['Differenzierte Aromatik.', 'Häufig weniger Trübung.'], 'sm')}</div>
        <div class="card stack" style="gap:10px"><h3 class="c5-h3">Körper</h3><div class="c5-bar"><i id="c5-kk-b2"></i></div>${notes(['Vollmundiges Mundgefühl.', 'Cremigere Textur.', 'Höhere wahrgenommene Intensität.'], 'sm')}</div>
      </div>
      <div class="stack rv" style="--d:3;gap:8px"><span class="label acc">Einflussfaktoren</span><div class="chips">${['Mahlscheibengeometrie', 'Partikelverteilung', 'Fines-Anteil', 'Röstung', 'Extraktionsparameter'].map(c => `<span class="chip">${c}</span>`).join('')}</div></div>
      <div class="rv" style="--d:4">${sw('c5-kk-txt', KTXT.map(t => t[3]), 1)}</div>
    </div>
    <div class="stack rv-img" style="--d:2;gap:10px">
      <div data-film data-bare data-dur="24" data-still="6">${klarSvg()}</div>
      <div class="slider"><div class="ends"><span>Klarheit</span><span>Körper</span></div><input type="range" id="c5-kk" min="0" max="100" value="50" aria-label="Balance zwischen Klarheit und Körper"></div>
    </div>
  </div>`));

export const css = `
/* chapter 5 */
.c5-dg{max-height:calc(100dvh - var(--hud-h) - var(--dock-h) - var(--c5-rest,70px))}
.c5-wf{width:100%;height:auto;max-height:38vh}
.c5-cap{font-size:clamp(13px,.4vw + 10px,17px);color:var(--mute)}
.c5-sw{display:grid;max-width:none}
.c5-sw>p{grid-area:1/1;opacity:0;transform:translateY(6px);transition:opacity .45s,transform .6s var(--ease)}
.c5-sw>p.on{opacity:1;transform:none}
.c5-fine{transition:opacity .5s}
.c5-kp{transition:opacity .5s}
.c5-drift{animation:c5-drift 13s ease-in-out infinite alternate}
.c5-drift.b{animation-duration:19s;animation-direction:alternate-reverse}
@keyframes c5-drift{from{transform:translate(-5px,3px)}to{transform:translate(5px,-4px)}}
.spin.c5-slow{animation-duration:40s}
.c5-num{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.2em;font-size:clamp(15px,.75vw + 9px,21px)}
.c5-num li{display:flex;gap:.8em;align-items:baseline}
.c5-num .n{font-family:var(--mono);font-size:.72em;color:var(--brown);min-width:1ch}
.c5-h3{font-size:clamp(20px,1.3vw + 10px,34px);font-weight:400;line-height:1.05}
.c5-bar{height:6px;border-radius:3px;background:var(--line);overflow:hidden}
.c5-bar i{display:block;height:100%;width:50%;background:var(--brown);border-radius:3px}
.c5-row{display:flex;gap:10px 18px;align-items:center;flex-wrap:wrap}
.c5-row .pane{flex:1 1 180px}
#c5-kal-zero,#c5-kal-none{transition:opacity .3s}
.slider .ends .label b{color:var(--brown);font-weight:600}
@media (max-width:980px),(max-aspect-ratio:1/1){.c5-dg{max-height:none}.c5-wf{max-height:none}}
`;

/* Sliders never jump: every widget eases its current values toward the slider's target in one small rAF loop,
   so dragging, tapping and keyboard steps can interrupt each other at any moment. */
export const js = `
const c5curve = ${c5curve.toString()};
function c5glide(target, paint, k){
  var cur = target().slice(), raf = 0;
  function tick(){
    var tg = target(), busy = false;
    for (var i = 0; i < tg.length; i++) { var d = tg[i] - cur[i]; if (Math.abs(d) < .02 || reduce) cur[i] = tg[i]; else { cur[i] += d * (k && k[i] || .14); busy = true; } }
    paint(cur); raf = busy ? requestAnimationFrame(tick) : 0;
  }
  paint(cur);
  return { kick: function(){ if (!raf) raf = requestAnimationFrame(tick); }, set: function(i, v){ cur[i] = v; } };
}
function c5pick(box, k){ $$('p', box).forEach(function(p, i){ p.classList.toggle('on', i === k); }); }
(function(){
  var sl = $('#c5-fines'); if (!sl) return;
  var sc = $('#s-partikel'), fines = $$('.c5-fine', sc), pf = $('#c5-pf'), pall = $('#c5-pall'), flab = $('#c5-flab'), txt = $('#c5-fines-txt'), word = $('#c5-fines-word'), rev = $('#c5-rev'), last = -1, lk = -1, open = 350;
  var W = ${JSON.stringify(FTXT.map(t => t[0]))};
  var g = c5glide(function(){ return [+sl.value, open]; }, function(c){
    var v = c[0], C = c5curve(.08 + v / 100 * .52);
    pf.setAttribute('d', C.f); pall.setAttribute('d', C.all); flab.setAttribute('y', Math.min(226, C.fy - 12).toFixed(1));
    rev.setAttribute('width', c[1].toFixed(1));
    var n = Math.round(v / 100 * fines.length);
    if (n !== last) { last = n; fines.forEach(function(e, i){ e.style.opacity = i < n ? 1 : 0; }); }
    var k = v < 34 ? 0 : v < 67 ? 1 : 2; if (k !== lk) { lk = k; c5pick(txt, k); word.textContent = W[k]; }
  }, [.14, .05]);
  sl.addEventListener('input', g.kick);
  hooks['partikel'] = { enter: function(){ if (reduce) return; g.set(1, 0); g.kick(); } };
})();
(function(){
  var sl = $('#c5-kal'); if (!sl) return;
  var up = $('#c5-kal-up'), dim = $('#c5-kal-dim'), lab = $('#c5-kal-lab'), ptr = $('#c5-kal-ptr'), val = $('#c5-kal-val'), zero = $('#c5-kal-zero'), none = $('#c5-kal-none'), dots = $$('#c5-kal-dots circle'), worn = 0;
  var J = [.1, -.5, .75, -.3, .55, -.6, .2, .9, -.4];
  var g = c5glide(function(){ return [+sl.value, worn * 100]; }, function(c){
    var v = c[0], w = c[1] / 100, gap = v * .34, y = 250.5 - gap * 1.25, z = v < .6;
    up.setAttribute('transform', 'translate(0 ' + (-gap).toFixed(2) + ')');
    dim.setAttribute('d', 'M76 ' + y.toFixed(1) + 'H92M84 ' + y.toFixed(1) + 'V250.5M76 250.5H92');
    lab.setAttribute('y', Math.min(243, y + gap * .625 + 6).toFixed(1)); lab.textContent = z ? 'Kontakt' : 'Abstand';
    ptr.setAttribute('transform', 'rotate(' + (-135 + v * 2.7).toFixed(2) + ' 540 130)');
    val.textContent = z ? 'Nullpunkt' : de(v / 10, 1);
    zero.style.opacity = z ? 1 : 0; none.style.opacity = z ? 1 : 0;
    dots.forEach(function(d, i){ d.setAttribute('r', z ? 0 : clamp((1.4 + gap * .2) * (1 + w * J[i]), .9, 11.5).toFixed(2)); });
  });
  sl.addEventListener('input', g.kick);
  hooks['kalibrierung'] = { step: function(sc, n){ worn = n; g.kick(); } };
})();
(function(){
  var sl = $('#c5-kk'); if (!sl) return;
  var liq = $('#c5-kk-liq'), crema = $('#c5-kk-crema'), wv = $('#c5-kk-wave'), swirl = $('#c5-kk-swirl'), parts = $$('.c5-kp'), b1 = $('#c5-kk-b1'), b2 = $('#c5-kk-b2'), txt = $('#c5-kk-txt'), t = [$('#c5-kk-t1'), $('#c5-kk-t2'), $('#c5-kk-t3')], lk = -1, ln = -1;
  var T = ${JSON.stringify(KTXT.map(t => t.slice(0, 3)))}, A = [168, 96, 46], B = [42, 23, 13];
  var g = c5glide(function(){ return [+sl.value]; }, function(c){
    var u = c[0] / 100;
    liq.setAttribute('fill', 'rgb(' + A.map(function(a, i){ return Math.round(a + (B[i] - a) * u); }).join(',') + ')');
    liq.setAttribute('fill-opacity', (.36 + .64 * Math.pow(u, .8)).toFixed(3));
    crema.setAttribute('height', (4 + 18 * u).toFixed(1)); wv.style.opacity = (.35 + .65 * u).toFixed(2);
    swirl.style.opacity = (u * .9).toFixed(2);
    var n = Math.round(u * parts.length); if (n !== ln) { ln = n; parts.forEach(function(p, i){ p.style.opacity = i < n ? .85 : 0; }); }
    b1.style.width = (100 - u * 80).toFixed(1) + '%'; b2.style.width = (20 + u * 80).toFixed(1) + '%';
    var k = u < .34 ? 0 : u < .67 ? 1 : 2; if (k !== lk) { lk = k; c5pick(txt, k); t.forEach(function(e, i){ e.textContent = T[k][i]; }); }
  });
  sl.addEventListener('input', g.kick);
})();
`;

export const quiz = [
  { q: 'Was bedeutet Retention bei einer Kaffeemühle?', o: ['Mahlgut, das nach dem Mahlen in der Mühle zurückbleibt.', 'Die Zeit, die die Mühle für eine Dosis braucht.', 'Der Abstand zwischen den Mahlscheiben.'], a: 0, e: 'Im <b>aktiven Totraum</b> wird es vom nächsten Mahlvorgang ausgetragen, im <b>passiven Totraum</b> bleibt es über längere Zeit liegen.', go: 'retention' },
  { q: 'Was bewirkt die Ross Droplet Technique (RDT)?', o: ['Sie kühlt die Mahlscheiben auf Raumtemperatur.', 'Sie stellt den Nullpunkt der Mühle neu ein.', 'Sie reduziert die statische Aufladung des Mahlguts.'], a: 2, e: 'Eine <b>minimale Wassermenge</b> auf den Bohnen reduziert die statische Aufladung und sorgt für einen saubereren Mahlgutauswurf.', go: 'statik-rdt' }
];
