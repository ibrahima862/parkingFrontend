import React, { useState, useEffect } from 'react';
import { Plus, X, Car, Trash2 } from 'lucide-react';
import { Vehicule, VehiculeType } from '../../../type';

const inp = "w-full mt-1 py-2.5 px-3.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300 text-gray-900";
const label = "text-[11px] font-semibold text-gray-500 uppercase tracking-wider";

export function VehiculesManager({ initialVehicules, categories, onRefresh }: {
  initialVehicules: Vehicule[];
  categories: VehiculeType[];
  onRefresh: () => void;
}) {
  const [vehicules, setVehicules] = useState(initialVehicules || []);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newVehicule, setNewVehicule] = useState({
    plaque_immatriculation: '',
    marque: '',
    modele: '',
    vehicule_type_id: '',
    couleur: '',
  });

  const API_URL = (import.meta as any).env.VITE_API_URL;

  useEffect(() => { setVehicules(initialVehicules); }, [initialVehicules]);

  const authFetch = async (endpoint: string, options: any = {}) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (!res.ok) throw new Error('Erreur serveur');
    return res.json();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authFetch('/api/client/vehicules', { method: 'POST', body: JSON.stringify(newVehicule) });
      setShowAdd(false);
      setNewVehicule({ plaque_immatriculation: '', marque: '', modele: '', vehicule_type_id: '', couleur: '' });
      onRefresh?.();
    } catch {
      alert("Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce véhicule ?')) return;
    try {
      await authFetch(`/api/client/vehicules/${id}`, { method: 'DELETE' });
      onRefresh?.();
    } catch {
      alert('Erreur lors de la suppression');
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setNewVehicule(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="flex flex-col gap-3">

      {/* Add form */}
      {showAdd ? (
        <div className="bg-white border border-blue-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Car size={14} className="text-blue-700" strokeWidth={2} />
              </div>
              <span className="text-[13px] font-bold text-slate-800">Nouveau véhicule</span>
            </div>
            <button type="button" onClick={() => setShowAdd(false)}
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <X size={13} />
            </button>
          </div>

          <form onSubmit={handleAdd} className="p-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={label}>Type de véhicule</label>
              <select required value={newVehicule.vehicule_type_id} onChange={set('vehicule_type_id')}
                className={inp}>
                <option value="">Sélectionner un type</option>
                {categories?.map(t => <option key={t.id} value={t.id}>{t.libelle}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={label}>Plaque d'immatriculation</label>
              <input required placeholder="ex: DK-1234-AB" value={newVehicule.plaque_immatriculation}
                onChange={set('plaque_immatriculation')} className={inp} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={label}>Marque</label>
                <input placeholder="ex: Toyota" value={newVehicule.marque} onChange={set('marque')} className={inp} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={label}>Modèle</label>
                <input placeholder="ex: Corolla" value={newVehicule.modele} onChange={set('modele')} className={inp} />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowAdd(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-[13px] font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">
                {loading ? (
                  <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Enregistrement…</>
                ) : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)}
          className="w-full py-3 border border-dashed border-blue-200 rounded-xl text-[13px] font-semibold text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 bg-white">
          <Plus size={15} strokeWidth={2.5} className="text-orange-500" />
          Ajouter un véhicule
        </button>
      )}

      {/* Vehicle list */}
      {vehicules.length === 0 && !showAdd ? (
        <div className="flex flex-col items-center gap-2 py-10 bg-white border border-slate-200 rounded-xl">
          <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center">
            <Car size={20} className="text-slate-400" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] font-semibold text-slate-500">Aucun véhicule enregistré</p>
          <p className="text-[12px] text-slate-400">Ajoutez vos véhicules pour réserver facilement.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {vehicules.map(v => (
            <div key={v.id}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-blue-100 hover:shadow-[0_2px_8px_rgba(29,78,216,0.06)] transition-all group">
              <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Car size={16} className="text-blue-700" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-slate-900 uppercase tracking-wide">{v.matricule}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {v.marque} {v.modele}
                  {v.type?.libelle && (
                    <span className="ml-1.5 text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-full">
                      {v.type.libelle}
                    </span>
                  )}
                </p>
              </div>
              <button onClick={() => handleDelete(v.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors">
                <Trash2 size={13} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}