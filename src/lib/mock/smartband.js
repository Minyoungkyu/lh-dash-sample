/**
 * 스마트밴드 목업 데이터 — 실제 운용 대시보드 필드에 맞춤.
 * 실제 수신 생체값: 산소포화도(SpO2 %) · 피부온도(℃).
 *  - online: 밴드 연결/신호 여부 (상태 표시등). false면 값은 '---'
 *  - locReg: 위치정보 등록 여부
 *  - status: 'normal' | 'caution' | 'danger' | 'sos' | 'offline'
 *  - company(원도급/협력사) + team(세부소속) 2줄 표기
 */
export const BAND_STATUS = {
  normal: { label: '정상', color: '#22c55e' },
  caution: { label: '주의', color: '#eab308' },
  danger: { label: '위험', color: '#f97316' },
  sos: { label: 'SOS', color: '#ff3b5c' },
  offline: { label: '미수신', color: '#64748b' },
};

// 현장 종합 KPI (실제 대시보드 상단 지표) — 사이트 전체 규모
export const SMARTBAND_KPI = {
  attendance: 435, // 금일 출력 인원
  tbm: 435, // TBM 이수자
  gateways: 6, // 동작 중인 게이트웨이
  // sos 는 WORKERS 에서 파생
};

// ※ 이름·소속은 전부 가상(익명) 목업 데이터입니다. 실존 인물/업체와 무관합니다.
export const WORKERS = [
  { id: 'W-1042', name: '김민준', company: '대한건설', team: '골조팀', online: true, spo2: 98, skinTemp: 34.2, locReg: true, zone: '브라운스톤 양양', lastSeen: '방금', status: 'normal' },
  { id: 'W-1043', name: '이서연', company: '대한건설', team: '안전보건팀', online: true, spo2: 97, skinTemp: 34.8, locReg: true, zone: '브라운스톤 양양', lastSeen: '방금', status: 'normal' },
  { id: 'W-1044', name: '박도윤', company: '대한건설', team: '철근팀', online: true, spo2: 93, skinTemp: 37.1, locReg: true, zone: '마곡 SH', lastSeen: '1분 전', status: 'caution' },
  { id: 'W-1045', name: '최지우', company: '대한건설', team: '설비팀', online: true, spo2: 99, skinTemp: 33.9, locReg: true, zone: '부천광희 재건축', lastSeen: '방금', status: 'normal' },
  { id: 'W-1046', name: '정하준', company: '대한건설', team: '골조팀', online: true, spo2: 91, skinTemp: 37.6, locReg: true, zone: '마곡 SH', lastSeen: '방금', status: 'danger' },
  { id: 'W-1047', name: '강시우', company: '대한건설', team: '전기팀', online: false, spo2: null, skinTemp: null, locReg: false, zone: '-', lastSeen: '12분 전', status: 'offline' },
  { id: 'W-1048', name: '윤예준', company: '대한건설', team: '철근팀', online: true, spo2: 98, skinTemp: 34.1, locReg: true, zone: '브라운스톤 양양', lastSeen: '방금', status: 'normal' },
  { id: 'W-1049', name: '임주원', company: '미래ENG', team: '보통인부', online: true, spo2: 88, skinTemp: 38.2, locReg: true, zone: '부천광희 재건축', lastSeen: '방금', status: 'sos' },
  { id: 'W-1050', name: '한이안', company: '대한건설', team: '형틀목공', online: true, spo2: 97, skinTemp: 34.5, locReg: true, zone: '브라운스톤 양양', lastSeen: '방금', status: 'normal' },
  { id: 'W-1051', name: '오건우', company: '대한건설', team: '설비팀', online: false, spo2: null, skinTemp: null, locReg: false, zone: '-', lastSeen: '34분 전', status: 'offline' },
  { id: 'W-1052', name: '신유찬', company: '한울설비', team: '설비팀', online: true, spo2: 96, skinTemp: 35.0, locReg: true, zone: '이수페타시스 5공장', lastSeen: '방금', status: 'normal' },
  { id: 'W-1053', name: '조준서', company: '미래ENG', team: '철근팀', online: true, spo2: 94, skinTemp: 36.9, locReg: true, zone: '마곡 SH', lastSeen: '1분 전', status: 'caution' },
  { id: 'W-1054', name: '배승우', company: '미래ENG', team: '전기팀', online: true, spo2: 98, skinTemp: 33.7, locReg: true, zone: '부천광희 재건축', lastSeen: '방금', status: 'normal' },
  { id: 'W-1055', name: '남지호', company: '미래ENG', team: '보통인부', online: true, spo2: 95, skinTemp: 36.3, locReg: false, zone: '이수페타시스 5공장', lastSeen: '방금', status: 'caution' },

  // ── 브라운스톤 양양 (추가) ──
  { id: 'W-1056', name: '서준영', company: '대한건설', team: '골조팀', online: true, spo2: 98, skinTemp: 34.3, locReg: true, zone: '브라운스톤 양양', lastSeen: '방금', status: 'normal' },
  { id: 'W-1057', name: '김도현', company: '대한건설', team: '철근팀', online: true, spo2: 97, skinTemp: 34.6, locReg: true, zone: '브라운스톤 양양', lastSeen: '방금', status: 'normal' },
  { id: 'W-1058', name: '이준호', company: '동서건설', team: '형틀목공', online: true, spo2: 99, skinTemp: 33.8, locReg: true, zone: '브라운스톤 양양', lastSeen: '1분 전', status: 'normal' },
  { id: 'W-1059', name: '박서진', company: '대한건설', team: '설비팀', online: true, spo2: 96, skinTemp: 35.1, locReg: true, zone: '브라운스톤 양양', lastSeen: '방금', status: 'normal' },
  { id: 'W-1060', name: '정우진', company: '미래ENG', team: '보통인부', online: true, spo2: 94, skinTemp: 36.9, locReg: true, zone: '브라운스톤 양양', lastSeen: '방금', status: 'caution' },
  { id: 'W-1061', name: '최민수', company: '대한건설', team: '전기팀', online: true, spo2: 98, skinTemp: 34.0, locReg: true, zone: '브라운스톤 양양', lastSeen: '방금', status: 'normal' },

  // ── 마곡 SH (추가) ──
  { id: 'W-1062', name: '강준호', company: '대한건설', team: '골조팀', online: true, spo2: 97, skinTemp: 34.7, locReg: true, zone: '마곡 SH', lastSeen: '방금', status: 'normal' },
  { id: 'W-1063', name: '윤성민', company: '미래ENG', team: '철근팀', online: true, spo2: 95, skinTemp: 36.2, locReg: true, zone: '마곡 SH', lastSeen: '1분 전', status: 'caution' },
  { id: 'W-1064', name: '임재현', company: '한울설비', team: '설비팀', online: true, spo2: 98, skinTemp: 34.4, locReg: true, zone: '마곡 SH', lastSeen: '방금', status: 'normal' },
  { id: 'W-1065', name: '한동욱', company: '대한건설', team: '보통인부', online: true, spo2: 93, skinTemp: 37.0, locReg: true, zone: '마곡 SH', lastSeen: '방금', status: 'caution' },
  { id: 'W-1066', name: '오지훈', company: '성진ENG', team: '전기팀', online: true, spo2: 99, skinTemp: 33.6, locReg: true, zone: '마곡 SH', lastSeen: '방금', status: 'normal' },
  { id: 'W-1067', name: '신경민', company: '대한건설', team: '형틀목공', online: false, spo2: null, skinTemp: null, locReg: false, zone: '-', lastSeen: '8분 전', status: 'offline' },

  // ── 부천광희 재건축 (추가) ──
  { id: 'W-1068', name: '조현우', company: '미래ENG', team: '골조팀', online: true, spo2: 98, skinTemp: 34.2, locReg: true, zone: '부천광희 재건축', lastSeen: '방금', status: 'normal' },
  { id: 'W-1069', name: '배준서', company: '대한건설', team: '철근팀', online: true, spo2: 90, skinTemp: 37.4, locReg: true, zone: '부천광희 재건축', lastSeen: '방금', status: 'danger' },
  { id: 'W-1070', name: '남건우', company: '동서건설', team: '설비팀', online: true, spo2: 97, skinTemp: 34.9, locReg: true, zone: '부천광희 재건축', lastSeen: '방금', status: 'normal' },
  { id: 'W-1071', name: '유지호', company: '미래ENG', team: '보통인부', online: true, spo2: 95, skinTemp: 36.4, locReg: true, zone: '부천광희 재건축', lastSeen: '1분 전', status: 'caution' },
  { id: 'W-1072', name: '곽태양', company: '대한건설', team: '전기팀', online: false, spo2: null, skinTemp: null, locReg: false, zone: '-', lastSeen: '15분 전', status: 'offline' },
  { id: 'W-1073', name: '문성호', company: '대한건설', team: '도장팀', online: true, spo2: 98, skinTemp: 34.1, locReg: true, zone: '부천광희 재건축', lastSeen: '방금', status: 'normal' },

  // ── 이수페타시스 5공장 (추가) ──
  { id: 'W-1074', name: '노준영', company: '한울설비', team: '설비팀', online: true, spo2: 97, skinTemp: 34.5, locReg: true, zone: '이수페타시스 5공장', lastSeen: '방금', status: 'normal' },
  { id: 'W-1075', name: '하민재', company: '성진ENG', team: '철근팀', online: true, spo2: 96, skinTemp: 35.2, locReg: true, zone: '이수페타시스 5공장', lastSeen: '방금', status: 'normal' },
  { id: 'W-1076', name: '구본길', company: '대한건설', team: '골조팀', online: true, spo2: 99, skinTemp: 33.7, locReg: true, zone: '이수페타시스 5공장', lastSeen: '방금', status: 'normal' },
  { id: 'W-1077', name: '진서우', company: '미래ENG', team: '보통인부', online: true, spo2: 94, skinTemp: 36.8, locReg: true, zone: '이수페타시스 5공장', lastSeen: '1분 전', status: 'caution' },
  { id: 'W-1078', name: '표승현', company: '대한건설', team: '전기팀', online: true, spo2: 98, skinTemp: 34.3, locReg: true, zone: '이수페타시스 5공장', lastSeen: '방금', status: 'normal' },
  { id: 'W-1079', name: '반지민', company: '동서건설', team: '형틀목공', online: true, spo2: 97, skinTemp: 34.8, locReg: true, zone: '이수페타시스 5공장', lastSeen: '방금', status: 'normal' },

  // ── 브라운스톤 월곡센트럴 (추가) ──
  { id: 'W-1080', name: '선우진', company: '대한건설', team: '골조팀', online: true, spo2: 98, skinTemp: 34.0, locReg: true, zone: '브라운스톤 월곡센트럴', lastSeen: '방금', status: 'normal' },
  { id: 'W-1081', name: '방현수', company: '미래ENG', team: '철근팀', online: true, spo2: 97, skinTemp: 34.6, locReg: true, zone: '브라운스톤 월곡센트럴', lastSeen: '방금', status: 'normal' },
  { id: 'W-1082', name: '채동훈', company: '한울설비', team: '설비팀', online: true, spo2: 95, skinTemp: 36.1, locReg: true, zone: '브라운스톤 월곡센트럴', lastSeen: '1분 전', status: 'caution' },
  { id: 'W-1083', name: '위성찬', company: '대한건설', team: '보통인부', online: true, spo2: 93, skinTemp: 37.1, locReg: true, zone: '브라운스톤 월곡센트럴', lastSeen: '방금', status: 'caution' },
  { id: 'W-1084', name: '도경석', company: '성진ENG', team: '전기팀', online: true, spo2: 99, skinTemp: 33.9, locReg: true, zone: '브라운스톤 월곡센트럴', lastSeen: '방금', status: 'normal' },
  { id: 'W-1085', name: '명재원', company: '대한건설', team: '형틀목공', online: true, spo2: 96, skinTemp: 35.0, locReg: true, zone: '브라운스톤 월곡센트럴', lastSeen: '방금', status: 'normal' },
  { id: 'W-1086', name: '국지완', company: '동서건설', team: '방수팀', online: false, spo2: null, skinTemp: null, locReg: false, zone: '-', lastSeen: '22분 전', status: 'offline' },
];

// SOS 팝업 시연용 대상
export const SOS_DEMO_WORKER = WORKERS.find((w) => w.status === 'sos') ?? WORKERS[0];
