import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Loader2, FileText, CreditCard, TrendingUp,
  BarChart3, Download, RefreshCw, ArrowUpRight, Filter,
  ChevronUp, ChevronDown, X,
} from 'lucide-react';

/* ── Tokens ── */
const B   = "#1B3FA0";
const BM  = "#2B52C8";
const BL  = "#EEF2FF";
const O   = "#F97316";
const OL  = "#FFF7ED";
const T   = "#0F172A";
const T2  = "#475569";
const T3  = "#94A3B8";
const BD  = "#E2E8F0";
const BG  = "#F8FAFC";
const W   = "#ffffff";
const GR  = "#10B981";
const GL  = "#ECFDF5";
const GB  = "#A7F3D0";

type Tx = {
  id: number; reference: string; date: string;
  client: string; parking: string;
  montant_brut: number; commission: number; net_partenaire: number;
  statut?: string;
};

/* ── Animations keyframes injectées une seule fois ── */
const ANIM = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@keyframes at-up   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
@keyframes at-row  { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:none} }
@keyframes at-spin { to{transform:rotate(360deg)} }
@keyframes at-sh   { 0%{background-position:200% 0}100%{background-position:-200% 0} }
.at-spin{animation:at-spin .7s linear infinite}
.at-sk{background:linear-gradient(90deg,${BG} 25%,${BD} 50%,${BG} 75%);background-size:400% 100%;animation:at-sh 1.4s linear infinite;border-radius:5px}
`;

/* ── KPI Card ── */
function KpiCard({ label, value, sub, icon: Icon, color, bg, delay = 0 }: {
  label: string; value: string; sub?: string;
  icon: React.FC<any>; color: string; bg: string; delay?: number;
}) {
  return (
    <div style={{ background: W, border: `1px solid ${BD}`, borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: `at-up .28s ease ${delay}ms both` }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T3, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 7 }}>{label}</div>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color, letterSpacing: "-.03em", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: T3, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color={color} strokeWidth={2} />
      </div>
    </div>
  );
}

/* ── Skeleton row ── */
function SkRow() {
  return (
    <tr style={{ borderBottom: `1px solid ${BD}` }}>
      {[140, 160, 90, 100, 110, 40].map((w, i) => (
        <td key={i} style={{ padding: "16px 20px" }}>
          <div className="at-sk" style={{ height: 13, width: w, marginBottom: i < 2 ? 6 : 0 }} />
          {i < 2 && <div className="at-sk" style={{ height: 10, width: w * .65 }} />}
        </td>
      ))}
    </tr>
  );
}

export function AdminTransactions() {
  const [txs, setTxs]       = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [sort,    setSort]    = useState<{ col: string; dir: "asc" | "desc" }>({ col: "date", dir: "desc" });
  const [page,    setPage]    = useState(1);
  const PER = 10;

  const fetchTx = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/admin/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) setTxs(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTx(); }, []);

  const filtered = useMemo(() => {
    let r = txs.filter(t =>
      !search || [t.reference, t.client, t.parking].some(v => v.toLowerCase().includes(search.toLowerCase()))
    );
    r = [...r].sort((a: any, b: any) => {
      const av = a[sort.col], bv = b[sort.col];
      return sort.dir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return r;
  }, [txs, search, sort]);

  const pages    = Math.ceil(filtered.length / PER);
  const paginated = filtered.slice((page - 1) * PER, page * PER);

  const totalVolume  = txs.reduce((a, t) => a + t.montant_brut, 0);
  const totalComm    = txs.reduce((a, t) => a + t.commission, 0);
  const totalNet     = txs.reduce((a, t) => a + t.net_partenaire, 0);
  const avgTicket    = txs.length ? Math.round(totalVolume / txs.length) : 0;

  const toggleSort = (col: string) =>
    setSort(s => ({ col, dir: s.col === col && s.dir === "asc" ? "desc" : "asc" }));

  const SortIcon = ({ col }: { col: string }) => (
    <span style={{ marginLeft: 4, opacity: sort.col === col ? 1 : 0.3 }}>
      {sort.col === col && sort.dir === "desc" ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
    </span>
  );

  const COLS = [
    { key: "reference", label: "Référence" },
    { key: "client",    label: "Client / Parking" },
    { key: "montant_brut",    label: "Montant brut",    align: "right" as const },
    { key: "commission",      label: "Commission 10%",  align: "right" as const },
    { key: "net_partenaire",  label: "Net partenaire",  align: "right" as const },
    { key: "",                label: "",                align: "right" as const },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", background: BG, minHeight: "100vh", color: T }}>
      <style>{ANIM}</style>

      {/* ── Nav ── */}
      <nav style={{ background: W, borderBottom: `1px solid ${BD}`, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: B, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(27,63,160,.25)" }}>
              <CreditCard size={18} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: T, lineHeight: 1.1 }}>SenovaPark</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: B, textTransform: "uppercase", letterSpacing: ".07em" }}>Finance · Transactions</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchTx}
              style={{ height: 36, padding: "0 14px", display: "flex", alignItems: "center", gap: 7, background: W, border: `1.5px solid ${BD}`, borderRadius: 8, fontSize: 13, fontWeight: 600, color: T2, cursor: "pointer", fontFamily: "inherit" }}>
              <RefreshCw size={13} className={loading ? "at-spin" : ""} /> Actualiser
            </button>
            <button
              style={{ height: 36, padding: "0 14px", display: "flex", alignItems: "center", gap: 7, background: B, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(27,63,160,.2)" }}>
              <Download size={13} /> Exporter
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2.5rem 2rem 5rem" }}>

        {/* ── Page title ── */}
        <div style={{ marginBottom: "2rem", animation: "at-up .28s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: T3, fontWeight: 500 }}>Finance</span>
            <span style={{ color: BD }}>›</span>
            <span style={{ fontSize: 12, color: T2, fontWeight: 500 }}>Flux de paiements</span>
          </div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: T, margin: 0, letterSpacing: "-.025em" }}>Flux de Paiements</h1>
          <p style={{ fontSize: 14, color: T3, marginTop: 5 }}>Suivi en temps réel des encaissements et commissions.</p>
        </div>

        {/* ── KPIs ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: "2rem" }}>
          <KpiCard label="Volume total"     value={`${totalVolume.toLocaleString()} F`}  sub={`${txs.length} transactions`} icon={TrendingUp}  color={B}  bg={BL} delay={0}   />
          <KpiCard label="Commissions"      value={`${totalComm.toLocaleString()} F`}    sub="10% par transaction"           icon={BarChart3}   color={O}  bg={OL} delay={60}  />
          <KpiCard label="Net partenaires"  value={`${totalNet.toLocaleString()} F`}     sub="Montants reversés"             icon={ArrowUpRight} color={GR} bg={GL} delay={120} />
          <KpiCard label="Ticket moyen"     value={`${avgTicket.toLocaleString()} F`}    sub="Par transaction"               icon={CreditCard}  color={BM} bg={BL} delay={180} />
        </div>

        {/* ── Table card ── */}
        <div style={{ background: W, border: `1px solid ${BD}`, borderRadius: 14, overflow: "hidden", animation: "at-up .28s ease 200ms both" }}>

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${BD}`, gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: BG, border: `1.5px solid ${BD}`, borderRadius: 8, padding: "0 13px", height: 36, minWidth: 280 }}>
              <Search size={13} color={T3} style={{ flexShrink: 0 }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Référence, client, parking…"
                style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: T, flex: 1, fontFamily: "inherit" }} />
              {search && (
                <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T3, display: "flex", padding: 0 }}><X size={13} /></button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: T3 }}>
                <strong style={{ color: T2 }}>{filtered.length}</strong> résultat{filtered.length > 1 ? "s" : ""}
              </span>
              {search && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", background: OL, border: "1px solid #fdba74", color: "#c2410c", borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                  <Filter size={10} /> Filtre actif
                </span>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: BG, borderBottom: `1px solid ${BD}` }}>
                  {COLS.map((c, i) => (
                    <th key={i}
                      onClick={() => c.key && toggleSort(c.key)}
                      style={{ padding: "12px 20px", fontSize: 10, fontWeight: 700, color: T3, textTransform: "uppercase", letterSpacing: ".07em", textAlign: c.align || "left", cursor: c.key ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap" }}>
                      {c.label}{c.key && <SortIcon col={c.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkRow key={i} />)
                  : paginated.length === 0
                  ? (
                    <tr><td colSpan={6}>
                      <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                        <div style={{ width: 56, height: 56, borderRadius: "50%", background: BL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                          <BarChart3 size={24} color={B} strokeWidth={1.5} />
                        </div>
                        <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: T, margin: "0 0 5px" }}>Aucune transaction trouvée</p>
                        <p style={{ fontSize: 13, color: T3 }}>{search ? `Aucun résultat pour "${search}".` : "Aucune transaction enregistrée."}</p>
                      </div>
                    </td></tr>
                  )
                  : paginated.map((t, i) => (
                    <tr key={t.id}
                      style={{ borderBottom: `1px solid ${BD}`, transition: "background .1s", animation: `at-row .2s ease ${Math.min(i * 30, 180)}ms both` }}
                      onMouseEnter={e => (e.currentTarget.style.background = BG)}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

                      {/* Référence */}
                      <td style={{ padding: "15px 20px" }}>
                        <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: B, background: BL, padding: "3px 8px", borderRadius: 5, display: "inline-block", marginBottom: 4 }}>{t.reference}</div>
                        <div style={{ fontSize: 11, color: T3 }}>{t.date}</div>
                      </td>

                      {/* Client */}
                      <td style={{ padding: "15px 20px" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T }}>{t.client}</div>
                        <div style={{ fontSize: 12, color: B, fontWeight: 500, marginTop: 2 }}>{t.parking}</div>
                      </td>

                      {/* Montant brut */}
                      <td style={{ padding: "15px 20px", textAlign: "right" }}>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: T, letterSpacing: "-.02em" }}>
                          {t.montant_brut.toLocaleString()} <span style={{ fontSize: 10, color: T3, fontWeight: 600 }}>F</span>
                        </span>
                      </td>

                      {/* Commission */}
                      <td style={{ padding: "15px 20px", textAlign: "right" }}>
                        <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: O }}>
                          − {t.commission.toLocaleString()} <span style={{ fontSize: 10, fontWeight: 600 }}>F</span>
                        </span>
                      </td>

                      {/* Net partenaire */}
                      <td style={{ padding: "15px 20px", textAlign: "right" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", background: GL, border: `1px solid ${GB}`, borderRadius: 8, fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800, color: "#065F46" }}>
                          {t.net_partenaire.toLocaleString()} F
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "15px 20px", textAlign: "right" }}>
                        <button title="Voir reçu"
                          style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${BD}`, background: W, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: T3, transition: "all .13s" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = BL; (e.currentTarget as HTMLButtonElement).style.color = B; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(27,63,160,.2)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = W; (e.currentTarget as HTMLButtonElement).style.color = T3; (e.currentTarget as HTMLButtonElement).style.borderColor = BD; }}>
                          <FileText size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && pages > 1 && (
            <div style={{ padding: "12px 20px", background: BG, borderTop: `1px solid ${BD}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: T3 }}>
                Page <strong style={{ color: T2 }}>{page}</strong> sur <strong style={{ color: T2 }}>{pages}</strong>
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    style={{ width: 30, height: 30, borderRadius: 7, border: `1.5px solid ${page === i + 1 ? B : BD}`, background: page === i + 1 ? B : W, color: page === i + 1 ? "#fff" : T2, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .13s" }}>
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Pied de page récap ── */}
        {!loading && txs.length > 0 && (
          <div style={{ marginTop: "1.5rem", padding: "18px 22px", background: W, border: `1px solid ${BD}`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", animation: "at-up .28s ease 250ms both" }}>
            <div style={{ fontSize: 13, color: T2 }}>
              Total encaissé :{" "}
              <strong style={{ fontFamily: "'Sora',sans-serif", color: B }}>{totalVolume.toLocaleString()} F</strong>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ fontSize: 12, color: T3 }}>Commissions : <strong style={{ color: O }}>{totalComm.toLocaleString()} F</strong></div>
              <div style={{ fontSize: 12, color: T3 }}>Reversé partenaires : <strong style={{ color: GR }}>{totalNet.toLocaleString()} F</strong></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminTransactions;