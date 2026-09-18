import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { TILE } from '@/lib/mock/site';
import { EQUIP_LIST } from '@/lib/mock/equipment';
import { cctvEl, equipEl } from '@/components/map/pinIcons';
import { useUIStore } from '@/stores/useUIStore';
import { useSiteStore } from '@/stores/useSiteStore';

/**
 * MiniMap — 분할 뷰 한 칸. 특정 공구를 중심으로 한 독립 MapLibre 인스턴스(하이브리드).
 * 부모(SplitView)가 splitView on 일 때만 마운트 → 이때 생성, 언마운트 시 파괴(지연생성).
 */
export default function MiniMap({ zone }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const el0 = containerRef.current;
    const map = new maplibregl.Map({
      container: el0,
      style: {
        version: 8,
        sources: {
          sat: { type: 'raster', tiles: [TILE.satellite], tileSize: 256, maxzoom: 19, attribution: TILE.attribution },
          hybrid: { type: 'raster', tiles: [TILE.hybrid], tileSize: 256, maxzoom: 19 },
        },
        layers: [
          { id: 'sat', type: 'raster', source: 'sat' },
          { id: 'hybrid', type: 'raster', source: 'hybrid' },
        ],
      },
      center: [zone.center[1], zone.center[0]],
      zoom: 15.8,
      minZoom: 13,
      maxZoom: 19,
      attributionControl: false,
    });
    mapRef.current = map;

    const color = zone.color ?? '#38bdf8';
    map.on('load', () => {
      // 이 공구 경계
      const ring = zone.polygon.map(([lat, lng]) => [lng, lat]);
      ring.push(ring[0]);
      map.addSource('z', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] } } });
      map.addLayer({ id: 'z-line', type: 'line', source: 'z', paint: { 'line-color': color, 'line-width': 4.5 } });

      // 공구 폴리곤에 맞춰 프레이밍 (과확대 방지)
      const lats = zone.polygon.map((p) => p[0]);
      const lngs = zone.polygon.map((p) => p[1]);
      map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 20, duration: 0, maxZoom: 16.5 });

      // 이 공구의 마커만
      useSiteStore.getState().cctvs.filter((c) => c.zone === zone.id).forEach((cam) => {
        const el = cctvEl(cam);
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.onclick = (e) => {
          e.stopPropagation();
          map.flyTo({ center: [cam.lng, cam.lat], zoom: 17.5, duration: 800 });
          useUIStore.getState().openCellPopup(zone.id, 'cctv', cam);
        };
        new maplibregl.Marker({ element: el, anchor: 'center', offset: [0, 6] }).setLngLat([cam.lng, cam.lat]).addTo(map);
      });
      EQUIP_LIST.filter((e) => e.zone === zone.id).forEach((eq) => {
        const el = equipEl(eq);
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.onclick = (e) => {
          e.stopPropagation();
          map.flyTo({ center: [eq.lng, eq.lat], zoom: 17.5, duration: 800 });
          useUIStore.getState().openCellPopup(zone.id, 'equip', eq);
        };
        new maplibregl.Marker({ element: el, anchor: 'center', offset: [0, 6] }).setLngLat([eq.lng, eq.lat]).addTo(map);
      });
    });

    // 렌더 킥 (fixed 그리드 셀에서 첫 렌더 보장)
    let tries = 0;
    const kick = () => {
      const m = mapRef.current;
      if (!m) return;
      m.resize();
      try { m.redraw(); } catch (e) { /* noop */ }
      if (!m.loaded() && tries++ < 30) setTimeout(kick, 120);
    };
    setTimeout(kick, 60);

    return () => { map.remove(); mapRef.current = null; };
  }, [zone]);

  const zoneColor = zone.color ?? '#38bdf8';
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: 14, border: `1px solid ${zoneColor}66` }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
      {/* 칸 헤더 */}
      <div className="absolute flex items-center panel" style={{ top: 12, left: 12, gap: 10, padding: '8px 14px', borderRadius: 10, zIndex: 5 }}>
        <span className="font-black" style={{ fontSize: 18, color: zoneColor }}>{zone.name}</span>
        <span className="text-slate-400 font-bold" style={{ fontSize: 13 }}>{zone.phase}</span>
      </div>
    </div>
  );
}
