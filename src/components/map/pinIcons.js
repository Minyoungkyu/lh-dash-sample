/**
 * 지도 마커 DOM 엘리먼트 생성기 (MapLibre GL 용).
 *
 * CCTV — 타입에 따라 핀 "형태"가 달라진다 (요구사항 #1):
 *   · 회전형(PTZ) → 원형 헤드 + 회전 표시 (⟳)
 *   · 고정형      → 사각 헤드 + 고정 카메라 글리프
 * 중장비(#7) — 무채색 다이아몬드 헤드 + 통일된 트럭 아이콘(종류/상태 무관 동일).
 */

const GLYPH = {
  rotating: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#04121a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 13a8 8 0 0 1 16 0"/><circle cx="12" cy="13" r="2.4" fill="#04121a" stroke="none"/>
    <path d="M6.5 6.5a8 8 0 0 1 11 0"/><path d="M17 4.5l.6 2.4-2.4.4"/></svg>`,
  fixed: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#04121a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="7" width="13" height="10" rx="1.5"/><path d="M16 10.5l5-2.5v8l-5-2.5"/></svg>`,
  // 이동형 — 차량(이동 설치) 아이콘
  mobile: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#04121a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 16h4V6H2v10h2"/><path d="M14 9h4l3 3v4h-2"/><circle cx="7" cy="17" r="1.6" fill="#04121a" stroke="none"/><circle cx="17" cy="17" r="1.6" fill="#04121a" stroke="none"/></svg>`,
};

// 태양광 전원 배지 (핀 우상단)
const SOLAR_BADGE = `<span style="position:absolute;top:-5px;right:-5px;width:15px;height:15px;border-radius:50%;background:#f59e0b;border:1.5px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.5);">
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>
</span>`;

// 중장비 통일 아이콘 (트럭). 종류/상태 상관없이 동일, 무채색 핀.
const EQUIP_GLYPH = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#04121a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 17h4V5H2v12h3"/><path d="M14 9h4l3 3v5h-2"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="1.6" fill="#04121a" stroke="none"/><circle cx="17.5" cy="17.5" r="1.6" fill="#04121a" stroke="none"/></svg>`;
const EQUIP_PIN_COLOR = '#cbd5e1'; // 무채색(라이트 슬레이트)

function pinHtml({ shape, color, inner, label, pulse, dim, badge = '' }) {
  const radius = shape === 'circle' ? '50%' : shape === 'diamond' ? '10px' : '8px';
  const rotate = shape === 'diamond' ? 'rotate(45deg)' : 'none';
  const counter = shape === 'diamond' ? 'rotate(-45deg)' : 'none';
  const ring = pulse
    ? `<span class="pulse-ring" style="position:absolute;inset:0;border-radius:${radius};background:${color};opacity:.5;"></span>`
    : '';
  return `
    <div class="pin-wrap" style="${dim ? 'opacity:.55;' : ''}">
      <div style="position:relative;width:24px;height:24px;">
        ${ring}
        <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;
             border-radius:${radius};transform:${rotate};
             background:linear-gradient(160deg, ${color}, ${color}cc);
             border:1.5px solid rgba(255,255,255,0.9);
             box-shadow:0 3px 9px rgba(0,0,0,.5), 0 0 8px ${color}88;">
          <div style="transform:${counter};display:flex;align-items:center;justify-content:center;">${inner}</div>
        </div>
        ${badge}
      </div>
      <div class="pin-label">${label}</div>
    </div>`;
}

function el(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d;
}

export function cctvEl(cam) {
  const online = cam.status === 'online';
  const color = online ? '#22d3ee' : '#64748b';
  const mobile = (cam.mount ?? 'fixed') === 'mobile';
  // 이동형=차량 글리프(사각) / 회전형=원 / 고정형카메라=사각
  const shape = mobile ? 'square' : cam.type === 'rotating' ? 'circle' : 'square';
  const glyph = mobile ? GLYPH.mobile : (GLYPH[cam.type] ?? GLYPH.fixed);
  const badge = (!mobile && cam.power === 'solar') ? SOLAR_BADGE : ''; // 태양광만 ☀ 배지
  return el(pinHtml({ shape, color, inner: glyph, label: cam.id, pulse: online, dim: !online, badge }));
}

export function equipEl(eq) {
  // 종류/상태 무관 통일 아이콘 + 무채색 (색 없음)
  return el(pinHtml({ shape: 'diamond', color: EQUIP_PIN_COLOR, inner: EQUIP_GLYPH, label: eq.name, pulse: false, dim: false }));
}

// 구역 라벨 마커
export function zoneLabelEl(zone, color) {
  const d = document.createElement('div');
  d.className = 'zone-label';
  d.style.cssText = `color:${color};border-color:${color}66;`;
  d.textContent = zone.name;
  return d;
}
