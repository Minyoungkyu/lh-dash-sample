import { SITE } from '@/lib/mock/site';
import ZoneSwitcher from './ZoneSwitcher';
import HudEvents from '@/sections/Hud/HudEvents';
import HudSmartBand from '@/sections/Hud/HudSmartBand';
import HudWeather from '@/sections/Hud/HudWeather';

/**
 * MapPanel — 지도 "프레임/크롬"만 담당 (실제 지도는 MapLayer 가 스케일 밖에서 렌더).
 *  - #map-slot: 지도가 겹쳐질 투명 자리표시자 (MapLayer 가 추적)
 *  - 베이스맵은 하이브리드 고정 (전환 UI 제거)
 */
export default function MapPanel() {
  return (
    <div
      className="relative h-full w-full"
      style={{ borderRadius: 22, border: '1px solid var(--line-cyan)', pointerEvents: 'none' }}
    >
      {/* 지도 자리표시자 (투명) — MapLayer 가 추적 */}
      <div id="map-slot" style={{ position: 'absolute', inset: 0, borderRadius: 22 }} />

      {/* 타이틀 */}
      <div className="absolute z-[500] flex items-center" style={{ top: 20, left: 24, gap: 12, pointerEvents: 'auto' }}>
        <div className="flex items-center panel" style={{ gap: 12, padding: '12px 20px', borderRadius: 14 }}>
          <span className="font-black text-cyan-300" style={{ fontSize: 22, letterSpacing: '0.02em' }}>현장 관제 지도</span>
          <span className="text-slate-400 font-bold" style={{ fontSize: 15 }}>{SITE.name}</span>
        </div>
      </div>

      <ZoneSwitcher />

      {/* 상시표시 HUD — 클릭 없이 상황을 한눈에 (드로어는 상세용으로 병행 유지) */}
      <HudEvents />
      <HudSmartBand />
      <HudWeather />
    </div>
  );
}
