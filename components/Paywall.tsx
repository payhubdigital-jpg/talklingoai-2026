
import React from 'react';
import { PREMIUM_CHECKOUT_URL } from '../constants';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  onViewOffer?: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ isOpen, onClose, reason, onViewOffer }) => {
  if (!isOpen) return null;

  const handleTestActivation = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    window.location.href = `${baseUrl}?payment_success=true`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#010816]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-orange-500/10 ring-1 ring-white/10 animate-in zoom-in-95 duration-300">
        <div className="h-32 bg-gradient-to-br from-blue-600 via-orange-500 to-orange-700 flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)]" />
          <img src="/icon.png" className="w-16 h-16 rounded-2xl border border-white/30 shadow-xl object-cover" alt="Icon" />
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          <h2 className="text-2xl font-black text-white mb-2 leading-tight">Limite Atingido</h2>
          <p className="text-slate-400 text-sm font-medium mb-8">
            {reason || "Sua sessão gratuita terminou. Libere agora para continuar sua conversa."}
          </p>

          <div className="w-full space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-3xl border border-white/5">
              <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Conversas Ilimitadas</p>
                <p className="text-[10px] text-slate-500 font-medium">Traduza horas sem interrupções</p>
              </div>
            </div>
          </div>

          <button
            onClick={onViewOffer}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-3xl shadow-xl shadow-orange-600/20 transition-all active:scale-[0.98] mb-4 text-center"
          >
            VER OFERTA ESPECIAL
          </button>

          <div className="mt-4 flex flex-col gap-2 w-full">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
            >
              Agora não
            </button>

            <button
              onClick={handleTestActivation}
              className="mt-6 text-[9px] text-slate-700 hover:text-blue-500 font-bold uppercase tracking-[0.2em] transition-colors border-t border-white/5 pt-4"
            >
              Simular Compra (Apenas Teste)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
