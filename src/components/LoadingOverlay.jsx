import { Loader2, ShieldCheck } from 'lucide-react';
import { useWeatherReady } from '@/lib/mock/weather';
import { useSiteStore } from '@/stores/useSiteStore';

/**
 * LoadingOverlay — 초기(및 재기동) 시 현장·기상 데이터가 모두 준비될 때까지
 * 화면 전체를 덮는 로딩 오버레이. 준비되면 사라진다.
 */
export default function LoadingOverlay() {
  const weatherReady = useWeatherReady();
  const siteLoaded = useSiteStore((s) => s.loaded);
  if (weatherReady && siteLoaded) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'radial-gradient(circle at 50% 40%, #0a1a2e 0%, #04080f 70%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
      <div className="flex items-center" style={{ gap: 16 }}>
        <div className="flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(160deg,#0ea5e9,#0369a1)', boxShadow: '0 0 28px rgba(14,165,233,0.5)' }}>
          <ShieldCheck style={{ width: 38, height: 38, color: '#fff' }} />
        </div>
        <span className="font-black text-white" style={{ fontSize: 30 }}>LH 남사동탄 통합관제 대시보드</span>
      </div>
      <div className="flex items-center" style={{ gap: 12 }}>
        <Loader2 className="animate-spin" style={{ width: 26, height: 26, color: '#38bdf8' }} />
        <span className="font-bold text-slate-300" style={{ fontSize: 18 }}>관제 데이터를 불러오는 중…</span>
      </div>
    </div>
  );
}
