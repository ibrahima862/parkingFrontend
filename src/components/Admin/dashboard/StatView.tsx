import React from "react";
import {
  AlertCircle, Building2, CheckCircle2, Clock,
  CreditCard, Users, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { ActivityFeed } from "./ActivityFeed";

/* ── Tokens ── */
const B  = "#1B3FA0"; const BL = "#EEF2FF";
const O  = "#F97316"; const OL = "#FFF7ED";
const T  = "#0F172A"; const T2 = "#475569"; const T3 = "#94A3B8";
const BD = "#E2E8F0"; const BG = "#F8FAFC"; const W  = "#ffffff";
const GR = "#10B981"; const GL = "#ECFDF5"; const GB = "#A7F3D0";
const RD = "#EF4444"; const RL = "#FEF2F2";
const AM = "#F59E0B"; const AL = "#FFFBEB";
const PU = "#8B5CF6"; const PL = "#F5F3FF";

const ANIM = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@keyframes sv-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
@keyframes sv-sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.sv-sk{background:linear-gradient(90deg,${BG} 25%,${BD} 50%,${BG} 75%);background-size:400% 100%;animation:sv-sh 1.4s linear infinite;border-radius:6px}
`;

/* ── Types ── */
interface StatsViewProps {
  propCount: number;
  parkCount: number;
  loading?: boolean;
  globalStats: {
    ca_total?: number;
    retraits_somme?: number;
    taux_approbation?: number;
    temps_moyen?: number;
    validations_mois?: number;
    alertes_actives?: number;
    croissance_ca?: number;
    croissance_proprios?: number;
    recent_activities?: any[];
  };
}

/* ── Number formatter for large values ── */
const fmt = (n: number): string => {
  if (n >= 1_000_000_000) return `${(n/1_000_000_000).toFixed(1).replace(/\.0$/,'')}Md F`;
  if (n >= 1_000_000)     return `${(n/1_000_000).toFixed(1).replace(/\.0$/,'')}M F`;
  if (n >= 100_000)       return `${(n/1_000).toFixed(0)}k F`;
  return `${n.toLocaleString('fr-FR')} F`;
};

/* ── Main stat card ── */
function StatCard({ label, value, rawValue, icon: Icon, color, bg, trend, trendUp, delay = 0, loading }:{
  label:string; value:string|number; rawValue?:number; icon:React.ElementType;
  color:string; bg:string; trend?:string; trendUp?:boolean; delay?:number; loading?:boolean;
}) {
  return (
    <div style={{ background:W, border:`1px solid ${BD}`, borderRadius:14, padding:'20px 22px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', animation:`sv-up .3s ease ${delay}ms both`, transition:'border-color .15s, box-shadow .15s' }}
      onMouseEnter={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor='#CBD5E1';d.style.boxShadow='0 4px 16px rgba(27,63,160,.07)';}}
      onMouseLeave={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=BD;d.style.boxShadow='none';}}>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:11, fontWeight:600, color:T3, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>{label}</p>
        {loading
          ? <div className="sv-sk" style={{ height:28, width:'60%', marginBottom:8 }}/>
          : <p style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:800, color, letterSpacing:'-.03em', lineHeight:1, margin:'0 0 4px' }}>{value}</p>}
        {rawValue && rawValue >= 100_000 && !loading && (
          <p style={{ fontSize:10, color:T3, fontFamily:'monospace', fontWeight:600, margin:0 }}>
            {rawValue.toLocaleString('fr-FR')} FCFA
          </p>
        )}
        {trend && !loading && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:10, fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:99, background:trendUp?GL:RL, color:trendUp?GR:RD, border:`1px solid ${trendUp?GB:'#FECACA'}` }}>
            {trendUp?<ArrowUpRight size={10} strokeWidth={3}/>:<ArrowDownRight size={10} strokeWidth={3}/>}{trend}
          </span>
        )}
      </div>
      <div style={{ width:40, height:40, borderRadius:11, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={17} color={color} strokeWidth={2}/>
      </div>
    </div>
  );
}

/* ── KPI strip item ── */
function KpiItem({ label, value, icon: Icon, color, bg, loading }:{
  label:string; value:string|number; icon:React.ElementType; color:string; bg:string; loading?:boolean;
}) {
  return (
    <div style={{ background:W, padding:'16px 20px', display:'flex', alignItems:'center', gap:13, transition:'background .13s', cursor:'default' }}
      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background=BG}
      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=W}>
      <div style={{ width:34, height:34, borderRadius:9, background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={14} color={color} strokeWidth={2.5}/>
      </div>
      <div>
        {loading
          ? <><div className="sv-sk" style={{ height:14, width:50, marginBottom:5 }}/><div className="sv-sk" style={{ height:9, width:36 }}/></>
          : <>
            <p style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:800, color:T, letterSpacing:'-.02em', margin:'0 0 2px' }}>{value}</p>
            <p style={{ fontSize:10, fontWeight:700, color:T3, textTransform:'uppercase', letterSpacing:'.08em', margin:0 }}>{label}</p>
          </>}
      </div>
    </div>
  );
}

/* ══════════════════ MAIN ══════════════════ */
export function StatsView({ propCount, parkCount, globalStats, loading = false }: StatsViewProps) {
  const caTotal      = globalStats?.ca_total ?? 0;
  const retraits     = globalStats?.retraits_somme ?? 0;
  const croissCA     = globalStats?.croissance_ca;
  const croissProps  = globalStats?.croissance_proprios;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <style>{ANIM}</style>

      {/* ── 4 main KPI cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:14 }}>
        <StatCard
          label="Propriétaires en attente" value={loading?'—':propCount}
          icon={Users} color={AM} bg={AL}
          trend={croissProps?`+${croissProps}`:undefined} trendUp delay={0} loading={loading}
        />
        <StatCard
          label="Parkings à valider" value={loading?'—':parkCount}
          icon={Building2} color={B} bg={BL}
          delay={60} loading={loading}
        />
        <StatCard
          label="Retraits en attente" value={loading?'—':fmt(retraits)} rawValue={retraits>=100_000?retraits:undefined}
          icon={CreditCard} color={RD} bg={RL}
          delay={120} loading={loading}
        />
        <StatCard
          label="Chiffre d'affaires" value={loading?'—':fmt(caTotal)} rawValue={caTotal>=100_000?caTotal:undefined}
          icon={Wallet} color={GR} bg={GL}
          trend={croissCA!=null?`${croissCA>0?'+':''}${croissCA}%`:undefined}
          trendUp={(croissCA??0)>=0}
          delay={180} loading={loading}
        />
      </div>

      {/* ── KPI strip ── */}
      <div style={{ background:BD, border:`1px solid ${BD}`, borderRadius:14, overflow:'hidden', animation:'sv-up .3s ease 240ms both' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:1 }}>
          <KpiItem label="Taux approbation"  value={`${globalStats?.taux_approbation??0}%`}               icon={TrendingUp}   color={GR} bg={GL} loading={loading}/>
          <KpiItem label="Temps moyen"       value={`${globalStats?.temps_moyen??0}h`}                    icon={Clock}        color={B}  bg={BL} loading={loading}/>
          <KpiItem label="Ce mois"           value={`${globalStats?.validations_mois??0} val.`}           icon={CheckCircle2} color={PU} bg={PL} loading={loading}/>
          <KpiItem label="Alertes actives"   value={String(globalStats?.alertes_actives??0)}              icon={AlertCircle}  color={AM} bg={AL} loading={loading}/>
        </div>
      </div>

      {/* ── Activity feed ── */}
      <div style={{ background:W, border:`1px solid ${BD}`, borderRadius:14, overflow:'hidden', animation:'sv-up .3s ease 300ms both' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 20px', borderBottom:`1px solid ${BD}`, background:BG }}>
          <div style={{ width:28, height:28, borderRadius:8, background:BL, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <TrendingUp size={13} color={B} strokeWidth={2.5}/>
          </div>
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:T, margin:0, lineHeight:1.1 }}>Activité récente</p>
            <p style={{ fontSize:11, color:T3, margin:0, marginTop:1 }}>Dernières actions sur la plateforme</p>
          </div>
        </div>
        <div style={{ padding:'4px 0' }}>
          <ActivityFeed activities={globalStats?.recent_activities||[]} loading={loading}/>
        </div>
      </div>
    </div>
  );
}