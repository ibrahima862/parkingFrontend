import { useState, useEffect, useMemo } from "react"; // Ajout de useMemo pour la performance
import { 
  ChevronDown, MapPin, LayoutDashboard, LogOut, Menu, X, 
  Zap, Smartphone, ShieldCheck, Calendar, CreditCard, 
  User
} from "lucide-react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom"; // Ajout de Outlet

/* ─── NAV LINK COMPONENT ─── */
function NavLink({ to, label, active,scrolled}: { to: string; label: string; active: boolean,scrolled:boolean }) {
  return (
    <Link to={to}
      className={`relative text-[11px] font-black uppercase tracking-widest transition-colors pb-0.5
        ${scrolled ?'text-[#ececec]':'text-[#d1d1d1]'}`}>
      {label}
      {active && (
        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-orange-500 rounded-full" />
      )}
    </Link>
  );
}

/* ═══════════════════════════════════
    LAYOUT PRINCIPAL (CORRIGÉ)
═══════════════════════════════════ */
export function BecomePartnerLayout() { // Suppression de ({ children })
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Récupération des données utilisateur centralisée
  const auth = useMemo(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const rawUser = localStorage.getItem('user');
    let userData = null;
    try {
      userData = rawUser ? JSON.parse(rawUser) : null;
    } catch (e) {
      console.error("Erreur parsing user", e);
    }
    return { token, role, user: userData };
  }, [location.pathname]);

  const initials = useMemo(() => {
    if (!auth.user?.name) return 'U';
    return auth.user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  }, [auth.user]);

  const isPremium = auth.user?.subscription === 'premium' || auth.role === 'admin';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const dashHref = auth.role === 'admin' 
    ? '/admin/dashboard' 
    : auth.role === 'proprietaireparking' 
      ? '/partner/dashboard' 
      : '/profile';

  const NAV_LINKS = [
    { to: '/parking-lots', label: 'Trouver un parking' },
    { to: '/becomepartner', label: 'Devenir partenaire' },
    { to: '/help', label: 'Aide' },
  ];
console.log(auth.role)
  return (
    <div className="min-h-screen bg-zinc-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      {/* ══ NAV ══ */}
      <nav className="h-16 px-5 md:px-10 flex items-center justify-between sticky top-0 z-50 transition-all duration-300
         bg-[#0e0091] backdrop-blur-md border-b border-zinc-100 shadow-sm border-b border-zinc-100'
      ">
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 bg-blue-900 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300 shadow-sm">
            <MapPin size={13} className="text-white" fill="currentColor" />
          </div>
          <span className={`text-[15px] font-black  tracking-tighter uppercase ${scrolled?'text-[#ffffff]':'text-[#111111]'}`}>
            Senova<span className="text-orange-500">Park</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-10">
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} label={l.label} active={isActive(l.to)} scrolled={scrolled} />
          ))}
        </div>

        <div className="flex items-center gap-3">


          {!auth.token ? (
            <Link to="/login" className="h-9 px-5 bg-blue-900 text-white text-[11px] font-bold rounded-xl hover:bg-orange-500 transition-all shadow-sm flex items-center">
              CONNEXION
            </Link>
          ) : (
            <div className="flex items-center gap-2">

              <div className="relative group">
                <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 group-hover:border-blue-300 transition-all">
                  <div className="w-6 h-6 rounded-lg bg-blue-900 flex items-center justify-center text-[10px] font-black text-white">
                    {initials}
                  </div>
                  <ChevronDown size={10} className="text-zinc-400 group-hover:rotate-180 transition-transform" />
                </button>

                <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-50">
                  <div className="w-56 bg-white border border-zinc-100 rounded-2xl shadow-2xl p-2 space-y-1">
                    <Link to={dashHref} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-zinc-600 hover:text-blue-900 transition-colors">
                      <User size={14} />
                      <span className="text-[12px] font-bold">Compte</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-rose-500 transition-colors">
                      <LogOut size={14} />
                      <span className="text-[12px] font-bold">Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ══ CONTENU DYNAMIQUE ══ */}
      <main className="min-h-[70vh]">
        <Outlet />
      </main>


           {/* ══ FOOTER ══ */}
      <footer className="bg-[#060F2A] text-zinc-500 py-16 px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5 mb-6">
              <div className="w-7 h-7 bg-blue-900 rounded-lg flex items-center justify-center">
                <MapPin size={12} className="text-white" fill="currentColor" />
              </div>
              <span className="text-[15px] font-black text-white tracking-tighter uppercase">
                Senova<span className="text-orange-500">Park</span>
              </span>
            </div>
            <p className="text-[12px] leading-relaxed">
              La solution intelligente pour se garer à Dakar, Thiès et Saint-Louis.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Navigation</h4>
            <ul className="space-y-3 text-[12px]">
              <li><Link to="/parking-lots" className="hover:text-orange-500 transition-colors">Trouver une place</Link></li>
              <li><Link to="/proposer" className="hover:text-orange-500 transition-colors">Ajouter un parking</Link></li>
              <li><Link to="/aide" className="hover:text-orange-500 transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Légal</h4>
            <ul className="space-y-3 text-[12px]">
              <li><a href="#" className="hover:text-orange-500">Mentions légales</a></li>
              <li><a href="#" className="hover:text-orange-500">Confidentialité</a></li>
              <li><a href="#" className="hover:text-orange-500">CGU</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Application</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors">
                <Smartphone size={14} className="text-zinc-400" />
                <span className="text-[11px] text-white font-bold uppercase tracking-tighter">Google Play</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest">
          <p>© 2026 SenovaPark. Sénégal.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-blue-500" /> SSL Sécurisé</span>
            <span className="flex items-center gap-1.5"><Zap size={12} className="text-orange-500" /> PayTech Garanti</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default BecomePartnerLayout;