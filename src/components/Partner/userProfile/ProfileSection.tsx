import { useState } from 'react';
import { User, Star, Settings, ChevronRight, LogOut, ArrowLeft, Save, Mail, Phone } from 'lucide-react';
import axios from 'axios';

const inp = "w-full py-2.5 pl-9 pr-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300 text-gray-900";
const lbl = "text-[11px] font-semibold text-gray-500 uppercase tracking-wider";

export function ProfileSection({ userData, onRefresh }: { userData: any; onRefresh: () => void }) {
  const [view, setView] = useState<'menu' | 'infos' | 'favoris' | 'prefs'>('menu');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name:  userData?.name  || '',
    email: userData?.email || '',
    phone: userData?.telephone || '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(p => ({ ...p, [k]: e.target.value }));

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `${(import.meta as any).env.VITE_API_URL}/api/client/profile/update`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      onRefresh();
      setView('menu');
    } catch {
      alert('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  /* ── Sous-vue : Informations ── */
  if (view === 'infos') return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <button onClick={() => setView('menu')}
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-blue-700 hover:border-blue-200 transition-colors">
          <ArrowLeft size={14} />
        </button>
        <span className="text-[13px] font-bold text-slate-800">Mes informations</span>
      </div>

      <form onSubmit={handleUpdate} className="p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={lbl}>Nom complet</label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={formData.name} onChange={set('name')} placeholder="Votre nom" className={inp} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={lbl}>Adresse email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="email" value={formData.email} onChange={set('email')} placeholder="email@exemple.com" className={inp} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={lbl}>telephone</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="tel" value={formData.phone} onChange={set('phone')} placeholder="Numéro de téléphone" className={inp} />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={() => setView('menu')}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.98] disabled:opacity-50">
            {loading
              ? <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Enregistrement…</>
              : <><Save size={13} className="text-orange-400" /> Sauvegarder</>
            }
          </button>
        </div>
      </form>
    </div>
  );

  /* ── Sous-vue : Favoris ── */
  if (view === 'favoris') return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <button onClick={() => setView('menu')}
          className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-blue-700 hover:border-blue-200 transition-colors">
          <ArrowLeft size={14} />
        </button>
        <span className="text-[13px] font-bold text-slate-800">Mes favoris</span>
      </div>
      <div className="flex flex-col items-center gap-2 py-12 px-6 text-center">
        <div className="w-11 h-11 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center mb-1">
          <Star size={20} className="text-orange-400" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] font-semibold text-slate-600">Aucun favori pour le moment</p>
        <p className="text-[12px] text-slate-400">Vos parkings enregistrés apparaîtront ici.</p>
      </div>
    </div>
  );

  /* ── Vue principale : Menu ── */
  const ITEMS = [
    {
      key: 'infos'   as const,
      icon: User,
      label: 'Mes informations',
      sub: userData?.name || 'Gérer mon identité',
      iconBg: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-700',
      hover: 'hover:border-blue-200',
    },
    {
      key: 'favoris' as const,
      icon: Star,
      label: 'Mes favoris',
      sub: 'Parkings enregistrés',
      iconBg: 'bg-orange-50 border-orange-100',
      iconColor: 'text-orange-500',
      hover: 'hover:border-orange-200',
    },
    {
      key: 'prefs'   as const,
      icon: Settings,
      label: 'Préférences',
      sub: 'Notifications et langue',
      iconBg: 'bg-slate-100 border-slate-200',
      iconColor: 'text-slate-500',
      hover: 'hover:border-slate-300',
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {ITEMS.map(({ key, icon: Icon, label, sub, iconBg, iconColor, hover }) => (
        <button key={key} onClick={() => setView(key)}
          className={`bg-white border border-slate-200 ${hover} rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all group hover:shadow-[0_2px_8px_rgba(29,78,216,0.06)] cursor-pointer w-full text-left`}>
          <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon size={15} className={iconColor} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-800">{label}</p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{sub}</p>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      ))}

      <button
        onClick={() => { if (confirm('Se déconnecter de SenovaPark ?')) { localStorage.clear(); window.location.href = '/'; } }}
        className="mt-3 flex items-center justify-center gap-2 py-3 px-4 text-red-500 text-[13px] font-bold hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all">
        <LogOut size={14} /> Déconnexion
      </button>
    </div>
  );
}