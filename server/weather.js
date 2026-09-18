// 동탄(화성시) 실시간 기상/대기 수집 → 프론트 날씨패널 shape 로 매핑.
// 출처: 공공데이터포털(기상청 초단기실황/단기예보/중기예보 + 에어코리아 미세먼지).
// 해상 파고는 내륙이라 제외.

const DATA_KEY = process.env.DATA_GO_KR_KEY;

// 동탄신도시 중심 좌표 → 기상청 격자(nx,ny)
const DONGTAN = { lat: 37.2013, lng: 127.098 };
const AIR_STATION = '동탄'; // 에어코리아 화성시 동탄 측정소
const MID_LAND_REG = '11B00000'; // 중기육상: 서울·인천·경기
const MID_TA_REG = '11B20601'; // 중기기온: 수원(화성 관할)

const NCST_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
const VILAGE_URL = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
const AIR_URL = 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';
const MIDLAND_URL = 'https://apis.data.go.kr/1360000/MidFcstInfoService/getMidLandFcst';
const MIDTA_URL = 'https://apis.data.go.kr/1360000/MidFcstInfoService/getMidTa';

// ── 위경도 → 기상청 격자 (Lambert Conformal Conic, KMA dfs_xy_conv) ──
function dfsXy(lat, lon) {
  const RE = 6371.00877, GRID = 5.0, SLAT1 = 30.0, SLAT2 = 60.0, OLON = 126.0, OLAT = 38.0, XO = 43, YO = 136;
  const D = Math.PI / 180;
  const re = RE / GRID, s1 = SLAT1 * D, s2 = SLAT2 * D, ol = OLON * D, oa = OLAT * D;
  let sn = Math.tan(Math.PI * 0.25 + s2 * 0.5) / Math.tan(Math.PI * 0.25 + s1 * 0.5);
  sn = Math.log(Math.cos(s1) / Math.cos(s2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + s1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(s1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + oa * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  let ra = Math.tan(Math.PI * 0.25 + lat * D * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * D - ol;
  if (theta > Math.PI) theta -= 2 * Math.PI;
  if (theta < -Math.PI) theta += 2 * Math.PI;
  theta *= sn;
  return { nx: Math.floor(ra * Math.sin(theta) + XO + 0.5), ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5) };
}
const GRID = dfsXy(DONGTAN.lat, DONGTAN.lng);

// ── 공통 ──
async function getJson(url, params) {
  const qs = new URLSearchParams({ serviceKey: DATA_KEY, ...params });
  const r = await fetch(`${url}?${qs}`, { signal: AbortSignal.timeout(8000) });
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { throw new Error('parse: ' + text.slice(0, 120)); }
  const resp = body.response;
  if (!resp || (resp.header && !['00', '0'].includes(resp.header.resultCode))) {
    throw new Error('api: ' + (resp?.header?.resultMsg || text.slice(0, 120)));
  }
  // 1360000(KMA): body.items.item / B552584(에어코리아): body.items(배열 직접)
  const raw = resp.body?.items;
  const items = Array.isArray(raw) ? raw : (raw?.item ?? []);
  return Array.isArray(items) ? items : [items];
}
const pad2 = (n) => String(n).padStart(2, '0');
const num = (v) => (v == null || v === '' ? null : Number(v));

// ── 풍향/강도/아이콘/등급 ──
const DIR8 = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
const vecToDir = (deg) => (deg == null ? '-' : DIR8[Math.round((deg % 360) / 45) % 8]);
const windStrength = (ms) => (ms == null ? 'low' : ms >= 9 ? 'high' : ms >= 4 ? 'mid' : 'low');
const DUST_LABEL = { 1: '좋음', 2: '보통', 3: '나쁨', 4: '매우나쁨' };
function skyIcon(sky, pty) {
  if (pty && Number(pty) > 0) return 'cloud-rain';
  const s = Number(sky);
  if (s <= 1) return 'sun';
  if (s === 3) return 'cloud-sun';
  return 'cloud';
}

// ── 체감온도 (기상청 공식: 여름 습구온도식 / 겨울 풍속식) ──
function feelsLike(ta, rh, wsMs) {
  if (ta == null) return ta;
  const m = new Date().getMonth() + 1;
  if (m >= 5 && m <= 9 && ta >= 20) {
    const Tw = ta * Math.atan(0.151977 * Math.pow(rh + 8.313659, 0.5)) + Math.atan(ta + rh) - Math.atan(rh - 1.67633) + 0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 4.686035;
    return Math.round((-0.2442 + 0.55399 * Tw + 0.45535 * ta - 0.0022 * Tw * Tw + 0.00278 * Tw * ta + 3.0) * 10) / 10;
  }
  if ((m >= 11 || m <= 3) && ta <= 10) {
    const V = (wsMs ?? 0) * 3.6; // km/h
    if (V > 4.8) return Math.round((13.12 + 0.6215 * ta - 11.37 * Math.pow(V, 0.16) + 0.3965 * Math.pow(V, 0.16) * ta) * 10) / 10;
  }
  return ta;
}
function trafficLight(feels) {
  const m = new Date().getMonth() + 1;
  const season = m >= 5 && m <= 9 ? 'summer' : (m >= 11 || m <= 3) ? 'winter' : 'mild';
  const thresholds = { warn: 31, alert: 33, danger: 35, winter_warn: -3.2, winter_alert: -10.5, winter_danger: -15.4 };
  const L = {
    green: { level: 'green', label: '관심', emoji: '🙂', color: '#22c55e' },
    yellow: { level: 'yellow', label: '주의', emoji: '😅', color: '#eab308' },
    orange: { level: 'orange', label: '경고', emoji: '😰', color: '#f97316' },
    red: { level: 'red', label: '위험', emoji: '🥵', color: '#ef4444' },
  };
  let k = 'green';
  if (season === 'summer') k = feels >= thresholds.danger ? 'red' : feels >= thresholds.alert ? 'orange' : feels >= thresholds.warn ? 'yellow' : 'green';
  else if (season === 'winter') k = feels <= thresholds.winter_danger ? 'red' : feels <= thresholds.winter_alert ? 'orange' : feels <= thresholds.winter_warn ? 'yellow' : 'green';
  return { ...L[k], season, thresholds };
}

// ── base_time 계산 ──
function ncstBase() {
  const d = new Date();
  const cur = new Date(d); cur.setMinutes(0, 0, 0);
  const prev = new Date(cur.getTime() - 3600000);
  const f = (x) => [`${x.getFullYear()}${pad2(x.getMonth() + 1)}${pad2(x.getDate())}`, `${pad2(x.getHours())}00`];
  return [f(cur), f(prev)];
}
function vilageBase() {
  const bases = [2, 5, 8, 11, 14, 17, 20, 23];
  const d = new Date(Date.now() - 30 * 60000);
  const cand = bases.filter((h) => h <= d.getHours());
  if (!cand.length) { const p = new Date(d.getTime() - 86400000); return [`${p.getFullYear()}${pad2(p.getMonth() + 1)}${pad2(p.getDate())}`, '2300']; }
  return [`${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`, `${pad2(Math.max(...cand))}00`];
}
function midTmFc() {
  const d = new Date(Date.now() - 30 * 60000);
  const day = `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
  if (d.getHours() >= 18) return day + '1800';
  if (d.getHours() >= 6) return day + '0600';
  const p = new Date(d.getTime() - 86400000);
  return `${p.getFullYear()}${pad2(p.getMonth() + 1)}${pad2(p.getDate())}` + '1800';
}

// ── 개별 수집 ──
async function fetchNcst() {
  for (const [bd, bt] of ncstBase()) {
    try {
      const items = await getJson(NCST_URL, { pageNo: 1, numOfRows: 100, dataType: 'JSON', base_date: bd, base_time: bt, nx: GRID.nx, ny: GRID.ny });
      if (items.length) {
        const v = Object.fromEntries(items.map((it) => [it.category, it.obsrValue]));
        return { taC: num(v.T1H), humidityPct: num(v.REH), wsd: num(v.WSD), vec: num(v.VEC), pty: num(v.PTY) };
      }
    } catch { /* 다음 후보 */ }
  }
  return null;
}
async function fetchVilage() {
  const [bd, bt] = vilageBase();
  const items = await getJson(VILAGE_URL, { pageNo: 1, numOfRows: 1000, dataType: 'JSON', base_date: bd, base_time: bt, nx: GRID.nx, ny: GRID.ny });
  return items; // fcstDate/fcstTime/category/fcstValue
}
async function fetchAir() {
  const items = await getJson(AIR_URL, { returnType: 'json', stationName: AIR_STATION, dataTerm: 'DAILY', ver: '1.3', numOfRows: 1, pageNo: 1 });
  const it = items[0] || {};
  return {
    pm10: { value: num(it.pm10Value), grade: num(it.pm10Grade), label: DUST_LABEL[num(it.pm10Grade)] ?? '-' },
    pm25: { value: num(it.pm25Value), grade: num(it.pm25Grade), label: DUST_LABEL[num(it.pm25Grade)] ?? '-' },
  };
}
async function fetchMid() {
  const tmFc = midTmFc();
  const [land, ta] = await Promise.all([
    getJson(MIDLAND_URL, { pageNo: 1, numOfRows: 10, dataType: 'JSON', regId: MID_LAND_REG, tmFc }).then((a) => a[0] || {}).catch(() => ({})),
    getJson(MIDTA_URL, { pageNo: 1, numOfRows: 10, dataType: 'JSON', regId: MID_TA_REG, tmFc }).then((a) => a[0] || {}).catch(() => ({})),
  ]);
  return { land, ta };
}

// 중기 wf 문구 → 아이콘
function wfIcon(wf) {
  if (!wf) return 'cloud';
  if (wf.includes('비') || wf.includes('소나기')) return 'cloud-rain';
  if (wf.includes('눈')) return 'cloud-rain';
  if (wf.includes('구름많')) return 'cloud';
  if (wf.includes('흐')) return 'cloud';
  if (wf.includes('구름조금') || wf.includes('구름')) return 'cloud-sun';
  if (wf.includes('맑')) return 'sun';
  return 'cloud';
}

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export async function collectWeather() {
  const [ncst, vilageRes, air, mid] = await Promise.all([
    fetchNcst().catch(() => null),
    fetchVilage().catch(() => []),
    fetchAir().catch(() => null),
    fetchMid().catch(() => ({ land: {}, ta: {} })),
  ]);
  const vilage = vilageRes || [];

  // 현재값
  const taC = ncst?.taC ?? null;
  const humidityPct = ncst?.humidityPct ?? null;
  const feels = feelsLike(taC, humidityPct ?? 50, ncst?.wsd);

  // 시간별 강수확률 (POP) — 향후 8개 슬롯
  const now = new Date();
  const nowKey = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}${pad2(now.getHours())}00`;
  const rainHourly = vilage
    .filter((it) => it.category === 'POP' && `${it.fcstDate}${it.fcstTime}` > nowKey)
    .slice(0, 8)
    .map((it) => ({ hour: Number(it.fcstTime.slice(0, 2)), popPct: num(it.fcstValue) ?? 0 }));

  // 일자별 min/max/아이콘 (단기예보)
  const byDate = {};
  for (const it of vilage) {
    const d = it.fcstDate; if (!d) continue;
    byDate[d] = byDate[d] || {};
    if (it.category === 'TMN') byDate[d].tMin = Math.round(num(it.fcstValue));
    if (it.category === 'TMX') byDate[d].tMax = Math.round(num(it.fcstValue));
    if (it.fcstTime === '1200') { if (it.category === 'SKY') byDate[d].sky = it.fcstValue; if (it.category === 'PTY') byDate[d].pty = it.fcstValue; }
  }

  // 6일 예보 (오늘~+5): 단기예보 우선, 부족분은 중기예보
  const days = [];
  for (let i = 0; i < 6; i++) {
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const key = `${dt.getFullYear()}${pad2(dt.getMonth() + 1)}${pad2(dt.getDate())}`;
    const label = i === 0 ? '오늘' : WEEK[dt.getDay()];
    const near = byDate[key];
    let tMin = near?.tMin ?? null, tMax = near?.tMax ?? null, icon = near ? skyIcon(near.sky, near.pty) : null;
    if ((tMin == null || tMax == null) && i >= 3) {
      tMin = tMin ?? num(mid.ta[`taMin${i}`]);
      tMax = tMax ?? num(mid.ta[`taMax${i}`]);
      icon = icon ?? wfIcon(mid.land[`wf${i}Pm`] || mid.land[`wf${i}Am`]);
    }
    days.push({ label, icon: icon ?? 'cloud', tMax, tMin, isToday: i === 0 });
  }

  return {
    current: {
      taC,
      feelsLikeC: feels,
      humidityPct,
      pm10: air?.pm10 ?? { value: null, grade: null, label: '-' },
      pm25: air?.pm25 ?? { value: null, grade: null, label: '-' },
      wind: { directionLabel: vecToDir(ncst?.vec), speedMs: ncst?.wsd ?? null, strength: windStrength(ncst?.wsd) },
    },
    forecast: { days },
    rainHourly,
    trafficLight: trafficLight(feels ?? taC ?? 0),
    region: '경기 화성시 동탄',
    grid: GRID,
    updatedAt: new Date().toISOString(),
    source: 'live',
  };
}
