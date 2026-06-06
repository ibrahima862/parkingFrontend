/* ─── SECTION CARD ─── */
export function SectionCard({ icon: Icon, iconColor, iconBg, iconBorder, title, subtitle, children }: {
    icon: any; iconColor: string; iconBg: string; iconBorder: string;
    title: string; subtitle?: string; children: React.ReactNode;
}) {
    return (
        <div style={{ background: '#fff', border: '1px solid #E6EAF5', borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid #F0F2FA' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: iconBg, border: `1px solid ${iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={iconColor} strokeWidth={2.5} />
                </div>
                <div>
                    <h2 style={{ fontSize: 13, fontWeight: 800, color: '#0D1B3E', margin: 0, letterSpacing: '-0.1px' }}>{title}</h2>
                    {subtitle && <p style={{ fontSize: 11, color: '#8A93B2', margin: '2px 0 0', fontWeight: 500 }}>{subtitle}</p>}
                </div>
            </div>
            {children}
        </div>
    );
}
