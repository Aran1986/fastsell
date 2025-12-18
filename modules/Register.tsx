
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesLink } from '../types';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';

interface RegisterProps {
  onCreateLink: (data: { title: string; slug: string }) => void;
  existingLinks?: SalesLink[];
}

const Register: React.FC<RegisterProps> = ({ onCreateLink, existingLinks = [] }) => {
  const { t, dir } = useLanguage();
  const [shopName, setShopName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const navigate = useNavigate();

  const isRtl = dir === 'rtl';

  // پیشنهاد اسلاگ بر اساس نام فروشگاه
  useEffect(() => {
    if (shopName) {
      const suggestedSlug = shopName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setSlug(suggestedSlug);
    }
  }, [shopName]);

  // ولیدیشن اسلاگ
  useEffect(() => {
    if (!slug) {
      setSlugError('');
      return;
    }
    const isTaken = existingLinks.some(l => l.slug === slug);
    if (isTaken) {
      setSlugError(t('slugErrorTaken'));
    } else if (/[^a-z0-9-]/.test(slug)) {
      setSlugError(t('slugErrorFormat'));
    } else {
      setSlugError('');
    }
  }, [slug, existingLinks, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !slug || slugError) return;
    
    onCreateLink({ title: shopName, slug });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6" dir={dir}>
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200 animate-in zoom-in-95">
          <h2 className={`text-3xl font-black text-slate-900 mb-2 text-${isRtl ? 'right' : 'left'}`}>
            {t('registerTitle')}
          </h2>
          <p className={`text-slate-500 mb-8 text-${isRtl ? 'right' : 'left'} text-sm font-bold`}>
            {t('registerSub')}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`text-${isRtl ? 'right' : 'left'}`}>
              <label className="block text-sm font-black text-slate-700 mb-2 px-1">
                {t('shopNameLabel')}
              </label>
              <input 
                required
                type="text" 
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-${isRtl ? 'right' : 'left'} transition-all`} 
                placeholder={t('shopNamePlaceholder')}
              />
            </div>
            
            <div className={`text-${isRtl ? 'right' : 'left'}`}>
              <label className="block text-sm font-black text-slate-700 mb-2 px-1">
                {t('slugLabel')}
              </label>
              <div className="flex items-stretch h-14" dir="ltr">
                  <div className="bg-slate-50 px-4 flex items-center rounded-l-2xl text-slate-400 font-mono border border-r-0 border-slate-200 text-[10px] whitespace-nowrap">
                    fastsell.ir/s/
                  </div>
                  <input 
                    required
                    type="text" 
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    className={`flex-1 px-4 py-4 rounded-r-2xl border ${slugError ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'} focus:ring-2 focus:ring-indigo-100 outline-none font-mono text-left`} 
                    placeholder="shop-name"
                    dir="ltr"
                  />
              </div>
              {slugError ? (
                <p className={`text-[10px] text-red-500 mt-2 px-1 font-bold text-${isRtl ? 'right' : 'left'}`}>{slugError}</p>
              ) : (
                <p className={`text-[10px] text-slate-400 mt-2 px-1 font-bold text-${isRtl ? 'right' : 'left'}`}>{t('slugHint')}</p>
              )}
            </div>

            <button 
              type="submit"
              disabled={!!slugError || !shopName || !slug}
              className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-4 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('submitRegisterBtn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
