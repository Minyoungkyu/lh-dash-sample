import { SITE } from '@/lib/mock/site';
import { useUIStore } from '@/stores/useUIStore';
import ZoneSwitcher from './ZoneSwitcher';
import AddressSearch from './AddressSearch';
import HudEvents from '@/sections/Hud/HudEvents';
import HudSmartBand from '@/sections/Hud/HudSmartBand';
import HudWeather from '@/sections/Hud/HudWeather';
import EditControls from '@/sections/Edit/EditControls';
import ZoneEditPanel from '@/sections/Edit/ZoneEditPanel';
import EditZoneList from '@/sections/Edit/EditZoneList';

/**
 * MapPanel — 지도 "프레임/크롬"만 담당 (실제 지도는 MapLayer 가 스케일 밖에서 렌더).
 *  - #map-slot: 지도가 겹쳐질 투명 자리표시자 (MapLayer 가 추적)
 *  - 편집모드에선 HUD/구역스위처를 숨기고 편집 툴바만 노출(일반 상호작용 잠금)
 */
export default function MapPanel() {
  const editMode = useUIStore((s) => s.editMode);
  return (
    <div
      className="relative h-full w-full"
      style={{ borderRadius: 22, border: editMode ? '2px solid #38bdf8' : '1px solid var(--line-cyan)', pointerEvents: 'none' }}
    >
      {/* 지도 자리표시자 (투명) — MapLayer 가 추적 */}
      <div id="map-slot" style={{ position: 'absolute', inset: 0, borderRadius: 22 }} />

      {/* 타이틀 (편집모드에선 숨김 — 툴바가 그 자리) */}
      {!editMode && (
        <div className="absolute z-[500] flex items-center" style={{ top: 20, left: 24, gap: 12, pointerEvents: 'auto' }}>
          <div className="flex items-center panel" style={{ gap: 12, padding: '12px 20px', borderRadius: 14, width: 500 }}>
            <span className="font-black text-cyan-300" style={{ fontSize: 24, letterSpacing: '0.02em' }}>현장 관제 지도</span>
            <span className="text-slate-400 font-bold" style={{ fontSize: 17 }}>{SITE.name}</span>
          </div>
        </div>
      )}

      {/* 주소 검색 → 지도 포커스 (편집/일반 공통) */}
      <AddressSearch />

      {/* 편집 컨트롤 (토글/툴바) + 공구 목록 + 구역 편집 패널 */}
      <EditControls />
      {editMode && <EditZoneList />}
      {editMode && <ZoneEditPanel />}

      {/* 일반 모드 UI (편집 중엔 잠금 = 숨김) */}
      {!editMode && (
        <>
          <ZoneSwitcher />
          <HudEvents />
          <HudSmartBand />
          <HudWeather />
        </>
      )}
    </div>
  );
}
