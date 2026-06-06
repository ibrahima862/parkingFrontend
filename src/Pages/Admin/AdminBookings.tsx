// AdminBookings.tsx — Premium SaaS Reservations Table
// React + hooks only, no extra libs
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar, User, MapPin, Search, RefreshCw, Clock, MoreHorizontal,
  Filter, AlertCircle, X, CheckCircle2, AlertTriangle, XCircle,
  Eye, ChevronDown, Zap, Inbox,
} from 'lucide-react';

/* ── Tokens ── */
const D = {
  bg:'#F5F6FA', surface:'#FFFFFF', surfaceAlt:'#F8F9FC', surfaceHov:'#F2F4FB',
  ink:'#0D0F1A', inkMid:'#3D4460', inkLight:'#7C84A0', inkFaint:'#B8C0D8',
  brand:'#2563EB', brandHov:'#1D4ED8', brandSoft:'#EFF4FF', brandGlow:'rgba(37,99,235,0.1)',
  line:'#E4E8F4', lineStrong:'#CDD2E8',
  green:'#059669', greenBg:'#ECFDF5', greenLine:'#A7F3D0',
  amber:'#B45309', amberBg:'#FFFBEB', amberLine:'#FDE68A',
  red:'#DC2626', redBg:'#FEF2F2', redLine:'#FECACA',
  shadow:'0 1px 2px rgba(13,15,26,0.04), 0 4px 16px rgba(13,15,26,0.06)',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
*{box-sizing:border-box}
body{margin:0;font-family:'DM Sans',system-ui,sans-serif}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideDown{from{opacity:0;transform:translateY(-6px) scaleY(0.96)}to{opacity:1;transform:translateY(0) scaleY(1)}}
.spin{animation:spin 0.75s linear infinite}
.sk{background:linear-gradient(90deg,${D.line} 25%,#ECF0FF 50%,${D.line} 75%);background-size:400% 100%;animation:shimmer 1.6s ease infinite;border-radius:5px}
.ab-row:hover{background:${D.surfaceHov}!important}
.ab-row:hover .row-accent{opacity:1!important}
.ab-row:hover .row-actions{opacity:1!important}
.ab-input:focus{outline:none;border-color:${D.brand}!important;box-shadow:0 0 0 3px ${D.brandGlow}!important}
.ab-btn:hover{background:${D.surfaceHov}!important;border-color:${D.lineStrong}!important}
.ab-refresh:hover{background:${D.brandSoft}!important;border-color:${D.brand}40!important}
.ab-action:hover{background:${D.brand}!important;border-color:${D.brand}!important;color:#fff!important;transform:scale(1.06)}
.filter-opt:hover{background:${D.surfaceAlt}!important}
thead th{position:sticky;top:0;z-index:2}
`;

/* ── Helpers ── */
const calcDuration = (s: string, e: string) => Math.max(1, Math.round(Math.abs(new Date(e).getTime() - new Date(s).getTime()) / 36e5));

/* ── Status config ── */
const ST: Record<string, { label: string; color: string; bg: string; border: string; pulse?: boolean }> = {
  confirme:   { label: 'Payé',       color: D.green, bg: D.greenBg, border: D.greenLine },
  en_attente: { label: 'En attente', color: D.amber, bg: D.amberBg, border: D.amberLine, pulse: true },
  annule:     { label: 'Annulé',     color: D.red,   bg: D.redBg,   border: D.redLine },
};

/* ── Atoms ── */
function LiveDot() {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:99, background:D.greenBg, border:`1px solid ${D.greenLine}` }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:D.green, animation:'pulse 1.6s ease infinite', flexShrink:0 }} />
      <span style={{ fontSize:9, fontWeight:800, color:D.green, letterSpacing:'0.07em', textTransform:'uppercase' }}>Live</span>
    </span>
  );
}

function StatusBadge({ statut }: { statut: string }) {
  const s = ST[statut] ?? { label: statut, color: D.inkMid, bg: D.surfaceAlt, border: D.line };
  const Icon = statut === 'confirme' ? CheckCircle2 : statut === 'en_attente' ? AlertTriangle : XCircle;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 9px', borderRadius:20, fontSize:10, fontWeight:800, letterSpacing:'0.04em', textTransform:'uppercase', background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
      {s.pulse
        ? <span style={{ width:5, height:5, borderRadius:'50%', background:s.color, animation:'pulse 1.6s ease infinite', flexShrink:0 }} />
        : <Icon size={10} strokeWidth={2.5} />}
      {s.label}
    </span>
  );
}

function DurationBar({ hours }: { hours: number }) {
  const pct = Math.min((hours / 12) * 100, 100);
  const color = hours <= 2 ? D.brand : hours <= 6 ? D.amber : D.green;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ width:48, height:3, borderRadius:99, background:D.line, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:99, transition:'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize:11, fontWeight:700, color:D.inkMid, fontFamily:"'JetBrains Mono',monospace" }}>{hours}h</span>
    </div>
  );
}

function SkeletonRow({ delay = 0 }: { delay?: number }) {
  return (
    <tr style={{ borderBottom:`1px solid ${D.line}`, animation:`fadeIn 0.3s ease ${delay}ms both` }}>
      {[180, 180, 100, 80, 90, 90, 80, 40].map((w, i) => (
        <td key={i} style={{ padding:'14px 20px' }}>
          {i === 0 ? (
            <div><div className="sk" style={{ height:12, width:w, marginBottom:5 }} /><div className="sk" style={{ height:9, width:100 }} /></div>
          ) : (
            <div className="sk" style={{ height:11, width:w }} />
          )}
        </td>
      ))}
    </tr>
  );
}

function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <tr><td colSpan={8} style={{ padding:'80px 24px' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, maxWidth:300, margin:'0 auto', textAlign:'center' }}>
        <div style={{ width:52, height:52, borderRadius:14, background:D.brandSoft, border:`1px solid ${D.line}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Inbox size={22} color={D.brand} strokeWidth={1.5} />
        </div>
        <div>
          <div style={{ fontSize:14, fontWeight:700, color:D.ink, marginBottom:5 }}>Aucune réservation trouvée</div>
          <div style={{ fontSize:12, color:D.inkLight, lineHeight:1.65 }}>Aucune entrée ne correspond à vos critères actuels.</div>
        </div>
        <button onClick={onRefresh} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:700, background:D.brand, color:'#fff', border:'none', cursor:'pointer' }}>
          <RefreshCw size={12} /> Rafraîchir
        </button>
      </div>
    </td></tr>
  );
}

/* ── Table Row ── */
function ReservationRow({ r, idx }: { r: any; idx: number }) {
  const [hov, setHov] = useState(false);
  const dur = calcDuration(r.date_debut, r.date_fin);
  return (
    <tr className="ab-row" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderBottom:`1px solid ${D.line}`, background: idx % 2 === 0 ? D.surface : '#FAFBFE', transition:'background 0.12s', animation:`fadeUp 0.24s ease ${idx * 35}ms both`, position:'relative' }}>

      {/* Accent strip */}
      <td className="row-accent" style={{ width:0, padding:0, position:'relative' }}>
        <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:D.brand, borderRadius:'0 2px 2px 0', opacity: hov ? 1 : 0, transition:'opacity 0.15s' }} />
      </td>

      {/* Client */}
      <td style={{ padding:'13px 16px 13px 20px' }}>
        <div style={{ fontWeight:700, color:D.ink, fontSize:13, letterSpacing:'-0.01em', lineHeight:1.2 }}>{r.user?.name}</div>
        <div style={{ fontSize:11, color:D.inkLight, marginTop:2 }}>{r.telephone || r.user?.phone || '—'}</div>
      </td>

      {/* Parking */}
      <td style={{ padding:'13px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:8, flexShrink:0, background: hov ? D.brandSoft : `${D.brand}0D`, border:`1px solid ${hov ? D.brand+'30' : 'transparent'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
            <MapPin size={12} color={D.brand} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight:700, color:D.ink, fontSize:13 }}>{r.parking?.nom}</div>
            <div style={{ fontSize:10, color:D.inkLight, marginTop:1 }}>{r.parking?.user?.name || '—'}</div>
          </div>
        </div>
      </td>

      {/* Date */}
      <td style={{ padding:'13px 16px' }}>
        <div style={{ fontWeight:600, color:D.inkMid, fontSize:12 }}>
          {new Date(r.date_debut).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'2-digit' })}
        </div>
        <div style={{ fontSize:10, color:D.inkLight, marginTop:2, display:'flex', alignItems:'center', gap:3 }}>
          <Clock size={9} />
          {new Date(r.date_debut).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
        </div>
      </td>

      {/* Duration */}
      <td style={{ padding:'13px 16px' }}><DurationBar hours={dur} /></td>

      {/* Plate */}
      <td style={{ padding:'13px 16px' }}>
        <span style={{ fontSize:11, fontWeight:700, color:D.inkMid, background:D.surfaceAlt, padding:'3px 8px', borderRadius:5, border:`1px solid ${D.line}`, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.04em', display:'inline-block' }}>
          {r.matricule_vehicule}
        </span>
      </td>

      {/* Amount */}
      <td style={{ padding:'13px 16px' }}>
        <div style={{ fontWeight:800, color:D.ink, fontSize:13, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-0.02em', whiteSpace:'nowrap' }}>
          {r.montant_total?.toLocaleString('fr-FR')} <span style={{ fontSize:9, fontWeight:600, color:D.inkLight }}>FCFA</span>
        </div>
      </td>

      {/* Status */}
      <td style={{ padding:'13px 16px' }}><StatusBadge statut={r.statut} /></td>

      {/* Actions */}
      <td style={{ padding:'13px 16px', textAlign:'right' }}>
        <div className="row-actions" style={{ display:'flex', justifyContent:'flex-end', gap:4, opacity: hov ? 1 : 0, transition:'opacity 0.15s' }}>
          {[Eye, MoreHorizontal].map((Icon, i) => (
            <button key={i} className="ab-action" style={{ width:27, height:27, borderRadius:7, border:`1px solid ${D.line}`, background:D.surfaceAlt, color:D.inkMid, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.14s' }}>
              <Icon size={12} />
            </button>
          ))}
        </div>
      </td>
    </tr>
  );
}

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
export function AdminBookings() {
  const [loading,      setLoading]      = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [search,       setSearch]       = useState('');
  const [spinning,     setSpinning]     = useState(false);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchReservations = async () => {
    setLoading(true); setSpinning(true);
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/admin/reservations`, {
        headers: { Authorization:`Bearer ${localStorage.getItem('token')}`, Accept:'application/json' },
      });
      setReservations(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setTimeout(() => setSpinning(false), 600); }
  };

  useEffect(() => { fetchReservations(); }, []);

  const filtered = useMemo(() => reservations.filter((r: any) => {
    const q = search.toLowerCase();
    return (!q || r.user?.name?.toLowerCase().includes(q) || r.parking?.nom?.toLowerCase().includes(q) || r.matricule_vehicule?.toLowerCase().includes(q))
      && (!filterStatus || r.statut === filterStatus);
  }), [reservations, search, filterStatus]);

  const total   = reservations.length;
  const paid    = reservations.filter((r: any) => r.statut === 'confirme').length;
  const pending = reservations.filter((r: any) => r.statut === 'en_attente').length;

  const FILTER_OPTS = [
    { key: null,         label: 'Tous les statuts', Icon: AlertCircle,    color: D.inkMid  },
    { key: 'confirme',   label: 'Payé',             Icon: CheckCircle2,   color: D.green   },
    { key: 'en_attente', label: 'En attente',        Icon: AlertTriangle,  color: D.amber   },
    { key: 'annule',     label: 'Annulé',            Icon: XCircle,        color: D.red     },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:D.bg, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <header style={{ position:'sticky', top:0, zIndex:10, background:'rgba(255,255,255,0.88)', backdropFilter:'blur(18px) saturate(180%)', WebkitBackdropFilter:'blur(18px) saturate(180%)', borderBottom:`1px solid ${D.line}`, padding:'0 24px' }}>

        {/* Title row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', height:58 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <h1 style={{ fontSize:15, fontWeight:800, color:D.ink, margin:0, letterSpacing:'-0.025em' }}>Flux & Réservations</h1>
            <LiveDot />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>

            {/* Search */}
            <div style={{ position:'relative' }}>
              <Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:D.inkFaint, pointerEvents:'none' }} />
              <input ref={searchRef} className="ab-input" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Client, parking, plaque…"
                style={{ height:34, padding:'0 32px 0 32px', borderRadius:9, border:`1px solid ${D.line}`, fontSize:12, width:240, color:D.ink, background:D.surface, transition:'all 0.18s', fontFamily:'inherit' }} />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', width:16, height:16, borderRadius:'50%', background:D.inkFaint, border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', padding:0, animation:'fadeIn 0.15s ease' }}>
                  <X size={9} color="#fff" />
                </button>
              )}
            </div>

            {/* Filter */}
            <div style={{ position:'relative' }}>
              <button className="ab-btn" onClick={() => setFilterOpen(o => !o)}
                style={{ display:'flex', alignItems:'center', gap:6, height:34, padding:'0 12px', borderRadius:9, background: filterStatus ? D.brandSoft : D.surfaceAlt, border:`1px solid ${filterStatus ? D.brand+'40' : D.line}`, cursor:'pointer', fontSize:12, fontWeight:600, color: filterStatus ? D.brand : D.inkMid, transition:'all 0.15s', fontFamily:'inherit' }}>
                <Filter size={11} />
                {filterStatus ? ST[filterStatus]?.label : 'Filtrer'}
                <ChevronDown size={10} style={{ transform: filterOpen ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s' }} />
              </button>
              {filterOpen && (
                <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, background:D.surface, border:`1px solid ${D.line}`, borderRadius:10, padding:5, width:170, boxShadow:D.shadow, zIndex:100, animation:'slideDown 0.18s ease' }}>
                  {FILTER_OPTS.map(({ key, label, Icon, color }) => (
                    <button key={key ?? 'all'} className="filter-opt" onClick={() => { setFilterStatus(key); setFilterOpen(false); }}
                      style={{ width:'100%', textAlign:'left', padding:'7px 10px', borderRadius:7, background: filterStatus === key ? D.brandSoft : 'transparent', border:'none', cursor:'pointer', fontSize:12, fontWeight:600, color: filterStatus === key ? D.brand : D.inkMid, fontFamily:'inherit', transition:'all 0.12s', display:'flex', alignItems:'center', gap:8 }}>
                      <Icon size={12} style={{ color }} strokeWidth={2} /> {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh */}
            <button className="ab-refresh" onClick={fetchReservations}
              style={{ width:34, height:34, borderRadius:9, background:D.surfaceAlt, border:`1px solid ${D.line}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.15s' }}>
              <RefreshCw size={13} color={D.inkMid} className={spinning ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display:'flex', gap:20, paddingBottom:10, borderTop:`1px solid ${D.line}`, paddingTop:9 }}>
          {[
            { label:'Total', value:total, Icon:Calendar, color:D.brand },
            { label:'Confirmées', value:paid, Icon:CheckCircle2, color:D.green },
            { label:'En attente', value:pending, Icon:Clock, color:D.amber },
            { label:'Filtrés', value:filtered.length, Icon:Filter, color:D.inkMid },
          ].map(({ label, value, Icon, color }, i) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Icon size={11} style={{ color }} />
              <span style={{ fontSize:13, fontWeight:800, color:D.ink, fontFamily:"'JetBrains Mono',monospace" }}>{loading ? '—' : value}</span>
              <span style={{ fontSize:11, color:D.inkLight }}>{label}</span>
              {i < 3 && <span style={{ width:1, height:10, background:D.line, marginLeft:10 }} />}
            </div>
          ))}
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
        <div style={{ background:D.surface, border:`1px solid ${D.line}`, borderRadius:14, overflow:'hidden', boxShadow:D.shadow }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left', minWidth:860 }}>
              <thead>
                <tr style={{ background:D.surfaceAlt, borderBottom:`1px solid ${D.line}` }}>
                  <th style={{ width:3, padding:0 }} />
                  {['Client','Espace / Partenaire','Date','Durée','Véhicule','Montant','Statut',''].map((h, i) => (
                    <th key={i} style={{ padding:'10px 16px', fontSize:9, fontWeight:800, color:D.inkFaint, textTransform:'uppercase', letterSpacing:'0.07em', background:D.surfaceAlt, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} delay={i * 55} />)
                  : filtered.length > 0
                    ? filtered.map((r: any, i: number) => <ReservationRow key={r.id} r={r} idx={i} />)
                    : <EmptyState onRefresh={fetchReservations} />}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div style={{ padding:'9px 20px', background:D.surfaceAlt, borderTop:`1px solid ${D.line}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, color:D.inkLight }}>
                <span style={{ fontWeight:700, color:D.inkMid }}>{filtered.length}</span> résultat{filtered.length > 1 ? 's' : ''}
                {(filterStatus || search) && ` sur ${total} total`}
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:D.inkFaint }}>
                <Zap size={10} /> Données en temps réel
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminBookings;