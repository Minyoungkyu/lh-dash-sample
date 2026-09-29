import { useRef, useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

/**
 * AddressSearch — 주소를 입력하면 해당 위치로 지도 포커스를 이동(+임시 마커).
 * 평소엔 작은 검색 아이콘만 보이고, 마우스 호버(또는 포커스/입력값 있음) 시 검색창이 펼쳐진다.
 * 서버 /api/geocode(VWorld 좌표변환) 사용. 편집 임시작업 중엔 중앙 안내바와 겹치지 않도록 숨김.
 */
export default function AddressSearch() {
  const draftZone = useUIStore((s) => s.draftZone);
  const zoneNaming = useUIStore((s) => s.zoneNaming);
  const editTool = useUIStore((s) => s.editTool);
  const flyToPin = useUIStore((s) => s.flyToPin);
  const setSearchPin = useUIStore((s) => s.setSearchPin);
  const pushToast = useUIStore((s) => s.pushToast);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  if (draftZone || zoneNaming || editTool) return null;

  const open = hovered || focused || q.trim() !== '';

  const submit = async () => {
    const query = q.trim();
    if (!query || loading) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (!r.ok) {
        pushToast(r.status === 404 ? '주소를 찾을 수 없습니다' : '주소 검색 실패', 'info');
        return;
      }
      const d = await r.json();
      flyToPin(d.lng, d.lat, 17);
      setSearchPin({ lng: d.lng, lat: d.lat, label: d.address || query });
      pushToast(`이동: ${d.address || query}`, 'success');
    } catch {
      pushToast('주소 검색 오류', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="absolute z-[510] flex items-center panel transition-all duration-200"
      style={{
        top: 20, left: '50%', transform: 'translateX(-50%)',
        gap: open ? 8 : 0, padding: open ? '8px 10px 8px 14px' : 8,
        borderRadius: 14, pointerEvents: 'auto',
        opacity: open ? 1 : 0.55,
      }}
      onMouseEnter={() => { setHovered(true); requestAnimationFrame(() => inputRef.current?.focus()); }}
      onMouseLeave={() => setHovered(false)}
      title="주소로 이동"
    >
      <Search style={{ width: 18, height: 18, color: '#38bdf8', flex: '0 0 auto', cursor: 'pointer' }} />
      {open && (
        <>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder="주소로 이동 (도로명/지번)"
            className="text-white outline-none"
            style={{ fontSize: 16, background: 'transparent', border: 'none', width: 300 }}
          />
          {q && !loading && (
            <button
              onClick={() => { setQ(''); setSearchPin(null); }}
              className="flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              style={{ width: 26, height: 26, flex: '0 0 auto' }}
              title="지우기"
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
          <button
            onClick={submit}
            disabled={loading || !q.trim()}
            className="flex items-center justify-center font-black transition-all disabled:opacity-40"
            style={{ padding: '8px 16px', borderRadius: 10, fontSize: 15, background: '#38bdf8', color: '#04121a', cursor: loading || !q.trim() ? 'default' : 'pointer', flex: '0 0 auto' }}
          >
            {loading ? <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} /> : '이동'}
          </button>
        </>
      )}
    </div>
  );
}
