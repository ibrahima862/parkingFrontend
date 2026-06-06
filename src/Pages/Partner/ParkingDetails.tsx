import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, AlertTriangle, TrendingUp, Users, Car, DollarSign, Settings } from 'lucide-react';

interface Reservation { id: number; user: { name: string }; created_at: string; date_debut: string; date_fin: string; statut: string; }
interface ParkingDetails {
  id: number; nom: string; pays: string; departement: string; quartier: string; description: string;
  capacite: number; statut: 'valide' | 'indisponible'; places_occupees: number;
  revenus_mois: number; total_abonnes: number; signalements_actifs: number;
  tarif_heure: number; reservations: Reservation[];
}

function AnimBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-2.5">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmée: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    en_cours: 'bg-blue-50 text-blue-700 border-blue-100',
    annulée: 'bg-red-50 text-red-600 border-red-100',
    terminée: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${map[status] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function StatCard({ label, value, unit, sub, icon: Icon, iconCls, bar }: {
  label: string; value: string; unit?: string; sub: React.ReactNode;
  icon: React.ElementType; iconCls: string; bar?: { pct: number; color: string };
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconCls}`}>
          <Icon size={14} strokeWidth={2} />
        </div>
      </div>
      <p className="text-[22px] font-bold text-slate-900 leading-none tabular-nums">
        {value}{unit && <span className="text-[12px] font-normal text-slate-400 ml-1.5">{unit}</span>}
      </p>
      {bar && <AnimBar pct={bar.pct} color={bar.color} />}
      <div className="text-[12px] mt-2.5">{sub}</div>
    </div>
  );
}

export function ParkingDetails() {
  const [parking, setParking] = useState<ParkingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/partenaire/parkings/${id}`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error();
        setParking((await res.json()).data);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 max-w-5xl mx-auto animate-pulse flex flex-col gap-6">
      <div className="h-4 w-24 bg-slate-200 rounded-full" />
      <div className="h-7 w-2/5 bg-slate-200 rounded-xl" />
      <div className="grid grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}</div>
    </div>
  );

  if (!parking) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-sm text-slate-400">Parking introuvable.</p>
    </div>
  );

  const occ = parking.capacite > 0 ? Math.round((parking.places_occupees / parking.capacite) * 100) : 0;
  const occColor = occ >= 90 ? 'bg-red-500' : occ >= 70 ? 'bg-amber-500' : 'bg-blue-600';
  const hasAlerts = parking.signalements_actifs > 0;

  const STATS = [
    {
      label: 'Revenus du mois', value: parking.revenus_mois.toLocaleString('fr-FR'), unit: 'FCFA',
      sub: <span className="text-emerald-600 flex items-center gap-1 font-semibold"><TrendingUp size={11} />Ce mois</span>,
      icon: DollarSign, iconCls: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Occupation', value: `${occ}%`, unit: '',
      sub: <span className="text-slate-400">{parking.places_occupees} / {parking.capacite} places</span>,
      icon: Car, iconCls: 'text-blue-600 bg-blue-50',
      bar: { pct: occ, color: occColor },
    },
    {
      label: 'Abonnements', value: `${parking.total_abonnes}`, unit: 'actifs',
      sub: <span className="text-slate-400">Revenus récurrents</span>,
      icon: Users, iconCls: 'text-violet-600 bg-violet-50',
    },
    {
      label: 'Signalements', value: `${parking.signalements_actifs}`, unit: '',
      sub: <span className={hasAlerts ? 'text-red-600 font-semibold' : 'text-emerald-600'}>{hasAlerts ? 'Action requise' : 'Aucun problème'}</span>,
      icon: AlertTriangle, iconCls: hasAlerts ? 'text-red-500 bg-red-50' : 'text-slate-400 bg-slate-100',
    },
  ];

  const INFO_ROWS: [string, string, boolean?][] = [
    ['Tarif horaire', `${parking.tarif_heure.toLocaleString('fr-FR')} FCFA / heure`],
    ['Capacité', `${parking.capacite} places au total`],
    ['Référence', `SENOVA-PK-${parking.id}`, true],
    ['Accès', 'Validation par QR Code'],
    ['Localisation', `${parking.quartier}, ${parking.departement}`],
    ['Pays', parking.pays],
  ];

  const QUICK = [
    ['Places libres', `${parking.capacite - parking.places_occupees}`],
    ['Places occupées', `${parking.places_occupees}`],
    ['Total abonnés', `${parking.total_abonnes}`],
    ['Tarif', `${parking.tarif_heure.toLocaleString('fr-FR')} FCFA/h`],
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-7">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[13px] text-slate-500 hover:text-slate-900 transition-colors group">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="underline underline-offset-4">Vos parkings</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
              <span className={`w-2 h-2 rounded-full ${parking.statut === 'valide' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {parking.statut === 'valide' ? 'Ouvert aux réservations' : 'Fermé'}
            </span>
            <button onClick={() => navigate(`/partner/parking/${parking.id}`)}
              className="w-9 h-9 flex items-center justify-center bg-slate-900 hover:bg-slate-700 text-white rounded-xl transition-colors">
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1.5">{parking.nom}</h1>
          <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
            <MapPin size={13} className="text-amber-500 shrink-0" />
            {parking.quartier}, {parking.departement}, {parking.pays}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Alert banner */}
        {hasAlerts && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start">
            <div className="w-10 h-10 bg-white border border-amber-200 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-amber-500" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-900 mb-1">
                {parking.signalements_actifs} signalement{parking.signalements_actifs > 1 ? 's' : ''} nécessite{parking.signalements_actifs > 1 ? 'nt' : ''} votre attention
              </p>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Des conducteurs ont signalé des anomalies. Consultez les rapports pour éviter toute suspension.
              </p>
              <button className="mt-3 text-[13px] font-bold text-amber-700 hover:text-amber-900 underline underline-offset-4 transition-colors">
                Voir les signalements →
              </button>
            </div>
          </div>
        )}

        {/* Main 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5 items-start">
          <div className="flex flex-col gap-5">

            {/* Reservations table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-[13px] font-bold text-slate-900">Réservations récentes</h2>
              </div>
              {parking.reservations.length === 0 ? (
                <p className="px-5 py-8 text-[13px] text-slate-400 text-center">Aucune réservation pour ce parking.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      {['Client', 'Date', 'Durée', 'Statut'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parking.reservations.map((r, i) => {
                      const mins = Math.abs(Math.ceil((new Date(r.date_fin).getTime() - new Date(r.date_debut).getTime()) / 60000));
                      return (
                        <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${i < parking.reservations.length - 1 ? 'border-b border-slate-50' : ''}`}>
                          <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-800">{r.user.name}</td>
                          <td className="px-5 py-3.5 text-[13px] text-slate-500">
                            {new Date(r.created_at).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-slate-700 tabular-nums">
                            {mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? ` ${mins % 60}min` : ''}` : `${mins} min`}
                          </td>
                          <td className="px-5 py-3.5"><StatusBadge status={r.statut} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Config */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-[13px] font-bold text-slate-900">Configuration logistique</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {INFO_ROWS.map(([label, value, mono], i) => (
                  <div key={label} className={`px-5 py-4 ${i % 2 === 1 ? 'sm:border-l border-slate-100' : ''} ${i < INFO_ROWS.length - 2 ? 'border-b border-slate-100' : ''}`}>
                    <p className="text-[11px] text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">{label}</p>
                    {mono
                      ? <code className="text-[12px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-mono">{value}</code>
                      : <p className="text-[13px] font-semibold text-slate-800">{value}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {parking.description && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h2 className="text-[13px] font-bold text-slate-900 mb-2.5">Description</h2>
                <p className="text-[13px] text-slate-500 leading-relaxed">{parking.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vue rapide</p>
            </div>
            {QUICK.map(([k, v], i) => (
              <div key={k} className={`px-5 py-3.5 flex items-center justify-between ${i < QUICK.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50/60 transition-colors`}>
                <span className="text-[13px] text-slate-500">{k}</span>
                <span className="text-[13px] font-bold text-slate-800 tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParkingDetails;