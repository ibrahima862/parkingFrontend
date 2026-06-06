import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Clock, MapPin, Ticket, ChevronRight, AlertCircle, 
    Loader2, CheckCircle2, History, Car, ArrowRight, 
    Sparkles, Clock3, CalendarDays, XCircle 
} from 'lucide-react';

/* ── Types ── */
interface Reservation {
    id: number;
    date_debut: string;
    date_fin: string;
    montant_total: number;
    statut: 'en_attente' | 'confirme' | 'annule' | 'termine';
    parking: {
        nom: string;
        quartier: string;
    };
    matricule_vehicule: string;
}

export function UserReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    
    const navigate = useNavigate();
    const API_URL = (import.meta as any).env.VITE_API_URL;

    /* ── Fetch des données ── */
    const fetchReservations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/client/reservations`, {
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Accept': 'application/json' 
                }
            });
            if (!res.ok) throw new Error('Impossible de charger vos réservations.');
            const data = await res.json();
            setReservations(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    /* ── Logique d'annulation ── */
    const handleCancel = async (id: number) => {
        const confirmCancel = window.confirm(
            "Souhaitez-vous vraiment annuler cette réservation ? \n\n" +
            "Note : Un remboursement sera traité conformément à nos conditions générales."
        );

        if (!confirmCancel) return;

        setCancellingId(id);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/client/reservations/${id}/annuler`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Erreur lors de l'annulation");

            // Succès : Notification et rafraîchissement
            alert("Votre réservation a été annulée. Votre remboursement est en cours.");
            await fetchReservations();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCancellingId(null);
        }
    };

    /* ── Helpers de design ── */
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'confirme':
                return { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2, label: 'Confirmé', border: 'border-emerald-100' };
            case 'en_attente':
                return { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock, label: 'En attente', border: 'border-amber-100' };
            case 'termine':
                return { bg: 'bg-slate-100', text: 'text-slate-600', icon: History, label: 'Terminé', border: 'border-slate-200' };
            case 'annule':
                return { bg: 'bg-rose-50', text: 'text-rose-700', icon: XCircle, label: 'Annulé', border: 'border-rose-100' };
            default:
                return { bg: 'bg-slate-50', text: 'text-slate-400', icon: AlertCircle, label: status, border: 'border-slate-100' };
        }
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' }),
            time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/40">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                
                {/* ── Header ── */}
                <header className="relative mb-10 sm:mb-12">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm mb-4">
                                <Sparkles size={14} className="text-amber-500" />
                                <span className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">Mon Espace Client</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
                                Mes Réservations
                            </h1>
                            <p className="text-slate-500 text-sm mt-2 max-w-md font-medium">
                                Gérez vos accès, consultez l'historique et vos stationnements en cours.
                            </p>
                        </div>
                        
                        {!loading && reservations.length > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                <Ticket size={16} className="text-indigo-600" />
                                <span className="text-sm font-bold text-slate-700">{reservations.length}</span>
                                <span className="text-xs text-slate-400 font-semibold uppercase">Tickets</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* ── États : Loading / Error / Empty ── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-3xl border border-slate-100">
                        <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
                        <p className="text-slate-500 font-bold animate-pulse">Chargement de vos tickets...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
                        <AlertCircle className="text-rose-600 shrink-0" />
                        <div>
                            <h3 className="font-bold text-rose-800 text-lg">Oups !</h3>
                            <p className="text-sm text-rose-600">{error}</p>
                            <button onClick={() => window.location.reload()} className="mt-4 text-xs font-black uppercase text-rose-700 flex items-center gap-1 hover:underline">
                                Réessayer <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-5">
                            <Ticket size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Aucune réservation active</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mt-2 mb-8">Vos futurs stationnements apparaîtront ici.</p>
                        <button onClick={() => navigate('/parkings')} className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-lg">
                            Réserver maintenant
                        </button>
                    </div>
                ) : (
                    /* ── Liste des cartes ── */
                    <div className="grid gap-6">
                        {reservations.map((res) => {
                            const status = getStatusConfig(res.statut);
                            const StatusIcon = status.icon;
                            const start = formatDateTime(res.date_debut);
                            const end = formatDateTime(res.date_fin);
                            const isHovered = hoveredId === res.id;
                            const isCancelling = cancellingId === res.id;

                            return (
                                <div
                                    key={res.id}
                                    onMouseEnter={() => setHoveredId(res.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
                                >
                                    <div className="p-6 sm:p-8">
                                        {/* Row 1: Status & Price */}
                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${status.bg} ${status.text} border ${status.border}`}>
                                                    <StatusIcon size={14} strokeWidth={3} />
                                                    {status.label}
                                                </div>
                                                <span className="text-xs font-mono font-bold text-slate-300">#SEN-{res.id}</span>
                                            </div>
                                            <div className="bg-slate-950 text-white px-5 py-2.5 rounded-2xl shadow-lg flex items-baseline gap-1.5">
                                                <span className="text-xl font-black">{Number(res.montant_total).toLocaleString()}</span>
                                                <span className="text-[10px] font-black opacity-50 uppercase tracking-tighter">FCFA</span>
                                            </div>
                                        </div>

                                        {/* Row 2: Title & Location */}
                                        <div className="mb-8">
                                            <h2 className="text-2xl font-black text-slate-900 mb-1">{res.parking.nom}</h2>
                                            <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-sm">
                                                <MapPin size={16} className="text-indigo-500" />
                                                {res.parking.quartier}, Dakar
                                            </div>
                                        </div>

                                        {/* Row 3: Grid Details */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><CalendarDays size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrivée</p>
                                                    <p className="text-sm font-bold text-slate-800">{start.date}</p>
                                                    <p className="text-xs font-bold text-indigo-600">{start.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><Clock3 size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Départ</p>
                                                    <p className="text-sm font-bold text-slate-800">{end.date}</p>
                                                    <p className="text-xs font-bold text-amber-600">{end.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600"><Car size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Véhicule</p>
                                                    <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{res.matricule_vehicule}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 4: Actions */}
                                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div>
                                                {res.statut === 'confirme' && (
                                                    <button
                                                        onClick={() => handleCancel(res.id)}
                                                        disabled={isCancelling}
                                                        className="group/cancel flex items-center gap-2 text-xs font-black uppercase text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                                                    >
                                                        {isCancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                                        <span>Annuler la réservation</span>
                                                    </button>
                                                )}
                                            </div>

                                            <button 
                                                onClick={() => navigate(`/booking/success?id=${res.id}`)}
                                                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-black text-sm transition-all duration-300 ${
                                                    isHovered 
                                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 -translate-y-0.5' 
                                                    : 'bg-slate-100 text-slate-700'
                                                }`}
                                            >
                                                Voir le ticket numérique
                                                <ChevronRight size={18} className={`${isHovered ? 'translate-x-1' : ''} transition-transform`} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Barre de progression décorative au survol */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 to-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserReservationsPage;