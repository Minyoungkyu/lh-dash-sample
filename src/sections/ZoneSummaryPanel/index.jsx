import { LayoutGrid, Users, Wrench, Video, User, Phone, CalendarClock, MapPin } from 'lucide-react';
import { ZONES } from '@/lib/mock/zones';
import { WORKERS } from '@/lib/mock/smartband';
import { EQUIP_LIST } from '@/lib/mock/equipment';
import { CCTV_LIST } from '@/lib/mock/cctv';
import { useUIStore } from '@/stores/useUIStore';

/**
 * ZoneSummaryPanel — 공사 구역(공구)별 요약 카드 (표시 전용).
 * 카드 클릭 시 해당 공구로 지도 포커스(activeZone).
 */
const countBy = (list, zone) => list.filter((x) => x.zone === zone).length;

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center" style={{ gap: 7 }}>
      <Icon style={{ width: 15, height: 15, color: '#64748b', flex: '0 0 auto' }} />
      <span className="text-slate-500 font-bold" style={{ fontSize: 13, width: 52, flex: '0 0 auto' }}>{label}</span>
      <span className="text-slate-200 font-bold truncate" style={{ fontSize: 14 }}>{value}</span>
    </div>
  );
}

function Metric({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center justify-center" style={{ gap: 6 }}>
      <Icon style={{ width: 16, height: 16, color }} />
      <span className="font-black text-white" style={{ fontSize: 17 }}>{value}</span>
      <span className="text-slate-500 font-bold" style={{ fontSize: 12 }}>{label}</span>
    </div>
  );
}

function ZoneCard({ zone, active, onClick }) {
  const color = zone.color ?? '#38bdf8';
  return (
    <button
      onClick={onClick}
      className="flex flex-col text-left transition-all"
      style={{
        gap: 12, padding: 18, borderRadius: 14,
        background: active ? `${color}1a` : 'rgba(0,0,0,0.32)',
        border: `1px solid ${active ? color : color + '44'}`,
        borderLeft: `5px solid ${color}`, cursor: 'pointer',
      }}
    >
      <div className="flex items-center" style={{ gap: 10 }}>
        <span className="font-black text-white" style={{ fontSize: 22 }}>{zone.name}</span>
        <span className="text-slate-400 font-bold" style={{ fontSize: 14 }}>{zone.phase}</span>
      </div>
      <div className="flex items-center" style={{ gap: 10 }}>
        <div style={{ flex: 1, height: 9, borderRadius: 6, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ width: `${zone.progress}%`, height: '100%', background: `linear-gradient(90deg, ${color}aa, ${color})` }} />
        </div>
        <span className="font-black" style={{ fontSize: 15, color, width: 42, textAlign: 'right' }}>{zone.progress}%</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field icon={User} label="담당자" value={zone.manager} />
        <Field icon={Phone} label="연락처" value={zone.phone} />
        <Field icon={MapPin} label="위치" value={zone.lead} />
        <Field icon={CalendarClock} label="공기" value={zone.period} />
      </div>
      <div className="grid grid-cols-3" style={{ gap: 6, paddingTop: 10, borderTop: '1px solid rgba(148,163,184,0.12)' }}>
        <Metric icon={Users} value={countBy(WORKERS, zone.id)} label="근로자" color="#38bdf8" />
        <Metric icon={Wrench} value={countBy(EQUIP_LIST, zone.id)} label="장비" color="#f59e0b" />
        <Metric icon={Video} value={countBy(CCTV_LIST, zone.id)} label="CCTV" color="#22d3ee" />
      </div>
    </button>
  );
}

export default function ZoneSummaryPanel() {
  const activeZone = useUIStore((s) => s.activeZone);
  const setActiveZone = useUIStore((s) => s.setActiveZone);

  return (
    <div className="flex flex-col h-full panel" style={{ padding: 24, gap: 16 }}>
      <div className="flex items-center" style={{ gap: 12 }}>
        <LayoutGrid style={{ width: 28, height: 28, color: '#38bdf8' }} />
        <span className="font-black text-cyan-300" style={{ fontSize: 24 }}>공사 구역 현황</span>
        <span className="ml-auto text-slate-500 font-bold" style={{ fontSize: 14 }}>{ZONES.length}개 공구</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto thin-scroll flex flex-col" style={{ gap: 12 }}>
        {ZONES.map((z) => (
          <ZoneCard key={z.id} zone={z} active={activeZone === z.id} onClick={() => setActiveZone(z.id)} />
        ))}
      </div>
    </div>
  );
}
