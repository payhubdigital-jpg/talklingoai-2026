import React from 'react';
import { WHATSAPP_LINK } from '../constants';

interface SupportPageProps {
    onBack: () => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ onBack }) => {
    const faqs = [
        { q: "O ChatOLingo é realmente em tempo real?", a: "Sim! Utilizamos a infraestrutura 'Live' do Gemini para que a tradução ocorra enquanto você fala, com latência mínima." },
        { q: "Como funciona o plano Vitalício?", a: "No modo Vitalício, você paga uma única vez e tem acesso eterno a todas as atualizações e recursos Premium do ChatOLingo sem mensalidades." },
        { q: "O app funciona offline?", a: "Atualmente requer conexão estável com a internet para processar as traduções via IA nas nuvens." },
        { q: "Como mudar a voz da tradução?", a: "Basta clicar nos seletores de voz (Masculina/Feminina) na tela principal. Assinantes Pro têm acesso a vozes mais naturais." }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FFF5EB] to-[#FAF8F5] text-slate-700 overflow-y-auto pb-20 animate-in fade-in duration-500">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #FFB84D 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            {/* Header */}
            <nav className="p-6 flex items-center justify-between border-b border-orange-200/30 bg-[#FAF8F5]/80 backdrop-blur-md sticky top-0 z-50">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
                </button>
                <div className="flex items-center gap-3">
                    {/* Owl logo in speech bubble */}
                    <div className="relative">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center">
                            <div className="text-2xl">🦉</div>
                        </div>
                        <div className="absolute -bottom-1 left-2 w-2 h-2 bg-white rotate-45 shadow-md" />
                    </div>
                    <div className="flex items-center font-black text-lg tracking-tight">
                        <span className="text-[#FF6B35]">Chat</span>
                        <span className="text-[#FFB84D]">Olingo</span>
                        <span className="text-[#FF6B35] ml-1">AI</span>
                    </div>
                </div>
                <div className="w-10" />
            </nav>

            <div className="max-w-3xl mx-auto px-6 py-12 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        Central de Ajuda
                    </div>
                    <h1 className="text-4xl font-black text-slate-800 mb-4 leading-tight">Como podemos <br /><span className="text-orange-500 italic">ajudar</span> você hoje?</h1>
                    <p className="text-slate-600 text-sm font-medium">Tire suas dúvidas ou fale diretamente com nosso time de especialistas.</p>
                </div>

                {/* FAQ Section */}
                <div className="space-y-6 mb-16">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Perguntas Frequentes</h2>
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white border border-orange-100 rounded-3xl p-6 transition-all hover:border-orange-300 hover:shadow-lg group">
                            <h3 className="text-sm font-black text-slate-800 mb-2 uppercase tracking-wide group-hover:text-orange-600 transition-colors">{faq.q}</h3>
                            <p className="text-xs leading-relaxed font-medium text-slate-600">{faq.a}</p>
                        </div>
                    ))}
                </div>

                {/* Contact Card */}
                <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2.5rem] p-8 text-center shadow-2xl shadow-orange-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter relative z-10">Ainda com dúvidas?</h2>
                    <p className="text-orange-50 text-sm font-medium mb-8 max-w-sm mx-auto relative z-10">Nosso suporte humano está pronto para atender você via WhatsApp.</p>
                    <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        Falar com Suporte
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.18-2.18a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
