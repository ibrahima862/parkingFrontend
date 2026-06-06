import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
    email: '',
    token: ''
  });

  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    if (email && token) {
      setFormData(prev => ({ ...prev, email, token }));
    } else {
      setMessage({ type: 'error', text: 'Lien invalide ou informations manquantes.' });
    }
  }, [searchParams]);

  /* ── Force du mot de passe ── */
  const getStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthMeta = [
    { label: '', color: '' },
    { label: 'Faible', color: 'bg-red-500' },
    { label: 'Moyen', color: 'bg-orange-500' },
    { label: 'Bon', color: 'bg-orange-400' },
    { label: 'Fort', color: 'bg-blue-600' },
  ];

  const strength = getStrength(formData.password);
  const match = formData.password_confirmation.length > 0
    ? formData.password === formData.password_confirmation
    : null;

  const canSubmit = !isLoading && !!formData.token && strength >= 2 && match === true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la réinitialisation');
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès ! Redirection...' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/40 flex flex-col items-center justify-center px-4 py-12">

      {/* Logo / Icône */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Nouveau mot de passe</h1>
          <p className="text-sm text-gray-500 mt-1">Sécurisez votre compte avec un mot de passe fort.</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-blue-100 overflow-hidden">

        

        <div className="px-8 py-8 flex flex-col gap-5">

          {/* Message feedback */}
          {message && (
            <div className={`flex items-start gap-3 p-3.5 rounded-xl text-sm font-medium ${
              message.type === 'success'
                ? 'bg-blue-50 text-blue-800 border border-blue-100'
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.type === 'success'
                ? <CheckCircle size={16} className="shrink-0 mt-0.5 text-blue-600" />
                : <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              }
              {message.text}
            </div>
          )}

          {/* Champ 1 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type={showPw1 ? 'text' : 'password'}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPw1(!showPw1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPw1 ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Barre de force */}
            {formData.password.length > 0 && (
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strength ? strengthMeta[strength].color : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-[11px] font-medium ${
                  strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-orange-500' : 'text-blue-600'
                }`}>
                  {strengthMeta[strength]?.label}
                </span>
              </div>
            )}
          </div>

          {/* Champ 2 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type={showPw2 ? 'text' : 'password'}
                placeholder="••••••••"
                required
                className={`w-full pl-9 pr-10 py-2.5 text-sm bg-gray-50 border rounded-xl focus:outline-none transition-all placeholder:text-gray-300 ${
                  match === null
                    ? 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                    : match
                    ? 'border-blue-400 focus:ring-2 focus:ring-blue-100'
                    : 'border-red-300 focus:ring-2 focus:ring-red-100'
                }`}
                onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPw2(!showPw2)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPw2 ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {match === false && (
              <span className="text-[11px] text-red-500 font-medium">Les mots de passe ne correspondent pas.</span>
            )}
            {match === true && (
              <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                <CheckCircle size={11} /> Correspondance confirmée
              </span>
            )}
          </div>

          {/* CTA */}
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
              canSubmit
                ? 'bg-blue-700 hover:bg-blue-800 text-white active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Mise à jour...
              </>
            ) : (
              <>
                <ShieldCheck size={15} className={canSubmit ? 'text-orange-400' : 'text-gray-400'} />
                Réinitialiser le mot de passe
              </>
            )}
          </button>

          {/* Retour */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mx-auto"
          >
            <ArrowLeft size={12} />
            Retour à la connexion
          </button>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;