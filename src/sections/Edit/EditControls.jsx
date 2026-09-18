import { useState } from 'react';
import { Pencil, Square, Video, X, Check, Undo2, MousePointerClick } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

/**
 * EditControls — 편집모드 진입 토글 + 편집 툴바.
 *  - 구역 그리기: 공구명/색 입력 → 지도 클릭으로 꼭짓점 → 완료 시 저장
 *  - CCTV 배치: 지도 클릭 → 메타 입력 폼(CctvEditModal)
 */
const PALETTE = ['#38bdf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#fb7185', '#22d3ee'];
const wrap = { top: 20, left: 24 };
const Divider = () => <div style={{ width: 1, height: 44, background: 'rgba(148,163,184,0.3)' }} />;

export default function EditControls() {
  const editMode = useUIStore((s) => s.editMode);
  const toggleEditMode = useUIStore((s) => s.toggleEditMode);
  const editTool = useUIStore((s) => s.editTool);
  const setEditTool = useUIStore((s) => s.setEditTool);
  const draftZone = useUIStore((s) => s.draftZone);
  const startDrawZone = useUIStore((s) => s.startDrawZone);
  const undoDraftPoint = useUIStore((s) => s.undoDraftPoint);
  const finishDraftZone = useUIStore((s) => s.finishDraftZone);
  const cancelDraftZone = useUIStore((s) => s.cancelDraftZone);

  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);
  const [naming, setNaming] = useState(false);

  if (!editMode) {
    return (
      <div className="absolute z-[600]" style={{ top: 20, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto' }}>
        <button
          onClick={toggleEditMode}
          className="flex items-center panel font-black transition-all hover:brightness-110"
          style={{ gap: 11, padding: '14px 24px', borderRadius: 14, fontSize: 20, color: '#e2e8f0', cursor: 'pointer' }}
        >
          <Pencil style={{ width: 24, height: 24, color: '#38bdf8' }} /> 편집 모드
        </button>
      </div>
    );
  }

  const shell = { ...wrap, padding: '16px 20px', borderRadius: 16, pointerEvents: 'auto', border: '2px solid #38bdf8' };

  // 구역 그리기 진행 중
  if (draftZone) {
    const n = draftZone.points.length;
    return (
      <div className="absolute z-[600] flex items-center panel" style={{ ...shell, gap: 16 }}>
        <span className="flex items-center font-black text-cyan-300" style={{ gap: 10, fontSize: 22 }}>
          <Square style={{ width: 24, height: 24 }} /> {draftZone.name}
        </span>
        <span className="flex items-center text-slate-200 font-bold" style={{ gap: 9, fontSize: 18 }}>
          <MousePointerClick style={{ width: 22, height: 22, color: '#38bdf8' }} /> 지도 클릭으로 꼭짓점 추가 · <span className="text-cyan-300">{n}개</span>
        </span>
        <Divider />
        <button onClick={undoDraftPoint} disabled={n === 0} className="flex items-center font-black text-slate-100 transition-all disabled:opacity-40" style={{ gap: 8, padding: '13px 18px', borderRadius: 11, fontSize: 18, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(148,163,184,0.35)', cursor: n === 0 ? 'default' : 'pointer' }}>
          <Undo2 style={{ width: 22, height: 22 }} /> 되돌리기
        </button>
        <button onClick={() => { finishDraftZone(); setNaming(false); setName(''); }} disabled={n < 3} className="flex items-center font-black text-white transition-all disabled:opacity-40" style={{ gap: 9, padding: '13px 22px', borderRadius: 11, fontSize: 18, background: 'linear-gradient(180deg,#22c55e,#16a34a)', cursor: n < 3 ? 'default' : 'pointer' }}>
          <Check style={{ width: 22, height: 22 }} /> 완료
        </button>
        <button onClick={() => { cancelDraftZone(); setNaming(false); }} className="flex items-center justify-center text-slate-200 hover:text-white transition-colors" style={{ width: 46, height: 46, borderRadius: 11, background: 'rgba(255,255,255,0.08)' }}>
          <X style={{ width: 24, height: 24 }} />
        </button>
      </div>
    );
  }

  // 구역 이름/색 입력
  if (naming) {
    return (
      <div className="absolute z-[600] flex items-center panel" style={{ ...shell, gap: 16 }}>
        <span className="font-black text-cyan-300" style={{ fontSize: 22 }}>새 구역</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) { startDrawZone(name.trim(), color); setNaming(false); } }}
          autoFocus
          placeholder="공구명 입력"
          className="text-white outline-none"
          style={{ fontSize: 19, padding: '13px 18px', borderRadius: 11, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(148,163,184,0.4)', width: 260 }}
        />
        <div className="flex items-center" style={{ gap: 8 }}>
          {PALETTE.map((c) => (
            <button key={c} onClick={() => setColor(c)} title={c} style={{ width: 30, height: 30, borderRadius: 8, background: c, border: color === c ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)', cursor: 'pointer' }} />
          ))}
        </div>
        <Divider />
        <button onClick={() => { if (name.trim()) { startDrawZone(name.trim(), color); setNaming(false); } }} disabled={!name.trim()} className="flex items-center font-black transition-all disabled:opacity-40" style={{ gap: 9, padding: '13px 22px', borderRadius: 11, fontSize: 18, background: '#38bdf8', color: '#04121a', cursor: name.trim() ? 'pointer' : 'default' }}>
          <Pencil style={{ width: 22, height: 22 }} /> 그리기 시작
        </button>
        <button onClick={() => setNaming(false)} className="flex items-center justify-center text-slate-200 hover:text-white transition-colors" style={{ width: 46, height: 46, borderRadius: 11, background: 'rgba(255,255,255,0.08)' }}>
          <X style={{ width: 24, height: 24 }} />
        </button>
      </div>
    );
  }

  // CCTV 배치 대기
  if (editTool === 'place-cctv') {
    return (
      <div className="absolute z-[600] flex items-center panel" style={{ ...shell, gap: 16 }}>
        <span className="flex items-center font-black text-cyan-300" style={{ gap: 10, fontSize: 22 }}>
          <Video style={{ width: 24, height: 24 }} /> CCTV 배치
        </span>
        <span className="flex items-center text-slate-200 font-bold" style={{ gap: 9, fontSize: 18 }}>
          <MousePointerClick style={{ width: 22, height: 22, color: '#38bdf8' }} /> 지도에서 설치할 위치를 클릭하세요
        </span>
        <button onClick={() => setEditTool(null)} className="flex items-center justify-center text-slate-200 hover:text-white transition-colors" style={{ width: 46, height: 46, borderRadius: 11, background: 'rgba(255,255,255,0.08)' }}>
          <X style={{ width: 24, height: 24 }} />
        </button>
      </div>
    );
  }

  // 기본 툴바
  const Tool = ({ onClick, icon: Icon, label }) => (
    <button onClick={onClick} className="flex items-center font-black transition-all" style={{ gap: 10, padding: '15px 24px', borderRadius: 12, fontSize: 21, cursor: 'pointer', background: 'rgba(255,255,255,0.07)', color: '#e2e8f0', border: '1px solid rgba(56,189,248,0.4)' }}>
      <Icon style={{ width: 24, height: 24, color: '#38bdf8' }} /> {label}
    </button>
  );
  return (
    <div className="absolute z-[600] flex items-center panel" style={{ ...shell, gap: 14, padding: '16px 20px' }}>
      <span className="flex items-center font-black text-cyan-300" style={{ gap: 10, fontSize: 23, paddingLeft: 4, paddingRight: 4 }}>
        <Pencil style={{ width: 26, height: 26 }} /> 편집 모드
      </span>
      <Divider />
      <Tool onClick={() => { setNaming(true); setName(''); }} icon={Square} label="구역 그리기" />
      <Tool onClick={() => setEditTool('place-cctv')} icon={Video} label="CCTV 배치" />
      <Divider />
      <button onClick={toggleEditMode} className="flex items-center font-black text-white transition-all hover:brightness-110" style={{ gap: 9, padding: '15px 22px', borderRadius: 12, fontSize: 21, cursor: 'pointer', background: 'linear-gradient(180deg,#22c55e,#16a34a)' }}>
        <X style={{ width: 24, height: 24 }} /> 편집 종료
      </button>
    </div>
  );
}
