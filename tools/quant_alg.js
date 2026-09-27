const L = require('./lib');
const { ri, pick, shuffle, sample, gcd, M, F, fracTex, tn, fmt, num, frac, mc, mcNum, ma, qc, cmp, clean, poly, sgn, EX, par } = L;

module.exports = function (def) {
  const A = 'Algebra';

  // ---------- Simultaneous equations: add / subtract trick ----------
  def({ id: 'sim-add', area: A, topic: 'Simultaneous equations', format: 'ne', diff: 'medium' }, () => {
    let p, q; do { p = ri(2, 7); q = ri(1, 6); } while (p === q);
    const x = ri(-6, 12), y = ri(-6, 12); const a = p * x + q * y, b = q * x + p * y;
    const ask = pick(['sum', 'diff']); const ans = ask === 'sum' ? x + y : x - y;
    const e1 = `${p}x + ${q === 1 ? '' : q}y = ${a}`, e2 = `${q === 1 ? '' : q}x + ${p}y = ${b}`;
    return {
      stem: `If ${M(e1)} and ${M(e2)}, what is the value of ${M(ask === 'sum' ? 'x + y' : 'x - y')}?`,
      answer: num(ans),
      ...EX(`Solving for ${M('x')} and ${M('y')} separately (substitution or elimination) takes several steps, and the question doesn't even ask for them individually.`,
        `When a question asks for a combination like ${M('x + y')} or ${M('x - y')}, look at the coefficients first. If the equations are mirror images (the coefficients swap places), adding them gives equal coefficients on ${M('x')} and ${M('y')}, and so does subtracting; then one division finishes the job.`,
        ask === 'sum'
          ? [`The coefficients are ${p} and ${q} in the first equation and ${q} and ${p} in the second — the same two numbers, swapped.`,
            `Add the equations: ${M('x')} gets ${p} + ${q} = ${p + q}, and ${M('y')} also gets ${q} + ${p} = ${p + q}. The right sides add to ${a} + ${par(b)} = ${a + b}. So ${M(`${p + q}x + ${p + q}y = ${a + b}`)}.`,
            `Everything on the left has a common factor of ${p + q}, so dividing by ${p + q} leaves exactly ${M('x + y')}.`]
          : [`The coefficients are ${p} and ${q} in the first equation and ${q} and ${p} in the second — the same two numbers, swapped.`,
            `Subtract the second equation from the first: ${M('x')} gets ${p} − ${q} = ${p - q}, and ${M('y')} gets ${q} − ${p} = ${q - p}. The right sides give ${a} − ${par(b)} = ${a - b}. So ${M(`${p - q}x - ${Math.abs(p - q)}y = ${a - b}`.replace(/^1x/, 'x').replace(/ 1y/, ' y'))}${p - q < 0 ? ' (after multiplying through by −1 if you prefer positive coefficients)' : ''}.`,
            `That's ${p - q} times ${M('(x - y)')}, so dividing by ${p - q} leaves exactly ${M('x - y')}.`],
        `${M(`${ask === 'sum' ? `x + y = \\frac{${a + b}}{${p + q}}` : `x - y = \\frac{${a - b}}{${p - q}}`} = ${ans}`)}`,
        `Pattern: "mirror-image equations, asked for x ± y." Add (for the sum) or subtract (for the difference), then divide. Never solve for each variable.`),
    };
  });

  def({ id: 'diff-squares', area: A, topic: 'Factoring', format: 'ne', diff: 'easy' }, () => {
    const variant = pick(['xy', 'sq']);
    if (variant === 'xy') {
      const x = ri(3, 30), y = ri(1, x - 1);
      return {
        stem: `If ${M(`x + y = ${x + y}`)} and ${M(`x - y = ${x - y}`)}, what is the value of ${M('x^{2} - y^{2}')}?`,
        answer: num(x * x - y * y),
        ...EX(`It looks as if we need ${M('x')} and ${M('y')} first and then have to square them — but the question hands us exactly the two pieces we need.`,
          `Memorize the identity ${M('x^{2} - y^{2} = (x + y)(x - y)')}. Whenever a question gives you ${M('x + y')} and ${M('x - y')} and asks for ${M('x^{2} - y^{2}')} (or the reverse), just multiply.`,
          [`Factor the expression: ${M('x^{2} - y^{2} = (x + y)(x - y)')}.`,
            `We are told ${M('x + y')} is ${x + y} and ${M('x - y')} is ${x - y}, so substitute those two numbers directly.`],
          `${M(`${x + y} \\times ${x - y} = ${x * x - y * y}`)}`,
          `Pattern: difference of squares. Seeing ${M('x^{2} - y^{2}')} next to ${M('x + y')} or ${M('x - y')} is the signal to factor.`),
      };
    }
    const a = ri(21, 99), b = ri(1, 9);
    return {
      stem: `What is the value of ${M(`${a + b}^{2} - ${a - b}^{2}`)}?`,
      answer: num((a + b) ** 2 - (a - b) ** 2),
      ...EX(`Squaring two two-digit numbers by hand is slow and error-prone.`,
        `A difference of two squares always factors: ${M('m^{2} - n^{2} = (m + n)(m - n)')}. The sum and the difference are usually much friendlier numbers than the squares.`,
        [`Here ${M(`m = ${a + b}`)} and ${M(`n = ${a - b}`)}.`,
          `Their sum is ${a + b} + ${a - b} = ${2 * a}, and their difference is ${a + b} − ${a - b} = ${2 * b}.`,
          `So the expression equals ${M(`${2 * a} \\times ${2 * b}`)}.`],
        `${M(`${2 * a} \\times ${2 * b} = ${4 * a * b}`)}`,
        `Pattern: "big square minus big square." Factor into (sum)(difference) instead of squaring.`),
    };
  });

  def({ id: 'square-identity', area: A, topic: 'Factoring', format: 'ne', diff: 'medium' }, () => {
    const x = ri(-5, 9), y = ri(-5, 9); if (x === y) return null;
    const S = (x + y) ** 2, P = x * y; const v = pick(['plus', 'minus']);
    const ans = v === 'plus' ? x * x + y * y : (x - y) ** 2;
    return {
      stem: `If ${M(`(x + y)^{2} = ${S}`)} and ${M(`xy = ${P}`)}, what is the value of ${M(v === 'plus' ? 'x^{2} + y^{2}' : '(x - y)^{2}')}?`,
      answer: num(ans),
      ...EX(`We aren't given ${M('x')} or ${M('y')}, only combinations of them.`,
        `The special products connect these combinations: ${M('(x + y)^{2} = x^{2} + 2xy + y^{2}')} and ${M('(x - y)^{2} = x^{2} - 2xy + y^{2}')}. Expand the one you're given and it will contain the one you want.`,
        v === 'plus'
          ? [`Expand what we're given: ${M('(x + y)^{2} = x^{2} + y^{2} + 2xy')}.`,
            `So ${M('x^{2} + y^{2}')} is the given square minus ${M('2xy')}. With ${M(`xy = ${P}`)}, ${M('2xy')} is ${M(`2 \\times ${par(P)} = ${2 * P}`)}.`]
          : [`Compare the two expansions: ${M('(x + y)^{2}')} contains ${M('+2xy')} and ${M('(x - y)^{2}')} contains ${M('-2xy')}, so they differ by ${M('4xy')}.`,
            `So ${M('(x - y)^{2} = (x + y)^{2} - 4xy')}. With ${M(`xy = ${P}`)}, ${M('4xy')} is ${M(`4 \\times ${par(P)} = ${4 * P}`)}.`],
        `${M(v === 'plus' ? `${S} - ${par(2 * P)} = ${ans}` : `${S} - ${par(4 * P)} = ${ans}`)}`,
        `Pattern: "given (x ± y)² and xy." Expand the square you know; the answer is one subtraction away.`),
    };
  });

  // ---------- Quadratics ----------
  def({ id: 'quad-roots-ma', area: A, topic: 'Quadratic equations', format: 'ma', diff: 'medium' }, () => {
    let p, q; do { p = ri(-9, 9); q = ri(-9, 9); } while (p === q || p === 0 || q === 0 || p === -q);
    const eq = poly([1, -(p + q), p * q]) + ' = 0';
    let vals = [...new Set([p, q, -p, -q, p + q, p * q > 20 ? p + 1 : p * q])].slice(0, 6); while (vals.length < 5) vals.push(vals[vals.length - 1] + 1);
    vals = [...new Set(vals)].sort((a, b) => a - b);
    return {
      stem: `Which of the following are solutions of ${M(eq)}? Indicate <b>all</b> such values.`,
      ...ma(vals.map((v) => ({ text: M(v), ok: v === p || v === q }))),
      ...EX(`The quadratic formula would work but is slow, and the answer choices include tempting sign-flipped values.`,
        `For ${M('x^{2} + bx + c = 0')}, look for two numbers that multiply to ${M('c')} and add to ${M('b')}. Then the equation factors as ${M('(x + m)(x + n) = 0')}, and the solutions are ${M('-m')} and ${M('-n')} — the opposites of the two numbers you found.`,
        [`Here ${M('b = ' + -(p + q))} and ${M('c = ' + p * q)}. We need two numbers that multiply to ${p * q} and add to ${-(p + q)}: those are ${-p} and ${-q}, because ${par(-p)} × ${par(-q)} = ${p * q} and ${par(-p)} + ${par(-q)} = ${-(p + q)}.`,
          `So the equation factors as ${M(`(x ${sgn(-p)})(x ${sgn(-q)}) = 0`)}.`,
          `A product is zero only when a factor is zero: ${M(`x ${sgn(-p)} = 0`)} gives ${M(`x = ${p}`)}, and ${M(`x ${sgn(-q)} = 0`)} gives ${M(`x = ${q}`)}.`],
        `Solutions: ${M(p)} and ${M(q)}.`,
        `Pattern: "integer roots of a quadratic." Product-and-sum factoring, then flip the signs. The trap choices are the unflipped numbers.`),
    };
  });

  def({ id: 'quad-factor-simplify', area: A, topic: 'Factoring', format: 'mc', diff: 'easy' }, () => {
    let p, q; do { p = ri(-8, 9); q = ri(-8, 9); } while (p === q || p === 0 || q === 0);
    const X = (k) => M(k === 0 ? 'x' : `x ${sgn(k)}`);
    return {
      stem: `For ${M(`x \\neq ${-p}`)}, ${M(`\\frac{${poly([1, p + q, p * q])}}{x ${sgn(p)}}`)} is equal to which of the following?`,
      ...mc(X(q), [X(-q), X(p), X(p + q), X(p * q), M(`x^{2} ${sgn(q)}`)]),
      ...EX(`You can't cancel terms across a fraction bar piece by piece; the top has to be written as a product first.`,
        `Factor the numerator. If one factor matches the denominator, it cancels (that's why the question says ${M(`x \\neq ${-p}`)} — so we never divide by zero).`,
        [`The numerator is ${M(poly([1, p + q, p * q]))}. We need two numbers that multiply to ${p * q} and add to ${p + q}: those are ${p} and ${q}.`,
          `So the numerator is ${M(`(x ${sgn(p)})(x ${sgn(q)})`)}, and the factor ${M(`(x ${sgn(p)})`)} matches the denominator exactly.`,
          `Quick check with ${M('x = 0')}: the original gives ${M(`\\frac{${p * q}}{${p}} = ${q}`)}, and ${M(`x ${sgn(q)}`)} also gives ${q}. ✓`],
        `${M(`\\frac{(x ${sgn(p)})(x ${sgn(q)})}{x ${sgn(p)}} = x ${sgn(q)}`)}`,
        `Pattern: "simplify a quadratic over a linear term." Factor the top, cancel the matching factor; verify by plugging in x = 0.`),
    };
  });

  // ---------- Exponent equations ----------
  def({ id: 'exp-equation', area: A, topic: 'Exponent equations', format: 'ne', diff: 'medium' }, () => {
    const [b1, k1, b2, k2, pr] = pick([[4, 2, 8, 3, 2], [9, 2, 27, 3, 3], [8, 3, 16, 4, 2], [25, 2, 125, 3, 5], [4, 2, 32, 5, 2], [9, 2, 81, 4, 3]]);
    let x, c; do { x = ri(-4, 8); c = ri(-3, 5); } while ((k1 * (x + c)) % k2 !== 0 || c === 0);
    const m = (k1 * (x + c)) / k2; const rhs = (k2 * m) / k1;
    return {
      stem: `If ${M(`${b1}^{x ${sgn(c)}} = ${b2}^{${m}}`)}, what is the value of ${M('x')}?`,
      answer: num(x),
      ...EX(`The unknown is in an exponent, and the two sides have different bases (${b1} and ${b2}), so the exponents can't be compared yet.`,
        `If two powers of the same base are equal, their exponents are equal. So rewrite both sides with a common base, then set the exponents equal — this turns the problem into an ordinary linear equation.`,
        [`${b1} and ${b2} are both powers of ${pr}: ${b1} = ${M(pr + '^{' + k1 + '}')} and ${b2} = ${M(pr + '^{' + k2 + '}')}.`,
          `Left side: ${M(`(${pr}^{${k1}})^{x ${sgn(c)}} = ${pr}^{${k1}(x ${sgn(c)})}`)} — a power of a power multiplies exponents.`,
          `Right side: ${M(`(${pr}^{${k2}})^{${m}} = ${pr}^{${k2 * m}}`)}, because ${k2} × ${par(m)} = ${k2 * m}.`,
          `Same base, so the exponents must match: ${M(`${k1}(x ${sgn(c)}) = ${k2 * m}`)}. Dividing both sides by ${k1} gives ${M(`x ${sgn(c)} = ${rhs}`)}; then ${c > 0 ? 'subtract' : 'add'} ${Math.abs(c)}.`],
        `${M(`x = ${rhs} ${sgn(-c)} = ${x}`)}`,
        `Pattern: "variable in the exponent." Rewrite with one base, set exponents equal, solve the linear equation.`),
    };
  });

  // ---------- Functions ----------
  def({ id: 'func-compose', area: A, topic: 'Functions', format: 'ne', diff: 'medium' }, () => {
    const a = ri(1, 3), b = ri(-5, 5), c = ri(-6, 6), p = ri(2, 5), q = ri(-6, 6), t = ri(-3, 4);
    if (b === 0 || c === 0 || q === 0) return null;
    const g = p * t + q; const f = a * g * g + b * g + c;
    return {
      stem: `If ${M(`f(x) = ${poly([a, b, c])}`)} and ${M(`g(x) = ${poly([p, q])}`)}, what is the value of ${M(`f(g(${t}))`)}?`,
      answer: num(f),
      ...EX(`${M(`f(g(${t}))`)} is a function inside a function; working out the general formula for ${M('f(g(x))')} first would be long and unnecessary.`,
        `Evaluate composite functions from the inside out, plugging in numbers as early as possible: first find the inner value ${M(`g(${t})`)}, then feed that number into ${M('f')}.`,
        [`Inner function first: ${M(`g(${t}) = ${p}(${t}) ${sgn(q)} = ${p * t} ${sgn(q)} = ${g}`)}.`,
          `Now ${M(`f(g(${t}))`)} is just ${M(`f(${g})`)}: replace every ${M('x')} in ${M('f')} with ${g}, in parentheses so the signs stay right.`,
          `The squared term: ${M(`(${g})^{2} = ${g * g}`)}${a !== 1 ? `, and times ${a} that is ${a * g * g}` : ''}. The middle term: ${M(`${b} \\times ${par(g)} = ${b * g}`)}. The constant is ${c}.`],
        `${M(`${a * g * g} + ${par(b * g)} + ${par(c)} = ${f}`)}`,
        `Pattern: "composite function at a number." Inside out, numbers early, parentheses around negatives.`),
    };
  });

  def({ id: 'custom-op', area: A, topic: 'Functions', format: 'ne', diff: 'easy' }, () => {
    const ops = [
      ['a \\star b = ab + a - b', (a, b) => a * b + a - b, (a, b) => `${par(a)}(${b}) + ${par(a)} - ${par(b)}`],
      ['a \\star b = a^{2} - 2b', (a, b) => a * a - 2 * b, (a, b) => `${par(a)}^{2} - 2(${b})`],
      ['a \\star b = \\frac{a + b}{2} + ab', (a, b) => (a + b) / 2 + a * b, (a, b) => `\\frac{${a} + ${par(b)}}{2} + ${par(a)}(${b})`],
      ['a \\star b = 3a - b^{2}', (a, b) => 3 * a - b * b, (a, b) => `3(${a}) - ${par(b)}^{2}`],
      ['a \\star b = (a - b)^{2} + a', (a, b) => (a - b) ** 2 + a, (a, b) => `(${a} - ${par(b)})^{2} + ${par(a)}`],
    ];
    const [d, fn, show] = pick(ops); const u = ri(-3, 5), v = ri(-3, 5), w = ri(-2, 4);
    const inner = fn(u, v), out = fn(inner, w);
    if (!Number.isInteger(out * 2) || !Number.isInteger(inner)) return null;
    return {
      stem: `For all numbers ${M('a')} and ${M('b')}, the operation ${M('\\star')} is defined by ${M(d)}. What is the value of ${M(`(${u} \\star ${v}) \\star ${w}`)}?`,
      answer: num(out),
      ...EX(`The symbol ${M('\\star')} is invented for this question, so there's no rule to remember — and the nested parentheses make it easy to substitute in the wrong order.`,
        `Treat a made-up operation as a machine: the first number goes wherever the definition has ${M('a')}, the second wherever it has ${M('b')}. Evaluate the innermost parentheses first, then feed that result in as the new ${M('a')}.`,
        [`Inner part ${M(`${u} \\star ${v}`)}: here ${M(`a = ${u}`)} and ${M(`b = ${v}`)}, so it equals ${M(show(u, v))}, which works out to ${fmt(inner)}.`,
          `Outer part: now compute ${M(`${fmt(inner)} \\star ${w}`)}, with ${M(`a = ${fmt(inner)}`)} and ${M(`b = ${w}`)}.`],
        `${M(`${show(inner, w)} = ${fmt(out)}`)}`,
        `Pattern: "defined operation." Substitute carefully, innermost first, with parentheses around negative numbers.`),
    };
  });

  // ---------- Inequalities ----------
  def({ id: 'ineq-ma', area: A, topic: 'Inequalities', format: 'ma', diff: 'medium' }, () => {
    const k = pick([2, 3, 4, -2, -3]); const b = ri(-5, 5); const lo = ri(-12, 0), hi = lo + ri(8, 20);
    const xl = (lo - b) / k, xh = (hi - b) / k; const [mn, mx] = k > 0 ? [xl, xh] : [xh, xl];
    const vals = new Set(); for (let i = 0; i < 40 && vals.size < 6; i++) vals.add(ri(Math.floor(mn) - 4, Math.ceil(mx) + 4));
    const vs = [...vals].sort((a, c) => a - c); const ok = (x) => x > mn && x < mx;
    if (!vs.some(ok) || vs.every(ok) || b === 0) return null;
    return {
      stem: `If ${M(`${lo} < ${k}x ${sgn(b)} < ${hi}`)}, which of the following could be the value of ${M('x')}? Indicate <b>all</b> such values.`,
      ...ma(vs.map((v) => ({ text: M(v), ok: ok(v) }))),
      ...EX(`Testing each choice in the original three-part inequality works, but it means doing the arithmetic six times.`,
        `Solve a compound inequality once by doing the same operation to all three parts until ${M('x')} is alone in the middle. Adding or subtracting never changes the direction; dividing by a negative number flips both signs.`,
        [`Undo the ${b > 0 ? '+' : '−'}${Math.abs(b)} first by ${b > 0 ? 'subtracting' : 'adding'} ${Math.abs(b)} in all three parts: ${M(`${lo - b} < ${k}x < ${hi - b}`)}.`,
          k > 0 ? `Now divide all three parts by ${k}. It's positive, so the signs stay as they are.` : `Now divide all three parts by ${k}. Because ${k} is negative, both inequality signs flip, and the two ends swap places.`,
          `That leaves ${M(`${fracTex(k > 0 ? lo - b : hi - b, k)} < x < ${fracTex(k > 0 ? hi - b : lo - b, k)}`)}, so ${M('x')} must be strictly between ${fmt(clean(mn))} and ${fmt(clean(mx))}.`],
        `Keep the choices strictly between ${M(fmt(clean(mn)))} and ${M(fmt(clean(mx)))}.`,
        `Pattern: "compound inequality." Isolate x in all three parts at once; watch for dividing by a negative.`),
    };
  });

  def({ id: 'ineq-count', area: A, topic: 'Inequalities', format: 'ne', diff: 'medium' }, () => {
    const a = ri(-8, 10), b = ri(2, 12); const strict = pick([true, false]);
    const lo = strict ? a - b + 1 : a - b, hi = strict ? a + b - 1 : a + b; const ans = hi - lo + 1;
    const inner = a === 0 ? 'x' : `x ${sgn(-a)}`;
    return {
      stem: `How many integers ${M('x')} satisfy ${M(`|${inner}| ${strict ? '<' : '\\le'} ${b}`)}?`,
      answer: num(ans),
      ...EX(`Absolute-value inequalities look abstract, and counting integers invites off-by-one mistakes.`,
        `Read ${M('|x - a|')} as "the distance from ${M('x')} to ${M('a')} on the number line." So ${M('|x - a| < b')} means ${M('x')} is within ${M('b')} of ${M('a')}: ${M('a - b < x < a + b')}. Then count integers with (last − first) + 1.`,
        [`Here the center is ${a} and the distance is ${b}, so ${M('x')} lies between ${a} − ${b} = ${a - b} and ${a} + ${b} = ${a + b}.`,
          strict ? `The sign is strict (${M('<')}), so the endpoints ${a - b} and ${a + b} themselves are excluded; the integers run from ${lo} to ${hi}.` : `The sign is ${M('\\le')}, so the endpoints are included; the integers run from ${lo} to ${hi}.`,
          `To count integers from ${lo} to ${hi}, subtract to get the number of steps, then add 1 so both ends are counted.`],
        `${M(`${hi} - ${par(lo)} + 1 = ${ans}`)}`,
        `Pattern: "integers within a distance." ${M('|x - a| < b')} gives ${M('2b - 1')} integers; ${M('\\le')} gives ${M('2b + 1')}.`),
    };
  });

  def({ id: 'ineq-qc', area: A, topic: 'Inequalities', format: 'qc', diff: 'easy' }, () => {
    const k = ri(2, 6), b = ri(-8, 8), c = ri(-10, 20);
    if (b === 0) return null;
    const flip = pick([true, false]);
    const lhs = flip ? `-${k}x ${sgn(b)}` : `${k}x ${sgn(b)}`;
    const trueBound = flip ? (b - c) / k : (c - b) / k;
    const qb = Math.round(trueBound) + pick([0, 0, -1, 1]);
    const rel = !flip ? (qb <= trueBound ? 'A' : 'D') : (qb >= trueBound ? 'B' : 'D');
    const bt = fracTex(flip ? b - c : c - b, k);
    return {
      stem: `${M(`${lhs} > ${c}`)}`,
      ...qc(M('x'), M(qb), rel),
      ...EX(`The condition only gives a range for ${M('x')}, not a value, so we must check whether ${qb} could fall inside that range.`,
        `Solve the inequality to get the allowed range of ${M('x')}. If every allowed value is on one side of Quantity B, that side wins; if the range straddles B, the answer is "cannot be determined."`,
        [`${b > 0 ? 'Subtract' : 'Add'} ${Math.abs(b)} on both sides: ${M(`${flip ? '-' : ''}${k}x > ${c - b}`)}.`,
          flip ? `Divide by ${-k}. Dividing by a negative flips the sign: ${M(`x < ${bt}`)}.` : `Divide by ${k} (positive, so the sign stays): ${M(`x > ${bt}`)}.`,
          rel === 'D' ? `The boundary is ${fmt(clean(trueBound))}, and ${qb} lies inside the allowed region, so ${M('x')} can be less than ${qb} or greater than ${qb}.` : `The boundary is ${fmt(clean(trueBound))}, and ${qb} is ${flip ? 'at or above' : 'at or below'} it, so every allowed ${M('x')} is ${flip ? 'below' : 'above'} ${qb}.`],
        `${M(flip ? `x < ${bt}` : `x > ${bt}`)} vs ${M(qb)} → ${rel === 'D' ? 'cannot be determined' : rel === 'A' ? 'A is greater' : 'B is greater'}.`,
        `Pattern: "QC with an inequality." Solve for the range, then see whether Quantity B sits inside it (D) or outside it (a definite answer).`),
    };
  });

  // ---------- QC plug-in patterns ----------
  const patterns = [
    { A: 'x^{2}', B: 'x', conds: [['x > 1', 'A', 'Try $x = 2$: $4 > 2$. Try $x = 10$: $100 > 10$. Numbers above 1 grow when squared.'], ['0 < x < 1', 'B', 'Try $x = \\frac{1}{2}$: $\\frac{1}{4} < \\frac{1}{2}$. Squaring a fraction between 0 and 1 makes it smaller.'], ['x < 0', 'A', 'Try $x = -1$: $1 > -1$. A square is never negative, so it beats any negative $x$.'], ['x \\neq 0', 'D', 'Try $x = 2$: $4 > 2$ (A wins). Try $x = \\frac{1}{2}$: $\\frac{1}{4} < \\frac{1}{2}$ (B wins).']] },
    { A: 'x^{3}', B: 'x^{2}', conds: [['x < 0', 'B', 'Try $x = -1$: $-1 < 1$. An odd power keeps the negative sign; an even power is positive.'], ['x > 1', 'A', 'Try $x = 2$: $8 > 4$. Above 1, higher powers are bigger.'], ['0 < x < 1', 'B', 'Try $x = \\frac{1}{2}$: $\\frac{1}{8} < \\frac{1}{4}$. Between 0 and 1, higher powers are smaller.'], ['x \\neq 0', 'D', 'Try $x = 2$: $8 > 4$ (A wins). Try $x = -1$: $-1 < 1$ (B wins).']] },
    { A: '(x + k)^{2}', B: 'x^{2} + K', conds: [['x > 0', 'A', 'Expand: $(x + k)^{2} = x^{2} + 2kx + K$. Both sides share $x^{2} + K$, so only $2kx$ differs, and it is positive when $x > 0$.'], ['x < 0', 'B', 'Expand: A $= x^{2} + 2kx + K$. Both sides share $x^{2} + K$, so A − B $= 2kx$, which is negative when $x < 0$.'], ['x \\text{ is a real number}', 'D', 'Expand: A − B $= 2kx$. With $x = 1$ A is bigger; with $x = -1$ B is bigger.']] },
    { A: '\\frac{1}{x}', B: 'x', conds: [['x > 1', 'B', 'Try $x = 2$: $\\frac{1}{2} < 2$.'], ['0 < x < 1', 'A', 'Try $x = \\frac{1}{2}$: $2 > \\frac{1}{2}$.'], ['x < -1', 'A', 'Try $x = -2$: $-\\frac{1}{2} > -2$ (for negatives, closer to zero is bigger).'], ['-1 < x < 0', 'B', 'Try $x = -\\frac{1}{2}$: $-2 < -\\frac{1}{2}$.']] },
    { A: 'kx', B: '\\frac{x}{k}', conds: [['x > 0', 'A', 'Try $x = 1$: $k > \\frac{1}{k}$.'], ['x < 0', 'B', 'Try $x = -1$: $-k < -\\frac{1}{k}$.'], ['x \\neq 0', 'D', 'Positive $x$ makes A bigger; negative $x$ makes B bigger.']] },
    { A: '\\frac{x + 1}{y + 1}', B: '\\frac{x}{y}', conds: [['x > y > 0', 'B', 'Try $x = 2, y = 1$: $\\frac{3}{2} < 2$. Adding 1 to top and bottom pulls a fraction toward 1.'], ['0 < x < y', 'A', 'Try $x = 1, y = 2$: $\\frac{2}{3} > \\frac{1}{2}$. A fraction below 1 moves up toward 1.'], ['x = y > 0', 'C', 'Both fractions equal 1.']] },
    { A: '2^{n}', B: 'n^{2}', conds: [['n \\text{ is an integer greater than } 4', 'A', 'Try $n = 5$: $32 > 25$; $n = 6$: $64 > 36$. Doubling each step outruns squaring.'], ['n \\text{ is a positive integer}', 'D', 'Try $n = 3$: $8 < 9$ (B wins). Try $n = 5$: $32 > 25$ (A wins).'], ['n = 4', 'C', '$2^{4} = 16 = 4^{2}$.']] },
    { A: '|x| + |y|', B: '|x + y|', conds: [['x > 0 \\text{ and } y > 0', 'C', 'With both positive, both sides are just $x + y$.'], ['x > 0 \\text{ and } y < 0', 'A', 'Try $x = 1, y = -1$: $2 > 0$. Opposite signs cancel inside the absolute value.'], ['x \\text{ and } y \\text{ are nonzero}', 'D', '$x = y = 1$ gives equal; $x = 1, y = -1$ gives A.']] },
    { A: '-x', B: 'x', conds: [['x < 0', 'A', 'Try $x = -3$: $3 > -3$.'], ['x > 0', 'B', 'Try $x = 3$: $-3 < 3$.'], ['x^{2} = x', 'D', '$x^{2} = x$ means $x = 0$ or $x = 1$. $x = 0$ gives equal; $x = 1$ gives B.']] },
    { A: 'x^{2} - 1', B: '(x - 1)(x + 1)', conds: [['x \\text{ is a real number}', 'C', 'Multiply out B: $(x - 1)(x + 1) = x^{2} - 1$ for every $x$.']] },
  ];
  const h = (s) => s.replace(/\$([^$]+)\$/g, (m, x) => M(x));
  def({ id: 'qc-plugin', area: A, topic: 'QC: plugging values', format: 'qc', diff: 'medium' }, () => {
    const p = pick(patterns); const [cond, rel, test] = pick(p.conds); const k = pick([2, 3, 4, 5]);
    const sub = (s) => s.replace(/2kx/g, `${2 * k}x`).replace(/K/g, k * k).replace(/\\frac\{1\}\{k\}/g, `\\frac{1}{${k}}`).replace(/\bk\b|k(?=x|\s|\$|,|\.|<|>)/g, k);
    return {
      stem: M(cond),
      ...qc(M(sub(p.A)), M(sub(p.B)), rel),
      ...EX(`Both quantities contain a variable whose value we don't know — only a condition on it — so the comparison might change as the variable changes.`,
        `For variable QCs, plug in a few strategic values allowed by the condition. Try the "unusual" numbers (0, 1, negatives, fractions between 0 and 1, large numbers), because they are where relationships tend to flip. If two legal values give different winners, the answer is D; if the winner never changes and you can see why, that's the answer.`,
        [`The condition is ${M(cond)}. Pick values that respect it but behave differently from ordinary positive integers.`, h(sub(test))],
        rel === 'D' ? `Different legal values give different winners → cannot be determined.` : rel === 'C' ? `The two quantities are always equal.` : `Every legal value gives the same winner → Quantity ${rel} is greater.`,
        `Pattern: "variable QC." Test 0, 1, a negative, a fraction and a big number (whichever are legal). A change in the winner means D.`),
    };
  }, 48);

  // ---------- Coordinate geometry ----------
  def({ id: 'slope', area: A, topic: 'Coordinate geometry', format: 'mc', diff: 'easy' }, () => {
    let x1, y1, x2, y2; do { x1 = ri(-6, 6); y1 = ri(-6, 6); x2 = ri(-6, 8); y2 = ri(-6, 8); } while (x1 === x2 || y1 === y2);
    const dy = y2 - y1, dx = x2 - x1;
    return {
      stem: `What is the slope of the line that passes through the points ${M(`(${x1}, ${y1})`)} and ${M(`(${x2}, ${y2})`)}?`,
      ...mc(F(dy, dx), [F(dx, dy), F(-dy, dx), F(-dx, dy), F(y2 + y1, x2 + x1 || 1), F(dy + 1, dx), F(dy - 1, dx), F(dy, dx + 1), F(2 * dy, dx), F(dy + 2, dx)]),
      ...EX(`With negative coordinates it's easy to mix up the order of subtraction or to flip the fraction.`,
        `Slope = rise over run = (change in ${M('y')}) ÷ (change in ${M('x')}). Subtract in the same order on top and bottom (second point minus first point).`,
        [`Change in ${M('y')}: ${M(`${y2} - ${par(y1)} = ${dy}`)}.`,
          `Change in ${M('x')}, in the same order: ${M(`${x2} - ${par(x1)} = ${dx}`)}.`,
          `Put rise over run, then simplify the fraction.`],
        `${M(`\\frac{${dy}}{${dx}} = ${fracTex(dy, dx)}`)}`,
        `Pattern: "slope from two points." Δy over Δx, same order in both. Traps: Δx/Δy and a flipped sign.`),
    };
  });

  def({ id: 'intercept-area', area: A, topic: 'Coordinate geometry', format: 'ne', diff: 'medium' }, () => {
    const a = ri(1, 6), b = ri(1, 6); const c = a * b * ri(1, 4) * pick([1, 2]);
    const xi = c / a, yi = c / b;
    return {
      stem: `The line ${M(`${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${c}`)} and the two coordinate axes form a triangle. What is the area of the triangle?`,
      answer: num((xi * yi) / 2),
      ...EX(`We need the triangle's base and height, but the line is given as an equation, not as points.`,
        `A line crosses the ${M('x')}-axis where ${M('y = 0')} and the ${M('y')}-axis where ${M('x = 0')}. Those two intercepts are the legs of a right triangle with the axes, so area = ½ × (x-intercept) × (y-intercept).`,
        [`Set ${M('y = 0')}: ${M(`${a === 1 ? '' : a}x = ${c}`)}, so the ${M('x')}-intercept is ${c} ÷ ${a} = ${fmt(xi)}.`,
          `Set ${M('x = 0')}: ${M(`${b === 1 ? '' : b}y = ${c}`)}, so the ${M('y')}-intercept is ${c} ÷ ${b} = ${fmt(yi)}.`,
          `The axes meet at a right angle, so these intercepts are the base and height of the triangle.`],
        `${M(`\\frac{1}{2} \\times ${fmt(xi)} \\times ${fmt(yi)} = ${fmt((xi * yi) / 2)}`)}`,
        `Pattern: "triangle cut off by a line." Zero out each variable to get the intercepts, then ½ × base × height.`),
    };
  });

  def({ id: 'perp-slope', area: A, topic: 'Coordinate geometry', format: 'mc', diff: 'easy' }, () => {
    let p, q; do { p = ri(-6, 6); q = ri(1, 5); } while (p === 0 || gcd(p, q) !== 1 || Math.abs(p) === q);
    const b = ri(-9, 9); const rel = pick(['perpendicular', 'parallel']);
    const ans = rel === 'perpendicular' ? F(-q, p) : F(p, q);
    return {
      stem: `Line ${M('k')} has equation ${M(`y = ${fracTex(p, q)}x ${sgn(b)}`)}. What is the slope of a line ${rel} to line ${M('k')}?`,
      ...mc(ans, [F(q, p), F(-p, q), F(p, q), F(-q, p), M(b), F(q, -p * 2)]),
      ...EX(`The equation contains two numbers, and only one of them is the slope.`,
        `In ${M('y = mx + b')}, the slope is ${M('m')}, the coefficient of ${M('x')}. Parallel lines have the same slope; perpendicular lines have slopes that are negative reciprocals (flip the fraction and change the sign), so the two slopes multiply to −1.`,
        rel === 'perpendicular'
          ? [`Line ${M('k')}'s slope is the coefficient of ${M('x')}: ${M(fracTex(p, q))}. (${b} is the y-intercept, not the slope.)`, `Flip it to ${M(fracTex(q, p))} and change the sign to get ${M(fracTex(-q, p))}.`, `Check: ${M(`${fracTex(p, q)} \\times ${fracTex(-q, p)} = -1`)}. ✓`]
          : [`Line ${M('k')}'s slope is the coefficient of ${M('x')}: ${M(fracTex(p, q))}. (${b} is the y-intercept, not the slope.)`, `A parallel line rises at the same rate, so it has exactly the same slope.`],
        rel === 'perpendicular' ? `${M(`${fracTex(p, q)} \\;\\to\\; ${fracTex(-q, p)}`)}` : `${M(fracTex(p, q))}`,
        `Pattern: "parallel/perpendicular slope." Parallel: copy it. Perpendicular: flip and negate.`),
    };
  });

  def({ id: 'distance-points', area: A, topic: 'Coordinate geometry', format: 'ne', diff: 'easy' }, () => {
    const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25], [12, 16, 20]]);
    const x1 = ri(-5, 5), y1 = ri(-5, 5); const sx = pick([1, -1]), sy = pick([1, -1]);
    const [dx, dy] = pick([true, false]) ? [a, b] : [b, a]; const x2 = x1 + sx * dx, y2 = y1 + sy * dy;
    return {
      stem: `What is the distance between the points ${M(`(${x1}, ${y1})`)} and ${M(`(${x2}, ${y2})`)} in the ${M('xy')}-plane?`,
      answer: num(c),
      ...EX(`The two points are not on a horizontal or vertical line, so we can't just subtract one coordinate.`,
        `The horizontal gap and the vertical gap between two points are the legs of a right triangle, and the distance is its hypotenuse (Pythagorean theorem). If the legs form a known triple, you can skip the square root.`,
        [`Horizontal gap: the ${M('x')}-coordinates ${x1} and ${x2} differ by ${dx}.`,
          `Vertical gap: the ${M('y')}-coordinates ${y1} and ${y2} differ by ${dy}.`,
          `Legs ${dx} and ${dy} match the Pythagorean triple ${a}-${b}-${c}, so the hypotenuse is ${c}. Check: ${M(`${dx}^{2} + ${dy}^{2} = ${dx * dx} + ${dy * dy} = ${c * c}`)}, and ${M(`\\sqrt{${c * c}} = ${c}`)}.`],
        `${M(`\\sqrt{${dx * dx} + ${dy * dy}} = \\sqrt{${c * c}} = ${c}`)}`,
        `Pattern: "distance between points." Horizontal and vertical gaps, then Pythagoras — look for a triple (3-4-5, 5-12-13, 8-15-17, 7-24-25 and their multiples).`),
    };
  });

  // ---------- Word problems ----------
  def({ id: 'tickets', area: A, topic: 'Word problems', format: 'ne', diff: 'medium' }, () => {
    let p1, p2; do { p1 = ri(4, 12); p2 = ri(6, 25); } while (p2 <= p1);
    const n2 = ri(10, 90), n1 = ri(10, 120); const N = n1 + n2, R = n1 * p1 + n2 * p2;
    return {
      stem: `A theater sold ${N} tickets for a total of ${tn(R)} dollars. Adult tickets cost ${p2} dollars each and student tickets cost ${p1} dollars each. How many adult tickets were sold?`,
      answer: num(n2),
      ...EX(`There are two unknowns (adult and student counts), which normally means two equations and substitution.`,
        `For "two kinds of items, known total count and known total value" problems, pretend every item is the cheaper kind. The shortfall in value must come from the expensive items, and each one adds exactly the price difference.`,
        [`If all ${N} tickets were student tickets at ${p1} dollars, revenue would be ${N} × ${p1} = ${tn(N * p1)} dollars.`,
          `Actual revenue is ${tn(R)}, so ${tn(R)} − ${tn(N * p1)} = ${tn(R - N * p1)} dollars must come from adult tickets.`,
          `Swapping one student ticket for an adult ticket raises revenue by ${p2} − ${p1} = ${p2 - p1} dollars, so divide the extra money by ${p2 - p1}.`],
        `${M(`${tn(R - N * p1)} \\div ${p2 - p1} = ${n2}`)}`,
        `Pattern: "two prices, known count and total." Assume all cheap, divide the leftover by the price difference.`),
    };
  });

  def({ id: 'ages', area: A, topic: 'Word problems', format: 'ne', diff: 'medium' }, () => {
    const k = pick([3, 4, 5]); const B = ri(3, 14); const n = B * (k - 2);
    return {
      stem: `Rosa is now ${k} times as old as her nephew. In ${n} years, Rosa will be twice as old as her nephew. How old is Rosa now?`,
      answer: num(k * B),
      ...EX(`Two people at two points in time — it's easy to set up four variables and get lost.`,
        `Use one variable for the younger person's current age and express everything else in terms of it. Both people age by the same number of years, so add that number to each before comparing.`,
        [`Let the nephew be ${M('b')} years old now; Rosa is ${k} times as old, so she is ${M(k + 'b')}.`,
          `In ${n} years, both add ${n}: Rosa will be ${M(`${k}b + ${n}`)} and the nephew ${M(`b + ${n}`)}.`,
          `"Twice as old" gives the equation ${M(`${k}b + ${n} = 2(b + ${n}) = 2b + ${2 * n}`)}.`,
          `Subtract ${M('2b')} and ${n} from both sides: ${M(`${k - 2 === 1 ? '' : k - 2}b = ${n}`)}, so ${M(`b = ${B}`)}.`],
        `Rosa ${M(`= ${k} \\times ${B} = ${k * B}`)}`,
        `Pattern: "age problem." One variable for the youngest, add the same years to everyone, then translate "times as old" into an equation.`),
    };
  });

  def({ id: 'consec-find', area: A, topic: 'Word problems', format: 'ne', diff: 'easy' }, () => {
    const k = pick([3, 4, 5, 6, 7]); const start = ri(-5, 40); const s = (k * (2 * start + k - 1)) / 2;
    const ask = pick(['greatest', 'least']); const avg = s / k; const half = (k - 1) / 2;
    return {
      stem: `The sum of ${k} consecutive integers is ${s}. What is the ${ask} of these integers?`,
      answer: num(ask === 'greatest' ? start + k - 1 : start),
      ...EX(`Setting up ${M('n + (n+1) + (n+2) + \\dots')} works but is slow.`,
        `Consecutive integers are evenly spaced, so their average sits exactly in the middle of the list, and average = sum ÷ count. From the middle, each end is (count − 1) ÷ 2 steps away.`,
        [`The average is ${s} ÷ ${k} = ${fmt(avg)}, and it sits in the middle of the ${k} numbers.`,
          k % 2 ? `With ${k} numbers (an odd count), the middle number is ${fmt(avg)} itself, with (${k} − 1) ÷ 2 = ${half} numbers on each side of it.` : `With ${k} numbers (an even count), the middle falls halfway between two integers, at ${fmt(avg)}; each end is (${k} − 1) ÷ 2 = ${fmt(half)} away from it.`,
          `The ${ask} number is ${fmt(half)} ${ask === 'greatest' ? 'above' : 'below'} the middle.`],
        `${M(`${fmt(avg)} ${ask === 'greatest' ? '+' : '-'} ${fmt(half)} = ${ask === 'greatest' ? start + k - 1 : start}`)}`,
        `Pattern: "consecutive integers with a known sum." Middle = sum ÷ count; step out (count − 1) ÷ 2.`),
    };
  });

  def({ id: 'mixture', area: A, topic: 'Word problems', format: 'ne', diff: 'hard' }, () => {
    const [c1, c2] = pick([[10, 40], [20, 50], [15, 45], [10, 30], [25, 50], [20, 60], [30, 70]]);
    const v1 = ri(1, 8) * 5, v2 = ri(1, 8) * 5; const mix = (c1 * v1 + c2 * v2) / (v1 + v2);
    if (!Number.isInteger(mix)) return null;
    return {
      stem: `How many liters of a ${c2}% salt solution must be added to ${v1} liters of a ${c1}% salt solution to produce a ${mix}% salt solution?`,
      answer: num(v2),
      ...EX(`Tracking liters of salt in each solution works, but it means writing and solving an equation full of decimals.`,
        `A mixture's concentration is a weighted average of the parts. The target sits between the two concentrations, and the amounts balance like a seesaw: (amount) × (distance from the target) is the same on both sides. The solution closer to the target is the one there's more of.`,
        [`The target ${mix}% is ${mix} − ${c1} = ${mix - c1} points above the ${c1}% solution and ${c2} − ${mix} = ${c2 - mix} points below the ${c2}% solution.`,
          `Balance the seesaw: ${M(`${v1} \\times ${mix - c1} = V \\times ${c2 - mix}`)}, where ${M('V')} is the liters of ${c2}% solution. The left side is ${v1} × ${mix - c1} = ${v1 * (mix - c1)}.`],
        `${M(`V = \\frac{${v1 * (mix - c1)}}{${c2 - mix}} = ${v2}`)} liters.`,
        `Pattern: "mixture / weighted average." Amount × distance balances on both sides of the target.`),
    };
  });

  def({ id: 'linear-solve-qc', area: A, topic: 'Linear equations', format: 'qc', diff: 'easy' }, () => {
    const x = ri(-6, 10), a = ri(2, 7), b = ri(-10, 10); const y = ri(-6, 10), c = ri(2, 7), d = ri(-10, 10);
    if (b === 0 || d === 0) return null;
    return {
      stem: `${M(`${a}x ${sgn(b)} = ${a * x + b}`)} and ${M(`${c}y ${sgn(d)} = ${c * y + d}`)}`,
      ...qc(M('x'), M('y'), cmp(x, y)),
      ...EX(`The variables are in separate equations, so there's no trick connecting them.`,
        `Each linear equation in one variable has exactly one solution, so "cannot be determined" is impossible here. Solve each (undo the addition, then the multiplication) and compare.`,
        [`For ${M('x')}: ${b > 0 ? 'subtract' : 'add'} ${Math.abs(b)} to get ${M(`${a}x = ${a * x}`)}, then divide by ${a}.`,
          `For ${M('y')}: ${d > 0 ? 'subtract' : 'add'} ${Math.abs(d)} to get ${M(`${c}y = ${c * y}`)}, then divide by ${c}.`],
        `${M(`x = ${a * x} \\div ${a} = ${x}`)}, ${M(`y = ${c * y} \\div ${c} = ${y}`)}.`,
        `Pattern: "two separate linear equations in a QC." Solve both; D is never the answer when each variable is fixed.`),
    };
  });
};
