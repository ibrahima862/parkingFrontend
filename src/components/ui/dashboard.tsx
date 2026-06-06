
import React, { useState } from "react";
import { ArrowUpRight, Loader2, AlertCircle, TrendingDown, Check, X } from "lucide-react";
import { B } from "../../styles/colors";

/* ── KPI CARD ──────────────────────────────────────────── */
interface KpiCardProps {
    label: string;
    value: string | number;
    icon: React.FC<any>;
    color: string;
    bg: string;
    border: string;
    trend?: string;
    trendDir?: "up" | "down";
    sub?: string;
    loading?: boolean;
}

export function KpiCard({ label, value, icon: Icon, color, bg, border, trend, trendDir = "up", sub, loading }: KpiCardProps) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ background: B.surface, border: `1px solid ${hov ? B.borderHover : B.border}`, borderRadius: 16, padding: '18px 20px', transition: '0.15s', boxShadow: hov ? '0 4px 16px rgba(13,43,110,0.06)' : 'none' }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={color} strokeWidth={2.5} />
                </div>
                {trend && !loading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 100, background: trendDir === "down" ? B.dangerLight : B.successLight }}>
                        {trendDir === "down"
                            ? <TrendingDown size={9} color={B.danger} strokeWidth={2.5} />
                            : <ArrowUpRight size={9} color={B.success} strokeWidth={2.5} />
                        }
                        <span style={{ fontSize: 10, fontWeight: 700, color: trendDir === "down" ? B.danger : B.success }}>{trend}</span>
                    </div>
                )}
            </div>
            {loading ? (
                <div style={{ height: 34, background: B.gray100, borderRadius: 8, marginBottom: 8, animation: 'pulse 1.5s ease infinite' }} />
            ) : (
                <div style={{ fontSize: 26, fontWeight: 900, color: B.navy900, letterSpacing: '-0.8px', fontFamily: 'IBM Plex Mono, monospace', marginBottom: 4 }}>{value}</div>
            )}
            <div style={{ fontSize: 11, fontWeight: 600, color: B.gray400, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            {sub && !loading && <div style={{ fontSize: 11, color: B.gray300, marginTop: 2 }}>{sub}</div>}
        </div>
    );
}

/* ── DATA TABLE ────────────────────────────────────────── */
interface DataTableProps {
    title: string;
    subtitle?: string;
    badge?: React.ReactNode;
    columns: string[];
    colWidths?: string;
    loading?: boolean;
    empty?: boolean;
    emptyLabel?: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
}

export function DataTable({ title, subtitle, badge, columns, colWidths, loading, empty, emptyLabel, footer, children }: DataTableProps) {
    return (
        <div style={{ background: B.surface, border: `1px solid ${B.border}`, borderRadius: 18, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${B.border}`, background: B.surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h2 style={{ fontSize: 14, fontWeight: 800, color: B.navy900, margin: 0 }}>{title}</h2>
                    {subtitle && <p style={{ fontSize: 11, color: B.gray400, margin: '3px 0 0', fontWeight: 500 }}>{subtitle}</p>}
                </div>
                {badge}
            </div>

            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: colWidths ?? `repeat(${columns.length}, 1fr)`, padding: '10px 24px', background: B.gray50, borderBottom: `1px solid ${B.border}`, gap: 16 }}>
                {columns.map((col) => (
                    <span key={col} style={{ fontSize: 10, fontWeight: 700, color: B.gray300, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{col}</span>
                ))}
            </div>

            {/* Body */}
            {loading ? (
                <RowSkeleton count={4} cols={columns.length} colWidths={colWidths} />
            ) : empty ? (
                <EmptyState label={emptyLabel ?? "Aucun résultat"} />
            ) : (
                children
            )}

            {/* Footer */}
            {footer && !loading && !empty && (
                <div style={{ padding: '10px 24px', borderTop: `1px solid ${B.border}`, background: B.gray50 }}>
                    {footer}
                </div>
            )}
        </div>
    );
}

/* ── EMPTY STATE ───────────────────────────────────────── */
export function EmptyState({ icon: Icon, label, sub }: { icon?: React.FC<any>; label: string; sub?: string }) {
    return (
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            {Icon && (
                <div style={{ width: 48, height: 48, borderRadius: 14, background: B.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <Icon size={22} color={B.success} strokeWidth={2} />
                </div>
            )}
            <p style={{ fontSize: 14, fontWeight: 700, color: B.navy900, margin: '0 0 4px' }}>{label}</p>
            {sub && <p style={{ fontSize: 12, color: B.gray400, margin: 0 }}>{sub}</p>}
        </div>
    );
}

/* ── ROW SKELETON ──────────────────────────────────────── */
function RowSkeleton({ count, cols, colWidths }: { count: number; cols: number; colWidths?: string }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: colWidths ?? `repeat(${cols}, 1fr)`, padding: '16px 24px', borderBottom: `1px solid ${B.border}`, gap: 16, alignItems: 'center' }}>
                    {Array.from({ length: cols }).map((_, j) => (
                        <div key={j} style={{ height: 14, background: B.gray100, borderRadius: 6, width: j === 0 ? '70%' : '50%', animation: 'pulse 1.5s ease infinite' }} />
                    ))}
                </div>
            ))}
        </>
    );
}

/* ── CONFIRM MODAL ─────────────────────────────────────── */
interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel?: string;
    confirmColor?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({ title, message, confirmLabel = "Confirmer", confirmColor = B.danger, onConfirm, onCancel }: ConfirmModalProps) {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div style={{ background: B.surface, borderRadius: 18, padding: '28px 28px', maxWidth: 380, width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.15)', animation: 'fadeUp 0.2s ease both' }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: B.dangerLight, border: `1px solid ${B.dangerBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <AlertCircle size={20} color={B.danger} strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: B.navy900, margin: '0 0 8px', letterSpacing: '-0.2px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: B.gray500, margin: '0 0 24px', lineHeight: 1.6 }}>{message}</p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={onCancel} style={{ flex: 1, height: 40, borderRadius: 10, background: B.gray50, border: `1px solid ${B.border}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: B.gray500 }}>
                        Annuler
                    </button>
                    <button onClick={onConfirm} style={{ flex: 1, height: 40, borderRadius: 10, background: confirmColor, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: B.white }}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── STATUS BADGE ──────────────────────────────────────── */
export function StatusBadge({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
    return (
        <span style={{ fontSize: 9, fontWeight: 800, color, background: bg, border: `1px solid ${border}`, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {label}
        </span>
    );
}

/* ── ACTION BUTTON ─────────────────────────────────────── */
interface ActionBtnProps {
    label?: string;
    icon?: React.FC<any>;
    onClick: () => void;
    loading?: boolean;
    variant?: "primary" | "danger" | "ghost";
    size?: "sm" | "md";
    disabled?: boolean;
}

const VARIANT_STYLES = {
    primary: { bg: B.navy700,     color: B.white,  border: 'transparent',    hoverBg: B.orange500 },
    danger:  { bg: B.dangerLight, color: B.danger, border: B.dangerBorder,   hoverBg: B.danger },
    ghost:   { bg: B.gray50,      color: B.gray500, border: B.border,         hoverBg: B.gray100 },
};

export function ActionBtn({ label, icon: Icon, onClick, loading, variant = "primary", size = "sm", disabled }: ActionBtnProps) {
    const [hov, setHov] = useState(false);
    const v = VARIANT_STYLES[variant];
    const h = size === "sm" ? 30 : 38;

    return (
        <button
            onClick={onClick}
            disabled={loading || disabled}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                height: h, padding: label ? `0 ${size === "sm" ? 12 : 16}px` : `0 ${h / 4}px`,
                width: !label ? h : 'auto',
                borderRadius: size === "sm" ? 8 : 10,
                background: hov && !disabled ? v.hoverBg : v.bg,
                color: hov && variant !== "primary" && !disabled ? B.white : v.color,
                border: `1px solid ${v.border}`,
                cursor: loading || disabled ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                fontSize: size === "sm" ? 10 : 12, fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                transition: 'all 0.12s', opacity: disabled ? 0.5 : 1,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
        >
            {loading
                ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                : Icon && <Icon size={11} strokeWidth={2.5} color={hov && !disabled ? B.white : v.color} />
            }
            {label && !loading && label}
        </button>
    );
}

export { B };