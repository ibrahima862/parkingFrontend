import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Wallet, BarChart3, Smartphone,
    LogOut, ChevronLeft, Menu, X,
    Car, PlusCircle, 
    MapPin, Activity,
} from 'lucide-react';
import { useState, useEffect, createContext, useContext } from 'react';

export const T = {
    /* Surfaces */
    bg:           '#F4F5F9',
    surface:      '#FFFFFF',
    surfaceAlt:   '#F8F9FC',
    surfaceHov:   '#F2F3F8',

    /* Ink */
    ink:          '#0C0E14',
    inkMid:       '#454D63',
    inkLight:     '#8990A8',
    inkFaint:     '#C8CEDF',

    /* Brand */
    brand:        '#2563EB',
    brandHover:   '#1D4ED8',
    brandSoft:    '#EFF4FF',
    brandBorder:  '#BFCFFF',

    /* Lines */
    line:         '#EAECF4',
    lineHover:    '#D4D9EC',

    /* Semantic */
    green:        '#0EA674',
    greenBg:      '#EDFAF4',
    greenLine:    '#A3E6CC',

    amber:        '#C97B00',
    amberBg:      '#FFF7E6',
    amberLine:    '#FFD97A',

    red:          '#DC3545',
    redBg:        '#FFF1F1',
    redLine:      '#FFB8BC',

    /* Sidebar (dark) */
    sidebar:      '#0C0E14',
    sidebarLine:  'rgba(255,255,255,0.06)',
    sidebarText:  '#6B7280',
    sidebarHover: 'rgba(255,255,255,0.05)',
    sidebarActive:'rgba(255,255,255,0.08)',
};

interface SidebarCtx { collapsed: boolean; sidebarWidth: number; }
export const SidebarContext = createContext<SidebarCtx>({ collapsed: false, sidebarWidth: 232 });
export const useSidebar = () => useContext(SidebarContext);

export const SIDEBAR_FULL = 232;
export const SIDEBAR_MINI = 58;

interface SidebarProps {
    user?: { name?: string; email?: string };
    initials?: string;
    collapsible?: boolean;
    menuOpen?: boolean; 
    setMenuOpen?: (open: boolean) => void; // Ajouté pour permettre la fermeture depuis le sidebar
    onCollapseChange?: (c: boolean) => void;
}

const SECTIONS = [
    {
        label: 'Pilotage',
        items: [
            { to: '/partner/dashboard',     icon: LayoutDashboard, label: "Tableau de bord"       },
            { to: '/partner/bookings',  icon: Activity,        label: 'Flux & Réservations'  },
            { to: '/partner/parking-lots',      icon: MapPin,          label: 'Mes Espaces'           },
        ],
    },
    {
        label: 'Croissance',
        items: [
            { to: '/partner/parking-lots/new',  icon: PlusCircle,  label: 'Ajouter un parking' },
            { to: '/partner/analytics',     icon: BarChart3,   label: 'Analyses & Trafic'  },
            { to: '/partner/subscriptions',     icon: BarChart3,   label: 'Subscriptions'  },
            { to: '/partner/notifications', icon: Smartphone,  label: 'notifications'          },
        ],
    },
    {
        label: 'Finance & Compte',
        items: [
            { to: '/partner/earnings',  icon: Wallet,      label: 'Gains & Versements' },
        ],
    },
];

export function Sidebar({ user, initials = 'SP', collapsible = true, onCollapseChange, menuOpen = false, setMenuOpen }: SidebarProps) {
    const navigate  = useNavigate();
    const location  = useLocation();

    const [collapsed, setCollapsed] = useState<boolean>(() => {
        try { return JSON.parse(localStorage.getItem('sidebarCollapsed') ?? 'false'); }
        catch { return false; }
    });
    
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

    const Inner = ({ forceFull = false }: { forceFull?: boolean }) => {
        const mini = !forceFull && collapsed && !isMobile;

        return (
            <div className="flex flex-col h-full">
                {/* ── Logo bar ── */}
                <div className={`h-[56px] flex-shrink-0 flex items-center border-b border-gray-700 ${mini ? 'justify-center px-0' : 'justify-between px-4'}`}>
                    {mini ? (
                        <button onClick={toggle} title="Étendre" className={`w-[30px] h-[30px] rounded-[7px] ${T.brand} ${T.brandHover} border-none flex items-center justify-center cursor-pointer transition-colors`}>
                            <Car size={13} className="text-white" strokeWidth={2.5} />
                        </button>
                    ) : (
                        <>
                            <Link to="/" className="flex items-center gap-[9px] no-underline">
                                <div className="w-[28px] h-[28px] rounded-[7px] bg-white flex items-center justify-center flex-shrink-0">
                                    <Car size={13} className="text-black" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className="text-[13px] font-extrabold text-white tracking-tight leading-[1.15]">SenovaPark</div>
                                    <div className="text-[9px] font-semibold text-gray-500 uppercase tracking-widest mt-[1px]">Console Partner</div>
                                </div>
                            </Link>
                            {collapsible && !isMobile && (
                                <button onClick={toggle} className="w-[24px] h-[24px] rounded-[6px] bg-orange-500 border border-white/10 cursor-pointer flex items-center justify-center text-white flex-shrink-0 transition-all hover:bg-orange-600">
                                    <ChevronLeft size={12} strokeWidth={2.5} />
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* ── Nav ── */}
                <nav className="flex-1 p-[8px_6px] overflow-y-auto flex flex-col">
                    {SECTIONS.map((section, si) => (
                        <div key={section.label} className={mini ? 'mb-[4px]' : 'mb-[18px]'}>
                            {!mini && (
                                <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em] px-[10px] mb-[4px] mt-[2px]">
                                    {section.label}
                                </div>
                            )}
                            {mini && si > 0 && <div className={`h-[1px] bg-white/10 mx-[10px] my-[4px]`} />}

                            {section.items.map(item => {
                                const active = isActive(item.to);
                                return (
                                    <Link 
                                        key={item.to} to={item.to}
                                        onClick={() => isMobile && setMenuOpen?.(false)} // Ferme le sidebar mobile lors du clic sur un lien
                                        title={mini ? item.label : undefined}
                                        className={`flex items-center rounded-[7px] mb-[1px] no-underline text-[14px] transition-all relative border-b border-gray-700
                                            ${mini ? 'justify-center py-[9px] gap-0' : 'justify-start py-[7px] px-[10px] gap-[9px]'}
                                            ${active ? 'bg-white/10 text-gray-100 font-semibold' : 'text-gray-500 hover:bg-white/5 hover:text-white/70'}
                                        `}
                                    >
                                        {active && !mini && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[14px] rounded-r-[2px] bg-blue-600" />
                                        )}
                                        <item.icon size={15} strokeWidth={active ? 2.2 : 1.8} className={`flex-shrink-0 ${active ? 'text-orange-500' : 'text-orange-500/70'}`} />
                                        {!mini && <span className="flex-1">{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* ── User footer ── */}
                <div className={`p-[6px] border ${T.line} flex-shrink-0`}>
                    <div 
                        onClick={() => navigate('/partner/settings')}
                        className={`flex items-center transition-colors rounded-[7px] cursor-pointer hover:bg-white/5 ${mini ? 'justify-center py-[8px] gap-0' : 'justify-start py-[7px] px-[10px] gap-[9px]'}`}
                    >
                        <div className="w-[28px] h-[28px] rounded-[7px] bg-orange-600 flex items-center justify-center flex-shrink-0 text-[10px] font-extrabold text-white tracking-wide select-none">
                            {initials}
                        </div>

                        {!mini && (
                            <>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-semibold text-gray-300 truncate">
                                        {user?.name ?? 'Propriétaire'}
                                    </div>
                                    <div className="text-[10px] text-gray-500 truncate mt-[1px]">
                                        {user?.email ?? 'compte@senovapark.sn'}
                                    </div>
                                </div>
                                <button
                                    onClick={e => { e.stopPropagation(); localStorage.clear(); navigate('/login'); }}
                                    title="Se déconnecter"
                                    className="bg-transparent border-none cursor-pointer text-gray-500 p-[4px] rounded-[5px] flex items-center transition-colors hover:text-red-400"
                                >
                                    <LogOut size={13} strokeWidth={2} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (isMobile) {
        return (
            <>
                {menuOpen && (
                    <div className="fixed inset-0 z-[200] bg-black/45 backdrop-blur-[4px]" onClick={() => setMenuOpen?.(false)} />
                )}

                <aside className={`fixed top-0 left-0 h-full w-[260px] bg-[#0F2A43] z-[201] flex flex-col transition-transform duration-250 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <button onClick={() => setMenuOpen?.(false)} className="absolute top-[13px] right-[13px] z-[1] w-[28px] h-[28px] rounded-[6px] bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer text-gray-500">
                        <X size={13} />
                    </button>
                    <Inner forceFull />
                </aside>
            </>
        );
    }

    const w = collapsed ? SIDEBAR_MINI : SIDEBAR_FULL;
    return (
        <SidebarContext.Provider value={{ collapsed, sidebarWidth: w }}>
            <aside 
                style={{ width: w }}
                className={`fixed left-0 top-0 h-full bg-[#0F2A43] flex flex-col z-[40] overflow-hidden flex-shrink-0 transition-all duration-220 ease-in-out`}
            >
                <Inner />
            </aside>
        </SidebarContext.Provider>
    );
}