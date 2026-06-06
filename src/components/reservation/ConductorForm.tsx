import { Car, User } from "lucide-react";
import { useState } from "react";
import { ParkingDetails } from "../../type";
import { mkInput } from "../../Utils/utils";
import { SectionCard } from "./SectionCard";
import { FieldLabel } from "./FieldLabel";



/* ─── CONDUCTOR FORM ─── */
export function ConductorForm({ details, updateField }: { details: ParkingDetails; updateField: (f: keyof ParkingDetails, v: string) => void }) {
    const [f, setF] = useState('');
    console.log(details)
    return (
        <SectionCard icon={User} iconColor='#0D2B6E' iconBg='#EEF2FB' iconBorder='#DDE4F4' title="Informations conducteur" subtitle="Requis pour la validation de l'accès">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <FieldLabel icon={User} label="Prénom" required />
                    <input value={details.prenom_conducteur} onChange={e => updateField('prenom_conducteur', e.target.value)}  onFocus={() => setF('prenom')} onBlur={() => setF('')} style={mkInput(f === 'prenom')} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <FieldLabel icon={User} label="Nom" required />
                    <input value={details.nom_conducteur} onChange={e => updateField('nom_conducteur', e.target.value)} placeholder="Sow" onFocus={() => setF('nom')} onBlur={() => setF('')} style={mkInput(f === 'nom')} />
                </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <FieldLabel icon={User} label="Tel" required />
                    <input value={details.telephone} onChange={e => updateField('telephone', e.target.value)} placeholder="" onFocus={() => setF('telephone')} onBlur={() => setF('')} style={mkInput(f === 'telephone')} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <FieldLabel icon={Car} label="Matricule véhicule" required />
                <input value={details.matricule_vehicule} onChange={e => updateField('matricule_vehicule', e.target.value)} placeholder="Ex : DK-1234-A" onFocus={() => setF('mat')} onBlur={() => setF('')}
                    style={{ ...mkInput(f === 'mat'), fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                />
            </div>
        </SectionCard>
    );
}
