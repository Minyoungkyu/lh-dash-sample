import { useMemo } from 'react';
import { BarChart3, Wrench, Video, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { ZONES } from '@/lib/mock/zones';
import { EQUIP_LIST, EQUIP_STATUS, EQUIP_KIND_LABEL } from '@/lib/mock/equipment';
import { CCTV_LIST, CCTV_TYPE_LABEL } from '@/lib/mock/cctv';
import { useUIStore } from '@/stores/useUIStore';

/**
 * HudSummaryTable — 공정 진행 / 중장비 / CCTV 요약표. 탭 버튼으로 수동 전환.
 * 좌측 패널 상단부. 확장(⤢) 버튼으로 좌측 드로어에 대형 뷰 오픈.
 * 중장비/CCTV 는 공구 선택 시 필터, 공정 진행은 전 공구 개요 + 선택 공구 강조.
 */
const CATS = [
  { key: 'progress', label: '공정 진행', icon: BarChart3, color: '#a78bfa' },
  { key: 'equip', label: '중장비', icon: Wrench, color: '#f59e0b' },
  { key: 'cctv', label: 'CCTV', icon: Video, color: '#22d3ee' },
];

const Th = ({ children, w, right }) => (
  <th className="text-slate-500 font-bold" style={{ fontSize: 12, padding: '0 10px 8px', textAlign: right ? 'right' : 'left', width: w, whiteSpace: 'nowrap' }}>
    {children}
  </th>
);
const Td = ({ children, right, color }) => (
  <td className="font-bold" style={{ fontSize: 13, padding: '9px 10px', textAlign: right ? 'right' : 'left', color: color ?? '#e2e8f0', whiteSpace: 'nowrap' }}>
    {children}
  </td>
);

function Dot({ color, glow }) {
  return <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: glow ? `0 0 7px ${color}` : 'none' }} />;
}

export default function HudSummaryTable() {
  const activeZone = useUIStore((s) => s.activeZone);
  const summaryCat = useUIStore((s) => s.summaryCat);
  const setSummaryCat = useUIStore((s) => s.setSummaryCat);
  const toggleLeftDock = useUIStore((s) => s.toggleLeftDock);

  const inZone = (x) => (activeZone ? x.zone === activeZone : true);
  const equip = useMemo(() => EQUIP_LIST.filter(inZone), [activeZone]);
  const cctv = useMemo(() => CCTV_LIST.filter(inZone), [activeZone]);

  const cat = CATS.find((c) => c.key === summaryCat) ?? CATS[0];
  const count = summaryCat === 'progress' ? ZONES.length : summaryCat === 'equip' ? equip.length : cctv.length;
  const sub =
    summaryCat === 'progress'
      ? { t: `평균 ${Math.round(ZONES.reduce((s, z) => s + z.progress, 0) / ZONES.length)}%`, c: '#a78bfa' }
      : summaryCat === 'equip'
        ? { t: `운행 ${equip.filter((e) => e.status === 'running').length}`, c: '#22c55e' }
        : { t: `가동 ${cctv.filter((c) => c.status === 'online').length}`, c: '#22d3ee' };

  return (
    <div className="flex flex-col min-h-0 h-full" style={{ gap: 10 }}>
      {/* 탭 + 확장 */}
      <div className="flex items-center" style={{ gap: 6 }}>
        {CATS.map((c) => {
          const on = c.key === summaryCat;
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => setSummaryCat(c.key)}
              className="flex items-center font-black transition-all"
              style={{ gap: 6, padding: '7px 11px', borderRadius: 9, cursor: 'pointer', fontSize: 13, background: on ? c.color : 'rgba(255,255,255,0.05)', color: on ? '#04121a' : '#cbd5e1', border: `1px solid ${on ? c.color : 'rgba(148,163,184,0.25)'}` }}
            >
              <Icon style={{ width: 15, height: 15 }} />
              {c.label}
            </button>
          );
        })}
        <button
          onClick={() => toggleLeftDock('summary')}
          title="크게 보기"
          className="ml-auto flex items-center justify-center bg-white/8 hover:bg-white/16 text-slate-200 transition-colors"
          style={{ width: 32, height: 32, borderRadius: 9 }}
        >
          <Maximize2 style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* 캡션 */}
      <div className="flex items-center" style={{ gap: 8 }}>
        <span className="font-black text-white" style={{ fontSize: 14 }}>{count}</span>
        <span className="text-slate-400 font-bold" style={{ fontSize: 13 }}>{summaryCat === 'progress' ? '개 공구' : '대'}</span>
        <span className="font-black" style={{ fontSize: 13, color: sub.c }}>· {sub.t}</span>
      </div>

      {/* 표 (카테고리별) */}
      <div
        key={summaryCat}
        className="fade-in flex-1 min-h-0 overflow-y-auto thin-scroll"
        style={{ borderRadius: 12, background: 'rgba(0,0,0,0.24)', border: '1px solid rgba(148,163,184,0.1)', padding: '8px 6px' }}
      >
        <table className="w-full border-collapse">
          {summaryCat === 'progress' && (
            <>
              <thead>
                <tr>
                  <Th>공구</Th>
                  <Th w="120px">공정</Th>
                  <Th w="150px">진행률</Th>
                </tr>
              </thead>
              <tbody>
                {ZONES.map((z) => {
                  const color = z.color ?? '#38bdf8';
                  const active = activeZone === z.id;
                  return (
                    <tr key={z.id} style={{ borderTop: '1px solid rgba(148,163,184,0.1)', background: active ? `${color}1a` : 'transparent' }}>
                      <Td color={active ? '#fff' : '#e2e8f0'}>{z.name}</Td>
                      <Td color="#94a3b8">{z.phase}</Td>
                      <td style={{ padding: '9px 10px' }}>
                        <div className="flex items-center" style={{ gap: 7 }}>
                          <div style={{ flex: 1, height: 7, borderRadius: 5, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                            <div style={{ width: `${z.progress}%`, height: '100%', background: `linear-gradient(90deg, ${color}aa, ${color})` }} />
                          </div>
                          <span className="font-black" style={{ fontSize: 12, color, width: 34, textAlign: 'right' }}>{z.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          )}

          {summaryCat === 'equip' && (
            <>
              <thead>
                <tr>
                  <Th w="34px"> </Th>
                  <Th>장비</Th>
                  <Th w="62px">종류</Th>
                  <Th>작업</Th>
                  <Th w="64px" right>상태</Th>
                </tr>
              </thead>
              <tbody>
                {equip.map((e) => {
                  const st = EQUIP_STATUS[e.status] ?? EQUIP_STATUS.idle;
                  return (
                    <tr key={e.id} style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>
                      <Td><Dot color={st.color} glow={e.status === 'running'} /></Td>
                      <Td color="#fff">{e.name}</Td>
                      <Td color="#94a3b8">{EQUIP_KIND_LABEL[e.kind]}</Td>
                      <Td color="#cbd5e1">{e.task}</Td>
                      <Td right color={st.color}>{st.label}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          )}

          {summaryCat === 'cctv' && (
            <>
              <thead>
                <tr>
                  <Th w="34px"> </Th>
                  <Th>카메라</Th>
                  <Th w="90px">유형</Th>
                  <Th w="70px" right>스피커</Th>
                  <Th w="64px" right>상태</Th>
                </tr>
              </thead>
              <tbody>
                {cctv.map((c) => {
                  const online = c.status === 'online';
                  return (
                    <tr key={c.id} style={{ borderTop: '1px solid rgba(148,163,184,0.1)', opacity: online ? 1 : 0.6 }}>
                      <Td><Dot color={online ? '#22d3ee' : '#64748b'} glow={online} /></Td>
                      <Td color="#fff">{c.name}</Td>
                      <Td color="#94a3b8">{CCTV_TYPE_LABEL[c.type]}</Td>
                      <Td right>
                        {c.hasSpeaker
                          ? <Volume2 style={{ width: 16, height: 16, color: '#38bdf8', display: 'inline' }} />
                          : <VolumeX style={{ width: 16, height: 16, color: '#64748b', display: 'inline' }} />}
                      </Td>
                      <Td right color={online ? '#22d3ee' : '#64748b'}>{online ? '가동' : '오프'}</Td>
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
