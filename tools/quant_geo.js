const L = require('./lib');
const { ri, pick, shuffle, sample, gcd, M, F, fracTex, tn, fmt, num, frac, mc, mcNum, ma, qc, cmp, clean, sgn } = L;

// Figures are inline SVG using currentColor so they follow light/dark theme.
const svg = (w, h, body) => `<svg class="fig" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>`;
const txt = (x, y, s, extra = '') => `<text x="${x}" y="${y}" ${extra}>${s}</text>`;

module.exports = function (def) {
  const A = 'Geometry';

  def({ id: 'tri-exterior', area: A, topic: 'Triangles', format: 'ne', diff: 'easy' }, () => {
    const a = ri(25, 80), b = ri(25, 80); if (a + b >= 160) return null;
    const x = a + b; const ask = pick(['x', 'b']);
    const fig = svg(290, 175, `<polyline points="20,150 130,25 200,150 20,150" fill="none" stroke="currentColor" stroke-width="2"/><line x1="200" y1="150" x2="275" y2="150" stroke="currentColor" stroke-width="2"/>
      ${txt(36, 142, `${a}°`)}${txt(118, 58, ask === 'b' ? 'y°' : `${b}°`)}${txt(212, 142, ask === 'x' ? 'x°' : `${x}°`)}${txt(8, 168, 'A')}${txt(124, 16, 'B')}${txt(196, 170, 'C')}${txt(270, 170, 'D')}`);
    return {
      stem: `In the figure above, points ${M('A')}, ${M('C')}, and ${M('D')} lie on a line. What is the value of ${M(ask === 'x' ? 'x' : 'y')}? <i>(Figure not drawn to scale.)</i>`,
      figure: fig,
      answer: num(ask === 'x' ? x : b),
      fast: ask === 'x'
        ? [`Exterior angle = sum of the two remote interior angles.`, `${M(`x = ${a} + ${b} = ${x}`)}.`]
        : [`Exterior angle = sum of the two remote interior angles: ${M(`${x} = ${a} + y`)}.`, `${M(`y = ${b}`)}.`],
      why: `Skips finding angle ${M('C')} first (${M('180 - a - b')}) and then its supplement.`,
    };
  });

  def({ id: 'isosceles', area: A, topic: 'Triangles', format: 'ne', diff: 'easy' }, () => {
    const dir = pick(['vertex', 'base']);
    if (dir === 'vertex') {
      const v = 2 * ri(10, 75); const base = (180 - v) / 2;
      return {
        stem: `In triangle ${M('PQR')}, ${M('PQ = PR')} and the measure of angle ${M('P')} is ${v}°. What is the measure, in degrees, of angle ${M('Q')}?`,
        answer: num(base),
        fast: [`Equal sides → equal opposite angles: ${M('\\angle Q = \\angle R')}.`, `${M(`\\angle Q = \\frac{180 - ${v}}{2} = ${base}`)}.`],
        why: `Knowing which angles are equal turns it into one subtraction and one halving.`,
      };
    }
    const bAng = ri(20, 85); const v = 180 - 2 * bAng;
    return {
      stem: `In isosceles triangle ${M('XYZ')}, ${M('XY = XZ')} and angle ${M('Y')} measures ${bAng}°. What is the measure, in degrees, of angle ${M('X')}?`,
      answer: num(v),
      fast: [`${M('\\angle Z = \\angle Y = ' + bAng + '°')} (opposite the equal sides).`, `${M(`\\angle X = 180 - 2(${bAng}) = ${v}`)}.`],
      why: `The equal angles sit opposite the equal sides — identify them and subtract once.`,
    };
  });

  def({ id: 'tri-306090', area: A, topic: 'Special right triangles', format: 'mc', diff: 'medium' }, () => {
    const s = ri(2, 12); const given = pick(['hyp', 'short', 'long']); const ask = pick(['area', 'perimeter', 'other']);
    const hyp = 2 * s;
    const sq3 = (k) => (k === 1 ? '\\sqrt{3}' : `${k}\\sqrt{3}`);
    const givenTxt = given === 'hyp' ? `hypotenuse of length ${M(hyp)}` : given === 'short' ? `shorter leg of length ${M(s)}` : `longer leg of length ${M(sq3(s))}`;
    let cor, ds, steps;
    const base = `Sides of a 30-60-90 triangle are in ratio ${M('1 : \\sqrt{3} : 2')}. Here the short leg is ${M(s)}, the long leg ${M(sq3(s))}, the hypotenuse ${M(hyp)}.`;
    if (ask === 'area') {
      const area2 = s * s; // area = s * s√3 / 2
      cor = M(area2 % 2 === 0 ? sq3(area2 / 2) : `\\frac{${sq3(area2)}}{2}`);
      ds = [M(sq3(area2)), M(`${area2}`), M(sq3(area2 * 2)), M(`\\frac{${area2}}{2}`), M(sq3(area2 + 1))];
      steps = [base, `Area ${M(`= \\frac{1}{2} \\cdot ${s} \\cdot ${sq3(s)}`)} ${M('=')} ${cor}.`];
    } else if (ask === 'perimeter') {
      cor = M(`${3 * s} + ${sq3(s)}`);
      ds = [M(`${3 * s}\\sqrt{3}`), M(`${2 * s} + ${sq3(2 * s)}`), M(`${4 * s}`), M(`${s} + ${sq3(3 * s)}`), M(`${3 * s} + ${sq3(2 * s)}`)];
      steps = [base, `Perimeter ${M(`= ${s} + ${sq3(s)} + ${hyp}`)} ${M('=')} ${cor}.`];
    } else {
      const want = given === 'hyp' ? 'long' : given === 'short' ? 'hyp' : 'short';
      cor = M(want === 'long' ? sq3(s) : want === 'hyp' ? `${hyp}` : `${s}`);
      ds = [M(sq3(2 * s)), M(`${s}\\sqrt{2}`), M(`${s + 1}`), M(sq3(s + 1)), M(`${3 * s}`), M(`${hyp}\\sqrt{3}`), M(`${hyp}`), M(`${s}`), M(sq3(s)), M(`${hyp}\\sqrt{2}`), M(`${s * 3}\\sqrt{3}`)];
      steps = [base, `So the ${want === 'long' ? 'longer leg' : want === 'hyp' ? 'hypotenuse' : 'shorter leg'} is ${cor}.`];
      ask === 'other' && (steps.wantTxt = want);
    }
    const q = ask === 'area' ? 'What is the area of the triangle?' : ask === 'perimeter' ? 'What is the perimeter of the triangle?' : `What is the length of the ${steps.wantTxt === 'long' ? 'longer leg' : steps.wantTxt === 'hyp' ? 'hypotenuse' : 'shorter leg'}?`;
    return {
      stem: `A right triangle has angles of 30°, 60°, and 90° and a ${givenTxt}. ${q}`,
      ...mc(cor, ds), fast: steps,
      why: `The fixed side ratio ${M('1 : \\sqrt{3} : 2')} gives every side instantly — no trigonometry or Pythagorean solving.`,
    };
  });

  def({ id: 'tri-454590', area: A, topic: 'Special right triangles', format: 'mc', diff: 'medium' }, () => {
    const k = ri(2, 12); const t = pick(['diag', 'leg', 'sqarea']);
    if (t === 'diag') {
      return {
        stem: `A square has sides of length ${M(k)}. What is the length of a diagonal of the square?`,
        ...mc(M(`${k}\\sqrt{2}`), [M(`${k}\\sqrt{3}`), M(`${2 * k}`), M(`${k * k}`), M(`2\\sqrt{${k}}`), M(`${2 * k}\\sqrt{2}`), M(`${k + 1}\\sqrt{2}`), M(`${k}\\sqrt{${k}}`)]),
        fast: [`A diagonal splits the square into two 45-45-90 triangles: sides ${M('1 : 1 : \\sqrt{2}')}.`, `Diagonal ${M(`= ${k}\\sqrt{2}`)}.`],
        why: `Leg × ${M('\\sqrt{2}')} — no need for ${M(`\\sqrt{${k}^{2} + ${k}^{2}}`)}.`,
      };
    }
    if (t === 'leg') {
      return {
        stem: `An isosceles right triangle has a hypotenuse of length ${M(`${k}\\sqrt{2}`)}. What is its area?`,
        ...mc(M(fracTex(k * k, 2)), [M(`${k * k}`), M(`${k * k}\\sqrt{2}`), M(`${2 * k * k}`), M(fracTex(k, 2)), M(fracTex(k * k, 4))]),
        fast: [`45-45-90: leg ${M('=')} hypotenuse ${M('\\div \\sqrt{2}')} ${M(`= ${k}`)}.`, `Area ${M(`= \\frac{1}{2}(${k})(${k}) = ${fracTex(k * k, 2)}`)}.`],
        why: `The side ratio ${M('1 : 1 : \\sqrt{2}')} gives the legs instantly.`,
      };
    }
    const d = ri(2, 14);
    return {
      stem: `The diagonal of a square has length ${M(d)}. What is the area of the square?`,
      ...mc(M(fracTex(d * d, 2)), [M(`${d * d}`), M(fracTex(d * d, 4)), M(`${d}\\sqrt{2}`), M(`${2 * d * d}`), M(fracTex(d * d, 3))]),
      fast: [`Square area ${M('= \\frac{d^{2}}{2}')} (a square is a rhombus).`, `${M(`\\frac{${d}^{2}}{2} = ${fracTex(d * d, 2)}`)}.`],
      why: `The ${M('\\frac{d^{2}}{2}')} shortcut skips finding the side ${M(`\\frac{${d}}{\\sqrt{2}}`)} and squaring it.`,
    };
  });

  def({ id: 'pythag', area: A, topic: 'Pythagorean theorem', format: 'ne', diff: 'easy' }, () => {
    const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]); const k = pick([1, 2, 3, 4, 5]);
    const miss = pick(['a', 'c']);
    const ctx = pick(['A ladder leans against a vertical wall.', 'A right triangle is shown.', 'A rectangular field is crossed diagonally.']);
    if (ctx.startsWith('A ladder')) {
      return {
        stem: `A ${c * k}-foot ladder leans against a vertical wall with its foot ${a * k} feet from the base of the wall on level ground. How many feet above the ground does the top of the ladder touch the wall?`,
        answer: num(b * k),
        fast: [`${M(`${a * k} : ? : ${c * k}`)} is ${M(`${k} \\times (${a} : ${b} : ${c})`)}, a Pythagorean triple.`, `Height ${M(`= ${b} \\times ${k} = ${b * k}`)}.`],
        why: `Recognizing a scaled triple avoids squaring ${M(c * k)} and taking a square root.`,
      };
    }
    if (miss === 'c') {
      return {
        stem: `A rectangle has length ${M(b * k)} and width ${M(a * k)}. What is the length of its diagonal?`,
        answer: num(c * k),
        fast: [`Sides ${M(`${a * k}, ${b * k}`)} = ${M(k)} × (${M(`${a}, ${b}`)}), a triple.`, `Diagonal ${M(`= ${c} \\times ${k} = ${c * k}`)}.`],
        why: `Divide out the common factor, spot the triple, multiply back.`,
      };
    }
    return {
      stem: `In right triangle ${M('ABC')}, the hypotenuse ${M('AC')} has length ${M(c * k)} and leg ${M('AB')} has length ${M(b * k)}. What is the length of leg ${M('BC')}?`,
      answer: num(a * k),
      fast: [`Factor out ${k}: sides are ${M(`${k} \\times (?, ${b}, ${c})`)}.`, `Triple ${M(`${a}\\text{-}${b}\\text{-}${c}`)} → ${M(`BC = ${a * k}`)}.`],
      why: `Memorized triples (3-4-5, 5-12-13, 8-15-17, 7-24-25) and their multiples save the square-root step.`,
    };
  });

  def({ id: 'equilateral', area: A, topic: 'Triangles', format: 'mc', diff: 'medium' }, () => {
    const s = 2 * ri(1, 8); const ask = pick(['area', 'height']);
    if (ask === 'area') {
      const n = s * s; const cor = M(`${n % 4 === 0 ? (n / 4 === 1 ? '' : n / 4) : `\\frac{${n}}{4}`}\\sqrt{3}`);
      return {
        stem: `What is the area of an equilateral triangle with sides of length ${M(s)}?`,
        ...mc(cor, [M(`${n / 2}\\sqrt{3}`), M(`${n / 2}`), M(`${n}\\sqrt{3}`), M(`${n / 4}`), M(`${s}\\sqrt{3}`), M(`${n / 4}\\sqrt{2}`)]),
        fast: [`Equilateral area ${M('= \\frac{s^{2}\\sqrt{3}}{4}')}.`, `${M(`\\frac{${s}^{2}\\sqrt{3}}{4}`)} ${M('=')} ${cor}.`],
        why: `The formula (from the 30-60-90 halves) is one line; deriving the height each time is slow.`,
      };
    }
    const cor = M(`${s / 2 === 1 ? '' : s / 2}\\sqrt{3}`);
    return {
      stem: `What is the height of an equilateral triangle with sides of length ${M(s)}?`,
      ...mc(cor, [M(`${s}\\sqrt{3}`), M(`${s / 2}`), M(`${s / 2}\\sqrt{2}`), M(`${s}`), M(`\\frac{${s}}{\\sqrt{3}}`)]),
      fast: [`The height cuts it into two 30-60-90 triangles with short leg ${M(s / 2)}.`, `Height = long leg ${M(`= ${s / 2}\\sqrt{3}`)}.`],
      why: `Height of an equilateral triangle is always ${M('\\frac{s\\sqrt{3}}{2}')}.`,
    };
  });

  def({ id: 'circle-basic', area: A, topic: 'Circles', format: 'mc', diff: 'easy' }, () => {
    const r = ri(2, 15); const give = pick(['C', 'A', 'd']);
    const P = (k) => M(`${k === 1 ? '' : k}\\pi`);
    if (give === 'C') {
      return {
        stem: `A circle has circumference ${P(2 * r)}. What is the area of the circle?`,
        ...mc(P(r * r), [P(4 * r * r), P(2 * r), P(r), P(2 * r * r), P(r * r * 2 + 1)]),
        fast: [`${M(`2\\pi r = ${2 * r}\\pi`)} → ${M(`r = ${r}`)}.`, `Area ${M(`= \\pi r^{2} = ${r * r}\\pi`)}.`],
        why: `Go through the radius — everything about a circle follows from ${M('r')}.`,
      };
    }
    if (give === 'A') {
      return {
        stem: `A circle has area ${P(r * r)}. What is its circumference?`,
        ...mc(P(2 * r), [P(r), P(r * r), P(4 * r), P(2 * r * r), P(r + 2)]),
        fast: [`${M(`\\pi r^{2} = ${r * r}\\pi`)} → ${M(`r = ${r}`)}.`, `Circumference ${M(`= 2\\pi r = ${2 * r}\\pi`)}.`],
        why: `Find ${M('r')} first; don't try to convert area directly to circumference.`,
      };
    }
    return {
      stem: `A circular table top has a diameter of ${M(2 * r)} inches. What is its area, in square inches?`,
      ...mc(P(r * r), [P(4 * r * r), P(2 * r), P(r), P(2 * r * r), P(r * r + r)]),
      fast: [`Radius ${M(`= ${2 * r} \\div 2 = ${r}`)}.`, `Area ${M(`= ${r}^{2}\\pi = ${r * r}\\pi`)}.`],
      why: `The trap is squaring the diameter; halve first.`,
    };
  });

  def({ id: 'arc-sector', area: A, topic: 'Circles', format: 'mc', diff: 'medium' }, () => {
    const th = pick([30, 36, 40, 45, 60, 72, 90, 120, 135, 150, 240, 270]); const r = ri(2, 12); const ask = pick(['arc', 'sector']);
    const f = [th, 360];
    const val = ask === 'arc' ? [th * 2 * r, 360] : [th * r * r, 360];
    const P = ([n, d]) => { const [a, b] = L.reduce(n, d); return M(b === 1 ? `${a === 1 ? '' : a}\\pi` : `\\frac{${a === 1 ? '' : a}\\pi}{${b}}`); };
    const cor = P(val);
    const ds = [P(ask === 'arc' ? [th * r * r, 360] : [th * 2 * r, 360]), P([val[0] * 2, 360]), P([val[0], 720]), P([th * r, 360]), P([val[0] * 3, 360]), P([val[0] * 4, 360]), P([val[0], 1080]), P([(360 - th) * (ask === 'arc' ? 2 * r : r * r), 360])];
    return {
      stem: `In a circle of radius ${M(r)}, a central angle measures ${th}°. What is the ${ask === 'arc' ? 'length of the arc' : 'area of the sector'} determined by this angle?`,
      ...mc(cor, ds),
      fast: [`The angle is ${M(fracTex(th, 360))} of the full circle.`, ask === 'arc' ? `${M(`${fracTex(th, 360)} \\times 2\\pi(${r})`)} ${M('=')} ${cor}.` : `${M(`${fracTex(th, 360)} \\times \\pi(${r})^{2}`)} ${M('=')} ${cor}.`],
      why: `Arc and sector are just "fraction of the circle" — reduce ${M(fracTex(th, 360))} first so the numbers stay small.`,
    };
  });

  def({ id: 'polygon-angles', area: A, topic: 'Polygons', format: 'ne', diff: 'medium' }, () => {
    const n = pick([5, 6, 8, 9, 10, 12, 15, 18, 20]); const ask = pick(['sum', 'each', 'ext', 'sides']);
    if (ask === 'sum') return { stem: `What is the sum, in degrees, of the interior angles of a polygon with ${n} sides?`, answer: num((n - 2) * 180), fast: [`Sum ${M('= (n - 2) \\times 180')}.`, `${M(`(${n} - 2) \\times 180 = ${tn((n - 2) * 180)}`)}.`], why: `Every polygon splits into ${M('n - 2')} triangles from one vertex.` };
    if (ask === 'each') return { stem: `What is the measure, in degrees, of each interior angle of a regular polygon with ${n} sides?`, answer: num(180 - 360 / n), fast: [`Each exterior angle ${M(`= \\frac{360}{${n}} = ${fmt(360 / n)}`)}.`, `Interior ${M(`= 180 - ${fmt(360 / n)} = ${fmt(180 - 360 / n)}`)}.`], why: `Exterior angles always sum to 360°, so going via the exterior angle is a single division.` };
    if (ask === 'ext') return { stem: `Each exterior angle of a regular polygon measures ${fmt(360 / n)}°. How many sides does the polygon have?`, answer: num(n), fast: [`Exterior angles sum to 360°.`, `${M(`360 \\div ${fmt(360 / n)} = ${n}`)} sides.`], why: `No need to use the interior-angle formula and solve for ${M('n')}.` };
    const each = 180 - 360 / n;
    return { stem: `Each interior angle of a regular polygon measures ${fmt(each)}°. How many sides does the polygon have?`, answer: num(n), fast: [`Exterior angle ${M(`= 180 - ${fmt(each)} = ${fmt(360 / n)}`)}.`, `${M(`360 \\div ${fmt(360 / n)} = ${n}`)} sides.`], why: `Solving ${M('\\frac{(n-2)180}{n} = ' + fmt(each))} works but takes several algebra steps.` };
  });

  def({ id: 'parallel-lines', area: A, topic: 'Lines & angles', format: 'ne', diff: 'medium' }, () => {
    const acute = ri(35, 80); const obt = 180 - acute;
    const kind = pick(['corr', 'alt', 'same']);
    // upper intersection (188,50), lower (92,140). pos offsets per quadrant
    const off = { TR: [10, -8], TL: [-44, -8], BL: [-44, 20], BR: [10, 20] };
    let posU, posL, vU, vL;
    if (kind === 'corr') { const q = pick(['TR', 'TL']); posU = q; posL = q; vU = vL = q === 'TR' ? acute : obt; }
    else if (kind === 'alt') { posU = 'BL'; posL = 'TR'; vU = vL = acute; }
    else { posU = 'BR'; posL = 'TR'; vU = obt; vL = acute; }
    let x, p, r, q, s; let tries = 0;
    do { x = ri(8, 30); p = ri(2, 6); r = ri(1, 5); q = vU - p * x; s = vL - r * x; tries++; } while ((p === r || Math.abs(q) > 60 || Math.abs(s) > 90) && tries < 50);
    if (tries >= 50) return null;
    const e1 = `(${p}x ${sgn(q)})°`.replace(' + 0', '').replace(' - 0', ''), e2 = `(${r === 1 ? '' : r}x ${sgn(s)})°`.replace(' + 0', '').replace(' - 0', '');
    const lab = (cx, cy, pos, t) => txt(cx + off[pos][0], cy + off[pos][1], t, 'font-size="12"');
    const fig = svg(300, 180, `<line x1="10" y1="50" x2="290" y2="50" stroke="currentColor" stroke-width="2"/><line x1="10" y1="140" x2="290" y2="140" stroke="currentColor" stroke-width="2"/><line x1="44" y1="185" x2="236" y2="5" stroke="currentColor" stroke-width="2"/>${txt(272, 44, 'ℓ')}${txt(272, 134, 'm')}${lab(188, 50, posU, e1)}${lab(92, 140, posL, e2)}`);
    const ask = pick(['x', 'angle']);
    const rel = kind === 'same' ? 'same-side interior angles, so they add to 180°' : kind === 'alt' ? 'alternate interior angles, so they are equal' : 'corresponding angles, so they are equal';
    const eq = kind === 'same' ? `${M(`(${p}x ${sgn(q)}) + (${r}x ${sgn(s)}) = 180`)}` : `${M(`${p}x ${sgn(q)} = ${r}x ${sgn(s)}`)}`;
    return {
      stem: `In the figure, lines ${M('\\ell')} and ${M('m')} are parallel. What is the value of ${ask === 'x' ? M('x') : `the angle marked ${M(e1.replace('°', '^{\\circ}'))}, in degrees`}? <i>(Figure not drawn to scale.)</i>`,
      figure: fig,
      answer: num(ask === 'x' ? x : vU),
      fast: [`The marked angles are ${rel}.`, `${eq} → ${M(`x = ${x}`)}.`, ...(ask === 'angle' ? [`Angle ${M(`= ${p}(${x}) ${sgn(q)} = ${vU}`)}.`] : [])],
      why: `With parallel lines, every angle is either equal to the one you know or its supplement — classify the pair and write one equation.`,
    };
  });

  def({ id: 'similar-tri', area: A, topic: 'Similar figures', format: 'ne', diff: 'medium' }, () => {
    const k1 = ri(1, 4), k2 = k1 + ri(1, 3); const t = pick(['area', 'side']);
    if (t === 'area') {
      const a1 = k1 * k1 * ri(2, 6);
      if ((a1 * k2 * k2) % (k1 * k1)) return null;
      return {
        stem: `Triangles ${M('ABC')} and ${M('DEF')} are similar, and the ratio of their corresponding sides is ${k1} to ${k2}. If the area of triangle ${M('ABC')} is ${a1}, what is the area of triangle ${M('DEF')}?`,
        answer: num((a1 * k2 * k2) / (k1 * k1)),
        fast: [`Area ratio = (side ratio)${M('^{2}')} ${M(`= \\frac{${k1 * k1}}{${k2 * k2}}`)}.`, `${M(`${a1} \\times \\frac{${k2 * k2}}{${k1 * k1}} = ${(a1 * k2 * k2) / (k1 * k1)}`)}.`],
        why: `Squaring the scale factor handles area directly — the trap is scaling area by ${M(fracTex(k2, k1))} only.`,
      };
    }
    const s1 = ri(2, 9) * k1, s2 = ri(2, 9) * k1; const S1 = (s1 / k1) * k2, S2 = (s2 / k1) * k2;
    return {
      stem: `Triangle ${M('PQR')} is similar to triangle ${M('XYZ')}, with ${M('P')}, ${M('Q')}, ${M('R')} corresponding to ${M('X')}, ${M('Y')}, ${M('Z')}. If ${M(`PQ = ${s1}`)}, ${M(`QR = ${s2}`)}, and ${M(`XY = ${S1}`)}, what is ${M('YZ')}?`,
      answer: num(S2),
      fast: [`Scale factor ${M(`= \\frac{XY}{PQ} = \\frac{${S1}}{${s1}} = ${fracTex(S1, s1)}`)}.`, `${M(`YZ = ${s2} \\times ${fracTex(S1, s1)} = ${S2}`)}.`],
      why: `One scale factor, applied once, beats setting up and cross-multiplying a proportion.`,
    };
  });

  def({ id: 'rectangle', area: A, topic: 'Area & perimeter', format: 'ne', diff: 'easy' }, () => {
    const w = ri(2, 15), m = pick([2, 3, 4]); const P = 2 * (w + m * w);
    return {
      stem: `The length of a rectangle is ${m === 2 ? 'twice' : m === 3 ? 'three times' : 'four times'} its width, and its perimeter is ${P}. What is the area of the rectangle?`,
      answer: num(w * m * w),
      fast: [`Perimeter ${M(`= 2(w + ${m}w) = ${2 * (m + 1)}w = ${P}`)} → ${M(`w = ${w}`)}.`, `Area ${M(`= ${w} \\times ${m * w} = ${w * m * w}`)}.`],
      why: `One variable (the width) is enough — avoid separate ${M('l')} and ${M('w')} equations.`,
    };
  });

  def({ id: 'box-cube', area: A, topic: '3-D figures', format: 'ne', diff: 'medium' }, () => {
    const t = pick(['cubeSA', 'cubeV', 'diag', 'fill']);
    if (t === 'cubeSA') { const s = ri(2, 10); return { stem: `The total surface area of a cube is ${6 * s * s} square centimeters. What is the volume of the cube, in cubic centimeters?`, answer: num(s ** 3), fast: [`One face ${M(`= ${6 * s * s} \\div 6 = ${s * s}`)} → edge ${M(`= ${s}`)}.`, `Volume ${M(`= ${s}^{3} = ${s ** 3}`)}.`], why: `Divide by 6 faces first; then edge, then volume.` }; }
    if (t === 'cubeV') { const s = ri(2, 9); return { stem: `A cube has volume ${s ** 3}. What is its total surface area?`, answer: num(6 * s * s), fast: [`Edge ${M(`= \\sqrt[3]{${s ** 3}} = ${s}`)}.`, `Surface area ${M(`= 6 \\times ${s}^{2} = ${6 * s * s}`)}.`], why: `Know cubes up to ${M('10^{3}')} to take cube roots instantly.` }; }
    if (t === 'diag') {
      const [a, b, c, d] = pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [2, 10, 11, 15], [6, 6, 7, 11]]); const k = pick([1, 2, 3]);
      return { stem: `A rectangular box has dimensions ${a * k} by ${b * k} by ${c * k}. What is the length of the longest line segment that can be drawn inside the box (the space diagonal)?`, answer: num(d * k), fast: [`Space diagonal ${M('= \\sqrt{l^{2} + w^{2} + h^{2}}')}.`, `${M(`\\sqrt{${(a * k) ** 2} + ${(b * k) ** 2} + ${(c * k) ** 2}} = \\sqrt{${(d * k) ** 2}} = ${d * k}`)}.`], why: `The 3-D Pythagorean formula does it in one step, instead of two separate right triangles.` };
    }
    const l = ri(2, 6) * 2, w = ri(2, 5), h = ri(2, 6); const c = pick([1, 2]);
    if ((l * w * h) % (c ** 3)) return null;
    return { stem: `How many cubes with edge length ${c} can fit exactly inside a rectangular box that measures ${l} by ${w * c} by ${h * c}?`, answer: num((l / c) * w * h), fast: [`Count along each edge: ${M(`\\frac{${l}}{${c}}, \\frac{${w * c}}{${c}}, \\frac{${h * c}}{${c}}`)}.`, `Multiply: ${M(`${l / c} \\times ${w} \\times ${h} = ${(l / c) * w * h}`)}.`], why: `Divide each edge first — dividing volumes only works when the edges divide evenly, and this checks that automatically.` };
  });

  def({ id: 'cylinder', area: A, topic: '3-D figures', format: 'mc', diff: 'medium' }, () => {
    const r = ri(1, 8), h = ri(2, 12); const t = pick(['V', 'scale']);
    const P = (k) => M(`${k === 1 ? '' : k}\\pi`);
    if (t === 'V') return {
      stem: `A right circular cylinder has a radius of ${r} and a height of ${h}. What is its volume?`,
      ...mc(P(r * r * h), [P(2 * r * h), P(r * h), P(2 * r * r * h), P(r * r * h * 2 + 1), P(4 * r * r * h), P(r * h * h)]),
      fast: [`${M('V = \\pi r^{2} h')}.`, `${M(`\\pi (${r})^{2}(${h}) = ${r * r * h}\\pi`)}.`], why: `Direct formula; watch out for using diameter or ${M('2\\pi r h')} (that's lateral area).`,
    };
    const f = pick([2, 3]); const g = pick([2, 3]);
    return {
      stem: `The radius of a cylinder is multiplied by ${f} and its height is multiplied by ${g}. The volume of the new cylinder is how many times the volume of the original?`,
      ...mcNum(f * f * g, [f * g, f + g, f * f + g, f * g * g, 2 * f * g]),
      fast: [`${M('V \\propto r^{2}h')}.`, `Factor ${M(`= ${f}^{2} \\times ${g} = ${f * f * g}`)}.`], why: `Scale factors multiply — no need to pick actual dimensions.`,
    };
  });

  def({ id: 'tri-inequality', area: A, topic: 'Triangles', format: 'ma', diff: 'medium' }, () => {
    const a = ri(3, 12), b = ri(3, 12); const lo = Math.abs(a - b), hi = a + b;
    const opts = new Set([lo, hi, lo + 1, hi - 1, Math.floor((lo + hi) / 2), hi + 1, Math.max(1, lo - 1)]);
    const vs = [...opts].filter((v) => v > 0).sort((x, y) => x - y).slice(0, 7);
    return {
      stem: `Two sides of a triangle have lengths ${a} and ${b}. Which of the following could be the length of the third side? Indicate <b>all</b> such lengths.`,
      ...ma(vs.map((v) => ({ text: M(v), ok: v > lo && v < hi }))),
      fast: [`Third side is strictly between the difference and the sum: ${M(`${a > b ? a - b : b - a} < s < ${a + b}`)}.`, `Pick values strictly inside (endpoints make a flat, degenerate triangle).`],
      why: `One range check replaces testing all three triangle inequalities for every choice.`,
    };
  });

  def({ id: 'inscribed', area: A, topic: 'Circles', format: 'mc', diff: 'hard' }, () => {
    const t = pick(['sqInCircle', 'circleInSq', 'ratio']); const r = ri(2, 9);
    if (t === 'sqInCircle') return {
      stem: `A square is inscribed in a circle of radius ${r}. What is the area of the square?`,
      ...mc(M(`${2 * r * r}`), [M(`${4 * r * r}`), M(`${r * r}`), M(`${r * r}\\pi`), M(`${2 * r}\\sqrt{2}`), M(`${r * r}\\sqrt{2}`)]),
      fast: [`The square's diagonal is the circle's diameter ${M(`= ${2 * r}`)}.`, `Square area ${M(`= \\frac{d^{2}}{2} = \\frac{${4 * r * r}}{2} = ${2 * r * r}`)}.`], why: `Using the diagonal directly skips finding the side ${M(`${r}\\sqrt{2}`)}.`,
    };
    if (t === 'circleInSq') return {
      stem: `A circle is inscribed in a square with sides of length ${2 * r}. What is the area of the region inside the square but outside the circle?`,
      ...mc(M(`${4 * r * r} - ${r * r}\\pi`), [M(`${4 * r * r} - ${4 * r * r}\\pi`), M(`${r * r}\\pi - ${2 * r * r}`), M(`${4 * r * r} - ${2 * r}\\pi`), M(`${2 * r * r} - ${r * r}\\pi`), M(`${4 * r * r} - ${2 * r * r}\\pi`), M(`${4 * r * r}\\pi - ${4 * r * r}`), M(`${8 * r * r} - ${r * r}\\pi`)]),
      fast: [`Circle's diameter = side ${M(`= ${2 * r}`)}, so ${M(`r = ${r}`)}.`, `${M(`${2 * r}^{2} - \\pi (${r})^{2} = ${4 * r * r} - ${r * r}\\pi`)}.`], why: `Shaded region = big shape − small shape, computed symbolically (leave ${M('\\pi')}).`,
    };
    return {
      stem: `A circle is inscribed in a square. What is the ratio of the area of the circle to the area of the square?`,
      ...mc(M('\\frac{\\pi}{4}'), [M('\\frac{\\pi}{2}'), M('\\frac{1}{4}'), M('\\frac{4}{\\pi}'), M('\\frac{\\pi}{8}'), M('\\frac{2}{\\pi}')]),
      fast: [`Pick radius ${M('1')}: circle area ${M('\\pi')}, square side ${M('2')} so area ${M('4')}.`, `Ratio ${M('\\frac{\\pi}{4}')}.`], why: `When no numbers are given, choose the easiest one (${M('r = 1')}).`,
    };
  }, 10);

  def({ id: 'geo-qc-area', area: A, topic: 'Area & perimeter', format: 'qc', diff: 'medium' }, () => {
    const t = pick(['circsq', 'triMax']);
    if (t === 'circsq') {
      const r = ri(2, 10), s = ri(3, 18); const ca = Math.PI * r * r, sa = s * s;
      if (Math.abs(ca - sa) < 2) return null;
      return {
        stem: `A circle has radius ${r}. A square has side ${s}.`,
        ...qc('The area of the circle', 'The area of the square', cmp(ca, sa)),
        fast: [`Circle: ${M(`${r * r}\\pi \\approx ${r * r} \\times 3.14 \\approx ${fmt(Math.round(ca * 10) / 10)}`)}.`, `Square: ${M(`${s}^{2} = ${sa}`)}.`],
        why: `Use ${M('\\pi \\approx 3.14')} (or bound it between 3 and 3.2) — exact values aren't needed to compare.`,
      };
    }
    const a = ri(3, 12), b = ri(3, 12); const max = (a * b) / 2; const bq = pick([max, max + ri(1, 5), max - ri(1, 3)]);
    const rel = bq >= max ? (bq === max ? 'D' : 'B') : 'D';
    return {
      stem: `Two sides of a triangle have lengths ${a} and ${b}.`,
      ...qc('The area of the triangle', M(fmt(bq)), rel),
      fast: [`Area ${M('= \\frac{1}{2}ab\\sin C')} is largest when the sides are perpendicular: max ${M(`= \\frac{1}{2}(${a})(${b}) = ${fmt(max)}`)}.`, `The angle is unknown, so the area can be anything from near 0 up to ${fmt(max)}.`, bq > max ? `B (${fmt(bq)}) is above the maximum → B.` : `${fmt(bq)} is within the possible range → cannot be determined.`],
      why: `Think about the extreme shapes (flat vs. right angle) instead of assuming the triangle is a right triangle.`,
    };
  });

  def({ id: 'trapezoid', area: A, topic: 'Quadrilaterals', format: 'ne', diff: 'easy' }, () => {
    const b1 = ri(3, 15), b2 = b1 + ri(2, 12), h = ri(2, 12); if ((b1 + b2) * h % 2) return null;
    return {
      stem: `A trapezoid has parallel sides of lengths ${b1} and ${b2} and a height of ${h}. What is its area?`,
      answer: num(((b1 + b2) * h) / 2),
      fast: [`Area = average of the bases × height.`, `${M(`\\frac{${b1} + ${b2}}{2} \\times ${h} = ${fmt((b1 + b2) / 2)} \\times ${h} = ${((b1 + b2) * h) / 2}`)}.`],
      why: `Thinking "average base × height" is quicker and harder to misremember than the full formula.`,
    };
  });

  def({ id: 'angle-ratio', area: A, topic: 'Triangles', format: 'ne', diff: 'easy' }, () => {
    let a, b, c; do { a = ri(1, 6); b = ri(1, 7); c = ri(2, 9); } while (180 % (a + b + c) !== 0 || a === b && b === c);
    const u = 180 / (a + b + c); const ask = pick(['largest', 'smallest']);
    return {
      stem: `The measures of the three angles of a triangle are in the ratio ${a} : ${b} : ${c}. What is the measure, in degrees, of the ${ask} angle?`,
      answer: num(u * (ask === 'largest' ? Math.max(a, b, c) : Math.min(a, b, c))),
      fast: [`Total parts ${M(`= ${a + b + c}`)}; each part ${M(`= 180 \\div ${a + b + c} = ${u}`)}.`, `${ask[0].toUpperCase() + ask.slice(1)}: ${M(`${ask === 'largest' ? Math.max(a, b, c) : Math.min(a, b, c)} \\times ${u} = ${u * (ask === 'largest' ? Math.max(a, b, c) : Math.min(a, b, c))}`)}.`],
      why: `The "parts" method solves any ratio-with-a-total problem in two steps.`,
    };
  });

  def({ id: 'quad-parallelogram', area: A, topic: 'Quadrilaterals', format: 'ne', diff: 'easy' }, () => {
    const a = ri(40, 85); const ask = pick(['opp', 'adj']);
    return {
      stem: `In parallelogram ${M('ABCD')}, angle ${M('A')} measures ${a}°. What is the measure, in degrees, of angle ${M(ask === 'opp' ? 'C' : 'B')}?`,
      answer: num(ask === 'opp' ? a : 180 - a),
      fast: ask === 'opp' ? [`Opposite angles of a parallelogram are equal: ${M(`\\angle C = ${a}`)}.`] : [`Consecutive angles of a parallelogram are supplementary.`, `${M(`\\angle B = 180 - ${a} = ${180 - a}`)}.`],
      why: `Parallelograms have only two angle sizes, which add to 180°.`,
    };
  }, 8);
};
