 import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";
export function VerificationTimeline() {
  const steps = [
    { title: "Inscription", desc: "Compte créé avec succès", status: "complete" },
    { title: "Vérification des documents", desc: "Nos agents vérifient la légitimité du parking", status: "current" },
    { title: "Validation finale", desc: "Mise en ligne sur la carte et ouverture du dashboard", status: "upcoming" },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFE] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm text-center"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock size={32} className="animate-pulse" />
          </div>
          
          <h2 className="text-2xl font-medium text-slate-800 mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Analyse en <span className="italic italic text-slate-400">cours</span>
          </h2>
          <p className="text-sm text-slate-400 mb-10">Votre parking est en train d'être examiné par notre équipe de modération.</p>

          <div className="space-y-8 relative">
            {/* Ligne verticale de liaison */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />

            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 relative z-10 text-left">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm ${
                  step.status === 'complete' ? 'bg-emerald-500 text-white' : 
                  step.status === 'current' ? 'bg-amber-400 text-white' : 'bg-slate-100 text-slate-300'
                }`}>
                  {step.status === 'complete' ? <CheckCircle2 size={14} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${step.status === 'upcoming' ? 'text-slate-300' : 'text-slate-700'}`}>{step.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="mt-12 w-full py-4 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all"
          >
            Actualiser le statut
          </button>
        </motion.div>
      </div>
    </div>
  );
}