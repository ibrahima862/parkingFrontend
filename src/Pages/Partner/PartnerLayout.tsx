import { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Activity, RefreshCw, QrCode } from 'lucide-react'; 
import { Sidebar, SIDEBAR_FULL, SIDEBAR_MINI } from '../../components/Sidebar'; 
import { DashboardStatus } from '../../components/Partner/Dashbaord/DashboardEmptyState';

const B = '#2563EB'; 
const T3 = '#454D63';

interface ParkingItem {
  id: number;
  statut: 'valide' | 'en_attente' | 'rejete';
  nom: string;
}

export function PartnerLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [collapsed, setCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sidebarCollapsed') ?? 'false'); }
    catch { return false; }
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [isRefreshingBookings, setIsRefreshingBookings] = useState(false);
  const [scanner,    setScanner] = useState(false);
  const [parkings, setParkings] = useState<ParkingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isBookingsPage = location.pathname.includes('/bookings');

  // Écouteurs Internet Online/Offline
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Écouteurs pour l'état de rafraîchissement depuis la page Bookings
  useEffect(() => {
    const handleStart = () => setIsRefreshingBookings(true);
    const handleStop = () => setIsRefreshingBookings(false);
    window.addEventListener('bookings-refresh-start', handleStart);
    window.addEventListener('bookings-refresh-stop', handleStop);
    return () => {
      window.removeEventListener('bookings-refresh-start', handleStart);
      window.removeEventListener('bookings-refresh-stop', handleStop);
    };
  }, []);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/api/partenaire/parkings`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setParkings(Array.isArray(data) ? data : data.data ?? []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkStatus]);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Tableau de bord';
    if (path.includes('/bookings')) return 'Flux Parking'; // Ajusté pour matcher ton ancien sous-titre
    if (path.includes('/parking-lots/new')) return 'Ajouter un parking';
    if (path.includes('/parking-lots')) return 'Mes Espaces';
    if (path.includes('/analytics')) return 'Analyses & Trafic';
    if (path.includes('/earnings')) return 'Gains & Versements';
    return 'Espace Partenaire';
  };

  const handleRefreshClick = () => {
    if (isBookingsPage) {
      // Déclenche l'action de rafraîchissement dans le composant de la page Bookings
      window.dispatchEvent(new CustomEvent('trigger-bookings-refresh'));
    } else {
      checkStatus();
    }
  };

  const handleScannerClick = () => {
    // Déclenche l'ouverture du scanner dans le composant Bookings
    window.dispatchEvent(new CustomEvent('trigger-bookings-scanner'));
  };

  const renderContent = () => {
    if (loading) return <div className="p-6 text-center text-sm text-zinc-500">Chargement de la console...</div>;
    if (!parkings.length) return null;
    const isApproved = parkings.some(p => p.statut === 'valide');
    if (!isApproved) return <DashboardStatus parkingName={parkings[0].nom} />;
    return <Outlet />;
  };

  const dynamicMargin = isMobile ? 0 : (collapsed ? SIDEBAR_MINI : SIDEBAR_FULL);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex relative">
  
      <Sidebar 
        user={user} 
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onCollapseChange={(val) => {
            setCollapsed(val);
            localStorage.setItem('sidebarCollapsed', JSON.stringify(val));
        }}
        initials={user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : 'SP'}
      />
      
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out"
        style={{ marginLeft: dynamicMargin }}
      >
        {/* ── HEADER GÉNÉRALISÉ UNIQUE ET INTELLIGENT ── */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-zinc-200">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            
            {/* CÔTÉ GAUCHE : NAVIGATION & TITRES */}
            <div className="flex items-center gap-3 min-w-0">
              {isMobile && (
                <button 
                  onClick={() => setMenuOpen(true)} 
                  className="w-8 h-8 rounded-lg bg-[#0F2A43] border-none flex items-center justify-center cursor-pointer shadow-sm mr-1 shrink-0"
                >
                  <Menu size={14} className="text-white" />
                </button>
              )}

              

              <div className="min-w-0">
                <p className="text-[13px] font-bold text-zinc-900 leading-none truncate">
                  {getPageTitle()}
                </p>
                <p className="text-[10px] font-medium mt-[3px] text-zinc-400 truncate">
                  {isBookingsPage ? 'Entrées & sorties en temps réel' : 'SenovaPark • Espace Partenaire'}
                </p>
              </div>
            </div>

            {/* CÔTÉ DROIT : ACTIONS */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Statut internet (Masqué en tout petit mobile si besoin, ou conservé) */}
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${online ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="hidden xs:block">{online ? 'En ligne' : 'Hors ligne'}</span>
              </span>

              {/* BOUTON SCANNER EXTRA : Apparaît uniquement sur la page flux et réservations */}
              {isBookingsPage && (
                <button 
                  onClick={handleScannerClick}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1c0098] hover:bg-blue-600 text-white text-[12px] font-semibold transition-colors border-none cursor-pointer"
                >
                  <QrCode size={13}/> 
                  <span className="hidden sm:block">Scanner</span>
                </button>
              )}
              
              {/* BOUTON REFRESH MUTUALISÉ */}
              <button 
                onClick={handleRefreshClick} 
                disabled={isRefreshingBookings}
                className="w-8 h-8 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw size={13} className={isRefreshingBookings || (loading && !isBookingsPage) ? 'animate-spin' : ''} />
              </button>
              
              {/* AVATAR USER */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: B }}>
                {user?.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) || 'SP'}
              </div>
            </div>

          </div>
        </header>

        {/* CONTENU DE LA PAGE */}
        <main className="flex-1 p-4">
          <div className="max-w-[1320px] min-h-[calc(100vh-56px)] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PartnerLayout;