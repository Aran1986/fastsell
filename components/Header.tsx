
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { AppUser, SalesLink } from '../types';
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
    const matchedStores = stores.filter(s => s.title.toLowerCase().includes(term) || s.slug.includes(term));
    const matchedProducts: any[] = [];
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
    { to: "/marketplace", label: "ویترین" },
    { to: "/pricing", label: "قیمت‌ها" },
    { to: "/features", label: "قابلیت‌ها" },
    { to: "/database", label: "دیتابیس" },
    { to: "/tech-debts", label: "بدهی فنی" },
    { to: "/roadmap", label: "نقشه راه" },
    { to: "/transparency", label: "شفافیت" }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm w-full">
      <div className="max-w-[1400px] mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
        
        {/* Logo & Mobile Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
          <Link to="/" className="flex items-center gap-1.5" dir="ltr">
            <Logo className="text-indigo-600" size={24} />
            <span className="text-lg font-black tracking-tighter text-slate-900 hidden sm:inline-block">FASTSell</span>
          </Link>
        </div>

        {/* Desktop Navigation - Improved Flow */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-4 overflow-hidden">
          {navLinks.map(link => (
            <Link 
              key={link.to} 
              to={link.to} 
              className="text-[10px] xl:text-[11px] font-black text-slate-500 hover:text-indigo-600 transition-colors whitespace-nowrap px-2 py-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search & Profile */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex relative w-48 xl:w-64">
            <input 
              type="text" 
              placeholder="جستجو کالا یا فروشگاه..." 
              value={globalSearch}
              onFocus={() => setIsSearchOpen(true)}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-right" 
              dir="rtl"
            />
          </div>
          <Link 
            to="/dashboard" 
            className="bg-indigo-600 text-white px-4 py-2 sm:py-2.5 rounded-xl text-[10px] xl:text-[11px] font-black hover:bg-indigo-700 transition-all shadow-md whitespace-nowrap"
          >
            {user ? 'داشبورد' : 'ورود'}
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="absolute top-0 right-0 h-full w-64 bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center mb-8">
                <Logo size={28} className="text-indigo-600" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">✕</button>
             </div>
             <div className="space-y-1">
                {navLinks.map(link => (
                  <Link key={link.to} to={link.to} onClick={() => setIsMobileMenuOpen(false)} className="block p-3 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all">{link.label}</Link>
                ))}
                <div className="h-px bg-slate-100 my-4"></div>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block p-4 rounded-xl bg-indigo-600 text-white text-center font-black text-xs">ورود به داشبورد</Link>
             </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
