// src/pages/NotFound.tsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, MapPinOff } from 'lucide-react';

export function NotFound() {
    const navigate = useNavigate();

    // Animation helper (similaire à ton Dashboard)
    const containerVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <motion.div 
                initial="initial"
                animate="animate"
                className="max-w-md w-full text-center"
            >
                {/* Illustration Icon */}
                <div className="relative mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600">
                        <MapPinOff size={48} strokeWidth={1.5} />
                    </div>
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute -top-2 -right-2 w-10 h-10 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center text-amber-500"
                    >
                        <Search size={20} strokeWidth={2.5} />
                    </motion.div>
                </div>

                {/* Text Content */}
                <h1 className="text-[64px] font-black text-slate-900 leading-none tracking-tighter mb-4">
                    404
                </h1>
                <h2 className="text-[20px] font-bold text-slate-800 mb-3">
                    Espace introuvable
                </h2>
                <p className="text-[14px] text-slate-500 mb-8 leading-relaxed">
                    Désolé, la page que vous recherchez semble avoir été déplacée ou n'existe plus dans notre réseau de stationnement.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center gap-2 h-11 px-6 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={16} strokeWidth={2.5} />
                        Retour
                    </button>
                    
                    <button
                        onClick={() => navigate('/partner/dashboard')}
                        className="w-full flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-[13px] font-semibold transition-colors shadow-sm shadow-blue-200"
                    >
                        <Home size={16} strokeWidth={2.5} />
                        Tableau de bord
                    </button>
                </div>

                {/* Subtle Footer */}
                <p className="mt-12 text-[11px] text-slate-400 uppercase tracking-widest font-medium">
                    Smart Parking Partner System
                </p>
            </motion.div>
        </div>
    );
}

export default NotFound;