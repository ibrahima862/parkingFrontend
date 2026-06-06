import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CheckCircle, Phone, AlertCircle, Loader2,
  ArrowUpRight, RefreshCcw, Search, User,
  Wallet, TrendingDown, Zap, ChevronDown
} from 'lucide-react';

/* ── Types ── */
interface RefundRequest {
  id: number;
  reservation_id: number;
  montant: number;
  telephone: string;
  client_nom: string;
  parking_nom: string;
  date_annulation: string;
  statut: 'remboursement_en_attente' | 'rembourse';
}

/* ── Styles ── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .arp-root {
    --blue:         #1B3FA0;
    --blue-mid:     #2B52C8;
    --blue-light:   #EEF2FF;
    --blue-xlight:  #F5F7FF;
    --orange:       #F97316;
    --orange-mid:   #EA6C0A;
    --orange-light: #FFF7ED;
    --orange-pale:  #FEF3E8;
    --text:         #0F172A;
    --text-2:       #475569;
    --text-3:       #94A3B8;
    --border:       #E2E8F0;
    --bg:           #F8FAFC;
    --white:        #FFFFFF;
    --green:        #10B981;
    --green-light:  #ECFDF5;
    --radius:       16px;
    --radius-sm:    10px;
    --radius-xs:    8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: var(--text);
    background: var(--bg);
    min-height: 100vh;
  }

  /* ── Nav ── */
  .arp-nav {
    background: var(--white);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 40;
  }
  .arp-nav-inner {
    max-width: 1280px; margin: 0 auto;
    padding: 0 2rem; height: 68px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .arp-brand { display: flex; align-items: center; gap: 12px; }
  .arp-brand-icon {
    width: 40px; height: 40px; border-radius: 11px;
    background: var(--blue); display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(27,63,160,0.25);
  }
  .arp-brand-name { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: var(--text); line-height: 1.1; }
  .arp-brand-sub { font-size: 11px; font-weight: 600; color: var(--blue); text-transform: uppercase; letter-spacing: 0.07em; }

  .arp-nav-right { display: flex; align-items: center; gap: 10px; }
  .arp-search-wrap { position: relative; }
  .arp-search-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-3); }
  .arp-search {
    padding: 9px 14px 9px 36px;
    background: var(--bg); border: 1.5px solid var(--border);
    border-radius: 99px; font-size: 13px; font-family: inherit;
    color: var(--text); outline: none; width: 240px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .arp-search:focus { border-color: var(--blue-mid); box-shadow: 0 0 0 4px rgba(43,82,200,0.1); }
  .arp-search::placeholder { color: var(--text-3); }
  .arp-refresh {
    width: 38px; height: 38px; border-radius: 10px;
    border: 1.5px solid var(--border); background: var(--white);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-3); transition: all 0.15s;
  }
  .arp-refresh:hover { border-color: var(--blue); color: var(--blue); background: var(--blue-light); }

  /* ── Main ── */
  .arp-main { max-width: 1280px; margin: 0 auto; padding: 2.5rem 2rem 5rem; }

  /* ── Stats ── */
  .arp-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 2rem; }
  @media (max-width: 768px) { .arp-stats { grid-template-columns: 1fr; } }

  .arp-stat {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px 24px;
    display: flex; align-items: flex-start; justify-content: space-between;
  }
  .arp-stat-label { font-size: 12px; font-weight: 600; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .arp-stat-num { font-family: 'Sora', sans-serif; font-size: 28px; font-weight: 800; color: var(--text); line-height: 1; }
  .arp-stat-num-orange { color: var(--orange); }
  .arp-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .si-blue { background: var(--blue-light); }
  .si-orange { background: var(--orange-pale); }
  .si-blue2 { background: var(--blue); }

  .arp-stat-cta {
    background: linear-gradient(135deg, var(--blue) 0%, var(--blue-mid) 100%);
    border: none; color: white;
    box-shadow: 0 8px 24px rgba(27,63,160,0.2);
  }
  .arp-stat-cta .arp-stat-label { color: rgba(255,255,255,0.65); }
  .arp-stat-cta .arp-stat-num { color: white; font-size: 18px; }

  /* ── Table card ── */
  .arp-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden;
  }
  .arp-card-header {
    padding: 20px 28px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .arp-card-title { font-family: 'Sora', sans-serif; font-size: 16px; font-weight: 700; color: var(--text); }
  .arp-card-count {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--orange-pale); color: var(--orange);
    font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 99px;
    border: 1px solid #FDBA74;
  }

  /* Table */
  .arp-table { width: 100%; border-collapse: collapse; text-align: left; }
  .arp-table thead { background: var(--bg); }
  .arp-table th {
    padding: 13px 20px; font-size: 10px; font-weight: 700;
    color: var(--text-3); text-transform: uppercase; letter-spacing: 0.08em;
    border-bottom: 1px solid var(--border);
  }
  .arp-table tbody tr { border-bottom: 1px solid var(--border); transition: background 0.1s; }
  .arp-table tbody tr:last-child { border-bottom: none; }
  .arp-table tbody tr:hover { background: var(--blue-xlight); }
  .arp-table td { padding: 16px 20px; vertical-align: middle; }

  /* Cell elements */
  .arp-ref-badge {
    width: 34px; height: 34px; background: var(--blue-light);
    border-radius: 8px; display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 800; color: var(--blue);
  }
  .arp-ref-name { font-size: 14px; font-weight: 600; color: var(--text); }
  .arp-ref-sub { font-size: 12px; color: var(--text-3); margin-top: 2px; }

  .arp-avatar {
    width: 30px; height: 30px; background: var(--blue-light);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
  }
  .arp-client-name { font-size: 14px; font-weight: 600; color: var(--text); }

  .arp-phone {
    display: inline-flex; align-items: center; gap: 7px;
    background: var(--blue-light); color: var(--blue);
    padding: 5px 11px; border-radius: 7px;
    font-size: 12px; font-weight: 700; font-family: 'Sora', monospace;
    border: 1px solid rgba(27,63,160,0.12);
  }

  .arp-amount { font-family: 'Sora', sans-serif; font-size: 17px; font-weight: 800; color: var(--text); }
  .arp-amount span { font-size: 10px; font-weight: 600; color: var(--text-3); margin-left: 3px; }

  /* CTA Button */
  .arp-confirm-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px;
    background: var(--orange);
    color: white; border: none; border-radius: var(--radius-xs);
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.15s;
    box-shadow: 0 4px 12px rgba(249,115,22,0.2);
    white-space: nowrap;
  }
  .arp-confirm-btn:hover:not(:disabled) { background: var(--orange-mid); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(249,115,22,0.3); }
  .arp-confirm-btn:active:not(:disabled) { transform: translateY(0); }
  .arp-confirm-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  /* Loading / empty states */
  .arp-loading { padding: 5rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .arp-loading p { font-size: 14px; font-weight: 500; color: var(--text-3); }
  .arp-empty { padding: 6rem 2rem; text-align: center; }
  .arp-empty-icon {
    width: 64px; height: 64px; background: var(--green-light);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  }
  .arp-empty h2 { font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .arp-empty p { font-size: 14px; color: var(--text-3); max-width: 280px; margin: 0 auto; }

  /* Footer note */
  .arp-footer-note {
    margin-top: 1.5rem; padding: 18px 22px;
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius); display: flex; align-items: flex-start; gap: 14px;
  }
  .arp-footer-icon {
    width: 38px; height: 38px; background: var(--orange-pale);
    border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .arp-footer-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 5px; }
  .arp-footer-body { font-size: 12px; color: var(--text-2); line-height: 1.65; }
  .arp-footer-body strong { color: var(--text); font-weight: 600; }

  /* Scrollable table wrapper */
  .arp-table-wrap { overflow-x: auto; }

  /* Date badge */
  .arp-date { font-size: 11px; color: var(--text-3); margin-top: 2px; }
`;

export function AdminRefundPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/admin/remboursements/en-attente`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRefunds(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRefunds(); }, []);

  const confirmRefund = async (refund: RefundRequest) => {
    const msg = `Confirmez-vous le remboursement de ${refund.montant.toLocaleString()} FCFA au numéro ${refund.telephone} ?`;
    if (!window.confirm(msg)) return;

    setProcessingId(refund.id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/admin/remboursements/${refund.id}/valider`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefunds(prev => prev.filter(r => r.id !== refund.id));
    } catch {
      alert('Une erreur est survenue lors de la validation.');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = refunds.filter(r =>
    r.telephone.includes(searchTerm) ||
    r.client_nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMontant = refunds.reduce((acc, r) => acc + r.montant, 0);

  return (
    <div className="arp-root">
      <style>{styles}</style>

      {/* ── Nav ── */}
      <nav className="arp-nav">
        <div className="arp-nav-inner">
          <div className="arp-brand">
            <div className="arp-brand-icon">
              <Wallet size={20} color="white" />
            </div>
            <div>
              <div className="arp-brand-name">SenovaPark</div>
              <div className="arp-brand-sub">Trésorerie & Remboursements</div>
            </div>
          </div>

          <div className="arp-nav-right">
            <div className="arp-search-wrap" style={{ display: 'none' }}>
              {/* mobile hidden inline, shown via CSS on md+ */}
            </div>
            <div className="arp-search-wrap">
              <Search size={14} />
              <input
                className="arp-search"
                type="text"
                placeholder="Client ou téléphone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="arp-refresh" onClick={fetchRefunds} title="Actualiser">
              <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="arp-main">

        {/* Stats */}
        <div className="arp-stats">
          <div className="arp-stat">
            <div>
              <div className="arp-stat-label">En attente</div>
              <div className="arp-stat-num">{refunds.length}</div>
            </div>
            <div className="arp-stat-icon si-blue">
              <TrendingDown size={18} color="#1B3FA0" />
            </div>
          </div>

          <div className="arp-stat">
            <div>
              <div className="arp-stat-label">Montant total</div>
              <div className="arp-stat-num arp-stat-num-orange">
                {totalMontant.toLocaleString()}
                <span style={{ fontSize: 13, fontWeight: 500, color: '#94A3B8', marginLeft: 4 }}>FCFA</span>
              </div>
            </div>
            <div className="arp-stat-icon si-orange">
              <Wallet size={18} color="#F97316" />
            </div>
          </div>

          <div className="arp-stat arp-stat-cta">
            <div>
              <div className="arp-stat-label">Action requise</div>
              <div className="arp-stat-num">Transferts Wave / OM</div>
            </div>
            <ArrowUpRight size={28} style={{ opacity: 0.45, color: 'white' }} />
          </div>
        </div>

        {/* Table card */}
        <div className="arp-card">
          <div className="arp-card-header">
            <span className="arp-card-title">Demandes de remboursement</span>
            {!loading && (
              <span className="arp-card-count">
                <Zap size={11} /> {filtered.length} en attente
              </span>
            )}
          </div>

          {loading ? (
            <div className="arp-loading">
              <Loader2 size={36} color="#1B3FA0" className="animate-spin" />
              <p>Chargement des demandes...</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="arp-table-wrap">
              <table className="arp-table">
                <thead>
                  <tr>
                    <th>Référence & Parking</th>
                    <th>Bénéficiaire</th>
                    <th>Coordonnées</th>
                    <th>Somme à verser</th>
                    <th style={{ textAlign: 'right', paddingRight: 28 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(refund => (
                    <tr key={refund.id}>
                      {/* Ref */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="arp-ref-badge">#{refund.reservation_id}</div>
                          <div>
                            <div className="arp-ref-name">Ticket Parking</div>
                            <div className="arp-ref-sub">{refund.parking_nom}</div>
                          </div>
                        </div>
                      </td>

                      {/* Client */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="arp-avatar">
                            <User size={14} color="#1B3FA0" />
                          </div>
                          <span className="arp-client-name">{refund.client_nom}</span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td>
                        <div className="arp-phone">
                          <Phone size={11} />
                          {refund.telephone}
                        </div>
                      </td>

                      {/* Amount */}
                      <td>
                        <div className="arp-amount">
                          {refund.montant.toLocaleString()}
                          <span>FCFA</span>
                        </div>
                        <div className="arp-date">
                          {new Date(refund.date_annulation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="arp-confirm-btn"
                          disabled={processingId === refund.id}
                          onClick={() => confirmRefund(refund)}
                        >
                          {processingId === refund.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <CheckCircle size={13} />
                          }
                          Confirmer le virement
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="arp-empty">
              <div className="arp-empty-icon">
                <CheckCircle size={32} color="#10B981" />
              </div>
              <h2>Tout est à jour !</h2>
              <p>Aucun remboursement en attente. Vos clients sont tous satisfaits.</p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="arp-footer-note">
          <div className="arp-footer-icon">
            <AlertCircle size={18} color="#F97316" />
          </div>
          <div>
            <div className="arp-footer-title">Rappel de procédure manuelle</div>
            <p className="arp-footer-body">
              Avant de cliquer sur le bouton de confirmation, assurez-vous d'avoir ouvert votre application{' '}
              <strong>Wave Business</strong> ou <strong>Orange Money</strong> et d'avoir validé le transfert vers le numéro indiqué.
              Une fois confirmé ici, le client recevra une notification de clôture de dossier.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default AdminRefundPage;