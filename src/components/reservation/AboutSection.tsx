import { Info, ShieldCheck } from "lucide-react";
import { ParkingDetails } from "../../type";
import { SectionCard } from "./SectionCard";

/* ─── ABOUT SECTION ─── */
export function AboutSection({ details }: { details: ParkingDetails }) {
    if (!details.description && !details.tags?.length) return null;
    return (
        <SectionCard icon={Info} iconColor='#626B8A' iconBg='#F8F9FC' iconBorder='#E6EAF5' title="À propos de ce parking">
            {details.description ? (
                <p style={{ fontSize: 13, color: '#626B8A', lineHeight: 1.7, margin: 0 }}>{details.description}</p>
            ) : null}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#EEF2FB', border: '1px solid #DDE4F4', borderRadius: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: '#DDE4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ShieldCheck size={14} color='#0D2B6E' strokeWidth={2} />
                </div>
                <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0D1B3E', margin: '0 0 2px' }}>Surveillance constante</p>
                    <p style={{ fontSize: 11, color: '#8A93B2', margin: 0 }}>Votre véhicule est protégé pendant toute la durée de votre réservation.</p>
                </div>
            </div>
        </SectionCard>
    );
}

