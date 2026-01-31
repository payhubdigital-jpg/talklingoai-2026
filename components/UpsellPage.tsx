
import React, { useState } from 'react';
import { CHECKOUT_URL_MONTHLY, CHECKOUT_URL_YEARLY, CHECKOUT_URL_LIFETIME } from '../constants';

interface UpsellPageProps {
  onBack: () => void;
}

const UpsellPage: React.FC<UpsellPageProps> = ({ onBack }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');

  const plans = {
    free: {
      title: 'Gratuito',
      price: '0,00',
      period: '/sempre',
      link: '#',
      features: ['10 min/dia', 'Vozes Básicas', 'Com Anúncios'],
      highlight: false,
      isFree: true
    },
    monthly: {
      title: 'Mensal',
      price: '29,90',
      period: '/mês',
      link: CHECKOUT_URL_MONTHLY,
      features: ['Acesso Ilimitado', 'Todas as Vozes', 'Sem Anúncios'],
      highlight: false
    },
    yearly: {
      title: 'Anual',
      price: '16,65',
      period: '/mês',
      billed: 'R$ 199,90 pagos anualmente',
      link: CHECKOUT_URL_YEARLY,
      features: ['Economize 45%', 'Prioridade no Suporte', 'Acesso Antecipado'],
      highlight: true
    },
    lifetime: {
      title: 'Vitalício',
      price: '499,00',
      period: 'único',
      link: CHECKOUT_URL_LIFETIME,
      features: ['Pagamento Único', 'Acesso Eterno', 'Founder Badge'],
      highlight: false
    }
  };

  return (
    <div className="min-h-screen bg-[#010816] text-white overflow-y-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <nav className="p-6 flex items-center justify-between border-b border-white/5 bg-[#010816]/80 backdrop-blur-md sticky top-0 z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
        </button>
        <div className="flex items-center font-black text-xl tracking-tight">
          <span className="text-blue-500">Talk</span>
          <span className="text-orange-500">Lingo</span>
          <div className="ml-1.5 border-2 border-blue-500/30 rounded-lg px-2 py-1 flex items-center justify-center bg-blue-600/10">
            <span className="text-white text-[10px] font-black">AI</span>
          </div>
        </div>
        <div className="w-10" />
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
          Escolha seu Plano
        </div>

        <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
          Comunicação sem <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-600">
            Fronteiras.
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
          Comece grátis ou desbloqueie todo o potencial sem limites.
        </p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 items-start">

          {/* Free Card */}
          <div className="rounded-[2.5rem] p-8 border bg-white/5 border-white/5 relative opacity-80 hover:opacity-100 transition-all duration-300">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Gratuito</h3>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-3xl font-bold text-white">R$</span>
              <span className="text-5xl font-black text-white">{plans.free.price}</span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">{plans.free.period}</p>

            <ul className="space-y-3 mb-8 text-left max-w-[200px] mx-auto hidden md:block">
              {plans.free.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  {f}
                </li>
              ))}
            </ul>

            <button onClick={onBack} className="block w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5">
              Continuar Grátis
            </button>
          </div>

          {/* Monthly Card */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`cursor-pointer rounded-[2.5rem] p-8 border transition-all duration-300 relative ${selectedPlan === 'monthly' ? 'bg-[#0f172a] border-orange-500/50 scale-[1.02] shadow-[0_0_30px_rgba(249,115,22,0.15)] z-10' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
          >
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Mensal</h3>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-3xl font-bold text-white">R$</span>
              <span className="text-5xl font-black text-white">{plans.monthly.price}</span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">{plans.monthly.period}</p>

            <ul className="space-y-3 mb-8 text-left max-w-[200px] mx-auto">
              {plans.monthly.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  {f}
                </li>
              ))}
            </ul>

            <a href={plans.monthly.link} target="_blank" rel="noopener noreferrer" className={`block w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedPlan === 'monthly' ? 'bg-orange-600 text-white shadow-lg hover:bg-orange-500' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              Escolher Mensal
            </a>
          </div>

          {/* Yearly Card (Featured) */}
          <div
            onClick={() => setSelectedPlan('yearly')}
            className={`cursor-pointer rounded-[2.5rem] p-8 border-2 transition-all duration-300 relative transform lg:-translate-y-4 ${selectedPlan === 'yearly' ? 'bg-[#0f172a] border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.25)] scale-[1.05] z-20' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
              Recomendado • -45% OFF
            </div>

            <h3 className="text-base font-black text-orange-400 uppercase tracking-widest mb-4">Anual</h3>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-3xl font-bold text-white">R$</span>
              <span className="text-6xl font-black text-white">{plans.yearly.price}</span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">{plans.yearly.period}</p>
            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider mb-6 bg-orange-500/10 inline-block px-2 py-1 rounded">
              {plans.yearly.billed}
            </p>

            <ul className="space-y-4 mb-8 text-left max-w-[220px] mx-auto">
              {plans.yearly.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <a href={plans.yearly.link} target="_blank" rel="noopener noreferrer" className={`block w-full py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${selectedPlan === 'yearly' ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl hover:scale-[1.02]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              Começar Agora
            </a>
          </div>

          {/* Lifetime Card */}
          <div
            onClick={() => setSelectedPlan('lifetime')}
            className={`cursor-pointer rounded-[2.5rem] p-8 border transition-all duration-300 relative ${selectedPlan === 'lifetime' ? 'bg-[#0f172a] border-blue-500/50 scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.15)] z-10' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
          >
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              Lançamento
            </div>

            <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4">Vitalício</h3>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-3xl font-bold text-white">R$</span>
              <span className="text-5xl font-black text-white">{plans.lifetime.price}</span>
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">{plans.lifetime.period}</p>

            <ul className="space-y-3 mb-8 text-left max-w-[200px] mx-auto">
              {plans.lifetime.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  {f}
                </li>
              ))}
            </ul>

            <a href={plans.lifetime.link} target="_blank" rel="noopener noreferrer" className={`block w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedPlan === 'lifetime' ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-500' : 'bg-white/10 text-white hover:bg-white/20'}`}>
              Comprar Acesso Vitalício
            </a>
          </div>
        </div>

        {/* FAQ / Guarantee */}
        <div className="mt-16 border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-center gap-8 mb-20 opacity-60 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Compra Segura</p>
              <p className="text-[9px] text-slate-500 font-bold">Processado via Kiwify</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Suporte 24/7</p>
              <p className="text-[9px] text-slate-500 font-bold">Dúvidas? Fale conosco</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UpsellPage;
