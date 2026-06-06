
const BASE_URL = `${(import.meta as any).env.VITE_API_URL}/api`;

function getToken(): string {
    return localStorage.getItem("token") ?? "";
}

class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "ApiError";
    }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${getToken()}`,
            Accept: "application/json",
            ...(options.headers ?? {}),
        },
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(res.status, body.message ?? "Erreur serveur");
    }

    return res.json() as Promise<T>;
}

// ── API ADMIN ──────────────────────────────────────────
export const adminApi = {
    getPendingProprios: () =>
        request<{ data: Proprio[] }>("/admin/pending-proprios").then(
            (r) => (Array.isArray(r) ? r : r.data ?? [])
        ),

    getPendingParkings: () =>
        request<{ data: Parking[] }>("/admin/pending-parkings").then(
            (r) => (Array.isArray(r) ? r : r.data ?? [])
        ),

    approveUser: (id: number) =>
        request<void>(`/admin/users/${id}/approve`, { method: "PATCH" }),

    rejectUser: (id: number) =>
        request<void>(`/admin/users/${id}/desapprove`, { method: "DELETE" }),
  
    approveParking: (id: number, coords: { latitude: string, longitude: string }) =>
        request<void>(`/admin/parkings/${id}/approve`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(coords)
        }),
    desapproveParking: (id: number) =>
        request<void>(`/admin/parkings/${id}/desapprove`, { method: "DELETE" }),
};
// ── TYPES ────────────────────────────────────────────
export interface Proprio {
    id: number;
    name: string;
    email: string;
    telephone?: string;
    created_at: string;
}

export interface Parking {
    id: number;
    nom: string;
    quartier: string;
    departement: string;
    capacite: number;
    prix_base: number;
    nom_service?: string;
    image?: string;
    created_at: string;
    proprietaire?: { name: string };
    user?: { name: string};
    services?: { nom: string };
}

export interface KpiData {
    pendingProprios: number;
    pendingParkings: number;
    approved: number;
    revenue: number;
}