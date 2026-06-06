import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, DollarSign, Users, Star, MapPin, Search,
  RefreshCw, Activity, ArrowUpRight, ChevronRight, Trash2,
  TrendingUp, Zap, CheckCircle2,
} from 'lucide-react';

/* ── Tokens ── */
const B = "#1B3FA0";
const BL = "#EEF2FF";
const O = "#F97316";
const T3 = "#94A3B8";
const BG = "#F8FAFC";
const GR = "#10B981";
const ease = [0.22, 1, 0.36, 1] as const;

/* ── Types ── */
interface Cancellation { id: number | string; prenom_conducteur: string; nom_conducteur: string; updated_at: string; montant_total: number; }
interface ParkingItem { id: number; nom: string; quartier: string; prix_base: number; capacite: number; disponible: number; statut: 'valide' | 'en_attente' | 'rejete'; image: string; note: number; nbAvis: number; annulations?: Cancellation[]; }

/* ── Status config ── */
const S = {
  valide: { label: 'Publié', dot: 'bg-emerald-500', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  en_attente: { label: 'En attente', dot: 'bg-amber-400 animate-pulse', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  rejete: { label: 'Rejeté', dot: 'bg-red-400', cls: 'bg-red-50 text-red-700 border-red-200' },
};

const imgSrc = (img: string) => img?.startsWith('http') ? img : `${(import.meta as any).env.VITE_API_URL}/storage/${img}`;

/* ── Motion helpers ── */
const Up = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .42, delay, ease }} className={className}>
    {children}
  </motion.div>
);

/* ── Sparkline SVG ── */
function Spark({ values, color = '#1B3FA0' }: { values: number[]; color?: string }) {
  const W = 80, H = 28, max = Math.max(...values, 1);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * W},${H - (v / max) * H}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={.7} />
      <circle cx={(values.length - 1) / (values.length - 1) * W} cy={H - (values.at(-1)! / max) * H} r={2.5} fill={color} />
    </svg>
  );
}

/* ── KPI card ── */
function KpiCard({ label, value, sub, icon: Icon, color, bg, trend, spark, delay = 0 }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType;
  color: string; bg: string; trend?: { v: string; up: boolean }; spark?: number[]; delay?: number;
}) {
  return (
    <Up delay={delay}>
      <motion.div whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(27,63,160,.08)' }}
        className="bg-white border border-zinc-200 rounded-2xl p-5 relative overflow-hidden flex flex-col gap-3 transition-shadow">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
            <Icon size={15} strokeWidth={2} style={{ color }} />
          </div>
          {spark && <Spark values={spark} color={color} />}
        </div>
        <div>
          <p className="text-[26px] font-bold text-zinc-900 leading-none font-mono tracking-tight">{value}</p>
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mt-1.5">{label}</p>
        </div>
        {(sub || trend) && (
          <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100">
            {sub && <p className="text-[11px] text-zinc-400 font-medium">{sub}</p>}
            {trend && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trend.up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                <ArrowUpRight size={9} strokeWidth={3} />{trend.v}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </Up>
  );
}

/* ── Status ring ── */
function Ring({ value, total, label, color, bg, text }: { value: number; total: number; label: string; color: string; bg: string; text: string }) {
  const r = 16, circ = 2 * Math.PI * r, pct = total > 0 ? (value / total) : 0;
  return (
    <div className="flex items-center gap-3.5">
      <div className="relative w-10 h-10 shrink-0">
        <svg width={40} height={40} viewBox="0 0 40 40">
          <circle cx={20} cy={20} r={r} fill="none" stroke={bg} strokeWidth={5} />
          <motion.circle cx={20} cy={20} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={circ} strokeLinecap="round" transform="rotate(-90 20 20)"
            initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - pct) }}
            transition={{ duration: 1.2, ease: [.23, 1, .32, 1], delay: .3 }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color }}>{value}</span>
      </div>
      <div>
        <p className={`text-[14px] font-bold ${text}`}>{value}</p>
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

/* ── Occupancy bar ── */
function OccupBar({ nom, disponible, capacite }: { nom: string; disponible: number; capacite: number }) {
  const pct = capacite > 0 ? Math.round((disponible / capacite) * 100) : 0;
  const barColor = pct > 70 ? GR : pct > 40 ? O : '#EF4444';
  return (
    <div className="px-5 py-3.5 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[12px] font-semibold text-zinc-800 truncate max-w-[160px]">{nom}</p>
        <span className="text-[11px] font-bold font-mono" style={{ color: barColor }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .9, ease: [.23, 1, .32, 1] }}
          className="h-full rounded-full" style={{ background: barColor }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════ MAIN ══════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<ParkingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || '{}'), []);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/partenaire/parkings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' },
      });
      const j = await r.json();
      setData(Array.isArray(j) ? j : j.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({
    total: data.length,
    pub: data.filter(p => p.statut === 'valide').length,
    pend: data.filter(p => p.statut === 'en_attente').length,
    rej: data.filter(p => p.statut === 'rejete').length,
    cap: data.reduce((s, p) => s + p.capacite, 0),
    avgPrix: data.length ? Math.round(data.reduce((s, p) => s + p.prix_base, 0) / data.length) : 0,
    note:data.length ? (data.reduce((s, p) => s + p.note, 0) / data.length).toFixed(1) : '0.0',
  }), [data]);

  const annulations = useMemo(() => data.flatMap(p => p.annulations || []).slice(0, 2), [data]);

  const filtered = useMemo(() => data.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.quartier.toLowerCase().includes(search.toLowerCase())
  ), [data, search]);

  const exportToCSV = () => {
    // 1. Définir les entêtes
    const headers = ["Nom", "Quartier", "Prix Base", "Capacité", "Disponible", "Statut"];

    // 2. Transformer les données filtrées pour le CSV
    const rows = filtered.map(p => [
      `"${p.nom}"`,
      `"${p.quartier}"`,
      p.prix_base,
      p.capacite,
      p.disponible,
      p.statut
    ]);

    // 3. Créer le contenu CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    // 4. Créer le lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `export-parkings-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ── Skeleton ── */
  if (loading) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <RefreshCw size={24} style={{ color: B }} />
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans" style={{ background: BG }}>
      <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">

        {/* ── Welcome ── */}
        <Up>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: B }}>Tableau de bord</p>
              <h1 className="text-[22px] sm:text-[26px] font-bold text-zinc-900 tracking-tight leading-none">
                Bonjour, {user?.name?.split(' ')[0] || 'Partenaire'} 👋
              </h1>
              <p className="text-[13px] mt-1.5" style={{ color: T3 }}>
                {stats.pub} parking{stats.pub > 1 ? 's' : ''} publiés · {stats.pend} en attente
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[13px] font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              <ArrowUpRight size={16} className="rotate-45" />
              Exporter CSV
            </button>

          </div>
        </Up>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KpiCard label="Parkings" value={stats.total} sub="Total enregistrés" icon={Car} color={B} bg={BL} trend={{ v: '+1', up: true }} spark={[2, 3, 4, 3, 5, 4, stats.total]} delay={0} />
          <KpiCard label="Capacité" value={stats.cap} sub="Places totales" icon={Users} color={GR} bg="#ECFDF5" spark={[40, 55, 48, 60, stats.cap < 100 ? stats.cap : 80, stats.cap]} delay={.07} />
          <KpiCard label="Prix moyen" value={`${stats.avgPrix.toLocaleString()} F`} sub="Par heure" icon={DollarSign} color={O} bg="#FFF7ED" spark={[2200, 2400, 2300, 2600, stats.avgPrix]} delay={.14} />
          <KpiCard label="Note réseau" value={stats.note} sub="Moyenne des avis" icon={Star} color="#F59E0B" bg="#FFFBEB" trend={{ v: '▲ 0.2', up: true }} spark={[4.3, 4.4, 4.5, 4.6, 4.7, 4.8]} delay={.21} />
        </div>

        {/* ── Mid row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Status rings */}
          <Up delay={.28}>
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col gap-5 h-full">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: BL }}>
                  <Activity size={12} strokeWidth={2.5} style={{ color: B }} />
                </div>
                <p className="text-[13px] font-bold text-zinc-900">Répartition statuts</p>
              </div>
              <div className="flex flex-col gap-4">
                <Ring value={stats.pub} total={stats.total} label="Publiés" color={B} bg={BL} text="text-blue-700" />
                <Ring value={stats.pend} total={stats.total} label="En attente" color="#F59E0B" bg="#FFFBEB" text="text-amber-600" />
                <Ring value={stats.rej} total={stats.total} label="Rejetés" color="#EF4444" bg="#FEF2F2" text="text-red-600" />
              </div>
            </div>
          </Up>

          {/* Annulations */}
          <Up delay={.34}>
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden flex flex-col h-full">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                    <Trash2 size={11} className="text-red-500" strokeWidth={2.5} />
                  </div>
                  <p className="text-[13px] font-bold text-zinc-900">Annulations récentes</p>
                </div>
                <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">{annulations.length}</span>
              </div>
              <div className="flex-1 divide-y divide-zinc-100">
                {annulations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <CheckCircle2 size={22} className="text-zinc-200" strokeWidth={1.5} />
                    <p className="text-[12px] text-zinc-400">Aucune annulation</p>
                  </div>
                ) : annulations.map((c, i) => (
                  <div key={c.id || i} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                      <Users size={11} className="text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-zinc-800 truncate">{c.prenom_conducteur} {c.nom_conducteur}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">{c.updated_at}</p>
                    </div>
                    <p className="text-[12px] font-bold text-red-500 font-mono shrink-0">-{c.montant_total.toLocaleString()} F</p>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 text-[11px] font-semibold text-zinc-400 hover:text-blue-600 hover:bg-zinc-50 transition-all border-t border-zinc-100 flex items-center justify-center gap-1.5">
                Historique complet <ChevronRight size={11} />
              </button>
            </div>
          </Up>

          {/* Live occupancy */}
          <Up delay={.4}>
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden flex flex-col h-full">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#ECFDF5' }}>
                    <Zap size={11} className="text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <p className="text-[13px] font-bold text-zinc-900">Disponibilité live</p>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />LIVE
                </span>
              </div>
              <div className="flex-1 divide-y divide-zinc-100">
                {data.slice(0, 3).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Car size={22} className="text-zinc-200" strokeWidth={1.5} />
                    <p className="text-[12px] text-zinc-400">Aucun parking</p>
                  </div>
                ) : data.slice(0, 3).map(p => <OccupBar key={p.id} nom={p.nom} disponible={p.disponible} capacite={p.capacite} />)}
              </div>
            </div>
          </Up>
        </div>

        {/* ── Parking table ── */}
        <Up delay={.46}>
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">

            {/* Table header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-zinc-100">
              <div>
                <h2 className="text-[15px] font-bold text-zinc-900 leading-none">Mes espaces</h2>
                <p className="text-[11px] text-zinc-400 mt-1">Liste complète de vos parkings</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Nom ou quartier…"
                    className="h-8 pl-8 pr-3 text-[12px] rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all w-44" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"><TrendingUp size={10} /></button>}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50/60">
                    {['Parking', 'Tarif / h', 'Capacité', 'Statut', ''].map((h, i) => (
                      <th key={i} className={`px-5 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <AnimatePresence>
                    {filtered.length > 0 ? filtered.map((p, idx) => (
                      <motion.tr key={p.id}
                        initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        transition={{ duration: .22, delay: idx * .03 }}
                        className="hover:bg-zinc-50/70 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shrink-0">
                              {p.image
                                ? <img src={imgSrc(p.image)} alt={p.nom} className="w-full h-full object-cover" />
                                : <Car size={13} className="m-auto mt-3 text-zinc-400" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-zinc-900 truncate">{p.nom}</p>
                              <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={9} />{p.quartier}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[13px] font-bold font-mono text-zinc-800">{p.prix_base.toLocaleString('fr-FR')} F</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-[13px] font-bold font-mono text-zinc-800">{p.capacite}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${S[p.statut].cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${S[p.statut].dot}`} />
                            {S[p.statut].label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => navigate(`/partner/parking/${p.id}/details`)}
                            className="w-8 h-8 rounded-lg border border-zinc-200 opacity-0 group-hover:opacity-100 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all ml-auto">
                            <ChevronRight size={13} />
                          </button>
                        </td>
                      </motion.tr>
                    )) : (
                      <tr>
                        <td colSpan={5}>
                          <div className="flex flex-col items-center gap-3 py-14 text-center">
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center">
                              <Car size={20} className="text-zinc-300" strokeWidth={1.5} />
                            </div>
                            <p className="text-[13px] font-semibold text-zinc-400">
                              {search ? `Aucun résultat pour "${search}"` : 'Aucun parking enregistré.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                <strong className="text-zinc-600">{filtered.length}</strong> espace{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
                <CheckCircle2 size={11} strokeWidth={2.5} /> Données synchronisées
              </div>
            </div>
          </div>
        </Up>

      </main>
    </div>
  );
}