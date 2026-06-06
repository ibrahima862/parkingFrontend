import { useState, useEffect } from 'react';
import axios from 'axios';
import { ItemData  } from '../type';
import {
  User, Calendar, CreditCard, Settings,
   Bell, Car,
} from 'lucide-react';
import { Notification } from './Notifications';
import { VehiculeType, Vehicule } from '../type';
import { VehiculesManager } from '../components/Partner/userProfile/VehiculeManager';
import { ReservationsList } from '../components/Partner/userProfile/ReservationList';
import { ProfileSection } from '../components/Partner/userProfile/ProfileSection';
import { CardSkeleton } from '../components/ui/CardSkeleton';
import { SubscriptionsList } from '../components/Partner/userProfile/SubscriptionList';


/* ══════════════════════ MAIN ══════════════════════ */
const TABS = [
  { id:'reservations', label:'Réservations', icon:Calendar  },
  { id:'abonnements',  label:'Abonnements',  icon:CreditCard },
  { id:'vehicules', label:'Véhicules', icon:Car },
  { id:'messages',     label:'Messages',     icon:Bell       },
  { id:'profil',       label:'Profil',       icon:Settings   },
];

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState('reservations');
  const [loading,   setLoading]   = useState(true);
  const [data, setData] = useState<{ abonnements: ItemData[]; reservations: ItemData[]; vehicules: Vehicule[]; categories: VehiculeType[]; user: any }>({ abonnements:[], reservations:[], vehicules: [], categories: [], user: null });
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${(import.meta as any).env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setData({
        abonnements: res.data.abonnements||[],
        reservations: res.data.reservations||[],
        vehicules: res.data.vehicules||[],
        categories: res.data.categories||[],
        user: res.data.user||null
      });
    } catch(e){ console.error(e); } finally { setLoading(false); }
  };

  useEffect(()=>{ fetchProfile(); },[]);

  const counts = { reservations: data.reservations.length, abonnements: data.abonnements.length };
 
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">

      {/* ── Hero header ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-5 pt-8 pb-6">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20"
              style={{background:'linear-gradient(135deg,#1B3FA0,#2B52C8)'}}>
              <User size={24} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-slate-900 leading-tight">Mon Espace</h1>
              <p className="text-[13px] text-slate-400 mt-0.5">Gérez vos stationnements</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
              <div className="w-8 h-8 rounded-lg bg-[#1B3FA0] flex items-center justify-center shrink-0">
                <Calendar size={14} color="#fff" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[20px] font-bold text-[#1B3FA0] leading-none">{counts.reservations}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Réservations</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 border border-violet-100">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                <CreditCard size={14} color="#fff" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[20px] font-bold text-violet-700 leading-none">{counts.abonnements}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Abonnements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky tabs ── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 flex overflow-x-auto scrollbar-hide">
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            const count  = tab.id === 'reservations' ? counts.reservations : tab.id === 'abonnements' ? counts.abonnements : 0;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-3.5 px-4 text-[12px] font-semibold border-b-2 shrink-0 transition-all
                  ${active ? 'border-[#1B3FA0] text-[#1B3FA0]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                <tab.icon size={14} strokeWidth={active ? 2.5 : 2}  />
                {tab.label}
                {count > 0 && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-[#e27602] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-4 mt-4">
        {loading ? (
          <div className="flex flex-col gap-3">{[1,2,3].map(i=><CardSkeleton key={i}/>)}</div>
        ) : (
          <div key={activeTab}>
            {activeTab === 'reservations' && <ReservationsList items={data.reservations} onRefresh={fetchProfile} />}
            {activeTab === 'abonnements'  && <SubscriptionsList items={data.abonnements} />}
            {activeTab === 'vehicules' && <VehiculesManager initialVehicules={data.vehicules} categories={data.categories} onRefresh={fetchProfile}  />}
            {activeTab === 'messages'     && <Notification />}
            {activeTab === 'profil'       && <ProfileSection userData={data.user} onRefresh={fetchProfile} />}
          </div>
        )}
      </main>
    </div>
  );
}