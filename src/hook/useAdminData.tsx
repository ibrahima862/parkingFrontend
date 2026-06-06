// src/hooks/useAdminData.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { adminApi, type Proprio, type Parking } from "../lib/api";

interface AsyncState<T> {
    data: T;
    loading: boolean;
    error: string | null;
    setData: React.Dispatch<React.SetStateAction<T>>; 
    refresh: () => Promise<void>;
}

function useAsync<T>(fetcher: () => Promise<T>, initial: T): AsyncState<T> {
    const [data, setData] = useState<T>(initial);
    const [loading, setLoad] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mounted = useRef(true);

    const run = useCallback(async () => {
        setLoad(true);
        setError(null);
        try {
            const result = await fetcher();
            if (mounted.current) setData(result);
        } catch (e: any) {
            if (mounted.current) setError(e.message ?? "Erreur inconnue");
        } finally {
            if (mounted.current) setLoad(false);
        }
    }, [fetcher]);

    useEffect(() => {
        mounted.current = true;
        run();
        return () => { mounted.current = false; };
    }, [run]);

    return { data, loading, error, setData, refresh: run };
}

// ── Domain hooks ───────────────────────────────────────

export function usePendingProprios() {
    const state = useAsync<Proprio[]>(adminApi.getPendingProprios, []);

    const approve = useCallback(async (id: number) => {
        try {
            
            await adminApi.approveUser(id);
            // Update locale instantanée sans attendre le refresh API
            state.setData(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            throw e; // On laisse le composant gérer l'erreur via toast
        }
    }, [state]);

    const reject = useCallback(async (id: number) => {
        try {
            await adminApi.rejectUser(id);
            state.setData(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            throw e;
        }
    }, [state]);

     const ParkingReject = useCallback(async (id: number) => {
        try {
            await adminApi.desapproveParking(id);
            state.setData(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            throw e;
        }
    }, [state]);
    return { ...state, approve, reject, ParkingReject };
}

export function usePendingParkings() {
    const state = useAsync<Parking[]>(adminApi.getPendingParkings, []);

    const approve = useCallback(async (id: number, coords: { latitude: string, longitude: string }) => {
        try {
            await adminApi.approveParking(id, coords);
            state.setData(prev => prev.filter(p => p.id !== id));
        } catch (e) { throw e; }
    }, [state]);

    const reject = useCallback(async (id: number) => {
        try {
            await adminApi.desapproveParking(id); // Assure-toi que cette méthode existe dans ton adminApi
            state.setData(prev => prev.filter(p => p.id !== id));
        } catch (e) { throw e; }
    }, [state]);

    return { ...state, approve, reject }; // Retourne les deux méthodes
}
// ── Combined dashboard hook ────────────────────────────

export function useAdminDashboard() {
    const proprios = usePendingProprios();
    const parkings = usePendingParkings();
    
    // Correction : refreshing ne doit pas être TRUE si l'un est en cache
    const refreshing = proprios.loading || parkings.loading;

    const refreshAll = useCallback(async () => {
        await Promise.allSettled([proprios.refresh(), parkings.refresh()]);
    }, [proprios, parkings]);

    return { proprios, parkings, refreshing, refreshAll };
}