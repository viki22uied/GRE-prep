const L = require('./lib');
const { ri, pick, shuffle, sample, gcd, M, F, fracTex, tn, fmt, num, frac, mc, mcNum, ma, qc, cmp, clean, sgn, EX, par } = L;

// Figures are inline SVG using currentColor so they follow light/dark theme.
const svg = (w, h, body) => `<svg class="fig" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>`;
const txt = (x, y, s, extra = '') => `<text x="${x}" y="${y}" ${extra}>${s}</text>`;

module.exports = function (def) {
  const A = 'Geometry';

  def({ id: 'tri-exterior', area: A, topic: 'Triangles', format: 'ne', diff: 'easy' }, () => {
    const a = ri(25, 80), b = ri(25, 80); if (a + b >= 160) return null;
    const x = a + b; const ask = pick(['x', 'y']);
    const fig = svg(290, 175, `<polyline points="20,150 130,25 200,150 20,150" fill="none" stroke="currentColor" stroke-width="2"/><line x1="200" y1="150" x2="275" y2="150" stroke="currentColor" stroke-width="2"/>
      ${txt(36, 142, `${a}°`)}${txt(118, 58, ask === 'y' ? 'y°' : `${b}°`)}${txt(212, 142, ask === 'x' ? 'x°' : `${x}°`)}${txt(8, 168, 'A')}${txt(124, 16, 'B')}${txt(196, 170, 'C')}${txt(270, 170, 'D')}`);
    return {
      stem: `In the figure above, points ${M('A')}, ${M('C')}, and ${M('D')} lie on a line. What is the value of ${M(ask)}? <i>(Figure not drawn to scale.)</i>`,
      figure: fig,
      answer: num(ask === 'x' ? x : b),
      ...EX(`The angle ${ask === 'x' ? 'we want is outside the triangle' : 'we want is inside the triangle, but the angle given at C is outside it'}, so the usual "angles add to 180°" rule doesn't apply to it directly.`,
        `An exterior angle of a triangle equals the sum of the two interior angles that are not next to it (the "remote" interior angles). This comes from two facts: the three interior angles add to 180°, and the exterior angle and its neighbor on the straight line also add to 180°.`,
        ask === 'x'
          ? [`The exterior angle at C is ${M('x')}. The two interior angles far from C are at A (${a}°) and B (${b}°).`, `By the exterior-angle rule, ${M('x')} is their sum.`]
          : [`The exterior angle at C is ${x}°. The two remote interior angles are at A (${a}°) and B (${M('y')}°).`, `By the exterior-angle rule, ${M(`${x} = ${a} + y`)}, so subtract ${a} from ${x}.`],
        ask === 'x' ? `${M(`x = ${a} + ${b} = ${x}`)}` : `${M(`y = ${x} - ${a} = ${b}`)}`,
        `Pattern: "exterior angle." Exterior = sum of the two remote interior angles — no need to find the third interior angle first.`),
    };
  });

  def({ id: 'isosceles', area: A, topic: 'Triangles', format: 'ne', diff: 'easy' }, () => {
    const dir = pick(['vertex', 'base']);
    if (dir === 'vertex') {
      const v = 2 * ri(10, 75); const base = (180 - v) / 2;
      return {
        stem: `In triangle ${M('PQR')}, ${M('PQ = PR')} and the measure of angle ${M('P')} is ${v}°. What is the measure, in degrees, of angle ${M('Q')}?`,
        answer: num(base),
        ...EX(`We know only one angle, and a triangle has three.`,
          `In an isosceles triangle, the angles opposite the equal sides are equal. So once one angle is known, the other two are either equal to it or share what's left of 180° equally.`,
          [`${M('PQ')} and ${M('PR')} are equal. The angle opposite ${M('PQ')} is ${M('R')} and the angle opposite ${M('PR')} is ${M('Q')}, so ${M('\\angle Q = \\angle R')}.`,
            `The angles of a triangle add to 180°. Angle ${M('P')} uses ${v}°, leaving 180 − ${v} = ${180 - v}° for ${M('Q')} and ${M('R')} together.`,
            `They are equal, so each gets half of ${180 - v}.`],
          `${M(`\\angle Q = \\frac{${180 - v}}{2} = ${base}`)}`,
          `Pattern: "isosceles, vertex angle given." Base angles = (180 − vertex) ÷ 2.`),
      };
    }
    const bAng = ri(20, 85); const v = 180 - 2 * bAng;
    return {
      stem: `In isosceles triangle ${M('XYZ')}, ${M('XY = XZ')} and angle ${M('Y')} measures ${bAng}°. What is the measure, in degrees, of angle ${M('X')}?`,
      answer: num(v),
      ...EX(`We know only one angle, and we need to figure out which other angle matches it.`,
        `In an isosceles triangle, the angles opposite the equal sides are equal. Identify the equal pair, then use the 180° angle sum for the remaining angle.`,
        [`${M('XY = XZ')}. The angle opposite ${M('XZ')} is ${M('Y')} and the angle opposite ${M('XY')} is ${M('Z')}, so ${M('\\angle Z = \\angle Y')} = ${bAng}°.`,
          `Together ${M('Y')} and ${M('Z')} use 2 × ${bAng} = ${2 * bAng}°, and angle ${M('X')} gets the rest of 180°.`],
        `${M(`\\angle X = 180 - ${2 * bAng} = ${v}`)}`,
        `Pattern: "isosceles, base angle given." Double it and subtract from 180 for the vertex angle.`),
    };
  });

  def({ id: 'tri-306090', area: A, topic: 'Special right triangles', format: 'mc', diff: 'medium' }, () => {
    const s = ri(2, 12); const given = pick(['hyp', 'short', 'long']); const ask = pick(['area', 'perimeter', 'other']);
    const hyp = 2 * s;
    const sq3 = (k) => (k === 1 ? '\\sqrt{3}' : `${k}\\sqrt{3}`);
    const givenTxt = given === 'hyp' ? `hypotenuse of length ${M(hyp)}` : given === 'short' ? `shorter leg of length ${M(s)}` : `longer leg of length ${M(sq3(s))}`;
    const findShort = given === 'hyp' ? `The hypotenuse is twice the short leg, so the short leg is ${hyp} ÷ 2 = ${s}.` : given === 'short' ? `The short leg is given: ${s}.` : `The long leg is the short leg times ${M('\\sqrt{3}')}, so dividing ${M(sq3(s))} by ${M('\\sqrt{3}')} gives the short leg ${s}.`;
    const sides = `So the sides are: short leg ${M(s)} (opposite 30°), long leg ${M(sq3(s))} (opposite 60°), hypotenuse ${M(hyp)} (twice the short leg, 2 × ${s}).`;
    let cor, ds, work, q, extra = [];
    if (ask === 'area') {
      const n2 = s * s; cor = M(n2 % 2 === 0 ? sq3(n2 / 2) : `\\frac{${sq3(n2)}}{2}`);
      ds = [M(sq3(n2)), M(`${n2}`), M(sq3(n2 * 2)), M(`\\frac{${n2}}{2}`), M(sq3(n2 + 1))];
      extra = [`In a right triangle the two legs are perpendicular, so they serve as base and height. Multiplying ${s} by ${M(sq3(s))} gives ${M(sq3(n2))}.`];
      work = `${M(`\\frac{1}{2} \\cdot ${s} \\cdot ${sq3(s)} = \\frac{${sq3(n2)}}{2}`)}${n2 % 2 === 0 ? ` ${M('= ' + sq3(n2 / 2))}` : ''}`;
      q = 'What is the area of the triangle?';
    } else if (ask === 'perimeter') {
      cor = M(`${3 * s} + ${sq3(s)}`);
      ds = [M(`${3 * s}\\sqrt{3}`), M(`${2 * s} + ${sq3(2 * s)}`), M(`${4 * s}`), M(`${s} + ${sq3(3 * s)}`), M(`${3 * s} + ${sq3(2 * s)}`)];
      extra = [`Add all three sides. The whole-number parts combine (${s} + ${hyp} = ${3 * s}); the ${M('\\sqrt{3}')} part stays separate because it isn't a like term.`];
      work = `${M(`${s} + ${sq3(s)} + ${hyp} = ${3 * s} + ${sq3(s)}`)}`;
      q = 'What is the perimeter of the triangle?';
    } else {
      const want = given === 'hyp' ? 'long' : given === 'short' ? 'hyp' : 'short';
      cor = M(want === 'long' ? sq3(s) : want === 'hyp' ? `${hyp}` : `${s}`);
      ds = [M(sq3(2 * s)), M(`${s}\\sqrt{2}`), M(`${s + 1}`), M(sq3(s + 1)), M(`${3 * s}`), M(`${hyp}\\sqrt{3}`), M(`${hyp}`), M(`${s}`), M(sq3(s)), M(`${hyp}\\sqrt{2}`), M(`${s * 3}\\sqrt{3}`)];
      const wantTxt = want === 'long' ? 'longer leg' : want === 'hyp' ? 'hypotenuse' : 'shorter leg';
      q = `What is the length of the ${wantTxt}?`;
      work = want === 'long' ? `${M(`${s} \\times \\sqrt{3} = ${sq3(s)}`)}` : want === 'hyp' ? `${M(`2 \\times ${s} = ${hyp}`)}` : `${M(`${sq3(s)} \\div \\sqrt{3} = ${s}`)}`;
    }
    return {
      stem: `A right triangle has angles of 30°, 60°, and 90° and a ${givenTxt}. ${q}`,
      ...mc(cor, ds),
      ...EX(`We're given only one side, and the Pythagorean theorem alone needs two.`,
        `In every 30-60-90 triangle the sides are in the fixed ratio ${M('1 : \\sqrt{3} : 2')} (short leg : long leg : hypotenuse). So any one side determines the other two: find the short leg first, then multiply by ${M('\\sqrt{3}')} for the long leg and by 2 for the hypotenuse.`,
        [findShort, sides, ...extra],
        work,
        `Pattern: "30-60-90 triangle." Ratio ${M('1 : \\sqrt{3} : 2')}; always go through the short leg. No trigonometry needed.`),
    };
  });

  def({ id: 'tri-454590', area: A, topic: 'Special right triangles', format: 'mc', diff: 'medium' }, () => {
    const k = ri(2, 12); const t = pick(['diag', 'leg', 'sqarea']);
    if (t === 'diag') {
      return {
        stem: `A square has sides of length ${M(k)}. What is the length of a diagonal of the square?`,
        ...mc(M(`${k}\\sqrt{2}`), [M(`${k}\\sqrt{3}`), M(`${2 * k}`), M(`${k * k}`), M(`2\\sqrt{${k}}`), M(`${2 * k}\\sqrt{2}`), M(`${k + 1}\\sqrt{2}`), M(`${k}\\sqrt{${k}}`)]),
        ...EX(`The diagonal isn't a side, so it isn't given directly.`,
          `A diagonal cuts a square into two 45-45-90 triangles, whose sides are always in the ratio ${M('1 : 1 : \\sqrt{2}')}. So the diagonal (the hypotenuse) is the side times ${M('\\sqrt{2}')}.`,
          [`Each half of the square is a right triangle with two legs of length ${k} (two sides of the square) and the diagonal as hypotenuse.`, `The legs are equal, so it's a 45-45-90 triangle, and its hypotenuse is a leg times ${M('\\sqrt{2}')}.`],
          `${M(`${k} \\times \\sqrt{2} = ${k}\\sqrt{2}`)}`,
          `Pattern: "diagonal of a square." Side × ${M('\\sqrt{2}')}; no need to compute ${M(`\\sqrt{${k}^{2} + ${k}^{2}}`)} from scratch.`),
      };
    }
    if (t === 'leg') {
      return {
        stem: `An isosceles right triangle has a hypotenuse of length ${M(`${k}\\sqrt{2}`)}. What is its area?`,
        ...mc(M(fracTex(k * k, 2)), [M(`${k * k}`), M(`${k * k}\\sqrt{2}`), M(`${2 * k * k}`), M(fracTex(k, 2)), M(fracTex(k * k, 4))]),
        ...EX(`Area needs the legs, but only the hypotenuse is given.`,
          `An isosceles right triangle is a 45-45-90 triangle: legs equal, hypotenuse = leg × ${M('\\sqrt{2}')}. So leg = hypotenuse ÷ ${M('\\sqrt{2}')}.`,
          [`Divide the hypotenuse by ${M('\\sqrt{2}')}: ${M(`${k}\\sqrt{2} \\div \\sqrt{2} = ${k}`)}, so each leg is ${k}.`, `The legs are perpendicular, so they are the base and height.`],
          `${M(`\\frac{1}{2} \\times ${k} \\times ${k} = ${fracTex(k * k, 2)}`)}`,
          `Pattern: "isosceles right triangle." Leg = hypotenuse ÷ ${M('\\sqrt{2}')}; area = leg² ÷ 2.`),
      };
    }
    const d = ri(2, 14);
    return {
      stem: `The diagonal of a square has length ${M(d)}. What is the area of the square?`,
      ...mc(M(fracTex(d * d, 2)), [M(`${d * d}`), M(fracTex(d * d, 4)), M(`${d}\\sqrt{2}`), M(`${2 * d * d}`), M(fracTex(d * d, 3))]),
      ...EX(`We know the diagonal, not the side, and area needs the side.`,
        `For a square, side = diagonal ÷ ${M('\\sqrt{2}')}, so area = side² = diagonal² ÷ 2. Remember the shortcut area ${M('= \\frac{d^{2}}{2}')}.`,
        [`The side is ${M(`\\frac{${d}}{\\sqrt{2}}`)} (45-45-90 ratio), and squaring it gives ${M(`\\frac{${d}^{2}}{2}`)}, because ${M('(\\sqrt{2})^{2} = 2')}.`, `${d} squared is ${d * d}.`],
        `${M(`\\frac{${d * d}}{2} = ${fracTex(d * d, 2)}`)}`,
        `Pattern: "square from its diagonal." Area = diagonal² ÷ 2.`),
    };
  });

  def({ id: 'pythag', area: A, topic: 'Pythagorean theorem', format: 'ne', diff: 'easy' }, () => {
    const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]); const k = pick([1, 2, 3, 4, 5]);
    const ctx = pick(['ladder', 'rect', 'leg']);
    const method = `If ${M('a^{2} + b^{2} = c^{2}')} has a whole-number solution, it's usually a multiple of a famous triple (3-4-5, 5-12-13, 8-15-17, 7-24-25, 20-21-29). Divide the given sides by their common factor, recognize the triple, then multiply back.`;
    const kTxt = k === 1 ? `These already match the triple ${a}-${b}-${c}.` : `Both given numbers are divisible by ${k}; dividing gives the triple ${a}-${b}-${c}, scaled up by ${k}.`;
    if (ctx === 'ladder') return {
      stem: `A ${c * k}-foot ladder leans against a vertical wall with its foot ${a * k} feet from the base of the wall on level ground. How many feet above the ground does the top of the ladder touch the wall?`,
      answer: num(b * k),
      ...EX(`We need the third side of a right triangle, and squaring ${c * k} then taking a square root is slow.`, method,
        [`The wall, the ground and the ladder form a right triangle with the ladder (${c * k}) as the hypotenuse and the ground distance (${a * k}) as one leg.`, kTxt, `The missing side matches the ${b} in the triple.`],
        `${M(`${b} \\times ${k} = ${b * k}`)}`, `Pattern: "Pythagorean triple in disguise." Scale down, spot the triple, scale up.`),
    };
    if (ctx === 'rect') return {
      stem: `A rectangle has length ${M(b * k)} and width ${M(a * k)}. What is the length of its diagonal?`,
      answer: num(c * k),
      ...EX(`The diagonal isn't one of the given sides.`, method,
        [`A diagonal splits the rectangle into two right triangles with legs ${b * k} and ${a * k}; the diagonal is the hypotenuse.`, kTxt, `The hypotenuse matches the ${c} in the triple.`],
        `${M(`${c} \\times ${k} = ${c * k}`)}`, `Pattern: "diagonal of a rectangle." Right triangle with the sides as legs — look for a triple.`),
    };
    return {
      stem: `In right triangle ${M('ABC')}, the hypotenuse ${M('AC')} has length ${M(c * k)} and leg ${M('AB')} has length ${M(b * k)}. What is the length of leg ${M('BC')}?`,
      answer: num(a * k),
      ...EX(`We need a leg from the hypotenuse and the other leg, which normally means ${M('c^{2} - b^{2}')} and a square root.`, method,
        [kTxt, `The given sides correspond to ${b} and ${c} in the triple, so the missing leg corresponds to ${a}.`],
        `${M(`${a} \\times ${k} = ${a * k}`)}`, `Pattern: "Pythagorean triple in disguise." Scale down, spot the triple, scale up.`),
    };
  });

  def({ id: 'equilateral', area: A, topic: 'Triangles', format: 'mc', diff: 'medium' }, () => {
    const s = 2 * ri(1, 8); const ask = pick(['area', 'height']); const hs = s / 2;
    if (ask === 'area') {
      const n = s * s; const cor = M(`${n / 4 === 1 ? '' : n % 4 === 0 ? n / 4 : `\\frac{${n}}{4}`}\\sqrt{3}`);
      return {
        stem: `What is the area of an equilateral triangle with sides of length ${M(s)}?`,
        ...mc(cor, [M(`${n / 2}\\sqrt{3}`), M(`${n / 2}`), M(`${n}\\sqrt{3}`), M(`${n / 4}`), M(`${s}\\sqrt{3}`), M(`${n / 4}\\sqrt{2}`)]),
        ...EX(`Area needs a height, and the height of an equilateral triangle isn't given.`,
          `Dropping a height in an equilateral triangle splits it into two 30-60-90 triangles, so the height is ${M('\\frac{s\\sqrt{3}}{2}')}. Multiplying by ½ × base gives the formula area ${M('= \\frac{s^{2}\\sqrt{3}}{4}')}.`,
          [`The height cuts the base of ${s} in half, giving a short leg of ${hs}; the height is the long leg, ${M(`${hs}\\sqrt{3}`)}.`, `Area = ½ × base ${s} × height ${M(`${hs}\\sqrt{3}`)}, which is the same as ${M(`\\frac{${s}^{2}\\sqrt{3}}{4}`)}. And ${s} squared is ${n}.`],
          `${M(`\\frac{${n}\\sqrt{3}}{4}`)} ${M('=')} ${cor}`,
          `Pattern: "equilateral triangle area." Memorize ${M('\\frac{s^{2}\\sqrt{3}}{4}')}.`),
      };
    }
    const cor = M(`${hs === 1 ? '' : hs}\\sqrt{3}`);
    return {
      stem: `What is the height of an equilateral triangle with sides of length ${M(s)}?`,
      ...mc(cor, [M(`${s}\\sqrt{3}`), M(`${hs}`), M(`${hs}\\sqrt{2}`), M(`${s}`), M(`\\frac{${s}}{\\sqrt{3}}`)]),
      ...EX(`The height is not a side, so it isn't given.`,
        `The height of an equilateral triangle splits it into two 30-60-90 triangles. In each, the hypotenuse is the side ${M('s')}, the short leg is half the base, and the height is the long leg (short leg × ${M('\\sqrt{3}')}).`,
        [`The short leg is half of ${s}, which is ${hs}.`, `The height is the long leg: short leg × ${M('\\sqrt{3}')}.`],
        `${M(`${hs} \\times \\sqrt{3} = ${hs === 1 ? '' : hs}\\sqrt{3}`)}`,
        `Pattern: "equilateral triangle height." ${M('\\frac{s\\sqrt{3}}{2}')}.`),
    };
  });

  def({ id: 'circle-basic', area: A, topic: 'Circles', format: 'mc', diff: 'easy' }, () => {
    const r = ri(3, 15); const give = pick(['C', 'A', 'd']);
    const P = (k) => M(`${k === 1 ? '' : k}\\pi`);
    const method = `Everything about a circle follows from its radius: circumference ${M('= 2\\pi r')} and area ${M('= \\pi r^{2}')}. So first recover ${M('r')} from whatever you're given, then compute what's asked.`;
    if (give === 'C') return {
      stem: `A circle has circumference ${P(2 * r)}. What is the area of the circle?`,
      ...mc(P(r * r), [P(4 * r * r), P(2 * r), P(r), P(2 * r * r), P(r * r * 2 + 1)]),
      ...EX(`Circumference and area use different formulas, so you can't convert one into the other directly.`, method,
        [`${M(`2\\pi r = ${2 * r}\\pi`)}; divide both sides by ${M('2\\pi')} to get ${M(`r = ${r}`)}.`, `Area needs ${M('r^{2}')}: ${r} squared is ${r * r}.`],
        `${M(`\\pi (${r})^{2} = ${r * r}\\pi`)}`, `Pattern: "circle, one measurement to another." Go through the radius.`),
    };
    if (give === 'A') return {
      stem: `A circle has area ${P(r * r)}. What is its circumference?`,
      ...mc(P(2 * r), [P(r), P(r * r), P(4 * r), P(2 * r * r), P(r + 2)]),
      ...EX(`Area and circumference use different formulas, so you can't convert one into the other directly.`, method,
        [`${M(`\\pi r^{2} = ${r * r}\\pi`)}; divide by ${M('\\pi')} to get ${M(`r^{2} = ${r * r}`)}, so ${M(`r = ${r}`)}.`, `Circumference is ${M('2\\pi r')}.`],
        `${M(`2\\pi (${r}) = ${2 * r}\\pi`)}`, `Pattern: "circle, one measurement to another." Go through the radius.`),
    };
    return {
      stem: `A circular table top has a diameter of ${M(2 * r)} inches. What is its area, in square inches?`,
      ...mc(P(r * r), [P(4 * r * r), P(2 * r), P(r), P(2 * r * r), P(r * r + r)]),
      ...EX(`The formula uses the radius, but we're given the diameter.`, method,
        [`The radius is half the diameter: ${2 * r} ÷ 2 = ${r}.`, `Area needs ${M('r^{2}')}: ${r} squared is ${r * r}.`],
        `${M(`\\pi (${r})^{2} = ${r * r}\\pi`)}`, `Pattern: "diameter given." Halve it first; squaring the diameter is the trap (${M(`${4 * r * r}\\pi`)}).`),
    };
  });

  def({ id: 'arc-sector', area: A, topic: 'Circles', format: 'mc', diff: 'medium' }, () => {
    const th = pick([30, 36, 40, 45, 60, 72, 90, 120, 135, 150, 240, 270]); const r = ri(2, 12); const ask = pick(['arc', 'sector']);
    const val = ask === 'arc' ? [th * 2 * r, 360] : [th * r * r, 360];
    const P = ([n, d]) => { const [a, b] = L.reduce(n, d); return M(b === 1 ? `${a === 1 ? '' : a}\\pi` : `\\frac{${a === 1 ? '' : a}\\pi}{${b}}`); };
    const cor = P(val);
    const ds = [P(ask === 'arc' ? [th * r * r, 360] : [th * 2 * r, 360]), P([val[0] * 2, 360]), P([val[0], 720]), P([th * r, 360]), P([val[0] * 3, 360]), P([val[0] * 4, 360]), P([val[0], 1080]), P([(360 - th) * (ask === 'arc' ? 2 * r : r * r), 360])];
    const [fn, fd] = L.reduce(th, 360); const whole = ask === 'arc' ? 2 * r : r * r;
    return {
      stem: `In a circle of radius ${r}, a central angle measures ${th}°. What is the ${ask === 'arc' ? 'length of the arc' : 'area of the sector'} determined by this angle?`,
      ...mc(cor, ds),
      ...EX(`There's no separate formula to memorize for ${ask === 'arc' ? 'arcs' : 'sectors'} — the trick is seeing what fraction of the circle we have.`,
        `A central angle of ${M('\\theta')} degrees cuts off ${M('\\frac{\\theta}{360}')} of the circle. So ${ask === 'arc' ? 'the arc is that fraction of the circumference' : 'the sector is that fraction of the area'}. Reduce the fraction first so the arithmetic stays small.`,
        [`${th}° out of the full 360° is ${M(`\\frac{${th}}{360} = ${fracTex(th, 360)}`)} of the circle.`,
          ask === 'arc' ? `The whole circumference is ${M(`2\\pi(${r}) = ${whole}\\pi`)}.` : `The whole area is ${M(`\\pi(${r})^{2} = ${whole}\\pi`)}.`,
          `Take ${M(fracTex(th, 360))} of ${M(`${whole}\\pi`)}: multiply ${whole} by ${fn} and divide by ${fd}.`],
        `${M(`${fracTex(th, 360)} \\times ${whole}\\pi`)} ${M('=')} ${cor}`,
        `Pattern: "arc / sector." Fraction of the circle = angle ÷ 360, times the circumference (arc) or the area (sector).`),
    };
  });

  def({ id: 'polygon-angles', area: A, topic: 'Polygons', format: 'ne', diff: 'medium' }, () => {
    const n = pick([5, 6, 8, 9, 10, 12, 15, 18, 20]); const ask = pick(['sum', 'each', 'ext', 'sides']);
    const ext = 360 / n, each = 180 - ext;
    const method = `Two facts do everything: the interior angles of an ${M('n')}-sided polygon add to ${M('(n - 2) \\times 180')} (it splits into ${M('n - 2')} triangles), and the exterior angles of any convex polygon add to 360°. For a regular polygon, each exterior angle is ${M('\\frac{360}{n}')} and each interior angle is 180 minus that.`;
    if (ask === 'sum') return { stem: `What is the sum, in degrees, of the interior angles of a polygon with ${n} sides?`, answer: num((n - 2) * 180),
      ...EX(`The polygon isn't drawn and no individual angles are given.`, method, [`Drawing diagonals from one vertex splits a ${n}-sided polygon into ${n} − 2 = ${n - 2} triangles, and each triangle contributes 180°.`], `${M(`${n - 2} \\times 180 = ${tn((n - 2) * 180)}`)}`, `Pattern: "interior angle sum." ${M('(n - 2) \\times 180')}.`) };
    if (ask === 'each') return { stem: `What is the measure, in degrees, of each interior angle of a regular polygon with ${n} sides?`, answer: num(each),
      ...EX(`The interior-angle formula ${M('\\frac{(n-2)180}{n}')} works but involves a large multiplication and division.`, method, [`The exterior angles add to 360°, and in a regular polygon all ${n} are equal, so each is 360 ÷ ${n} = ${fmt(ext)}°.`, `An interior angle and its exterior angle form a straight line, so they add to 180°.`], `${M(`180 - ${fmt(ext)} = ${fmt(each)}`)}`, `Pattern: "regular polygon angle." Go through the exterior angle: 360 ÷ n, then 180 minus that.`) };
    if (ask === 'ext') return { stem: `Each exterior angle of a regular polygon measures ${fmt(ext)}°. How many sides does the polygon have?`, answer: num(n),
      ...EX(`We have to work backwards from an angle to a number of sides.`, method, [`All the exterior angles are equal and add to 360°, so the number of them (which equals the number of sides) is 360 divided by one angle.`], `${M(`360 \\div ${fmt(ext)} = ${n}`)}`, `Pattern: "sides from an exterior angle." n = 360 ÷ exterior angle.`) };
    return { stem: `Each interior angle of a regular polygon measures ${fmt(each)}°. How many sides does the polygon have?`, answer: num(n),
      ...EX(`Solving ${M(`\\frac{(n-2)180}{n} = ${fmt(each)}`)} for ${M('n')} takes several algebra steps.`, method, [`Each exterior angle is 180 − ${fmt(each)} = ${fmt(ext)}°, since interior and exterior angles form a straight line.`, `The exterior angles add to 360°, so the number of sides is 360 ÷ ${fmt(ext)}.`], `${M(`360 \\div ${fmt(ext)} = ${n}`)}`, `Pattern: "sides from an interior angle." Convert to the exterior angle first.`) };
  });

  def({ id: 'parallel-lines', area: A, topic: 'Lines & angles', format: 'ne', diff: 'medium' }, () => {
    const acute = ri(35, 80); const obt = 180 - acute;
    const kind = pick(['corr', 'alt', 'same']);
    const off = { TR: [10, -8], TL: [-44, -8], BL: [-44, 20], BR: [10, 20] };
    let posU, posL, vU, vL;
    if (kind === 'corr') { const q = pick(['TR', 'TL']); posU = q; posL = q; vU = vL = q === 'TR' ? acute : obt; }
    else if (kind === 'alt') { posU = 'BL'; posL = 'TR'; vU = vL = acute; }
    else { posU = 'BR'; posL = 'TR'; vU = obt; vL = acute; }
    let x, p, r, q, s; let tries = 0;
    do { x = ri(8, 30); p = ri(2, 6); r = ri(1, 5); q = vU - p * x; s = vL - r * x; tries++; } while ((p === r || Math.abs(q) > 60 || Math.abs(s) > 90 || q === 0 || s === 0) && tries < 60);
    if (tries >= 60) return null;
    const e1 = `(${p}x ${sgn(q)})°`, e2 = `(${r === 1 ? '' : r}x ${sgn(s)})°`;
    const lab = (cx, cy, pos, t) => txt(cx + off[pos][0], cy + off[pos][1], t, 'font-size="12"');
    const fig = svg(300, 180, `<line x1="10" y1="50" x2="290" y2="50" stroke="currentColor" stroke-width="2"/><line x1="10" y1="140" x2="290" y2="140" stroke="currentColor" stroke-width="2"/><line x1="44" y1="185" x2="236" y2="5" stroke="currentColor" stroke-width="2"/>${txt(272, 44, 'ℓ')}${txt(272, 134, 'm')}${lab(188, 50, posU, e1)}${lab(92, 140, posL, e2)}`);
    const ask = pick(['x', 'angle']);
    const why = kind === 'same' ? 'They are on the same side of the transversal and both between the parallel lines (same-side interior angles), so they add to 180°.' : kind === 'alt' ? 'They are between the parallel lines and on opposite sides of the transversal (alternate interior angles), so they are equal.' : 'They are in the same position at each intersection (corresponding angles), so they are equal.';
    const eq = kind === 'same' ? `(${p}x ${sgn(q)}) + (${r}x ${sgn(s)}) = 180` : `${p}x ${sgn(q)} = ${r}x ${sgn(s)}`;
    const solve = kind === 'same' ? `Combine like terms: ${M(`${p + r}x ${sgn(q + s)} = 180`)}, so ${M(`${p + r}x = ${180 - q - s}`)}, and ${M('x')} is ${180 - q - s} ÷ ${p + r} = ${x}.` : `Collect ${M('x')} on one side and numbers on the other: ${M(`${p - r}x = ${s - q}`)}, so ${M('x')} is ${s - q} ÷ ${p - r} = ${x}.`;
    return {
      stem: `In the figure, lines ${M('\\ell')} and ${M('m')} are parallel. What is the value of ${ask === 'x' ? M('x') : `the angle marked ${M(e1.replace('°', '^{\\circ}'))}, in degrees`}? <i>(Figure not drawn to scale.)</i>`,
      figure: fig,
      answer: num(ask === 'x' ? x : vU),
      ...EX(`The two labeled angles are at different intersections, so we need a rule linking them before we can write an equation.`,
        `When a transversal crosses two parallel lines, it creates only two angle sizes: every acute angle equals every other acute angle, every obtuse angle equals every other obtuse one, and an acute and an obtuse angle add to 180°. So decide whether the two marked angles are the same type (equal) or different types (supplementary).`,
        [why, `That gives the equation ${M(eq)}.`, solve, ...(ask === 'angle' ? [`The question asks for the angle itself, so substitute ${M(`x = ${x}`)} back into ${M(e1)}: ${p} × ${x} = ${p * x}.`] : [])],
        ask === 'angle' ? `${M(`${p * x} ${sgn(q)} = ${vU}`)}` : `${M(`x = ${x}`)}`,
        `Pattern: "parallel lines and a transversal." Same-type angles are equal, different types add to 180 — set up one equation.`),
    };
  });

  def({ id: 'similar-tri', area: A, topic: 'Similar figures', format: 'ne', diff: 'medium' }, () => {
    const k1 = ri(1, 4), k2 = k1 + ri(1, 3); const t = pick(['area', 'side']);
    if (t === 'area') {
      const a1 = k1 * k1 * ri(2, 6);
      if ((a1 * k2 * k2) % (k1 * k1)) return null;
      const a2 = (a1 * k2 * k2) / (k1 * k1);
      return {
        stem: `Triangles ${M('ABC')} and ${M('DEF')} are similar, and the ratio of their corresponding sides is ${k1} to ${k2}. If the area of triangle ${M('ABC')} is ${a1}, what is the area of triangle ${M('DEF')}?`,
        answer: num(a2),
        ...EX(`It's tempting to scale the area by the same ratio as the sides, but area is two-dimensional.`,
          `If lengths are scaled by a factor ${M('k')}, areas are scaled by ${M('k^{2}')} (both the base and the height get multiplied by ${M('k')}), and volumes by ${M('k^{3}')}.`,
          [`Sides are in ratio ${k1} : ${k2}, so areas are in ratio ${k1}² : ${k2}² = ${k1 * k1} : ${k2 * k2}.`, `So the larger area is ${a1} × ${M(`\\frac{${k2 * k2}}{${k1 * k1}}`)}; ${a1} × ${k2 * k2} = ${a1 * k2 * k2}.`],
          `${M(`\\frac{${a1 * k2 * k2}}{${k1 * k1}} = ${a2}`)}`,
          `Pattern: "similar figures and area." Square the side ratio.`),
      };
    }
    const s1 = ri(2, 9) * k1, s2 = ri(2, 9) * k1; const S1 = (s1 / k1) * k2, S2 = (s2 / k1) * k2;
    return {
      stem: `Triangle ${M('PQR')} is similar to triangle ${M('XYZ')}, with ${M('P')}, ${M('Q')}, ${M('R')} corresponding to ${M('X')}, ${M('Y')}, ${M('Z')}. If ${M(`PQ = ${s1}`)}, ${M(`QR = ${s2}`)}, and ${M(`XY = ${S1}`)}, what is ${M('YZ')}?`,
      answer: num(S2),
      ...EX(`We need a side of the second triangle, but we only know one of its sides.`,
        `Similar triangles have all corresponding sides in the same ratio (the scale factor). Find the factor from one matched pair, then multiply.`,
        [`${M('PQ')} matches ${M('XY')} (same letter positions), so the scale factor is ${M(`\\frac{XY}{PQ} = \\frac{${S1}}{${s1}} = ${fracTex(S1, s1)}`)}.`, `${M('YZ')} matches ${M('QR')}, which is ${s2}, so multiply ${s2} by ${M(fracTex(S1, s1))}.`],
        `${M(`${s2} \\times ${fracTex(S1, s1)} = ${S2}`)}`,
        `Pattern: "similar triangles." Match vertices, find one scale factor, apply it.`),
    };
  });

  def({ id: 'rectangle', area: A, topic: 'Area & perimeter', format: 'ne', diff: 'easy' }, () => {
    const w = ri(2, 15), m = pick([2, 3, 4]); const P = 2 * (w + m * w);
    const word = m === 2 ? 'twice' : m === 3 ? 'three times' : 'four times';
    return {
      stem: `The length of a rectangle is ${word} its width, and its perimeter is ${P}. What is the area of the rectangle?`,
      answer: num(w * m * w),
      ...EX(`Area needs both length and width, and neither is given directly.`,
        `When one dimension is described in terms of the other, use a single variable for the smaller one. Write the perimeter (2 × length + 2 × width) in that variable, solve, then compute.`,
        [`Let the width be ${M('w')}; the length is ${word} that, ${M(m + 'w')}.`, `Perimeter = ${M(`2(w + ${m}w) = ${2 * (m + 1)}w`)}, and it equals ${P}, so ${M('w')} = ${P} ÷ ${2 * (m + 1)} = ${w}.`, `Then the length is ${m} × ${w} = ${m * w}.`],
        `${M(`${w} \\times ${m * w} = ${w * m * w}`)}`,
        `Pattern: "one side described by the other." One variable, perimeter equation, then area.`),
    };
  });

  def({ id: 'box-cube', area: A, topic: '3-D figures', format: 'ne', diff: 'medium' }, () => {
    const t = pick(['cubeSA', 'cubeV', 'diag', 'fill']);
    if (t === 'cubeSA') { const s = ri(2, 10); return { stem: `The total surface area of a cube is ${6 * s * s} square centimeters. What is the volume of the cube, in cubic centimeters?`, answer: num(s ** 3),
      ...EX(`Volume needs the edge length, and we're given surface area instead.`, `A cube has 6 identical square faces. So surface area = 6 × edge², which lets you recover the edge; then volume = edge³.`,
        [`Divide the surface area among the 6 faces: ${6 * s * s} ÷ 6 = ${s * s} per face.`, `Each face is a square of area ${s * s}, so the edge is ${M(`\\sqrt{${s * s}} = ${s}`)}.`, `Volume is the edge multiplied by itself 3 times (length × width × height, all equal).`], `${M(`${s}^{3} = ${s ** 3}`)}`, `Pattern: "cube, surface area to volume." ÷ 6, square root, cube.`) }; }
    if (t === 'cubeV') { const s = ri(2, 9); return { stem: `A cube has volume ${s ** 3}. What is its total surface area?`, answer: num(6 * s * s),
      ...EX(`Surface area needs the edge length, and we're given volume instead.`, `Volume = edge³, so take the cube root to get the edge; surface area = 6 faces × edge².`,
        [`${s ** 3} = ${s} × ${s} × ${s}, so the edge is ${s}.`, `Each face has area ${s}² = ${s * s}, and there are 6 faces.`], `${M(`6 \\times ${s * s} = ${6 * s * s}`)}`, `Pattern: "cube, volume to surface area." Cube root, square, × 6. Knowing cubes up to 10³ helps.`) }; }
    if (t === 'diag') {
      const [a, b, c, d] = pick([[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [4, 4, 7, 9], [2, 10, 11, 15], [6, 6, 7, 11]]); const k = pick([1, 2, 3]);
      const A2 = (a * k) ** 2, B2 = (b * k) ** 2, C2 = (c * k) ** 2;
      return { stem: `A rectangular box has dimensions ${a * k} by ${b * k} by ${c * k}. What is the length of the longest line segment that can be drawn inside the box (the space diagonal)?`, answer: num(d * k),
        ...EX(`The longest segment runs corner to corner through the inside of the box, which isn't along any face.`, `The space diagonal of a box with edges ${M('l, w, h')} is ${M('\\sqrt{l^{2} + w^{2} + h^{2}}')} — the Pythagorean theorem applied twice (once across the bottom face, once up to the opposite corner).`,
          [`Square each edge: ${a * k}² = ${A2}, ${b * k}² = ${B2}, ${c * k}² = ${C2}.`, `Their sum is ${A2 + B2 + C2}, which is the perfect square ${d * k}².`], `${M(`\\sqrt{${A2} + ${B2} + ${C2}} = \\sqrt{${A2 + B2 + C2}} = ${d * k}`)}`, `Pattern: "space diagonal." ${M('\\sqrt{l^{2} + w^{2} + h^{2}}')} in one step.`) };
    }
    const l = ri(2, 6) * 2, w = ri(2, 5), h = ri(2, 6); const c = pick([1, 2]);
    const n = (l / c) * w * h;
    return { stem: `How many cubes with edge length ${c} can fit exactly inside a rectangular box that measures ${l} by ${w * c} by ${h * c}?`, answer: num(n),
      ...EX(`Dividing volumes works only if the cubes line up perfectly, so it's safer to count along each edge.`, `Count how many cubes fit along each edge (edge ÷ cube size), then multiply the three counts.`,
        [`Along the ${l} edge: ${l} ÷ ${c} = ${l / c} cubes.`, `Along the ${w * c} edge: ${w * c} ÷ ${c} = ${w}.`, `Along the ${h * c} edge: ${h * c} ÷ ${c} = ${h}.`], `${M(`${l / c} \\times ${w} \\times ${h} = ${n}`)}`, `Pattern: "cubes in a box." Divide each edge, multiply.`) };
  });

  def({ id: 'cylinder', area: A, topic: '3-D figures', format: 'mc', diff: 'medium' }, () => {
    const r = ri(2, 8), h = ri(3, 12); const t = pick(['V', 'scale']);
    const P = (k) => M(`${k === 1 ? '' : k}\\pi`);
    if (t === 'V') return {
      stem: `A right circular cylinder has a radius of ${r} and a height of ${h}. What is its volume?`,
      ...mc(P(r * r * h), [P(2 * r * h), P(r * h), P(2 * r * r * h), P(r * r * h * 2 + 1), P(4 * r * r * h), P(r * h * h), P(r * r * h + r)]),
      ...EX(`Several cylinder formulas look alike (volume, side area, surface area); picking the wrong one is the main risk.`, `The volume of any prism-like solid is (area of the base) × (height). A cylinder's base is a circle of area ${M('\\pi r^{2}')}, so ${M('V = \\pi r^{2}h')}.`,
        [`Base area: ${M(`\\pi (${r})^{2} = ${r * r}\\pi`)}.`, `Multiply by the height ${h}: ${r * r} × ${h} = ${r * r * h}.`], `${M(`${r * r}\\pi \\times ${h} = ${r * r * h}\\pi`)}`, `Pattern: "cylinder volume." Base area × height; ${M('2\\pi rh')} is the side area, not the volume.`),
    };
    const f = pick([2, 3]); const g = pick([2, 3]);
    return {
      stem: `The radius of a cylinder is multiplied by ${f} and its height is multiplied by ${g}. The volume of the new cylinder is how many times the volume of the original?`,
      ...mcNum(f * f * g, [f * g, f + g, f * f + g, f * g * g, 2 * f * g]),
      ...EX(`No actual dimensions are given, so we can't compute either volume.`, `In ${M('V = \\pi r^{2}h')}, the radius appears squared and the height once. So scaling the radius by ${M('a')} and the height by ${M('b')} scales the volume by ${M('a^{2} \\times b')}.`,
        [`The radius is multiplied by ${f}, and it's squared in the formula, so that contributes ${f}² = ${f * f}.`, `The height is multiplied by ${g}, contributing ${g}.`], `${M(`${f * f} \\times ${g} = ${f * f * g}`)}`, `Pattern: "scaling a formula." Each factor is raised to the power its variable has in the formula.`),
    };
  });

  def({ id: 'tri-inequality', area: A, topic: 'Triangles', format: 'ma', diff: 'medium' }, () => {
    const a = ri(3, 12), b = ri(3, 12); const lo = Math.abs(a - b), hi = a + b;
    const vs = [...new Set([lo, hi, lo + 1, hi - 1, Math.floor((lo + hi) / 2), hi + 1, Math.max(1, lo - 1)])].filter((v) => v > 0).sort((x, y) => x - y).slice(0, 7);
    return {
      stem: `Two sides of a triangle have lengths ${a} and ${b}. Which of the following could be the length of the third side? Indicate <b>all</b> such lengths.`,
      ...ma(vs.map((v) => ({ text: M(v), ok: v > lo && v < hi }))),
      ...EX(`Any positive length might seem possible, but some lengths can't close a triangle.`, `Triangle inequality: each side must be shorter than the sum of the other two. For the unknown side this gives one range: it must be more than the difference of the known sides and less than their sum.`,
        [`Upper limit: if the third side were ${a} + ${b} = ${hi} or longer, the other two sides couldn't reach across it.`, `Lower limit: if it were ${Math.max(a, b)} − ${Math.min(a, b)} = ${lo} or shorter, the two shorter sides together couldn't reach the length ${Math.max(a, b)}.`, `The endpoints themselves are excluded (they'd give a flat, degenerate triangle).`],
        `${M(`${lo} < s < ${hi}`)} — keep the choices strictly inside.`, `Pattern: "possible third side." Between the difference and the sum, exclusive.`),
    };
  });

  def({ id: 'inscribed', area: A, topic: 'Circles', format: 'mc', diff: 'hard' }, () => {
    const t = pick(['sqInCircle', 'circleInSq', 'ratio']); const r = ri(2, 9);
    if (t === 'sqInCircle') return {
      stem: `A square is inscribed in a circle of radius ${r}. What is the area of the square?`,
      ...mc(M(`${2 * r * r}`), [M(`${4 * r * r}`), M(`${r * r}`), M(`${r * r}\\pi`), M(`${2 * r}\\sqrt{2}`), M(`${r * r}\\sqrt{2}`)]),
      ...EX(`The circle and square share no obvious length until you see how they touch.`, `When a square is inscribed in a circle, its corners are on the circle, so its diagonal is a diameter. Then use area of a square ${M('= \\frac{d^{2}}{2}')} (from the 45-45-90 ratio).`,
        [`The diameter is 2 × ${r} = ${2 * r}, and that's the square's diagonal.`, `Squaring the diagonal: ${2 * r}² = ${4 * r * r}.`], `${M(`\\frac{${4 * r * r}}{2} = ${2 * r * r}`)}`, `Pattern: "square in a circle." Diagonal = diameter; area = d² ÷ 2.`),
    };
    if (t === 'circleInSq') return {
      stem: `A circle is inscribed in a square with sides of length ${2 * r}. What is the area of the region inside the square but outside the circle?`,
      ...mc(M(`${4 * r * r} - ${r * r}\\pi`), [M(`${4 * r * r} - ${4 * r * r}\\pi`), M(`${r * r}\\pi - ${2 * r * r}`), M(`${4 * r * r} - ${2 * r}\\pi`), M(`${2 * r * r} - ${r * r}\\pi`), M(`${4 * r * r} - ${2 * r * r}\\pi`), M(`${4 * r * r}\\pi - ${4 * r * r}`), M(`${8 * r * r} - ${r * r}\\pi`)]),
      ...EX(`The leftover corner region has no formula of its own.`, `Shaded area = (big shape) − (small shape). For a circle inscribed in a square, the circle touches all four sides, so its diameter equals the side.`,
        [`The side is ${2 * r}, so the circle's diameter is ${2 * r} and its radius is ${r}.`, `Square area: ${2 * r}² = ${4 * r * r}. Circle area: ${M(`\\pi(${r})^{2} = ${r * r}\\pi`)}.`], `${M(`${4 * r * r} - ${r * r}\\pi`)}`, `Pattern: "shaded region." Big area minus small area; leave ${M('\\pi')} in the answer.`),
    };
    return {
      stem: `A circle is inscribed in a square. What is the ratio of the area of the circle to the area of the square?`,
      ...mc(M('\\frac{\\pi}{4}'), [M('\\frac{\\pi}{2}'), M('\\frac{1}{4}'), M('\\frac{4}{\\pi}'), M('\\frac{\\pi}{8}'), M('\\frac{2}{\\pi}')]),
      ...EX(`No measurements are given at all.`, `When a ratio is asked and no numbers are given, the answer is the same for every size, so pick the easiest size.`,
        [`Choose radius 1. The circle's area is ${M('\\pi(1)^{2} = \\pi')}.`, `The circle touches all four sides, so the square's side equals the diameter, 2, and its area is 2² = 4.`], `${M('\\frac{\\pi}{4}')}`, `Pattern: "ratio with no numbers." Pick convenient values (r = 1).`),
    };
  }, 10);

  def({ id: 'geo-qc-area', area: A, topic: 'Area & perimeter', format: 'qc', diff: 'medium' }, () => {
    const t = pick(['circsq', 'triMax']);
    if (t === 'circsq') {
      const r = ri(2, 10), s = ri(3, 18); const ca = Math.PI * r * r, sa = s * s;
      if (Math.abs(ca - sa) < 2) return null;
      const est = fmt(Math.round(r * r * 3.14 * 10) / 10);
      return {
        stem: `A circle has radius ${r}. A square has side ${s}.`,
        ...qc('The area of the circle', 'The area of the square', cmp(ca, sa)),
        ...EX(`One area involves ${M('\\pi')}, the other doesn't, so they can't be compared symbolically.`, `Compute both, using ${M('\\pi \\approx 3.14')} (or the bounds 3 < ${M('\\pi')} < 3.2 when that's enough).`,
          [`Circle: ${M(`\\pi (${r})^{2} = ${r * r}\\pi`)}. With ${M('\\pi \\approx 3.14')}, that's ${r * r} × 3.14 ≈ ${est}.`, `Square: ${s}² = ${sa}.`], `${M(`${r * r}\\pi \\approx ${est}`)} vs ${M(sa)}.`, `Pattern: "π vs a whole number in QC." Approximate π; exact values aren't needed.`),
      };
    }
    const a = ri(3, 12), b = ri(3, 12); const max = (a * b) / 2; const bq = pick([max, max + ri(1, 5), max - ri(1, 3)]);
    const rel = bq > max ? 'B' : 'D';
    return {
      stem: `Two sides of a triangle have lengths ${a} and ${b}.`,
      ...qc('The area of the triangle', M(fmt(bq)), rel),
      ...EX(`We don't know the angle between the two sides, and the area depends on it.`, `Imagine hinging the two sides: when they're perpendicular the height is as large as possible, so the area is at its maximum, ½ × (one side) × (the other); as the angle closes or opens, the area shrinks toward 0. So the area can be anything from just above 0 up to that maximum.`,
        [`Maximum area: ${M(`\\frac{1}{2} \\times ${a} \\times ${b} = ${fmt(max)}`)}.`, bq > max ? `Quantity B is ${fmt(bq)}, which is above the maximum, so the triangle's area is always smaller.` : `Quantity B is ${fmt(bq)}, which is within the possible range (0 up to ${fmt(max)}), so the area could be smaller, equal, or larger.`],
        `Range of A: ${M(`0 < \\text{area} \\le ${fmt(max)}`)}; B ${M('= ' + fmt(bq))} → ${rel === 'B' ? 'B is greater' : 'cannot be determined'}.`,
        `Pattern: "triangle with two sides known." Area ranges from 0 to ½ab — don't assume it's a right triangle.`),
    };
  });

  def({ id: 'trapezoid', area: A, topic: 'Quadrilaterals', format: 'ne', diff: 'easy' }, () => {
    const b1 = ri(3, 15), b2 = b1 + ri(2, 12), h = ri(2, 12); if ((b1 + b2) * h % 2) return null;
    const avg = (b1 + b2) / 2;
    return {
      stem: `A trapezoid has parallel sides of lengths ${b1} and ${b2} and a height of ${h}. What is its area?`,
      answer: num(((b1 + b2) * h) / 2),
      ...EX(`A trapezoid isn't a rectangle, so base × height doesn't apply directly.`, `A trapezoid's area equals that of a rectangle whose width is the average of the two parallel sides: area = (average of the bases) × height.`,
        [`The average of the parallel sides is (${b1} + ${b2}) ÷ 2 = ${fmt(avg)}.`, `Multiply by the height ${h}.`], `${M(`${fmt(avg)} \\times ${h} = ${((b1 + b2) * h) / 2}`)}`, `Pattern: "trapezoid area." Average base × height.`),
    };
  });

  def({ id: 'angle-ratio', area: A, topic: 'Triangles', format: 'ne', diff: 'easy' }, () => {
    let a, b, c; do { a = ri(1, 6); b = ri(1, 7); c = ri(2, 9); } while (180 % (a + b + c) !== 0 || (a === b && b === c));
    const u = 180 / (a + b + c); const ask = pick(['largest', 'smallest']); const part = ask === 'largest' ? Math.max(a, b, c) : Math.min(a, b, c);
    return {
      stem: `The measures of the three angles of a triangle are in the ratio ${a} : ${b} : ${c}. What is the measure, in degrees, of the ${ask} angle?`,
      answer: num(u * part),
      ...EX(`A ratio tells us relative sizes, not actual degrees.`, `Ratio + total = parts: add the ratio numbers to get the number of equal parts, divide the total by that to get one part, then multiply.`,
        [`The angles of a triangle total 180°. The ratio has ${a} + ${b} + ${c} = ${a + b + c} parts.`, `One part is 180 ÷ ${a + b + c} = ${u}°.`, `The ${ask} angle has ${part} part${part > 1 ? 's' : ''}.`], `${M(`${part} \\times ${u} = ${u * part}`)}`, `Pattern: "ratio with a known total." Total ÷ sum of parts = one part.`),
    };
  });

  def({ id: 'quad-parallelogram', area: A, topic: 'Quadrilaterals', format: 'ne', diff: 'easy' }, () => {
    const a = ri(40, 85); const ask = pick(['opp', 'adj']);
    return {
      stem: `In parallelogram ${M('ABCD')}, angle ${M('A')} measures ${a}°. What is the measure, in degrees, of angle ${M(ask === 'opp' ? 'C' : 'B')}?`,
      answer: num(ask === 'opp' ? a : 180 - a),
      ...EX(`Only one angle is given.`, `A parallelogram has only two angle sizes: opposite angles are equal, and neighboring angles add to 180° (they're same-side interior angles between parallel sides).`,
        ask === 'opp' ? [`In ${M('ABCD')}, angle ${M('C')} is opposite angle ${M('A')}, so it is equal to it.`] : [`Angle ${M('B')} is next to angle ${M('A')} (they share side ${M('AB')}), so the two add to 180°.`],
        ask === 'opp' ? `${M(`\\angle C = ${a}`)}` : `${M(`\\angle B = 180 - ${a} = ${180 - a}`)}`,
        `Pattern: "parallelogram angles." Opposite equal, neighbors supplementary.`),
    };
  }, 8);
};
