# GRE Daily

A static GRE practice site: no framework and no build needed to serve it (`site/` is the web root).

- **Quant:** 1,200+ questions generated from ~80 shortcut patterns across Arithmetic, Algebra, Geometry and Data Analysis (ETS syllabus), in all four formats (Quantitative Comparison, one-answer MC, select-all MC, numeric entry). Every question has a five-part explanation: the obstacle, the general (reusable) method, reasoned steps that say why each number is chosen, the arithmetic, and a named pattern. The build fails if the arithmetic uses a number that the question or steps never introduced. Math is written in TeX and rendered by KaTeX (bundled in `site/vendor/katex`), so fractions and exponents display as real math.
- **Verbal:** 1,470 vocabulary words (Tier 1 most tested, Tier 2 common, Tier 3 advanced, plus basic words), each with a meaning and an example sentence; 1,500+ Text Completion and Sentence Equivalence questions built from those words in signal-word sentences (contrast / continuation / cause), with the same five-part explanations (how to spot the signal, clue, prediction, traps, completed sentence); 53 Reading Comprehension passages with 111 questions, including argument questions and select-the-sentence questions.
- **App:** one-question-at-a-time practice with instant grading and a per-question timer, timed sections with official counts and limits, flashcards and meaning quizzes with spaced repetition, and a progress page with weak-spot breakdowns by content area and vocabulary tier. Progress is kept in the browser and can sync across devices with a private sync code (`api/sync.js`, backed by a private Vercel Blob store via `BLOB_READ_WRITE_TOKEN`).

## Editing content

- Quant patterns: `tools/quant_*.js` → `npm run build`
- Vocabulary, sentence frames and synonym groups: `content/vocab_*.txt`
- Multi-blank Text Completion: `content/tc_multi.txt`
- Reading passages: `content/rc*.txt`

`npm run build` regenerates `site/data/*.json`. `npm run serve` serves the site locally.

## Deploy

Vercel serves `site/` as static output and `api/sync.js` as a function (see `vercel.json`). Pushes to the production branch deploy automatically.
