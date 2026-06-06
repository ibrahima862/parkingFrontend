import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom'; 
import { AdminSidebar } from '../../components/layout/Admin/AdminSidebar';

// On réutilise tes constantes pour la cohérence
const SIDEBAR_FULL = 232;
const SIDEBAR_MINI = 58;

export function AdminLayout() {
  // Initialisation synchronisée avec le localStorage pour éviter le "flicker"
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminSidebarCollapsed') ?? 'false');
    } catch {
      return false;
    }
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calcul de la marge dynamique propre au design SaaS
  // Sur mobile, l'AdminSidebar est probablement un drawer (fixed), donc marge = 0
  const dynamicMargin = isMobile ? 0 : (collapsed ? SIDEBAR_MINI : SIDEBAR_FULL);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
      
      {/* ── SIDEBAR ── */}
      <AdminSidebar 
        user={user} 
        onCollapseChange={(c) => {
          setCollapsed(c);
          localStorage.setItem('adminSidebarCollapsed', JSON.stringify(c));
        }}
        initials={user?.name?.substring(0, 2).toUpperCase() || 'AD'}
      />
      
      {/* ── MAIN CONTENT ── */}
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out"
        style={{ marginLeft: dynamicMargin }}
      >
        <main>
          {/* Container "Airbnb style" pour une lecture confortable */}
          <div className="max-w-[1600px] mx-auto">
            <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;