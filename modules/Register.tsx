
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesLink } from '../types';

interface RegisterProps {
  onCreateLink: (data: { title: string; slug: string }) => void;
  existingLinks?: SalesLink[]; // اضافه شده برای چک کردن یونیک بودن اسلاگ
}

const Register: React.FC<RegisterProps> = ({ onCreateLink, existingLinks = [] }) => {
  const [shopName, setShopName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const navigate = useNavigate();

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
      setSlugError('این آدرس قبلاً توسط شخص دیگری انتخاب شده است.');
    } else if (/[^a-z0-9-]/.test(slug)) {
      setSlugError('فقط حروف کوچک انگلیسی، اعداد و خط تیره مجاز است.');
    } else {
      setSlugError('');
    }
  }, [slug, existingLinks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !slug || slugError) return;
    
    onCreateLink({ title: shopName, slug });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-200">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-right">خوش آمدید! ✨</h2>
        <p className="text-slate-500 mb-8 text-right text-sm">اطلاعات فروشگاه خود را وارد کنید تا لینک اختصاصی شما آماده شود.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-right">
            <label className="block text-sm font-bold text-slate-700 mb-2 mr-1">نام فروشگاه یا برند</label>
            <input 
              required
              type="text" 
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-right font-bold" 
              placeholder="مثلاً: گالری رز"
            />
          </div>
          
          <div className="text-right">
            <label className="block text-sm font-bold text-slate-700 mb-2 mr-1">آدرس لینک اختصاصی (Slug)</label>
            <div className="flex items-stretch h-14" dir="ltr">
                <div className="bg-slate-100 px-4 flex items-center rounded-l-2xl text-slate-400 font-mono border border-r-0 border-slate-200 text-[10px] whitespace-nowrap">
                  fastsell.ir/s/
                </div>
                <input 
                  required
                  type="text" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  className={`flex-1 px-4 py-4 rounded-r-2xl border ${slugError ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'} focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-left`} 
                  placeholder="shop-name"
                  dir="ltr"
                />
            </div>
            {slugError ? (
              <p className="text-[10px] text-red-500 mt-2 mr-1 font-bold">{slugError}</p>
            ) : (
              <p className="text-[10px] text-slate-400 mt-2 mr-1">فقط از حروف انگلیسی، اعداد و خط تیره استفاده کنید.</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={!!slugError || !shopName || !slug}
            className="w-full py-5 bg-indigo-600 text-white font-black text-lg rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 mt-4 active:scale-95 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            تایید و ساخت فروشگاه
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;