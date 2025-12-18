
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../constants/translations';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const langs = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'pt', label: 'Português' },
    { code: 'zh', label: '中文' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ja', label: '日本語' },
    { code: 'fa', label: 'فارسی' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" dir="ltr">
          <Logo className="text-indigo-600 drop-shadow-sm" size={28} />
          <span className="text-2xl tracking-tighter flex items-center">
            <span className="font-black text-slate-900">{t('fast')}</span>
            <span className="logo-t font-black text-indigo-500">{t('t')}</span>
            <span className="font-black text-slate-900">{t('sell')}</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <select 
            key={language}
            value={language} 
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="text-[11px] font-black bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 transition-all"
          >
            {langs.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          <Link to="/docs" className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors hidden sm:block">Docs</Link>
          <Link to="/admin" className="text-[10px] font-bold text-slate-300 hover:text-indigo-600 transition-colors uppercase tracking-widest hidden sm:block">Admin</Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <Link to="/dashboard" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            {t('dashboard')}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
