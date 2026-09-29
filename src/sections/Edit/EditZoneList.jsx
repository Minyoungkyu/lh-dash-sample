import { LayoutGrid, Video, Wrench, Plus, LogOut } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useSiteStore } from '@/stores/useSiteStore';
import { EQUIP_LIST } from '@/lib/mock/equipment';

/**
 * EditZoneList — 편집모드 좌측 공구 목록(편집의 허브).
 * 헤더: 편집 종료 / 목록: 공구 선택→프레이밍+구역 편집 / 하단: 공구 추가하기.
 */
export default function EditZoneList() {
  const zones = useSiteStore((s) => s.zones);
  const cctvs = useSiteStore((s) => s.cctvs);
  const zoneEdit = useUIStore((s) => s.zoneEdit);
  const selectZoneEdit = useUIStore((s) => s.selectZoneEdit);
  const fitZone = useUIStore((s) => s.fitZone);
  const startZoneAdd = useUIStore((s) => s.startZoneAdd);
  const toggleEditMode = useUIStore((s) => s.toggleEditMode);

  const cnt = (list, id) => list.filter((x) => x.zone === id).length;
  const pick = (z) => { selectZoneEdit(z.id); fitZone(z.id); };

  return (
    <div className="absolute z-[600] flex flex-col panel" style={{ top: 24, left: 24, bottom: 24, width: 320, padding: 20, borderRadius: 16, pointerEvents: 'auto', gap: 14, border: '1.5px solid rgba(56,189,248,0.5)' }}>
      {/* 헤더 + 편집 종료 */}
      <div className="flex items-center" style={{ gap: 10 }}>
        <LayoutGrid style={{ width: 22, height: 22, color: '#38bdf8' }} />
        <span className="font-black text-cyan-300" style={{ fontSize: 19 }}>공구 목록</span>
        <span className="text-slate-500 font-bold" style={{ fontSize: 13 }}>{zones.length}</span>
        <button onClick={toggleEditMode} className="ml-auto flex items-center font-black text-white transition-all hover:brightness-110" style={{ gap: 7, padding: '9px 14px', borderRadius: 10, fontSize: 14, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(148,163,184,0.35)', cursor: 'pointer' }}>
          <LogOut style={{ width: 16, height: 16 }} /> 편집 종료
        </button>
      </div>

      {/* 목록 */}
      <div className="flex-1 min-h-0 overflow-y-auto thin-scroll flex flex-col" style={{ gap: 8 }}>
        {zones.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 font-bold text-center" style={{ fontSize: 14, padding: 12 }}>구역이 없습니다.<br />아래 “공구 추가하기”로 추가하세요.</div>
        ) : (
          zones.map((z) => {
            const active = zoneEdit?.id === z.id;
            const color = z.color ?? '#38bdf8';
            return (
              <button key={z.id} onClick={() => pick(z)} className="flex items-center text-left transition-all" style={{ gap: 11, padding: '12px 13px', borderRadius: 12, cursor: 'pointer', background: active ? `${color}1f` : 'rgba(0,0,0,0.3)', border: `1px solid ${active ? color : 'rgba(148,163,184,0.16)'}`, borderLeft: `5px solid ${color}` }}>
                <div className="flex flex-col min-w-0" style={{ flex: 1, gap: 4 }}>
                  <span className="font-black text-white truncate" style={{ fontSize: 16 }}>{z.name}</span>
                  <span className="flex items-center text-slate-400 font-bold" style={{ gap: 12, fontSize: 12 }}>
                    <span className="flex items-center" style={{ gap: 4 }}><Video style={{ width: 13, height: 13, color: '#22d3ee' }} />{cnt(cctvs, z.id)}</span>
                    <span className="flex items-center" style={{ gap: 4 }}><Wrench style={{ width: 13, height: 13, color: '#f59e0b' }} />{cnt(EQUIP_LIST, z.id)}</span>
                    {z.phase && <span className="truncate">{z.phase}</span>}
                  </span>
                </div>
                <span style={{ width: 14, height: 14, borderRadius: 4, background: color, flex: '0 0 auto' }} />
              </button>
            );
          })
        )}
      </div>

      {/* 공구 추가하기 */}
      <button onClick={startZoneAdd} className="flex items-center justify-center font-black transition-all hover:brightness-110" style={{ gap: 9, padding: '14px 16px', borderRadius: 12, fontSize: 16, background: '#38bdf8', color: '#04121a', cursor: 'pointer' }}>
        <Plus style={{ width: 20, height: 20 }} /> 공구 추가하기
      </button>
    </div>
  );
}
