
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../constants/translations';
import { AppUser, AppNotification } from '../types';

interface HeaderProps {
  onLogout?: () => void;
  user?: AppUser | null;
}

const Header: React.FC<HeaderProps> = ({ onLogout, user }) => {
  const { language, setLanguage, t } = useLanguage();
  const [showNotifs, setShowNotifs] = useState(false);

  const langs = [
    { code: 'en', label: 'English' },
    { code: 'fa', label: 'فارسی' }
  ];

  const unreadCount = user?.notifications?.filter(n => !n.isRead).length || 0;

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
          <nav className="hidden lg:flex items-center gap-6 ml-6">
            <Link to="/marketplace" className="text-[11px] font-black text-slate-500 hover:text-indigo-600 transition-colors">
              ویترین عمومی 🚀
            </Link>
            <Link to="/pricing" className="text-[11px] font-black text-slate-500 hover:text-indigo-600 transition-colors">
              پلن‌های فروش 🏷️
            </Link>
            <Link to="/transparency" className="text-[11px] font-black text-indigo-500 hover:text-indigo-700 transition-colors">
              شفافیت مالی 💎
            </Link>
          </nav>
          
          <div className="h-4 w-px bg-slate-200 hidden md:block"></div>

          {user && (
            <div className="relative">
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifs && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-50 font-black text-xs text-slate-900">اعلان‌ها</div>
                  <div className="max-h-64 overflow-y-auto">
                    {(!user.notifications || user.notifications.length === 0) ? (
                      <div className="p-8 text-center text-[10px] font-bold text-slate-300 italic">اعلانی وجود ندارد</div>
                    ) : user.notifications.slice().reverse().map(n => (
                      <div key={n.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                         <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{n.text}</p>
                         <span className="text-[9px] text-slate-400 mt-2 block">{new Date(n.date).toLocaleTimeString('fa-IR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
