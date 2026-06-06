import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ParkingDetails } from "../type";
import { getToken } from "../Utils/utils";

type ApiStatus = 'idle' | 'loading' | 'error';
type ReservationMode = 'horaire' | 'abonnement';

export function useParkingReservation(id: string | undefined) {
    const [details, setDetails] = useState<ParkingDetails | null>(null);
    const [apiStatus, setApiStatus] = useState<ApiStatus>('loading');
    const [apiError, setApiError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    // 1. Mémorisation de l'utilisateur pour éviter de parser le JSON à chaque rendu
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch { return {}; }
    }, []);

    const isPremium = user?.subscription === 'premium';

    // 2. Fetch refactorisé avec async/await pour plus de clarté
    useEffect(() => {
        if (!id) return;

        const loadParking = async () => {
            setApiStatus('loading');
            try {
                const res = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/parkings/show/${id}`);
                if (!res.ok) throw new Error('Parking introuvable.');
                
                const data = await res.json();

                // Calculs des dates (Aujourd'hui + 15min / +2h)
                const now = new Date();
                const start = new Date(now.getTime() + 15 * 60000);
                const end = new Date(start.getTime() + 120 * 60000);

                // Refactorisation du nom (Gestion des noms composés)
                const nameParts = user?.name?.split(' ') || [];

                setDetails({
                    parkingId: data.id,
                    nomParking: data.nom,
                    quartier: data.quartier,
                    prixHeure: data.prix_base ?? 500,
                    dateDebut: start.toISOString().split('T')[0],
                    heureDebut: start.toTimeString().slice(0, 5),
                    dateFin: end.toISOString().split('T')[0],
                    heureFin: end.toTimeString().slice(0, 5),
                    nom_conducteur: nameParts.slice(1).join(' ') || '',
                    prenom_conducteur: nameParts[0] || '',
                    matricule_vehicule: '',
                    tags: data.tags ?? [],
                    description: data.description ?? '',
                    nom: data.nom,
                    image: data.image,
                    capacite: data.capacite,
                    note: data.note,
                    telephone: user?.telephone || '',
                    plans: data.plans || [],
                    vehicules: data.vehicules || [],
                    avis_clients: data.avis_clients || []
                });
                setApiStatus('idle');
            } catch (err: any) {
                setApiError(err.message);
                setApiStatus('error');
            }
        };

        loadParking();
    }, [id, user.name]); // On ne dépend que du nom pour éviter les re-renders inutiles

    // 3. Mise à jour de champ optimisée
    const updateField = useCallback((field: keyof ParkingDetails, value: string) => {
        setDetails(p => p ? { ...p, [field]: value } : p);
    }, []);

    // 4. Calculs financiers et temporels sécurisés
    const dureeH = useMemo(() => {
        if (!details) return 0;
        const start = new Date(`${details.dateDebut}T${details.heureDebut}`);
        const end = new Date(`${details.dateFin}T${details.heureFin}`);
        const diff = (end.getTime() - start.getTime()) / 3_600_000;
        return diff > 0 ? diff : 0;
    }, [details]);

    const total = useMemo(() => {
        if (!details || isPremium || isNaN(dureeH)) return 0;
        return Math.ceil(dureeH * details.prixHeure);
    }, [dureeH, details, isPremium]);

    const datesInvalid = useMemo(() => {
        return dureeH <= 0;
    }, [dureeH]);

    // 5. Logique de paiement centralisée
    const pay = useCallback(async (mode: ReservationMode) => {
        if (!details) return;

        if (!details.matricule_vehicule) {
            setApiError('Le matricule du véhicule est obligatoire.');
            return;
        }

        setSubmitting(true);
        setApiError(null);

        try {
            const endpoint = mode === 'horaire' 
                ? `${(import.meta as any).env.VITE_API_URL}/api/client/reservations`
                : `${(import.meta as any).env.VITE_API_URL}/api/client/abonnements`; 

            // Payload formaté pour SQL (YYYY-MM-DD HH:mm:ss)
            const body = mode === 'horaire' ? {
                parking_id: details.parkingId,
                date_debut: `${details.dateDebut} ${details.heureDebut}:00`,
                date_fin: `${details.dateFin} ${details.heureFin}:00`,
                nom_conducteur: details.nom_conducteur,
                prenom_conducteur: details.prenom_conducteur,
                matricule_vehicule: details.matricule_vehicule,
                telephone: details.telephone,
                montant_total: total
            } : {
                parking_id: details.parkingId,
                type: 'Mensuel',
                prix: details.plans?.[0]?.prix ?? 0,
                matricule_vehicule: details.matricule_vehicule
            };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Une erreur est survenue.');

            // Redirections intelligentes
            if (mode === 'horaire' && isPremium) {
                navigate(`/reservation/success?id=${data.reservation.id}`);
            } else if (data.redirect_url) {
                window.location.href = data.redirect_url;
            } else {
                navigate('/dashboard');
            }

        } catch (err: any) {
            setApiError(err.message || 'Impossible de joindre le serveur.');
        } finally {
            setSubmitting(false);
        }
    }, [details, total, isPremium, navigate]);
    // 6. Gestion des avis
const submitReview = useCallback(async (rating: number, comment: string) => {
    if (!details?.parkingId) return;

    try {
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/client/avis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                parking_id: details.parkingId,
                note: rating,
                commentaire: comment
            }),
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.message || "Erreur lors de l'envoi");

        // Mise à jour locale immédiate de la liste des avis
        setDetails(prev => {
            if (!prev) return null;
            return {
                ...prev,
                avis_clients: [result.avis, ...(prev.avis_clients || [])]
            };
        });

        return { success: true };
    } catch (err: any) {
        setApiError(err.message);
        return { success: false, error: err.message };
    }
}, [details?.parkingId]);
    return {
        details, apiStatus, apiError, setApiError,
        dureeH, total, datesInvalid, updateField,
        submitting, pay, isPremium,submitReview
    };
}