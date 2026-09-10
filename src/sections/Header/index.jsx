import { useEffect, useState } from 'react';
import { ShieldCheck, Radio, Siren, UserX, Flame, HardHat, ShieldAlert } from 'lucide-react';
import { SITE } from '@/lib/mock/site';
import { SOS_DEMO_WORKER } from '@/lib/mock/smartband';
import { EMERGENCIES, EMERGENCY_ORDER } from '@/lib/mock/emergency';
import { useUIStore } from '@/stores/useUIStore';

// 비상상황 아이콘 매핑
const EMG_ICON = { user: UserX, flame: Flame, hardhat: HardHat, shield: ShieldAlert };

/**
 * Header — 상단 브랜드/시계 + 전역 액션.
 *  - 전체 일괄방송 버튼 (#4)
 *  - SOS 발생 (스마트밴드 시연) 버튼 → SOS 경보 팝업(#6)
 *  - CCTV 자동감지 비상 4종 (쓰러짐/화재/안전모/경계) → 해당 CCTV 비상 팝업
 */
function EmergencyButton({ type }) {
  const cfg = EMERGENCIES[type];
  const trigger = useUIStore((s) => s.triggerEmergency);
  const Icon = EMG_ICON[cfg.icon] ?? ShieldAlert;
  return (
    <button
      onClick={() => trigger(type)}
      title={`CCTV 자동감지 시연: ${cfg.label}`}
      className="flex items-center font-black text-white transition-all hover:brightness-125"
      style={{
        gap: 8,
        padding: '11px 15px',
        borderRadius: 12,
        fontSize: 15,
        color: cfg.accent,
        background: 'rgba(10,20,34,0.9)',
        border: `1.5px solid ${cfg.accent}88`,
        boxShadow: `0 3px 12px ${cfg.accent}22`,
      }}
    >
      <Icon style={{ width: 20, height: 20 }} />
      {cfg.label}
    </button>
  );
}
function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const p2 = (n) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}.${p2(now.getMonth() + 1)}.${p2(now.getDate())} (${days[now.getDay()]})`;
  const timeStr = `${p2(now.getHours())}:${p2(now.getMinutes())}:${p2(now.getSeconds())}`;
  return (
    <div className="flex flex-col items-end">
      <span className="font-black text-white font-mono" style={{ fontSize: 40, lineHeight: 1, letterSpacing: '0.02em' }}>
        {timeStr}
      </span>
      <span className="text-slate-400 font-bold" style={{ fontSize: 17, marginTop: 4 }}>
        {dateStr}
      </span>
    </div>
  );
}

export default function Header() {
  const openBroadcast = useUIStore((s) => s.openBroadcast);
  const openSos = useUIStore((s) => s.openSos);

  return (
    <div className="flex items-center h-full panel" style={{ padding: '0 36px', gap: 28, borderRadius: 20 }}>
      {/* 로고 / 현장명 */}
      <div className="flex items-center" style={{ gap: 18 }}>
        <div
          className="flex items-center justify-center"
          style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(160deg,#0ea5e9,#0369a1)', boxShadow: '0 0 24px rgba(14,165,233,0.5)' }}
        >
          <ShieldCheck style={{ width: 34, height: 34, color: '#fff' }} />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-white" style={{ fontSize: 30, letterSpacing: '0.01em' }}>
            LH 남사동탄 통합관제 대시보드
          </span>
          <span className="text-cyan-300 font-bold" style={{ fontSize: 17 }}>
            {SITE.name} <span className="text-slate-500">· {SITE.code}</span>
          </span>
        </div>
      </div>

      {/* 액션 */}
      <div className="ml-auto flex items-center" style={{ gap: 16 }}>
        {/* CCTV 자동감지 비상 시연 그룹 */}
        <div className="flex flex-col" style={{ gap: 6 }}>
          <span className="text-slate-500 font-bold" style={{ fontSize: 12, letterSpacing: '0.05em', paddingLeft: 2 }}>
            CCTV 자동감지 시연
          </span>
          <div className="flex items-center" style={{ gap: 8 }}>
            {EMERGENCY_ORDER.map((type) => (
              <EmergencyButton key={type} type={type} />
            ))}
          </div>
        </div>

        <div style={{ width: 1, height: 52, background: 'rgba(148,163,184,0.25)' }} />

        <button
          onClick={() => openSos(SOS_DEMO_WORKER)}
          title="스마트밴드 시연: SOS 경보 팝업 띄우기"
          className="flex items-center font-black text-white transition-all hover:brightness-110"
          style={{ gap: 10, padding: '14px 20px', borderRadius: 14, fontSize: 18, background: 'linear-gradient(180deg,#ff3b5c,#e11d48)', boxShadow: '0 6px 20px rgba(255,59,92,0.4)' }}
        >
          <Siren style={{ width: 22, height: 22 }} />
          SOS 발생
        </button>
        <button
          onClick={openBroadcast}
          className="flex items-center font-black text-white transition-all hover:brightness-110"
          style={{ gap: 10, padding: '14px 20px', borderRadius: 14, fontSize: 18, background: 'linear-gradient(180deg,#f59e0b,#d97706)', boxShadow: '0 6px 20px rgba(245,158,11,0.4)' }}
        >
          <Radio style={{ width: 22, height: 22 }} />
          전체 일괄방송
        </button>

        <div style={{ width: 1, height: 52, background: 'rgba(148,163,184,0.25)' }} />
        <Clock />
      </div>
    </div>
  );
}
