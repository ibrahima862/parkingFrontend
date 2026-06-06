import React from 'react';
import { CreditCard, Clock, AlertTriangle } from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState';
import { StatusBadge } from '../../ui/StatutBadge';
import { ItemData } from '../../../type';
export function SubscriptionsList({ items = [] }: { items: ItemData[] }) {
  if (items.length === 0) return (
    <EmptyState icon={CreditCard} title="Aucun abonnement actif" sub="Souscrivez à un abonnement pour profiter de tarifs réduits." />
  );

  const getProgressData = (dateFin: string, dateDebut: string | undefined) => {
    const fin = new Date(dateFin).getTime();
    // Si date_debut n'existe pas, on simule un mois (30j) avant la fin pour le calcul
    const debut = dateDebut ? new Date(dateDebut).getTime() : fin - (30 * 24 * 60 * 60 * 1000);
    const maintenant = new Date().getTime();

    const totalDuration = fin - debut;
    const timeRemaining = fin - maintenant;

    // Calcul du pourcentage restant (entre 0 et 100)
    const percentageRemaining = Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100));
    const daysLeft = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));

    return { 
      percentage: percentageRemaining, 
      days: daysLeft 
    };
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map(abo => {
        const { percentage, days } = getProgressData(abo.date_fin, abo.date_debut);
        const isCritical = days <= 3;

        return (
          <div key={abo.id} className="bg-white border border-gray-200 rounded-lg p-5  hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                  <CreditCard size={18} className="text-gray-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{abo.parking?.nom || 'Abonnement'}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Clock size={12} />
                    <span>Jusqu'au {new Date(abo.date_fin).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
              <StatusBadge statut={abo.statut} />
            </div>

            {/* Zone de progression (qui diminue) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-[11px] font-bold uppercase tracking-tight ${isCritical ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                  {days > 0 ? `Il reste ${days} jour${days > 1 ? 's' : ''}` : "Expiré aujourd'hui"}
                </span>
                <span className="text-[11px] font-medium text-gray-400">
                  {Math.round(percentage)}%
                </span>
              </div>
              
              {/* Conteneur de la barre */}
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    isCritical ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${percentage}%` }} // La largeur diminue avec le temps
                />
              </div>
            </div>

            {/* Alerte si expiration imminente */}
            {isCritical && days > 0 && (
              <div className="mt-4 flex items-center gap-2 p-2.5 bg-red-50 rounded-md border border-red-100">
                <AlertTriangle size={14} className="text-red-600" />
                <p className="text-[11px] text-red-700 font-medium">
                  Votre abonnement expire très bientôt.
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}