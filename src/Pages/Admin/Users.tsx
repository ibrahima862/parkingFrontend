import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Search, Mail, Phone, ShieldAlert, Loader2,
  UserX, UserCheck, Activity, Download, RefreshCw,
  X, ChevronUp, ChevronDown, MoreVertical,
} from 'lucide-react';

/* ── Tokens ── */
const B  = "#1B3FA0";
const BM = "#2B52C8";
const BL = "#EEF2FF";
const BG = "#F8FAFC";
const O  = "#F97316";
const OL = "#FFF7ED";
const T  = "#0F172A";
const T2 = "#475569";
const T3 = "#94A3B8";
const BD = "#E2E8F0";
const W  = "#ffffff";
const GR = "#10B981";
const GL = "#ECFDF5";
const GB = "#A7F3D0";
const R  = "#EF4444";
const RL = "#FEF2F2";
const RB = "#FECACA";

const ANIM = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
@keyframes au-up  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
@keyframes au-row { from{opacity:0;transform:translateX(-4px)} to{opacity:1;transform:none} }
@keyframes au-sp  { to{transform:rotate(360deg)} }
@keyframes au-sh  { 0%{background-position:200% 0}100%{background-position:-200% 0} }
.au-spin{animation:au-sp .7s linear infinite}
.au-sk{background:linear-gradient(90deg,${BG} 25%,${BD} 50%,${BG} 75%);background-size:400% 100%;animation:au-sh 1.4s linear infinite;border-radius:5px}
`;

interface UserClient {
  id: number; name: string; email: string; telephone: string;
  nb_reservations: number; date_inscription: string;
  statut: 'actif' | 'suspendu';
}

/* ── KPI Card ── */
function KpiCard({ label, value, sub, icon: Icon, color, bg, delay = 0 }: {
  label: string; value: string | number; sub?: string;
  icon: React.FC<any>; color: string; bg: string; delay?: number;
}) {
  return (
    <div style={{ background: W, border: `1px solid ${BD}`, borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: `au-up .28s ease ${delay}ms both` }}>
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

/* ── Avatar initials ── */
function Avatar({ name, actif }: { name: string; actif: boolean }) {
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: actif ? BL : RL, color: actif ? B : R, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
      {name.substring(0, 2).toUpperCase()}
    </div>
  );
}

/* ── Skeleton row ── */
function SkRow() {
  return (
    <tr style={{ borderBottom: `1px solid ${BD}` }}>
      <td style={{ padding: "15px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="au-sk" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
          <div><div className="au-sk" style={{ height: 12, width: 120, marginBottom: 5 }} /><div className="au-sk" style={{ height: 10, width: 80 }} /></div>
        </div>
      </td>
      {[140, 60, 90, 70, 64].map((w, i) => (
        <td key={i} style={{ padding: "15px 20px" }}><div className="au-sk" style={{ height: 12, width: w }} /></td>
      ))}
    </tr>
  );
}

export function AdminUsers() {
  const [users,    setUsers]    = useState<UserClient[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState<'all' | 'actif' | 'suspendu'>('all');
  const [sort,     setSort]     = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'date_inscription', dir: 'desc' });
  const [actionId, setActionId] = useState<number | null>(null);

  const API = (import.meta as any).env.VITE_API_URL;
  const tok = () => localStorage.getItem('token');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/utilisateurs`, { headers: { Authorization: `Bearer ${tok()}` } });
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (id: number) => {
    setActionId(id);
    try {
      const res = await fetch(`${API}/api/admin/utilisateurs/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${tok()}`, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(prev => prev.map(u => u.id === id ? { ...u, statut: data.statut } : u));
      }
    } catch (e) { console.error(e); }
    finally { setActionId(null); }
  };

  const nbActif    = users.filter(u => u.statut === 'actif').length;
  const nbSuspend  = users.filter(u => u.statut === 'suspendu').length;
  const avgResa    = users.length ? Math.round(users.reduce((a, u) => a + u.nb_reservations, 0) / users.length) : 0;

  const toggleSort = (col: string) =>
    setSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));

  const filtered = useMemo(() => {
    let r = users.filter(u => {
      if (filter !== 'all' && u.statut !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.telephone.includes(q);
      }
      return true;
    });
    return [...r].sort((a: any, b: any) => {
      const av = a[sort.col], bv = b[sort.col];
      return sort.dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }, [users, search, filter, sort]);

  const SortIco = ({ col }: { col: string }) => (
    <span style={{ marginLeft: 3, opacity: sort.col === col ? 1 : 0.3 }}>
      {sort.col === col && sort.dir === 'desc' ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
    </span>
  );

  const TABS = [
    { key: 'all',      label: 'Tous',       count: users.length },
    { key: 'actif',    label: 'Actifs',     count: nbActif },
    { key: 'suspendu', label: 'Suspendus',  count: nbSuspend },
  ] as const;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", background: BG, minHeight: "100vh", color: T }}>
      <style>{ANIM}</style>

      {/* ── Nav ── */}
      <nav style={{ background: W, borderBottom: `1px solid ${BD}`, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 2rem", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: B, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(27,63,160,.25)" }}>
              <Users size={18} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: T, lineHeight: 1.1 }}>SenovaPark</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: B, textTransform: "uppercase", letterSpacing: ".07em" }}>Admin · Utilisateurs</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchUsers} style={{ height: 36, padding: "0 14px", display: "flex", alignItems: "center", gap: 7, background: W, border: `1.5px solid ${BD}`, borderRadius: 8, fontSize: 13, fontWeight: 600, color: T2, cursor: "pointer", fontFamily: "inherit" }}>
              <RefreshCw size={13} className={loading ? "au-spin" : ""} /> Actualiser
            </button>
            <button style={{ height: 36, padding: "0 14px", display: "flex", alignItems: "center", gap: 7, background: B, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(27,63,160,.2)" }}>
              <Download size={13} /> Exporter
            </button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2.5rem 2rem 5rem" }}>

        {/* ── Heading ── */}
        <div style={{ marginBottom: "2rem", animation: "au-up .28s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: T3, fontWeight: 500 }}>Admin</span>
            <span style={{ color: BD }}>›</span>
            <span style={{ fontSize: 12, color: T2, fontWeight: 500 }}>Gestion des utilisateurs</span>
          </div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: T, margin: 0, letterSpacing: "-.025em" }}>Clients & Conducteurs</h1>
          <p style={{ fontSize: 14, color: T3, marginTop: 5 }}>Gérez les {users.length} conducteurs inscrits sur la plateforme.</p>
        </div>

        {/* ── KPIs ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: "2rem" }}>
          <KpiCard label="Total conducteurs" value={users.length}     sub="Inscrits sur la plateforme" icon={Users}      color={B}  bg={BL} delay={0}   />
          <KpiCard label="Comptes actifs"    value={nbActif}          sub="En règle"                  icon={UserCheck}  color={GR} bg={GL} delay={60}  />
          <KpiCard label="Suspendus"         value={nbSuspend}        sub="Accès restreint"            icon={ShieldAlert} color={R}  bg={RL} delay={120} />
          <KpiCard label="Résa. moyenne"     value={`${avgResa}/u`}   sub="Par conducteur"             icon={Activity}   color={O}  bg={OL} delay={180} />
        </div>

        {/* ── Table card ── */}
        <div style={{ background: W, border: `1px solid ${BD}`, borderRadius: 14, overflow: "hidden", animation: "au-up .28s ease 200ms both" }}>

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${BD}`, gap: 12, flexWrap: "wrap" }}>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, background: BG, borderRadius: 9, padding: 3, border: `1px solid ${BD}` }}>
              {TABS.map(tab => {
                const on = filter === tab.key;
                return (
                  <button key={tab.key} onClick={() => setFilter(tab.key)}
                    style={{ display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 7, border: "none", background: on ? W : "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: on ? 600 : 500, color: on ? T : T3, boxShadow: on ? "0 1px 4px rgba(0,0,0,.09)" : "none", transition: "all .12s" }}>
                    {tab.label}
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "0 6px", height: 18, minWidth: 18, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 5, background: on ? BL : BD, color: on ? B : T3 }}>{tab.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: BG, border: `1.5px solid ${BD}`, borderRadius: 8, padding: "0 13px", height: 36, minWidth: 260 }}>
              <Search size={13} color={T3} style={{ flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, email ou téléphone…"
                style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: T, flex: 1, fontFamily: "inherit" }} />
              {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T3, display: "flex", padding: 0 }}><X size={13} /></button>}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: BG, borderBottom: `1px solid ${BD}` }}>
                  {[
                    { key: "name",             label: "Conducteur" },
                    { key: "email",            label: "Contact" },
                    { key: "nb_reservations",  label: "Réservations" },
                    { key: "date_inscription", label: "Inscription" },
                    { key: "statut",           label: "Statut" },
                    { key: "",                 label: "",           right: true },
                  ].map((c, i) => (
                    <th key={i} onClick={() => c.key && toggleSort(c.key)}
                      style={{ padding: "12px 20px", fontSize: 10, fontWeight: 700, color: T3, textTransform: "uppercase", letterSpacing: ".07em", textAlign: c.right ? "right" : "left", cursor: c.key ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap" }}>
                      {c.label}{c.key && <SortIco col={c.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkRow key={i} />)
                  : filtered.length === 0
                  ? (
                    <tr><td colSpan={6}>
                      <div style={{ padding: "5rem 2rem", textAlign: "center" }}>
                        <div style={{ width: 56, height: 56, borderRadius: "50%", background: BL, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                          <Users size={24} color={B} strokeWidth={1.5} />
                        </div>
                        <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: T, margin: "0 0 5px" }}>Aucun utilisateur trouvé</p>
                        <p style={{ fontSize: 13, color: T3 }}>{search ? `Aucun résultat pour "${search}".` : "Aucun conducteur dans cette catégorie."}</p>
                      </div>
                    </td></tr>
                  )
                  : filtered.map((u, i) => {
                    const actif = u.statut === 'actif';
                    return (
                      <tr key={u.id}
                        style={{ borderBottom: `1px solid ${BD}`, transition: "background .1s", animation: `au-row .2s ease ${Math.min(i * 30, 180)}ms both` }}
                        onMouseEnter={e => (e.currentTarget.style.background = BG)}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

                        {/* Conducteur */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Avatar name={u.name} actif={actif} />
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: T }}>{u.name}</div>
                              <div style={{ fontSize: 11, color: T3, marginTop: 2 }}>ID #{u.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T2 }}><Mail size={11} color={T3} /> {u.email}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T3, marginTop: 4 }}><Phone size={11} color={T3} /> {u.telephone}</div>
                        </td>

                        {/* Réservations */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ height: 4, width: 60, background: BD, borderRadius: 99, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${Math.min((u.nb_reservations / 20) * 100, 100)}%`, background: actif ? B : R, borderRadius: 99, transition: "width .4s" }} />
                            </div>
                            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color: T }}>{u.nb_reservations}</span>
                          </div>
                        </td>

                        {/* Inscription */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: 13, color: T2 }}>{new Date(u.date_inscription).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </td>

                        {/* Statut */}
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: actif ? GL : RL, color: actif ? "#065F46" : "#991B1B", border: `1px solid ${actif ? GB : RB}` }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: actif ? GR : R, display: "inline-block" }} />
                            {actif ? "Actif" : "Suspendu"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: 7 }}>
                            <button onClick={() => handleToggle(u.id)} disabled={actionId === u.id}
                              title={actif ? "Suspendre le compte" : "Réactiver le compte"}
                              style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: actif ? RL : GL, color: actif ? R : GR, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .13s" }}
                              onMouseEnter={e => { const b = e.currentTarget; b.style.background = actif ? R : GR; b.style.color = "#fff"; }}
                              onMouseLeave={e => { const b = e.currentTarget; b.style.background = actif ? RL : GL; b.style.color = actif ? R : GR; }}>
                              {actionId === u.id
                                ? <Loader2 size={14} className="au-spin" />
                                : actif ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                            <button style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${BD}`, background: W, color: T3, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .13s" }}
                              onMouseEnter={e => { const b = e.currentTarget; b.style.background = BL; b.style.color = B; b.style.borderColor = "rgba(27,63,160,.2)"; }}
                              onMouseLeave={e => { const b = e.currentTarget; b.style.background = W; b.style.color = T3; b.style.borderColor = BD; }}>
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: "11px 20px", background: BG, borderTop: `1px solid ${BD}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: T3 }}><strong style={{ color: T2 }}>{filtered.length}</strong> conducteur{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}</span>
              {nbSuspend > 0 && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", background: RL, border: `1px solid ${RB}`, borderRadius: 6, fontSize: 11, fontWeight: 600, color: "#991B1B" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: R, display: "inline-block" }} />
                  {nbSuspend} suspendu{nbSuspend > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminUsers;