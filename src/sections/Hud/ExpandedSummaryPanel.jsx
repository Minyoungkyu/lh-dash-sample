import { Wrench, Video, Volume2, VolumeX } from 'lucide-react';
import { EQUIP_LIST, EQUIP_STATUS, EQUIP_KIND_LABEL, COMM_STATUS } from '@/lib/mock/equipment';
import { CCTV_LIST, CCTV_TYPE_LABEL } from '@/lib/mock/cctv';
import { useUIStore } from '@/stores/useUIStore';
import ZoneSummaryPanel from '@/sections/ZoneSummaryPanel';

/**
 * ExpandedSummaryPanel — 좌측 드로어 대형 뷰. 현재 summaryCat 을 크게 보여준다.
 *  - progress: 원래 드로어 레이아웃(ZoneSummaryPanel 카드) 그대로 재사용
 *  - equip: 장비 상세(종류·공구·기사·연락처·작업·가동시간·통신·상태)
 *  - cctv: 카메라 상세(유형·공구·스피커·상태)
 */
const META = {
  equip: { label: '중장비 현황', icon: Wrench, color: '#f59e0b' },
  cctv: { label: 'CCTV 현황', icon: Video, color: '#22d3ee' },
};

const Th = ({ children, w, right }) => (
  <th className="text-slate-400 font-bold" style={{ fontSize: 15, padding: '0 12px 12px', textAlign: right ? 'right' : 'left', width: w, whiteSpace: 'nowrap' }}>
    {children}
  </th>
);
const Td = ({ children, right, color }) => (
  <td className="font-bold" style={{ fontSize: 15, padding: '13px 12px', textAlign: right ? 'right' : 'left', color: color ?? '#e2e8f0', whiteSpace: 'nowrap' }}>
    {children}
  </td>
);
function Dot({ color, glow }) {
  return <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: glow ? `0 0 8px ${color}` : 'none' }} />;
}

export default function ExpandedSummaryPanel() {
  const summaryCat = useUIStore((s) => s.summaryCat);
  const activeZone = useUIStore((s) => s.activeZone);
  const flyToPin = useUIStore((s) => s.flyToPin);
  const closeLeftDock = useUIStore((s) => s.closeLeftDock);

  // 공정 진행 = 원래 드로어(공사구역 현황 카드) 그대로
  if (summaryCat === 'progress') return <ZoneSummaryPanel />;

  const m = META[summaryCat] ?? META.equip;
  const Icon = m.icon;
  const inZone = (x) => (activeZone ? x.zone === activeZone : true);
  const equip = EQUIP_LIST.filter(inZone);
  const cctv = CCTV_LIST.filter(inZone);
  const headCount = summaryCat === 'equip' ? `${equip.length}대` : `${cctv.length}대`;

  // 행 클릭 → 드로어 닫고 해당 핀으로 지도 이동
  const goTo = (x) => { closeLeftDock(); flyToPin(x.lng, x.lat); };

  return (
    <div className="flex flex-col h-full panel" style={{ padding: 28, gap: 20 }}>
      {/* 타이틀 (우측 닫기 버튼과 겹치지 않게 오른쪽 여백) */}
      <div className="flex items-center" style={{ gap: 14, paddingRight: 56 }}>
        <Icon style={{ width: 30, height: 30, color: m.color }} />
        <span className="font-black" style={{ fontSize: 26, color: m.color }}>{m.label}</span>
        {activeZone && (
          <span className="font-black" style={{ fontSize: 15, color: '#38bdf8', background: 'rgba(56,189,248,0.14)', border: '1px solid rgba(56,189,248,0.4)', padding: '5px 14px', borderRadius: 999 }}>
            {activeZone}
          </span>
        )}
        <span className="ml-auto text-slate-500 font-bold" style={{ fontSize: 15 }}>{headCount}</span>
      </div>

      {/* 테이블 (가로 넘치면 스크롤) */}
      <div className="flex-1 min-h-0 overflow-auto thin-scroll">
        <table className="border-collapse" style={{ width: '100%', minWidth: summaryCat === 'equip' ? 1120 : undefined }}>
          {summaryCat === 'equip' && (
            <>
              <thead className="sticky top-0" style={{ background: 'rgba(10,20,34,0.98)', zIndex: 2 }}>
                <tr>
                  <Th>장비</Th>
                  <Th>종류</Th>
                  <Th>공구</Th>
                  <Th>위치</Th>
                  <Th>기사</Th>
                  <Th>연락처</Th>
                  <Th>작업</Th>
                  <Th w="92px" right>가동시간</Th>
                  <Th w="88px">통신</Th>
                  <Th w="96px">상태</Th>
                </tr>
              </thead>
              <tbody>
                {equip.map((e) => {
                  const st = EQUIP_STATUS[e.status] ?? EQUIP_STATUS.idle;
                  const cm = COMM_STATUS[e.comm] ?? COMM_STATUS.online;
                  return (
                    <tr key={e.id} onClick={() => goTo(e)} className="cursor-pointer transition-colors hover:bg-white/5" style={{ borderTop: '1px solid rgba(148,163,184,0.12)' }}>
                      <Td color="#fff">{e.name}</Td>
                      <Td color="#cbd5e1">{EQUIP_KIND_LABEL[e.kind]}</Td>
                      <Td color="#94a3b8">{e.zone}</Td>
                      <Td color="#cbd5e1">{e.loc}</Td>
                      <Td color="#e2e8f0">{e.operator}</Td>
                      <Td color="#94a3b8">{e.phone}</Td>
                      <Td color="#cbd5e1">{e.task}</Td>
                      <Td right color="#e2e8f0">{e.runtime.toFixed(1)}h</Td>
                      <Td>
                        <span className="inline-flex items-center" style={{ gap: 7 }}>
                          <Dot color={cm.color} glow={e.comm === 'online'} />
                          <span style={{ color: cm.color }}>{cm.label}</span>
                        </span>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center" style={{ gap: 7 }}>
                          <Dot color={st.color} glow={e.status === 'running'} />
                          <span style={{ color: st.color }}>{st.label}</span>
                        </span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          )}

          {summaryCat === 'cctv' && (
            <>
              <thead className="sticky top-0" style={{ background: 'rgba(10,20,34,0.98)', zIndex: 2 }}>
                <tr>
                  <Th w="40px"> </Th>
                  <Th>카메라</Th>
                  <Th>ID</Th>
                  <Th>유형</Th>
                  <Th>공구</Th>
                  <Th>위치</Th>
                  <Th w="110px">스피커</Th>
                  <Th w="110px">상태</Th>
                </tr>
              </thead>
              <tbody>
                {cctv.map((c) => {
                  const online = c.status === 'online';
                  return (
                    <tr key={c.id} onClick={() => goTo(c)} className="cursor-pointer transition-colors hover:bg-white/5" style={{ borderTop: '1px solid rgba(148,163,184,0.12)', opacity: online ? 1 : 0.6 }}>
                      <Td><Dot color={online ? '#22d3ee' : '#64748b'} glow={online} /></Td>
                      <Td color="#fff">{c.name}</Td>
                      <Td color="#94a3b8">{c.id}</Td>
                      <Td color="#cbd5e1">{CCTV_TYPE_LABEL[c.type]}</Td>
                      <Td color="#94a3b8">{c.zone}</Td>
                      <Td color="#cbd5e1">{c.loc}</Td>
                      <Td>
                        {c.hasSpeaker
                          ? <span className="inline-flex items-center text-sky-400 font-bold" style={{ gap: 6, fontSize: 15 }}><Volume2 style={{ width: 17, height: 17 }} /> 있음</span>
                          : <span className="inline-flex items-center text-slate-500 font-bold" style={{ gap: 6, fontSize: 15 }}><VolumeX style={{ width: 17, height: 17 }} /> 없음</span>}
                      </Td>
                      <Td color={online ? '#22d3ee' : '#64748b'}>{online ? '가동중' : '오프라인'}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          )}
        </table>
      </div>
    </div>
  );
}
