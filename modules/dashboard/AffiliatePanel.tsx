
import React, { useMemo } from 'react';
import { AppUser, SalesLink } from '../../types';
import { FinanceService } from '../../services/financeService';

interface AffiliatePanelProps {
  currentUser: AppUser;
  allStores: SalesLink[];
}

const AffiliatePanel: React.FC<AffiliatePanelProps> = ({ currentUser, allStores }) => {
  const stats = useMemo(() => 
    FinanceService.getAffiliateStats(allStores, currentUser.referralCode), 
  [allStores, currentUser.referralCode]);

  const getReferralLink = () => {
    const baseUrl = window.location.href.split('#')[0];
    return `${baseUrl}#/register?ref=${currentUser.referralCode}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getReferralLink()).then(() => alert('لینک دعوت شما کپی شد!'));
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-20 -mt-20 rounded-full"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-4">همکاری در فروش (Affiliate) 🤝</h3>
          <p className="text-indigo-100 font-bold max-w-xl leading-relaxed mb-10">
            با معرفی FASTSell به دوستان خود، در سود فروش آن‌ها شریک شوید! 
            شما <span className="bg-white/20 px-2 py-0.5 rounded-lg text-white">0.1٪ از کل مبلغ فروش</span> هر محصولی که توسط زیرمجموعه‌های شما فروخته شود را به عنوان پاداش دریافت می‌کنید.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/20">
               <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">درآمد کل از زیرمجموعه‌ها</div>
               <div className="text-4xl font-black">{stats.totalEarning.toLocaleString()} <span className="text-sm opacity-60">تومان/واحد</span></div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/20">
               <div className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">تعداد فروش‌های معرفی شده</div>
               <div className="text-4xl font-black">{stats.referredSalesCount} <span className="text-sm opacity-60">تراکنش</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
        <h4 className="text-xl font-black text-slate-900 mb-6">لینک دعوت اختصاصی شما</h4>
        <div className="flex flex-col md:flex-row items-center gap-4">
           <div className="flex-1 w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-mono text-sm text-slate-500 overflow-hidden truncate" dir="ltr">
             {getReferralLink()}
           </div>
           <button onClick={handleCopy} className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl">کپی لینک و دعوت</button>
        </div>
        <div className="mt-8 p-6 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-4">
           <div className="text-2xl">💡</div>
           <p className="text-xs text-orange-700 font-bold leading-relaxed">
             کافیست این لینک را برای دوستان خود بفرستید. هر فروشگاهی که با این لینک ساخته شود، تا همیشه پاداش فروش محصولاتش به کیف پول شما واریز خواهد شد.
           </p>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePanel;
