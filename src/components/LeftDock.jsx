import { useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import ExpandedSummaryPanel from '@/sections/Hud/ExpandedSummaryPanel';

/**
 * LeftDock — 좌측 상세 드로어 (현장 현황 대형 뷰).
 * HudSummaryTable 의 '크게 보기(⤢)' 버튼으로 열림(leftDock='summary'). 기본 접힘(화면 밖).
 * 표시 카테고리는 store.summaryCat(공정/장비/CCTV) 를 따른다. 바깥 클릭 시 닫힘.
 */
const DRAWER_W = 1280;

export default function LeftDock() {
  const leftDock = useUIStore((s) => s.leftDock);
  const close = useUIStore((s) => s.closeLeftDock);
  const open = leftDock !== null;
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    const id = setTimeout(() => document.addEventListener('mousedown', onDown, true), 0);
    return () => { clearTimeout(id); document.removeEventListener('mousedown', onDown, true); };
  }, [open, close]);

  return (
    <div
      ref={rootRef}
      className="absolute"
      style={{
        top: 184, bottom: 24, left: 24, width: DRAWER_W,
        transform: open ? 'translateX(0)' : `translateX(-${DRAWER_W + 48}px)`,
        transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        zIndex: 4000, pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div className="relative" style={{ width: '100%', height: '100%' }}>
        {open && (
          <button
            onClick={close}
            title="접기"
            className="absolute flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
            style={{ top: 20, right: 20, width: 40, height: 40, borderRadius: 10, zIndex: 10 }}
          >
            <ChevronLeft style={{ width: 24, height: 24 }} />
          </button>
        )}
        <ExpandedSummaryPanel />
      </div>
    </div>
  );
}
