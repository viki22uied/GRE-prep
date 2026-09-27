// Builds site/data/verbal.json (questions) and site/data/vocab.json (flashcards)
// from the hand-written files in content/.
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const { pick, shuffle, sample } = L;
const C = (f) => path.join(__dirname, '../content', f);

// ---------- tiers ----------
// Tier 1 = most tested, Tier 2 = common, Tier 3 = advanced / rare.
// Words that were marked 3 in the source but are everyday English become "basic":
// they appear inside questions as synonyms, but are not counted as GRE vocabulary.
const RARE = new Set(`periphrastic circumlocutory compendious calumniate traduce philippic eulogistic refractory pertinacious temerarious doughty stouthearted
choleric splenetic roseate jocose pellucid perspicuous limpid temporize befog sophistical factitious magniloquent orotund fugitive picayune exiguous
superabundance bounteous baneful execrable beneficent irenic placatory genteel politic guileful veracious propitiate controvert inculpate perturbation
pusillanimity intrepidity comity odium concurrence apogee mountebank votary fatuity augury sinecure piquant multifarious spasmodic apropos otiose toilsome
sinuous gull beget bespeak betoken cleave rend bifurcate flummox abominate execrate blandish avuncular cynosure exigent magisterial obsolescent peripatetic
lachrymose dulcet euphonious noisome unalloyed impious clement adventitious bode hale spry monastic mannered precious lordly
sedulous recondite abjure extirpate inveigle obstreperous penurious niggardly iniquitous depraved truculent churlish boorish stolid lugubrious doleful
disconsolate staid fervid torpid languid sybaritic epicurean heterodox labyrinthine byzantine tortuous variegated motley quiescent ineluctable apposite
infelicitous indecorous untoward consonant abstemious hidebound stilted extemporaneous hoodwink lionize raze efface excise propagate husband estrange sunder
meld nonplus contravene transgress forbear desist wheedle browbeat gainsay vitiate codify promulgate exculpate sangfroid aplomb penitence compunction mettle
animus abhorrence repugnance genesis acme quintessence savant tyro exponent chicanery artifice mendacity rectitude languor lassitude verve effrontery
perspicacity sagacity indigence privation opulence progenitor antecedent sententious doctrinaire benighted philistine turgid ersatz intractable eremite
insouciant distend exigency preamble reprobate supposition welter bamboozle conjure pugnacious lampoon`.split(/\s+/).filter(Boolean));

// frequently tested words promoted to tier 1
const PROMOTE = new Set(`acclaim eulogize lambaste berate upbraid pillory chide rebuke reprove deprecate decry defame besmirch panegyric paean plaudits harangue
vituperation mordant vitriolic adulatory fawning servile unctuous disdainful unassuming self-effacing vainglorious pompous obdurate pliant acquiescent
malleable diligent industrious slothful desultory painstaking wary chary rash foolhardy heedless valiant undaunted craven timorous serene overwrought frenetic
distraught dispassionate stoic vehement cantankerous testy peevish genial cordial congenial convivial melancholy disparate`.split(/\s+/).filter(Boolean));

// ---------- parse vocab ----------
const clusters = {}; const order = [];
let cur = null;
for (const f of fs.readdirSync(path.join(__dirname, '../content')).filter((f) => /^vocab_.*\.txt$/.test(f)).sort()) {
  for (const raw of fs.readFileSync(C(f), 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('= ')) {
      const [id, pos, gloss, ant] = line.slice(2).split('|').map((s) => s.trim());
      cur = clusters[id] = { id, pos, gloss, antonym: ant === '-' ? null : ant, words: [], frames: [] };
      order.push(id);
    } else if (line.startsWith('> ')) {
      const [signal, text, clue] = line.slice(2).split('|').map((s) => s.trim());
      cur.frames.push({ signal, text, clue });
    } else {
      const parts = line.split('|').map((s) => s.trim());
      if (parts.length < 4 || parts[1] === '0' || parts[2] === '-' || parts[2] === '—') continue;
      const [word, t, def, ...ex] = parts;
      let tier = +t;
      if (RARE.has(word)) tier = 3; else if (PROMOTE.has(word)) tier = 1; else if (tier === 3) tier = 0;
      cur.words.push({ word, tier, def, ex: ex.join(' | ') });
    }
  }
}

// ---------- vocab deck ----------
const vocab = []; const seenWord = new Set();
for (const id of order) for (const w of clusters[id].words) {
  const key = w.word + '|' + clusters[id].pos;
  if (seenWord.has(key)) continue; seenWord.add(key);
  vocab.push({ id: 'v-' + w.word.replace(/\s+/g, '_'), word: w.word, pos: clusters[id].pos, tier: w.tier, def: w.def, ex: w.ex, group: id.startsWith('misc') ? null : clusters[id].gloss });
}

// ---------- families: clusters close in meaning are never used as each other's distractors ----------
const FAMILIES = [
  'praise-v laudatory praise-n revere advocate enact', 'criticize-v reproach-v belittle slander-v scathing invective mock detractor',
  'talkative wordy bombastic eloquent', 'taciturn concise inarticulate plain', 'haughty boastful audacity', 'humble obsequious',
  'stubborn resist', 'compliant obey capitulate', 'diligent meticulous comprehensive', 'lazy lethargy careless', 'cautious skeptical', 'reckless audacity',
  'brave courage', 'cowardly cowardice', 'calm composure impassive', 'agitated agitation', 'passionate alacrity', 'irritable hostile malevolent animosity',
  'genial kind peaceable amity courteous tactful', 'sad pessimistic', 'joyful optimistic', 'serious', 'flippant',
  'obscure ambiguous obfuscate complex perplex', 'lucid explicit clarify simple', 'equivocate deceitful deception deceive secret conceal cunning',
  'candid overt reveal candor disseminate evince', 'cogent authentic corroborate', 'specious counterfeit refute challenge impostor',
  'wise erudite acumen', 'foolish ignorant folly', 'pedantic', 'open-minded', 'partisan', 'ephemeral sporadic', 'enduring steadfast incessant inevitable',
  'capricious vacillate', 'trivial superfluous extraneous', 'momentous indispensable relevant', 'abundant plethora ubiquitous affluence generous',
  'scarce dearth poverty stingy', 'frugal conserve', 'prodigal squander hedonistic', 'greedy corrupt', 'upright virtuous ascetic',
  'harmful wicked', 'beneficial', 'alleviate placate facilitate strengthen', 'exacerbate provoke undermine hinder deter suppress',
  'increase prolong exaggerate', 'dwindle shorten condense understate', 'abolish renounce avoid eradicate destroy erase', 'exonerate', 'incriminate',
  'remorse', 'nadir', 'culmination', 'inception', 'paragon', 'precursor omen', 'expert', 'novice dilettante', 'proponent follower',
  'discord', 'consensus', 'outdated', 'modern novel', 'trite mundane', 'exciting', 'orthodox', 'unconventional', 'nascent', 'diverse', 'uniform',
  'contingent', 'apt consistent', 'inappropriate incongruous', 'excessive', 'moderate', 'arduous', 'effortless', 'subtle', 'obvious', 'indirect', 'latent',
  'pragmatic', 'quixotic', 'parochial', 'cosmopolitan', 'affected', 'spontaneous', 'premeditated', 'evoke cause', 'reconcile merge', 'alienate separate',
  'conflate', 'distinguish', 'digress', 'flout', 'abhor aversion', 'predilection', 'cease', 'cajole', 'coerce', 'foreshadow',
];
const famOf = {};
FAMILIES.forEach((f, i) => f.split(' ').forEach((id) => (famOf[id] = i)));
const related = (a, b) => a === b || (famOf[a] !== undefined && famOf[a] === famOf[b]) || clusters[a]?.antonym === b || clusters[b]?.antonym === a;

const usable = order.filter((id) => !id.startsWith('misc') && clusters[id].words.length >= 2);
const byPos = {};
usable.forEach((id) => (byPos[clusters[id].pos] = byPos[clusters[id].pos] || []).push(id));

// ---------- inflection (choices are shown in the form the sentence needs) ----------
const IRREG = { bear: ['bore', 'bearing', 'bears'], draw: ['drew', 'drawing', 'draws'], forgo: ['forwent', 'forgoing', 'forgoes'], beget: ['begot', 'begetting', 'begets'],
  cleave: ['cleaved', 'cleaving', 'cleaves'], rend: ['rent', 'rending', 'rends'], forbear: ['forbore', 'forbearing', 'forbears'], browbeat: ['browbeat', 'browbeating', 'browbeats'],
  withstand: ['withstood', 'withstanding', 'withstands'], sever: ['severed', 'severing', 'severs'], mix: ['mixed', 'mixing', 'mixes'], blot: ['blotted', 'blotting', 'blots'],
  root: ['rooted', 'rooting', 'roots'], stamp: ['stamped', 'stamping', 'stamps'], shore: ['shored', 'shoring', 'shores'], play: ['played', 'playing', 'plays'],
  cut: ['cut', 'cutting', 'cuts'], fritter: ['frittered', 'frittering', 'fritters'], call: ['called', 'calling', 'calls'], abide: ['abided', 'abiding', 'abides'], adhere: ['adhered', 'adhering', 'adheres'] };
const DOUBLE = new Set(['rebut', 'abet', 'compel', 'impel', 'expel', 'dispel', 'propel', 'repel', 'control', 'regret', 'emit', 'omit', 'commit', 'transmit', 'admit', 'incur', 'deter', 'defer', 'confer', 'prefer', 'infer', 'abhor', 'occur', 'recur', 'stir', 'spur', 'allot', 'befit', 'outwit', 'equip', 'patrol', 'sap', 'shun', 'snub', 'stem', 'gull', 'blot', 'dupe-no']);
function inflect(phrase, form, pos) {
  if (!form) return phrase;
  const parts = phrase.split(' ');
  if (pos === 'noun') { // plural of the last word
    const w = parts[parts.length - 1];
    parts[parts.length - 1] = /(s|x|z|ch|sh)$/.test(w) ? w + 'es' : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's';
    return parts.join(' ');
  }
  const w = parts[0]; let out;
  const idx = { ed: 0, ing: 1, s: 2 }[form];
  if (IRREG[w]) out = IRREG[w][idx];
  else if (form === 's') out = /(s|x|z|ch|sh)$/.test(w) ? w + 'es' : /[^aeiou]y$/.test(w) ? w.slice(0, -1) + 'ies' : w + 's';
  else {
    let stem = w;
    if (DOUBLE.has(w)) stem = w + w.slice(-1);
    if (form === 'ed') out = /e$/.test(stem) ? stem + 'd' : /[^aeiou]y$/.test(stem) ? stem.slice(0, -1) + 'ied' : stem + 'ed';
    else out = /ie$/.test(stem) ? stem.slice(0, -2) + 'ying' : /[^e]e$/.test(stem) && !/(ee|ye|oe)$/.test(stem) ? stem.slice(0, -1) + 'ing' : stem + 'ing';
  }
  parts[0] = out; return parts.join(' ');
}

// ---------- signal words: how to spot the logic of the sentence ----------
const SIGNALS = {
  contrast: ['although', 'though', 'even though', 'but', 'yet', 'despite', 'in spite of', 'rather than', 'instead', 'unlike', 'while', 'whereas', 'far from', 'however', 'nonetheless', 'once', 'now', 'at first', 'initially', 'surprisingly', 'expected', 'hoped', 'claimed', 'assumed', 'seemed', 'appears', 'normally', 'usually', 'anything but', 'not'],
  continuation: [':', ';', 'moreover', 'furthermore', 'indeed', 'in fact', 'and', 'so … that', 'such', 'famously', 'even'],
  cause: ['because', 'since', 'so', 'therefore', 'thus', 'as a result', 'given', 'faced with', 'fearing', 'forced', 'led'],
};
function findSignals(text, type) {
  const lower = ' ' + text.toLowerCase().replace(/[,.]/g, ' ') + ' ';
  const hits = (SIGNALS[type] || []).filter((w) => (w.length === 1 ? text.includes(w) : w.includes('…') ? /\bso\b.*\bthat\b/i.test(text) : lower.includes(' ' + w + ' ')));
  return hits.slice(0, 3);
}
// underline the signal words inside a (html) sentence
function markSignals(html, sigs) {
  for (const w of sigs) {
    if (w.length === 1 || w.includes('…')) continue;
    html = html.replace(new RegExp(`\\b(${w.replace(/ /g, '\\s+')})\\b`, 'i'), '<u class="sig">$1</u>');
  }
  return html;
}
const HOW = {
  contrast: `Words like <i>although, though, but, yet, despite, rather than, instead of, unlike, while/whereas, far from</i> announce a reversal. So do time contrasts (<i>once … now</i>, <i>at first … later</i>) and expectation words (<i>expected, hoped, claimed, seemed</i>), which set up a surprise. When you see one, the blank must mean roughly the <b>opposite</b> of the clue on the other side of the signal.`,
  continuation: `Colons and semicolons, <i>and</i>, <i>moreover, furthermore, indeed, in fact</i>, and descriptive phrases that follow the blank (for example "…, who once spoke for nine hours") tell you the sentence is <b>explaining or extending</b> itself. When you see one, the blank must <b>agree</b> with the clue: often it is just a one-word summary of the description.`,
  cause: `<i>Because, since, so, therefore, thus, as a result, given, faced with, fearing</i> link a cause to its effect. When you see one, ask "what would <b>produce</b> this result?" (or "what would this cause lead to?"). The blank is whichever side of that cause-and-effect link is missing.`,
};
const DIRECTION = { contrast: 'point the opposite way from the clue', continuation: 'agree with the clue', cause: 'be the cause (or result) the clue describes' };
const SIGNAL_NAME = { contrast: 'contrast', continuation: 'continuation', cause: 'cause and effect' };
function signalStep(fr, sig) {
  if (sig.length) return `Find the signal. In this sentence it is ${sig.map((w) => `<b>“${esc(w)}”</b>`).join(' and ')}, which marks ${fr.signal === 'contrast' ? 'a contrast' : fr.signal === 'cause' ? 'a cause-and-effect link' : 'a continuation'}. So the blank must ${DIRECTION[fr.signal]}.`;
  return `Find the signal. There's no single trigger word here; the structure of the sentence does the job (${fr.signal === 'contrast' ? 'two parts set against each other' : fr.signal === 'cause' ? 'one part explains why the other happens' : 'the second part describes or restates the first'}). So the blank must ${DIRECTION[fr.signal]}.`;
}
const BLANK = '<span class="blank"></span>';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// fill "a ____" -> "a(n) ____" so articles never give the answer away
function stemFrom(text) {
  return esc(text).replace(/\b([Aa])n? ____/g, '$1(n) ____').replace(/____(ed|ing|s)?/g, BLANK);
}
function filled(text, word) {
  return esc(text).replace(/\b([Aa])n? ____/g, (m, a) => `${/^[aeiou]/i.test(word) ? a + 'n' : a} ____`).replace(/____(ed|ing|s)?/, `<b>${word}</b>`);
}
const formOf = (text, i = 0) => { const m = [...text.matchAll(/____(ed|ing|s)?/g)][i]; return m ? m[1] : undefined; };

function randomDistractors(cid, pos, n, avoidWords) {
  const pool = shuffle((byPos[pos] || []).filter((o) => !related(o, cid)));
  const out = [];
  for (const o of pool) { const w = pick(clusters[o].words); if (!avoidWords.has(w.word)) { out.push({ ...w, cid: o }); avoidWords.add(w.word); } if (out.length === n) break; }
  return out;
}
const defOf = (w) => `<b>${w.word}</b> (${w.def})`;
const tierOf = (ws) => Math.max(...ws.map((w) => w.tier || 0)) || 2;
const diffOf = (ws) => { const t = ws.map((w) => w.tier); return t.includes(3) ? 'hard' : t.every((x) => x === 0) ? 'easy' : 'medium'; };

const questions = [];
let qn = 0;

// ---------- Sentence Equivalence & single-blank Text Completion ----------
for (const cid of usable) {
  const c = clusters[cid];
  c.frames.forEach((fr, fi) => {
    const form = formOf(fr.text);
    const sig = findSignals(fr.text, fr.signal);
    const ant = c.antonym && clusters[c.antonym] && clusters[c.antonym].pos === c.pos && clusters[c.antonym].words.length >= 2 ? clusters[c.antonym] : null;
    const pairs = [];
    const ws = shuffle(c.words);
    for (let i = 0; i < ws.length && pairs.length < 2; i += 2) if (ws[i + 1]) pairs.push([ws[i], ws[i + 1]]);
    // --- SE (up to 2 per frame)
    pairs.forEach((pair, pi) => {
      const avoid = new Set(c.words.map((w) => w.word));
      const trap = ant ? sample(ant.words, 2).map((w) => ({ ...w, cid: ant.id })) : [];
      trap.forEach((w) => avoid.add(w.word));
      const others = randomDistractors(cid, c.pos, 6 - 2 - trap.length, avoid);
      const all = shuffle([...pair.map((w) => ({ ...w, ok: true })), ...trap, ...others]);
      if (all.length !== 6) return;
      questions.push({
        id: `se-${cid}-${fi + 1}-${pi + 1}`, section: 'verbal', area: 'Sentence Equivalence', topic: c.gloss.split(';')[0], format: 'se',
        difficulty: diffOf(pair), tier: tierOf(pair), words: pair.map((w) => w.word),
        stem: stemFrom(fr.text),
        choices: all.map((w) => inflect(w.word, form, c.pos)),
        answer: all.map((w, i) => (w.ok ? i : -1)).filter((i) => i >= 0),
        ex: {
          obstacle: `Six words, and ${trap.length ? 'two different pairs of them are synonyms' : 'several of them sound plausible'} — so "find two words that mean the same thing" isn't enough. The pair has to fit the sentence's logic.`,
          method: HOW[fr.signal] + ` For Sentence Equivalence, predict the blank in your own words first, then pick the two choices that match your prediction; both must produce sentences with the same meaning.`,
          steps: [
            signalStep(fr, sig),
            `Find the clue — the words that tell you what the blank must be about. ${esc(fr.clue)}`,
            `Predict your own word before looking at the choices: the blank means “${esc(c.gloss)}”.`,
            `Match the prediction. ${defOf(pair[0])} and ${defOf(pair[1])} both carry that meaning, and putting either one in gives essentially the same sentence.`,
            ...(trap.length ? [`Eliminate the trap pair. ${defOf(trap[0])} and ${defOf(trap[1])} are synonyms of each other too, but they mean the opposite of the prediction — they would only work if the sentence's logic ran the other way.`] : []),
            ...(others.length ? [`The remaining choices, ${others.map(defOf).join(' and ')}, have nothing to do with the meaning the sentence needs.`] : []),
          ],
          work: markSignals(filled(fr.text, inflect(pair[0].word, form, c.pos)), sig),
          pattern: `Pattern: ${SIGNAL_NAME[fr.signal]} signal → the blank must ${DIRECTION[fr.signal]}. Always predict before you look; a synonym pair that fits the topic but not the direction is the standard trap.`,
        },
      });
    });
    // --- TC single blank (5 choices)
    const right = pick(c.words);
    const avoid = new Set(c.words.map((w) => w.word));
    const trap = ant ? sample(ant.words, pick([1, 2])).map((w) => ({ ...w, cid: ant.id })) : [];
    trap.forEach((w) => avoid.add(w.word));
    const others = randomDistractors(cid, c.pos, 4 - trap.length, avoid);
    const all = shuffle([{ ...right, ok: true }, ...trap, ...others]);
    if (all.length !== 5) return;
    questions.push({
      id: `tc1-${cid}-${fi + 1}`, section: 'verbal', area: 'Text Completion', topic: c.gloss.split(';')[0], format: 'tc',
      difficulty: diffOf([right]), tier: tierOf([right]), words: [right.word],
      stem: stemFrom(fr.text),
      blanks: [all.map((w) => inflect(w.word, form, c.pos))],
      answer: [all.findIndex((w) => w.ok)],
      ex: {
        obstacle: `Several choices are real GRE words that could describe this topic${trap.length ? ', and at least one is the exact opposite of the answer' : ''}. Picking by "sounds right" leads straight to the trap.`,
        method: HOW[fr.signal] + ` For Text Completion, cover the choices, predict the blank in your own words, then pick the choice closest to your prediction.`,
        steps: [
          signalStep(fr, sig),
          `Find the clue. ${esc(fr.clue)}`,
          `Predict your own word: the blank means “${esc(c.gloss)}”.`,
          `Match the prediction: ${defOf(right)}.`,
          ...(trap.length ? [`Eliminate the trap: ${trap.map(defOf).join(' and ')} — ${trap.length > 1 ? 'these point' : 'this points'} the opposite way, which would only fit if the signal were reversed.`] : []),
          `The others (${others.map(defOf).join('; ')}) don't match the meaning at all.`,
        ],
        work: markSignals(filled(fr.text, inflect(right.word, form, c.pos)), sig),
        pattern: `Pattern: ${SIGNAL_NAME[fr.signal]} signal → the blank must ${DIRECTION[fr.signal]}. Predict first, then match.`,
      },
    });
  });
}

// ---------- multi-blank Text Completion ----------
{
  let block = null; const blocks = [];
  for (const raw of fs.readFileSync(C('tc_multi.txt'), 'utf8').split('\n')) {
    const line = raw.trim(); if (!line || line.startsWith('#')) continue;
    if (line.startsWith('@@')) { block = { ids: line.slice(2).split('|').map((s) => s.trim()), frames: [] }; blocks.push(block); continue; }
    const [signal, text, expl] = line.split('|').map((s) => s.trim());
    if (signal === 'skip') continue;
    block.frames.push({ signal, text, expl });
  }
  let bi = 0;
  for (const b of blocks) {
    bi++;
    if (!b.ids.every((id) => clusters[id] && clusters[id].words.length >= 1)) continue;
    b.frames.forEach((fr, fi) => {
      const marks = [...fr.text.matchAll(/\[(\d)\](ed|ing|s)?/g)];
      if (marks.length !== b.ids.length) return;
      for (let v = 0; v < 2; v++) {
        const blanks = [], answer = [], chosen = [], notes = [];
        let ok = true;
        b.ids.forEach((id, k) => {
          const c = clusters[id]; const form = marks[k][2];
          const right = pick(c.words);
          const ant = c.antonym && clusters[c.antonym] && clusters[c.antonym].pos === c.pos ? clusters[c.antonym] : null;
          const avoid = new Set([...c.words.map((w) => w.word), ...chosen.map((w) => w.word)]);
          const trap = ant ? [pick(ant.words)] : [];
          trap.forEach((w) => avoid.add(w.word));
          const others = randomDistractors(id, c.pos, 2 - trap.length, avoid);
          const all = shuffle([{ ...right, ok: true }, ...trap, ...others]);
          if (all.length !== 3) { ok = false; return; }
          blanks.push(all.map((w) => inflect(w.word, form, c.pos)));
          answer.push(all.findIndex((w) => w.ok));
          chosen.push(right);
          notes.push(`Blank (${['i', 'ii', 'iii'][k]}): ${defOf(right)}${trap.length ? ` — not ${defOf(trap[0])}, which is the opposite` : ''}.`);
        });
        if (!ok) continue;
        let stem = esc(fr.text); let full = esc(fr.text);
        b.ids.forEach((id, k) => {
          const re = new RegExp(`\\[${k + 1}\\](ed|ing|s)?`);
          stem = stem.replace(re, `<span class="blank">(${['i', 'ii', 'iii'][k]})</span>`);
          full = full.replace(re, `<b>${blanks[k][answer[k]]}</b>`);
        });
        const key = stem + JSON.stringify(blanks.map((bl, k) => bl[answer[k]]));
        if (questions.some((q) => q._key === key)) continue;
        questions.push({
          _key: key,
          id: `tc${b.ids.length}-${bi}-${fi + 1}-${v + 1}`, section: 'verbal', area: 'Text Completion', topic: `${b.ids.length}-blank`, format: 'tc',
          difficulty: b.ids.length === 3 ? 'hard' : diffOf(chosen) === 'easy' ? 'medium' : diffOf(chosen), tier: tierOf(chosen), words: chosen.map((w) => w.word),
          stem, blanks, answer,
          ex: {
            obstacle: `${b.ids.length} blanks and no partial credit: one wrong blank makes the whole answer wrong, and the blanks depend on each other.`,
            method: `Don't fill the blanks in order. Start with the blank that has the strongest clue in the sentence, fill it with your own prediction, then use that filled-in blank as a new clue for the next one. The signal words tell you whether each blank agrees with or opposes its neighbors. ` + HOW[fr.signal],
            steps: [signalStep(fr, findSignals(fr.text.replace(/\[\d\](ed|ing|s)?/g, '____'), fr.signal)), `Read how the blanks relate: ${esc(fr.expl)}`, ...notes.map((n) => `Fill ${n.charAt(0).toLowerCase()}${n.slice(1)}`)],
            work: markSignals(full, findSignals(fr.text, fr.signal)),
            pattern: `Pattern: multi-blank ${SIGNAL_NAME[fr.signal]}. Anchor on the most-constrained blank, then let each filled blank constrain the next.`,
          },
        });
      }
    });
  }
}

// ---------- Reading Comprehension ----------
function rcEx(q, kind) {
  const t = q.text.toLowerCase();
  const type = /weaken|cast doubt|vulnerable|flaw/.test(t) ? 'weaken' : /strengthen/.test(t) ? 'strengthen' : /assumption/.test(t) ? 'assume' : /primary purpose|main idea|primarily concerned|organization/.test(t) ? 'main' : /in order to|primarily as|mentions/.test(t) ? 'function' : /most nearly means/.test(t) ? 'vocab' : /infer|suggest|imply|agree/.test(t) ? 'infer' : 'detail';
  const M_ = {
    weaken: ['Several choices are true-sounding facts about the topic, but only one breaks the link between the evidence and the conclusion.', 'Identify the conclusion and the evidence, then find the gap between them (usually an overlooked alternative cause or a hidden assumption). The right answer attacks that gap.'],
    strengthen: ['Several choices are relevant to the topic, but only one closes the gap in the reasoning.', 'Identify the conclusion and the evidence, find the gap, and pick the choice that fills it (for causal claims, the one that rules out other explanations).'],
    assume: ['An assumption is never stated, so you won\'t find it in the text.', 'Find the gap between evidence and conclusion; the assumption is what must be true to bridge it. Test a choice by negating it: if the argument falls apart, that choice is the assumption.'],
    main: ['Wrong answers usually describe only one part of the passage, or overstate what the author does.', 'Summarize what each paragraph does in a few words before looking at the choices. The right answer covers the whole passage at the right strength.'],
    function: ['The question asks why the author included something, not what it says.', 'Look at what the detail is doing in its paragraph (supporting a claim, giving an example, raising an objection) and choose the answer that names that role.'],
    vocab: ['The common meaning of the word is usually a trap.', 'Reread the sentence, cover the word, predict a replacement from context, then match.'],
    infer: ['Inference answers must be supported by the text, not merely possible; extreme answers are usually wrong.', 'Go back to the relevant lines and pick the choice that must be true given what the passage says — the smallest step beyond the text.'],
    detail: ['The answer is stated in the passage, but wrong choices mix real words from the passage with claims it never makes.', 'Locate the relevant lines before reading the choices, then match the choice to what those lines actually say.'],
  };
  return { obstacle: M_[type][0], method: M_[type][1], steps: [esc(q.expl)], work: q.type === 'ma' ? 'Judge each statement separately: any number of them (1, 2 or all 3) can be correct.' : 'Eliminate choices that are too extreme, off-topic, or only partly supported.', pattern: `Pattern: ${kind === 'argument' ? 'argument structure' : 'reading comprehension'} — ${{ weaken: 'weaken the link', strengthen: 'strengthen the link', assume: 'find the unstated assumption', main: 'main idea/purpose', function: 'function of a detail', vocab: 'word in context', infer: 'inference', detail: 'detail' }[type]} question.` };
}
const passages = [];
{
  const text = fs.readdirSync(path.join(__dirname, '../content')).filter((f) => /^rc.*\.txt$/.test(f)).sort().map((f) => fs.readFileSync(C(f), 'utf8')).join('\n');
  const chunks = text.split(/^### /m).slice(1);
  for (const ch of chunks) {
    const lines = ch.split('\n');
    const [id, kind, topic] = lines[0].split('|').map((s) => s.trim());
    const bodyEnd = lines.findIndex((l) => l.startsWith('??'));
    const paras = lines.slice(1, bodyEnd).join('\n').trim().split(/\n\s*\n/).map((p) => p.replace(/\s+/g, ' ').trim());
    // split into sentences (for select-in-passage)
    const sentences = []; const parasS = paras.map((p) => p.split(/(?<=[.!?])\s+(?=[A-Z"“])/).map((s) => { sentences.push(s); return sentences.length - 1; }));
    passages.push({ id, kind, topic, paras: parasS, sentences });
    let q = null; const qs = [];
    for (const l of lines.slice(bodyEnd)) {
      if (l.startsWith('??')) { const m = l.slice(2).trim().match(/^(mc|ma|sel)\s*\|\s*(.*)$/); q = { type: m[1], text: m[2], choices: [], correct: [], expl: '' }; qs.push(q); }
      else if (l.startsWith('* ') && q) { if (q.type === 'sel') q.correct.push(+l.slice(2) - 1); else { q.correct.push(q.choices.length); q.choices.push(l.slice(2).trim()); } }
      else if (l.startsWith('- ') && q) q.choices.push(l.slice(2).trim());
      else if (l.startsWith('!!') && q) q.expl = l.slice(2).trim();
    }
    qs.forEach((q, i) => {
      const base = { id: `rc-${id}-${i + 1}`, section: 'verbal', area: 'Reading Comprehension', topic: kind === 'argument' ? 'Argument structure' : topic, passage: id, difficulty: kind === 'long' ? 'medium' : kind === 'argument' ? 'medium' : 'easy', stem: esc(q.text) };
      if (q.type === 'sel') {
        if (q.correct[0] >= sentences.length) throw new Error(`rc ${id}: sentence ${q.correct[0] + 1} out of range`);
        questions.push({ ...base, format: 'sel', answer: q.correct[0], ex: { obstacle: 'Every sentence in the passage is a candidate, and several touch the same topic.', method: 'Decide what job the sentence must do (give a reason, make a warning, present evidence, offer a benefit…), then scan for the sentence doing that job — not just one that mentions the same words.', steps: [esc(q.expl)], work: `Sentence ${q.correct[0] + 1}: “${esc(sentences[q.correct[0]])}”`, pattern: 'Pattern: select-in-passage. Match the function described in the question, not the topic.' } });
      } else {
        questions.push({ ...base, format: q.type === 'ma' ? 'ma' : 'mc', choices: q.choices.map(esc), answer: q.type === 'ma' ? q.correct : q.correct[0], ex: rcEx(q, kind) });
      }
    });
  }
}

questions.forEach((q) => delete q._key);
// sanity checks
const bad = questions.filter((q) => /undefined|NaN/.test(JSON.stringify(q)));
if (bad.length) { console.log('BAD', bad.slice(0, 3)); process.exit(1); }
const dupIds = questions.map((q) => q.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupIds.length) { console.log('dup ids', dupIds.slice(0, 5)); process.exit(1); }

fs.writeFileSync(path.join(__dirname, '../site/data/verbal.json'), JSON.stringify({ passages, questions }));
fs.writeFileSync(path.join(__dirname, '../site/data/vocab.json'), JSON.stringify(vocab));
const cnt = (arr, k) => arr.reduce((m, x) => ((m[x[k]] = (m[x[k]] || 0) + 1), m), {});
console.log('Vocab words:', vocab.length, cnt(vocab, 'tier'));
console.log('Verbal questions:', questions.length, cnt(questions, 'area'), cnt(questions, 'difficulty'));
console.log('Passages:', passages.length);
