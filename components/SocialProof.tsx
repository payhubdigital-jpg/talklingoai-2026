
import React, { useState, useEffect } from 'react';

const CITIES = ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Belo Horizonte', 'Lisboa', 'Porto', 'Brasília', 'Salvador', 'Fortaleza', 'Florianópolis'];
const NAMES = ['Ricardo', 'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Fábio', 'Gisele', 'Henrique', 'Isabela'];
const ACTIONS = [
    'acabou de assinar o Plano Pro!',
    'iniciou uma conversa em Inglês.',
    'economizou 20 minutos de tradução.',
    'ativou o acesso vitalício.',
    'convidou um amigo para o TalkLingo.',
    'acabou de se tornar Premium!'
];

const SocialProof: React.FC = () => {
    const [current, setCurrent] = useState<{ name: string; city: string; action: string } | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const showNotification = () => {
            const name = NAMES[Math.floor(Math.random() * NAMES.length)];
            const city = CITIES[Math.floor(Math.random() * CITIES.length)];
            const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];

            setCurrent({ name, city, action });
            setIsVisible(true);

            setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        };

        // Primeira notificação após 10 segundos
        const initialTimer = setTimeout(showNotification, 10000);

        // Ciclo a cada 30-45 segundos
        const interval = setInterval(() => {
            showNotification();
        }, 40000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    if (!current) return null;

    return (
        <div className={`fixed bottom-24 left-6 z-[100] transition-all duration-700 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0 pointer-events-none'}`}>
            <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-2xl min-w-[280px]">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">NOTIFICAÇÃO AO VIVO</p>
                    <p className="text-xs text-white leading-tight">
                        <span className="font-black">{current.name}</span> de {current.city}
                    </p>
                    <p className="text-[11px] text-orange-400 font-bold">{current.action}</p>
                </div>
            </div>
        </div>
    );
};

export default SocialProof;
