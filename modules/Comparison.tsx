
import React, { useMemo } from 'react';
import { Product, Currency } from '../types';

interface ComparisonProps {
  items: (Product & { storeName: string; storeColor: string; storeSlug: string })[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

const Comparison: React.FC<ComparisonProps> = ({ items, onClose, onRemove }) => {
  if (items.length === 0) return null;

  const minPrice = Math.min(...items.map(p => p.discountPrice || p.price));
  const maxPrice = Math.max(...items.map(p => p.discountPrice || p.price));
  
  // Check if categories are consistent
  const uniqueCategories = Array.from(new Set(items.map(p => p.category)));
  const isConsistent = uniqueCategories.length === 1;

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in" dir="rtl">
      <div className="bg-white w-full max-w-7xl max-h-[95vh] rounded-[4rem] shadow-2xl overflow-hidden flex flex-col border border-white/20">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-slate-900">میز تحلیل و مقایسه هوشمند ⚖️</h2>
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase">Premium Tool</span>
            </div>
            <p className="text-xs text-slate-400 font-bold mt-1">مقایسه قیمت رقبا و پیدا کردن بهترین حاشیه سود برای فروشنده و بهترین قیمت برای خریدار</p>
          </div>
          <div className="flex gap-3">
             {!isConsistent && (
               <div className="bg-amber-50 text-amber-600 px-5 py-3 rounded-2xl text-[10px] font-black border border-amber-100 flex items-center gap-2">
                 <span>⚠️ دسته‌بندی‌های متفاوت انتخاب شده است.</span>
               </div>
             )}
             <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm font-black">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map(item => {
              const currentPrice = item.discountPrice || item.price;
              const isCheapest = currentPrice === minPrice && items.length > 1;
              const isMostExpensive = currentPrice === maxPrice && items.length > 1;
              const priceDiff = currentPrice - minPrice;
              const priceDiffPercent = Math.round((priceDiff / minPrice) * 100);

              return (
                <div key={item.id} className={`relative flex flex-col bg-slate-50 rounded-[3.5rem] border-2 transition-all p-8 ${isCheapest ? 'border-green-500 bg-green-50/20' : 'border-transparent'}`}>
                  {isCheapest && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">کف قیمت بازار</div>
                  )}
                  
                  <button onClick={() => onRemove(item.id)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 font-black text-xl">×</button>

                  <div className="h-48 rounded-[2.5rem] overflow-hidden mb-8 shadow-xl">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  </div>

                  <div className="space-y-6 flex-1">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 line-clamp-2">{item.name}</h3>
                      <div className="inline-block px-4 py-1.5 bg-white rounded-xl text-[10px] font-black text-slate-400 border border-slate-100">{item.category}</div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-4 border-b border-slate-200/50">
                        <span className="text-[10px] font-black text-slate-400">تحلیل قیمت</span>
                        <div className="text-right">
                          <div className={`font-black text-lg ${isCheapest ? 'text-green-600' : 'text-slate-900'}`}>
                            {currentPrice.toLocaleString()} <span className="text-[10px] opacity-60">تومان</span>
                          </div>
                          {!isCheapest && priceDiff > 0 && (
                            <div className="text-[9px] font-black text-red-400 mt-1">%{priceDiffPercent} گران‌تر از کف بازار</div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-4 border-b border-slate-200/50">
                        <span className="text-[10px] font-black text-slate-400">امتیاز اعتبار</span>
                        <span className="font-black text-amber-500">⭐ {item.rating} <span className="text-[9px] text-slate-300">({item.reviewCount})</span></span>
                      </div>

                      <div className="flex justify-between items-center py-4 border-b border-slate-200/50">
                        <span className="text-[10px] font-black text-slate-400">فروشنده</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.storeColor }}></div>
                          <span className="text-xs font-black text-slate-700">{item.storeName}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-2xl border border-slate-100">
                         <div className="text-[9px] font-black text-slate-400 mb-2 uppercase">تحلیل استراتژیک</div>
                         <p className="text-[10px] font-bold text-slate-600 leading-relaxed">
                            {isCheapest ? 'این کالا در بهترین قیمت ممکن است. پتانسیل فروش بالا.' : 'جا برای اصلاح قیمت و رقابت با سایر فروشندگان وجود دارد.'}
                         </p>
                      </div>
                    </div>

                    <a 
                      href={`#/checkout/${item.storeSlug}/${item.id}`} 
                      className="block w-full py-5 bg-slate-900 text-white rounded-2xl text-center text-xs font-black hover:bg-indigo-600 transition-all shadow-xl"
                    >
                      مشاهده و خرید مستقیم
                    </a>
                  </div>
                </div>
              );
            })}
            
            {items.length < 4 && (
              <div className="hidden lg:flex flex-col items-center justify-center bg-slate-50/50 rounded-[3.5rem] border-2 border-dashed border-slate-200 p-12 text-center opacity-50">
                 <div className="text-5xl mb-6 text-indigo-200">⚖️</div>
                 <h4 className="font-black text-slate-400 mb-2">مقایسه هوشمند</h4>
                 <p className="text-xs font-bold text-slate-300 leading-relaxed">برای تحلیل دقیق‌تر بازار، <br/>کالاهای مشابه را اضافه کنید.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparison;
