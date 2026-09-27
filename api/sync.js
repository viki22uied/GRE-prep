// Cross-device progress sync.
// A device identifies its progress by a private sync code; the blob path is a hash of that code,
// stored in a private Vercel Blob store (BLOB_READ_WRITE_TOKEN is set on the project).
//   GET  /api/sync?code=...            -> { attempts, vocab }
//   POST /api/sync?code=...  {attempts, vocab}  -> merges and returns { attempts, vocab }
const crypto = require('crypto');
const { put, get } = require('@vercel/blob');

const MAX_ATTEMPTS = 50000;
const attKey = (a) => a.q + '@' + a.at;

async function load(path) {
  try {
    const r = await get(path, { access: 'private', useCache: false });
    if (!r || !r.stream) return { attempts: [], vocab: {} };
    const data = JSON.parse(await new Response(r.stream).text());
    return { attempts: Array.isArray(data.attempts) ? data.attempts : [], vocab: data.vocab && typeof data.vocab === 'object' ? data.vocab : {} };
  } catch (e) {
    if (e && (e.name === 'BlobNotFoundError' || /not.?found/i.test(e.message || ''))) return { attempts: [], vocab: {} };
    throw e;
  }
}

function merge(cur, inc) {
  const have = new Set(cur.attempts.map(attKey));
  for (const a of inc.attempts || []) {
    if (a && typeof a.q === 'string' && typeof a.at === 'number' && !have.has(attKey(a))) { cur.attempts.push(a); have.add(attKey(a)); }
  }
  cur.attempts.sort((x, y) => x.at - y.at);
  if (cur.attempts.length > MAX_ATTEMPTS) cur.attempts = cur.attempts.slice(-MAX_ATTEMPTS);
  for (const [w, r] of Object.entries(inc.vocab || {})) {
    const l = cur.vocab[w];
    if (r && (!l || (r.last || 0) > (l.last || 0))) cur.vocab[w] = r;
  }
  return cur;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const code = String((req.query && req.query.code) || '').toLowerCase();
  if (!/^[a-z0-9-]{12,64}$/.test(code)) return res.status(400).json({ error: 'A sync code has 12–64 letters, digits or dashes.' });
  const path = 'sync/' + crypto.createHash('sha256').update('gre-daily:' + code).digest('hex') + '.json';
  try {
    if (req.method === 'GET') return res.status(200).json(await load(path));
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body || '{}');
      const merged = merge(await load(path), body || {});
      await put(path, JSON.stringify(merged), { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json', cacheControlMaxAge: 60 });
      return res.status(200).json(merged);
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Use GET or POST.' });
  } catch (e) {
    return res.status(500).json({ error: 'Sync storage is unavailable right now. Progress is still saved on this device.' });
  }
};
