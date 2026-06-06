import { useState, useEffect, useRef, useCallback } from 'react';
import {
    ArrowUpRight, ArrowDownRight, RefreshCw,
    Zap, TrendingUp, TrendingDown, AlertTriangle,
    DollarSign, Activity, Percent, Users, LayoutDashboard
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';

interface Stats {
    ca_total: number;
    reservations: number;
    occupation: number;
    nouveaux_clients: number;
    revenus_mois: number[];
    heures_pointe: number[];
    taux_semaine: number[];
    revenus_detail: { label: string; value: number; pct: number }[];
}

const fmt = (n: number) => n.toLocaleString('fr-FR');
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
const DAYS_S = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const DAYS_F = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOURS = ['8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];

const heatColor = (v: number, max: number) => {
    const t = v / max;
    if (t > 0.85) return '#0f172a';
    if (t > 0.65) return '#1e3a8a';
    if (t > 0.4) return '#3b82f6';
    if (t > 0.2) return '#93c5fd';
    return '#eff6ff';
};

function AnimatedNum({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [val, setVal] = useState(0);
    const started = useRef(false);
    const ref = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting || started.current) return;
            started.current = true;
            let n = 0; const step = target / 60;
            const t = setInterval(() => { 
                n += step; 
                if (n >= target) { setVal(target); clearInterval(t); } 
                else setVal(Math.floor(n)); 
            }, 16);
            obs.disconnect();
        }, { threshold: 0.1 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [target]);
    
    return <span ref={ref}>{fmt(val)}{suffix}</span>;
}

function KpiCard({ title, value, suffix = '', trend, up, icon: Icon, isOrange }: {
    title: string; value: number; suffix?: string; trend: string;
    up: boolean; icon: any; isOrange?: boolean;
}) {
    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col gap-4 hover:border-slate-300/90 transition-all duration-200">
            <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    isOrange ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-blue-50/60 border-blue-100/60 text-blue-700'
                }`}>
                    <Icon size={15} strokeWidth={2} />
                </div>
                <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-1 rounded-full ${
                    up ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'
                }`}>
                    {up ? <ArrowUpRight size={11} strokeWidth={2.5} /> : <ArrowDownRight size={11} strokeWidth={2.5} />}
                    {trend}
                </span>
            </div>
            <div>
                <div className={`text-[26px] font-bold leading-none tracking-tight font-mono ${isOrange ? 'text-orange-600' : 'text-slate-900'}`}>
                    <AnimatedNum target={value} suffix={suffix} />
                </div>
                <p className="text-[11px] font-semibold text-slate-400 mt-2 uppercase tracking-wider">{title}</p>
            </div>
        </div>
    );
}

function TrendChart({ data }: { data: number[] }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const [hov, setHov] = useState<number | null>(null);
    const W = 500; const H = 100; const pad = 8;
    const max = Math.max(...data, 1); const min = Math.min(...data);
    const pts = data.map((v, i) => ({
        x: (i / (data.length - 1)) * (W - 2 * pad) + pad,
        y: H - pad - ((v - min) / (max - min || 1)) * (H - 2 * pad), v,
    }));
    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const area = `${path} L ${pts.at(-1)!.x} ${H} L ${pts[0].x} ${H} Z`;
    const peak = data.indexOf(Math.max(...data));

    return (
        <div ref={ref} className="w-full">
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 'clamp(64px, 12vw, 100px)', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <clipPath id="tc">
                        <motion.rect x="0" y="0" width={W} height={H}
                            initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
                            style={{ transformOrigin: 'left' }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
                    </clipPath>
                </defs>
                <path d={area} fill="url(#tg)" clipPath="url(#tc)" />
                <path d={path} stroke="#2563eb" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#tc)" />
                {inView && (
                    <g>
                        <circle cx={pts[peak].x} cy={pts[peak].y} r="3.5" fill="#ea580c" />
                        <circle cx={pts[peak].x} cy={pts[peak].y} r="7" fill="#ea580c" fillOpacity="0.15" />
                    </g>
                )}
                {pts.map((p, i) => (
                    <g key={i}>
                        <rect x={p.x - W / data.length / 2} y={0} width={W / data.length} height={H} fill="transparent" className="cursor-pointer"
                            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
                        {hov === i && (
                            <>
                                <line x1={p.x} y1={0} x2={p.x} y2={H} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
                                <circle cx={p.x} cy={p.y} r="4" fill="#2563eb" />
                                <rect x={p.x - 35} y={p.y - 28} width="70" height="20" rx="6" fill="#0f172a" />
                                <text x={p.x} y={p.y - 15} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="600" fontFamily="monospace">{fmt(p.v)} F</text>
                            </>
                        )}
                    </g>
                ))}
            </svg>
        </div>
    );
}

function OccupancyRing({ value }: { value: number }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const r = 32; const circ = 2 * Math.PI * r;
    const isHigh = value >= 85;
    
    return (
        <div ref={ref} className="relative w-20 h-20 shrink-0">
            <svg width="100%" height="100%" viewBox="0 0 80 80" className="-rotate-90">
                <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
                <motion.circle cx="40" cy="40" r={r} fill="none" stroke={isHigh ? '#ea580c' : '#2563eb'} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={inView ? { strokeDashoffset: circ - (value / 100) * circ } : {}}
                    transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[14px] font-bold text-slate-900 leading-none font-mono">{value}%</span>
                <span className={`text-[7px] font-bold uppercase tracking-wider mt-1 ${isHigh ? 'text-orange-600' : 'text-blue-600'}`}>
                    {isHigh ? 'Critique' : value >= 70 ? 'Élevé' : 'Normal'}
                </span>
            </div>
        </div>
    );
}

function Heatmap({ data }: { data: number[] }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-20px' });
    const grid = DAYS_F.map((_, d) => data.map(v => Math.max(0, v + Math.sin(d * 0.9 + v * 0.1) * 15)));
    const max = Math.max(...grid.flat());

    return (
        <div ref={ref} className="w-full">
            <div className="flex gap-1 ml-9 mb-1.5">
                {HOURS.map((h, i) => (
                    <div key={h} className={`flex-1 text-center text-[8px] font-bold text-slate-400 ${i % 2 !== 0 ? 'hidden sm:block' : ''}`}>{h}</div>
                ))}
            </div>
            {grid.map((row, d) => (
                <div key={d} className="flex items-center gap-1 mb-1">
                    <div className="w-9 text-[8px] font-bold text-slate-400 text-right pr-2 shrink-0">
                        <span className="sm:hidden">{DAYS_S[d]}</span>
                        <span className="hidden sm:inline">{DAYS_F[d]}</span>
                    </div>
                    {row.map((v, h) => (
                        <motion.div key={h}
                            className="flex-1 h-5 rounded-[4px] cursor-pointer relative group"
                            style={{ backgroundColor: inView ? heatColor(v, max) : '#eff6ff' }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={inView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ duration: 0.2, delay: (d * 8 + h) * 0.005 }}
                            whileHover={{ scale: 1.15, zIndex: 10 }}
                        >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[9px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 border border-slate-800">
                                {DAYS_F[d]} {HOURS[h]} — {Math.round(v)}%
                            </div>
                        </motion.div>
                    ))}
                </div>
            ))}
            <div className="flex items-center gap-1.5 ml-9 mt-3">
                <span className="text-[9px] font-semibold text-slate-400">Calme</span>
                {['#eff6ff', '#93c5fd', '#3b82f6', '#1e3a8a', '#0f172a'].map((c, i) => (
                    <div key={i} className="w-3 h-2 rounded-[2px]" style={{ backgroundColor: c }} />
                ))}
                <span className="text-[9px] font-semibold text-slate-400">Dense</span>
            </div>
        </div>
    );
}

type InsightType = 'up' | 'down' | 'warning' | 'tip';
const INSIGHT_CFG: Record<InsightType, { Icon: any; color: string; bg: string; border: string }> = {
    up: { Icon: TrendingUp, color: 'text-blue-700', bg: 'bg-blue-50/50', border: 'border-blue-100/60' },
    down: { Icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50/40', border: 'border-orange-100' },
    warning: { Icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50/40', border: 'border-orange-100' },
    tip: { Icon: Zap, color: 'text-blue-700', bg: 'bg-blue-50/50', border: 'border-blue-100/60' },
};

function Insight({ type, headline, body }: { type: InsightType; headline: string; body: string }) {
    const { Icon, color, bg, border } = INSIGHT_CFG[type];
    return (
        <div className={`${bg} border ${border} rounded-xl p-4 flex gap-3 transition-colors duration-200`}>
            <div className="shrink-0 mt-0.5">
                <Icon size={14} strokeWidth={2} className={color} />
            </div>
            <div>
                <p className="text-[12px] font-bold text-slate-900 leading-tight mb-1">{headline}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{body}</p>
            </div>
        </div>
    );
}

const StatRow = ({ item, index }: { item: any; index: number }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-slate-50/80 transition-colors">
            <span className="text-[12px] font-bold text-slate-800 w-28 truncate shrink-0">{item.label}</span>
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-blue-600 rounded-full"
                    initial={{ width: 0 }} animate={inView ? { width: `${item.pct}%` } : {}}
                    transition={{ duration: 0.8, delay: index * 0.05 + 0.1 }} />
            </div>
            <span className="text-[11px] font-bold text-blue-700 w-8 text-right font-mono">{item.pct}%</span>
        </motion.div>
    );
};

export function AnalyticsDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [period, setPeriod] = useState('30');
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = useCallback(async (silent = false) => {
        if (!silent) setLoading(true); else setRefreshing(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/partenaire/analytics?days=${period}`, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
            setStats(await res.json());
        } catch { }
        finally { setLoading(false); setRefreshing(false); }
    }, [period]);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

    if (loading || !stats) return (
        <div className="p-6 max-w-6xl mx-auto flex flex-col gap-4">
            <div className="h-12 w-48 bg-slate-100 rounded-xl animate-pulse mb-4" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
            </div>
            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse mt-2" />
        </div>
    );

    const weekendAvg = (stats.taux_semaine[5] + stats.taux_semaine[6]) / 2;
    const weekdayAvg = stats.taux_semaine.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const weekendBoost = weekdayAvg > 0 ? Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 100) : 0;
    const peakHour = HOURS[stats.heures_pointe.indexOf(Math.max(...stats.heures_pointe))] ?? '12h';

    const insights: { type: InsightType; headline: string; body: string }[] = [
        ...(weekendBoost > 20 ? [{ type: 'warning' as const, headline: `Optimisation week-end (+${weekendBoost}%)`, body: 'Ajustez votre stratégie tarifaire les samedis et dimanches pour capter au mieux cette hausse d’affluence.' }] : []),
        ...(stats.occupation >= 85 ? [{ type: 'warning' as const, headline: `Seuil d'occupation critique (${stats.occupation}%)`, body: 'Vos infrastructures approchent de la saturation maximale. Envisagez une régulation temporaire.' }] : []),
        { type: 'up' as const, headline: `Forte affluence constatée à ${peakHour}`, body: `Le flux de réservations culmine quotidiennement aux alentours de l'après-midi.` },
    ].slice(0, 3);

    return (
        <div className="flex flex-col gap-6 px-4 sm:px-6 py-8 max-w-6xl mx-auto bg-slate-50/40 min-h-screen antialiased text-slate-900">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activité en direct</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <LayoutDashboard size={18} strokeWidth={2.2} className="text-blue-600" /> Performance analytique
                    </h1>
                </div>
                
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
                        {(['7', '30', '90'] as const).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                    period === p 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-slate-400 hover:text-slate-600'
                                }`}>
                                {p} jours
                            </button>
                        ))}
                    </div>
                    <button onClick={() => fetchAnalytics(true)}
                        className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all">
                        <RefreshCw size={13} className={`${refreshing ? 'animate-spin' : ''} text-slate-600`} strokeWidth={2.2} />
                    </button>
                </div>
            </div>

            {/* Grille KPIs - No Shadows */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Revenus nets" value={stats.ca_total} suffix=" F" trend="+12%" up icon={DollarSign} />
                <KpiCard title="Réservations" value={stats.reservations} trend="+5%" up icon={Activity} isOrange />
                <KpiCard title="Taux d'occupation" value={stats.occupation} suffix="%" trend="+2%" up icon={Percent} />
                <KpiCard title="Nouveaux clients" value={stats.nouveaux_clients} trend="+18%" up icon={Users} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
                {/* Carte d'affluence - No Shadows */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
                        <div>
                            <p className="text-[13px] font-bold text-slate-900">Distribution horaire</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Densité de fréquentation par heure et jour</p>
                        </div>
                    </div>
                    <div className="p-5 overflow-x-auto"><Heatmap data={stats.heures_pointe} /></div>
                </div>

                {/* Taux Réel - No Shadows */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-5">
                    <div className="flex items-center gap-4 pb-1">
                        <OccupancyRing value={stats.occupation} />
                        <div>
                            <p className="text-[13px] font-bold text-slate-900">Capacité globale</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Niveau de remplissage lissé sur la période.</p>
                        </div>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex flex-col gap-3">
                        {insights.map((ins, i) => (
                            <Insight key={i} type={ins.type} headline={ins.headline} body={ins.body} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
                {/* Graphique d'évolution - No Shadows */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
                        <div>
                            <p className="text-[13px] font-bold text-slate-900">Courbe des revenus</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Historique de facturation sur les 6 derniers mois</p>
                        </div>
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            FCFA
                        </span>
                    </div>
                    <div className="p-5">
                        <TrendChart data={stats.revenus_mois} />
                        <div className="flex gap-1.5 mt-4">
                            {MONTHS.map((m, i) => (
                                <div key={m} className="flex-1 flex flex-col items-center gap-1.5">
                                    <div className={`w-full h-[2px] rounded-full ${i === 5 ? 'bg-blue-600' : 'bg-slate-100'}`} />
                                    <span className={`text-[9px] font-bold ${i === 5 ? 'text-blue-600' : 'text-slate-400'}`}>{m}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3">
                            {[
                                { label: 'Record', value: `${fmt(Math.max(...stats.revenus_mois))} F`, isOrange: true },
                                { label: 'Mois en cours', value: `${fmt(stats.revenus_mois[5])} F`, isOrange: false },
                                { label: 'Moyenne', value: `${fmt(Math.round(stats.revenus_mois.reduce((a, b) => a + b, 0) / 6))} F`, isOrange: false },
                            ].map(s => (
                                <div key={s.label} className="bg-slate-50/60 border border-slate-100 rounded-xl p-3">
                                    <p className={`text-[12px] font-bold font-mono tracking-tight truncate ${s.isOrange ? 'text-orange-600' : 'text-slate-900'}`}>{s.value}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

               {/* Répartition par secteur - Version Moderne Compacte (No Shadows) */}
<div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[420px]">
    {/* Header fixe */}
    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/40 shrink-0">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-[13px] font-bold text-slate-900">Analyse par secteur</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Contribution des parkings au CA</p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                {stats.revenus_detail?.length ?? 0} entités
            </span>
        </div>

        {/* Mini jauge segmentée moderne (Donne un aperçu visuel global immédiat) */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 flex overflow-hidden">
            {stats.revenus_detail?.slice(0, 4).map((r, i) => {
                const colors = ['bg-blue-600', 'bg-blue-400', 'bg-orange-500', 'bg-slate-400'];
                return (
                    <div 
                        key={i} 
                        className={`${colors[i] ?? 'bg-slate-300'} h-full border-r border-white last:border-0`} 
                        style={{ width: `${r.pct}%` }}
                        title={`${r.label} : ${r.pct}%`}
                    />
                );
            })}
        </div>
    </div>

    {/* Zone défilante (Scrollable si beaucoup de parkings) */}
    <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
        {stats.revenus_detail?.map((item, index) => (
            <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 4 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                className="flex flex-col gap-1.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200 transition-all"
            >
                <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 min-w-0">
                        {/* Indicateur visuel discret */}
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-blue-400' : index === 2 ? 'bg-orange-500' : 'bg-slate-400'}`} />
                        <span className="font-bold text-slate-800 truncate" title={item.label}>
                            {item.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                        <span className="font-semibold text-slate-400 font-mono">{fmt(item.value)} F</span>
                        <span className="font-bold text-blue-700 bg-blue-50/80 border border-blue-100/30 px-1.5 py-0.5 rounded-md font-mono text-[10px]">
                            {item.pct}%
                        </span>
                    </div>
                </div>
                {/* Barre fine minimaliste */}
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        className={`h-full ${index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-blue-400' : index === 2 ? 'bg-orange-500' : 'bg-slate-400'}`}
                        initial={{ width: 0 }} 
                        animate={{ width: `${item.pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }} 
                    />
                </div>
            </motion.div>
        ))}
    </div>

    {/* Footer fixe (Insight) */}
    {stats.revenus_detail?.[0] && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/40 shrink-0">
            <div className="p-2.5 bg-blue-50/50 border border-blue-100/60 rounded-xl flex items-start gap-2">
                <span className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    <strong className="text-slate-900 font-bold">{stats.revenus_detail[0].label}</strong> reste votre premier levier avec{' '}
                    <strong className="text-blue-700 font-mono font-bold">{stats.revenus_detail[0].pct}%</strong> de contribution.
                </span>
            </div>
        </div>
    )}
</div>
            </div>
        </div>
    );
}

export default AnalyticsDashboard;