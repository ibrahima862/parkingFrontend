import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, X, BellRing, Info, RefreshCw } from 'lucide-react';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${(import.meta as any).env.VITE_API_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) { }
  };

  const markAllRead = async () => {
    await Promise.all(notifications.map(n => markAsRead(n.id)));
  };

  const unread = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bouton Cloche ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-10 h-10 rounded-lg border transition-all flex items-center justify-center ${
          isOpen 
          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' 
          : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-600'
        }`}
      >
        <Bell size={20} strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel (Sous la barre) ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[320px] md:w-[380px] bg-white rounded-xl border border-gray-200 shadow-2xl z-[50] overflow-hidden animate-in slide-in-from-top-2 duration-200 origin-top-right">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">Notifications</span>
              {unread > 0 && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                  {unread} nouvelle{unread > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); fetchNotifications(); }}
                disabled={loading}
                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md transition-colors disabled:opacity-30"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading && notifications.length === 0 ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-6 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Check size={20} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900">Tout est lu !</p>
                <p className="text-xs text-gray-500 mt-1">Revenez plus tard pour de nouvelles mises à jour.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    className="flex items-start gap-3 p-4 hover:bg-blue-50/40 transition-colors group relative"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Info size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-[13px] text-gray-800 leading-tight">
                        {n.data?.message || 'Nouvelle notification'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1 font-medium italic">
                         {n.data?.parking_name || 'Service SenovaPark'}
                      </p>
                    </div>
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="absolute right-3 top-4 opacity-0 group-hover:opacity-100 p-1.5 bg-white border border-gray-200 rounded-md text-gray-400 hover:text-green-600 hover:border-green-200 shadow-sm transition-all"
                      title="Marquer comme lu"
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={markAllRead}
                className="w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
              >
                Tout marquer comme lu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}