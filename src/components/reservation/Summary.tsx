import { CheckCircle, Loader2, ShieldCheck, Ticket, Clock, CalendarCheck } from "lucide-react";
import { ParkingDetails } from "../../type";
import { fmtDate, fmtDuration } from "../../Utils/utils";
import { useState } from "react";
import { SubscriptionUpsell } from "./SubscriptionUpsell";

/* ─────────────────────────────────────────────────────────
   COMPOSANT SUMMARY COMPLET (HORAIRE & ABONNEMENT)
───────────────────────────────────────────────────────── */
export function Summary({ 
    details, 
    dureeH, 
    total, 
    submitting, 
    onPay, 
    isPremium, 
    mode, 
    setMode 
}: {
    mode: 'horaire' | 'abonnement';
    setMode: (m: 'horaire' | 'abonnement') => void;
    details: ParkingDetails;
    dureeH: number;
    total: number;
    submitting: boolean;
    onPay: (mode: 'horaire' | 'abonnement') => void;
    isPremium: boolean;
}) {
    const [hov, setHov] = useState(false);
    
    // Suppression du useState interne de mode pour utiliser celui du parent (reçu en props)

    // Le bouton est actif si on ne soumet pas ET (c'est un abonnement OU on est premium OU le total > 0)
    const canPay = !submitting && (mode === 'abonnement' || isPremium || total > 0);

    // Définition des lignes d'information selon le mode choisi
    const lines = mode === 'horaire' ? [
        { label: 'Parking', value: details.nomParking, mono: false },
        { label: 'Tarif / heure', value: `${details.prixHeure.toLocaleString('fr-FR')} FCFA`, mono: true },
        ...(dureeH > 0 ? [{ label: 'Durée', value: fmtDuration(dureeH), mono: true }] : []),
        ...(details.dateDebut && details.heureDebut ? [{ label: 'Arrivée', value: fmtDate(details.dateDebut, details.heureDebut), mono: false }] : []),
        ...(details.dateFin && details.heureFin ? [{ label: 'Départ', value: fmtDate(details.dateFin, details.heureFin), mono: false }] : []),
        ...(details.matricule_vehicule ? [{ label: 'Véhicule', value: details.matricule_vehicule.toUpperCase(), mono: true }] : []),
    ] : [
        { label: 'Parking', value: details.nomParking, mono: false },
        { label: 'Type', value: 'Abonnement Mensuel', mono: false },
        { label: 'Accès', value: 'Illimité 24h/7j', mono: false },
        { label: 'Véhicule', value: details.matricule_vehicule?.toUpperCase() || 'Non spécifié', mono: true },
    ];

    return (
        <div style={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* 1. Sélecteur de Mode (Tabs) */}
            <div style={{
                display: 'flex',
                background: '#F1F5F9',
                padding: 4,
                borderRadius: 16,
                border: '1px solid #E2E8F0',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}>
                <button 
                    onClick={() => setMode('horaire')}
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px', borderRadius: 12, border: 'none', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: mode === 'horaire' ? '#0D1B3E' : 'transparent',
                        color: mode === 'horaire' ? '#fff' : '#64748B',
                        boxShadow: mode === 'horaire' ? '0 4px 12px rgba(13,27,62,0.2)' : 'none'
                    }}>
                    <Clock size={14} /> Horaire
                </button>
                <button 
                    onClick={() => setMode('abonnement')}
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        padding: '10px', borderRadius: 12, border: 'none', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: mode === 'abonnement' ? '#0D1B3E' : 'transparent',
                        color: mode === 'abonnement' ? '#fff' : '#64748B',
                        boxShadow: mode === 'abonnement' ? '0 4px 12px rgba(13,27,62,0.2)' : 'none'
                    }}>
                    <CalendarCheck size={14} /> Abonnement
                </button>
            </div>

            {/* 2. Upsell (Affiche uniquement si en mode horaire) */}
            {mode === 'horaire' && <SubscriptionUpsell isPremium={isPremium} />}

            {/* 3. Carte récapitulative principale */}
            <div style={{
                background: '#0D1B3E',
                borderRadius: 24,
                padding: '24px 20px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 24px 56px rgba(6,15,42,0.25)',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* Effet décoratif qui change de couleur selon le mode */}
                <div style={{ 
                    position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', 
                    background: mode === 'abonnement' ? 'rgba(59,130,246,0.15)' : (isPremium ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.12)'), 
                    transition: 'background 0.5s ease',
                    pointerEvents: 'none' 
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                        <Ticket size={12} color="rgba(255,255,255,0.3)" />
                        <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
                            {mode === 'horaire' ? 'Récapitulatif Session' : 'Détails Forfait'}
                        </p>
                    </div>

                    {/* Liste des détails */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 18, marginBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {lines.map(({ label, value, mono }) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{label}</span>
                                <span style={{
                                    fontSize: 11, fontWeight: 700, color: '#fff', textAlign: 'right',
                                    fontFamily: mono ? 'IBM Plex Mono, monospace' : 'inherit',
                                    maxWidth: '65%'
                                }}>{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Section Prix Dynamique */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                        <div>
                            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px' }}>Net à payer</p>
                            {(isPremium && mode === 'horaire') && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#22C55E' }} />
                                    <p style={{ fontSize: 9, fontWeight: 900, color: '#22C55E', margin: 0 }}>OFFERT (Premium)</p>
                                </div>
                            )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{
                                fontSize: 36, fontWeight: 900, 
                                color: (mode === 'horaire' && isPremium) ? '#22C55E' : (mode === 'abonnement' ? '#3B82F6' : '#FB923C'),
                                letterSpacing: '-1.5px', fontFamily: 'IBM Plex Mono, monospace', margin: 0, lineHeight: 1,
                                textDecoration: (isPremium && mode === 'horaire' && total > 0) ? 'line-through' : 'none',
                                opacity: (isPremium && mode === 'horaire' && total > 0) ? 0.4 : 1,
                                transition: 'color 0.3s'
                            }}>
                                {mode === 'abonnement' ? '15.000' : (isPremium ? '0' : total.toLocaleString('fr-FR'))}
                            </p>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: 700, margin: '2px 0 0' }}>
                                FCFA {mode === 'abonnement' && '/ MOIS'}
                            </p>
                        </div>
                    </div>

                    {/* Bouton d'action adaptatif */}
                    <button
                        onClick={() => onPay(mode)}
                        disabled={!canPay}
                        onMouseEnter={() => setHov(true)}
                        onMouseLeave={() => setHov(false)}
                        style={{
                            width: '100%', height: 52, borderRadius: 14, border: 'none',
                            background: !canPay ? 'rgba(255,255,255,0.07)' : 
                                       mode === 'abonnement' ? (hov ? '#2563EB' : '#3B82F6') :
                                       isPremium ? (hov ? '#15803d' : '#16a34a') : (hov ? '#C2550A' : '#F97316'),
                            color: !canPay ? 'rgba(255,255,255,0.15)' : '#fff',
                            cursor: canPay ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            fontSize: 13, fontWeight: 900, letterSpacing: '0.01em',
                            boxShadow: canPay ? `0 12px 30px ${mode === 'abonnement' ? 'rgba(59,130,246,0.25)' : isPremium ? 'rgba(34,197,94,0.25)' : 'rgba(249,115,22,0.3)'}` : 'none',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontFamily: 'inherit'
                        }}
                    >
                        {submitting ? (
                            <><Loader2 size={16} className="animate-spin" /> Traitement en cours...</>
                        ) : mode === 'abonnement' ? (
                            <><CalendarCheck size={16} strokeWidth={2.5} /> S'abonner maintenant</>
                        ) : isPremium ? (
                            <><CheckCircle size={16} strokeWidth={3} /> Valider la session</>
                        ) : (
                            <><ShieldCheck size={16} strokeWidth={2.5} /> Payer maintenant</>
                        )}
                    </button>
                </div>
            </div>

            {/* 4. Footer de réassurance */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px',
                background: '#fff', border: '1px solid #E6EAF5', borderRadius: 14
            }}>
                <ShieldCheck size={14} color="#1A3A8F" strokeWidth={2.5} />
                <span style={{ fontSize: 10, fontWeight: 800, color: '#0D1B3E', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Garanti par PayTech Sénégal
                </span>
            </div>
        </div>
    );
}