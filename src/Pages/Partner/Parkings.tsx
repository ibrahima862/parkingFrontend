import React, { useState, useEffect, memo } from 'react';
import { MapPin, Plus, Car, Clock, ShieldCheck, Star, CheckCircle2, ArrowRight, Camera, Leaf, Wifi, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Parking {
  id: number;
  nom: string;
  quartier: string;
  prix_base: number;
  capacite: number;
  image: string;
  is_approved: boolean;
  statut?: string;
  tags?: string[];
  note?: number;
  nbAvis?: number;
}

const TAG_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  'Vidéosurveillance': Camera,
  'Gardien 24h': Shield,
  'Couvert': Car,
  'Recharge EV': Leaf,
  'Ouvert 24h/24': Clock,
  'Wi-Fi': Wifi,
};

const fmt = (n: number) => n.toLocaleString('fr-FR');
const imgUrl = (img: string) => img?.startsWith('http') ? img : `${(import.meta as any).env.VITE_API_URL}/storage/${img}`;
const defaultTags = (cap: number) => cap > 20 ? ['Vidéosurveillance', 'Gardien 24h'] : ['Couvert'];

const Card = memo(({ p, onView }: { p: Parking; onView: (id: number) => void }) => {
  const tags = (p.tags?.length ? p.tags : defaultTags(p.capacite)).slice(0, 3);
  const approved = p.statut === 'valide' || p.is_approved;

  return (
    <article
      onClick={() => onView(p.id)}
      className="group bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-200 hover:shadow-[0_4px_24px_-4px_rgba(29,78,216,0.08)] transition-all duration-200"
    >
      <div className="relative h-40 bg-slate-100 overflow-hidden">
        <img
          src={imgUrl(p.image)}
          alt={p.nom}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start">
          {approved ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-semibold text-slate-700 border border-slate-200/60">
              <ShieldCheck size={9} className="text-blue-600" /> Vérifié
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50/95 text-[10px] font-semibold text-amber-700 border border-amber-200/60">
              <Clock size={9} /> En attente
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 text-[10px] font-semibold text-slate-700 border border-slate-200/60">
            <Star size={9} className="text-amber-400 fill-amber-400" />
            {(p.note ?? 4.5)}
            <span className="text-slate-400 font-normal">({p.nbAvis ?? 12})</span>
          </span>
        </div>

        <div className="absolute bottom-2.5 left-3 right-3">
          <h3 className="text-white font-bold text-[14px] leading-tight truncate">{p.nom}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={9} className="text-orange-400 shrink-0" />
            <span className="text-white/70 text-[10px] truncate">{p.quartier}</span>
          </div>
        </div>
      </div>

      <div className="p-3.5 flex flex-col gap-3">
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => {
            const Icon = TAG_ICONS[tag];
            return (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-medium border border-slate-100">
                {Icon && <Icon size={9} />}{tag}
              </span>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[18px] font-bold text-slate-900 tracking-tight font-mono">{fmt(p.prix_base)}</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase ml-1">F/h</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Car size={11} />{p.capacite} places</span>
            <button
              onClick={e => { e.stopPropagation(); onView(p.id); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-semibold transition-colors active:scale-95"
            >
              Voir <ArrowRight size={11} className="text-orange-400" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

const SkeletonCard = () => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse">
    <div className="h-40 bg-slate-100" />
    <div className="p-3.5 flex flex-col gap-3">
      <div className="flex gap-1.5">
        <div className="h-4 w-16 bg-slate-100 rounded-md" />
        <div className="h-4 w-20 bg-slate-100 rounded-md" />
      </div>
      <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
        <div className="h-5 w-20 bg-slate-100 rounded" />
        <div className="h-7 w-16 bg-slate-100 rounded-lg" />
      </div>
    </div>
  </div>
);

export default function PartnerParkings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [parkings, setParkings] = useState<Parking[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${(import.meta as any).env.VITE_API_URL}/api/partenaire/parkings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setParkings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const approved = parkings.filter(p => p.statut === 'valide').length;
  const totalPlaces = parkings.reduce((a, p) => a + p.capacite, 0);
  const avgPrice = parkings.length ? Math.round(parkings.reduce((a, p) => a + p.prix_base, 0) / parkings.length) : 0;

  const stats = [
    { label: 'Parkings', value: parkings.length, sub: `${approved} actif${approved > 1 ? 's' : ''}` },
    { label: 'Places', value: totalPlaces, sub: 'capacité totale' },
    { label: 'Prix moyen', value: `${fmt(avgPrice)} F`, sub: 'par heure' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mt-8 mb-6">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Mes espaces</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mes parkings</h1>
          {!loading && parkings.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 size={8} /> {approved} actif{approved > 1 ? 's' : ''}
              </span>
              {parkings.length - approved > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700">
                  <Clock size={8} /> {parkings.length - approved} en attente
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => navigate('/partner/parking-lots/new')}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-[13px] font-semibold transition-colors active:scale-95 shadow-sm"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Ajouter un parking</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Stats strip */}
      {!loading && parkings.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-[17px] font-bold text-slate-900 tracking-tight font-mono mt-0.5">{s.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : parkings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mb-4">
            <MapPin size={22} className="text-slate-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-1">Aucun parking pour l'instant</h3>
          <p className="text-[13px] text-slate-400 max-w-xs leading-relaxed mb-6">
            Ajoutez votre premier espace pour commencer à recevoir des réservations.
          </p>
          <button
            onClick={() => navigate('/partner/parking-lots/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-[13px] font-semibold transition-colors active:scale-95"
          >
            <Plus size={14} /> Créer ma première annonce
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {parkings.map(p => (
            <Card key={p.id} p={p} onView={id => navigate(`/partner/parking/${id}/details`)} />
          ))}
        </div>
      )}
    </div>
  );
}