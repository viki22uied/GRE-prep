// Shared helpers for the question generators.
// Math is written as TeX inside \( ... \) and rendered by KaTeX in the browser,
// so fractions show as real fractions and exponents as superscripts.

let seed = 20260927;
function rand() {
  // mulberry32 — deterministic so every build produces the same bank
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function sample(arr, k) { return shuffle(arr).slice(0, k); }
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const lcm = (a, b) => (a / gcd(a, b)) * b;
const clean = (x) => +(+x).toFixed(8); // kill float noise

// inline math
const M = (s) => `\\(${s}\\)`;

// TeX for a reduced fraction n/d (sign in front, integer when d divides n)
function fracTex(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1; n /= g; d /= g;
  if (d === 1) return `${n}`;
  return (n < 0 ? '-' : '') + `\\frac{${Math.abs(n)}}{${d}}`;
}
const F = (n, d) => M(fracTex(n, d));
function reduce(n, d) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return [n / g, d / g]; }

// number formatting: commas for big integers, trimmed decimals
function fmt(x) {
  x = clean(x);
  if (Number.isInteger(x) && Math.abs(x) >= 10000) return x.toLocaleString('en-US');
  return String(x);
}
// numbers inside TeX need {,} to avoid the thin space after commas
const tn = (x) => fmt(x).replace(/,/g, '{,}');

// ---------- answer builders ----------
const num = (v) => ({ type: 'num', value: clean(v) });
const frac = (n, d) => { const [a, b] = reduce(n, d); return { type: 'frac', num: a, den: b }; };

// Multiple choice (one answer). correct + distractors are display strings.
function mc(correct, distractors, { sort = false, count = 5 } = {}) {
  const seen = new Set([correct]);
  const ds = [];
  for (const d of distractors) { if (!seen.has(d)) { seen.add(d); ds.push(d); } if (ds.length === count - 1) break; }
  if (ds.length < count - 1) throw new Error('not enough distractors for ' + correct + ' :: ' + distractors.join(' | '));
  let choices = shuffle([correct, ...ds]);
  if (sort) choices = sortChoices(choices);
  return { choices, answer: choices.indexOf(correct) };
}
// Numeric MC: builds distractors from "mistake" values, then fills with nearby values
function mcNum(correct, mistakes, render = (v) => M(tn(v)), { count = 5 } = {}) {
  correct = clean(correct);
  const vals = [];
  const add = (v) => { v = clean(v); if (Number.isFinite(v) && v !== correct && !vals.includes(v)) vals.push(v); };
  mistakes.forEach(add);
  const step = Math.max(1, Math.round(Math.abs(correct) / 10)) || 1;
  let k = 1;
  while (vals.length < count - 1) { add(correct + k * step); if (vals.length < count - 1) add(correct - k * step); k++; }
  const chosen = [correct, ...vals.slice(0, count - 1)].sort((a, b) => a - b);
  const choices = chosen.map(render);
  return { choices, answer: chosen.indexOf(correct) };
}
function sortChoices(c) { return c; }

// Multiple answer (select all that apply). items: [{text, ok}]
function ma(items) {
  const choices = items.map((i) => i.text);
  const answer = items.map((i, idx) => (i.ok ? idx : -1)).filter((i) => i >= 0);
  if (!answer.length) throw new Error('multi-answer with no correct choice');
  return { choices, answer };
}

// Quantitative comparison: rel is 'A' | 'B' | 'C' (equal) | 'D' (cannot be determined)
const QC_CHOICES = [
  'Quantity A is greater.',
  'Quantity B is greater.',
  'The two quantities are equal.',
  'The relationship cannot be determined from the information given.',
];
function qc(qa, qb, rel) { return { qa, qb, choices: QC_CHOICES, answer: 'ABCD'.indexOf(rel) }; }
const cmp = (a, b) => (Math.abs(a - b) < 1e-9 ? 'C' : a > b ? 'A' : 'B');

// polynomial TeX: coefficients high→low, variable v
function poly(coefs, v = 'x') {
  const n = coefs.length - 1; let s = '';
  coefs.forEach((c, i) => {
    if (c === 0) return;
    const p = n - i;
    const abs = Math.abs(c);
    const coef = abs === 1 && p > 0 ? '' : String(abs);
    const term = coef + (p === 0 ? '' : p === 1 ? v : `${v}^{${p}}`);
    if (!s) s = (c < 0 ? '-' : '') + term; else s += (c < 0 ? ' - ' : ' + ') + term;
  });
  return s || '0';
}
// "+ 3" / "- 3" helper for building expressions
const sgn = (c) => (c < 0 ? `- ${-c}` : `+ ${c}`);

function ord(n) { const s = ['th', 'st', 'nd', 'rd']; const v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
// wrap negatives in parentheses when substituting
const par = (x) => (x < 0 ? `(${x})` : `${x}`);

module.exports = { ord, par, rand, ri, pick, shuffle, sample, gcd, lcm, clean, M, fracTex, F, reduce, fmt, tn, num, frac, mc, mcNum, ma, qc, cmp, poly, sgn, QC_CHOICES };
