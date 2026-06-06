import React, { useEffect, useState } from "react";
import { 
    CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, 
    Search, Filter, Download, CheckCircle2, Clock, 
    AlertCircle, ExternalLink, Zap,
    Loader2
} from "lucide-react";

const B = {
    navy900: '#0D1B3E', navy700: '#0D2B6E', navy50: '#EEF2FB',
    orange500: '#F97316', orange50: '#FFF4EE', white: '#FFFFFF',
    border: '#E8ECF5', gray50: '#F8F9FC', gray400: '#9198B2',
    success: '#059669', successLight: '#ECFDF5',
    danger: '#DC2626', dangerLight: '#FEF2F2',
    violet: '#7C3AED', violetLight: '#F5F3FF'
};

/* ── MINI STAT CARD ── */
const StatMini = ({ label, value, icon: Icon, color, bg }: any) => (
    <div style={{ background: 'white', padding: '16px', borderRadius: 16, border: `1px solid ${B.border}`, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={14} color={color} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: B.gray400, textTransform: 'uppercase' }}>{label}</span>
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: B.navy900, fontFamily: 'IBM Plex Mono' }}>{value}</div>
    </div>
);

export function AdminPayments({tab}: {tab: string}) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/admin/paiements/stats`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error("Erreur paiements:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 100, color: B.navy700 }}>
            <Loader2 className="spin-icon" size={32} />
        </div>
    );

    return (
        <div className="tab-enter" style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24,background:'#fafafa' }}>
            
            {/* ── HEADER STATS DYNAMIQUES ── */}
            <div style={{ display: 'flex', gap: 16 ,background:'#fafafa'}}>
                <StatMini 
                    label="Volume Total" 
                    value={`${(data?.volume_total || 0).toLocaleString()} F`} 
                    icon={DollarSign} color={B.navy700} bg={B.navy50} 
                />
                <StatMini 
                    label="Commission (10%)" 
                    value={`${(data?.commission_total || 0).toLocaleString()} F`} 
                    icon={Zap} color={B.orange500} bg={B.orange50} 
                />
                <StatMini 
                    label="En attente retrait" 
                    value={`${(data?.en_attente_retrait || 0).toLocaleString()} F`} 
                    icon={Clock} color={B.violet} bg={B.violetLight} 
                />
                <StatMini 
                    label="Taux de succès" 
                    value="100%" 
                    icon={CheckCircle2} color={B.success} bg={B.successLight} 
                />
            </div>

            {/* ── TRANSACTION TABLE ── */}
            <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${B.border}`, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${B.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: 15, fontWeight: 800, color: B.navy900, margin: 0 }}>Historique des Transactions</h2>
                        <p style={{ fontSize: 11, color: B.gray400, marginTop: 4 }}>Suivi des réservations en temps réel</p>
                    </div>
                    <button style={{ height: 34, padding: '0 12px', borderRadius: 10, border: `1px solid ${B.border}`, background: 'white', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <Download size={14} /> Export
                    </button>
                </div>

                {/* Header Table */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.5fr 1fr 1.2fr 100px', padding: '12px 24px', background: B.gray50, borderBottom: `1px solid ${B.border}` }}>
                    {['Référence', 'Client / Parking', 'Montant', 'Com.', 'Date', 'Statut'].map((h, i) => (
                        <span key={i} style={{ fontSize: 10, fontWeight: 800, color: B.gray400, textTransform: 'uppercase' }}>{h}</span>
                    ))}
                </div>

                {/* Rows Dynamiques */}
                {data?.transactions?.length > 0 ? (
                    data.transactions.map((t: any) => (
                        <div key={t.id} className="row-hover" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.5fr 1fr 1.2fr 100px', padding: '16px 24px', borderBottom: `1px solid ${B.border}`, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'IBM Plex Mono', color: B.navy700 }}>{t.id}</span>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: B.navy900 }}>{t.client}</div>
                                <div style={{ fontSize: 11, color: B.gray400 }}>{t.parking}</div>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 800, color: B.navy900 }}>{t.total.toLocaleString()} F</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: B.orange500 }}>{t.commission.toLocaleString()} F</span>
                            <span style={{ fontSize: 11, color: B.gray400 }}>{t.date}</span>
                            <div style={{ 
                                justifySelf: 'start', padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                                background: t.status === 'success' ? B.successLight : B.orange50,
                                color: t.status === 'success' ? B.success : B.orange500
                            }}>
                                {t.status === 'success' ? 'Réussi' : 'Attente'}
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ padding: 40, textAlign: 'center', color: B.gray400, fontSize: 13 }}>
                        Aucune transaction enregistrée.
                    </div>
                )}
            </div>
        </div>
    );
}