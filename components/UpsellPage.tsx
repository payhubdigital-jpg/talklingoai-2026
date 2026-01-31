
import React from 'react';
import { PREMIUM_CHECKOUT_URL } from '../constants';

interface UpsellPageProps {
  onBack: () => void;
}

const UpsellPage: React.FC<UpsellPageProps> = ({ onBack }) => {
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
      <div className="max-w-4xl mx-auto px-6 pt-12 text-center">
        <div className="flex flex-col items-center mb-8">
          <img src="/icon.png" alt="Logo" className="w-20 h-20 mb-4 shadow-2xl shadow-orange-500/20 rounded-3xl" />
          <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">
              128 usuários traduzindo agora
            </span>
          </div>
        </div>

        <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
          Oferta de Lançamento: Vagas Limitadas
        </div>

        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
          Sua voz sem fronteiras <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-amber-600">
            Acesso Ilimitado.
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
          Diga adeus aos limites de tempo. Fale, entenda e seja entendido em qualquer lugar do mundo.
        </p>

        {/* Card Principal */}
        <div className="bg-[#0a0f1d] border border-orange-500/20 rounded-[3rem] p-8 md:p-12 shadow-[0_0_50px_rgba(249,115,22,0.1)] relative overflow-hidden mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 blur-[100px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-[100px] -ml-32 -mb-32" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-6">
              <div className="space-y-4">
                {[
                  { t: "Tempo Real Ilimitado", d: "Sem interrupções para o Gemini parar de ouvir." },
                  { t: "Vozes Ultra-Realistas", d: "Acesso a todas as vozes premium masculinas e femininas." },
                  { t: "Sync de Gênero Inteligente", d: "A IA adapta a voz automaticamente ao seu tom." },
                  { t: "Suporte Prioritário", d: "Respostas mais rápidas da IA em qualquer horário." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wide text-orange-100">{item.t}</h3>
                      <p className="text-xs text-slate-400">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center space-y-6">
              <div className="text-center">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Oferta de Boas-Vindas</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-orange-500">R$</span>
                  <span className="text-6xl font-black text-white">37</span>
                  <span className="text-2xl font-bold text-slate-500">,00</span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  No 1º mês, depois R$ 47,90/mês
                </p>
                <div className="inline-block mt-3 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
                  <p className="text-orange-500 text-[9px] font-black uppercase tracking-widest">Apenas 7 vagas restantes hoje</p>
                </div>
              </div>

              <a
                href={PREMIUM_CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(234,88,12,0.3)] transition-all hover:scale-[1.03] active:scale-[0.98] text-center text-sm tracking-widest"
              >
                QUERO ACESSO ILIMITADO
              </a>

              <div className="flex items-center gap-2 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <span className="text-[9px] font-bold uppercase tracking-widest">Pagamento Seguro via Kiwify</span>
              </div>
            </div>
          </div>
        </div>

        {/* Depoimentos */}
        <div className="mb-20">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-10 text-center">O que dizem os usuários</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { n: "Ricardo M.", t: "Perfeito para minhas viagens de negócios. A tradução é instantânea e muito precisa.", s: 5 },
              { n: "Ana Clara", t: "O modo mãos livres é sensacional para conversar sem ficar tocando no celular.", s: 5 },
              { n: "Gustavo S.", t: "As vozes são muito naturais. Consigo conversar por horas sem parecer robótico.", s: 5 }
            ].map((d, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                <div className="flex gap-1 mb-3">
                  {[...Array(d.s)].map((_, j) => (
                    <svg key={j} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#f97316" stroke="#f97316"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic mb-4 leading-relaxed">"{d.t}"</p>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">{d.n}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Garantia e Selos */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-20">
          <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-3xl border border-white/5">
            <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest">7 Dias de Garantia</p>
              <p className="text-[9px] text-slate-500 uppercase font-bold">Satisfação ou seu dinheiro de volta</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-3xl border border-white/5">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest">Pagamento 100% Seguro</p>
              <p className="text-[9px] text-slate-500 uppercase font-bold">Criptografia de ponta a ponta</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpsellPage;
