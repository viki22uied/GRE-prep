const L = require('./lib');
const { ri, pick, shuffle, sample, gcd, M, F, fracTex, tn, fmt, num, frac, mc, mcNum, ma, qc, cmp, clean, poly, sgn } = L;

module.exports = function (def) {
  const A = 'Algebra';

  // ---------- Simultaneous equations: add / subtract trick ----------
  def({ id: 'sim-add', area: A, topic: 'Simultaneous equations', format: 'ne', diff: 'medium' }, () => {
    let p, q; do { p = ri(2, 7); q = ri(1, 6); } while (p === q);
    const x = ri(-6, 12), y = ri(-6, 12); const a = p * x + q * y, b = q * x + p * y;
    const ask = pick(['sum', 'diff']);
    const ans = ask === 'sum' ? x + y : x - y;
    return {
      stem: `If ${M(`${p}x + ${q === 1 ? '' : q}y = ${a}`)} and ${M(`${q === 1 ? '' : q}x + ${p}y = ${b}`)}, what is the value of ${M(ask === 'sum' ? 'x + y' : 'x - y')}?`,
      answer: num(ans),
      fast: ask === 'sum'
        ? [`Add the equations: ${M(`${p + q}x + ${p + q}y = ${a + b}`)}.`, `Divide by ${p + q}: ${M(`x + y = ${ans}`)}.`]
        : [`Subtract the second from the first: ${M(`${p - q}x - ${p - q}y = ${a - b}`)}.`, `Divide by ${p - q}: ${M(`x - y = ${ans}`)}.`],
      why: `The question asks for a combination, not ${M('x')} and ${M('y')} separately — the symmetric coefficients let one add/subtract produce it directly.`,
    };
  });

  def({ id: 'diff-squares', area: A, topic: 'Factoring', format: 'ne', diff: 'easy' }, () => {
    const x = ri(3, 30), y = ri(1, x - 1);
    const variant = pick(['xy', 'sq']);
    if (variant === 'xy') {
      return {
        stem: `If ${M(`x + y = ${x + y}`)} and ${M(`x - y = ${x - y}`)}, what is the value of ${M('x^{2} - y^{2}')}?`,
        answer: num(x * x - y * y),
        fast: [`Factor: ${M('x^{2} - y^{2} = (x + y)(x - y)')}.`, `${M(`${x + y} \\times ${x - y} = ${x * x - y * y}`)}.`],
        why: `Recognizing the difference of squares means you never solve for ${M('x')} and ${M('y')}.`,
      };
    }
    const a = ri(21, 99), b = ri(1, 9);
    return {
      stem: `What is the value of ${M(`${a + b}^{2} - ${a - b}^{2}`)}?`,
      answer: num((a + b) ** 2 - (a - b) ** 2),
      fast: [`Difference of squares: ${M(`(${a + b} + ${a - b})(${a + b} - ${a - b})`)}.`, `${M(`${2 * a} \\times ${2 * b} = ${4 * a * b}`)}.`],
      why: `Squaring two 2–3 digit numbers is slow and error-prone; factoring makes it one small product.`,
    };
  });

  def({ id: 'square-identity', area: A, topic: 'Factoring', format: 'ne', diff: 'medium' }, () => {
    const x = ri(-5, 9), y = ri(-5, 9); if (x === y) return null;
    const S = (x + y) ** 2, P = x * y;
    const v = pick(['plus', 'minus']);
    const ans = v === 'plus' ? x * x + y * y : (x - y) ** 2;
    return {
      stem: `If ${M(`(x + y)^{2} = ${S}`)} and ${M(`xy = ${P}`)}, what is the value of ${M(v === 'plus' ? 'x^{2} + y^{2}' : '(x - y)^{2}')}?`,
      answer: num(ans),
      fast: v === 'plus'
        ? [`${M('(x + y)^{2} = x^{2} + 2xy + y^{2}')}.`, `So ${M(`x^{2} + y^{2} = ${S} - 2(${P}) = ${ans}`)}.`]
        : [`${M('(x - y)^{2} = (x + y)^{2} - 4xy')}.`, `${M(`${S} - 4(${P}) = ${ans}`)}.`],
      why: `The three special products (${M('(a\\pm b)^{2}, (a+b)(a-b)')}) answer these in one line without finding ${M('x')} or ${M('y')}.`,
    };
  });

  // ---------- Quadratics ----------
  def({ id: 'quad-roots-ma', area: A, topic: 'Quadratic equations', format: 'ma', diff: 'medium' }, () => {
    let p, q; do { p = ri(-9, 9); q = ri(-9, 9); } while (p === q || p === 0 || q === 0 || p === -q);
    const eq = poly([1, -(p + q), p * q]) + ' = 0';
    const cands = new Set([p, q, -p, -q, p + q, p * q > 20 ? p + 1 : p * q]);
    let vals = [...cands].slice(0, 6); while (vals.length < 5) vals.push(vals[vals.length - 1] + 1);
    vals = [...new Set(vals)].sort((a, b) => a - b);
    return {
      stem: `Which of the following are solutions of ${M(eq)}? Indicate <b>all</b> such values.`,
      ...ma(vals.map((v) => ({ text: M(v), ok: v === p || v === q }))),
      fast: [`The roots multiply to the constant ${M(p * q)} and add to the negative of the ${M('x')}-coefficient, ${M(p + q)}: that's ${M(p)} and ${M(q)}.`, `${M(`(x ${sgn(-p)})(x ${sgn(-q)}) = 0`)} → ${M(`x = ${p}`)} or ${M(`x = ${q}`)}.`],
      why: `Sum-and-product factoring takes seconds; the quadratic formula is never needed for GRE-style integer roots.`,
    };
  });

  def({ id: 'quad-factor-simplify', area: A, topic: 'Factoring', format: 'mc', diff: 'easy' }, () => {
    let p, q; do { p = ri(-8, 9); q = ri(-8, 9); } while (p === q || p === 0 || q === 0);
    const num_ = poly([1, p + q, p * q]);
    const X = (k) => M(k === 0 ? 'x' : `x ${sgn(k)}`);
    const c = mc(X(q), [X(-q), X(p), X(p + q), X(p * q), M(`x^{2} ${sgn(q)}`)]);
    return {
      stem: `For ${M(`x \\neq ${-p}`)}, ${M(`\\frac{${num_}}{x ${sgn(p)}}`)} is equal to which of the following?`,
      ...c,
      fast: [`Factor the top: numbers with product ${M(p * q)} and sum ${M(p + q)} are ${M(p)} and ${M(q)}.`, `${M(`\\frac{(x ${sgn(p)})(x ${sgn(q)})}{x ${sgn(p)}} = x ${sgn(q)}`)}.`],
      why: `Factoring and cancelling beats polynomial long division; you can also check by plugging ${M('x = 0')}: ${M(fracTex(p * q, p) + ' = ' + q)}.`,
    };
  });

  // ---------- Exponent equations ----------
  def({ id: 'exp-equation', area: A, topic: 'Exponent equations', format: 'ne', diff: 'medium' }, () => {
    const [b1, k1, b2, k2, pr] = pick([[4, 2, 8, 3, 2], [9, 2, 27, 3, 3], [8, 3, 16, 4, 2], [25, 2, 125, 3, 5], [4, 2, 32, 5, 2], [9, 2, 81, 4, 3]]);
    // b1^(x + c) = b2^m  ->  k1(x + c) = k2 m
    let x, c, m; do { x = ri(-4, 8); c = ri(-3, 5); } while ((k1 * (x + c)) % k2 !== 0);
    m = (k1 * (x + c)) / k2;
    return {
      stem: `If ${M(`${b1}^{x ${sgn(c)}} = ${b2}^{${m}}`)}, what is the value of ${M('x')}?`,
      answer: num(x),
      fast: [`Rewrite both sides with base ${pr}: ${M(`${pr}^{${k1}(x ${sgn(c)})} = ${pr}^{${k2 * m}}`)}.`, `Set exponents equal: ${M(`${k1}(x ${sgn(c)}) = ${k2 * m}`)} → ${M(`x = ${x}`)}.`],
      why: `A common base turns an exponential equation into a one-line linear equation — no logarithms needed.`,
    };
  });

  // ---------- Functions ----------
  def({ id: 'func-compose', area: A, topic: 'Functions', format: 'ne', diff: 'medium' }, () => {
    const a = ri(1, 3), b = ri(-5, 5), c = ri(-6, 6), p = ri(2, 5), q = ri(-6, 6), t = ri(-3, 4);
    const g = p * t + q; const f = a * g * g + b * g + c;
    return {
      stem: `If ${M(`f(x) = ${poly([a, b, c])}`)} and ${M(`g(x) = ${poly([p, q])}`)}, what is the value of ${M(`f(g(${t}))`)}?`,
      answer: num(f),
      fast: [`Work inside-out: ${M(`g(${t}) = ${p}(${t}) ${sgn(q)} = ${g}`)}.`, `${M(`f(${g}) = ${a === 1 ? '' : a}(${g})^{2} ${sgn(b)}(${g}) ${sgn(c)} = ${f}`)}.`],
      why: `Plug numbers in as soon as possible — building the general formula for ${M('f(g(x))')} wastes time.`,
    };
  });

  def({ id: 'custom-op', area: A, topic: 'Functions', format: 'ne', diff: 'easy' }, () => {
    const ops = [
      ['a \\star b = ab + a - b', (a, b) => a * b + a - b],
      ['a \\star b = a^{2} - 2b', (a, b) => a * a - 2 * b],
      ['a \\star b = \\frac{a + b}{2} + ab', (a, b) => (a + b) / 2 + a * b],
      ['a \\star b = 3a - b^{2}', (a, b) => 3 * a - b * b],
      ['a \\star b = (a - b)^{2} + a', (a, b) => (a - b) ** 2 + a],
    ];
    const [d, fn] = pick(ops); const u = ri(-3, 5), v = ri(-3, 5), w = ri(-2, 4);
    const inner = fn(u, v), out = fn(inner, w);
    if (!Number.isInteger(out * 2)) return null;
    return {
      stem: `For all numbers ${M('a')} and ${M('b')}, the operation ${M('\\star')} is defined by ${M(d)}. What is the value of ${M(`(${u} \\star ${v}) \\star ${w}`)}?`,
      answer: num(out),
      fast: [`Innermost first: ${M(`${u} \\star ${v} = ${fmt(inner)}`)}.`, `Then ${M(`${fmt(inner)} \\star ${w} = ${fmt(out)}`)}.`],
      why: `Treat the symbol as a plug-in machine: substitute carefully in order, with parentheses around negatives.`,
    };
  });

  // ---------- Inequalities ----------
  def({ id: 'ineq-ma', area: A, topic: 'Inequalities', format: 'ma', diff: 'medium' }, () => {
    const k = pick([2, 3, 4, -2, -3]); const b = ri(-5, 5); const lo = ri(-12, 0), hi = lo + ri(8, 20);
    const xl = (lo - b) / k, xh = (hi - b) / k; const [mn, mx] = k > 0 ? [xl, xh] : [xh, xl];
    const vals = new Set(); for (let i = 0; i < 40 && vals.size < 6; i++) vals.add(ri(Math.floor(mn) - 4, Math.ceil(mx) + 4));
    const vs = [...vals].sort((a, b) => a - b); const ok = (x) => x > mn && x < mx;
    if (!vs.some(ok) || vs.every(ok)) return null;
    return {
      stem: `If ${M(`${lo} < ${k}x ${sgn(b)} < ${hi}`)}, which of the following could be the value of ${M('x')}? Indicate <b>all</b> such values.`,
      ...ma(vs.map((v) => ({ text: M(v), ok: ok(v) }))),
      fast: [`Subtract ${b} from all three parts: ${M(`${lo - b} < ${k}x < ${hi - b}`)}.`, `Divide by ${k}${k < 0 ? ' and <b>flip</b> the signs' : ''}: ${M(`${fracTex(k > 0 ? lo - b : hi - b, k)} < x < ${fracTex(k > 0 ? hi - b : lo - b, k)}`)}.`, `Pick the choices strictly inside.`],
      why: `Solve the compound inequality once instead of testing every choice in the original.${k < 0 ? ' Dividing by a negative flips the direction — the main trap.' : ''}`,
    };
  });

  def({ id: 'ineq-count', area: A, topic: 'Inequalities', format: 'ne', diff: 'medium' }, () => {
    const a = ri(-8, 10), b = ri(2, 12); const strict = pick([true, false]);
    const ans = strict ? 2 * b - 1 : 2 * b + 1;
    return {
      stem: `How many integers ${M('x')} satisfy ${M(`|x ${sgn(-a)}| ${strict ? '<' : '\\le'} ${b}`)}?`.replace('x + 0', 'x').replace('x - 0', 'x'),
      answer: num(ans),
      fast: [`${M(`|x - ${a}| ${strict ? '<' : '\\le'} ${b}`)} means ${M('x')} is within ${b} of ${a}: ${M(`${a - b} ${strict ? '<' : '\\le'} x ${strict ? '<' : '\\le'} ${a + b}`)}.`, `Integers: ${strict ? `${M(`${a - b + 1}`)} to ${M(`${a + b - 1}`)}` : `${M(a - b)} to ${M(a + b)}`} → ${M(ans)}.`],
      why: `Read absolute value as distance on the number line; counting integers in a range is (last − first) + 1.`,
    };
  });

  def({ id: 'ineq-qc', area: A, topic: 'Inequalities', format: 'qc', diff: 'easy' }, () => {
    const k = ri(2, 6), b = ri(-8, 8), c = ri(-10, 20);
    const flip = pick([true, false]);
    const lhs = flip ? `-${k}x ${sgn(b)}` : `${k}x ${sgn(b)}`;
    const trueBound = flip ? (b - c) / k : (c - b) / k; // flip: x < trueBound, else x > trueBound
    const qb = Math.round(trueBound) + pick([0, 0, -1, 1]);
    const rel = !flip ? (qb <= trueBound ? 'A' : 'D') : (qb >= trueBound ? 'B' : 'D');
    return {
      stem: `${M(`${lhs} > ${c}`)}`,
      ...qc(M('x'), M(qb), rel),
      fast: [`Solve: ${M(flip ? `-${k}x > ${c - b}` : `${k}x > ${c - b}`)}.`, `${M(flip ? `x < ${fracTex(b - c, k)}` : `x > ${fracTex(c - b, k)}`)}${flip ? ' (sign flips when dividing by a negative)' : ''}.`, rel === 'D' ? `${M('x')} can be on either side of ${qb}, so it cannot be determined.` : `So ${M('x')} is always ${flip ? 'less' : 'greater'} than ${qb}.`],
      why: `Solve the inequality once and compare the boundary with Quantity B.`,
    };
  });

  // ---------- QC plug-in patterns ----------
  // tests are written with $...$ for math; h() converts them to KaTeX delimiters
  const patterns = [
    { A: 'x^{2}', B: 'x', conds: [['x > 1', 'A', 'Try $x = 2$: $4 > 2$. Try $x = 10$: $100 > 10$.'], ['0 < x < 1', 'B', 'Try $x = \\frac{1}{2}$: $\\frac{1}{4} < \\frac{1}{2}$. Squaring a fraction makes it smaller.'], ['x < 0', 'A', 'Try $x = -1$: $1 > -1$. A square is never negative, so it beats any negative $x$.'], ['x \\neq 0', 'D', 'Try $x = 2$: $4 > 2$ (A). Try $x = \\frac{1}{2}$: $\\frac{1}{4} < \\frac{1}{2}$ (B).']] },
    { A: 'x^{3}', B: 'x^{2}', conds: [['x < 0', 'B', 'Try $x = -1$: $-1 < 1$. An odd power keeps the negative sign; an even power is positive.'], ['x > 1', 'A', 'Try $x = 2$: $8 > 4$.'], ['0 < x < 1', 'B', 'Try $x = \\frac{1}{2}$: $\\frac{1}{8} < \\frac{1}{4}$.'], ['x \\neq 0', 'D', 'Try $x = 2$: $8 > 4$ (A). Try $x = -1$: $-1 < 1$ (B).']] },
    { A: '(x + k)^{2}', B: 'x^{2} + K', conds: [['x > 0', 'A', 'Expand: $(x + k)^{2} = x^{2} + 2kx + K$. The only difference is $2kx$, which is positive when $x > 0$.'], ['x < 0', 'B', 'Expand: the difference A − B is $2kx$, which is negative when $x < 0$.'], ['x \\text{ is a real number}', 'D', 'Difference A − B $= 2kx$: $x = 1$ makes A bigger, $x = -1$ makes B bigger.']] },
    { A: '\\frac{1}{x}', B: 'x', conds: [['x > 1', 'B', 'Try $x = 2$: $\\frac{1}{2} < 2$.'], ['0 < x < 1', 'A', 'Try $x = \\frac{1}{2}$: $2 > \\frac{1}{2}$.'], ['x < -1', 'A', 'Try $x = -2$: $-\\frac{1}{2} > -2$.'], ['-1 < x < 0', 'B', 'Try $x = -\\frac{1}{2}$: $-2 < -\\frac{1}{2}$.']] },
    { A: 'kx', B: '\\frac{x}{k}', conds: [['x > 0', 'A', 'Try $x = 1$: $k > \\frac{1}{k}$.'], ['x < 0', 'B', 'Try $x = -1$: $-k < -\\frac{1}{k}$.'], ['x \\neq 0', 'D', 'Positive $x$ makes A bigger; negative $x$ makes B bigger.']] },
    { A: '\\frac{x + 1}{y + 1}', B: '\\frac{x}{y}', conds: [['x > y > 0', 'B', 'Try $x = 2, y = 1$: $\\frac{3}{2} < 2$. Adding 1 to top and bottom pulls a fraction toward 1.'], ['0 < x < y', 'A', 'Try $x = 1, y = 2$: $\\frac{2}{3} > \\frac{1}{2}$. A fraction below 1 moves up toward 1.'], ['x = y > 0', 'C', 'Both fractions equal 1.']] },
    { A: '2^{n}', B: 'n^{2}', conds: [['n \\text{ is an integer greater than } 4', 'A', 'Try $n = 5$: $32 > 25$; $n = 6$: $64 > 36$ — the exponential pulls away.'], ['n \\text{ is a positive integer}', 'D', 'Try $n = 3$: $8 < 9$ (B). Try $n = 5$: $32 > 25$ (A).'], ['n = 4', 'C', '$2^{4} = 16 = 4^{2}$.']] },
    { A: '|x| + |y|', B: '|x + y|', conds: [['x > 0 \\text{ and } y > 0', 'C', 'Same signs: both sides equal $x + y$.'], ['x > 0 \\text{ and } y < 0', 'A', 'Try $x = 1, y = -1$: $2 > 0$. Opposite signs cancel inside the absolute value.'], ['x \\text{ and } y \\text{ are nonzero}', 'D', '$x = y = 1$ gives equal; $x = 1, y = -1$ gives A.']] },
    { A: '-x', B: 'x', conds: [['x < 0', 'A', 'Try $x = -3$: $3 > -3$.'], ['x > 0', 'B', 'Try $x = 3$: $-3 < 3$.'], ['x^{2} = x', 'D', '$x^{2} = x$ means $x = 0$ or $x = 1$. $x = 0$: equal; $x = 1$: B.']] },
    { A: 'x^{2} - 1', B: '(x - 1)(x + 1)', conds: [['x \\text{ is a real number}', 'C', 'Difference of squares: $(x - 1)(x + 1) = x^{2} - 1$ for every $x$.']] },
  ];
  const h = (s) => s.replace(/\$([^$]+)\$/g, (m, x) => M(x));
  def({ id: 'qc-plugin', area: A, topic: 'QC: plugging values', format: 'qc', diff: 'medium' }, () => {
    const p = pick(patterns); const [cond, rel, test] = pick(p.conds); const k = pick([2, 3, 4, 5]);
    const sub = (s) => s.replace(/2kx/g, `${2 * k}x`).replace(/K/g, k * k).replace(/\\frac\{1\}\{k\}/g, `\\frac{1}{${k}}`).replace(/\bk\b|k(?=x|\s|\$|,|\.|<|>)/g, k);
    return {
      stem: M(cond),
      ...qc(M(sub(p.A)), M(sub(p.B)), rel),
      fast: [`Test values allowed by the condition — try 0, 1, a negative, a fraction and a big number where legal.`, h(sub(test)),
        rel === 'D' ? `Different values give different winners → cannot be determined.` : rel === 'C' ? `Always equal.` : `Every allowed value gives the same winner → Quantity ${rel}.`],
      why: `Plugging 2–3 cleverly chosen numbers settles a QC faster than algebraic proof, and exposes "cannot be determined" quickly.`,
    };
  }, 48);

  // ---------- Coordinate geometry ----------
  def({ id: 'slope', area: A, topic: 'Coordinate geometry', format: 'mc', diff: 'easy' }, () => {
    let x1, y1, x2, y2; do { x1 = ri(-6, 6); y1 = ri(-6, 6); x2 = ri(-6, 8); y2 = ri(-6, 8); } while (x1 === x2 || y1 === y2);
    const dy = y2 - y1, dx = x2 - x1;
    const c = mc(F(dy, dx), [F(dx, dy), F(-dy, dx), F(-dx, dy), F(y2 + y1, x2 + x1 || 1), F(dy + 1, dx), F(dy - 1, dx), F(dy, dx + 1), F(2 * dy, dx), F(dy + 2, dx)]);
    return {
      stem: `What is the slope of the line that passes through the points ${M(`(${x1}, ${y1})`)} and ${M(`(${x2}, ${y2})`)}?`,
      ...c,
      fast: [`Slope ${M('= \\frac{\\Delta y}{\\Delta x}')}.`, `${M(`\\frac{${y2} - (${y1})}{${x2} - (${x1})} = ${fracTex(dy, dx)}`)}.`],
      why: `Rise over run directly; the common traps are flipping to run over rise or mixing up the order of subtraction.`,
    };
  });

  def({ id: 'intercept-area', area: A, topic: 'Coordinate geometry', format: 'ne', diff: 'medium' }, () => {
    const a = ri(1, 6), b = ri(1, 6); const c = a * b * ri(1, 4) * pick([1, 2]);
    const xi = c / a, yi = c / b;
    return {
      stem: `The line ${M(`${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c}`)} and the two coordinate axes form a triangle. What is the area of the triangle?`,
      answer: num((xi * yi) / 2),
      fast: [`x-intercept: set ${M('y = 0')} → ${M(`x = ${fmt(xi)}`)}. y-intercept: set ${M('x = 0')} → ${M(`y = ${fmt(yi)}`)}.`, `Right triangle: ${M(`\\frac{1}{2} \\cdot ${fmt(xi)} \\cdot ${fmt(yi)} = ${fmt((xi * yi) / 2)}`)}.`],
      why: `Intercepts come straight from zeroing one variable — no need to rewrite in ${M('y = mx + b')} form.`,
    };
  });

  def({ id: 'perp-slope', area: A, topic: 'Coordinate geometry', format: 'mc', diff: 'easy' }, () => {
    let p, q; do { p = ri(-6, 6); q = ri(1, 5); } while (p === 0 || gcd(p, q) !== 1 || Math.abs(p) === q);
    const b = ri(-9, 9); const rel = pick(['perpendicular', 'parallel']);
    const ans = rel === 'perpendicular' ? F(-q, p) : F(p, q);
    const c = mc(ans, [F(q, p), F(-p, q), F(p, q), F(-q, p), M(b), F(q, -p * 2)]);
    return {
      stem: `Line ${M('k')} has equation ${M(`y = ${fracTex(p, q)}x ${sgn(b)}`)}. What is the slope of a line ${rel} to line ${M('k')}?`,
      ...c,
      fast: rel === 'perpendicular' ? [`Perpendicular slopes are negative reciprocals.`, `${M(fracTex(p, q))} → ${M(fracTex(-q, p))}.`] : [`Parallel lines have equal slopes: ${M(fracTex(p, q))}.`],
      why: `No graphing needed: flip and negate for perpendicular; copy for parallel.`,
    };
  });

  def({ id: 'distance-points', area: A, topic: 'Coordinate geometry', format: 'ne', diff: 'easy' }, () => {
    const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20]]);
    const x1 = ri(-5, 5), y1 = ri(-5, 5); const sx = pick([1, -1]), sy = pick([1, -1]);
    const [dx, dy] = pick([true, false]) ? [a, b] : [b, a];
    return {
      stem: `What is the distance between the points ${M(`(${x1}, ${y1})`)} and ${M(`(${x1 + sx * dx}, ${y1 + sy * dy})`)} in the ${M('xy')}-plane?`,
      answer: num(c),
      fast: [`Horizontal gap ${M(dx)}, vertical gap ${M(dy)}.`, `Recognize the Pythagorean triple ${M(`${a}\\text{-}${b}\\text{-}${c}`)} → distance ${M(c)}.`],
      why: `Spotting a known triple skips squaring and square-rooting.`,
    };
  });

  // ---------- Word problems ----------
  def({ id: 'tickets', area: A, topic: 'Word problems', format: 'ne', diff: 'medium' }, () => {
    let p1, p2; do { p1 = ri(4, 12); p2 = ri(6, 25); } while (p2 <= p1);
    const n2 = ri(10, 90), n1 = ri(10, 120); const N = n1 + n2, R = n1 * p1 + n2 * p2;
    return {
      stem: `A theater sold ${N} tickets for a total of ${tn(R)} dollars. Adult tickets cost ${p2} dollars each and student tickets cost ${p1} dollars each. How many adult tickets were sold?`,
      answer: num(n2),
      fast: [`Pretend all ${N} were student tickets: ${M(`${N} \\times ${p1} = ${tn(N * p1)}`)}.`, `Extra money ${M(`${tn(R)} - ${tn(N * p1)} = ${tn(R - N * p1)}`)}; each adult ticket adds ${M(p2 - p1)}.`, `${M(`${tn(R - N * p1)} \\div ${p2 - p1} = ${n2}`)} adult tickets.`],
      why: `The "assume all cheap" trick is a single-variable shortcut for a two-equation system.`,
    };
  });

  def({ id: 'ages', area: A, topic: 'Word problems', format: 'ne', diff: 'medium' }, () => {
    const k = pick([3, 4, 5]); const B = ri(3, 14); const n = B * (k - 2);
    return {
      stem: `Rosa is now ${k} times as old as her nephew. In ${n} years, Rosa will be twice as old as her nephew. How old is Rosa now?`,
      answer: num(k * B),
      fast: [`Nephew now ${M('= b')}, Rosa ${M(`= ${k}b`)}.`, `${M(`${k}b + ${n} = 2(b + ${n})`)} → ${M(`${k - 2 === 1 ? '' : k - 2}b = ${n}`)} → ${M(`b = ${B}`)}.`, `Rosa ${M(`= ${k} \\times ${B} = ${k * B}`)}.`],
      why: `Use one variable (the younger person) — two variables and two equations is double the work.`,
    };
  });

  def({ id: 'consec-find', area: A, topic: 'Word problems', format: 'ne', diff: 'easy' }, () => {
    const k = pick([3, 4, 5, 6, 7]); const start = ri(-5, 40); const s = (k * (2 * start + k - 1)) / 2;
    const ask = pick(['greatest', 'least']);
    return {
      stem: `The sum of ${k} consecutive integers is ${s}. What is the ${ask} of these integers?`,
      answer: num(ask === 'greatest' ? start + k - 1 : start),
      fast: [`Average ${M(`= ${s} \\div ${k} = ${fmt(s / k)}`)} — that's the middle of the list.`, `Step out ${M(fmt((k - 1) / 2))} from the middle: ${M(ask === 'greatest' ? start + k - 1 : start)}.`],
      why: `Consecutive integers are centered on their average — no equation with ${M('n + (n+1) + \\dots')} needed.`,
    };
  });

  def({ id: 'mixture', area: A, topic: 'Word problems', format: 'ne', diff: 'hard' }, () => {
    const [c1, c2] = pick([[10, 40], [20, 50], [15, 45], [10, 30], [25, 50], [20, 60], [30, 70]]);
    const v1 = ri(1, 8) * 5, v2 = ri(1, 8) * 5; const mix = (c1 * v1 + c2 * v2) / (v1 + v2);
    if (!Number.isInteger(mix)) return null;
    return {
      stem: `How many liters of a ${c2}% salt solution must be added to ${v1} liters of a ${c1}% salt solution to produce a ${mix}% salt solution?`,
      answer: num(v2),
      fast: [`Weighted-average distances: ${c1}% is ${mix - c1} below the target, ${c2}% is ${c2 - mix} above.`, `Volumes are in the inverse ratio: ${M(`\\frac{V_{${c2}}}{V_{${c1}}} = \\frac{${mix - c1}}{${c2 - mix}}`)}.`, `${M(`V = ${v1} \\times ${fracTex(mix - c1, c2 - mix)} = ${v2}`)} liters.`],
      why: `The "balance point" of a weighted average gives the ratio instantly; setting up amount-of-salt equations takes longer.`,
    };
  });

  def({ id: 'linear-solve-qc', area: A, topic: 'Linear equations', format: 'qc', diff: 'easy' }, () => {
    const x = ri(-6, 10), a = ri(2, 7), b = ri(-10, 10); const y = ri(-6, 10), c = ri(2, 7), d = ri(-10, 10);
    return {
      stem: `${M(`${a}x ${sgn(b)} = ${a * x + b}`)} and ${M(`${c}y ${sgn(d)} = ${c * y + d}`)}`,
      ...qc(M('x'), M('y'), cmp(x, y)),
      fast: [`${M(`x = \\frac{${a * x + b} ${sgn(-b)}}{${a}} = ${x}`)}.`, `${M(`y = \\frac{${c * y + d} ${sgn(-d)}}{${c}} = ${y}`)}.`],
      why: `Each equation has one solution, so solve both quickly and compare — D is impossible here.`,
    };
  });
};
