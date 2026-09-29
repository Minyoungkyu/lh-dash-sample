/**
 * 현장 기본 정보 (목업).
 * 실제 현장 좌표가 확정되면 center/name 만 교체하면 된다.
 */
export const SITE = {
  name: 'SM삼환기업 스마트 현장관제',
  code: 'SM-SMC',
  center: [37.6050, 126.6660], // 5개 공구를 아우르는 오버뷰 중심 (임의)
  zoom: 12,
  minZoom: 9,
  maxZoom: 19,
};

// VWorld(브이월드) WMTS 타일 — 클라이언트(SM삼환) 전용 버전은 국내 VWorld 지도 사용.
// VWorld WMTS 는 Access-Control-Allow-Origin:* 를 주므로 WebGL(MapLibre) 에 직접 사용 가능 → 프록시 불필요.
// 표준 웹메르카토르(EPSG:3857, z/y/x)라 raster 소스에 그대로 들어감.
//  - base: 일반 지도 / satellite: 위성영상 / hybrid: (투명) 위성 위 도로·지명 라벨 오버레이
// ※ API 키는 VWorld 콘솔에서 '사용 도메인(localhost + 배포도메인)' 이 등록돼야 동작(도메인 Referer 검증).
// 운영 배포는 VITE_VWORLD_KEY(빌드 주입)=레퍼런스 키, 로컬 dev는 아래 기본키.
const VWORLD_KEY = import.meta.env.VITE_VWORLD_KEY || '37A0AF9A-8713-33A2-9CBC-636D6ABE0012';
const VWORLD = `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}`;
export const TILE = {
  base: `${VWORLD}/Base/{z}/{y}/{x}.png`,
  satellite: `${VWORLD}/Satellite/{z}/{y}/{x}.jpeg`,
  hybrid: `${VWORLD}/Hybrid/{z}/{y}/{x}.png`,
  attribution: '© VWorld',
};
