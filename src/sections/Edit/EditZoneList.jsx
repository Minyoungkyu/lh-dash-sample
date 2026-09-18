import { LayoutGrid, Video, Wrench } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useSiteStore } from '@/stores/useSiteStore';
import { EQUIP_LIST } from '@/lib/mock/equipment';

/**
 * EditZoneList — 편집모드 좌측 공구(구역) 목록.
 * 편집모드에선 좌/우/하단 HUD 가 사라지므로, 이 목록에서 기존 공구를 골라
 * 클릭 → 지도 이동 + 구역 편집 패널(수정/삭제) 오픈.
 */
export default function EditZoneList() {
  const zones = useSiteStore((s) => s.zones);
  const cctvs = useSiteStore((s) => s.cctvs);
  const zoneEdit = useUIStore((s) => s.zoneEdit);
  const selectZoneEdit = useUIStore((s) => s.selectZoneEdit);
  const flyToPin = useUIStore((s) => s.flyToPin);

  const cnt = (list, id) => list.filter((x) => x.zone === id).length;

  const pick = (z) => {
    selectZoneEdit(z.id);
    if (z.center) flyToPin(z.center[1], z.center[0]);
  };

  return (
    <div className="absolute z-[600] flex flex-col panel" style={{ top: 140, left: 24, bottom: 24, width: 320, padding: 20, borderRadius: 16, pointerEvents: 'auto', gap: 12, border: '1.5px solid rgba(56,189,248,0.4)' }}>
      <div className="flex items-center" style={{ gap: 10 }}>
        <LayoutGrid style={{ width: 20, height: 20, color: '#38bdf8' }} />
        <span className="font-black text-cyan-300" style={{ fontSize: 17 }}>공구 목록</span>
        <span className="ml-auto text-slate-500 font-bold" style={{ fontSize: 13 }}>{zones.length}개</span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto thin-scroll flex flex-col" style={{ gap: 8 }}>
        {zones.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 font-bold" style={{ fontSize: 14 }}>구역이 없습니다. 상단 “구역 그리기”로 추가하세요.</div>
        ) : (
          zones.map((z) => {
            const active = zoneEdit?.id === z.id;
            const color = z.color ?? '#38bdf8';
            return (
              <button
                key={z.id}
                onClick={() => pick(z)}
                className="flex items-center text-left transition-all"
                style={{ gap: 11, padding: '12px 13px', borderRadius: 12, cursor: 'pointer', background: active ? `${color}1f` : 'rgba(0,0,0,0.3)', border: `1px solid ${active ? color : 'rgba(148,163,184,0.16)'}`, borderLeft: `5px solid ${color}` }}
              >
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
      <div className="text-slate-500 font-bold" style={{ fontSize: 12, lineHeight: 1.5 }}>
        공구를 클릭하면 지도가 이동하고 우측에서 수정·삭제할 수 있습니다.
      </div>
    </div>
  );
}
