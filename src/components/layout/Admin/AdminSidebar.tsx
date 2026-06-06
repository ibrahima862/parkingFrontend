// components/Sidebar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    LogOut, ChevronLeft, X,
    Car,
    Activity,
    MapPin,
    Users,
    Building2,
    BarChart3,
    CreditCard,
    Menu,

} from 'lucide-react';
import { useState, useEffect, createContext, useContext } from 'react';

/* ══════════════════════════════════════════════════
   DESIGN TOKENS  — exported for consumers
══════════════════════════════════════════════════ */
export const T = {
    /* Surfaces */
    bg: '#F4F5F9',
    surface: '#FFFFFF',
    surfaceAlt: '#F8F9FC',
    surfaceHov: '#F2F3F8',

    /* Ink */
    ink: '#0C0E14',
    inkMid: '#454D63',
    inkLight: '#8990A8',
    inkFaint: '#C8CEDF',

    /* Brand */
    brand: '#2563EB',
    brandHover: '#1D4ED8',
    brandSoft: '#EFF4FF',
    brandBorder: '#BFCFFF',

    /* Lines */
    line: '#EAECF4',
    lineHover: '#D4D9EC',

    /* Semantic */
    green: '#0EA674',
    greenBg: '#EDFAF4',
    greenLine: '#A3E6CC',

    amber: '#C97B00',
    amberBg: '#FFF7E6',
    amberLine: '#FFD97A',

    red: '#DC3545',
    redBg: '#FFF1F1',
    redLine: '#FFB8BC',

    /* Sidebar (dark) */
    sidebar: '#0C0E14',
    sidebarLine: 'rgba(255,255,255,0.06)',
    sidebarText: '#6B7280',
    sidebarHover: 'rgba(255,255,255,0.05)',
    sidebarActive: 'rgba(255,255,255,0.08)',
};

/* ══════════════════════════════════════════════════
   CONTEXT
══════════════════════════════════════════════════ */
interface SidebarCtx { collapsed: boolean; sidebarWidth: number; }
export const SidebarContext = createContext<SidebarCtx>({ collapsed: false, sidebarWidth: 232 });
export const useSidebar = () => useContext(SidebarContext);

export const SIDEBAR_FULL = 232;
export const SIDEBAR_MINI = 58;

/* ══════════════════════════════════════════════════
   PROPS
══════════════════════════════════════════════════ */
interface SidebarProps {
    user?: { name?: string; email?: string };
    initials?: string;
    collapsible?: boolean;
    onCollapseChange?: (c: boolean) => void;
}

/* ══════════════════════════════════════════════════
   NAV STRUCTURE
══════════════════════════════════════════════════ */
const SECTIONS = [
    {
        label: 'Supervision',
        items: [
            { to: '/admin/dashboard', icon: LayoutDashboard, label: "Tableau de Bord" },
            { to: '/admin/bookings', icon: Activity, label: 'Toutes les Réservations' },
            { to: '/admin/parking-lots', icon: MapPin, label: 'Parc Automobile' },
        ],
    },
    {
        label: 'Communauté',
        items: [
            { to: '/admin/partners', icon: Building2, label: 'Partenaires' },
            { to: '/admin/users', icon: Users, label: 'Conducteurs' },
            { to: '/admin/reports', icon: Users, label: 'Signalements' },
        ],
    },
    {
        label: 'Finance Globale',
        items: [
            { to: '/admin/payouts', icon: CreditCard, label: 'Demandes de Retrait' }, // Là où tu gères Wave/OM
            { to: '/admin/transactions', icon: BarChart3, label: 'Flux de Paiements' },
            { to: '/admin/refund', icon: Users, label: 'Remboursements' },
        ],
    },

];

/* ══════════════════════════════════════════════════
   SIDEBAR COMPONENT
══════════════════════════════════════════════════ */
export function AdminSidebar({ user, initials = 'SP', collapsible = true, onCollapseChange }: SidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try { return JSON.parse(localStorage.getItem('sidebarCollapsed') ?? 'false'); }
        catch { return false; }
    });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const fn = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);

    const toggle = () => {
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
        onCollapseChange?.(next);
    };

    const isActive = (path: string) => location.pathname === path;

    /* ─── Shared inner content ─── */
    const Inner = ({ forceFull = false }: { forceFull?: boolean }) => {
        const mini = !forceFull && collapsed && !isMobile;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

                {/* ── Logo bar ── */}
                <div style={{
                    height: 56, flexShrink: 0,
                    display: 'flex', alignItems: 'center',
                    justifyContent: mini ? 'center' : 'space-between',
                    padding: mini ? '0' : '0 14px 0 16px',
                    borderBottom: `1px solid ${T.sidebarLine}`,
                }}>
                    {mini ? (
                        /* Collapsed: just the logo icon, click to expand */
                        <button onClick={toggle} title="Étendre"
                            style={{ width: 30, height: 30, borderRadius: 7, background: T.brand, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = T.brandHover}
                            onMouseLeave={e => e.currentTarget.style.background = T.brand}>
                            <Car size={13} color="#fff" strokeWidth={2.5} />
                        </button>
                    ) : (
                        /* Expanded: logo + collapse button */
                        <>
                            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
                                <div style={{ width: 28, height: 28, borderRadius: 7, background: T.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Car size={13} color="#fff" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15 }}>SenovaPark</div>
                                    <div style={{ fontSize: 9, fontWeight: 600, color: T.sidebarText, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 1 }}>Console Partner</div>
                                </div>
                            </Link>
                            {collapsible && !isMobile && (
                                <button onClick={toggle}
                                    style={{ width: 24, height: 24, borderRadius: 6, background: 'transparent', border: `1px solid ${T.sidebarLine}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.sidebarText, flexShrink: 0, transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = T.sidebarHover; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.sidebarText; e.currentTarget.style.borderColor = T.sidebarLine; }}>
                                    <ChevronLeft size={12} strokeWidth={2.5} />
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* ── Nav ── */}
                <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column' }}>
                    {SECTIONS.map((section, si) => (
                        <div key={section.label} style={{ marginBottom: mini ? 4 : 18 }}>
                            {/* Section label */}
                            {!mini && (
                                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', padding: '0 10px', marginBottom: 4, marginTop: si > 0 ? 0 : 2 }}>
                                    {section.label}
                                </div>
                            )}
                            {/* Separator in mini mode */}
                            {mini && si > 0 && (
                                <div style={{ height: 1, background: T.sidebarLine, margin: '4px 10px 6px' }} />
                            )}

                            {section.items.map(item => {
                                const active = isActive(item.to);
                                return (
                                    <Link key={item.to} to={item.to}
                                        onClick={() => isMobile && setDrawerOpen(false)}
                                        title={mini ? item.label : undefined}
                                        style={{
                                            display: 'flex', alignItems: 'center',
                                            gap: mini ? 0 : 9,
                                            padding: mini ? '9px 0' : '7px 10px',
                                            justifyContent: mini ? 'center' : 'flex-start',
                                            borderRadius: 7, marginBottom: 1,
                                            textDecoration: 'none',
                                            background: active ? T.sidebarActive : 'transparent',
                                            color: active ? '#E8EAED' : T.sidebarText,
                                            fontSize: 13,
                                            fontWeight: active ? 600 : 400,
                                            transition: 'all 0.1s',
                                            position: 'relative',
                                        }}
                                        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = T.sidebarHover; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; } }}
                                        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = T.sidebarText; } }}
                                    >
                                        {/* Active indicator */}
                                        {active && !mini && (
                                            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 2, height: 14, borderRadius: '0 2px 2px 0', background: T.brand }} />
                                        )}
                                        <item.icon size={15} strokeWidth={active ? 2.2 : 1.8} className='text-orange-500' />
                                        {!mini && <span style={{ flex: 1 }}>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* ── User footer ── */}
                <div className='border border-gray-200'>
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: mini ? 0 : 9,
                        padding: mini ? '8px 0' : '7px 10px',
                        justifyContent: mini ? 'center' : 'flex-start',
                        borderRadius: 7, cursor: 'pointer',
                        transition: 'background 0.12s',
                    }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.sidebarHover}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                        onClick={() => navigate('/partenaire/settings')}>

                        {/* Avatar */}
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: T.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: '0.02em', userSelect: 'none' }}>
                            {initials}
                        </div>

                        {!mini && (
                            <>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#D1D5DB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user?.name ?? 'Propriétaire'}
                                    </div>
                                    <div style={{ fontSize: 10, color: T.sidebarText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                                        {user?.email ?? 'compte@senovapark.sn'}
                                    </div>
                                </div>
                                <button
                                    onClick={e => { e.stopPropagation(); localStorage.clear(); navigate('/login'); }}
                                    title="Se déconnecter"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.sidebarText, padding: 4, borderRadius: 5, display: 'flex', alignItems: 'center', transition: 'color 0.12s', flexShrink: 0 }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#F87171'}
                                    onMouseLeave={e => e.currentTarget.style.color = T.sidebarText}>
                                    <LogOut size={13} strokeWidth={2} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    /* ─── Mobile: drawer ─── */
    if (isMobile) {
        return (
            <>
                {/* Burger */}
                <button onClick={() => setDrawerOpen(true)}
                    style={{ position: 'fixed', top: 14, left: 14, zIndex: 300, width: 36, height: 36, borderRadius: 9, background: T.sidebar, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                    <Menu size={16} color="#fff" />
                </button>

                {/* Backdrop */}
                {drawerOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                        onClick={() => setDrawerOpen(false)} />
                )}

                {/* Drawer */}
                <aside className={`fixed top-0 left-0 h-full w-[260px] bg-[#0F2A43] z-[201] flex flex-col transition-transform duration-250 ease-in-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <button onClick={() => setDrawerOpen(false)} className="absolute top-[13px] right-[13px] z-[1] w-[28px] h-[28px] rounded-[6px] bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer text-gray-500">
                        <X size={13} />
                    </button>
                    <Inner forceFull />
                </aside>
            </>
        );
    }

    /* ─── Desktop: fixed sidebar ─── */
    const w = collapsed ? SIDEBAR_MINI : SIDEBAR_FULL;
    return (
        <SidebarContext.Provider value={{ collapsed, sidebarWidth: w }}>
            <aside className='bg-[#0F2A43]' style={{
                position: 'fixed', left: 0, top: 0, height: '100%', width: w,
                display: 'flex', flexDirection: 'column',
                transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
                zIndex: 40, overflow: 'hidden', flexShrink: 0,
            }}>
                <Inner />
            </aside>
        </SidebarContext.Provider>
    );
}