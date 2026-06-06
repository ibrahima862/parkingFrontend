export function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 bg-slate-100 rounded-full" />
          <div className="h-2.5 w-20 bg-slate-100 rounded-full" />
        </div>
        <div className="h-5 w-14 bg-slate-100 rounded-full" />
      </div>
      <div className="mt-3 h-9 bg-slate-100 rounded-xl" />
    </div>
  );
}