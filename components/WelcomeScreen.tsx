import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
    onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-gradient-to-br from-[#FAF8F5] via-[#FFF5EB] to-[#FAF8F5] flex flex-col items-center justify-center p-6">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #FFB84D 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex flex-col items-center max-w-md w-full"
            >
                {/* Owl Logo with speech bubble */}
                <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                    className="relative mb-8"
                >
                    <div className="w-40 h-40 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center relative">
                        <div className="text-8xl">🦉</div>
                        {/* Speech bubble tail */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45 shadow-lg" />
                    </div>
                </motion.div>

                {/* App Name */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mb-4"
                >
                    <h1 className="text-4xl font-black text-center tracking-tight">
                        <span className="text-[#FF6B35]">Chat</span>
                        <span className="text-[#FFB84D]">Olingo</span>
                        <span className="text-[#FF6B35]"> AI</span>
                    </h1>
                </motion.div>

                {/* Tagline */}
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-center text-slate-600 text-lg mb-12 leading-relaxed"
                >
                    Speak any language,<br />
                    understand each other.
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
                        className="w-full py-4 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white font-bold text-lg rounded-full shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        Get Started
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>

                    <button
                        onClick={onGetStarted}
                        className="w-full py-4 bg-white/50 backdrop-blur-sm text-slate-600 font-bold text-lg rounded-full border-2 border-orange-200 hover:border-orange-300 hover:bg-white/80 active:scale-95 transition-all duration-300"
                    >
                        Log In
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
