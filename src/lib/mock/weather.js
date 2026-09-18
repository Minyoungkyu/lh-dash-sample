import { create } from 'zustand';

/**
 * 날씨 데이터 — 실서버(/api/weather, 동탄 실시간)에서 가져오고,
 * 실패 시 아래 WEATHER 목업으로 폴백. shape 는 동일.
 */
export const WEATHER = {
  current: {
    taC: 31.4, // 기온
    feelsLikeC: 33.6, // 체감온도
    humidityPct: 68, // 습도
    pm10: { value: 42, grade: 2, label: '보통' },
    pm25: { value: 28, grade: 2, label: '보통' },
    wind: { directionLabel: '남서', speedMs: 3.2, strength: 'mid' }, // strength: low|mid|high
    waveM: 0.6,
    waveStrength: 'low',
  },
  forecast: {
    days: [
      { label: '오늘', icon: 'sun', tMax: 33, tMin: 25, isToday: true },
      { label: '금', icon: 'cloud-sun', tMax: 32, tMin: 24, isToday: false },
      { label: '토', icon: 'cloud-rain', tMax: 28, tMin: 23, isToday: false },
      { label: '일', icon: 'cloud-rain', tMax: 27, tMin: 22, isToday: false },
      { label: '월', icon: 'cloud', tMax: 30, tMin: 23, isToday: false },
      { label: '화', icon: 'sun', tMax: 32, tMin: 24, isToday: false },
    ],
  },
  // 시간별 강수확률(POP %)
  rainHourly: [
    { hour: 15, popPct: 10 },
    { hour: 16, popPct: 20 },
    { hour: 17, popPct: 30 },
    { hour: 18, popPct: 60 },
    { hour: 19, popPct: 80 },
    { hour: 20, popPct: 70 },
    { hour: 21, popPct: 40 },
    { hour: 22, popPct: 20 },
  ],
  // 체감온도 신호등 (4단계)
  trafficLight: {
    level: 'orange', // green|yellow|orange|red
    label: '경고',
    emoji: '😰',
    color: '#f97316',
    season: 'summer', // summer|winter|mild
    thresholds: {
      warn: 31,
      alert: 33,
      danger: 35,
      winter_warn: -3.2,
      winter_alert: -10.5,
      winter_danger: -15.4,
    },
  },
};

// 실데이터 스토어 — 초기값은 목업, 로드 후 실서버 데이터로 교체.
const useWeatherStore = create(() => ({ data: WEATHER, source: 'mock' }));

async function refreshWeather() {
  try {
    const r = await fetch('/api/weather');
    if (!r.ok) return;
    const d = await r.json();
    if (d && d.current) useWeatherStore.setState({ data: d, source: d.source || 'live' });
  } catch {
    /* 네트워크/서버 오류 시 마지막 데이터(초기엔 목업) 유지 */
  }
}

if (typeof window !== 'undefined') {
  refreshWeather();
  setInterval(refreshWeather, 60000); // 60초 폴링
}

export function useWeather() {
  return useWeatherStore((s) => s.data);
}

