
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { AppUser, SalesLink, Product } from '../types';
import { ApiService } from '../services/apiService';

interface HeaderProps {
  onLogout?: () => void;
  user?: AppUser | null;
}

const Header: React.FC<HeaderProps> = ({ onLogout, user }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
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

  // لیست کامل لینک‌های ناوبری شامل ماژول‌های جدید
  const navLinks = [
    { to: "/marketplace", label: "ویترین 🚀" },
    { to: "/features", label: "قابلیت‌ها ✨" },
    { to: "/database", label: "دیتابیس 🗄️" },
    { to: "/tech-debts", label: "بدهی فنی 🛠️" },
    { to: "/roadmap", label: "نقشه راه 🗺️" },
    { to: "/transparency", label: "شفافیت 💎" }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        
        {/* سمت راست: لوگو و منوی موبایل */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>

          <Link to="/" className="flex items-center gap-2" dir="ltr">
            <Logo className="text-indigo-600" size={26} />
            <span className="text-xl tracking-tighter flex items-center">
              <span className="font-black text-slate-900">{t('fast')}</span>
              <span className="logo-t font-black text-indigo-500">{t('t')}</span>
              <span className="font-black text-slate-900">{t('sell')}</span>
            </span>
          </Link>
        </div>

        {/* بخش میانی: لینک‌های ناوبری (نمایش در دسکتاپ) */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 overflow-x-auto no-scrollbar py-2">
          {navLinks.map(link => (
            <Link 
              key={link.to} 
              to={link.to} 
              className="text-[10px] xl:text-[11px] font-black text-slate-500 hover:text-indigo-600 transition-colors whitespace-nowrap uppercase tracking-tight px-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* سمت چپ: جستجو و دکمه پنل */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex relative group w-40 xl:w-64">
            <input 
              type="text" 
              placeholder="جستجو..." 
              value={globalSearch}
              onFocus={() => setIsSearchOpen(true)}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-right" 
              dir="rtl"
            />
            {isSearchOpen && globalSearch.trim() && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsSearchOpen(false)}></div>
                <div className="absolute top-full right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-20 animate-in slide-in-from-top-2 w-72">
                   {searchResults.stores.length > 0 && <div className="p-3 bg-slate-50 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b">فروشگاه‌ها</div>}
                   {searchResults.stores.map(s => (
                     <button key={s.slug} onClick={() => { navigate(`/s/${s.slug}`); setIsSearchOpen(false); setGlobalSearch(''); }} className="w-full p-3 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-right group">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-[10px] shadow-sm" style={{ backgroundColor: s.themeColor }}>{s.title.charAt(0)}</div>
                        <div className="flex-1 min-w-0"><div className="text-[10px] font-black text-slate-800 truncate">{s.title}</div></div>
                     </button>
                   ))}
                   {searchResults.products.length > 0 && <div className="p-3 bg-slate-50 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-t">محصولات</div>}
                   {searchResults.products.map(p => (
                     <button key={p.id} onClick={() => { navigate(`/checkout/${p.storeSlug}/${p.id}`); setIsSearchOpen(false); setGlobalSearch(''); }} className="w-full p-3 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-right group">
                        <img src={p.image} className="w-8 h-8 rounded-lg object-cover shadow-sm" alt="" />
                        <div className="flex-1 min-w-0"><div className="text-[10px] font-black text-slate-800 truncate">{p.name}</div></div>
                     </button>
                   ))}
                </div>
              </>
            )}
          </div>
          
          <Link 
            to="/dashboard" 
            className="bg-indigo-600 text-white px-4 xl:px-6 py-2.5 rounded-xl text-[10px] xl:text-[11px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
          >
            {user ? 'پنل کاربری' : 'ورود / ثبت‌نام'}
          </Link>
        </div>
      </div>

      {/* منوی موبایل */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-72 bg-white z-[110] shadow-2xl p-8 animate-in slide-in-from-right duration-300 overflow-y-auto">
             <div className="flex justify-between items-center mb-10">
                <Logo size={32} className="text-indigo-600" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
             </div>
             <div className="space-y-3">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">منوی سیستم</div>
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
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 rounded-2xl bg-indigo-600 text-white text-center font-black text-sm shadow-xl shadow-indigo-100">ورود به داشبورد</Link>
             </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
