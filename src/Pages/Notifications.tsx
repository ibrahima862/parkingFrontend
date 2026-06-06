import { useEffect, useState } from "react";
import {
  Bell, CheckCircle2, AlertCircle, Info, Zap,
  RefreshCw, X, CheckCheck, Clock,
  CreditCard,
} from "lucide-react";

interface NotificationData {
  id: string;
  read_at?: string | null;
  data: { type: string; title: string; message?: string; };
  created_at: string;
}

/* ── Type → visual config ── */
const TYPE_CFG: Record<string, { icon: React.ReactNode; badge: string; dot: string }> = {
  reservation: {
    icon: <CheckCircle2 size={14} className="text-emerald-600" strokeWidth={2.5} />,
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot:   "bg-emerald-500",
  },
  paiement: {
    icon: <Zap size={14} className="text-[#1B3FA0]" strokeWidth={2.5} />,
    badge: "bg-blue-50 text-[#1B3FA0] border-blue-200",
    dot:   "bg-[#1B3FA0]",
  },
  annulation: {
    icon: <X size={14} className="text-red-500" strokeWidth={2.5} />,
    badge: "bg-red-50 text-red-600 border-red-200",
    dot:   "bg-red-500",
  },
  alerte: {
    icon: <AlertCircle size={14} className="text-amber-600" strokeWidth={2.5} />,
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot:   "bg-amber-500",
  },
  info: {
    icon: <Info size={14} className="text-slate-500" strokeWidth={2.5} />,
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    dot:   "bg-slate-400",
  },
};

const fallback = TYPE_CFG.info;

function getConfig(type: string) {
  const key = Object.keys(TYPE_CFG).find(k => type?.toLowerCase().includes(k));
  return key ? TYPE_CFG[key] : fallback;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `Il y a ${d}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day:"2-digit", month:"short" });
}

/* ── Single notification card ── */
function NotifCard({ n, onRead }: { n: NotificationData; onRead: (id: string) => void }) {
  const cfg   = getConfig(n.data.type);
  const unread = !n.read_at;

  return (
    <div
      className={`group relative flex gap-3.5 px-5 py-4 border-b border-slate-100 last:border-0 transition-colors cursor-pointer
        ${unread ? "bg-blue-50/40 hover:bg-blue-50/70" : "bg-white hover:bg-slate-50/80"}`}
      onClick={() => unread && onRead(n.id)}
    >
      {/* Unread dot */}
      {unread && (
        <span className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      )}

      {/* Icon */}
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5
        ${unread ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100"}`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${cfg.badge}`}>
            {n.data.type}
          </span>
          <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1 mt-0.5">
            <Clock size={9} /> {timeAgo(n.created_at)}
          </span>
        </div>
        <p className={`text-[13px] leading-snug ${unread ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
          {n.data.title}
        </p>
        {n.data.message && (
          <p className="text-[12px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {n.data.message}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function SkeletonCard() {
  return (
    <div className="flex gap-3.5 px-5 py-4 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse shrink-0 mt-0.5" />
      <div className="flex-1 flex flex-col gap-2 pt-0.5">
        <div className="w-20 h-4 rounded-md bg-slate-100 animate-pulse" />
        <div className="w-3/4 h-3.5 rounded bg-slate-100 animate-pulse" />
        <div className="w-1/2 h-3 rounded bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}
/* ── Empty state ── */
function EmptyState({ icon: Icon, title, sub }: { icon: any; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
      <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={22} className="text-slate-300" strokeWidth={1.5} />
      </div>
      <p className="text-[14px] font-semibold text-slate-500 mb-1">{title}</p>
      <p className="text-[12px] text-slate-400 max-w-xs leading-relaxed">{sub}</p>
    </div>
  );
}

/* ══════════════════════════════════ MAIN ══════════════════════════════════ */
export function Notification() {
  const [messages,  setMessages]  = useState<NotificationData[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [filter,    setFilter]    = useState<"all" | "unread">("all");
  const [refreshing,setRefreshing]= useState(false);

  const fetch_ = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/notifications`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Impossible de charger les notifications.");
      setMessages(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => { fetch_(); }, []);

  const markRead  = (id: string) => setMessages(p => p.map(m => m.id === id ? { ...m, read_at: new Date().toISOString() } : m));
  const markAll   = () => setMessages(p => p.map(m => ({ ...m, read_at: m.read_at ?? new Date().toISOString() })));

  const unreadCount = messages.filter(m => !m.read_at).length;
  const displayed   = filter === "unread" ? messages.filter(m => !m.read_at) : messages;
  const badgeCount     = filter === "unread" ? unreadCount : messages.length;
  return (
    <div className="w-full max-w-md mx-auto flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-[#1B3FA0] flex items-center justify-center">
              <Bell size={14} color="#fff" strokeWidth={2.5} />
            </div>
            {badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F97316] border-2 border-white flex items-center justify-center text-[9px] font-bold text-white leading-none">
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-900 leading-none">Notifications</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout lu"}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button onClick={markAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">
              <CheckCheck size={12} /> Tout lire
            </button>
          )}
          <button onClick={() => fetch_(true)}
            className="w-7 h-7 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-1 px-5 py-2.5 border-b border-slate-100 bg-slate-50/50">
        {(["all", "unread"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              filter === f
                ? "bg-white border border-slate-200 text-slate-800 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}>
            {f === "all" ? `Toutes (${messages.length})` : `Non lues (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 440 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-6">
            <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <AlertCircle size={18} className="text-red-400" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-semibold text-slate-600">Erreur de chargement</p>
            <p className="text-[12px] text-slate-400">{error}</p>
            <button onClick={() => fetch_()} className="mt-1 px-4 py-2 rounded-xl bg-[#1B3FA0] text-white text-[12px] font-semibold hover:bg-[#2B52C8] transition-colors">
              Réessayer
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Bell size={20} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] font-semibold text-slate-500">
              {filter === "unread" ? "Aucune notification non lue" : "Aucune notification"}
            </p>
            <p className="text-[11px] text-slate-400">
              {filter === "unread" ? "Vous êtes à jour !" : "Vos notifications apparaîtront ici."}
            </p>
          </div>
        ) : (
          displayed.map(m => <NotifCard key={m.id} n={m} onRead={markRead} />)
        )}
      </div>

      {/* ── Footer ── */}
      {!loading && messages.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            <strong className="text-slate-600">{messages.length}</strong> notification{messages.length > 1 ? "s" : ""}
          </span>
          {unreadCount === 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 size={11} strokeWidth={2.5} /> Tout lu
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Notification;