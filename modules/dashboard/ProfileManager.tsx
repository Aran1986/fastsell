
import React, { useState, useEffect } from 'react';
import { SalesLink, Currency } from '../../types';

interface ProfileManagerProps {
  activeLink: SalesLink;
  onUpdateProfile?: (linkId: string, data: { title: string; bio: string; defaultCurrency: Currency; categories: string[]; shippingFee: number }) => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ activeLink, onUpdateProfile }) => {
  const [title, setTitle] = useState(activeLink.title);
  const [bio, setBio] = useState(activeLink.bio);
  const [currency, setCurrency] = useState<Currency>(activeLink.defaultCurrency || Currency.USD);
  const [shippingFee, setShippingFee] = useState(activeLink.shippingFee || 0);
  const [cats, setCats] = useState<string[]>(activeLink.categories || ['عمومی']);
  const [newCat, setNewCat] = useState('');

  useEffect(() => {
    setTitle(activeLink.title);
    setBio(activeLink.bio);
    setCurrency(activeLink.defaultCurrency || Currency.USD);
    setShippingFee(activeLink.shippingFee || 0);
    setCats(activeLink.categories || ['عمومی']);
  }, [activeLink]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    if (cats.includes(newCat.trim())) return alert('این دسته‌بندی قبلاً اضافه شده است.');
    setCats([...cats, newCat.trim()]);
    setNewCat('');
  };

  const removeCategory = (catToRemove: string) => {
    if (cats.length <= 1) return alert('فروشگاه باید حداقل یک دسته‌بندی داشته باشد.');
    setCats(cats.filter(c => c !== catToRemove));
  };

  const handleSave = () => {
    onUpdateProfile?.(activeLink.id, { title, bio, defaultCurrency: currency, categories: cats, shippingFee });
    alert('تنظیمات فروشگاه با موفقیت ذخیره شد!');
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-slate-900">تنظیمات و هویت فروشگاه</h3>
        <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">ذخیره کلیه تغییرات</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="space-y-2 text-right">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">اطلاعات برند</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="نام فروشگاه" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black" />
            <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="توضیحات کوتاه درباره فروشگاه شما..." className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm resize-none" />
          </div>

          <div className="space-y-2 text-right">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">تنظیمات مالی پیش‌فرض</label>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <span className="text-[9px] font-bold text-slate-400 block mb-1">واحد پول</span>
                  <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-black text-xs">
                    <option value={Currency.IRR}>تومان (IRR)</option>
                    <option value={Currency.CRYPTO}>تتر (USDT)</option>
                  </select>
               </div>
               <div>
                  <span className="text-[9px] font-bold text-slate-400 block mb-1">هزینه ارسال</span>
                  <input type="number" value={shippingFee} onChange={e => setShippingFee(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-black text-xs" />
               </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <label className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">مدیریت دسته‌بندی‌های کالا</label>
            
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
               <input 
                 type="text" 
                 value={newCat} 
                 onChange={e => setNewCat(e.target.value)} 
                 placeholder="نام دسته‌بندی جدید..." 
                 className="flex-1 px-5 py-3 rounded-xl border border-slate-200 outline-none text-xs font-bold"
               />
               <button type="submit" className="bg-indigo-600 text-white px-6 rounded-xl font-black text-xs">+</button>
            </form>

            <div className="flex flex-wrap gap-2">
               {cats.map(c => (
                 <div key={c} className="bg-white border border-slate-200 pl-2 pr-4 py-2 rounded-xl flex items-center gap-3 shadow-sm group">
                    <span className="text-xs font-black text-slate-700">{c}</span>
                    <button onClick={() => removeCategory(c)} className="text-red-400 hover:text-red-600 font-black text-sm">×</button>
                 </div>
               ))}
            </div>
            <p className="text-[9px] text-slate-400 mt-6 leading-relaxed">
              * این دسته‌بندی‌ها هنگام ثبت محصول جدید در منوی کشویی به شما نمایش داده می‌شوند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;
