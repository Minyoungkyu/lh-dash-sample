import { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Expand } from 'lucide-react';
import { SHOW_ZOOM_CONTROL } from '@/lib/uiConfig';

/**
 * FourKStage — 3840×2160 고정 캔버스 뷰어.
 *
 * 지도(WebGL)는 이 스테이지 밖의 MapLayer 가 그리고 #map-slot 위치를 따라오므로,
 * 스테이지를 transform 으로 축소/확대해도 지도가 함께 따라온다.
 *  - 기본: 뷰포트 맞춤(fit)
 *  - 확대/축소 버튼 + Ctrl+휠, 확대 시 스크롤로 이동(팬)
 *  - 스테이지는 pointer-events:none(확대 안 했을 때) → 지도 조작이 뒤 레이어로 통과.
 *    확대(zoom>1) 시엔 스크롤을 위해 auto (지도 직접조작은 축소상태에서).
 */
export const STAGE_W = 3840;
export const STAGE_H = 2160;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function FourKStage({ children }) {
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [zoom, setZoom] = useState(1); // 1 = 화면 맞춤(fit)

  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fit = Math.min(vp.w / STAGE_W, vp.h / STAGE_H);
  const scale = fit * zoom;
  const innerW = STAGE_W * scale;
  const innerH = STAGE_H * scale;
  const pct = Math.round(scale * 100);

  const zoomBy = useCallback((f) => setZoom((z) => clamp(z * f, 1, 5)), []);

  // Ctrl + 휠 → 확대/축소 (window 리스너 — pe 와 무관하게 동작)
  useEffect(() => {
    const onWheel = (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom((z) => clamp(z * (e.deltaY < 0 ? 1.12 : 1 / 1.12), 1, 5));
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        // fit(zoom=1)에선 팬할 것이 없으니 hidden (닫힌 드로어가 만드는 팬텀 스크롤 방지),
        // 확대(zoom>1) 시에만 auto 로 스크롤 팬 허용
        overflow: zoom > 1 ? 'auto' : 'hidden',
        // flex + margin:auto 로만 중앙정렬 → 콘텐츠가 뷰포트보다 커지면 margin 이 0이 되어
        // 좌/상단까지 스크롤로 도달 가능 (justify/align center 를 쓰면 좌·상단이 잘려 스크롤 불가)
        display: 'flex',
        position: 'relative',
        zIndex: 1,
        pointerEvents: zoom > 1 ? 'auto' : 'none', // 확대 시에만 스크롤 위해 auto
      }}
      className="thin-scroll"
    >
      <div style={{ width: innerW, height: innerH, margin: 'auto', flex: 'none' }}>
        <div style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
          {children}
        </div>
      </div>

      {/* 줌 컨트롤 (뷰포트 고정) — 실운영 숨김 */}
      {SHOW_ZOOM_CONTROL && (
      <div className="fixed flex items-center panel" style={{ right: 20, bottom: 20, gap: 4, padding: 8, borderRadius: 14, zIndex: 9500, pointerEvents: 'auto' }}>
        <ZoomBtn onClick={() => zoomBy(1 / 1.25)} title="축소" disabled={zoom <= 1}>
          <ZoomOut style={{ width: 22, height: 22 }} />
        </ZoomBtn>
        <span className="font-black text-white text-center" style={{ fontSize: 17, width: 62, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
        <ZoomBtn onClick={() => zoomBy(1.25)} title="확대" disabled={zoom >= 5}>
          <ZoomIn style={{ width: 22, height: 22 }} />
        </ZoomBtn>
        <div style={{ width: 1, height: 26, background: 'rgba(148,163,184,0.25)', margin: '0 4px' }} />
        <ZoomBtn onClick={() => setZoom(1)} title="화면 맞춤">
          <Maximize2 style={{ width: 20, height: 20 }} />
        </ZoomBtn>
        <ZoomBtn onClick={() => setZoom(1 / fit)} title="실제 크기(100%)">
          <Expand style={{ width: 20, height: 20 }} />
        </ZoomBtn>
      </div>
      )}
    </div>
  );
}

function ZoomBtn({ onClick, title, disabled, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="flex items-center justify-center text-white transition-colors disabled:opacity-30"
      style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.3)', cursor: disabled ? 'default' : 'pointer' }}
    >
      {children}
    </button>
  );
}
