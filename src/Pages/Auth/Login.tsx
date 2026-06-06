import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Lock, ArrowRight, Loader2, MapPin,
  Eye, EyeOff, AlertCircle, ShieldCheck, Zap
} from "lucide-react";

type LoginFields = { email: string; password: string };

export default function Login() {
  const [formData, setFormData] = useState<LoginFields>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = (import.meta as any).env.VITE_API_URL;
      const res = await fetch(`${apiUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Identifiants incorrects");

      localStorage.setItem("token", json.access_token);
      localStorage.setItem("user", JSON.stringify(json.user));
      const role = json.user?.role || "client";
      localStorage.setItem("role", role);

      const routes = {
        admin: "/admin/dashboard",
        proprietaireparking: "/partner/dashboard",
        client: "/",
      };
      navigate(routes[role as keyof typeof routes] || "/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && formData.email.length > 0 && formData.password.length > 0;

  return (
    <div className="min-h-screen bg-blue-50/40 flex flex-col items-center justify-center px-4 py-5 font-sans">

      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div className="text-center">
          <p className="text-xl font-black tracking-tight">
            <span className="text-blue-700">Senova</span><span className="text-orange-500">Park</span>
          </p>
          <h1 className="text-xl font-bold text-gray-900 mt-1">Content de vous revoir</h1>
          <p className="text-sm text-gray-500 mt-1">Entrez vos identifiants pour accéder à votre espace.</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-blue-100 overflow-hidden">

        <div className="px-8 py-8 flex flex-col gap-5">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-medium">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Adresse email
            </label>
            <div className="relative group">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="nom@exemple.sn"
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder:text-gray-300 text-gray-900"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Mot de passe
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative group">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder:text-gray-300 text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* CTA */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all mt-1 ${
              canSubmit
                ? "bg-blue-700 hover:bg-blue-800 text-white active:scale-[0.98]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight size={15} className={canSubmit ? "text-orange-400" : "text-gray-400"} />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[11px] text-gray-400 font-semibold uppercase tracking-widest">ou</span>
            </div>
          </div>

          {/* Parcourir */}
          <Link
            to="/parkings"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <MapPin size={15} className="text-orange-500" />
            Parcourir les parkings
          </Link>

          {/* Inscription */}
          <p className="text-center text-sm text-gray-500">
            Nouveau sur SenovaPark ?{" "}
            <Link
              to="/register"
              className="text-blue-700 font-bold hover:underline underline-offset-4 transition-all"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* Footer de confiance */}
      <div className="mt-10 flex items-center gap-5 opacity-40 hover:opacity-90 transition-opacity">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <ShieldCheck size={13} className="text-blue-700" /> Sécurisé
        </div>
        <div className="w-px h-3.5 bg-gray-300" />
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <Zap size={13} className="text-orange-500" /> Haute Performance
        </div>
        <div className="w-px h-3.5 bg-gray-300" />
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">PayTech Certified</span>
      </div>
    </div>
  );
}