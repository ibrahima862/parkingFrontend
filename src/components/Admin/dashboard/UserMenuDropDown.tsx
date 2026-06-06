import { useEffect, useRef } from "react";
import { User, Settings, LogOut } from "lucide-react";
import {T} from "./SetCard";
import { NotifDropdown } from "./NotifDropDown";

/* ══════════════════════════════════════════════════════
   USER MENU DROPDOWN
══════════════════════════════════════════════════════ */
export function UserMenuDropdown({ open, onClose }: { open: boolean; onClose: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open, onClose]);

    if (!open) return null;

    const items = [
        { label: "Profil", icon: User },
        { label: "Paramètres", icon: Settings },
        { label: "Déconnexion", icon: LogOut, danger: true },
    ];

    return (
        <div ref={ref} style={{
            position: "absolute", top: "calc(100% + 10px)", right: 0,
            width: 200, background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.r12, boxShadow: T.shadowXl,
            animation: "slideDown .18s ease both",
            zIndex: 200, overflow: "hidden",
        }}>
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Admin SenovaPark</div>
                <div style={{ fontSize: 11, color: T.green, fontWeight: 600, marginTop: 2 }}>● Actif</div>
            </div>
            {items.map(({ label, icon: ItemIcon, danger }) => (
                <div key={label} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", cursor: "pointer",
                    color: danger ? T.red : T.inkMed, fontSize: 13, fontWeight: 500,
                    transition: "background .12s",
                }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = danger ? T.redSoft : T.surfaceSubtle}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                    <ItemIcon size={14} strokeWidth={2} />
                    {label}
                </div>
            ))}
        </div>
    );
}


