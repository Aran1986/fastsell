
import React from 'react';
import { SalesLink } from '../../types';

interface InventoryInsightsProps {
  activeLink: SalesLink;
}

const InventoryInsights: React.FC<InventoryInsightsProps> = ({ activeLink }) => {
  const products = activeLink.products || [];
  
  // مرتب‌سازی بر اساس محبوبیت (بازدید یا درخواست موجودی)
  const insights = [...products].sort((a, b) => {
    const scoreA = (a.viewCount || 0) + (a.notifyMeCount || 0) * 5;
    const scoreB = (b.viewCount || 0) + (b.notifyMeCount || 0) * 5;
    return scoreB - scoreA;
  });

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm animate-in fade-in duration-700">
      <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
        <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
        پایش محبوبیت و تقاضای کالاها
      </h3>
      
      <div className="space-y-4">
        {insights.map(p => (
          <div key={p.id} className="flex items-center gap-4 p-5 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-all">
             <img src={p.image} className="w-14 h-14 rounded-2xl object-cover" alt="" />
             <div className="flex-1">
                <div className="font-black text-slate-800 text-sm">{p.name}</div>
                <div className="flex items-center gap-3 mt-1">
                   <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black text-indigo-600">{(p.discountPrice || p.price).toLocaleString()}</span>
                      {p.discountPrice && <span className="text-[9px] text-slate-300 line-through font-bold">{p.price.toLocaleString()}</span>}
                   </div>
                   <div className="h-1 w-1 bg-slate-200 rounded-full"></div>
                   <span className="text-[10px] font-bold text-slate-400">👁️ {p.viewCount || 0} بازدید</span>
                   {p.stock <= 0 && (
                     <span className="text-[10px] font-black text-orange-500">🔔 {p.notifyMeCount || 0} درخواست شارژ مجدد</span>
                   )}
                </div>
             </div>
             <div className="text-left">
                {p.stock > 0 ? (
                   <span className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full">موجود: {p.stock}</span>
                ) : (
                   <span className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-full">اتمام موجودی</span>
                )}
             </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
         <p className="text-[10px] font-bold text-indigo-700 leading-relaxed">
           💡 تحلیل هوشمند: کالاهایی که «درخواست شارژ مجدد» بالایی دارند، اولویت اصلی شما برای تامین انبار هستند. بازدید بالا بدون خرید نشان‌دهنده نیاز به اصلاح قیمت یا توضیحات محصول است.
         </p>
      </div>
    </div>
  );
};

export default InventoryInsights;
