/**
 * CCTV 목업 데이터. 각 공구(멀리 떨어진 5곳) 근처로 분산 배치.
 *  - type: 'rotating'(회전형/PTZ) | 'fixed'(고정형)  → 지도 핀 모양이 달라짐
 *  - status: 'online' | 'offline'
 *  - hasSpeaker: 현장 방송용 스피커 탑재 여부 (TTS 송출 대상)
 *  - loc: 공구 내 구체 위치(블록/구역)
 */
export const CCTV_LIST = [
  // 브라운스톤 양양 (검단)
  { id: 'CAM-01', name: '정문 출입구', type: 'rotating', status: 'online', hasSpeaker: true, lat: 37.6050, lng: 126.6525, zone: '브라운스톤 양양', loc: '정문' },
  { id: 'CAM-02', name: '1블록 타워크레인', type: 'fixed', status: 'online', hasSpeaker: true, lat: 37.6035, lng: 126.6548, zone: '브라운스톤 양양', loc: '1블록' },
  { id: 'CAM-08', name: '현장사무소 앞', type: 'rotating', status: 'online', hasSpeaker: true, lat: 37.6055, lng: 126.6552, zone: '브라운스톤 양양', loc: '사무동' },
  // 마곡 SH (청라)
  { id: 'CAM-03', name: '자재 야적장', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.5730, lng: 126.6248, zone: '마곡 SH', loc: '야적장' },
  { id: 'CAM-09', name: '흙막이 계측구간', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.5712, lng: 126.6272, zone: '마곡 SH', loc: '흙막이' },
  // 부천광희 재건축 (마전)
  { id: 'CAM-04', name: '2블록 굴착부', type: 'rotating', status: 'online', hasSpeaker: true, lat: 37.6190, lng: 126.6888, zone: '부천광희 재건축', loc: '2블록' },
  { id: 'CAM-05', name: '가설도로 진입', type: 'rotating', status: 'online', hasSpeaker: true, lat: 37.6172, lng: 126.6912, zone: '부천광희 재건축', loc: '가설도로' },
  { id: 'CAM-06', name: '3블록 지하층', type: 'fixed', status: 'offline', hasSpeaker: true, lat: 37.6188, lng: 126.6915, zone: '부천광희 재건축', loc: '지하 3층' },
  // 이수페타시스 5공장 (가정)
  { id: 'CAM-07', name: '레미콘 대기소', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.5858, lng: 126.7138, zone: '이수페타시스 5공장', loc: '정문' },
  { id: 'CAM-10', name: '후문 차량통제', type: 'rotating', status: 'online', hasSpeaker: true, lat: 37.5842, lng: 126.7162, zone: '이수페타시스 5공장', loc: '후문' },
  // 브라운스톤 월곡센트럴 (불로)
  { id: 'CAM-11', name: '가설 게이트', type: 'fixed', status: 'online', hasSpeaker: true, lat: 37.6428, lng: 126.6238, zone: '브라운스톤 월곡센트럴', loc: '정문' },
  { id: 'CAM-12', name: '경계 펜스 남측', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.6412, lng: 126.6262, zone: '브라운스톤 월곡센트럴', loc: '남측 경계' },

  // ── 추가 ── 브라운스톤 양양
  { id: 'CAM-13', name: '지하주차장 램프', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.6028, lng: 126.6516, zone: '브라운스톤 양양', loc: '지하 P' },
  { id: 'CAM-14', name: '2블록 골조', type: 'rotating', status: 'online', hasSpeaker: true, lat: 37.6060, lng: 126.6540, zone: '브라운스톤 양양', loc: '2블록' },
  { id: 'CAM-15', name: '자재 창고', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.6020, lng: 126.6555, zone: '브라운스톤 양양', loc: '창고동' },
  { id: 'CAM-16', name: '후문 통로', type: 'fixed', status: 'offline', hasSpeaker: false, lat: 37.6065, lng: 126.6522, zone: '브라운스톤 양양', loc: '후문' },
  // 추가 ── 마곡 SH
  { id: 'CAM-17', name: '진입로 차단기', type: 'rotating', status: 'online', hasSpeaker: true, lat: 37.5738, lng: 126.6240, zone: '마곡 SH', loc: '진입로' },
  { id: 'CAM-18', name: '흙막이 서측', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.5705, lng: 126.6250, zone: '마곡 SH', loc: '서측' },
  { id: 'CAM-19', name: '현장 사무동 앞', type: 'rotating', status: 'online', hasSpeaker: true, lat: 37.5735, lng: 126.6278, zone: '마곡 SH', loc: '사무동' },
  { id: 'CAM-20', name: '토사 반출구', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.5700, lng: 126.6270, zone: '마곡 SH', loc: '반출구' },
  // 추가 ── 부천광희 재건축
  { id: 'CAM-21', name: '1블록 굴착부', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.6195, lng: 126.6905, zone: '부천광희 재건축', loc: '1블록' },
  { id: 'CAM-22', name: '크레인 상부', type: 'rotating', status: 'online', hasSpeaker: true, lat: 37.6178, lng: 126.6885, zone: '부천광희 재건축', loc: '타워크레인' },
  { id: 'CAM-23', name: '지하 3층', type: 'fixed', status: 'offline', hasSpeaker: true, lat: 37.6185, lng: 126.6920, zone: '부천광희 재건축', loc: '지하 3층' },
  { id: 'CAM-24', name: '자재 하역장', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.6170, lng: 126.6908, zone: '부천광희 재건축', loc: '하역장' },
  // 추가 ── 이수페타시스 5공장
  { id: 'CAM-25', name: '타설 구역', type: 'fixed', status: 'online', hasSpeaker: true, lat: 37.5862, lng: 126.7148, zone: '이수페타시스 5공장', loc: '타설구역' },
  { id: 'CAM-26', name: '3층 골조', type: 'rotating', status: 'online', hasSpeaker: false, lat: 37.5848, lng: 126.7130, zone: '이수페타시스 5공장', loc: '3층' },
  { id: 'CAM-27', name: '정문 게이트', type: 'rotating', status: 'online', hasSpeaker: true, lat: 37.5868, lng: 126.7160, zone: '이수페타시스 5공장', loc: '정문' },
  { id: 'CAM-28', name: '자재 야적장', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.5840, lng: 126.7140, zone: '이수페타시스 5공장', loc: '야적장' },
  // 추가 ── 브라운스톤 월곡센트럴
  { id: 'CAM-29', name: '부지 남측', type: 'rotating', status: 'online', hasSpeaker: true, lat: 37.6405, lng: 126.6245, zone: '브라운스톤 월곡센트럴', loc: '남측' },
  { id: 'CAM-30', name: '가설사무소', type: 'fixed', status: 'online', hasSpeaker: false, lat: 37.6435, lng: 126.6255, zone: '브라운스톤 월곡센트럴', loc: '사무동' },
  { id: 'CAM-31', name: '진입 게이트', type: 'fixed', status: 'online', hasSpeaker: true, lat: 37.6438, lng: 126.6268, zone: '브라운스톤 월곡센트럴', loc: '정문' },
  { id: 'CAM-32', name: '경계 동측', type: 'fixed', status: 'offline', hasSpeaker: false, lat: 37.6408, lng: 126.6272, zone: '브라운스톤 월곡센트럴', loc: '동측 경계' },
];

export const CCTV_TYPE_LABEL = {
  rotating: '회전형(PTZ)',
  fixed: '고정형',
};
