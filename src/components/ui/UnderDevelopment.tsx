// src/pages/UnderDevelopment.tsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Construction, Cog } from 'lucide-react';

export function UnderDevelopment() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-md w-full text-center"
            >
                {/* Animation des icônes */}
                <div className="relative mb-10 flex justify-center">
                    <div className="w-24 h-24 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500">
                        <Construction size={48} strokeWidth={1.5} />
                    </div>
                    
                    {/* Engrenage qui tourne en arrière-plan */}
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        className="absolute -bottom-2 -right-2 w-12 h-12 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center text-slate-400"
                    >
                        <Cog size={24} />
                    </motion.div>
                </div>

                {/* Contenu textuel */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-6">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    Bientôt disponible
                </div>

                <h1 className="text-[26px] font-bold text-slate-900 leading-tight mb-3">
                    Page en cours de développement
                </h1>
                
                <p className="text-[14px] text-slate-500 mb-10 leading-relaxed">
                    Nous travaillons activement sur cette fonctionnalité pour améliorer votre expérience de gestion. Revenez très bientôt !
                </p>

                {/* Barre de progression factice pour le style */}
                <div className="mb-10 px-8">
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "75%" }}
                            transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                            className="h-full bg-amber-500"
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Progression</span>
                        <span>75%</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        <ArrowLeft size={16} strokeWidth={2.5} />
                        Retour
                    </button>
                    
                    <button
                        onClick={() => navigate('/partner/dashboard')}
                        className="w-full flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white text-[13px] font-semibold transition-all shadow-lg shadow-slate-200 active:scale-95"
                    >
                        <Home size={16} strokeWidth={2.5} />
                        Dashboard
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default UnderDevelopment;