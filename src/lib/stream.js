/**
 * 스트림(HLS) URL을 같은 출처(nginx /hls 프록시) 경로로 변환.
 *
 * 배경: 대시보드는 HTTPS(namsa.itu.kr)로 서비스되는데, CCTV 스트림 장비
 * (iptime DDNS 등)는 HTTP만 정상이고 HTTPS는 자체서명 인증서라 브라우저가
 * 직접 로드를 막는다(혼합콘텐츠 / 인증서 거부). 그래서 서버(nginx)가 대신
 * 중계한다: 브라우저 → https://namsa.itu.kr/hls/<host>/<path> → nginx가
 * http://<host>/<path> 로 릴레이.
 *
 * - 절대 URL(http/https)만 프록시 경로로 변환. m3u8 안의 상대경로 세그먼트는
 *   변환된 경로 기준으로 자동 해석되므로 그대로 통한다.
 * - 개발(로컬 http)에선 혼합콘텐츠 문제가 없어 원본 그대로 직접 재생.
 */
export function toStreamSrc(raw) {
  if (!raw) return raw;
  // 개발 환경(http localhost)에선 직접 재생 (dev 서버엔 /hls 프록시 없음)
  if (typeof import.meta !== 'undefined' && import.meta.env && !import.meta.env.PROD) return raw;
  try {
    const u = new URL(raw, window.location.origin);
    if (u.origin === window.location.origin) return raw; // 이미 같은 출처
    return `/hls/${u.host}${u.pathname}${u.search}`;
  } catch {
    return raw;
  }
}
