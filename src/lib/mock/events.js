/**
 * 실시간 이벤트/알림 목업 데이터 (좌측 이벤트 피드용).
 *  - kind: 'sos' | 'sensor' | 'access' | 'equip' | 'cctv' | 'tbm' | 'env'
 *  - level: 'danger' | 'warn' | 'info'
 * 최신순 정렬.
 */
export const EVENTS = [
  { id: 1, time: '12:59:04', kind: 'sos', level: 'danger', zone: '부천광희 재건축', message: 'SOS 호출 발생 — 임주원 (미래ENG)' },
  { id: 2, time: '12:57:41', kind: 'sensor', level: 'danger', zone: '마곡 SH', message: '피부온도 임계 초과 37.6℃ — 정하준' },
  { id: 3, time: '12:55:12', kind: 'access', level: 'warn', zone: '부천광희 재건축', message: '위험구역 미승인 출입 감지 (지하 2층)' },
  { id: 4, time: '12:53:38', kind: 'cctv', level: 'warn', zone: '부천광희 재건축', message: 'CAM-06 신호 끊김 — 점검 필요' },
  { id: 5, time: '12:51:20', kind: 'equip', level: 'info', zone: '마곡 SH', message: '굴착기 02 정지 — 점검 진입' },
  { id: 6, time: '12:49:55', kind: 'env', level: 'warn', zone: '전체', message: '체감온도 경고 단계 진입 (33.6℃)' },
  { id: 7, time: '12:47:02', kind: 'access', level: 'info', zone: '브라운스톤 양양', message: '정문 출입 — 근로자 12명 입장' },
  { id: 8, time: '12:44:31', kind: 'tbm', level: 'info', zone: '전체', message: 'TBM 이수 완료 435명 집계' },
  { id: 9, time: '12:41:17', kind: 'equip', level: 'info', zone: '이수페타시스 5공장', message: '펌프카 01 타설 작업 시작' },
  { id: 10, time: '12:38:49', kind: 'sensor', level: 'warn', zone: '마곡 SH', message: '산소포화도 저하 93% — 박도윤' },
  { id: 11, time: '12:35:26', kind: 'cctv', level: 'info', zone: '브라운스톤 양양', message: 'CAM-08 PTZ 프리셋 순찰 시작' },
  { id: 12, time: '12:32:10', kind: 'access', level: 'info', zone: '브라운스톤 양양', message: '후문 차량 출입 — 레미콘 3대' },
  { id: 13, time: '12:30:44', kind: 'sensor', level: 'danger', zone: '부천광희 재건축', message: '피부온도 임계 초과 37.4℃ — 배준서' },
  { id: 14, time: '12:28:19', kind: 'equip', level: 'info', zone: '이수페타시스 5공장', message: '타워크레인 04 철골 양중 시작' },
  { id: 15, time: '12:26:03', kind: 'access', level: 'info', zone: '브라운스톤 월곡센트럴', message: '진입 게이트 출입 — 근로자 8명 입장' },
  { id: 16, time: '12:23:51', kind: 'cctv', level: 'warn', zone: '부천광희 재건축', message: 'CAM-23 신호 끊김 — 점검 필요' },
  { id: 17, time: '12:21:37', kind: 'sensor', level: 'warn', zone: '브라운스톤 월곡센트럴', message: '산소포화도 저하 93% — 위성찬' },
  { id: 18, time: '12:19:12', kind: 'equip', level: 'info', zone: '마곡 SH', message: '굴착기 04 흙막이 굴착 작업 개시' },
  { id: 19, time: '12:16:48', kind: 'access', level: 'warn', zone: '이수페타시스 5공장', message: '통제구역 접근 감지 (타설 구역)' },
  { id: 20, time: '12:14:22', kind: 'env', level: 'info', zone: '전체', message: '미세먼지 보통 · 초미세 보통 유지' },
  { id: 21, time: '12:11:59', kind: 'equip', level: 'warn', zone: '브라운스톤 양양', message: '굴착기 03 유압 경고 — 점검 권고' },
  { id: 22, time: '12:09:33', kind: 'access', level: 'info', zone: '마곡 SH', message: '자재 반입 차량 출입 — 철근 12t' },
  { id: 23, time: '12:07:05', kind: 'cctv', level: 'info', zone: '브라운스톤 양양', message: 'CAM-14 PTZ 프리셋 순찰 시작' },
  { id: 24, time: '12:04:41', kind: 'sensor', level: 'warn', zone: '이수페타시스 5공장', message: '피부온도 상승 36.8℃ — 진서우' },
  { id: 25, time: '12:02:18', kind: 'tbm', level: 'info', zone: '브라운스톤 월곡센트럴', message: 'TBM 이수 완료 82명 집계' },
  { id: 26, time: '11:59:50', kind: 'equip', level: 'info', zone: '부천광희 재건축', message: '덤프트럭 07 토사 반출 시작' },
  { id: 27, time: '11:57:26', kind: 'access', level: 'info', zone: '브라운스톤 양양', message: '정문 출입 — 근로자 24명 입장' },
  { id: 28, time: '11:54:03', kind: 'cctv', level: 'warn', zone: '브라운스톤 월곡센트럴', message: 'CAM-32 신호 끊김 — 점검 필요' },
  { id: 29, time: '11:51:39', kind: 'sensor', level: 'info', zone: '마곡 SH', message: '생체신호 정상 범위 복귀 — 조준서' },
  { id: 30, time: '11:48:14', kind: 'equip', level: 'info', zone: '이수페타시스 5공장', message: '펌프카 03 타설 대기 진입' },
  { id: 31, time: '11:45:52', kind: 'access', level: 'warn', zone: '부천광희 재건축', message: '위험구역 미승인 출입 감지 (1블록)' },
  { id: 32, time: '11:43:27', kind: 'env', level: 'warn', zone: '전체', message: '체감온도 주의 단계 (31.8℃)' },
  { id: 33, time: '11:40:05', kind: 'access', level: 'info', zone: '브라운스톤 월곡센트럴', message: '후문 차량 출입 — 덤프 5대' },
  { id: 34, time: '11:37:41', kind: 'tbm', level: 'info', zone: '전체', message: '오전 안전점검 완료 — 이상 없음' },
];
