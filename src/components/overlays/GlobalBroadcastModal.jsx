import { useEffect } from 'react';
import { X, Radio, MapPin } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useSiteStore } from '@/stores/useSiteStore';
import TtsComposer from '@/components/TtsComposer';

/**
 * GlobalBroadcastModal (#4) — 전체 CCTV 스피커 일괄 방송.
 * (목업: 실제 송출 없음, 스피커 보유 카메라 목록만 표기 + 전송 토스트)
 */
export default function GlobalBroadcastModal() {
  const open = useUIStore((s) => s.broadcastOpen);
  const close = useUIStore((s) => s.closeBroadcast);
  const cctvs = useSiteStore((s) => s.cctvs);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const speakers = cctvs.filter((c) => c.hasSpeaker && c.status === 'online');

  return (
    <>
      <div className="absolute inset-0 fade-in" style={{ background: 'rgba(0,0,0,0.6)', zIndex: 6200 }} onClick={close} />
      <div
        className="absolute pop-in flex flex-col"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 820,
          zIndex: 6300,
          background: 'rgba(6,12,22,0.98)',
          border: '1px solid rgba(245,158,11,0.5)',
          borderRadius: 20,
          boxShadow: '0 0 60px rgba(245,158,11,0.28), 0 30px 80px rgba(0,0,0,0.75)',
          padding: 30,
          gap: 22,
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center" style={{ gap: 14 }}>
          <span
            className="flex items-center justify-center"
            style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(245,158,11,0.16)', border: '1px solid rgba(245,158,11,0.45)' }}
          >
            <Radio style={{ width: 26, height: 26, color: '#f59e0b' }} />
          </span>
          <div className="flex flex-col">
            <span className="font-black text-white" style={{ fontSize: 25 }}>
              전체 일괄 방송
            </span>
            <span className="text-amber-400 font-bold" style={{ fontSize: 15 }}>
              스피커 보유 CCTV {speakers.length}대에 동시 송출
            </span>
          </div>
          <button
            onClick={close}
            className="ml-auto flex items-center justify-center bg-white/10 hover:bg-rose-500/85 text-white transition-colors"
            style={{ width: 40, height: 40, borderRadius: 10 }}
          >
            <X style={{ width: 22, height: 22 }} />
          </button>
        </div>

        {/* 대상 목록 */}
        <div
          className="flex flex-wrap"
          style={{ gap: 8, padding: '16px 18px', borderRadius: 14, background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(148,163,184,0.15)', maxHeight: 140, overflowY: 'auto' }}
        >
          {speakers.map((c) => (
            <span
              key={c.id}
              className="flex items-center text-slate-200 font-bold"
              style={{ gap: 6, fontSize: 14, padding: '6px 11px', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}
            >
              <MapPin style={{ width: 14, height: 14, color: '#f59e0b' }} />
              {c.name}
            </span>
          ))}
        </div>

        <div style={{ height: 1, background: 'rgba(148,163,184,0.18)' }} />

        <TtsComposer
          targetLabel={`전체 CCTV ${speakers.length}대`}
          accent="#f59e0b"
          toastType="broadcast"
          presets={['전 근로자에게 알립니다. 작업을 중지하고 대피해 주세요.', '점심시간입니다. 안전하게 이동해 주세요.', '금일 작업을 종료합니다. 정리정돈 후 퇴근해 주세요.']}
        />
      </div>
    </>
  );
}
