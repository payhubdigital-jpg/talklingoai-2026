
import React from 'react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES, DETECT_LANGUAGE } from '../constants';

interface LanguageSelectorProps {
  sourceLang: Language;
  targetLang: Language;
  onSourceChange: (lang: Language) => void;
  onTargetChange: (lang: Language) => void;
  onSwap: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 w-full max-w-md mx-auto">
      {/* Botão Source Language Selector (Includes Detect Language) */}
      <div className="flex-1 relative group">
        <select
          value={sourceLang.code}
          onChange={(e) => {
            if (e.target.value === 'auto') {
              onSourceChange(DETECT_LANGUAGE);
            } else {
              onSourceChange(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value)!);
            }
          }}
          className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl px-6 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer hover:bg-white/10"
        >
          <option value="auto" className="bg-slate-900">{DETECT_LANGUAGE.name}</option>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-slate-900">
              {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </div>

      {/* Botão Swap (Opcional, mas útil se o usuário quiser inverter) */}
      <button
        onClick={onSwap}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 16-4-4 4-4" /><path d="m17 8 4 4-4 4" /><path d="M3 12h18" /></svg>
      </button>

      {/* Botão Target Language Selector */}
      <div className="flex-1 relative group">
        <select
          value={targetLang.code}
          onChange={(e) => onTargetChange(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value)!)}
          className="w-full h-14 bg-white/5 border border-white/10 text-white rounded-2xl px-6 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer hover:bg-white/10"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-slate-900">
              {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
