import { Zap } from "lucide-react";
import StatusBadge from "../../StatusBadge";
import { T } from "./SetCard";
/* ══════════════════════════════════════════════════════
   PAGE HEADER BANNER
══════════════════════════════════════════════════════ */
export function PageBanner({ pendingCount }: { pendingCount: number }) {
    return (
        <div style={{
            marginBottom: 24,
            background: '#FAFAFA',
            border: `1px solid ${T.border}`,
            borderRadius: T.r14,
            padding: "20px 24px",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 16,
            flexWrap: "wrap",
            animation: "fadeUp .3s ease both",
        }}>
            <div>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: 10, textTransform: "uppercase", fontWeight: 700,
                    color: T.brand, letterSpacing: ".08em",
                    background: T.brandSoft, border: `1px solid ${T.brandBorder}`,
                    padding: "3px 9px", borderRadius: T.r999, marginBottom: 10,
                }}>
                    <Zap size={10} strokeWidth={3} />
                    Console Admin
                </div>
                <h1 style={{
                    fontSize: 22, fontWeight: 800, color: T.ink,
                    letterSpacing: "-.03em", lineHeight: 1.2, marginBottom: 6,
                }}>
                    Dashboard Administrateur
                </h1>
                <p style={{ fontSize: 13, color: T.inkMute, lineHeight: 1.5 }}>
                    Vue consolidée des validations, paiements et actions en attente.
                </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
                <StatusBadge
                    label={`${pendingCount} validations ouvertes`}
                    color={T.brand} bg={T.brandSoft} border={T.brandBorder}
                />
            </div>
        </div>
    );
}
