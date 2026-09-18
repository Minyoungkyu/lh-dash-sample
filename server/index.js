import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { collectWeather } from './weather.js';

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

// ── (2단계) /api/zones, /api/cctv CRUD → lh-dash ──────

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
app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}  (weather → 동탄)`));
