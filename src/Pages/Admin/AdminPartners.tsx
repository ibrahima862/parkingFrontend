import React, { useState, useEffect, useMemo, use } from 'react';
import {
  Building2, Search, Mail, Phone, TrendingUp, LayoutGrid,
  RefreshCw, Download, X, MapPin, ChevronRight, MoreHorizontal,
  ArrowUpRight, Zap, Star,
} from 'lucide-react';
import { usePagination } from '../../hook/usePagination';
import { Pagination } from '../../components/Admin/parkings/Pagination';
/* ── Tokens ── */
const B  = "#1B3FA0"; const BM = "#2B52C8"; const BL = "#EEF2FF"; const BG = "#F8FAFC";
const O  = "#F97316"; const OL = "#FFF7ED";
const T  = "#0F172A"; const T2 = "#475569"; const T3 = "#94A3B8"; const BD = "#E2E8F0"; const W = "#fff";
const GR = "#10B981"; const GL = "#ECFDF5"; const GB = "#A7F3D0";
const AM = "#F59E0B"; const AL = "#FFFBEB"; const AB = "#FDE68A";

const ANIM = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@keyframes in-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes in-r  { from{opacity:0;transform:translateX(10px)} to{opacity:1;transform:none} }
@keyframes spin  { to{transform:rotate(360deg)} }
@keyframes sh    { 0%{background-position:200% 0}100%{background-position:-200% 0} }
.spin{animation:spin .7s linear infinite}
.sk{background:linear-gradient(90deg,${BG} 25%,${BD} 50%,${BG} 75%);background-size:400% 100%;animation:sh 1.4s linear infinite;border-radius:5px}
`;

interface Partner {
  id: number; name: string; email: string; telephone: string;
  nb_parkings: number; ca_genere: number; statut: 'actif' | 'en_attente';
  quartier?: string; nb_reservations?: number;
}

/* ─── Mini sparkline SVG (fake data for visual only) ─── */
function Spark({ color, up }: { color: string; up: boolean }) {
  const pts = up
    ? "0,18 8,14 16,16 24,10 32,12 40,6 48,8 56,4 64,2"
    : "0,4  8,8  16,6  24,12 32,10 40,16 48,14 56,18 64,16";
  return (
    <svg width={64} height={20} viewBox="0 0 64 20" fill="none">
      <polyline points={pts} stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" opacity={.7} />
    </svg>
  );
}

/* ─── CA bar (relative to max) ─── */
function CABar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ position: "relative", height: 4, background: BD, borderRadius: 99, overflow: "hidden", width: "100%" }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width .6s ease" }} />
    </div>
  );
}

/* ─── Heatmap dot grid ─── */
function HeatDots({ count }: { count: number }) {
  const cells = 20;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 2 }}>
      {Array.from({ length: cells }).map((_, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i < Math.min(count, cells) ? B : BD, opacity: i < Math.min(count, cells) ? 1 - i * 0.03 : 0.4 }} />
      ))}
    </div>
  );
}

/* ─── Partner row (main table) ─── */
function PartnerRow({ p, rank, maxCA, selected, onSelect, delay }:
  { p: Partner; rank: number; maxCA: number; selected: boolean; onSelect: () => void; delay: number }) {
  const actif = p.statut === 'actif';
  const hue   = (p.id * 53) % 360;
  const initials = p.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const score = Math.min(100, Math.round((p.ca_genere / (maxCA || 1)) * 100));

  return (
    <div onClick={onSelect}
      style={{ display: "grid", gridTemplateColumns: "28px 46px 1fr 90px 90px 110px 80px 44px", alignItems: "center", gap: 12,
        padding: "14px 20px", borderBottom: `1px solid ${BD}`, cursor: "pointer",
        background: selected ? BL : W, transition: "background .12s",
        animation: `in-up .22s ease ${delay}ms both`, borderLeft: selected ? `3px solid ${B}` : "3px solid transparent" }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = BG; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = W; }}>

      {/* Rang */}
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 11, fontWeight: 700, color: rank <= 3 ? O : T3, textAlign: "center" }}>
        {rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : rank}
      </div>

      {/* Avatar */}
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `hsl(${hue},55%,91%)`, color: `hsl(${hue},55%,34%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
        {initials}
      </div>

      {/* Name + location */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T3, marginTop: 2 }}>
          <MapPin size={9} /> {p.quartier || p.email.split('@')[1]}
        </div>
      </div>

      {/* CA + bar */}
      <div>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800, color: GR, letterSpacing: "-.02em" }}>
          {(p.ca_genere / 1000).toFixed(1)}<span style={{ fontSize: 10, fontWeight: 600, color: T3 }}>k F</span>
        </div>
        <CABar value={p.ca_genere} max={maxCA} color={GR} />
      </div>

      {/* Résa + heatdots */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: B, marginBottom: 4 }}>{p.nb_reservations ?? 0} résa</div>
        <HeatDots count={p.nb_reservations ?? 0} />
      </div>

      {/* Sparkline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Spark color={actif ? GR : AM} up={actif} />
        <div style={{ fontSize: 10, fontWeight: 600, color: actif ? GR : AM }}>{actif ? "+12% ce mois" : "En attente"}</div>
      </div>

      {/* Score badge */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: score > 60 ? B : T3 }}>{score}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: T3, textTransform: "uppercase", letterSpacing: ".05em" }}>Score</div>
      </div>

      {/* Actions */}
      <button onClick={e => e.stopPropagation()}
        style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${BD}`, background: W, color: T3,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .12s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = BL; (e.currentTarget as HTMLButtonElement).style.color = B; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = W; (e.currentTarget as HTMLButtonElement).style.color = T3; }}>
        <MoreHorizontal size={13} />
      </button>
    </div>
  );
}

/* ─── Detail panel (right drawer) ─── */
function DetailPanel({ p, onClose }: { p: Partner; onClose: () => void }) {
  const actif = p.statut === 'actif';
  const hue   = (p.id * 53) % 360;
  const initials = p.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div style={{ background: W, border: `1px solid ${BD}`, borderRadius: 16, overflow: "hidden",
      animation: "in-r .22s cubic-bezier(.16,1,.3,1) both", position: "sticky", top: 80 }}>

      {/* Header gradient */}
      <div style={{ background: `linear-gradient(135deg,${B},${BM})`, padding: "24px 20px 20px", position: "relative" }}>
        <button onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: 8,
            background: "rgba(255,255,255,.15)", border: "none", cursor: "pointer", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={13} />
        </button>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `hsl(${hue},55%,91%)`,
          color: `hsl(${hue},55%,34%)`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18, marginBottom: 12 }}>
          {initials}
        </div>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>{p.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,.65)", marginTop: 4 }}>
          <MapPin size={10} /> {p.quartier || "Dakar"}
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12, padding: "4px 10px",
          background: actif ? "rgba(16,185,129,.2)" : "rgba(245,158,11,.2)",
          border: `1px solid ${actif ? "rgba(16,185,129,.4)" : "rgba(245,158,11,.4)"}`,
          borderRadius: 6, fontSize: 11, fontWeight: 700, color: actif ? "#6EE7B7" : "#FCD34D" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: actif ? GR : AM, display: "inline-block" }} />
          {actif ? "Partenaire actif" : "En attente de validation"}
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: BD }}>
        {[
          { label: "CA généré",    value: `${p.ca_genere.toLocaleString()} F`, color: GR },
          { label: "Parkings",     value: p.nb_parkings,                        color: B  },
          { label: "Réservations", value: p.nb_reservations ?? 0,              color: O  },
          { label: "Score",        value: `${Math.round((p.ca_genere / 100000) * 100)}`,  color: BM },
        ].map((m, i) => (
          <div key={i} style={{ background: W, padding: "16px", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: "uppercase", letterSpacing: ".06em" }}>{m.label}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${BD}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Contact</div>
        {[
          { icon: <Mail size={12} color={T3} />, val: p.email },
          { icon: <Phone size={12} color={T3} />, val: p.telephone },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: T2, marginBottom: i === 0 ? 8 : 0 }}>
            {c.icon} {c.val}
          </div>
        ))}
      </div>

      {/* Trend mini */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T3, textTransform: "uppercase", letterSpacing: ".06em" }}>Tendance CA</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: GR, display: "flex", alignItems: "center", gap: 3 }}>
            <ArrowUpRight size={11} /> +12%
          </div>
        </div>
        <Spark color={actif ? GR : AM} up={actif} />
      </div>

      {/* Actions */}
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        <button style={{ width: "100%", padding: "11px", background: B, color: "#fff", border: "none", borderRadius: 9,
          fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <LayoutGrid size={14} /> Voir les parkings
        </button>
        <button style={{ width: "100%", padding: "11px", background: BG, color: T2, border: `1.5px solid ${BD}`, borderRadius: 9,
          fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
          <Mail size={14} /> Contacter
        </button>
      </div>
    </div>
  );
}

/* ─── Skeleton row ─── */
function SkRow() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "28px 46px 1fr 90px 90px 110px 80px 44px", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: `1px solid ${BD}` }}>
      <div className="sk" style={{ height: 10, width: 20 }} />
      <div className="sk" style={{ width: 36, height: 36, borderRadius: 10 }} />
      <div><div className="sk" style={{ height: 13, width: "60%", marginBottom: 6 }} /><div className="sk" style={{ height: 9, width: "40%" }} /></div>
      <div><div className="sk" style={{ height: 13, width: 60, marginBottom: 6 }} /><div className="sk" style={{ height: 4, width: "100%", borderRadius: 99 }} /></div>
      <div><div className="sk" style={{ height: 11, width: 50, marginBottom: 6 }} /><div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 2 }}>{Array.from({length:20}).map((_,i)=><div key={i} className="sk" style={{height:8,borderRadius:2}}/>)}</div></div>
      <div className="sk" style={{ height: 20, width: 64 }} />
      <div style={{ textAlign: "center" }}><div className="sk" style={{ height: 17, width: 30, margin: "0 auto 4px" }} /><div className="sk" style={{ height: 9, width: 28, margin: "0 auto" }} /></div>
      <div className="sk" style={{ width: 30, height: 30, borderRadius: 8 }} />
    </div>
  );
}

export function AdminPartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState<Partner | null>(null);
  const [sortCA,   setSortCA]   = useState<'desc'|'asc'>('desc');

  const API = (import.meta as any).env.VITE_API_URL;

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/partenaires`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      if (res.ok) setPartners(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPartners(); }, []);

  const filtered = useMemo(() => {
    const r = partners.filter(p => !search || [p.name, p.email, p.telephone].some(v => v?.toLowerCase().includes(search.toLowerCase())));
    return [...r].sort((a, b) => sortCA === 'desc' ? b.ca_genere - a.ca_genere : a.ca_genere - b.ca_genere);
  }, [partners, search, sortCA]);

const { page, setPage, totalPages, paginated, reset, total } = usePagination(filtered,7);
useEffect(() => { reset(); }, [search, sortCA]);
  const maxCA     = Math.max(...partners.map(p => p.ca_genere), 1);
  const totalCA   = partners.reduce((a, p) => a + p.ca_genere, 0);
  const nbActif   = partners.filter(p => p.statut === 'actif').length;
  const totalParks= partners.reduce((a, p) => a + p.nb_parkings, 0);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", background: BG, minHeight: "100vh", color: T }}>
      <style>{ANIM}</style>

      {/* ── Nav ── */}
      <nav style={{ background: W, borderBottom: `1px solid ${BD}`, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: B, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(27,63,160,.25)" }}>
              <Building2 size={18} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: T, lineHeight: 1.1 }}>SenovaPark</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: B, textTransform: "uppercase", letterSpacing: ".07em" }}>Admin · Partenaires</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchPartners} style={{ height: 36, padding: "0 14px", display: "flex", alignItems: "center", gap: 7, background: W, border: `1.5px solid ${BD}`, borderRadius: 8, fontSize: 13, fontWeight: 600, color: T2, cursor: "pointer", fontFamily: "inherit" }}>
              <RefreshCw size={13} className={loading ? "spin" : ""} /> Actualiser
            </button>
            <button style={{ height: 36, padding: "0 14px", display: "flex", alignItems: "center", gap: 7, background: B, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(27,63,160,.2)" }}>
              <Download size={13} /> Exporter
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1440, margin: "0 auto", padding: "2rem 2rem 5rem" }}>

        {/* ── Ticker band ── */}
        <div style={{ background: `linear-gradient(135deg,${B},${BM})`, borderRadius: 14, padding: "14px 24px", marginBottom: "1.75rem",
          display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap", animation: "in-up .28s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={16} color="#fbbf24" />
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800, color: "#fff" }}>Portfolio Partenaires</span>
          </div>
          {[
            { label: "Partenaires",  val: partners.length,                        color: "#93C5FD" },
            { label: "CA cumulé",    val: `${(totalCA/1000).toFixed(0)} 000 F`,   color: "#6EE7B7" },
            { label: "Parkings",     val: totalParks,                             color: "#FCD34D" },
            { label: "Taux activité",val: `${partners.length ? Math.round((nbActif/partners.length)*100) : 0}%`, color: "#FCA5A5" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: s.color }}>{s.val}</span>
              {i < 3 && <span style={{ color: "rgba(255,255,255,.2)", fontSize: 14 }}>·</span>}
            </div>
          ))}
        </div>

        {/* ── Layout: table + detail panel ── */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 320px" : "1fr", gap: "1.5rem", alignItems: "start", transition: "grid-template-columns .2s" }}>

          {/* LEFT — portfolio table */}
          <div style={{ background: W, border: `1px solid ${BD}`, borderRadius: 16, overflow: "hidden" }}>

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${BD}`, gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: BG, border: `1.5px solid ${BD}`, borderRadius: 8, padding: "0 12px", height: 36, minWidth: 240 }}>
                <Search size={13} color={T3} style={{ flexShrink: 0 }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
                  style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: T, flex: 1, fontFamily: "inherit" }} />
                {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T3, display: "flex", padding: 0 }}><X size={12} /></button>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: T3 }}><strong style={{ color: T2 }}>{filtered.length}</strong> partenaires</span>
                <button onClick={() => setSortCA(s => s === 'desc' ? 'asc' : 'desc')}
                  style={{ display: "flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", background: BL, border: `1px solid rgba(27,63,160,.15)`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: B, cursor: "pointer", fontFamily: "inherit" }}>
                  <TrendingUp size={12} /> CA {sortCA === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>

            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "28px 46px 1fr 90px 90px 110px 80px 44px", gap: 12,
              padding: "10px 20px", background: BG, borderBottom: `1px solid ${BD}` }}>
              {["#","","Partenaire","CA généré","Activité","Tendance","Score",""].map((h, i) => (
                <div key={i} style={{ fontSize: 10, fontWeight: 700, color: T3, textTransform: "uppercase", letterSpacing: ".07em",
                  textAlign: i >= 3 ? "left" : "left" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkRow key={i} />)
              : filtered.length === 0
              ? (
                <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: BL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <Building2 size={24} color={B} strokeWidth={1.5} />
                  </div>
                  <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: T, margin: "0 0 5px" }}>Aucun partenaire</p>
                  <p style={{ fontSize: 13, color: T3 }}>{search ? `Aucun résultat pour "${search}".` : "Aucun partenaire enregistré."}</p>
                </div>
              )
              : paginated.map((p : any, i: number) => (
                <PartnerRow key={p.id} p={p} rank={i+1} maxCA={maxCA}
                  selected={selected?.id === p.id}
                  onSelect={() => setSelected(sel => sel?.id === p.id ? null : p)}
                  delay={Math.min(i * 30, 200)} />
                 
              ))}
              <Pagination page={page} totalPages={totalPages} total={total} pageSize={12} onPage={setPage} />
                                    

            {/* Footer */}
            {!loading && filtered.length > 0 && (
              <div style={{ padding: "12px 20px", background: BG, borderTop: `1px solid ${BD}`,
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: T3 }}>
                  Cliquez sur une ligne pour voir le détail
                </span>
                <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800, color: GR }}>
                  Total : {totalCA.toLocaleString()} F
                </span>
              </div>
            )}
          </div>

          {/* RIGHT — detail panel */}
          {selected && <DetailPanel p={selected} onClose={() => setSelected(null)} />}
        </div>
      </main>
    </div>
  );
}

export default AdminPartners;
