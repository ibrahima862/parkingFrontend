import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight, Loader2,
  MapPin, Eye, EyeOff, AlertCircle,
 Building2, Sparkles, Star
} from "lucide-react";

export function Register() {
  const [formData, setFormData] = useState({
    name: "", email: "", telephone: "", password: "",
    password_confirmation: "", role: "client",
    nomParking: "", quartier: "", capacite: "", description: "",
    longitude: "", latitude: ""  
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
   
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
     console.log(json)
      if (!res.ok) {
        // Gestion des erreurs de validation Laravel (ex: email déjà pris)
        throw new Error(json.message || "Erreur lors de l'inscription");
      }

      // Stockage des infos
      localStorage.setItem("token", json.access_token);
      localStorage.setItem("user", JSON.stringify(json.user));

      // Redirection intelligente
      if (json.user.role === 'proprietaireparking') {
        navigate("/partner/dashboard"); // Page d'attente de validation
      } else {
        navigate("/parking-lots");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      {/* --- SIDEBAR DYNAMIQUE (STYLE LINEAR/CLAUDE) --- */}
      <div className="hidden lg:flex w-[40%] bg-[#020617] relative overflow-hidden flex-col justify-between p-12">
        {/* Effet de lumière diffuse en arrière-plan */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] bg-blue-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-orange-500 rounded-full blur-[100px] opacity-20" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-20">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <MapPin size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">SenovaPark</span>
          </div>

          <h1 className="text-4xl font-medium text-white leading-tight mb-6">
            La gestion de parking <br />
            <span className="text-slate-400">réinventée pour le Sénégal.</span>
          </h1>

          <div className="space-y-6">
            {[
              { title: "Temps réel", desc: "Suivez vos places disponibles instantanément." },
              { title: "Paiement local", desc: "Intégration native Wave et Orange Money." },
              { title: "Sécurité", desc: "Contrôle d'accès intelligent et rapports détaillés." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="mt-1 bg-white/10 p-1 rounded">
                  <Sparkles size={14} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-8">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Star size={14} className="text-orange-500" fill="currentColor" />
            <span>Propulsé par la technologie Senova</span>
          </div>
        </div>
      </div>

      {/* --- SECTION FORMULAIRE (CLEAN SaaS) --- */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50/50">
        <div className="w-full max-w-[440px]">
          <div className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Créer votre compte</h2>
            <p className="text-slate-500 mt-2 text-sm">
              Déjà membre ? <Link to="/login" className="text-blue-600 hover:underline font-medium">Connectez-vous</Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* SÉLECTEUR DE RÔLE MINIMALISTE */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/50 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'client' })}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${formData.role === 'client' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Je suis un client
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'proprietaireparking' })}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${formData.role === 'proprietaireparking' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                devenir un partenaire
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text" name="name" required
                  placeholder="Nom complet"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email" name="email" required
                  placeholder="Email professionnel"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                  onChange={handleChange}
                />
                <input
                  type="tel" name="telephone" required
                  placeholder="Téléphone"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                  onChange={handleChange}
                />
              </div>

              {/* CHAMPS PROPRIÉTAIRE (APPARITION DOUCE) */}
              {formData.role === "proprietaireparking" && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-blue-700 text-xs font-bold uppercase tracking-wider">
                      <Building2 size={14} /> Informations Parking
                    </div>
                    <input
                      type="text" name="nomParking" placeholder="Nom de votre parking"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                      onChange={handleChange}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text" name="quartier" placeholder="Quartier (ex: Almadies)"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                        onChange={handleChange}
                      />
                      <input
                        type="number" name="capacite" placeholder="Capacité"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                        onChange={handleChange}
                      />
                      <input
                        type="text" name="latitude" placeholder="Latitude"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                        onChange={handleChange}
                      />
                      <input
                        type="text" name="longitude" placeholder="Longitude"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {/* Champ Mot de passe */}
                <div className="relative group">
                  <input
                    type={showPwd ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Mot de passe"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Champ Confirmation */}
                <div className="relative group">
                  <input
                    type={showPwd ? "text" : "password"} // Correction ici
                    name="password_confirmation"
                    required
                    placeholder="Confirmer le mot de passe"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 group mt-8"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Démarrer l'aventure
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[12px] text-slate-500 leading-relaxed">
            En continuant, vous acceptez les <span className="text-slate-900 font-medium cursor-pointer">Conditions d'Utilisation</span> et la <span className="text-slate-900 font-medium cursor-pointer">Politique de Confidentialité</span> de SenovaPark.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;