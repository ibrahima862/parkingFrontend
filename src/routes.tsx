import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import { PartnerLayout } from "./Pages/Partner/PartnerLayout";

import { Home } from "./Pages/Home";
import { ParkingListPage } from "./Pages/ParkingListPage";
import {AdminDashboard} from './Pages/Admin/AdminDashboard';
import { BecomePartner } from "./Pages/Partner/BecomePartner";
import Reservation from "./Pages/BookingPage";
import Register from "./Pages/Auth/Register";
import Login from "./Pages/Auth/Login";
import SuccessPage from "./Pages/SuccessPage";
import UserReservationsPage from "./Pages/UserReservationsPage";
import Layout from "./components/Layout";
import Dashboard from "./Pages/Partner/Dashboard";
import { AddParking } from "./components/layout/Proprietaire/AddParking";
import { ParkingFlow } from "./Pages/Partner/ParkingFlow";
import { ParkingShow } from "./Pages/Partner/ParkingShow";
import { AnalyticsDashboard } from "./Pages/Partner/AnalyticsDashboard";
import { Billing } from "./Pages/Partner/Billing";
import { AdminPayouts } from "./Pages/Admin/AdminPayouts";
import AdminLayout from "./Pages/Admin/AdminLayout";
import { AdminBookings } from "./Pages/Admin/AdminBookings";
import { AdminParkings } from "./Pages/Admin/AdminParkings";
import { AdminUsers } from "./Pages/Admin/Users";
import { AdminPartners } from "./Pages/Admin/AdminPartners";
import { AdminTransactions } from "./Pages/Admin/AdminTransactions";
import { AdminReports} from "./Pages/Admin/AdminReports";
import { MapComponent } from "./components/Map";
import PartnerParkings from "./Pages/Partner/Parkings";
import SubscriptionManagement from "./Pages/Partner/SubscriptionManagement";
import { Test } from "./Pages/Test";
import AlertSms from "./Pages/Partner/PartnerNotification";
import { UnderDevelopment } from "./components/ui/UnderDevelopment";
import NotFound from "./components/ui/NotFound";
import UserProfilePage from "./Pages/UserProfilePage";
import { HelpPage } from "./Pages/HelpPage";
import AdminRefundPage from "./Pages/Admin/AdminRefundPage";
import BecomePartnerLayout from "./components/BecomePartnerLayout";
import RequestPasswordReset from "./Pages/ResetPasswordRequest";
import ResetPassword from "./Pages/ResetPassword";
import ParkingDetails from "./Pages/Partner/ParkingDetails";


export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  { path: "booking/success", Component: SuccessPage },
  { path: "forgot-password", Component:RequestPasswordReset},
  { path: "reset-password", Component:ResetPassword},
  {
  path: "/",
  Component: Layout,
  children: [

    { index: true, Component: Home },

    { path: "parking-lots", Component: ParkingListPage },

    { path: "parking/:id", Component: Reservation },

    { path: "login", Component: Login },

    { path: "register", Component: Register },

    { path: "my-bookings", Component: UserReservationsPage },

    { path: "map", Component: MapComponent },

     { path: "help", Component: HelpPage },
     
     { path: "test", Component: Test },

     { path: "/profile", Component: UserProfilePage},

     {path:"/becomepartner",Component:BecomePartner},
  ],
},

{
  path: "/partner",
  Component: PartnerLayout,
  children: [

    { index: true, element: <Navigate to="dashboard" replace /> },

    { path: "dashboard", Component: Dashboard },

    { path: "bookings", Component: ParkingFlow },

    { path: "parking-lots", Component: PartnerParkings },

    { path: "parking-lots/new", Component: AddParking },

    { path: "earnings", Component: Billing },

    { path: "analytics", Component: AnalyticsDashboard },

    { path: "subscriptions", Component: SubscriptionManagement },

    { path: "notifications", Component: AlertSms},

    { path: "settings", Component:UnderDevelopment},

    { path: "parking/:id", Component: ParkingShow },
    
    { path: "parking/:id/details", Component: ParkingDetails },

  ],
},
 {
  path: "/admin",
  Component: AdminLayout,
  children: [

    { path: "dashboard", Component: AdminDashboard },

    { path: "payouts", Component: AdminPayouts },

    { path: "bookings", Component: AdminBookings },

    { path: "parking-lots", Component: AdminParkings },

    { path: "users", Component: AdminUsers },

    { path: "partners", Component: AdminPartners },
    
    { path: "refund", Component: AdminRefundPage },

    { path: "transactions", Component: AdminTransactions },

    { path: "reports", Component: AdminReports },
  ],
  
},
{path:"*", Component:NotFound}
]);