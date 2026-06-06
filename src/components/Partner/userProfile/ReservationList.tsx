import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Trash2, Loader2, QrCodeIcon } from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState';
import { StatusBadge } from '../../ui/StatutBadge';
import axios from 'axios';
import { QRCodeModal } from './QRCodeModal';
import { ItemData } from '../../../type';

/* ── Reservations ── */
export function ReservationsList({ items = [], onRefresh }: { items: ItemData[]; onRefresh: () => void }) {
  const [selected, setSelected]     = useState<ItemData | null>(null);
  const [cancellingId, setCancelling] = useState<number | null>(null);

  const handleCancel = async (id: number) => {
    if (!window.confirm("Annuler cette réservation ? Un remboursement sera initié.")) return;
    setCancelling(id);
    try {
      await axios.post(`${(import.meta as any).env.VITE_API_URL}/api/client/reservations/${id}/annuler`, {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      onRefresh();
    } catch (e: any) {
      alert(e.response?.data?.message || "Erreur lors de l'annulation");
    } finally { setCancelling(null); }
  };

  if (items.length === 0) return (
    <EmptyState icon={Calendar} title="Aucune réservation active" sub="Vos prochaines réservations apparaîtront ici." />
  );

  return (
    <>
      <div className="flex flex-col gap-3">
        {items.map(res => {
          const active = res.statut === 'confirme' || res.statut === 'actif';
          return (
            <div key={res.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all">
              {/* Top accent */}
              <div className={`h-0.5 w-full ${active ? 'bg-gradient-to-r from-[#1B3FA0] to-[#2B52C8]' : 'bg-slate-200'}`} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin size={15} className="text-[#1B3FA0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-slate-800 truncate">{res.parking?.nom || 'Parking'}</p>
                      <p className="text-[11px] text-slate-400 truncate">{res.parking?.adresse}</p>
                    </div>
                  </div>
                  <StatusBadge statut={res.statut} />
                </div>
                {res.date_debut && (
                  <div className="flex items-center gap-1.5 mb-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Clock size={11} className="text-slate-400" />
                    <span className="text-[11px] text-slate-500 font-medium">{res.date_debut}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setSelected(res)}
                    className="flex-1 h-9 bg-[#1B3FA0] hover:bg-[#2B52C8] text-white text-[12px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm shadow-blue-900/20">
                    <QrCodeIcon size={13} /> Ticket QR
                  </button>
                  {active && (
                    <button onClick={() => handleCancel(res.id)} disabled={cancellingId === res.id}
                      className="w-9 h-9 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
                      title="Annuler">
                      {cancellingId === res.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <QRCodeModal isOpen={!!selected} onClose={() => setSelected(null)}
        title={selected?.parking?.nom || "Ticket"} value={`RESERVATION-${selected?.id}-${selected?.statut}`} />
    </>
  );
}
