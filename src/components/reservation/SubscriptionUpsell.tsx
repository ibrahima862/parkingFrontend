import { ChevronRight, Zap } from "lucide-react";


/* ─────────────────────────────────────────────────────────
   COMPOSANT SUBSCRIPTION UPSELL (Incentive)
───────────────────────────────────────────────────────── */
export function SubscriptionUpsell({ isPremium }: { isPremium: boolean }) {
    if (isPremium) return (
        <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            borderRadius: 14,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
            animation: 'slideIn 0.3s ease'
        }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={14} color="#fff" fill="#fff" />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#166534', margin: 0, lineHeight: 1.4 }}>
                Avantage Premium : <span style={{ color: '#15803d' }}>Cette session est 100% incluse dans votre abonnement.</span>
            </p>
        </div>
    );

    return (
        <div
            onClick={() => window.location.href = '/abonnements'}
            style={{
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                marginBottom: 12,
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#0369A1', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Passer Premium</p>
                <p style={{ fontSize: 11, color: '#075985', margin: 0, lineHeight: 1.3, fontWeight: 500 }}>
                    Économisez <strong style={{ fontWeight: 800 }}>{(500).toLocaleString()} FCFA</strong> sur cette session.
                </p>
            </div>
            <ChevronRight size={14} color="#0369A1" strokeWidth={3} />
        </div>
    );
}

