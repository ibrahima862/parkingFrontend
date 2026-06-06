import { CheckCircle2 } from "lucide-react";
import { T } from "./SetCard";

export function EmptyState({ label }: { label: string }) {
    return (
        <div style={{
            padding: "52px 24px", textAlign: "center",
            animation: "fadeIn .4s ease both",
        }}>
            <div style={{
                width: 48, height: 48, borderRadius: T.r12,
                background: T.greenSoft, border: `1px solid ${T.greenBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
            }}>
                <CheckCircle2 size={22} color={T.green} strokeWidth={2} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 6 }}>
                {label}
            </div>
            <div style={{ fontSize: 12, color: T.inkMute }}>
                Aucune action requise pour le moment.
            </div>
        </div>
    );
}
