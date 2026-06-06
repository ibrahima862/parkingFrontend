import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check, MapPin, CreditCard, Calendar,
  Printer, Home, ShieldCheck, Clock,
  ArrowRight, Info, Car, Phone
} from 'lucide-react';

const T = {
  text: '#222222',
  textLight: '#717171',
  success: '#008489',
  border: '#EBEBEB',
  shadow: '0 12px 24px rgba(0,0,0,0.08)',
  font: "Circular, -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
};

const CSS = `
  body { background-color: #FFFFFF; color: ${T.text}; margin: 0; -webkit-font-smoothing: antialiased; }
  .section-title { font-size: 22px; font-weight: 600; margin-bottom: 24px; letter-spacing: -0.02em; }
  .info-label { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
  .info-value { font-size: 16px; color: ${T.textLight}; }
  .divider { height: 1px; background: ${T.border}; margin: 32px 0; }
  
  .btn-main { 
    background: ${T.text}; color: white; padding: 14px 24px; border-radius: 8px; 
    border: none; font-weight: 600; font-size: 16px; cursor: pointer; transition: 0.2s;
  }
  .btn-outline { 
    background: white; color: ${T.text}; padding: 14px 24px; border-radius: 8px; 
    border: 1px solid ${T.text}; font-weight: 600; font-size: 16px; cursor: pointer; transition: 0.2s;
  }
  .btn-main:hover { opacity: 0.9; transform: scale(0.98); }
  
  @media (max-width: 950px) { .main-grid { grid-template-columns: 1fr !important; } .side-card { position: relative !important; top: 0 !important; } }
`;

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reservationId = searchParams.get('id');
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/reservations/confirmation/${reservationId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const data = await res.json();
        setDetails(data.data || data);
      } finally { setLoading(false); }
    };
    if (reservationId) fetchDetails();
  }, [reservationId]);

  const fmtDate = details?.date_debut 
    ? new Date(details.date_debut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) 
    : "...";

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', fontFamily: T.font }}>Un instant...</div>;

  return (
    <div style={{ fontFamily: T.font, maxWidth: '1080px', margin: '0 auto', padding: '40px 24px' }}>
      <style>{CSS}</style>

      {/* 1. Entête de Confirmation */}
      <header style={{ marginBottom: '48px' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: T.success, marginBottom: '16px' }}>
          <Check size={40} strokeWidth={4} />
        </motion.div>
        <h1 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '8px' }}>Paiement réussi !</h1>
        <p style={{ fontSize: '18px', color: T.textLight }}>
          Votre réservation pour <strong>{details?.parking?.nom}</strong> est confirmée.
        </p>
      </header>

      <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '80px' }}>
        
        {/* COLONNE GAUCHE : DÉTAILS RÉPARTIS */}
        <main>
          <section>
            <h2 className="section-title">Détails de votre stationnement</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <p className="info-label">Date</p>
                <p className="info-value">{fmtDate}</p>
              </div>
              <div>
                <p className="info-label">Référence</p>
                <p className="info-value" style={{ fontFamily: 'monospace', fontWeight: 700 }}>#SEN-{reservationId}</p>
              </div>
              <div>
                <p className="info-label">Véhicule</p>
                <p className="info-value"><Car size={14} style={{ marginRight: '6px' }} /> {details?.matricule_vehicule}</p>
              </div>
              <div>
                <p className="info-label">Téléphone</p>
                <p className="info-value"><Phone size={14} style={{ marginRight: '6px' }} /> {details?.telephone}</p>
              </div>
            </div>
          </section>

          <div className="divider" />

          <section>
            <h2 className="section-title">Informations d'accès</h2>
            <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <Clock size={24} style={{ marginBottom: '12px' }} />
                <p className="info-label">Arrivée prévue</p>
                <p className="info-value">{details?.date_debut?.split(' ')[1] || '00:00'}</p>
              </div>
              <div style={{ flex: 1 }}>
                <MapPin size={24} style={{ marginBottom: '12px' }} />
                <p className="info-label">Adresse</p>
                <p className="info-value">{details?.parking?.quartier}, {details?.parking?.departement}</p>
              </div>
            </div>
            
            <div style={{ background: '#F7F7F7', padding: '20px', borderRadius: '12px', display: 'flex', gap: '16px' }}>
              <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '14px', lineHeight: '1.5', color: T.text }}>
                <strong>Comment entrer :</strong> Présentez ce ticket numérique ou donnez votre numéro de plaque à l'agent de sécurité. Votre place vous attend.
              </p>
            </div>
          </section>

          <div className="divider" />

          {/* Boutons d'action en bas de la colonne principale */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn-main" onClick={() => window.print()}><Printer size={18} /> Imprimer le ticket</button>
            <button className="btn-outline" onClick={() => navigate('/')}><Home size={18} /> Accueil</button>
          </div>
        </main>

        {/* COLONNE DROITE : RÉCAPITULATIF DE PRIX (STICKY) */}
        <aside>
          <div className="side-card" style={{ 
            border: `1px solid ${T.border}`, borderRadius: '16px', padding: '24px', 
            boxShadow: T.shadow, position: 'sticky', top: '40px' 
          }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ width: '80px', height: '60px', background: '#DDD', borderRadius: '8px', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1590674852885-7c602052c991?auto=format&fit=crop&w=200" alt="parking" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{details?.parking?.nom}</p>
                <p style={{ fontSize: '12px', color: T.textLight }}>Réservation confirmée</p>
              </div>
            </div>

            <div className="divider" style={{ margin: '16px 0' }} />

            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Détails du prix</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: T.text }}>Séjour complet</span>
              <span>{Number(details?.montant_total).toLocaleString()} FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: T.text }}>Taxes et frais</span>
              <span>0 FCFA</span>
            </div>

            <div className="divider" style={{ margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '18px' }}>
              <span>Total payé</span>
              <span>{Number(details?.montant_total).toLocaleString()} FCFA</span>
            </div>

            <div style={{ marginTop: '24px', padding: '12px', background: '#FDFDFD', border: `1px dashed ${T.border}`, borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: T.success, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> Transaction sécurisée par PayTech
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default SuccessPage;