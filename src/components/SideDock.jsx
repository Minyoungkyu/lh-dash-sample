import { useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import WeatherPanel from '@/sections/WeatherPanel';
import SmartBandPanel from '@/sections/SmartBandPanel';

/**
 * SideDock — 우측 상세 드로어 (기상·환경 / 스마트밴드 전체명단).
 * 상시표시 HUD(HudSmartBand / HudWeather) 헤더의 '상세' 버튼으로 열림. 기본 접힘.
 * 바깥 클릭 시 닫힘.
 */
const DRAWER_W = 1000;

export default function SideDock() {
  const dock = useUIStore((s) => s.dock);
  const closeDock = useUIStore((s) => s.closeDock);
  const open = dock !== null;
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) closeDock();
    };
    const id = setTimeout(() => document.addEventListener('mousedown', onDown, true), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', onDown, true); };
  }, [open, closeDock]);

  return (
    <div
      ref={rootRef}
      className="absolute"
      style={{
        top: 184, bottom: 24, right: 24, width: DRAWER_W,
        transform: open ? 'translateX(0)' : `translateX(${DRAWER_W + 48}px)`,
        transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        zIndex: 4000, pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div className="relative" style={{ width: '100%', height: '100%' }}>
        {open && (
          <button
            onClick={closeDock}
            title="접기"
            className="absolute flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
            style={{ top: 20, right: 20, width: 40, height: 40, borderRadius: 10, zIndex: 10 }}
          >
            <ChevronRight style={{ width: 24, height: 24 }} />
          </button>
        )}
        <div style={{ height: '100%', display: dock === 'weather' ? 'block' : 'none' }}>
          <WeatherPanel />
        </div>
        <div style={{ height: '100%', display: dock === 'smartband' ? 'block' : 'none' }}>
          <SmartBandPanel />
        </div>
      </div>
    </div>
  );
}
