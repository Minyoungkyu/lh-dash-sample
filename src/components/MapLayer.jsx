import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { SITE, TILE } from '@/lib/mock/site';
import { EQUIP_LIST } from '@/lib/mock/equipment';
import { cctvEl, equipEl, zoneLabelEl } from '@/components/map/pinIcons';
import { useUIStore } from '@/stores/useUIStore';
import { useSiteStore } from '@/stores/useSiteStore';

/**
 * MapLayer — 실제 MapLibre 지도 (2D). 스케일되는 4K 스테이지 "밖"의 fixed 레이어에
 * 그리고, 스테이지 안 자리표시자(#map-slot)의 화면좌표를 rAF로 따라가 겹친다.
 * 구역/CCTV 는 useSiteStore(편집 가능 단일 소스)에서 읽어, 변경 시 폴리곤·라벨·핀·화각을 갱신.
 */
// [lat,lng] 배열 → maplibre bounds [[minLng,minLat],[maxLng,maxLat]]
function boundsOf(points) {
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
}

function zoneGeoJSON(zones, activeZone) {
  return {
    type: 'FeatureCollection',
    features: zones
      .filter((z) => Array.isArray(z.polygon) && z.polygon.length >= 3)
      .map((z) => {
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

// ── CCTV 촬영 화각(부채꼴 빔) ──────────────────────────────────
//  · 이동형(rotating/PTZ): 사다리꼴 화각이 360° 천천히 회전 (촬영방향 미지정)
//  · 고정형(fixed): 화각 없이 핀만
const M_PER_DEG_LAT = 111320;
function destPoint(lng, lat, bearingDeg, distM) {
  const br = (bearingDeg * Math.PI) / 180;
  const dLat = (distM * Math.cos(br)) / M_PER_DEG_LAT;
  const dLng = (distM * Math.sin(br)) / (M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180));
  return [lng + dLng, lat + dLat];
}
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
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
const ROT_DPS = 15; // 회전 속도(도/초) — 약 24초에 한 바퀴
function fovGeoJSON(cctvs, phase, selId) {
  const feats = [];
  for (const cam of cctvs) {
    if (cam.type !== 'rotating') continue; // 고정형은 화각 없음(핀만)
    if (cam.lng == null || cam.lat == null) continue;
    const fov = 64;
    const heading = (phase * ROT_DPS + (hashStr(cam.id) % 360)) % 360; // 360° 회전
    const baseR = cam.status === 'online' ? 140 : 100;
    const sel = selId === cam.id;
    FOV_BANDS.forEach((f, i) => feats.push(sectorFeature(cam, heading, fov, baseR * f, i, sel)));
  }
  return { type: 'FeatureCollection', features: feats };
}

// 구역 그리기 드래프트 프리뷰 (점 + 선/폴리곤)
const EMPTY_FC = { type: 'FeatureCollection', features: [] };
function draftGeoJSON(draft) {
  if (!draft || !draft.points.length) return EMPTY_FC;
  const pts = draft.points.map(([lat, lng]) => [lng, lat]);
  const feats = pts.map((c) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: c }, properties: {} }));
  if (pts.length >= 3) feats.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[...pts, pts[0]]] }, properties: {} });
  else if (pts.length === 2) feats.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: pts }, properties: {} });
  return { type: 'FeatureCollection', features: feats };
}

export default function MapLayer() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const fovRafRef = useRef(null);
  const zoneMarkersRef = useRef([]);
  const cctvMarkersRef = useRef([]);
  const [ready, setReady] = useState(false);

  const zones = useSiteStore((s) => s.zones);
  const cctvs = useSiteStore((s) => s.cctvs);
  const activeZone = useUIStore((s) => s.activeZone);
  const zoneNonce = useUIStore((s) => s.zoneNonce);
  const basemap = useUIStore((s) => s.basemap);
  const camFocus = useUIStore((s) => s.camFocus);
  const editMode = useUIStore((s) => s.editMode);
  const editTool = useUIStore((s) => s.editTool);
  const draftZone = useUIStore((s) => s.draftZone);

  // 지도 생성 (1회)
  useEffect(() => {
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

      const zs = useSiteStore.getState().zones;
      map.addSource('zones', { type: 'geojson', data: zoneGeoJSON(zs, useUIStore.getState().activeZone) });
      map.addLayer({ id: 'zone-fill', type: 'fill', source: 'zones', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['get', 'fillOpacity'] } });
      map.addLayer({ id: 'zone-line', type: 'line', source: 'zones', paint: { 'line-color': ['get', 'color'], 'line-width': ['get', 'lineWidth'], 'line-opacity': ['get', 'lineOpacity'] } });
      map.on('click', 'zone-fill', (e) => {
        const st = useUIStore.getState();
        const id = e.features?.[0]?.properties?.id;
        if (!id) return;
        if (st.editMode) {
          if (st.editTool) return; // 그리기/배치 도구 사용 중엔 선택 무시
          st.selectZoneEdit(id); // 편집모드: 구역 선택(수정/삭제)
        } else {
          st.setActiveZone(id);
        }
      });
      map.on('mouseenter', 'zone-fill', () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', 'zone-fill', () => (map.getCanvas().style.cursor = ''));

      // 구역 그리기 드래프트 프리뷰
      map.addSource('draft', { type: 'geojson', data: EMPTY_FC });
      map.addLayer({ id: 'draft-fill', type: 'fill', source: 'draft', filter: ['==', '$type', 'Polygon'], paint: { 'fill-color': '#38bdf8', 'fill-opacity': 0.18 } });
      map.addLayer({ id: 'draft-line', type: 'line', source: 'draft', filter: ['!=', '$type', 'Point'], paint: { 'line-color': '#38bdf8', 'line-width': 2.5, 'line-dasharray': [2, 1.5] } });
      map.addLayer({ id: 'draft-pt', type: 'circle', source: 'draft', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': 5, 'circle-color': '#ffffff', 'circle-stroke-color': '#38bdf8', 'circle-stroke-width': 2 } });

      // CCTV 촬영 화각(빔)
      map.addSource('cctv-fov', { type: 'geojson', data: fovGeoJSON(useSiteStore.getState().cctvs, 0, null) });
      const fovColor = ['case', ['==', ['get', 'online'], 1], '#38e0ff', '#94a3b8'];
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
      const animateFov = () => {
        const mm = mapRef.current;
        if (!mm) return;
        const src = mm.getSource('cctv-fov');
        if (src) src.setData(fovGeoJSON(useSiteStore.getState().cctvs, performance.now() / 1000, useUIStore.getState().selectedCctv?.id ?? null));
        fovRafRef.current = requestAnimationFrame(animateFov);
      };
      fovRafRef.current = requestAnimationFrame(animateFov);

      // 중장비 마커(정적)
      EQUIP_LIST.forEach((eq) => {
        const el = equipEl(eq);
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.onclick = (e) => {
          e.stopPropagation();
          if (useUIStore.getState().editMode) return;
          map.flyTo({ center: [eq.lng, eq.lat], zoom: 17.5, duration: 800 });
          useUIStore.getState().openEquip(eq);
        };
        new maplibregl.Marker({ element: el, anchor: 'center', offset: [0, 6] }).setLngLat([eq.lng, eq.lat]).addTo(map);
      });

      setReady(true);
      map.fitBounds(boundsOf(zs.flatMap((z) => z.polygon)), { padding: 100, duration: 0 });
    });

    // 초기 렌더 킥
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
      if (fovRafRef.current) cancelAnimationFrame(fovRafRef.current);
      zoneMarkersRef.current.forEach((m) => m.remove());
      cctvMarkersRef.current.forEach((m) => m.remove());
      zoneMarkersRef.current = [];
      cctvMarkersRef.current = [];
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

  // 구역 폴리곤 소스 갱신 (구역 데이터/선택 변경 시)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource('zones');
    if (src) src.setData(zoneGeoJSON(zones, activeZone));
  }, [zones, activeZone, ready]);

  // 구역 라벨 마커 (구역 데이터 변경 시 재생성)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    zoneMarkersRef.current.forEach((m) => m.remove());
    zoneMarkersRef.current = [];
    zones.forEach((z) => {
      if (!Array.isArray(z.polygon) || z.polygon.length < 3 || !z.center) return;
      const color = z.color ?? '#38bdf8';
      const el = zoneLabelEl(z, color);
      el.onclick = () => { if (!useUIStore.getState().editMode) useUIStore.getState().setActiveZone(z.id); };
      const topLat = Math.max(...z.polygon.map((p) => p[0]));
      const mk = new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, -8] }).setLngLat([z.center[1], topLat]).addTo(map);
      zoneMarkersRef.current.push(mk);
    });
  }, [zones, ready]);

  // CCTV 마커 (CCTV 데이터 변경 시 재생성)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    cctvMarkersRef.current.forEach((m) => m.remove());
    cctvMarkersRef.current = [];
    cctvs.forEach((cam) => {
      if (cam.lng == null || cam.lat == null) return;
      const el = cctvEl(cam);
      el.addEventListener('mousedown', (e) => e.stopPropagation());
      const mk = new maplibregl.Marker({ element: el, anchor: 'center', offset: [0, 6], draggable: editMode }).setLngLat([cam.lng, cam.lat]).addTo(map);
      if (editMode) {
        mk.on('dragend', () => { const p = mk.getLngLat(); useSiteStore.getState().moveCctv(cam.id, p.lng, p.lat); });
        el.onclick = (e) => {
          e.stopPropagation();
          useUIStore.getState().openCctvForm({ mode: 'edit', id: cam.id, lat: cam.lat, lng: cam.lng, name: cam.name, loc: cam.loc || '', zone: cam.zone, type: cam.type, status: cam.status, hasSpeaker: !!cam.hasSpeaker, streamUrl: cam.streamUrl || '' });
        };
      } else {
        el.onclick = (e) => {
          e.stopPropagation();
          map.flyTo({ center: [cam.lng, cam.lat], zoom: 17.5, duration: 800 });
          useUIStore.getState().openCctv(cam);
        };
      }
      cctvMarkersRef.current.push(mk);
    });
  }, [cctvs, ready, editMode]);

  // 구역 그리기 프리뷰 갱신
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource('draft');
    if (src) src.setData(draftGeoJSON(draftZone));
  }, [draftZone, ready]);

  // 편집 도구별 지도 클릭 핸들러 (구역 꼭짓점 추가 / CCTV 배치)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (editTool === 'draw-zone') {
      const h = (e) => useUIStore.getState().addDraftPoint(e.lngLat.lat, e.lngLat.lng);
      map.on('click', h);
      map.doubleClickZoom.disable();
      map.getCanvas().style.cursor = 'crosshair';
      return () => { map.off('click', h); map.doubleClickZoom.enable(); map.getCanvas().style.cursor = ''; };
    }
    if (editTool === 'place-cctv') {
      const h = (e) => {
        const zs = useSiteStore.getState().zones;
        const az = useUIStore.getState().activeZone;
        useUIStore.getState().openCctvForm({ mode: 'create', lat: e.lngLat.lat, lng: e.lngLat.lng, name: '', loc: '', zone: az || zs[0]?.id || '', type: 'fixed', status: 'online', hasSpeaker: false, streamUrl: '' });
      };
      map.on('click', h);
      map.getCanvas().style.cursor = 'crosshair';
      return () => { map.off('click', h); map.getCanvas().style.cursor = ''; };
    }
  }, [editTool, ready]);

  // 구역 스위처 → 프레이밍
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const zs = useSiteStore.getState().zones;
    if (!activeZone) {
      const all = zs.flatMap((z) => z.polygon);
      if (all.length) map.fitBounds(boundsOf(all), { padding: 100, duration: 900 });
    } else {
      const z = zs.find((x) => x.id === activeZone);
      if (z && z.polygon?.length) map.fitBounds(boundsOf(z.polygon), { padding: 40, duration: 900, maxZoom: 16.5 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeZone, zoneNonce, ready]);

  // 비상감지/목록 클릭 → 해당 지점으로 이동
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !camFocus) return;
    map.flyTo({ center: [camFocus.lng, camFocus.lat], zoom: 17.5, duration: 800 });
  }, [camFocus, ready]);

  // 베이스맵 전환
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    applyBasemap(map, basemap);
    requestAnimationFrame(() => { try { map.resize(); map.redraw(); } catch (e) { /* noop */ } });
  }, [basemap, ready]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', left: 0, top: 0, borderRadius: 22, overflow: 'hidden', zIndex: 0, pointerEvents: 'auto' }}
    />
  );
}
