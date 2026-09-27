// Extra Quantitative Comparison and multiple-answer patterns, so the format mix
// matches the real test (QC is roughly a third of GRE Quant).
const L = require('./lib');
const { ri, pick, shuffle, sample, gcd, lcm, M, F, fracTex, tn, fmt, num, frac, mc, mcNum, ma, qc, cmp, clean, poly, sgn } = L;
const C = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return Math.round(r); };

module.exports = function (def) {
  // ================= ARITHMETIC =================
  def({ id: 'qc-rem', area: 'Arithmetic', topic: 'Remainders', format: 'qc', diff: 'medium' }, () => {
    const [big, small] = pick([[6, 3], [8, 4], [10, 5], [12, 4], [12, 6], [9, 3], [15, 5], [14, 7], [20, 4]]);
    const r = ri(1, big - 1); const rs = r % small; const bq = pick([rs, rs + 1, Math.max(0, rs - 1)]);
    return {
      stem: `When the positive integer ${M('n')} is divided by ${big}, the remainder is ${r}.`,
      ...qc(`The remainder when ${M('n')} is divided by ${small}`, M(bq), cmp(rs, bq)),
      fast: [`Take the smallest case ${M(`n = ${r}`)} (and check ${M(`n = ${r + big}`)}: same result, since ${small} divides ${big}).`, `${M(`${r} \\div ${small}`)} leaves remainder ${M(rs)}.`],
      why: `Because ${small} divides ${big}, the remainder mod ${small} is fixed — one small example decides it.`,
    };
  });

  def({ id: 'qc-pct-swap', area: 'Arithmetic', topic: 'Percent', format: 'qc', diff: 'easy' }, () => {
    const x = ri(2, 20) * 5, y = ri(2, 30) * 5; const t = pick(['swap', 'swap', 'near']);
    if (t === 'swap') return { stem: `Compare the two quantities.`, ...qc(`${x}% of ${y}`, `${y}% of ${x}`, 'C'), fast: [`${M(`\\frac{${x}}{100} \\times ${y} = \\frac{${x} \\times ${y}}{100} = \\frac{${y}}{100} \\times ${x}`)}.`, `Multiplication is commutative → equal.`], why: `Spot the swap — no arithmetic needed.` };
    const y2 = y + 5; return { stem: `Compare the two quantities.`, ...qc(`${x}% of ${y2}`, `${y2}% of ${x}`, 'C'), fast: [`${M('a\\% \\text{ of } b = b\\% \\text{ of } a')} always.`], why: `Recognize ${M('\\frac{ab}{100}')} on both sides.` };
  });

  def({ id: 'qc-up-down', area: 'Arithmetic', topic: 'Percent change', format: 'qc', diff: 'medium' }, () => {
    const p = pick([10, 20, 25, 30, 40, 50]); const P = ri(2, 30) * 10; const order = pick(['up', 'down']);
    const final = P * (1 + p / 100) * (1 - p / 100);
    return {
      stem: `The price of a lamp was ${P} dollars. It was ${order === 'up' ? `increased by ${p}% and then decreased by ${p}%` : `decreased by ${p}% and then increased by ${p}%`}.`,
      ...qc('The final price, in dollars', M(P), 'B'),
      fast: [`Multipliers: ${M(`(1 + ${clean(p / 100)})(1 - ${clean(p / 100)}) = 1 - ${clean((p / 100) ** 2)} = ${clean(1 - (p / 100) ** 2)}`)}.`, `Final ${M(`= ${fmt(final)} < ${P}`)}.`],
      why: `Equal up-and-down percents always produce a net loss of ${M('(p/100)^{2}')} — recognize it instantly.`,
    };
  });

  def({ id: 'qc-fraction-ops', area: 'Arithmetic', topic: 'Fractions & decimals', format: 'qc', diff: 'medium' }, () => {
    const a = ri(2, 9), b = a + ri(1, 5); const t = pick(['recip', 'addone', 'square']);
    if (t === 'recip') return { stem: `Compare the two quantities.`, ...qc(M(`\\frac{1}{${fracTex(a, b)}}`), M(`${fracTex(a, b)} + 1`), cmp(b / a, a / b + 1)), fast: [`${M(`\\frac{1}{${fracTex(a, b)}} = ${fracTex(b, a)} = ${fmt(Math.round((b / a) * 1000) / 1000)}`)}.`, `${M(`${fracTex(a, b)} + 1 = ${fracTex(a + b, b)} = ${fmt(Math.round(((a + b) / b) * 1000) / 1000)}`)}.`], why: `Convert both to simple fractions and compare with cross-multiplication or a quick decimal.` };
    if (t === 'addone') return { stem: `Compare the two quantities.`, ...qc(F(a, b), F(a + 1, b + 1), 'B'), fast: [`For a positive fraction less than 1, adding 1 to top and bottom moves it toward 1 → larger.`, `Check: ${M(`${a}(${b + 1}) = ${a * (b + 1)}`)} vs ${M(`${a + 1}(${b}) = ${(a + 1) * b}`)}.`], why: `Knowing the "toward 1" rule settles it immediately.` };
    return { stem: `Compare the two quantities.`, ...qc(M(`\\left(${fracTex(a, b)}\\right)^{2}`), F(a, b), 'B'), fast: [`Squaring a number between 0 and 1 makes it smaller.`], why: `No need to compute ${M(`\\frac{${a * a}}{${b * b}}`)}.` };
  });

  def({ id: 'ma-divisors', area: 'Arithmetic', topic: 'Divisibility', format: 'ma', diff: 'medium' }, () => {
    const [a, b] = pick([[12, 15], [6, 10], [8, 12], [9, 12], [10, 14], [6, 15], [4, 18], [14, 21], [12, 18]]);
    const l = lcm(a, b); const cands = shuffle([...new Set([l, l / 2, a * b, a + b, l / 3, 2 * l, b / gcd(a, b) * 2, 5, 7, 9, 8, 16, 45, 20, 24, 36, 30, 18, 10])].filter((x) => Number.isInteger(x) && x > 1)).slice(0, 6).sort((x, y) => x - y);
    const items = cands.map((c) => ({ text: M(c), ok: l % c === 0 }));
    if (!items.some((i) => i.ok) || items.every((i) => i.ok)) return null;
    return {
      stem: `If the positive integer ${M('n')} is divisible by both ${a} and ${b}, which of the following must be a divisor of ${M('n')}? Indicate <b>all</b> such numbers.`,
      ...ma(items),
      fast: [`${M('n')} must be a multiple of ${M(`\\text{lcm}(${a}, ${b}) = ${l}`)} — and could be exactly ${l}.`, `So the "must" divisors are exactly the divisors of ${l}.`],
      why: `Testing the smallest possible ${M('n')} (the LCM) answers every "must be" choice at once. Note ${M(`${a} \\times ${b} = ${a * b}`)} need not divide ${M('n')}.`,
    };
  });

  def({ id: 'ma-factors', area: 'Arithmetic', topic: 'Factors & primes', format: 'ma', diff: 'medium' }, () => {
    const e2 = ri(1, 4), e3 = ri(0, 2), e5 = ri(0, 2), e7 = ri(0, 1);
    const N = 2 ** e2 * 3 ** e3 * 5 ** e5 * 7 ** e7; const fac = [[2, e2], [3, e3], [5, e5], [7, e7]].filter((x) => x[1]).map(([p, e]) => (e > 1 ? `${p}^{${e}}` : p)).join(' \\cdot ');
    const cands = shuffle([4, 6, 8, 9, 10, 12, 14, 15, 18, 20, 21, 25, 27, 30, 35, 16, 45]).slice(0, 6).sort((a, b) => a - b);
    const items = cands.map((c) => ({ text: M(c), ok: N % c === 0 }));
    if (!items.some((i) => i.ok) || items.every((i) => i.ok)) return null;
    return {
      stem: `${M(`k = ${fac}`)}. Which of the following are factors of ${M('k')}? Indicate <b>all</b> such numbers.`,
      ...ma(items),
      fast: [`A number divides ${M('k')} only if its prime factors fit inside ${M(fac)}.`, cands.map((c) => `${c}${N % c === 0 ? ' ✓' : ' ✗'}`).join(', ') + '.'],
      why: `Compare prime factorizations instead of multiplying ${M('k')} out and dividing.`,
    };
  });

  // ================= ALGEBRA =================
  def({ id: 'qc-system', area: 'Algebra', topic: 'Simultaneous equations', format: 'qc', diff: 'easy' }, () => {
    const x = ri(-8, 12), y = ri(-8, 12);
    return {
      stem: `${M(`x + y = ${x + y}`)}<br>${M(`x - y = ${x - y}`)}`,
      ...qc(M('x'), M('y'), cmp(x, y)),
      fast: [`${M('x - y')} is ${x - y > 0 ? 'positive' : x - y < 0 ? 'negative' : 'zero'}, so ${x - y > 0 ? M('x > y') : x - y < 0 ? M('x < y') : M('x = y')}.`],
      why: `You never need to solve: the sign of ${M('x - y')} answers the comparison.`,
    };
  });

  def({ id: 'qc-quadratic', area: 'Algebra', topic: 'Quadratic equations', format: 'qc', diff: 'medium' }, () => {
    let p, q; do { p = ri(-6, 8); q = ri(-6, 8); } while (p === q);
    const bq = pick([Math.min(p, q) - 1, Math.max(p, q) + 1, Math.floor((p + q) / 2), 0]);
    const rel = Math.min(p, q) > bq ? 'A' : Math.max(p, q) < bq ? 'B' : (p === bq && q === bq) ? 'C' : 'D';
    return {
      stem: `${M(poly([1, -(p + q), p * q]) + ' = 0')}`,
      ...qc(M('x'), M(bq), rel),
      fast: [`Factor: ${M(`(x ${sgn(-p)})(x ${sgn(-q)}) = 0`)} → ${M(`x = ${p}`)} or ${M(`x = ${q}`)}.`, rel === 'D' ? `One root is on each side of (or at) ${bq} → cannot be determined.` : `Both roots are ${rel === 'A' ? 'greater' : 'less'} than ${bq} → ${rel}.`],
      why: `With two possible values of ${M('x')}, always check both against Quantity B — this is where "D" hides.`,
    };
  });

  def({ id: 'qc-exp-rules', area: 'Algebra', topic: 'Operations with exponents', format: 'qc', diff: 'medium' }, () => {
    const a = ri(2, 5), b = ri(2, 5); const t = pick(['powpow', 'prod', 'neg']);
    if (t === 'powpow') { const e = pick([a * b, a + b, a * b + 1]); return { stem: `${M('x > 1')}`, ...qc(M(`(x^{${a}})^{${b}}`), M(`x^{${e}}`), cmp(a * b, e)), fast: [`${M(`(x^{${a}})^{${b}} = x^{${a * b}}`)} (multiply exponents).`, `Base above 1 → bigger exponent wins: ${a * b} vs ${e}.`], why: `Exponent rules turn it into comparing two integers.` }; }
    if (t === 'prod') { const e = pick([a + b, a * b]); return { stem: `${M('x > 1')}`, ...qc(M(`x^{${a}} \\cdot x^{${b}}`), M(`x^{${e}}`), cmp(a + b, e)), fast: [`${M(`x^{${a}} \\cdot x^{${b}} = x^{${a + b}}`)} (add exponents).`, `Compare ${a + b} with ${e}.`], why: `Adding (not multiplying) exponents is the rule being tested.` }; }
    return { stem: `${M('0 < x < 1')}`, ...qc(M(`x^{-${a}}`), M(`x^{${b}}`), 'A'), fast: [`${M(`x^{-${a}} = \\frac{1}{x^{${a}}}`)} is greater than 1 when ${M('0 < x < 1')}.`, `${M(`x^{${b}}`)} is less than 1.`], why: `Try ${M('x = \\frac{1}{2}')}: ${M(`2^{${a}}`)} vs ${M(`\\frac{1}{${2 ** b}}`)}.` };
  });

  def({ id: 'qc-func', area: 'Algebra', topic: 'Functions', format: 'qc', diff: 'easy' }, () => {
    const a = ri(1, 4), b = ri(-6, 6), c = ri(-5, 5), t = ri(1, 5);
    const f = (x) => a * x * x + b * x + c;
    return {
      stem: `${M(`f(x) = ${poly([a, b, c])}`)}`,
      ...qc(M(`f(${t})`), M(`f(-${t})`), cmp(f(t), f(-t))),
      fast: [`The ${M('x^{2}')} and constant terms are the same for ${M(t)} and ${M(-t)}; only ${M(`${b}x`)} differs.`, b === 0 ? 'No linear term → equal.' : `${M(`${b}(${t})`)} vs ${M(`${b}(-${t})`)} → ${b > 0 ? 'A' : 'B'} is greater.`],
      why: `Compare only the part that differs instead of evaluating both fully.`,
    };
  });

  def({ id: 'ma-line-points', area: 'Algebra', topic: 'Coordinate geometry', format: 'ma', diff: 'easy' }, () => {
    const m = ri(-4, 4) || 2, b = ri(-6, 6);
    const pts = []; const xs = sample([-3, -2, -1, 0, 1, 2, 3, 4], 5);
    xs.forEach((x) => { const on = pick([true, false]); const y = m * x + b + (on ? 0 : pick([1, -1, 2])); pts.push({ text: M(`(${x}, ${y})`), ok: on }); });
    if (!pts.some((p) => p.ok) || pts.every((p) => p.ok)) return null;
    return {
      stem: `Which of the following points lie on the line ${M(`y = ${m === 1 ? '' : m === -1 ? '-' : m}x ${sgn(b)}`)}? Indicate <b>all</b> such points.`,
      ...ma(pts),
      fast: [`Plug each ${M('x')} into ${M(`${m}x ${sgn(b)}`)} and compare with the given ${M('y')}.`, xs.map((x) => `${M(`x = ${x}`)} → ${M(m * x + b)}`).join('; ') + '.'],
      why: `Substitution is one multiplication per point — no graphing.`,
    };
  });

  def({ id: 'ma-quad-ineq', area: 'Algebra', topic: 'Inequalities', format: 'ma', diff: 'hard' }, () => {
    let p, q; do { p = ri(-6, 4); q = ri(-3, 7); } while (q - p < 2);
    const vs = [...new Set([p - 1, p, p + 1, Math.round((p + q) / 2), q, q + 1])].sort((a, b) => a - b);
    return {
      stem: `Which of the following values of ${M('x')} satisfy ${M(poly([1, -(p + q), p * q]) + ' < 0')}? Indicate <b>all</b> such values.`,
      ...ma(vs.map((v) => ({ text: M(v), ok: v > p && v < q }))),
      fast: [`Factor: ${M(`(x ${sgn(-p)})(x ${sgn(-q)}) < 0`)}.`, `An upward parabola is negative strictly <i>between</i> its roots: ${M(`${p} < x < ${q}`)}.`],
      why: `Knowing "negative between the roots" avoids a sign chart.`,
    };
  });

  // ================= GEOMETRY =================
  def({ id: 'qc-tri-angles', area: 'Geometry', topic: 'Triangles', format: 'qc', diff: 'easy' }, () => {
    const [a, b, c] = pick([[1, 2, 3], [1, 1, 2], [2, 3, 4], [1, 3, 5], [2, 3, 5], [1, 4, 5], [3, 4, 5], [4, 5, 6]]);
    const x = 180 / (a + b + c); const bq = pick([Math.round(x), Math.round(x) + 1, Math.round(x) - 1]);
    return {
      stem: `The angles of a triangle measure ${M(`${a === 1 ? '' : a}x°`)}, ${M(`${b === 1 ? '' : b}x°`)}, and ${M(`${c}x°`)}.`,
      ...qc(M('x'), M(bq), cmp(x, bq)),
      fast: [`${M(`${a + b + c}x = 180`)} → ${M(`x = ${fmt(Math.round(x * 100) / 100)}`)}.`],
      why: `Angle sum 180° gives ${M('x')} in one division.`,
    };
  });

  def({ id: 'qc-circle-pi', area: 'Geometry', topic: 'Circles', format: 'qc', diff: 'medium' }, () => {
    const r = ri(2, 12); const t = pick(['circ', 'area', 'semi']);
    if (t === 'circ') { const k = pick([6, 7]); return { stem: `A circle has radius ${M(r)}.`, ...qc('The circumference of the circle', M(k * r), cmp(2 * Math.PI * r, k * r)), fast: [`Circumference ${M(`= 2\\pi(${r}) \\approx 6.28 \\times ${r}`)}.`, `Compare ${M(`6.28 \\times ${r}`)} with ${M(`${k} \\times ${r}`)}.`], why: `Divide out ${M('r')}: compare ${M('2\\pi \\approx 6.28')} with ${k}.` }; }
    if (t === 'area') { const k = pick([3, 4]); return { stem: `A circle has radius ${M(r)}.`, ...qc('The area of the circle', M(k * r * r), cmp(Math.PI, k)), fast: [`Area ${M(`= \\pi (${r})^{2} = ${r * r}\\pi`)}.`, `Compare ${M('\\pi \\approx 3.14')} with ${k}.`], why: `Cancel the common ${M(`${r * r}`)} factor and compare ${M('\\pi')} to ${k}.` }; }
    return { stem: `A semicircle has diameter ${M(2 * r)}.`, ...qc('The length of the curved part of the semicircle', M(3 * r), 'A'), fast: [`Half the circumference ${M(`= \\pi r = ${r}\\pi \\approx ${fmt(Math.round(Math.PI * r * 100) / 100)}`)}.`, `${M(`${r}\\pi > ${3 * r}`)} since ${M('\\pi > 3')}.`], why: `Only ${M('\\pi')} vs 3 matters.` };
  });

  def({ id: 'qc-side-angle', area: 'Geometry', topic: 'Triangles', format: 'qc', diff: 'medium' }, () => {
    const A_ = ri(30, 80), B_ = ri(30, 80); if (A_ + B_ >= 170 || A_ === B_) return null; const C_ = 180 - A_ - B_;
    return {
      stem: `In triangle ${M('ABC')}, angle ${M('A')} measures ${A_}° and angle ${M('B')} measures ${B_}°.`,
      ...qc(`The length of side ${M('BC')}`, `The length of side ${M('AC')}`, cmp(A_, B_)),
      fast: [`${M('BC')} is opposite angle ${M('A')} (${A_}°); ${M('AC')} is opposite angle ${M('B')} (${B_}°).`, `The larger angle faces the longer side.`],
      why: `No lengths needed — the angle–side order rule decides it.`,
    };
  });

  def({ id: 'qc-rect-perim', area: 'Geometry', topic: 'Area & perimeter', format: 'qc', diff: 'hard' }, () => {
    const s = ri(3, 12); const Ar = s * s; const minP = 4 * s; const bq = pick([minP, minP - ri(1, 6), minP + ri(1, 6)]);
    const rel = bq < minP ? 'A' : 'D';
    return {
      stem: `A rectangle has area ${Ar}.`,
      ...qc('The perimeter of the rectangle', M(bq), rel),
      fast: [`For a fixed area, the square has the smallest perimeter: ${M(`4\\sqrt{${Ar}} = ${minP}`)}.`, `Long, thin rectangles have arbitrarily large perimeters.`, bq < minP ? `Every perimeter is at least ${minP} > ${bq} → A.` : `${bq} is within the possible range → cannot be determined.`],
      why: `Test the extremes (square vs. very thin) instead of guessing one shape.`,
    };
  });

  def({ id: 'ma-tri-area', area: 'Geometry', topic: 'Triangles', format: 'ma', diff: 'hard' }, () => {
    const a = ri(4, 12), b = ri(4, 12); const max = (a * b) / 2;
    const vs = [...new Set([Math.round(max / 4), Math.round(max / 2), Math.floor(max), Math.floor(max) + 1, Math.round(max * 1.5), a * b])].sort((x, y) => x - y);
    return {
      stem: `Two sides of a triangle have lengths ${a} and ${b}. Which of the following could be the area of the triangle? Indicate <b>all</b> such values.`,
      ...ma(vs.map((v) => ({ text: M(v), ok: v > 0 && v <= max }))),
      fast: [`Max area when the sides are perpendicular: ${M(`\\frac{1}{2}(${a})(${b}) = ${fmt(max)}`)}.`, `Any area in ${M(`(0, ${fmt(max)}]`)} is possible by changing the angle.`],
      why: `Find the extreme; everything between 0 and it is achievable.`,
    };
  });

  // ================= DATA ANALYSIS =================
  def({ id: 'qc-comb-sym', area: 'Data Analysis', topic: 'Counting', format: 'qc', diff: 'medium' }, () => {
    const n = ri(6, 14), k = ri(2, Math.floor(n / 2)); const t = pick(['sym', 'adj']);
    if (t === 'sym') return { stem: `Compare the two quantities.`, ...qc(`The number of ways to choose ${k} people from ${n}`, `The number of ways to choose ${n - k} people from ${n}`, 'C'), fast: [`Choosing ${k} to include = choosing ${n - k} to leave out.`, `${M(`\\binom{${n}}{${k}} = \\binom{${n}}{${n - k}}`)}.`], why: `Symmetry of combinations — no computation.` };
    const k2 = k + 1; return { stem: `Compare the two quantities.`, ...qc(M(`\\binom{${n}}{${k}}`), M(`\\binom{${n}}{${k2}}`), cmp(C(n, k), C(n, k2))), fast: [`${M(`\\binom{${n}}{${k2}} = \\binom{${n}}{${k}} \\times \\frac{${n - k}}{${k2}}`)}.`, `${M(fracTex(n - k, k2))} is ${n - k > k2 ? 'greater than' : n - k < k2 ? 'less than' : 'equal to'} 1.`], why: `Combinations increase toward the middle (${M(`k = ${n / 2}`)}); the ratio shows the direction instantly.` };
  });

  def({ id: 'qc-mean-add', area: 'Data Analysis', topic: 'Mean, median, mode', format: 'qc', diff: 'easy' }, () => {
    const n = ri(4, 10), m = ri(20, 80), x = m + ri(-15, 15);
    const newM = (n * m + x) / (n + 1);
    return {
      stem: `The average of ${n} numbers is ${m}. The number ${x} is added to the list.`,
      ...qc('The new average', M(m), cmp(newM, m)),
      fast: [`Adding a value ${x > m ? 'above' : x < m ? 'below' : 'equal to'} the current mean ${x > m ? 'raises' : x < m ? 'lowers' : "doesn't change"} it.`],
      why: `No arithmetic needed — compare the new value to the mean.`,
    };
  });

  def({ id: 'qc-prob', area: 'Data Analysis', topic: 'Probability', format: 'qc', diff: 'medium' }, () => {
    const t = pick(['coins', 'dice']);
    if (t === 'coins') {
      const n = ri(2, 4); const pAll = 1 / 2 ** n; const k = ri(2, 4); const pAtLeast = 1 - 1 / 2 ** k;
      return { stem: `A fair coin is tossed.`, ...qc(`The probability of getting heads on all of ${n} tosses`, `The probability of getting at least one tail in ${k} tosses`, 'B'), fast: [`A: ${M(`\\left(\\frac{1}{2}\\right)^{${n}} = \\frac{1}{${2 ** n}}`)}.`, `B: ${M(`1 - \\frac{1}{${2 ** k}} = ${fracTex(2 ** k - 1, 2 ** k)}`)}.`], why: `"At least one" via the complement is quick, and it's at least ${M('\\frac{3}{4}')} here.` };
    }
    const s = ri(2, 12); const ways = 6 - Math.abs(7 - s); const s2 = ri(2, 12); const w2 = 6 - Math.abs(7 - s2); if (s === s2) return null;
    return { stem: `Two fair six-sided dice are rolled.`, ...qc(`The probability that the sum is ${s}`, `The probability that the sum is ${s2}`, cmp(ways, w2)), fast: [`Ways to make a sum ${M('s')}: ${M('6 - |7 - s|')}.`, `Sum ${s}: ${ways} ways; sum ${s2}: ${w2} ways.`], why: `Sums are symmetric around 7 — the closer to 7, the more likely.` };
  });

  def({ id: 'ma-median', area: 'Data Analysis', topic: 'Mean, median, mode', format: 'ma', diff: 'hard' }, () => {
    const xs = sample([2, 3, 5, 6, 8, 9, 11, 12, 14], 4).sort((a, b) => a - b);
    // add unknown x; which could be the median of the 5 numbers? median ranges between xs[1] and xs[2]
    const lo = xs[1], hi = xs[2];
    const cands = [...new Set([xs[0], lo, Math.floor((lo + hi) / 2), hi, xs[3], lo - 1 > xs[0] ? lo - 1 : hi + 1])].sort((a, b) => a - b);
    return {
      stem: `A list consists of the numbers ${M(xs.join(', '))} and ${M('x')}, where ${M('x')} can be any number. Which of the following could be the median of the five numbers? Indicate <b>all</b> such values.`,
      ...ma(cands.map((c) => ({ text: M(c), ok: c >= lo && c <= hi }))),
      fast: [`The median is the 3rd of 5 sorted values.`, `If ${M('x')} is small, the median is ${lo}; if large, ${hi}; in between, it's ${M('x')} itself.`, `So the median can be anything from ${lo} to ${hi}.`],
      why: `Test the extremes of ${M('x')} (very small, very large) to find the whole range at once.`,
    };
  });
};
