import { Sun, CloudSun, CloudRain, Cloud, Wind, Droplets, ChevronRight, CloudDrizzle } from 'lucide-react';
import { useWeather } from '@/lib/mock/weather';
import { useUIStore } from '@/stores/useUIStore';

/**
 * WeatherPanel (#8) — 우측 기상/환경 패널.
 * 샘플 WeatherBar 의 데이터·구성(기온/체감/습도/미세먼지/풍향/파고/6일예보/강수확률/체감온도신호등)을
 * 그대로 유지하되 UI 를 새로 디자인. 체감온도계 클릭 → FeelsLikeModal(#8).
 */
const FORECAST_ICONS = { sun: Sun, 'cloud-sun': CloudSun, 'cloud-rain': CloudRain, cloud: Cloud };
const FORECAST_COLORS = { sun: '#fbbf24', 'cloud-sun': '#cbd5e1', 'cloud-rain': '#60a5fa', cloud: '#94a3b8' };
const GRADE = {
  1: { text: '#34d399', bg: 'rgba(16,185,129,0.15)', bd: 'rgba(16,185,129,0.4)' },
  2: { text: '#38bdf8', bg: 'rgba(56,189,248,0.15)', bd: 'rgba(56,189,248,0.4)' },
  3: { text: '#fbbf24', bg: 'rgba(251,191,36,0.15)', bd: 'rgba(251,191,36,0.4)' },
  4: { text: '#fb7185', bg: 'rgba(251,113,133,0.15)', bd: 'rgba(251,113,133,0.4)' },
};

function Section({ title, children }) {
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      <span className="text-slate-400 font-black" style={{ fontSize: 15, letterSpacing: '0.04em' }}>
        {title}
      </span>
      {children}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{ background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(148,163,184,0.16)', borderRadius: 14, padding: 18, ...style }}
    >
      {children}
    </div>
  );
}

export default function WeatherPanel() {
  const d = useWeather();
  const openFeelsLike = useUIStore((s) => s.openFeelsLike);
  if (!d) return null;

  const { current, forecast, rainHourly, trafficLight: tl } = d;
  const maxPop = Math.max(...rainHourly.map((r) => r.popPct));
  const maxItem = rainHourly.find((r) => r.popPct === maxPop);

  return (
    <div className="flex flex-col h-full panel overflow-y-auto thin-scroll" style={{ padding: 24, gap: 20 }}>
      {/* 헤더 */}
      <div className="flex items-center" style={{ gap: 12 }}>
        <CloudSun style={{ width: 28, height: 28, color: '#38bdf8' }} />
        <span className="font-black text-cyan-300" style={{ fontSize: 24 }}>
          기상 · 환경
        </span>
      </div>

      {/* 현재 기온 */}
      <Card style={{ padding: 22 }}>
        <div className="flex items-center" style={{ gap: 20 }}>
          <Sun style={{ width: 60, height: 60, color: '#fbbf24', filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.5))' }} />
          <div className="flex flex-col">
            <div className="flex items-baseline" style={{ gap: 6 }}>
              <span className="font-black text-white font-mono" style={{ fontSize: 64, lineHeight: 1 }}>
                {current.taC}
              </span>
              <span className="text-slate-300 font-bold" style={{ fontSize: 26 }}>
                ℃
              </span>
            </div>
          </div>
          <div className="ml-auto flex flex-col items-end" style={{ gap: 8 }}>
            <div className="flex items-center text-rose-300 font-black" style={{ gap: 8, fontSize: 20 }}>
              체감 {current.feelsLikeC}℃
            </div>
            <div className="flex items-center text-sky-300 font-bold" style={{ gap: 6, fontSize: 18 }}>
              <Droplets style={{ width: 18, height: 18 }} /> 습도 {current.humidityPct}%
            </div>
          </div>
        </div>
      </Card>

      {/* 미세먼지 */}
      <Section title="대기질">
        <div className="grid grid-cols-2" style={{ gap: 12 }}>
          <DustCard label="미세먼지" value={current.pm10.value} grade={current.pm10.grade} gradeLabel={current.pm10.label} />
          <DustCard label="초미세먼지" value={current.pm25.value} grade={current.pm25.grade} gradeLabel={current.pm25.label} />
        </div>
      </Section>

      {/* 풍향 / 풍속 */}
      <Card>
        <div className="flex items-center" style={{ gap: 12 }}>
          <Wind style={{ width: 30, height: 30, color: '#38bdf8' }} />
          <div className="flex flex-col">
            <span className="font-black text-white" style={{ fontSize: 22 }}>
              {current.wind.directionLabel} {(current.wind.speedMs ?? 0).toFixed(1)}
              <span style={{ fontSize: 15, marginLeft: 3 }}>m/s</span>
            </span>
            <span className="text-slate-400 font-bold" style={{ fontSize: 14 }}>
              풍향 / 풍속
            </span>
          </div>
        </div>
      </Card>

      {/* 체감온도계 (클릭 → 상세) */}
      <Section title="체감온도계">
        <button
          onClick={openFeelsLike}
          className="w-full text-left transition-all hover:brightness-110"
          style={{
            background: `linear-gradient(135deg, ${tl.color}22, rgba(0,0,0,0.35))`,
            border: `1.5px solid ${tl.color}77`,
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div className="flex items-center" style={{ gap: 18 }}>
            <span style={{ fontSize: 52, filter: `drop-shadow(0 0 12px ${tl.color})`, lineHeight: 1 }}>{tl.emoji}</span>
            <div className="flex flex-col">
              <span className="font-black" style={{ fontSize: 30, color: tl.color, lineHeight: 1.1 }}>
                {tl.label}
              </span>
              <span className="text-slate-300 font-bold" style={{ fontSize: 16, marginTop: 4 }}>
                체감 {current.feelsLikeC}℃ · 4단계 신호등
              </span>
            </div>
            <div className="ml-auto flex flex-col" style={{ gap: 5 }}>
              {['red', 'orange', 'yellow', 'green'].map((c) => {
                const cmap = { red: '#ef4444', orange: '#f97316', yellow: '#eab308', green: '#22c55e' };
                const on = tl.level === c;
                return (
                  <span
                    key={c}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: on ? cmap[c] : 'rgba(255,255,255,0.1)',
                      boxShadow: on ? `0 0 12px ${cmap[c]}` : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-end text-slate-400 font-bold" style={{ gap: 4, fontSize: 14, marginTop: 12 }}>
            계산식 · 임계기준 · 안전수칙 보기 <ChevronRight style={{ width: 16, height: 16 }} />
          </div>
        </button>
      </Section>

      {/* 시간별 강수확률 */}
      <Section title={`시간별 강수확률 (최대 ${maxPop}% · ${maxItem?.hour}시)`}>
        <Card>
          <div className="flex items-end" style={{ gap: 6, height: 110 }}>
            {rainHourly.map((r) => (
              <div key={r.hour} className="flex-1 flex flex-col items-center justify-end" style={{ gap: 6, height: '100%' }}>
                <span className="font-bold" style={{ fontSize: 13, color: r.popPct === maxPop ? '#fbbf24' : '#94a3b8' }}>
                  {r.popPct}
                </span>
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${Math.max(r.popPct, 3)}%`,
                    background: r.popPct === maxPop ? 'linear-gradient(180deg,#fbbf24,#f59e0b)' : 'linear-gradient(180deg,#38bdf8,#0ea5e9)',
                    minHeight: 4,
                  }}
                />
                <span className="text-slate-500 font-bold" style={{ fontSize: 13 }}>
                  {r.hour}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* 6일 예보 */}
      <Section title="6일 예보">
        <div className="grid grid-cols-6" style={{ gap: 8 }}>
          {forecast.days.map((day, i) => {
            const Icon = FORECAST_ICONS[day.icon] ?? Sun;
            return (
              <div
                key={i}
                className="flex flex-col items-center"
                style={{
                  gap: 8,
                  padding: '14px 4px',
                  borderRadius: 12,
                  background: day.isToday ? 'rgba(56,189,248,0.15)' : 'rgba(0,0,0,0.3)',
                  border: day.isToday ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(148,163,184,0.12)',
                }}
              >
                <span className={day.isToday ? 'text-cyan-300 font-black' : 'text-slate-300 font-bold'} style={{ fontSize: 15 }}>
                  {day.label}
                </span>
                <Icon style={{ width: 26, height: 26, color: FORECAST_COLORS[day.icon] }} />
                <span className="font-black text-white" style={{ fontSize: 15 }}>
                  {day.tMax}°
                </span>
                <span className="text-slate-500 font-bold" style={{ fontSize: 13 }}>
                  {day.tMin ?? '-'}°
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 출처 */}
      <div className="flex items-center text-slate-500 font-bold" style={{ gap: 6, fontSize: 13, marginTop: 'auto', paddingTop: 6 }}>
        <CloudDrizzle style={{ width: 14, height: 14 }} />
        제공: 기상청 · 한국환경공단 (목업)
      </div>
    </div>
  );
}

function DustCard({ label, value, grade, gradeLabel }) {
  const g = GRADE[grade] ?? GRADE[1];
  return (
    <div style={{ background: 'rgba(0,0,0,0.32)', border: `1px solid ${g.bd}`, borderRadius: 14, padding: 16 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <span className="text-slate-400 font-bold" style={{ fontSize: 15 }}>
          {label}
        </span>
        <span className="font-black" style={{ fontSize: 13, color: g.text, background: g.bg, border: `1px solid ${g.bd}`, padding: '3px 10px', borderRadius: 999 }}>
          {gradeLabel}
        </span>
      </div>
      <div className="flex items-baseline" style={{ gap: 4 }}>
        <span className="font-black" style={{ fontSize: 30, color: g.text }}>
          {value ?? '—'}
        </span>
        <span className="text-slate-500 font-bold" style={{ fontSize: 14 }}>
          ㎍/m³
        </span>
      </div>
    </div>
  );
}
