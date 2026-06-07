import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Loader2, Eye, EyeOff, AlertCircle,
  CheckCircle2, ShieldCheck, Upload, X, ChevronLeft, ExternalLink,
} from "lucide-react";

/* ─── Design tokens ──────────────────────────────────────────────────── */
const inp =
  "w-full py-3 px-4 text-[14px] bg-white border border-neutral-200 rounded-lg " +
  "focus:outline-none focus:border-neutral-900 focus:ring-0 transition-colors " +
  "placeholder:text-neutral-300 text-neutral-900";

/* ─── Tiny helpers ───────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest">
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-neutral-100" />
      <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-neutral-100" />
    </div>
  );
}

/* ─── CIN Upload zone ────────────────────────────────────────────────── */
function CINZone({
  label, file, onChange, onRemove,
}: {
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
      className={`relative h-44 rounded-xl border flex flex-col items-center justify-center gap-3 
        cursor-pointer overflow-hidden transition-all duration-200
        ${file
          ? "border-neutral-900 bg-neutral-50"
          : drag
            ? "border-neutral-400 bg-neutral-50"
            : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50"
        }`}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); }} />

      {preview ? (
        <>
          <img src={preview} alt={label}
            className="absolute inset-0 w-full h-full object-cover rounded-xl" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center
            opacity-0 hover:opacity-100 transition-opacity rounded-xl" />
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center
              justify-center text-neutral-700 z-10 hover:bg-neutral-900 hover:text-white
              transition-colors shadow-sm"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </>
      ) : (
        <>
          <div className="w-10 h-10 border border-neutral-200 rounded-xl flex items-center
            justify-center bg-white">
            <Upload size={16} className="text-neutral-500" strokeWidth={1.5} />
          </div>
          <div className="text-center px-6">
            <p className="text-[13px] font-medium text-neutral-700">{label}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Glissez ou cliquez</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
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
    <div className="min-h-screen bg-neutral-50 font-sans">

      {/* ── Top bar ── */}
      <header className="border-b border-neutral-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-[15px] font-semibold text-neutral-900 tracking-tight">
            Senova<span className="text-neutral-400 font-light">Park</span>
          </span>
          <span className="text-[12px] text-neutral-400">
            Espace partenaires
          </span>
        </div>
      </header>

      {/* ── Page body ── */}
      <main className="max-w-5xl mx-auto px-6 py-16">

        {/* Page title */}
        <div className="mb-14">
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-3">
            Devenir partenaire
          </p>
          <h1 className="text-[32px] font-semibold text-neutral-900 tracking-tight leading-tight">
            Publiez votre parking
          </h1>
          <p className="text-[15px] text-neutral-500 mt-2 max-w-md leading-relaxed">
            Rejoignez notre réseau de partenaires à Dakar et générez des revenus
            depuis votre espace inutilisé.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-16 items-start">

          {/* ── Left sidebar: steps ── */}
          <div className="flex flex-col gap-2 lg:sticky lg:top-8">
            {[
              { n: "01", label: "Votre annonce" },
              { n: "02", label: "Vérification" },
              { n: "03", label: "Publication" },
            ].map((s, i) => {
              const done = step > i + 1;
              const active = step === i + 1;
              return (
                <div key={s.n} className="flex items-center gap-3 py-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center 
                      text-[11px] font-semibold shrink-0 transition-all
                      ${done
                        ? "bg-neutral-900 text-white"
                        : active
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                  >
                    {done ? <CheckCircle2 size={13} strokeWidth={2.5} /> : s.n}
                  </div>
                  <span
                    className={`text-[13px] font-medium transition-colors
                      ${active ? "text-neutral-900" : "text-neutral-400"}`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}

            {/* Progress bar */}
            <div className="mt-6 h-1 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-neutral-900 rounded-full transition-all duration-500"
                style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              Étape {step} sur 2
            </p>

            {/* Reassurance block */}
            <div className="mt-10 flex flex-col gap-4">
              {[
                { icon: CheckCircle2, text: "Inscription 100% gratuite" },
                { icon: ShieldCheck, text: "Données sécurisées & confidentielles" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <Icon size={14} className="text-neutral-400 shrink-0" strokeWidth={1.5} />
                  <span className="text-[12px] text-neutral-500">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: form card ── */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 sm:p-10">

            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border
                border-red-100 rounded-lg text-[13px] text-red-600 mb-8">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <form
                onSubmit={e => { e.preventDefault(); setError(null); setStep(2); }}
                className="flex flex-col gap-7"
              >
                {!token && (
                  <>
                    <Divider label="Votre compte" />
                    <Field label="Nom complet">
                      <input name="name" required placeholder="Matar Faye"
                        value={form.name} onChange={set} className={inp} />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Email">
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
                      <Field label="Mot de passe">
                        <div className="relative">
                          <input name="password" type={showPwd ? "text" : "password"}
                            required placeholder="••••••••" value={form.password}
                            onChange={set} className={inp} />
                          <button type="button" onClick={() => setShowPwd(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2
                              text-neutral-400 hover:text-neutral-600 transition-colors">
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
                  </>
                )}

                <Divider label="Votre parking" />

                <Field label="Nom du parking">
                  <input name="nomParking" required placeholder="Parking Teranga"
                    value={form.nomParking} onChange={set} className={inp} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Quartier / Ville">
                    <input name="quartier" required placeholder="Dakar Plateau"
                      value={form.quartier} onChange={set} className={inp} />
                  </Field>
                  <Field label="Nombre de places">
                    <input name="capacite" type="number" required min="1"
                      placeholder="10" value={form.capacite} onChange={set}
                      className={inp} />
                  </Field>
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

                <button
                  type="button"
                  onClick={() => window.open(`https://www.google.com/maps?q=${form.quartier}`, "_blank")}
                  className="inline-flex items-center gap-2 text-[12px] text-neutral-500
                    hover:text-neutral-900 transition-colors w-fit -mt-2"
                >
                  <ExternalLink size={12} strokeWidth={1.5} />
                  Récupérer les coordonnées via Google Maps
                </button>

                <Field label="Description">
                  <textarea name="description" rows={3}
                    placeholder="Sécurité 24h, vidéosurveillance, accès facile…"
                    value={form.description} onChange={set}
                    className={`${inp} resize-none`} />
                </Field>

                {/* CTA */}
                <div className="pt-2 flex flex-col gap-4">
                  <button type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5
                      bg-neutral-900 hover:bg-neutral-800 text-white text-[14px]
                      font-medium rounded-xl transition-colors">
                    Continuer <ArrowRight size={15} strokeWidth={2} />
                  </button>
                  <p className="text-[11px] text-neutral-400 text-center">
                    En continuant, vous acceptez les{" "}
                    <a href="/conditions-partenaires"
                      className="text-neutral-700 underline underline-offset-2">
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
                  className="inline-flex items-center gap-1.5 text-[13px] text-neutral-400
                    hover:text-neutral-900 transition-colors w-fit -mt-1">
                  <ChevronLeft size={14} /> Retour
                </button>

                <div>
                  <h2 className="text-[16px] font-semibold text-neutral-900 mb-1">
                    Vérification d'identité
                  </h2>
                  <p className="text-[13px] text-neutral-500 leading-relaxed">
                    Téléchargez les deux faces de votre carte d'identité nationale (CIN).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Recto</Label>
                    <CINZone label="Face avant" file={cinRecto}
                      onChange={setCinRecto} onRemove={() => setCinRecto(null)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Verso</Label>
                    <CINZone label="Face arrière" file={cinVerso}
                      onChange={setCinVerso} onRemove={() => setCinVerso(null)} />
                  </div>
                </div>

                {/* Tips */}
                <div className="flex flex-col gap-2.5 p-5 bg-neutral-50 border
                  border-neutral-100 rounded-xl">
                  <Label>Conseils</Label>
                  {[
                    "Photo nette et lisible",
                    "Les 4 coins visibles",
                    "Pas de reflet ni de flou",
                  ].map(tip => (
                    <div key={tip} className="flex items-center gap-2.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" />
                      <span className="text-[12px] text-neutral-600">{tip}</span>
                    </div>
                  ))}
                </div>

                {/* Privacy note */}
                <div className="flex items-start gap-3">
                  <ShieldCheck size={14} className="text-neutral-400 shrink-0 mt-0.5"
                    strokeWidth={1.5} />
                  <p className="text-[12px] text-neutral-500 leading-relaxed">
                    Vos documents sont utilisés uniquement pour la vérification.
                    Ils ne seront jamais partagés avec des tiers.
                  </p>
                </div>

                {/* CTA */}
                <button type="submit"
                  disabled={loading || !cinRecto || !cinVerso}
                  className="w-full flex items-center justify-center gap-2 py-3.5
                    bg-neutral-900 hover:bg-neutral-800 text-white text-[14px]
                    font-medium rounded-xl transition-colors
                    disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading
                    ? <><Loader2 size={14} className="animate-spin" /> Envoi en cours…</>
                    : <>Soumettre ma demande <ArrowRight size={15} strokeWidth={2} /></>
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
export default BecomePartner;