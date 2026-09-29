# SM삼환기업 통합관제 대시보드 (lh-dash-sample)

공사현장 통합관제 대시보드 **UI 목업** — SM삼환기업 전용 시연 버전.
(백엔드/실제 스트림/실제 TTS 없음. 모든 데이터는 목업, 버튼은 시각 피드백만.)

## 스택
- React 19 + Vite 6 + Tailwind CSS 4 + Zustand 5 + MapLibre GL + lucide-react
- 지도 타일: **VWorld(브이월드) WMTS** (위성/일반/하이브리드)

## 개발
```bash
npm install
npm run dev      # http://localhost:5274
```

## 빌드 / 배포
```bash
npm run build    # dist/
```
`main` 브랜치 푸시 시 GitHub Actions 가 자동 빌드 → GitHub Pages 배포.
저장소 **Settings → Pages → Source = "GitHub Actions"** 로 한 번 설정 필요.

### ⚠️ VWorld 지도 관련 (중요)
- VWorld WMTS 는 `Access-Control-Allow-Origin: *` 를 제공하므로 **프록시 서버 불필요** — 정적 호스팅(GitHub Pages)으로 배포 가능.
- 단, VWorld API 키는 **등록된 도메인의 Referer** 에서만 동작한다.
  → 배포 도메인(예: `minyoungkyu.github.io`)을 **VWorld 콘솔에서 해당 키의 사용 도메인으로 등록**해야 배포된 사이트에서 타일이 뜬다. (`localhost` 는 개발용으로 별도 등록)
- API 키는 클라이언트 번들에 포함되어 공개되지만, 도메인 제한으로 보호된다(정적 지도 키의 일반적 운용 방식).

## 주요 기능 (시연)
- 지도 CCTV 핀(회전형/고정형) 클릭 → 재생 팝업 + TTS 방송 UI
- 전체 일괄방송 / SOS 경보 / 스마트밴드 생체 모니터링
- 중장비 핀 통화·타자 TTS
- 기상/체감온도 상세
- 공구별 4분할 관제
- **CCTV 자동감지 비상 시연**: 근로자 쓰러짐/화재/안전모 미착용/경계 침입 → 해당 CCTV 자동 전환 + 적색 비상 팝업
