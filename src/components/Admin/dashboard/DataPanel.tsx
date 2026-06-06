
import { MoreHorizontal } from "lucide-react";
import { T } from "./SetCard";
import { EmptyState } from "./EmptyState";
/* Skeleton loader */
function Skeleton({ w = "100%", h = 14, r = T.r8, mb = 0 }: { w?: string | number; h?: number; r?: string; mb?: number }) {
    return (
        <div className="shimmer-line" style={{
            width: w, height: h, borderRadius: r, marginBottom: mb,
        }} />
    );
}
function SkeletonRow({ cols }: { cols: number }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: `1px solid ${T.border}` }}>
            <Skeleton w={36} h={36} r={T.r8} />
            {Array.from({ length: cols - 1 }).map((_, i) => (
                <Skeleton key={i} w={`${80 + Math.random() * 40}px`} h={12} />
            ))}
        </div>
    );
}


/* ══════════════════════════════════════════════════════
   DATA PANEL (table wrapper)
══════════════════════════════════════════════════════ */
export function DataPanel({
    title, subtitle, badge, kpis, columns, colWidths,
    loading, empty, emptyLabel, children, total, page, onPage,
}: {
    title: string; subtitle: string; badge?: React.ReactNode;
    kpis?: React.ReactNode; columns: string[]; colWidths: string;
    loading: boolean; empty: boolean; emptyLabel: string;
    children?: React.ReactNode;
    total?: number; page?: number; onPage?: (p: number) => void;
}) {
    const ROWS_PER_PAGE = 10;
    const totalPages = Math.ceil((total || 0) / ROWS_PER_PAGE);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp .3s ease both" }}>
            {kpis}
            <div style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: T.r14, overflow: "hidden",
            }}>
                {/* Panel header */}
                <div style={{
                    padding: "14px 20px",
                    borderBottom: `1px solid ${T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: `linear-gradient(180deg, ${T.surface} 0%, ${T.surfaceSubtle} 100%)`,
                }}>
                    <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{title}</div>
                        <div style={{ fontSize: 11, color: T.inkMute, marginTop: 2 }}>{subtitle}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {badge}
                        <button style={{
                            width: 30, height: 30, borderRadius: T.r8,
                            background: T.surfaceSubtle, border: `1px solid ${T.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: T.inkMute,
                        }}>
                            <MoreHorizontal size={14} />
                        </button>
                    </div>
                </div>

                {/* Column headers */}
                <div style={{
                    display: "grid", gridTemplateColumns: colWidths, gap: 12,
                    padding: "9px 20px",
                    borderBottom: `1px solid ${T.border}`,
                    background: T.surfaceSubtle,
                }}>
                    {columns.map((h, i) => (
                        <div key={i} style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: ".08em" }}>{h}</div>
                    ))}
                </div>

                {/* Body */}
                <div>
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
                        : empty
                            ? <EmptyState label={emptyLabel} />
                            : children
                    }
                </div>

                {/* Pagination */}
                {!loading && !empty && totalPages > 1 && (
                    <div style={{
                        padding: "12px 20px",
                        borderTop: `1px solid ${T.border}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: T.surfaceSubtle,
                    }}>
                        <span style={{ fontSize: 11, color: T.inkMute }}>
                            Page {(page || 1)} sur {totalPages}
                        </span>
                        <div style={{ display: "flex", gap: 4 }}>
                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                const p = i + 1;
                                const isActive = p === (page || 1);
                                return (
                                    <button key={p} onClick={() => onPage?.(p)} style={{
                                        width: 28, height: 28, borderRadius: T.r8,
                                        border: isActive ? `1px solid ${T.brandBorder}` : `1px solid ${T.border}`,
                                        background: isActive ? T.brand : T.surface,
                                        color: isActive ? "#fff" : T.inkMed,
                                        fontSize: 11, fontWeight: 600,
                                    }}>
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
