import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Save, Trash2, Edit3,
  MapPin, Camera, AlertCircle, Loader2,
  Zap, ShieldCheck, Sparkles, Layers, DollarSign,
  Navigation, Plus, TrendingUp, Clock, Car,
  ArrowUpRight, ExternalLink, Check, X,
} from 'lucide-react';

const API = `${(import.meta as any).env.VITE_API_URL}/api`;
const STORAGE = `${(import.meta as any).env.VITE_API_URL}/storage`;
const ease = [0.23, 1, 0.32, 1] as const;
const mono = "'JetBrains Mono', 'IBM Plex Mono', monospace";
const INP = 'h-9 rounded-md border border-slate-200 px-2.5 text-[13px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const INP_SM = 'h-9 rounded-md border border-slate-200 px-2 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const FIELD =
  'w-full rounded-md border border-slate-200 px-2.5 text-[13px] font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400';
const BTN_ADD =
  'inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-500';
const SKEL_BAR = 'animate-pulse rounded-md bg-slate-200';

interface Plan {
  id: number;
  nom: string;
  prix: number;
  duree_jours: number;
  is_active: boolean;
}
interface Service {
  id: number;
  nom: string;
  prix: number;
  description: string;
}
interface Parking {
  id: number;
  nom: string;
  departement: string;
  quartier: string;
  description: string;
  capacite: number;
  prix_base: number;
  image: string;
  latitude: string;
  longitude: string;
  statut: string;
  ca_mensuel: number;
  plans: Plan[];
  services: Service[];
}

const authHeaders = (): HeadersInit => ({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
const newPlan = (): Plan => ({ id: Date.now(), nom: 'Nouveau plan', prix: 0, duree_jours: 30, is_active: true });
const newService = (): Service => ({ id: Date.now(), nom: 'Nouveau service', prix: 0, description: '' });

function Btn({
  children, onClick, variant = 'secondary', size = 'md', icon, loading, disabled, className = '',
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition-colors disabled:opacity-55 disabled:pointer-events-none';
  const sz = size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-[13px]';
  const v =
    variant === 'primary'
      ? 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600'
      : variant === 'ghost'
        ? 'border border-transparent text-slate-500 hover:bg-slate-100'
        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50';
  return (
    <button type="button" className={`${base} ${sz} ${v} ${className}`} onClick={onClick} disabled={disabled || loading}>
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : icon}
      {children}
    </button>
  );
}

function StatusDot({ approved }: { approved: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        approved ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
      }`}
    >
      <span className={`size-1 rounded-full ${approved ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}`} />
      {approved ? 'Vérifié' : 'En attente'}
    </span>
  );
}

function Section({
  icon: Icon, title, accent = 'text-blue-600', ring = 'ring-blue-100', bg = 'bg-blue-50', action, noPad, children,
}: {
  icon: React.ElementType;
  title: string;
  accent?: string;
  ring?: string;
  bg?: string;
  action?: React.ReactNode;
  noPad?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`flex size-7 items-center justify-center rounded-lg ${bg} ring-1 ${ring}`}>
            <Icon className={`size-3.5 ${accent}`} strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-bold text-slate-900">{title}</span>
        </div>
        {action}
      </div>
      <div className={noPad ? '' : 'p-4'}>{children}</div>
    </div>
  );
}

function PlanCard({ plan, editMode, onUpdate, onRemove }: {
  plan: Plan;
  editMode: boolean;
  onUpdate: (f: keyof Plan, v: string | number | boolean) => void;
  onRemove: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md">
      <div className={`h-0.5 ${plan.is_active ? 'bg-blue-600' : 'bg-slate-200'}`} />
      <div className="p-3">
        {editMode ? (
          <div className="flex flex-col gap-2">
            <input className={`${INP} w-full`} value={plan.nom} onChange={e => onUpdate('nom', e.target.value)} placeholder="Nom du plan" />
            <div className="flex gap-2">
              <input className={`${INP} max-w-[120px]`} type="number" value={plan.prix} onChange={e => onUpdate('prix', parseInt(e.target.value, 10) || 0)} />
              <input className={`${INP} w-16`} type="number" value={plan.duree_jours} onChange={e => onUpdate('duree_jours', parseInt(e.target.value, 10) || 0)} />
            </div>
            <button type="button" onClick={onRemove} className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:underline">
              <Trash2 className="size-3" /> Supprimer
            </button>
          </div>
        ) : (
          <>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{plan.nom}</div>
            <div className="text-xl font-extrabold text-slate-900" style={{ fontFamily: mono }}>
              {plan.prix.toLocaleString()} <span className="text-[10px] font-semibold text-slate-400">FCFA</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">{plan.duree_jours} jours</div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                  plan.is_active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                }`}
              >
                <span className={`size-1 rounded-full ${plan.is_active ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                {plan.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ServiceRow({ service, editMode, onUpdate, onRemove }: {
  service: Service;
  editMode: boolean;
  onUpdate: (f: keyof Service, v: string | number) => void;
  onRemove: () => void;
}) {
  return (
    <div className={`grid items-center gap-3 px-3 py-2 hover:bg-slate-50 ${editMode ? 'grid-cols-[1fr_88px_32px]' : 'grid-cols-[1fr_auto]'}`}>
      {editMode ? (
        <>
          <input className={INP_SM} value={service.nom} onChange={e => onUpdate('nom', e.target.value)} />
          <input className={`${INP_SM} font-mono text-xs`} type="number" value={service.prix} onChange={e => onUpdate('prix', parseInt(e.target.value, 10) || 0)} />
          <button type="button" onClick={onRemove} className="flex size-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600">
            <Trash2 className="size-3.5" />
          </button>
        </>
      ) : (
        <>
          <div>
            <div className="text-[13px] font-medium text-slate-900">{service.nom}</div>
            {service.description ? <div className="mt-0.5 text-[11px] text-slate-500">{service.description}</div> : null}
          </div>
          <span className="whitespace-nowrap text-xs font-bold text-emerald-600" style={{ fontFamily: mono }}>
            +{service.prix.toLocaleString()} F
          </span>
        </>
      )}
    </div>
  );
}

function SparkLine() {
  const pts = [28, 42, 35, 58, 47, 72, 61, 88, 74, 95], w = 200, h = 38, max = Math.max(...pts);
  const coords = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} fill="none" preserveAspectRatio="none" className="block">
      <defs>
        <linearGradient id="ps-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${coords} ${w},${h}`} fill="url(#ps-spark-fill)" />
      <polyline points={coords} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-5xl pb-20">
      <div className="mb-6 flex gap-3">
        <div className={`${SKEL_BAR} size-8`} />
        <div className="flex-1 space-y-2">
          <div className={`${SKEL_BAR} h-5 w-48`} />
          <div className={`${SKEL_BAR} h-3 w-32`} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className={`${SKEL_BAR} h-64`} />
          <div className={`${SKEL_BAR} h-40`} />
        </div>
        <div className={`${SKEL_BAR} h-48`} />
      </div>
    </div>
  );
}

export function ParkingShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [parking, setParking] = useState<Parking | null>(null);
  const [origImg, setOrigImg] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const load = useCallback(async () => {
  setLoading(true);
  try {
    const res = await fetch(`${API}/partenaire/parkings/${id}`, { headers: authHeaders() });
    const responseJson = await res.json(); // Renommé pour éviter la confusion

    // On vérifie que la requête a réussi ET que la clé 'data' existe bien
    if (res.ok && responseJson && responseJson.data) {
      const parkingObj = responseJson.data;

      // Gestion de l'image sur le vrai objet parking
      const img = parkingObj.image?.startsWith('http') 
        ? parkingObj.image 
        : `${STORAGE}/${parkingObj.image}`;
      
      // On met à jour le state avec le bon objet
      setParking({ ...parkingObj, image: img });
      setOrigImg(img);
    } else {
      setParking(null);
    }
  } catch (error) {
    console.error("Erreur de chargement du parking :", error);
    setParking(null);
  } finally {
    setLoading(false);
  }
}, [id]);

useEffect(() => {
  void load();
}, [load]);

  const handleUpdate = async () => {
    if (!parking || !id) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('nom', parking.nom);
      formData.append('description', parking.description);
      formData.append('prix_base', String(parking.prix_base));
      formData.append('capacite', String(parking.capacite));
      formData.append('plans', JSON.stringify(parking.plans ?? []));
      formData.append('services', JSON.stringify(parking.services ?? []));
      if (imageFile) formData.append('image', imageFile);
      const res = await fetch(`${API}/partenaire/parkings/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`, Accept: 'application/json' },
        body: formData,
      });
      if (res.ok) {
        setEditMode(false);
        setImageFile(null);
        void load();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !parking) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setParking({ ...parking, image: (ev.target?.result as string) ?? parking.image });
    reader.readAsDataURL(file);
  };

  const cancelEdit = () => {
    if (parking) setParking({ ...parking, image: origImg });
    setImageFile(null);
    setEditMode(false);
  };

  const pushPlan = () => setParking(p => (p ? { ...p, plans: [...(p.plans ?? []), newPlan()] } : p));
  const pushService = () => setParking(p => (p ? { ...p, services: [...(p.services ?? []), newService()] } : p));
  const updatePlan = (i: number, f: keyof Plan, v: string | number | boolean) =>
    setParking(p => (!p ? p : { ...p, plans: p.plans.map((pl, j) => (j === i ? { ...pl, [f]: v } : pl)) }));
  const updateService = (i: number, f: keyof Service, v: string | number) =>
    setParking(p => (!p ? p : { ...p, services: p.services.map((s, j) => (j === i ? { ...s, [f]: v } : s)) }));
  const removePlan = (idx: number) => setParking(p => (p ? { ...p, plans: p.plans.filter((_, j) => j !== idx) } : p));
  const removeService = (idx: number) => setParking(p => (p ? { ...p, services: p.services.filter((_, j) => j !== idx) } : p));

  if (loading) {
    return (
      <div className="p-2 font-sans text-slate-900">
        <PageSkeleton />
      </div>
    );
  }

  if (!parking) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-red-200 bg-red-50">
          <AlertCircle className="size-6 text-red-600" />
        </div>
        <h2 className="mb-2 text-base font-bold text-slate-900">Parking introuvable</h2>
        <p className="mb-6 text-sm text-slate-500">Cet espace n&apos;existe pas ou a été supprimé.</p>
        <Btn variant="primary" onClick={() => navigate('/partner/parking-lots')} icon={<ChevronLeft className="size-3.5" />}>
          Retour à la liste
        </Btn>
      </div>
    );
  }

  const approved = parking.statut === 'valide';
  const planAction = editMode ? (
    <button type="button" onClick={pushPlan} className={`${BTN_ADD} hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700`}>
      <Plus className="size-3" /> Ajouter un plan
    </button>
  ) : undefined;
  const serviceAction = editMode ? (
    <button type="button" onClick={pushService} className={`${BTN_ADD} hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700`}>
      <Plus className="size-3" /> Ajouter
    </button>
  ) : undefined;
  return (
    <div className="mx-auto max-w-5xl p-2 pb-24 font-sans text-slate-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Btn className="size-8 p-0" variant="secondary" size="sm" onClick={() => navigate('/partner/parking-lots')} icon={<ChevronLeft className="size-3.5" />} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900">{parking.nom}</h1>
              <StatusDot approved={approved} />
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="size-3 text-slate-400" />
              {parking.quartier}, {parking.departement}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!editMode ? (
            <Btn variant="secondary" onClick={() => setEditMode(true)} icon={<Edit3 className="size-3.5" />}>Modifier</Btn>
          ) : (
            <>
              <Btn variant="secondary" onClick={cancelEdit} icon={<X className="size-3.5" />}>Annuler</Btn>
              <Btn variant="primary" onClick={handleUpdate} loading={saving} icon={<Save className="size-3.5" />}>
                {saving ? 'Enregistrement…' : 'Sauvegarder'}
              </Btn>
            </>
          )}
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[1fr_288px] lg:items-start">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease }} className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-[268px] overflow-hidden bg-slate-100">
              <img src={parking.image} alt={parking.nom} className="size-full object-cover transition duration-500 hover:scale-[1.02]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />
              <div className="absolute left-3 top-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-md backdrop-blur-sm ${
                    approved ? 'bg-emerald-600/90' : 'bg-amber-600/90'
                  }`}
                >
                  {approved ? <ShieldCheck className="size-3" /> : <span className="size-1 animate-pulse rounded-full bg-white" />}
                  {approved ? 'Vérifié' : 'En attente'}
                </span>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-4 pt-12">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <div className="text-lg font-extrabold text-white drop-shadow-sm">{parking.nom}</div>
                    <div className="text-xs text-white/70">{parking.quartier}, {parking.departement}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-white" style={{ fontFamily: mono }}>{parking.prix_base}</div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-white/50">FCFA / h</div>
                  </div>
                </div>
              </div>
              {editMode ? (
                <button type="button" className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 backdrop-blur-sm transition hover:bg-black/45" onClick={() => fileRef.current?.click()}>
                  <span className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold shadow-lg">
                    <Camera className="size-4" /> Changer l&apos;image
                  </span>
                  <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </button>
              ) : null}
            </div>
          </div>

          <Section icon={Layers} title="Configuration">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-semibold text-slate-400">Nom du parking</label>
                <input className={FIELD} disabled={!editMode} value={parking.nom} onChange={e => setParking({ ...parking, nom: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-semibold text-slate-400">Description</label>
                <textarea className={`${FIELD} min-h-[88px] resize-y py-2`} disabled={!editMode} rows={3} value={parking.description} onChange={e => setParking({ ...parking, description: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-400">Capacité (places)</label>
                <input className={`${FIELD} font-mono text-xs`} type="number" disabled={!editMode} value={parking.capacite} onChange={e => setParking({ ...parking, capacite: parseInt(e.target.value, 10) || 0 })} />
              </div>
            </div>
          </Section>

          <Section icon={Zap} title="Plans d'abonnement" accent="text-orange-600" bg="bg-orange-50" ring="ring-orange-100" action={planAction}>
            {(parking.plans?.length ?? 0) > 0 ? (
              <div className="grid gap-2 sm:grid-cols-[repeat(auto-fill,minmax(148px,1fr))]">
                {parking.plans.map((plan, idx) => (
                  <PlanCard key={plan.id} plan={plan} editMode={editMode} onUpdate={(f, v) => updatePlan(idx, f, v)} onRemove={() => removePlan(idx)} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                Aucun plan configuré.
                {editMode ? (
                  <div className="mt-3">
                    <button type="button" onClick={pushPlan} className="text-xs font-bold text-blue-600 hover:underline">Créer le premier plan</button>
                  </div>
                ) : null}
              </div>
            )}
          </Section>

          <Section icon={Sparkles} title="Services additionnels" accent="text-emerald-600" bg="bg-emerald-50" ring="ring-emerald-100" noPad action={serviceAction}>
            {(parking.services?.length ?? 0) > 0 ? (
              <>
                <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Service</span>
                  <span className="text-right">Prix</span>
                </div>
                <div className="py-1">
                  {parking.services.map((sv, idx) => (
                    <ServiceRow key={sv.id} service={sv} editMode={editMode} onUpdate={(f, v) => updateService(idx, f, v)} onRemove={() => removeService(idx)} />
                  ))}
                </div>
              </>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-slate-500">
                Aucun service optionnel.
                {editMode ? (
                  <div className="mt-3">
                    <button type="button" onClick={pushService} className="text-xs font-bold text-emerald-600 hover:underline">Ajouter un service</button>
                  </div>
                ) : null}
              </div>
            )}
          </Section>
        </motion.div>

        <motion.aside initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.35, ease }} className="flex flex-col gap-3 lg:sticky lg:top-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Statut de publication</div>
            <div className={`flex gap-3 rounded-lg border p-3 ${approved ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${approved ? 'bg-emerald-600' : 'bg-amber-500'}`}>
                {approved ? <Check className="size-4 text-white" strokeWidth={2.5} /> : <Clock className="size-4 text-white" />}
              </div>
              <div>
                <div className={`text-[13px] font-bold ${approved ? 'text-emerald-800' : 'text-amber-900'}`}>
                  {approved ? 'Vérifié & publié' : 'En attente de validation'}
                </div>
                <div className={`mt-0.5 text-[11px] ${approved ? 'text-emerald-700/80' : 'text-amber-800/80'}`}>
                  {approved ? 'Visible par les clients' : 'Délai estimé : 24–48h'}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              {approved ? 'Votre espace est en ligne et accepte les réservations.' : 'Notre équipe examine votre dossier. Un email vous sera envoyé dès validation.'}
            </p>
          </div>

  

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Capacité', value: parking.capacite, unit: 'places', Icon: Car, c: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Tarif base', value: parking.prix_base, unit: 'FCFA / h', Icon: DollarSign, c: 'text-orange-600', bg: 'bg-orange-50' },
            ].map(({ label, value, unit, Icon, c, bg }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                <div className={`mb-2 flex size-7 items-center justify-center rounded-md ${bg}`}>
                  <Icon className={`size-3.5 ${c}`} strokeWidth={2.5} />
                </div>
                <div className="text-xl font-extrabold text-slate-900" style={{ fontFamily: mono }}>{value}</div>
                <div className="mt-1 text-[11px] font-semibold text-slate-500">{label}</div>
                <div className="text-[10px] text-slate-400">{unit}</div>
              </div>
            ))}
          </div>

          <Section icon={Navigation} title="Localisation GPS" accent="text-violet-600" bg="bg-violet-50" ring="ring-violet-100">
            {parking.latitude && parking.longitude ? (
              <>
                <div className="mb-3 flex gap-2">
                  {[{ l: 'Latitude', v: parking.latitude }, { l: 'Longitude', v: parking.longitude }].map(({ l, v }) => (
                    <div key={l} className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-2">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{l}</div>
                      <div className="truncate text-[11px] font-semibold text-slate-800" style={{ fontFamily: mono }}>{v}</div>
                    </div>
                  ))}
                </div>
                <Btn className="h-8 w-full border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100" variant="secondary" onClick={() => window.open(`https://www.google.com/maps?q=${parking.latitude},${parking.longitude}`, '_blank')} icon={<ExternalLink className="size-3.5" />}>
                  Ouvrir dans Maps
                </Btn>
              </>
            ) : (
              <p className="py-4 text-center text-xs text-slate-500">Coordonnées non définies.</p>
            )}
          </Section>
        </motion.aside>
      </div>

      {editMode ? (
        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-5 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
            Modifications non sauvegardées
          </div>
          <div className="flex gap-2">
            <Btn size="sm" variant="secondary" onClick={cancelEdit}>Annuler</Btn>
            <Btn size="sm" variant="primary" onClick={handleUpdate} loading={saving} icon={<Save className="size-3" />}>{saving ? '…' : 'Sauvegarder'}</Btn>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
export default ParkingShow;
