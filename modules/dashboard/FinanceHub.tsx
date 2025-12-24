
import React, { useMemo } from 'react';
import { SalesLink, AppUser } from '../../types';
import { FinanceService } from '../../services/financeService';
import { BUSINESS_RULES } from '../../constants/businessRules';

interface FinanceHubProps {
  activeLink: SalesLink;
  allUsers: AppUser[];
  allStores: SalesLink[];
  currentUser: AppUser;
}

const FinanceHub: React.FC<FinanceHubProps> = ({ activeLink, allUsers, allStores, currentUser }) => {
  const scoreData = useMemo(() => 
    FinanceService.calculateSellerScore(activeLink, allUsers, allStores),
  [activeLink, allUsers, allStores]);

  const isActive = useMemo(() => FinanceService.isSellerActive(activeLink), [activeLink]);

  const totalEarnings = useMemo(() => {
    return (activeLink.orders || []).reduce((acc, o) => acc + o.sellerNet, 0);
  }, [activeLink.orders]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet State */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900">کیف پول و درآمدهای شما</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">مدیریت موجودی و درخواست‌های تسویه حساب</p>
              </div>
              <div className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">موجودی فعال</div>
           </div>

           <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="text-center md:text-right">
                <div className="text-5xl font-black text-slate-900 mb-2">{totalEarnings.toLocaleString()} <span className="text-sm text-slate-400">تومان</span></div>
                <div className="text-xs font-bold text-slate-400">مجموع فروش خالص پس از کسر کمیسیون‌ها</div>
              </div>
              <div className="flex-1 w-full space-y-4">
                 <button 
                   disabled={totalEarnings < BUSINESS_RULES.MIN_WITHDRAWAL_AMOUNT}
                   className={`w-full py-5 rounded-[1.5rem] font-black text-lg shadow-xl transition-all ${totalEarnings >= BUSINESS_RULES.MIN_WITHDRAWAL_AMOUNT ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                 >
                   درخواست تسویه حساب
                 </button>
              </div>
           </div>
        </div>

        {/* Founder Activity Status */}
        <div className={`rounded-[2.5rem] p-10 border shadow-sm flex flex-col items-center justify-center text-center ${isActive ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-400 border-slate-200'}`}>
           <div className="text-4xl mb-6">{isActive ? '💎' : '⏳'}</div>
           <h4 className="font-black text-lg mb-2">وضعیت فروشنده موسس</h4>
           <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-6 ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
              {isActive ? 'فعال و واجد شرایط' : 'غیرفعال (بدون سهم)'}
           </div>
           <p className="text-[10px] font-bold opacity-70 leading-relaxed">
             {isActive ? `شما به عنوان یکی از ${BUSINESS_RULES.FOUNDER_MAX_SELLERS.toLocaleString()} فروشنده اول، در توزیع سود ۱۲ درصدی شرکت داده می‌شوید.` : 'برای فعال شدن سهم سود، حداقل یک محصول فعال یا یک فروش در ۳۰ روز اخیر داشته باشید.'}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
          {/* Scoring Detail */}
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm">
            <h4 className="text-xl font-black text-slate-900 mb-8">تحلیل امتیاز فعالیت (Score: {scoreData.total.toFixed(1)})</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black text-slate-400">
                      <span>محصولات فعال</span>
                      <span>{scoreData.breakdown.productPoints} / {BUSINESS_RULES.SCORE_MAX_PRODUCT_POINTS}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${(scoreData.breakdown.productPoints / BUSINESS_RULES.SCORE_MAX_PRODUCT_POINTS) * 100}%` }}></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black text-slate-400">
                      <span>حجم فروش</span>
                      <span>{scoreData.breakdown.salesPoints.toFixed(1)} امتیاز</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-full opacity-50"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black text-slate-400">
                      <span>معرفی فروشنده</span>
                      <span>{scoreData.breakdown.activeReferralPoints} امتیاز</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 w-full opacity-50"></div>
                  </div>
                </div>
            </div>
            <p className="mt-8 text-[10px] text-slate-400 font-bold leading-relaxed">
               نکته: امتیاز شما بر اساس فعالیت ۳۰ روز اخیر محاسبه می‌شود و سهم شما از استخر سود کل پلتفرم را تعیین می‌کند.
            </p>
          </div>
      </div>
    </div>
  );
};

export default FinanceHub;
