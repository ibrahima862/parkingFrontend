
import {T} from "./SetCard";

export type TabId = "stats" | "proprios" | "parkings" | "paiements";
interface Tab { id: TabId; label: string; Icon: React.ElementType; badge?: number }

function CountBadge({ count, color, bg, border }: { count: number; color: string; bg: string; border: string }) {
    if (!count) return null;
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            minWidth: 18, height: 18, borderRadius: T.r999,
            background: bg, border: `1px solid ${border}`,
            fontSize: 10, fontWeight: 700, color, padding: "0 5px",
        }}>
            {count > 99 ? "99+" : count}
        </span>
    );
}
/* ══════════════════════════════════════════════════════
   TAB BAR
══════════════════════════════════════════════════════ */
export function TabBar({ tabs, active, onChange }: { tabs: Tab[]; active: TabId; onChange: (id: TabId) => void }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 2,
            background: T.surfaceSubtle,
            border: `1px solid ${T.border}`,
            borderRadius: T.r12, padding: 4,
        }}>
            {tabs.map(({ id, label, Icon, badge }) => {
                const isActive = id === active;
                return (
                    <button
                        key={id}
                        onClick={() => onChange(id)}
                        style={{
                            display: "flex", alignItems: "center", gap: 7,
                            padding: "7px 14px", borderRadius: T.r8,
                            border: isActive ? `1px solid ${T.brandBorder}` : "1px solid transparent",
                            background: isActive ? T.surface : "transparent",
                            color: isActive ? T.ink : T.inkMute,
                            fontSize: 12, fontWeight: isActive ? 700 : 500,
                            boxShadow: isActive ? `${T.shadowSm}, 0 0 0 0.5px ${T.brandBorder}` : "none",
                            transition: "all .15s cubic-bezier(.4,0,.2,1)",
                            whiteSpace: "nowrap",
                        }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = T.surfaceHov; }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                        <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{label}</span>
                        {badge != null && badge > 0 && (
                            <CountBadge count={badge} color={T.amber} bg={T.amberSoft} border={T.amberBorder} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}