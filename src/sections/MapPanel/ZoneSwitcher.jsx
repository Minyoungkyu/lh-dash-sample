import { Layers, Grid2x2 } from 'lucide-react';
import { ZONES } from '@/lib/mock/zones';
import { useUIStore } from '@/stores/useUIStore';

/**
 * ZoneSwitcher — 지도 우상단 구역 스위처.
 * 전체 / A~D공구 버튼 → 해당 구역으로 flyTo + 폴리곤 하이라이트.
 * (4분할 버튼은 다음 단계 예정 — 현재 비활성 표시)
 */
export default function ZoneSwitcher() {
  const activeZone = useUIStore((s) => s.activeZone);
  const setActiveZone = useUIStore((s) => s.setActiveZone);
  const splitView = useUIStore((s) => s.splitView);
  const toggleSplitView = useUIStore((s) => s.toggleSplitView);

  return (
    <div className="absolute z-[500] flex items-center panel" style={{ top: 20, right: 24, gap: 8, padding: 10, borderRadius: 14, pointerEvents: 'auto' }}>
      <Layers style={{ width: 20, height: 20, color: '#38bdf8', marginLeft: 4 }} />
      <button
        onClick={() => setActiveZone(null)}
        className="font-black transition-all"
        style={{
          fontSize: 16, padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
          background: activeZone === null ? '#38bdf8' : 'rgba(255,255,255,0.06)',
          color: activeZone === null ? '#04121a' : '#e2e8f0',
          border: '1px solid rgba(56,189,248,0.35)',
        }}
      >
        전체
      </button>
      {ZONES.map((z) => {
        const color = z.color ?? '#38bdf8';
        const on = activeZone === z.id;
        return (
          <button
            key={z.id}
            onClick={() => setActiveZone(z.id)}
            className="font-black transition-all"
            style={{
              fontSize: 16, padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
              background: on ? color : 'rgba(255,255,255,0.06)',
              color: on ? '#04121a' : '#e2e8f0',
              border: `1px solid ${color}66`,
            }}
          >
            {z.name}
          </button>
        );
      })}
      <div style={{ width: 1, height: 28, background: 'rgba(148,163,184,0.25)', margin: '0 2px' }} />
      <button
        onClick={toggleSplitView}
        title="공구별 4분할 관제"
        className="flex items-center font-black transition-all"
        style={{ gap: 6, fontSize: 15, padding: '9px 14px', borderRadius: 10, cursor: 'pointer', background: splitView ? '#38bdf8' : 'rgba(255,255,255,0.06)', color: splitView ? '#04121a' : '#e2e8f0', border: '1px solid rgba(56,189,248,0.35)' }}
      >
        <Grid2x2 style={{ width: 18, height: 18 }} />
        4분할
      </button>
    </div>
  );
}
