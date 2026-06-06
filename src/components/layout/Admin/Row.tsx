import { Calendar, Check, Loader2, Mail, Phone, X } from "lucide-react";
import { useState } from "react";

interface RowProps {
    B:any
    p: any;
    onApprove: () => void;
    onReject: () => void;
}
/* ── PROPRIETAIRE ROW (moderne, avec avatars et boutons) ── */
export default function Row({ B, p, onApprove, onReject }: RowProps) {
    const [hover, setHover] = useState(false);
    const [approving, setApproving] = useState(false);
    const initials = p.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
    const date = new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

    const handleApprove = async () => {
        setApproving(true);
        await onApprove();
        setApproving(false);
    };

    return (
        <div
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto',
                alignItems: 'center', padding: '16px 24px',
                borderBottom: `1px solid ${B.gray100}`,
                background: hover ? B.gray50 : B.white,
                transition: 'background 0.2s ease',
                gap: 20,
            }}
        >
            {/* Identité */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: `linear-gradient(135deg, ${B.navy500} 0%, ${B.navy700} 100%)`,
                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, color: B.white, fontFamily: 'monospace',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}>
                    {initials}
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: B.navy900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: B.orange600, background: B.orange50, padding: '2px 8px', borderRadius: 40, letterSpacing: '0.02em' }}>
                            Nouveau
                        </span>
                    </div>
                </div>
            </div>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={12} color={B.gray400} strokeWidth={2} />
                    <span style={{ fontSize: 12, color: B.gray600, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={12} color={B.gray400} strokeWidth={2} />
                    <span style={{ fontSize: 12, color: B.gray600, fontWeight: 500 }}>{p.telephone || '—'}</span>
                </div>
            </div>

            {/* Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={12} color={B.gray400} strokeWidth={2} />
                <span style={{ fontSize: 12, color: B.gray500, fontWeight: 500 }}>{date}</span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: hover ? 1 : 0.6, transition: 'opacity 0.2s' }}>
                <button
                    onClick={onReject}
                    style={{
                        width: 36, height: 36, borderRadius: 12,
                        background: B.dangerLight, border: `1px solid ${B.dangerBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = B.danger; e.currentTarget.style.borderColor = B.danger; }}
                    onMouseLeave={e => { e.currentTarget.style.background = B.dangerLight; e.currentTarget.style.borderColor = B.dangerBorder; }}
                >
                    <X size={14} color={B.danger} strokeWidth={2.5} />
                </button>
                <button
                    onClick={handleApprove}
                    disabled={approving}
                    style={{
                        height: 36, padding: '0 16px', borderRadius: 12,
                        background: approving ? B.navy300 : B.orange500,
                        border: 'none', cursor: approving ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        fontSize: 11, fontWeight: 800, color: B.white,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { if (!approving) e.currentTarget.style.background = B.orange600; }}
                    onMouseLeave={e => { if (!approving) e.currentTarget.style.background = B.orange500; }}
                >
                    {approving ? <Loader2 size={12} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={12} strokeWidth={2.5} />}
                    {approving ? '...' : 'Approuver'}
                </button>
            </div>
        </div>
    );
}
