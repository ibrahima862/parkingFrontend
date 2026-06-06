import { useState, useMemo, useEffect, useCallback, memo } from "react";
import {
  Users, LayoutDashboard, CreditCard, Building2, MapPin,
  CheckCircle2, RefreshCw, X, AlertTriangle, Search, ChevronLeft, ChevronRight,
  LogOut,
} from "lucide-react";
import { useSidebar } from "../../components/layout/Admin/AdminSidebar";
import { ProprioRow } from "../../components/rows";
import { ParkingRow } from "../../components/rows";
import { useAdminDashboard } from "../../hook/useAdminData";
import { useToast } from "../../context/toastContext";
import { AdminPayments } from "./AdminPayments";
import { StatsView, TabId, Tab } from "../../components/Admin/dashboard";
import { adminApi } from "../../lib/api";
import GeoModal from "../../components/Admin/dashboard/GeoModal";
import { useNavigate } from "react-router-dom";

/* ── Types ── */
interface Coords { latitude: string; longitude: string; }
interface GlobalStats { ca_total: number; retraits_somme: number; }

const inp = "w-full py-2.5 px-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300 text-gray-900";

/* ── SearchBar ── */
const SearchBar = memo(({ value, onChange, placeholder = 'Rechercher…' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) => (
  <div className="relative max-w-sm">
    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`${inp} pl-9 pr-8`} />
    {value && (
      <button onClick={() => onChange('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
        <X size={12} strokeWidth={2.5} />
      </button>
    )}
  </div>
));

/* ── Pagination ── */
function Pagination({ page, totalPages, total, pageSize, onPage }: {
  page: number; totalPages: number; total: number; pageSize: number; onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages: (number | '…')[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(1);
  if (page > 3) pages.push('…');
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
  if (page < totalPages - 2) pages.push('…');
  if (totalPages > 1) add(totalPages);

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
      <p className="text-[11px] text-slate-400">
        <span className="font-semibold text-slate-600">{from}–{to}</span> sur{' '}
        <span className="font-semibold text-slate-600">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={12} strokeWidth={2.5} />
        </button>
        {pages.map((p, i) => p === '…' ? (
          <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-[11px] text-slate-400">…</span>
        ) : (
          <button key={p} onClick={() => onPage(p as number)}
            className={`w-7 h-7 rounded-lg text-[11px] font-bold border transition-colors ${page === p ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
              }`}>{p}</button>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-blue-300 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronRight size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3 w-2/5 bg-slate-100 rounded-full" />
        <div className="h-2.5 w-3/5 bg-slate-100 rounded-full" />
      </div>
      <div className="w-16 h-5 bg-slate-100 rounded-full" />
      <div className="w-20 h-7 bg-slate-100 rounded-lg" />
    </div>
  );
}

/* ── Tab button ── */
const TabPill = memo(({ tab, active, pending, onClick }: {
  tab: Tab; active: boolean; pending?: number; onClick: () => void;
}) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border-none transition-all ${active ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'bg-transparent text-slate-400 hover:text-slate-600'
      }`}>
    <tab.Icon size={14} strokeWidth={active ? 2.2 : 1.8} className="text-orange-500" />
    {tab.label}
    {!!pending && (
      <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-mono">
        {pending}
      </span>
    )}
  </button>
));

/* ── DataPanel ── */
function DataPanel({ title, subtitle, count, columns, colWidths, loading, empty, emptyLabel, children, page, totalPages, total, pageSize, onPage }: {
  title: string; subtitle: string; count?: number;
  columns: string[]; colWidths: string;
  loading: boolean; empty: boolean; emptyLabel: string;
  children: React.ReactNode;
  page: number; totalPages: number; total: number; pageSize: number; onPage: (p: number) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full bg-blue-700" />
            <p className="text-[13px] font-bold text-slate-800">{title}</p>
            {count !== undefined && count > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-mono">{count}</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 ml-3.5">{subtitle}</p>
        </div>
      </div>

      {/* Table header */}
      {!empty && !loading && (
        <div className="grid px-5 py-2.5 bg-slate-50 border-b border-slate-100" style={{ gridTemplateColumns: colWidths }}>
          {columns.map(h => (
            <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</span>
          ))}
        </div>
      )}

      {/* Rows */}
      <div>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          : empty
            ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-slate-400" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-semibold text-slate-500">{emptyLabel}</p>
              </div>
            )
            : children
        }
      </div>

      <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPage={onPage} />
    </div>
  );
}

const PAGE_SIZE = 10;

/* ══════════════════════════════════════
   MAIN
══════════════════════════════════════ */
export function AdminDashboard() {
  const [pendingApproval, setPendingApproval] = useState<{ id: number; nom: string; quartier?: string } | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ ca_total: 0, retraits_somme: 0 });
  const [activeTab, setActiveTab] = useState<TabId>('proprios');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { proprios, parkings, refreshing, refreshAll } = useAdminDashboard();
  useSidebar();

  useEffect(() => { setPage(1); }, [activeTab, search]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/admin/stats-globales`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) setGlobalStats(await res.json());
      } catch { }
    })();
  }, [refreshing]);

  const q = search.trim().toLowerCase();
  const filteredProprios = useMemo(() =>
    !q ? proprios.data : proprios.data.filter(p => p.name?.toLowerCase().includes(q)), [proprios.data, q]);
  const filteredParkings = useMemo(() =>
    !q ? parkings.data : parkings.data.filter(p => p.nom?.toLowerCase().includes(q)), [parkings.data, q]);

  /* Pagination slices */
  const totalPropPages = Math.max(1, Math.ceil(filteredProprios.length / PAGE_SIZE));
  const totalParkPages = Math.max(1, Math.ceil(filteredParkings.length / PAGE_SIZE));
  const pagedProprios = useMemo(() => filteredProprios.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredProprios, page]);
  const pagedParkings = useMemo(() => filteredParkings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredParkings, page]);

  const approveUser = useCallback(async (id: number) => {
    try { await proprios.approve(id); toast('Propriétaire approuvé', 'success'); }
    catch (e: any) { toast(e?.message ?? 'Erreur', 'error'); }
  }, [proprios, toast]);

  const rejectUser = useCallback(async (id: number) => {
    try { await proprios.reject(id); toast('Dossier rejeté', 'info'); }
    catch (e: any) { toast(e?.message ?? 'Erreur', 'error'); }
  }, [proprios, toast]);
  const rejectParking = useCallback(async (id: number) => {
    try {
      await parkings.reject(id);
      toast('Parking refusé', 'info');
    } catch (e: any) {
      toast(e?.message ?? 'Erreur', 'error');
    }
  }, [parkings, toast]);
  const handleParkingApproval = useCallback(async (coords: Coords) => {
    if (!pendingApproval) return;
    try {
      await adminApi.approveParking(pendingApproval.id, coords);
      toast('Parking validé', 'success');
      setPendingApproval(null);
      refreshAll();
    } catch (e: any) { toast(e?.message ?? 'Erreur', 'error'); throw e; }
  }, [pendingApproval, toast, refreshAll]);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const TABS: Tab[] = useMemo(() => [
    { id: 'stats', label: "Vue d'ensemble", Icon: LayoutDashboard },
    { id: 'proprios', label: 'Propriétaires', Icon: Users, badge: proprios.data.length },
    { id: 'parkings', label: 'Parkings', Icon: Building2, badge: parkings.data.length },
    { id: 'paiements', label: 'Paiements', Icon: CreditCard },
  ], [proprios.data.length, parkings.data.length]);

  const tCfg = {
    proprios: { headers: ['Identité', 'Contact', 'Inscription', 'Actions'], col: '2.2fr 2fr 1fr 130px' },
    parkings: { headers: ['Espace', 'Détails', 'Services', 'Propriétaire', 'Actions'], col: '2.5fr 1.2fr 1fr 1.2fr 110px' },
  };

  const pendingTotal = proprios.data.length + parkings.data.length;

  return (
    <div className="min-h-screen bg-blue-50/40 font-sans flex flex-col">

      {/* Top nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-13 flex items-center justify-between py-2.5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-700 flex items-center justify-center">
              <LayoutDashboard size={13} className="text-white" strokeWidth={2.5}/>
            </div>
            <span className="text-[13px] font-bold text-slate-800">Admin</span>
            <span className="hidden sm:block text-[11px] text-slate-400">· Dashboard</span>
          </div>


          <div className="flex items-center gap-3">
            {pendingTotal > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-xl">
                <AlertTriangle size={12} className="text-orange-600" strokeWidth={2.5} />
                <span className="text-[11px] font-bold text-orange-700">
                  {pendingTotal} en attente
                </span>
              </div>
            )}
            <div className="relative hidden md:block ">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
                className="h-8 pl-8 pr-3 w-44 rounded-xl border border-slate-200 bg-white text-[12px] text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300" />
            </div>
            <button onClick={refreshAll} disabled={refreshing}
              className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-blue-300 transition-colors disabled:opacity-40">
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} strokeWidth={2.5} />
            </button>

          </div>
          <button onClick={handleLogout} className="right-4 top-1/2 -translate-y-1/2 text-[#ff2f2f] hover:text-slate-600 transition-colors flex justify-center items-center gap-3">
          <LogOut size={13} />
          <span>Deconnexion</span>
        </button>
        </div>
        
      </nav>

      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Banner */}
        {pendingTotal > 0 && (
          <div className="bg-slate-900 rounded-xl px-4 py-3.5 flex items-center gap-3 relative overflow-hidden">
            <div className="absolute right-0 inset-y-0 w-40 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at right, rgba(249,115,22,.12), transparent)' }} />
            <div className="w-9 h-9 bg-orange-500/15 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={15} className="text-orange-400" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white leading-tight">
                {pendingTotal} dossier{pendingTotal > 1 ? 's' : ''} en attente de validation
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {proprios.data.length} propriétaire{proprios.data.length > 1 ? 's' : ''} · {parkings.data.length} parking{parkings.data.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl w-fit">
          {TABS.map(tab => (
            <TabPill key={tab.id} tab={tab} active={activeTab === tab.id}
              pending={tab.id !== 'stats' && tab.id !== 'paiements' ? tab.badge : undefined}
              onClick={() => setActiveTab(tab.id)} />
          ))}
        </div>

        {/* Search bar (mobile + below tabs) */}
        {(activeTab === 'proprios' || activeTab === 'parkings') && (
          <div className="md:hidden">
            <SearchBar value={search} onChange={setSearch}
              placeholder={activeTab === 'proprios' ? 'Rechercher un propriétaire…' : 'Rechercher un parking…'} />
          </div>
        )}

        {/* Tab panels */}
        <div key={activeTab}>
          {activeTab === 'stats' && (
            <StatsView propCount={proprios.data.length} parkCount={parkings.data.length} globalStats={globalStats} />
          )}

          {activeTab === 'proprios' && (
            <DataPanel
              title="Approbation des propriétaires"
              subtitle={q ? `${filteredProprios.length} résultat${filteredProprios.length > 1 ? 's' : ''} pour "${search}"` : `${filteredProprios.length} dossier${filteredProprios.length > 1 ? 's' : ''} en attente`}
              count={filteredProprios.length}
              columns={tCfg.proprios.headers} colWidths={tCfg.proprios.col}
              loading={proprios.loading} empty={!filteredProprios.length}
              emptyLabel={q ? `Aucun propriétaire correspondant à "${search}"` : 'Tous les dossiers sont traités ✓'}
              page={page} totalPages={totalPropPages} total={filteredProprios.length} pageSize={PAGE_SIZE} onPage={setPage}
            >
              {proprios.loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                : pagedProprios.map(p => (
                  <ProprioRow key={p.id} p={p}
                    onApprove={() => approveUser(p.id)}
                    onReject={() => rejectUser(p.id)}
                    colWidths={tCfg.proprios.col} />
                ))
              }
            </DataPanel>
          )}

          {activeTab === 'parkings' && (
            <DataPanel
              title="Validation des espaces"
              subtitle={q ? `${filteredParkings.length} résultat${filteredParkings.length > 1 ? 's' : ''} pour "${search}"` : `${filteredParkings.length} parking${filteredParkings.length > 1 ? 's' : ''} en attente`}
              count={filteredParkings.length}
              columns={tCfg.parkings.headers} colWidths={tCfg.parkings.col}
              loading={parkings.loading} empty={!filteredParkings.length}
              emptyLabel={q ? `Aucun parking correspondant à "${search}"` : 'Aucun nouveau parking à valider ✓'}
              page={page} totalPages={totalParkPages} total={filteredParkings.length} pageSize={PAGE_SIZE} onPage={setPage}
            >
              {parkings.loading
                ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                : pagedParkings.map(park => (
                  <ParkingRow
                    key={park.id}
                    park={park}
                    onApprove={async () => setPendingApproval(park)}
                    onReject={() => rejectParking(park.id)} // Ajout du lien ici
                    colWidths={tCfg.parkings.col}
                  />
                ))
              }
            </DataPanel>
          )}

          {activeTab === 'paiements' && <AdminPayments tab="transactions" />}
        </div>
      </main>

      <GeoModal parking={pendingApproval} onClose={() => setPendingApproval(null)} onConfirm={handleParkingApproval} />
    </div>
  );
}

export default AdminDashboard;