import { chapter, scene, inner, kicker, film, notes, tbl, stats, why, rep, rng, defs, f1, wave, steam, splash, glint } from '../lib.mjs';
const CH = 2;

/* One colour code for the whole chapter: cold water blue, hot water red-orange, steam pale. */
const COLD = '#7fb4dc', HOT = '#e3704f', MILK = '#f3eee8', PEACH = '#f8cbad', STEEL = '#cfc9c3', CASE = '#5a4f47', DARK = '#17120f';

/* ---------- film parts ---------- */
// a tube that fills with water between t0 and t1 and then shows the flow as marching dashes
const tube = (d, col, t0, t1, { w = 10, dash = MILK, sp = 1, co = 1, win = '' } = {}) => `
  <path d="${d}" fill="none" stroke="${CASE}" stroke-width="${w + 4}" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${DARK}" stroke-width="${w}" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${col}" stroke-opacity="${co}" stroke-width="${w}" stroke-linejoin="round" class="draw" pathLength="1" data-k="d:1@${t0} 0@${t1}"/>
  <g data-k="${win || `o:0@${f1(t1 - .2)} 1@${f1(t1 + .3)}`}"><path d="${d}" fill="none" stroke="${dash}" stroke-opacity=".8" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 15" data-loop="${sp}" data-k="d~:22@0 0@${sp}"/></g>`;
// a tube that is always full
const pipe = (d, col, { w = 10, sp = 0, co = 1, dash = MILK } = {}) => `
  <path d="${d}" fill="none" stroke="${CASE}" stroke-width="${w + 4}" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${DARK}" stroke-width="${w}" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${col}" stroke-opacity="${co}" stroke-width="${w}" stroke-linejoin="round"/>
  ${sp ? `<path d="${d}" fill="none" stroke="${dash}" stroke-opacity=".8" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 15" data-loop="${sp}" data-k="d~:22@0 0@${sp}"/>` : ''}`;
const pivot = (x, y) => `style="transform-box:view-box;transform-origin:${x}px ${y}px"`;
// pressure gauge without numbers: scale from -120 deg to +120 deg, needle keys in `k`
const gauge = (x, y, r, k, lim) => `
  <circle cx="${x}" cy="${y}" r="${r}" fill="#211b17" stroke="url(#g-steel)" stroke-width="5"/>
  ${rep(9, i => `<path d="M${x} ${y - r + 9}v${i % 2 ? 6 : 11}" stroke="${MILK}" stroke-opacity="${i % 2 ? .45 : .85}" stroke-width="2" transform="rotate(${-120 + i * 30} ${x} ${y})"/>`)}
  ${lim != null ? `<path d="M${x} ${y - r + 6}v15" stroke="${HOT}" stroke-width="5" transform="rotate(${lim} ${x} ${y})"/>` : ''}
  <g ${pivot(x, y)} data-k="${k}"><path d="M${x} ${y + 9}V${y - r + 13}" stroke="${PEACH}" stroke-width="3.5" stroke-linecap="round"/></g>
  <circle cx="${x}" cy="${y}" r="5.5" fill="${PEACH}"/>`;

/* ---------- 2.1 the water path through the machine ---------- */
const aufbauSvg = () => { const R = rng(5), END = 25.4;
  const on = a => `data-k="o:.3@${a} 1@${f1(a + .5)}"`;
  const lab = (a, b) => `data-k="o:0@${a} 1@${f1(a + .5)}${b ? ` 1@${b} .4@${f1(b + .6)} .4@${f1(END - .7)} 1@${END}` : ''};y^:9@${a} 0@${f1(a + .7)}"`;
  const lead = (d, a, b) => `<path class="lead-l" d="${d}" data-k="o:0@${a} .9@${f1(a + .5)}${b ? ` .9@${b} .3@${f1(b + .6)} .3@${f1(END - .7)} .9@${END}` : ''}"/>`;
  return defs + `<defs><clipPath id="c2-a-boil"><rect x="452" y="186" width="180" height="240" rx="30"/></clipPath><clipPath id="c2-a-tank"><rect x="121" y="150" width="90" height="271"/></clipPath><clipPath id="c2-a-cup"><path d="M701 356 L706 398 Q707 403 712 403 H736 Q741 403 742 398 L747 356 Z"/></clipPath></defs>
  <!-- housing -->
  <path d="M96 128 Q96 112 112 112 H770 Q786 112 786 128 V222 H672 V408 H800 Q806 408 806 414 V438 Q806 444 800 444 H102 Q96 444 96 438 Z" fill="rgba(243,238,232,.035)" stroke="${MILK}" stroke-opacity=".32" stroke-width="2" stroke-linejoin="round"/>
  <ellipse cx="450" cy="452" rx="360" ry="7" fill="#000" opacity=".35" filter="url(#f-soft)"/>
  <!-- tank -->
  <g clip-path="url(#c2-a-tank)"><g opacity=".6"><rect x="121" y="204" width="90" height="218" fill="${COLD}"/>${wave(121, 204, 90, COLD, 2.5, 3.4)}</g></g>
  <path d="M120 150 V422 H212 V150" fill="none" stroke="${MILK}" stroke-opacity=".6" stroke-width="2" stroke-linejoin="round"/>
  <text x="166" y="186" class="ts mid">Tank</text>
  <!-- OPV return, then the main line from tank to boiler -->
  ${tube('M392 368 V410 H210', COLD, 5.3, 6.5, { w: 8, win: 'o:0@6.2 1@6.6 1@7.7 0@8.1' })}
  ${tube('M210 368 H454', COLD, .9, 3.3)}
  <g ${on(.5)}><circle cx="292" cy="368" r="25" fill="#2b2420" stroke="${STEEL}" stroke-width="2.5"/>
    <g ${pivot(292, 368)} data-loop="1.4" data-k="r~:0@0 360@1.4"><path d="M277 353 L307 383 M307 353 L277 383" stroke="${MILK}" stroke-width="3" stroke-linecap="round"/><circle cx="292" cy="368" r="5" fill="${MILK}"/></g></g>
  <text x="292" y="330" class="t mid" ${lab(.6, 4.2)}>Pumpe</text>
  <g ${on(4.2)}><g data-k="s^:1@5 1.25@5.5 1@6.1"><path d="M381 379 H403 L381 403 H403 Z" fill="#2b2420" stroke="${PEACH}" stroke-width="2.5" stroke-linejoin="round"/></g>
    <path d="M405 391 l4 -6 l6 12 l6 -12 l6 12 l4 -6" fill="none" stroke="${STEEL}" stroke-width="2" stroke-linejoin="round"/></g>
  ${lead('M392 452 V420', 4.5, 8)}<text x="404" y="474" class="t end" ${lab(4.5, 8)}>Überdruckventil (OPV)</text>
  <!-- boiler with heating element -->
  <g ${on(8)}>
    <g clip-path="url(#c2-a-boil)">
      <rect x="452" y="186" width="180" height="240" fill="${MILK}" opacity=".05"/>
      <rect x="452" y="186" width="180" height="84" fill="${MILK}" data-k="o:0@10.6 .14@12.6"/>
      <g fill="${COLD}" fill-opacity=".85" data-k="fill:#7fb4dc@9.6 #e3704f@12.4"><rect x="452" y="266" width="180" height="162" fill="inherit"/>${wave(452, 266, 180, 'inherit', 3, 2.6)}</g>
      <g data-k="o:0@10.2 1@11.2">${rep(10, i => { const L = f1(1.3 + R() * 1.1); return `<circle cx="${f1(500 + R() * 104)}" cy="396" r="${f1(2.5 + R() * 3)}" fill="none" stroke="${MILK}" stroke-opacity=".8" stroke-width="1.5" data-loop="${L}" data-off="${f1(R() * 2)}" data-k="y<:0@0 ${-f1(108 + R() * 16)}@${L};x:0@0 ${f1(R() * 12 - 6)}@${L};o:0@0 .9@${f1(L * .2)} .9@${f1(L * .8)} 0@${L}"/>`; })}</g>
      ${steam(542, 262, 3, 'data-k="o:0@11 1@12.6"')}
    </g>
    <path d="M452 336 H474 Q488 336 488 350 V384 Q488 398 502 398 H598 Q612 398 612 386 Q612 374 598 374 H524" fill="none" stroke="${HOT}" stroke-width="16" stroke-linecap="round" filter="url(#f-glow)" data-k="o:0@8.7 .75@10 .75@13.6 .2@14.3 .75@15.1 .2@15.9 .75@16.7"/>
    <path d="M452 336 H474 Q488 336 488 350 V384 Q488 398 502 398 H598 Q612 398 612 386 Q612 374 598 374 H524" fill="none" stroke="#6b4429" stroke-width="7" stroke-linecap="round" data-k="stroke:#6b4429@8.7 #f8cbad@10"/>
    <rect x="452" y="186" width="180" height="240" rx="30" fill="none" stroke="${STEEL}" stroke-width="2.5"/>
    ${glint(456, 190, 172, 232, 6.5)}
  </g>
  <text x="542" y="236" class="t mid" ${lab(8.2, 13)}>Boiler / Kessel</text>
  ${lead('M556 452 V408', 9, 13)}<text x="556" y="474" class="t mid" ${lab(9, 13)}>Heizelement</text>
  <!-- temperature control: sensor, controller, heater line -->
  <g ${on(13)}>
    <path d="M356 182 H430 V290 H452 M356 198 H414 V336 H452" fill="none" stroke="#8d857e" stroke-width="2" data-k="stroke:#8d857e@13 #f8cbad@13.6"/>
    <path d="M452 290 H476" stroke="${STEEL}" stroke-width="3"/><circle cx="478" cy="290" r="5" fill="${PEACH}"/>
    <rect x="256" y="168" width="100" height="44" rx="8" fill="#2b2420" stroke="${STEEL}" stroke-width="2"/><rect x="264" y="176" width="52" height="28" rx="4" fill="${DARK}"/>
    <path d="M268 198 C280 198 284 183 294 183 S304 190 312 188" fill="none" stroke="${HOT}" stroke-width="2.5" stroke-linecap="round" class="draw" pathLength="1" data-k="d:1@13.5 0@15.2"/>
    <circle cx="332" cy="184" r="4" fill="${PEACH}" data-k="o:.25@13.3 1@13.6 1@14.2 .25@14.4 .25@15 1@15.2 1@15.8 .25@16 .25@16.6 1@16.8"/><circle cx="344" cy="184" r="4" fill="${CASE}"/><rect x="326" y="194" width="24" height="6" rx="3" fill="${CASE}"/>
    <g data-k="o:0@13.4 1@13.8 1@16.9 0@17.3">
      <circle cx="478" cy="290" r="5" fill="${MILK}" data-loop="1.6" data-k="x~:0@0 -48@.4 -48@1.1 -122@1.6;y~:0@0 0@.4 -108@1.1 -108@1.6;o:0@0 1@.2 1@1.4 0@1.6"/>
      <circle cx="356" cy="198" r="5" fill="${MILK}" data-loop="1.6" data-off=".8" data-k="x~:0@0 58@.4 58@1.3 96@1.6;y~:0@0 0@.4 138@1.3 138@1.6;o:0@0 1@.2 1@1.4 0@1.6"/></g>
  </g>
  ${lead('M306 102 V164', 13.2, 17)}<text x="258" y="96" class="t" ${lab(13.2, 17)}>Temperaturregelung</text>
  <!-- brew group -->
  ${tube('M630 300 H652 V182 H724 V226', HOT, 17.4, 18.8)}
  <g ${on(17)}>
    <rect x="690" y="222" width="68" height="30" fill="url(#g-steel)"/><rect x="680" y="252" width="88" height="12" rx="3" fill="url(#g-steel)"/>${glint(690, 222, 68, 42, 5.2)}
    <path d="M688 264 H760 V284 Q760 292 752 292 H696 Q688 292 688 284 Z" fill="#2b2420" stroke="#a39a93" stroke-width="2"/><rect x="694" y="268" width="60" height="16" rx="2" fill="#5b3720"/>
    <rect x="760" y="270" width="50" height="12" rx="6" fill="#2a170d" stroke="${CASE}" stroke-width="1.5"/><path d="M716 292 h16 v8 h-16 z" fill="#a39a93"/>
    <g data-k="o:0@19.1 1@19.3"><g data-k="sy>:0@19.1 1@19.5" style="transform-origin:50% 0%"><g data-loop=".9" data-k="sx:1@0 .6@.45 1@.9"><rect x="722.5" y="300" width="3" height="98" rx="1.5" fill="#8a5230"/></g></g></g>
    <g clip-path="url(#c2-a-cup)"><g data-k="sy:0@19.5 1@22.8" style="transform-origin:50% 100%"><rect x="700" y="372" width="48" height="32" fill="#4a2c1a"/>${wave(700, 372, 48, '#c99a6b', 1.6, 1.8)}</g></g>
    <path d="M700 356 L705 398 Q706 404 712 404 H736 Q742 404 743 398 L748 356" fill="rgba(243,238,232,.06)" stroke="${MILK}" stroke-width="2" stroke-opacity=".7"/>
    <g data-k="y:26@19.5 0@22.8;o:0@19.4 1@19.7">${splash(724, 374, '#c99a6b')}</g>
    ${steam(724, 362, 2, 'data-k="o:0@20.6 .8@22.4"')}
  </g>
  <text x="724" y="474" class="t mid" ${lab(17.2, 21)}>Brühgruppe</text>
  <!-- steam system -->
  ${tube('M580 190 V140 H790', MILK, 21.4, 22.6, { co: .8, dash: CASE, sp: .7 })}
  <g ${on(21)}><path d="M786 140 H832 V310" fill="none" stroke="#a39a93" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M786 137.5 H830" stroke="${MILK}" stroke-opacity=".5" stroke-width="2"/><rect x="826" y="306" width="12" height="12" rx="3" fill="${STEEL}"/><circle cx="786" cy="140" r="11" fill="#2b2420" stroke="${STEEL}" stroke-width="2"/>
    <g data-k="o:0@22.6 1@23">${rep(6, i => { const L = f1(1.5 + R() * .7), dx = f1((R() - .5) * 60); return `<circle cx="832" cy="324" r="9" fill="${MILK}" filter="url(#f-soft)" data-loop="${L}" data-off="${f1(i * .31)}" data-k="y<:0@0 ${f1(44 + R() * 22)}@${L};x:0@0 ${dx}@${L};s<:.5@0 ${f1(2 + R())}@${L};o:.6@0 0@${L}"/>`; })}</g></g>
  ${lead('M690 102 V132', 21.2)}<text x="690" y="96" class="t mid" ${lab(21.2)}>Dampfsystem</text>`; };

/* ---------- 2.2 three circuits, redrawn (light) ---------- */
const INK = '#262626';
const lp = (d, kind, cls = '') => { const c = { cold: 'var(--cold)', hot: 'var(--hot)', steam: MILK }[kind]; return `<g class="${cls}"><path d="${d}" fill="none" stroke="${INK}" stroke-width="14"/><path d="${d}" fill="none" style="stroke:${c}" stroke-width="9"/><path d="${d}" fill="none" class="flow" style="stroke:${kind === 'steam' ? 'var(--hot)' : MILK}" stroke-opacity=".9" stroke-width="2.5"/></g>`; };
const TYPES = [
  { n: 'Einkreiser', rows: ['Ein Kessel', 'Wechsel zwischen Dampf und Bezug', 'Günstig und kompakt'], txt: 'Ein Kessel liefert Brühwasser und Dampf nacheinander, nie beides zugleich.' },
  { n: 'Zweikreiser', rows: ['Ein Dampfkessel + Wärmetauscher', 'Gleichzeitiger Bezug möglich', 'Gute Gastronomieeignung'], txt: 'Das Brühwasser fließt durch den Wärmetauscher im Dampfkessel und wird dabei erhitzt.' },
  { n: 'Dualboiler', rows: ['Zwei getrennte Kessel', 'Gleichzeitiger Bezug möglich', 'Hohe Temperaturkontrolle'], txt: 'Brühkessel und Dampfkessel arbeiten unabhängig voneinander, jeder mit eigener Temperatur.' }
];
const kreisSvg = () => { const boiler = (y, h, lvl) => `<g><rect x="310" y="${y}" width="150" height="${h}" rx="24" fill="${MILK}"/><rect x="310" y="${y}" width="150" height="${h}" rx="24" style="fill:var(--hot)" opacity=".22"/>
    <path d="M310 ${lvl} H460 V${y + h - 24} Q460 ${y + h} 436 ${y + h} H334 Q310 ${y + h} 310 ${y + h - 24} Z" style="fill:var(--hot)"/><rect x="310" y="${y}" width="150" height="${h}" rx="24" fill="none" stroke="${INK}" stroke-width="3"/></g>`;
  const tap = `${lp('M436 250 V104 H518', 'hot')}<path d="M514 104 H540 V124" fill="none" stroke="${INK}" stroke-width="7"/><rect x="533" y="124" width="14" height="22" rx="2" fill="${MILK}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M536 150 l-8 22 M540 150 v24 M544 150 l8 22" fill="none" class="flow" style="stroke:var(--hot)" stroke-width="2.5"/><text x="476" y="92" class="ts mid">Heißwasser</text>`;
  const sonde = (y0, y1) => `<path d="M336 ${y0} V${y1}" stroke="#6f6862" stroke-width="3.5"/><text x="322" y="${y0 + 10}" class="ts end">Füllstandssonde</text>`;
  const valve = (x, y) => `<path d="M${x - 11} ${y + 9} H${x + 11} L${x} ${y - 9} Z" fill="${MILK}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  return `<svg class="dg c2-kreis" viewBox="0 0 680 440" role="img" aria-label="Wasserkreisläufe von Einkreiser, Zweikreiser und Dualboiler">
  <defs><linearGradient id="c2-hx" gradientUnits="userSpaceOnUse" x1="312" x2="458" y1="0" y2="0"><stop offset="0" stop-color="#2f6f9f"/><stop offset="1" stop-color="#b8452a"/></linearGradient></defs>
  <!-- shared: tank, pump, steam wand, group -->
  <rect x="21.5" y="216" width="97" height="192.5" style="fill:var(--cold)"/>
  ${lp('M96 350 H168', 'cold')}
  <path d="M20 176 V410 H120 V176" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><text x="70" y="204" class="t mid">Tank</text>
  <path d="M556 60 H622 V112" fill="none" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/><rect x="615" y="112" width="14" height="26" rx="2" fill="${MILK}" stroke="${INK}" stroke-width="2.5"/>
  <g class="c2-puff">${rep(4, i => `<circle cx="${[622, 612, 632, 622][i]}" cy="${[152, 168, 170, 186][i]}" r="${[5, 9, 10, 12][i]}" fill="${MILK}" opacity="${[.9, .75, .7, .55][i]}" class="pulse" style="animation-delay:${-i * .4}s"/>`)}</g>
  <rect x="582" y="296" width="48" height="36" fill="#cfc9c3" stroke="${INK}" stroke-width="2.5"/><rect x="562" y="330" width="88" height="26" rx="5" fill="#b9b2ab" stroke="${INK}" stroke-width="2.5"/><rect x="574" y="356" width="64" height="14" fill="#7a736d" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="606" cy="382" r="11" fill="${INK}"/><path d="M596 402 q10 -13 20 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><text x="606" y="430" class="ts mid">Brühgruppe</text>
  <!-- Einkreiser -->
  <g data-only="0">
    ${lp('M203 350 H314', 'cold')}${lp('M370 246 V60 H560', 'steam', 'c2-altB')}${lp('M456 372 H496 V262 H606 V298', 'hot', 'c2-altA')}
    <rect x="310" y="240" width="150" height="170" rx="24" style="fill:var(--hot)" stroke="${INK}" stroke-width="3"/>
    <text x="385" y="334" class="t mid" style="fill:${MILK}">Boiler</text>
    <text x="462" y="46" class="ts mid">Dampf und Heißwasser</text><text x="551" y="250" class="ts mid">Espressobezug</text>
  </g>
  <!-- Zweikreiser -->
  <g data-only="1">
    ${lp('M250 350 V394 H314', 'cold')}${lp('M203 350 H314', 'cold')}${lp('M350 186 V60 H560', 'steam')}${lp('M456 350 H496 V262 H606 V298', 'hot')}
    ${boiler(180, 230, 290)}
    <path d="M312 350 H458" stroke="${INK}" stroke-width="20"/><path d="M312 350 H458" stroke="url(#c2-hx)" stroke-width="13"/><path d="M312 350 H458" class="flow" stroke="${MILK}" stroke-opacity=".9" stroke-width="2.5"/>
    <text x="385" y="387" class="ts mid" style="fill:${MILK}">Wärmetauscher</text><text x="381" y="244" class="t mid">Boiler</text>
    ${tap.replaceAll('M436 250', 'M436 326')}${sonde(160, 294)}${valve(250, 374)}
    <text x="236" y="428" class="ts mid">Ventil Kesselfüllung</text><text x="455" y="46" class="ts mid">Dampf</text><text x="551" y="250" class="ts mid">Brühkreislauf</text>
  </g>
  <!-- Dualboiler -->
  <g data-only="2">
    ${lp('M250 350 V236 H314', 'cold')}${lp('M203 350 H314', 'cold')}${lp('M350 136 V60 H560', 'steam')}${lp('M456 372 H496 V262 H606 V298', 'hot')}
    ${boiler(130, 142, 198)}
    <rect x="310" y="292" width="150" height="118" rx="24" style="fill:var(--hot)" stroke="${INK}" stroke-width="3"/>
    <text x="372" y="246" class="ts mid" style="fill:${MILK}">Dampfboiler</text><text x="385" y="358" class="t mid" style="fill:${MILK}">Brühboiler</text>
    ${tap}${sonde(108, 202)}${valve(250, 292)}
    <text x="300" y="222" class="ts end">Ventil Kesselfüllung</text><text x="455" y="46" class="ts mid">Dampf</text><text x="551" y="250" class="ts mid">Brühkreislauf</text>
  </g>
  <!-- pump on top of the lines -->
  <circle cx="184" cy="350" r="19" style="fill:var(--cold)" stroke="${INK}" stroke-width="3"/><g class="spin"><path d="M171 337 L197 363 M197 337 L171 363" stroke="${INK}" stroke-width="3"/></g><text x="184" y="318" class="t mid">Pumpe</text>
  </svg>`; };
const miniSvg = k => `<svg class="ic dg" viewBox="0 0 200 104" aria-hidden="true">
  <path d="M8 76 H56" stroke="${INK}" stroke-width="9"/><path d="M8 76 H56" style="stroke:var(--cold)" stroke-width="5"/>
  ${k === 2 ? `<path d="M30 76 V30 H60" fill="none" stroke="${INK}" stroke-width="9"/><path d="M30 74 V30 H60" fill="none" style="stroke:var(--cold)" stroke-width="5"/>` : ''}
  <path d="M${k === 1 ? 136 : 138} ${k === 1 ? 76 : 80} H192" stroke="${INK}" stroke-width="9"/><path d="M136 ${k === 1 ? 76 : 80} H192" style="stroke:var(--hot)" stroke-width="5"/>
  <path d="M${k === 0 ? 96 : 84} ${k === 2 ? 12 : 30} V6 H192" fill="none" stroke="${INK}" stroke-width="9"/><path d="M${k === 0 ? 96 : 84} ${k === 2 ? 12 : 30} V6 H190" fill="none" stroke="${MILK}" stroke-width="5"/>
  ${k === 0 ? `<rect x="56" y="30" width="82" height="66" rx="14" style="fill:var(--hot)" stroke="${INK}" stroke-width="2.5"/>` : ''}
  ${k === 1 ? `<rect x="56" y="22" width="82" height="76" rx="14" fill="${MILK}" stroke="${INK}" stroke-width="2.5"/><path d="M57.500 54 H136.500 V84 Q136.500 96.5 124 96.5 H70 Q57.500 96.5 57.5 84 Z" style="fill:var(--hot)"/><path d="M56 76 H138" stroke="${INK}" stroke-width="11"/><path d="M56 76 H138" stroke="url(#c2-hx-m)" stroke-width="6"/>` : ''}
  ${k === 2 ? `<rect x="60" y="12" width="78" height="40" rx="12" fill="${MILK}" stroke="${INK}" stroke-width="2.5"/><path d="M61.500 30 H136.500 V40 Q136.500 50.5 126 50.5 H72 Q61.500 50.5 61.5 40 Z" style="fill:var(--hot)"/><rect x="60" y="60" width="78" height="40" rx="12" style="fill:var(--hot)" stroke="${INK}" stroke-width="2.5"/>` : ''}
  <defs><linearGradient id="c2-hx-m" gradientUnits="userSpaceOnUse" x1="56" x2="138" y1="0" y2="0"><stop offset="0" stop-color="#2f6f9f"/><stop offset="1" stop-color="#b8452a"/></linearGradient></defs></svg>`;

/* ---------- 2.3 PID control loop ---------- */
const pidSvg = () => { const node = a => `data-k="o:.35@${a} 1@${f1(a + .4)};s^:.94@${a} 1@${f1(a + .6)}"`;
  const coil = 'M400 424 H252 Q238 424 238 410 Q238 396 252 396 H344';
  return defs + `<defs><linearGradient id="c2-th" gradientUnits="userSpaceOnUse" x1="0" y1="410" x2="0" y2="228"><stop offset="0" stop-color="${COLD}"/><stop offset=".55" stop-color="#c98f8a"/><stop offset="1" stop-color="${HOT}"/></linearGradient>
    <clipPath id="c2-p-boil"><rect x="200" y="300" width="200" height="152" rx="24"/></clipPath></defs>
  <!-- the plant: a small boiler -->
  <g clip-path="url(#c2-p-boil)"><g fill="${COLD}" fill-opacity=".85" data-k="fill:#7fb4dc@.5 #b79aa3@8 #e3704f@13.5"><rect x="200" y="322" width="200" height="130" fill="inherit"/>${wave(200, 322, 200, 'inherit', 3, 2.8)}</g>
    ${rep(7, i => { const L = f1(1.4 + i * .17); return `<circle cx="${262 + i * 13}" cy="408" r="${2.5 + (i % 3)}" fill="none" stroke="${MILK}" stroke-opacity=".8" stroke-width="1.5" data-loop="${L}" data-off="${f1(i * .37)}" data-k="y<:0@0 -78@${L};o:0@0 .9@${f1(L * .2)} .9@${f1(L * .8)} 0@${L}"/>`; })}
    ${steam(300, 320, 2, 'data-k="o:0@9 .9@13"')}</g>
  <path d="${coil}" fill="none" stroke="${HOT}" stroke-width="16" stroke-linecap="round" filter="url(#f-glow)" data-k="o:.85@.5 .85@10 .5@13.4 .16@15 .36@16.6 .28@18.2"/>
  <path d="${coil}" fill="none" stroke="${PEACH}" stroke-width="6" stroke-linecap="round"/>
  <rect x="200" y="300" width="200" height="152" rx="24" fill="none" stroke="${STEEL}" stroke-width="2.5"/>
  <!-- loop lines -->
  <g fill="none" stroke="${MILK}" stroke-opacity=".55" stroke-width="2"><path d="M142 340 H236"/><path d="M120 316 V208" marker-end="url(#arr)"/><path d="M146 180 H246" marker-end="url(#arr)"/><path d="M400 180 H470 V424 H404" marker-end="url(#arr)"/><path d="M40 180 H92" marker-end="url(#arr)"/></g>
  <circle cx="238" cy="340" r="5" fill="${PEACH}"/>
  <!-- 1 sensor -->
  <g ${node(.5)}><circle cx="120" cy="340" r="23" fill="#2b2420" stroke="${STEEL}" stroke-width="2.5"/><path d="M120 327 V345" stroke="${MILK}" stroke-width="4" stroke-linecap="round"/><circle cx="120" cy="349" r="6" fill="${HOT}"/></g>
  <text x="120" y="394" class="t mid">Sensor</text><text x="134" y="270" class="ts">Ist</text>
  <!-- 2 comparison -->
  <g ${node(3.2)}><circle cx="120" cy="180" r="24" fill="#2b2420" stroke="${STEEL}" stroke-width="2.5"/><path d="M103 163 L137 197 M137 163 L103 197" stroke="${MILK}" stroke-opacity=".5" stroke-width="1.5"/><text x="107" y="186" class="ts mid" style="font-size:15px">+</text><text x="120" y="202" class="ts mid" style="font-size:15px">−</text></g>
  <text x="120" y="140" class="t mid">Abgleich</text><text x="40" y="168" class="ts">Soll</text>
  <!-- 3 controller -->
  <g ${node(6.4)}><rect x="250" y="150" width="150" height="60" rx="12" fill="#2b2420" stroke="${STEEL}" stroke-width="2.5"/><text x="325" y="190" class="tb mid">Regler</text></g>
  <!-- 4 heater -->
  <text x="486" y="296" class="t">Heizung</text>
  <rect x="486" y="310" width="92" height="8" rx="4" fill="${MILK}" opacity=".16"/><rect x="486" y="310" width="92" height="8" rx="4" fill="${HOT}" data-k="@width:92@.5 92@10 54@13.4 18@15 38@16.6 30@18.2"/>
  <text x="486" y="340" class="tl" style="font-size:13px">Heizleistung</text>
  <!-- the signal: once slowly, then round and round -->
  <g data-k="o:0@.4 1@.8 1@12.5 0@12.9"><circle cx="238" cy="340" r="15" fill="${PEACH}" opacity=".5" filter="url(#f-soft)" data-k="x:0@.9 -118@2.7 -118@6.8 87@8.8 232@10.3 232@11.7 100@12.5;y:0@3.6 -160@5.7 -160@10.3 84@11.7"/>
    <circle cx="238" cy="340" r="7" fill="${MILK}" data-k="x:0@.9 -118@2.7 -118@6.8 87@8.8 232@10.3 232@11.7 100@12.5;y:0@3.6 -160@5.7 -160@10.3 84@11.7"/></g>
  <g data-k="o:0@12.8 1@13.2">${rep(2, i => `<circle cx="238" cy="340" r="${i ? 7 : 15}" fill="${i ? MILK : PEACH}" ${i ? '' : 'opacity=".5" filter="url(#f-soft)"'} data-loop="3.2" data-k="x~:0@0 -118@.5 -118@1.1 87@1.7 232@2.1 232@2.8 100@3.2;y~:0@0 0@.5 -160@1.1 -160@2.1 84@2.8 84@3.2"/>`)}</g>
  <!-- temperature over time -->
  <path d="M612 128 V420 H930" class="ln" stroke-opacity=".6"/><text x="612" y="112" class="tl">Temperatur</text><text x="930" y="446" class="tl end">Zeit</text>
  <path d="M612 230 H930" fill="none" stroke="${PEACH}" stroke-width="2" stroke-dasharray="6 7"/><text x="624" y="216" class="ts">Solltemperatur</text>
  <path d="M614 408 C672 406 704 336 742 286 C770 250 790 213 814 213 C834 213 842 237 860 237 C874 237 882 229 898 230 L928 230" fill="none" stroke="url(#c2-th)" stroke-width="5" stroke-linecap="round" class="draw" pathLength="1" data-k="d~:1@.5 .52@8 .2@13 0@18.6"/>
  <g data-k="o:0@16.4 1@17.2"><circle cx="928" cy="230" r="12" fill="${HOT}" opacity=".5" filter="url(#f-soft)"/><circle cx="928" cy="230" r="6" fill="${HOT}"/></g>`; };

/* ---------- 2.4 E61 group ---------- */
const e61Svg = () => { const N = 12, L = 7, a = 2.66, b = 3.5, c = 6.16;
  return defs + `<defs><clipPath id="c2-e-puck"><rect x="582" y="392" width="156" height="36" rx="3"/></clipPath><clipPath id="c2-e-boil"><rect x="60" y="140" width="190" height="290" rx="30"/></clipPath></defs>
  <!-- boiler -->
  <g clip-path="url(#c2-e-boil)"><rect x="60" y="140" width="190" height="290" fill="${MILK}" opacity=".06"/><g opacity=".36"><rect x="60" y="168" width="190" height="262" fill="${HOT}"/>${wave(60, 168, 190, HOT, 3, 3.2)}</g>${steam(155, 170, 2)}</g>
  <rect x="60" y="140" width="190" height="290" rx="30" fill="none" stroke="${STEEL}" stroke-width="2.5"/>${glint(64, 144, 182, 282, 7)}
  <path d="M250 320 H200 V190 H250" fill="none" stroke="${MILK}" stroke-opacity=".16" stroke-width="14" stroke-linejoin="round"/>
  <text x="130" y="404" class="t mid">Kessel</text>
  <!-- thermosiphon pipes -->
  ${pipe('M250 190 H562', HOT, { w: 14, co: .3 })}${pipe('M250 320 H562', COLD, { w: 14, co: .3 })}
  <text x="405" y="168" class="ts mid">heißes Wasser steigt auf</text><text x="405" y="264" class="tb mid">Thermosiphon</text><text x="405" y="352" class="ts mid">kühleres Wasser fließt zurück</text>
  <!-- group body -->
  <rect x="624" y="120" width="72" height="22" rx="5" fill="url(#g-steel)" opacity=".8"/>
  <rect x="560" y="140" width="200" height="232" rx="18" fill="url(#g-steel)" fill-opacity=".3" stroke="${STEEL}" stroke-width="2.5"/>${glint(564, 144, 192, 224, 6)}
  <rect x="760" y="186" width="72" height="62" rx="10" fill="url(#g-steel)" fill-opacity=".22" stroke="${STEEL}" stroke-width="2"/>
  <rect x="548" y="372" width="224" height="14" rx="4" fill="url(#g-steel)"/>
  <!-- channels inside the group -->
  <path d="M560 190 H610 V320 H560" fill="none" stroke="${CASE}" stroke-width="18" stroke-linejoin="round"/><path d="M617 190 H716 V242 H650 V372 M716 242 V282" fill="none" stroke="${CASE}" stroke-width="16" stroke-linejoin="round"/><rect x="692" y="202" width="48" height="28" rx="5" fill="${CASE}"/><path d="M560 190 H610 V320 H560" fill="none" stroke="${DARK}" stroke-width="14" stroke-linejoin="round"/><path d="M560 190 H610 V255" fill="none" stroke="${HOT}" stroke-opacity=".3" stroke-width="14" stroke-linejoin="round"/><path d="M610 255 V320 H560" fill="none" stroke="${COLD}" stroke-opacity=".3" stroke-width="14" stroke-linejoin="round"/>
  <path d="M617 190 H716 V242 H650 V372 M716 242 V282" fill="none" stroke="${DARK}" stroke-width="12" stroke-linejoin="round"/><rect x="694" y="204" width="44" height="24" rx="4" fill="${DARK}"/>
  <path d="M617 190 H716 V208" fill="none" stroke="${HOT}" stroke-opacity=".85" stroke-width="12" stroke-linejoin="round"/>
  <path d="M716 224 V242 H650 V372" fill="none" stroke="${HOT}" stroke-opacity=".85" stroke-width="12" stroke-linejoin="round" class="draw" pathLength="1" data-k="d:1@7.9 0@9.7 0@18.8 1@19.8"/>
  <g data-k="o:0@9.6 1@10 1@18.6 0@19"><path d="M716 224 V242 H650 V372" fill="none" stroke="${MILK}" stroke-opacity=".8" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 15" data-loop="1.2" data-k="d~:22@0 0@1.2"/></g>
  <path d="M716 242 V282" fill="none" stroke="${HOT}" stroke-opacity=".85" stroke-width="12" class="draw" pathLength="1" data-k="d:1@9.3 0@9.9 0@19 1@20"/>
  <!-- pre-infusion chamber: water above a spring-loaded piston -->
  <rect x="694" y="280" width="44" height="76" rx="4" fill="${DARK}" stroke="${CASE}" stroke-width="2"/>
  <rect x="696" y="282" width="40" height="0" fill="${HOT}" fill-opacity=".85" data-k="@height<:0@9.8 46@13.8 46@19 0@20.4"/>
  <g data-k="y<:0@9.8 46@13.8 46@19 0@20.4"><rect x="696" y="282" width="40" height="9" rx="2" fill="url(#g-steel)"/></g>
  <g data-k="sy<:1@9.8 .27@13.8 .27@19 1@20.4" style="transform-origin:50% 100%"><path d="M716 291 l12 5 l-24 10 l24 10 l-24 10 l24 10 l-24 10 l12 5" fill="none" stroke="${STEEL}" stroke-width="2.5" stroke-linejoin="round"/></g>
  <!-- brew valve, pin, cam and lever -->
  <g data-k="x^:0@6.9 -15@7.9 -15@18.6 0@19.4"><rect x="707" y="209" width="18" height="14" rx="3" fill="${MILK}"/><path d="M725 216 H780" stroke="${STEEL}" stroke-width="4" stroke-linecap="round"/></g>
  <g ${pivot(796, 216)} data-k="r^:50@6.5 -8@7.9 -8@18.4 50@19.6"><ellipse cx="791" cy="216" rx="17" ry="12" fill="${PEACH}"/><rect x="796" y="211" width="112" height="10" rx="5" fill="url(#g-steel)"/><rect x="896" y="204" width="46" height="24" rx="12" fill="#2a170d" stroke="${CASE}" stroke-width="2"/></g>
  <circle cx="796" cy="216" r="5" fill="#2b2420"/>
  <g data-k="o:0@6.7 1@7.3 1@18.2 0@18.7"><text x="796" y="176" class="ts mid">Nocke</text><text x="900" y="174" class="t mid">Hebel</text></g>
  <g data-k="o:0@9.6 1@10.2 1@18 0@18.5"><path class="lead-l" d="M740 318 H774"/><text x="780" y="312" class="ts">Pre-Infusions-</text><text x="780" y="334" class="ts">kammer</text></g>
  <!-- portafilter and puck -->
  <path d="M574 386 H746 V424 Q746 434 736 434 H584 Q574 434 574 424 Z" fill="#2b2420" stroke="#a39a93" stroke-width="2"/>
  <g clip-path="url(#c2-e-puck)"><rect x="582" y="392" width="156" height="36" fill="#8a5a36"/><g data-k="sy<:0@10 1@13.6 1@20 0@21.4" style="transform-origin:50% 0%"><rect x="582" y="392" width="156" height="36" fill="#3a2114"/></g></g>
  <path d="M650 434 h20 v10 h-20 z" fill="#a39a93"/>
  <g data-k="o:0@14.4 1@14.7 1@18.6 0@19.2"><g data-k="sy>:0@14.4 1@14.9" style="transform-origin:50% 0%"><g data-loop=".9" data-k="sx:1@0 .6@.45 1@.9"><rect x="657" y="444" width="6" height="34" rx="3" fill="#8a5230"/></g></g></g>
  <g data-k="o:0@12.6 1@12.9 1@14.4 0@14.6">${rep(2, i => `<ellipse cx="660" cy="448" rx="3" ry="5" fill="#8a5230" data-loop="1" data-off="${i * .5}" data-k="y>:0@0 30@1;sy:.7@0 1.3@1;o:1@0 1@.8 0@1"/>`)}</g>
  <!-- pressure at the puck -->
  <path d="M512 424 H574" stroke="${STEEL}" stroke-opacity=".6" stroke-width="2"/>
  ${gauge(470, 424, 42, 'r^:-120@9.6 -66@11 -62@13.8 96@15.2 96@18.5 -120@19.9', null)}
  <text x="416" y="431" class="t end">Druck</text>
  <!-- thermosiphon particles -->
  ${rep(N, i => `<circle cx="200" cy="190" r="5.5" fill="${HOT}" data-loop="${L}" data-off="${f1(i * L / N)}" data-k="x~:0@0 410@${a} 410@${b} 0@${c} 0@${L};y~:0@0 0@${a} 130@${b} 130@${c} 0@${L};fill:#e3704f@0 #e3704f@2.2 #7fb4dc@3.9 #7fb4dc@5.8 #e3704f@${L}"/>`)}`; };

/* ---------- 2.5 pre-infusion and OPV ---------- */
const opvSvg = () => { const R = rng(9);
  const grains = rep(150, () => `<circle cx="${f1(684 + R() * 196)}" cy="${f1(294 + R() * 102)}" r="${f1(1.2 + R() * 1.8)}" fill="${R() > .5 ? '#2a170d' : '#a9774c'}" opacity=".55"/>`);
  return defs + `<defs><clipPath id="c2-o-tank"><rect x="51" y="352" width="98" height="99"/></clipPath><clipPath id="c2-o-puck"><rect x="678" y="290" width="208" height="110"/></clipPath><clipPath id="c2-o-head"><rect x="678" y="249" width="208" height="41"/></clipPath></defs>
  <!-- tank -->
  <g clip-path="url(#c2-o-tank)"><g opacity=".6"><rect x="51" y="386" width="98" height="66" fill="${COLD}"/>${wave(51, 386, 98, COLD, 2.5, 3)}</g>
    <g data-k="o:0@16.9 1@17.2">${splash(100, 386, '#cfe3f2')}</g></g>
  <path d="M50 352 V452 H150 V352" fill="none" stroke="${MILK}" stroke-opacity=".6" stroke-width="2" stroke-linejoin="round"/><text x="100" y="476" class="ts mid">Tank</text>
  <!-- return line with OPV -->
  ${tube('M204 300 H100 V352', COLD, 15.8, 16.9, { w: 8, sp: .8 })}
  <g data-k="o:0@16.8 1@17">${rep(2, i => `<ellipse cx="100" cy="358" rx="3" ry="5.5" fill="${COLD}" data-loop=".6" data-off="${i * .3}" data-k="y>:0@0 26@.6;sy:.8@0 1.3@.6"/>`)}</g>
  ${pipe('M330 300 H296', COLD, { w: 8 })}
  <!-- main line: tank, pump, boiler, group -->
  ${tube('M148 425 H330 V220 H434', COLD, 3.1, 4.3, { win: 'o:0@4.1 1@4.5 1@10.8 0@11.3', sp: 2 })}
  <g data-k="o:0@11 1@11.5"><path d="M148 425 H330 V220 H434" fill="none" stroke="${MILK}" stroke-opacity=".8" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 15" data-loop=".7" data-k="d~:22@0 0@.7"/></g>
  ${tube('M526 220 H668', HOT, 4, 4.6, { win: 'o:0@4.4 1@4.8 1@10.8 0@11.3', sp: 2 })}
  <g data-k="o:0@11 1@11.5"><path d="M526 220 H668" fill="none" stroke="${MILK}" stroke-opacity=".8" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 15" data-loop=".7" data-k="d~:22@0 0@.7"/></g>
  <rect x="430" y="186" width="100" height="68" rx="16" fill="${HOT}" fill-opacity=".8" stroke="${STEEL}" stroke-width="2.5"/><rect x="438" y="192" width="84" height="56" rx="12" fill="${HOT}" filter="url(#f-glow)" opacity=".35"/><text x="480" y="176" class="ts mid">Kessel</text>
  <circle cx="230" cy="425" r="25" fill="#2b2420" stroke="${STEEL}" stroke-width="2.5"/>
  <g data-k="o:1@3 0@3.2"><path d="M215 410 L245 440 M245 410 L215 440" stroke="${MILK}" stroke-width="3" stroke-linecap="round"/></g>
  <g data-k="o:0@3 1@3.2 1@11 0@11.4"><g ${pivot(230, 425)} data-loop="3" data-k="r~:0@0 360@3"><path d="M215 410 L245 440 M245 410 L215 440" stroke="${MILK}" stroke-width="3" stroke-linecap="round"/></g></g>
  <g data-k="o:0@11 1@11.4"><g ${pivot(230, 425)} data-loop=".9" data-k="r~:0@0 360@.9"><path d="M215 410 L245 440 M245 410 L215 440" stroke="${MILK}" stroke-width="3" stroke-linecap="round"/></g></g>
  <circle cx="230" cy="425" r="5" fill="${MILK}"/><text x="230" y="386" class="t mid">Pumpe</text>
  <!-- the valve: a ball held on its seat by a spring -->
  <rect x="198" y="273" width="104" height="54" rx="11" fill="#2b2420" stroke="#a39a93" stroke-width="2.5" data-k="stroke:#a39a93@14.6 #f8cbad@15.4"/>
  <path d="M289 281 v11 M289 308 v11" stroke="${STEEL}" stroke-width="5" stroke-linecap="round"/>
  <g data-k="o:0@15.3 .7@15.9"><path d="M290 300 H212" stroke="${COLD}" stroke-width="16" stroke-linecap="round" opacity=".5"/></g>
  <g data-k="sx^:1@15 .67@15.9" style="transform-origin:0% 50%"><path d="M208 300 l3 -11 l8 22 l8 -22 l8 22 l8 -22 l8 22 l8 -22 l3 11" fill="none" stroke="${STEEL}" stroke-width="3" stroke-linejoin="round"/></g>
  <g data-k="x^:0@15 -18@15.9"><circle cx="275" cy="300" r="12" fill="${MILK}"/><circle cx="271" cy="296" r="4" fill="#fff" opacity=".7"/></g>
  <text x="250" y="258" class="tb mid">OPV</text>
  <text x="148" y="282" class="ts mid" data-k="o:0@16 1@16.6;y^:8@16 0@16.7">Rücklauf</text>
  <!-- gauge -->
  <path d="M590 172 V214" stroke="${STEEL}" stroke-width="5"/>
  ${gauge(590, 118, 54, 'r^:-120@3.2 -84@5.2 -84@11.2 82@14.8 60@16.6', 60)}
  <text x="590" y="152" class="tl mid" style="font-size:12px">Druck</text><text x="654" y="88" class="tm">max.</text>
  <!-- group with puck in cross-section -->
  <rect x="664" y="176" width="236" height="70" rx="12" fill="url(#g-steel)" fill-opacity=".16" stroke="${STEEL}" stroke-width="2.5"/>${glint(668, 180, 228, 62, 6)}
  <rect x="684" y="206" width="196" height="36" rx="5" fill="${DARK}"/><rect x="684" y="206" width="196" height="36" rx="5" fill="${HOT}" data-k="o:0@4.5 .85@5.2"/>
  <path d="M672 246 V398 Q672 408 682 408 H882 Q892 408 892 398 V246" fill="${DARK}" stroke="#a39a93" stroke-width="3"/>
  <g clip-path="url(#c2-o-head)"><g data-k="sy:0@5.2 1@8" style="transform-origin:50% 100%"><rect x="678" y="254" width="208" height="36" fill="${HOT}" fill-opacity=".8"/>${wave(678, 254, 208, HOT, 2.5, 2.2, 'opacity=".8"')}</g></g>
  <g data-k="o:0@4.9 1@5.2 1@7.6 0@8.2">${rep(9, i => `<ellipse cx="${700 + i * 20.5}" cy="252" rx="2.5" ry="4.5" fill="${HOT}" data-loop="${f1(.8 + (i % 3) * .14)}" data-off="${f1((i * 37 % 10) / 10)}" data-k="y>:0@0 36@${f1(.8 + (i % 3) * .14)};sy:.8@0 1.4@${f1(.8 + (i % 3) * .14)}"/>`)}</g>
  <g clip-path="url(#c2-o-puck)"><rect x="678" y="290" width="208" height="110" fill="#8a5a36"/>
    <g data-k="sy:0@5 .56@8 1@10.6" style="transform-origin:50% 0%"><rect x="678" y="290" width="208" height="110" fill="#3a2114"/></g>${grains}
    <g data-k="y:0@5 62@8 110@10.6;o:0@4.8 1@5.2 1@10.2 0@10.8"><path d="M678 290 q13 -4 26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0" fill="none" stroke="${HOT}" stroke-width="3" filter="url(#f-soft)"/><path d="M678 290 q13 -4 26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0 t26 0" fill="none" stroke="${PEACH}" stroke-width="1.5"/></g></g>
  <path d="M684 247 H880" stroke="${STEEL}" stroke-width="3" stroke-dasharray="7 5"/><path d="M684 404 H880" stroke="${DARK}" stroke-width="2" stroke-dasharray="3 9"/>
  <text x="782" y="352" class="tb mid">Puck</text>
  <g data-k="o:0@3.2 1@3.8 1@10.8 0@11.2"><text x="782" y="160" class="tm mid">wenig Druck</text></g>
  <g data-k="o:0@11.2 1@11.8"><text x="782" y="160" class="tm mid">voller Pumpendruck</text></g>
  <!-- first drops, then an even flow -->
  <g data-k="o:0@10.3 1@10.6 1@13.6 0@14">${rep(3, i => `<ellipse cx="${740 + i * 42}" cy="414" rx="3" ry="5" fill="#8a5230" data-loop="1.1" data-off="${f1(i * .37)}" data-k="y>:0@0 56@1.1;sy:.7@0 1.4@1.1;o:1@0 1@.9 0@1.1"/>`)}</g>
  <g data-k="o:0@13.6 1@14">${rep(2, i => `<g data-k="sy>:0@13.6 1@14.2" style="transform-origin:50% 0%"><g data-loop="${f1(.8 + i * .13)}" data-k="sx:1@0 .6@${f1(.4 + i * .06)} 1@${f1(.8 + i * .13)}"><rect x="${757 + i * 46}" y="410" width="5" height="66" rx="2.5" fill="#8a5230"/></g></g>`)}</g>`; };

/* ---------- 2.7 pumps ---------- */
const pumpSvg = () => { let bumps = 'M70 440'; for (let i = 0; i < 11; i++) bumps += ' c8 0 8 -58 15 -58 s7 58 15 58 h16';
  return defs + `<defs><clipPath id="c2-u-tr1"><rect x="70" y="360" width="370" height="84"/></clipPath><clipPath id="c2-u-rot"><circle cx="715" cy="262" r="74"/></clipPath><clipPath id="c2-u-out"><rect x="366" y="240" width="90" height="40"/></clipPath></defs>
  <path d="M480 112 V452" stroke="${MILK}" stroke-opacity=".14" stroke-width="2"/>
  <!-- vibration pump -->
  <g data-k="o:1@7.6 .3@8.4 .3@15.6 1@16.4">
    <text x="255" y="134" class="tb mid">Vibrationspumpe</text>
    <rect x="124" y="204" width="264" height="112" rx="14" fill="#2b2420" stroke="${CASE}" stroke-width="2"/>${glint(128, 206, 256, 20, 5.5)}
    <rect x="70" y="238" width="386" height="44" fill="${DARK}"/><path d="M70 238 H456 M70 282 H456" stroke="#a39a93" stroke-width="2.5"/>
    <rect x="70" y="240" width="286" height="40" fill="${COLD}" opacity=".75"/>
    <path d="M70 260 H190" fill="none" stroke="${MILK}" stroke-opacity=".8" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 15" data-loop="1.2" data-k="d:22@0 11@.3 11@.6 0@.9 0@1.2"/>
    ${rep(2, k => `<g><rect x="178" y="${k ? 286 : 210}" width="118" height="24" rx="4" fill="#6b4429"/>${rep(19, i => `<path d="M${183 + i * 6} ${k ? 288 : 212} v20" stroke="#d9a35f" stroke-width="2.5" stroke-linecap="round"/>`)}
      <rect x="174" y="${k ? 282 : 206}" width="126" height="32" rx="6" fill="#d9a35f" filter="url(#f-soft)" data-loop=".6" data-k="o:0@0 .55@.12 .1@.32 0@.6"/></g>`)}
    <g data-k="o:0@.6 1@1.2"><text x="237" y="194" class="ts mid">Spule</text><text x="232" y="342" class="ts mid">Kolben</text></g>
    <g data-loop=".6" data-k="sx:1.28@0 .72@.3 1.28@.6" style="transform-origin:100% 50%"><path d="M268 260 l4 -11 l8 22 l8 -22 l8 22 l8 -22 l8 22 l8 -22 l8 22 l4 -11" fill="none" stroke="${STEEL}" stroke-width="2.5" stroke-linejoin="round"/></g>
    <g data-loop=".6" data-k="x:-20@0 20@.3 -20@.6"><rect x="196" y="241" width="72" height="38" rx="5" fill="url(#g-steel)"/><rect x="204" y="245" width="56" height="5" rx="2.5" fill="#fff" opacity=".35"/></g>
    <path d="M342 238 V248 M342 272 V282" stroke="#a39a93" stroke-width="6"/>
    <g data-loop=".6" data-k="x^:0@.08 9@.3 0@.5"><circle cx="353" cy="260" r="9" fill="${MILK}"/></g>
    <g clip-path="url(#c2-u-out)">${rep(2, i => `<rect x="352" y="244" width="30" height="32" rx="12" fill="${COLD}" data-loop="1.2" data-off="${i * .6}" data-k="x<:0@.1 44@.36 44@.7 98@.96 98@1.2;o:0@.1 1@.16 1@1.2"/>`)}</g>
    <g clip-path="url(#c2-u-tr1)"><g data-loop=".6" data-k="x~:0@0 -46@.6"><path d="${bumps}" fill="none" stroke="${COLD}" stroke-width="3.5" stroke-linejoin="round"/></g></g>
    <path d="M70 440 H440" stroke="${MILK}" stroke-opacity=".35" stroke-width="1.5"/><text x="255" y="468" class="ts mid">Förderstrom: pulsierend</text>
  </g>
  <!-- rotary pump -->
  <g data-k="o:.3@7.6 1@8.4">
    <text x="715" y="134" class="tb mid">Rotationspumpe</text>
    ${pipe('M546 222 H660', COLD, { w: 16, sp: .8, co: .75 })}${pipe('M770 222 H884', COLD, { w: 16, sp: .8, co: .75 })}
    <circle cx="715" cy="262" r="86" fill="#2b2420" stroke="${CASE}" stroke-width="2"/>
    <g clip-path="url(#c2-u-rot)"><circle cx="715" cy="262" r="74" fill="${COLD}" opacity=".75"/>
      <g ${pivot(715, 248)} data-loop="2.4" data-k="r~:0@0 -360@2.4">${rep(6, i => `<path d="M715 248 V140" stroke="${STEEL}" stroke-width="6" transform="rotate(${i * 60} 715 248)"/>`)}
        <circle cx="715" cy="248" r="58" fill="#8d857e" stroke="${STEEL}" stroke-width="2"/>${rep(6, i => `<path d="M715 238 V192" stroke="#3a322d" stroke-width="7" stroke-linecap="round" transform="rotate(${i * 60} 715 248)"/>`)}
        <circle cx="715" cy="248" r="14" fill="#2b2420" stroke="${STEEL}" stroke-width="2"/><circle cx="715" cy="240" r="3" fill="${PEACH}"/></g></g>
    <circle cx="715" cy="262" r="74" fill="none" stroke="#a39a93" stroke-width="2.5"/>${glint(640, 180, 150, 14, 6.5)}
    <g data-k="o:0@8.6 1@9.2"><text x="715" y="372" class="ts mid">Rotor mit Flügeln</text></g>
    <path d="M545 406 H885" fill="none" stroke="${COLD}" stroke-width="3.5"/><path d="M545 406 H885" fill="none" stroke="${MILK}" stroke-opacity=".8" stroke-width="3.5" stroke-dasharray="3 43" stroke-linecap="round" data-loop=".6" data-k="d~:46@0 0@.6"/>
    <path d="M545 440 H885" stroke="${MILK}" stroke-opacity=".35" stroke-width="1.5"/><text x="715" y="468" class="ts mid">Förderstrom: gleichmäßig</text>
  </g>`; };

/* ---------- light scene parts ---------- */
const pidChart = `<svg class="dg c2-pid" viewBox="0 0 620 392" role="img" aria-label="Temperaturverlauf mit und ohne PID">
  <defs><clipPath id="c2-pc"><rect x="60" y="24" width="500" height="340"/></clipPath></defs>
  <text x="60" y="18" class="tl">Temperatur</text>
  <rect id="c2-pid-band" x="60" y="110" width="500" height="80" style="fill:var(--hot)" opacity=".13"/>
  <path d="M60 150 H560" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="6 6"/><text x="570" y="156" class="t">Soll</text>
  <path d="M60 24 V262 H560" class="ln"/>
  <g clip-path="url(#c2-pc)"><path id="c2-pid-t" d="" fill="none" style="stroke:var(--hot)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path id="c2-pid-u" d="" style="fill:var(--hot)" opacity=".55"/></g>
  <circle id="c2-pid-dot" cx="560" cy="150" r="7" style="fill:var(--hot)" stroke="${MILK}" stroke-width="2.5"/>
  <text x="60" y="296" class="tl">Heizleistung</text><path d="M60 364 H560" class="ln"/><text x="560" y="386" class="tl end">Zeit</text>
  <text x="570" y="316" class="ts">ein</text><text x="570" y="364" class="ts">aus</text>
  <text id="c2-pid-sw" x="570" y="116" class="ts"></text></svg>`;

const dkSvg = () => { const R = rng(4); return `<svg class="dg c2-dk" id="c2-dk" viewBox="0 0 600 322" role="img" aria-label="Dampfkessel mit Manometer und Pressostat">
  <defs><clipPath id="c2-dkc"><rect x="40" y="120" width="340" height="190" rx="44"/></clipPath></defs>
  <path d="M100 104 V124 M320 84 V124" stroke="${INK}" stroke-width="7"/>
  <path d="M356 62 H440 V284 H376" fill="none" stroke="${INK}" stroke-width="2.5"/><path class="cur flow" d="M356 62 H440 V284 H376" fill="none" style="stroke:var(--hot)" stroke-width="3.5"/>
  <g clip-path="url(#c2-dkc)"><rect x="40" y="120" width="340" height="190" fill="${MILK}"/><rect id="c2-dk-steam" x="40" y="120" width="340" height="190" style="fill:var(--hot)" opacity=".2"/>
    <rect x="40" y="206" width="340" height="104" style="fill:var(--hot)"/><path class="c2-slosh" d="M0 206 q20 -5 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 v8 H0 Z" style="fill:var(--hot)"/>
    <g id="c2-dk-bub">${rep(14, () => `<circle cx="${f1(84 + R() * 250)}" cy="290" r="${f1(3 + R() * 3.5)}" fill="none" stroke="${MILK}" stroke-width="2" opacity="0"/>`)}</g></g>
  <path class="glow" d="M380 284 H112 Q98 284 98 272 Q98 260 112 260 H330" fill="none" stroke="${PEACH}" stroke-width="15" stroke-linecap="round" style="filter:blur(5px)"/>
  <path d="M380 284 H112 Q98 284 98 272 Q98 260 112 260 H330" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path class="glow" d="M380 284 H112 Q98 284 98 272 Q98 260 112 260 H330" fill="none" stroke="${PEACH}" stroke-width="3" stroke-linecap="round"/>
  <rect x="40" y="120" width="340" height="190" rx="44" fill="none" stroke="${INK}" stroke-width="3"/>
  <text x="210" y="172" class="ts mid">Dampf</text><text x="210" y="238" class="ts mid" style="fill:${MILK}">Wasser</text>
  <!-- manometer: shows gauge pressure -->
  <circle cx="100" cy="60" r="48" fill="${MILK}" stroke="${INK}" stroke-width="3"/>
  ${rep(9, i => `<path d="M100 ${i % 4 ? 20 : 18}v${i % 4 ? 6 : 11}" stroke="${INK}" stroke-width="${i % 4 ? 1.5 : 2.5}" transform="rotate(${-120 + i * 30} 100 60)"/>`)}
  <text x="71" y="82" class="tm mid" style="font-size:13px">0</text><text x="100" y="44" class="tm mid" style="font-size:13px">1</text><text x="129" y="82" class="tm mid" style="font-size:13px">2</text><text x="100" y="98" class="tm mid" style="font-size:11px">bar</text>
  <g id="c2-dk-needle" transform="rotate(0 100 60)"><path d="M100 68 V24" style="stroke:var(--hot)" stroke-width="3.5" stroke-linecap="round"/></g><circle cx="100" cy="60" r="5" fill="${INK}"/>
  <text x="160" y="52" class="t">Manometer</text><text x="160" y="74" class="ts">zeigt Überdruck</text>
  <!-- pressostat: pressure switch for the heater -->
  <rect x="284" y="38" width="72" height="48" rx="9" fill="${MILK}" stroke="${INK}" stroke-width="3"/>
  <circle cx="300" cy="62" r="4" fill="${INK}"/><circle cx="340" cy="62" r="4" fill="${INK}"/><path class="sw" d="M300 62 H339" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
  <text x="320" y="26" class="t mid">Pressostat</text>
  <text x="462" y="150" class="tl">Heizung</text>
  <g class="st-on"><circle cx="470" cy="180" r="8" style="fill:var(--hot)"/><text x="488" y="188" class="t">ein</text><text x="462" y="216" class="ts">Druck zu niedrig</text></g>
  <g class="st-off"><circle cx="470" cy="180" r="7" fill="none" stroke="${INK}" stroke-width="2"/><text x="488" y="188" class="t">aus</text><text x="462" y="216" class="ts">Kesseldruck erreicht</text></g>
  </svg>`; };

const hebelSvg = `<svg class="dg" viewBox="0 0 560 226" role="img" aria-label="Von der Hebelmaschine zur Pumpenmaschine">
  <defs><marker id="c2-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="${INK}"/></marker></defs>
  <g><rect x="100" y="70" width="60" height="82" fill="${MILK}" stroke="${INK}" stroke-width="2.5"/><g class="c2-press"><rect x="104" y="104" width="52" height="16" style="fill:var(--brown)"/><path d="M130 104 V62" stroke="${INK}" stroke-width="5"/></g>
    <g class="c2-lever"><path d="M130 62 L34 28" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><circle cx="32" cy="27" r="12" fill="${INK}"/></g><circle cx="130" cy="62" r="6" fill="${MILK}" stroke="${INK}" stroke-width="2.5"/>
    <rect x="76" y="150" width="108" height="22" rx="5" fill="#b9b2ab" stroke="${INK}" stroke-width="2.5"/><rect x="92" y="172" width="76" height="13" fill="#7a736d" stroke="${INK}" stroke-width="2.5"/>
    <text x="130" y="214" class="t mid">Hebelmaschine</text></g>
  <path d="M236 118 H326" fill="none" stroke="${INK}" stroke-width="2.5" marker-end="url(#c2-arr)"/><text x="281" y="100" class="tm mid" style="font-size:22px">1961</text>
  <g><path d="M378 118 H480 V152" fill="none" stroke="${INK}" stroke-width="14"/><path d="M378 118 H480 V152" fill="none" style="stroke:var(--hot)" stroke-width="9"/><path d="M378 118 H480 V152" fill="none" class="flow" stroke="${MILK}" stroke-width="2.5"/>
    <circle cx="398" cy="118" r="26" fill="${MILK}" stroke="${INK}" stroke-width="2.5"/><g class="spin"><path d="M381 101 L415 135 M415 101 L381 135" stroke="${INK}" stroke-width="3.5"/></g>
    <rect x="426" y="150" width="108" height="22" rx="5" fill="#b9b2ab" stroke="${INK}" stroke-width="2.5"/><rect x="442" y="172" width="76" height="13" fill="#7a736d" stroke="${INK}" stroke-width="2.5"/>
    <text x="462" y="214" class="t mid">Pumpenmaschine</text></g></svg>`;

const vibIcon = `<svg class="ic dg" viewBox="0 0 240 92" aria-hidden="true"><rect x="40" y="14" width="160" height="64" rx="10" fill="${MILK}" stroke="${INK}" stroke-width="2.5"/><rect x="8" y="34" width="224" height="24" style="fill:var(--cold)" stroke="${INK}" stroke-width="2.5"/>
  ${rep(2, k => `<rect x="76" y="${k ? 60 : 18}" width="88" height="14" rx="3" style="fill:var(--brown)"/>`)}<g class="c2-osc"><rect x="92" y="36" width="52" height="20" rx="3" fill="#cfc9c3" stroke="${INK}" stroke-width="2.5"/></g></svg>`;
const rotIcon = `<svg class="ic dg" viewBox="0 0 240 92" aria-hidden="true"><path d="M8 34 H232" style="stroke:var(--cold)" stroke-width="20"/><path d="M8 24 H232 M8 44 H232" stroke="${INK}" stroke-width="2.5"/><circle cx="120" cy="46" r="40" style="fill:var(--cold)" stroke="${INK}" stroke-width="2.5"/>
  <g class="spin" style="transform-box:view-box;transform-origin:120px 41px">${rep(3, i => `<path d="M120 5 V77" stroke="${INK}" stroke-width="4" transform="rotate(${i * 60} 120 41)"/>`)}<circle cx="120" cy="41" r="28" fill="#cfc9c3" stroke="${INK}" stroke-width="2.5"/><circle cx="120" cy="34" r="3" fill="${INK}"/></g></svg>`;

export const css = `
.c2-leg{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:13px;color:var(--mute)}
.c2-leg i{display:inline-block;width:24px;height:9px;border-radius:5px;margin-right:7px;border:1.5px solid #262626;vertical-align:-1px}
.c2-kreis{max-height:calc(100dvh - var(--hud-h) - var(--dock-h) - 96px)}
.c2-altA .flow{animation:flow 1.1s linear infinite,c2-altA 9s linear infinite}
.c2-altB .flow{animation:flow 1.1s linear infinite,c2-altB 9s linear infinite}
@keyframes c2-altA{0%,42%{opacity:.9}50%,92%{opacity:0}100%{opacity:.9}}
@keyframes c2-altB{0%,42%{opacity:0}50%,92%{opacity:.9}100%{opacity:0}}
.c2-rows{display:grid;gap:0;font-size:clamp(16px,.7vw + 10px,22px)}
.c2-rows span{padding:9px 0;border-top:1px solid var(--line)}
.c2-rows span:last-child{border-bottom:1px solid var(--line)}
.c2-cmp .card{gap:6px}
.c2-cmp .ic{max-height:15vh;margin-bottom:6px}
.c2-cmp .c2-rows{font-size:clamp(15px,.5vw + 10px,19px)}
.c2-pid{max-height:calc(100dvh - var(--hud-h) - var(--dock-h) - 150px)}
.c2-cap{font-size:clamp(14px,.5vw + 10px,18px);color:var(--mute);max-width:56ch;min-height:2.9em}
.c2-dk{max-height:calc(100dvh - var(--hud-h) - var(--dock-h) - 250px)}
.c2-dk .glow{opacity:0;transition:opacity .6s}.c2-dk.heat .glow{opacity:1}
.c2-dk .cur{opacity:0;transition:opacity .35s}.c2-dk.heat .cur{opacity:1}
.c2-dk .sw{transform-box:view-box;transform-origin:300px 62px;transform:rotate(-32deg);transition:transform .4s cubic-bezier(.3,1.9,.5,1)}
.c2-dk.heat .sw{transform:rotate(0deg)}
.c2-dk .st-on,.c2-dk .st-off{transition:opacity .35s}.c2-dk .st-on,.c2-dk.heat .st-off{opacity:0}.c2-dk.heat .st-on{opacity:1}
.c2-slosh{animation:c2-slosh 3.2s linear infinite}
@keyframes c2-slosh{to{transform:translateX(-80px)}}
.c2-t2{font-size:clamp(15px,.6vw + 10px,21px);table-layout:fixed}
.c2-t2 td{transition:color .3s,background .3s;padding-left:10px}
.c2-t2 td:first-child{padding-left:0;width:34%}
.c2-t2 td.hl{color:var(--brown);background:rgba(243,238,232,.35);font-weight:500}
.c2-dkw .readout{gap:clamp(12px,2vw,30px)}
.c2-dkw .readout>div{flex:1 1 0;min-width:96px}
.c2-dkw .big-num{font-size:clamp(30px,2.4vw + 8px,54px)}
.c2-osc{animation:c2-osc .45s ease-in-out infinite alternate}
@keyframes c2-osc{from{transform:translateX(-14px)}to{transform:translateX(14px)}}
.c2-lever{transform-box:view-box;transform-origin:130px 62px;animation:c2-lever 3.6s cubic-bezier(.5,0,.3,1) infinite}
@keyframes c2-lever{0%,12%{transform:rotate(0deg)}50%,62%{transform:rotate(-46deg)}100%{transform:rotate(0deg)}}
.c2-press{animation:c2-press 3.6s cubic-bezier(.5,0,.3,1) infinite}
@keyframes c2-press{0%,12%{transform:translateY(-22px)}50%,62%{transform:translateY(12px)}100%{transform:translateY(-22px)}}
.c2-two .ic{max-height:13vh}
.c2-two{align-items:end}
.c2-two p{font-size:14px;color:var(--mute);text-align:center}
@media (max-width:980px),(max-aspect-ratio:1/1){.c2-kreis,.c2-pid,.c2-dk{max-height:none}}
`;

const legend = `<div class="c2-leg"><span><i style="background:var(--cold)"></i>kaltes Wasser</span><span><i style="background:var(--hot)"></i>heißes Wasser</span><span><i style="background:#f3eee8"></i>Dampf</span></div>`;
const rows = r => `<div class="c2-rows">${r.map(x => `<span>${x}</span>`).join('')}</div>`;

export const html = chapter(CH) +

film({ id: 'aufbau', ch: CH, title: '2.1 Aufbau einer Espressomaschine', name: 'Der Weg des Wassers', lead: 'Sieben zentrale Komponenten, ein Wasserweg.', dur: 27, rate: 1, still: 26.2,
  marks: [
    ['Pumpe', 0, 'Die <b>Pumpe</b> fördert kaltes Wasser aus dem Tank und baut den Druck auf.'],
    ['Überdruckventil (OPV)', 4.2, 'Das <b>Überdruckventil (OPV)</b> begrenzt den Druck und leitet überschüssiges Wasser zurück.'],
    ['Boiler und Heizelement', 8, 'Im <b>Boiler / Kessel</b> erhitzt das <b>Heizelement</b> das Wasser.'],
    ['Temperaturregelung', 13, 'Die <b>Temperaturregelung</b> misst die Temperatur und schaltet die Heizung.'],
    ['Brühgruppe', 17, 'In der <b>Brühgruppe</b> trifft das heiße Wasser auf den Kaffee.'],
    ['Dampfsystem', 21, 'Das <b>Dampfsystem</b> führt Dampf aus dem Kessel zur Dampflanze.']
  ], svg: aufbauSvg() }) +

scene({ id: 'maschinentypen', ch: CH, title: '2.2 Maschinentypen: Einkreiser, Zweikreiser und Dualboiler', light: true, steps: 2 }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title sm rv" style="--d:1">Drei Wege für Wasser und Dampf</h2>
      <div class="tabs rv" style="--d:2;align-self:flex-start" role="group" aria-label="Maschinentyp wählen">${rep(3, i => `<button data-go="${i}" aria-pressed="false">${TYPES[i].n}</button>`)}</div>
      <div class="pane rv" style="--d:3">${rep(3, i => `<div data-only="${i}" class="stack" style="gap:12px">${rows(TYPES[i].rows)}<p class="c2-cap">${TYPES[i].txt}</p></div>`)}</div>
      <div class="rv" style="--d:4">${why('<b>Unterschied:</b> Anzahl und Aufbau der Wasserkreisläufe bestimmen die Temperatursteuerung und Einsatzmöglichkeiten.')}</div>
    </div>
    <div class="stack rv-img" style="--d:2;gap:10px">${kreisSvg()}${legend}</div>
  </div>`)) +

scene({ id: 'maschinentypen-vergleich', ch: CH, title: 'Maschinentypen im Vergleich', light: true }, inner(`
  <div class="stack">
    ${kicker(CH)}
    <h2 class="title sm rv" style="--d:1">Einkreiser, Zweikreiser, Dualboiler</h2>
    <div class="cmp c2-cmp" style="--n:3">${rep(3, i => `<div class="card rv" style="--d:${2 + i}">${miniSvg(i)}<h3>${TYPES[i].n}</h3>${rows(TYPES[i].rows)}</div>`)}</div>
    <div class="rv" style="--d:5">${legend}</div>
  </div>`)) +

film({ id: 'pid', ch: CH, title: '2.3 PID-Steuerung', name: 'Der Regelkreis', lead: 'Elektronische Temperaturregelung zur präzisen Steuerung des Heizsystems.', dur: 20, rate: 1, still: 18.8,
  marks: [
    ['Sensor misst Temperatur', 0, 'Der <b>Sensor</b> misst die Temperatur im Kessel.'],
    ['Abgleich mit Solltemperatur', 3.2, 'Der Messwert wird mit der <b>Solltemperatur</b> abgeglichen.'],
    ['Regler berechnet Heizleistung', 6.4, 'Aus der Abweichung berechnet der <b>Regler</b> die Heizleistung.'],
    ['Heizung wird gesteuert', 9.6, 'Die <b>Heizung</b> wird entsprechend gesteuert: viel Leistung weit unter Soll, wenig kurz davor.'],
    ['Der Kreis läuft weiter', 12.8, 'Messen, abgleichen, regeln, heizen – immer wieder. Die Temperatur pendelt sich auf dem Sollwert ein.']
  ], svg: pidSvg() }) +

scene({ id: 'pid-nutzen', ch: CH, title: 'PID: Nutzen und Sinnhaftigkeit', light: true, steps: 1 }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title sm rv" style="--d:1">Was bringt PID?</h2>
      <p class="formula rv" style="--d:2"><b>PID</b> = Proportional, Integral, Differential</p>
      <div class="stack rv" style="--d:3;gap:8px"><span class="label">Nutzen</span>${notes(['Konstantere Temperaturen.', 'Weniger Temperaturschwankungen.', 'Reproduzierbare Extraktion.'], 'sm')}</div>
      <div class="stack rv" style="--d:4;gap:8px"><span class="label">Sinnhaftigkeit</span>${stats([['Sehr sinnvoll', 'Einkreiser'], ['Abhängig vom System', 'Zweikreiser'], ['Sehr sinnvoll', 'Dualboiler']])}</div>
    </div>
    <div class="stack rv-img" style="--d:2;gap:10px">
      <div class="tabs" role="group" aria-label="Regelung wählen" style="align-self:flex-start"><button data-go="0" aria-pressed="false">Ohne PID</button><button data-go="1" aria-pressed="false">Mit PID</button></div>
      ${pidChart}
      <div class="pane"><p class="c2-cap" data-only="0"><b>Thermostat:</b> Die Heizung kennt nur ein und aus. Die Temperatur schwingt um den Sollwert.</p><p class="c2-cap" data-only="1"><b>PID:</b> Der Regler dosiert die Heizleistung fein. Die Temperatur bleibt konstant.</p></div>
    </div>
  </div>`)) +

film({ id: 'e61', ch: CH, title: '2.4 E61-Brühgruppe', name: 'E61 im Schnitt', lead: 'Entstehung 1961 durch Faema.', dur: 22, rate: .5, still: 12,
  marks: [
    ['Thermosiphon', 0, '<b>Thermosiphon:</b> natürliche Wasserzirkulation zwischen Kessel und Brühgruppe zur Erwärmung der Brühgruppe.'],
    ['Hebel und Nocke', 6.4, 'Der Hebel dreht eine Nocke. Sie öffnet das Brühventil rein mechanisch.'],
    ['Mechanische Pre-Infusion', 9.4, '<b>Mechanisch gesteuerte Pre-Infusion:</b> Erst füllt sich die Kammer, der Puck wird sanft benetzt.'],
    ['Voller Pumpendruck', 13.8, '<b>Pumpenbetrieb:</b> Ist die Kammer voll, liegt der volle Druck der Pumpe am Puck an.'],
    ['Zurück in Ruhestellung', 18.4, 'Der Thermosiphon hält die Gruppe warm: <b>hohe Temperaturstabilität</b> bei geeigneter Konstruktion.']
  ], svg: e61Svg() }) +

scene({ id: 'e61-fakten', ch: CH, title: 'E61: Entstehung und Besonderheiten', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Vom Hebel zur Pumpe</h2>
      <div class="readout rv" style="--d:2"><div><span class="big-num">1961</span><span class="u">Entstehung durch Faema</span></div></div>
      <p class="lead wide rv" style="--d:3">Wichtiger Entwicklungsschritt von manuellen Hebelmaschinen hin zu pumpenbetriebenen Espressomaschinen.</p>
      <div class="rv-img" style="--d:4">${hebelSvg}</div>
    </div>
    <div class="stack">
      <span class="label rv" style="--d:2">Besonderheiten</span>
      <div class="rv" style="--d:3">${notes(['Mechanisch gesteuerte Pre-Infusion.', 'Pumpenbetrieb.', 'Thermosiphon-System.', 'Hohe Temperaturstabilität bei geeigneter Konstruktion.'])}</div>
      <div class="rv" style="--d:4">${why('<b>Thermosiphon:</b> Natürliche Wasserzirkulation zwischen Kessel und Brühgruppe zur Erwärmung der Brühgruppe.')}</div>
    </div>
  </div>`)) +

film({ id: 'preinfusion-opv', ch: CH, title: '2.5 Pre-Infusion und OPV', name: 'Erst benetzen, dann Druck', dur: 24, rate: .5, still: 17.5,
  marks: [
    ['Trockener Puck', 0, '<b>Pre-Infusion:</b> Vorbenetzung des Kaffeepucks, bevor der volle Druck anliegt.'],
    ['Vorbenetzung', 3, 'Das Wasser kommt mit wenig Druck: <b>gleichmäßigere Durchfeuchtung</b>.'],
    ['Puck durchfeuchtet', 8, '<b>Reduziertes Risiko von Channeling.</b> Bei E61 mechanisch gesteuert.'],
    ['Druck steigt', 11, '<b>OPV – Over Pressure Valve:</b> begrenzt den maximalen Pumpendruck.'],
    ['OPV öffnet', 15, 'Das Ventil öffnet und <b>führt überschüssiges Wasser zurück</b>.'],
    ['Druck bleibt begrenzt', 19, 'So <b>verhindert</b> das OPV <b>übermäßigen Druckaufbau</b>.']
  ], svg: opvSvg() }) +

scene({ id: 'dampfkessel', ch: CH, title: '2.6 Dampfkessel und Pressostat', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title sm rv" style="--d:1">Mehr Druck, heißerer Dampf</h2>
      <div class="stack rv" style="--d:2;gap:8px"><span class="label">Pressostat</span>${notes(['Druckabhängiger Schalter.', 'Kontrolliert den Kesseldruck.', 'Steuert das Ein- und Ausschalten der Heizung.'], 'sm')}</div>
      <div class="stack rv" style="--d:3;gap:8px"><span class="label">Zusammenhang Druck und Temperatur</span><p class="lead wide" style="font-size:clamp(16px,.7vw + 10px,21px)">Je höher der Dampfkesseldruck, desto höher die Siedetemperatur.</p>
        <table class="tbl c2-t2"><tbody><tr><td>Absolutdruck</td><td data-p="1">1 bar</td><td data-p="2">2 bar</td><td data-p="3">3 bar</td></tr><tr><td>Temperatur</td><td data-p="1">100 °C</td><td data-p="2">120 °C</td><td data-p="3">134 °C</td></tr></tbody></table></div>
      <div class="rv" style="--d:4">${why('<b>Hinweis:</b> Manometer zeigen meist Überdruck an – also den Absolutdruck minus 1 bar Umgebungsdruck.')}</div>
    </div>
    <div class="stack c2-dkw rv-img" style="--d:2;gap:10px">
      ${dkSvg()}
      <div class="slider"><div class="ends"><span>1 bar absolut</span><span>Kesseldruck einstellen</span><span>3 bar absolut</span></div><input type="range" id="c2-dk-p" min="1" max="3" step="0.1" value="2" aria-label="Absolutdruck im Dampfkessel in bar"></div>
      <div class="readout">
        <div><span class="big-num" id="c2-dk-abs">2,0</span><span class="u">bar Absolutdruck</span></div>
        <div><span class="big-num" id="c2-dk-g">1,0</span><span class="u">bar Überdruck am Manometer</span></div>
        <div><span class="big-num" id="c2-dk-t">120</span><span class="u">°C Siedetemperatur</span></div>
      </div>
    </div>
  </div>`)) +

film({ id: 'pumpen', ch: CH, title: '2.7 Pumpenarten: Vibrations- und Rotationspumpe', name: 'Kolben oder Rotor', dur: 20, rate: .5, still: 18,
  marks: [
    ['Vibrationspumpe', 0, '<b>Elektromagnetischer Kolben:</b> Eine Spule zieht den Kolben an, eine Feder drückt ihn zurück.'],
    ['Pulsierender Förderstrom', 4, 'Jeder Hub schiebt eine kleine Portion Wasser weiter. Das macht die Vibrationspumpe lauter.'],
    ['Rotationspumpe', 8, '<b>Rotierender Verdrängungsmechanismus:</b> Ein Rotor mit Flügeln schiebt das Wasser im Kreis.'],
    ['Gleichmäßiger Förderstrom', 12, 'Das Wasser fließt gleichmäßig. Die Rotationspumpe läuft leiser.'],
    ['Beide im Vergleich', 16, 'Beide Systeme erzeugen den notwendigen Druck für die Espressoextraktion.']
  ], svg: pumpSvg() }) +

scene({ id: 'pumpen-vergleich', ch: CH, title: 'Pumpenarten im Vergleich', light: true }, inner(`
  <div class="split">
    <div class="stack">
      ${kicker(CH)}
      <h2 class="title rv" style="--d:1">Zwei Pumpen, ein Ziel</h2>
      <p class="lead rv" style="--d:2"><b>Beide Systeme:</b> Erzeugen den notwendigen Druck für die Espressoextraktion.</p>
      <div class="grid2 c2-two rv-img" style="--d:3"><div>${vibIcon}<p>Kolben schwingt</p></div><div>${rotIcon}<p>Rotor dreht</p></div></div>
    </div>
    <div class="rv" style="--d:2">${tbl(['', 'Vibrationspumpe', 'Rotationspumpe'], [
      ['Prinzip', 'Elektromagnetischer Kolben', 'Rotierender Verdrängungsmechanismus'],
      ['Lautstärke', 'Lauter', 'Leiser'],
      ['Baugröße', 'Kompakt', 'Größer'],
      ['Preis', 'Günstiger', 'Teurer'],
      ['Einsatz', 'Häufig Haushaltsmaschinen', 'Häufig Gastronomie']])}</div>
  </div>`));

export const js = `
/* --- PID: a small live simulation. Thermostat = on/off with hysteresis, PID = dosed power. --- */
(() => {
  const elT = $('#c2-pid-t'); if (!elT) return;
  const elU = $('#c2-pid-u'), dot = $('#c2-pid-dot'), band = $('#c2-pid-band'), sw = $('#c2-pid-sw');
  const P = { g: 1.8, t1: 2.4, t2: 3, h: .04, kp: 4, ki: .8, kd: 5 }, N = 200, X0 = 60, X1 = 560, DX = (X1 - X0) / (N - 1), RATE = 26;
  let S, hist = [], mode = 0, raf = 0, last = 0, acc = 0, lo = 110, hi = 190, live = false;
  const init = () => { S = { T: 1, H: 1, I: 1 / P.g, on: false, u: 0 }; hist = []; };
  const sim = () => { const dt = .02;
    for (let k = 0; k < 4; k++) { const e = 1 - S.T, dT = (S.H - S.T) / P.t2;
      if (mode) { if (Math.abs(e) < .3) S.I = clamp(S.I + e * dt * P.ki, 0, 1); S.u = clamp(P.kp * e + S.I - P.kd * dT, 0, 1); }
      else { if (S.T > 1 + P.h) S.on = false; else if (S.T < 1 - P.h) S.on = true; S.u = S.on ? 1 : 0; }
      S.H += (S.u * P.g - S.H) / P.t1 * dt; S.T += dT * dt; }
    hist.push([S.T, S.u]); if (hist.length > N + 2) hist.shift(); };
  const yT = v => 150 - (v - 1) * 480, yU = v => 364 - v * 56;
  const draw = () => { const n = hist.length; if (!n) return; let a = '', b = '', mn = 9, mx = -9;
    for (let i = 0; i < n; i++) { const x = (X1 - (n - 1 - i + acc) * DX).toFixed(1), h = hist[i]; a += (i ? 'L' : 'M') + x + ' ' + yT(h[0]).toFixed(1); b += (i ? 'L' : 'M') + x + ' ' + yU(h[1]).toFixed(1); if (i > n - 70) { mn = Math.min(mn, h[0]); mx = Math.max(mx, h[0]); } }
    elT.setAttribute('d', a); elU.setAttribute('d', b + 'L' + X1 + ' 364L' + (X1 - (n - 1 + acc) * DX).toFixed(1) + ' 364Z');
    const h1 = hist[n - 1], h0 = hist[n - 2] || h1, cy = lerp(yT(h1[0]), yT(h0[0]), acc); dot.setAttribute('cy', cy.toFixed(1));
    const tl = yT(mx) - 3, th = yT(mn) + 3; lo += (tl - lo) * .08; hi += (th - hi) * .08; band.setAttribute('y', lo.toFixed(1)); band.setAttribute('height', Math.max(4, hi - lo).toFixed(1));
    sw.textContent = hi - lo > 22 ? 'schwingt' : 'konstant'; sw.setAttribute('y', (lo - 8).toFixed(1)); };
  const loop = now => { if (!live) return; const dt = Math.min(.05, (now - last) / 1000); last = now; acc -= dt * RATE; while (acc < 0) { sim(); acc += 1; } draw(); raf = requestAnimationFrame(loop); };
  const fill = () => { init(); for (let i = 0; i < N * 3; i++) sim(); lo = yT(Math.max(...hist.slice(-70).map(h => h[0]))) - 3; hi = yT(Math.min(...hist.slice(-70).map(h => h[0]))) + 3; acc = 0; draw(); };
  hooks['pid-nutzen'] = {
    step(sc, n) { mode = n; if (reduce || !live) fill(); },
    enter() { fill(); if (reduce) return; live = true; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
    leave() { live = false; cancelAnimationFrame(raf); }
  };
})();

/* --- steam boiler: the slider sets the pressostat; pressure follows, heater switches, readouts glide --- */
(() => {
  const sl = $('#c2-dk-p'); if (!sl) return;
  const svg = $('#c2-dk'), needle = $('#c2-dk-needle'), steamEl = $('#c2-dk-steam'), bubs = $$('#c2-dk-bub circle'), cells = $$('.c2-t2 td[data-p]');
  const oAbs = $('#c2-dk-abs'), oG = $('#c2-dk-g'), oT = $('#c2-dk-t');
  const boil = p => 100 + 20 * (p - 1) - 3 * (p - 1) * (p - 2);   // exact at 1, 2 and 3 bar, smooth in between
  const ph = bubs.map((b, i) => (i * .618) % 1), bx = bubs.map(b => +b.getAttribute('cx'));
  let set = +sl.value, disp = set, act = set, heat = false, raf = 0, last = 0, live = false, tt = 0;
  const paint = dt => {
    oAbs.textContent = de(disp, 1); oG.textContent = de(disp - 1, 1); oT.textContent = de(boil(disp), 0);
    cells.forEach(c => c.classList.toggle('hl', Math.abs(disp - +c.dataset.p) < .05));
    needle.setAttribute('transform', 'rotate(' + (-120 + clamp(act - 1, -.06, 2.1) * 120).toFixed(2) + ' 100 60)');
    steamEl.setAttribute('opacity', (.1 + .13 * (act - 1)).toFixed(3));
    svg.classList.toggle('heat', heat);
    const sp = (.22 + .3 * (act - 1)) * (heat ? 1.7 : .8), n = 4 + (act - 1) * 5;
    bubs.forEach((b, i) => { ph[i] = (ph[i] + dt * sp * (.8 + (i % 4) * .13)) % 1; const u = ph[i], vis = clamp(n - i, 0, 1);
      b.setAttribute('cy', (294 - u * 84).toFixed(1)); b.setAttribute('cx', (bx[i] + Math.sin(u * 9 + i) * 3).toFixed(1)); b.setAttribute('opacity', (vis * Math.min(1, u * 6, (1 - u) * 5) * .9).toFixed(2)); });
  };
  const loop = now => { if (!live) return; const dt = Math.min(.05, (now - last) / 1000); last = now; tt += dt;
    disp += (set - disp) * Math.min(1, dt * 7); if (Math.abs(set - disp) < .004) disp = set;
    const far = Math.abs(set - act) > .12;
    if (act < set - .04) heat = true; else if (act > set + .04) heat = false;
    act = clamp(act + (heat ? (far ? 1.1 : .05) : -(far ? 1.1 : .04)) * dt, .97, 3.1);
    paint(dt); raf = requestAnimationFrame(loop); };
  sl.addEventListener('input', () => { set = +sl.value; sl.setAttribute('aria-valuetext', de(set, 1) + ' bar absolut, ' + de(boil(set), 0) + ' Grad Celsius'); if (reduce || !live) { disp = act = set; paint(0); } });
  hooks['dampfkessel'] = {
    enter() { set = +sl.value; disp = act = set; heat = false; paint(0); if (reduce) return; live = true; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); },
    leave() { live = false; cancelAnimationFrame(raf); }
  };
  paint(0);
})();
`;

export const quiz = [
  { q: 'Was unterscheidet einen Dualboiler von einem Einkreiser?', o: ['Er hat zwei getrennte Kessel, Bezug und Dampf sind gleichzeitig möglich.', 'Er arbeitet ohne Pumpe.', 'Er hat nur einen Kessel und wechselt zwischen Dampf und Bezug.'], a: 0, e: 'Dualboiler: <b>zwei getrennte Kessel</b>, gleichzeitiger Bezug möglich, hohe Temperaturkontrolle. Der Einkreiser wechselt mit einem Kessel zwischen Dampf und Bezug.', go: 'maschinentypen' },
  { q: 'Welche Aufgabe hat das OPV (Over Pressure Valve)?', o: ['Es misst die Temperatur im Kessel.', 'Es begrenzt den maximalen Pumpendruck und führt überschüssiges Wasser zurück.', 'Es erzeugt den Dampf für die Dampflanze.'], a: 1, e: 'Das OPV <b>begrenzt den maximalen Pumpendruck</b>, führt überschüssiges Wasser zurück und verhindert übermäßigen Druckaufbau.', go: 'preinfusion-opv' }
];
