import { useState } from "react";
import { Bell, RefreshCw, Search, User, XCircle, Zap } from "lucide-react";
import {T} from "./SetCard";
import StatusBadge from "../../StatusBadge";
import { MOCK_NOTIFS, NotifDropdown } from "./NotifDropDown";
import { UserMenuDropdown } from "./UserMenuDropDown";




/* ══════════════════════════════════════════════════════
   TOP BAR
══════════════════════════════════════════════════════ */
export function Topbar({ search, onSearch, onRefresh, refreshing, pendingCount }: {
    search: string; onSearch: (v: string) => void;
    onRefresh: () => void; refreshing: boolean; pendingCount: number;
}) {
    const [searchFoc, setSearchFoc] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [userOpen, setUserOpen]   = useState(false);

    return (
        <header style={{
            flexShrink: 0,
            background: T.glass,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: `1px solid ${T.border}`,
            position: "sticky", top: 0, zIndex: 100,
        }}>
            {/* Main row */}
            <div style={{
                minHeight: 64, padding: "0 24px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 16,
            }}>
                {/* Brand */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                   
                    <div>
                           <div style={{ fontSize: 10, color: T.inkMute, fontWeight: 500 }}>Console Admin</div>
                    </div>
                </div>

                {/* Right controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Search */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: T.surfaceSubtle,
                        border: `1px solid ${searchFoc ? T.borderFocus : T.border}`,
                        borderRadius: T.r10, padding: "0 12px",
                        height: 36, width: 256,
                        transition: "all .15s",
                        boxShadow: searchFoc ? T.shadowGlow : "none",
                    }}>
                        <Search size={12} color={T.inkFaint} />
                        <input
                            value={search}
                            onChange={e => onSearch(e.target.value)}
                            onFocus={() => setSearchFoc(true)}
                            onBlur={() => setSearchFoc(false)}
                            placeholder="Rechercher..."
                            style={{
                                background: "transparent", border: "none",
                                outline: "none", fontSize: 12.5, color: T.ink, width: "100%",
                            }}
                        />
                        {search && (
                            <button onClick={() => onSearch("")} style={{
                                background: "none", border: "none", padding: 0,
                                color: T.inkFaint, display: "flex", alignItems: "center",
                            }}>
                                <XCircle size={13} />
                            </button>
                        )}
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={onRefresh}
                        title="Rafraîchir"
                        style={{
                            width: 36, height: 36, borderRadius: T.r8,
                            background: T.surfaceSubtle, border: `1px solid ${T.border}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all .15s", color: T.inkMute,
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = T.surfaceHov; (e.currentTarget as HTMLButtonElement).style.borderColor = T.borderHov; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = T.surfaceSubtle; (e.currentTarget as HTMLButtonElement).style.borderColor = T.border; }}
                    >
                        <RefreshCw size={13} className={refreshing ? "spin-icon" : ""} strokeWidth={2.2} />
                    </button>

                    {/* Notifications */}
                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => { setNotifOpen(v => !v); setUserOpen(false); }}
                            style={{
                                width: 36, height: 36, borderRadius: T.r8,
                                background: notifOpen ? T.brandSoft : T.surfaceSubtle,
                                border: `1px solid ${notifOpen ? T.brandBorder : T.border}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                position: "relative", color: notifOpen ? T.brand : T.inkMute,
                                transition: "all .15s",
                            }}
                        >
                            <Bell size={13} strokeWidth={2.2} />
                            {MOCK_NOTIFS.length > 0 && (
                                <span style={{
                                    position: "absolute", top: 5, right: 5,
                                    width: 6, height: 6, borderRadius: "50%",
                                    background: T.red, border: `1.5px solid ${T.surface}`,
                                }} />
                            )}
                        </button>
                        <NotifDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
                    </div>

                    {/* User */}
                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => { setUserOpen(v => !v); setNotifOpen(false); }}
                            style={{
                                display: "flex", alignItems: "center", gap: 9,
                                padding: "4px 10px 4px 4px",
                                borderRadius: T.r10,
                                border: `1px solid ${userOpen ? T.brandBorder : T.border}`,
                                background: userOpen ? T.brandSoft : T.surfaceSubtle,
                                transition: "all .15s",
                            }}
                        >
                            <div style={{
                                width: 28, height: 28, borderRadius: T.r8,
                                background: "linear-gradient(135deg, hsl(221 83% 53%), hsl(262 83% 58%))",
                                color: "#fff", display: "flex", alignItems: "center",
                                justifyContent: "center", fontSize: 10, fontWeight: 800,
                                flexShrink: 0,
                            }}>AD</div>
                            <div style={{ textAlign: "left" }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>Admin</div>
                                <div style={{ fontSize: 10, color: T.green, fontWeight: 600 }}>Actif</div>
                            </div>
                        </button>
                        <UserMenuDropdown open={userOpen} onClose={() => setUserOpen(false)} />
                    </div>
                </div>
            </div>

            {/* Tab row */}
            <div style={{
                padding: "0 24px 12px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 12, flexWrap: "wrap",
            }}>
               
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {pendingCount > 0 && (
                        <StatusBadge
                            label={`${pendingCount} en attente`}
                            color={T.amber} bg={T.amberSoft} border={T.amberBorder}
                            pulse
                        />
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.inkMute, fontWeight: 500 }}>
                        <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: T.green, display: "inline-block",
                            animation: "pulse 2s ease infinite",
                        }} />
                        Données en direct
                    </div>
                </div>
            </div>
        </header>
    );
}