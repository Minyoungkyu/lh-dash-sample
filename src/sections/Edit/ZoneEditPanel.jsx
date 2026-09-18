import { LayoutGrid, Trash2, X } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useSiteStore } from '@/stores/useSiteStore';

/**
 * ZoneEditPanel — 편집모드에서 구역(폴리곤) 클릭/목록 선택 시 뜨는 수정/삭제 패널.
 * 공구명 변경, 색상 변경, 삭제. (꼭짓점 이동은 다시 그리기로 대체)
 */
const PALETTE = ['#38bdf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb7185', '#22d3ee'];

export default function ZoneEditPanel() {
  const zoneEdit = useUIStore((s) => s.zoneEdit);
  const close = useUIStore((s) => s.closeZoneEdit);
  const zones = useSiteStore((s) => s.zones);
  const updateZone = useSiteStore((s) => s.updateZone);
  const removeZone = useSiteStore((s) => s.removeZone);

  if (!zoneEdit) return null;
  const z = zones.find((x) => x.id === zoneEdit.id);
  if (!z) return null;

  return (
    <div className="absolute z-[600] flex flex-col panel" style={{ top: 140, right: 24, width: 440, padding: 24, borderRadius: 18, pointerEvents: 'auto', gap: 20, border: '2px solid #38bdf8' }}>
      <div className="flex items-center" style={{ gap: 12 }}>
        <LayoutGrid style={{ width: 28, height: 28, color: '#38bdf8' }} />
        <span className="font-black text-cyan-300" style={{ fontSize: 24 }}>구역 편집</span>
        <button onClick={close} className="ml-auto flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors" style={{ width: 44, height: 44, borderRadius: 11 }}>
          <X style={{ width: 24, height: 24 }} />
        </button>
      </div>

      <label className="flex flex-col" style={{ gap: 9 }}>
        <span className="text-slate-400 font-bold" style={{ fontSize: 17 }}>공구명</span>
        <input value={z.name} onChange={(e) => updateZone(z.id, { name: e.target.value })} className="text-white outline-none" style={{ fontSize: 20, padding: '13px 18px', borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(148,163,184,0.35)' }} />
      </label>

      <div className="flex flex-col" style={{ gap: 10 }}>
        <span className="text-slate-400 font-bold" style={{ fontSize: 17 }}>색상</span>
        <div className="flex items-center" style={{ gap: 10 }}>
          {PALETTE.map((c) => (
            <button key={c} onClick={() => updateZone(z.id, { color: c })} title={c} style={{ width: 36, height: 36, borderRadius: 9, background: c, border: z.color === c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)', cursor: 'pointer' }} />
          ))}
        </div>
      </div>

      <button onClick={() => { removeZone(z.id); close(); }} className="flex items-center justify-center font-black text-white transition-all hover:brightness-110" style={{ gap: 10, padding: '15px 20px', borderRadius: 13, fontSize: 19, background: 'rgba(255,59,92,0.85)', cursor: 'pointer', marginTop: 2 }}>
        <Trash2 style={{ width: 22, height: 22 }} /> 구역 삭제
      </button>
    </div>
  );
}
