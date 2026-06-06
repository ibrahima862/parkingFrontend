import { useEffect, useRef } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, CheckCircle2, AlertCircle, Wallet, } from "lucide-react";
import {T} from "./SetCard";

export const MOCK_NOTIFS = [
    { id: 1, type: "success", msg: "Parking Dakar Centre validé", time: "2 min", icon: CheckCircle2 },
    { id: 2, type: "warning", msg: "Nouveau propriétaire en attente", time: "15 min", icon: AlertCircle },
    { id: 3, type: "info", msg: "Retrait de 45 000 F demandé", time: "1h", icon: Wallet },
];



export function NotifDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open, onClose]);

    if (!open) return null;

    const colorMap = {
        success: { c: T.green, bg: T.greenSoft, b: T.greenBorder },
        warning: { c: T.amber, bg: T.amberSoft, b: T.amberBorder },
        info:    { c: T.brand, bg: T.brandSoft, b: T.brandBorder },
    } as const;

    return (
        <div ref={ref} style={{
            position: "absolute", top: "calc(100% + 10px)", right: 0,
            width: 320, background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.r14, boxShadow: T.shadowXl,
            animation: "slideDown .18s ease both",
            zIndex: 200,
        }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Notifications</span>
                <span style={{ fontSize: 11, color: T.brand, fontWeight: 600, cursor: "pointer" }}>Tout marquer lu</span>
            </div>
            {MOCK_NOTIFS.map(n => {
                const col = colorMap[n.type as keyof typeof colorMap];
                const NIcon = n.icon;
                return (
                    <div key={n.id} style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "12px 16px", borderBottom: `1px solid ${T.border}`,
                        transition: "background .12s",
                        cursor: "pointer",
                    }}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = T.surfaceSubtle}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                    >
                        <div style={{ width: 32, height: 32, borderRadius: T.r8, background: col.bg, border: `1px solid ${col.b}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <NIcon size={14} color={col.c} strokeWidth={2.2} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, marginBottom: 2 }}>{n.msg}</div>
                            <div style={{ fontSize: 11, color: T.inkFaint }}>{n.time} ago</div>
                        </div>
                    </div>
                );
            })}
            <div style={{ padding: "10px 16px", textAlign: "center" }}>
                <span style={{ fontSize: 12, color: T.inkMute, cursor: "pointer", fontWeight: 500 }}>Voir tout →</span>
            </div>
        </div>
    );
}