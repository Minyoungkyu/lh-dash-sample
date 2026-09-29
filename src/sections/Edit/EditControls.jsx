import { useState, useEffect } from 'react';
import { Pencil, Square, Video, X, Check, Undo2, MousePointerClick, Info } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

/**
 * EditControls — 편집 진입 버튼(비편집) + 상황별 임시 안내바(구역 추가 이름입력 / 그리는 중 / CCTV 배치 중).
 * 상시 편집 툴바는 없음 — 편집 조작은 공구목록(EditZoneList)/구역편집(ZoneEditPanel)에서.
 */
const PALETTE = ['#38bdf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb7185', '#22d3ee'];
const Divider = () => <div style={{ width: 1, height: 40, background: 'rgba(148,163,184,0.3)' }} />;
const barBox = { padding: '16px 20px', borderRadius: 16, border: '2px solid #38bdf8' };

// 단계 안내 배너
function Guide({ children }) {
  return (
    <div className="panel flex items-center" style={{ gap: 9, padding: '10px 16px', borderRadius: 12, fontSize: 15, color: '#cbd5e1', border: '1px solid rgba(56,189,248,0.35)' }}>
      <Info style={{ width: 17, height: 17, color: '#38bdf8', flex: '0 0 auto' }} />
      <span className="font-bold">{children}</span>
    </div>
  );
}
const Column = ({ children }) => (
  <div className="absolute z-[600] flex flex-col items-center" style={{ top: 20, left: '50%', transform: 'translateX(-50%)', gap: 10, pointerEvents: 'auto' }}>
    {children}
  </div>
);

export default function EditControls() {
  const editMode = useUIStore((s) => s.editMode);
  const editTool = useUIStore((s) => s.editTool);
  const setEditTool = useUIStore((s) => s.setEditTool);
  const zoneNaming = useUIStore((s) => s.zoneNaming);
  const cancelZoneAdd = useUIStore((s) => s.cancelZoneAdd);
  const draftZone = useUIStore((s) => s.draftZone);
  const startDrawZone = useUIStore((s) => s.startDrawZone);
  const undoDraftPoint = useUIStore((s) => s.undoDraftPoint);
  const finishDraftZone = useUIStore((s) => s.finishDraftZone);
  const cancelDraftZone = useUIStore((s) => s.cancelDraftZone);

  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  useEffect(() => { if (zoneNaming) { setName(''); setColor(PALETTE[0]); } }, [zoneNaming]);

  // 비편집: 진입 UI 없음 (헤더 로고 5연타로 진입)
  if (!editMode) return null;

  // 구역 그리는 중
  if (draftZone) {
    const n = draftZone.points.length;
    return (
      <Column>
        <div className="flex items-center panel" style={{ ...barBox, gap: 16 }}>
          <span className="flex items-center font-black text-cyan-300" style={{ gap: 10, fontSize: 22 }}><Square style={{ width: 24, height: 24 }} /> {draftZone.name}</span>
          <span className="flex items-center text-slate-200 font-bold" style={{ gap: 9, fontSize: 18 }}><MousePointerClick style={{ width: 22, height: 22, color: '#38bdf8' }} /> 꼭짓점 <span className="text-cyan-300">{n}개</span></span>
          <Divider />
          <button onClick={undoDraftPoint} disabled={n === 0} className="flex items-center font-black text-slate-100 transition-all disabled:opacity-40" style={{ gap: 8, padding: '13px 18px', borderRadius: 11, fontSize: 18, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(148,163,184,0.35)', cursor: n === 0 ? 'default' : 'pointer' }}><Undo2 style={{ width: 22, height: 22 }} /> 되돌리기</button>
          <button onClick={finishDraftZone} disabled={n < 3} className="flex items-center font-black text-white transition-all disabled:opacity-40" style={{ gap: 9, padding: '13px 22px', borderRadius: 11, fontSize: 18, background: 'linear-gradient(180deg,#22c55e,#16a34a)', cursor: n < 3 ? 'default' : 'pointer' }}><Check style={{ width: 22, height: 22 }} /> 구역 추가</button>
          <button onClick={cancelDraftZone} className="flex items-center justify-center text-slate-200 hover:text-white transition-colors" style={{ width: 46, height: 46, borderRadius: 11, background: 'rgba(255,255,255,0.08)' }}><X style={{ width: 24, height: 24 }} /></button>
        </div>
        <Guide>지도에서 구역 <b>외곽을 순서대로 클릭</b>해 꼭짓점을 찍으세요 (3점 이상). 다 그렸으면 <b>[구역 추가]</b>, 잘못 찍었으면 <b>[되돌리기]</b>.</Guide>
      </Column>
    );
  }

  // 구역 추가 — 이름/색 입력
  if (zoneNaming) {
    return (
      <Column>
        <div className="flex items-center panel" style={{ ...barBox, gap: 16 }}>
          <span className="font-black text-cyan-300" style={{ fontSize: 22 }}>구역 추가</span>
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) startDrawZone(name.trim(), color); }} autoFocus placeholder="공구명 입력" className="text-white outline-none" style={{ fontSize: 19, padding: '13px 18px', borderRadius: 11, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(148,163,184,0.4)', width: 240 }} />
          <div className="flex items-center" style={{ gap: 8 }}>
            {PALETTE.map((c) => (<button key={c} onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: 8, background: c, border: color === c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)', cursor: 'pointer' }} />))}
            <label title="색상 직접 선택" style={{ position: 'relative', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', background: color, border: PALETTE.includes(color) ? '2px solid rgba(255,255,255,0.3)' : '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', mixBlendMode: 'difference' }}>+</span>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
            </label>
          </div>
          <Divider />
          <button onClick={() => name.trim() && startDrawZone(name.trim(), color)} disabled={!name.trim()} className="flex items-center font-black transition-all disabled:opacity-40" style={{ gap: 9, padding: '13px 22px', borderRadius: 11, fontSize: 18, background: '#38bdf8', color: '#04121a', cursor: name.trim() ? 'pointer' : 'default' }}><Pencil style={{ width: 22, height: 22 }} /> 그리기 시작</button>
          <button onClick={cancelZoneAdd} className="flex items-center justify-center text-slate-200 hover:text-white transition-colors" style={{ width: 46, height: 46, borderRadius: 11, background: 'rgba(255,255,255,0.08)' }}><X style={{ width: 24, height: 24 }} /></button>
        </div>
        <Guide><b>①</b> 공구명·색을 정하고 <b>②</b> <b>[그리기 시작]</b>을 누르면 지도에 구역을 그릴 수 있어요.</Guide>
      </Column>
    );
  }

  // CCTV 배치 중
  if (editTool === 'place-cctv') {
    return (
      <Column>
        <div className="flex items-center panel" style={{ ...barBox, gap: 16 }}>
          <span className="flex items-center font-black text-cyan-300" style={{ gap: 10, fontSize: 22 }}><Video style={{ width: 24, height: 24 }} /> CCTV 배치</span>
          <span className="flex items-center text-slate-200 font-bold" style={{ gap: 9, fontSize: 18 }}><MousePointerClick style={{ width: 22, height: 22, color: '#38bdf8' }} /> 설치할 위치를 클릭</span>
          <button onClick={() => setEditTool(null)} className="flex items-center justify-center text-slate-200 hover:text-white transition-colors" style={{ width: 46, height: 46, borderRadius: 11, background: 'rgba(255,255,255,0.08)' }}><X style={{ width: 24, height: 24 }} /></button>
        </div>
        <Guide>지도에서 <b>CCTV를 설치할 지점을 클릭</b>하면 상세 입력창이 열립니다.</Guide>
      </Column>
    );
  }

  return null;
}
