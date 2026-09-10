/**
 * 중장비 목업 데이터. 각 공구 근처로 분산 배치.
 *  - kind: excavator(굴착기) | crane(크레인) | dump(덤프) | loader(로더) | pump(펌프카)
 *  - status: 'running'(운행중) | 'idle'(대기) | 'stopped'(정지)
 *  - loc: 공구 내 구체 위치(블록/구역)
 *  - runtime: 금일 누적 가동시간(시간)
 *  - comm: 단말 통신상태 'online'(정상) | 'weak'(약함) | 'offline'(끊김)
 *  - 핀 클릭 → 팝업(통화 / 타자→TTS 전송)
 */
export const EQUIP_LIST = [
  // 브라운스톤 양양
  { id: 'EQ-01', name: '굴착기 01', kind: 'excavator', status: 'running', operator: '김철수', phone: '010-1234-0001', lat: 37.6038, lng: 126.6530, zone: '브라운스톤 양양', loc: '1블록 터파기부', task: '1블록 터파기', runtime: 6.4, comm: 'online' },
  { id: 'EQ-02', name: '타워크레인 01', kind: 'crane', status: 'running', operator: '이영호', phone: '010-1234-0002', lat: 37.6048, lng: 126.6545, zone: '브라운스톤 양양', loc: '1블록 양중구', task: '자재 양중', runtime: 5.1, comm: 'online' },
  // 마곡 SH
  { id: 'EQ-03', name: '덤프트럭 03', kind: 'dump', status: 'idle', operator: '박민재', phone: '010-1234-0003', lat: 37.5725, lng: 126.6255, zone: '마곡 SH', loc: '남측 반출로', task: '토사 반출 대기', runtime: 2.3, comm: 'online' },
  { id: 'EQ-04', name: '로더 02', kind: 'loader', status: 'running', operator: '정대현', phone: '010-1234-0004', lat: 37.5715, lng: 126.6268, zone: '마곡 SH', loc: '자재 야적장', task: '자재 상차', runtime: 7.2, comm: 'online' },
  // 부천광희 재건축
  { id: 'EQ-05', name: '굴착기 02', kind: 'excavator', status: 'stopped', operator: '최윤성', phone: '010-1234-0005', lat: 37.6185, lng: 126.6895, zone: '부천광희 재건축', loc: '2블록 굴착부', task: '점검 중', runtime: 0.8, comm: 'offline' },
  // 이수페타시스 5공장
  { id: 'EQ-06', name: '펌프카 01', kind: 'pump', status: 'running', operator: '한지훈', phone: '010-1234-0006', lat: 37.5852, lng: 126.7145, zone: '이수페타시스 5공장', loc: '4블록 타설부', task: '4블록 타설', runtime: 6.8, comm: 'online' },
  { id: 'EQ-07', name: '덤프트럭 05', kind: 'dump', status: 'running', operator: '오세준', phone: '010-1234-0007', lat: 37.5845, lng: 126.7158, zone: '이수페타시스 5공장', loc: '정문 반출로', task: '토사 반출', runtime: 5.9, comm: 'weak' },
  // 브라운스톤 월곡센트럴
  { id: 'EQ-08', name: '타워크레인 02', kind: 'crane', status: 'idle', operator: '강태우', phone: '010-1234-0008', lat: 37.6418, lng: 126.6255, zone: '브라운스톤 월곡센트럴', loc: '가설 야적장', task: '대기', runtime: 1.5, comm: 'online' },

  // ── 추가 ── 브라운스톤 양양
  { id: 'EQ-09', name: '펌프카 02', kind: 'pump', status: 'running', operator: '김상현', phone: '010-1234-0009', lat: 37.6046, lng: 126.6534, zone: '브라운스톤 양양', loc: '2블록 타설부', task: '2블록 타설', runtime: 4.7, comm: 'online' },
  { id: 'EQ-10', name: '굴착기 03', kind: 'excavator', status: 'idle', operator: '이도경', phone: '010-1234-0010', lat: 37.6032, lng: 126.6548, zone: '브라운스톤 양양', loc: '3블록 대기장', task: '터파기 대기', runtime: 2.0, comm: 'online' },
  { id: 'EQ-11', name: '로더 03', kind: 'loader', status: 'running', operator: '박현수', phone: '010-1234-0011', lat: 37.6055, lng: 126.6528, zone: '브라운스톤 양양', loc: '자재 상차장', task: '자재 상차', runtime: 6.1, comm: 'online' },
  // 추가 ── 마곡 SH
  { id: 'EQ-12', name: '굴착기 04', kind: 'excavator', status: 'running', operator: '정재웅', phone: '010-1234-0012', lat: 37.5728, lng: 126.6262, zone: '마곡 SH', loc: '흙막이 구간', task: '흙막이 굴착', runtime: 7.5, comm: 'online' },
  { id: 'EQ-13', name: '덤프트럭 06', kind: 'dump', status: 'running', operator: '한승기', phone: '010-1234-0013', lat: 37.5718, lng: 126.6252, zone: '마곡 SH', loc: '토사 반출로', task: '토사 반출', runtime: 5.4, comm: 'online' },
  { id: 'EQ-14', name: '로더 04', kind: 'loader', status: 'idle', operator: '오태민', phone: '010-1234-0014', lat: 37.5730, lng: 126.6272, zone: '마곡 SH', loc: '대기장', task: '대기', runtime: 1.2, comm: 'weak' },
  // 추가 ── 부천광희 재건축
  { id: 'EQ-15', name: '타워크레인 03', kind: 'crane', status: 'running', operator: '신동혁', phone: '010-1234-0015', lat: 37.6188, lng: 126.6902, zone: '부천광희 재건축', loc: '1블록 양중구', task: '자재 양중', runtime: 6.6, comm: 'online' },
  { id: 'EQ-16', name: '덤프트럭 07', kind: 'dump', status: 'running', operator: '유재석', phone: '010-1234-0016', lat: 37.6175, lng: 126.6890, zone: '부천광희 재건축', loc: '가설도로', task: '토사 반출', runtime: 5.8, comm: 'online' },
  { id: 'EQ-17', name: '굴착기 05', kind: 'excavator', status: 'stopped', operator: '곽준혁', phone: '010-1234-0017', lat: 37.6192, lng: 126.6912, zone: '부천광희 재건축', loc: '정비 구역', task: '점검 중', runtime: 0.5, comm: 'offline' },
  // 추가 ── 이수페타시스 5공장
  { id: 'EQ-18', name: '타워크레인 04', kind: 'crane', status: 'running', operator: '문세윤', phone: '010-1234-0018', lat: 37.5856, lng: 126.7152, zone: '이수페타시스 5공장', loc: '철골 야적장', task: '철골 양중', runtime: 7.1, comm: 'online' },
  { id: 'EQ-19', name: '펌프카 03', kind: 'pump', status: 'idle', operator: '배성우', phone: '010-1234-0019', lat: 37.5848, lng: 126.7138, zone: '이수페타시스 5공장', loc: '타설 대기장', task: '타설 대기', runtime: 2.6, comm: 'online' },
  { id: 'EQ-20', name: '굴착기 06', kind: 'excavator', status: 'running', operator: '남기훈', phone: '010-1234-0020', lat: 37.5860, lng: 126.7160, zone: '이수페타시스 5공장', loc: '기초 굴착부', task: '기초 굴착', runtime: 6.3, comm: 'weak' },
  // 추가 ── 브라운스톤 월곡센트럴
  { id: 'EQ-21', name: '굴착기 07', kind: 'excavator', status: 'running', operator: '조민석', phone: '010-1234-0021', lat: 37.6424, lng: 126.6244, zone: '브라운스톤 월곡센트럴', loc: '부지 정지구간', task: '부지 정지', runtime: 5.6, comm: 'online' },
  { id: 'EQ-22', name: '덤프트럭 08', kind: 'dump', status: 'idle', operator: '천우진', phone: '010-1234-0022', lat: 37.6414, lng: 126.6262, zone: '브라운스톤 월곡센트럴', loc: '반출 대기장', task: '반출 대기', runtime: 1.8, comm: 'online' },
  { id: 'EQ-23', name: '로더 05', kind: 'loader', status: 'running', operator: '허준영', phone: '010-1234-0023', lat: 37.6430, lng: 126.6250, zone: '브라운스톤 월곡센트럴', loc: '가설재 야적장', task: '가설재 이동', runtime: 6.9, comm: 'online' },
];

export const EQUIP_KIND_LABEL = {
  excavator: '굴착기',
  crane: '크레인',
  dump: '덤프트럭',
  loader: '로더',
  pump: '펌프카',
};

export const EQUIP_STATUS = {
  running: { label: '운행중', color: '#22c55e' },
  idle: { label: '대기', color: '#eab308' },
  stopped: { label: '정지', color: '#94a3b8' },
};

// 단말 통신상태
export const COMM_STATUS = {
  online: { label: '정상', color: '#22c55e' },
  weak: { label: '약함', color: '#eab308' },
  offline: { label: '끊김', color: '#ff3b5c' },
};
