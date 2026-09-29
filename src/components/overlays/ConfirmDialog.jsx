import { AlertTriangle } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

/**
 * ConfirmDialog — 삭제 등 되돌릴 수 없는 작업 확인용 인앱 모달.
 * store.confirmDialog = { message, confirmLabel?, onConfirm } 일 때 표시.
 */
export default function ConfirmDialog() {
  const dialog = useUIStore((s) => s.confirmDialog);
  const close = useUIStore((s) => s.closeConfirm);
  if (!dialog) return null;

  const confirm = () => { dialog.onConfirm?.(); close(); };

  return (
    <>
      <div className="absolute inset-0 fade-in" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 6400, pointerEvents: 'auto' }} onClick={close} />
      <div className="absolute pop-in flex flex-col" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 440, zIndex: 6500, background: 'rgba(10,16,26,0.98)', border: '1.5px solid rgba(255,59,92,0.6)', borderRadius: 18, boxShadow: '0 30px 80px rgba(0,0,0,0.75)', padding: 28, gap: 20, pointerEvents: 'auto' }}>
        <div className="flex items-center" style={{ gap: 13 }}>
          <span className="flex items-center justify-center" style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,59,92,0.15)', border: '1px solid rgba(255,59,92,0.5)', flex: '0 0 auto' }}>
            <AlertTriangle style={{ width: 26, height: 26, color: '#ff3b5c' }} />
          </span>
          <span className="font-black text-white" style={{ fontSize: 19, lineHeight: 1.4 }}>{dialog.message}</span>
        </div>
        <div className="flex items-center justify-end" style={{ gap: 10 }}>
          <button onClick={close} className="font-bold text-slate-200 transition-all" style={{ padding: '12px 22px', borderRadius: 11, fontSize: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(148,163,184,0.35)', cursor: 'pointer' }}>취소</button>
          <button onClick={confirm} className="font-black text-white transition-all hover:brightness-110" style={{ padding: '12px 24px', borderRadius: 11, fontSize: 16, background: 'linear-gradient(180deg,#ff5470,#e11d48)', cursor: 'pointer' }}>{dialog.confirmLabel || '삭제'}</button>
        </div>
      </div>
    </>
  );
}
