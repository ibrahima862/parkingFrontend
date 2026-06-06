import React, { useState, useRef } from "react";
import {
    MapPin, Info, Loader2, PlusCircle, ChevronLeft,
    Upload, X, AlertCircle, Camera, Sparkles, CheckCheck,
    Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

interface Horaire {
  jour: string;
  ouverture: string;
  fermeture: string;
  est_ferme: boolean;
}
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
interface Form {
    nom: string; departement: string; adresse: string;
    description: string; capacite: string; tarif_horaire: string;
    nom_service: string; description_service: string; prix_service: string;
    longitude:string;latitude:string;
}

const DEPTS = ["Dakar", "Thiès", "Pikine", "Mbour", "Saint-Louis"];

const inp = "w-full py-2.5 px-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder:text-gray-300 text-gray-900";
const label = "text-[11px] font-semibold text-gray-500 uppercase tracking-wider";

const Field = ({ l, children }: { l: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1.5">
        <label className={label}>{l}</label>
        {children}
    </div>
);

export function AddParking() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showService, setShowService] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    
    const [horaires, setHoraires] = useState<Horaire[]>(
  JOURS.map(j => ({ jour: j, ouverture: "08:00", fermeture: "22:00", est_ferme: false }))
);
    const [form, setForm] = useState<Form>({
        nom: "", departement: "Dakar", adresse: "", description: "",
        capacite: "", tarif_horaire: "", nom_service: "",
        description_service: "", prix_service: "", longitude: "",latitude: ""
    });

    const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleImage = (file: File) => {
        if (!file.type.startsWith("image/")) return;
        if (file.size > 3_000_000) { setError("Image trop lourde (max 3 Mo)."); return; }
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
        setError(null);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true); setError(null);
        const token = localStorage.getItem("token");
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => {
            if (!showService && ["nom_service", "description_service", "prix_service"].includes(k)) return;
            fd.append(k, v);
        });
        fd.append("pays", "Sénégal");
        fd.append("quartier", form.adresse);
        fd.append("prix_base", form.tarif_horaire);
        fd.append("horaires", JSON.stringify(horaires));
        fd.append("duree_base", "1");
        if (imageFile) fd.append("image", imageFile);

        try {
            const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/partenaire/parkings`, {
                method: "POST",
                headers: {Authorization: `Bearer ${token}`, Accept: "application/json" },
                body: fd,
            });
            const data = await res.json();
            if (res.ok) { setSuccess(true); setTimeout(() => navigate("/partner/dashboard"), 2500); }
            else setError(data.errors ? Object.values(data.errors).flat().join(" ") : data.message || "Erreur.");
        } catch { setError("Impossible de joindre le serveur."); }
        finally { setLoading(false); }
    };

    if (success) return (
        <div className="min-h-screen bg-blue-50/40 flex flex-col items-center justify-center gap-6 text-center px-4">
            <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center">
                <CheckCheck size={28} className="text-white" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">Parking enregistré !</h2>
                <p className="text-sm text-gray-500 mt-1">Notre équipe valide votre annonce sous 24h.</p>
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Redirection...
            </span>
        </div>
    );

    const summary = [
        { l: "Nom", v: form.nom || "—" },
        { l: "Capacité", v: form.capacite ? `${form.capacite} places` : "—" },
        { l: "Tarif / h", v: form.tarif_horaire ? `${parseInt(form.tarif_horaire).toLocaleString()} F` : "—", accent: true },
        { l: "Adresse", v: form.adresse || "—" },
        
        ...(showService && form.nom_service ? [{ l: "Service+", v: form.nom_service, accent: false }] : []),
    ];

    return (
        <div className="min-h-screen bg-blue-50/40">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 lg:pb-16">

                {/* Header */}
                <div className="flex items-center justify-between gap-4 pt-8 mb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/partner/dashboard")}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-700 hover:border-blue-200 transition-colors"
                        >
                            <ChevronLeft size={17} />
                        </button>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Partenaire</p>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                Nouvel <span className="text-blue-700">espace</span>
                            </h1>
                        </div>
                    </div>

                    {/* Stepper */}
                    <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full text-[11px] font-semibold">
                        {["Infos", "Photo", "GPS"].map((s, i) => (
                            <React.Fragment key={s}>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-400"}`}>
                                        {i + 1}
                                    </span>
                                    <span className={i === 0 ? "text-blue-700" : "text-gray-400"}>{s}</span>
                                </div>
                                {i < 2 && <div className="w-4 h-px bg-gray-200" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">

                        {/* Left */}
                        <div className="flex flex-col gap-4">

                            {/* Infos générales */}
                            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                                    <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
                                        <Info size={14} className="text-blue-700" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-800">Informations générales</p>
                                        <p className="text-[11px] text-gray-400">Identité, capacité, tarification</p>
                                    </div>
                                </div>
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field l="Nom du parking">
                                        <input name="nom" value={form.nom} onChange={set} placeholder="Ex: Parking Liberté VI" required className={inp} />
                                    </Field>
                                    <Field l="Département">
                                        <select name="departement" value={form.departement} onChange={set} className={inp}>
                                            {DEPTS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                    </Field>
                                    <Field l="Capacité (places)">
                                        <input name="capacite" type="number" value={form.capacite} onChange={set} placeholder="30" required className={inp} />
                                    </Field>
                                    <Field l="Tarif horaire (FCFA)">
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">₣</span>
                                            <input name="tarif_horaire" type="number" value={form.tarif_horaire} onChange={set} placeholder="500" required className={`${inp} pl-7`} />
                                        </div>
                                    </Field>
                                    <Field l="latitude">
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">₣</span>
                                            <input name="latitude" type="number" value={form.latitude} onChange={set} placeholder="14.56" required className={`${inp} pl-7`} />
                                        </div>
                                    </Field>
                                    <Field l="longitude">
                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">₣</span>
                                            <input name="longitude" type="number" value={form.longitude} onChange={set} placeholder="-17.67" required className={`${inp} pl-7`} />
                                        </div>
                                    </Field>
                                    <div className="sm:col-span-2">
                                        <Field l="Description">
                                            <textarea name="description" value={form.description} onChange={set} rows={3} placeholder="Sécurité, accès, éclairage..." className={`${inp} resize-none`} />
                                        </Field>
                                    </div>
                                </div>
                            </section>

                            {/* Localisation */}
                            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                                    <div className="w-8 h-8 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center">
                                        <MapPin size={14} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-800">Localisation</p>
                                        <p className="text-[11px] text-gray-400">Adresse et point de repère</p>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col gap-4">
                                    <Field l="Adresse / point de repère">
                                        <input name="adresse" value={form.adresse} onChange={set} placeholder="Ex: Avenue Cheikh Anta Diop, face station Total" required className={inp} />
                                    </Field>
                                    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[12px] text-blue-700 font-medium">
                                        <MapPin size={13} className="text-blue-500 shrink-0" />
                                        Géolocalisation automatique à l'étape suivante
                                    </div>
                                </div>
                            </section>

                            {/* Photo */}
                            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                                    <div className="w-8 h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center">
                                        <Camera size={14} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-800">Photo de couverture</p>
                                        <p className="text-[11px] text-gray-400">PNG, JPG — max 3 Mo</p>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImage(f); }}
                                        className={`relative h-44 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-colors ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"}`}
                                    >
                                        {preview ? (
                                            <>
                                                <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="bg-white px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-800">Changer</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={e => { e.stopPropagation(); setPreview(null); setImageFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                                                    className="absolute top-2 right-2 w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-center">
                                                <Upload size={28} className="text-gray-300" strokeWidth={1.5} />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Cliquez ou glissez une image</p>
                                                    <p className="text-[11px] text-gray-400">PNG, JPG jusqu'à 3 Mo</p>
                                                </div>
                                            </div>
                                        )}
                                        <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
                                    </div>
                                </div>
                            </section>

                            {/* Services additionnels */}
                            <section className={`bg-white border rounded-xl overflow-hidden transition-colors ${showService ? "border-blue-200" : "border-gray-200"}`}>
                                <div className={`flex items-center justify-between px-5 py-3.5 border-b border-gray-100 transition-colors ${showService ? "bg-blue-50/40" : "bg-gray-50/50"}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${showService ? "bg-orange-50 border-orange-100" : "bg-gray-100 border-gray-200"}`}>
                                            <Sparkles size={14} className={showService ? "text-orange-500" : "text-gray-400"} />
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-gray-800">Services additionnels</p>
                                            <p className="text-[11px] text-gray-400">Lavage, gardiennage, recharge...</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowService(v => !v)}
                                        className={`w-10 h-[22px] rounded-full relative transition-colors shrink-0 ${showService ? "bg-blue-700" : "bg-gray-200"}`}
                                    >
                                        <div className={`absolute top-[3px] w-4 h-4 bg-white rounded-full transition-all ${showService ? "right-[3px]" : "left-[3px]"}`} />
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {showService && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <Field l="Nom du service">
                                                    <input name="nom_service" value={form.nom_service} onChange={set} placeholder="Ex: Lavage express" className={inp} />
                                                </Field>
                                                <Field l="Prix (FCFA)">
                                                    <div className="relative">
                                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">₣</span>
                                                        <input name="prix_service" type="number" value={form.prix_service} onChange={set} placeholder="2500" className={`${inp} pl-7`} />
                                                    </div>
                                                </Field>
                                                <div className="sm:col-span-2">
                                                    <Field l="Description du service">
                                                        <textarea name="description_service" value={form.description_service} onChange={set} rows={2} placeholder="Détails, durée, équipement..." className={`${inp} resize-none`} />
                                                    </Field>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </section>
                            {/* Horaires d'ouverture */}
                            <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                                    <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center">
                                        <Clock size={14} className="text-blue-700" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-800">Horaires d'ouverture</p>
                                        <p className="text-[11px] text-gray-400">Configurez vos heures d'accès</p>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col gap-3">
                                    {horaires.map((h, i) => (
                                        <div key={h.jour} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                                            <span className="text-xs font-semibold text-gray-600 w-20">{h.jour}</span>

                                            <div className="flex items-center gap-2">
                                                {!h.est_ferme ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="time"
                                                            value={h.ouverture}
                                                            onChange={e => {
                                                                const newH = [...horaires];
                                                                newH[i].ouverture = e.target.value;
                                                                setHoraires(newH);
                                                            }}
                                                            className="text-[11px] px-2 py-1 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                                                        />
                                                        <span className="text-gray-400 text-[10px]">à</span>
                                                        <input
                                                            type="time"
                                                            value={h.fermeture}
                                                            onChange={e => {
                                                                const newH = [...horaires];
                                                                newH[i].fermeture = e.target.value;
                                                                setHoraires(newH);
                                                            }}
                                                            className="text-[11px] px-2 py-1 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] font-medium text-red-400 italic py-1">Fermé ce jour</span>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newH = [...horaires];
                                                    newH[i].est_ferme = !newH[i].est_ferme;
                                                    setHoraires(newH);
                                                }}
                                                className={`text-[10px] font-bold uppercase tracking-tighter px-2 py-1 rounded ${h.est_ferme ? "text-blue-600 bg-blue-50" : "text-gray-400 bg-gray-100"}`}
                                            >
                                                {h.est_ferme ? "Ouvrir" : "Fermer"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right — Summary sticky */}
                        <div className="hidden lg:block sticky top-6">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-700" />
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Récapitulatif</span>
                                </div>
                                <div className="p-5">
                                    <div className="flex flex-col mb-5">
                                        {summary.map(item => (
                                            <div key={item.l} className="flex justify-between items-baseline gap-2 py-2.5 border-b border-dashed border-gray-100 last:border-0">
                                                <span className="text-[11px] text-gray-400 shrink-0">{item.l}</span>
                                                <span className={`text-[12px] font-semibold text-right truncate ${(item as any).accent ? "text-blue-700" : "text-gray-800"}`}>
                                                    {item.v}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading
                                            ? <><Loader2 size={14} className="animate-spin" /> Enregistrement...</>
                                            : <><PlusCircle size={14} className="text-orange-400" /> Publier mon parking</>
                                        }
                                    </button>
                                    <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                                        Validation sous 24h. En publiant, vous acceptez nos conditions partenaires.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile sticky CTA */}
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading
                                ? <><Loader2 size={15} className="animate-spin" /> Enregistrement...</>
                                : <><PlusCircle size={15} className="text-orange-400" /> Publier mon parking</>
                            }
                        </button>
                    </div>
                </form>
            </div>

            {/* Error toast */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        className="fixed bottom-20 lg:bottom-6 right-4 max-w-sm bg-white border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg z-[100]"
                    >
                        <AlertCircle size={15} className="text-red-500 shrink-0" />
                        <p className="text-[12px] font-medium text-red-600 flex-1">{error}</p>
                        <button onClick={() => setError(null)} className="text-red-300 hover:text-red-500 transition-colors">
                            <X size={13} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
export default AddParking