
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../constants/translations';
import { AppUser } from '../types';

interface HeaderProps {
  onLogout?: () => void;
  user?: AppUser | null;
}

const Header: React.FC<HeaderProps> = ({ onLogout, user }) => {
  const { language, setLanguage, t } = useLanguage();

  const langs = [
    { code: 'en', label: 'English' },
    { code: 'fa', label: 'فارسی' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" dir="ltr">
          <Logo className="text-indigo-600 drop-shadow-sm" size={28} />
          <span className="text-2xl tracking-tighter flex items-center">
            <span className="font-black text-slate-900">{t('fast')}</span>
            <span className="logo-t font-black text-indigo-50">{t('t')}</span>
            <span className="font-black text-slate-900">{t('sell')}</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/transparency" className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 transition-colors hidden sm:block">
            شفافیت مالی 💎
          </Link>
          <Link to="/marketplace" className="text-xs font-black text-slate-700 hover:text-indigo-600 transition-colors hidden md:block">
            ویترین عمومی ✨
          </Link>
          
          <div className="h-4 w-px bg-slate-200 hidden md:block"></div>

          {user && (
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-400 uppercase">{user.email}</span>
              <button onClick={onLogout} className="text-[9px] font-black text-red-400 hover:text-red-600">خروج</button>
            </div>
          )}

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
          <Link to="/dashboard" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            {t('dashboard')}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
