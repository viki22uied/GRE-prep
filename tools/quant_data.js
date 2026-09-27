const L = require('./lib');
const { ri, pick, shuffle, sample, gcd, M, F, fracTex, tn, fmt, num, frac, mc, mcNum, ma, qc, cmp, clean } = L;

const svg = (w, h, body) => `<svg class="fig" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>`;
const T = (x, y, s, a = '') => `<text x="${x}" y="${y}" font-size="11" ${a}>${s}</text>`;

function barChart(labels, vals, unit) {
  const W = 320, H = 190, max = Math.ceil(Math.max(...vals) / 10) * 10, x0 = 40, y0 = 160, ph = 140, bw = (W - x0 - 10) / labels.length;
  let s = `<line x1="${x0}" y1="${y0}" x2="${W - 5}" y2="${y0}" stroke="currentColor"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - ph}" stroke="currentColor"/>`;
  for (let g = 0; g <= 4; g++) { const v = (max / 4) * g, y = y0 - (ph * v) / max; s += `<line x1="${x0 - 3}" y1="${y}" x2="${W - 5}" y2="${y}" stroke="currentColor" stroke-opacity=".15"/>` + T(4, y + 4, fmt(v)); }
  labels.forEach((l, i) => { const h = (ph * vals[i]) / max, x = x0 + i * bw + bw * 0.2; s += `<rect x="${x}" y="${y0 - h}" width="${bw * 0.6}" height="${h}" class="bar"/>` + T(x + bw * 0.3, y0 + 14, l, 'text-anchor="middle"'); });
  s += T(x0, 12, unit);
  return svg(W, H, s);
}
function lineChart(labels, vals, unit) {
  const W = 320, H = 190, max = Math.ceil(Math.max(...vals) / 20) * 20, min = 0, x0 = 40, y0 = 160, ph = 140, step = (W - x0 - 20) / (labels.length - 1);
  let s = `<line x1="${x0}" y1="${y0}" x2="${W - 5}" y2="${y0}" stroke="currentColor"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - ph}" stroke="currentColor"/>`;
  for (let g = 0; g <= 4; g++) { const v = (max / 4) * g, y = y0 - (ph * v) / max; s += `<line x1="${x0 - 3}" y1="${y}" x2="${W - 5}" y2="${y}" stroke="currentColor" stroke-opacity=".15"/>` + T(4, y + 4, fmt(v)); }
  const pts = vals.map((v, i) => [x0 + 10 + i * step, y0 - (ph * (v - min)) / (max - min)]);
  s += `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" class="line"/>`;
  pts.forEach((p, i) => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="3" class="dot"/>` + T(p[0], y0 + 14, labels[i], 'text-anchor="middle"'); });
  s += T(x0, 12, unit);
  return svg(W, H, s);
}
function boxPlot(mn, q1, md, q3, mx, lo, hi) {
  const W = 320, H = 90, x = (v) => 20 + ((v - lo) / (hi - lo)) * 280, y = 35;
  let s = `<line x1="${x(mn)}" y1="${y}" x2="${x(q1)}" y2="${y}" stroke="currentColor"/><line x1="${x(q3)}" y1="${y}" x2="${x(mx)}" y2="${y}" stroke="currentColor"/>`;
  s += `<rect x="${x(q1)}" y="${y - 14}" width="${x(q3) - x(q1)}" height="28" class="box"/><line x1="${x(md)}" y1="${y - 14}" x2="${x(md)}" y2="${y + 14}" stroke="currentColor" stroke-width="2"/>`;
  s += `<line x1="${x(mn)}" y1="${y - 8}" x2="${x(mn)}" y2="${y + 8}" stroke="currentColor"/><line x1="${x(mx)}" y1="${y - 8}" x2="${x(mx)}" y2="${y + 8}" stroke="currentColor"/>`;
  s += `<line x1="20" y1="70" x2="300" y2="70" stroke="currentColor"/>`;
  const stepV = (hi - lo) / 10;
  for (let v = lo; v <= hi + 1e-9; v += stepV) s += `<line x1="${x(v)}" y1="67" x2="${x(v)}" y2="73" stroke="currentColor"/>` + T(x(v), 86, fmt(v), 'text-anchor="middle"');
  return svg(W, H, s);
}
function pieChart(labels, pcts) {
  const W = 320, H = 170, cx = 85, cy = 85, r = 70; let a0 = -Math.PI / 2, s = '';
  pcts.forEach((p, i) => {
    const a1 = a0 + (p / 100) * 2 * Math.PI; const large = p > 50 ? 1 : 0;
    s += `<path d="M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z" class="slice s${i % 6}"/>`;
    s += `<rect x="180" y="${20 + i * 22}" width="12" height="12" class="slice s${i % 6}"/>` + T(198, 30 + i * 22, `${labels[i]}: ${p}%`);
    a0 = a1;
  });
  return svg(W, H, s);
}
function table(head, rows) {
  return `<table class="data"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
const C = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return Math.round(r); };
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));

module.exports = function (def) {
  const A = 'Data Analysis';

  def({ id: 'mean-missing', area: A, topic: 'Mean, median, mode', format: 'ne', diff: 'easy' }, () => {
    const n = ri(3, 9), m = ri(10, 90), m2 = m + ri(-6, 8); if (m2 === m) return null;
    const x = (n + 1) * m2 - n * m; if (x <= 0) return null;
    return {
      stem: `The average (arithmetic mean) of ${n} numbers is ${m}. When one more number is added, the average of the ${n + 1} numbers becomes ${m2}. What number was added?`,
      answer: num(x),
      fast: [`Work with totals: old sum ${M(`= ${n} \\times ${m} = ${n * m}`)}, new sum ${M(`= ${n + 1} \\times ${m2} = ${(n + 1) * m2}`)}.`, `Added number ${M(`= ${(n + 1) * m2} - ${n * m} = ${x}`)}.`],
      why: `Averages are awkward, sums are easy: convert to totals, subtract.`,
    };
  });

  def({ id: 'weighted-avg', area: A, topic: 'Weighted average', format: 'ne', diff: 'medium' }, () => {
    const t = pick(['combined', 'findN']);
    const n1 = ri(2, 12) * 5, n2 = ri(2, 12) * 5, a1 = ri(60, 80), a2 = a1 + ri(3, 20);
    const avg = (n1 * a1 + n2 * a2) / (n1 + n2);
    if (t === 'combined') {
      if (!Number.isInteger(avg * 10)) return null;
      return {
        stem: `In a class, ${n1} students scored an average of ${a1} on a test and the other ${n2} students scored an average of ${a2}. What was the average score for all ${n1 + n2} students?`,
        answer: num(avg),
        fast: [`Weighted average ${M(`= \\frac{${n1}(${a1}) + ${n2}(${a2})}{${n1 + n2}}`)}.`, `Shortcut: start from ${a1} and add the weighted gap: ${M(`${a1} + ${a2 - a1} \\times \\frac{${n2}}{${n1 + n2}} = ${fmt(avg)}`)}.`],
        why: `Averaging the averages (${M(fmt((a1 + a2) / 2))}) is the trap unless the groups are equal size.`,
      };
    }
    if (!Number.isInteger(avg)) return null;
    return {
      stem: `A group of ${n1} employees has an average salary of ${a1} thousand dollars. When a second group with an average salary of ${a2} thousand dollars joins, the average salary of the combined group is ${avg} thousand dollars. How many employees are in the second group?`,
      answer: num(n2),
      fast: [`Balance the gaps: group 1 is ${M(avg - a1)} below the mean, group 2 is ${M(a2 - avg)} above.`, `${M(`${n1} \\times ${avg - a1} = n \\times ${a2 - avg}`)} → ${M(`n = ${n2}`)}.`],
      why: `The "seesaw" (distance × count balances) is one equation instead of expanding the full weighted-average formula.`,
    };
  });

  def({ id: 'median-freq', area: A, topic: 'Frequency tables', format: 'ne', diff: 'medium' }, () => {
    const vals = []; let v = ri(1, 5); const k = ri(4, 6); for (let i = 0; i < k; i++) { vals.push(v); v += ri(1, 3); }
    const fr = vals.map(() => ri(2, 14)); const N = fr.reduce((a, b) => a + b, 0);
    const at = (pos) => { let c = 0; for (let i = 0; i < k; i++) { c += fr[i]; if (pos <= c) return vals[i]; } };
    const med = N % 2 ? at((N + 1) / 2) : (at(N / 2) + at(N / 2 + 1)) / 2;
    const cum = []; fr.reduce((a, b, i) => (cum[i] = a + b), 0);
    return {
      stem: `The table shows the number of books read last month by each of ${N} students. What is the median number of books read?`,
      figure: table(['Books read', 'Number of students'], vals.map((x, i) => [x, fr[i]])),
      answer: num(med),
      fast: [`${N} values → median is ${N % 2 ? `the ${L.ord((N + 1) / 2)} value` : `the average of the ${L.ord(N / 2)} and ${L.ord(N / 2 + 1)} values`}.`, `Running totals: ${cum.map((c, i) => `${vals[i]} → ${c}`).join(', ')}.`, `The position${N % 2 ? '' : 's'} fall${N % 2 ? 's' : ''} at ${M(fmt(med))}.`],
      why: `Cumulative counts find the median position directly — never write out all ${N} values.`,
    };
  });

  def({ id: 'percentile-freq', area: A, topic: 'Frequency tables', format: 'mc', diff: 'medium' }, () => {
    const labels = ['0–9', '10–19', '20–29', '30–39', '40–49']; const fr = labels.map(() => ri(3, 25)); const N = fr.reduce((a, b) => a + b, 0);
    const p = pick([25, 50, 75, 90]); const pos = Math.ceil((p / 100) * N);
    let c = 0, idx = 0; for (; idx < 5; idx++) { c += fr[idx]; if (pos <= c) break; }
    const cum = []; fr.reduce((a, b, i) => (cum[i] = a + b), 0);
    return {
      stem: `The table shows the distribution of scores for ${N} participants. The ${p}th percentile of the scores lies in which interval?`,
      figure: table(['Score', 'Frequency'], labels.map((l, i) => [l, fr[i]])),
      choices: labels.map((l) => l), answer: idx,
      fast: [`${p}% of ${N} ${M(`= ${fmt((p / 100) * N)}`)}, so look for the ${L.ord(pos)} value.`, `Cumulative: ${cum.join(', ')}.`, `The ${L.ord(pos)} value is in ${labels[idx]}.`],
      why: `Only the running total matters; you never need individual scores.`,
    };
  });

  def({ id: 'sd-compare', area: A, topic: 'Standard deviation', format: 'qc', diff: 'medium' }, () => {
    const t = pick(['spread', 'shift', 'scale']);
    const base = sample([2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14], 5).sort((a, b) => a - b);
    const sd = (xs) => { const m = xs.reduce((a, b) => a + b, 0) / xs.length; return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length); };
    const S = (xs) => M(`\\{${xs.join(', ')}\\}`);
    if (t === 'shift') {
      const k = ri(5, 50); const b2 = base.map((x) => x + k);
      return { stem: `Set ${M('P')}: ${S(base)}<br>Set ${M('Q')}: ${S(b2)}`, ...qc(`The standard deviation of set ${M('P')}`, `The standard deviation of set ${M('Q')}`, 'C'), fast: [`Set ${M('Q')} is set ${M('P')} with ${k} added to every value.`, `Adding a constant shifts the data but doesn't change the spread → equal.`], why: `Recognize the transformation instead of computing two standard deviations.` };
    }
    if (t === 'scale') {
      const k = pick([2, 3]); const b2 = base.map((x) => x * k);
      return { stem: `Set ${M('P')}: ${S(base)}<br>Set ${M('Q')}: ${S(b2)}`, ...qc(`The standard deviation of set ${M('P')}`, `The standard deviation of set ${M('Q')}`, 'B'), fast: [`Set ${M('Q')} is every value of ${M('P')} multiplied by ${k}.`, `Multiplying by ${k} multiplies the standard deviation by ${k} → B.`], why: `Standard deviation scales with multiplication but ignores addition.` };
    }
    const m = ri(10, 30); const d1 = ri(1, 4), d2 = d1 + ri(1, 5);
    const s1 = [m - d1, m, m + d1], s2 = [m - d2, m, m + d2];
    return { stem: `Set ${M('P')}: ${S(s1)}<br>Set ${M('Q')}: ${S(s2)}`, ...qc(`The standard deviation of set ${M('P')}`, `The standard deviation of set ${M('Q')}`, 'B'), fast: [`Both sets are centered at ${m}.`, `${M('Q')}'s values sit farther from the mean (${d2} vs ${d1}) → larger standard deviation.`], why: `Standard deviation measures distance from the mean — compare spread by eye, no formula needed.` };
  });

  def({ id: 'iqr', area: A, topic: 'Quartiles & IQR', format: 'ne', diff: 'medium' }, () => {
    const xs = []; let v = ri(1, 10); for (let i = 0; i < 8; i++) { xs.push(v); v += ri(1, 6); }
    const med = (a) => (a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2);
    const q1 = med(xs.slice(0, 4)), q3 = med(xs.slice(4)); const ask = pick(['iqr', 'range']);
    const list = shuffle(xs);
    return {
      stem: `What is the ${ask === 'iqr' ? 'interquartile range' : 'range'} of the following data? ${M(list.join(',\\ '))}`,
      answer: num(ask === 'iqr' ? q3 - q1 : xs[7] - xs[0]),
      fast: ask === 'iqr'
        ? [`Sort: ${M(xs.join(',\\ '))}.`, `Lower half ${M(xs.slice(0, 4).join(', '))} → ${M(`Q_1 = ${fmt(q1)}`)}; upper half ${M(xs.slice(4).join(', '))} → ${M(`Q_3 = ${fmt(q3)}`)}.`, `IQR ${M(`= ${fmt(q3)} - ${fmt(q1)} = ${fmt(q3 - q1)}`)}.`]
        : [`Range = max − min = ${M(`${xs[7]} - ${xs[0]} = ${xs[7] - xs[0]}`)}.`],
      why: ask === 'iqr' ? `Split the sorted list into halves and take the median of each — no percentile formula needed.` : `Just scan for the max and min — no sorting needed.`,
    };
  });

  def({ id: 'normal-dist', area: A, topic: 'Normal distribution', format: 'mc', diff: 'medium' }, () => {
    const mu = ri(5, 40) * 10, sd = ri(2, 10) * 5; const t = pick(['within1', 'above1', 'above2', 'below1', 'between']);
    const pct = { within1: 68, above1: 16, above2: 2.5, below1: 16, between: 34 + 47.5 };
    const stems = {
      within1: `between ${mu - sd} and ${mu + sd}`, above1: `greater than ${mu + sd}`, above2: `greater than ${mu + 2 * sd}`, below1: `less than ${mu - sd}`, between: `between ${mu - sd} and ${mu + 2 * sd}`,
    };
    const steps = {
      within1: `${mu - sd} and ${mu + sd} are ${M('\\mu \\pm 1\\sigma')} → about 68%.`,
      above1: `${mu + sd} is ${M('\\mu + 1\\sigma')}. Half of the remaining 32% is above → about 16%.`,
      above2: `${mu + 2 * sd} is ${M('\\mu + 2\\sigma')}. Half of the remaining 5% → about 2.5%.`,
      below1: `${mu - sd} is ${M('\\mu - 1\\sigma')} → about 16% below.`,
      between: `From ${M('\\mu - 1\\sigma')} to ${M('\\mu')}: 34%. From ${M('\\mu')} to ${M('\\mu + 2\\sigma')}: 47.5%. Total ≈ 81.5%.`,
    };
    const P = (v) => `${v}%`;
    return {
      stem: `The weights of items produced by a machine are approximately normally distributed with a mean of ${mu} grams and a standard deviation of ${sd} grams. Approximately what percent of the items weigh ${stems[t]} grams?`,
      ...mc(P(pct[t]), [68, 16, 2.5, 34, 95, 81.5, 50, 47.5, 32].filter((v) => v !== pct[t]).map(P)),
      fast: [`Convert to standard deviations from the mean (${M(`\\mu = ${mu}, \\sigma = ${sd}`)}).`, steps[t], `Use the 68–95–99.7 rule.`],
      why: `The empirical rule answers GRE normal-distribution questions without any z-table.`,
    };
  });

  def({ id: 'prob-indep', area: A, topic: 'Probability', format: 'ne', diff: 'medium' }, () => {
    const d1 = pick([2, 3, 4, 5, 6, 8, 10]), d2 = pick([2, 3, 4, 5, 6, 8, 10]); const n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1);
    const t = pick(['both', 'atleast', 'neither']);
    const [bn, bd] = t === 'both' ? [n1 * n2, d1 * d2] : t === 'neither' ? [(d1 - n1) * (d2 - n2), d1 * d2] : [d1 * d2 - (d1 - n1) * (d2 - n2), d1 * d2];
    return {
      stem: `Events ${M('A')} and ${M('B')} are independent, with ${M(`P(A) = ${fracTex(n1, d1)}`)} and ${M(`P(B) = ${fracTex(n2, d2)}`)}. What is the probability that ${t === 'both' ? 'both events occur' : t === 'neither' ? 'neither event occurs' : 'at least one of the events occurs'}?`,
      answer: frac(bn, bd),
      fast: t === 'both' ? [`Independent → multiply: ${M(`${fracTex(n1, d1)} \\times ${fracTex(n2, d2)} = ${fracTex(bn, bd)}`)}.`]
        : t === 'neither' ? [`${M(`P(\\text{not } A) = ${fracTex(d1 - n1, d1)}`)}, ${M(`P(\\text{not } B) = ${fracTex(d2 - n2, d2)}`)}.`, `Multiply: ${M(fracTex(bn, bd))}.`]
          : [`"At least one" = 1 − P(neither).`, `${M(`1 - ${fracTex(d1 - n1, d1)} \\times ${fracTex(d2 - n2, d2)} = ${fracTex(bn, bd)}`)}.`],
      why: t === 'atleast' ? `The complement avoids adding three separate cases (A only, B only, both).` : `Independence means simple multiplication.`,
    };
  });

  def({ id: 'prob-draw', area: A, topic: 'Probability', format: 'ne', diff: 'hard' }, () => {
    const r = ri(2, 7), b = ri(2, 7); const n = r + b; const t = pick(['bothRed', 'same', 'oneEach']);
    let nn, dd; if (t === 'bothRed') { nn = r * (r - 1); dd = n * (n - 1); } else if (t === 'same') { nn = r * (r - 1) + b * (b - 1); dd = n * (n - 1); } else { nn = 2 * r * b; dd = n * (n - 1); }
    return {
      stem: `A bag contains ${r} red marbles and ${b} blue marbles. Two marbles are drawn at random without replacement. What is the probability that ${t === 'bothRed' ? 'both are red' : t === 'same' ? 'both are the same color' : 'one is red and one is blue'}?`,
      answer: frac(nn, dd),
      fast: t === 'bothRed' ? [`${M(`\\frac{${r}}{${n}} \\times \\frac{${r - 1}}{${n - 1}} = ${fracTex(nn, dd)}`)}.`]
        : t === 'same' ? [`Both red: ${M(`\\frac{${r}}{${n}} \\cdot \\frac{${r - 1}}{${n - 1}}`)}; both blue: ${M(`\\frac{${b}}{${n}} \\cdot \\frac{${b - 1}}{${n - 1}}`)}.`, `Add: ${M(fracTex(nn, dd))}.`]
          : [`Red then blue ${M(`\\frac{${r}}{${n}} \\cdot \\frac{${b}}{${n - 1}}`)}, doubled for blue-then-red.`, `${M(`2 \\cdot \\frac{${r * b}}{${n * (n - 1)}} = ${fracTex(nn, dd)}`)}.`],
      why: t === 'oneEach' ? `Don't forget the order ×2 — or use ${M(`\\frac{${r} \\cdot ${b}}{\\binom{${n}}{2}}`)}.` : `Multiply the sequential probabilities, reducing the pool after each draw.`,
    };
  });

  def({ id: 'cond-prob-table', area: A, topic: 'Conditional probability', format: 'ne', diff: 'hard' }, () => {
    const a = ri(5, 40), b = ri(5, 40), c = ri(5, 40), d = ri(5, 40);
    const rows = [['Commuted by bus', a, b, a + b], ['Did not commute by bus', c, d, c + d], ['Total', a + c, b + d, a + b + c + d]];
    const t = pick(['givenBus', 'givenSenior']);
    const [nn, dd] = t === 'givenBus' ? [b, a + b] : [a, a + c];
    return {
      stem: `The table summarizes a survey of students. If a student is chosen at random ${t === 'givenBus' ? 'from those who commuted by bus' : 'from the juniors'}, what is the probability that the student ${t === 'givenBus' ? 'is a senior' : 'commuted by bus'}?`,
      figure: table(['', 'Juniors', 'Seniors', 'Total'], rows),
      answer: frac(nn, dd),
      fast: [`"Given ${t === 'givenBus' ? 'bus' : 'junior'}" shrinks the denominator to that ${t === 'givenBus' ? 'row' : 'column'} total: ${M(dd)}.`, `Favorable cell: ${M(nn)} → ${M(`\\frac{${nn}}{${dd}}` + (gcd(nn, dd) > 1 ? ` = ${fracTex(nn, dd)}` : ''))}.`],
      why: `Conditional probability from a table is cell ÷ row (or column) total; no formula needed.`,
    };
  });

  def({ id: 'combinations', area: A, topic: 'Counting', format: 'ne', diff: 'medium' }, () => {
    const t = pick(['committee', 'twoGroups', 'handshake']);
    if (t === 'committee') { const n = ri(5, 12), k = ri(2, 4); return { stem: `In how many different ways can a committee of ${k} people be chosen from a group of ${n} people?`, answer: num(C(n, k)), fast: [`Order doesn't matter (a committee) → combinations.`, `${M(`\\binom{${n}}{${k}} = \\frac{${Array.from({ length: k }, (_, i) => n - i).join(' \\cdot ')}}{${k}!} = ${C(n, k)}`)}.`], why: `Decide order-vs-no-order first; then it's one formula. Using ${M(`${n}P${k}`)} would overcount by ${M(`${k}! = ${fact(k)}`)}.` }; }
    if (t === 'twoGroups') { const m = ri(4, 8), w = ri(4, 8), a = ri(1, 3), b = ri(1, 3); return { stem: `A team of ${a} ${a === 1 ? 'manager' : 'managers'} and ${b} ${b === 1 ? 'engineer' : 'engineers'} is to be chosen from ${m} managers and ${w} engineers. How many different teams are possible?`, answer: num(C(m, a) * C(w, b)), fast: [`Choose each group separately: ${M(`\\binom{${m}}{${a}} = ${C(m, a)}`)}, ${M(`\\binom{${w}}{${b}} = ${C(w, b)}`)}.`, `Independent choices multiply: ${M(`${C(m, a)} \\times ${C(w, b)} = ${C(m, a) * C(w, b)}`)}.`], why: `"And" → multiply. Choosing ${a + b} from all ${m + w} would ignore the required mix.` }; }
    const n = ri(5, 20); return { stem: `At a meeting, each of ${n} people shakes hands exactly once with each of the others. How many handshakes take place?`, answer: num(C(n, 2)), fast: [`A handshake is an unordered pair: ${M(`\\binom{${n}}{2} = \\frac{${n} \\cdot ${n - 1}}{2} = ${C(n, 2)}`)}.`], why: `${M(`\\frac{n(n-1)}{2}`)} — don't count each handshake twice.` };
  });

  def({ id: 'permutations', area: A, topic: 'Counting', format: 'ne', diff: 'medium' }, () => {
    const t = pick(['line', 'fixed', 'podium', 'letters', 'codes']);
    if (t === 'line') { const n = ri(4, 7); return { stem: `In how many different orders can ${n} people stand in a line?`, answer: num(fact(n)), fast: [`Order matters, all ${n} used → ${M(`${n}! = ${fact(n)}`)}.`], why: `Straight factorial; no case analysis.` }; }
    if (t === 'fixed') { const n = ri(4, 7); return { stem: `${n} people are to stand in a line, and one particular person must stand at the left end. How many arrangements are possible?`, answer: num(fact(n - 1)), fast: [`Place the fixed person first (1 way).`, `Arrange the other ${n - 1}: ${M(`${n - 1}! = ${fact(n - 1)}`)}.`], why: `Handle the restriction first, then count the free positions.` }; }
    if (t === 'podium') { const n = ri(5, 12); return { stem: `In a race with ${n} runners, in how many different ways can the gold, silver, and bronze medals be awarded? (No ties.)`, answer: num(n * (n - 1) * (n - 2)), fast: [`Order matters (gold ≠ silver) → permutation.`, `${M(`${n} \\times ${n - 1} \\times ${n - 2} = ${n * (n - 1) * (n - 2)}`)}.`], why: `Slot method: count the choices for each position and multiply.` }; }
    if (t === 'letters') {
      const [w, cnt, rep] = pick([['LEVEL', 30, 'L and E each appear twice'], ['BANANA', 60, 'A appears 3 times, N twice'], ['LETTER', 180, 'E and T each appear twice'], ['APPLE', 60, 'P appears twice'], ['GAMMA', 30, 'A and M each appear twice'], ['COOKIE', 180, 'O appears twice']]);
      const n = w.length;
      return { stem: `How many distinct arrangements of the letters in the word ${w} are there?`, answer: num(cnt), fast: [`${n} letters, but ${rep}.`, `Divide out repeats: ${M(`\\frac{${n}!}{\\text{(repeats)}!} = ${cnt}`)}.`], why: `Dividing by the factorial of each repeat count removes duplicate arrangements in one step.` };
    }
    const l = ri(2, 3), d = ri(2, 4), L_ = 26; const total = 26 ** l * 10 ** d;
    const distinct = pick([true, false]); const v = distinct ? Array.from({ length: d }, (_, i) => 10 - i).reduce((a, b) => a * b, 1) : 10 ** d;
    return { stem: `A code consists of ${d} digits (0–9)${distinct ? ', with no digit repeated' : ', where digits may repeat'}. How many different codes are possible?`, answer: num(v), fast: [distinct ? `Slots: ${M(Array.from({ length: d }, (_, i) => 10 - i).join(' \\times '))}.` : `Each slot has 10 options: ${M(`10^{${d}}`)}.`, `${M(tn(v))}.`], why: `Slot method: multiply the number of options for each position.` };
  });

  def({ id: 'venn', area: A, topic: 'Venn diagrams', format: 'ne', diff: 'easy' }, () => {
    const N = ri(40, 200), both = ri(3, 20), a = both + ri(5, 40), b = both + ri(5, 40); const neither = N - (a + b - both); if (neither < 0) return null;
    const ask = pick(['neither', 'both']);
    return ask === 'neither' ? {
      stem: `Of ${N} students, ${a} study French, ${b} study Spanish, and ${both} study both. How many study neither language?`,
      answer: num(neither),
      fast: [`At least one ${M(`= ${a} + ${b} - ${both} = ${a + b - both}`)}.`, `Neither ${M(`= ${N} - ${a + b - both} = ${neither}`)}.`],
      why: `Total = A + B − Both + Neither; one line, no diagram needed.`,
    } : {
      stem: `Of ${N} students, ${a} study French, ${b} study Spanish, and ${neither} study neither. How many study both languages?`,
      answer: num(both),
      fast: [`${M(`${N} = ${a} + ${b} - \\text{Both} + ${neither}`)}.`, `Both ${M(`= ${a + b + neither} - ${N} = ${both}`)}.`],
      why: `The two-set formula solves for any one missing piece directly.`,
    };
  });

  def({ id: 'expected-value', area: A, topic: 'Random variables', format: 'ne', diff: 'medium' }, () => {
    const xs = sample([0, 1, 2, 3, 4, 5, 10], 4).sort((a, b) => a - b); let ps; do { ps = [ri(1, 5), ri(1, 5), ri(1, 5)]; } while (ps.reduce((a, b) => a + b) >= 10);
    ps.push(10 - ps.reduce((a, b) => a + b));
    const ev = xs.reduce((a, x, i) => a + (x * ps[i]) / 10, 0);
    return {
      stem: `The table shows the probability distribution of a random variable ${M('X')}. What is the expected value of ${M('X')}?`,
      figure: table([M('x'), M('P(X = x)')], xs.map((x, i) => [x, clean(ps[i] / 10)])),
      answer: num(ev),
      fast: [`${M('E(X) = \\sum x \\cdot P(x)')}.`, `${M(xs.map((x, i) => `${x}(${clean(ps[i] / 10)})`).join(' + ') + ` = ${fmt(ev)}`)}.`],
      why: `Multiply each value by its probability and add — a weighted average, no simulation.`,
    };
  });

  def({ id: 'bar-graph', area: A, topic: 'Graphs & tables', format: 'mc', diff: 'medium' }, () => {
    const labels = ['2019', '2020', '2021', '2022', '2023']; const vals = labels.map(() => ri(4, 20) * 5);
    let i, j; do { i = ri(0, 3); j = ri(i + 1, 4); } while (vals[i] === vals[j]);
    const ch = ((vals[j] - vals[i]) / vals[i]) * 100;
    const ans = Math.round(ch);
    const P = (v) => (v >= 0 ? `${v}% increase` : `${-v}% decrease`);
    const naive = Math.round(((vals[j] - vals[i]) / vals[j]) * 100);
    return {
      stem: `The bar graph shows a company's annual sales, in millions of dollars. Approximately what was the percent change in sales from ${labels[i]} to ${labels[j]}?`,
      figure: barChart(labels, vals, 'Sales ($ millions)'),
      ...mc(P(ans), [P(naive), P(-ans), P(ans + 10), P(ans - 10), P(vals[j] - vals[i]), P(ans + 20)]),
      fast: [`Read: ${labels[i]} = ${vals[i]}, ${labels[j]} = ${vals[j]}.`, `Percent change ${M(`= \\frac{\\text{new} - \\text{old}}{\\text{old}} = \\frac{${vals[j] - vals[i]}}{${vals[i]}} \\approx ${fmt(Math.round(ch * 10) / 10)}\\%`)}.`],
      why: `Always divide by the <i>original</i> (earlier) value; dividing by the new value is the trap.`,
    };
  });

  def({ id: 'line-graph', area: A, topic: 'Graphs & tables', format: 'mc', diff: 'easy' }, () => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']; const vals = labels.map(() => ri(2, 20) * 5);
    const incs = vals.slice(1).map((v, i) => v - vals[i]);
    const best = Math.max(...incs); if (incs.filter((x) => x === best).length > 1 || best <= 0) return null;
    const bi = incs.indexOf(best);
    const choices = labels.slice(1).map((l, i) => `${labels[i]} to ${l}`);
    return {
      stem: `The line graph shows the number of visitors (in hundreds) to a museum each month. Between which two consecutive months was the increase in visitors the greatest?`,
      figure: lineChart(labels, vals, 'Visitors (hundreds)'),
      choices, answer: bi,
      fast: [`Greatest increase = steepest upward segment.`, `Check the steep ones: ${choices[bi]} rises ${best} (from ${vals[bi]} to ${vals[bi + 1]}).`],
      why: `Eyeball slopes first; only compute the 1–2 candidates that look steepest.`,
    };
  });

  def({ id: 'pie-chart', area: A, topic: 'Graphs & tables', format: 'ne', diff: 'easy' }, () => {
    const cats = ['Rent', 'Food', 'Transport', 'Savings', 'Other']; let ps; do { ps = [ri(4, 9) * 5, ri(2, 5) * 5, ri(1, 3) * 5, ri(1, 4) * 5]; } while (ps.reduce((a, b) => a + b) >= 95);
    ps.push(100 - ps.reduce((a, b) => a + b)); const total = ri(2, 9) * 1000; let i = ri(0, 4), j = (i + ri(1, 4)) % 5; if (ps[i] === ps[j]) return null; if (ps[i] < ps[j]) [i, j] = [j, i];
    const t = pick(['amount', 'diff']);
    return t === 'amount' ? {
      stem: `The circle graph shows how a household's monthly budget of ${tn(total)} dollars is divided. How many dollars are budgeted for ${cats[i]}?`,
      figure: pieChart(cats, ps),
      answer: num((ps[i] * total) / 100),
      fast: [`${cats[i]} is ${ps[i]}%.`, `${M(`${fracTex(ps[i], 100)} \\times ${tn(total)} = ${tn((ps[i] * total) / 100)}`)}.`], why: `Percent × total, one step.`,
    } : {
      stem: `The circle graph shows how a household's monthly budget of ${tn(total)} dollars is divided. How many more dollars are budgeted for ${cats[i]} than for ${cats[j]}?`,
      figure: pieChart(cats, ps),
      answer: num(((ps[i] - ps[j]) * total) / 100),
      fast: [`Subtract the percents first: ${M(`${ps[i]}\\% - ${ps[j]}\\% = ${ps[i] - ps[j]}\\%`)}.`, `${M(`${fracTex(ps[i] - ps[j], 100)} \\times ${tn(total)} = ${tn(((ps[i] - ps[j]) * total) / 100)}`)}.`], why: `Working with the percent difference needs one multiplication instead of two.`,
    };
  });

  def({ id: 'boxplot', area: A, topic: 'Boxplots', format: 'ma', diff: 'medium' }, () => {
    const lo = 0, hi = 100; const pts = sample([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 15, 25, 35, 45, 55, 65, 75, 85], 5).sort((a, b) => a - b);
    const [mn, q1, md, q3, mx] = pts;
    const stmts = shuffle([
      { text: `The range is ${mx - mn}.`, ok: true },
      { text: `The interquartile range is ${q3 - q1}.`, ok: true },
      { text: `The median is ${md}.`, ok: true },
      { text: `The range is ${mx - q1}.`, ok: mx - q1 === mx - mn },
      { text: `The interquartile range is ${md - q1 + 10}.`, ok: md - q1 + 10 === q3 - q1 },
      { text: `About 75% of the data are less than ${q3}.`, ok: true },
      { text: `About 50% of the data are greater than ${q1}.`, ok: false },
      { text: `The mean is ${md}.`, ok: false },
    ]).filter((s, i, arr) => arr.findIndex((o) => o.text === s.text) === i).slice(0, 5);
    if (!stmts.some((s) => s.ok) || stmts.every((s) => s.ok)) return null;
    return {
      stem: `The boxplot summarizes a data set. Based on the boxplot, which of the following statements must be true? Indicate <b>all</b> such statements.`,
      figure: boxPlot(mn, q1, md, q3, mx, lo, hi),
      ...ma(stmts),
      fast: [`Read the five numbers: min ${mn}, ${M('Q_1')} ${q1}, median ${md}, ${M('Q_3')} ${q3}, max ${mx}.`, `Range = max − min ${M(`= ${mx - mn}`)}; IQR ${M(`= Q_3 - Q_1 = ${q3 - q1}`)}; about 75% of data lie below ${M('Q_3')} and 75% above ${M('Q_1')}.`, `A boxplot never shows the mean.`],
      why: `Every statement is checked against the five-number summary — read it once, then verify each claim.`,
    };
  });

  def({ id: 'mean-median-qc', area: A, topic: 'Mean, median, mode', format: 'qc', diff: 'easy' }, () => {
    let xs; do { xs = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40], 5).sort((a, b) => a - b); } while (false);
    const mean = xs.reduce((a, b) => a + b, 0) / 5, med = xs[2];
    return {
      stem: `${M(`S = \\{${shuffle(xs).join(', ')}\\}`)}`,
      ...qc(`The mean of the numbers in ${M('S')}`, `The median of the numbers in ${M('S')}`, cmp(mean, med)),
      fast: [`Median (sorted middle) = ${M(med)}.`, `Mean: compare the sum ${M(xs.reduce((a, b) => a + b, 0))} with ${M(`5 \\times ${med} = ${5 * med}`)}.`, `${mean > med ? 'A large value pulls the mean above the median.' : mean < med ? 'Small values pull the mean below the median.' : 'Sum equals 5 × median → equal.'}`],
      why: `Compare sum to 5 × median instead of dividing — and note that outliers drag the mean toward them.`,
    };
  });

  def({ id: 'mode-range-mc', area: A, topic: 'Mean, median, mode', format: 'mc', diff: 'easy' }, () => {
    const base = sample([3, 4, 5, 6, 7, 8, 9, 11, 12, 14], 4); const m = pick(base); const xs = shuffle([...base, m, m]);
    const sorted = xs.slice().sort((a, b) => a - b); const mean = xs.reduce((a, b) => a + b, 0) / 6; const med = (sorted[2] + sorted[3]) / 2; const range = sorted[5] - sorted[0];
    const stats = [['mean', mean], ['median', med], ['mode', m], ['range', range]];
    const vals = stats.map((s) => s[1]); if (new Set(vals).size < 4) return null;
    const ask = pick(['greatest', 'least']); const best = stats.reduce((a, b) => (ask === 'greatest' ? (b[1] > a[1] ? b : a) : b[1] < a[1] ? b : a));
    const choices = ['The mean', 'The median', 'The mode', 'The range', 'It cannot be determined'];
    return {
      stem: `For the data ${M(xs.join(',\\ '))}, which of the following is ${ask}?`,
      choices, answer: ['mean', 'median', 'mode', 'range'].indexOf(best[0]),
      fast: [`Sort: ${M(sorted.join(',\\ '))}.`, `Mean ${M(fracTex(xs.reduce((a, b) => a + b, 0), 6))}, median ${M(fmt(med))}, mode ${M(m)}, range ${M(range)}.`],
      why: `Sort once — median, mode and range all fall out of the sorted list immediately.`,
    };
  });
};
