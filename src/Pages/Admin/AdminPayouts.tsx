import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2, XCircle, Clock, Search, Smartphone,
  RefreshCw, AlertCircle, Wallet, X, Copy, Check,
  Download, TrendingUp, ChevronLeft, ChevronRight,
} from 'lucide-react';

/* ── Tokens ── */
const B   = "#1B3FA0"; const BM  = "#2B52C8"; const BL  = "#EEF2FF"; const BX  = "#F5F7FF";
const O   = "#F97316"; const OL  = "#FFF7ED";  const OP  = "#FEF3E8";
const T   = "#0F172A"; const T2  = "#475569";  const T3  = "#94A3B8"; const T4  = "#CBD5E1";
const BD  = "#E2E8F0"; const BD2 = "#CBD5E1";  const BG  = "#F8FAFC"; const W   = "#ffffff";
const GR  = "#10B981"; const GL  = "#ECFDF5";  const GB  = "#A7F3D0";
const RD  = "#EF4444"; const RL  = "#FEF2F2";  const RB  = "#FECACA";
const AM  = "#F59E0B"; const AL  = "#FFFBEB";  const AB  = "#FDE68A"; const AT  = "#92400E";

const ANIM = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@keyframes up   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
@keyframes row  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes pulse{ 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes sh   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes modal{ from{opacity:0;transform:translateY(14px) scale(.97)} to{opacity:1;transform:none} }
.sk{background:linear-gradient(90deg,${BG} 25%,${BD} 50%,${BG} 75%);background-size:400% 100%;animation:sh 1.4s linear infinite;border-radius:5px}
`;

/* ── Helpers ── */
const fmt = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/,'')}Md`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1).replace(/\.0$/,'')}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1).replace(/\.0$/,'')}k`;
  return n.toLocaleString('fr-FR');
};

interface Retrait {
  id: number; montant: number; methode: string; numero_compte: string;
  statut: 'en_attente'|'valide'|'rejete'; created_at: string;
  reference_transaction?: string; user: { name: string; email: string };
}

/* ── Copy button ── */
function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text); setOk(true); setTimeout(()=>setOk(false),1600); }}
      style={{ background:'none', border:'none', cursor:'pointer', padding:'2px 4px', display:'flex', alignItems:'center', color: ok ? GR : T4, transition:'color .15s' }}>
      {ok ? <Check size={11} strokeWidth={2.5}/> : <Copy size={11} strokeWidth={1.8}/>}
    </button>
  );
}

/* ── Method pill ── */
function Method({ methode, numero }: { methode: string; numero: string }) {
  const wave = methode?.toLowerCase().includes('wave');
  const c = wave ? B : O; const bg = wave ? BL : OP; const bdr = wave ? 'rgba(27,63,160,.15)' : 'rgba(249,115,22,.2)';
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:30, height:30, borderRadius:8, background:bg, border:`1px solid ${bdr}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Smartphone size={13} color={c} strokeWidth={2}/>
      </div>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:T }}>{methode}</div>
        <div style={{ fontSize:11, marginTop:2, fontFamily:"'Sora',monospace", fontWeight:600, color:c }}>{numero}</div>
      </div>
    </div>
  );
}

/* ── Status badge ── */
function Badge({ s }: { s: Retrait['statut'] }) {
  const cfg = {
    valide:    { cls:`bg-[${GL}] text-[#065F46] border-[${GB}]`,   dot:GR,  label:'Validé',     Icon:CheckCircle2 },
    rejete:    { cls:`bg-[${RL}] text-[#991B1B] border-[${RB}]`,   dot:RD,  label:'Rejeté',     Icon:XCircle },
    en_attente:{ cls:`bg-[${AL}] text-[${AT}]   border-[${AB}]`,   dot:AM,  label:'En attente', Icon:Clock },
  }[s];
  const { label, dot, Icon } = cfg;
  const bg = s==='valide'?GL : s==='rejete'?RL : AL;
  const color = s==='valide'?'#065F46' : s==='rejete'?'#991B1B' : AT;
  const border = s==='valide'?GB : s==='rejete'?RB : AB;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:600, whiteSpace:'nowrap', background:bg, color, border:`1px solid ${border}` }}>
      {s==='en_attente'
        ? <span style={{ width:6, height:6, borderRadius:'50%', background:dot, display:'inline-block', animation:'pulse 1.6s ease infinite' }}/>
        : <Icon size={10} strokeWidth={2.5}/>}
      {label}
    </span>
  );
}

/* ── KPI card — adapts to large numbers ── */
function KpiCard({ label, value, rawValue, sub, icon: Icon, color, bg, trend, delay=0 }: {
  label:string; value:string; rawValue:number; sub?:string;
  icon:React.FC<any>; color:string; bg:string; trend?:string; delay?:number;
}) {
  const isBig = rawValue >= 1_000_000;
  return (
    <div style={{ background:W, border:`1px solid ${BD}`, borderRadius:14, padding:'18px 20px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', animation:`up .28s ease ${delay}ms both`, transition:'border-color .15s, box-shadow .15s', cursor:'default' }}
      onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=BD2;(e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 16px rgba(27,63,160,.06)';}}
      onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=BD;(e.currentTarget as HTMLDivElement).style.boxShadow='none';}}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:11, fontWeight:600, color:T3, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:isBig?5:7 }}>{label}</div>
       
<div style={{ 
  fontFamily: "'Sora', sans-serif", 
  fontSize: value.length > 10 ? '18px' : '24px', 
  fontWeight: 800, 
  color, 
  letterSpacing: '-0.03em', 
  maxWidth: '100px',
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis', 
  whiteSpace: 'nowrap' 
}}>
  {value}
</div>
        {isBig && rawValue>=1000 && (
          <div style={{ fontSize:10, color:T3, marginTop:3, fontFamily:"'Sora',monospace", fontWeight:600 }}>
            {rawValue.toLocaleString('fr-FR')} F
          </div>
        )}
        {sub && <div style={{ fontSize:12, color:T3, marginTop:4 }}>{sub}</div>}
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, marginLeft:12 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={16} color={color} strokeWidth={2}/>
        </div>
        {trend && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, color:GR, background:GL, border:`1px solid ${GB}`, padding:'3px 8px', borderRadius:99 }}>
            <TrendingUp size={10} strokeWidth={2.5}/>{trend}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton row ── */
function SkRow() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'2.2fr 1.6fr 1fr 1.2fr 1.1fr .8fr', alignItems:'center', gap:12, padding:'14px 20px', borderBottom:`1px solid ${BD}`, opacity:.7 }}>
      {['52%','76%','60%','68%','72%','60px'].map((w,i)=>(
        <div key={i}><div className="sk" style={{ height:13, width:w, marginBottom:i<2?6:0 }}/>{i<2&&<div className="sk" style={{ height:10, width:'42%' }}/>}</div>
      ))}
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ page, total, perPage, onChange }: { page:number; total:number; perPage:number; onChange:(p:number)=>void }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;

  const getRange = () => {
    if (pages <= 7) return Array.from({length:pages},(_,i)=>i+1);
    if (page <= 4) return [1,2,3,4,5,'…',pages];
    if (page >= pages-3) return [1,'…',pages-4,pages-3,pages-2,pages-1,pages];
    return [1,'…',page-1,page,page+1,'…',pages];
  };

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', background:BG, borderTop:`1px solid ${BD}` }}>
      <span style={{ fontSize:12, color:T3 }}>
        <strong style={{ color:T2 }}>{Math.min((page-1)*perPage+1,total)}–{Math.min(page*perPage,total)}</strong> sur <strong style={{ color:T2 }}>{total}</strong>
      </span>
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        <button disabled={page===1} onClick={()=>onChange(page-1)}
          style={{ width:30, height:30, borderRadius:7, border:`1.5px solid ${BD}`, background:W, display:'flex', alignItems:'center', justifyContent:'center', cursor:page===1?'not-allowed':'pointer', opacity:page===1?.4:1, color:T2, transition:'all .13s' }}>
          <ChevronLeft size={13}/>
        </button>
        {getRange().map((p,i)=>(
          typeof p==='number'
            ? <button key={i} onClick={()=>onChange(p)}
                style={{ width:30, height:30, borderRadius:7, border:`1.5px solid ${p===page?B:BD}`, background:p===page?B:W, color:p===page?'#fff':T2, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .13s' }}>
                {p}
              </button>
            : <span key={i} style={{ width:24, textAlign:'center', color:T3, fontSize:13, userSelect:'none' }}>…</span>
        ))}
        <button disabled={page===pages} onClick={()=>onChange(page+1)}
          style={{ width:30, height:30, borderRadius:7, border:`1.5px solid ${BD}`, background:W, display:'flex', alignItems:'center', justifyContent:'center', cursor:page===pages?'not-allowed':'pointer', opacity:page===pages?.4:1, color:T2, transition:'all .13s' }}>
          <ChevronRight size={13}/>
        </button>
      </div>
    </div>
  );
}

/* ── Action modal ── */
function Modal({ retrait, action, onConfirm, onClose }: { retrait:Retrait; action:'valide'|'rejete'; onConfirm:(ref:string)=>void; onClose:()=>void }) {
  const [val, setVal] = useState('');
  const isVal = action==='valide';
  const btnBg = isVal ? B : RD;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,.5)', backdropFilter:'blur(6px)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', animation:'modal .18s ease' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:W, borderRadius:14, border:`1px solid ${BD}`, boxShadow:'0 24px 64px rgba(0,0,0,.18)', width:'100%', maxWidth:440, padding:24, animation:'modal .24s cubic-bezier(.16,1,.3,1) both' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:isVal?GL:RL, border:`1.5px solid ${isVal?GB:RB}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {isVal?<CheckCircle2 size={18} color={GR} strokeWidth={2}/>:<XCircle size={18} color={RD} strokeWidth={2}/>}
            </div>
            <div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:T, margin:0 }}>{isVal?'Valider le retrait':'Rejeter la demande'}</p>
              <p style={{ fontSize:12, color:T3, margin:'3px 0 0' }}>{retrait.user?.name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:BG, border:`1.5px solid ${BD}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:T3 }}><X size={14}/></button>
        </div>

        {/* Amount */}
        <div style={{ background:BG, border:`1.5px solid ${BD}`, borderRadius:10, padding:'14px 16px', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:5 }}>Montant</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:800, color:T, letterSpacing:'-.03em' }}>
              {retrait.montant?.toLocaleString('fr-FR')} <span style={{ fontSize:12, color:T3 }}>FCFA</span>
            </div>
          </div>
          <Method methode={retrait.methode} numero={retrait.numero_compte}/>
        </div>

        {/* Input */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'.07em', display:'block', marginBottom:7 }}>
            {isVal?'Référence de transaction *':'Motif du rejet *'}
          </label>
          <input autoFocus placeholder={isVal?'Ex: WV-2026-XXXXXXXX':'Ex: Informations incorrectes'}
            value={val} onChange={e=>setVal(e.target.value)}
            style={{ width:'100%', height:38, padding:'0 13px', border:`1.5px solid ${BD}`, borderRadius:8, background:BG, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, color:T, outline:'none', transition:'all .13s', boxSizing:'border-box' }}
            onFocus={e=>{e.target.style.borderColor=BM;e.target.style.background=W;e.target.style.boxShadow='0 0 0 4px rgba(43,82,200,.1)';}}
            onBlur={e=>{e.target.style.borderColor=BD;e.target.style.background=BG;e.target.style.boxShadow='none';}}
          />
        </div>

        {/* Warning */}
        {isVal && (
          <div style={{ display:'flex', gap:10, padding:'10px 13px', background:AL, border:`1px solid ${AB}`, borderRadius:8, marginBottom:18 }}>
            <AlertCircle size={14} color={AT} style={{ flexShrink:0, marginTop:1 }}/>
            <p style={{ fontSize:12, color:AT, margin:0, lineHeight:1.65 }}>
              Assurez-vous d'avoir effectué le virement de <strong>{retrait.montant?.toLocaleString('fr-FR')} FCFA</strong> vers <strong>{retrait.numero_compte}</strong> avant de confirmer.
            </p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:9 }}>
          <button onClick={onClose} style={{ flex:1, height:38, borderRadius:8, border:`1.5px solid ${BD}`, background:W, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:600, color:T2, cursor:'pointer' }}>
            Annuler
          </button>
          <button disabled={!val.trim()} onClick={()=>val.trim()&&onConfirm(val.trim())}
            style={{ flex:2, height:38, borderRadius:8, border:'none', background:val.trim()?btnBg:BG, color:val.trim()?'#fff':T4, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:600, cursor:val.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:7, transition:'all .14s' }}>
            {isVal?<CheckCircle2 size={14}/>:<XCircle size={14}/>}
            {isVal?'Confirmer le paiement':'Confirmer le rejet'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════ MAIN ══════════════════════════════════════ */
const PER_PAGE = 10;

export function AdminPayouts() {
  const [loading,  setLoading]  = useState(true);
  const [retraits, setRetraits] = useState<Retrait[]>([]);
  const [stats,    setStats]    = useState({ total_a_payer:0, nb_attente:0 });
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState<'all'|'en_attente'|'valide'|'rejete'>('all');
  const [modal,    setModal]    = useState<{retrait:Retrait;action:'valide'|'rejete'}|null>(null);
  const [acting,   setActing]   = useState<number|null>(null);
  const [page,     setPage]     = useState(1);

  const API = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
  const tok = () => localStorage.getItem('token');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/admin/retraits`, { headers:{ Authorization:`Bearer ${tok()}`, Accept:'application/json' } });
      const d = await r.json();
      setRetraits(d.retraits??[]); setStats(d.stats??{total_a_payer:0,nb_attente:0});
    } catch(e){console.error(e);}
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{load();},[load]);

  const handleConfirm = async (ref: string) => {
    if(!modal) return;
    const {retrait, action} = modal;
    setModal(null); setActing(retrait.id);
    try {
      const r = await fetch(`${API}/api/admin/retraits/${retrait.id}/${action}`,{
        method:'POST', headers:{Authorization:`Bearer ${tok()}`,'Content-Type':'application/json'},
        body: JSON.stringify({reference:ref,motif:ref}),
      });
      if(r.ok) load();
    } catch{}
    finally { setActing(null); }
  };

  const nbPending = retraits.filter(r=>r.statut==='en_attente').length;
  const totalVal  = retraits.filter(r=>r.statut==='valide').reduce((s,r)=>s+(r.montant??0),0);
  const nbRej     = retraits.filter(r=>r.statut==='rejete').length;

  const filtered = useMemo(()=>retraits.filter(r=>{
    if(filter!=='all'&&r.statut!==filter) return false;
    if(search){const q=search.toLowerCase();return r.user?.name?.toLowerCase().includes(q)||r.user?.email?.toLowerCase().includes(q);}
    return true;
  }),[retraits,filter,search]);

  // Reset page on filter/search change
  useEffect(()=>setPage(1),[filter,search]);

  const paginated = useMemo(()=>filtered.slice((page-1)*PER_PAGE, page*PER_PAGE),[filtered,page]);

  const TABS = [
    {key:'all' as const,        label:'Tous',       count:retraits.length},
    {key:'en_attente' as const, label:'En attente', count:nbPending},
    {key:'valide' as const,     label:'Validés'},
    {key:'rejete' as const,     label:'Rejetés'},
  ];

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:BG, minHeight:'100vh', color:T }}>
      <style>{ANIM}</style>
      {modal && <Modal retrait={modal.retrait} action={modal.action} onConfirm={handleConfirm} onClose={()=>setModal(null)}/>}

      {/* Nav */}
      <nav style={{ background:W, borderBottom:`1px solid ${BD}`, position:'sticky', top:0, zIndex:40 }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 2rem', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:B, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(27,63,160,.28)' }}>
              <Wallet size={20} color="#fff" strokeWidth={2}/>
            </div>
            <div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:T, lineHeight:1.1 }}>SenovaPark</div>
              <div style={{ fontSize:11, fontWeight:600, color:B, textTransform:'uppercase', letterSpacing:'.07em' }}>Finance · Retraits</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={load} style={{ height:36, padding:'0 14px', display:'flex', alignItems:'center', gap:7, background:W, border:`1.5px solid ${BD}`, borderRadius:8, fontSize:13, fontWeight:600, color:T2, cursor:'pointer', fontFamily:'inherit' }}>
              <RefreshCw size={13} style={{ animation:loading?'spin .7s linear infinite':'none' }}/> Actualiser
            </button>
            <button style={{ height:36, padding:'0 14px', display:'flex', alignItems:'center', gap:7, background:B, border:'none', borderRadius:8, fontSize:13, fontWeight:600, color:'#fff', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(27,63,160,.2)' }}>
              <Download size={13}/> Exporter
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth:1280, margin:'0 auto', padding:'2.5rem 2rem 5rem' }}>

        {/* Heading */}
        <div style={{ marginBottom:'2rem', animation:'up .28s ease both' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
            <span style={{ fontSize:12, color:T3, fontWeight:500 }}>Finance</span>
            <span style={{ color:T4, fontSize:11 }}>›</span>
            <span style={{ fontSize:12, color:T2, fontWeight:500 }}>Retraits partenaires</span>
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color:T, margin:0, letterSpacing:'-.025em' }}>Validation des retraits</h1>
          <p style={{ fontSize:14, color:T3, marginTop:5 }}>Gérez et validez les flux sortants vers vos partenaires.</p>
        </div>

        {/* KPIs — adaptés grands chiffres */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:'2rem' }}>
          <KpiCard label="À décaisser"      rawValue={stats.total_a_payer} value={`${fmt(stats.total_a_payer)} F`} sub="En attente de traitement" icon={Wallet}       color={O}  bg={OP} delay={0}/>
          <KpiCard label="Demandes actives" rawValue={nbPending}           value={String(nbPending)}              sub="Nécessitent une action"   icon={Clock}        color={B}  bg={BL} delay={60}/>
          <KpiCard label="Total validé"     rawValue={totalVal}            value={`${fmt(totalVal)} F`}           sub="Payés avec succès"        icon={CheckCircle2} color={GR} bg={GL} trend="+12%" delay={120}/>
          <KpiCard label="Rejetés"          rawValue={nbRej}               value={String(nbRej)}                  sub="Demandes refusées"        icon={XCircle}      color={RD} bg={RL} delay={180}/>
        </div>

        {/* Table card */}
        <div style={{ background:W, border:`1px solid ${BD}`, borderRadius:14, overflow:'hidden', animation:'up .28s ease 200ms both' }}>

          {/* Toolbar */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:`1px solid ${BD}`, gap:12, flexWrap:'wrap' }}>
            {/* Tabs */}
            <div style={{ display:'flex', gap:2, background:BG, borderRadius:9, padding:3, border:`1px solid ${BD}` }}>
              {TABS.map(t=>{
                const on = filter===t.key;
                return (
                  <button key={t.key} onClick={()=>setFilter(t.key)}
                    style={{ display:'flex', alignItems:'center', gap:6, height:30, padding:'0 12px', borderRadius:7, border:'none', background:on?W:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:on?600:500, color:on?T:T3, boxShadow:on?'0 1px 4px rgba(0,0,0,.09)':'none', transition:'all .12s' }}>
                    {t.label}
                    {'count' in t && t.count!==undefined && (
                      <span style={{ fontSize:11, fontWeight:700, padding:'0 6px', height:18, minWidth:18, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:5, background:on?BL:BD, color:on?B:T3 }}>
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div style={{ display:'flex', alignItems:'center', gap:8, background:BG, border:`1.5px solid ${BD}`, borderRadius:8, padding:'0 12px', height:36, minWidth:230, transition:'all .13s' }}
              onFocusCapture={e=>{e.currentTarget.style.background=W;e.currentTarget.style.borderColor=BM;e.currentTarget.style.boxShadow='0 0 0 4px rgba(43,82,200,.1)';}}
              onBlurCapture={e=>{e.currentTarget.style.background=BG;e.currentTarget.style.borderColor=BD;e.currentTarget.style.boxShadow='none';}}>
              <Search size={13} color={T3} style={{ flexShrink:0 }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un partenaire…"
                style={{ background:'transparent', border:'none', outline:'none', fontSize:13, color:T, flex:1, fontFamily:"'Plus Jakarta Sans',sans-serif" }}/>
              {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:T3, padding:0 }}><X size={13}/></button>}
            </div>
          </div>

          {/* Column headers */}
          <div style={{ display:'grid', gridTemplateColumns:'2.2fr 1.6fr 1fr 1.2fr 1.1fr .8fr', alignItems:'center', gap:12, padding:'11px 20px', borderBottom:`1px solid ${BD}`, background:BG }}>
            {['Partenaire','Méthode','Montant','Date','Statut','Actions'].map((h,i)=>(
              <div key={h} style={{ fontSize:10, fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'.07em', textAlign:i===2?'right':'left' }}>{h}</div>
            ))}
          </div>

          {/* Body */}
          <div>
            {loading
              ? Array.from({length:6}).map((_,i)=><SkRow key={i}/>)
              : filtered.length===0
              ? (
                <div style={{ padding:'5rem 2rem', textAlign:'center' }}>
                  <div style={{ width:56, height:56, borderRadius:'50%', background:search?BL:GL, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                    {search?<Search size={24} color={B} strokeWidth={1.5}/>:<CheckCircle2 size={24} color={GR} strokeWidth={1.5}/>}
                  </div>
                  <p style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:T, margin:'0 0 6px' }}>
                    {search?'Aucun résultat':'Tout est à jour !'}
                  </p>
                  <p style={{ fontSize:13, color:T3 }}>{search?`Aucun partenaire pour "${search}".`:'Aucune demande pour ce filtre.'}</p>
                </div>
              )
              : paginated.map((r,i)=>{
                const pend = r.statut==='en_attente';
                const busy = acting===r.id;
                return (
                  <div key={r.id}
                    style={{ display:'grid', gridTemplateColumns:'2.2fr 1.6fr 1fr 1.2fr 1.1fr .8fr', alignItems:'center', gap:12, padding:'14px 20px', borderBottom:`1px solid ${BD}`, transition:'background .1s', cursor:'default', animation:`row .2s ease ${Math.min(i*30,180)}ms both`, opacity:busy?.5:1 }}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background=BX}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}>

                    {/* Partner */}
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:T, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.user?.name}</div>
                      <div style={{ fontSize:12, color:T3, marginTop:2, display:'flex', alignItems:'center', gap:4 }}>
                        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.user?.email}</span>
                        <CopyBtn text={r.user?.email??''}/>
                      </div>
                    </div>

                    {/* Method */}
                    <Method methode={r.methode} numero={r.numero_compte}/>

                    {/* Amount */}
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color:T, letterSpacing:'-.025em' }}>{fmt(r.montant??0)}</div>
                      <div style={{ fontSize:9, color:T3, textTransform:'uppercase', letterSpacing:'.05em', marginTop:2, fontWeight:600 }}>FCFA</div>
                    </div>

                    {/* Date */}
                    <div>
                      <div style={{ fontSize:13, color:T2, fontWeight:500 }}>
                        {new Date(r.created_at).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'})}
                      </div>
                      <div style={{ fontSize:11, color:T3, marginTop:2 }}>
                        {new Date(r.created_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <Badge s={r.statut}/>
                      {r.statut==='valide'&&r.reference_transaction&&(
                        <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:5 }}>
                          <span style={{ fontFamily:'monospace', fontSize:10, color:T3 }}>{r.reference_transaction.substring(0,12)}…</span>
                          <CopyBtn text={r.reference_transaction}/>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', gap:6, opacity:pend?1:0, transition:'opacity .12s' }}>
                      {pend ? (
                        <>
                          <button title="Valider" disabled={busy} onClick={()=>setModal({retrait:r,action:'valide'})}
                            style={{ width:32, height:32, padding:0, borderRadius:8, background:GL, color:GR, border:`1.5px solid ${GB}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .13s' }}
                            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=GR;(e.currentTarget as HTMLButtonElement).style.color='#fff';}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background=GL;(e.currentTarget as HTMLButtonElement).style.color=GR;}}>
                            {busy?<RefreshCw size={12} style={{animation:'spin .7s linear infinite'}}/>:<CheckCircle2 size={13} strokeWidth={2}/>}
                          </button>
                          <button title="Rejeter" disabled={busy} onClick={()=>setModal({retrait:r,action:'rejete'})}
                            style={{ width:32, height:32, padding:0, borderRadius:8, background:RL, color:RD, border:`1.5px solid ${RB}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .13s' }}
                            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=RD;(e.currentTarget as HTMLButtonElement).style.color='#fff';}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background=RL;(e.currentTarget as HTMLButtonElement).style.color=RD;}}>
                            <XCircle size={13} strokeWidth={2}/>
                          </button>
                        </>
                      ) : <span style={{ fontSize:13, color:T4 }}>—</span>}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={p=>{setPage(p);window.scrollTo({top:0,behavior:'smooth'});}}/>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminPayouts;