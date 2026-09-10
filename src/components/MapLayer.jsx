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

// ── CCTV 촬영 화각(부채꼴) ──────────────────────────────────
// 각 카메라 위치에서 촬영 방향으로 부채꼴 폴리곤을 그린다.
// 회전형(PTZ)은 방향이 좌우로 스윕(애니메이션), 고정형은 정지.
const M_PER_DEG_LAT = 111320;
function destPoint(lng, lat, bearingDeg, distM) {
  const br = (bearingDeg * Math.PI) / 180;
  const dLat = (distM * Math.cos(br)) / M_PER_DEG_LAT;
  const dLng = (distM * Math.sin(br)) / (M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));
  return [lng + dLng, lat + dLat];
}
function bearingTo(lng1, lat1, lng2, lat2) {
  const east = (lng2 - lng1) * Math.cos((lat1 * Math.PI) / 180);
  const north = lat2 - lat1;
  return (Math.atan2(east, north) * 180) / Math.PI;
}
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
// 기본 촬영방향: 소속 공구 중심을 향하되 카메라별 ±60° 변주(현장 감시하는 느낌)
function camBaseHeading(cam) {
  const z = ZONES.find((zz) => zz.id === cam.zone);
  const toCenter = z ? bearingTo(cam.lng, cam.lat, z.center[1], z.center[0]) : hashStr(cam.id) % 360;
  return (toCenter + ((hashStr(cam.id) % 120) - 60) + 360) % 360;
}
function sectorFeature(cam, heading, fov, radius, band, sel) {
  const steps = 22;
  const start = heading - fov / 2;
  const coords = [[cam.lng, cam.lat]];
  for (let i = 0; i <= steps; i++) coords.push(destPoint(cam.lng, cam.lat, start + (fov * i) / steps, radius));
  coords.push([cam.lng, cam.lat]);
  return { type: 'Feature', properties: { online: cam.status === 'online' ? 1 : 0, sel: sel ? 1 : 0, band }, geometry: { type: 'Polygon', coordinates: [coords] } };
}
// 겹쳐 그려 apex(밝음)→가장자리(옅음) 그라디언트 빔 느낌을 내는 반경 배율
const FOV_BANDS = [1.0, 0.72, 0.46];
function fovGeoJSON(phase, selId) {
  const feats = [];
  for (const cam of CCTV_LIST) {
    const rotating = cam.type === 'rotating';
    const fov = rotating ? 60 : 42;
    // PTZ 좌우 스윕 — 회전주기 길게(느긋하게). 0.22rad/s ≈ 약 28초 주기
    const sweep = rotating ? Math.sin(phase * 0.22 + (hashStr(cam.id) % 628) / 100) * 28 : 0;
    const baseR = cam.status === 'online' ? 140 : 100;
    const heading = camBaseHeading(cam) + sweep;
    const sel = selId === cam.id;
    FOV_BANDS.forEach((f, i) => feats.push(sectorFeature(cam, heading, fov, baseR * f, i, sel)));
  }
  return { type: 'FeatureCollection', features: feats };
}

export default function MapLayer() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const readyRef = useRef(false);
  const fovRafRef = useRef(null);
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

      // CCTV 촬영 화각(빔) — 겹친 밴드로 apex 밝고 가장자리 옅은 그라디언트, 선택 시 강조
      map.addSource('cctv-fov', { type: 'geojson', data: fovGeoJSON(0, null) });
      const fovColor = ['case', ['==', ['get', 'online'], 1], '#38e0ff', '#94a3b8'];
      // band 0(바깥)부터 깔고 2(안쪽)를 위에 → 누적 불투명도 그라디언트
      [
        { band: 0, nop: 0.13, sop: 0.24 },
        { band: 1, nop: 0.19, sop: 0.32 },
        { band: 2, nop: 0.27, sop: 0.42 },
      ].forEach(({ band, nop, sop }) => {
        map.addLayer({
          id: `cctv-fov-${band}`, type: 'fill', source: 'cctv-fov',
          filter: ['==', ['get', 'band'], band],
          paint: { 'fill-color': fovColor, 'fill-opacity': ['case', ['==', ['get', 'sel'], 1], sop, nop] },
        });
      });
      // 바깥 밴드 가장자리(부드러운 라인)
      map.addLayer({
        id: 'cctv-fov-line', type: 'line', source: 'cctv-fov',
        filter: ['==', ['get', 'band'], 0],
        paint: {
          'line-color': fovColor,
          'line-width': ['case', ['==', ['get', 'sel'], 1], 2.4, 1.3],
          'line-opacity': ['case', ['==', ['get', 'sel'], 1], 0.95, 0.55],
          'line-blur': 0.4,
        },
      });
      // PTZ 스윕 + 선택 강조를 매 프레임 반영
      const animateFov = () => {
        const mm = mapRef.current;
        if (!mm) return;
        const src = mm.getSource('cctv-fov');
        if (src) src.setData(fovGeoJSON(performance.now() / 1000, useUIStore.getState().selectedCctv?.id ?? null));
        fovRafRef.current = requestAnimationFrame(animateFov);
      };
      fovRafRef.current = requestAnimationFrame(animateFov);

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
        new maplibregl.Marker({ element: el, anchor: 'center', offset: [0, 6] }).setLngLat([cam.lng, cam.lat]).addTo(map);
      });
      EQUIP_LIST.forEach((eq) => {
        const el = equipEl(eq);
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.onclick = (e) => {
          e.stopPropagation();
          map.flyTo({ center: [eq.lng, eq.lat], zoom: 17.5, duration: 800 });
          useUIStore.getState().openEquip(eq);
        };
        new maplibregl.Marker({ element: el, anchor: 'center', offset: [0, 6] }).setLngLat([eq.lng, eq.lat]).addTo(map);
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

    return () => {
      readyRef.current = false;
      if (fovRafRef.current) cancelAnimationFrame(fovRafRef.current);
      map.remove();
      mapRef.current = null;
    };
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
