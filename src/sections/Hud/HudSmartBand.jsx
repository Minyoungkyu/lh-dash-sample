import { useMemo } from 'react';
import { Watch, Droplet, Thermometer, WifiOff, Maximize2 } from 'lucide-react';
import { WORKERS, BAND_STATUS } from '@/lib/mock/smartband';
import { useUIStore } from '@/stores/useUIStore';

/**
 * HudSmartBand — 지도 우측 엣지 밀착 상시표시 패널 (전체 높이).
 * 구성: 생체 요약칩 → 근로자 현황(위험 우선 정렬, 전체 스크롤).
 * 공구 선택 시 필터. 헤더 '전체 명단' → 스마트밴드 드로어. SOS 행 클릭 → 경보.
 */
const PRIORITY = { sos: 0, danger: 1, caution: 2, normal: 3, offline: 4 };

export default function HudSmartBand() {
  const activeZone = useUIStore((s) => s.activeZone);
  const openSos = useUIStore((s) => s.openSos);
  const toggleDock = useUIStore((s) => s.toggleDock);

  const sorted = useMemo(() => {
    const base = activeZone ? WORKERS.filter((w) => w.zone === activeZone) : WORKERS;
    return [...base].sort((a, b) => (PRIORITY[a.status] ?? 9) - (PRIORITY[b.status] ?? 9));
  }, [activeZone]);

  const counts = useMemo(
    () => sorted.reduce((a, w) => { a.total++; a[w.status] = (a[w.status] ?? 0) + 1; return a; }, { total: 0 }),
    [sorted],
  );

  const summary = [
    { key: 'total', label: '총원', value: counts.total, color: '#e2e8f0' },
    { key: 'normal', label: '정상', value: counts.normal ?? 0, color: BAND_STATUS.normal.color },
    { key: 'caution', label: '주의', value: counts.caution ?? 0, color: BAND_STATUS.caution.color },
    { key: 'danger', label: '위험', value: counts.danger ?? 0, color: BAND_STATUS.danger.color },
    { key: 'sos', label: 'SOS', value: counts.sos ?? 0, color: BAND_STATUS.sos.color },
    { key: 'offline', label: '미수신', value: counts.offline ?? 0, color: BAND_STATUS.offline.color },
  ];

  return (
    <div
      className="absolute panel flex flex-col z-[500]"
      style={{ right: 24, top: 88, bottom: 24, width: 480, padding: 20, borderRadius: 18, pointerEvents: 'auto', gap: 16 }}
    >
      {/* 헤더 */}
      <div className="flex items-center" style={{ gap: 10 }}>
        <Watch style={{ width: 24, height: 24, color: '#38bdf8' }} />
        <span className="font-black text-cyan-300" style={{ fontSize: 21 }}>스마트밴드 현황</span>
        <span
          className="font-black"
          style={{ fontSize: 14, color: activeZone ? '#38bdf8' : '#94a3b8', background: activeZone ? 'rgba(56,189,248,0.14)' : 'rgba(148,163,184,0.12)', border: `1px solid ${activeZone ? 'rgba(56,189,248,0.4)' : 'rgba(148,163,184,0.25)'}`, padding: '4px 12px', borderRadius: 999 }}
        >
          {activeZone ?? '전체 현장'}
        </span>
        <button
          onClick={() => toggleDock('smartband')}
          title="전체 명단"
          className="ml-auto flex items-center justify-center bg-white/8 hover:bg-white/16 text-slate-200 transition-colors"
          style={{ width: 34, height: 34, borderRadius: 9 }}
        >
          <Maximize2 style={{ width: 17, height: 17 }} />
        </button>
      </div>

      {/* 요약 칩 */}
      <div className="grid grid-cols-6" style={{ gap: 8 }}>
        {summary.map((s) => (
          <div key={s.key} className="flex flex-col items-center justify-center" style={{ padding: '11px 2px', borderRadius: 11, background: 'rgba(0,0,0,0.3)', border: `1px solid ${s.color}44` }}>
            <span className="font-black" style={{ fontSize: 27, color: s.color, lineHeight: 1 }}>{s.value}</span>
            <span className="text-slate-400 font-bold" style={{ fontSize: 12, marginTop: 5 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* 근로자 롤링 (flex-1) */}
      <div className="flex flex-col min-h-0" style={{ flex: 1, gap: 10 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <span className="font-black text-slate-300" style={{ fontSize: 15, letterSpacing: '0.03em' }}>근로자 현황</span>
          <span className="ml-auto text-rose-400 font-bold" style={{ fontSize: 12 }}>SpO₂ &lt;90% · 온도 ≥37.5℃ 위험</span>
        </div>
        <div
          className="flex-1 min-h-0 overflow-y-auto thin-scroll flex flex-col"
          style={{ gap: 8, padding: 10, borderRadius: 12, background: 'rgba(0,0,0,0.22)', border: '1px solid rgba(148,163,184,0.1)' }}
        >
          {sorted.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500 font-bold" style={{ fontSize: 15 }}>
              해당 공구의 근로자가 없습니다.
            </div>
          ) : (
            sorted.map((w) => {
                  const s = BAND_STATUS[w.status] ?? BAND_STATUS.normal;
                  const isAlert = w.status === 'sos' || w.status === 'danger';
                  const isSos = w.status === 'sos';
                  const spo2Color = w.spo2 == null ? '#64748b' : w.spo2 < 90 ? '#ff3b5c' : w.spo2 < 94 ? '#f97316' : '#e2e8f0';
                  const tempColor = w.skinTemp == null ? '#64748b' : w.skinTemp >= 37.5 ? '#ff3b5c' : w.skinTemp >= 37 ? '#f97316' : '#e2e8f0';
                  return (
                    <div
                      key={w.id}
                      onClick={() => isSos && openSos(w)}
                      className={isSos ? 'sos-flash' : ''}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 11,
                        background: isSos ? 'rgba(255,59,92,0.12)' : w.status === 'danger' ? 'rgba(249,115,22,0.1)' : 'rgba(0,0,0,0.3)',
                        border: `1px solid ${isAlert ? s.color + '66' : 'rgba(148,163,184,0.14)'}`,
                        cursor: isSos ? 'pointer' : 'default',
                        opacity: w.status === 'offline' ? 0.6 : 1,
                      }}
                    >
                      <span className={isSos ? 'live-blink' : ''} style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, boxShadow: w.online ? `0 0 8px ${s.color}` : 'none', flex: '0 0 auto' }} />
                      <div className="flex flex-col" style={{ minWidth: 0, width: 160 }}>
                        <span className="font-black text-white truncate" style={{ fontSize: 16 }}>{w.name}</span>
                        <span className="text-slate-500 font-bold truncate" style={{ fontSize: 12 }}>{w.company} · {w.team}</span>
                      </div>
                      <div className="flex items-center ml-auto" style={{ gap: 14 }}>
                        <span className="flex items-center" style={{ gap: 6 }}>
                          <Droplet style={{ width: 15, height: 15, color: spo2Color }} />
                          <span className="font-black" style={{ fontSize: 16, color: spo2Color }}>{w.spo2 != null ? `${w.spo2}%` : '---'}</span>
                        </span>
                        <span className="flex items-center" style={{ gap: 6 }}>
                          <Thermometer style={{ width: 15, height: 15, color: tempColor }} />
                          <span className="font-black" style={{ fontSize: 16, color: tempColor }}>{w.skinTemp != null ? `${w.skinTemp}℃` : '---'}</span>
                        </span>
                        {!w.online && <WifiOff style={{ width: 15, height: 15, color: '#64748b' }} />}
                      </div>
                    </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
