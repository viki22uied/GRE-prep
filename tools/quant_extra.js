// Extra Quantitative Comparison and multiple-answer patterns, so the format mix
// matches the real test (QC is roughly a third of GRE Quant).
const L = require('./lib');
const { ri, pick, shuffle, sample, gcd, lcm, M, F, fracTex, tn, fmt, num, frac, mc, mcNum, ma, qc, cmp, clean, poly, sgn, EX, par } = L;
const C = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return Math.round(r); };

module.exports = function (def) {
  // ================= ARITHMETIC =================
  def({ id: 'qc-rem', area: 'Arithmetic', topic: 'Remainders', format: 'qc', diff: 'medium' }, () => {
    const [big, small] = pick([[6, 3], [8, 4], [10, 5], [12, 4], [12, 6], [9, 3], [15, 5], [14, 7], [20, 4]]);
    const r = ri(1, big - 1); const rs = r % small; const bq = pick([rs, rs + 1, Math.max(0, rs - 1)]);
    return {
      stem: `When the positive integer ${M('n')} is divided by ${big}, the remainder is ${r}.`,
      ...qc(`The remainder when ${M('n')} is divided by ${small}`, M(bq), cmp(rs, bq)),
      ...EX(`We know ${M('n')}'s remainder for division by ${big}, but the quantity asks about division by ${small}, and ${M('n')} itself is unknown.`,
        `Because ${small} divides ${big} evenly (${big} = ${small} × ${big / small}), every number of the form "multiple of ${big} plus ${r}" leaves the same remainder when divided by ${small}. So test the smallest such number, ${r}, and the result holds for all of them. (If ${small} did not divide ${big}, the answer could vary.)`,
        [`The smallest ${M('n')} with remainder ${r} when divided by ${big} is ${r} itself. As a check, the next one is ${r} + ${big} = ${r + big}.`,
          `${r} divided by ${small} leaves ${rs}, and ${r + big} divided by ${small} also leaves ${rs}, since adding ${big} adds a whole number of ${small}'s.`],
        `Remainder ${M(rs)} vs ${M(bq)} → ${rs > bq ? 'A' : rs < bq ? 'B' : 'equal'}.`,
        `Pattern: "remainder by a divisor of the original divisor." It's fixed — test the smallest number.`),
    };
  });

  def({ id: 'qc-pct-swap', area: 'Arithmetic', topic: 'Percent', format: 'qc', diff: 'easy' }, () => {
    const x = ri(2, 20) * 5, y = ri(2, 30) * 5;
    return {
      stem: `Compare the two quantities.`,
      ...qc(`${x}% of ${y}`, `${y}% of ${x}`, 'C'),
      ...EX(`Both sides mix a percent with a number, and computing each one separately wastes time.`,
        `"${M('a')}% of ${M('b')}" means ${M('\\frac{a}{100} \\times b = \\frac{a \\times b}{100}')}. Swapping the roles gives ${M('\\frac{b \\times a}{100}')}, the same thing, because multiplication can be done in either order.`,
        [`${x}% of ${y} is ${M(`\\frac{${x} \\times ${y}}{100}`)}.`, `${y}% of ${x} is ${M(`\\frac{${y} \\times ${x}}{100}`)}.`, `The numerators are the same product.`],
        `Both ${M(`= \\frac{${x * y}}{100} = ${fmt(clean(x * y / 100))}`)} → equal.`,
        `Pattern: "a% of b vs b% of a." Always equal — spot it and move on.`),
    };
  });

  def({ id: 'qc-up-down', area: 'Arithmetic', topic: 'Percent change', format: 'qc', diff: 'medium' }, () => {
    const p = pick([10, 20, 25, 30, 40, 50]); const P = ri(2, 30) * 10; const order = pick(['up', 'down']);
    const up = clean(1 + p / 100), dn = clean(1 - p / 100), prod = clean(up * dn), final = clean(P * prod);
    return {
      stem: `The price of a lamp was ${P} dollars. It was ${order === 'up' ? `increased by ${p}% and then decreased by ${p}%` : `decreased by ${p}% and then increased by ${p}%`}.`,
      ...qc('The final price, in dollars', M(P), 'B'),
      ...EX(`It feels as though going up and down by the same percent should cancel, but the two percents are taken of different amounts.`,
        `Turn each percent change into a multiplier and multiply. For equal up-and-down changes, ${M('(1 + r)(1 - r) = 1 - r^{2}')}, which is always less than 1, so the result is always a loss.`,
        [`Up ${p}%: multiply by ${up}. Down ${p}%: multiply by ${dn}. The order doesn't matter.`, `${up} × ${dn} = ${prod}, which is less than 1.`],
        `${M(`${P} \\times ${prod} = ${fmt(final)} < ${P}`)} → B.`,
        `Pattern: "same percent up then down." Always a net decrease of ${M('r^{2}')}.`),
    };
  });

  def({ id: 'qc-fraction-ops', area: 'Arithmetic', topic: 'Fractions & decimals', format: 'qc', diff: 'medium' }, () => {
    const a = ri(2, 9), b = a + ri(1, 5); const t = pick(['recip', 'addone', 'square']);
    if (t === 'recip') {
      const A = b / a, B = a / b + 1;
      return { stem: `Compare the two quantities.`, ...qc(M(`\\frac{1}{${fracTex(a, b)}}`), M(`${fracTex(a, b)} + 1`), cmp(A, B)),
        ...EX(`Both sides are fractions built from ${M(fracTex(a, b))} in different ways.`, `Rewrite each side as a single simple fraction, then compare with cross-multiplication.`,
          [`${M(`\\frac{1}{${fracTex(a, b)}} = ${fracTex(b, a)}`)} (dividing by a fraction flips it).`, `${M(`${fracTex(a, b)} + 1 = ${fracTex(a + b, b)}`)} (1 is ${M(fracTex(b, b))}).`, `Cross-multiply ${M(fracTex(b, a))} and ${M(fracTex(a + b, b))}: ${b} × ${b} = ${b * b} and ${a + b} × ${a} = ${(a + b) * a}.`],
          `${M(`${b * b}`)} vs ${M(`${(a + b) * a}`)} → ${A > B ? 'A' : A < B ? 'B' : 'equal'}.`, `Pattern: "compare fraction expressions." Simplify each side, then cross-multiply.`) };
    }
    if (t === 'addone') return { stem: `Compare the two quantities.`, ...qc(F(a, b), F(a + 1, b + 1), 'B'),
      ...EX(`The fractions look almost the same.`, `For a positive fraction less than 1, adding the same positive number to the top and the bottom moves it closer to 1, so it gets bigger. You can confirm with cross-multiplication.`,
        [`${M(fracTex(a, b))} is less than 1 because ${a} < ${b}, so adding 1 to both parts pushes it up toward 1.`, `Check: ${a} × ${b + 1} = ${a * (b + 1)} and ${a + 1} × ${b} = ${(a + 1) * b}.`],
        `${M(`${a * (b + 1)} < ${(a + 1) * b}`)} → B.`, `Pattern: "add the same amount to top and bottom." Fractions below 1 rise toward 1; above 1 they fall toward 1.`) };
    return { stem: `Compare the two quantities.`, ...qc(M(`\\left(${fracTex(a, b)}\\right)^{2}`), F(a, b), 'B'),
      ...EX(`Squaring usually makes numbers bigger, which is the wrong instinct here.`, `For a number between 0 and 1, squaring means taking a fraction of a fraction, which makes it smaller.`,
        [`${M(fracTex(a, b))} is between 0 and 1 because ${a} < ${b}.`, `${M(`\\left(${fracTex(a, b)}\\right)^{2}`)} is ${M(fracTex(a, b))} of ${M(fracTex(a, b))}, so it's smaller. Squaring top and bottom: ${a}² = ${a * a} and ${b}² = ${b * b}.`],
        `${M(`\\frac{${a * a}}{${b * b}} < ${fracTex(a, b)}`)} → B.`, `Pattern: "powers of a fraction." Between 0 and 1, higher powers are smaller.`) };
  });

  def({ id: 'ma-divisors', area: 'Arithmetic', topic: 'Divisibility', format: 'ma', diff: 'medium' }, () => {
    const [a, b] = pick([[12, 15], [6, 10], [8, 12], [9, 12], [10, 14], [6, 15], [4, 18], [14, 21], [12, 18]]);
    const l = lcm(a, b); const cands = shuffle([...new Set([l, l / 2, a * b, a + b, l / 3, 2 * l, 5, 7, 9, 8, 16, 45, 20, 24, 36, 30, 18, 10])].filter((x) => Number.isInteger(x) && x > 1)).slice(0, 6).sort((x, y) => x - y);
    const items = cands.map((c) => ({ text: M(c), ok: l % c === 0 }));
    if (!items.some((i) => i.ok) || items.every((i) => i.ok)) return null;
    return {
      stem: `If the positive integer ${M('n')} is divisible by both ${a} and ${b}, which of the following must be a divisor of ${M('n')}? Indicate <b>all</b> such numbers.`,
      ...ma(items),
      ...EX(`"Must be a divisor" is about every possible ${M('n')}, and there are infinitely many.`,
        `A number divisible by both ${M('a')} and ${M('b')} is a multiple of their least common multiple, and it could be exactly the LCM. So the numbers that must divide ${M('n')} are exactly the divisors of the LCM. Test the smallest possible ${M('n')}.`,
        [`Prime factors: ${a} and ${b} give LCM ${l} (take each prime to its highest power appearing in either number).`, `${M('n')} could be ${l} itself, so a choice "must" divide ${M('n')} only if it divides ${l}.`, `Test each choice against ${l}: ${cands.map((c) => `${c} ${l % c === 0 ? '✓' : '✗'}`).join(', ')}.`],
        `Keep the choices that divide ${M(l)}.`,
        `Pattern: "divisible by a and b — what must divide n?" Use the LCM as the test case. Note ${a} × ${b} = ${a * b} need not divide ${M('n')}.`),
    };
  });

  def({ id: 'ma-factors', area: 'Arithmetic', topic: 'Factors & primes', format: 'ma', diff: 'medium' }, () => {
    const e2 = ri(1, 4), e3 = ri(0, 2), e5 = ri(0, 2), e7 = ri(0, 1);
    const N = 2 ** e2 * 3 ** e3 * 5 ** e5 * 7 ** e7; const fac = [[2, e2], [3, e3], [5, e5], [7, e7]].filter((x) => x[1]).map(([p, e]) => (e > 1 ? `${p}^{${e}}` : p)).join(' \\cdot ');
    const facOf = (c) => { const out = []; for (const p of [2, 3, 5, 7]) { let e = 0; while (c % p === 0) { c /= p; e++; } if (e) out.push(e > 1 ? `${p}^{${e}}` : `${p}`); } return out.join(' \\cdot '); };
    const cands = shuffle([4, 6, 8, 9, 10, 12, 14, 15, 18, 20, 21, 25, 27, 30, 35, 16, 45]).slice(0, 6).sort((a, b) => a - b);
    const items = cands.map((c) => ({ text: M(c), ok: N % c === 0 }));
    if (!items.some((i) => i.ok) || items.every((i) => i.ok)) return null;
    return {
      stem: `${M(`k = ${fac}`)}. Which of the following are factors of ${M('k')}? Indicate <b>all</b> such numbers.`,
      ...ma(items),
      ...EX(`Multiplying ${M('k')} out and dividing by each choice is slow.`,
        `A number divides ${M('k')} exactly when each of its prime factors appears in ${M('k')} at least as many times. So factor each choice and compare exponents with ${M('k')}'s factorization.`,
        [`${M('k')} has ${[[2, e2], [3, e3], [5, e5], [7, e7]].map(([p, e]) => `${e} factor${e === 1 ? '' : 's'} of ${p}`).join(', ')}.`, ...cands.map((c) => `${c} = ${M(facOf(c))} → ${N % c === 0 ? 'fits inside k ✓' : 'needs more than k has ✗'}.`)],
        `Keep the choices whose prime factors fit inside ${M(fac)}.`,
        `Pattern: "is it a factor?" Compare prime factorizations, never multiply out.`),
    };
  });

  // ================= ALGEBRA =================
  def({ id: 'qc-system', area: 'Algebra', topic: 'Simultaneous equations', format: 'qc', diff: 'easy' }, () => {
    const x = ri(-8, 12), y = ri(-8, 12);
    return {
      stem: `${M(`x + y = ${x + y}`)}<br>${M(`x - y = ${x - y}`)}`,
      ...qc(M('x'), M('y'), cmp(x, y)),
      ...EX(`It looks as if we should solve the system, but QC only asks which is bigger.`,
        `${M('x > y')} exactly when ${M('x - y')} is positive. When one of the given equations is ${M('x - y = \\dots')}, its sign answers the comparison with no solving.`,
        [`We're told ${M(`x - y = ${x - y}`)}.`, x - y > 0 ? `That's positive, so ${M('x')} is larger.` : x - y < 0 ? `That's negative, so ${M('y')} is larger.` : `That's zero, so they are equal.`],
        `${M(`x - y = ${x - y}`)} → ${x > y ? 'A' : x < y ? 'B' : 'equal'}.`,
        `Pattern: "compare x and y." Look at the sign of x − y.`),
    };
  });

  def({ id: 'qc-quadratic', area: 'Algebra', topic: 'Quadratic equations', format: 'qc', diff: 'medium' }, () => {
    let p, q; do { p = ri(-6, 8); q = ri(-6, 8); } while (p === q);
    const bq = pick([Math.min(p, q) - 1, Math.max(p, q) + 1, Math.floor((p + q) / 2), 0]);
    const rel = Math.min(p, q) > bq ? 'A' : Math.max(p, q) < bq ? 'B' : 'D';
    return {
      stem: `${M(poly([1, -(p + q), p * q]) + ' = 0')}`,
      ...qc(M('x'), M(bq), rel),
      ...EX(`A quadratic usually has two solutions, so ${M('x')} isn't a single number — and the two could land on opposite sides of Quantity B.`,
        `Find both roots (product-and-sum factoring), then compare each with Quantity B. If both roots are on the same side, that side wins; if they're on different sides (or one equals B), the answer is D.`,
        [`We need two numbers that multiply to ${p * q} and add to ${-(p + q)}: ${-p} and ${-q}. So the equation is ${M(`(x ${sgn(-p)})(x ${sgn(-q)}) = 0`)} and ${M('x')} is ${p} or ${q}.`,
          rel === 'D' ? `Compare with ${bq}: one root is at least ${bq} and the other is at most ${bq}, so the comparison depends on which root.` : `Compare with ${bq}: both roots are ${rel === 'A' ? 'greater' : 'less'} than ${bq}.`],
        `Roots ${M(`${p}, ${q}`)} vs ${M(bq)} → ${rel === 'D' ? 'cannot be determined' : rel + ' is greater'}.`,
        `Pattern: "QC with a quadratic." Check both roots against Quantity B — this is where D hides.`),
    };
  });

  def({ id: 'qc-exp-rules', area: 'Algebra', topic: 'Operations with exponents', format: 'qc', diff: 'medium' }, () => {
    const a = ri(2, 5), b = ri(2, 5); const t = pick(['powpow', 'prod', 'neg']);
    const rule = `Exponent rules: multiplying powers of the same base adds exponents (${M('x^{a} \\cdot x^{b} = x^{a+b}')}); a power of a power multiplies them (${M('(x^{a})^{b} = x^{ab}')}); a negative exponent means a reciprocal (${M('x^{-a} = \\frac{1}{x^{a}}')}). For a base greater than 1, the bigger exponent gives the bigger value.`;
    if (t === 'powpow') { const e = pick([a * b, a + b, a * b + 1]); return { stem: `${M('x > 1')}`, ...qc(M(`(x^{${a}})^{${b}}`), M(`x^{${e}}`), cmp(a * b, e)),
      ...EX(`The two sides are written differently, so they can't be compared until they share a form.`, rule, [`A power of a power multiplies the exponents: ${a} × ${b} = ${a * b}, so A is ${M(`x^{${a * b}}`)}.`, `Since ${M('x > 1')}, compare the exponents ${a * b} and ${e}.`], `${M(`x^{${a * b}}`)} vs ${M(`x^{${e}}`)} → ${a * b > e ? 'A' : a * b < e ? 'B' : 'equal'}.`, `Pattern: "exponent rules in QC." Rewrite both sides as a single power, then compare exponents.`) }; }
    if (t === 'prod') { const e = pick([a + b, a * b]); return { stem: `${M('x > 1')}`, ...qc(M(`x^{${a}} \\cdot x^{${b}}`), M(`x^{${e}}`), cmp(a + b, e)),
      ...EX(`The two sides are written differently, so they can't be compared until they share a form.`, rule, [`Multiplying powers of the same base adds exponents: ${a} + ${b} = ${a + b}, so A is ${M(`x^{${a + b}}`)}.`, `Since ${M('x > 1')}, compare the exponents ${a + b} and ${e}.`], `${M(`x^{${a + b}}`)} vs ${M(`x^{${e}}`)} → ${a + b > e ? 'A' : a + b < e ? 'B' : 'equal'}.`, `Pattern: "product of powers." Add exponents — multiplying them (${a * b}) is the trap.`) }; }
    return { stem: `${M('0 < x < 1')}`, ...qc(M(`x^{-${a}}`), M(`x^{${b}}`), 'A'),
      ...EX(`A negative exponent and a fractional base together make intuition unreliable.`, rule, [`${M(`x^{-${a}} = \\frac{1}{x^{${a}}}`)}. With ${M('0 < x < 1')}, ${M(`x^{${a}}`)} is a small positive number, so its reciprocal is greater than 1.`, `${M(`x^{${b}}`)} is a fraction of a fraction, so it's less than 1. For example, with ${M('x = \\frac{1}{2}')}: A is ${2 ** a} and B is ${M(`\\frac{1}{${2 ** b}}`)}.`], `A > 1 > B → A.`, `Pattern: "negative exponent on a fraction." The reciprocal flips it above 1.`) };
  });

  def({ id: 'qc-func', area: 'Algebra', topic: 'Functions', format: 'qc', diff: 'easy' }, () => {
    const a = ri(1, 4), b = ri(-6, 6), c = ri(-5, 5), t = ri(1, 5);
    const f = (x) => a * x * x + b * x + c;
    return {
      stem: `${M(`f(x) = ${poly([a, b, c])}`)}`,
      ...qc(M(`f(${t})`), M(`f(-${t})`), cmp(f(t), f(-t))),
      ...EX(`Evaluating both sides fully works but repeats the same arithmetic twice.`, `When comparing ${M('f(t)')} with ${M('f(-t)')}, the ${M('x^{2}')} term and the constant are identical on both sides (squaring kills the sign). Only the ${M('x')} term differs, so compare just that.`,
        [`${M(`${a === 1 ? '' : a}x^{2}`)} gives the same value for ${t} and ${-t}, and ${c} is the same on both sides.`, b === 0 ? `There's no ${M('x')} term, so nothing differs.` : `The ${M('x')} term is ${M(`${b}x`)}: at ${t} it's ${b * t}, at ${-t} it's ${-b * t}.`],
        b === 0 ? `Equal.` : `${M(`${b * t}`)} vs ${M(`${-b * t}`)} → ${b > 0 ? 'A' : 'B'} is greater.`,
        `Pattern: "f(t) vs f(−t)." Only odd-power terms differ; compare those.`),
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
      ...EX(`Graphing the line and eyeballing points is slow and imprecise.`, `A point lies on a line exactly when its coordinates make the equation true. Substitute each ${M('x')} into the right side and see if you get the point's ${M('y')}.`,
        [`For each point, compute ${M(`${m}x ${sgn(b)}`)} with its ${M('x')}-value: ${xs.map((x) => `${M(`x = ${x}`)} gives ${M(m * x + b)}`).join('; ')}.`, `Compare each result with the point's ${M('y')}-coordinate.`],
        `Keep the points whose ${M('y')} matches.`,
        `Pattern: "is the point on the line?" Plug in x, compare y.`),
    };
  });

  def({ id: 'ma-quad-ineq', area: 'Algebra', topic: 'Inequalities', format: 'ma', diff: 'hard' }, () => {
    let p, q; do { p = ri(-6, 4); q = ri(-3, 7); } while (q - p < 2);
    const vs = [...new Set([p - 1, p, p + 1, Math.round((p + q) / 2), q, q + 1])].sort((a, b) => a - b);
    return {
      stem: `Which of the following values of ${M('x')} satisfy ${M(poly([1, -(p + q), p * q]) + ' < 0')}? Indicate <b>all</b> such values.`,
      ...ma(vs.map((v) => ({ text: M(v), ok: v > p && v < q }))),
      ...EX(`Testing six values in a quadratic is slow, and the endpoints are easy to misjudge.`, `Factor to find the roots. The graph of ${M('x^{2} + \\dots')} is an upward-opening parabola, which is below zero (negative) only strictly between its two roots.`,
        [`Two numbers that multiply to ${p * q} and add to ${-(p + q)}: ${-p} and ${-q}. So ${M(poly([1, -(p + q), p * q]))} ${M('=')} ${M(`(x ${sgn(-p)})(x ${sgn(-q)})`)}, with roots ${p} and ${q}.`, `The expression is negative strictly between ${p} and ${q}; at the roots themselves it equals 0, which is not less than 0.`],
        `${M(`${p} < x < ${q}`)}`,
        `Pattern: "quadratic < 0." Between the roots; "> 0" means outside them.`),
    };
  });

  // ================= GEOMETRY =================
  def({ id: 'qc-tri-angles', area: 'Geometry', topic: 'Triangles', format: 'qc', diff: 'easy' }, () => {
    const [a, b, c] = pick([[1, 2, 3], [1, 1, 2], [2, 3, 4], [1, 3, 5], [2, 3, 5], [1, 4, 5], [3, 4, 5], [4, 5, 6]]);
    const s = a + b + c, x = 180 / s; const bq = pick([Math.round(x), Math.round(x) + 1, Math.round(x) - 1]);
    return {
      stem: `The angles of a triangle measure ${M(`${a === 1 ? '' : a}x°`)}, ${M(`${b === 1 ? '' : b}x°`)}, and ${M(`${c}x°`)}.`,
      ...qc(M('x'), M(bq), cmp(x, bq)),
      ...EX(`The angles are given only in terms of ${M('x')}.`, `The three angles of a triangle add to 180°. Add the expressions, set the sum equal to 180, and solve.`,
        [`${a === 1 ? '' : a}x + ${b === 1 ? '' : b}x + ${c}x = ${s}x.`, `So ${M(`${s}x = 180`)}, and ${M('x')} = 180 ÷ ${s}.`],
        `${M(`x = 180 \\div ${s} = ${fmt(clean(Math.round(x * 100) / 100))}`)} vs ${M(bq)}.`,
        `Pattern: "angles as multiples of x." Add, set equal to 180, solve.`),
    };
  });

  def({ id: 'qc-circle-pi', area: 'Geometry', topic: 'Circles', format: 'qc', diff: 'medium' }, () => {
    const r = ri(2, 12); const t = pick(['circ', 'area', 'semi']);
    if (t === 'circ') { const k = pick([6, 7]); return { stem: `A circle has radius ${M(r)}.`, ...qc('The circumference of the circle', M(k * r), cmp(2 * Math.PI * r, k * r)),
      ...EX(`One side has ${M('\\pi')} and the other doesn't.`, `Write both sides as (number) × ${M('r')}; the common factor ${M('r')} doesn't affect which is bigger, so just compare the numbers. Use ${M('\\pi \\approx 3.14')}.`,
        [`Circumference = ${M(`2\\pi r = ${2 * r}\\pi`)}, which is ${M('2\\pi')} (about 6.28) times ${r}.`, `Quantity B is ${k} times ${r}.`, `So compare 6.28 with ${k}.`], `${M(`6.28`)} vs ${M(k)} → ${6.28 > k ? 'A' : 'B'}.`, `Pattern: "π in QC." Cancel the common factor, then compare ${M('\\pi')} (or ${M('2\\pi')}) with the other number.`) }; }
    if (t === 'area') { const k = pick([3, 4]); return { stem: `A circle has radius ${M(r)}.`, ...qc('The area of the circle', M(k * r * r), cmp(Math.PI, k)),
      ...EX(`One side has ${M('\\pi')} and the other doesn't.`, `Write both sides as (number) × ${M('r^{2}')}; the common factor doesn't affect which is bigger, so compare the numbers. ${M('\\pi')} is about 3.14.`,
        [`Area = ${M(`\\pi (${r})^{2} = ${r * r}\\pi`)}, which is ${M('\\pi')} times ${r * r}.`, `Quantity B is ${k} × ${r * r}, which is ${k} times ${r * r}.`, `So compare ${M('\\pi')} ≈ 3.14 with ${k}.`], `${M('3.14')} vs ${M(k)} → ${Math.PI > k ? 'A' : 'B'}.`, `Pattern: "π in QC." Cancel the common factor, compare ${M('\\pi')} with the other number.`) }; }
    return { stem: `A semicircle has diameter ${M(2 * r)}.`, ...qc('The length of the curved part of the semicircle', M(3 * r), 'A'),
      ...EX(`One side has ${M('\\pi')} and the other doesn't.`, `The curved part of a semicircle is half the circumference, ${M('\\pi r')}. Compare it with the other side by cancelling ${M('r')}.`,
        [`The radius is half of ${2 * r}, which is ${r}. Half the circumference is ${M(`\\pi \\times ${r}`)}.`, `Quantity B is 3 × ${r}.`, `So compare ${M('\\pi')} with 3.`], `${M('\\pi > 3')} → A.`, `Pattern: "π vs 3." π is a little more than 3.`) };
  });

  def({ id: 'qc-side-angle', area: 'Geometry', topic: 'Triangles', format: 'qc', diff: 'medium' }, () => {
    const A_ = ri(30, 80), B_ = ri(30, 80); if (A_ + B_ >= 170 || A_ === B_) return null;
    return {
      stem: `In triangle ${M('ABC')}, angle ${M('A')} measures ${A_}° and angle ${M('B')} measures ${B_}°.`,
      ...qc(`The length of side ${M('BC')}`, `The length of side ${M('AC')}`, cmp(A_, B_)),
      ...EX(`No side lengths are given at all.`, `In any triangle, the longer side is opposite the larger angle (and equal angles face equal sides). So compare the angles that face the two sides.`,
        [`Side ${M('BC')} doesn't touch vertex ${M('A')}, so it faces angle ${M('A')} (${A_}°).`, `Side ${M('AC')} doesn't touch vertex ${M('B')}, so it faces angle ${M('B')} (${B_}°).`],
        `${A_}° vs ${B_}° → ${A_ > B_ ? 'A' : 'B'} is greater.`,
        `Pattern: "compare sides from angles." Bigger angle faces the longer side.`),
    };
  });

  def({ id: 'qc-rect-perim', area: 'Geometry', topic: 'Area & perimeter', format: 'qc', diff: 'hard' }, () => {
    const s = ri(3, 12); const Ar = s * s; const minP = 4 * s; const bq = pick([minP, minP - ri(1, 6), minP + ri(1, 6)]);
    const rel = bq < minP ? 'A' : 'D';
    return {
      stem: `A rectangle has area ${Ar}.`,
      ...qc('The perimeter of the rectangle', M(bq), rel),
      ...EX(`Many different rectangles have the same area, and their perimeters differ.`, `Test the extremes. For a fixed area, the square has the smallest possible perimeter; long, thin rectangles have perimeters as large as you like. So the perimeter can be anything from the square's perimeter upward.`,
        [`The square with area ${Ar} has side ${M(`\\sqrt{${Ar}} = ${s}`)} and perimeter 4 × ${s} = ${minP}. That's the minimum.`, `A 1-by-${Ar} rectangle has perimeter 2(1 + ${Ar}) = ${2 * (1 + Ar)}, and thinner ones are even bigger.`, bq < minP ? `Quantity B, ${bq}, is below the minimum ${minP}, so every such rectangle beats it.` : `Quantity B, ${bq}, is at least the minimum ${minP}, so some rectangles have a smaller or equal perimeter and others a larger one.`],
        `Perimeter ${M(`\\ge ${minP}`)} vs ${M(bq)} → ${rel === 'A' ? 'A is greater' : 'cannot be determined'}.`,
        `Pattern: "fixed area, unknown shape." Square = minimum perimeter; test the square and a very thin rectangle.`),
    };
  });

  def({ id: 'ma-tri-area', area: 'Geometry', topic: 'Triangles', format: 'ma', diff: 'hard' }, () => {
    const a = ri(4, 12), b = ri(4, 12); const max = (a * b) / 2;
    const vs = [...new Set([Math.round(max / 4), Math.round(max / 2), Math.floor(max), Math.floor(max) + 1, Math.round(max * 1.5), a * b])].sort((x, y) => x - y);
    return {
      stem: `Two sides of a triangle have lengths ${a} and ${b}. Which of the following could be the area of the triangle? Indicate <b>all</b> such values.`,
      ...ma(vs.map((v) => ({ text: M(v), ok: v > 0 && v <= max }))),
      ...EX(`The angle between the sides is unknown, so the area isn't fixed.`, `Hinge the two sides at their shared vertex. The area is largest when they're perpendicular (then one side is the height), and it can shrink toward 0 as the angle closes or opens. Every value in between is possible.`,
        [`Maximum area: ${M(`\\frac{1}{2} \\times ${a} \\times ${b} = ${fmt(max)}`)}.`, `So any area greater than 0 and at most ${fmt(max)} works; anything larger is impossible.`],
        `Keep the choices in ${M(`(0, ${fmt(max)}]`)}.`,
        `Pattern: "possible areas from two sides." 0 < area ≤ ½ab.`),
    };
  });

  // ================= DATA ANALYSIS =================
  def({ id: 'qc-comb-sym', area: 'Data Analysis', topic: 'Counting', format: 'qc', diff: 'medium' }, () => {
    const n = ri(6, 14), k = ri(2, Math.floor(n / 2)); const t = pick(['sym', 'adj']);
    if (t === 'sym') return { stem: `Compare the two quantities.`, ...qc(`The number of ways to choose ${k} people from ${n}`, `The number of ways to choose ${n - k} people from ${n}`, 'C'),
      ...EX(`Computing both combinations is unnecessary work.`, `Choosing ${M('k')} people to include is the same as choosing the ${M('n - k')} people to leave out; each choice of one determines the other. So ${M('\\binom{n}{k} = \\binom{n}{n-k}')}.`,
        [`Picking ${k} of the ${n} to go also decides which ${n} − ${k} = ${n - k} stay behind.`, `So every group of ${k} matches exactly one group of ${n - k}.`], `${M(`\\binom{${n}}{${k}} = \\binom{${n}}{${n - k}}`)} → equal.`, `Pattern: "symmetry of combinations." Choosing k is the same as leaving out n − k.`) };
    const k2 = k + 1;
    return { stem: `Compare the two quantities.`, ...qc(M(`\\binom{${n}}{${k}}`), M(`\\binom{${n}}{${k2}}`), cmp(C(n, k), C(n, k2))),
      ...EX(`Computing both combinations fully takes time.`, `Going from ${M('\\binom{n}{k}')} to ${M('\\binom{n}{k+1}')} multiplies by ${M('\\frac{n - k}{k + 1}')}. If that factor is more than 1, the second is bigger; if less than 1, it's smaller. (Combinations grow up to the middle, ${M('k = n/2')}, then shrink.)`,
        [`Here the factor is ${M(`\\frac{${n} - ${k}}{${k} + 1} = ${fracTex(n - k, k2)}`)}.`, `${n - k} ${n - k > k2 ? '>' : n - k < k2 ? '<' : '='} ${k2}, so the factor is ${n - k > k2 ? 'greater than' : n - k < k2 ? 'less than' : 'equal to'} 1.`],
        `${M(`\\binom{${n}}{${k2}} = \\binom{${n}}{${k}} \\times ${fracTex(n - k, k2)}`)} → ${n - k > k2 ? 'B' : n - k < k2 ? 'A' : 'equal'}.`, `Pattern: "neighboring combinations." Compare using the ratio (n − k)/(k + 1).`) };
  });

  def({ id: 'qc-mean-add', area: 'Data Analysis', topic: 'Mean, median, mode', format: 'qc', diff: 'easy' }, () => {
    const n = ri(4, 10), m = ri(20, 80), x = m + ri(-15, 15);
    const newM = (n * m + x) / (n + 1);
    return {
      stem: `The average of ${n} numbers is ${m}. The number ${x} is added to the list.`,
      ...qc('The new average', M(m), cmp(newM, m)),
      ...EX(`We could compute the new average, but only the direction of the change matters.`, `Adding a value above the current average pulls the average up; below pulls it down; equal leaves it unchanged. No arithmetic is needed.`,
        [`The added number is ${x} and the current average is ${m}.`, x > m ? `${x} is above ${m}, so the average rises.` : x < m ? `${x} is below ${m}, so the average falls.` : `${x} equals the average, so it doesn't change.`],
        `${M(x)} vs ${M(m)} → ${x > m ? 'A' : x < m ? 'B' : 'equal'}.`, `Pattern: "effect of adding a value on the mean." Compare the new value with the old mean.`),
    };
  });

  def({ id: 'qc-prob', area: 'Data Analysis', topic: 'Probability', format: 'qc', diff: 'medium' }, () => {
    const t = pick(['coins', 'dice']);
    if (t === 'coins') {
      const n = ri(2, 4); const k = ri(2, 4);
      return { stem: `A fair coin is tossed.`, ...qc(`The probability of getting heads on all of ${n} tosses`, `The probability of getting at least one tail in ${k} tosses`, 'B'),
        ...EX(`The two probabilities involve different numbers of tosses and different events.`, `Independent tosses multiply. "At least one" is easiest through its complement: 1 − P(none).`,
          [`All heads in ${n} tosses: ${M(`\\left(\\frac{1}{2}\\right)^{${n}} = \\frac{1}{${2 ** n}}`)} — small.`, `At least one tail in ${k} tosses fails only if all ${k} are heads, which has probability ${M(`\\frac{1}{${2 ** k}}`)}. So ${M(`1 - \\frac{1}{${2 ** k}} = ${fracTex(2 ** k - 1, 2 ** k)}`)}.`],
          `${M(`\\frac{1}{${2 ** n}}`)} vs ${M(fracTex(2 ** k - 1, 2 ** k))} → B.`, `Pattern: "all vs at least one." "All" shrinks fast; "at least one" = 1 − P(none) is large.`) };
    }
    const s = ri(2, 12); const ways = 6 - Math.abs(7 - s); const s2 = ri(2, 12); const w2 = 6 - Math.abs(7 - s2); if (s === s2) return null;
    return { stem: `Two fair six-sided dice are rolled.`, ...qc(`The probability that the sum is ${s}`, `The probability that the sum is ${s2}`, cmp(ways, w2)),
      ...EX(`Listing all 36 outcomes takes a while.`, `Both probabilities have the same denominator (36 equally likely outcomes), so compare the numbers of ways. For two dice, the number of ways to roll sum ${M('s')} is ${M('6 - |7 - s|')}: 7 is the most common sum (6 ways), and each step away from 7 loses one way.`,
        [`Sum ${s} is ${Math.abs(7 - s)} away from 7, so it has 6 − ${Math.abs(7 - s)} = ${ways} ways.`, `Sum ${s2} is ${Math.abs(7 - s2)} away from 7, so it has 6 − ${Math.abs(7 - s2)} = ${w2} ways.`],
        `${ways} vs ${w2} ways → ${ways > w2 ? 'A' : 'B'}.`, `Pattern: "two-dice sums." Closer to 7 = more likely.`) };
  });

  def({ id: 'ma-median', area: 'Data Analysis', topic: 'Mean, median, mode', format: 'ma', diff: 'hard' }, () => {
    const xs = sample([2, 3, 5, 6, 8, 9, 11, 12, 14], 4).sort((a, b) => a - b);
    const lo = xs[1], hi = xs[2];
    const cands = [...new Set([xs[0], lo, Math.floor((lo + hi) / 2), hi, xs[3], lo - 1 > xs[0] ? lo - 1 : hi + 1])].sort((a, b) => a - b);
    return {
      stem: `A list consists of the numbers ${M(xs.join(', '))} and ${M('x')}, where ${M('x')} can be any number. Which of the following could be the median of the five numbers? Indicate <b>all</b> such values.`,
      ...ma(cands.map((c) => ({ text: M(c), ok: c >= lo && c <= hi }))),
      ...EX(`${M('x')} can be anything, so the median moves around as ${M('x')} changes.`, `The median of 5 sorted numbers is the 3rd one. Push the unknown to its extremes (very small, very large) to find the lowest and highest possible medians; values in between are reached by putting ${M('x')} itself in the middle.`,
        [`If ${M('x')} is very small, the sorted list starts with ${M('x')}, and the 3rd value is ${lo}.`, `If ${M('x')} is very large, it goes at the end, and the 3rd value is ${hi}.`, `If ${M('x')} is between ${lo} and ${hi}, ${M('x')} itself is the 3rd value, so every number from ${lo} to ${hi} is possible.`],
        `Median can be any value in ${M(`[${lo}, ${hi}]`)}.`,
        `Pattern: "median with an unknown." Test the unknown at both extremes.`),
    };
  });
};
