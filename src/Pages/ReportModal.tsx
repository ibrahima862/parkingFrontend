import React, { useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2, Flag } from 'lucide-react';

interface ReportModalProps {
  parkingId: number;
  parkingName: string;
  onClose: () => void;
}

const CATS = [
  { id:'infrastructure', label:'État du parking',         sub:'Équipements cassés, propreté, éclairage…' },
  { id:'tarif',          label:'Problème de prix',        sub:'Tarif non conforme, frais cachés…' },
  { id:'comportement',   label:'Personnel / Propriétaire',sub:'Accueil désagréable, litige direct…' },
  { id:'securite',       label:'Sécurité / Vol',          sub:'Vandalisme, zone dangereuse…' },
  { id:'autre',          label:'Autre problème',          sub:'Tout autre souci rencontré…' },
];

export default function ReportModal({ parkingId, parkingName, onClose }: ReportModalProps) {
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState<string|null>(null);
  const [category,  setCategory]  = useState('infrastructure');
  const [desc,      setDesc]      = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const r = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/client/reports`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('token')}`, Accept:'application/json' },
        body: JSON.stringify({ parking_id:parkingId, category, description:desc }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || "Erreur lors de l'envoi.");
      setSubmitted(true);
      setTimeout(onClose, 3200);
    } catch(err:any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={e => { if(e.target===e.currentTarget) onClose(); }}>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        style={{animation:'rm-in .22s cubic-bezier(.16,1,.3,1) both'}}>

        <style>{`@keyframes rm-in{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}`}</style>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
              <Flag size={15} className="text-orange-500" strokeWidth={2}/>
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-900 leading-none">Signaler ce parking</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[220px]">{parkingName}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <X size={14}/>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1">
          {!submitted ? (
            <form onSubmit={submit}>
              <div className="px-5 py-5 flex flex-col gap-5">

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" strokeWidth={2.5}/>
                    <p className="text-[12px] font-semibold text-red-700">{error}</p>
                  </div>
                )}

                {/* Category section */}
                <div>
                  <p className="text-[15px] font-bold text-slate-900 mb-1">Qu'est-ce qui ne va pas ?</p>
                  <p className="text-[12px] text-slate-400 mb-4">Sélectionnez la catégorie qui décrit le mieux le problème.</p>

                  <div className="flex flex-col gap-2">
                    {CATS.map(cat => {
                      const active = category === cat.id;
                      return (
                        <button key={cat.id} type="button" onClick={()=>setCategory(cat.id)}
                          className={`flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all ${
                            active
                              ? 'border-[#1B3FA0] bg-[#EEF2FF]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}>
                          {/* Radio dot */}
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            active ? 'border-[#1B3FA0] bg-[#1B3FA0]' : 'border-slate-300'
                          }`}>
                            {active && <div className="w-1.5 h-1.5 rounded-full bg-white"/>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] font-semibold leading-none ${active?'text-[#1B3FA0]':'text-slate-800'}`}>{cat.label}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{cat.sub}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-[14px] font-bold text-slate-900 mb-3">Plus de détails</p>
                  <textarea required rows={4} value={desc} onChange={e=>setDesc(e.target.value)}
                    placeholder="Décrivez votre expérience avec précision…"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-[13px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1B3FA0] focus:ring-2 focus:ring-blue-100 resize-none transition-all"/>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Vous ne pouvez signaler un parking que si vous y avez effectué une réservation confirmée.
                  </p>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="sticky bottom-0 px-5 pb-5 pt-3 bg-white border-t border-slate-100">
                <button type="submit" disabled={loading || !desc.trim()}
                  className="w-full h-12 rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2 transition-all active:scale-[.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: loading||!desc.trim() ? '#CBD5E1' : '#F97316', boxShadow: desc.trim()&&!loading ? '0 4px 14px rgba(249,115,22,.3)' : 'none' }}>
                  {loading
                    ? <><Loader2 size={16} className="animate-spin"/> Envoi en cours…</>
                    : 'Envoyer le signalement'}
                </button>
              </div>
            </form>
          ) : (
            /* ── Success state ── */
            <div className="flex flex-col items-center justify-center text-center px-8 py-14 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-2">
                <CheckCircle2 size={30} className="text-emerald-500" strokeWidth={1.8}/>
              </div>
              <h3 className="text-[18px] font-bold text-slate-900">Signalement envoyé !</h3>
              <p className="text-[13px] text-slate-500 max-w-xs leading-relaxed">
                Merci pour votre retour. Notre équipe examinera votre signalement concernant{' '}
                <strong className="text-slate-700">{parkingName}</strong> dans les plus brefs délais.
              </p>
              <button onClick={onClose}
                className="mt-4 h-10 px-6 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}