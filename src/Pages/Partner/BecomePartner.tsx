import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Loader2, Eye, EyeOff, AlertCircle,
  CheckCircle2, ShieldCheck, Sparkles, Upload, X, ChevronLeft,
 DollarSign, Star, TrendingUp,
  ExternalLink,
} from "lucide-react";

const inp = "w-full py-2.5 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 text-slate-900";
const lbl = "text-[11px] font-semibold text-slate-500 uppercase tracking-wider";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={lbl}>{label}</label>
      {children}
    </div>
  );
}

function CINZone({ label, file, onChange, onRemove }: {
  label: string; file: File | null;
  onChange: (f: File) => void; onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div
      onClick={() => !file && ref.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onChange(f); }}
      className={`relative min-h-[160px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer overflow-hidden transition-all ${file ? 'border-blue-500 bg-blue-50/50' : drag ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30'
        }`}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); }} />

      {preview ? (
        <>
          <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
          <div className="absolute inset-0 bg-blue-700/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
            <CheckCircle2 size={28} className="text-white" strokeWidth={2} />
          </div>
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2.5 right-2.5 w-7 h-7 bg-slate-900/60 rounded-full flex items-center justify-center text-white z-10 hover:bg-red-500 transition-colors">
            <X size={12} strokeWidth={2.5} />
          </button>
        </>
      ) : (
        <>
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
            <Upload size={18} className="text-blue-700" strokeWidth={2} />
          </div>
          <div className="text-center px-4">
            <p className="text-[13px] font-semibold text-slate-700">{label}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Glissez ou cliquez pour importer</p>
          </div>
        </>
      )}
    </div>
  );
}
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

const STATS = [
  { icon: DollarSign, value: '150K+', label: 'FCFA / mois en moyenne', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: Star, value: '4.8★', label: 'Note partenaires', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: TrendingUp, value: '3×', label: 'Plus de visibilité', color: 'text-blue-700', bg: 'bg-blue-50' },
];

const FEATS = [
  { icon: CheckCircle2, color: 'text-blue-700', bg: 'bg-blue-50   border-blue-100', title: 'Inscription gratuite', sub: 'Commission uniquement sur réservations réussies.' },
  { icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100', title: 'Paiements sécurisés', sub: 'Wave & Orange Money chaque semaine.' },
  { icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100', title: 'Support dédié 24/7', sub: 'Équipe locale à votre écoute.' },
];

export function BecomePartner() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [cinRecto, setCinRecto] = useState<File | null>(null);
  const [cinVerso, setCinVerso] = useState<File | null>(null);

  const stored = useMemo(() => { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } }, []);
  const [form, setForm] = useState({
    name: stored.name || "", email: stored.email || "", telephone: stored.telephone || "",
    password: "", password_confirmation: "", nomParking: "", quartier: "",
    capacite: "", description: "", role: 'proprietaireparking', longitude: '', latitude: '',
  });
  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cinRecto || !cinVerso) { setError("Veuillez fournir les deux faces de votre CIN."); return; }
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("rectoCIN", cinRecto);
      fd.append("versoCIN", cinVerso);
      const res = await fetch(
        token
          ? `${(import.meta as any).env.VITE_API_URL}/api/client/become-partner-parking`
          : `${(import.meta as any).env.VITE_API_URL}/api/register`,
        { method: "POST", headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: fd }
      );
      const data = await res.json();
      if (!res.ok) setError(data.message || "Une erreur est survenue.");
      else navigate("/partner");
    } catch { setError("Impossible de contacter le serveur."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── Hero banner ── */}
      <div className="bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-blue-700/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-orange-500/8 blur-3xl" />
          <div className="absolute inset-0 opacity-[.03]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left text */}
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/15 border border-orange-500/30 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-widest">Partenaires actifs à Dakar</span>
              </div>

              <div>
                <h1 className="text-[38px] sm:text-[46px] font-black text-white tracking-tight leading-tight">
                  Publiez votre parking<br />
                  <span className="text-blue-400">gratuitement</span>
                </h1>
                <p className="text-[15px] text-slate-400 leading-relaxed mt-4 max-w-md">
                  Rejoignez des centaines de propriétaires et transformez votre espace en revenus passifs grâce à <span className="text-white font-semibold">SenovaPark</span>.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {STATS.map(({ icon: Icon, value, label, color, bg }) => (
                  <div key={label} className="bg-white/[.07] border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bg}`}>
                      <Icon size={14} className={color} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-[18px] font-black text-white leading-none">{value}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right features */}
            <div className="hidden lg:flex flex-col gap-3">
              {FEATS.map(({ icon: Icon, color, bg, title, sub }) => (
                <div key={title} className="flex items-start gap-4 bg-white/[.05] border border-white/10 rounded-2xl p-4 hover:bg-white/[.08] transition-colors">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon size={16} className={color} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white">{title}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5 leading-relaxed">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Form section ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10 items-start">

          {/* Left — steps info */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-8">
            <div>
              <p className="text-[11px] font-bold text-blue-700 uppercase tracking-widest mb-2">Processus simple</p>
              <h2 className="text-[24px] font-black text-slate-900 tracking-tight">3 étapes pour commencer</h2>
            </div>

            {[
              { num: '01', title: 'Créez votre annonce', sub: 'Renseignez les infos de votre parking : nom, localisation, capacité et tarif.' },
              { num: '02', title: 'Vérification d\'identité', sub: 'Fournissez les deux faces de votre CIN pour sécuriser votre compte.' },
              { num: '03', title: 'Validation & publication', sub: 'Notre équipe valide votre dossier sous 24h. Votre parking est alors visible.' },
            ].map((s, i) => (
              <div key={s.num} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-black shrink-0 ${step > i ? 'bg-blue-700 text-white' : step === i + 1 ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>{s.num}</div>
                  {i < 2 && <div className="w-px flex-1 bg-slate-200 my-2 min-h-[24px]" />}
                </div>
                <div className="pb-5">
                  <p className={`text-[14px] font-bold ${step === i + 1 ? 'text-blue-700' : step > i + 1 ? 'text-slate-400' : 'text-slate-800'}`}>{s.title}</p>
                  <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{s.sub}</p>
                </div>
              </div>
            ))}

            {/* Mobile feats */}
            <div className="lg:hidden flex flex-col gap-2 mt-2">
              {FEATS.map(({ icon: Icon, color, bg, title, sub }) => (
                <div key={title} className={`flex items-start gap-3 p-4 rounded-xl border ${bg}`}>
                  <div className="w-8 h-8 rounded-lg bg-white border border-current/10 flex items-center justify-center shrink-0">
                    <Icon size={14} className={color} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">{title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.06)]">

            {/* Progress */}
            <div className="h-1 w-full bg-slate-100">
              <div className="h-full transition-all duration-500 rounded-full"
                style={{ width: step === 1 ? '50%' : '100%', background: step === 1 ? '#1d4ed8' : '#f97316' }} />
            </div>

            <div className="p-6 sm:p-8">

              {/* Step header */}
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[13px] ${step === 1 ? 'bg-blue-700' : 'bg-orange-500'}`}>
                  {step === 1 ? '01' : '02'}
                </div>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${step === 1 ? 'text-blue-700' : 'text-orange-600'}`}>
                    Étape {step} sur 2
                  </p>
                  <p className="text-[15px] font-bold text-slate-900">
                    {step === 1 ? 'Créer mon annonce' : 'Vérification d\'identité'}
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700 font-medium mb-5">
                  <AlertCircle size={14} className="shrink-0" /> {error}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={e => { e.preventDefault(); setError(null); setStep(2); }} className="flex flex-col gap-5">

                  {!token && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 rounded-full bg-blue-700" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Votre profil</span>
                      </div>
                      <Field label="Nom complet">
                        <input name="name" required placeholder="Matar Faye" value={form.name} onChange={set} className={inp} />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Email">
                          <input name="email" type="email" required placeholder="contact@email.com" value={form.email} onChange={set} className={inp} />
                        </Field>
                        <Field label="Téléphone">
                          <input name="telephone" type="tel" required placeholder="77 000 00 00" value={form.telephone} onChange={set} className={inp} />
                        </Field>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Mot de passe">
                          <div className="relative">
                            <input name="password" type={showPwd ? "text" : "password"} required placeholder="••••••••"
                              value={form.password} onChange={set} className={inp} />
                            <button type="button" onClick={() => setShowPwd(v => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </Field>
                        <Field label="Confirmation">
                          <input name="password_confirmation" type="password" required placeholder="••••••••"
                            value={form.password_confirmation} onChange={set} className={inp} />
                        </Field>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-orange-500" />
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Votre parking</span>
                    </div>
                    <Field label="Nom du parking">
                      <input name="nomParking" required placeholder="Parking Teranga" value={form.nomParking} onChange={set} className={inp} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Quartier / Ville">
                        <input name="quartier" required placeholder="Dakar Plateau" value={form.quartier} onChange={set} className={inp} />
                      </Field>
                      <Field label="Nombre de places">
                        <input name="capacite" type="number" required min="1" placeholder="10" value={form.capacite} onChange={set} className={inp} />
                      </Field>
                      <Field label="Latitude">
                        <input name="latitude" type="number" required placeholder="14.64" value={form.latitude} onChange={set} className={inp} />
                      </Field>
                      <Field label="Longitude">
                        <input name="longitude" type="number" required placeholder="-17.44" value={form.longitude} onChange={set} className={inp} />
                      </Field>
                      <Btn className="h-8 w-full border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100" variant="secondary" onClick={() => window.open(`https://www.google.com/maps?q=${form.quartier}`, '_blank')} icon={<ExternalLink className="size-3.5" />}>
                        Recuperer dans Maps
                      </Btn>
                    </div>
                    <Field label="Description">
                      <textarea name="description" placeholder="Sécurité 24h, vidéosurveillance, accès facile..."
                        value={form.description} onChange={set} rows={3} className={`${inp} resize-none`} />
                    </Field>
                  </div>

                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-[14px] font-bold rounded-xl transition-all active:scale-[0.98] mt-1">
                    Continuer vers la vérification <ArrowRight size={16} />
                  </button>
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    En continuant, vous acceptez les{' '}
                    <a href="/conditions-partenaires" className="text-blue-700 font-semibold hover:underline">Conditions Partenaires</a>.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors w-fit -mt-1">
                    <ChevronLeft size={14} /> Retour à l'étape 1
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <CINZone label="Recto CIN" file={cinRecto} onChange={setCinRecto} onRemove={() => setCinRecto(null)} />
                    <CINZone label="Verso CIN" file={cinVerso} onChange={setCinVerso} onRemove={() => setCinVerso(null)} />
                  </div>

                  {/* CIN tips */}
                  <div className="flex flex-col gap-2.5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Conseils pour la photo</p>
                    {['Photo nette et lisible', 'Les 4 coins visibles', 'Pas de reflet ni de flou'].map(tip => (
                      <div key={tip} className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" strokeWidth={2.5} />
                        <span className="text-[12px] text-slate-600">{tip}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-3 px-4 py-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                    <ShieldCheck size={14} className="text-blue-700 shrink-0 mt-0.5" strokeWidth={2} />
                    <p className="text-[12px] text-blue-800 leading-relaxed">
                      Vos documents sont utilisés uniquement pour la vérification. Ils ne seront jamais partagés.
                    </p>
                  </div>

                  <button type="submit" disabled={loading || !cinRecto || !cinVerso}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-700 hover:bg-blue-800 text-white text-[14px] font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading
                      ? <><Loader2 size={15} className="animate-spin" /> Envoi en cours…</>
                      : <><CheckCircle2 size={15} className="text-orange-400" /> Soumettre ma demande</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BecomePartner;