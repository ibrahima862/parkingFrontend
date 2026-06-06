import { X, CreditCard, Calendar, Car, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Abonnement } from "../../../type";
import { motion } from 'framer-motion';

const AVATARS = [
  'from-blue-600 to-blue-800', 'from-violet-500 to-purple-700',
  'from-emerald-500 to-teal-700', 'from-orange-500 to-orange-700',
];
const initials  = (n?: string) => (n || 'XX').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const avatarGrad = (n?: string) => AVATARS[(n || '').charCodeAt(0) % AVATARS.length];
const fmtDate   = (d: string)  => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
const daysLeft  = (d: string)  => Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);

const STATUS_CFG: Record<string, { label: string; cls: string; Icon: any }> = {
  actif:      { label: 'Actif',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  en_attente: { label: 'En attente', cls: 'bg-orange-50  text-orange-700  border-orange-200',  Icon: Clock        },
  expire:     { label: 'Expiré',     cls: 'bg-red-50     text-red-700     border-red-200',      Icon: XCircle      },
};

export default function DetailsPanel({ item, onClose }: { item: Abonnement | null; onClose: () => void }) {
  if (!item) return null;

  const sCfg = STATUS_CFG[item.statut] ?? STATUS_CFG.en_attente;
  const days = daysLeft(item.date_fin);
  const soon = item.statut === 'actif' && days > 0 && days <= 7;
console.log(item);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div>
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-widest">Abonnement</p>
            <p className="text-[14px] font-bold text-slate-800 mt-0.5">Détails complets</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors">
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 px-5 py-5 flex flex-col gap-5">

          {/* User card */}
          <div className="flex items-center gap-3.5 p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGrad(item.user?.name)} flex items-center justify-center font-bold text-white text-[14px] tracking-wide shrink-0`}>
              {initials(item.user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-slate-900 truncate">{item.user?.name || 'Client inconnu'}</p>
              <p className="text-[12px] text-slate-500 truncate mt-0.5">{item.user?.email}</p>
              {item.user?.telephone && (
                <p className="text-[11px] text-slate-400 mt-0.5">{item.user.telephone}</p>
              )}
            </div>
          </div>

          {/* Status + plan */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Statut</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${sCfg.cls}`}>
                <sCfg.Icon size={10} strokeWidth={2.5} />
                {sCfg.label}
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Plan</p>
              <p className="text-[13px] font-bold text-blue-700">{item.plan?.nom || '—'}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5">
              <div className="w-7 h-7 bg-orange-50 border border-orange-100 rounded-lg flex items-center justify-center shrink-0">
                <Car size={13} className="text-orange-600" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Véhicule</p>
                <p className="text-[12px] font-bold text-slate-800 font-mono mt-1">{item.matricule_vehicule}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5">
              <div className="w-7 h-7 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <CreditCard size={13} className="text-blue-700" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prix payé</p>
                <p className="text-[13px] font-bold text-emerald-600 mt-1">{Number(item.prix).toLocaleString('fr-FR')} F</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Calendar size={12} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Période</span>
            </div>
            <div className="px-4 divide-y divide-slate-100">
              {[
                { label: 'Date de début', value: fmtDate(item.date_debut) },
                { label: 'Date de fin',   value: fmtDate(item.date_fin)   },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-3">
                  <span className="text-[12px] text-slate-500">{row.label}</span>
                  <span className="text-[12px] font-semibold text-slate-800 font-mono">{row.value}</span>
                </div>
              ))}
              {item.statut === 'actif' && (
                <div className="flex items-center justify-between py-3">
                  <span className="text-[12px] text-slate-500">Jours restants</span>
                  <span className={`text-[12px] font-bold font-mono ${soon ? 'text-orange-600' : days <= 0 ? 'text-red-500' : 'text-blue-700'}`}>
                    {days > 0 ? `${days}j` : 'Expiré'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Expiry warning */}
          {soon && (
            <div className="flex items-start gap-2.5 px-4 py-3.5 bg-orange-50 border border-orange-100 rounded-xl">
              <Clock size={13} className="text-orange-600 shrink-0 mt-0.5" strokeWidth={2} />
              <p className="text-[12px] text-orange-800 leading-relaxed">
                Cet abonnement expire dans <strong>{days} jour{days > 1 ? 's' : ''}</strong>. Pensez à relancer le client.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors active:scale-[0.98]">
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}