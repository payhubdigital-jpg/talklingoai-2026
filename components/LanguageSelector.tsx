
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
      {/* Botão Detect Language (Fixo conforme pedido) */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl h-14 flex items-center justify-center transition-all hover:bg-white/10">
        <span className="text-white text-sm font-bold tracking-tight">
          {DETECT_LANGUAGE.name}
        </span>
      </div>

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
