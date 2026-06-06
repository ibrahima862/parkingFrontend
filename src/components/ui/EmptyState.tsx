/* ── Empty state ── */
export function EmptyState({ icon: Icon, title, sub }: { icon: any; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed border-slate-200 rounded-2xl px-6">
      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-3">
        <Icon size={20} className="text-slate-300" strokeWidth={1.5} />
      </div>
      <p className="text-[13px] font-semibold text-slate-500 mb-1">{title}</p>
      <p className="text-[12px] text-slate-400 max-w-xs leading-relaxed">{sub}</p>
    </div>
  );
}