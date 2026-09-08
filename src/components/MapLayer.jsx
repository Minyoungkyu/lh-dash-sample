import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { SITE, TILE } from '@/lib/mock/site';
import { CCTV_LIST } from '@/lib/mock/cctv';
import { EQUIP_LIST } from '@/lib/mock/equipment';
import { ZONES, SITE_BOUNDS } from '@/lib/mock/zones';
import { cctvEl, equipEl, zoneLabelEl } from '@/components/map/pinIcons';
import { useUIStore } from '@/stores/useUIStore';

/**
 * MapLayer — 실제 MapLibre 지도 (2D). 스케일되는 4K 스테이지 "밖"의 fixed 레이어에
 * 그리고, 스테이지 안 자리표시자(#map-slot)의 화면좌표를 rAF로 따라가 겹친다.
 * 베이스맵: 지도(Base) / 위성(Satellite) / 하이브리드(Satellite+Hybrid).
 */
// [lat,lng] 배열 → maplibre bounds [[minLng,minLat],[maxLng,maxLat]]
function boundsOf(points) {
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
}
function allBounds() {
  return boundsOf(SITE_BOUNDS);
}

function zoneGeoJSON(activeZone) {
  return {
    type: 'FeatureCollection',
    features: ZONES.map((z) => {
      const color = z.color ?? '#38bdf8';
      const active = activeZone === z.id;
      const dim = activeZone && !active;
      const ring = z.polygon.map(([lat, lng]) => [lng, lat]);
      ring.push(ring[0]);
      return {
        type: 'Feature',
        properties: { id: z.id, color, fillOpacity: 0, lineOpacity: dim ? 0.35 : 1, lineWidth: active ? 6 : 4 },
        geometry: { type: 'Polygon', coordinates: [ring] },
      };
    }),
  };
}

function applyBasemap(map, basemap) {
  const vis = (id, on) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
  vis('base', basemap === 'base');
  vis('sat', basemap === 'satellite' || basemap === 'hybrid');
  vis('hybrid', basemap === 'hybrid');
}

export default function MapLayer() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const readyRef = useRef(false);
  const activeZone = useUIStore((s) => s.activeZone);
  const zoneNonce = useUIStore((s) => s.zoneNonce);
  const basemap = useUIStore((s) => s.basemap);
  const camFocus = useUIStore((s) => s.camFocus);

  // 지도 생성 (1회)
  useEffect(() => {
    // 생성 전에 컨테이너를 slot 크기로 맞춘다 (0 크기면 스타일 로드가 멈춤)
    const slot0 = document.getElementById('map-slot');
    const el0 = containerRef.current;
    if (slot0 && el0) {
      const r = slot0.getBoundingClientRect();
      el0.style.left = `${r.left}px`;
      el0.style.top = `${r.top}px`;
      el0.style.width = `${r.width}px`;
      el0.style.height = `${r.height}px`;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          base: { type: 'raster', tiles: [TILE.base], tileSize: 256, maxzoom: 19, attribution: TILE.attribution },
          sat: { type: 'raster', tiles: [TILE.satellite], tileSize: 256, maxzoom: 19, attribution: TILE.attribution },
          hybrid: { type: 'raster', tiles: [TILE.hybrid], tileSize: 256, maxzoom: 19 },
        },
        layers: [
          { id: 'base', type: 'raster', source: 'base', layout: { visibility: 'none' } },
          { id: 'sat', type: 'raster', source: 'sat', layout: { visibility: 'none' } },
          { id: 'hybrid', type: 'raster', source: 'hybrid', layout: { visibility: 'none' } },
        ],
      },
      center: [SITE.center[1], SITE.center[0]],
      zoom: SITE.zoom,
      minZoom: SITE.minZoom,
      maxZoom: SITE.maxZoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on('load', () => {
      applyBasemap(map, useUIStore.getState().basemap);

      map.addSource('zones', { type: 'geojson', data: zoneGeoJSON(useUIStore.getState().activeZone) });
      map.addLayer({ id: 'zone-fill', type: 'fill', source: 'zones', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['get', 'fillOpacity'] } });
      map.addLayer({ id: 'zone-line', type: 'line', source: 'zones', paint: { 'line-color': ['get', 'color'], 'line-width': ['get', 'lineWidth'], 'line-opacity': ['get', 'lineOpacity'] } });
      map.on('click', 'zone-fill', (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (id) useUIStore.getState().setActiveZone(id); // 항상 해당 공구로 확대(토글 X)
      });
      map.on('mouseenter', 'zone-fill', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', 'zone-fill', () => (map.getCanvas().style.cursor = ''));

      ZONES.forEach((z) => {
        const color = z.color ?? '#38bdf8';
        const el = zoneLabelEl(z, color);
        el.onclick = () => useUIStore.getState().setActiveZone(z.id); // 항상 해당 공구로 확대(토글 X)
        // 라벨을 폴리곤 상단(위쪽) 위에 띄워 핀들과 겹치지 않게 (anchor:bottom + 위로 오프셋)
        const topLat = Math.max(...z.polygon.map((p) => p[0]));
        new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, -8] })
          .setLngLat([z.center[1], topLat])
          .addTo(map);
      });
      CCTV_LIST.forEach((cam) => {
        const el = cctvEl(cam);
        el.addEventListener('mousedown', (e) => e.stopPropagation()); // 지도로 전파 차단(공구 클릭 방지)
        el.onclick = (e) => {
          e.stopPropagation();
          map.flyTo({ center: [cam.lng, cam.lat], zoom: 17.5, duration: 800 }); // 그 핀 중심으로 확대
          useUIStore.getState().openCctv(cam);
        };
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([cam.lng, cam.lat]).addTo(map);
      });
      EQUIP_LIST.forEach((eq) => {
        const el = equipEl(eq);
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.onclick = (e) => {
          e.stopPropagation();
          map.flyTo({ center: [eq.lng, eq.lat], zoom: 17.5, duration: 800 });
          useUIStore.getState().openEquip(eq);
        };
        new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([eq.lng, eq.lat]).addTo(map);
      });

      readyRef.current = true;
      map.fitBounds(allBounds(), { padding: 100, duration: 0 });
    });

    // 초기 렌더 킥 — fixed 컨테이너에서 첫 렌더 루프가 저절로 안 걸리는 경우가 있어
    // 지도가 실제 로드될 때까지 강제로 다시 그린다.
    let tries = 0;
    const kick = () => {
      const m = mapRef.current;
      if (!m) return;
      m.resize();
      try { m.redraw(); } catch (e) { /* noop */ }
      if (!m.loaded() && tries++ < 30) setTimeout(kick, 120);
    };
    setTimeout(kick, 60);

    return () => { readyRef.current = false; map.remove(); mapRef.current = null; };
  }, []);

  // #map-slot 위치/크기 추적 (매 프레임)
  useEffect(() => {
    let raf;
    let lw = 0, lh = 0;
    const sync = () => {
      const slot = document.getElementById('map-slot');
      const el = containerRef.current;
      if (slot && el) {
        const r = slot.getBoundingClientRect();
        el.style.left = `${r.left}px`;
        el.style.top = `${r.top}px`;
        el.style.width = `${r.width}px`;
        el.style.height = `${r.height}px`;
        if (mapRef.current && (Math.abs(r.width - lw) > 0.5 || Math.abs(r.height - lh) > 0.5)) {
          lw = r.width; lh = r.height;
          mapRef.current.resize();
        }
      }
      raf = requestAnimationFrame(sync);
    };
    sync();
    return () => cancelAnimationFrame(raf);
  }, []);

  // 구역 스위처 → 카메라 이동 + 폴리곤 강조
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const src = map.getSource('zones');
    if (src) src.setData(zoneGeoJSON(activeZone));
    if (!activeZone) map.fitBounds(allBounds(), { padding: 100, duration: 900 });
    else {
      const z = ZONES.find((x) => x.id === activeZone);
      // 공구 폴리곤에 맞춰 프레이밍. padding 축소 + maxZoom 상향으로 약 2단계 더 확대.
      if (z) map.fitBounds(boundsOf(z.polygon), { padding: 40, duration: 900, maxZoom: 16.5 });
    }
  }, [activeZone, zoneNonce]);

  // 비상감지 트리거 → 해당 CCTV 로 지도 확대·이동
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || !camFocus) return;
    map.flyTo({ center: [camFocus.lng, camFocus.lat], zoom: 17.5, duration: 800 });
  }, [camFocus]);

  // 베이스맵 전환
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    applyBasemap(map, basemap);
    // 새로 켜진 레이어 타일이 곧바로 그려지도록 강제 리페인트
    requestAnimationFrame(() => { try { map.resize(); map.redraw(); } catch (e) { /* noop */ } });
  }, [basemap]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', left: 0, top: 0, borderRadius: 22, overflow: 'hidden', zIndex: 0, pointerEvents: 'auto' }}
    />
  );
}
