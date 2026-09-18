import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

/**
 * HlsVideo — HLS(.m3u8) 스트림 재생. hls.js 사용(사파리는 네이티브).
 * 스트림 서버의 CORS/HTTPS 설정에 따라 재생 여부가 달라질 수 있음.
 */
export default function HlsVideo({ src, style }) {
  const ref = useRef(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;
    setErr(null);
    let hls;
    if (Hls.isSupported()) {
      // Chrome/Edge/Firefox: hls.js(MSE) 우선
      hls = new Hls({ enableWorker: true, lowLatencyMode: true, liveDurationInfinity: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e, data) => { if (data?.fatal) setErr('스트림을 불러올 수 없습니다 (CORS/주소 확인)'); });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src; // Safari 네이티브 HLS
    } else {
      video.src = src;
    }
    const p = video.play?.();
    if (p && p.catch) p.catch(() => {});
    return () => { if (hls) hls.destroy(); };
  }, [src]);

  return (
    <div style={{ position: 'relative', ...style }}>
      <video ref={ref} muted autoPlay playsInline controls style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000', borderRadius: 'inherit' }} />
      {err && (
        <div className="absolute inset-0 flex items-center justify-center text-rose-300 font-bold" style={{ fontSize: 14, background: 'rgba(0,0,0,0.6)', padding: 12, textAlign: 'center' }}>
          {err}
        </div>
      )}
    </div>
  );
}
