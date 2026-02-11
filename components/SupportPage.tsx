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
        <div className="min-h-screen bg-[#010816] text-slate-300 overflow-y-auto pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <nav className="p-6 flex items-center justify-between border-b border-white/5 bg-[#010816]/80 backdrop-blur-md sticky top-0 z-50">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    <span className="text-xs font-bold uppercase tracking-widest">Voltar</span>
                </button>
                <div className="flex items-center font-black text-xl tracking-tighter uppercase">
                    <span className="text-blue-500">Chat</span>
                    <span className="text-orange-500">OLingo</span>
                    <div className="ml-1.5 border-2 border-blue-500/30 rounded-lg px-2 py-1 flex items-center justify-center bg-blue-600/10">
                        <span className="text-white text-[10px] font-black uppercase">AI</span>
                    </div>
                </div>
                <div className="w-10" />
            </nav>

            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                        Central de Ajuda
                    </div>
                    <h1 className="text-4xl font-black text-white mb-4 leading-tight">Como podemos <br /><span className="text-blue-500 italic">ajudar</span> você hoje?</h1>
                    <p className="text-slate-400 text-sm font-medium">Tire suas dúvidas ou fale diretamente com nosso time de especialistas.</p>
                </div>

                {/* FAQ Section */}
                <div className="space-y-6 mb-16">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Perguntas Frequentes</h2>
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 transition-all hover:border-blue-500/30 group">
                            <h3 className="text-sm font-black text-white mb-2 uppercase tracking-wide group-hover:text-blue-400 transition-colors">{faq.q}</h3>
                            <p className="text-xs leading-relaxed font-medium text-slate-400">{faq.a}</p>
                        </div>
                    ))}
                </div>

                {/* Contact Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 text-center shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Ainda com dúvidas?</h2>
                    <p className="text-blue-100/80 text-sm font-medium mb-8 max-w-sm mx-auto">Nosso suporte humano está pronto para atender você via WhatsApp.</p>
                    <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
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
