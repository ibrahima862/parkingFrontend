
interface KpiCardProps {
    B:any;
    label: string;
    value: string;
    sub?: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
    trend?: string;
}
/* ── KPI CARD (moderne, avec ombre et survol) ── */
export default function KpiCard({ label, value, sub, icon: Icon, color, bg, border, trend,B}:KpiCardProps) {
 
    return (
        <div style={{
            background: B.white, borderRadius: 20, padding: '20px 22px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)',
            border: `1px solid ${B.gray100}`, transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default'
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 20px -12px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)'; }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={color} strokeWidth={2} />
                </div>
                {trend && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: B.success, background: B.successLight, padding: '4px 10px', borderRadius: 40 }}>
                        {trend}
                    </span>
                )}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: B.navy900, letterSpacing: '-0.02em', fontFamily: 'Inter, system-ui', marginBottom: 6 }}>{value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: B.gray400, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            {sub && <div style={{ fontSize: 12, color: B.gray300, marginTop: 4 }}>{sub}</div>}
        </div>
    );
}
