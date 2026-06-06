import React, { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';

const RequestPasswordReset: React.FC = () => {
  const [formData, setFormData] = useState({ email: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/password/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.message || 'Une erreur est survenue.');
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" bg-blue-50/40 flex flex-col items-center justify-center px-4 py-12">

      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div className="text-center">
          <p className="text-xl font-black tracking-tight">
            <span className="text-blue-700">Senova</span><span className="text-orange-500">Park</span>
          </p>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            {submitted ? 'Email envoyé !' : 'Mot de passe oublié ?'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {submitted
              ? 'Consultez votre boîte mail pour continuer.'
              : 'On vous envoie un lien de récupération.'}
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-blue-100 overflow-hidden">
        <div className="px-8 py-8 flex flex-col gap-5">

          {!submitted ? (
            <>
              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-medium">
                  <span className="mt-0.5 shrink-0">⚠</span>
                  {error}
                </div>
              )}

              {/* Champ email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ email: e.target.value })}
                    placeholder="nom@exemple.sn"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* CTA */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading || !formData.email}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  !isLoading && formData.email
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
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer le lien
                    <ArrowRight size={15} className="text-orange-400" />
                  </>
                )}
              </button>

              {/* Retour login */}
              
               <a href="/login"
                className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft size={12} />
                Retour à la connexion
              </a>
            </>

          ) : (
            /* ── État succès ── */
            <>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle size={28} className="text-blue-700" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Si un compte existe pour{' '}
                    <span className="font-bold text-gray-900">{formData.email}</span>,
                    vous recevrez un email d'ici quelques instants.
                  </p>
                </div>
              </div>

              {/* Info badge */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-orange-50 border border-orange-100 text-xs text-orange-800">
                <Mail size={14} className="shrink-0 mt-0.5 text-orange-500" />
                Pensez à vérifier vos spams si vous ne recevez rien sous 5 minutes.
              </div>

              <button
                onClick={() => { setSubmitted(false); setFormData({ email: '' }); }}
                className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors mx-auto"
              >
                <ArrowLeft size={12} />
                Utiliser une autre adresse
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default RequestPasswordReset;