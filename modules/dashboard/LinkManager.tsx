
import React, { useState } from 'react';
import { SalesLink, Product } from '../../types';
import { ApiService } from '../../services/apiService';

interface LinkManagerProps {
  activeLink: SalesLink;
  refreshData?: () => void;
}

const LinkManager: React.FC<LinkManagerProps> = ({ activeLink, refreshData }) => {
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [tempDiscountPrice, setTempDiscountPrice] = useState<string>('');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => alert('لینک مستقیم با موفقیت کپی شد!'));
  };

  const getBaseUrl = () => {
    const loc = window.location;
    return `${loc.protocol}//${loc.host}/#`;
  };

  const handleUpdateDiscount = async (p: Product) => {
    const stores = ApiService.getLocalStores();
    const store = stores.find(s => s.id === activeLink.id);
    if (store) {
      const product = store.products.find(item => item.id === p.id);
      if (product) {
        const newDiscount = parseFloat(tempDiscountPrice);
        product.discountPrice = isNaN(newDiscount) || newDiscount <= 0 ? undefined : newDiscount;
        ApiService.saveLocalStores(stores);
        if(refreshData) refreshData();
        setEditingDiscountId(null);
      }
    }
  };

  const calculateDiscountPercent = (p: Product) => {
    if (!p.discountPrice || p.discountPrice >= p.price) return 0;
    return Math.round(((p.price - p.discountPrice) / p.price) * 100);
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 space-y-10 animate-in fade-in duration-300">
      <div>
        <h3 className="text-2xl font-black text-slate-900">لینک‌های تبدیل مستقیم</h3>
        <p className="text-slate-500 font-bold text-sm mt-2">از این لینک‌ها در بیو اینستاگرام، استوری‌ها یا دایرکت برای فروش مستقیم یک محصول خاص استفاده کنید.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeLink.products.length === 0 ? (
          <div className="text-center py-20 text-slate-300 font-bold italic">ابتدا محصولاتی را اضافه کنید تا لینک‌های مستقیم آن‌ها در اینجا نمایش داده شود.</div>
        ) : activeLink.products.slice().reverse().map(p => {
          const directLink = `${getBaseUrl()}/checkout/${activeLink.slug}/${p.id}`;
          const discountPercent = calculateDiscountPercent(p);
          
          return (
            <div key={p.id} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6 group hover:bg-white hover:shadow-2xl transition-all">
                <img src={p.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform" alt="" />
                
                <div className="flex-1 text-center md:text-right">
                  <div className="font-black text-slate-900 text-lg">{p.name}</div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 justify-center md:justify-start">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{p.category}</span>
                      <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
                      <div className="flex items-center gap-2">
                         <span className="text-[11px] font-black text-indigo-600">{(p.discountPrice || p.price).toLocaleString()} {p.currency}</span>
                         {p.discountPrice && <span className="text-[9px] text-slate-300 line-through font-bold">{p.price.toLocaleString()}</span>}
                      </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto items-center md:items-end">
                    <div className="flex gap-2">
                        {/* Inline Discount Control also here */}
                        {editingDiscountId === p.id ? (
                          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-indigo-200">
                            <input 
                              type="number" 
                              autoFocus
                              value={tempDiscountPrice} 
                              onChange={e => setTempDiscountPrice(e.target.value)}
                              placeholder="قیمت جدید..."
                              className="w-24 px-2 py-1 text-[10px] font-black outline-none bg-slate-50 rounded-lg"
                            />
                            <button onClick={() => handleUpdateDiscount(p)} className="bg-indigo-600 text-white p-1 rounded-lg text-[10px]">✓</button>
                            <button onClick={() => setEditingDiscountId(null)} className="text-red-500 p-1 text-[10px]">×</button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setEditingDiscountId(p.id); setTempDiscountPrice(p.discountPrice?.toString() || ''); }}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black transition-all border ${discountPercent > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-slate-500 border-slate-200'}`}
                          >
                            {discountPercent > 0 ? `تخفیف ${discountPercent}٪` : 'تخفیف ۰٪'}
                          </button>
                        )}

                        <button onClick={() => handleCopy(directLink)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-indigo-100">کپی لینک خرید</button>
                    </div>
                    <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2 w-full max-w-[250px] group-hover:border-indigo-200 transition-all" dir="ltr">
                        <span className="flex-1 text-[9px] font-mono text-slate-400 truncate text-left">{directLink}</span>
                    </div>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LinkManager;
