// src/features/admin/components/rows.tsx
import React, { useState } from "react";
import { MapPin, Car, X, Check, Mail, Phone, Calendar } from "lucide-react";
import { ActionBtn, ConfirmModal, StatusBadge, B } from "../components/ui/dashboard";
import { Parking, Proprio } from "../lib/api";



/* ── PROPRIO ROW ─────────────────────────────────────── */
interface ProprioRowProps {
    p: Proprio;
    onApprove: () => Promise<void>;
    onReject: () => Promise<void>;
    colWidths: string;
}

export function ProprioRow({ p, onApprove, onReject, colWidths }: ProprioRowProps) {
    const [hov, setHov] = useState(false);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [confirmReject, setConfirm] = useState(false);
    const initials = p.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() ?? '??';
    const date = new Date(p.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

    const handleApprove = async () => {
        setApproving(true);
        try { await onApprove(); } finally { setApproving(false); }
    };

    const handleReject = async () => {
        setConfirm(false);
        setRejecting(true);
        try { await onReject(); } finally { setRejecting(false); }
    };

    return (
        <>
            <div
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                style={{
                    display: 'grid', gridTemplateColumns: colWidths,
                    alignItems: 'center', padding: '13px 24px',
                    borderBottom: `1px solid ${B.border}`,
                    background: hov ? B.gray50 : B.surface,
                    transition: 'background 0.12s', gap: 16,
                }}
            >
                {/* Identity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: B.navy50, border: `1px solid ${B.navy100}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: B.navy700, flexShrink: 0, fontFamily: 'IBM Plex Mono, monospace' }}>
                        {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: B.navy900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{p.name}</div>
                        <StatusBadge label="Nouveau" color={B.orange600} bg={B.orange50} border={B.orange100} />
                    </div>
                </div>

                {/* Contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Mail size={10} color={B.gray300} strokeWidth={2} />
                        <span style={{ fontSize: 12, color: B.gray500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Phone size={10} color={B.gray300} strokeWidth={2} />
                        <span style={{ fontSize: 12, color: B.gray500 }}>{p.telephone ?? '—'}</span>
                    </div>
                </div>

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Calendar size={10} color={B.gray300} strokeWidth={2} />
                    <span style={{ fontSize: 11, color: B.gray400 }}>{date}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', opacity: hov ? 1 : 0, transition: 'opacity 0.15s' }}>
                    <ActionBtn icon={X} onClick={() => setConfirm(true)} loading={rejecting} variant="danger" />
                    <ActionBtn icon={Check} label="Approuver" onClick={handleApprove} loading={approving} variant="primary" />
                </div>
            </div>

            {confirmReject && (
                <ConfirmModal
                    title="Rejeter ce propriétaire ?"
                    message={`Vous êtes sur le point de rejeter la demande de ${p.name}. Cette action est irréversible.`}
                    confirmLabel="Rejeter"
                    onConfirm={handleReject}
                    onCancel={() => setConfirm(false)}
                />
            )}
        </>
    );
}

/* ── PARKING ROW ─────────────────────────────────────── */
interface ParkingRowProps {
    park: Parking;
    onApprove: () => Promise<void>;
    colWidths: string;
    onReject: () => Promise<void>;
}

export function ParkingRow({ park, onApprove,onReject, colWidths }: ParkingRowProps) {
    const [hov, setHov] = useState(false);
    const [loading, setLoad] = useState(false);
    const [confirmReject, setConfirm] = useState(false);
    const handleApprove = async () => {
        setLoad(true);
        try { await onApprove(); } finally { setLoad(false); }
    };

    const handleReject = async () => {
        setConfirm(false);
        setLoad(true);
        try { await onReject(); } finally { setLoad(false); }
    };
    const imgSrc = park.image
    console.log(park)
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'grid', gridTemplateColumns: colWidths,
                alignItems: 'center', padding: '13px 24px',
                borderBottom: `1px solid ${B.border}`,
                background: hov ? B.gray50 : B.surface,
                transition: 'background 0.12s', gap: 16,
            }}
        >
            {/* Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: B.gray100, border: `1px solid ${B.border}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {imgSrc
                        ? <img src={imgSrc} alt={park.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Car size={16} color={B.gray300} strokeWidth={1.5} />
                    }
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.navy900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{park.nom}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} color={B.orange500} strokeWidth={2.5} />
                        <span style={{ fontSize: 11, color: B.gray400 }}>{park.quartier}</span>
                    </div>
                </div>
            </div>

            {/* Capacity & price */}
            <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: B.navy700, fontFamily: 'IBM Plex Mono, monospace' }}>{park.capacite} places</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: B.orange600, marginTop: 2 }}>{park.prix_base?.toLocaleString('fr-FR')} F/h</div>
            </div>

            {/* Service */}
            <div>
                {park.services?.nom
                    ? <StatusBadge label={park.services.nom} color={B.success} bg={B.successLight} border={B.successBorder} />
                    : <span style={{ fontSize: 12, color: B.gray300 }}>—</span>
                }
            </div>

            {/* Proprietaire */}
            <div style={{ fontSize: 12, color: B.gray500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {park.user?.name ?? '—'}
            </div>

            {/* Action */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', opacity: hov ? 1 : 0, transition: 'opacity 0.15s' }}>
                <ActionBtn icon={X} onClick={() => setConfirm(true)} loading={loading} variant="danger" />
                <ActionBtn icon={Check} label="Valider" onClick={handleApprove} loading={loading} variant="primary" />
            </div>
            {confirmReject && (
                <ConfirmModal
                    title="Refuser ce parking ?"
                    message={`Voulez-vous vraiment rejeter le parking "${park.nom}" ? Cette action est irréversible.`}
                    confirmLabel="Refuser"
                    onConfirm={handleReject}
                    onCancel={() => setConfirm(false)}
                />
            )}
        </div>
    );
}