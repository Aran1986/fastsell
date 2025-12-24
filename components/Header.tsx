
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../constants/translations';
import { AppUser, SalesLink, Product } from '../types';
import { ApiService } from '../services/apiService';

interface HeaderProps {
  onLogout?: () => void;
  user?: AppUser | null;
}

const Header: React.FC<HeaderProps> = ({ onLogout, user }) => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [stores, setStores] = useState<SalesLink[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    ApiService.getAllStores().then(setStores);
  }, []);

  const searchResults = useMemo(() => {
    if (!globalSearch.trim()) return { stores: [], products: [] };
    const term = globalSearch.toLowerCase();
    
    const matchedStores = stores.filter(s => 
      s.title.toLowerCase().includes(term) || s.slug.includes(term)
    );

    const matchedProducts: (Product & { storeSlug: string, storeName: string })[] = [];
    stores.forEach(s => {
      s.products.forEach(p => {
        if (p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)) {
          matchedProducts.push({ ...p, storeSlug: s.slug, storeName: s.title });
        }
      });
    });

    return { stores: matchedStores.slice(0, 5), products: matchedProducts.slice(0, 5) };
  }, [globalSearch, stores]);

  const navLinks = [
    { to: "/marketplace", label: "ویترین 🚀" },
    { to: "/roadmap", label: "نقشه راه 🗺️" },
    { to: "/transparency", label: "شفافیت 💎" },
    { to: "/pricing", label: "پلن‌ها 🏷️" }
  ];

  const safeNotifications = Array.isArray(user?.notifications) ? user.notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.isRead).length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>

          <Link to="/" className="flex items-center gap-2" dir="ltr">
            <Logo className="text-indigo-600" size={28} />
            <span className="text-xl sm:text-2xl tracking-tighter flex items-center">
              <span className="font-black text-slate-900">{t('fast')}</span>
              <span className="logo-t font-black text-indigo-500">{t('t')}</span>
              <span className="font-black text-slate-900">{t('sell')}</span>
            </span>
          </Link>
        </div>

        {/* Global Search - Visible on Desktop & Tablet */}
        <div className="hidden sm:flex flex-1 max-w-sm mx-4 lg:mx-8 relative">
           <div className="w-full relative group">
              <input 
                type="text" 
                placeholder="جستجو در محصولات و فروشگاه‌ها..." 
                value={globalSearch}
                onFocus={() => setIsSearchOpen(true)}
                onChange={e => setGlobalSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-right" 
                dir="rtl"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           </div>
           
           {isSearchOpen && (globalSearch.trim()) && (
             <>
               <div className="fixed inset-0 z-10" onClick={() => setIsSearchOpen(false)}></div>
               <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-20 animate-in slide-in-from-top-2 w-[400px]">
                  {searchResults.stores.length > 0 && (
                    <div className="p-4 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">فروشگاه‌ها</div>
                  )}
                  {searchResults.stores.map(s => (
                    <button key={s.slug} onClick={() => { navigate(`/s/${s.slug}`); setIsSearchOpen(false); setGlobalSearch(''); }} className="w-full p-4 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-right group">
                       <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-sm" style={{ backgroundColor: s.themeColor }}>{s.title.charAt(0)}</div>
                       <div className="flex-1">
                          <div className="text-xs font-black text-slate-800 group-hover:text-indigo-600">{s.title}</div>
                          <div className="text-[9px] text-slate-400 font-mono" dir="ltr">/s/{s.slug}</div>
                       </div>
                    </button>
                  ))}

                  {searchResults.products.length > 0 && (
                    <div className="p-4 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 border-t">محصولات</div>
                  )}
                  {searchResults.products.map(p => (
                    <button key={p.id} onClick={() => { navigate(`/checkout/${p.storeSlug}/${p.id}`); setIsSearchOpen(false); setGlobalSearch(''); }} className="w-full p-4 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-right group">
                       <img src={p.image} className="w-10 h-10 rounded-xl object-cover shadow-sm" alt="" />
                       <div className="flex-1">
                          <div className="text-xs font-black text-slate-800 group-hover:text-indigo-600">{p.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold">{p.storeName}</div>
                       </div>
                       <div className="text-[10px] font-black text-indigo-600">{p.price.toLocaleString()} ت</div>
                    </button>
                  ))}

                  {searchResults.stores.length === 0 && searchResults.products.length === 0 && (
                    <div className="p-10 text-center text-xs font-bold text-slate-400 italic">نتیجه‌ای یافت نشد 🧐</div>
                  )}
               </div>
             </>
           )}
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <nav className="hidden lg:flex items-center gap-6 ml-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="text-[11px] font-black text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-tight">
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="h-4 w-px bg-slate-200 hidden md:block"></div>

          {user && (
            <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 text-slate-400 hover:text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">{unreadCount}</span>}
            </button>
          )}

          <Link to="/dashboard" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            {user ? 'پنل کاربری' : 'ورود / ثبت‌نام'}
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-[110] shadow-2xl p-8 animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center mb-12">
                <Logo size={32} className="text-indigo-600" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
             </div>
             
             <div className="space-y-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">منوی دسترسی سریع</div>
                {navLinks.map(link => (
                  <Link 
                    key={link.to} 
                    to={link.to} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block p-4 rounded-2xl bg-slate-50 text-sm font-black text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="h-px bg-slate-100 my-6"></div>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 rounded-2xl bg-indigo-600 text-white text-center font-black text-sm shadow-xl shadow-indigo-100">رفتن به داشبورد</Link>
             </div>

             <div className="absolute bottom-8 left-0 right-0 px-8">
                <select value={language} onChange={(e) => setLanguage(e.target.value as LanguageCode)} className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-black outline-none border border-slate-100">
                  <option value="fa">فارسی</option>
                  <option value="en">English</option>
                </select>
             </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
