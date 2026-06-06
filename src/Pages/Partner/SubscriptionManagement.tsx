import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ChevronRight, CreditCard, Calendar, RefreshCw, X,
  Users, CheckCircle2, Clock, XCircle, AlertTriangle, ArrowUpRight, Zap,
} from 'lucide-react';
import { Abonnement } from '../../type';
import DetailsPanel from '../../components/Partner/subscriptionManagement/DetailsPanel';
type FilterId = 'actif' | 'en_attente' | 'expire';

const FILTERS: { id: FilterId; label: string; icon: React.ElementType }[] = [
  { id: 'actif',      label: 'Actifs',     icon: CheckCircle2 },
  { id: 'en_attente', label: 'En attente', icon: Clock        },
  { id: 'expire',     label: 'Expirés',    icon: XCircle      },
];

const STATUS_CFG: Record<FilterId, { label: string; cls: string; dot: string; border: string }> = {
  actif:      { label: 'Actif',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500',             border: 'border-l-emerald-400' },
  en_attente: { label: 'En attente', cls: 'bg-orange-50  text-orange-700  border-orange-200',  dot: 'bg-orange-400 animate-pulse', border: 'border-l-orange-400'  },
  expire:     { label: 'Expiré',     cls: 'bg-red-50     text-red-700     border-red-200',      dot: 'bg-red-400',                  border: 'border-l-red-300'     },
};

const AVATARS = [
  'from-blue-600 to-blue-800', 'from-violet-500 to-purple-700',
  'from-emerald-500 to-teal-700', 'from-orange-500 to-orange-700',
];

const initials = (n?: string) => (n || 'XX').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const avatarGrad = (n?: string) => AVATARS[(n || '').charCodeAt(0) % AVATARS.length];
const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);

function SkeletonCard() {
  return (
    <div className="bg-white border border-l-4 border-slate-100 border-l-slate-200 rounded-xl p-4 flex items-center gap-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-36 bg-slate-100 rounded-full" />
        <div className="h-2.5 w-24 bg-slate-100 rounded-full" />
      </div>
      <div className="hidden sm:flex gap-8">
        <div className="space-y-1.5"><div className="h-2 w-10 bg-slate-100 rounded-full" /><div className="h-3 w-20 bg-slate-100 rounded-full" /></div>
        <div className="space-y-1.5"><div className="h-2 w-14 bg-slate-100 rounded-full" /><div className="h-3 w-20 bg-slate-100 rounded-full" /></div>
      </div>
      <div className="w-16 h-8 bg-slate-100 rounded-lg shrink-0" />
    </div>
  );
}

function SubscriptionCard({ item, index ,onOpen}: { item: Abonnement; index: number; onOpen: () => void }) {
  const expiry = useMemo(() =>
    new Date(item.date_fin).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }), [item.date_fin]);
  const days = useMemo(() => daysUntil(item.date_fin), [item.date_fin]);
  const soon = item.statut === 'actif' && days > 0 && days <= 7;
  const border = STATUS_CFG[item.statut as FilterId]?.border ?? 'border-l-slate-200';

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -1, boxShadow: '0 4px 20px -4px rgba(29,78,216,0.08)' }}
      className={`bg-white border border-l-4 ${border} border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 group cursor-default hover:border-slate-300 transition-all`}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGrad(item.user?.name)} flex items-center justify-center shrink-0 font-bold text-white text-[11px] tracking-wide`}>
        {initials(item.user?.name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-[13px] font-bold text-slate-900 truncate">{item.user?.name || 'Client inconnu'}</span>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_CFG[item.statut as FilterId]?.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[item.statut as FilterId]?.dot}`} />
            {STATUS_CFG[item.statut as FilterId]?.label}
          </span>
          {soon && (
            <motion.span animate={{ opacity: [1, .5, 1] }} transition={{ repeat: Infinity, duration: 1.8 }}
              className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
              ⚠ {days}j restants
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md uppercase">
            {item.matricule_vehicule}
          </span>
          {item.user?.telephone && <span className="text-[11px] text-slate-400">{item.user.telephone}</span>}
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-8 shrink-0">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Forfait</p>
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
            <CreditCard size={11} className="text-blue-700" /> {item.plan?.nom || 'Standard'}
          </div>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Expiration</p>
          <div className={`flex items-center gap-1.5 text-[12px] font-semibold ${soon ? 'text-orange-600' : 'text-slate-700'}`}>
            <Calendar size={11} className={soon ? 'text-orange-500' : 'text-slate-400'} /> {expiry}
          </div>
        </div>
      </div>

      <button onClick={onOpen} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold transition-all">
        Détails <ArrowUpRight size={11} />
      </button>
    </motion.div>
  );
}

export default function SubscriptionManagement() {
  const [filter,      setFilter]      = useState<FilterId>('actif');
  const [search,      setSearch]      = useState('');
  const [abonnements, setAbonnements] = useState<Abonnement[]>([]);
  const [loading,     setLoading]     = useState(true);
     const [selectedSub, setSelectedSub] = useState<Abonnement | null>(null);
  const fetchAbonnements = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/partenaire/subscriptions`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();
      if (res.ok) setAbonnements(data.data || data);
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAbonnements(); }, [fetchAbonnements]);

  const counts = useMemo(() => ({
    actif:      abonnements.filter(a => a.statut === 'actif').length,
    en_attente: abonnements.filter(a => a.statut === 'en_attente').length,
    expire:     abonnements.filter(a => a.statut === 'expire').length,
  }), [abonnements]);

  const expiringSoon = useMemo(
    () => abonnements.filter(a => a.statut === 'actif' && daysUntil(a.date_fin) > 0 && daysUntil(a.date_fin) <= 7).length,
    [abonnements],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return abonnements.filter(a => {
      if (a.statut !== filter) return false;
      if (!q) return true;
      return (
        a.user?.name?.toLowerCase().includes(q) ||
        a.matricule_vehicule?.toLowerCase().includes(q) ||
        a.plan?.nom?.toLowerCase().includes(q)
      );
    });
  }, [abonnements, filter, search]);
console.log(abonnements)
  return (
    <div className="min-h-screen bg-blue-50/40 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-widest mb-1">Partenaire</p>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestion des <span className="text-blue-700">Abonnés</span>
            </h1>
            <p className="text-[12px] text-slate-500 mt-1">
              {abonnements.length} abonné{abonnements.length !== 1 ? 's' : ''} · {counts.actif} actifs
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
              <input type="text" placeholder="Nom, plaque, forfait…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13px] outline-none placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all w-44 sm:w-52" />
              {search && <X onClick={() => setSearch('')} size={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600" />}
            </div>
            <button onClick={fetchAbonnements} disabled={loading}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-blue-300 transition-colors disabled:opacity-40">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Actifs',     value: counts.actif,      accent: 'text-blue-700',   bg: 'bg-white border-blue-100' },
            { label: 'En attente', value: counts.en_attente, accent: 'text-orange-600', bg: 'bg-white border-orange-100' },
            { label: 'Expirés',    value: counts.expire,     accent: 'text-slate-500',  bg: 'bg-white border-slate-200' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-xl px-4 py-3`}>
              <p className={`text-[20px] font-bold font-mono leading-none ${s.accent}`}>{s.value}</p>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Insight banner */}
        {(expiringSoon > 0 || counts.en_attente > 0) && (
          <div className="bg-slate-900 rounded-xl px-4 py-3.5 flex items-center gap-3 relative overflow-hidden">
            <div className="absolute right-0 inset-y-0 w-32 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at right, rgba(249,115,22,.12), transparent)' }} />
            <div className="w-9 h-9 bg-orange-500/15 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-orange-400" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white leading-tight">
                {expiringSoon > 0
                  ? `${expiringSoon} abonnement${expiringSoon > 1 ? 's expirent' : ' expire'} dans 7 jours`
                  : `${counts.en_attente} demande${counts.en_attente > 1 ? 's' : ''} en attente de validation`}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {expiringSoon > 0 ? "Relancez vos clients avant l'échéance." : 'Traitez les demandes pour activer les accès.'}
              </p>
            </div>
            {expiringSoon > 0 && (
              <motion.span animate={{ opacity: [1, .4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                className="shrink-0 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">
                URGENT
              </motion.span>
            )}
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_248px] gap-5 items-start">

          {/* Left */}
          <div className="flex flex-col gap-4">

            {/* Tabs */}
            <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl w-fit">
              {FILTERS.map(({ id, label, icon: Icon }) => {
                const active = filter === id;
                return (
                  <button key={id} onClick={() => setFilter(id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${
                      active ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}>
                    <Icon size={11} strokeWidth={active ? 2.5 : 2} />
                    {label}
                    {counts[id] > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center ${
                        active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>{counts[id]}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* List */}
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {loading
                  ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                  : filtered.length > 0
                    ? filtered.map((item, i) => <SubscriptionCard onOpen={()=>setSelectedSub(item)} key={item.id} item={item} index={i} />)
                    : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-3 py-16 bg-white border border-dashed border-slate-200 rounded-xl">
                        <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center">
                          <Users size={20} className="text-slate-400" strokeWidth={1.5} />
                        </div>
                        <p className="text-[13px] font-semibold text-slate-500">
                          {search ? 'Aucun résultat' : 'Aucun abonné dans cette catégorie'}
                        </p>
                        <p className="text-[12px] text-slate-400">
                          {search ? 'Essayez un autre terme.' : 'Les abonnements apparaîtront ici.'}
                        </p>
                      </motion.div>
                    )
                }
              </AnimatePresence>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-4">

            {/* Overview */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Vue d'ensemble</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Actifs',     value: counts.actif,      bar: 'bg-blue-700' },
                  { label: 'En attente', value: counts.en_attente, bar: 'bg-orange-500' },
                  { label: 'Expirés',    value: counts.expire,     bar: 'bg-slate-300' },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-16 shrink-0">{row.label}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div className={`h-full ${row.bar} rounded-full`} initial={{ width: 0 }}
                        animate={{ width: `${abonnements.length ? (row.value / abonnements.length) * 100 : 0}%` }}
                        transition={{ duration: 0.8 }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 w-3 text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tip */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={12} className="text-orange-600" strokeWidth={2.5} />
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">Conseil</span>
              </div>
              <p className="text-[12px] text-orange-800 leading-relaxed mb-3">
                {expiringSoon > 0
                  ? <>Relancez les <strong>{expiringSoon} abonnement{expiringSoon > 1 ? 's' : ''}</strong> qui arrivent à échéance avant expiration.</>
                  : <>Proposez un <strong>forfait mensuel</strong> à vos clients réguliers pour stabiliser vos revenus.</>
                }
              </p>
              <button className="text-[11px] font-bold text-orange-700 flex items-center gap-1 hover:gap-2 transition-all">
                {expiringSoon > 0 ? 'Voir les abonnements' : 'Gérer les forfaits'}
                <ChevronRight size={10} strokeWidth={3} />
              </button>
            </div>

          </div>
        </div>
      </div>
       <AnimatePresence>
        {selectedSub && (
          <DetailsPanel item={selectedSub} onClose={() => setSelectedSub(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}