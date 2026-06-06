import React, { useState, useRef, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle, X, Info, MapPin, Star, Shield, Car, Clock,
  Calendar, User, CreditCard, ChevronRight, CheckCircle2,
  Zap, Repeat2, ArrowLeft, Truck, MessageSquare, AlertTriangle,
} from 'lucide-react';
import ReportModal from './ReportModal';
import { useParkingReservation } from '../hook/useParkingReservation';
import { ScheduleForm } from '../components/reservation/SheduleForm';
import { ConductorForm } from '../components/reservation/ConductorForm';
import { AboutSection } from '../components/reservation/AboutSection';
import { Skeleton } from '../components/reservation/Skeleton';
import { getOptimizedImage } from '../Utils/utils';

const STEPS = ['Détails', 'Conducteur', 'Horaires', 'Paiement'];

const StepBar = memo(({ current = 2 }: { current?: number }) => (
  <div className="flex items-center flex-1 min-w-0">
    {STEPS.map((label, i) => {
      const n = i + 1, done = n < current, active = n === current;
      return (
        <React.Fragment key={n}>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-500' : active ? 'bg-slate-900' : 'bg-slate-200'}`}>
              {done
                ? <CheckCircle2 size={11} color="#fff" strokeWidth={2.5} />
                : <span className={`text-[10px] font-bold ${active ? 'text-white' : 'text-slate-400'}`}>{n}</span>}
            </div>
            <span className={`hidden sm:block text-[11px] font-semibold ${done ? 'text-emerald-600' : active ? 'text-slate-900' : 'text-slate-300'}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
        </React.Fragment>
      );
    })}
  </div>
));

const ModeToggle = memo(({ mode, setMode }: { mode: 'horaire' | 'abonnement'; setMode: (m: 'horaire' | 'abonnement') => void }) => (
  <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
    {([['horaire', Zap, "À l'heure"], ['abonnement', Repeat2, 'Abonnement']] as const).map(([key, Icon, label]) => (
      <button key={key} onClick={() => setMode(key)}
        className={`flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-all ${mode === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
        <Icon size={12} strokeWidth={2} />{label}
      </button>
    ))}
  </div>
));

function Hero({ details, getImage }: { details: any; getImage: any }) {
  const rating = details?.avis_clients?.length
    ? (details.avis_clients.reduce((a: number, c: any) => a + c.note, 0) / details.avis_clients.length).toFixed(1)
    : null;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="relative h-48 sm:h-56 bg-slate-100">
        <img src={getImage(details.imageParking ?? details.image)} alt={details.nomParking}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />
        {details.isVerifie && (
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest">
            <Shield size={9} className="fill-white" /> Vérifié
          </span>
        )}
        {rating && (
          <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-[11px] font-bold text-slate-900">
            <Star size={10} className="text-amber-400 fill-amber-400" />{rating}
            <span className="text-slate-400 font-normal">({details.avis_clients.length})</span>
          </span>
        )}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-4">
          <h1 className="text-xl font-bold text-white leading-tight">{details.nomParking}</h1>
          <p className="flex items-center gap-1 text-[11px] text-white/60 mt-0.5"><MapPin size={10} />{details.adresse ?? details.quartier}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50">
        {[{ I: Car, t: `${details.capacite ?? '—'} places` }, { I: Clock, t: 'Ouvert 24h/24' }, { I: Shield, t: 'Sécurisé' }].map(({ I, t }) => (
          <span key={t} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-500">
            <I size={10} className="text-slate-400" strokeWidth={2} />{t}
          </span>
        ))}
        <div className="flex-1" />
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-bold text-blue-700">{(details.prixHeure ?? 0).toLocaleString()}</span>
          <span className="text-[10px] text-slate-400">FCFA/h</span>
        </div>
      </div>
    </div>
  );
}

const Sec = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 bg-slate-50">
      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
        <Icon size={13} className="text-blue-600" strokeWidth={2} />
      </div>
      <span className="text-[13px] font-bold text-slate-900">{title}</span>
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </div>
);

function Vehicles({ vehicules }: { vehicules: any[] }) {
  if (!vehicules?.length) return null;
  const icons: Record<string, React.ElementType> = { Voiture: Car, Camion: Truck, Moto: Car };
  return (
    <div className="flex flex-wrap gap-2">
      {vehicules.map((v, i) => {
        const Icon = icons[v.libelle] ?? Car;
        return (
          <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-blue-50 transition-colors group">
            <Icon size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" strokeWidth={1.5} />
            <span className="text-[12px] font-semibold text-slate-700">{v.libelle}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewList({ reviews }: { reviews: any[] }) {
  if (!reviews?.length) return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <MessageSquare size={20} className="text-slate-200" />
      <p className="text-[12px] text-slate-400">Aucun avis. Soyez le premier !</p>
    </div>
  );
  return (
    <div className="divide-y divide-slate-100">
      {reviews.map((r, i) => (
        <div key={i} className="flex gap-3 py-4 first:pt-0 last:pb-0">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-[11px] font-bold text-blue-700">
            {r.user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-bold text-slate-900">{r.user?.name || 'Anonyme'}</span>
              <span className="text-[10px] text-slate-400">{r.date}</span>
            </div>
            <div className="flex gap-0.5 mb-1.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star key={idx} size={9} className={idx < r.note ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
              ))}
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">"{r.commentaire}"</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewForm({ onSave }: { onSave: (d: any) => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-2 py-5 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Votre note</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} type="button" onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform active:scale-90 bg-transparent border-none cursor-pointer">
              <Star size={28} className={s <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Partagez votre expérience…"
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none transition-all" />
      <button onClick={() => onSave({ rating, comment: text })} disabled={!rating}
        className={`h-10 rounded-xl text-[13px] font-bold transition-all ${rating ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
        Publier mon avis
      </button>
    </div>
  );
}

function TarifDropdown({ details, open, onClose, anchorRef }: { details: any; open: boolean; onClose: () => void; anchorRef: React.RefObject<HTMLButtonElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, onClose, anchorRef]);
  if (!open) return null;

  const plans = [
    { nom: "À l'heure", sub: "Sans engagement", prix: `${(details.prixHeure ?? 0).toLocaleString()} F`, unit: '/h', popular: false },
    ...(details.plans ?? []).map((p: any, i: number) => ({
      nom: p.nom, sub: 'Accès illimité · 30 jours',
      prix: `${p.prix.toLocaleString()} F`, unit: '/mois', popular: i === 0,
    })),
  ];

  return (
    <div ref={ref} className="absolute top-[calc(100%+8px)] right-0 w-72 bg-white border border-slate-200 rounded-2xl overflow-hidden z-50 shadow-xl shadow-slate-200/60">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <span className="text-[12px] font-bold text-slate-900">Grille tarifaire</span>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"><X size={12} className="text-slate-400" /></button>
      </div>
      {plans.map((p, i) => (
        <div key={i} className={`flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors ${i > 0 ? 'border-t border-slate-100' : ''} ${p.popular ? 'bg-indigo-50/40' : ''}`}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-slate-900">{p.nom}</span>
              {p.popular && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600 uppercase tracking-wide">Populaire</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">{p.sub}</p>
          </div>
          <div className="text-right">
            <p className={`font-mono text-sm font-bold ${p.popular ? 'text-indigo-600' : 'text-slate-900'}`}>{p.prix}</p>
            <p className="text-[9px] text-slate-400">{p.unit}</p>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 border-t border-blue-100">
        <Info size={11} className="text-blue-500 shrink-0" strokeWidth={2} />
        <span className="text-[10px] text-blue-600 font-medium">Tarifs appliqués automatiquement au paiement.</span>
      </div>
    </div>
  );
}

function Summary({ details, dureeH, total, submitting, onPay, isPremium, mode, setMode }: {
  details: any; dureeH: number; total: number; submitting: boolean;
  onPay: () => void; isPremium: boolean; mode: 'horaire' | 'abonnement';
  setMode: (m: 'horaire' | 'abonnement') => void;
}) {
  const prix = details.prixHeure ?? details.prix_base ?? 0;
  const aboPrix = details.plans?.[0]?.prix ?? 0;
  const showTotal = mode === 'abonnement' ? aboPrix : total;
  const lines = mode === 'horaire'
    ? [{ l: 'Tarif horaire', v: `${prix.toLocaleString()} FCFA/h` }, { l: 'Durée', v: `${dureeH}h` }, { l: 'Sous-total', v: `${(prix * dureeH).toLocaleString()} FCFA` },
    ...(isPremium ? [{ l: 'Réduction Premium', v: '−10%', green: true }] : [])]
    : [{ l: 'Abonnement', v: `${aboPrix.toLocaleString()} FCFA` }, { l: 'Durée', v: '30 jours' }, { l: 'Accès', v: 'Illimité 24h/7j' }];

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Type de réservation</p>
        <ModeToggle mode={mode} setMode={setMode} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Récapitulatif</p>
          <p className="text-[12px] text-slate-500 mt-0.5 truncate">{details.nomParking}</p>
        </div>
        <div className="px-4 py-4 flex flex-col gap-2.5">
          {lines.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[12px] text-slate-400">{item.l}</span>
              <span className={`font-mono text-[12px] font-semibold ${'green' in item && item.green ? 'text-emerald-600' : 'text-slate-700'}`}>{item.v}</span>
            </div>
          ))}
        </div>

        <div className="mx-3 mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <span className="text-[13px] font-bold text-slate-900">Total</span>
          <div className="text-right">
            <p className="font-mono text-2xl font-bold text-slate-900 leading-none">{showTotal?.toLocaleString()}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">FCFA</p>
          </div>
        </div>

        <div className="px-3 pb-4">
          <button onClick={onPay} disabled={submitting}
            className={`w-full h-12 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed ${submitting ? 'bg-slate-200 text-slate-400' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200'}`}>
            {submitting
              ? <><div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-500 animate-spin" />Traitement…</>
              : <><CreditCard size={15} />{mode === 'abonnement' ? "Souscrire l'abonnement" : 'Confirmer et payer'}<ChevronRight size={13} /></>}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
        {[{ I: Shield, t: 'Paiement 100% sécurisé' }, { I: CheckCircle2, t: 'Confirmation instantanée' }, { I: Repeat2, t: 'Annulation gratuite sous 24h' }].map(({ I, t }) => (
          <div key={t} className="flex items-center gap-2">
            <I size={12} className="text-emerald-600 shrink-0" strokeWidth={2} />
            <span className="text-[11px] font-semibold text-emerald-700">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Reservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'horaire' | 'abonnement'>('horaire');
  const [tarifOpen, setTarif] = useState(false);
  const tarifRef = useRef<HTMLButtonElement>(null);
  const { details, apiStatus, apiError, isPremium, setApiError, dureeH, total, datesInvalid, updateField, submitting, pay, submitReview } = useParkingReservation(id);
  const [showReport, setShowReport] = useState(false);

  if (apiStatus === 'loading') return <Skeleton />;
  if (apiStatus === 'error' || !details) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">
      <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center">
        <AlertCircle size={24} className="text-red-500" strokeWidth={1.5} />
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-slate-900">{apiError ?? 'Parking introuvable'}</p>
        <p className="text-[13px] text-slate-400 mt-1">Vérifiez l'URL ou retournez à la liste.</p>
      </div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 h-10 px-5 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-700 transition-colors">
        <ArrowLeft size={13} /> Retour
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-13 py-2.5 flex items-center gap-3">
          <div className="relative shrink-0 ml-auto">
            <button ref={tarifRef} onClick={() => setTarif(v => !v)}
              className={`flex items-center gap-1.5 h-7 px-3 rounded-lg border text-[11px] font-bold transition-all ${tarifOpen ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'}`}>
              <CreditCard size={11} /><span className="hidden xs:inline">Tarifs</span>
              <ChevronRight size={10} className={`transition-transform ${tarifOpen ? 'rotate-90' : ''}`} />
            </button>
            <TarifDropdown details={details} open={tarifOpen} onClose={() => setTarif(false)} anchorRef={tarifRef} />
          </div>
        </div>
      </header>

      {apiError && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-3">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-[12px] font-semibold text-red-700">
            <AlertCircle size={13} strokeWidth={2.5} className="shrink-0" />
            <span className="flex-1">{apiError}</span>
            <button onClick={() => setApiError(null)} className="bg-transparent border-none cursor-pointer"><X size={12} /></button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-5 mb-24 grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="flex flex-col gap-4">
          <Hero details={details} getImage={getOptimizedImage} />

          <Sec title="Véhicules acceptés" icon={Car}>
            <Vehicles vehicules={details.vehicules} />
            <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 leading-relaxed">
              <Info size={10} className="shrink-0" />Vérifiez que votre véhicule correspond aux types acceptés avant de réserver.
            </p>
          </Sec>

          <Sec title="Informations conducteur" icon={User}>
            <ConductorForm details={details} updateField={updateField} />
          </Sec>

          <Sec title="Horaires de stationnement" icon={Calendar}>
            {mode === 'horaire'
              ? <ScheduleForm details={details} updateField={updateField} dureeH={dureeH} datesInvalid={datesInvalid} />
              : (
                <div className="flex gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                    <Repeat2 size={16} className="text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-indigo-900">Forfait mensuel illimité</p>
                    <p className="text-[12px] text-indigo-700 mt-0.5 leading-relaxed">
                      Accès libre 24h/24 à <strong>{details.nomParking}</strong>. Stationnement illimité pendant 30 jours.
                    </p>
                  </div>
                </div>
              )}
          </Sec>

          <Sec title="À propos" icon={Info}>
            <AboutSection details={details} />
          </Sec>

          <Sec title="Laisser un avis" icon={Star}>
            <ReviewForm onSave={async d => {
              const r = await submitReview(d.rating, d.comment);
              if (r?.success) alert('Merci pour votre avis !');
            }} />
          </Sec>

          <Sec title={`Avis clients (${details.avis_clients?.length || 0})`} icon={MessageSquare}>
            <ReviewList reviews={details.avis_clients || []} />
          </Sec>

          <div className="pt-4 border-t border-slate-200">
            <button onClick={() => setShowReport(true)}
              className="flex items-center gap-2 text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider">
              <AlertTriangle size={13} strokeWidth={2.5} />
              Signaler une erreur ou un problème
            </button>
          </div>
        </div>

        <div className="w-full lg:sticky lg:top-16">
          <Summary details={details} dureeH={dureeH} total={total} submitting={submitting}
            onPay={() => pay(mode)} isPremium={isPremium} mode={mode} setMode={setMode} />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-slate-200 px-4 py-3 flex items-center gap-3">
        <div>
          <p className="font-mono text-lg font-bold text-slate-900 leading-none">
            {(mode === 'abonnement' ? details.plans?.[0]?.prix : total)?.toLocaleString()} <span className="text-[11px] font-normal text-slate-400">FCFA</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">{mode === 'horaire' ? `${dureeH}h de stationnement` : 'Forfait mensuel'}</p>
        </div>
        <button onClick={() => pay(mode)} disabled={submitting}
          className="flex-1 h-12 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-50 bg-orange-500 text-white shadow-lg shadow-orange-200 hover:bg-orange-600">
          {submitting
            ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            : <><CreditCard size={15} />Réserver</>}
        </button>
      </div>

      {showReport && (
        <ReportModal parkingId={details.parkingId} parkingName={details.nomParking} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

export default Reservation;