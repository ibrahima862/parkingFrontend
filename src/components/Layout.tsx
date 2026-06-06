import React, { useState, useEffect, useMemo } from "react";
import { MapPin, LogOut, Menu, X, ChevronDown, User, Sparkles } from "lucide-react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "./NotificationBell";

const NAV_LINKS = [
  { to: '/parking-lots',   label: 'Trouver un parking' },
  { to: '/becomepartner',  label: 'Devenir partenaire'  },
  { to: '/help',           label: 'Aide'                },
];

const FOOTER_COLS = [
  {
    title: 'Explorer',
    links: [
      { to: '/parking-lots',  label: 'Parkings disponibles' },
      { to: '/becomepartner', label: 'Espace Propriétaire'  },
      { to: '/help',          label: "Centre d'aide"        },
    ],
  },
  {
    title: 'Légal',
    links: [
      { to: '/cgu',     label: 'CGU & Vente'     },
      { to: '/privacy', label: 'Confidentialité' },
    ],
  },
];

export function Layout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);

  const auth = useMemo(() => {
    const token   = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');
    let user = null;
    try { user = rawUser ? JSON.parse(rawUser) : null; } catch {}
    return { token, role: user?.role || localStorage.getItem('role'), user };
  }, [location.pathname]);

  const initials = useMemo(() =>
    auth.user?.name
      ? auth.user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
      : 'U',
  [auth.user]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); setDropOpen(false); }, [location.pathname]);

  const dashHref = auth.role === 'admin'
    ? '/admin/dashboard'
    : auth.role === 'proprietaireparking'
    ? '/partner/dashboard'
    : '/profile';

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* ── Navbar ── */}
      <nav className={`h-15 px-4 md:px-8 flex items-center justify-between sticky top-0 z-[60] transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm' : 'bg-white border-b border-slate-100'
      }`} style={{ height: 60 }}>
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center">
            <MapPin size={14} className="text-white" fill="currentColor" />
          </div>
          <span className="text-[15px] font-black text-slate-900 tracking-tight">
            Senova<span className="text-orange-500">Park</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(l => {
            const active = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to}
                className={`relative px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${
                  active ? 'text-blue-700 bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}>
                {l.label}
                {active && (
                  <motion.span layoutId="nav-dot"
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-700" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <NotificationBell />

          {!auth.token ? (
            <>
              <Link to="/login"
                className="hidden sm:flex items-center h-9 px-4 border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-700 text-slate-600 text-[13px] font-semibold rounded-xl transition-colors">
                Connexion
              </Link>
              <Link to="/register"
                className="hidden sm:flex items-center gap-1.5 h-9 px-4 bg-blue-700 hover:bg-blue-800 text-white text-[13px] font-bold rounded-xl transition-colors active:scale-95">
                <Sparkles size={13} className="text-orange-400" /> S'inscrire
              </Link>
            </>
          ) : (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setDropOpen(v => !v)}
                className="flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-700 flex items-center justify-center text-[10px] font-black text-white">
                  {initials}
                </div>
                <span className="text-[13px] font-semibold text-slate-700 max-w-[100px] truncate hidden md:block">
                  {auth.user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <>
                    <div className="fixed inset-0 z-[55]" onClick={() => setDropOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-[60]"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-[13px] font-bold text-slate-800 truncate">{auth.user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{auth.user?.email}</p>
                      </div>
                      <div className="p-1.5">
                        <Link to={dashHref}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[13px] font-semibold transition-colors">
                          <User size={14} /> Mon compte
                        </Link>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-red-50 text-red-500 text-[13px] font-semibold transition-colors text-left">
                          <LogOut size={14} /> Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile burger */}
          <button onClick={() => setMenuOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-blue-300 transition-colors">
            <Menu size={16} strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/40 z-[70]" />

            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-[280px] bg-white z-[80] shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-700 rounded-lg flex items-center justify-center">
                    <MapPin size={12} className="text-white" fill="currentColor" />
                  </div>
                  <span className="text-[14px] font-black text-slate-900">
                    Senova<span className="text-orange-500">Park</span>
                  </span>
                </div>
                <button onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex flex-col p-4 gap-1 flex-1">
                {NAV_LINKS.map(l => {
                  const active = location.pathname === l.to;
                  return (
                    <Link key={l.to} to={l.to}
                      className={`px-4 py-3 rounded-xl text-[14px] font-semibold transition-colors ${
                        active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}>
                      {l.label}
                    </Link>
                  );
                })}

                <div className="h-px bg-slate-100 my-2" />

                {auth.token ? (
                  <>
                    {auth.user && (
                      <div className="px-4 py-3 bg-slate-50 rounded-xl mb-1">
                        <p className="text-[13px] font-bold text-slate-800">{auth.user.name}</p>
                        <p className="text-[11px] text-slate-400">{auth.user.email}</p>
                      </div>
                    )}
                    <Link to={dashHref}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      <User size={15} /> Mon compte
                    </Link>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-colors text-left">
                      <LogOut size={15} /> Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-1">
                    <Link to="/login"
                      className="w-full py-3 border border-slate-200 rounded-xl text-[14px] font-semibold text-slate-700 hover:bg-slate-50 text-center transition-colors">
                      Connexion
                    </Link>
                    <Link to="/register"
                      className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white text-[14px] font-bold rounded-xl text-center transition-colors active:scale-95">
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400">

        {/* CTA band */}
        <div className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Rejoignez-nous</p>
              <h3 className="text-[20px] font-black text-white tracking-tight">
                Stationnez plus simplement.
              </h3>
              <p className="text-[13px] text-slate-400 mt-1">Trouvez une place en quelques secondes, partout à Dakar.</p>
            </div>
            <Link to="/parking-lots"
              className="shrink-0 flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-bold rounded-xl transition-colors active:scale-95 whitespace-nowrap">
              <MapPin size={14} /> Trouver un parking
            </Link>
          </div>
        </div>

        {/* Main footer */}
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-700 rounded-xl flex items-center justify-center">
                  <MapPin size={13} className="text-white" fill="currentColor" />
                </div>
                <span className="text-[15px] font-black text-white tracking-tight">
                  Senova<span className="text-orange-500">Park</span>
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-slate-400 max-w-xs">
                Simplifiez votre stationnement urbain. Trouvez, réservez et payez votre place en quelques clics.
              </p>
              <div className="flex gap-2 mt-5">
                {['Twitter', 'LinkedIn', 'Instagram'].map(s => (
                  <a key={s} href="#"
                    className="px-3 py-1.5 bg-white/[.07] border border-white/10 rounded-lg text-[11px] font-semibold text-white/50 hover:text-white hover:border-white/20 transition-all">
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Cols */}
            {FOOTER_COLS.map(col => (
              <div key={col.title}>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-4">{col.title}</p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map(l => (
                    <li key={l.to}>
                      <Link to={l.to}
                        className="text-[13px] text-slate-400 hover:text-white transition-colors font-medium">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-4">Contact</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-orange-500 shrink-0" />
                  <span className="text-[13px] text-slate-400">Dakar, Sénégal</span>
                </div>
                <a href="mailto:contact@senovapark.sn"
                  className="text-[13px] text-orange-400 hover:text-orange-300 transition-colors font-medium">
                  contact@senovapark.sn
                </a>
              </div>

              <Link to="/becomepartner"
                className="inline-flex items-center gap-1.5 mt-5 px-4 py-2.5 bg-white/[.07] border border-white/10 rounded-xl text-[12px] font-bold text-white/70 hover:text-white hover:border-white/20 transition-all">
                <Sparkles size={12} className="text-orange-400" />
                Devenir partenaire
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/30 font-medium">
              © {new Date().getFullYear()} SenovaPark S.N.R · Tous droits réservés
            </p>
            <div className="flex items-center gap-4">
              <Link to="/cgu"     className="text-[11px] text-white/30 hover:text-white/60 transition-colors">CGU</Link>
              <Link to="/privacy" className="text-[11px] text-white/30 hover:text-white/60 transition-colors">Confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;