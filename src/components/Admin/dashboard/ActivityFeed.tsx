// src/components/Admin/dashboard/ActivityFeed.tsx
import React from "react";
import { 
    Activity, CheckCircle2, ChevronRight, Circle, 
    Users, Wallet, XCircle, Clock 
} from "lucide-react";
import StatusBadge from "../../StatusBadge";
import { T } from "./SetCard";

interface ActivityItem {
    id: number;
    type: 'approve' | 'register' | 'payment' | 'reject' | 'info';
    msg: string;
    user: string;
    time: string;
}

interface ActivityFeedProps {
    activities?: ActivityItem[];
    loading?: boolean;
}

export function ActivityFeed({ activities = [], loading = false }: ActivityFeedProps) {
    
    // Configuration visuelle par type d'activité
    const config = {
        approve: { icon: CheckCircle2, color: T.green, bg: T.greenSoft, border: T.greenBorder },
        register: { icon: Users, color: T.brand, bg: T.brandSoft, border: T.brandBorder },
        payment: { icon: Wallet, color: "hsl(262 83% 58%)", bg: "hsl(262 83% 97%)", border: "hsl(262 83% 80%)" },
        reject: { icon: XCircle, color: T.red, bg: T.redSoft, border: T.redBorder },
        info: { icon: Clock, color: T.inkMute, bg: T.surfaceSubtle, border: T.border }
    };
   console.log("Activities in feed:", activities);
    return (
        <div style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: T.r14,
            overflow: "hidden",
            boxShadow: T.shadowSm,
            animation: "fadeUp .5s ease both",
        }}>
            {/* HEADER */}
            <div style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${T.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: `linear-gradient(180deg, ${T.surface} 0%, ${T.surfaceSubtle} 100%)`,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ 
                        width: 28, height: 28, borderRadius: T.r8, 
                        background: "hsl(262 83% 97%)", border: "1px solid hsl(262 83% 80%)", 
                        display: "flex", alignItems: "center", justifyContent: "center" 
                    }}>
                        <Activity size={13} color="hsl(262 83% 58%)" strokeWidth={2.2} />
                    </div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Activité récente</div>
                        <div style={{ fontSize: 11, color: T.inkMute }}>Flux en temps réel</div>
                    </div>
                </div>
                <StatusBadge label="Live" color={T.green} bg={T.greenSoft} border={T.greenBorder} pulse />
            </div>

            {/* LISTE D'ACTIVITÉS */}
            <div style={{ minHeight: activities.length === 0 ? 100 : 'auto' }}>
                {loading ? (
                    <div style={{ padding: 20, textAlign: 'center' }} className="shimmer-line" />
                ) : activities.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: T.inkFaint, fontSize: 12 }}>
                        Aucune activité récente pour le moment.
                    </div>
                ) : (
                    activities.slice(0, 5).map((item, idx) => {
                        const style = config[item.type] || config.info;
                        const ItemIcon = style.icon;
                        
                        return (
                            <div key={item.id} className="row-hover" style={{
                                display: "flex", alignItems: "flex-start", gap: 12,
                                padding: "12px 18px",
                                borderBottom: idx < activities.length - 1 ? `1px solid ${T.border}` : "none",
                                animation: `fadeUp .3s ease ${idx * 60}ms both`,
                                transition: "background .12s",
                                cursor: "default",
                            }}>
                                {/* TIMELINE DESIGN */}
                                <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <div style={{ 
                                        width: 32, height: 32, borderRadius: T.r8, 
                                        background: style.bg, border: `1px solid ${style.border}`, 
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
                                    }}>
                                        <ItemIcon size={14} color={style.color} strokeWidth={2.2} />
                                    </div>
                                    {idx < activities.length - 1 && (
                                        <div style={{ 
                                            width: 1, height: "calc(100% + 12px)", 
                                            background: T.border, marginTop: 4, position: "absolute", top: 32 
                                        }} />
                                    )}
                                </div>

                                {/* CONTENT */}
                                <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
                                    <div style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, marginBottom: 2 }}>{item.msg}</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ fontSize: 11, color: T.inkFaint }}>{item.user}</span>
                                        <Circle size={3} color={T.inkFaint} fill={T.inkFaint} />
                                        <span style={{ fontSize: 11, color: T.inkFaint }}>{item.time}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* FOOTER */}
            <div style={{ padding: "10px 18px", borderTop: `1px solid ${T.border}`, textAlign: "center" }}>
                <button style={{
                    background: "none", border: "none",
                    fontSize: 12, color: T.inkMute, fontWeight: 500,
                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                    Voir tout l'historique <ChevronRight size={12} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}