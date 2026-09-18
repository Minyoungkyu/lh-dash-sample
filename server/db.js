// lh-dash 전용 DB 접근 (PostgreSQL). 규칙: 오직 lh-dash 만 접속/쿼리.
import pg from 'pg';
import { ZONES } from '../src/lib/mock/zones.js';
import { CCTV_LIST } from '../src/lib/mock/cctv.js';

const pool = new pg.Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE, // = lh-dash (다른 DB 접속 금지)
  max: 5,
});

export const q = (text, params) => pool.query(text, params);

// ── 행 ↔ 프론트 객체 매핑 ──
const rowToZone = (r) => ({
  id: r.id, name: r.name, phase: r.phase, progress: r.progress, color: r.color,
  lead: r.lead, manager: r.manager, phone: r.phone, period: r.period,
  address: r.address, todayWork: r.today_work, center: r.center, polygon: r.polygon,
});
const rowToCctv = (r) => ({
  id: r.id, name: r.name, loc: r.loc, zone: r.zone, type: r.type, status: r.status,
  hasSpeaker: r.has_speaker, streamUrl: r.stream_url, lat: r.lat == null ? null : Number(r.lat), lng: r.lng == null ? null : Number(r.lng),
});

// obj → {cols, vals} (insert/upsert 용)
const ZONE_COLS = [
  ['id', (z) => z.id], ['name', (z) => z.name], ['phase', (z) => z.phase ?? null], ['progress', (z) => z.progress ?? 0],
  ['color', (z) => z.color ?? '#38bdf8'], ['lead', (z) => z.lead ?? null], ['manager', (z) => z.manager ?? null],
  ['phone', (z) => z.phone ?? null], ['period', (z) => z.period ?? null], ['address', (z) => z.address ?? null],
  ['today_work', (z) => z.todayWork ?? null], ['center', (z) => JSON.stringify(z.center ?? null)], ['polygon', (z) => JSON.stringify(z.polygon ?? [])],
];
const CCTV_COLS = [
  ['id', (c) => c.id], ['name', (c) => c.name], ['loc', (c) => c.loc ?? null], ['zone', (c) => c.zone ?? null],
  ['type', (c) => c.type ?? 'fixed'], ['status', (c) => c.status ?? 'online'], ['has_speaker', (c) => !!c.hasSpeaker],
  ['stream_url', (c) => c.streamUrl ?? null], ['lat', (c) => c.lat ?? null], ['lng', (c) => c.lng ?? null],
];

function buildUpsert(table, cols, obj) {
  const names = cols.map(([n]) => n);
  const vals = cols.map(([, f]) => f(obj));
  const ph = names.map((_, i) => `$${i + 1}`);
  const jsonbCast = (n) => (n === 'center' || n === 'polygon') ? '::jsonb' : '';
  const valuesSql = names.map((n, i) => `$${i + 1}${jsonbCast(n)}`);
  const updates = names.filter((n) => n !== 'id').map((n) => `${n} = EXCLUDED.${n}`);
  const sql = `INSERT INTO ${table} (${names.join(', ')}) VALUES (${valuesSql.join(', ')})
               ON CONFLICT (id) DO UPDATE SET ${updates.join(', ')} RETURNING *`;
  return { sql, vals, ph };
}

// ── 스키마 + 시드 ──
export async function init() {
  await q(`CREATE TABLE IF NOT EXISTS zones (
    id text PRIMARY KEY, name text NOT NULL, phase text, progress int DEFAULT 0, color text,
    lead text, manager text, phone text, period text, address text, today_work text,
    center jsonb, polygon jsonb, updated_at timestamptz DEFAULT now())`);
  await q(`CREATE TABLE IF NOT EXISTS cctvs (
    id text PRIMARY KEY, name text NOT NULL, loc text, zone text, type text, status text,
    has_speaker boolean DEFAULT false, stream_url text, lat double precision, lng double precision,
    updated_at timestamptz DEFAULT now())`);

  const zc = await q('SELECT COUNT(*)::int AS n FROM zones');
  if (zc.rows[0].n === 0) {
    for (const z of ZONES) await insertZone(z);
    console.log(`[db] seeded ${ZONES.length} zones`);
  }
  const cc = await q('SELECT COUNT(*)::int AS n FROM cctvs');
  if (cc.rows[0].n === 0) {
    for (const c of CCTV_LIST) await insertCctv(c);
    console.log(`[db] seeded ${CCTV_LIST.length} cctvs`);
  }
}

// ── 구역 ──
export async function listZones() {
  const r = await q('SELECT * FROM zones ORDER BY id');
  return r.rows.map(rowToZone);
}
export async function insertZone(z) {
  const { sql, vals } = buildUpsert('zones', ZONE_COLS, z);
  const r = await q(sql, vals);
  return rowToZone(r.rows[0]);
}
export async function updateZone(id, patch) {
  const map = { name: 'name', phase: 'phase', progress: 'progress', color: 'color', lead: 'lead', manager: 'manager', phone: 'phone', period: 'period', address: 'address', todayWork: 'today_work', center: 'center', polygon: 'polygon' };
  const sets = [], vals = [];
  let i = 1;
  for (const [k, col] of Object.entries(map)) {
    if (k in patch) {
      const cast = (col === 'center' || col === 'polygon') ? '::jsonb' : '';
      sets.push(`${col} = $${i}${cast}`);
      vals.push((col === 'center' || col === 'polygon') ? JSON.stringify(patch[k]) : patch[k]);
      i++;
    }
  }
  if (!sets.length) return null;
  sets.push('updated_at = now()');
  vals.push(id);
  const r = await q(`UPDATE zones SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
  return r.rows[0] ? rowToZone(r.rows[0]) : null;
}
export async function deleteZone(id) {
  await q('DELETE FROM cctvs WHERE zone = $1', [id]);
  await q('DELETE FROM zones WHERE id = $1', [id]);
}

// ── CCTV ──
export async function listCctvs() {
  const r = await q('SELECT * FROM cctvs ORDER BY id');
  return r.rows.map(rowToCctv);
}
export async function insertCctv(c) {
  const { sql, vals } = buildUpsert('cctvs', CCTV_COLS, c);
  const r = await q(sql, vals);
  return rowToCctv(r.rows[0]);
}
export async function updateCctv(id, patch) {
  const map = { name: 'name', loc: 'loc', zone: 'zone', type: 'type', status: 'status', hasSpeaker: 'has_speaker', streamUrl: 'stream_url', lat: 'lat', lng: 'lng' };
  const sets = [], vals = [];
  let i = 1;
  for (const [k, col] of Object.entries(map)) {
    if (k in patch) { sets.push(`${col} = $${i}`); vals.push(patch[k]); i++; }
  }
  if (!sets.length) return null;
  sets.push('updated_at = now()');
  vals.push(id);
  const r = await q(`UPDATE cctvs SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals);
  return r.rows[0] ? rowToCctv(r.rows[0]) : null;
}
export async function deleteCctv(id) {
  await q('DELETE FROM cctvs WHERE id = $1', [id]);
}
