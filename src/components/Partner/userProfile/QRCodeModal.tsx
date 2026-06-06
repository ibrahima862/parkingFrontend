import { QrCodeIcon, X } from "lucide-react";
import * as QRCodeModule from 'react-qr-code';
const QRCodeComponent = QRCodeModule.default;
export function QRCodeModal({ isOpen, onClose, value, title }: { isOpen: boolean; onClose: () => void; value: string; title: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden z-10">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1B3FA0] rounded-xl flex items-center justify-center">
              <QrCodeIcon size={16} color="#fff" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-900 leading-none">Ticket d'accès</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="p-6 flex flex-col items-center">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl mb-5">
            <QRCodeComponent value={value} size={180} style={{ height:"auto", maxWidth:"100%", width:"100%" }} />
          </div>
          <div className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-[10px] font-bold text-[#1B3FA0] uppercase tracking-widest mb-1">Instructions</p>
            <p className="text-[12px] text-slate-600 leading-relaxed">Présentez ce code devant le lecteur à l'entrée du parking.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
