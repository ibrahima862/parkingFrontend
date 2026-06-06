import { T } from "./Sidebar";

export function StatusBadge({
    label, color, bg, border, dot = true, pulse = false
}: { label: string; color: string; bg: string; border: string; dot?: boolean; pulse?: boolean }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 9px", borderRadius: T.brand,
            background: bg, border: `1px solid ${border}`,
            fontSize: 11, fontWeight: 600, color, letterSpacing: ".01em",
            whiteSpace: "nowrap",
        }}>
            {dot && (
                <span style={{
                    position: "relative", width: 5, height: 5,
                    borderRadius: "50%", background: color, flexShrink: 0,
                    display: "inline-block",
                }} className={pulse ? "pulse-dot" : ""} />
            )}
            {label}
        </span>
    );
}
export default StatusBadge;