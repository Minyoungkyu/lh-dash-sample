import { Sun, CloudSun, CloudRain, Cloud, Droplets, Wind, Maximize2 } from 'lucide-react';
import { useWeather } from '@/lib/mock/weather';
import { useUIStore } from '@/stores/useUIStore';

/**
 * HudWeather — 지도 하단 대형 상시표시 날씨 바 (좌/우 패널 사이 전폭).
 * 섹션을 justify-between 으로 전폭 분산 배치해 크게 노출.
 * 기온·체감(신호등)·대기환경·시간별강수·6일예보. 체감 클릭 → 상세, 헤더 → 기상 드로어.
 */
const FC_ICONS = { sun: Sun, 'cloud-sun': CloudSun, 'cloud-rain': CloudRain, cloud: Cloud };
const FC_COLORS = { sun: '#fbbf24', 'cloud-sun': '#cbd5e1', 'cloud-rain': '#60a5fa', cloud: '#94a3b8' };
const DUST = { 1: '#34d399', 2: '#38bdf8', 3: '#fbbf24', 4: '#fb7185' };

const Divider = () => <div style={{ width: 1, height: 92, background: 'rgba(148,163,184,0.18)', flex: '0 0 auto' }} />;

function MiniStat({ icon: Icon, color, value, unit, label }) {
  return (
    <div className="flex items-center" style={{ gap: 13 }}>
      <Icon style={{ width: 32, height: 32, color }} />
      <div className="flex flex-col">
        <span className="font-black text-white" style={{ fontSize: 28, lineHeight: 1 }}>
          {value}<span className="text-slate-300" style={{ fontSize: 18, marginLeft: 3 }}>{unit}</span>
        </span>
        <span className="text-slate-400 font-bold" style={{ fontSize: 17, marginTop: 5 }}>{label}</span>
      </div>
    </div>
  );
}

function DustStat({ value, label, grade }) {
  const color = DUST[grade] ?? DUST[1];
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline" style={{ gap: 5 }}>
        <span className="font-black" style={{ fontSize: 28, color, lineHeight: 1 }}>{value}</span>
        <span className="font-bold" style={{ fontSize: 16, color }}>{label}</span>
      </div>
    </div>
  );
}

export default function HudWeather() {
  const d = useWeather();
  const openFeelsLike = useUIStore((s) => s.openFeelsLike);
  const toggleDock = useUIStore((s) => s.toggleDock);
  if (!d) return null;
  const { current: c, forecast, rainHourly, trafficLight: tl } = d;
  const today = forecast.days.find((x) => x.isToday) ?? forecast.days[0];
  const maxPop = Math.max(...rainHourly.map((r) => r.popPct));

  return (
    <div
      className="absolute panel z-[500] flex items-center justify-between"
      style={{ left: 540, right: 540, bottom: 24, height: 168, padding: '0 40px', borderRadius: 18, pointerEvents: 'auto', gap: 28 }}
    >
      {/* 기온 */}
      <div className="flex items-center" style={{ gap: 18, flex: '0 0 auto' }}>
        <Sun style={{ width: 64, height: 64, color: '#fbbf24', filter: 'drop-shadow(0 0 14px rgba(251,191,36,0.55))' }} />
        <div className="flex flex-col">
          <div className="flex items-baseline" style={{ gap: 4 }}>
            <span className="font-black text-white font-mono" style={{ fontSize: 66, lineHeight: 0.9 }}>{c.taC}</span>
            <span className="text-slate-300 font-bold" style={{ fontSize: 28 }}>℃</span>
          </div>
          <span className="text-slate-400 font-bold" style={{ fontSize: 18, marginTop: 6 }}>
            최고 <span className="text-rose-300">{today.tMax}°</span> · 최저 <span className="text-sky-300">{today.tMin}°</span>
          </span>
        </div>
      </div>

      <Divider />

      {/* 체감온도계 (클릭 → 상세) */}
      <button
        onClick={openFeelsLike}
        className="flex items-center transition-all hover:brightness-110"
        style={{ gap: 16, padding: '16px 22px', borderRadius: 16, background: `linear-gradient(135deg, ${tl.color}26, rgba(0,0,0,0.3))`, border: `1.5px solid ${tl.color}77`, cursor: 'pointer', flex: '0 0 auto' }}
      >
        <span style={{ fontSize: 50, filter: `drop-shadow(0 0 12px ${tl.color})`, lineHeight: 1 }}>{tl.emoji}</span>
        <div className="flex flex-col items-start">
          <span className="font-black" style={{ fontSize: 32, color: tl.color, lineHeight: 1.05 }}>체감 {c.feelsLikeC}℃</span>
          <span className="text-slate-300 font-bold" style={{ fontSize: 18, marginTop: 4 }}>{tl.label} 단계 · 상세 보기</span>
        </div>
        <div className="flex flex-col" style={{ gap: 5, marginLeft: 6 }}>
          {['red', 'orange', 'yellow', 'green'].map((cc) => {
            const cmap = { red: '#ef4444', orange: '#f97316', yellow: '#eab308', green: '#22c55e' };
            const on = tl.level === cc;
            return <span key={cc} style={{ width: 17, height: 17, borderRadius: '50%', background: on ? cmap[cc] : 'rgba(255,255,255,0.12)', boxShadow: on ? `0 0 12px ${cmap[cc]}` : 'none' }} />;
          })}
        </div>
      </button>

      <Divider />

      {/* 습도 / 풍향 */}
      <MiniStat icon={Droplets} color="#38bdf8" value={c.humidityPct ?? '--'} unit="%" label="습도" />
      <MiniStat icon={Wind} color="#38bdf8" value={`${c.wind.directionLabel} ${(c.wind.speedMs ?? 0).toFixed(1)}`} unit="m/s" label="풍향 / 풍속" />

      <Divider />

      {/* 대기질 */}
      <div className="flex items-center" style={{ gap: 22, flex: '0 0 auto' }}>
        <DustStat value={c.pm10.value} label={c.pm10.label} grade={c.pm10.grade} />
        <div className="flex flex-col items-center">
          <span className="text-slate-400 font-bold" style={{ fontSize: 17 }}>미세</span>
          <span className="text-slate-400 font-bold" style={{ fontSize: 17 }}>초미세</span>
        </div>
        <DustStat value={c.pm25.value} label={c.pm25.label} grade={c.pm25.grade} />
      </div>

      <Divider />

      {/* 시간별 강수확률 */}
      <div className="flex flex-col" style={{ gap: 7, flex: '1 1 auto', minWidth: 200, maxWidth: 340 }}>
        <span className="text-slate-400 font-bold" style={{ fontSize: 17 }}>시간별 강수확률</span>
        <div className="flex items-end" style={{ gap: 6, height: 74 }}>
          {rainHourly.map((r) => (
            <div key={r.hour} className="flex-1 flex flex-col items-center justify-end" style={{ gap: 4, height: '100%' }}>
              <span className="font-bold" style={{ fontSize: 14, color: r.popPct === maxPop ? '#fbbf24' : '#94a3b8' }}>{r.popPct}</span>
              <div className="w-full rounded-t" style={{ height: `${Math.max(r.popPct, 4)}%`, minHeight: 4, background: r.popPct === maxPop ? 'linear-gradient(180deg,#fbbf24,#f59e0b)' : 'linear-gradient(180deg,#38bdf8,#0ea5e9)' }} />
              <span className="text-slate-500 font-bold" style={{ fontSize: 14 }}>{r.hour}</span>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* 6일 예보 */}
      <div className="flex flex-col" style={{ gap: 7, flex: '0 0 auto' }}>
        <span className="text-slate-400 font-bold" style={{ fontSize: 17 }}>6일 예보</span>
        <div className="flex" style={{ gap: 8 }}>
          {forecast.days.map((day, i) => {
            const Icon = FC_ICONS[day.icon] ?? Sun;
            return (
              <div key={i} className="flex flex-col items-center" style={{ gap: 5, padding: '8px 10px', borderRadius: 11, background: day.isToday ? 'rgba(56,189,248,0.15)' : 'rgba(0,0,0,0.3)', border: day.isToday ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(148,163,184,0.12)' }}>
                <span className={day.isToday ? 'text-cyan-300 font-black' : 'text-slate-300 font-bold'} style={{ fontSize: 16 }}>{day.label}</span>
                <Icon style={{ width: 24, height: 24, color: FC_COLORS[day.icon] }} />
                <span className="font-black text-white" style={{ fontSize: 16 }}>{day.tMax}°</span>
                <span className="text-slate-500 font-bold" style={{ fontSize: 14 }}>{day.tMin}°</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 예보 상세 */}
      <button
        onClick={() => toggleDock('weather')}
        title="기상 · 환경 상세"
        className="flex items-center justify-center bg-white/8 hover:bg-white/16 text-slate-200 transition-colors"
        style={{ width: 42, height: 42, borderRadius: 11, flex: '0 0 auto' }}
      >
        <Maximize2 style={{ width: 20, height: 20 }} />
      </button>
    </div>
  );
}
