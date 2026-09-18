import { create } from 'zustand';
import { ZONES as SEED_ZONES } from '@/lib/mock/zones';
import { CCTV_LIST as SEED_CCTV } from '@/lib/mock/cctv';

/**
 * useSiteStore — 편집 가능한 현장 데이터의 단일 소스(구역 / CCTV).
 * 목데이터로 시드하며, 편집모드에서 추가/이동/수정/삭제한 결과를 여기 보관한다.
 * (세션 인메모리 — 새로고침 시 목데이터로 리셋. DB/영속화 없음)
 */
const clone = (arr) => arr.map((x) => ({ ...x }));

// 신규 id 생성용 카운터 (기존 최대치 이후부터)
const maxNum = (arr, prefix) =>
  arr.reduce((m, x) => {
    const n = parseInt(String(x.id).replace(prefix, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);

let zoneSeq = 1000; // 사용자 생성 구역은 Z-1001.. (목업 구역 id는 한글명이라 충돌 없음)
let camSeq = maxNum(SEED_CCTV, 'CAM-'); // 기존 CAM-NN 이후부터

export const useSiteStore = create((set, get) => ({
  zones: clone(SEED_ZONES),
  cctvs: clone(SEED_CCTV),

  // ── 구역 ─────────────────────────────
  addZone: (zone) => {
    const id = zone.id ?? `Z-${++zoneSeq}`;
    const z = { color: '#38bdf8', progress: 0, phase: '', ...zone, id };
    set((s) => ({ zones: [...s.zones, z] }));
    return id;
  },
  updateZone: (id, patch) => set((s) => ({ zones: s.zones.map((z) => (z.id === id ? { ...z, ...patch } : z)) })),
  removeZone: (id) =>
    set((s) => ({
      zones: s.zones.filter((z) => z.id !== id),
      // 해당 구역의 CCTV 도 함께 제거
      cctvs: s.cctvs.filter((c) => c.zone !== id),
    })),

  // ── CCTV ─────────────────────────────
  addCctv: (cam) => {
    const id = cam.id ?? `CAM-${String(++camSeq).padStart(2, '0')}`;
    const c = { type: 'fixed', status: 'online', hasSpeaker: false, streamUrl: '', loc: '', ...cam, id };
    set((s) => ({ cctvs: [...s.cctvs, c] }));
    return id;
  },
  updateCctv: (id, patch) => set((s) => ({ cctvs: s.cctvs.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
  moveCctv: (id, lng, lat) => set((s) => ({ cctvs: s.cctvs.map((c) => (c.id === id ? { ...c, lng, lat } : c)) })),
  removeCctv: (id) => set((s) => ({ cctvs: s.cctvs.filter((c) => c.id !== id) })),
}));
