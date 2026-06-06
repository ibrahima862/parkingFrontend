
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

let _id = 0;

/* ── PALETTE (matching SenovaPark) ── */
const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string }> = {
    success: { bg: "#ECFDF5", border: "#A7F3D0", icon: "#059669", iconBg: "#D1FAE5" },
    error:   { bg: "#FEF2F2", border: "#FECACA", icon: "#DC2626", iconBg: "#FEE2E2" },
    info:    { bg: "#EEF2FB", border: "#C5D0ED", icon: "#0D2B6E", iconBg: "#DDE4F4" },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
    const s = TOAST_STYLES[toast.type];
    const Icon = toast.type === "success" ? CheckCircle : AlertCircle;

    useEffect(() => {
        const t = setTimeout(() => onDismiss(toast.id), 3500);
        return () => clearTimeout(t);
    }, [toast.id, onDismiss]);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: s.bg, border: `1px solid ${s.border}`,
            borderRadius: 12, padding: '12px 14px',
            minWidth: 280, maxWidth: 380,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            animation: 'slideInToast 0.25s ease both',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={14} color={s.icon} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0D1B3E", flex: 1, lineHeight: 1.4 }}>
                {toast.message}
            </span>
            <button onClick={() => onDismiss(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.4 }}>
                <X size={13} color={s.icon} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = "info") => {
        setToasts((prev) => [...prev, { id: ++_id, type, message }]);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            <style>{`
                @keyframes slideInToast {
                    from { opacity: 0; transform: translateX(24px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
            {children}

            {/* Portal-like fixed stack */}
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}