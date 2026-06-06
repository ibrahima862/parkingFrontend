import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Bell, CheckCircle2, AlertCircle, AlertTriangle, Info,
  RefreshCw, ArrowUpRight, X, Check, Eye,
  Star, MessageSquare, MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type RawType  = 'success' | 'warning' | 'danger' | 'info';
type Priority = 'critical' | 'important' | 'info';

interface Alert {
  id: number; type: RawType; title: string; message: string;
  time: string; isRead: boolean; priority: Priority;
  parking?: string;
  cta?: { label: string; icon?: React.ElementType; color: 'orange' | 'blue' };
}

const toPriority = (t: RawType): Priority =>
  t === 'danger' ? 'critical' : t === 'warning' ? 'important' : 'info';

const toCTA = (t: RawType, title: string): Alert['cta'] | undefined => {
  if (t === 'danger')   return { label: 'Gérer maintenant', icon: ArrowUpRight, color: 'orange' };
  if (t === 'warning' && title.toLowerCase().includes('sms'))
                        return { label: 'Recharger crédits', icon: MessageSquare, color: 'blue' };
  if (t === 'success')  return { label: 'Voir le parking',  icon: Eye,           color: 'blue' };
  if (t === 'info')     return { label: "Lire l'avis",      icon: Star,          color: 'blue' };
};

const TYPE_ICON = { success: CheckCircle2, danger: AlertCircle, warning: AlertTriangle, info: Info };
const TYPE_STYLE: Record<RawType, { bg: string; icon: string }> = {
  success: { bg: 'bg-blue-50',   icon: 'text-blue-700'   },
  danger:  { bg: 'bg-red-50',    icon: 'text-red-600'    },
  warning: { bg: 'bg-orange-50', icon: 'text-orange-600' },
  info:    { bg: 'bg-slate-100', icon: 'text-slate-500'  },
};

const SECTIONS = [
  { key: 'critical'  as const, label: 'Critiques', dot: 'bg-red-500'    },
  { key: 'important' as const, label: 'À traiter', dot: 'bg-orange-500' },
  { key: 'info'      as const, label: 'Activité',  dot: 'bg-blue-700'   },
];

const LIVE = [
  { name: 'Liberté 6',  pct: 72,  color: 'text-blue-700',   bar: 'bg-blue-700',   dot: 'bg-emerald-500' },
  { name: 'Almadies 1', pct: 100, color: 'text-orange-500', bar: 'bg-orange-500', dot: 'bg-orange-500'  },
];

function AlertCard({ alert, onDismiss }: { alert: Alert; onDismiss: (id: number) => void }) {
  const [dismissed, setDismissed] = useState(false);
  const [acted,     setActed]     = useState(false);
  const Icon  = TYPE_ICON[alert.type]  ?? Info;
  const style = TYPE_STYLE[alert.type] ?? TYPE_STYLE.info;

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 8 }}
      animate={dismissed ? { opacity: 0, height: 0, marginBottom: 0 } : { opacity: 1, y: 0 }}
      transition={dismissed ? { duration: 0.22 } : { duration: 0.3 }}
      onAnimationComplete={() => dismissed && onDismiss(alert.id)}
      className={`bg-white border border-slate-200 rounded-xl p-4 flex gap-3 group hover:shadow-[0_2px_12px_rgba(29,78,216,0.07)] transition-shadow mb-2 last:mb-0 ${
        !alert.isRead ? 'border-l-[2.5px] border-l-orange-500' : ''
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
        <Icon size={15} className={style.icon} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-slate-900">{alert.title}</span>
            {!alert.isRead && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-slate-300 font-mono hidden sm:inline">{alert.time}</span>
            <button onClick={() => setDismissed(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-300 hover:text-slate-500">
              <X size={10} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {alert.parking && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={9} className="text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-400">{alert.parking}</span>
          </div>
        )}

        <p className="text-[12px] text-slate-500 mt-2 leading-relaxed">{alert.message}</p>

        {alert.cta && !acted ? (
          <button onClick={() => setActed(true)}
            className={`mt-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors active:scale-95 ${
              alert.cta.color === 'orange'
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-blue-700 hover:bg-blue-800 text-white'
            }`}>
            {alert.cta.icon && React.createElement(alert.cta.icon, { size: 11, strokeWidth: 2.5 })}
            {alert.cta.label}
          </button>
        ) : acted ? (
          <span className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <Check size={10} strokeWidth={3} /> Effectué
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function AlertSms() {
  const [rawAlerts,  setRaw]        = useState<Alert[]>([]);
  const [dismissed,  setDismissed]  = useState<Set<number>>(new Set());
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState<Priority | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const r = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' },
      });
      if (r.ok) {
        const d = await r.json();
        setRaw(d.map((n: any) => {
          const type: RawType = n.data?.type ?? 'info';
          const title = n.data?.titre ?? 'Notification';
          return {
            id: n.id, type, title,
            message:  n.data?.message ?? '',
            time:     n.created_at_human ?? "À l'instant",
            isRead:   n.read_at !== null,
            priority: toPriority(type),
            parking:  n.data?.parking_nom,
            cta:      toCTA(type, title),
          };
        }));
      }
    } catch { }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAll = async () => {
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL}/api/notifications/read-all`, {
        method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      load(true);
    } catch { }
  };

  const alerts     = useMemo(() => rawAlerts.filter(a => !dismissed.has(a.id)), [rawAlerts, dismissed]);
  const visible    = useMemo(() => filter === 'all' ? alerts : alerts.filter(a => a.priority === filter), [alerts, filter]);
  const unread     = alerts.filter(a => !a.isRead).length;
  const critCount  = alerts.filter(a => a.priority === 'critical').length;
  const topParking = alerts.find(a => a.parking && a.priority === 'critical')?.parking;

  const grouped = useMemo(() => ({
    critical:  visible.filter(a => a.priority === 'critical'),
    important: visible.filter(a => a.priority === 'important'),
    info:      visible.filter(a => a.priority === 'info'),
  }), [visible]);

  const FILTERS = [
    { k: 'all'       as const, l: 'Toutes',       active: 'bg-blue-700   border-blue-700   text-white' },
    { k: 'critical'  as const, l: '🔴 Critiques', active: 'bg-red-600    border-red-600    text-white' },
    { k: 'important' as const, l: '⚡ À traiter', active: 'bg-orange-500 border-orange-500 text-white' },
    { k: 'info'      as const, l: 'ℹ️ Info',      active: 'bg-blue-700   border-blue-700   text-white' },
  ];

  return (
    <div className="min-h-screen bg-blue-50/40 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-widest mb-1">Notifications</p>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Alertes & <span className="text-blue-700">Notifications</span>
            </h1>
            {critCount > 0 && (
              <p className="text-[12px] text-red-500 font-semibold mt-1">
                {critCount} alerte{critCount > 1 ? 's critiques' : ' critique'} active{critCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {unread > 0 && (
              <button onClick={markAll}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-blue-100 bg-white text-blue-700 text-[11px] font-semibold hover:border-blue-300 transition-colors">
                <CheckCircle2 size={11} /> Tout lire
              </button>
            )}
            <button onClick={() => load(true)} disabled={refreshing}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-blue-300 transition-colors disabled:opacity-40">
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Non lues',  value: unread,        accent: 'text-orange-500', sub: 'text-orange-300' },
            { label: 'Critiques', value: critCount,     accent: 'text-blue-700',   sub: 'text-blue-300'   },
            { label: 'Total',     value: alerts.length, accent: 'text-slate-900',  sub: 'text-slate-400'  },
          ].map(s => (
            <div key={s.label} className="bg-white border border-blue-100 rounded-xl px-4 py-3">
              <p className={`text-[22px] font-bold font-mono leading-none ${s.accent}`}>{s.value}</p>
              <p className={`text-[10px] font-semibold uppercase tracking-wider mt-1 ${s.sub}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Insight banner */}
        {(critCount > 0 || unread > 0) && (
          <div className="bg-blue-900 rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500/15 rounded-xl flex items-center justify-center shrink-0">
              <Bell size={15} className="text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white leading-tight">
                {critCount > 0
                  ? `${critCount} alerte${critCount > 1 ? 's critiques' : ' critique'}`
                  : `${unread} non lue${unread > 1 ? 's' : ''}`}
              </p>
              <p className="text-[11px] text-blue-300 mt-0.5 truncate">
                {topParking ? `Impact sur "${topParking}" — agissez maintenant.` : 'Consultez vos alertes.'}
              </p>
            </div>
            {critCount > 0 && (
              <motion.span animate={{ opacity: [1, .4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                className="shrink-0 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg tracking-wide">
                URGENT
              </motion.span>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(({ k, l, active }) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors active:scale-95 whitespace-nowrap ${
                filter === k ? active : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>
              {l}
            </button>
          ))}
        </div>

        {/* Alert list */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-14">
              <RefreshCw size={18} className="text-blue-200 animate-spin" />
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Synchronisation…</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {SECTIONS.map(sec => {
                const items = grouped[sec.key];
                if (!items.length) return null;
                return (
                  <div key={sec.key}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className={`w-2 h-2 rounded-full ${sec.dot}`} />
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{sec.label}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{items.length}</span>
                    </div>
                    {items.map(a => (
                      <AlertCard key={a.id} alert={a} onDismiss={id => setDismissed(p => new Set(p).add(id))} />
                    ))}
                  </div>
                );
              })}

              {visible.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-14">
                  <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Check size={18} className="text-slate-400" strokeWidth={2.5} />
                  </div>
                  <p className="text-[13px] font-semibold text-slate-400">Aucune alerte dans cette catégorie</p>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}