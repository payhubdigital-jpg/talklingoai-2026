
import React from 'react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900 rounded-2xl shadow-lg border border-slate-800">
      <div className="flex-1 w-full">
        <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block px-1 tracking-wider">Eu falo</label>
        <select
          value={sourceLang.code}
          onChange={(e) => onSourceChange(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value)!)}
          className="w-full p-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-slate-900">
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onSwap}
        className="mt-4 sm:mt-5 p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-orange-500 transition-all shadow-md active:scale-95"
        title="Inverter idiomas"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4-4 4-4"/><path d="M3 17h18"/><path d="m17 3 4 4-4 4"/><path d="M21 7H3"/></svg>
      </button>

      <div className="flex-1 w-full">
        <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block px-1 tracking-wider">Traduzir para</label>
        <select
          value={targetLang.code}
          onChange={(e) => onTargetChange(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value)!)}
          className="w-full p-3 bg-slate-950 border border-slate-800 text-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-slate-900">
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector;
