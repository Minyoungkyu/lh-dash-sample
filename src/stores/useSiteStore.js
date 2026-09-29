import { create } from 'zustand';
import { ZONES as SEED_ZONES } from '@/lib/mock/zones';
import { CCTV_LIST as SEED_CCTV } from '@/lib/mock/cctv';

/**
 * useSiteStore — 편집 가능한 현장 데이터(구역/CCTV) 단일 소스.
 * 서버(/api/zones·/api/cctv, lh-dash)에서 로드하고, 편집은 낙관적 업데이트 + 서버 동기화.
 * 서버 미기동 시 목업으로 폴백(이때 편집은 저장되지 않음).
 */
const clone = (a) => a.map((x) => ({ ...x }));
const maxNum = (arr, prefix) =>
  arr.reduce((m, x) => { const n = parseInt(String(x.id).replace(prefix, ''), 10); return Number.isFinite(n) && n > m ? n : m; }, 0);

let zoneSeq = 1000;
let camSeq = 32;

const api = {
  get: (p) => fetch(p).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
  post: (p, b) => fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).catch(() => {}),
  patch: (p, b) => fetch(p, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }).catch(() => {}),
  del: (p) => fetch(p, { method: 'DELETE' }).catch(() => {}),
};

export const useSiteStore = create((set) => ({
  zones: [],
  cctvs: [],
  loaded: false,

  // ── 구역 ──
  addZone: (zone) => {
    const id = zone.id ?? `Z-${++zoneSeq}`;
    const z = { color: '#38bdf8', progress: 0, phase: '', ...zone, id };
    set((s) => ({ zones: [...s.zones, z] }));
    api.post('/api/zones', z);
    return id;
  },
  updateZone: (id, patch) => { set((s) => ({ zones: s.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)) })); api.patch(`/api/zones/${id}`, patch); },
  removeZone: (id) => {
    set((s) => ({ zones: s.zones.filter((z) => z.id !== id), cctvs: s.cctvs.filter((c) => c.zone !== id) }));
    api.del(`/api/zones/${id}`);
  },

  // ── CCTV ──
  addCctv: (cam) => {
    const id = cam.id ?? `CAM-${String(++camSeq).padStart(2, '0')}`;
    const c = { type: 'fixed', status: 'online', hasSpeaker: false, streamUrl: '', loc: '', ...cam, id };
    set((s) => ({ cctvs: [...s.cctvs, c] }));
    api.post('/api/cctv', c);
    return id;
  },
  updateCctv: (id, patch) => { set((s) => ({ cctvs: s.cctvs.map((c) => (c.id === id ? { ...c, ...patch } : c)) })); api.patch(`/api/cctv/${id}`, patch); },
  moveCctv: (id, lng, lat) => { set((s) => ({ cctvs: s.cctvs.map((c) => (c.id === id ? { ...c, lng, lat } : c)) })); api.patch(`/api/cctv/${id}`, { lng, lat }); },
  removeCctv: (id) => { set((s) => ({ cctvs: s.cctvs.filter((c) => c.id !== id) })); api.del(`/api/cctv/${id}`); },

  // ── 초기 로드 (재기동 대비: 준비될 때까지 재시도 후 폴백) ──
  load: async () => {
    for (let i = 0; i < 12; i++) {
      try {
        const [zones, cctvs] = await Promise.all([api.get('/api/zones'), api.get('/api/cctv')]);
        zoneSeq = Math.max(1000, maxNum(zones, 'Z-'));
        camSeq = Math.max(maxNum(cctvs, 'CAM-'), 0);
        set({ zones, cctvs, loaded: true });
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
    // 서버 응답 없으면 목업으로 진행(편집 저장은 안 됨)
    zoneSeq = 1000;
    camSeq = maxNum(SEED_CCTV, 'CAM-');
    set({ zones: clone(SEED_ZONES), cctvs: clone(SEED_CCTV), loaded: true });
  },
}));

if (typeof window !== 'undefined') useSiteStore.getState().load();
