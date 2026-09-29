import { LayoutGrid, Trash2, X, Video } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useSiteStore } from '@/stores/useSiteStore';

/**
 * ZoneEditPanel — 편집모드에서 공구 선택 시 뜨는 수정 패널.
 * 공구명/색 변경, CCTV 추가(해당 구역으로 자동 배치), 구역 삭제(확인 후).
 */
const PALETTE = ['#38bdf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb7185', '#22d3ee'];

export default function ZoneEditPanel() {
  const zoneEdit = useUIStore((s) => s.zoneEdit);
  const close = useUIStore((s) => s.closeZoneEdit);
  const startPlaceCctv = useUIStore((s) => s.startPlaceCctv);
  const askConfirm = useUIStore((s) => s.askConfirm);
  const zones = useSiteStore((s) => s.zones);
  const cctvs = useSiteStore((s) => s.cctvs);
  const updateZone = useSiteStore((s) => s.updateZone);
  const removeZone = useSiteStore((s) => s.removeZone);

  if (!zoneEdit) return null;
  const z = zones.find((x) => x.id === zoneEdit.id);
  if (!z) return null;
  const camCount = cctvs.filter((c) => c.zone === z.id).length;

  const onDelete = () => askConfirm({
    message: `'${z.name}' 구역을 삭제할까요?${camCount ? ` 소속 CCTV ${camCount}대도 함께 삭제됩니다.` : ''}`,
    confirmLabel: '구역 삭제',
    onConfirm: () => { removeZone(z.id); close(); },
  });

  return (
    <div className="absolute z-[600] flex flex-col panel" style={{ top: 24, right: 24, width: 440, padding: 24, borderRadius: 18, pointerEvents: 'auto', gap: 18, border: '2px solid #38bdf8' }}>
      <div className="flex items-center" style={{ gap: 12 }}>
        <LayoutGrid style={{ width: 28, height: 28, color: '#38bdf8' }} />
        <span className="font-black text-cyan-300" style={{ fontSize: 24 }}>구역 편집</span>
        <button onClick={close} className="ml-auto flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors" style={{ width: 44, height: 44, borderRadius: 11 }}><X style={{ width: 24, height: 24 }} /></button>
      </div>

      <label className="flex flex-col" style={{ gap: 9 }}>
        <span className="text-slate-400 font-bold" style={{ fontSize: 17 }}>공구명</span>
        <input value={z.name} onChange={(e) => updateZone(z.id, { name: e.target.value })} className="text-white outline-none" style={{ fontSize: 20, padding: '13px 18px', borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(148,163,184,0.35)' }} />
      </label>

      <div className="flex flex-col" style={{ gap: 10 }}>
        <span className="text-slate-400 font-bold" style={{ fontSize: 17 }}>색상</span>
        <div className="flex items-center" style={{ gap: 10 }}>
          {PALETTE.map((c) => (<button key={c} onClick={() => updateZone(z.id, { color: c })} style={{ width: 36, height: 36, borderRadius: 9, background: c, border: z.color === c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)', cursor: 'pointer' }} />))}
          <label title="색상 직접 선택" style={{ position: 'relative', width: 36, height: 36, borderRadius: 9, cursor: 'pointer', background: z.color || '#38bdf8', border: PALETTE.includes(z.color) ? '2px solid rgba(255,255,255,0.3)' : '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', mixBlendMode: 'difference' }}>+</span>
            <input type="color" value={z.color || '#38bdf8'} onChange={(e) => updateZone(z.id, { color: e.target.value })} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
          </label>
        </div>
      </div>

      {/* CCTV 추가 (이 구역으로 자동 배치) */}
      <button onClick={() => startPlaceCctv(z.id)} className="flex items-center justify-center font-black transition-all hover:brightness-110" style={{ gap: 9, padding: '14px 16px', borderRadius: 12, fontSize: 17, background: 'rgba(56,189,248,0.18)', color: '#38bdf8', border: '1.5px solid rgba(56,189,248,0.6)', cursor: 'pointer' }}>
        <Video style={{ width: 20, height: 20 }} /> CCTV 추가 <span className="text-slate-400" style={{ fontSize: 14 }}>(현재 {camCount}대)</span>
      </button>

      <button onClick={onDelete} className="flex items-center justify-center font-black text-white transition-all hover:brightness-110" style={{ gap: 10, padding: '14px 20px', borderRadius: 13, fontSize: 18, background: 'rgba(255,59,92,0.85)', cursor: 'pointer' }}>
        <Trash2 style={{ width: 22, height: 22 }} /> 구역 삭제
      </button>
    </div>
  );
}
