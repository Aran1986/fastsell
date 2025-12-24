
import React, { useMemo } from 'react';
import { SalesLink } from '../../types';
import { AnalyticsService } from '../../services/analyticsService';
import InventoryInsights from './InventoryInsights';

interface AnalyticsOverviewProps {
  activeLink: SalesLink;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ activeLink }) => {
  const orders = useMemo(() => activeLink.orders || [], [activeLink.orders]);
  const trafficStats = useMemo(() => AnalyticsService.getTrafficStats(orders), [orders]);
  const salesByDay = useMemo(() => AnalyticsService.getSalesByDay(orders), [orders]);

  const getSourceColor = (src: string) => {
    switch (src.toLowerCase()) {
      case 'instagram': return 'bg-pink-500';
      case 'telegram': return 'bg-sky-500';
      case 'google': return 'bg-amber-500';
      case 'twitter/x': return 'bg-slate-900';
      default: return 'bg-indigo-500';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="text-[10px] font-black text-slate-400 uppercase mb-2">کل فروش (تعداد)</div>
           <div className="text-4xl font-black text-slate-900">{orders.length} <span className="text-xs text-slate-300">سفارش</span></div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="text-[10px] font-black text-slate-400 uppercase mb-2">منبع برتر</div>
           <div className="text-4xl font-black text-indigo-600">{trafficStats[0]?.name || '---'}</div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <div className="text-[10px] font-black text-slate-400 uppercase mb-2">میانگین سبد خرید</div>
           <div className="text-2xl font-black text-slate-900">
             {orders.length > 0 ? Math.round(orders.reduce((acc, o) => acc + o.totalPaid, 0) / orders.length).toLocaleString() : 0}
             <span className="text-xs text-slate-300 mr-2 font-bold">تومان</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
           <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
              تحلیل منابع ورودی مشتریان
           </h3>
           <div className="space-y-6">
              {trafficStats.length === 0 ? (
                <div className="py-20 text-center text-slate-300 italic font-bold">دیتا کافی برای تحلیل وجود ندارد.</div>
              ) : trafficStats.map(stat => (
                <div key={stat.name} className="space-y-2">
                   <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-slate-700">{stat.name}</span>
                      <span className="text-xs font-black text-indigo-600">{stat.percentage}%</span>
                   </div>
                   <div className="h-4 bg-slate-50 rounded-full overflow-hidden flex">
                      <div 
                        className={`h-full ${getSourceColor(stat.name)} transition-all duration-1000`} 
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
           <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-green-500 rounded-full"></span>
              عملکرد فروش روزانه
           </h3>
           <div className="flex items-end justify-between h-48 gap-2">
              {salesByDay.length === 0 ? (
                 <div className="w-full text-center text-slate-300 italic font-bold self-center">تراکنشی یافت نشد.</div>
              ) : salesByDay.map(([day, amount]) => {
                const max = Math.max(...salesByDay.map(d => d[1]));
                const height = (amount / max) * 100;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-3 group relative">
                    <div className="w-full bg-green-50 rounded-t-xl relative overflow-hidden flex items-end" style={{ height: '100%' }}>
                       <div className="w-full bg-green-500 rounded-t-xl transition-all duration-1000" style={{ height: `${height}%` }}></div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 transform -rotate-45 mt-2">{day}</span>
                  </div>
                );
              })}
           </div>
        </div>
      </div>

      {/* New Modular Insight Component */}
      <InventoryInsights activeLink={activeLink} />
    </div>
  );
};

export default AnalyticsOverview;
