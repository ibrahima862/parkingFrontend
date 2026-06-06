
/* ─── SKELETON ─── */
export function Skeleton() {
    const s: React.CSSProperties = { animation: 'pulse 1.4s ease infinite', borderRadius: 10, background: '#F0F2FA' };
    return (
        <div style={{ minHeight: '100vh', background: '#F2F4FA' }}>
            <div style={{ height: 56, background: '#0D1B3E' }} />
            <div style={{ height: 50, background: '#060F2A' }} />
            <div style={{ maxWidth: 900, margin: '28px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 310px', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[200, 160, 240, 140].map((h, i) => <div key={i} style={{ height: h, ...s }} />)}
                </div>
                <div style={{ height: 360, ...s }} />
            </div>
        </div>
    );
}
