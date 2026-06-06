import { Car, CheckCircle, MapPin } from "lucide-react";
import { ParkingDetails } from "../../type";

/* ─── PARKING HERO ─── */
export function ParkingHero({ details,getOptimizedImage }: { details: ParkingDetails; getOptimizedImage: (image: string) => string }) {
    return (
        <div style={{ background: '#fff', border: '1px solid #E6EAF5', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 196, background: '#F0F2FA', overflow: 'hidden' }}>
                <img src={getOptimizedImage(details.image)} alt={details.nom}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=800'; }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,15,42,0.82) 0%, rgba(6,15,42,0.1) 60%, transparent 100%)' }} />

                {/* Verified badge */}
                <div style={{ position: 'absolute', top: 12, left: 14, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(249,115,22,0.92)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 100 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Parking sélectionné</span>
                </div>

                {/* Price badge */}
                <div style={{ position: 'absolute', top: 12, right: 14, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', padding: '7px 11px', borderRadius: 11, textAlign: 'right' }}>
                    <p style={{ fontSize: 20, fontWeight: 900, color: '#FB923C', letterSpacing: '-0.5px', fontFamily: 'IBM Plex Mono, monospace', margin: 0, lineHeight: 1 }}>
                        {details.prixHeure.toLocaleString('fr-FR')}
                    </p>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>FCFA / heure</p>
                </div>

                {/* Name on image */}
                <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
                    <p style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.3px', textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}>{details.nomParking}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <MapPin size={11} color='rgba(255,255,255,0.55)' strokeWidth={2.5} />
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{details.quartier}</span>
                        {details.capacite && <>
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>·</span>
                            <Car size={10} color='rgba(255,255,255,0.4)' strokeWidth={2} />
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{details.capacite} places</span>
                        </>}
                    </div>
                </div>
            </div>

            {/* Services strip */}
            {details.tags?.length > 0 && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #F0F2FA', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {details.tags.slice(0, 4).map((tag, i) => (
                        <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: '#EEF2FB', border: '1px solid #DDE4F4', borderRadius: 100 }}>
                            <CheckCircle size={9} color='#1A3A8F' strokeWidth={2.5} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#0D2B6E' }}>{tag}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
