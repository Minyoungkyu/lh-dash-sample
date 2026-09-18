import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { collectWeather } from './weather.js';
import * as db from './db.js';

const app = express();
app.use(express.json());

// ── 날씨(동탄) — 60초 캐시 ──────────────────────────
let cache = { data: null, at: 0 };
const TTL = 60_000;
app.get('/api/weather', async (req, res) => {
  try {
    if (!cache.data || Date.now() - cache.at > TTL) {
      cache = { data: await collectWeather(), at: Date.now() };
    }
    res.json(cache.data);
  } catch (e) {
    res.status(502).json({ error: String(e?.message || e) });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// ── 편집: 구역/CCTV CRUD → lh-dash ──────────────────
const wrap = (fn) => async (req, res) => {
  try { res.json(await fn(req)); }
  catch (e) { console.error(e); res.status(500).json({ error: String(e?.message || e) }); }
};

app.get('/api/zones', wrap(() => db.listZones()));
app.post('/api/zones', wrap((req) => db.insertZone(req.body)));
app.patch('/api/zones/:id', wrap((req) => db.updateZone(req.params.id, req.body)));
app.delete('/api/zones/:id', wrap(async (req) => { await db.deleteZone(req.params.id); return { ok: true }; }));

app.get('/api/cctv', wrap(() => db.listCctvs()));
app.post('/api/cctv', wrap((req) => db.insertCctv(req.body)));
app.patch('/api/cctv/:id', wrap((req) => db.updateCctv(req.params.id, req.body)));
app.delete('/api/cctv/:id', wrap(async (req) => { await db.deleteCctv(req.params.id); return { ok: true }; }));

// ── 운영: 빌드된 프론트(dist) 서빙 ──────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '..', 'dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) return res.sendFile(path.join(dist, 'index.html'));
    next();
  });
}

const PORT = process.env.PORT || 3001;
db.init()
  .then(() => app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}  (weather → 동탄, DB → lh-dash)`)))
  .catch((e) => { console.error('[server] DB init failed:', e); process.exit(1); });
