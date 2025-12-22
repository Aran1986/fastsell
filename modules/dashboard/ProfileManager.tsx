
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
  const [cats, setCats] = useState<string[]>(activeLink.categories || []);

  useEffect(() => {
    setTitle(activeLink.title);
    setBio(activeLink.bio);
    setCurrency(activeLink.defaultCurrency || Currency.USD);
    setShippingFee(activeLink.shippingFee || 0);
    setCats(activeLink.categories || []);
  }, [activeLink]);

  const handleSave = () => {
    onUpdateProfile?.(activeLink.id, { title, bio, defaultCurrency: currency, categories: cats, shippingFee });
    alert('تنظیمات فروشگاه با موفقیت ذخیره شد!');
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 space-y-10 animate-in fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-slate-900">هویت فروشگاه</h3>
        <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg">ذخیره تغییرات</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2 text-right">
            <label className="block text-[10px] font-black text-slate-400 uppercase">نام برند</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black" />
          </div>
          <div className="space-y-2 text-right">
            <label className="block text-[10px] font-black text-slate-400 uppercase">بایوگرافی کوتاه</label>
            <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm resize-none" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 text-right">
            <label className="block text-[10px] font-black text-slate-400 uppercase">هزینه ثابت ارسال (Shipping Fee)</label>
            <input type="number" value={shippingFee} onChange={e => setShippingFee(Number(e.target.value))} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black" />
            <p className="text-[9px] text-slate-400 mt-1">این مبلغ به طور خودکار به قیمت محصول در سبد خرید مشتری اضافه می‌شود.</p>
          </div>
          <div className="space-y-2 text-right">
            <label className="block text-[10px] font-black text-slate-400 uppercase">واحد پول پیش‌فرض</label>
            <select value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black">
              <option value={Currency.IRR}>تومان</option>
              <option value={Currency.CRYPTO}>تتر (USDT)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;
