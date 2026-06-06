import { T } from "./SetCard";

export function CountBadge({ count, color, bg, border }: { count: number; color: string; bg: string; border: string }) {
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