
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
    <div className="flex items-center justify-between gap-3 w-full max-w-md mx-auto relative z-10">
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
          className="w-full h-14 bg-white border border-orange-200 text-slate-700 rounded-2xl px-6 font-bold text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all appearance-none cursor-pointer hover:bg-orange-50 shadow-sm"
        >
          <option value="auto" className="bg-white text-slate-700">{DETECT_LANGUAGE.name}</option>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-white text-slate-700">
              {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </div>

      {/* Botão Swap */}
      <button
        onClick={onSwap}
        className="w-10 h-10 rounded-full bg-white border border-orange-200 flex items-center justify-center text-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-95 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 16-4-4 4-4" /><path d="m17 8 4 4-4 4" /><path d="M3 12h18" /></svg>
      </button>

      {/* Botão Target Language Selector */}
      <div className="flex-1 relative group">
        <select
          value={targetLang.code}
          onChange={(e) => onTargetChange(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value)!)}
          className="w-full h-14 bg-white border border-orange-200 text-slate-700 rounded-2xl px-6 font-bold text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all appearance-none cursor-pointer hover:bg-orange-50 shadow-sm"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-white text-slate-700">
              {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-orange-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
