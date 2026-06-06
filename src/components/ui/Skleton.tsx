export function Skeleton() {
    return (
        <div className="flex flex-col gap-6 pb-12 animate-pulse px-4 sm:px-0">
            <div className="h-8 bg-stone-100 rounded-xl w-48" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-28 sm:h-36 bg-stone-100 rounded-2xl" />)}
            </div>
            <div className="h-40 bg-stone-100 rounded-2xl" />
            <div className="h-64 bg-stone-100 rounded-2xl" />
        </div>
    );
}
