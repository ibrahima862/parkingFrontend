import React, { useState, useMemo } from "react";
import {
  Search, Car, CreditCard, Shield, ChevronDown,
  MessageCircle, Phone, CheckCircle2, Star, HelpCircle,
  Wallet, CalendarX, Navigation, Zap, ArrowRight,
  Mail, Clock, MapPin,
} from "lucide-react";

/* ── Tokens ── */
const B  = "#1B3FA0"; const BM = "#2B52C8"; const BL = "#EEF2FF";
const O  = "#F97316"; const OL = "#FFF7ED";
const T  = "#0F172A"; const T2 = "#475569"; const T3 = "#94A3B8";
const BD = "#E2E8F0"; const BG = "#F8FAFC"; const W  = "#ffffff";
const GR = "#10B981"; const GL = "#ECFDF5"; const GB = "#A7F3D0";

const ANIM = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@keyframes hp-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
`;

/* ── All FAQ data ── */
const ALL_FAQS = [
  { cat:"reservation", q:"Puis-je modifier l'heure de ma réservation ?",  a:"Oui, jusqu'à 30 minutes avant le début de votre créneau depuis 'Mes réservations'." },
  { cat:"reservation", q:"Que se passe-t-il si je suis en retard ?",       a:"Votre place est maintenue 30 minutes. Au-delà, la réservation peut être annulée si le parking est complet." },
  { cat:"reservation", q:"Puis-je réserver pour quelqu'un d'autre ?",      a:"Oui, renseignez la plaque du véhicule concerné. Le conducteur recevra le QR code par SMS." },
  { cat:"paiement",    q:"Quels moyens de paiement sont acceptés ?",       a:"Wave, Orange Money, Free Money, Visa et Mastercard. Paiement entièrement sécurisé." },
  { cat:"paiement",    q:"Puis-je obtenir une facture ?",                   a:"Oui, disponible en PDF dans votre espace 'Historique' après chaque paiement." },
  { cat:"paiement",    q:"Y a-t-il des frais cachés ?",                    a:"Non. Le prix affiché est le prix final, sans frais de service ni surprise." },
  { cat:"annulation",  q:"Comment annuler une réservation ?",              a:"Depuis 'Mes réservations', sélectionnez-la et cliquez 'Annuler'. Gratuit si plus de 2h avant." },
  { cat:"annulation",  q:"Suis-je remboursé ?",                            a:"Oui à 100% si annulation >2h avant. Remboursement sous 24h-48h sur votre moyen de paiement." },
  { cat:"securite",    q:"Mes données bancaires sont-elles sécurisées ?",  a:"SenovaPark ne stocke jamais vos données bancaires. Paiements traités par prestataires certifiés PCI-DSS." },
  { cat:"navigation",  q:"Comment naviguer vers le parking ?",             a:"Appuyez sur 'M'y rendre' pour ouvrir Google Maps ou Waze directement depuis l'appli." },
];

const CATS = [
  { key:"tous",        label:"Tous",         icon:HelpCircle,    color:T2,     bg:BG    },
  { key:"reservation", label:"Réservation",  icon:Car,           color:B,      bg:BL    },
  { key:"paiement",    label:"Paiement",     icon:CreditCard,    color:O,      bg:OL    },
  { key:"annulation",  label:"Annulation",   icon:CalendarX,     color:"#DC2626", bg:"#FEF2F2" },
  { key:"securite",    label:"Sécurité",     icon:Shield,        color:"#7C3AED", bg:"#F5F3FF" },
  { key:"navigation",  label:"Navigation",   icon:Navigation,    color:GR,     bg:GL    },
];

const STEPS = [
  { n:"01", icon:Search,       title:"Trouvez votre parking",    body:"Entrez votre destination. SenovaPark affiche les parkings disponibles avec tarifs en temps réel.", color:B,  bg:BL },
  { n:"02", icon:Clock,        title:"Sélectionnez un créneau",  body:"Indiquez votre heure d'arrivée et la durée. Le tarif total est calculé automatiquement.", color:O,  bg:OL },
  { n:"03", icon:CreditCard,   title:"Payez en toute sécurité",  body:"Wave, Orange Money ou carte. Confirmation instantanée par SMS.", color:GR, bg:GL },
  { n:"04", icon:CheckCircle2, title:"Scannez et garez-vous",    body:"QR code à l'entrée. La barrière s'ouvre automatiquement. Aucune paperasse.", color:B,  bg:BL },
];

/* ── FAQ item ── */
function FaqItem({ q, a, delay=0 }: { q:string; a:string; delay?:number }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(v=>!v)}
      style={{ background:W, border:`1px solid ${open?'rgba(27,63,160,.2)':BD}`, borderRadius:12, overflow:'hidden', cursor:'pointer', transition:'border-color .13s', animation:`hp-up .28s ease ${delay}ms both` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', gap:12 }}>
        <p style={{ fontSize:14, fontWeight:600, color:T, margin:0, flex:1 }}>{q}</p>
        <div style={{ width:26, height:26, borderRadius:7, background:open?BL:BG, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:open?B:T3, transition:'all .2s', transform:open?'rotate(180deg)':'none' }}>
          <ChevronDown size={13} strokeWidth={2.5}/>
        </div>
      </div>
      {open && (
        <div style={{ fontSize:13, color:T2, lineHeight:1.75, padding:'0 18px 16px', borderTop:`1px solid ${BD}` }}>{a}</div>
      )}
    </div>
  );
}

/* ══════════════════════════════════ MAIN ══════════════════════════════════ */
export function HelpPage() {
  const [search,  setSearch]  = useState("");
  const [active,  setActive]  = useState("tous");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_FAQS.filter(f =>
      (active==="tous" || f.cat===active) &&
      (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
    );
  }, [search, active]);

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", background:BG, minHeight:'100vh', color:T }}>
      <style>{ANIM}</style>

     

      {/* ── Hero ── */}
      <div style={{ background:`linear-gradient(135deg,${T} 0%,${B} 100%)`, padding:'4rem 1.5rem 3.5rem' }}>
        <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center', animation:'hp-up .4s ease both' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:99, padding:'5px 14px', marginBottom:20 }}>
            <Zap size={11} color="#fbbf24" strokeWidth={2.5}/>
            <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.8)', textTransform:'uppercase', letterSpacing:'.08em' }}>Réponses instantanées</span>
          </div>
          <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:38, fontWeight:800, color:'#fff', margin:'0 0 14px', letterSpacing:'-.025em', lineHeight:1.15 }}>
            Comment pouvons-nous<br/>vous <span style={{ color:'#fbbf24' }}>aider ?</span>
          </h1>
          <p style={{ fontSize:16, color:'rgba(255,255,255,.65)', margin:'0 0 2.5rem', lineHeight:1.7 }}>
            Trouvez rapidement des réponses sur les réservations, paiements et plus encore.
          </p>
          {/* Search */}
          <div style={{ display:'flex', alignItems:'center', background:W, borderRadius:14, padding:'6px 6px 6px 18px', boxShadow:'0 8px 32px rgba(0,0,0,.2)', maxWidth:500, margin:'0 auto' }}>
            <Search size={15} color={T3} style={{ marginRight:10, flexShrink:0 }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Recherchez une question…"
              style={{ flex:1, border:'none', outline:'none', fontSize:14, color:T, fontFamily:"'Plus Jakarta Sans',sans-serif", background:'transparent' }}/>
            {search && (
              <button onClick={()=>setSearch("")} style={{ background:'none', border:'none', cursor:'pointer', color:T3, marginRight:6, padding:0, display:'flex' }}>✕</button>
            )}
            <button style={{ padding:'10px 18px', background:O, color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit', transition:'opacity .14s' }}
              onMouseEnter={e=>(e.currentTarget.style.opacity='.85')} onMouseLeave={e=>(e.currentTarget.style.opacity='1')}>
              Rechercher
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'3rem 1.5rem 5rem', display:'grid', gap:'2.5rem', gridTemplateColumns:'1fr 1fr', alignItems:'start' }}>

        {/* ── LEFT — FAQ ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>

          {/* Category chips */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {CATS.map(cat=>{
              const on = active===cat.key;
              const Icon = cat.icon;
              return (
                <button key={cat.key} onClick={()=>setActive(cat.key)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 13px', borderRadius:99, border:`1.5px solid ${on?cat.color:BD}`, background:on?cat.bg:W, cursor:'pointer', fontSize:12, fontWeight:600, color:on?cat.color:T2, transition:'all .13s', fontFamily:'inherit' }}>
                  <Icon size={12} strokeWidth={2.5}/>{cat.label}
                </button>
              );
            })}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div style={{ background:W, border:`1px solid ${BD}`, borderRadius:16, padding:'4rem 2rem', textAlign:'center' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:BL, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <Search size={22} color={B} strokeWidth={1.5}/>
              </div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:T, margin:'0 0 6px' }}>Aucun résultat</p>
              <p style={{ fontSize:13, color:T3 }}>Essayez d'autres termes ou <button onClick={()=>{setSearch('');setActive('tous');}} style={{ color:B, background:'none', border:'none', cursor:'pointer', fontWeight:600, fontFamily:'inherit' }}>réinitialisez</button> les filtres.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {search && (
                <p style={{ fontSize:12, color:T3, marginBottom:4 }}>
                  <strong style={{ color:T2 }}>{filtered.length}</strong> résultat{filtered.length>1?'s':''} pour <em>"{search}"</em>
                </p>
              )}
              {filtered.map((f,i)=><FaqItem key={i} q={f.q} a={f.a} delay={i*30}/>)}
            </div>
          )}
        </div>

        {/* ── RIGHT — Steps + Contact ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

          {/* How it works */}
          <div style={{ background:W, border:`1px solid ${BD}`, borderRadius:16, overflow:'hidden', animation:'hp-up .35s ease 60ms both' }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${BD}`, background:BG, display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:BL, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <CheckCircle2 size={14} color={B} strokeWidth={2.5}/>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:T, margin:0 }}>Comment réserver ?</p>
                <p style={{ fontSize:11, color:T3, margin:0 }}>4 étapes simples</p>
              </div>
            </div>
            <div style={{ padding:'4px 0' }}>
              {STEPS.map((s,i)=>{
                const Icon = s.icon;
                return (
                  <div key={i} style={{ display:'flex', gap:14, padding:'14px 20px', borderBottom: i<STEPS.length-1?`1px solid ${BD}`:'none', transition:'background .1s' }}
                    onMouseEnter={e=>(e.currentTarget.style.background=BG)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                    <div style={{ width:34, height:34, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon size={14} color={s.color} strokeWidth={2}/>
                    </div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                        <span style={{ fontSize:9, fontWeight:800, color:s.color, background:s.bg, padding:'2px 6px', borderRadius:99, letterSpacing:'.06em' }}>{s.n}</span>
                        <p style={{ fontSize:13, fontWeight:700, color:T, margin:0 }}>{s.title}</p>
                      </div>
                      <p style={{ fontSize:12, color:T2, margin:0, lineHeight:1.6 }}>{s.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Refund policy */}
          <div style={{ background:W, border:`1px solid ${BD}`, borderRadius:16, overflow:'hidden', animation:'hp-up .35s ease 100ms both' }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${BD}`, background:BG, display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:GL, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Wallet size={14} color={GR} strokeWidth={2.5}/>
              </div>
              <p style={{ fontSize:13, fontWeight:700, color:T, margin:0 }}>Politique d'annulation</p>
            </div>
            {[
              { label:'>2h avant',       badge:'100% remboursé', dot:GR, bg:GL, border:GB,          color:'#065F46' },
              { label:'30min – 2h avant',badge:'50% remboursé',  dot:O,  bg:OL, border:'#fdba74',   color:'#c2410c' },
              { label:'<30min avant',    badge:'Non remboursable',dot:'#EF4444',bg:'#FEF2F2',border:'#FECACA', color:'#991B1B' },
            ].map((r,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 20px', borderBottom:i<2?`1px solid ${BD}`:'none' }}>
                <span style={{ fontSize:13, fontWeight:500, color:T2 }}>{r.label}</span>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', background:r.bg, border:`1px solid ${r.border}`, borderRadius:99, fontSize:11, fontWeight:700, color:r.color }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:r.dot }}/>
                  {r.badge}
                </span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{ background:W, border:`1px solid ${BD}`, borderRadius:16, overflow:'hidden', animation:'hp-up .35s ease 140ms both' }}>
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${BD}`, background:BG }}>
              <p style={{ fontSize:13, fontWeight:700, color:T, margin:0 }}>Nous contacter</p>
              <p style={{ fontSize:11, color:T3, margin:'2px 0 0' }}>Support disponible 7j/7</p>
            </div>
            {[
              { icon:MessageCircle, label:'Chat en direct', sub:'Réponse en moins de 5 min', cta:'Ouvrir', ctaColor:B, bg:BL },
              { icon:Phone,         label:'Téléphone',      sub:'+221 33 800 00 00',          cta:'Appeler', ctaColor:O, bg:OL },
              { icon:Mail,          label:'Email',          sub:'support@senovapark.sn',       cta:'Écrire', ctaColor:GR, bg:GL },
            ].map((c,i)=>{
              const Icon = c.icon;
              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 20px', borderBottom:i<2?`1px solid ${BD}`:'none', transition:'background .1s', cursor:'pointer' }}
                  onMouseEnter={e=>(e.currentTarget.style.background=BG)} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                  <div style={{ width:34, height:34, borderRadius:9, background:c.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icon size={14} color={c.ctaColor} strokeWidth={2}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:T, margin:0 }}>{c.label}</p>
                    <p style={{ fontSize:11, color:T3, margin:'2px 0 0' }}>{c.sub}</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, fontWeight:700, color:c.ctaColor }}>
                    {c.cta}<ArrowRight size={12}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpPage;