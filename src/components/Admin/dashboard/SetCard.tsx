import { useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export const T = {
    /* Backgrounds */
    bg:           "hsl(220 20% 97%)",
    bgPage:       "hsl(220 25% 95%)",
    surface:      "#FFFFFF",
    surfaceRaised:"hsl(0 0% 100%)",
    surfaceSubtle:"hsl(220 15% 98%)",
    surfaceHov:   "hsl(220 15% 96%)",
    glass:        "rgba(255,255,255,0.72)",

    /* Text */
    ink:          "hsl(222 47% 9%)",
    inkMed:       "hsl(222 22% 28%)",
    inkMute:      "hsl(220 14% 52%)",
    inkFaint:     "hsl(220 12% 72%)",
    inkInverse:   "#FFFFFF",

    /* Brand */
    brand:        "hsl(221 83% 53%)",
    brandHov:     "hsl(221 83% 46%)",
    brandSoft:    "hsl(221 94% 97%)",
    brandMid:     "hsl(221 83% 93%)",
    brandBorder:  "hsl(221 83% 80%)",

    /* Semantic */
    green:        "hsl(158 64% 35%)",
    greenSoft:    "hsl(158 64% 95%)",
    greenBorder:  "hsl(158 64% 78%)",

    amber:        "hsl(32 95% 44%)",
    amberSoft:    "hsl(48 96% 95%)",
    amberBorder:  "hsl(40 94% 73%)",

    red:          "hsl(0 72% 51%)",
    redSoft:      "hsl(0 86% 97%)",
    redBorder:    "hsl(0 86% 80%)",

    violet:       "hsl(262 83% 58%)",
    violetSoft:   "hsl(262 83% 97%)",
    violetBorder: "hsl(262 83% 80%)",

    /* Borders */
    border:       "hsl(220 16% 90%)",
    borderHov:    "hsl(220 16% 80%)",
    borderFocus:  "hsl(221 83% 53%)",

    /* Radius */
    r4:  "4px",
    r8:  "8px",
    r10: "10px",
    r12: "12px",
    r14: "14px",
    r16: "16px",
    r999:"999px",

    /* Shadows */
    shadowXs: "0 1px 2px rgba(16,24,40,0.05)",
    shadowSm: "0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.06)",
    shadowMd: "0 4px 8px -2px rgba(16,24,40,0.08), 0 2px 4px -2px rgba(16,24,40,0.06)",
    shadowLg: "0 12px 24px -4px rgba(16,24,40,0.10), 0 4px 8px -2px rgba(16,24,40,0.06)",
    shadowXl: "0 20px 40px -8px rgba(16,24,40,0.14), 0 8px 16px -4px rgba(16,24,40,0.06)",
    shadowGlow:"0 0 0 3px hsl(221 83% 53% / 0.15)",
    shadowBrand:"0 8px 24px -4px hsl(221 83% 53% / 0.28)",
};

export function StatCard({
    label, value, icon: Icon, accent, sub, trend, trendUp = true, delay = 0
}: {
    label: string; value: any; icon: React.ElementType;
    accent: string; sub?: string; trend?: string; trendUp?: boolean; delay?: number;
}) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                background: T.surface,
                border: `1px solid ${hov ? T.borderHov : T.border}`,
                borderRadius: T.r14,
                padding: "20px",
                position: "relative",
                overflow: "hidden",
                transition: "all .22s cubic-bezier(.4,0,.2,1)",
                boxShadow: hov ? T.shadowLg : T.shadowSm,
                transform: hov ? "translateY(-3px)" : "translateY(0)",
                animation: `fadeUp .4s ease ${delay}ms both`,
                cursor: "default",
            }}
        >
            {/* Top accent bar */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${accent}, ${accent}80)`,
                borderRadius: `${T.r14} ${T.r14} 0 0`,
                opacity: hov ? 1 : 0,
                transition: "opacity .22s ease",
            }} />

            {/* Subtle background tint */}
            <div style={{
                position: "absolute", top: 0, right: 0,
                width: 80, height: 80,
                borderRadius: "0 14px 0 80px",
                background: `${accent}08`,
                transition: "all .22s",
            }} />

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, position: "relative" }}>
                <div style={{
                    width: 36, height: 36, borderRadius: T.r10,
                    background: `${accent}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${accent}25`,
                }}>
                    <Icon size={16} color={accent} strokeWidth={2.2} />
                </div>
                {trend && (
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: 3,
                        fontSize: 11, fontWeight: 700,
                        color: trendUp ? T.green : T.red,
                        background: trendUp ? T.greenSoft : T.redSoft,
                        border: `1px solid ${trendUp ? T.greenBorder : T.redBorder}`,
                        padding: "2px 7px", borderRadius: T.r999,
                    }}>
                        {trendUp
                            ? <ArrowUpRight size={10} strokeWidth={3} />
                            : <ArrowDownRight size={10} strokeWidth={3} />
                        }
                        {trend}
                    </span>
                )}
            </div>

            <div style={{
                fontSize: 28, fontWeight: 700, color: T.ink,
                letterSpacing: "-0.04em",
                fontFamily: "'IBM Plex Mono', monospace",
                lineHeight: 1, marginBottom: 6,
            }}>
                {value}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.inkMute, textTransform: "uppercase", letterSpacing: ".07em" }}>
                {label}
            </div>
            {sub && (
                <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 4 }}>{sub}</div>
            )}
        </div>
    );
}
