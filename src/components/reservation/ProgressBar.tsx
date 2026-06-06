import { Check } from "lucide-react";

/* ─── PROGRESS BAR ─── */
export function ProgressBar() {
    const steps = [{ n: 1, label: 'Choisir', done: true }, { n: 2, label: 'Réserver', active: true }, { n: 3, label: 'Payer' }];
    return (
        <div style={{ background: '#060F2A', padding: '12px 24px 14px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                {steps.map((s, i) => (
                    <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {i > 0 && <div style={{ width: 32, height: 1, background: 'rgba(255,255,255,0.1)' }} />}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, background: s.done ? '#1A3A8F' : s.active ? '#F97316' : 'rgba(255,255,255,0.06)', color: s.done || s.active ? '#fff' : 'rgba(255,255,255,0.2)', boxShadow: s.active ? '0 0 0 3px rgba(249,115,22,0.22)' : 'none' }}>
                                {s.done ? <Check size={9} strokeWidth={3} /> : s.n}
                            </div>
                            <span style={{ fontSize: 11, fontWeight: s.active ? 700 : 500, color: s.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)' }}>{s.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
