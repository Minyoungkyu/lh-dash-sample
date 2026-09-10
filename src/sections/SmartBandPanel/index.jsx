import { Watch, Droplet, Thermometer, WifiOff } from 'lucide-react';
import { WORKERS, BAND_STATUS } from '@/lib/mock/smartband';
import { useUIStore } from '@/stores/useUIStore';

/**
 * SmartBandPanel (#5) — 근로자 스마트밴드 생체 표 (우측 드로어).
 * 실제 운용 필드: 산소포화도(SpO2) · 피부온도 · 소속(2줄) · 상태등 · 위치등록.
 * SOS/위험 행 강조, SOS 행 클릭 → SOS 경보 팝업(#6).
 */
function StatusDot({ status, online }) {
  const s = BAND_STATUS[status] ?? BAND_STATUS.normal;
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <span
        className={status === 'sos' ? 'live-blink' : ''}
        style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, boxShadow: online ? `0 0 8px ${s.color}` : 'none' }}
      />
      <span className="font-black" style={{ fontSize: 15, color: s.color }}>
        {s.label}
      </span>
    </div>
  );
}

const TH = ({ children, w }) => (
  <th className="text-slate-400 font-bold text-left" style={{ fontSize: 15, padding: '0 14px 14px', width: w, whiteSpace: 'nowrap' }}>
    {children}
  </th>
);

export default function SmartBandPanel() {
  const openSos = useUIStore((s) => s.openSos);

  const counts = WORKERS.reduce(
    (a, w) => {
      a.total++;
      a[w.status] = (a[w.status] ?? 0) + 1;
      return a;
    },
    { total: 0 },
  );

  const summary = [
    { key: 'total', label: '총원', value: counts.total, color: '#e2e8f0' },
    { key: 'normal', label: '정상', value: counts.normal ?? 0, color: BAND_STATUS.normal.color },
    { key: 'caution', label: '주의', value: counts.caution ?? 0, color: BAND_STATUS.caution.color },
    { key: 'danger', label: '위험', value: counts.danger ?? 0, color: BAND_STATUS.danger.color },
    { key: 'sos', label: 'SOS', value: counts.sos ?? 0, color: BAND_STATUS.sos.color },
    { key: 'offline', label: '미수신', value: counts.offline ?? 0, color: BAND_STATUS.offline.color },
  ];

  return (
    <div className="flex flex-col h-full panel" style={{ padding: 24, gap: 18 }}>
      <div className="flex items-center" style={{ gap: 12 }}>
        <Watch style={{ width: 28, height: 28, color: '#38bdf8' }} />
        <span className="font-black text-cyan-300" style={{ fontSize: 24 }}>
          스마트밴드 현황
        </span>
      </div>

      {/* 요약 칩 */}
      <div className="grid grid-cols-6" style={{ gap: 10 }}>
        {summary.map((s) => (
          <div key={s.key} className="flex flex-col items-center justify-center" style={{ padding: '14px 4px', borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: `1px solid ${s.color}44` }}>
            <span className="font-black" style={{ fontSize: 32, color: s.color, lineHeight: 1 }}>
              {s.value}
            </span>
            <span className="text-slate-400 font-bold" style={{ fontSize: 14, marginTop: 6 }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* 표 */}
      <div className="flex-1 min-h-0 overflow-y-auto thin-scroll">
        <table className="w-full border-collapse">
          <thead className="sticky top-0" style={{ background: 'rgba(6,12,22,0.98)', zIndex: 2 }}>
            <tr>
              <TH w="96px">상태</TH>
              <TH>근로자</TH>
              <TH>소속</TH>
              <TH w="120px">산소포화도</TH>
              <TH w="110px">피부온도</TH>
              <TH w="120px">위치</TH>
              <TH w="90px">수신</TH>
            </tr>
          </thead>
          <tbody>
            {WORKERS.map((w) => {
              const isSos = w.status === 'sos';
              const isDanger = w.status === 'danger';
              const spo2Color = w.spo2 == null ? '#64748b' : w.spo2 < 90 ? '#ff3b5c' : w.spo2 < 94 ? '#f97316' : '#e2e8f0';
              const tempColor = w.skinTemp == null ? '#64748b' : w.skinTemp >= 37.5 ? '#ff3b5c' : w.skinTemp >= 37 ? '#f97316' : '#e2e8f0';
              return (
                <tr
                  key={w.id}
                  onClick={() => isSos && openSos(w)}
                  className={`transition-colors ${isSos ? 'sos-flash cursor-pointer' : ''}`}
                  style={{
                    borderTop: '1px solid rgba(148,163,184,0.12)',
                    background: isSos ? 'rgba(255,59,92,0.12)' : isDanger ? 'rgba(249,115,22,0.08)' : 'transparent',
                    opacity: w.status === 'offline' ? 0.62 : 1,
                  }}
                >
                  <td style={{ padding: '13px 14px' }}>
                    <StatusDot status={w.status} online={w.online} />
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <div className="font-black text-white" style={{ fontSize: 17 }}>{w.name}</div>
                    <div className="text-slate-500 font-bold" style={{ fontSize: 13 }}>{w.id}</div>
                  </td>
                  <td className="text-slate-300 font-bold" style={{ padding: '13px 14px', fontSize: 15 }}>
                    <div>{w.company}</div>
                    <div className="text-slate-500" style={{ fontSize: 13 }}>{w.team}</div>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <div className="flex items-center" style={{ gap: 8 }}>
                      <Droplet style={{ width: 16, height: 16, color: spo2Color }} />
                      <span className="font-black" style={{ fontSize: 17, color: spo2Color }}>
                        {w.spo2 != null ? `${w.spo2}%` : '---'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <div className="flex items-center" style={{ gap: 8 }}>
                      <Thermometer style={{ width: 16, height: 16, color: tempColor }} />
                      <span className="font-black" style={{ fontSize: 17, color: tempColor }}>
                        {w.skinTemp != null ? `${w.skinTemp}℃` : '---'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <span className="text-slate-500 font-bold" style={{ fontSize: 15 }}>-</span>
                  </td>
                  <td className="text-slate-400 font-bold" style={{ padding: '13px 14px', fontSize: 14 }}>
                    {w.online ? (
                      w.lastSeen
                    ) : (
                      <span className="flex items-center text-slate-500" style={{ gap: 5 }}>
                        <WifiOff style={{ width: 14, height: 14 }} /> {w.lastSeen}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center text-slate-500 font-bold" style={{ gap: 18, fontSize: 13 }}>
        <span className="flex items-center" style={{ gap: 6 }}>
          <Droplet style={{ width: 14, height: 14 }} /> 산소포화도 &lt;90% 위험
        </span>
        <span className="flex items-center" style={{ gap: 6 }}>
          <Thermometer style={{ width: 14, height: 14 }} /> 피부온도 ≥37.5℃ 위험
        </span>
        <span className="ml-auto flex items-center text-rose-400" style={{ gap: 6 }}>
          SOS 행 클릭 → 경보 상세
        </span>
      </div>
    </div>
  );
}
