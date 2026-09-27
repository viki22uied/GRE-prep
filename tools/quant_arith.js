const L = require('./lib');
const { ri, pick, shuffle, sample, gcd, lcm, M, F, fracTex, tn, fmt, num, frac, mc, mcNum, ma, qc, cmp, clean, EX, ord, par } = L;

module.exports = function (def) {
  const A = 'Arithmetic';

  // ---------- Integers: remainders ----------
  def({ id: 'rem-mult', area: A, topic: 'Remainders', format: 'ne', diff: 'medium' }, () => {
    const a = pick([5, 6, 7, 8, 9, 11, 12, 13]); const r = ri(2, a - 1); const k = ri(2, 9);
    const prod = k * r, ans = prod % a, q = Math.floor(prod / a);
    return {
      stem: `When the positive integer ${M('n')} is divided by ${a}, the remainder is ${r}. What is the remainder when ${M(k + 'n')} is divided by ${a}?`,
      answer: num(ans),
      ...EX(
        `We are never told what ${M('n')} actually is — only its remainder — so we can't just compute ${M(k + 'n')} directly.`,
        `When a question gives you a remainder but not the number, pick the simplest number that has that remainder and work with it. Any number that fits the condition gives the same final remainder, so the simplest one is as good as any.`,
        [
          `What is the smallest positive number that leaves remainder ${r} when divided by ${a}? It is ${r} itself: ${r} is less than ${a}, so ${a} goes into it 0 times with ${r} left over. So we use ${M('n = ' + r)}.`,
          `Now multiply by ${k}, because the question asks about ${M(k + 'n')}: that gives ${M(k + ' \\times ' + r + ' = ' + prod)}.`,
          `Finally divide ${prod} by ${a} and keep only what's left over. ${a} fits into ${prod} exactly ${q} time${q === 1 ? '' : 's'} (${M(a + ' \\times ' + q + ' = ' + a * q)}), leaving ${M(prod + ' - ' + a * q + ' = ' + ans)}.`,
          `If you want to double-check, try the next number with remainder ${r}, which is ${M(r + ' + ' + a + ' = ' + (r + a))}. Then ${M(k + ' \\times ' + (r + a) + ' = ' + k * (r + a))}, and ${k * (r + a)} divided by ${a} also leaves ${ans}.`,
        ],
        `${M(`n = ${r} \\;\\Rightarrow\\; ${k}n = ${prod} = ${a}(${q}) + ${ans}`)}, so the remainder is ${M(ans)}.`,
        `Pattern: "remainder given, number unknown." Replace the unknown with the smallest number that has that remainder (the remainder itself) and compute. No need to write ${M(`n = ${a}q + ${r}`)}.`,
      ),
    };
  });

  def({ id: 'rem-sum', area: A, topic: 'Remainders', format: 'mc', diff: 'medium' }, () => {
    const a = pick([6, 7, 8, 9, 10, 11, 12]); const r1 = ri(1, a - 1); const r2 = ri(1, a - 1);
    const op = pick(['sum', 'product']);
    const raw = op === 'sum' ? r1 + r2 : r1 * r2; const ans = raw % a; const q = Math.floor(raw / a);
    const c = mcNum(ans, [raw, (ans + 1) % a, (ans + 2) % a, Math.abs(r1 - r2), (ans + a - 1) % a, (ans + 3) % a].filter((x) => x < a || x === raw));
    return {
      stem: `When positive integers ${M('x')} and ${M('y')} are divided by ${a}, the remainders are ${r1} and ${r2}, respectively. What is the remainder when the ${op} ${M(op === 'sum' ? 'x + y' : 'xy')} is divided by ${a}?`,
      ...c,
      ...EX(
        `We know only the remainders of ${M('x')} and ${M('y')}, not the numbers themselves.`,
        `Remainders behave nicely under ${op === 'sum' ? 'addition' : 'multiplication'}: the remainder of the ${op} equals the remainder of the ${op} of the remainders. So you can replace each number by the smallest number with its remainder.`,
        [
          `The smallest number that leaves ${r1} when divided by ${a} is ${r1} itself, so take ${M('x = ' + r1)}. Likewise take ${M('y = ' + r2)}.`,
          `The question asks about the ${op}, so ${op === 'sum' ? 'add' : 'multiply'} them: ${M((op === 'sum' ? r1 + ' + ' + r2 : r1 + ' \\times ' + r2) + ' = ' + raw)}.`,
          raw < a ? `${raw} is already smaller than ${a}, so it is its own remainder.` : `${raw} is at least ${a}, so we still have to divide: ${a} goes into ${raw} ${q} time${q === 1 ? '' : 's'} (${M(a * q)}), leaving ${M(raw + ' - ' + a * q + ' = ' + ans)}.`,
          `Watch out for the trap answer ${raw}: it forgets that a remainder must be smaller than the divisor ${a}.`,
        ],
        `${M(`${op === 'sum' ? r1 + ' + ' + r2 : r1 + ' \\times ' + r2} = ${raw} = ${a}(${q}) + ${ans}`)} → remainder ${M(ans)}.`,
        `Pattern: "remainder of a ${op}." Work with the remainders only, then reduce once more if the result is ${a} or bigger.`,
      ),
    };
  });

  // ---------- Units digit cycles ----------
  def({ id: 'units-digit', area: A, topic: 'Exponents & units digits', format: 'mc', diff: 'medium' }, () => {
    const b = pick([2, 3, 7, 8, 12, 13, 17, 18, 22, 23, 27, 33, 37, 43, 47, 53]); const e = ri(21, 99);
    const u = b % 10; const cyc = []; let x = u;
    while (!cyc.includes(x)) { cyc.push(x); x = (x * u) % 10; }
    const L_ = cyc.length, rem = e % L_, pos = rem === 0 ? L_ : rem, ans = cyc[pos - 1];
    const others = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => d !== ans));
    const c = mcNum(ans, [...cyc.filter((d) => d !== ans), ...others], (v) => M(v));
    return {
      stem: `What is the units digit of ${M(b + '^{' + e + '}')}?`,
      ...c,
      ...EX(
        `${M(b + '^{' + e + '}')} is an enormous number — far too big to compute.`,
        `The units digit of a product depends only on the units digits of the factors. So the units digits of successive powers repeat in a short cycle. Find the cycle, then use the remainder of the exponent divided by the cycle length to find where in the cycle you land.`,
        [
          `Only the last digit of ${b} matters, and that is ${u}. So we look at powers of ${u} and keep only their last digits.`,
          `Listing them: ${cyc.map((d, i) => `${M(u + '^{' + (i + 1) + '}')} ends in ${d}`).join(', ')}, and the next power ends in ${cyc[0]} again. So the cycle is ${M(cyc.join(', '))}, which has length ${L_}.`,
          `Because the pattern repeats every ${L_} powers, divide the exponent ${e} by ${L_}: ${M(e + ' = ' + L_ + ' \\times ' + Math.floor(e / L_) + ' + ' + rem)}. The remainder is ${rem}.`,
          rem === 0 ? `A remainder of 0 means ${e} is a complete number of cycles, so we land on the last digit of the cycle, the ${ord(L_)} one, which is ${ans}.` : `A remainder of ${rem} means we land on the ${ord(rem)} digit of the cycle, which is ${ans}.`,
        ],
        `Cycle ${M(cyc.join(', '))} (length ${L_}); ${M(e + ' \\div ' + L_)} leaves ${rem} → position ${pos} → units digit ${M(ans)}.`,
        `Pattern: "units digit of a big power." Find the cycle of last digits (length 1, 2 or 4), divide the exponent by the cycle length, and read off the position; remainder 0 means the last position.`,
      ),
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
      ...EX(
        `If we simply add the multiples of ${a} and the multiples of ${b}, the numbers divisible by both get counted twice.`,
        `To count items in "A or B": count A, count B, then subtract the items that are in both (inclusion–exclusion). The number of multiples of ${M('k')} from 1 to ${M('N')} is ${M('N \\div k')}, rounded down.`,
        [
          `Multiples of ${a} up to ${N}: ${M(N + ' \\div ' + a + ' = ' + fmt(clean(N / a)))}, and we round down to ${na} because only whole multiples count.`,
          `Multiples of ${b} up to ${N}: ${M(N + ' \\div ' + b + ' = ' + fmt(clean(N / b)))}, rounded down to ${nb}.`,
          `A number divisible by both ${a} and ${b} is a multiple of their least common multiple. ${gcd(a, b) > 1 ? `Since ${a} and ${b} share the factor ${gcd(a, b)}, the LCM is not ${a * b} but ${l}.` : `Since ${a} and ${b} share no common factor, the LCM is just ${M(a + ' \\times ' + b + ' = ' + l)}.`} Multiples of ${l} up to ${N}: ${M(N + ' \\div ' + l + ' = ' + fmt(clean(N / l)))}, rounded down to ${nl}.`,
          `These ${nl} numbers were counted once in the ${na} and again in the ${nb}, so subtract them once.`,
        ],
        `${M(`${na} + ${nb} - ${nl} = ${na + nb - nl}`)}`,
        `Pattern: "divisible by a or b." Count each, subtract the overlap, and find the overlap with the LCM (not automatically the product).`,
      ),
    };
  });

  // ---------- Number of divisors ----------
  def({ id: 'divisor-count', area: A, topic: 'Factors & primes', format: 'mc', diff: 'hard' }, () => {
    let N, exps, ps;
    do { ps = sample([2, 3, 5, 7], pick([2, 3])).sort((x, y) => x - y); exps = ps.map(() => ri(1, 3)); N = ps.reduce((acc, p, i) => acc * p ** exps[i], 1); } while (N > 20000 || N < 30);
    const ans = exps.reduce((a, e) => a * (e + 1), 1);
    const sum = exps.reduce((a, e) => a + e, 0);
    const c = mcNum(ans, [sum, exps.reduce((a, e) => a * e, 1), ans - 2, ans + 2, sum + 1, ans / 2]);
    const fac = ps.map((p, i) => (exps[i] > 1 ? `${p}^{${exps[i]}}` : `${p}`)).join(' \\cdot ');
    return {
      stem: `How many positive divisors does ${M(tn(N))} have?`,
      ...c,
      ...EX(
        `Listing every divisor of ${tn(N)} by trial division is slow, and it's easy to miss one.`,
        `Write the number as a product of primes, ${M('p^{a} \\cdot q^{b} \\cdots')}. Every divisor is built by choosing how many copies of each prime to use: 0 up to ${M('a')} copies of ${M('p')} (that's ${M('a + 1')} choices), 0 up to ${M('b')} copies of ${M('q')}, and so on. Multiply the numbers of choices.`,
        [
          `Prime-factor ${tn(N)}: ${M(tn(N) + ' = ' + fac)}.`,
          ...ps.map((p, i) => `For the prime ${p}, a divisor can contain it 0, 1${exps[i] >= 2 ? ', …, ' + exps[i] : ''} times — that is ${exps[i] + 1} choices (one more than the exponent ${exps[i]}, because "zero copies" is also a choice).`),
          `The choices for different primes are independent, so multiply them.`,
        ],
        `${M(exps.map((e) => `(${e} + 1)`).join('') + ' = ' + exps.map((e) => e + 1).join(' \\times ') + ' = ' + ans)}`,
        `Pattern: "how many divisors." Prime-factor, add 1 to each exponent, multiply. The trap is adding exponents (${sum}) or forgetting the +1.`,
      ),
    };
  });

  def({ id: 'distinct-primes-qc', area: A, topic: 'Factors & primes', format: 'qc', diff: 'easy' }, () => {
    const mk = () => { const ps = sample([2, 3, 5, 7, 11, 13], ri(1, 3)).sort((a, b) => a - b); const es = ps.map(() => ri(1, 3)); return { ps, es, n: ps.reduce((a, p, i) => a * p ** es[i], 1) }; };
    let x, y; do { x = mk(); y = mk(); } while (x.n === y.n || x.n > 5000 || y.n > 5000);
    const fac = (o) => o.ps.map((p, i) => (o.es[i] > 1 ? `${p}^{${o.es[i]}}` : p)).join(' \\cdot ');
    return {
      stem: `Compare the two quantities.`,
      ...qc(`The number of distinct prime factors of ${M(x.n)}`, `The number of distinct prime factors of ${M(y.n)}`, cmp(x.ps.length, y.ps.length)),
      ...EX(
        `It's tempting to assume the bigger number has more prime factors, but size tells you nothing here.`,
        `"Distinct prime factors" means the different primes in the factorization, each counted once no matter how many times it repeats. Factor each number and count the different primes.`,
        [
          `Factor ${x.n} by dividing out small primes: ${M(x.n + ' = ' + fac(x))}. The different primes are ${x.ps.join(', ')}, so there ${x.ps.length === 1 ? 'is 1' : 'are ' + x.ps.length}.`,
          `Factor ${y.n}: ${M(y.n + ' = ' + fac(y))}. The different primes are ${y.ps.join(', ')}, so there ${y.ps.length === 1 ? 'is 1' : 'are ' + y.ps.length}.`,
          `Exponents don't matter: ${M('2^{3}')} still contributes just one distinct prime, 2.`,
        ],
        `A: ${x.ps.length}, B: ${y.ps.length} → ${x.ps.length > y.ps.length ? 'A is greater' : x.ps.length < y.ps.length ? 'B is greater' : 'equal'}.`,
        `Pattern: "distinct primes." Factor, then count the different bases — ignore exponents and ignore how large the number is.`,
      ),
    };
  });

  // ---------- Odd / even ----------
  const parityPool = [
    ['x + y', 1, 'odd + even = odd'], ['xy', 0, 'odd × even = even'], ['x^{2} + y', 1, 'odd² is odd; odd + even = odd'], ['x + 2y', 1, '2y is even; odd + even = odd'], ['2x + y', 0, '2x is even; even + even = even'],
    ['x^{2}y', 0, 'anything × even = even'], ['(x + y)^{2}', 1, 'x + y is odd, and odd² is odd'], ['x^{y}', 1, 'odd × odd × … stays odd'], ['y^{x}', 0, 'even × even × … stays even'],
    ['3x + 5y', 1, '3x is odd, 5y is even; odd + even = odd'], ['xy + 1', 1, 'xy is even; even + 1 = odd'], ['x(y + 1)', 1, 'y + 1 is odd; odd × odd = odd'], ['y(x + 1)', 0, 'y is even, so the product is even'],
    ['x^{2} + y^{2}', 1, 'odd + even = odd'], ['x - y', 1, 'odd − even = odd'], ['2(x + y)', 0, 'anything × 2 is even'], ['x^{3}', 1, 'odd × odd × odd = odd'], ['x + y + 1', 0, 'odd + even + odd = even'], ['(x + 1)(y + 1)', 0, 'x + 1 is even, so the product is even'],
  ];
  const parityVal = { 'x + y': 3, 'xy': 2, 'x^{2} + y': 3, 'x + 2y': 5, '2x + y': 4, 'x^{2}y': 2, '(x + y)^{2}': 9, 'x^{y}': 1, 'y^{x}': 2, '3x + 5y': 13, 'xy + 1': 3, 'x(y + 1)': 3, 'y(x + 1)': 4, 'x^{2} + y^{2}': 5, 'x - y': -1, '2(x + y)': 6, 'x^{3}': 1, 'x + y + 1': 4, '(x + 1)(y + 1)': 6 };
  def({ id: 'parity-ma', area: A, topic: 'Odd & even', format: 'ma', diff: 'easy' }, () => {
    const want = pick(['odd', 'even']);
    let items;
    do { items = sample(parityPool, 5).map(([e, odd, rule]) => ({ e, rule, ok: want === 'odd' ? odd === 1 : odd === 0 })); } while (!items.some((i) => i.ok) || items.every((i) => i.ok));
    return {
      stem: `If ${M('x')} is an odd integer and ${M('y')} is an even positive integer, which of the following must be ${want}? Indicate <b>all</b> such expressions.`,
      ...ma(items.map((i) => ({ text: M(i.e), ok: i.ok }))),
      ...EX(
        `"Must be ${want}" sounds like it needs a proof for every possible ${M('x')} and ${M('y')}.`,
        `Whether a sum or product is odd or even depends only on whether its parts are odd or even, never on their size. So one test with the smallest legal values settles each expression for all values.`,
        [
          `The simplest odd integer is 1, and the simplest even positive integer is 2, so use ${M('x = 1')} and ${M('y = 2')}.`,
          ...items.map((i) => `${M(i.e)} becomes ${M(parityVal[i.e])}, which is ${Math.abs(parityVal[i.e]) % 2 ? 'odd' : 'even'} (${i.rule}) → ${i.ok ? 'keep' : 'reject'}.`),
        ],
        `Keep the expressions whose value with ${M('x = 1, y = 2')} is ${want}.`,
        `Pattern: "must be odd/even." Plug in 1 for the odd variable and 2 for the even one; parity rules guarantee the result holds for every value.`,
      ),
    };
  });

  // ---------- Percent ----------
  def({ id: 'pct-successive', area: A, topic: 'Percent change', format: 'mc', diff: 'medium' }, () => {
    let p, q, up, net;
    do { p = pick([10, 20, 25, 30, 40, 50, 60]); q = pick([10, 20, 25, 30, 40, 50]); up = pick([true, false]); net = clean(((1 + p / 100) * (1 - q / 100) - 1) * 100); } while (!Number.isInteger(net * 2) || net === 0);
    const f1 = clean(1 + p / 100), f2 = clean(1 - q / 100), prod = clean(f1 * f2);
    const desc = (v) => (v > 0 ? `A ${fmt(v)}% increase` : v < 0 ? `A ${fmt(-v)}% decrease` : 'No change');
    const naive = p - q;
    const c = mc(desc(net), [naive, -net, net + 5, net - 5, net + 10, net - 2, p, -q].map(clean).filter((v) => v !== net).map(desc));
    const order = up ? `increased by ${p}% and then decreased by ${q}%` : `decreased by ${q}% and then increased by ${p}%`;
    return {
      stem: `The price of an item was ${order}. The final price represents which of the following changes from the original price?`,
      ...c,
      ...EX(
        `The two percents are taken of different amounts: the second change applies to the new price, not the original. So you can't just combine ${p}% and ${q}% by adding or subtracting.`,
        `Turn each percent change into a multiplier: an increase of ${M('r\\%')} multiplies by ${M('1 + \\frac{r}{100}')}, a decrease multiplies by ${M('1 - \\frac{r}{100}')}. Multiply the multipliers; the result compared with 1 is the overall change.`,
        [
          `A ${p}% increase keeps 100% and adds ${p}%, so the multiplier is ${M(f1)}.`,
          `A ${q}% decrease keeps ${100 - q}% of the price, so the multiplier is ${M(f2)}.`,
          `Multiplication doesn't care about order, so the result is the same whichever change came first: ${M(f1 + ' \\times ' + f2 + ' = ' + prod)}.`,
          `${M(prod)} means the final price is ${fmt(clean(prod * 100))}% of the original, which is ${net > 0 ? fmt(net) + '% more' : fmt(-net) + '% less'} than 100%.`,
        ],
        `${M(`${f1} \\times ${f2} = ${prod}`)} → ${desc(net).toLowerCase()}.`,
        `Pattern: "successive percent changes." Multiply the factors (1 ± rate). The trap answer ${desc(naive).toLowerCase()} comes from simply combining ${p} and ${q}.`,
      ),
    };
  });

  def({ id: 'pct-of-pct', area: A, topic: 'Percent', format: 'ne', diff: 'easy' }, () => {
    let p, q, N, ans;
    do { p = pick([10, 20, 25, 30, 40, 50, 60, 75, 80]); q = pick([10, 20, 25, 40, 50, 60, 75, 80]); N = pick([200, 400, 600, 800, 1200, 1500, 1600, 2000, 2400]); ans = clean((p * q * N) / 10000); } while (!Number.isInteger(ans * 10));
    const mid = clean((q * N) / 100);
    return {
      stem: `What is ${p}% of ${q}% of ${tn(N)}?`,
      answer: num(ans),
      ...EX(
        `Two percents stacked on each other: it's easy to lose track of which amount each percent is taken of.`,
        `"Of" means multiply. Write each percent as a fraction over 100 and multiply everything in one line, working from the inside out (the last "of" first).`,
        [
          `Start with the inner part, ${q}% of ${tn(N)}. ${q}% is ${M(fracTex(q, 100))}, so this is ${M(fracTex(q, 100) + ' \\times ' + tn(N) + ' = ' + tn(mid))}.`,
          `Now take ${p}% of that result. ${p}% is ${M(fracTex(p, 100))}, so we compute ${M(fracTex(p, 100) + ' \\times ' + tn(mid))}.`,
        ],
        `${M(`${fracTex(p, 100)} \\times ${fracTex(q, 100)} \\times ${tn(N)} = ${fracTex(p, 100)} \\times ${tn(mid)} = ${tn(ans)}`)}`,
        `Pattern: "percent of a percent." Convert each to a fraction and multiply; simplify the fractions first so the numbers stay small.`,
      ),
    };
  });

  def({ id: 'pct-reverse', area: A, topic: 'Percent change', format: 'ne', diff: 'medium' }, () => {
    let X, p, up, Y;
    do { p = pick([10, 20, 25, 40, 50, 60, 75]); up = pick([true, false]); X = ri(4, 60) * 10; Y = clean(X * (up ? 1 + p / 100 : 1 - p / 100)); } while (!Number.isInteger(Y));
    const f = clean(up ? 1 + p / 100 : 1 - p / 100);
    const wrong = clean(up ? Y - (p / 100) * Y : Y + (p / 100) * Y);
    return {
      stem: `After a ${p}% ${up ? 'increase' : 'decrease'}, the price of a jacket is ${Y} dollars. What was the price, in dollars, before the ${up ? 'increase' : 'decrease'}?`,
      answer: num(X),
      ...EX(
        `We know the price after the change, but the ${p}% was a percent of the original price, which is the thing we don't know. So we can't just ${up ? 'take' : 'add back'} ${p}% of ${Y}.`,
        `A percent change multiplies the original by a factor. To go backwards, divide the new value by that same factor.`,
        [
          `A ${p}% ${up ? 'increase' : 'decrease'} means the new price is ${up ? 100 + p : 100 - p}% of the original, so the factor is ${M(f)}.`,
          `So ${M('\\text{original} \\times ' + f + ' = ' + Y)}. Undo the multiplication by dividing ${Y} by ${f}.`,
          `Check: ${M(X + ' \\times ' + f + ' = ' + Y)}. ✓`,
        ],
        `${M(`${Y} \\div ${f} = ${X}`)}`,
        `Pattern: "find the original after a percent change." Divide by the multiplier. The trap is ${up ? 'subtracting' : 'adding'} ${p}% of the new price, which gives ${fmt(wrong)}.`,
      ),
    };
  });

  def({ id: 'pct-qc-estimate', area: A, topic: 'Estimation', format: 'qc', diff: 'easy' }, () => {
    const p = pick([19, 21, 24, 26, 32, 34, 49, 51, 66, 68]); const N = pick([198, 202, 299, 301, 399, 401, 499, 505]);
    const val = clean((p * N) / 100); const bench = Math.round(val / 10) * 10 + pick([-5, 0, 5]);
    const pr = Math.round(p / 5) * 5 === 35 ? 33 : Math.round(p / 5) * 5; const nr = Math.round(N / 100) * 100;
    return {
      stem: `Compare the two quantities.`,
      ...qc(`${p}% of ${N}`, `${bench}`, cmp(val, bench)),
      ...EX(
        `Multiplying ${p} × ${N} exactly is slow, and QC only asks which side is bigger.`,
        `Round to friendly numbers to get a quick estimate, then check which way the rounding pushed the estimate. Only calculate exactly if the estimate lands too close to call.`,
        [
          `${N} is close to ${nr}, and ${p}% is close to ${pr}%. So ${p}% of ${N} is roughly ${pr}% of ${nr}, which is ${fmt(clean(pr * nr / 100))}.`,
          `That estimate is near ${bench}, so it's worth being exact: ${M(`${p} \\times ${N} \\div 100 = ${fmt(val)}`)}.`,
          `Compare ${fmt(val)} with ${bench}.`,
        ],
        `${M(`\\frac{${p}}{100} \\times ${N} = ${fmt(val)}`)} vs ${M(bench)}.`,
        `Pattern: "QC with ugly percents." Estimate with benchmark numbers first; compute exactly only if the two sides are close.`,
      ),
    };
  });

  // ---------- Ratios ----------
  def({ id: 'ratio-chain', area: A, topic: 'Ratio', format: 'ne', diff: 'medium' }, () => {
    let x, y, z, w;
    do { y = ri(2, 6); w = ri(2, 6); x = ri(1, 9); z = ri(1, 9); } while (y === w || gcd(x, y) !== 1 || gcd(z, w) !== 1);
    const L_ = lcm(y, w), m1 = L_ / y, m2 = L_ / w; const a = x * m1, b = L_, c = z * m2; const parts = a + b + c; const k = ri(2, 12); const N = parts * k;
    const names = pick([['apples', 'bananas', 'cherries'], ['red', 'blue', 'green'], ['cats', 'dogs', 'birds'], ['novels', 'biographies', 'comics']]);
    const target = pick([0, 1, 2]); const ans = [a, b, c][target] * k;
    return {
      stem: `In a collection, the ratio of ${names[0]} to ${names[1]} is ${x} to ${y}, and the ratio of ${names[2]} to ${names[1]} is ${z} to ${w}. If the collection has ${N} items in total, all of them ${names[0]}, ${names[1]}, or ${names[2]}, how many ${names[target]} are there?`,
      answer: num(ans),
      ...EX(
        `${names[1][0].toUpperCase() + names[1].slice(1)} is worth ${y} parts in the first ratio but ${w} parts in the second, so the two ratios use different "part sizes" and can't be combined yet.`,
        `When the same item appears in two separate ratios with different values, find a common value for it (the least common multiple works), scale each ratio so that item matches, then merge them into one combined ratio. After that, total ÷ total parts gives the size of one part.`,
        [
          `${names[1]} is ${y} in one ratio and ${w} in the other. The smallest number both ${y} and ${w} divide into is their LCM, ${L_}, so we'll make ${names[1]} equal ${L_} in both.`,
          `To turn ${y} into ${L_}, multiply the first ratio by ${m1}: ${x} : ${y} becomes ${x * m1} : ${L_}. (Multiplying both sides of a ratio by the same number doesn't change it.)`,
          `To turn ${w} into ${L_}, multiply the second ratio by ${m2}: ${z} : ${w} becomes ${z * m2} : ${L_}.`,
          `Now ${names[1]} means the same thing in both, so merge: ${names[0]} : ${names[1]} : ${names[2]} = ${a} : ${b} : ${c}. Adding the parts, ${a} + ${b} + ${c} = ${parts} parts make up the whole collection.`,
          `The collection has ${N} items spread over ${parts} equal parts, so each part is ${N} ÷ ${parts} = ${k} items. ${names[target][0].toUpperCase() + names[target].slice(1)} has ${[a, b, c][target]} parts.`,
        ],
        `${M(`${N} \\div ${parts} = ${k}`)} items per part; ${M(`${[a, b, c][target]} \\times ${k} = ${ans}`)}.`,
        `Pattern: shared-term ratio merging. Whenever the same item shows up in two ratios, match it with the LCM and merge — don't set up three variables and simultaneous equations.`,
      ),
    };
  });

  def({ id: 'ratio-combine', area: A, topic: 'Ratio', format: 'mc', diff: 'medium' }, () => {
    let a, b, c, d; do { a = ri(1, 7); b = ri(2, 8); c = ri(1, 7); d = ri(2, 8); } while (gcd(a, b) !== 1 || gcd(c, d) !== 1 || a * c === b * d || a * d === b * c);
    const r = (n, m) => { const g = gcd(n, m); return `${n / g} to ${m / g}`; };
    const cor = r(a * c, b * d); const g = gcd(a * c, b * d);
    return {
      stem: `If the ratio of ${M('p')} to ${M('q')} is ${a} to ${b}, and the ratio of ${M('q')} to ${M('r')} is ${c} to ${d}, what is the ratio of ${M('p')} to ${M('r')}?`,
      ...mc(cor, [r(a * d, b * c), r(a + c, b + d), r(a, d), r(c, b), r(b * d, a * c), r(a * c + 1, b * d)]),
      ...EX(
        `${M('p')} and ${M('r')} are never compared directly — they are linked only through ${M('q')}.`,
        `Write each ratio as a fraction. Multiplying ${M('\\frac{p}{q}')} by ${M('\\frac{q}{r}')} cancels the shared ${M('q')} and leaves ${M('\\frac{p}{r}')}. This works for any chain of ratios that share a middle term.`,
        [
          `"${M('p')} to ${M('q')} is ${a} to ${b}" means ${M('\\frac{p}{q} = ' + fracTex(a, b))}, and "${M('q')} to ${M('r')} is ${c} to ${d}" means ${M('\\frac{q}{r} = ' + fracTex(c, d))}.`,
          `Multiply them, because ${M('\\frac{p}{q} \\cdot \\frac{q}{r} = \\frac{p}{r}')} — the ${M('q')} on top cancels the ${M('q')} on the bottom.`,
          `Multiply tops and bottoms: numerator ${M(a + ' \\times ' + c + ' = ' + a * c)}, denominator ${M(b + ' \\times ' + d + ' = ' + b * d)}.${g > 1 ? ` Both share a factor of ${g}, so reduce.` : ''}`,
        ],
        `${M(`\\frac{p}{r} = ${fracTex(a, b)} \\cdot ${fracTex(c, d)} = \\frac{${a * c}}{${b * d}}${g > 1 ? ' = ' + fracTex(a * c, b * d) : ''}`)}, i.e. ${cor}.`,
        `Pattern: "ratio chain through a middle term." Multiply the fractions so the middle term cancels.`,
      ),
    };
  });

  // ---------- Rates ----------
  def({ id: 'work-rate', area: A, topic: 'Rate & work', format: 'ne', diff: 'medium' }, () => {
    let t1, t2; do { t1 = ri(2, 12); t2 = ri(2, 15); } while (t1 === t2);
    const ask = pick(['time', 'fraction']);
    const common = [
      `Machine A does the whole job in ${t1} hours, so in one hour it does ${M(fracTex(1, t1))} of the job. For the same reason B does ${M(fracTex(1, t2))} of the job per hour.`,
      `Working together, their hourly amounts add: ${M(fracTex(1, t1) + ' + ' + fracTex(1, t2))}. Using the common denominator ${t1 * t2} (the product of ${t1} and ${t2}), that's ${M(`\\frac{${t2}}{${t1 * t2}} + \\frac{${t1}}{${t1 * t2}} = \\frac{${t1 + t2}}{${t1 * t2}}`)} of the job per hour.`,
    ];
    if (ask === 'time') {
      return {
        stem: `Machine A can complete a job in ${t1} hours, and Machine B can complete the same job in ${t2} hours. Working together at these rates, how many hours will the two machines take to complete the job? (Give your answer as a fraction or integer.)`,
        answer: frac(t1 * t2, t1 + t2),
        ...EX(
          `Times don't add: two machines together are faster than either alone, so the answer must be less than ${Math.min(t1, t2)} hours.`,
          `Convert each time into a rate (fraction of the job per hour), add the rates, then flip the combined rate to get the time. For exactly two workers this collapses to the shortcut ${M('\\frac{AB}{A + B}')}.`,
          [...common, `If they finish ${M(fracTex(t1 + t2, t1 * t2))} of the job each hour, the whole job takes the reciprocal: ${M(fracTex(t1 * t2, t1 + t2))} hours.`],
          `${M(`\\frac{${t1} \\times ${t2}}{${t1} + ${t2}} = \\frac{${t1 * t2}}{${t1 + t2}}${gcd(t1 * t2, t1 + t2) > 1 ? ' = ' + fracTex(t1 * t2, t1 + t2) : ''}`)} hours.`,
          `Pattern: "working together." Add rates, not times; for two workers, time = product ÷ sum.`,
        ),
      };
    }
    return {
      stem: `Pipe A alone fills a tank in ${t1} hours and pipe B alone fills it in ${t2} hours. Working together, what fraction of the tank do they fill in one hour?`,
      answer: frac(t1 + t2, t1 * t2),
      ...EX(
        `The data are given as times, but the question asks how much gets done in one hour — a rate.`,
        `A job that takes ${M('t')} hours is done at a rate of ${M('\\frac{1}{t}')} per hour. Rates of things working at the same time add.`,
        common.map((s) => s.replace(/Machine /g, 'Pipe ').replace(/machines/g, 'pipes')),
        `${M(`${fracTex(1, t1)} + ${fracTex(1, t2)} = \\frac{${t1 + t2}}{${t1 * t2}}${gcd(t1 + t2, t1 * t2) > 1 ? ' = ' + fracTex(t1 + t2, t1 * t2) : ''}`)}`,
        `Pattern: "combined work rate." Rate = 1 ÷ time, and rates add.`,
      ),
    };
  });

  def({ id: 'avg-speed', area: A, topic: 'Rate & work', format: 'mc', diff: 'medium' }, () => {
    const [v1, v2] = pick([[30, 60], [40, 60], [20, 30], [10, 15], [12, 24], [45, 90], [60, 90], [36, 45], [15, 30], [40, 60], [24, 40], [30, 45], [50, 75], [20, 80]]);
    const ans = clean((2 * v1 * v2) / (v1 + v2)); const D = lcm(v1, v2); const t1 = D / v1, t2 = D / v2;
    return {
      stem: `A cyclist rides from town P to town Q at an average speed of ${v1} kilometers per hour and returns along the same route at ${v2} kilometers per hour. What is the average speed, in kilometers per hour, for the entire round trip?`,
      ...mcNum(ans, [(v1 + v2) / 2, (v1 + v2) / 2 + 2, ans - 2, Math.max(v1, v2) - 1, ans + 4]),
      ...EX(
        `The cyclist spends more time at the slower speed, so the plain average of ${v1} and ${v2} (${fmt((v1 + v2) / 2)}) is wrong.`,
        `Average speed is always total distance ÷ total time. Since no distance is given, choose a convenient one — a number both speeds divide into — and compute the times.`,
        [
          `Pick a one-way distance that both ${v1} and ${v2} divide evenly: their LCM, ${D} km, keeps every time a whole number.`,
          `Going at ${v1} km/h, ${D} km takes ${D} ÷ ${v1} = ${t1} hour${t1 > 1 ? 's' : ''}. Returning at ${v2} km/h takes ${D} ÷ ${v2} = ${t2} hour${t2 > 1 ? 's' : ''}.`,
          `The round trip is ${2 * D} km (there and back) and takes ${t1} + ${t2} = ${t1 + t2} hours.`,
        ],
        `${M(`\\frac{${2 * D}}{${t1 + t2}} = ${tn(ans)}`)} km/h. (Formula version: ${M(`\\frac{2 \\cdot ${v1} \\cdot ${v2}}{${v1} + ${v2}} = ${tn(ans)}`)}.)`,
        `Pattern: "same distance at two speeds." Average speed = ${M('\\frac{2v_1v_2}{v_1 + v_2}')}, or pick a distance and use total distance ÷ total time. Never average the speeds.`,
      ),
    };
  });

  // ---------- Exponents & roots ----------
  def({ id: 'exp-simplify', area: A, topic: 'Exponents & roots', format: 'mc', diff: 'medium' }, () => {
    const [p, q, r] = pick([[2, 4, 8], [3, 9, 27]]); const a = ri(2, 12), b = ri(1, 6), c = ri(1, 5);
    const k = a + 2 * b - 3 * c;
    const X = (e) => M(`${p}^{${e}}`);
    return {
      stem: `${M(`\\frac{${p}^{${a}} \\cdot ${q}^{${b}}}{${r}^{${c}}}`)} is equal to which of the following?`,
      ...mc(X(k), [X(a + b - c), X(a + 2 * b + 3 * c), X(k + 1), X(k - 1), X(2 * a * b - 3 * c), X(a * b - c)]),
      ...EX(
        `The powers have different bases (${p}, ${q} and ${r}), and exponent rules only combine powers of the same base.`,
        `Rewrite every base as a power of one common base. Then multiplying adds exponents and dividing subtracts them. Use ${M('(x^{m})^{n} = x^{mn}')} for the rewrite.`,
        [
          `${q} = ${M(p + '^{2}')} and ${r} = ${M(p + '^{3}')}, so everything can be written with base ${p}.`,
          `${M(`${q}^{${b}} = (${p}^{2})^{${b}} = ${p}^{${2 * b}}`)} — the exponent doubles because each ${q} is two ${p}'s.`,
          `${M(`${r}^{${c}} = (${p}^{3})^{${c}} = ${p}^{${3 * c}}`)} — the exponent triples because each ${r} is three ${p}'s.`,
          `On top we multiply ${M(`${p}^{${a}} \\cdot ${p}^{${2 * b}}`)}, so add exponents; dividing by ${M(`${p}^{${3 * c}}`)} subtracts ${3 * c}.`,
        ],
        `${M(`${p}^{${a} + ${2 * b} - ${3 * c}} = ${p}^{${k}}`)}`,
        `Pattern: "mixed bases that are powers of one number." Convert to a single base, then add/subtract exponents. Never evaluate the powers.`,
      ),
    };
  });

  def({ id: 'root-simplify', area: A, topic: 'Exponents & roots', format: 'mc', diff: 'easy' }, () => {
    const p = pick([2, 3, 5, 6, 7]); let a, b; do { a = ri(2, 6); b = ri(2, 6); } while (a === b);
    const S = (k) => M(k === 1 ? `\\sqrt{${p}}` : `${k}\\sqrt{${p}}`);
    return {
      stem: `${M(`\\sqrt{${a * a * p}} + \\sqrt{${b * b * p}}`)} = ?`,
      ...mc(S(a + b), [M(`\\sqrt{${(a * a + b * b) * p}}`), S(a * b), M(`${a + b}\\sqrt{${2 * p}}`), S(a + b + 1), M(`${a * a + b * b}\\sqrt{${p}}`)]),
      ...EX(
        `Square roots can't be added by adding what's inside: ${M(`\\sqrt{${a * a * p}} + \\sqrt{${b * b * p}}`)} is not ${M(`\\sqrt{${(a * a + b * b) * p}}`)}.`,
        `Simplify each root by pulling out its largest perfect-square factor, using ${M('\\sqrt{k^{2}m} = k\\sqrt{m}')}. If the roots then match, add them like like terms (${M('3\\sqrt{2} + 4\\sqrt{2} = 7\\sqrt{2}')}).`,
        [
          `${a * a * p} = ${a * a} × ${p}, and ${a * a} is the perfect square ${M(a + '^{2}')}. So ${M(`\\sqrt{${a * a * p}} = ${a}\\sqrt{${p}}`)}.`,
          `${b * b * p} = ${b * b} × ${p}, and ${b * b} = ${M(b + '^{2}')}. So ${M(`\\sqrt{${b * b * p}} = ${b}\\sqrt{${p}}`)}.`,
          `Both are now multiples of ${M(`\\sqrt{${p}}`)}, so add the coefficients ${a} and ${b}.`,
        ],
        `${M(`${a}\\sqrt{${p}} + ${b}\\sqrt{${p}} = ${a + b}\\sqrt{${p}}`)}`,
        `Pattern: "adding radicals." Simplify each to the same root, then add coefficients.`,
      ),
    };
  });

  def({ id: 'exp-qc', area: A, topic: 'Exponents & roots', format: 'qc', diff: 'medium' }, () => {
    const t = pick(['pow', 'sum']);
    if (t === 'pow') {
      const [b1, e1, b2, e2] = pick([[2, 30, 3, 20], [2, 40, 5, 20], [3, 30, 5, 20], [4, 15, 8, 10], [9, 10, 27, 7], [2, 60, 4, 29], [16, 5, 2, 21], [8, 20, 2, 60], [25, 10, 5, 19], [27, 5, 3, 16]]);
      const rel = cmp(e1 * Math.log(b1), e2 * Math.log(b2));
      const primeOf = (b) => { for (const p of [2, 3, 5]) { let k = 0, x = b; while (x % p === 0) { x /= p; k++; } if (x === 1) return [p, k]; } return null; };
      const P1 = primeOf(b1), P2 = primeOf(b2);
      if (P1 && P2 && P1[0] === P2[0]) {
        const p = P1[0], E1 = P1[1] * e1, E2 = P2[1] * e2;
        return {
          stem: `Compare the two quantities.`, ...qc(M(`${b1}^{${e1}}`), M(`${b2}^{${e2}}`), rel),
          ...EX(`The numbers are far too large to compute, and they have different bases.`,
            `Two powers can be compared instantly if they share a base (bigger exponent wins, for a base above 1) or share an exponent (bigger base wins). Rewrite so one of those is true.`,
            [`${b1} and ${b2} are both powers of ${p}: ${b1} = ${M(p + '^{' + P1[1] + '}')} and ${b2} = ${M(p + '^{' + P2[1] + '}')}.`,
              `So ${M(`${b1}^{${e1}} = (${p}^{${P1[1]}})^{${e1}} = ${p}^{${E1}}`)} (multiply exponents ${P1[1]} × ${e1}) and ${M(`${b2}^{${e2}} = ${p}^{${E2}}`)} (multiply ${P2[1]} × ${e2}).`,
              `Same base ${p}, so compare the exponents ${E1} and ${E2}.`],
            `${M(`${p}^{${E1}}`)} vs ${M(`${p}^{${E2}}`)}: ${E1 > E2 ? 'A' : E1 < E2 ? 'B' : 'equal'}.`,
            `Pattern: "compare huge powers." Rewrite to a common base or a common exponent, then compare the part that differs.`),
        };
      }
      const g = gcd(e1, e2), B1 = b1 ** (e1 / g), B2 = b2 ** (e2 / g);
      return {
        stem: `Compare the two quantities.`, ...qc(M(`${b1}^{${e1}}`), M(`${b2}^{${e2}}`), rel),
        ...EX(`The numbers are far too large to compute, and their bases (${b1}, ${b2}) aren't powers of the same number.`,
          `Two powers can be compared instantly if they share an exponent: then the bigger base wins. Pull out the greatest common factor of the exponents.`,
          [`The exponents ${e1} and ${e2} have greatest common factor ${g}, so write both as something to the ${g}th power.`,
            `${M(`${b1}^{${e1}} = (${b1}^{${e1 / g}})^{${g}} = ${B1}^{${g}}`)}, since ${e1} = ${e1 / g} × ${g}.`,
            `${M(`${b2}^{${e2}} = (${b2}^{${e2 / g}})^{${g}} = ${B2}^{${g}}`)}, since ${e2} = ${e2 / g} × ${g}.`,
            `Both are now raised to the same power ${g}, so just compare the bases ${B1} and ${B2}.`],
          `${M(`${B1}^{${g}}`)} vs ${M(`${B2}^{${g}}`)}: ${B1 > B2 ? 'A' : 'B'} is greater.`,
          `Pattern: "compare huge powers." Rewrite to a common exponent (using the GCF) or a common base, then compare what's left.`),
      };
    }
    const n = ri(5, 30); const b = pick([2, 3]);
    return {
      stem: `Compare the two quantities.`,
      ...qc(M(`${b}^{${n}} + ${b}^{${n}}${b === 3 ? ` + ${b}^{${n}}` : ''}`), M(`${b}^{${n + 1}}`), 'C'),
      ...EX(`Quantity A is a sum of powers, and there's no exponent rule for adding powers — a common mistake is to write ${M(`${b}^{${2 * n}}`)}.`,
        `When the same power is added to itself several times, rewrite the sum as a multiplication, then use ${M('x \\cdot x^{n} = x^{n+1}')}.`,
        [`Quantity A is ${b} copies of ${M(`${b}^{${n}}`)}, and adding ${b} copies of something is the same as multiplying it by ${b}.`,
          `So A ${M(`= ${b} \\cdot ${b}^{${n}}`)}. Multiplying by one more ${b} raises the exponent by 1.`],
        `${M(`${b} \\cdot ${b}^{${n}} = ${b}^{${n + 1}}`)} — exactly Quantity B.`,
        `Pattern: "a power added to itself." ${b} copies of ${M(`${b}^{n}`)} make ${M(`${b}^{n+1}`)}; factor instead of adding exponents.`),
    };
  });

  // ---------- Absolute value, number line ----------
  def({ id: 'abs-sum', area: A, topic: 'Absolute value', format: 'ne', diff: 'easy' }, () => {
    const a = ri(-9, 12), b = ri(2, 15); const k = pick([1, 2, 3]);
    const x1 = (a + b) / k, x2 = (a - b) / k;
    if (!Number.isInteger(x1) || !Number.isInteger(x2)) return null;
    const ask = pick(['sum', 'product']); const ans = ask === 'sum' ? x1 + x2 : x1 * x2;
    const kx = k === 1 ? 'x' : k + 'x'; const lhs = a === 0 ? kx : `${kx} ${L.sgn(-a)}`;
    return {
      stem: `If ${M(`|${lhs}| = ${b}`)}, what is the ${ask} of all possible values of ${M('x')}?`,
      answer: num(ans),
      ...EX(`The absolute value hides a sign: the expression inside could be ${b} or ${-b}, so there are two solutions, not one.`,
        `${M('|E| = c')} (with ${M('c > 0')}) means ${M('E = c')} or ${M('E = -c')}. Solve both simple equations, then combine the answers as asked.`,
        [`Case 1: ${M(`${lhs} = ${b}`)}. ${a !== 0 ? `Move the ${-a > 0 ? '+' + -a : -a} across: ${M(`${kx} = ${b} ${L.sgn(a)} = ${a + b}`)}` : ''}${k > 1 ? `, then divide by ${k}` : ''}: ${M(`x = ${x1}`)}.`,
          `Case 2: ${M(`${lhs} = -${b}`)}. ${a !== 0 ? `${M(`${kx} = -${b} ${L.sgn(a)} = ${a - b}`)}` : ''}${k > 1 ? `, then divide by ${k}` : ''}: ${M(`x = ${x2}`)}.`,
          `The question wants the ${ask} of these two values.`],
        `${M(`${par(x1)} ${ask === 'sum' ? '+' : '\\times'} ${par(x2)} = ${ans}`)}`,
        ask === 'sum' ? `Pattern: "sum of solutions of |x − a| = b." The two solutions sit symmetrically around the center ${M(fracTex(a, k))}, so their sum is always twice the center — no solving needed.` : `Pattern: "absolute value equation." Split into the + and − cases and solve each.`),
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
      ...EX(`For numbers between ${neg ? '−1 and 0' : '0 and 1'}, our instincts about powers are wrong: ${neg ? 'odd powers stay negative, even powers turn positive, and reciprocals get more negative' : 'squaring makes a number smaller and taking a reciprocal makes it bigger'}.`,
        `When every answer choice is an expression in one variable restricted to an interval, pick one easy value inside the interval and evaluate every choice. The order you get holds for every value in the interval.`,
        [`${neg ? '−½' : '½'} is the easiest number strictly between ${neg ? '−1 and 0' : '0 and 1'}, so use ${M('x = ' + (neg ? '-\\frac{1}{2}' : '\\frac{1}{2}'))}.`,
          `Evaluating each choice: ${five.map((e) => `${M(e[0])} = ${M(fmt(e[1]))}`).join(', ')}.`,
          `The ${ask} of these is ${M(fmt(best[1]))}, from ${M(best[0])}.`],
        `${ask[0].toUpperCase() + ask.slice(1)}: ${M(best[0])}.`,
        `Pattern: "fractions and negatives on a number line." Test ${neg ? '−½' : '½'}; remember that squaring a fraction shrinks it, and odd powers keep the sign.`),
    };
  }, 12);

  // ---------- Fractions / decimals ----------
  def({ id: 'frac-compare-qc', area: A, topic: 'Fractions & decimals', format: 'qc', diff: 'easy' }, () => {
    let a, b, c, d; do { b = ri(3, 17); d = ri(3, 17); a = ri(1, b - 1); c = ri(1, d - 1); } while (b === d || Math.abs(a / b - c / d) > 0.08 || gcd(a, b) !== 1 || gcd(c, d) !== 1);
    const useDec = pick([false, true]);
    const dec = clean(Math.round((c / d) * 1000) / 1000);
    const qb = useDec ? M(String(dec)) : F(c, d); const bv = useDec ? dec : c / d;
    const ad = (a / b).toFixed(4);
    return {
      stem: `Compare the two quantities.`,
      ...qc(F(a, b), qb, cmp(a / b, bv)),
      ...(useDec
        ? EX(`One side is a fraction and the other a decimal, and they are close, so eyeballing won't do.`,
          `Put both in the same form. Dividing the fraction out to one more decimal place than the decimal has is enough to decide.`,
          [`The decimal ${dec} has three decimal places, so divide ${a} by ${b} to four places: ${M(fracTex(a, b) + ' \\approx ' + ad)}.`,
            `Compare ${ad} with ${dec} digit by digit from the left; the first place where they differ decides.`],
          `${M(ad)} vs ${M(dec)}.`,
          `Pattern: "fraction vs decimal." Convert the fraction to a decimal with one extra place.`)
        : EX(`The fractions have different denominators (${b} and ${d}), so their numerators can't be compared directly.`,
          `To compare ${M('\\frac{a}{b}')} and ${M('\\frac{c}{d}')} (positive), compare the cross-products ${M('a \\times d')} and ${M('c \\times b')}. This is the same as putting both over the common denominator ${M('bd')} and comparing numerators.`,
          [`Multiply ${a} (A's numerator) by ${d} (B's denominator): ${M(a + ' \\times ' + d + ' = ' + a * d)}. This is A's numerator over the common denominator ${b * d}.`,
            `Multiply ${c} (B's numerator) by ${b} (A's denominator): ${M(c + ' \\times ' + b + ' = ' + c * b)}. This is B's numerator over ${b * d}.`],
          `${M(`${a * d}`)} vs ${M(`${c * b}`)} → ${a * d > c * b ? 'A' : 'B'} is greater.`,
          `Pattern: "close fractions." Cross-multiply; the larger cross-product belongs to the larger fraction.`)),
    };
  });

  def({ id: 'decimal-place', area: A, topic: 'Fractions & decimals', format: 'ne', diff: 'hard' }, () => {
    const [n, d, rep] = pick([[1, 7, '142857'], [2, 7, '285714'], [3, 7, '428571'], [1, 13, '076923'], [4, 7, '571428'], [5, 7, '714285'], [1, 11, '09'], [7, 11, '63'], [1, 27, '037'], [5, 27, '185'], [2, 13, '153846'], [1, 37, '027']]);
    const k = ri(20, 150); const L_ = rep.length, rem = k % L_, pos = rem === 0 ? L_ : rem; const digit = +rep[pos - 1];
    return {
      stem: `In the decimal representation of ${F(n, d)}, what digit is in the ${ord(k)} place to the right of the decimal point?`,
      answer: num(digit),
      ...EX(`Nobody can divide out ${k} decimal places by hand.`,
        `A fraction whose denominator has prime factors other than 2 and 5 gives a repeating decimal. Find the repeating block, then use the remainder of the position number divided by the block length to land in the block.`,
        [`Dividing ${n} by ${d} gives ${M(`0.\\overline{${rep}}`)}: the block "${rep}" repeats forever, and it has ${L_} digits.`,
          `Every ${L_} places the block starts over, so divide the position ${k} by ${L_}: ${M(`${k} = ${L_} \\times ${Math.floor(k / L_)} + ${rem}`)}.`,
          rem === 0 ? `Remainder 0 means place ${k} is the end of a complete block, i.e. the ${ord(L_)} (last) digit of "${rep}", which is ${digit}.` : `Remainder ${rem} means place ${k} is the ${ord(rem)} digit of the block "${rep}", which is ${digit}.`],
        `${M(`${k} \\div ${L_}`)} leaves ${rem} → position ${pos} of "${rep}" → ${M(digit)}.`,
        `Pattern: "nth digit of a repeating decimal." Find the block length, take the remainder, read the digit; remainder 0 means the last digit of the block.`),
    };
  });

  // ---------- Sequences ----------
  def({ id: 'arith-seq', area: A, topic: 'Sequences', format: 'ne', diff: 'medium' }, () => {
    const a1 = ri(-10, 20), d = ri(-4, 7) || 3; const i = ri(2, 5), j = i + ri(3, 7), k = ri(15, 40);
    const t = (n) => a1 + (n - 1) * d;
    return {
      stem: `In an arithmetic sequence, the ${ord(i)} term is ${t(i)} and the ${ord(j)} term is ${t(j)}. What is the ${ord(k)} term?`,
      answer: num(t(k)),
      ...EX(`We don't know the first term or the common difference, and listing terms up to the ${ord(k)} would take forever.`,
        `In an arithmetic sequence each step adds the same difference ${M('d')}. The gap between two terms is (number of steps) × ${M('d')}, so ${M('d = \\frac{\\text{change in value}}{\\text{number of steps}}')}. Then jump from any known term straight to the one you want.`,
        [`From the ${ord(i)} term to the ${ord(j)} term is ${j} − ${i} = ${j - i} steps, and the value changes from ${t(i)} to ${t(j)}, a change of ${t(j) - t(i)}.`,
          `So each step adds ${M(`d = \\frac{${t(j) - t(i)}}{${j - i}} = ${d}`)}.`,
          `From the ${ord(i)} term to the ${ord(k)} term is ${k} − ${i} = ${k - i} steps, so we add ${d} a total of ${k - i} times, which adds ${M(`${k - i} \\times ${par(d)} = ${d * (k - i)}`)} altogether.`],
        `${M(`${t(i)} + ${k - i} \\times ${par(d)} = ${t(i)} ${d * (k - i) < 0 ? '-' : '+'} ${Math.abs(d * (k - i))} = ${t(k)}`)}`,
        `Pattern: "arithmetic sequence, two terms known." d = change ÷ steps, then jump directly: term = known term + (steps) × d.`),
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
      ...EX(`There are ${n} numbers to add — too many to add one by one.`,
        `For any evenly spaced list, sum = (number of terms) × (average), and the average is simply (first + last) ÷ 2. The number of terms is (last − first) ÷ spacing + 1.`,
        [`The numbers go up by ${step} each time${step === 2 ? ` (every other integer)` : ''}, from ${a} to ${b}.`,
          `Count them: (${b} − ${a}) ÷ ${step} = ${(b - a) / step} steps, and we add 1 because both ends are included ("inclusive"), giving ${n} terms.`,
          `Because the list is evenly spaced, its average is the midpoint of the ends: (${a} + ${b}) ÷ 2 = ${fmt((a + b) / 2)}.`],
        `${M(`${n} \\times ${fmt((a + b) / 2)} = ${tn(s)}`)}`,
        `Pattern: "sum of an evenly spaced list." Count × average of first and last. Remember the +1 when counting inclusive ranges.`),
    };
  });
};
