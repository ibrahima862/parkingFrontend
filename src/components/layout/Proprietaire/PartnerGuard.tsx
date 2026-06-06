import { usePartenaireParkings } from '../../../Pages/Partner/Dashboard';
import { DashboardStatus } from '../../Partner/Dashbaord/DashboardEmptyState';
import { Skeleton } from '../../ui/Skleton';
import { Outlet } from 'react-router-dom';

export function PartnerGuard() {
  const { data, loading } = usePartenaireParkings();

  if (loading) return <div className="p-10"><Skeleton /></div>;

  // 1. AUCUN PARKING
  if (data.length === 0) {
    return <DashboardStatus/>;
  }

  // 3. TOUT EST OK -> On affiche la page demandée
  return <Outlet />;
}