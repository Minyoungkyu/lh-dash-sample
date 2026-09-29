import { Radio, Siren, Activity, DoorOpen, Wrench, Video, ClipboardCheck, CloudSun } from 'lucide-react';
import { EVENTS } from '@/lib/mock/events';
import { useUIStore } from '@/stores/useUIStore';
import HudSummaryTable from './HudSummaryTable';

/**
 * HudEvents — 지도 좌측 엣지 밀착 상시표시 패널 (전체 높이, 상/하 2분할).
 *  - 상단: 작업자/중장비/CCTV 요약표 자동 로테이션(HudSummaryTable)
 *  - 하단: 실시간 이벤트 히스토리
 * 공구 선택 시 모두 필터. 헤더 '구역 상세' → 공사구역 드로어.
 */
const EVENT_ICONS = { sos: Siren, sensor: Activity, access: DoorOpen, equip: Wrench, cctv: Video, tbm: ClipboardCheck, env: CloudSun };
const LEVEL = {
  danger: { color: '#ff3b5c', bg: 'rgba(255,59,92,0.12)' },
  warn: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  info: { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)' },
};

export default function HudEvents() {
  const activeZone = useUIStore((s) => s.activeZone);

  const list = activeZone ? EVENTS.filter((e) => e.zone === activeZone || e.zone === '전체') : EVENTS;
  const dangerCount = list.filter((e) => e.level === 'danger').length;

  return (
    <div
      className="absolute panel flex flex-col z-[500]"
      style={{ left: 24, top: 88, bottom: 24, width: 500, padding: 20, borderRadius: 18, pointerEvents: 'auto', gap: 14 }}
    >
      {/* 헤더 */}
      <div className="flex items-center" style={{ gap: 10 }}>
        <Radio style={{ width: 24, height: 24, color: '#38bdf8' }} />
        <span className="font-black text-cyan-300" style={{ fontSize: 24 }}>현장 현황</span>
        <span
          className="ml-auto font-black"
          style={{ fontSize: 16, color: activeZone ? '#38bdf8' : '#94a3b8', background: activeZone ? 'rgba(56,189,248,0.14)' : 'rgba(148,163,184,0.12)', border: `1px solid ${activeZone ? 'rgba(56,189,248,0.4)' : 'rgba(148,163,184,0.25)'}`, padding: '4px 12px', borderRadius: 999 }}
        >
          {activeZone ?? '전체 현장'}
        </span>
      </div>

      {/* 상단: 요약표 자동 롤링 (작업자/장비/CCTV) */}
      <div className="min-h-0" style={{ flex: 1 }}>
        <HudSummaryTable />
      </div>

      {/* 구분선 */}
      <div style={{ height: 1, background: 'rgba(148,163,184,0.18)' }} />

      {/* 하단: 실시간 이벤트 히스토리 */}
      <div className="flex flex-col min-h-0" style={{ flex: 1, gap: 10 }}>
        <div className="flex items-center" style={{ gap: 8 }}>
          <span className="font-black text-slate-200" style={{ fontSize: 17, letterSpacing: '0.02em' }}>이벤트 현황</span>
          {dangerCount > 0 && <span className="font-black text-rose-400" style={{ fontSize: 15 }}>위험 {dangerCount}건</span>}
          <span className="ml-auto flex items-center text-emerald-400 font-bold" style={{ gap: 6, fontSize: 14 }}>
            <span className="live-blink" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} /> LIVE · {list.length}건
          </span>
        </div>
        <div
          className="flex-1 min-h-0 overflow-y-auto thin-scroll flex flex-col"
          style={{ gap: 7, padding: 10, borderRadius: 12, background: 'rgba(0,0,0,0.24)', border: '1px solid rgba(148,163,184,0.1)' }}
        >
          {list.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500 font-bold" style={{ fontSize: 17 }}>
              해당 공구의 이벤트가 없습니다.
            </div>
          ) : (
            list.map((e) => {
              const Icon = EVENT_ICONS[e.kind] ?? Activity;
              const lv = LEVEL[e.level] ?? LEVEL.info;
              return (
                <div key={e.id} className="flex items-start" style={{ gap: 10, padding: '11px 13px', borderRadius: 11, background: lv.bg, borderLeft: `4px solid ${lv.color}` }}>
                  <div className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 8, background: `${lv.color}22`, flex: '0 0 auto', marginTop: 1 }}>
                    <Icon className={e.level === 'danger' ? 'live-blink' : ''} style={{ width: 17, height: 17, color: lv.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center" style={{ gap: 8 }}>
                      <span className="font-mono font-bold text-slate-400" style={{ fontSize: 15 }}>{e.time}</span>
                      <span className="font-black" style={{ fontSize: 13, color: lv.color, background: `${lv.color}22`, padding: '2px 7px', borderRadius: 6 }}>{e.zone}</span>
                    </div>
                    <div className="text-white font-bold" style={{ fontSize: 17, marginTop: 3, lineHeight: 1.35 }}>{e.message}</div>
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
