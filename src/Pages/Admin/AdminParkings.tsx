import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, MapPin, Car, Clock, TrendingUp, Download, X,
  CheckCircle2, AlertTriangle, RefreshCw, Eye, Flame, Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePagination } from '../../hook/usePagination';
import { Pagination } from '../../components/Admin/parkings/Pagination';
import {Page,Text,View, Document, StyleSheet} from '@react-pdf/renderer'; 
interface AdminParking {
  id: number; nom: string; proprietaire: string; localisation: string;
  capacite: number; occupe: number; statut: 'valide' | 'en_attente' | 'suspendu';
  ca_total: number;
}
type StatusFilter = 'all' | 'valide' | 'en_attente' | 'suspendu';
type OccupFilter  = 'all' | 'critical' | 'high' | 'normal';
interface LiveEvent { id: number; type: 'added' | 'pending' | 'full' | 'validated' | 'alert'; parking: string; time: string; msg: string; }

const fmt      = (n: number) => n.toLocaleString('fr-FR');
const occPct   = (p: AdminParking) => p.capacite > 0 ? Math.round((p.occupe / p.capacite) * 100) : 0;
const occColor = (p: number) => p >= 90 ? 'text-red-600' : p >= 70 ? 'text-orange-500' : 'text-blue-700';
const occBg    = (p: number) => p >= 90 ? 'bg-red-500' : p >= 70 ? 'bg-orange-500' : 'bg-blue-600';
const initials = (s: string) => s.substring(0, 2).toUpperCase();

const FEED: LiveEvent[] = [
  { id: 1, type: 'full',      parking: 'Almadies Sea Side', time: 'Il y a 2 min',  msg: 'Capacité à 100% — aucune place disponible' },
  { id: 2, type: 'pending',   parking: 'Parking Plateau 2', time: 'Il y a 5 min',  msg: 'En attente de validation admin' },
  { id: 3, type: 'validated', parking: 'Liberté 6 Center',  time: 'Il y a 12 min', msg: 'Parking validé et publié' },
  { id: 4, type: 'alert',     parking: 'Ouakam Nord',       time: 'Il y a 18 min', msg: 'Occupation à 87% — alerte capacité' },
  { id: 5, type: 'added',     parking: 'Mermoz Business',   time: 'Il y a 31 min', msg: 'Nouveau parking ajouté par M. Diallo' },
];

const FEED_CFG: Record<string, { icon: string; cls: string }> = {
  added:     { icon: 'bg-blue-50 text-blue-600',    cls: 'bg-blue-50'    },
  pending:   { icon: 'bg-orange-50 text-orange-500',cls: 'bg-orange-50'  },
  full:      { icon: 'bg-red-50 text-red-500',      cls: 'bg-red-50'     },
  validated: { icon: 'bg-emerald-50 text-emerald-600', cls: 'bg-emerald-50' },
  alert:     { icon: 'bg-orange-50 text-orange-500',cls: 'bg-orange-50'  },
};

const FEED_ICONS: Record<string, React.ElementType> = {
  added: Plus, pending: Clock, full: Flame, validated: CheckCircle2, alert: AlertTriangle,
};

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  valide:     { label: 'Vérifié',    cls: 'bg-blue-50 text-blue-700 border-blue-200'     },
  en_attente: { label: 'En attente', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  suspendu:   { label: 'Suspendu',   cls: 'bg-red-50 text-red-700 border-red-200'         },
};


function AnimBar({ pct }: { pct: number }) {
  return (
    <div className="min-w-[80px]">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-[10px] font-bold font-mono ${occColor(pct)}`}>{pct}%</span>
        {pct >= 90 && <span className="text-[9px] text-red-500 animate-pulse">🔥</span>}
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${occBg(pct)}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ParkingRow({ parking, index, onView }: { parking: AdminParking; index: number; onView: () => void }) {
  const pct = occPct(parking);
  return (
    <tr onClick={onView} className="border-b border-slate-100 cursor-pointer hover:bg-blue-50/30 transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-[13px] font-bold text-slate-800">{parking.nom}</p>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5"><MapPin size={9} />{parking.localisation}</div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">{initials(parking.proprietaire)}</div>
          <span className="text-[12px] text-slate-600">{parking.proprietaire}</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <AnimBar pct={pct} />
        <p className="text-[10px] text-slate-400 mt-1 font-mono">{parking.occupe} / {parking.capacite}</p>
      </td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] font-bold text-slate-800 font-mono tabular-nums">{fmt(parking.ca_total)} F</span>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_CFG[parking.statut].cls}`}>
          {STATUS_CFG[parking.statut].label}
        </span>
      </td>
      <td className="px-5 py-3.5 text-right">
        <button onClick={e => { e.stopPropagation(); onView(); }}
          className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center ml-auto text-slate-500 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition-colors">
          <Eye size={12} strokeWidth={2} />
        </button>
      </td>
    </tr>
  );
}
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  section: { margin: 10, padding: 10 },
  title: { fontSize: 24, marginBottom: 15, textAlign: 'center' },
  row: { flexDirection: 'row', borderBottom: '1px solid #ccc', padding: 5 },
  bold: { fontWeight: 'bold' }
});

export function AdminParkings() {
  const navigate = useNavigate();
  const [parkings,     setParkings]     = useState<AdminParking[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [occupFilter,  setOccupFilter]  = useState<OccupFilter>('all');
  const [feedOpen,     setFeedOpen]     = useState(true);

  const fetchParc = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/admin/parkings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) setParkings(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchParc(); }, [fetchParc]);

  const totalCap   = parkings.reduce((a, p) => a + p.capacite, 0);
  const totalOccup = parkings.reduce((a, p) => a + p.occupe, 0);
  const tauxGlobal = totalCap > 0 ? Math.round((totalOccup / totalCap) * 100) : 0;
  const caGlobal   = parkings.reduce((a, p) => a + Number(p.ca_total), 0);
  const enAttente  = parkings.filter(p => p.statut === 'en_attente').length;
  const critiques  = parkings.filter(p => occPct(p) >= 90).length;

  const filtered = useMemo(() => parkings.filter(p => {
    const pct = occPct(p);
    return (
      (!search || p.nom.toLowerCase().includes(search.toLowerCase()) || p.localisation.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === 'all' || p.statut === statusFilter) &&
      (occupFilter === 'all' || (occupFilter === 'critical' ? pct >= 90 : occupFilter === 'high' ? pct >= 70 && pct < 90 : pct < 70))
    );
  }), [parkings, search, statusFilter, occupFilter]);

  const { page, setPage, totalPages, paginated, reset, total } = usePagination(filtered, 7);
  useEffect(() => { reset(); }, [search, statusFilter, occupFilter]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <RefreshCw size={24} className="animate-spin text-blue-400" />
      <p className="text-[13px] text-slate-400">Chargement du parc automobile…</p>
    </div>
  );

  const METRICS = [
    { label: 'Occupation globale', value: `${tauxGlobal}%`,      Icon: Car,        iconCls: 'bg-blue-50 text-blue-700',    sub: `${totalOccup} / ${totalCap} places`, alert: critiques > 0 ? `${critiques} proche saturation` : undefined },
    { label: "Chiffre d'affaires", value: `${fmt(caGlobal)} F`,  Icon: TrendingUp, iconCls: 'bg-emerald-50 text-emerald-700', trend: '+11%' },
    { label: 'En attente',         value: `${enAttente}`,         Icon: Clock,      iconCls: 'bg-orange-50 text-orange-600', sub: enAttente > 0 ? 'Validation requise' : 'Aucun en attente' },
    { label: 'Total parkings',     value: `${parkings.length}`,   Icon: MapPin,     iconCls: 'bg-violet-50 text-violet-700', sub: `${parkings.filter(p => p.statut === 'valide').length} vérifiés` },
  ];

  const STATUS_FILTERS: { k: StatusFilter; l: string; active: string }[] = [
    { k: 'all',        l: 'Tous',        active: 'bg-slate-800 border-slate-800 text-white'    },
    { k: 'valide',     l: '✓ Vérifiés',  active: 'bg-blue-700 border-blue-700 text-white'      },
    { k: 'en_attente', l: '⏳ En attente',active: 'bg-orange-500 border-orange-500 text-white' },
    { k: 'suspendu',   l: '⊘ Suspendus', active: 'bg-red-600 border-red-600 text-white'        },
  ];

  const OCCUP_FILTERS: { k: OccupFilter; l: string; active: string }[] = [
    { k: 'critical', l: '🔥 Critique', active: 'bg-red-600 border-red-600 text-white'        },
    { k: 'high',     l: 'Élevée',     active: 'bg-orange-500 border-orange-500 text-white'   },
    { k: 'normal',   l: 'Normale',    active: 'bg-blue-700 border-blue-700 text-white'       },
  ];

  const exportCSV=()=>{
    const header=["parking","proprietaire","chiffres d'affaires","statut"];
    
    const rows=parkings.map(p=>[p.nom,p.proprietaire,p.ca_total,STATUS_CFG[p.statut].label]);
    
    const csvContent=[header,...rows].map(e=>e.join(",")).join("\n");
    const blob=new Blob([csvContent],{type:"text/csv;charset=utf-8;"});
    const link=document.createElement("a");
    const url=URL.createObjectURL(blob);
    link.setAttribute("href",url);
    link.setAttribute("download","parkings.csv");
    link.style.visibility="hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Live Network</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Parc <span className="text-blue-700">Automobile</span>
            </h1>
            <p className="text-[12px] text-slate-500 mt-1">
              {parkings.length} infrastructure{parkings.length > 1 ? 's' : ''} supervisées
              {critiques > 0 && <span className="text-red-500 font-semibold ml-2">· {critiques} critique{critiques > 1 ? 's' : ''}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button onClick={() => fetchParc(true)} disabled={refreshing}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-blue-300 transition-colors disabled:opacity-40">
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} strokeWidth={2.5} />
            </button>
            <button onClick={exportCSV} className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-[12px] font-bold transition-colors active:scale-95">
              <Download size={12} className="text-orange-300" strokeWidth={2.5} /> Export
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {METRICS.map(m => (
            <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.iconCls}`}>
                  <m.Icon size={14} strokeWidth={2} />
                </div>
                {m.trend && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingUp size={9} /> {m.trend}
                  </span>
                )}
              </div>
              <p className="text-[22px] font-bold text-slate-900 font-mono leading-none tabular-nums">{m.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{m.label}</p>
              {m.sub && <p className="text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100">{m.sub}</p>}
              {m.alert && (
                <p className="text-[10px] text-orange-600 font-bold mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={9} /> {m.alert}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex flex-col gap-4">

            {/* Search + filters */}
            <div className="flex flex-col gap-3">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un parking ou une zone…"
                  className="w-full h-9 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-[13px] text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" />
                {search && <button onClick={() => setSearch('')}><X size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" /></button>}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut</span>
                {STATUS_FILTERS.map(({ k, l, active }) => (
                  <button key={k} onClick={() => setStatusFilter(k)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors active:scale-95 whitespace-nowrap ${statusFilter === k ? active : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {l}
                  </button>
                ))}
                <div className="w-px h-4 bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupation</span>
                {OCCUP_FILTERS.map(({ k, l, active }) => (
                  <button key={k} onClick={() => setOccupFilter(occupFilter === k ? 'all' : k)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors active:scale-95 whitespace-nowrap ${occupFilter === k ? active : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
                {(statusFilter !== 'all' || occupFilter !== 'all' || search) ? ' · filtré' : ''}
              </p>
            </div>

            {/* Empty */}
            {filtered.length === 0 && (
              <div className="bg-white border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                  <Car size={22} className="text-blue-400" strokeWidth={1.5} />
                </div>
                <p className="text-[14px] font-bold text-slate-700">Aucun parking trouvé</p>
                <p className="text-[12px] text-slate-400">Modifiez vos filtres pour affiner la recherche.</p>
              </div>
            )}

            {/* Table */}
            {filtered.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {['Parking & Zone', 'Propriétaire', 'Occupation', "Chiffre d'affaires", 'Statut', ''].map(h => (
                          <th key={h} className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((p, i) => (
                        <ParkingRow key={p.id} parking={p} index={i} onView={() => navigate(`/admin/parkings/${p.id}`)} />
                      ))}
                      <Pagination page={page} totalPages={totalPages} total={total} pageSize={7} onPage={setPage} />
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}