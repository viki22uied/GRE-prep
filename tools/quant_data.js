const L = require('./lib');
const { ri, pick, shuffle, sample, gcd, M, F, fracTex, tn, fmt, num, frac, mc, mcNum, ma, qc, cmp, clean, EX, ord, par } = L;

const svg = (w, h, body) => `<svg class="fig" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>`;
const T = (x, y, s, a = '') => `<text x="${x}" y="${y}" font-size="11" ${a}>${s}</text>`;

function barChart(labels, vals, unit) {
  const W = 320, H = 190, max = Math.ceil(Math.max(...vals) / 10) * 10, x0 = 40, y0 = 160, ph = 140, bw = (W - x0 - 10) / labels.length;
  let s = `<line x1="${x0}" y1="${y0}" x2="${W - 5}" y2="${y0}" stroke="currentColor"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - ph}" stroke="currentColor"/>`;
  for (let g = 0; g <= 4; g++) { const v = (max / 4) * g, y = y0 - (ph * v) / max; s += `<line x1="${x0 - 3}" y1="${y}" x2="${W - 5}" y2="${y}" stroke="currentColor" stroke-opacity=".15"/>` + T(4, y + 4, fmt(v)); }
  labels.forEach((l, i) => { const h = (ph * vals[i]) / max, x = x0 + i * bw + bw * 0.2; s += `<rect x="${x}" y="${y0 - h}" width="${bw * 0.6}" height="${h}" class="bar"/>` + T(x + bw * 0.3, y0 + 14, l, 'text-anchor="middle"') + T(x + bw * 0.3, y0 - h - 4, vals[i], 'text-anchor="middle"'); });
  s += T(x0, 12, unit);
  return svg(W, H, s);
}
function lineChart(labels, vals, unit) {
  const W = 320, H = 190, max = Math.ceil(Math.max(...vals) / 20) * 20, x0 = 40, y0 = 160, ph = 140, step = (W - x0 - 20) / (labels.length - 1);
  let s = `<line x1="${x0}" y1="${y0}" x2="${W - 5}" y2="${y0}" stroke="currentColor"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y0 - ph}" stroke="currentColor"/>`;
  for (let g = 0; g <= 4; g++) { const v = (max / 4) * g, y = y0 - (ph * v) / max; s += `<line x1="${x0 - 3}" y1="${y}" x2="${W - 5}" y2="${y}" stroke="currentColor" stroke-opacity=".15"/>` + T(4, y + 4, fmt(v)); }
  const pts = vals.map((v, i) => [x0 + 10 + i * step, y0 - (ph * v) / max]);
  s += `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" class="line"/>`;
  pts.forEach((p, i) => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="3" class="dot"/>` + T(p[0], y0 + 14, labels[i], 'text-anchor="middle"') + T(p[0], p[1] - 7, vals[i], 'text-anchor="middle"'); });
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
      ...EX(`We don't know any of the individual numbers, only their averages, and averages can't simply be subtracted.`,
        `Averages are awkward to work with, but totals are easy: total = average × count. Convert both averages to totals; the difference between the totals is the number that was added.`,
        [`Before: ${n} numbers averaging ${m}, so their total is ${n} × ${m} = ${n * m}.`, `After: ${n + 1} numbers averaging ${m2}, so the new total is ${n + 1} × ${m2} = ${(n + 1) * m2}.`, `The only change was the added number, so it accounts for the whole difference in the totals.`],
        `${M(`${(n + 1) * m2} - ${n * m} = ${x}`)}`,
        `Pattern: "average changes when a number is added or removed." Convert to totals (average × count) and subtract.`),
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
        ...EX(`The groups are different sizes, so the simple average of ${a1} and ${a2} (${fmt((a1 + a2) / 2)}) is wrong: the bigger group should pull the result toward its own average.`,
          `Combined average = (total of all scores) ÷ (total number of people), where each group's total is its average × its size. This is a weighted average: each average counts in proportion to its group's size.`,
          [`Group 1 total: ${n1} × ${a1} = ${n1 * a1}.`, `Group 2 total: ${n2} × ${a2} = ${n2 * a2}.`, `All scores together: ${n1 * a1} + ${n2 * a2} = ${n1 * a1 + n2 * a2}, spread over ${n1} + ${n2} = ${n1 + n2} students.`],
          `${M(`\\frac{${n1 * a1 + n2 * a2}}{${n1 + n2}} = ${fmt(avg)}`)}`,
          `Pattern: "weighted average." Totals ÷ total count — never average the averages unless the groups are the same size.`),
      };
    }
    if (!Number.isInteger(avg)) return null;
    return {
      stem: `A group of ${n1} employees has an average salary of ${a1} thousand dollars. When a second group with an average salary of ${a2} thousand dollars joins, the average salary of the combined group is ${avg} thousand dollars. How many employees are in the second group?`,
      answer: num(n2),
      ...EX(`The unknown is a group size hidden inside a weighted average, which looks like it needs a messy equation.`,
        `Think of a weighted average as a seesaw balanced at the combined average: each group's (size) × (distance from the combined average) must be equal on both sides. That gives the unknown size in one step.`,
        [`Group 1's average ${a1} is ${avg} − ${a1} = ${avg - a1} below the combined average.`, `Group 2's average ${a2} is ${a2} − ${avg} = ${a2 - avg} above it.`, `Balance: ${M(`${n1} \\times ${avg - a1} = n \\times ${a2 - avg}`)}. The left side is ${n1} × ${avg - a1} = ${n1 * (avg - a1)}.`],
        `${M(`n = ${n1 * (avg - a1)} \\div ${a2 - avg} = ${n2}`)}`,
        `Pattern: "weighted average, find a group size." Size × distance balances on both sides of the combined average.`),
    };
  });

  def({ id: 'median-freq', area: A, topic: 'Frequency tables', format: 'ne', diff: 'medium' }, () => {
    const vals = []; let v = ri(1, 5); const k = ri(4, 6); for (let i = 0; i < k; i++) { vals.push(v); v += ri(1, 3); }
    const fr = vals.map(() => ri(2, 14)); const N = fr.reduce((a, b) => a + b, 0);
    const at = (pos) => { let c = 0; for (let i = 0; i < k; i++) { c += fr[i]; if (pos <= c) return vals[i]; } };
    const odd = N % 2 === 1; const p1 = odd ? (N + 1) / 2 : N / 2, p2 = p1 + 1;
    const med = odd ? at(p1) : (at(p1) + at(p2)) / 2;
    const cum = []; fr.reduce((a, b, i) => (cum[i] = a + b), 0);
    return {
      stem: `The table shows the number of books read last month by each of ${N} students. What is the median number of books read?`,
      figure: table(['Books read', 'Number of students'], vals.map((x, i) => [x, fr[i]])),
      answer: num(med),
      ...EX(`There are ${N} data values hidden behind the table; writing them all out would take a long time.`,
        `The median is the middle value when all values are in order. First work out which position(s) are in the middle, then walk down the table keeping a running total of students until you pass that position.`,
        [odd ? `With ${N} values (an odd count), the median is the single middle one, in position (${N} + 1) ÷ 2 = ${p1}.` : `With ${N} values (an even count), there are two middle values, in positions ${N} ÷ 2 = ${p1} and ${p1} + 1 = ${p2}, and the median is their average.`,
          `Running totals down the table: ${cum.map((c, i) => `through ${vals[i]} book${vals[i] > 1 ? 's' : ''}, ${c} students`).join('; ')}.`,
          odd ? `Position ${p1} is reached in the "${at(p1)} books" row (that's the first running total that is at least ${p1}).` : `Position ${p1} falls in the "${at(p1)}" row and position ${p2} in the "${at(p2)}" row.`],
        odd ? `Median ${M('= ' + med)}.` : `${M(`\\frac{${at(p1)} + ${at(p2)}}{2} = ${fmt(med)}`)}`,
        `Pattern: "median from a frequency table." Find the middle position, then use running totals — never list every value.`),
    };
  });

  def({ id: 'percentile-freq', area: A, topic: 'Frequency tables', format: 'mc', diff: 'medium' }, () => {
    const labels = ['0–9', '10–19', '20–29', '30–39', '40–49']; const fr = labels.map(() => ri(3, 25)); const N = fr.reduce((a, b) => a + b, 0);
    const p = pick([25, 50, 75, 90]); const exact = clean((p / 100) * N); const pos = Math.ceil(exact);
    let c = 0, idx = 0; for (; idx < 5; idx++) { c += fr[idx]; if (pos <= c) break; }
    const cum = []; fr.reduce((a, b, i) => (cum[i] = a + b), 0);
    return {
      stem: `The table shows the distribution of scores for ${N} participants. The ${p}th percentile of the scores lies in which interval?`,
      figure: table(['Score', 'Frequency'], labels.map((l, i) => [l, fr[i]])),
      choices: labels.map((l) => l), answer: idx,
      ...EX(`We only have counts per interval, not the individual scores.`,
        `The ${M('p')}th percentile is the value about ${M('p')}% of the way through the ordered data. Compute that position (${M('p')}% of the count), then keep a running total down the table until you reach it.`,
        [`${p}% of ${N} is ${fmt(exact)}, so we want roughly the ${ord(pos)} score in order${Number.isInteger(exact) ? '' : ' (rounding up, since positions are whole numbers)'}.`,
          `Running totals: ${cum.map((cc, i) => `${labels[i]}: ${cc}`).join(', ')}.`,
          `The first running total that reaches ${pos} is ${cum[idx]}, in the ${labels[idx]} row.`],
        `Position ${pos} → interval ${labels[idx]}.`,
        `Pattern: "percentile from a grouped table." Percent × count gives the position; running totals find it.`),
    };
  });

  def({ id: 'sd-compare', area: A, topic: 'Standard deviation', format: 'qc', diff: 'medium' }, () => {
    const t = pick(['spread', 'shift', 'scale']);
    const base = sample([2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14], 5).sort((a, b) => a - b);
    const S = (xs) => M(`\\{${xs.join(', ')}\\}`);
    const method = `Standard deviation measures how spread out values are around their mean. Adding the same number to every value shifts the whole set without changing the spread; multiplying every value by ${M('k')} multiplies the spread by ${M('k')}. Recognizing these moves lets you compare without computing anything.`;
    if (t === 'shift') {
      const k = ri(5, 50); const b2 = base.map((x) => x + k);
      return { stem: `Set ${M('P')}: ${S(base)}<br>Set ${M('Q')}: ${S(b2)}`, ...qc(`The standard deviation of set ${M('P')}`, `The standard deviation of set ${M('Q')}`, 'C'),
        ...EX(`Computing two standard deviations by hand takes several minutes.`, method, [`Compare the sets value by value: ${base[0]} → ${b2[0]}, ${base[1]} → ${b2[1]}, and so on. Every value in ${M('Q')} is ${k} more than the matching value in ${M('P')}.`, `Adding ${k} to everything slides the set along the number line; the gaps between values (and from the mean) don't change.`], `Same spread → equal.`, `Pattern: "SD after adding a constant." No change.`) };
    }
    if (t === 'scale') {
      const k = pick([2, 3]); const b2 = base.map((x) => x * k);
      return { stem: `Set ${M('P')}: ${S(base)}<br>Set ${M('Q')}: ${S(b2)}`, ...qc(`The standard deviation of set ${M('P')}`, `The standard deviation of set ${M('Q')}`, 'B'),
        ...EX(`Computing two standard deviations by hand takes several minutes.`, method, [`Compare value by value: ${base[0]} → ${b2[0]}, ${base[1]} → ${b2[1]}. Every value in ${M('Q')} is ${k} times the matching value in ${M('P')}.`, `Multiplying by ${k} stretches every gap by a factor of ${k}, so the standard deviation is ${k} times as large.`], `SD(Q) = ${k} × SD(P) → B is greater.`, `Pattern: "SD after multiplying." Spread scales by the same factor.`) };
    }
    const m = ri(10, 30); const d1 = ri(1, 4), d2 = d1 + ri(1, 5);
    const s1 = [m - d1, m, m + d1], s2 = [m - d2, m, m + d2];
    return { stem: `Set ${M('P')}: ${S(s1)}<br>Set ${M('Q')}: ${S(s2)}`, ...qc(`The standard deviation of set ${M('P')}`, `The standard deviation of set ${M('Q')}`, 'B'),
      ...EX(`Computing two standard deviations by hand takes several minutes.`, method, [`Both sets are symmetric around ${m}, so both have mean ${m}.`, `In ${M('P')} the outer values are ${d1} away from the mean; in ${M('Q')} they are ${d2} away. Values farther from the mean mean more spread.`], `${d2} > ${d1} → B is greater.`, `Pattern: "compare spreads." Same center, compare distances from it.`) };
  });

  def({ id: 'iqr', area: A, topic: 'Quartiles & IQR', format: 'ne', diff: 'medium' }, () => {
    const xs = []; let v = ri(1, 10); for (let i = 0; i < 8; i++) { xs.push(v); v += ri(1, 6); }
    const q1 = (xs[1] + xs[2]) / 2, q3 = (xs[5] + xs[6]) / 2; const ask = pick(['iqr', 'range']);
    const list = shuffle(xs);
    return {
      stem: `What is the ${ask === 'iqr' ? 'interquartile range' : 'range'} of the following data? ${M(list.join(',\\ '))}`,
      answer: num(ask === 'iqr' ? q3 - q1 : xs[7] - xs[0]),
      ...(ask === 'iqr'
        ? EX(`Quartiles depend on order, and the data are scrambled.`, `The interquartile range is ${M('Q_3 - Q_1')}. Sort the data, split it into a lower half and an upper half, and take the median of each half: that's ${M('Q_1')} and ${M('Q_3')}.`,
          [`Sorted: ${M(xs.join(',\\ '))}.`, `With 8 values, the lower half is the first 4 (${M(xs.slice(0, 4).join(', '))}) and the upper half the last 4 (${M(xs.slice(4).join(', '))}).`,
            `Each half has 4 values, so its median is the average of its middle two: ${M(`Q_1 = \\frac{${xs[1]} + ${xs[2]}}{2} = ${fmt(q1)}`)} and ${M(`Q_3 = \\frac{${xs[5]} + ${xs[6]}}{2} = ${fmt(q3)}`)}.`],
          `${M(`${fmt(q3)} - ${fmt(q1)} = ${fmt(q3 - q1)}`)}`, `Pattern: "IQR." Sort, split into halves, median of each half, subtract.`)
        : EX(`The data are scrambled, but range only needs two numbers.`, `Range = largest value − smallest value. Just scan for the extremes; no sorting needed.`,
          [`Scanning the list, the largest value is ${xs[7]} and the smallest is ${xs[0]}.`], `${M(`${xs[7]} - ${xs[0]} = ${xs[7] - xs[0]}`)}`, `Pattern: "range." Max minus min.`)),
    };
  });

  def({ id: 'normal-dist', area: A, topic: 'Normal distribution', format: 'mc', diff: 'medium' }, () => {
    const mu = ri(5, 40) * 10, sd = ri(2, 10) * 5; const t = pick(['within1', 'above1', 'above2', 'below1', 'between']);
    const pct = { within1: 68, above1: 16, above2: 2.5, below1: 16, between: 81.5 };
    const stems = { within1: `between ${mu - sd} and ${mu + sd}`, above1: `greater than ${mu + sd}`, above2: `greater than ${mu + 2 * sd}`, below1: `less than ${mu - sd}`, between: `between ${mu - sd} and ${mu + 2 * sd}` };
    const P = (v) => `${v}%`;
    const locate = {
      within1: [`${mu - sd} is ${mu} − ${sd}, one standard deviation below the mean, and ${mu + sd} is one standard deviation above it.`, `About 68% of a normal distribution lies within one standard deviation of the mean.`],
      above1: [`${mu + sd} is ${mu} + ${sd}, one standard deviation above the mean.`, `68% lies within one standard deviation, so 100 − 68 = 32% lies outside, split evenly between the two tails because the curve is symmetric: 32 ÷ 2 = 16% above.`],
      above2: [`${mu + 2 * sd} is ${mu} + 2 × ${sd}, two standard deviations above the mean.`, `95% lies within two standard deviations, so 5% lies outside, split evenly between the tails: 5 ÷ 2 = 2.5% above.`],
      below1: [`${mu - sd} is ${mu} − ${sd}, one standard deviation below the mean.`, `32% lies outside one standard deviation, half of it in each tail: 32 ÷ 2 = 16% below.`],
      between: [`${mu - sd} is one standard deviation below the mean, and ${mu + 2 * sd} is two standard deviations above it.`, `Split at the mean. From one SD below up to the mean is half of 68%, which is 34%. From the mean up to two SDs above is half of 95%, which is 47.5%.`],
    };
    return {
      stem: `The weights of items produced by a machine are approximately normally distributed with a mean of ${mu} grams and a standard deviation of ${sd} grams. Approximately what percent of the items weigh ${stems[t]} grams?`,
      ...mc(P(pct[t]), [68, 16, 2.5, 34, 95, 81.5, 50, 47.5, 32].filter((v) => v !== pct[t]).map(P)),
      ...EX(`The GRE gives no z-table, so we need a way to get percents from the mean and standard deviation alone.`,
        `Use the empirical rule for normal distributions: about 68% of values lie within 1 standard deviation of the mean, about 95% within 2, and the curve is symmetric, so each tail and each half behaves the same on both sides. Express the given cutoffs as "how many SDs from the mean," then add or split these percents.`,
        [`Mean ${M(`\\mu = ${mu}`)}, standard deviation ${M(`\\sigma = ${sd}`)}.`, ...locate[t]],
        t === 'between' ? `${M('34 + 47.5 = 81.5')}%` : `≈ ${pct[t]}%`,
        `Pattern: "normal distribution percent." Convert cutoffs to SDs from the mean, then use 68–95 and symmetry.`),
    };
  });

  def({ id: 'prob-indep', area: A, topic: 'Probability', format: 'ne', diff: 'medium' }, () => {
    const d1 = pick([2, 3, 4, 5, 6, 8, 10]), d2 = pick([2, 3, 4, 5, 6, 8, 10]); const n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1);
    const t = pick(['both', 'atleast', 'neither']);
    const pa = fracTex(n1, d1), pb = fracTex(n2, d2), na = fracTex(d1 - n1, d1), nb = fracTex(d2 - n2, d2);
    const nn = (d1 - n1) * (d2 - n2), dd = d1 * d2;
    const [bn, bd] = t === 'both' ? [n1 * n2, dd] : t === 'neither' ? [nn, dd] : [dd - nn, dd];
    const method = `For independent events, the probability that several things all happen is the product of their probabilities. "Not A" has probability ${M('1 - P(A)')}. And "at least one" is easiest through its opposite: ${M('1 - P(\\text{neither})')}.`;
    return {
      stem: `Events ${M('A')} and ${M('B')} are independent, with ${M(`P(A) = ${pa}`)} and ${M(`P(B) = ${pb}`)}. What is the probability that ${t === 'both' ? 'both events occur' : t === 'neither' ? 'neither event occurs' : 'at least one of the events occurs'}?`,
      answer: frac(bn, bd),
      ...(t === 'both'
        ? EX(`We need two things to happen together.`, method, [`"Both" means A happens and B happens. They're independent, so multiply ${M(pa)} by ${M(pb)}.`], `${M(`${pa} \\times ${pb} = ${fracTex(n1 * n2, dd)}`)}`, `Pattern: "both independent events." Multiply.`)
        : t === 'neither'
          ? EX(`We need two things to fail together.`, method, [`${M(`P(\\text{not } A) = 1 - ${pa} = ${na}`)} and ${M(`P(\\text{not } B) = 1 - ${pb} = ${nb}`)}.`, `"Neither" means not A and not B; they're independent, so multiply.`], `${M(`${na} \\times ${nb} = ${fracTex(nn, dd)}`)}`, `Pattern: "neither." Multiply the complements.`)
          : EX(`"At least one" includes three cases (only A, only B, both), and adding them is slow.`, method, [`The only way "at least one" fails is if neither happens. ${M(`P(\\text{not } A) = ${na}`)} and ${M(`P(\\text{not } B) = ${nb}`)}.`, `${M(`P(\\text{neither}) = ${na} \\times ${nb} = ${fracTex(nn, dd)}`)}.`], `${M(`1 - ${fracTex(nn, dd)} = ${fracTex(dd - nn, dd)}`)}`, `Pattern: "at least one." One minus the probability of none.`)),
    };
  });

  def({ id: 'prob-draw', area: A, topic: 'Probability', format: 'ne', diff: 'hard' }, () => {
    const r = ri(2, 7), b = ri(2, 7); const n = r + b; const t = pick(['bothRed', 'same', 'oneEach']);
    let nn, dd; if (t === 'bothRed') { nn = r * (r - 1); dd = n * (n - 1); } else if (t === 'same') { nn = r * (r - 1) + b * (b - 1); dd = n * (n - 1); } else { nn = 2 * r * b; dd = n * (n - 1); }
    const method = `Without replacement, the second draw depends on the first: after one marble is taken, one fewer of that color and one fewer in total remain. Multiply the probability of each draw in sequence; if several different sequences give the outcome, add them.`;
    const first = `There are ${r} + ${b} = ${n} marbles to start.`;
    return {
      stem: `A bag contains ${r} red marbles and ${b} blue marbles. Two marbles are drawn at random without replacement. What is the probability that ${t === 'bothRed' ? 'both are red' : t === 'same' ? 'both are the same color' : 'one is red and one is blue'}?`,
      answer: frac(nn, dd),
      ...(t === 'bothRed'
        ? EX(`The draws aren't independent: the first draw changes what's left.`, method, [first, `First red: ${r} of ${n}, so ${M(`\\frac{${r}}{${n}}`)}. Then ${r - 1} red remain out of ${n - 1} marbles: ${M(`\\frac{${r - 1}}{${n - 1}}`)}.`], `${M(`\\frac{${r}}{${n}} \\times \\frac{${r - 1}}{${n - 1}} = \\frac{${r * (r - 1)}}{${n * (n - 1)}} = ${fracTex(nn, dd)}`)}`, `Pattern: "draws without replacement." Shrink the counts after each draw and multiply.`)
        : t === 'same'
          ? EX(`"Same color" can happen two different ways, and the draws aren't independent.`, method, [first, `Both red: ${M(`\\frac{${r}}{${n}} \\times \\frac{${r - 1}}{${n - 1}} = \\frac{${r * (r - 1)}}{${n * (n - 1)}}`)} (one fewer red and one fewer marble after the first draw).`, `Both blue: ${M(`\\frac{${b}}{${n}} \\times \\frac{${b - 1}}{${n - 1}} = \\frac{${b * (b - 1)}}{${n * (n - 1)}}`)}.`, `These can't both happen, so add them.`], `${M(`\\frac{${r * (r - 1)} + ${b * (b - 1)}}{${n * (n - 1)}} = ${fracTex(nn, dd)}`)}`, `Pattern: "same color." Add the all-red and all-blue sequences.`)
          : EX(`"One of each" can happen in two orders, and forgetting one order is the classic mistake.`, method, [first, `Red then blue: ${M(`\\frac{${r}}{${n}} \\times \\frac{${b}}{${n - 1}} = \\frac{${r * b}}{${n * (n - 1)}}`)} (after a red is taken, all ${b} blue remain among ${n - 1}).`, `Blue then red gives the same product, ${M(`\\frac{${r * b}}{${n * (n - 1)}}`)}, so double it.`], `${M(`2 \\times \\frac{${r * b}}{${n * (n - 1)}} = \\frac{${2 * r * b}}{${n * (n - 1)}} = ${fracTex(nn, dd)}`)}`, `Pattern: "one of each." Multiply along one order, then double for the other order.`)),
    };
  });

  def({ id: 'cond-prob-table', area: A, topic: 'Conditional probability', format: 'ne', diff: 'hard' }, () => {
    const a = ri(5, 40), b = ri(5, 40), c = ri(5, 40), d = ri(5, 40);
    const rows = [['Commuted by bus', a, b, a + b], ['Did not commute by bus', c, d, c + d], ['Total', a + c, b + d, a + b + c + d]];
    const t = pick(['givenBus', 'givenJunior']);
    const [nn, dd] = t === 'givenBus' ? [b, a + b] : [a, a + c];
    return {
      stem: `The table summarizes a survey of students. If a student is chosen at random ${t === 'givenBus' ? 'from those who commuted by bus' : 'from the juniors'}, what is the probability that the student ${t === 'givenBus' ? 'is a senior' : 'commuted by bus'}?`,
      figure: table(['', 'Juniors', 'Seniors', 'Total'], rows),
      answer: frac(nn, dd),
      ...EX(`It's tempting to divide by the grand total of ${a + b + c + d}, but the question restricts which students we're choosing from.`,
        `"Chosen from those who…" is a conditional probability: the condition shrinks the group we're picking from. So the denominator is the total of that row or column only, and the numerator is the cell inside it that also meets the second requirement.`,
        [t === 'givenBus' ? `We choose only from students who commuted by bus: that row totals ${a + b}.` : `We choose only from juniors: that column totals ${a + c}.`,
          t === 'givenBus' ? `Of those, the seniors are in the "Seniors" cell of the bus row: ${b}.` : `Of those, the bus riders are in the "Commuted by bus" cell of the juniors column: ${a}.`],
        `${M(`\\frac{${nn}}{${dd}}${gcd(nn, dd) > 1 ? ' = ' + fracTex(nn, dd) : ''}`)}`,
        `Pattern: "conditional probability from a table." Cell ÷ the row (or column) total named in the condition.`),
    };
  });

  def({ id: 'combinations', area: A, topic: 'Counting', format: 'ne', diff: 'medium' }, () => {
    const t = pick(['committee', 'twoGroups', 'handshake']);
    const orderRule = `First decide whether order matters. If swapping two chosen items gives the same result (a committee, a team, a handshake), order does not matter and you use combinations, ${M('\\binom{n}{k} = \\frac{n!}{k!(n-k)!}')}. If order matters (rankings, arrangements), use permutations.`;
    if (t === 'committee') {
      const n = ri(5, 12), k = ri(2, 4); const top = Array.from({ length: k }, (_, i) => n - i); const prod = top.reduce((a, b) => a * b, 1);
      return { stem: `In how many different ways can a committee of ${k} people be chosen from a group of ${n} people?`, answer: num(C(n, k)),
        ...EX(`Counting ordered picks overcounts: the same committee could be picked in several orders.`, orderRule,
          [`A committee of Ann, Ben and Cal is the same committee as Cal, Ann and Ben, so order doesn't matter: combinations.`, `Count ordered picks first: ${top.join(' × ')} = ${prod} (${n} choices for the first seat, one fewer for each next seat).`, `Each committee was counted once for every ordering of its ${k} members, which is ${k}! = ${fact(k)} times, so divide by ${fact(k)}.`],
          `${M(`\\binom{${n}}{${k}} = \\frac{${prod}}{${fact(k)}} = ${C(n, k)}`)}`, `Pattern: "choose a group." Order doesn't matter → combinations (ordered count ÷ k!).`) };
    }
    if (t === 'twoGroups') {
      const m = ri(4, 8), w = ri(4, 8), a = ri(1, 3), b = ri(1, 3);
      return { stem: `A team of ${a} ${a === 1 ? 'manager' : 'managers'} and ${b} ${b === 1 ? 'engineer' : 'engineers'} is to be chosen from ${m} managers and ${w} engineers. How many different teams are possible?`, answer: num(C(m, a) * C(w, b)),
        ...EX(`Choosing ${a + b} people from all ${m + w} would ignore the requirement for a specific mix.`, orderRule + ` When a choice is made in independent stages ("this AND that"), multiply the number of ways for each stage.`,
          [`Managers: choose ${a} of ${m}, order doesn't matter: ${M(`\\binom{${m}}{${a}} = ${C(m, a)}`)}.`, `Engineers: choose ${b} of ${w}: ${M(`\\binom{${w}}{${b}} = ${C(w, b)}`)}.`, `Any manager group can pair with any engineer group, so multiply.`],
          `${M(`${C(m, a)} \\times ${C(w, b)} = ${C(m, a) * C(w, b)}`)}`, `Pattern: "choose from two groups." Combinations for each group, then multiply ("and" = ×).`) };
    }
    const n = ri(5, 20);
    return { stem: `At a meeting, each of ${n} people shakes hands exactly once with each of the others. How many handshakes take place?`, answer: num(C(n, 2)),
      ...EX(`Counting "each person shakes ${n - 1} hands" gives ${n} × ${n - 1} = ${n * (n - 1)}, but that counts every handshake twice.`, orderRule,
        [`A handshake is a pair of people, and A-with-B is the same handshake as B-with-A, so order doesn't matter: ${M(`\\binom{${n}}{2}`)}.`, `Ordered pairs: ${n} × ${n - 1} = ${n * (n - 1)}; each handshake appears twice (once in each order), so divide by 2.`],
        `${M(`\\frac{${n * (n - 1)}}{2} = ${C(n, 2)}`)}`, `Pattern: "handshakes / pairs." ${M('\\frac{n(n-1)}{2}')}.`) };
  });

  def({ id: 'permutations', area: A, topic: 'Counting', format: 'ne', diff: 'medium' }, () => {
    const t = pick(['line', 'fixed', 'podium', 'letters', 'codes']);
    const slot = `Use the slot method: draw one slot per position, write how many choices there are for each slot (it usually drops by 1 each time, because a person or item can't be used twice), and multiply. This is how you count when order matters.`;
    if (t === 'line') { const n = ri(4, 7); const ch = Array.from({ length: n }, (_, i) => n - i); return { stem: `In how many different orders can ${n} people stand in a line?`, answer: num(fact(n)),
      ...EX(`Listing every order is hopeless even for a few people.`, slot, [`The first spot can be any of the ${n} people, the second any of the remaining ${n - 1}, and so on down to 1, giving the choices ${ch.join(', ')}.`], `${M(`${ch.join(' \\times ')} = ${fact(n)}`)}`, `Pattern: "arrange everyone." ${M('n!')}.`) }; }
    if (t === 'fixed') { const n = ri(4, 7); const ch = Array.from({ length: n - 1 }, (_, i) => n - 1 - i); return { stem: `${n} people are to stand in a line, and one particular person must stand at the left end. How many arrangements are possible?`, answer: num(fact(n - 1)),
      ...EX(`The restriction means not all ${n}! orders are allowed.`, slot + ` Handle restricted positions first.`, [`The left-end slot is forced: exactly 1 choice.`, `The other ${n - 1} people fill the remaining ${n - 1} slots freely: ${ch.join(' × ')}.`], `${M(`1 \\times ${ch.join(' \\times ')} = ${fact(n - 1)}`)}`, `Pattern: "arrangement with a fixed spot." Fill the restricted slot first, then arrange the rest.`) }; }
    if (t === 'podium') { const n = ri(5, 12); return { stem: `In a race with ${n} runners, in how many different ways can the gold, silver, and bronze medals be awarded? (No ties.)`, answer: num(n * (n - 1) * (n - 2)),
      ...EX(`Gold-silver-bronze is not just a group of three: who gets which medal matters.`, slot, [`Order matters (gold ≠ silver), so this is a permutation, not a combination.`, `Gold: ${n} possible runners. Silver: ${n - 1} (the gold winner is out). Bronze: ${n - 2}.`], `${M(`${n} \\times ${n - 1} \\times ${n - 2} = ${n * (n - 1) * (n - 2)}`)}`, `Pattern: "ranked positions." Slot method, decreasing by 1.`) }; }
    if (t === 'letters') {
      const [w, cnt, rep, div] = pick([['LEVEL', 30, 'L appears twice and E appears twice', '2! \\times 2!'], ['BANANA', 60, 'A appears 3 times and N twice', '3! \\times 2!'], ['LETTER', 180, 'E appears twice and T twice', '2! \\times 2!'], ['APPLE', 60, 'P appears twice', '2!'], ['GAMMA', 30, 'A appears twice and M twice', '2! \\times 2!'], ['COOKIE', 180, 'O appears twice', '2!']]);
      const n = w.length; const dv = fact(n) / cnt;
      return { stem: `How many distinct arrangements of the letters in the word ${w} are there?`, answer: num(cnt),
        ...EX(`${n}! = ${fact(n)} would count arrangements that look identical, because some letters repeat.`, `Arrange all letters as if they were different (${M('n!')}), then divide by the factorial of each repeat count, because swapping identical letters doesn't create a new arrangement.`,
          [`${w} has ${n} letters, so ${n}! = ${fact(n)} if all were different.`, `But ${rep}. Swapping identical copies among themselves gives the same word, so divide by ${M(div)} = ${dv}.`],
          `${M(`\\frac{${fact(n)}}{${dv}} = ${cnt}`)}`, `Pattern: "arrangements with repeated letters." ${M('\\frac{n!}{a! \\, b! \\cdots}')}.`) };
    }
    const d = ri(2, 4); const distinct = pick([true, false]); const ch = Array.from({ length: d }, (_, i) => 10 - i); const v = distinct ? ch.reduce((a, b) => a * b, 1) : 10 ** d;
    return { stem: `A code consists of ${d} digits (0–9)${distinct ? ', with no digit repeated' : ', where digits may repeat'}. How many different codes are possible?`, answer: num(v),
      ...EX(`We must decide whether each slot has the same number of choices.`, slot, distinct ? [`There are 10 digits. No repeats means each slot has one fewer choice than the one before: ${ch.join(', ')}.`] : [`Repeats are allowed, so every one of the ${d} slots has all 10 digits available.`],
        distinct ? `${M(`${ch.join(' \\times ')} = ${tn(v)}`)}` : `${M(`10^{${d}} = ${tn(v)}`)}`, `Pattern: "codes." Slot method; repeats allowed → same count every slot, no repeats → decreasing.`) };
  });

  def({ id: 'venn', area: A, topic: 'Venn diagrams', format: 'ne', diff: 'easy' }, () => {
    const N = ri(40, 200), both = ri(3, 20), a = both + ri(5, 40), b = both + ri(5, 40); const neither = N - (a + b - both); if (neither < 0) return null;
    const ask = pick(['neither', 'both']);
    const method = `For two overlapping groups: Total = (group A) + (group B) − (both) + (neither). Adding A and B counts the overlap twice, so subtract it once; people in neither group are added separately.`;
    return ask === 'neither' ? {
      stem: `Of ${N} students, ${a} study French, ${b} study Spanish, and ${both} study both. How many study neither language?`,
      answer: num(neither),
      ...EX(`Adding ${a} and ${b} double-counts the ${both} students who take both languages.`, method,
        [`Students taking at least one language: ${a} + ${b} − ${both} = ${a + b - both} (the ${both} were counted twice, so subtract them once).`, `Everyone else studies neither.`], `${M(`${N} - ${a + b - both} = ${neither}`)}`, `Pattern: "two overlapping groups." Total = A + B − Both + Neither.`),
    } : {
      stem: `Of ${N} students, ${a} study French, ${b} study Spanish, and ${neither} study neither. How many study both languages?`,
      answer: num(both),
      ...EX(`The overlap isn't given, but it's the only unknown in the two-group formula.`, method,
        [`Plug in: ${M(`${N} = ${a} + ${b} - \\text{Both} + ${neither}`)}.`, `The known numbers on the right add to ${a} + ${b} + ${neither} = ${a + b + neither}, so Both is whatever makes the equation balance.`], `${M(`\\text{Both} = ${a + b + neither} - ${N} = ${both}`)}`, `Pattern: "two overlapping groups." Solve the formula for the missing piece.`),
    };
  });

  def({ id: 'expected-value', area: A, topic: 'Random variables', format: 'ne', diff: 'medium' }, () => {
    const xs = sample([0, 1, 2, 3, 4, 5, 10], 4).sort((a, b) => a - b); let ps; do { ps = [ri(1, 5), ri(1, 5), ri(1, 5)]; } while (ps.reduce((a, b) => a + b) >= 10);
    ps.push(10 - ps.reduce((a, b) => a + b));
    const pr = ps.map((p) => clean(p / 10)); const terms = xs.map((x, i) => clean(x * pr[i]));
    const ev = clean(terms.reduce((a, b) => a + b, 0));
    return {
      stem: `The table shows the probability distribution of a random variable ${M('X')}. What is the expected value of ${M('X')}?`,
      figure: table([M('x'), M('P(X = x)')], xs.map((x, i) => [x, pr[i]])),
      answer: num(ev),
      ...EX(`The values aren't equally likely, so a plain average of ${xs.join(', ')} would be wrong.`,
        `The expected value is a weighted average: multiply each value by its probability and add. Values that happen more often count more.`,
        xs.map((x, i) => `${x} happens with probability ${pr[i]}, contributing ${x} × ${pr[i]} = ${terms[i]}.`),
        `${M(`${terms.join(' + ')} = ${fmt(ev)}`)}`,
        `Pattern: "expected value." Sum of value × probability.`),
    };
  });

  def({ id: 'bar-graph', area: A, topic: 'Graphs & tables', format: 'mc', diff: 'medium' }, () => {
    const labels = ['2019', '2020', '2021', '2022', '2023']; const vals = labels.map(() => ri(4, 20) * 5);
    let i, j; do { i = ri(0, 3); j = ri(i + 1, 4); } while (vals[i] === vals[j]);
    const ch = ((vals[j] - vals[i]) / vals[i]) * 100; const ans = Math.round(ch);
    const P = (v) => (v >= 0 ? `${v}% increase` : `${-v}% decrease`);
    const naive = Math.round(((vals[j] - vals[i]) / vals[j]) * 100);
    return {
      stem: `The bar graph shows a company's annual sales, in millions of dollars. Approximately what was the percent change in sales from ${labels[i]} to ${labels[j]}?`,
      figure: barChart(labels, vals, 'Sales ($ millions)'),
      ...mc(P(ans), [P(naive), P(-ans), P(ans + 10), P(ans - 10), P(vals[j] - vals[i]), P(ans + 20)]),
      ...EX(`It's easy to divide by the wrong year's value or to report the raw change instead of a percent.`,
        `Percent change = (new − old) ÷ old × 100. "Old" is always the starting value — the earlier year — because the change is measured relative to where you started.`,
        [`Read the bars: ${labels[i]} is ${vals[i]} and ${labels[j]} is ${vals[j]}.`, `The change is ${vals[j]} − ${vals[i]} = ${vals[j] - vals[i]}.`, `Divide by the starting value, ${vals[i]} (the ${labels[i]} figure).`],
        `${M(`\\frac{${vals[j] - vals[i]}}{${vals[i]}} \\times 100 \\approx ${fmt(Math.round(ch * 10) / 10)}\\%`)}`,
        `Pattern: "percent change from a graph." (new − old) ÷ old. Dividing by the new value (${P(naive)}) is the trap.`),
    };
  });

  def({ id: 'line-graph', area: A, topic: 'Graphs & tables', format: 'mc', diff: 'easy' }, () => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']; const vals = labels.map(() => ri(2, 20) * 5);
    const incs = vals.slice(1).map((v, i) => v - vals[i]);
    const best = Math.max(...incs); if (incs.filter((x) => x === best).length > 1 || best <= 0) return null;
    const bi = incs.indexOf(best);
    const choices = labels.slice(1).map((l, i) => `${labels[i]} to ${l}`);
    const ups = incs.map((d, i) => [d, i]).filter(([d]) => d > 0);
    return {
      stem: `The line graph shows the number of visitors (in hundreds) to a museum each month. Between which two consecutive months was the increase in visitors the greatest?`,
      figure: lineChart(labels, vals, 'Visitors (hundreds)'),
      choices, answer: bi,
      ...EX(`Computing every month-to-month change is tedious, and decreases are distractions.`,
        `On a line graph, the size of an increase shows up as the steepness of an upward segment. Ignore downward segments, compare the steep upward ones, and compute only those.`,
        [`Upward segments: ${ups.map(([d, k]) => `${labels[k]}→${labels[k + 1]} (${vals[k]} to ${vals[k + 1]}, up ${d})`).join('; ')}.`, `The largest of these increases is ${best}.`],
        `${M(`${vals[bi + 1]} - ${vals[bi]} = ${best}`)} (${choices[bi]}).`,
        `Pattern: "greatest change on a line graph." Steepest segment in the right direction.`),
    };
  });

  def({ id: 'pie-chart', area: A, topic: 'Graphs & tables', format: 'ne', diff: 'easy' }, () => {
    const cats = ['Rent', 'Food', 'Transport', 'Savings', 'Other']; let ps; do { ps = [ri(4, 9) * 5, ri(2, 5) * 5, ri(1, 3) * 5, ri(1, 4) * 5]; } while (ps.reduce((a, b) => a + b) >= 95);
    ps.push(100 - ps.reduce((a, b) => a + b)); const total = ri(2, 9) * 1000; let i = ri(0, 4), j = (i + ri(1, 4)) % 5;
    if (ps[i] === ps[j]) return null; if (ps[i] < ps[j]) [i, j] = [j, i];
    const t = pick(['amount', 'diff']);
    return t === 'amount' ? {
      stem: `The circle graph shows how a household's monthly budget of ${tn(total)} dollars is divided. How many dollars are budgeted for ${cats[i]}?`,
      figure: pieChart(cats, ps),
      answer: num((ps[i] * total) / 100),
      ...EX(`The graph shows percents, but the question asks for dollars.`, `A slice's dollar amount = its percent × the total.`, [`${cats[i]} is ${ps[i]}% of the budget; "percent" means per 100, so that's ${ps[i]} dollars out of every 100.`], `${M(`\\frac{${ps[i]}}{100} \\times ${tn(total)} = ${tn((ps[i] * total) / 100)}`)}`, `Pattern: "circle graph amount." Percent × total.`),
    } : {
      stem: `The circle graph shows how a household's monthly budget of ${tn(total)} dollars is divided. How many more dollars are budgeted for ${cats[i]} than for ${cats[j]}?`,
      figure: pieChart(cats, ps),
      answer: num(((ps[i] - ps[j]) * total) / 100),
      ...EX(`Converting both slices to dollars and then subtracting takes two multiplications.`, `Both slices are percents of the same total, so subtract the percents first; then one multiplication converts the difference to dollars.`, [`${cats[i]} is ${ps[i]}% and ${cats[j]} is ${ps[j]}%, a difference of ${ps[i]} − ${ps[j]} = ${ps[i] - ps[j]} percentage points, i.e. ${ps[i] - ps[j]} out of every 100 dollars.`], `${M(`\\frac{${ps[i] - ps[j]}}{100} \\times ${tn(total)} = ${tn(((ps[i] - ps[j]) * total) / 100)}`)}`, `Pattern: "difference between slices." Subtract percents, then multiply once.`),
    };
  });

  def({ id: 'boxplot', area: A, topic: 'Boxplots', format: 'ma', diff: 'medium' }, () => {
    const pts = sample([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 15, 25, 35, 45, 55, 65, 75, 85], 5).sort((a, b) => a - b);
    const [mn, q1, md, q3, mx] = pts;
    const stmts = shuffle([
      { text: `The range is ${mx - mn}.`, ok: true }, { text: `The interquartile range is ${q3 - q1}.`, ok: true }, { text: `The median is ${md}.`, ok: true },
      { text: `The range is ${mx - q1}.`, ok: false }, { text: `The interquartile range is ${md - q1 + 10}.`, ok: md - q1 + 10 === q3 - q1 },
      { text: `About 75% of the data are less than ${q3}.`, ok: true }, { text: `About 50% of the data are greater than ${q1}.`, ok: false }, { text: `The mean is ${md}.`, ok: false },
    ]).filter((s, k, arr) => arr.findIndex((o) => o.text === s.text) === k).slice(0, 5);
    if (!stmts.some((s) => s.ok) || stmts.every((s) => s.ok)) return null;
    return {
      stem: `The boxplot summarizes a data set. Based on the boxplot, which of the following statements must be true? Indicate <b>all</b> such statements.`,
      figure: boxPlot(mn, q1, md, q3, mx, 0, 100),
      ...ma(stmts),
      ...EX(`A boxplot hides the individual values, so we must know exactly what it does and doesn't show.`,
        `A boxplot shows five numbers: minimum and maximum (whisker ends), ${M('Q_1')} and ${M('Q_3')} (box edges) and the median (line in the box). Each quarter of the data lies between consecutive marks. It never shows the mean.`,
        [`Reading the plot: min ${mn}, ${M('Q_1')} ${q1}, median ${md}, ${M('Q_3')} ${q3}, max ${mx}.`, `Range = max − min = ${mx} − ${mn} = ${mx - mn}. IQR = ${M('Q_3 - Q_1')} = ${q3} − ${q1} = ${q3 - q1}.`, `About 75% of the data lie below ${M('Q_3')}, and about 75% (not 50%) lie above ${M('Q_1')}.`, `Check each statement against these facts.`],
        `Keep only the statements that match the five-number summary.`,
        `Pattern: "boxplot must-be-true." Read the five numbers once; range and IQR are subtractions; the mean is never determined.`),
    };
  });

  def({ id: 'mean-median-qc', area: A, topic: 'Mean, median, mode', format: 'qc', diff: 'easy' }, () => {
    const xs = sample([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40], 5).sort((a, b) => a - b);
    const sum = xs.reduce((a, b) => a + b, 0); const mean = sum / 5, med = xs[2];
    return {
      stem: `${M(`S = \\{${shuffle(xs).join(', ')}\\}`)}`,
      ...qc(`The mean of the numbers in ${M('S')}`, `The median of the numbers in ${M('S')}`, cmp(mean, med)),
      ...EX(`Dividing the sum by 5 is fine, but there's a quicker comparison that avoids decimals.`,
        `Mean > median exactly when sum > (count × median). So compare the sum with 5 × median instead of dividing.`,
        [`Sort: ${M(xs.join(', '))}. The median is the middle (3rd) value, ${med}.`, `The sum is ${xs.join(' + ')} = ${sum}.`, `If the mean equaled the median, the sum would be 5 × ${med} = ${5 * med}.`],
        `${M(`${sum}`)} vs ${M(`${5 * med}`)} → ${mean > med ? 'mean > median (A)' : mean < med ? 'mean < median (B)' : 'equal (C)'}.`,
        `Pattern: "mean vs median." Compare the sum with count × median; big outliers pull the mean toward them.`),
    };
  });

  def({ id: 'mode-range-mc', area: A, topic: 'Mean, median, mode', format: 'mc', diff: 'easy' }, () => {
    const base = sample([3, 4, 5, 6, 7, 8, 9, 11, 12, 14], 4); const m = pick(base); const xs = shuffle([...base, m, m]);
    const sorted = xs.slice().sort((a, b) => a - b); const sum = xs.reduce((a, b) => a + b, 0); const mean = sum / 6; const med = (sorted[2] + sorted[3]) / 2; const range = sorted[5] - sorted[0];
    const stats = [['mean', mean], ['median', med], ['mode', m], ['range', range]];
    if (new Set(stats.map((s) => s[1])).size < 4) return null;
    const ask = pick(['greatest', 'least']); const best = stats.reduce((a, b) => (ask === 'greatest' ? (b[1] > a[1] ? b : a) : b[1] < a[1] ? b : a));
    return {
      stem: `For the data ${M(xs.join(',\\ '))}, which of the following is ${ask}?`,
      choices: ['The mean', 'The median', 'The mode', 'The range', 'It cannot be determined'], answer: ['mean', 'median', 'mode', 'range'].indexOf(best[0]),
      ...EX(`Four different statistics must be computed and compared.`,
        `Sort the data once; median, mode and range can all be read off the sorted list, and only the mean needs arithmetic.`,
        [`Sorted: ${M(sorted.join(',\\ '))}.`, `Mode: ${m} appears three times, more than any other value.`, `Median: with 6 values, average the 3rd and 4th: (${sorted[2]} + ${sorted[3]}) ÷ 2 = ${fmt(med)}.`, `Range: ${sorted[5]} − ${sorted[0]} = ${range}.`, `Mean: the sum is ${sum}, divided by 6.`],
        `Mean ${M('= ' + fracTex(sum, 6))}, median ${M(fmt(med))}, mode ${M(m)}, range ${M(range)} → ${ask}: the ${best[0]}.`,
        `Pattern: "compare center/spread measures." Sort once, read median/mode/range, compute the mean last.`),
    };
  });
};
