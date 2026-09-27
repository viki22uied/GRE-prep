// Builds site/data/quant.json from the pattern templates.
// Each template produces many numeric variations; duplicates are dropped.
const fs = require('fs');
const path = require('path');

const templates = [];
const def = (meta, fn, weight = 1) => templates.push({ meta, fn, weight: weight / 16 });
require('./quant_arith')(def);
require('./quant_alg')(def);
require('./quant_geo')(def);
require('./quant_data')(def);
require('./quant_extra')(def);
const L = require('./lib');
// weight the formats toward the real test mix (QC ≈ a third of Quant)
templates.forEach((t) => { if (t.meta.format === 'qc') t.weight *= 1.7; if (t.meta.format === 'ma') t.weight *= 1.3; });

const PER_AREA = 300;
const byArea = {};
templates.forEach((t) => (byArea[t.meta.area] = byArea[t.meta.area] || []).push(t));

const out = [];
const problems = [];
// try to make one more unique variant of template t; returns true on success
function makeOne(t, st, area) {
  for (let tries = 0; tries < 60; tries++) {
    let q;
    try { q = t.fn(); } catch (e) { problems.push(`${t.meta.id}: ${e.message}`); continue; }
    if (!q) continue;
    const key = q.stem + '|' + (q.qa || '') + (q.qb || '') + (q.figure || '') + JSON.stringify(q.choices || q.answer);
    if (st.seen.has(key)) continue;
    st.seen.add(key);
    if (t.meta.format === 'ne' && q.answer && L.rand() < 0.35) toMC(q);
    const item = {
      id: `${t.meta.id}-${st.made + 1}`,
      section: 'quant', area, topic: t.meta.topic, format: q.format || t.meta.format, difficulty: q.diff || t.meta.diff,
      stem: q.stem, ...(q.figure ? { figure: q.figure } : {}), ...(q.qa ? { qa: q.qa, qb: q.qb } : {}),
      ...(q.choices ? { choices: q.choices } : {}), answer: q.answer, ...(q.ex ? { ex: q.ex } : { fast: q.fast, why: q.why }),
    };
    if (item.ex) { const cap = (t) => t.replace(/^([a-z])/, (m) => m.toUpperCase()); item.ex.steps = item.ex.steps.map(cap); item.ex.obstacle = cap(item.ex.obstacle); }
    const err = validate(item);
    if (err) { problems.push(`${item.id}: ${err}`); continue; }
    out.push(item); st.made++;
    return true;
  }
  return false;
}
for (const [area, ts] of Object.entries(byArea)) {
  const totalW = ts.reduce((a, t) => a + t.weight, 0);
  const states = ts.map(() => ({ seen: new Set(), made: 0, done: false }));
  let total = 0;
  ts.forEach((t, i) => {
    const want = Math.max(4, Math.round((PER_AREA * t.weight) / totalW));
    while (states[i].made < want) { if (!makeOne(t, states[i], area)) { states[i].done = true; break; } total++; }
  });
  // spread any shortfall evenly over templates that still have fresh variants
  while (total < PER_AREA && states.some((s) => !s.done)) {
    ts.forEach((t, i) => { if (total < PER_AREA && !states[i].done) { if (makeOne(t, states[i], area)) total++; else states[i].done = true; } });
  }
}

// Turn a numeric-entry variant into a 5-choice question (keeps the explanation).
function toMC(q) {
  const a = q.answer;
  if (a.type === 'num') {
    const v = a.value; const ds = [v * 2, v / 2, v + 1, v - 1, -v, v + 10].filter((x) => Number.isInteger(x) === Number.isInteger(v) && x !== v && (v < 0 || x >= 0));
    Object.assign(q, L.mcNum(v, L.shuffle(ds).slice(0, 2)), { format: 'mc' });
  } else {
    const { num: n, den: d } = a; const opts = [[d, n], [n + 1, d], [n, d + 1], [2 * n, d], [n, 2 * d], [d - n, d]].filter(([x, y]) => y > 0 && x * d !== y * n && x > 0 && (n > d || x <= y));
    while (opts.length < 6) { const k = opts.length + 2; opts.push([n, d * k]); }
    const correct = L.F(n, d);
    const ds = [...new Set(opts.map(([x, y]) => L.F(x, y)))].filter((s) => s !== correct);
    if (ds.length < 4) return;
    Object.assign(q, L.mc(correct, ds), { format: 'mc' });
  }
  q.stem = q.stem.replace(/\s*\(Give your answer as a fraction or integer\.\)/, '');
}

function validate(q) {
  const blob = JSON.stringify(q);
  if (/undefined|NaN|Infinity|\[object/.test(blob)) return 'bad token in output';
  if (!q.ex) return 'missing five-part explanation';
  const ex = q.ex;
  if (!ex.obstacle || !ex.method || !ex.steps || !ex.steps.length || !ex.work || !ex.pattern) return 'explanation part missing';
  // "why this number" check: every number used in the arithmetic must already appear in the question or in the reasoned steps
  const plain = (t) => String(t || '').replace(/\\frac\{(-?[\d.]+)\}\{([\d.]+)\}/g, '$1/$2').replace(/\\approx/g, "=").replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/\\(frac|sqrt|times|cdot|div|text|Rightarrow|quad|;|,|left|right|overline|lfloor|rfloor|binom|pi|circ|approx|le|ge|neq|ne|tfrac|mu|sigma|sum)/g, ' ').replace(/\{,\}/g, '');
  const nums = (t) => (plain(t).match(/\d+(?:\.\d+)?/g) || []).map(Number);
  const context = new Set(nums([q.stem, q.qa, q.qb, q.figure, ...(q.choices || []), ex.obstacle, ex.method, ...ex.steps].join(' ')));
  const operands = plain(ex.work).replace(/(=|→|is)\s*-?\s*\d+(?:\.\d+)?(?:\s*\/\s*\d+)?/g, ' ');
  const missing = nums(operands).filter((n) => !context.has(n) && n > 2);
  if (missing.length) return 'unjustified number in arithmetic: ' + missing.join(',');
  switch (q.format) {
    case 'mc': if (q.choices.length !== 5 && !(q.choices.length >= 4)) return 'mc needs 5 choices'; if (!(q.answer >= 0 && q.answer < q.choices.length)) return 'mc answer out of range'; if (new Set(q.choices).size !== q.choices.length) return 'duplicate choices'; break;
    case 'qc': if (q.choices.length !== 4 || !(q.answer >= 0 && q.answer < 4)) return 'bad qc'; break;
    case 'ma': if (!Array.isArray(q.answer) || !q.answer.length) return 'ma needs answers'; if (new Set(q.choices).size !== q.choices.length) return 'duplicate choices'; break;
    case 'ne': if (!q.answer || !['num', 'frac'].includes(q.answer.type)) return 'ne answer'; if (q.answer.type === 'frac' && !q.answer.den) return 'zero den'; break;
    default: return 'unknown format';
  }
  // exponents/fractions must live inside math so they render as real superscripts and stacked fractions
  const outside = (str) => String(str).replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/\\\([\s\S]*?\\\)/g, '');
  for (const part of [q.stem, q.qa, q.qb, ...(q.choices || []), ex.obstacle, ex.method, ...ex.steps, ex.work, ex.pattern]) { if (part && /\^|\\frac|\\sqrt/.test(outside(part))) return 'raw math outside \\( \\): ' + outside(part).slice(0, 80); }
  // balanced math delimiters
  const opens = (blob.match(/\\\\\(/g) || []).length, closes = (blob.match(/\\\\\)/g) || []).length;
  if (opens !== closes) return 'unbalanced math delimiters';
  return null;
}

fs.mkdirSync(path.join(__dirname, '../site/data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '../site/data/quant.json'), JSON.stringify(out));
const count = (k) => out.reduce((m, q) => ((m[q[k]] = (m[q[k]] || 0) + 1), m), {});
console.log('Quant questions:', out.length);
console.log(count('area'), count('format'), count('difficulty'));
if (problems.length) { console.log('Problems:', problems.length); console.log([...new Set(problems.map((p) => p.replace(/-\d+:/, ':')))].slice(0, 30).join('\n')); }
