
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SalesLink, AppUser } from '../types';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';

interface RegisterProps {
  onLogin: (email: string, referredBy?: string) => void;
  onCreateLink: (data: { title: string; slug: string }) => void;
  existingLinks: SalesLink[];
  user: AppUser | null;
}

const Register: React.FC<RegisterProps> = ({ onLogin, onCreateLink, existingLinks, user }) => {
  const { t, dir } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');

  // استخراج کد معرف از URL
  const queryParams = new URLSearchParams(location.search);
  const refCode = queryParams.get('ref');

  useEffect(() => {
    if (shopName) {
      const suggestedSlug = shopName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setSlug(suggestedSlug);
    }
  }, [shopName]);

  useEffect(() => {
    if (!slug) { setSlugError(''); return; }
    const isTaken = existingLinks.some(l => l.slug === slug);
    if (isTaken) setSlugError(t('slugErrorTaken'));
    else if (/[^a-z0-9-]/.test(slug)) setSlugError(t('slugErrorFormat'));
    else setSlugError('');
  }, [slug, existingLinks, t]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLogin(email, refCode || undefined);
  };

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !slug || slugError) return;
    onCreateLink({ title: shopName, slug });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6" dir={dir}>
        {!user ? (
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <h2 className="text-3xl font-black text-slate-900 mb-2">ورود به سیستم 🔐</h2>
            <p className="text-slate-500 mb-8 text-sm font-bold">برای مدیریت فروشگاه‌ها و مشاهده خریدهایتان وارد شوید.</p>
            
            {refCode && (
              <div className="mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-600 text-[10px] font-black flex items-center gap-2">
                <span>🤝</span> شما توسط کاربر با کد <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-lg">{refCode}</span> دعوت شده‌اید.
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="آدرس ایمیل خود را وارد کنید" className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 outline-none font-bold text-center" />
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all">ادامه مسیر</button>
            </form>
          </div>
        ) : (
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200 animate-in zoom-in-95">
             <div className="mb-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl mb-4">✨</div>
                <h2 className="text-2xl font-black text-slate-900">ساخت فروشگاه جدید</h2>
                <p className="text-slate-400 text-xs font-bold mt-1">{user.email}</p>
             </div>
             <form onSubmit={handleCreateShop} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 mr-2">نام فروشگاه</label>
                  <input required type="text" value={shopName} onChange={e => setShopName(e.target.value)} className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-bold" placeholder="نام برند شما" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 mr-2">آدرس اختصاصی (Slug)</label>
                  <input required type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase())} className="w-full px-6 py-4 rounded-2xl border border-slate-200 outline-none font-mono text-left" dir="ltr" />
                  {slugError && <p className="text-[10px] text-red-500 mt-2 font-bold">{slugError}</p>}
                </div>
                <button type="submit" disabled={!!slugError || !shopName} className="w-full py-5 bg-green-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-100 disabled:opacity-50">تایید و شروع فروش</button>
                <button type="button" onClick={() => navigate('/dashboard')} className="w-full text-slate-400 font-bold text-sm">رفتن به داشبورد فعلی</button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
