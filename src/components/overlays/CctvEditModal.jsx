import { useState } from 'react';
import { Video, Rotate3d, Camera, Volume2, VolumeX, Trash2, Check, X, Play } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useSiteStore } from '@/stores/useSiteStore';
import HlsVideo from '@/components/HlsVideo';

/**
 * CctvEditModal — CCTV 배치/수정 메타 입력 폼 (편집모드).
 * 이름·위치·공구·유형(이동형/고정형)·스피커·영상주소(HLS) 입력, 영상 미리보기, 저장/삭제.
 */
const Field = ({ label, children }) => (
  <label className="flex flex-col" style={{ gap: 7 }}>
    <span className="text-slate-400 font-bold" style={{ fontSize: 14 }}>{label}</span>
    {children}
  </label>
);
const inputStyle = { fontSize: 15, padding: '11px 14px', borderRadius: 10, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(148,163,184,0.3)', color: '#fff', outline: 'none', width: '100%' };

function Toggle({ options, value, onChange }) {
  return (
    <div className="flex" style={{ gap: 8 }}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button key={String(o.value)} onClick={() => onChange(o.value)} className="flex-1 flex items-center justify-center font-black transition-all" style={{ gap: 7, padding: '10px 12px', borderRadius: 10, fontSize: 14, cursor: 'pointer', background: on ? '#38bdf8' : 'rgba(255,255,255,0.06)', color: on ? '#04121a' : '#cbd5e1', border: `1px solid ${on ? '#38bdf8' : 'rgba(148,163,184,0.3)'}` }}>
            {o.icon && <o.icon style={{ width: 16, height: 16 }} />} {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function CctvEditModal() {
  const form = useUIStore((s) => s.cctvForm);
  const update = useUIStore((s) => s.updateCctvForm);
  const save = useUIStore((s) => s.saveCctvForm);
  const close = useUIStore((s) => s.closeCctvForm);
  const del = useUIStore((s) => s.deleteCctv);
  const zones = useSiteStore((s) => s.zones);
  const [preview, setPreview] = useState('');

  if (!form) return null;
  const isEdit = form.mode === 'edit';

  return (
    <>
      <div className="absolute inset-0 fade-in" style={{ background: 'rgba(0,0,0,0.55)', zIndex: 6000, cursor: 'pointer' }} onClick={close} />
      <div
        className="absolute pop-in flex flex-col"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 560, maxHeight: '88%', overflowY: 'auto', zIndex: 6100, background: 'rgba(6,12,22,0.98)', border: '1.5px solid rgba(56,189,248,0.5)', borderRadius: 20, boxShadow: '0 30px 80px rgba(0,0,0,0.75)', padding: 26, gap: 18 }}
      >
        {/* 헤더 */}
        <div className="flex items-center" style={{ gap: 12 }}>
          <span className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(56,189,248,0.14)', border: '1px solid rgba(56,189,248,0.4)' }}>
            <Video style={{ width: 24, height: 24, color: '#38bdf8' }} />
          </span>
          <span className="font-black text-white" style={{ fontSize: 22 }}>{isEdit ? 'CCTV 수정' : 'CCTV 배치'}</span>
          <button onClick={close} className="ml-auto flex items-center justify-center bg-white/10 hover:bg-rose-500/80 text-white transition-colors" style={{ width: 38, height: 38, borderRadius: 10 }}>
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* 영상 미리보기 */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9', borderRadius: 12, background: '#000', border: '1px solid rgba(148,163,184,0.2)' }}>
          {preview ? (
            <HlsVideo src={preview} style={{ position: 'absolute', inset: 0 }} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: 10 }}>
              <Video style={{ width: 48, height: 48, color: 'rgba(148,163,184,0.5)' }} />
              <button onClick={() => form.streamUrl && setPreview(form.streamUrl)} disabled={!form.streamUrl} className="flex items-center font-bold text-white transition-all disabled:opacity-40" style={{ gap: 7, padding: '9px 16px', borderRadius: 9, fontSize: 14, background: 'rgba(56,189,248,0.2)', border: '1px solid rgba(56,189,248,0.5)', cursor: form.streamUrl ? 'pointer' : 'default' }}>
                <Play style={{ width: 16, height: 16 }} /> 영상 미리보기
              </button>
              <span className="text-slate-500 font-bold" style={{ fontSize: 13 }}>영상 주소 입력 후 미리보기</span>
            </div>
          )}
        </div>

        {/* 폼 */}
        <div className="grid grid-cols-2" style={{ gap: 14 }}>
          <Field label="이름">
            <input value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="예: 정문 출입구" style={inputStyle} />
          </Field>
          <Field label="위치">
            <input value={form.loc} onChange={(e) => update({ loc: e.target.value })} placeholder="예: 1블록 남측" style={inputStyle} />
          </Field>
          <Field label="공구">
            <select value={form.zone} onChange={(e) => update({ zone: e.target.value })} style={inputStyle}>
              <option value="">(미지정)</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </Field>
          <Field label="상태">
            <Toggle value={form.status} onChange={(v) => update({ status: v })} options={[{ value: 'online', label: '가동중' }, { value: 'offline', label: '오프라인' }]} />
          </Field>
          <Field label="유형">
            <Toggle value={form.type} onChange={(v) => update({ type: v })} options={[{ value: 'rotating', label: '이동형', icon: Rotate3d }, { value: 'fixed', label: '고정형', icon: Camera }]} />
          </Field>
          <Field label="스피커">
            <Toggle value={form.hasSpeaker} onChange={(v) => update({ hasSpeaker: v })} options={[{ value: true, label: '있음', icon: Volume2 }, { value: false, label: '없음', icon: VolumeX }]} />
          </Field>
        </div>
        <Field label="영상 주소 (HLS .m3u8)">
          <input value={form.streamUrl} onChange={(e) => update({ streamUrl: e.target.value })} placeholder="https://.../live/stream.m3u8" style={inputStyle} />
        </Field>

        {/* 액션 */}
        <div className="flex items-center" style={{ gap: 10, marginTop: 4 }}>
          {isEdit && (
            <button onClick={() => del(form.id)} className="flex items-center font-black text-white transition-all hover:brightness-110" style={{ gap: 7, padding: '12px 18px', borderRadius: 11, fontSize: 15, background: 'rgba(255,59,92,0.85)', cursor: 'pointer' }}>
              <Trash2 style={{ width: 17, height: 17 }} /> 삭제
            </button>
          )}
          <button onClick={close} className="ml-auto font-bold text-slate-200 transition-all" style={{ padding: '12px 20px', borderRadius: 11, fontSize: 15, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(148,163,184,0.3)', cursor: 'pointer' }}>
            취소
          </button>
          <button onClick={save} className="flex items-center font-black text-white transition-all hover:brightness-110" style={{ gap: 7, padding: '12px 22px', borderRadius: 11, fontSize: 15, background: 'linear-gradient(180deg,#22c55e,#16a34a)', cursor: 'pointer' }}>
            <Check style={{ width: 18, height: 18 }} /> 저장
          </button>
        </div>
      </div>
    </>
  );
}
