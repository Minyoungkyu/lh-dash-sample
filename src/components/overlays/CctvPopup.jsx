import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Video, VideoOff, Rotate3d, Camera, Truck, UserX, Flame, HardHat, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';
import { useSiteStore } from '@/stores/useSiteStore';
import { cctvKindLabel, CCTV_POWER_LABEL } from '@/lib/mock/cctv';
import TtsComposer from '@/components/TtsComposer';
import HlsVideo from '@/components/HlsVideo';

// 비상상황 아이콘 매핑
const EMG_ICON = { user: UserX, flame: Flame, hardhat: HardHat, shield: ShieldAlert };

/**
 * CctvPopup (#2, #3) — 지도 CCTV 핀 클릭 시 뜨는 재생 팝업.
 *  - 상시재생 X, 클릭 시에만 오픈
 *  - 영상은 목업이라 플레이스홀더 (실제 스트림 미연결)
 *  - 하단: 관리자 문구 → 해당 CCTV 스피커로 TTS 송출 UI (#3, 스피커 탑재 시)
 *  - 좌우 화살표로 카메라 순환 (참고 이미지 스타일)
 */
export default function CctvPopup({ inCell = false, cam: camProp, list, onClose, onSelect }) {
  const selectedCctv = useUIStore((s) => s.selectedCctv);
  const openCctv = useUIStore((s) => s.openCctv);
  const closeCctv = useUIStore((s) => s.closeCctv);
  const splitView = useUIStore((s) => s.splitView);
  const emergencyAlert = useUIStore((s) => s.emergencyAlert);
  const pushToast = useUIStore((s) => s.pushToast);
  const allCctvs = useSiteStore((s) => s.cctvs);

  // inCell 이면 칸이 넘겨준 cam/list/콜백을 사용, 아니면 전역 스토어
  const cam = camProp ?? selectedCctv;
  const cams = list ?? allCctvs;
  const close = onClose ?? closeCctv;
  const select = onSelect ?? openCctv;

  useEffect(() => {
    if (!cam) return;
    const onKey = (e) => {
      // 비상상황 중엔 ESC/화살표로 못 닫음 → "상황 해제" 버튼 필수
      const emgNow = !inCell && useUIStore.getState().emergencyAlert?.camId === cam.id;
      if (emgNow) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cam]);

  if (!cam) return null;
  // 4분할 활성 시: 스테이지(전역) 팝업은 숨기고 SplitView 가 칸 안(inCell)에 렌더
  if (!inCell && splitView) return null;

  const idx = cams.findIndex((c) => c.id === cam.id);
  const step = (dir) => {
    const next = (idx + dir + cams.length) % cams.length;
    select(cams[next]);
  };

  const online = cam.status === 'online';
  // 비상감지 상태 (스테이지 전역 팝업이 이 카메라를 대상으로 트리거된 경우만)
  const emg = !inCell && emergencyAlert && emergencyAlert.camId === cam.id ? emergencyAlert : null;
  const EmgIcon = emg ? EMG_ICON[emg.icon] ?? ShieldAlert : null;
  // 비상상황 해제(확인 처리) — 바깥 클릭이 아니라 이 버튼으로만 닫힘
  const ackEmergency = () => {
    pushToast(`${emg.label} 상황 해제 처리됨 ✓`, 'success');
    close();
  };

  return (
    <>
      <div
        className={emg ? 'absolute inset-0 sos-flash' : 'absolute inset-0 fade-in'}
        style={{ background: emg ? 'rgba(60,0,10,0.55)' : 'rgba(0,0,0,0.55)', zIndex: 6000, cursor: emg ? 'default' : 'pointer' }}
        onClick={emg ? undefined : close}
      />
      <div
        className={emg ? 'absolute pop-in flex flex-col emergency-glow' : 'absolute pop-in flex flex-col'}
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: inCell ? '92%' : 900,
          maxWidth: 900,
          maxHeight: inCell ? '92%' : undefined,
          overflowY: inCell ? 'auto' : undefined,
          zIndex: 6100,
          background: emg ? 'rgba(26,8,12,0.98)' : 'rgba(6,12,22,0.98)',
          border: emg ? '2px solid #ff3b5c' : '1px solid rgba(56,189,248,0.4)',
          borderRadius: 20,
          boxShadow: emg ? undefined : '0 0 60px rgba(0,174,239,0.3), 0 30px 80px rgba(0,0,0,0.75)',
          padding: inCell ? 16 : 28,
          gap: inCell ? 12 : 18,
        }}
      >
        {/* 비상감지 배너 */}
        {emg && (
          <div
            className="flex items-center"
            style={{ gap: 14, padding: '14px 18px', borderRadius: 14, background: 'rgba(255,59,92,0.14)', border: '1px solid rgba(255,59,92,0.5)' }}
          >
            <span
              className="flex items-center justify-center live-blink"
              style={{ width: 46, height: 46, borderRadius: 12, background: `${emg.accent}22`, border: `1.5px solid ${emg.accent}` }}
            >
              {EmgIcon && <EmgIcon style={{ width: 28, height: 28, color: emg.accent }} />}
            </span>
            <div className="flex flex-col">
              <div className="flex items-center" style={{ gap: 10 }}>
                <span className="font-black" style={{ fontSize: 22, color: '#ff3b5c', letterSpacing: '0.02em' }}>
                  비상감지 · {emg.label}
                </span>
                <span className="font-black text-white" style={{ fontSize: 13, background: '#ff3b5c', padding: '3px 10px', borderRadius: 999 }}>
                  AI 자동검출
                </span>
              </div>
              <span className="text-rose-200 font-bold" style={{ fontSize: 14 }}>
                {emg.sub} — {cam.name} 카메라 자동 전환됨
              </span>
            </div>
            {/* 상황 해제 — 이 버튼으로만 비상 팝업이 닫힘(바깥 클릭 잠금) */}
            <button
              onClick={ackEmergency}
              className="ml-auto flex items-center justify-center font-black text-white transition-all hover:brightness-110"
              style={{ gap: 10, padding: '12px 22px', borderRadius: 12, fontSize: 17, background: 'linear-gradient(180deg,#22c55e,#16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,0.4)', whiteSpace: 'nowrap' }}
            >
              <ShieldCheck style={{ width: 22, height: 22 }} />
              상황 해제
            </button>
          </div>
        )}

        {/* 헤더 */}
        <div className="flex items-center" style={{ gap: 14 }}>
          <span
            className="flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: cam.type === 'rotating' ? 'rgba(34,211,238,0.15)' : 'rgba(56,189,248,0.12)',
              border: '1px solid rgba(56,189,248,0.4)',
            }}
          >
            {(cam.mount ?? 'fixed') === 'mobile' ? (
              <Truck style={{ width: 24, height: 24, color: '#38bdf8' }} />
            ) : cam.type === 'rotating' ? (
              <Rotate3d style={{ width: 24, height: 24, color: '#22d3ee' }} />
            ) : (
              <Camera style={{ width: 24, height: 24, color: '#38bdf8' }} />
            )}
          </span>
          <div className="flex flex-col">
            <div className="flex items-center" style={{ gap: 10 }}>
              <span className="font-black text-white" style={{ fontSize: 24 }}>
                {cam.name}
              </span>
              <span className="text-slate-500" style={{ fontSize: 18 }}>
                |
              </span>
              <span className="text-slate-400 font-bold" style={{ fontSize: 17 }}>
                {cam.id} · {cam.zone}
              </span>
            </div>
            <span className="text-cyan-400 font-bold" style={{ fontSize: 14 }}>
              {cctvKindLabel(cam)}{(cam.mount ?? 'fixed') === 'fixed' ? ` · ${CCTV_POWER_LABEL[cam.power] ?? CCTV_POWER_LABEL.ac}` : ''}
            </span>
          </div>
          {/* 비상 중엔 X 숨김 → 해제는 배너의 "상황 해제" 버튼으로만 */}
          {!emg && (
            <button
              onClick={close}
              className="ml-auto flex items-center justify-center bg-white/10 hover:bg-rose-500/85 text-white transition-colors"
              style={{ width: 40, height: 40, borderRadius: 10 }}
            >
              <X style={{ width: 22, height: 22 }} />
            </button>
          )}
        </div>

        {/* 영상 영역 (16:9 플레이스홀더) */}
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: inCell ? undefined : '16 / 9', height: inCell ? 150 : undefined, flexShrink: 0, borderRadius: 14, background: '#000', border: emg ? '1.5px solid rgba(255,59,92,0.7)' : '1px solid rgba(148,163,184,0.2)' }}
        >
          {/* LIVE 뱃지 */}
          {online && (
            <div
              className="absolute flex items-center"
              style={{ top: 14, left: 14, gap: 8, zIndex: 2 }}
            >
              <span className="live-blink" style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff3b5c' }} />
              <span
                className="font-black text-white"
                style={{ fontSize: 15, background: '#ff3b5c', padding: '4px 12px', borderRadius: 7, letterSpacing: '0.06em' }}
              >
                LIVE
              </span>
            </div>
          )}
          {/* 영상: streamUrl 있으면 실제 HLS 재생, 없으면 플레이스홀더 */}
          {online && cam.streamUrl ? (
            <HlsVideo src={cam.streamUrl} style={{ position: 'absolute', inset: 0 }} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: 12 }}>
              {online ? (
                <>
                  <Video style={{ width: 64, height: 64, color: 'rgba(148,163,184,0.5)' }} />
                  <span className="text-slate-500 font-bold" style={{ fontSize: 16 }}>
                    실시간 영상 (스트림 미등록)
                  </span>
                </>
              ) : (
                <>
                  <VideoOff style={{ width: 64, height: 64, color: 'rgba(148,163,184,0.4)' }} />
                  <span className="text-slate-500 font-bold" style={{ fontSize: 16 }}>
                    오프라인 — 신호 없음
                  </span>
                </>
              )}
            </div>
          )}
          {/* 하단 위치 라벨 */}
          <div
            className="absolute font-bold text-white/80"
            style={{ bottom: 12, left: 16, fontSize: 14, textShadow: '0 1px 4px #000' }}
          >
            {cam.zone} · {cam.name}
          </div>
        </div>

        {/* 카메라 순환 */}
        <div className="flex items-center justify-between">
          <span className="text-slate-500 font-bold" style={{ fontSize: 14 }}>
            {idx + 1} / {cams.length}
          </span>
          <div className="flex items-center" style={{ gap: 10 }}>
            <button
              onClick={() => step(-1)}
              className="flex items-center justify-center bg-white/8 hover:bg-white/16 text-white transition-colors"
              style={{ width: 44, height: 40, borderRadius: 10 }}
            >
              <ChevronLeft style={{ width: 24, height: 24 }} />
            </button>
            <button
              onClick={() => step(1)}
              className="flex items-center justify-center bg-white/8 hover:bg-white/16 text-white transition-colors"
              style={{ width: 44, height: 40, borderRadius: 10 }}
            >
              <ChevronRight style={{ width: 24, height: 24 }} />
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div style={{ height: 1, background: 'rgba(148,163,184,0.18)' }} />

        {/* TTS 방송 (#3) — 비상 시엔 상황별 문구로 스피커 유무 관계없이 노출 */}
        {emg ? (
          <TtsComposer targetLabel={`${cam.name} 스피커`} accent={emg.accent} presets={emg.presets} toastType="broadcast" />
        ) : cam.hasSpeaker ? (
          <TtsComposer targetLabel={`${cam.name} 스피커`} accent="#38bdf8" />
        ) : (
          <div className="text-slate-500 font-bold" style={{ fontSize: 15 }}>
            이 카메라에는 방송 스피커가 없습니다.
          </div>
        )}
      </div>
    </>
  );
}
