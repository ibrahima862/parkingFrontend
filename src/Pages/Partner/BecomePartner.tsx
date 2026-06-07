import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Loader2, Eye, EyeOff, AlertCircle,
  CheckCircle2, ShieldCheck, Upload, X, ChevronLeft, ExternalLink,
  MapPin, Car, User, Lock, Building2, FileText,
} from "lucide-react";

/* ─── Base input style ───────────────────────────────────────────────── */
const inp =
  "w-full py-3 px-4 text-[14px] bg-white border border-slate-200 rounded-xl " +
  "focus:outline-none focus:border-slate-800 focus:ring-4 focus:ring-slate-100 " +
  "transition-all placeholder:text-slate-300 text-slate-800 font-light";

/* ─── Label ─────────────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.1em]">
      {children}
    </span>
  );
}

/* ─── Field ─────────────────────────────────────────────────────────── */
function Field({ label, children, icon }: { label: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-300">{icon}</span>}
        <Label>{label}</Label>
      </div>
      {children}
    </div>
  );
}

/* ─── Section heading ────────────────────────────────────────────────── */
function SectionHead({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
      <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
        <span className="text-white">{icon}</span>
      </div>
      <div>
        <p className="text-[15px] font-semibold text-slate-900">{title}</p>
        {subtitle && <p className="text-[13px] text-slate-400 mt-0.5 font-light">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ─── CIN Upload zone ────────────────────────────────────────────────── */
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
      onDrop={e => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files[0]; if (f) onChange(f);
      }}
      className={`relative h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3
        cursor-pointer overflow-hidden transition-all duration-200
        ${file
          ? "border-slate-800 bg-slate-50"
          : drag
            ? "border-slate-500 bg-slate-50 scale-[1.01]"
            : "border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50"
        }`}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); }} />

      {preview ? (
        <>
          <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-white" />
            <span className="text-[12px] font-medium text-white">Photo ajoutée</span>
          </div>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center
              justify-center text-slate-700 z-10 hover:bg-red-500 hover:text-white
              transition-all shadow-lg"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </>
      ) : (
        <>
          <div className="w-11 h-11 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50">
            <Upload size={16} className="text-slate-400" strokeWidth={1.5} />
          </div>
          <div className="text-center px-6">
            <p className="text-[13px] font-semibold text-slate-700">{label}</p>
            <p className="text-[11px] text-slate-400 mt-1 font-light">Glissez ou cliquez pour télécharger</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Step indicator (sidebar) ───────────────────────────────────────── */
function StepItem({ n, label, active, done }: { n: string; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 ${active ? "bg-slate-900" : "bg-transparent"}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 transition-all
        ${done ? "bg-emerald-500 text-white" : active ? "bg-white text-slate-900" : "bg-slate-100 text-slate-400"}`}>
        {done ? <CheckCircle2 size={14} strokeWidth={2.5} /> : n}
      </div>
      <span className={`text-[13px] font-medium transition-colors ${active ? "text-white" : done ? "text-slate-600" : "text-slate-400"}`}>
        {label}
      </span>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────── */
export function BecomePartner() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [cinRecto, setCinRecto] = useState<File | null>(null);
  const [cinVerso, setCinVerso] = useState<File | null>(null);

  const stored = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
  }, []);

  const [form, setForm] = useState({
    name: stored.name || "", email: stored.email || "", telephone: stored.telephone || "",
    password: "", password_confirmation: "", nomParking: "", quartier: "",
    capacite: "", description: "", role: "proprietaireparking", longitude: "", latitude: "",
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
    <div className="min-h-screen bg-[#F7F7F8] font-sans">

      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
              <Car size={15} className="text-white" strokeWidth={1.8} />
            </div>
            <span className="text-[15px] font-bold text-slate-900 tracking-tight">
              Senova<span className="text-slate-400 font-light">Park</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
            <ShieldCheck size={12} strokeWidth={1.5} />
            Espace partenaires sécurisé
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-12">

        {/* ── Hero strip ── */}
        <div className="bg-slate-900 rounded-3xl px-10 py-10 mb-10 flex items-center justify-between overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-full opacity-5"
            style={{
              background: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)",
              backgroundSize: "20px 20px",
            }}
          />
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-3">
              Programme Partenaires — Dakar
            </p>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-snug">
              Publiez votre parking<br />
              <span className="text-slate-400 font-light">et générez des revenus.</span>
            </h1>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-3 shrink-0">
            {[
              { value: "100%", label: "Gratuit" },
              { value: "24h", label: "Validation" },
              { value: "0%", label: "Commission" },
              { value: "24/7", label: "Support" },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <p className="text-[18px] font-bold text-white">{s.value}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">

          {/* ── Sidebar ── */}
          <div className="lg:sticky lg:top-[88px] flex flex-col gap-1 bg-white border border-slate-100 rounded-3xl p-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.1em] px-4 pt-2 pb-3">
              Progression
            </p>
            <StepItem n="01" label="Votre annonce" active={step === 1} done={step > 1} />
            <StepItem n="02" label="Vérification d'identité" active={step === 2} done={false} />
            <StepItem n="03" label="Publication" active={false} done={false} />

            {/* Progress */}
            <div className="px-4 pt-4 pb-2 mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-400">Complété</span>
                <span className="text-[11px] font-semibold text-slate-700">{step === 1 ? "33" : "66"}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 rounded-full transition-all duration-700 ease-out"
                  style={{ width: step === 1 ? "33%" : "66%" }}
                />
              </div>
            </div>

            {/* Trust */}
            <div className="mt-4 mx-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
              {[
                { icon: CheckCircle2, text: "Inscription 100% gratuite" },
                { icon: ShieldCheck, text: "Données sécurisées" },
                { icon: Car, text: "Mise en ligne sous 24h" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <Icon size={13} className="text-slate-400 shrink-0" strokeWidth={1.5} />
                  <span className="text-[12px] text-slate-500 font-light">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Form card ── */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">

            {/* Card header */}
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[18px] font-bold text-slate-900">
                  {step === 1 ? "Informations du parking" : "Vérification d'identité"}
                </p>
                <p className="text-[13px] text-slate-400 mt-0.5 font-light">
                  {step === 1
                    ? "Décrivez votre espace de stationnement"
                    : "Téléchargez votre carte d'identité nationale"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                {step === 1 ? <Building2 size={18} strokeWidth={1.5} /> : <FileText size={18} strokeWidth={1.5} />}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-10 mt-8 flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-600 font-light">
                <AlertCircle size={15} className="shrink-0 text-red-400" />
                {error}
              </div>
            )}

            <div className="px-10 py-9">

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <form onSubmit={e => { e.preventDefault(); setError(null); setStep(2); }}
                  className="flex flex-col gap-9">

                  {!token && (
                    <div className="flex flex-col gap-6">
                      <SectionHead
                        icon={<User size={16} strokeWidth={1.5} />}
                        title="Informations personnelles"
                        subtitle="Ces informations servent à créer votre compte partenaire"
                      />
                      <Field label="Nom complet" icon={<User size={12} />}>
                        <input name="name" required placeholder="Matar Faye"
                          value={form.name} onChange={set} className={inp} />
                      </Field>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Adresse email">
                          <input name="email" type="email" required
                            placeholder="contact@email.com" value={form.email}
                            onChange={set} className={inp} />
                        </Field>
                        <Field label="Téléphone">
                          <input name="telephone" type="tel" required
                            placeholder="77 000 00 00" value={form.telephone}
                            onChange={set} className={inp} />
                        </Field>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Mot de passe" icon={<Lock size={12} />}>
                          <div className="relative">
                            <input name="password" type={showPwd ? "text" : "password"}
                              required placeholder="••••••••" value={form.password}
                              onChange={set} className={inp} />
                            <button type="button" onClick={() => setShowPwd(v => !v)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </Field>
                        <Field label="Confirmation">
                          <input name="password_confirmation" type="password" required
                            placeholder="••••••••" value={form.password_confirmation}
                            onChange={set} className={inp} />
                        </Field>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-6">
                    <SectionHead
                      icon={<Car size={16} strokeWidth={1.5} />}
                      title="Votre parking"
                      subtitle="Renseignez les caractéristiques de votre espace"
                    />

                    <Field label="Nom du parking">
                      <input name="nomParking" required placeholder="ex. Parking Teranga"
                        value={form.nomParking} onChange={set} className={inp} />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Quartier / Ville" icon={<MapPin size={12} />}>
                        <input name="quartier" required placeholder="Dakar Plateau"
                          value={form.quartier} onChange={set} className={inp} />
                      </Field>
                      <Field label="Nombre de places">
                        <input name="capacite" type="number" required min="1"
                          placeholder="10" value={form.capacite} onChange={set}
                          className={inp} />
                      </Field>
                    </div>

                    {/* Coordinates */}
                    <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin size={13} className="text-slate-400" strokeWidth={1.5} />
                          <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-[0.1em]">
                            Coordonnées GPS
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => window.open(`https://www.google.com/maps?q=${form.quartier}`, "_blank")}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500
                            hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg
                            transition-all hover:border-slate-400"
                        >
                          <ExternalLink size={10} strokeWidth={2} />
                          Ouvrir Google Maps
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Latitude">
                          <input name="latitude" type="number" required
                            placeholder="14.6937" value={form.latitude}
                            onChange={set} className={inp} />
                        </Field>
                        <Field label="Longitude">
                          <input name="longitude" type="number" required
                            placeholder="-17.4441" value={form.longitude}
                            onChange={set} className={inp} />
                        </Field>
                      </div>
                    </div>

                    <Field label="Description">
                      <textarea name="description" rows={3}
                        placeholder="Sécurité 24h, vidéosurveillance, accès facile, gardien sur place…"
                        value={form.description} onChange={set}
                        className={`${inp} resize-none`} />
                    </Field>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col gap-4 pt-2">
                    <button type="submit"
                      className="w-full flex items-center justify-center gap-2.5 py-4
                        bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-[14px]
                        font-semibold rounded-2xl transition-all tracking-wide">
                      Continuer vers la vérification
                      <ArrowRight size={15} strokeWidth={2.5} />
                    </button>
                    <p className="text-[11px] text-slate-400 text-center font-light">
                      En continuant, vous acceptez les{" "}
                      <a href="/conditions-partenaires" className="text-slate-700 underline underline-offset-2 hover:text-slate-900">
                        Conditions Partenaires
                      </a>.
                    </p>
                  </div>
                </form>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                  <button type="button" onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-400
                      hover:text-slate-900 transition-colors w-fit -mt-1">
                    <ChevronLeft size={14} strokeWidth={2} /> Retour à l'annonce
                  </button>

                  {/* CIN upload */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-slate-900 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white">R</span>
                        </div>
                        <Label>Face avant (Recto)</Label>
                      </div>
                      <CINZone label="Photo recto de votre CIN" file={cinRecto}
                        onChange={setCinRecto} onRemove={() => setCinRecto(null)} />
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-slate-600 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white">V</span>
                        </div>
                        <Label>Face arrière (Verso)</Label>
                      </div>
                      <CINZone label="Photo verso de votre CIN" file={cinVerso}
                        onChange={setCinVerso} onRemove={() => setCinVerso(null)} />
                    </div>
                  </div>

                  {/* Photo tips */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { emoji: "🔍", text: "Photo nette et lisible" },
                      { emoji: "📐", text: "Les 4 coins visibles" },
                      { emoji: "💡", text: "Sans reflet ni flou" },
                    ].map(tip => (
                      <div key={tip.text} className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                        <span className="text-xl">{tip.emoji}</span>
                        <span className="text-[11px] text-slate-500 font-light leading-tight">{tip.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Privacy */}
                  <div className="flex items-start gap-3 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <p className="text-[12px] text-emerald-700 leading-relaxed font-light">
                      Vos documents sont chiffrés et utilisés uniquement pour la vérification de votre identité.
                      Ils ne seront jamais transmis à des tiers.
                    </p>
                  </div>

                  {/* CTA */}
                  <button type="submit"
                    disabled={loading || !cinRecto || !cinVerso}
                    className="w-full flex items-center justify-center gap-2.5 py-4
                      bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-[14px]
                      font-semibold rounded-2xl transition-all tracking-wide
                      disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100">
                    {loading
                      ? <><Loader2 size={14} className="animate-spin" /> Envoi en cours…</>
                      : <>Soumettre ma demande <ArrowRight size={15} strokeWidth={2.5} /></>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-8 py-8 mt-4 flex items-center justify-between border-t border-slate-200">
        <span className="text-[12px] text-slate-400">© 2024 SenovaPark · Tous droits réservés</span>
        <div className="flex items-center gap-5">
          {["Confidentialité", "Conditions", "Contact"].map(l => (
            <a key={l} href="#" className="text-[12px] text-slate-400 hover:text-slate-700 transition-colors font-light">{l}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}

export default BecomePartner;