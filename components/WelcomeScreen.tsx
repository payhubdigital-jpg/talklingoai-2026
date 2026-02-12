import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
    onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-gradient-to-br from-[#FAF8F5] via-[#FFF5EB] to-[#FAF8F5] flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #FFB84D 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            {/* Subtle watercolor splatters (decorative) */}
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-orange-200/20 blur-3xl rounded-full -mr-32 pointer-events-none" />
            <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-orange-100/30 blur-3xl rounded-full -ml-32 pointer-events-none" />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center max-w-sm w-full"
            >
                {/* Owl Logo with speech bubble */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                    className="relative mb-8"
                >
                    <div className="w-64 h-64 flex items-center justify-center relative">
                        <img
                            src="/logo.png"
                            alt="ChatOLingo Mascot"
                            className="w-full h-full object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                // Fallback to emoji if image fails to load
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<div class="text-9xl grayscale opacity-20">🦉</div>';
                            }}
                        />
                    </div>
                </motion.div>

                {/* App Name */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mb-4 text-center"
                >
                    <h2 className="text-3xl font-black text-slate-700 mb-2">Bem-vindo</h2>
                    <h1 className="text-2xl font-black tracking-tight flex flex-wrap justify-center gap-1">
                        <span className="text-slate-700">ao </span>
                        <span className="text-[#FF6B35]">ChatOlingo AI</span>
                    </h1>
                </motion.div>

                {/* Tagline */}
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-center text-slate-500 text-sm font-medium mb-12 leading-relaxed"
                >
                    Tradução impulsionada por<br />
                    inteligência artificial
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="w-full space-y-4"
                >
                    <button
                        onClick={onGetStarted}
                        className="w-full py-4 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white font-bold text-lg rounded-full shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        Iniciar
                    </button>

                    <button
                        onClick={onGetStarted}
                        className="w-full py-4 bg-white text-orange-500 font-bold text-lg rounded-full border-2 border-orange-100 shadow-lg hover:border-orange-200 hover:bg-orange-50 active:scale-95 transition-all duration-300"
                    >
                        Login
                    </button>
                </motion.div>

                {/* OS-style home indicator placeholder (iOS look) */}
                <div className="mt-12 w-32 h-1 bg-slate-300/30 rounded-full mx-auto" />
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
