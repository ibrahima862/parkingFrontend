    export interface User {
    id?: number;
    name?: string;
    email: string;
    password?: string;
    role?: string;
    telephone:string;
}

export interface ParkingDetails {
    parkingId: number;
    nomParking: string;
    quartier: string;
    prixHeure: number;
    dateDebut: string;
    heureDebut: string;
    dateFin: string;
    heureFin: string;
    nom_conducteur: string;
    prenom_conducteur: string;
    matricule_vehicule: string;
    tags: string[];
    description?: string;
    nom: string;
    image: string;
    capacite?: number;
    note?: number;
    telephone:string;
    plans:Plan[];
    vehicules:VehiculeType[];
    avis_clients?: Review[];
}

interface Review {
    id: number;
    user: User;
    rating: number;
    comment: string;
    created_at: string;
}
export interface VehiculeType{
    id: number;
    libelle:string;
}
export interface Vehicule {
    id: number;
    matricule: string;
    modele: string;
    marque: string;
    type: VehiculeType;
    is_main: boolean;
}
interface Plan{
   nom:string;
   description:string;
   prix:number;
   duree_jours:string;
   type:string;
}
export interface Parking{
    nom:string;
    quartier:string;
    longitude:string;
    latitude:string
    adresse:string;
    user:User;
}
export interface Abonnement {
    id: number;
    type: string;
    prix: string;
    date_debut: string;
    date_fin: string;
    statut: string;
    isActive: boolean;
    parking?: Parking;
    user:User;
    plan:Plan;
    matricule_vehicule:string;
    
}

export interface ItemData {
  id: number; statut: string; parking?: Parking;
  date_debut: string; date_fin: string;
}


export interface Report{
    id: number;
    category: string;
    description: string;
    status: string;
    created_at: string;
    parking?: Parking;
    user?: User;
    parking_id:number;
}
