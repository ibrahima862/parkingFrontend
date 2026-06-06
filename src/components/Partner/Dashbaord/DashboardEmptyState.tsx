import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Clock, Sparkles, Mail } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    label: 'Soumission reçue',
    sub: 'Dossier enregistré avec succès',
    status: 'done',
  },
  {
    label: 'Audit de conformité',
    sub: 'Analyse par nos experts en cours',
    status: 'current',
  },
  {
    label: 'Validation finale',
    sub: 'Accès dashboard débloqué',
    status: 'wait',
  },
];

export function DashboardStatus({ parkingName}:any) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-16 relative overflow-hidden font-sans">

      {/* ── Ambient background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="relative z-10 w-full max-w-[440px] flex flex-col gap-8">

        {/* ── Status pill ── */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="flex justify-center">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Vérification en cours</span>
          </div>
        </motion.div>

        {/* ── Hero ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="text-center">
          <h1 className="text-[34px] sm:text-[40px] font-light text-slate-900 tracking-tight leading-[1.15] mb-5">
            Votre parking est<br />
            <span className="font-semibold">entre de bonnes mains.</span>
          </h1>
          <p className="text-[14px] text-slate-500 leading-relaxed max-w-[300px] mx-auto">
            Le dossier <span className="text-slate-800 font-semibold">{parkingName}</span> est examiné par nos équipes. Tout se passe comme prévu.
          </p>
        </motion.div>

        {/* ── Timeline ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22, ease }}
          className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">

          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <span className="text-[12px] font-semibold text-slate-700 tracking-tight">Progression du dossier</span>
          </div>

          <div className="px-5 py-4 flex flex-col">
            {STEPS.map((step, i) => {
              const done    = step.status === 'done';
              const current = step.status === 'current';
              const isLast  = i === STEPS.length - 1;

              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.32 + i * 0.1, ease }}
                  className="flex gap-4 items-start">

                  {/* Connector */}
                  <div className="flex flex-col items-center shrink-0" style={{ width: 28 }}>
                    {/* Node */}
                    <div className={`relative w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300
                      ${done    ? 'bg-slate-900 border-slate-900'
                      : current ? 'bg-white border-blue-500'
                      :           'bg-white border-slate-200'}`}>
                      {done && <CheckCircle2 size={13} className="text-white" strokeWidth={2.5} />}
                      {current && (
                        <>
                          <span className="absolute inset-0 rounded-full animate-ping bg-blue-100 opacity-70" />
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        </>
                      )}
                      {step.status === 'wait' && <span className="w-2 h-2 rounded-full bg-slate-200" />}
                    </div>
                    {/* Line */}
                    {!isLast && (
                      <div className="relative w-px flex-1 my-1.5 overflow-hidden" style={{ minHeight: 28, background: '#e2e8f0' }}>
                        {done && (
                          <motion.div className="absolute top-0 left-0 right-0 bg-slate-900"
                            initial={{ height: 0 }} animate={{ height: '100%' }}
                            transition={{ duration: 0.6, delay: 0.5 + i * 0.1, ease }} />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 pb-5 last:pb-0 ${isLast ? 'pb-0' : ''}`}>
                    <div className={`flex items-center justify-between pt-0.5 mb-0.5`}>
                      <span className={`text-[13px] font-semibold tracking-tight
                        ${done ? 'text-slate-900' : current ? 'text-blue-600' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                      {done && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Fait
                        </span>
                      )}
                      {current && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                          En cours
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${done ? 'text-slate-500' : current ? 'text-slate-500' : 'text-slate-300'}`}>
                      {step.sub}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Smart reassurance ── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5, ease }}
          className="bg-white border border-slate-200/80 rounded-2xl p-5  flex items-start gap-4 hover:border-slate-300 hover:shadow-md transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-amber-500" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[12px] font-bold text-slate-800 mb-1">Délai estimé · 24 heures</p>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              98% des parkings sont validés en moins de 24h. Vous recevrez une notification email dès l'approbation.
            </p>
          </div>
        </motion.div>

        {/* ── Email reminder ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease }}
          className="flex items-center gap-3 px-5 py-4 bg-white border border-slate-200/80 rounded-2xl  hover:border-slate-300 transition-all duration-200">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Mail size={14} className="text-blue-500" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-700 mb-0.5">Notification par email</p>
            <p className="text-[11px] text-slate-400 truncate">Vous serez averti dès que votre parking est activé.</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
        </motion.div>

        {/* ── Footer ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.75, ease }}
          className="flex items-center justify-between pt-2 opacity-40">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">Secured by SenovaPark</span>
          <ShieldCheck size={13} className="text-slate-400" />
        </motion.div>
      </div>
    </div>
  );
}