import { X } from "lucide-react";

/* ── Status badge ── */
export function StatusBadge({ statut }: { statut: string }) {
  if (statut === 'annule') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border bg-red-50 border-red-200 text-red-600">
      <X size={9} strokeWidth={3} /> Annulé
    </span>
  );
  const confirmed = statut === 'confirme' || statut === 'actif';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border
      ${confirmed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${confirmed ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
      {confirmed ? 'Confirmé' : statut}
    </span>
  );
}