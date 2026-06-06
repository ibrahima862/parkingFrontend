import { useState, useEffect } from 'react';
import {
  Search, ShieldCheck, Clock, User,
  MapPin, Star, CheckCircle, ArrowRight,
  Zap, Plus, Minus,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Parking {
  id: string | number;
  nom: string;
  image?: string;
  isVerifie?: boolean;
  note: number;
  quartier: string;
  prix_heure: number;
}

/* ─── FAQ ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors ${open ? 'border-blue-200' : 'border-zinc-200 hover:border-zinc-300'}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-3 bg-transparent">
        <span className="text-[14px] font-bold text-blue-950">{q}</span>
        <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${open ? 'bg-blue-900' : 'bg-zinc-100'}`}>
          {open ? <Minus size={11} className="text-white" /> : <Plus size={11} className="text-zinc-500" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-zinc-100">
          <p className="text-[13px] text-zinc-500 leading-relaxed pt-4">{a}</p>
        </div>
      )}
    </div>
  );
}

/* ─── STEP ─── */
function Step({ n, title, desc, last }: { n: string; title: string; desc: string; last?: boolean }) {
  return (
    <div className="flex gap-5 group">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center text-[13px] font-black z-10 group-hover:bg-orange-500 transition-colors duration-300">
          {n}
        </div>
        {!last && <div className="w-px flex-1 bg-zinc-200 min-h-[32px] mt-1" />}
      </div>
      <div className={`${last ? 'pb-0' : 'pb-8'} pt-1.5`}>
        <h3 className="text-[15px] font-black text-zinc-900 mb-1">{title}</h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ─── PARKING IMAGE ─── */
function ParkingImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-100">
      {!loaded && <div className="absolute inset-0 shimmer z-10" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`park-img w-full h-full object-cover transition-all duration-700 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
        }`}
        loading="lazy"
      />
    </div>
  );
}

const getOptimizedImage = (url: string | null, width = 800) => {
  if (!url) return 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=800';
  if (!url.includes('cloudinary')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_fill,g_auto/`);
};

/* ─── SKELETON CARD FOR LOADING STATE ─── */
function ParkingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-100 h-64 relative overflow-hidden bg-zinc-50 p-5 flex flex-col justify-between">
      <div className="absolute inset-0 shimmer" />
      <div className="flex justify-between z-10 w-full">
        <div className="w-16 h-5 bg-zinc-200 rounded-full" />
        <div className="w-10 h-5 bg-zinc-200 rounded-full" />
      </div>
      <div className="z-10 space-y-2">
        <div className="w-2/3 h-5 bg-zinc-200 rounded" />
        <div className="w-1/2 h-3 bg-zinc-200 rounded" />
        <div className="w-1/3 h-4 bg-zinc-200 rounded" />
      </div>
    </div>
  );
}

/* ══════════════════════════════════
    MAIN COMPONENT
══════════════════════════════════ */
export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateDeb, setDateDeb] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [menuOpen] = useState(false); // Ajouté pour éviter l'erreur de scope si utilisé ailleurs
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const apiUrl = (import.meta as any).env.VITE_API_URL;
        const res = await fetch(`${apiUrl}/api/parkings/liste`);
        const data = await res.json();
        setParkings(data.slice(0, 3));
      } catch (error) {
        console.error("Erreur chargement parkings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchParking();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const params = new URLSearchParams({
      search: searchQuery,
      arrivee: dateDeb,
      depart: dateFin
    });
    navigate(`/parking-lots?${params.toString()}`);
  };
  
  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased">
      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b border-zinc-100 px-6 py-4 space-y-3">
          <Link to="/parking-lots" className="block text-[14px] font-semibold text-zinc-700 py-2">Trouver un parking</Link>
          <a href="#" className="block text-[14px] font-semibold text-zinc-700 py-2">Tarifs</a>
          <button className="w-full h-11 bg-blue-900 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-2">
            <User size={14} /> Espace Client
          </button>
        </div>
      )}

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[640px] flex items-center justify-center overflow-hidden -mt-16 pt-16">
        <div className="absolute inset-0">
         <img
            src={getOptimizedImage("https://res.cloudinary.com/dcijmifzi/image/upload/v1778516810/ben-elliott-dk1F7gz38Cs-unsplash_2_k7sdgm.jpg", 1200)}
            alt="Dakar" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/50 via-blue-950/70 to-blue-950 backdrop-blur-[2px]" />
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full -translate-y-1/2 translate-x-1/3"
            style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)' }} />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center py-28">
          <div className="fade-up inline-flex items-center gap-2 px-3.5 py-1.5 mb-7 bg-orange-500/12 border border-orange-500/22 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">50+ parkings · Dakar & Thiès</span>
          </div>

          <h1 className="fade-up-2 text-[clamp(32px,6vw,60px)] font-black text-white leading-[1.05] tracking-tighter mb-5">
            Ne cherchez plus,<br />
            <span className="text-orange-400">réservez.</span>
          </h1>

          <p className="fade-up-3 text-[15px] text-blue-300/80 max-w-md mx-auto mb-10 leading-relaxed">
            Trouvez et réservez votre place de parking à Dakar en quelques secondes. Paiement Wave & Orange Money.
          </p>

          {/* Search form */}
          <form onSubmit={handleSearch} className="fade-up-3 bg-white rounded-2xl overflow-hidden shadow-2xl max-w-[680px] mx-auto text-left">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-100">
              <div className="flex-1 flex items-center gap-3 px-5 py-4">
                <MapPin size={15} className="text-zinc-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Destination</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Dakar Plateau, Almadies..."
                    className="w-full outline-none text-[13px] font-semibold text-zinc-900 placeholder:text-zinc-300 bg-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 flex items-center gap-3 px-5 py-4">
                <Clock size={15} className="text-zinc-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Arrivée</label>
                  <input
                    type="datetime-local"
                    value={dateDeb}
                    onChange={e => setDateDeb(e.target.value)}
                    className="w-full outline-none text-[12px] font-semibold text-zinc-700 bg-transparent"
                  />
                </div>
              </div>

              <div className="flex-1 flex items-center gap-3 px-5 py-4">
                <Clock size={15} className="text-zinc-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Départ</label>
                  <input
                    type="datetime-local"
                    value={dateFin}
                    onChange={e => setDateFin(e.target.value)}
                    className="w-full outline-none text-[12px] font-semibold text-zinc-700 bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="p-2 bg-zinc-50/70 border-t border-zinc-100">
              <button
                type="submit"
                className="w-full h-12 bg-orange-500 text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 active:scale-[0.98] transition-all"
              >
                <Search size={14} /> Trouver une place disponible
              </button>
            </div>
          </form>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 72" className="w-full" preserveAspectRatio="none">
            <path d="M0,40 C480,80 960,0 1440,40 L1440,72 L0,72 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-12 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: loading ? '...' : parkings.length, label: 'Parkings sécurisés', cls: 'text-blue-900' },
            { val: '50%', label: 'Utilisateurs actifs', cls: 'text-orange-500' },
            { val: '98%', label: 'Clients satisfaits', cls: 'text-emerald-600' },
            { val: '24/7', label: 'Assistance', cls: 'text-blue-900' },
          ].map(({ val, label, cls }) => (
            <div key={label} className="text-center group">
              <p className={`font-mono text-[30px] font-black tracking-tight ${cls} group-hover:scale-105 transition-transform`}>{val}</p>
              <p className="text-[11px] text-zinc-400 font-semibold mt-1 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ POPULAR PARKINGS ═══ */}
      <section className="py-20 px-6 max-w-[1100px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Destinations phares</p>
            <h2 className="text-[26px] font-black text-blue-950 tracking-tight">Parkings populaires à Dakar</h2>
          </div>
          <Link to="/parking-lots" className="hidden md:flex items-center gap-1.5 text-[12px] font-black text-blue-900 hover:text-orange-500 transition-colors">
            Voir tous <ArrowRight size={12} strokeWidth={2.5} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <>
              <ParkingCardSkeleton />
              <ParkingCardSkeleton />
              <ParkingCardSkeleton />
            </>
          ) : (
            parkings.map((p, i) => (
              <Link
                key={p.id}
                to={`/parking/${p.id}`}
                className="park-card relative rounded-2xl overflow-hidden cursor-pointer border border-zinc-100 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-64 block group"
              >
                <ParkingImage
                  src={getOptimizedImage(p.image || null)}
                  alt={p.nom}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-900/20 to-transparent" />

                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    {p.isVerifie && (
                      <span className="w-fit text-[9px] font-black text-white bg-orange-500 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle size={10} fill="white" className="text-orange-500" /> Vérifié
                      </span>
                    )}
                    {i === 0 && (
                      <span className="w-fit text-[9px] font-black text-white bg-blue-600/80 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Top Choix
                      </span>
                    )}
                  </div>

                  <span className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
                    <Star size={10} className="text-amber-400" fill="currentColor" />
                    <span className="text-[11px] font-black text-zinc-900">{p.note}</span>
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-white font-black text-[15px] mb-0.5 truncate">{p.nom}</p>
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin size={10} className="text-white/60" />
                      <span className="text-[11px] text-white/60 truncate">{p.quartier}</span>
                    </div>
                    <p className="text-orange-400 text-[12px] font-bold font-mono">
                      {p.prix_heure} FCFA/h
                    </p>
                  </div>

                  <div className="park-arrow w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center transition-all duration-200 group-hover:bg-orange-500">
                    <ArrowRight size={14} className="text-white" strokeWidth={3} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-20 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-[1000px] mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3">Simple & rapide</p>
            <h2 className="text-[26px] font-black text-blue-950 tracking-tight mb-10">Réservez en 3 étapes</h2>
            <Step n="1" title="Cherchez" desc="Entrez votre destination et comparez les prix des parkings à proximité." />
            <Step n="2" title="Réservez & Payez" desc="Sécurisez votre place via Wave ou Orange Money en quelques secondes." />
            <Step n="3" title="Garez-vous" desc="Suivez le GPS jusqu'au parking et montrez votre QR code à l'entrée." last />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: ShieldCheck, title: 'Parking sécurisé', sub: 'Vidéosurveillance 24/7', color: 'bg-blue-50 border-blue-100 text-blue-700' },
              { icon: Zap, title: 'Accès instantané', sub: "QR Code à l'entrée", color: 'bg-orange-50 border-orange-100 text-orange-600' },
              { icon: Star, title: '98% satisfaction', sub: 'Clients vérifiés', color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
              { icon: Clock, title: 'Annulation libre', sub: "Jusqu'à 2h avant", color: 'bg-violet-50 border-violet-100 text-violet-700' },
            ].map(({ icon: Icon, title, sub, color }) => (
              <div key={title} className={`border rounded-2xl p-5 hover:shadow-sm transition-all ${color}`}>
                <div className="w-8 h-8 rounded-xl bg-white border border-current/10 flex items-center justify-center mb-3 opacity-80">
                  <Icon size={15} strokeWidth={2} />
                </div>
                <p className="text-[13px] font-black leading-tight">{title}</p>
                <p className="text-[11px] opacity-60 mt-0.5 font-medium">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARTNER CTA ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="bg-blue-900 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-start gap-10">
            <div className="absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)' }} />

            <div className="relative z-10 flex-1">
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3">Propriétaires de parking</p>
              <h2 className="text-[26px] font-black text-white tracking-tight mb-3 leading-tight">
                Rentabilisez vos<br />places vides
              </h2>
              <p className="text-[13px] text-blue-200 mb-7 leading-relaxed max-w-sm">
                Rejoignez le réseau SenovaPark et générez des revenus mensuels réguliers en quelques clics.
              </p>
              <button onClick={()=>navigate('/becomePartner')} className="h-11 px-6 bg-white text-blue-900 text-[12px] font-bold rounded-xl flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all">
                Inscrire mon parking <ArrowRight size={13} strokeWidth={2.5} />
              </button>
            </div>

            <div className="relative z-10 flex-1 grid grid-cols-2 gap-3">
              {['Revenus mensuels garantis', 'Gestion 100% automatisée', 'Dashboard temps réel', 'Support dédié 7j/7'].map(label => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-2.5 hover:bg-white/10 transition-colors">
                  <CheckCircle size={13} className="text-orange-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                  <p className="text-[12px] text-blue-200 font-semibold leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-20 px-6 border-t border-zinc-100">
        <div className="max-w-[660px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">FAQ</p>
            <h2 className="text-[26px] font-black text-blue-950 tracking-tight">Questions fréquentes</h2>
          </div>
          <div className="space-y-2.5">
            <FaqItem q="Puis-je annuler ma réservation ?" a="Oui, l'annulation est entièrement gratuite jusqu'à 2 heures avant. Au-delà, des frais peuvent s'appliquer selon le parking." />
            <FaqItem q="Comment accéder au parking ?" a="Une fois le paiement validé, vous recevez un QR code unique par SMS et email. Présentez-le simplement à l'entrée du parking." />
            <FaqItem q="Quels moyens de paiement sont acceptés ?" a="Wave, Orange Money, Free Money ainsi que les principales cartes bancaires (Visa, Mastercard). Tous les paiements sont sécurisés." />
            <FaqItem q="Que se passe-t-il si ma place n'est pas disponible ?" a="Dans le cas très rare où votre place ne serait pas disponible, vous serez immédiatement remboursé et une alternative vous sera proposée." />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;