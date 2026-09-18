import { useEffect, useRef } from 'react';
import { Map as MapIcon, ChevronLeft, ChevronRight, Grid2x2 } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useSiteStore } from '@/stores/useSiteStore';
import MiniMap from './MiniMap';
import CctvPopup from '@/components/overlays/CctvPopup';
import EquipPopup from '@/components/overlays/EquipPopup';

/**
 * SplitView — 4분할 관제. 스케일 밖 fixed 오버레이(#map-slot 추적)에 2×2 미니맵 그리드.
 * splitView on 일 때만 렌더 → MiniMap 이 이때 생성되고, off 시 언마운트되며 파괴(지연생성).
 * 공구 5개 → 페이지당 4칸, 페이징.
 */
const PER_PAGE = 4;

export default function SplitView() {
  const splitView = useUIStore((s) => s.splitView);
  const toggle = useUIStore((s) => s.toggleSplitView);
  const page = useUIStore((s) => s.splitPage);
  const setPage = useUIStore((s) => s.setSplitPage);
  const cellPopups = useUIStore((s) => s.cellPopups);
  const closeCellPopup = useUIStore((s) => s.closeCellPopup);
  const openCellPopup = useUIStore((s) => s.openCellPopup);
  const zones = useSiteStore((s) => s.zones);
  const cctvs = useSiteStore((s) => s.cctvs);
  const containerRef = useRef(null);

  // #map-slot 위치/크기 추적
  useEffect(() => {
    if (!splitView) return;
    let raf;
    const sync = () => {
      const slot = document.getElementById('map-slot');
      const el = containerRef.current;
      if (slot && el) {
        const r = slot.getBoundingClientRect();
        el.style.left = `${r.left}px`;
        el.style.top = `${r.top}px`;
        el.style.width = `${r.width}px`;
        el.style.height = `${r.height}px`;
      }
      raf = requestAnimationFrame(sync);
    };
    sync();
    return () => cancelAnimationFrame(raf);
  }, [splitView]);

  if (!splitView) return null;

  const totalPages = Math.ceil(zones.length / PER_PAGE);
  const pageZones = zones.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const cells = [...pageZones];
  while (cells.length < PER_PAGE) cells.push(null); // 빈 칸 패딩

  return (
    <div
      ref={containerRef}
      className="fixed flex flex-col"
      style={{ left: 0, top: 0, zIndex: 4500, borderRadius: 22, overflow: 'hidden', background: 'rgba(4,8,15,0.96)', border: '1px solid var(--line-cyan)', pointerEvents: 'auto', padding: 14, gap: 12 }}
    >
      {/* 상단 바 */}
      <div className="flex items-center" style={{ gap: 14, flex: '0 0 auto' }}>
        <span className="flex items-center font-black text-cyan-300" style={{ gap: 10, fontSize: 20 }}>
          <Grid2x2 style={{ width: 22, height: 22 }} /> 4분할 관제
        </span>
        {totalPages > 1 && (
          <div className="flex items-center panel" style={{ gap: 4, padding: 5, borderRadius: 10, marginLeft: 6 }}>
            <button onClick={() => setPage((page - 1 + totalPages) % totalPages)} className="flex items-center justify-center text-white bg-white/8 hover:bg-white/16" style={{ width: 34, height: 34, borderRadius: 8, cursor: 'pointer' }}>
              <ChevronLeft style={{ width: 20, height: 20 }} />
            </button>
            <span className="font-black text-white text-center" style={{ fontSize: 15, width: 46 }}>{page + 1} / {totalPages}</span>
            <button onClick={() => setPage((page + 1) % totalPages)} className="flex items-center justify-center text-white bg-white/8 hover:bg-white/16" style={{ width: 34, height: 34, borderRadius: 8, cursor: 'pointer' }}>
              <ChevronRight style={{ width: 20, height: 20 }} />
            </button>
          </div>
        )}
        <span className="text-slate-500 font-bold" style={{ fontSize: 14 }}>공구별 개별 지도 · 각각 확대/이동</span>
        <button
          onClick={toggle}
          className="ml-auto flex items-center font-black text-white transition-all"
          style={{ gap: 8, padding: '10px 20px', borderRadius: 10, fontSize: 16, background: 'linear-gradient(180deg,#38bdf8,#0ea5e9)', cursor: 'pointer' }}
        >
          <MapIcon style={{ width: 20, height: 20 }} /> 단일맵
        </button>
      </div>

      {/* 2×2 그리드 */}
      <div className="grid" style={{ flex: '1 1 auto', minHeight: 0, gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12 }}>
        {cells.map((z, i) =>
          z ? (
            <div key={`${z.id}-${page}`} className="relative" style={{ minWidth: 0, minHeight: 0 }}>
              <MiniMap zone={z} />
              {/* 이 칸(공구)의 핀 팝업은 칸 안에서 독립적으로 열림 */}
              {cellPopups[z.id]?.kind === 'cctv' && (
                <CctvPopup
                  inCell
                  cam={cellPopups[z.id].item}
                  list={cctvs.filter((c) => c.zone === z.id)}
                  onClose={() => closeCellPopup(z.id)}
                  onSelect={(c) => openCellPopup(z.id, 'cctv', c)}
                />
              )}
              {cellPopups[z.id]?.kind === 'equip' && (
                <EquipPopup inCell eq={cellPopups[z.id].item} onClose={() => closeCellPopup(z.id)} />
              )}
            </div>
          ) : (
            <div key={`empty-${i}`} className="flex items-center justify-center" style={{ borderRadius: 14, border: '1px dashed rgba(148,163,184,0.25)', background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-slate-600 font-bold" style={{ fontSize: 16 }}>표시할 공구 없음</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
