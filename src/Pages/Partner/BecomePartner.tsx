import React, { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Loader2, Eye, EyeOff, AlertCircle,
  CheckCircle2, ShieldCheck, Upload, X, ChevronLeft, ExternalLink,
  MapPin, Car, User, Lock, Building2, FileText, Star,
} from "lucide-react";

/* ─── Airbnb-style design tokens ─────────────────────────────────────── */
// Primary: blue-700 (#1D4ED8)  Accent: orange (#F97316)
// Font: "Plus Jakarta Sans" (loaded via Google Fonts in index.html or a style tag below)

const BLUE = "#1D4ED8";
const ORANGE = "#F97316";

const inp =
  "w-full py-3.5 px-4 text-[14px] bg-white border border-gray-200 rounded-xl " +
  "focus:outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-50 " +
  "transition-all placeholder:text-gray-300 text-gray-800";

/* ─── Tiny helpers ───────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11.5px] font-semibold text-gray-500 uppercase tracking-[0.08em]">
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

/* ─── Section block ─────────────────────────────────────────────────── */
function Section({ icon, title, subtitle, children }: {
  icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: `${BLUE}15` }}>
          <span style={{ color: BLUE }}>{icon}</span>
        </div>
        <div>
          <p className="text-[15px] font-bold text-gray-900">{title}</p>
          {subtitle && <p className="text-[12.5px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── CIN Upload zone ────────────────────────────────────────────────── */
function CINZone({ label, sublabel, file, onChange, onRemove }: {
  label: string; sublabel: string; file: File | null;
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
      className={`relative h-52 rounded-2xl flex flex-col items-center justify-center gap-3
        cursor-pointer overflow-hidden transition-all duration-200 border-2
        ${file
          ? "border-blue-700 bg-blue-50"
          : drag
            ? "border-orange-400 bg-orange-50 scale-[1.01]"
            : "border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30"
        }`}
    >
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onChange(f); }} />

      {preview ? (
        <>
          <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <CheckCircle2 size={12} className="text-white" />
            <span className="text-[11px] font-semibold text-white">Ajouté</span>
          </div>
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(); }}
            className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center
              justify-center text-gray-600 z-10 hover:bg-red-500 hover:text-white transition-all shadow-md">
            <X size={12} strokeWidth={2.5} />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 bg-white">
            <Upload size={18} className="text-gray-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-700">{label}</p>
            <p className="text-[11.5px] text-gray-400 mt-0.5">{sublabel}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Step pill ─────────────────────────────────────────────────────── */
function StepPill({ n, label, active, done }: { n: string; label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300
      ${active ? "bg-blue-700 shadow-lg shadow-blue-200" : "bg-transparent"}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0
        ${done ? "bg-orange-400 text-white" : active ? "bg-white text-blue-700" : "bg-gray-100 text-gray-400"}`}>
        {done ? <CheckCircle2 size={13} strokeWidth={2.5} /> : n}
      </div>
      <span className={`text-[13px] font-semibold transition-colors
        ${active ? "text-white" : done ? "text-gray-600" : "text-gray-400"}`}>
        {label}
      </span>
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
    <>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap'); * { font-family: 'Plus Jakarta Sans', sans-serif; }`}</style>

      <div className="min-h-screen" style={{ background: "#F6F8FF" }}>

        {/* ── Header ── */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-8 h-[68px] flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: `linear-gradient(135deg, ${BLUE}, #2563EB)` }}>
                <Car size={16} className="text-white" strokeWidth={2} />
              </div>
              <span className="text-[17px] font-extrabold tracking-tight" style={{ color: BLUE }}>
                Senova<span style={{ color: ORANGE }}>Park</span>
              </span>
            </div>
            {/* Pill badge */}
            <div className="flex items-center gap-2 text-[12px] font-semibold px-4 py-2 rounded-full border"
              style={{ color: BLUE, borderColor: `${BLUE}30`, background: `${BLUE}08` }}>
              <ShieldCheck size={13} strokeWidth={2} />
              Espace partenaires
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-8 py-12">

          {/* ── Hero banner ── */}
          <div className="relative overflow-hidden rounded-3xl mb-10 px-10 py-10"
            style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #1e40af 60%, #1e3a8a 100%)` }}>
            {/* Decorative circles */}
            <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full opacity-10"
              style={{ background: ORANGE }} />
            <div className="absolute right-24 -bottom-16 w-40 h-40 rounded-full opacity-[0.07]"
              style={{ background: "white" }} />

            <div className="relative flex items-center justify-between flex-wrap gap-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                  style={{ background: `${ORANGE}25`, border: `1px solid ${ORANGE}40` }}>
                  <Star size={11} style={{ color: ORANGE }} fill={ORANGE} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: ORANGE }}>
                    Programme Partenaires — Dakar
                  </span>
                </div>
                <h1 className="text-[30px] font-extrabold text-white leading-snug tracking-tight">
                  Publiez votre parking<br />
                  <span style={{ color: `${ORANGE}` }}>et générez des revenus.</span>
                </h1>
                <p className="text-blue-200 text-[14px] mt-3 max-w-sm font-normal leading-relaxed">
                  Rejoignez notre réseau et rentabilisez votre espace inutilisé dès aujourd'hui.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 shrink-0">
                {[
                  { value: "100%", label: "Gratuit" },
                  { value: "24h", label: "Validation" },
                  { value: "0%", label: "Commission" },
                  { value: "24/7", label: "Support" },
                ].map(s => (
                  <div key={s.label} className="text-center px-6 py-4 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <p className="text-[22px] font-extrabold text-white">{s.value}</p>
                    <p className="text-[11px] text-blue-300 mt-0.5 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Layout grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-8 items-start">

            {/* ── Sidebar ── */}
            <div className="lg:sticky lg:top-[88px] bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] px-4 pt-2 pb-3">
                Étapes
              </p>
              <div className="flex flex-col gap-1">
                <StepPill n="01" label="Votre annonce" active={step === 1} done={step > 1} />
                <StepPill n="02" label="Vérification CIN" active={step === 2} done={false} />
                <StepPill n="03" label="Publication" active={false} done={false} />
              </div>

              {/* Progress */}
              <div className="px-4 pt-5 pb-3">
                <div className="flex justify-between mb-2">
                  <span className="text-[11px] text-gray-400 font-medium">Progression</span>
                  <span className="text-[11px] font-bold" style={{ color: BLUE }}>
                    {step === 1 ? "33" : "66"}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: step === 1 ? "33%" : "66%",
                      background: `linear-gradient(90deg, ${BLUE}, ${ORANGE})`,
                    }} />
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-4 mx-1 p-4 rounded-2xl flex flex-col gap-3"
                style={{ background: `${BLUE}06`, border: `1px solid ${BLUE}12` }}>
                {[
                  { icon: CheckCircle2, text: "Inscription 100% gratuite" },
                  { icon: ShieldCheck, text: "Données chiffrées & sécurisées" },
                  { icon: Car, text: "Mise en ligne sous 24h" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <Icon size={13} className="shrink-0" style={{ color: BLUE }} strokeWidth={2} />
                    <span className="text-[12px] text-gray-500 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Form card ── */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">

              {/* Card top bar */}
              <div className="px-10 py-7 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-[19px] font-extrabold text-gray-900 tracking-tight">
                    {step === 1 ? "Détails de votre parking" : "Vérification d'identité"}
                  </h2>
                  <p className="text-[13px] text-gray-400 mt-0.5 font-normal">
                    {step === 1
                      ? "Renseignez les informations de votre espace"
                      : "Téléchargez les deux faces de votre CIN"}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `${BLUE}10` }}>
                  {step === 1
                    ? <Building2 size={19} style={{ color: BLUE }} strokeWidth={1.8} />
                    : <FileText size={19} style={{ color: BLUE }} strokeWidth={1.8} />
                  }
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mx-10 mt-8 flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-600">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  {error}
                </div>
              )}

              <div className="px-10 py-9">

                {/* ══ STEP 1 ══ */}
                {step === 1 && (
                  <form onSubmit={e => { e.preventDefault(); setError(null); setStep(2); }}
                    className="flex flex-col gap-10">

                    {!token && (
                      <Section
                        icon={<User size={16} strokeWidth={2} />}
                        title="Informations personnelles"
                        subtitle="Pour créer votre compte partenaire">
                        <div className="flex flex-col gap-5">
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
                                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors">
                                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
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
                      </Section>
                    )}

                    <Section
                      icon={<Car size={16} strokeWidth={2} />}
                      title="Votre parking"
                      subtitle="Caractéristiques de l'espace de stationnement">
                      <div className="flex flex-col gap-5">
                        <Field label="Nom du parking">
                          <input name="nomParking" required placeholder="ex. Parking Teranga"
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
                        </div>

                        {/* GPS block */}
                        <div className="rounded-2xl p-5 flex flex-col gap-4"
                          style={{ background: "#F6F8FF", border: `1.5px solid ${BLUE}18` }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} style={{ color: BLUE }} strokeWidth={2} />
                              <span className="text-[12px] font-bold uppercase tracking-[0.08em]"
                                style={{ color: BLUE }}>
                                Coordonnées GPS
                              </span>
                            </div>
                            <button type="button"
                              onClick={() => window.open(`https://www.google.com/maps?q=${form.quartier}`, "_blank")}
                              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3.5 py-2 rounded-xl
                                border bg-white hover:shadow-md transition-all"
                              style={{ color: BLUE, borderColor: `${BLUE}30` }}>
                              <ExternalLink size={11} strokeWidth={2.5} />
                              Google Maps
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
                    </Section>

                    {/* CTA */}
                    <div className="flex flex-col gap-3 pt-2">
                      <button type="submit"
                        className="w-full flex items-center justify-center gap-2.5 py-4
                          text-white text-[15px] font-bold rounded-2xl transition-all
                          hover:shadow-xl active:scale-[0.98] tracking-wide"
                        style={{
                          background: `linear-gradient(135deg, ${BLUE} 0%, #2563EB 100%)`,
                          boxShadow: `0 8px 24px ${BLUE}40`,
                        }}>
                        Continuer <ArrowRight size={16} strokeWidth={2.5} />
                      </button>
                      <p className="text-[11.5px] text-gray-400 text-center">
                        En continuant, vous acceptez les{" "}
                        <a href="/conditions-partenaires"
                          className="font-semibold underline underline-offset-2 hover:opacity-80"
                          style={{ color: ORANGE }}>
                          Conditions Partenaires
                        </a>.
                      </p>
                    </div>
                  </form>
                )}

                {/* ══ STEP 2 ══ */}
                {step === 2 && (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-8">

                    <button type="button" onClick={() => setStep(1)}
                      className="inline-flex items-center gap-1.5 text-[13px] font-semibold
                        text-gray-400 hover:text-gray-900 transition-colors w-fit -mt-1">
                      <ChevronLeft size={15} strokeWidth={2.5} /> Retour
                    </button>

                    {/* Upload zones */}
                    <div className="grid grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black text-white"
                            style={{ background: BLUE }}>R</div>
                          <Label>Face avant — Recto</Label>
                        </div>
                        <CINZone label="Photo recto" sublabel="Glissez ou cliquez" file={cinRecto}
                          onChange={setCinRecto} onRemove={() => setCinRecto(null)} />
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black text-white"
                            style={{ background: ORANGE }}>V</div>
                          <Label>Face arrière — Verso</Label>
                        </div>
                        <CINZone label="Photo verso" sublabel="Glissez ou cliquez" file={cinVerso}
                          onChange={setCinVerso} onRemove={() => setCinVerso(null)} />
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { emoji: "🔍", text: "Photo nette et lisible" },
                        { emoji: "📐", text: "4 coins visibles" },
                        { emoji: "💡", text: "Sans reflet ni flou" },
                      ].map(tip => (
                        <div key={tip.text} className="flex flex-col items-center gap-2 py-4 px-3
                          rounded-2xl border text-center"
                          style={{ background: `${BLUE}04`, borderColor: `${BLUE}12` }}>
                          <span className="text-2xl">{tip.emoji}</span>
                          <span className="text-[11.5px] text-gray-500 font-medium leading-snug">{tip.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* Privacy */}
                    <div className="flex items-start gap-3 p-5 rounded-2xl border"
                      style={{ background: `${ORANGE}08`, borderColor: `${ORANGE}25` }}>
                      <ShieldCheck size={16} className="shrink-0 mt-0.5" style={{ color: ORANGE }} strokeWidth={2} />
                      <p className="text-[12.5px] text-gray-600 leading-relaxed">
                        Vos documents sont chiffrés et utilisés uniquement pour la vérification.
                        Ils ne seront <strong>jamais transmis à des tiers</strong>.
                      </p>
                    </div>

                    {/* CTA */}
                    <button type="submit"
                      disabled={loading || !cinRecto || !cinVerso}
                      className="w-full flex items-center justify-center gap-2.5 py-4
                        text-white text-[15px] font-bold rounded-2xl transition-all
                        hover:shadow-xl active:scale-[0.98] disabled:opacity-30
                        disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                      style={{
                        background: `linear-gradient(135deg, ${BLUE} 0%, #2563EB 100%)`,
                        boxShadow: (!loading && cinRecto && cinVerso) ? `0 8px 24px ${BLUE}40` : "none",
                      }}>
                      {loading
                        ? <><Loader2 size={15} className="animate-spin" /> Envoi en cours…</>
                        : <>Soumettre ma demande <ArrowRight size={16} strokeWidth={2.5} /></>
                      }
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto px-8 py-8 mt-2 flex items-center justify-between border-t border-gray-200">
          <span className="text-[12px] text-gray-400">© 2024 SenovaPark · Tous droits réservés</span>
          <div className="flex items-center gap-5">
            {["Confidentialité", "Conditions", "Contact"].map(l => (
              <a key={l} href="#" className="text-[12px] text-gray-400 hover:text-gray-700 transition-colors font-medium">{l}</a>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
}

export default BecomePartner;