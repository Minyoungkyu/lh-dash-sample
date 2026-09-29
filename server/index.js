import 'dotenv/config';
import express from 'express';
import http from 'node:http';
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

// ── 주소 → 좌표 (VWorld geocoder; 카카오 대신, 지도타일과 같은 키 재사용) ──
const VWORLD_KEY = process.env.VWORLD_KEY || '37A0AF9A-8713-33A2-9CBC-636D6ABE0012';
async function vworldGeocode(address, type) {
  const p = new URLSearchParams({ service: 'address', request: 'getCoord', version: '2.0', crs: 'epsg:4326', type, address, format: 'json', key: VWORLD_KEY });
  const r = await fetch(`https://api.vworld.kr/req/address?${p.toString()}`);
  const j = await r.json();
  return j?.response ?? null;
}
app.get('/api/geocode', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'q_required' });
  try {
    let r = await vworldGeocode(q, 'ROAD');                       // 도로명 우선
    if (r?.status !== 'OK' || !r?.result?.point) r = await vworldGeocode(q, 'PARCEL'); // 지번 폴백
    if (r?.status === 'OK' && r?.result?.point) {
      return res.json({ lat: parseFloat(r.result.point.y), lng: parseFloat(r.result.point.x), address: r.refined?.text || q });
    }
    return res.status(404).json({ error: 'not_found' });
  } catch (e) {
    res.status(502).json({ error: String(e?.message || e) });
  }
});

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

// ── CCTV 스트림 장비 워밍업 하트비트 ──────────────────
// iptime 등 장비 라우터는 유휴(~90초) 후 첫 연결이 ~5초 느림(콜드패스).
// 서버가 주기적으로 각 스트림 장비의 m3u8을 가볍게 조회해 연결 경로를 warm 유지
// → 사용자가 CCTV를 열 때 항상 빠르게 로드. (m3u8은 수백 바이트라 부하 무시 가능)
async function warmStreams() {
  let cams = [];
  try { cams = await db.listCctvs(); } catch { return; }
  // 채널(스트림 URL)마다 장비에서 개별 콜드스타트됨 → 채널별로 워밍(호스트당 1개로는 부족).
  // 요청은 m3u8(수백 바이트)만. 세그먼트(.ts)는 안 건드림 → URL 수만큼이라도 대역폭 무시 수준.
  const urls = new Set();
  for (const c of cams) {
    if (!c.streamUrl) continue;
    try {
      const u = new URL(c.streamUrl);
      urls.add(`http://${u.host}${u.pathname}${u.search}`);
    } catch { /* 잘못된 URL 무시 */ }
  }
  for (const url of urls) {
    const req = http.get(url, { timeout: 9000 }, (res) => res.resume());
    req.on('error', () => {});          // 장비 다운/주소오류: 조용히 무시(재시도 폭주 없음)
    req.on('timeout', () => req.destroy());
  }
}

const PORT = process.env.PORT || 3001;
async function start() {
  for (let i = 0; i < 20; i++) {
    try {
      await db.init();
      app.listen(PORT, () => console.log(`[server] listening on :${PORT}  (weather → 동탄, DB → lh-dash)`));
      warmStreams();                          // 기동 즉시 1회
      setInterval(warmStreams, 30_000);       // 이후 30초마다 (장비 유휴 90초 전에 갱신)
      return;
    } catch (e) {
      console.error(`[server] DB init retry ${i + 1}: ${e?.message || e}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error('[server] DB init failed after retries');
  process.exit(1);
}
start();
