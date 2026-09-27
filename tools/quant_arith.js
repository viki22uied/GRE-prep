const L = require('./lib');
const { ri, pick, shuffle, sample, gcd, lcm, M, F, fracTex, tn, fmt, num, frac, mc, mcNum, ma, qc, cmp, clean } = L;

module.exports = function (def) {
  const A = 'Arithmetic';

  // ---------- Integers: remainders ----------
  def({ id: 'rem-mult', area: A, topic: 'Remainders', format: 'ne', diff: 'medium' }, () => {
    const a = pick([5, 6, 7, 8, 9, 11, 12, 13]); const r = ri(2, a - 1); const k = ri(2, 9);
    const ans = (k * r) % a;
    return {
      stem: `When the positive integer ${M('n')} is divided by ${a}, the remainder is ${r}. What is the remainder when ${M(k + 'n')} is divided by ${a}?`,
      answer: num(ans),
      fast: [`Pick the smallest ${M('n')} that works: ${M('n = ' + r)}.`, `Then ${M(k + 'n = ' + k * r)}.`, `${M(k * r + ' \\div ' + a)} leaves remainder ${M(ans)}.`],
      why: `Plugging the smallest valid ${M('n')} replaces the algebra ${M('n = ' + a + 'q + ' + r)} with one small division.`,
    };
  });

  def({ id: 'rem-sum', area: A, topic: 'Remainders', format: 'mc', diff: 'medium' }, () => {
    const a = pick([6, 7, 8, 9, 10, 11, 12]); const r1 = ri(1, a - 1); const r2 = ri(1, a - 1);
    const op = pick(['sum', 'product']);
    const ans = op === 'sum' ? (r1 + r2) % a : (r1 * r2) % a;
    const raw = op === 'sum' ? r1 + r2 : r1 * r2;
    const c = mcNum(ans, [raw, (ans + 1) % a, (ans + 2) % a, Math.abs(r1 - r2), (ans + a - 1) % a, (ans + 3) % a].filter((x) => x < a || x === raw));
    return {
      stem: `When positive integers ${M('x')} and ${M('y')} are divided by ${a}, the remainders are ${r1} and ${r2}, respectively. What is the remainder when the ${op} ${M(op === 'sum' ? 'x + y' : 'xy')} is divided by ${a}?`,
      ...c,
      fast: [`Use the smallest values: ${M('x = ' + r1)}, ${M('y = ' + r2)}.`, `${op === 'sum' ? M('x + y = ' + raw) : M('xy = ' + raw)}.`, `Divide by ${a}: remainder ${M(ans)}.`],
      why: `Remainders ${op === 'sum' ? 'add' : 'multiply'} directly, so testing the smallest numbers is exact — no need to write ${M(a + 'q + r')} forms.`,
    };
  });

  // ---------- Units digit cycles ----------
  def({ id: 'units-digit', area: A, topic: 'Exponents & units digits', format: 'mc', diff: 'medium' }, () => {
    const b = pick([2, 3, 7, 8, 12, 13, 17, 18, 22, 23, 27, 33, 37, 43, 47, 53]); const e = ri(21, 99);
    const u = b % 10; const cyc = []; let x = u;
    while (!cyc.includes(x)) { cyc.push(x); x = (x * u) % 10; }
    const pos = e % cyc.length === 0 ? cyc.length : e % cyc.length;
    const ans = cyc[pos - 1];
    const others = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => d !== ans));
    const ds = [...cyc.filter((d) => d !== ans), ...others];
    const c = mcNum(ans, ds, (v) => M(v));
    return {
      stem: `What is the units digit of ${M(b + '^{' + e + '}')}?`,
      ...c,
      fast: [`Only the units digit ${u} matters. Powers of ${u} end in the cycle ${M(cyc.join(', '))} (length ${cyc.length}).`, `${M(e + ' \\div ' + cyc.length)} leaves remainder ${e % cyc.length}${e % cyc.length === 0 ? ' → use the last digit of the cycle' : ''}.`, `So the units digit is ${M(ans)}.`],
      why: `The cycle repeats every ${cyc.length} powers, so one division replaces computing a ${e}-th power.`,
    };
  });

  // ---------- Counting multiples (inclusion–exclusion) ----------
  def({ id: 'count-multiples', area: A, topic: 'Divisibility', format: 'ne', diff: 'medium' }, () => {
    const [a, b] = pick([[2, 3], [3, 5], [4, 6], [4, 10], [6, 9], [5, 7], [3, 4], [6, 10], [4, 9], [6, 8]]);
    const N = ri(6, 30) * 10; const l = lcm(a, b);
    const na = Math.floor(N / a), nb = Math.floor(N / b), nl = Math.floor(N / l);
    return {
      stem: `How many integers from 1 to ${N}, inclusive, are divisible by ${a} or ${b} (or both)?`,
      answer: num(na + nb - nl),
      fast: [`Multiples of ${a}: ${M('\\lfloor ' + N + '/' + a + ' \\rfloor = ' + na)}. Multiples of ${b}: ${M(nb)}.`, `Both = multiples of ${M('\\text{lcm}(' + a + ',' + b + ') = ' + l)}: ${M(nl)}.`, `${M(na + ' + ' + nb + ' - ' + nl + ' = ' + (na + nb - nl))}.`],
      why: `Inclusion–exclusion is three divisions; listing the numbers would take minutes. Use the LCM (not ${M(a + '\\times' + b)}) for the overlap.`,
    };
  });

  // ---------- Number of divisors ----------
  def({ id: 'divisor-count', area: A, topic: 'Factors & primes', format: 'mc', diff: 'hard' }, () => {
    let N, exps, ps;
    do {
      ps = sample([2, 3, 5, 7], pick([2, 3]));
      ps.sort((x, y) => x - y);
      exps = ps.map(() => ri(1, 3));
      N = ps.reduce((acc, p, i) => acc * p ** exps[i], 1);
    } while (N > 20000 || N < 30);
    const ans = exps.reduce((a, e) => a * (e + 1), 1);
    const sum = exps.reduce((a, e) => a + e, 0);
    const c = mcNum(ans, [sum, exps.reduce((a, e) => a * e, 1), ans - 2, ans + 2, sum + 1, ans / 2]);
    const fac = ps.map((p, i) => (exps[i] > 1 ? `${p}^{${exps[i]}}` : `${p}`)).join(' \\cdot ');
    return {
      stem: `How many positive divisors does ${M(tn(N))} have?`,
      ...c,
      fast: [`Prime-factor: ${M(tn(N) + ' = ' + fac)}.`, `Add 1 to each exponent and multiply: ${M(exps.map((e) => '(' + e + '+1)').join('') + ' = ' + ans)}.`],
      why: `The exponent rule counts every divisor at once; listing divisor pairs is slow and easy to miss one.`,
    };
  });

  def({ id: 'distinct-primes-qc', area: A, topic: 'Factors & primes', format: 'qc', diff: 'easy' }, () => {
    const mk = () => { const ps = sample([2, 3, 5, 7, 11, 13], ri(1, 3)).sort((a, b) => a - b); const es = ps.map(() => ri(1, 3)); return { ps, es, n: ps.reduce((a, p, i) => a * p ** es[i], 1) }; };
    let x, y; do { x = mk(); y = mk(); } while (x.n === y.n || x.n > 5000 || y.n > 5000);
    const fac = (o) => o.ps.map((p, i) => (o.es[i] > 1 ? `${p}^{${o.es[i]}}` : p)).join(' \\cdot ');
    return {
      stem: `Compare the two quantities.`,
      ...qc(`The number of distinct prime factors of ${M(x.n)}`, `The number of distinct prime factors of ${M(y.n)}`, cmp(x.ps.length, y.ps.length)),
      fast: [`${M(x.n + ' = ' + fac(x))} → ${x.ps.length} distinct prime${x.ps.length > 1 ? 's' : ''}.`, `${M(y.n + ' = ' + fac(y))} → ${y.ps.length} distinct prime${y.ps.length > 1 ? 's' : ''}.`],
      why: `Only the distinct primes count — repeated factors (exponents) don't matter, and the bigger number doesn't necessarily have more.`,
    };
  });

  // ---------- Odd / even ----------
  const parityPool = [
    ['x + y', 1], ['xy', 0], ['x^{2} + y', 1], ['x + 2y', 1], ['2x + y', 0], ['x^{2}y', 0], ['(x + y)^{2}', 1], ['x^{y}', 1], ['y^{x}', 0],
    ['3x + 5y', 1], ['xy + 1', 1], ['x(y + 1)', 1], ['y(x + 1)', 0], ['x^{2} + y^{2}', 1], ['x - y', 1], ['2(x + y)', 0], ['x^{3}', 1], ['x + y + 1', 0], ['(x + 1)(y + 1)', 0],
  ];
  const parityVal = { 'x + y': 3, 'xy': 2, 'x^{2} + y': 3, 'x + 2y': 5, '2x + y': 4, 'x^{2}y': 2, '(x + y)^{2}': 9, 'x^{y}': 1, 'y^{x}': 2, '3x + 5y': 13, 'xy + 1': 3, 'x(y + 1)': 3, 'y(x + 1)': 4, 'x^{2} + y^{2}': 5, 'x - y': -1, '2(x + y)': 6, 'x^{3}': 1, 'x + y + 1': 4, '(x + 1)(y + 1)': 6 };
  def({ id: 'parity-ma', area: A, topic: 'Odd & even', format: 'ma', diff: 'easy' }, () => {
    const want = pick(['odd', 'even']);
    let items;
    do { items = sample(parityPool, 5).map(([e, odd]) => ({ e, ok: want === 'odd' ? odd === 1 : odd === 0 })); } while (!items.some((i) => i.ok) || items.every((i) => i.ok));
    return {
      stem: `If ${M('x')} is an odd integer and ${M('y')} is an even positive integer, which of the following must be ${want}? Indicate <b>all</b> such expressions.`,
      ...ma(items.map((i) => ({ text: M(i.e), ok: i.ok }))),
      fast: [`Plug in the simplest legal values: ${M('x = 1')}, ${M('y = 2')}.`, items.map((i) => `${M(i.e + ' = ' + parityVal[i.e])}`).join(', ') + '.', `Keep the ${want} results. (Parity rules guarantee one test is enough.)`],
      why: `One substitution settles parity for every choice — no need to reason through each expression abstractly.`,
    };
  });

  // ---------- Percent ----------
  def({ id: 'pct-successive', area: A, topic: 'Percent change', format: 'mc', diff: 'medium' }, () => {
    let p, q, up, net;
    do { p = pick([10, 20, 25, 30, 40, 50, 60]); q = pick([10, 20, 25, 30, 40, 50]); up = pick([true, false]); net = clean(((1 + p / 100) * (1 - q / 100) - 1) * 100); } while (!Number.isInteger(net * 2) || net === 0);
    const f1 = clean(1 + p / 100), f2 = clean(1 - q / 100);
    const desc = (v) => (v > 0 ? `A ${fmt(v)}% increase` : v < 0 ? `A ${fmt(-v)}% decrease` : 'No change');
    const naive = p - q;
    const pool = [naive, -net, net + 5, net - 5, net + 10, net - 2, p, -q].map(clean).filter((v) => v !== net);
    const c = mc(desc(net), pool.map(desc));
    const order = up ? `increased by ${p}% and then decreased by ${q}%` : `decreased by ${q}% and then increased by ${p}%`;
    return {
      stem: `The price of an item was ${order}. The final price represents which of the following changes from the original price?`,
      ...c,
      fast: [`Write each change as a multiplier: ${M('\\times ' + f1)} and ${M('\\times ' + f2)}.`, `${M(f1 + ' \\times ' + f2 + ' = ' + clean(f1 * f2))}.`, `${M(clean(f1 * f2))} means ${desc(net).toLowerCase()} (order doesn't matter).`],
      why: `Multiplying factors handles "percent of a new base" automatically; just adding ${M(p + ' - ' + q)} is the classic trap.`,
    };
  });

  def({ id: 'pct-of-pct', area: A, topic: 'Percent', format: 'ne', diff: 'easy' }, () => {
    let p, q, N, ans;
    do { p = pick([10, 20, 25, 30, 40, 50, 60, 75, 80]); q = pick([10, 20, 25, 40, 50, 60, 75, 80]); N = pick([200, 400, 600, 800, 1200, 1500, 1600, 2000, 2400]); ans = clean((p * q * N) / 10000); } while (!Number.isInteger(ans * 10));
    return {
      stem: `What is ${p}% of ${q}% of ${tn(N)}?`,
      answer: num(ans),
      fast: [`Convert to fractions/decimals: ${M(fracTex(p, 100) + ' \\times ' + fracTex(q, 100) + ' \\times ' + tn(N))}.`, `Cancel before multiplying: result ${M(tn(ans))}.`],
      why: `Chaining the multipliers in one line (and cancelling first) avoids computing and re-reading an intermediate value.`,
    };
  });

  def({ id: 'pct-reverse', area: A, topic: 'Percent change', format: 'ne', diff: 'medium' }, () => {
    let X, p, up, Y;
    do { p = pick([10, 20, 25, 40, 50, 60, 75]); up = pick([true, false]); X = ri(4, 60) * 10; Y = clean(X * (up ? 1 + p / 100 : 1 - p / 100)); } while (!Number.isInteger(Y));
    const f = clean(up ? 1 + p / 100 : 1 - p / 100);
    return {
      stem: `After a ${p}% ${up ? 'increase' : 'decrease'}, the price of a jacket is ${Y} dollars. What was the price, in dollars, before the ${up ? 'increase' : 'decrease'}?`,
      answer: num(X),
      fast: [`New price = original ${M('\\times ' + f)}.`, `Original ${M('= ' + Y + ' \\div ' + f + ' = ' + X)}.`],
      why: `Dividing by the multiplier is one step. ${up ? 'Subtracting' : 'Adding'} ${p}% of ${Y} is wrong, because the ${p}% was taken of the original price, not the new one.`,
    };
  });

  def({ id: 'pct-qc-estimate', area: A, topic: 'Estimation', format: 'qc', diff: 'easy' }, () => {
    const p = pick([19, 21, 24, 26, 32, 34, 49, 51, 66, 68]); const N = pick([198, 202, 299, 301, 399, 401, 499, 505]);
    const val = (p * N) / 100; const bench = Math.round(val / 10) * 10 + pick([-5, 0, 5]);
    return {
      stem: `Compare the two quantities.`,
      ...qc(`${p}% of ${N}`, `${bench}`, cmp(val, bench)),
      fast: [`Estimate with a benchmark: ${p}% of ${N} ${M('\\approx')} ${M(fmt(clean(val)))} (exactly ${M(p + ' \\times ' + N + ' \\div 100')}).`, `Compare with ${bench}.`],
      why: `QC only asks which is bigger — a rounded estimate (then a quick check of the direction of rounding) beats full multiplication.`,
    };
  });

  // ---------- Ratios ----------
  def({ id: 'ratio-chain', area: A, topic: 'Ratio', format: 'ne', diff: 'medium' }, () => {
    let x, y, z, w;
    do { y = ri(2, 6); w = ri(2, 6); x = ri(1, 9); z = ri(1, 9); } while (y === w || gcd(x, y) !== 1 || gcd(z, w) !== 1);
    const L_ = lcm(y, w); const a = x * (L_ / y), b = L_, c = z * (L_ / w); const parts = a + b + c; const k = ri(2, 12); const N = parts * k;
    const names = pick([['apples', 'bananas', 'cherries'], ['red', 'blue', 'green'], ['cats', 'dogs', 'birds'], ['novels', 'biographies', 'comics']]);
    const target = pick([0, 1, 2]); const ans = [a, b, c][target] * k;
    const cap = (s) => s;
    return {
      stem: `In a collection, the ratio of ${names[0]} to ${names[1]} is ${x} to ${y}, and the ratio of ${names[2]} to ${names[1]} is ${z} to ${w}. If the collection has ${N} items in total, all of them ${names[0]}, ${names[1]}, or ${names[2]}, how many ${cap(names[target])} are there?`,
      answer: num(ans),
      fast: [`Make the shared term (${names[1]}) the same: scale both ratios so ${names[1]} ${M('= ' + L_)}.`, `${names[0]} : ${names[1]} : ${names[2]} ${M('= ' + a + ' : ' + b + ' : ' + c)}, total ${M(parts)} parts.`, `${M(N + ' \\div ' + parts + ' = ' + k)} per part, so ${names[target]} ${M('= ' + [a, b, c][target] + ' \\times ' + k + ' = ' + ans)}.`],
      why: `Combining into one three-part ratio turns it into a single division — no need for three variables and simultaneous equations.`,
    };
  });

  def({ id: 'ratio-combine', area: A, topic: 'Ratio', format: 'mc', diff: 'medium' }, () => {
    let a, b, c, d; do { a = ri(1, 7); b = ri(2, 8); c = ri(1, 7); d = ri(2, 8); } while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || a * c === b * d || a * d === b * c);
    const r = (n, m) => { const g = gcd(n, m); return `${n / g} to ${m / g}`; };
    const cor = r(a * c, b * d);
    const c_ = mc(cor, [r(a * d, b * c), r(a + c, b + d), r(a, d), r(c, b), r(b * d, a * c), r(a * c + 1, b * d)]);
    return {
      stem: `If the ratio of ${M('p')} to ${M('q')} is ${a} to ${b}, and the ratio of ${M('q')} to ${M('r')} is ${c} to ${d}, what is the ratio of ${M('p')} to ${M('r')}?`,
      ...c_,
      fast: [`Multiply the fractions so ${M('q')} cancels: ${M('\\frac{p}{r} = \\frac{p}{q} \\cdot \\frac{q}{r} = ' + fracTex(a, b) + ' \\cdot ' + fracTex(c, d))}.`, `${M('= ' + fracTex(a * c, b * d))}, i.e. ${cor}.`],
      why: `Treating ratios as fractions and multiplying cancels the middle term instantly — no need to find a common value for ${M('q')}.`,
    };
  });

  // ---------- Rates ----------
  def({ id: 'work-rate', area: A, topic: 'Rate & work', format: 'ne', diff: 'medium' }, () => {
    let t1, t2; do { t1 = ri(2, 12); t2 = ri(2, 15); } while (t1 === t2);
    const ask = pick(['time', 'fraction']);
    if (ask === 'time') {
      return {
        stem: `Machine A can complete a job in ${t1} hours, and Machine B can complete the same job in ${t2} hours. Working together at these rates, how many hours will the two machines take to complete the job? (Give your answer as a fraction or integer.)`,
        answer: frac(t1 * t2, t1 + t2),
        fast: [`Together time ${M('= \\frac{AB}{A + B}')} for two workers.`, `${M('\\frac{' + t1 + ' \\times ' + t2 + '}{' + t1 + ' + ' + t2 + '} = ' + fracTex(t1 * t2, t1 + t2))} hours.`],
        why: `The product-over-sum shortcut skips writing and adding the rates ${M(fracTex(1, t1) + ' + ' + fracTex(1, t2))} and then inverting.`,
      };
    }
    return {
      stem: `Pipe A alone fills a tank in ${t1} hours and pipe B alone fills it in ${t2} hours. Working together, what fraction of the tank do they fill in one hour?`,
      answer: frac(t1 + t2, t1 * t2),
      fast: [`Rates add: ${M(fracTex(1, t1) + ' + ' + fracTex(1, t2))}.`, `${M('= \\frac{' + t2 + ' + ' + t1 + '}{' + t1 * t2 + '} = ' + fracTex(t1 + t2, t1 * t2))}.`],
      why: `Work problems are always "add the rates" — never add the times.`,
    };
  });

  def({ id: 'avg-speed', area: A, topic: 'Rate & work', format: 'mc', diff: 'medium' }, () => {
    const [v1, v2] = pick([[30, 60], [40, 60], [20, 30], [10, 15], [12, 24], [45, 90], [60, 90], [36, 45], [15, 30], [40, 40 * 1.5], [24, 40], [30, 45], [50, 75], [20, 80]]);
    const ans = clean((2 * v1 * v2) / (v1 + v2));
    const c = mcNum(ans, [(v1 + v2) / 2, (v1 + v2) / 2 + 2, ans - 2, Math.max(v1, v2) - 1, ans + 4]);
    return {
      stem: `A cyclist rides from town P to town Q at an average speed of ${v1} kilometers per hour and returns along the same route at ${v2} kilometers per hour. What is the average speed, in kilometers per hour, for the entire round trip?`,
      ...c,
      fast: [`Same distance both ways → average speed ${M('= \\frac{2v_1v_2}{v_1 + v_2}')}.`, `${M('\\frac{2 \\cdot ' + v1 + ' \\cdot ' + v2 + '}{' + (v1 + v2) + '} = ' + tn(ans))}.`],
      why: `The simple average ${M((v1 + v2) / 2)} is the trap: more time is spent at the slower speed. The harmonic-mean formula is one line.`,
    };
  });

  // ---------- Exponents & roots ----------
  def({ id: 'exp-simplify', area: A, topic: 'Exponents & roots', format: 'mc', diff: 'medium' }, () => {
    const base = pick([[2, 4, 8], [3, 9, 27]]); const [p, q, r] = base; const a = ri(2, 12), b = ri(1, 6), c = ri(1, 5);
    const k = a + 2 * b - 3 * c;
    const X = (e) => M(`${p}^{${e}}`);
    const c_ = mc(X(k), [X(a + b - c), X(a + 2 * b + 3 * c), X(k + 1), X(k - 1), X(2 * a * b - 3 * c), X(a * b - c)]);
    return {
      stem: `${M(`\\frac{${p}^{${a}} \\cdot ${q}^{${b}}}{${r}^{${c}}}`)} is equal to which of the following?`,
      ...c_,
      fast: [`Rewrite with base ${p}: ${M(`${q}^{${b}} = ${p}^{${2 * b}}`)}, ${M(`${r}^{${c}} = ${p}^{${3 * c}}`)}.`, `Add exponents on top, subtract the bottom: ${M(`${a} + ${2 * b} - ${3 * c} = ${k}`)}.`, `Answer: ${X(k)}.`],
      why: `One common base turns the whole fraction into simple exponent arithmetic — never evaluate the powers.`,
    };
  });

  def({ id: 'root-simplify', area: A, topic: 'Exponents & roots', format: 'mc', diff: 'easy' }, () => {
    const p = pick([2, 3, 5, 6, 7]); let a, b; do { a = ri(2, 6); b = ri(2, 6); } while (a === b);
    const S = (k) => M(k === 1 ? `\\sqrt{${p}}` : `${k}\\sqrt{${p}}`);
    const c = mc(S(a + b), [M(`\\sqrt{${(a * a + b * b) * p}}`), S(a * b), M(`${a + b}\\sqrt{${2 * p}}`), S(a + b + 1), M(`${a * a + b * b}\\sqrt{${p}}`)]);
    return {
      stem: `${M(`\\sqrt{${a * a * p}} + \\sqrt{${b * b * p}}`)} = ?`,
      ...c,
      fast: [`Pull out perfect squares: ${M(`\\sqrt{${a * a * p}} = ${a}\\sqrt{${p}}`)}, ${M(`\\sqrt{${b * b * p}} = ${b}\\sqrt{${p}}`)}.`, `Like terms add: ${S(a + b)}.`],
      why: `Roots don't add under one sign (${M(`\\sqrt{a} + \\sqrt{b} \\ne \\sqrt{a + b}`)}); simplify each to the same radical and add the coefficients.`,
    };
  });

  def({ id: 'exp-qc', area: A, topic: 'Exponents & roots', format: 'qc', diff: 'medium' }, () => {
    const t = pick(['pow', 'sum']);
    if (t === 'pow') {
      const [b1, e1, b2, e2] = pick([[2, 30, 3, 20], [2, 40, 5, 20], [3, 30, 5, 20], [4, 15, 8, 10], [9, 10, 27, 7], [2, 60, 4, 29], [16, 5, 2, 21], [8, 20, 2, 60], [25, 10, 5, 19], [27, 5, 3, 16]]);
      const v1 = e1 * Math.log(b1), v2 = e2 * Math.log(b2);
      const rel = cmp(v1, v2);
      // same prime base? (4 = 2^2, 27 = 3^3 ...)
      const primeOf = (b) => { for (const p of [2, 3, 5]) { let k = 0, x = b; while (x % p === 0) { x /= p; k++; } if (x === 1) return [p, k]; } return null; };
      const P1 = primeOf(b1), P2 = primeOf(b2);
      let fast;
      if (P1 && P2 && P1[0] === P2[0]) {
        const p = P1[0];
        fast = [`Write both with base ${p}: ${M(`${b1}^{${e1}} = ${p}^{${P1[1] * e1}}`)} and ${M(`${b2}^{${e2}} = ${p}^{${P2[1] * e2}}`)}.`, `Same base, so compare exponents: ${M(P1[1] * e1)} vs ${M(P2[1] * e2)}.`];
      } else {
        const g = gcd(e1, e2);
        fast = [`Pull out the common exponent ${g}: ${M(`${b1}^{${e1}} = (${b1}^{${e1 / g}})^{${g}} = ${b1 ** (e1 / g)}^{${g}}`)} and ${M(`${b2}^{${e2}} = ${b2 ** (e2 / g)}^{${g}}`)}.`, `Same exponent, so compare bases: ${M(b1 ** (e1 / g))} vs ${M(b2 ** (e2 / g))}.`];
      }
      return {
        stem: `Compare the two quantities.`,
        ...qc(M(`${b1}^{${e1}}`), M(`${b2}^{${e2}}`), rel),
        fast,
        why: `Matching bases or exponents compares huge powers with no calculation.`,
      };
    }
    const n = ri(5, 30); const b = pick([2, 3]);
    return {
      stem: `Compare the two quantities.`,
      ...qc(M(`${b}^{${n}} + ${b}^{${n}}${b === 3 ? ` + ${b}^{${n}}` : ''}`), M(`${b}^{${n + 1}}`), 'C'),
      fast: [`${b} copies of ${M(`${b}^{${n}}`)} is ${M(`${b} \\cdot ${b}^{${n}}`)}.`, `${M(`= ${b}^{${n + 1}}`)} — equal.`],
      why: `Factor instead of adding exponents (a common error is ${M(`${b}^{${2 * n}}`)}).`,
    };
  });

  // ---------- Absolute value, number line ----------
  def({ id: 'abs-sum', area: A, topic: 'Absolute value', format: 'ne', diff: 'easy' }, () => {
    const a = ri(-9, 12), b = ri(2, 15); const k = pick([1, 2, 3]);
    const x1 = (a + b) / k, x2 = (a - b) / k;
    if (!Number.isInteger(x1) || !Number.isInteger(x2)) return null;
    const ask = pick(['sum', 'product']);
    const ans = ask === 'sum' ? x1 + x2 : x1 * x2;
    const lhs = k === 1 ? `x ${L.sgn(-a)}` : `${k}x ${L.sgn(-a)}`;
    return {
      stem: `If ${M(`|${a === 0 ? (k === 1 ? 'x' : k + 'x') : lhs}| = ${b}`)}, what is the ${ask} of all possible values of ${M('x')}?`,
      answer: num(ans),
      fast: [`Split into two cases: ${M(`${k === 1 ? 'x' : k + 'x'} ${L.sgn(-a)} = ${b}`)} or ${M(`= -${b}`)}.`, `${M(`x = ${x1}`)} or ${M(`x = ${x2}`)}.`, `${ask === 'sum' ? 'Sum' : 'Product'}: ${M(tn(ans))}.`],
      why: ask === 'sum' ? `Shortcut: the two solutions are symmetric around ${M(fracTex(a, k))}, so their sum is ${M('2 \\times ' + fracTex(a, k))} with no solving at all.` : `Two quick linear cases beat squaring both sides.`,
    };
  }, 18);

  def({ id: 'number-line', area: A, topic: 'Number line', format: 'mc', diff: 'medium' }, () => {
    const neg = pick([true, false]); const ask = pick(['greatest', 'least']);
    const pool = neg ? [['x', -0.5], ['x^{2}', 0.25], ['x^{3}', -0.125], ['\\frac{1}{x}', -2], ['-x', 0.5], ['x^{4}', 0.0625]] : [['x', 0.5], ['x^{2}', 0.25], ['x^{3}', 0.125], ['\\frac{1}{x}', 2], ['\\sqrt{x}', 0.7071], ['2x', 1], ['x^{4}', 0.0625]];
    const five = sample(pool, 5);
    const best = five.reduce((m, e) => (ask === 'greatest' ? (e[1] > m[1] ? e : m) : e[1] < m[1] ? e : m));
    const choices = five.map((e) => M(e[0]));
    return {
      stem: `If ${M(neg ? '-1 < x < 0' : '0 < x < 1')}, which of the following is ${ask}?`,
      choices, answer: choices.indexOf(M(best[0])),
      fast: [`Plug a friendly value in the range: ${M('x = ' + (neg ? '-\\frac{1}{2}' : '\\frac{1}{2}'))}.`, five.map((e) => `${M(e[0])} = ${M(fmt(e[1]))}`).join(', ') + '.', `${ask[0].toUpperCase() + ask.slice(1)}: ${M(best[0])}.`],
      why: `Fractions and negatives flip the usual size order of powers; one test value shows the order immediately.`,
    };
  }, 12);

  // ---------- Fractions / decimals ----------
  def({ id: 'frac-compare-qc', area: A, topic: 'Fractions & decimals', format: 'qc', diff: 'easy' }, () => {
    let a, b, c, d; do { b = ri(3, 17); d = ri(3, 17); a = ri(1, b - 1); c = ri(1, d - 1); } while (b === d || Math.abs(a / b - c / d) > 0.08 || gcd(a, b) !== 1 || gcd(c, d) !== 1);
    const useDec = pick([false, true]);
    const qb = useDec ? M(String(clean(Math.round((c / d) * 1000) / 1000))) : F(c, d);
    const bv = useDec ? clean(Math.round((c / d) * 1000) / 1000) : c / d;
    return {
      stem: `Compare the two quantities.`,
      ...qc(F(a, b), qb, cmp(a / b, bv)),
      fast: useDec ? [`Convert ${F(a, b)} to a decimal by quick division: ${M('\\approx ' + (a / b).toFixed(4))}.`, `Compare with ${qb}.`] : [`Cross-multiply: ${M(a + ' \\times ' + d + ' = ' + a * d)} vs ${M(c + ' \\times ' + b + ' = ' + c * b)}.`, `The larger cross-product belongs to the larger fraction.`],
      why: useDec ? `Only 3–4 decimal places are needed to decide.` : `Cross-multiplying avoids finding a common denominator.`,
    };
  });

  def({ id: 'decimal-place', area: A, topic: 'Fractions & decimals', format: 'ne', diff: 'hard' }, () => {
    const [n, d, rep] = pick([[1, 7, '142857'], [2, 7, '285714'], [3, 7, '428571'], [1, 13, '076923'], [4, 7, '571428'], [5, 7, '714285'], [1, 11, '09'], [7, 11, '63'], [1, 27, '037'], [5, 27, '185'], [2, 13, '153846'], [1, 37, '027']]);
    const k = ri(20, 150); const digit = +rep[(k - 1) % rep.length];
    return {
      stem: `In the decimal representation of ${F(n, d)}, what digit is in the ${ord(k)} place to the right of the decimal point?`,
      answer: num(digit),
      fast: [`${F(n, d)} ${M('= 0.\\overline{' + rep + '}')} — a ${rep.length}-digit repeating block.`, `${M(k + ' \\div ' + rep.length)} leaves remainder ${k % rep.length}${k % rep.length === 0 ? ' → last digit of the block' : ''}.`, `Digit: ${M(digit)}.`],
      why: `Repeating decimals are periodic, so the remainder picks the digit directly.`,
    };
  });

  // ---------- Sequences ----------
  def({ id: 'arith-seq', area: A, topic: 'Sequences', format: 'ne', diff: 'medium' }, () => {
    const a1 = ri(-10, 20), d = ri(-4, 7) || 3; const i = ri(2, 5), j = i + ri(3, 7), k = ri(15, 40);
    const t = (n) => a1 + (n - 1) * d;
    return {
      stem: `In an arithmetic sequence, the ${ord(i)} term is ${t(i)} and the ${ord(j)} term is ${t(j)}. What is the ${ord(k)} term?`,
      answer: num(t(k)),
      fast: [`Common difference ${M('d = \\frac{' + t(j) + ' - ' + L.par(t(i)) + '}{' + j + ' - ' + i + '} = ' + d)}.`, `Jump from term ${i}: ${M(t(i) + ' + (' + k + ' - ' + i + ')' + L.par(d).replace(/^(\d+)$/, '($1)') + ' = ' + t(k))}.`],
      why: `Jumping straight from a known term skips finding the first term and listing values.`,
    };
  });

  def({ id: 'consec-sum', area: A, topic: 'Sequences', format: 'ne', diff: 'medium' }, () => {
    const type = pick(['int', 'even', 'odd']);
    let a, b; if (type === 'int') { a = ri(1, 40); b = a + ri(10, 60); } else { a = ri(1, 30) * 2 - (type === 'odd' ? 1 : 0); b = a + 2 * ri(8, 40); }
    const step = type === 'int' ? 1 : 2; const n = (b - a) / step + 1; const s = (n * (a + b)) / 2;
    const w = type === 'int' ? 'integers' : type === 'even' ? 'even integers' : 'odd integers';
    return {
      stem: `What is the sum of all the ${w} from ${a} to ${b}, inclusive?`,
      answer: num(s),
      fast: [`Count: ${M('\\frac{' + b + ' - ' + a + '}{' + step + '} + 1 = ' + n)} terms.`, `Average = ${M('\\frac{' + a + ' + ' + b + '}{2} = ' + fmt((a + b) / 2))}.`, `Sum = count × average = ${M(tn(s))}.`],
      why: `Evenly spaced lists: sum = (number of terms) × (average of first and last). No adding term by term.`,
    };
  });

  function ord(n) { const s = ['th', 'st', 'nd', 'rd']; const v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
};
