import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin, Star, Car, Clock, Shield, Search,
  SlidersHorizontal, X, Camera, Leaf, ArrowRight,
  Grid2X2, List, Check, AlertCircle, RefreshCw,
  Map, ChevronRight, Zap,
} from 'lucide-react';
import { MapComponent } from '../components/Map';

/* ── Types ── */
interface Parking {
  id: number; nom: string; quartier: string; prix_base: number;
  capacite: number; disponible: number; image: string;
  note: number; nbAvis: number; isVerifie: boolean;
  tags: string[]; distance: string;
}
type SortKey = 'distance' | 'prix' | 'note' | 'dispo';
type ViewMode = 'grid' | 'list';
type FilState = { video: boolean; gardien: boolean; couvert: boolean; ev: boolean };

/* ── Constants ── */
const TAG_ICONS: Record<string, React.FC<any>> = {
  'Vidéosurveillance': p => <Camera {...p} />,
  'Gardien 24h': p => <Shield {...p} />,
  'Couvert': p => <Car    {...p} />,
  'Recharge EV': p => <Leaf   {...p} />,
  'Ouvert 24h/24': p => <Clock  {...p} />,
};
const TAG_FILTERS = [
  { key: 'video', label: 'Vidéosurveillance', Icon: Camera },
  { key: 'gardien', label: 'Gardien 24h', Icon: Shield },
  { key: 'couvert', label: 'Parking couvert', Icon: Car },
  { key: 'ev', label: 'Recharge EV', Icon: Leaf },
];
const SORT_OPTIONS = [
  { value: 'distance', label: 'Proximité' },
  { value: 'prix', label: 'Moins cher' },
  { value: 'note', label: 'Mieux notés' },
  { value: 'dispo', label: 'Disponibilité' },
];
const NAV_H = 64;

/* ── CSS ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;600;700&display=swap');
  .pg * { font-family:'Figtree',sans-serif; box-sizing:border-box; }
  .pg .mono { font-family:'JetBrains Mono',monospace !important; }
  @keyframes pg-up   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pg-in   { from{opacity:0} to{opacity:1} }
  @keyframes pg-map  { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes pg-slide{ from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes pg-pulse{ 0%,100%{opacity:1} 50%{opacity:.45} }
  .pg-up   { animation: pg-up    .28s ease both; }
  .pg-map  { animation: pg-map   .38s cubic-bezier(.16,1,.3,1) both; }
  .pg-slide{ animation: pg-slide .36s cubic-bezier(.16,1,.3,1) both; }
  .pg-card {
    background:#fff; border:1px solid #E8EAF0; border-radius:16px;
    transition:border-color .18s,box-shadow .18s,transform .18s; overflow:hidden;
  }
  .pg-card:hover { border-color:#C2D4F8; box-shadow:0 8px 28px rgba(13,27,62,.09); transform:translateY(-2px); }
  .pg-card.active{ border-color:#1A56DB; box-shadow:0 0 0 3px #EEF3FD,0 8px 24px rgba(26,86,219,.12); }
  .pg-chip {
    border:1px solid #E8EAF0; background:#fff; color:#444860;
    border-radius:99px; font-weight:600; font-size:12px;
    cursor:pointer; transition:all .14s; white-space:nowrap; padding:6px 14px;
  }
  .pg-chip:hover  { border-color:#1A56DB; color:#1A56DB; }
  .pg-chip.active { border-color:#1A56DB; background:#EEF3FD; color:#1A56DB; font-weight:700; }
  .pg-scroll::-webkit-scrollbar { width:4px; height:4px; }
  .pg-scroll::-webkit-scrollbar-track { background:transparent; }
  .pg-scroll::-webkit-scrollbar-thumb { background:#E8EAF0; border-radius:4px; }
  .shim {
    background:linear-gradient(90deg,#E8EAF0 25%,#ECEEF4 50%,#E8EAF0 75%);
    background-size:400% 100%; animation:shimmer 1.4s linear infinite; border-radius:8px;
  }
`;

/* ── Hooks ── */
function useIsMobile(bp = 1024) {
  const [v, set] = useState(() => window.innerWidth < bp);
  useEffect(() => {
    const fn = () => set(window.innerWidth < bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return v;
}

function useParkings(searchQuery: string) {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/parkings/liste?search=${searchQuery}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setParkings(data.map((p: any) => ({
        ...p, image: p.image, isVerifie: p.isVerifie,
        note: p.note, nbAvis: p.nbAvis || 0, distance: p.distance || '—',
      })));
    } catch { setError('Impossible de charger les parkings.'); }
    finally { setLoading(false); }
  }, [searchQuery]);

  useEffect(() => { load(); }, [load]);
  return { parkings, loading, error, refetch: load };
}

/* ── AvailBadge ── */
function AvailBadge({ n }: { n: number }) {
  if (n === 0) return (
    <span className="inline-flex items-ce nter gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Complet
    </span>
  );
  if (n <= 5) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" style={{ animation: 'pg-pulse 1.6s ease infinite' }} />
      {n} restante{n > 1 ? 's' : ''}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{n} places
    </span>
  );
}

/* ── Skeletons ── */
function SkeletonCard() {
  return (
    <div className="pg-card">
      <div className="shim" style={{ height: 160 }} />
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="flex gap-1.5"><div className="shim h-4 w-16" /><div className="shim h-4 w-12" /></div>
        <div className="shim h-3.5" style={{ width: '65%' }} />
        <div className="flex justify-between items-center pt-1">
          <div className="shim h-6 w-20" />
          <div className="shim h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="pg-card flex items-center gap-3 p-3.5">
      <div className="shim w-14 h-14 rounded-xl shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="shim h-3.5 w-1/2" />
        <div className="shim h-3 w-1/3" />
        <div className="shim h-4 w-20 rounded-full" />
      </div>
      <div className="shim h-9 w-20 rounded-xl shrink-0" />
    </div>
  );
}

/* ── ParkingCard ── */
function ParkingCard({ p, onReserve, active, onHover }: {
  p: Parking; onReserve: (id: number) => void; active?: boolean; onHover?: (id: number | null) => void;
}) {
  const isFree = p.prix_base === 0;
  const full = p.disponible === 0;
  const isDisabled = full || isFree;
  
  return (
    <article className={`pg-card ${active ? 'active' : ''}`}
      onMouseEnter={() => onHover?.(p.id)} onMouseLeave={() => onHover?.(null)}>
      <div className="relative overflow-hidden" style={{ height: 160, background: '#E8EAF0' }}>
        <img src={p.image} alt={p.nom} loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500"
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(10,16,40,.82) 0%,rgba(10,16,40,.06) 55%,transparent 100%)' }} />
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
          {p.isVerifie
            ? <span className="inline-flex items-center gap-1 bg-orange-500 rounded-lg px-2 py-1">
              <Shield size={8} color="#fff" fill="#fff" /><span className="text-[8px] font-black text-white uppercase tracking-wider">Vérifié</span>
            </span>
            : <span />}
          <span className="inline-flex items-center gap-1 bg-white/95 rounded-full px-2 py-1">
            <Star size={9} color="#F59E0B" fill="#F59E0B" />
            <span className="text-[11px] font-bold text-slate-900">{p.note}</span>
            <span className="text-[10px] text-slate-400">({p.nbAvis})</span>
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3">
          <p className="text-[13px] font-bold text-white leading-tight mb-0.5 truncate">{p.nom}</p>
          <div className="flex items-center gap-1">
            <MapPin size={9} color="rgba(255,255,255,.55)" />
            <span className="text-[10px] text-white/55 truncate">{p.quartier} · {p.distance}</span>
          </div>
        </div>
      </div>

      <div className="p-3.5">
        <div className="flex flex-wrap gap-1.5 mb-3">
          <AvailBadge n={p.disponible} />
          {p.tags.slice(0, 2).map(tag => {
            const Icon = TAG_ICONS[tag];
            return (
              <span key={tag} className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                {Icon && <Icon size={8} strokeWidth={2.5} />}{tag}
              </span>
            );
          })}
        </div>
        <div className="h-px bg-slate-100 mb-3" />
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <div className="mono text-xl font-bold text-slate-900 tracking-tight leading-none">{p.prix_base.toLocaleString() != '0' ? <div>{p.prix_base.toLocaleString()}<span className="text-[11px] text-slate-400">FCFA/h</span></div> : <span className='text-[12px] text-red-600'>indisponible</span>}</div>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <Car size={9} className="text-slate-300" /><span className="text-[10px] text-slate-400">{p.capacite} places</span>
            </div>
          </div>
          <button
            disabled={isDisabled}
            onClick={e => {
              e.stopPropagation();
              if (!isDisabled) onReserve(p.id);
            }}
            className={`flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-bold border-none transition-all duration-150
    ${isDisabled
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-orange-500 hover:-translate-y-px hover:shadow-lg'
              }`}
          >
            {full
              ? 'Complet'
              : (
                <>
                  <span>Réserver</span>
                  <ArrowRight size={11} />
                </>
              )
            }
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── ParkingRow ── */
function ParkingRow({ p, onReserve, active, onHover }: {
  p: Parking; onReserve: (id: number) => void; active?: boolean; onHover?: (id: number | null) => void;
}) {
  const full = p.disponible === 0;
  return (
    <article className={`pg-card flex items-center gap-3 p-3.5 ${active ? 'active' : ''}`}
      onMouseEnter={() => onHover?.(p.id)} onMouseLeave={() => onHover?.(null)}>
      <img src={p.image} alt={p.nom} loading="lazy" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[13px] font-semibold text-slate-900 truncate">{p.nom}</span>
          {p.isVerifie && <Shield size={11} className="text-orange-500 fill-orange-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5">
          <MapPin size={9} className="text-slate-300" />{p.quartier} · {p.distance}
          <span className="text-slate-200">·</span>
          <Star size={9} color="#F59E0B" fill="#F59E0B" />
          <span className="font-semibold text-slate-600">{p.note}</span>
        </div>
        <AvailBadge n={p.disponible} />
      </div>
      <div className="text-right shrink-0">
        <div className="mono text-[17px] font-bold text-slate-900 tracking-tight leading-none">{p.prix_base.toLocaleString()}</div>
        <div className="text-[9px] text-slate-400 mt-0.5">FCFA/h</div>
      </div>
      <button disabled={full} onClick={e => { e.stopPropagation(); onReserve(p.id); }}
        className={`shrink-0 flex items-center gap-1 h-9 px-3 rounded-xl text-[11px] font-bold border-none transition-all duration-150
          ${full ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-orange-500 hover:-translate-y-px'}`}>
        {full ? 'Complet' : 'Réserver'}
      </button>
    </article>
  );
}

/* ── FilterSheet (mobile bottom sheet) ── */
function FilterSheet({ open, onClose, prixMax, setPrixMax, fil, onToggle, onReset, activeFilters, sortBy, setSortBy }: {
  open: boolean; onClose: () => void; prixMax: number; setPrixMax: (v: number) => void;
  fil: FilState; onToggle: (k: keyof FilState) => void; onReset: () => void; activeFilters: number;
  sortBy: SortKey; setSortBy: (v: SortKey) => void;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="pg-slide fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-slate-600" />
            <span className="text-[14px] font-bold text-slate-900">Filtres & Tri</span>
            {activeFilters > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">{activeFilters}</span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border-none cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {/* Sort */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Trier par</p>
            <div className="grid grid-cols-2 gap-2">
              {SORT_OPTIONS.map(o => (
                <button key={o.value} onClick={() => setSortBy(o.value as SortKey)}
                  className={`h-10 rounded-xl text-[12px] font-semibold border transition-all duration-150 cursor-pointer
                    ${sortBy === o.value ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prix max / heure</p>
              <span className="mono text-[12px] font-bold text-slate-900">{prixMax.toLocaleString()} F</span>
            </div>
            <input type="range" min="300" max="2000" step="50" value={prixMax} onChange={e => setPrixMax(+e.target.value)}
              className="w-full cursor-pointer" style={{ accentColor: '#F06A00' }} />
            <div className="flex justify-between mt-1.5 text-[9px] text-slate-400 font-semibold">
              <span>300 F</span><span>2 000 F</span>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Équipements</p>
            <div className="grid grid-cols-2 gap-2">
              {TAG_FILTERS.map(({ key, label, Icon }) => {
                const on = fil[key as keyof FilState];
                return (
                  <button key={key} onClick={() => onToggle(key as keyof FilState)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-150 cursor-pointer text-left
                      ${on ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <Icon size={14} strokeWidth={2} className={on ? 'text-blue-600' : 'text-slate-400'} />
                    <span className="text-[11px] font-semibold flex-1 leading-tight">{label}</span>
                    {on && <Check size={11} className="text-blue-600 shrink-0" strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset */}
          {(activeFilters > 0 || prixMax < 2000) && (
            <button onClick={() => { onReset(); onClose(); }}
              className="w-full h-11 rounded-xl border border-red-200 bg-red-50 text-red-600 text-[13px] font-semibold cursor-pointer transition-all hover:bg-red-100">
              Réinitialiser les filtres
            </button>
          )}

          <button onClick={onClose}
            className="w-full h-12 rounded-xl bg-slate-900 text-white text-[13px] font-semibold cursor-pointer transition-all hover:bg-slate-800 border-none">
            Voir les résultats
          </button>
        </div>
      </div>
    </>
  );
}

/* ── FilterSidebar (desktop) ── */
function FilterSidebar({ prixMax, setPrixMax, fil, onToggle, onReset, activeFilters }: {
  prixMax: number; setPrixMax: (v: number) => void; fil: FilState;
  onToggle: (k: keyof FilState) => void; onReset: () => void; activeFilters: number;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Price */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prix max / heure</span>
          <span className="mono text-[11px] font-bold text-slate-900">{prixMax.toLocaleString()} F</span>
        </div>
        <input type="range" min="300" max="2000" step="50" value={prixMax} onChange={e => setPrixMax(+e.target.value)}
          className="w-full cursor-pointer" style={{ accentColor: '#F06A00' }} />
        <div className="flex justify-between mt-1.5 text-[9px] text-slate-400 font-semibold">
          <span>300</span><span>2 000 FCFA</span>
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Amenities */}
      <div>
        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Équipements</span>
        <div className="flex flex-col gap-1.5">
          {TAG_FILTERS.map(({ key, label, Icon }) => {
            const on = fil[key as keyof FilState];
            return (
              <button key={key} onClick={() => onToggle(key as keyof FilState)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-150 cursor-pointer text-left
                  ${on ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${on ? 'bg-blue-600' : 'bg-slate-100'}`}>
                  <Icon size={12} color={on ? '#fff' : '#94a3b8'} strokeWidth={2} />
                </div>
                <span className={`text-[12px] font-medium flex-1 ${on ? 'text-blue-700 font-semibold' : 'text-slate-600'}`}>{label}</span>
                {on && <Check size={11} className="text-blue-600 shrink-0" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      </div>

      {(activeFilters > 0 || prixMax < 2000) && (
        <button onClick={onReset} className="w-full h-9 rounded-xl border border-slate-200 bg-white text-[11px] font-semibold text-slate-500 cursor-pointer hover:border-red-300 hover:text-red-500 transition-all">
          Réinitialiser
        </button>
      )}
    </div>
  );
}

/* ── EmptyState ── */
function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white border-2 border-dashed border-slate-200 rounded-2xl">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
        <Search size={20} className="text-blue-500" strokeWidth={1.6} />
      </div>
      <p className="text-[15px] font-bold text-slate-800 mb-1.5">Aucun parking trouvé</p>
      <p className="text-[12px] text-slate-400 mb-5 max-w-xs">Essayez d'élargir vos critères de recherche.</p>
      <button onClick={onReset} className="h-9 px-5 rounded-xl border border-slate-200 bg-white text-[12px] font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors">
        Effacer les filtres
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export function ParkingListPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(1024);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [prixMax, setPrixMax] = useState(2000);
  const [sortBy, setSortBy] = useState<SortKey>('distance');
  const [view, setView] = useState<ViewMode>('grid');
  const [fil, setFil] = useState<FilState>({ video: false, gardien: false, couvert: false, ev: false });
  const [filterOpen, setFilterOpen] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [mobileMap, setMobileMap] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const { parkings, loading, error, refetch } = useParkings(search);

  const onToggle = useCallback((k: keyof FilState) => setFil(p => ({ ...p, [k]: !p[k] })), []);
  const resetAll = useCallback(() => { setFil({ video: false, gardien: false, couvert: false, ev: false }); setPrixMax(2000); setSearch(''); }, []);
  const onReserve = useCallback((id: number) => navigate(`/parking/${id}`), [navigate]);
  const activeFilters = useMemo(() => Object.values(fil).filter(Boolean).length, [fil]);

  const filtered = useMemo(() =>
    parkings
      .filter(p => {
        if (search && !p.nom.toLowerCase().includes(search.toLowerCase()) && !p.quartier.toLowerCase().includes(search.toLowerCase())) return false;
        if (p.prix_base > prixMax) return false;
        if (fil.video && !p.tags.includes('Vidéosurveillance')) return false;
        if (fil.gardien && !p.tags.includes('Gardien 24h')) return false;
        if (fil.couvert && !p.tags.includes('Couvert')) return false;
        if (fil.ev && !p.tags.includes('Recharge EV')) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'prix') return a.prix_base - b.prix_base;
        if (sortBy === 'note') return b.note - a.note;
        if (sortBy === 'dispo') return b.disponible - a.disponible;
        return parseFloat(a.distance) - parseFloat(b.distance);
      }),
    [parkings, search, prixMax, fil, sortBy]
  );

  const colsDesktop = showMap ? 2 : 3;

  return (
    <div className="pg" style={{ height: `calc(100vh - ${NAV_H}px)`, display: 'flex', flexDirection: 'column', background: '#F4F5F7', overflow: 'hidden' }}>
      <style>{CSS}</style>

      {/* ════ COMMAND BAR ════ */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 z-20 px-4 py-2.5 flex items-center gap-2.5">

        {/* Mobile search toggle */}
        {isMobile ? (
          <>
            <button onClick={() => setShowMobileSearch(v => !v)}
              className="flex items-center gap-2 flex-1 h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-[13px] cursor-pointer text-left">
              <Search size={14} className="shrink-0" />
              <span className="flex-1 truncate">{search || 'Quartier, parking…'}</span>
              {search && <X size={12} onClick={e => { e.stopPropagation(); setSearch(''); }} />}
            </button>
          </>
        ) : (
          /* Desktop search */
          <div className="flex items-center gap-2 flex-1 h-10 bg-slate-50 border border-slate-200 rounded-xl px-3.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            <Search size={13} className="text-slate-400 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Quartier, monument, parking…"
              className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-800 placeholder:text-slate-400"
              style={{ fontFamily: 'Figtree, sans-serif' }} />
            {search && <X size={12} className="text-slate-400 cursor-pointer" onClick={() => setSearch('')} />}
          </div>
        )}

        {!isMobile && (
          <>
            <div className="h-6 w-px bg-slate-200 shrink-0" />
            {/* Sort chips (desktop only) */}
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto">
              {SORT_OPTIONS.map(o => (
                <button key={o.value} className={`pg-chip ${sortBy === o.value ? 'active' : ''}`}
                  onClick={() => setSortBy(o.value as SortKey)}>{o.label}</button>
              ))}
            </div>
          </>
        )}

        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {/* Result count */}
          {!loading && !isMobile && (
            <span className="text-[11px] text-slate-400 hidden sm:block">
              <span className="mono font-bold text-slate-700">{filtered.length}</span> résultats
            </span>
          )}

          {/* Filter btn */}
          <button onClick={() => setFilterOpen(v => !v)}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-xl border text-[12px] font-semibold cursor-pointer transition-all duration-150
              ${activeFilters > 0 ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
            <SlidersHorizontal size={13} />
            <span className="hidden sm:block">Filtres</span>
            {activeFilters > 0 && (
              <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">{activeFilters}</span>
            )}
          </button>

          {/* View toggle (desktop) */}
          {!isMobile && (
            <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-0.5 gap-0.5">
              {([['grid', Grid2X2], ['list', List]] as const).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border-none cursor-pointer transition-all
                    ${view === v ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-400 hover:text-slate-600'}`}>
                  <Icon size={13} />
                </button>
              ))}
            </div>
          )}

          {/* Map toggle (desktop) */}
          {!isMobile && (
            <button onClick={() => setShowMap(v => !v)}
              className={`flex items-center gap-1.5 h-9 px-3.5 rounded-xl border text-[12px] font-semibold cursor-pointer transition-all duration-150
                ${showMap ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              <Map size={13} /> Carte
            </button>
          )}
        </div>
      </div>

      {/* Mobile search expand */}
      {isMobile && showMobileSearch && (
        <div className="pg-up flex-shrink-0 bg-white border-b border-slate-100 px-4 py-3 z-15">
          <div className="flex items-center gap-2 h-10 bg-slate-50 border border-blue-400 ring-2 ring-blue-50 rounded-xl px-3.5 transition-all">
            <Search size={13} className="text-blue-500 shrink-0" />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Quartier, monument, parking…"
              className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-800 placeholder:text-slate-400"
              style={{ fontFamily: 'Figtree, sans-serif' }} />
            {search && <X size={12} className="text-slate-400 cursor-pointer" onClick={() => setSearch('')} />}
          </div>
        </div>
      )}

      {/* ════ BODY ════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* Filter sidebar (desktop) */}
        {!isMobile && filterOpen && (
          <div className="pg-up flex-shrink-0 w-60 bg-white border-r border-slate-200 overflow-y-auto p-4">
            <FilterSidebar prixMax={prixMax} setPrixMax={setPrixMax} fil={fil}
              onToggle={onToggle} onReset={resetAll} activeFilters={activeFilters} />
          </div>
        )}

        {/* Results */}
        <div className="pg-scroll flex-1 overflow-y-auto p-4 min-w-0" style={{ paddingBottom: isMobile ? 88 : 32 }}>

          {/* Mobile sort pills */}
          {isMobile && (
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 no-scrollbar mb-2">
              {SORT_OPTIONS.map(o => (
                <button key={o.value} className={`pg-chip shrink-0 ${sortBy === o.value ? 'active' : ''}`}
                  style={{ padding: '5px 12px', fontSize: 11 }}
                  onClick={() => setSortBy(o.value as SortKey)}>{o.label}</button>
              ))}
            </div>
          )}

          {/* Result count mobile */}
          {isMobile && !loading && (
            <p className="text-[11px] text-slate-400 mb-3">
              <span className="mono font-bold text-slate-700">{filtered.length}</span> parking{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <p className="text-[12px] font-semibold text-red-700 flex-1">{error}</p>
              <button onClick={refetch} className="flex items-center gap-1 h-8 px-3 bg-red-600 rounded-lg text-white text-[11px] font-bold border-none cursor-pointer">
                <RefreshCw size={11} /> Réessayer
              </button>
            </div>
          )}

          {/* Skeleton */}
          {loading && (
            view === 'grid' || isMobile
              ? <div className="grid gap-3" style={{ gridTemplateColumns: isMobile ? '1fr' : `repeat(${colsDesktop},1fr)` }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
              : <div className="flex flex-col gap-2.5">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && <EmptyState onReset={resetAll} />}

          {/* Cards */}
          {!loading && !error && filtered.length > 0 && (
            (view === 'grid' || isMobile)
              ? <div className="grid gap-3" style={{ gridTemplateColumns: isMobile ? 'repeat(1,1fr)' : `repeat(${colsDesktop},1fr)` }}>
                {filtered.map((p, i) => (
                  <div key={p.id} className="pg-up" style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}>
                    <ParkingCard p={p} onReserve={onReserve} active={hoveredId === p.id} />
                  </div>
                ))}
              </div>
              : <div className="flex flex-col gap-2">
                {filtered.map((p, i) => (
                  <div key={p.id} className="pg-up" style={{ animationDelay: `${Math.min(i * 30, 180)}ms` }}>
                    <ParkingRow p={p} onReserve={onReserve} active={hoveredId === p.id} onHover={setHoveredId} />
                  </div>
                ))}
              </div>
          )}
        </div>

        {/* Map pane (desktop) */}
        {showMap && !isMobile && (
          <div className="pg-map flex-shrink-0 border-l border-slate-200 relative" style={{ width: '42%' }}>
            <MapComponent items={filtered} onReserve={onReserve} />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 pointer-events-none shadow-sm z-10">
              <Zap size={10} className="text-emerald-600 fill-emerald-600" />
              <span className="text-[11px] font-bold text-slate-800">
                <span className="mono text-blue-600">{filtered.length}</span> parking{filtered.length > 1 ? 's' : ''} sur la carte
              </span>
            </div>
            <button onClick={() => setShowMap(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* FAB: show map (desktop, when hidden) */}
      {!showMap && !isMobile && (
        <button onClick={() => setShowMap(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 h-11 px-5 rounded-2xl bg-slate-900 text-white text-[13px] font-bold border-none cursor-pointer shadow-xl hover:bg-orange-500 transition-all duration-150"
          style={{ fontFamily: 'Figtree, sans-serif' }}>
          <Map size={14} /> Afficher la carte
        </button>
      )}

      {/* FAB: map (mobile) */}
      {isMobile && !mobileMap && (
        <button onClick={() => setMobileMap(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 h-12 px-6 rounded-2xl bg-slate-900 text-white text-[13px] font-bold border-none cursor-pointer shadow-xl hover:bg-orange-500 transition-all duration-150 whitespace-nowrap"
          style={{ fontFamily: 'Figtree, sans-serif' }}>
          <Map size={15} /> Voir la carte
          <span className="bg-white/20 rounded-full px-2 py-0.5 text-[11px] font-black">{filtered.length}</span>
        </button>
      )}

      {/* Mobile map overlay */}
      {isMobile && mobileMap && (
        <div className="pg-slide fixed inset-0 z-60 flex flex-col bg-slate-50">
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
            <div>
              <p className="text-[14px] font-bold text-slate-900">Carte des parkings</p>
              <p className="text-[11px] text-slate-400">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => setMobileMap(false)}
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[12px] font-semibold text-slate-600 cursor-pointer border-none">
              <X size={13} /> Fermer
            </button>
          </div>
          <div className="flex-1 relative">
            <MapComponent items={filtered} onReserve={onReserve} />
          </div>
        </div>
      )}

      {/* Mobile filter sheet */}
      <FilterSheet open={filterOpen && isMobile} onClose={() => setFilterOpen(false)}
        prixMax={prixMax} setPrixMax={setPrixMax} fil={fil} onToggle={onToggle}
        onReset={resetAll} activeFilters={activeFilters} sortBy={sortBy} setSortBy={setSortBy} />
    </div>
  );
}