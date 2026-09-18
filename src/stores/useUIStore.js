import { create } from 'zustand';
import { EMERGENCIES } from '@/lib/mock/emergency';
import { useSiteStore } from '@/stores/useSiteStore';

/**
 * 전역 UI 상태 — 팝업/모달 오픈 상태, 선택 대상, 토스트.
 * (목업이므로 서버 상태 없음. 순수 화면 상태만 관리)
 */
let toastSeq = 0;
let focusSeq = 0;

// 전역 비상/방송 트리거 시 공통 "기본 지도 상태" 리셋 — 드로어·4분할·타 팝업 전부 닫음.
// 각 트리거는 이 위에 자기 팝업만 얹는다.
const BASE_RESET = {
  leftDock: null,
  dock: null,
  splitView: false,
  cellPopups: {},
  activeZone: null,
  selectedCctv: null,
  selectedEquip: null,
  emergencyAlert: null,
  feelsLikeOpen: false,
  broadcastOpen: false,
  sosWorker: null,
};

export const useUIStore = create((set, get) => ({
  // ── 선택된 대상 / 열림 상태 ─────────────────────────────
  selectedCctv: null, // CCTV 재생 팝업 (#2,#3)
  selectedEquip: null, // 중장비 팝업 (#7)
  sosWorker: null, // SOS 경보 팝업 (#6)
  broadcastOpen: false, // 전체 일괄방송 모달 (#4)
  feelsLikeOpen: false, // 체감온도계 상세 (#8)

  // 우측 접이식 드로어 (기본 접힘) — 한 번에 하나만 열림
  dock: null, // null | 'smartband' | 'weather'
  toggleDock: (which) => set((s) => ({ dock: s.dock === which ? null : which })),
  closeDock: () => set({ dock: null }),

  // 좌측 접이식 드로어 — 현장 현황 확장 뷰
  leftDock: null, // null | 'summary'
  toggleLeftDock: (which) => set((s) => ({ leftDock: s.leftDock === which ? null : which })),
  closeLeftDock: () => set({ leftDock: null }),

  // 좌측 '현장 현황' 요약 카테고리 (탭 전환) — 'progress' | 'equip' | 'cctv'
  summaryCat: 'progress',
  setSummaryCat: (c) => set({ summaryCat: c }),

  // ── 편집모드 (구역/CCTV 편집) ─────────────────────────
  editMode: false,
  editTool: null, // null | 'draw-zone' | 'place-cctv'
  // 진입 시 드로어·팝업 등 일반 상호작용을 닫고 잠근다. 해제 시 도구 초기화.
  toggleEditMode: () => set((s) => (s.editMode ? { editMode: false, editTool: null, draftZone: null, cctvForm: null, zoneEdit: null } : { ...BASE_RESET, editMode: true, editTool: null, draftZone: null, cctvForm: null, zoneEdit: null })),
  setEditTool: (t) => set((s) => ({ editTool: s.editTool === t ? null : t, zoneEdit: null })),

  // ── 편집: 구역 그리기 드래프트 ─────────────────────────
  draftZone: null, // { name, color, points: [[lat,lng]...] }
  startDrawZone: (name, color) => set({ draftZone: { name: name || '새 구역', color: color || '#38bdf8', points: [] }, editTool: 'draw-zone', zoneEdit: null }),
  addDraftPoint: (lat, lng) => set((s) => (s.draftZone ? { draftZone: { ...s.draftZone, points: [...s.draftZone.points, [lat, lng]] } } : {})),
  undoDraftPoint: () => set((s) => (s.draftZone ? { draftZone: { ...s.draftZone, points: s.draftZone.points.slice(0, -1) } } : {})),
  cancelDraftZone: () => set({ draftZone: null, editTool: null }),
  finishDraftZone: () => {
    const d = get().draftZone;
    if (!d || d.points.length < 3) return;
    const lats = d.points.map((p) => p[0]);
    const lngs = d.points.map((p) => p[1]);
    const center = [lats.reduce((a, b) => a + b, 0) / lats.length, lngs.reduce((a, b) => a + b, 0) / lngs.length];
    useSiteStore.getState().addZone({ name: d.name, color: d.color, polygon: d.points, center, phase: '신규 구역', progress: 0 });
    set({ draftZone: null, editTool: null });
  },

  // ── 편집: CCTV 배치/수정 폼 ─────────────────────────
  cctvForm: null, // { mode:'create'|'edit', id?, lat, lng, name, loc, zone, type, status, hasSpeaker, streamUrl }
  openCctvForm: (form) => set({ cctvForm: form, editTool: null }),
  updateCctvForm: (patch) => set((s) => ({ cctvForm: s.cctvForm ? { ...s.cctvForm, ...patch } : null })),
  closeCctvForm: () => set({ cctvForm: null }),
  saveCctvForm: () => {
    const f = get().cctvForm;
    if (!f) return;
    const data = {
      name: f.name || 'CCTV', loc: f.loc || '', zone: f.zone || '', type: f.type || 'fixed',
      status: f.status || 'online', hasSpeaker: !!f.hasSpeaker, streamUrl: f.streamUrl || '', lat: f.lat, lng: f.lng,
    };
    const site = useSiteStore.getState();
    if (f.mode === 'edit' && f.id) site.updateCctv(f.id, data);
    else site.addCctv(data);
    set({ cctvForm: null });
  },
  deleteCctv: (id) => { useSiteStore.getState().removeCctv(id); set({ cctvForm: null }); },

  // ── 편집: 구역 선택(수정/삭제) ─────────────────────────
  zoneEdit: null, // { id }
  selectZoneEdit: (id) => set({ zoneEdit: { id } }),
  closeZoneEdit: () => set({ zoneEdit: null }),

  // 지도 구역 스위처 (null = 전체)
  activeZone: null, // null | 'A공구' | ...
  // zoneNonce: 같은 공구를 다시 눌러도 매번 재확대되도록 하는 트리거
  zoneNonce: 0,
  setActiveZone: (id) => set((s) => ({ activeZone: id, zoneNonce: s.zoneNonce + 1 })),

  // 4분할 뷰 (라이브 멀티맵, 지연생성)
  splitView: false,
  toggleSplitView: () => set((s) => ({ splitView: !s.splitView, cellPopups: {} })),
  splitPage: 0,
  setSplitPage: (p) => set({ splitPage: p }),

  // 4분할: 칸(공구)별 독립 팝업 — zoneId -> { kind:'cctv'|'equip', item }
  cellPopups: {},
  openCellPopup: (zoneId, kind, item) => set((s) => ({ cellPopups: { ...s.cellPopups, [zoneId]: { kind, item } } })),
  closeCellPopup: (zoneId) => set((s) => {
    const next = { ...s.cellPopups };
    delete next[zoneId];
    return { cellPopups: next };
  }),

  // 지도 베이스맵 (지도는 스케일 밖 별도 레이어라 상태를 스토어로 공유)
  basemap: 'hybrid', // 'base' | 'satellite' | 'hybrid'
  setBasemap: (v) => set({ basemap: v }),

  openCctv: (cam) => set({ selectedCctv: cam }),
  closeCctv: () => set({ selectedCctv: null, emergencyAlert: null }),

  // ── CCTV 자동감지 비상상황 (시연) ─────────────────────────
  // emergencyAlert: { type, label, sub, accent, icon, camId } | null
  emergencyAlert: null,
  // camFocus: 지도(MapLayer)가 flyTo 로 따라갈 대상 { lng, lat, nonce }
  camFocus: null,
  // 비상 트리거: 드로어/4분할/타 팝업 전부 닫고 → 기본 지도 + 해당 CCTV 로 확대·팝업(비상 상태)
  triggerEmergency: (type) => {
    const cfg = EMERGENCIES[type];
    if (!cfg) return;
    const cam = useSiteStore.getState().cctvs.find((c) => c.id === cfg.camId);
    if (!cam) return;
    set({
      ...BASE_RESET, // 기본 지도 상태로 강제 복귀
      // 해당 CCTV 선택 + 비상 상태 + 지도 포커스
      selectedCctv: cam,
      emergencyAlert: { type, label: cfg.label, sub: cfg.sub, accent: cfg.accent, icon: cfg.icon, camId: cam.id, presets: cfg.presets },
      camFocus: { lng: cam.lng, lat: cam.lat, nonce: ++focusSeq },
    });
  },

  openEquip: (eq) => set({ selectedEquip: eq }),
  closeEquip: () => set({ selectedEquip: null }),

  // 목록(드로어)에서 항목 클릭 → 지도를 해당 핀으로 이동 (camFocus 재사용)
  flyToPin: (lng, lat) => set({ camFocus: { lng, lat, nonce: ++focusSeq } }),

  // SOS·전체방송도 비상 트리거처럼 기본 상태로 리셋 후 발생
  openSos: (worker) => set({ ...BASE_RESET, sosWorker: worker }),
  closeSos: () => set({ sosWorker: null }),

  openBroadcast: () => set({ ...BASE_RESET, broadcastOpen: true }),
  closeBroadcast: () => set({ broadcastOpen: false }),

  openFeelsLike: () => set({ feelsLikeOpen: true }),
  closeFeelsLike: () => set({ feelsLikeOpen: false }),

  // ── 토스트 (가벼운 시각 피드백) ─────────────────────────
  toasts: [],
  pushToast: (message, type = 'success') => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    // 자동 소멸
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2600);
    return id;
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
