import FourKStage from '@/components/FourKStage';
import MapLayer from '@/components/MapLayer';
import Header from '@/sections/Header';
import MapPanel from '@/sections/MapPanel';
import SplitView from '@/components/SplitView';
import LeftDock from '@/components/LeftDock';
import SideDock from '@/components/SideDock';
import FeelsLikeModal from '@/sections/WeatherPanel/FeelsLikeModal';
import CctvPopup from '@/components/overlays/CctvPopup';
import CctvEditModal from '@/components/overlays/CctvEditModal';
import EquipPopup from '@/components/overlays/EquipPopup';
import GlobalBroadcastModal from '@/components/overlays/GlobalBroadcastModal';
import SosAlertPopup from '@/components/overlays/SosAlertPopup';
import ToastHost from '@/components/ToastHost';

/**
 * App — 4K UHD(3840×2160) 고정 캔버스 관제 대시보드.
 *
 * MapLayer(실제 지도)는 스케일 밖 fixed 레이어로 뒤에 깔고, 그 위에 4K 스테이지를
 * transform 으로 축소해 얹는다. 스테이지의 지도 자리(#map-slot)는 투명 → 뒤 지도가 비침.
 * 스테이지는 pointer-events:none, 조작 UI만 auto → 지도 영역 조작은 뒤 레이어로 통과.
 */
export default function App() {
  return (
    <>
      {/* 뒤: 실제 지도 (스케일 밖) */}
      <MapLayer />
      {/* 4분할 뷰 (스케일 밖, on 일 때만 지도 생성) */}
      <SplitView />

      {/* 앞: 4K 스테이지 (축소) */}
      <FourKStage>
        <div className="relative overflow-hidden" style={{ width: '100%', height: '100%', padding: 24, pointerEvents: 'none' }}>
          <div className="flex flex-col h-full" style={{ gap: 20 }}>
            {/* 헤더는 팝업 backdrop(z6000) 위에 유지 → 비상 트리거 버튼 항상 클릭 가능 */}
            <div style={{ height: 140, flex: '0 0 auto', pointerEvents: 'auto', position: 'relative', zIndex: 6200 }}>
              <Header />
            </div>
            {/* 지도 풀폭 (좌/우 드로어가 위에 겹침). pointer-events 통과(뒤 MapLayer 조작), 크롬만 auto */}
            <div className="flex-1 min-h-0">
              <MapPanel />
            </div>
          </div>

          <LeftDock />
          <SideDock />

          {/* 오버레이 — 래퍼 auto (자식 backdrop 이 상속). 래퍼 자체는 0크기라 지도 안 가림 */}
          <div style={{ pointerEvents: 'auto' }}>
            <CctvPopup />
            <CctvEditModal />
            <EquipPopup />
            <GlobalBroadcastModal />
            <SosAlertPopup />
            <FeelsLikeModal />
            <ToastHost />
          </div>
        </div>
      </FourKStage>
    </>
  );
}
