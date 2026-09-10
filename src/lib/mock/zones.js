/**
 * 공사 구역(공구) 목업 데이터.
 * 실제 현장은 공구가 서로 수 km 떨어져 여러 곳에 분산 → 좌표도 멀리 배치.
 *  - center: [lat, lng] 구역 중심 (스위처 flyTo / 4분할 중심)
 *  - polygon: 지도 위 구역 경계(위경도 링, 직사각형). 지도 확대/이동/회전 자동 대응.
 *  - status: 'normal' | 'caution' | 'danger'
 */

// 중심에서 직사각형 경계 생성 (h: 위도 반경 ≈ 0.0035 → 약 380m, 경도축 aspect 보정)
const rect = ([lat, lng], h = 0.0035) => {
  const w = h * 1.26; // 위도 37.6° 경도축 보정으로 화면상 정사각형에 가깝게
  return [[lat + h, lng - w], [lat + h, lng + w], [lat - h, lng + w], [lat - h, lng - w]];
};

// 공구별 고유 색상(서로 겹치지 않는 5색). 지도 폴리곤/라벨/스위처/카드에 공통 사용.
export const ZONES = [
  { id: '브라운스톤 양양', name: '브라운스톤 양양', phase: '지상 골조공사', progress: 62, color: '#38bdf8', lead: '검단 1블록', manager: '김현장', phone: '010-2200-0001', period: '~2027.03', address: '인천 서구 검단로 120 (검단신도시 1블록)', todayWork: '지상 3층 골조 타설 · 6~8층 벽체 배근', center: [37.6042, 126.6538], polygon: rect([37.6042, 126.6538]) },
  { id: '마곡 SH', name: '마곡 SH', phase: '터파기 · 흙막이', progress: 34, color: '#a78bfa', lead: '청라 2블록', manager: '이소장', phone: '010-2200-0002', period: '~2027.08', address: '인천 서구 마전동 356 (청라 2블록)', todayWork: '흙막이 H-pile 항타 · 1구간 터파기', center: [37.5720, 126.6260], polygon: rect([37.5720, 126.6260]) },
  { id: '부천광희 재건축', name: '부천광희 재건축', phase: '기초 · 지하공사', progress: 48, color: '#f472b6', lead: '마전 3블록', manager: '박반장', phone: '010-2200-0003', period: '~2027.06', address: '인천 서구 마전로 88 (마전 3블록)', todayWork: '지하 2층 기초 매트 콘크리트 타설', center: [37.6180, 126.6900], polygon: rect([37.6180, 126.6900]) },
  { id: '이수페타시스 5공장', name: '이수페타시스 5공장', phase: '철근 · 콘크리트 타설', progress: 55, color: '#34d399', lead: '가정 4블록', manager: '정기사', phone: '010-2200-0004', period: '~2027.05', address: '인천 서구 가정로 502 (가정 4블록)', todayWork: '4블록 슬래브 타설 · 철골 양중', center: [37.5850, 126.7150], polygon: rect([37.5850, 126.7150]) },
  { id: '브라운스톤 월곡센트럴', name: '브라운스톤 월곡센트럴', phase: '부지 정지 · 가설', progress: 18, color: '#fbbf24', lead: '불로 5블록', manager: '최주임', phone: '010-2200-0005', period: '~2027.11', address: '인천 서구 불로대로 33 (불로 5블록)', todayWork: '부지 정지 · 가설 울타리 및 진입로 설치', center: [37.6420, 126.6250], polygon: rect([37.6420, 126.6250]) },
];

// 전체(오버뷰) 뷰용 bounds — 모든 구역 폴리곤을 감싼다.
export const SITE_BOUNDS = ZONES.flatMap((z) => z.polygon); // [[lat,lng],...]
