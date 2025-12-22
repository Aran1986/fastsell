
import React from 'react';
import Header from '../components/Header';
import { BUSINESS_RULES } from '../constants/businessRules';

const Transparency: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 mb-6">شفافیت مالی و توزیع سود</h1>
          <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">
            ما معتقدیم پلتفرم بدون فروشندگانش هیچ هویتی ندارد. به همین دلیل بخشی از سود کل پلتفرم را با شما تقسیم می‌کنیم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
             <div className="text-4xl mb-4">🔗</div>
             <h3 className="font-black text-slate-900 mb-2">لینک مستقیم</h3>
             <div className="text-3xl font-black text-indigo-600">٪{(BUSINESS_RULES.COMMISSION_DIRECT * 100)}</div>
             <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">کمیسیون پلتفرم</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
             <div className="text-4xl mb-4">🛒</div>
             <h3 className="font-black text-slate-900 mb-2">ویترین عمومی</h3>
             <div className="text-3xl font-black text-indigo-600">٪{(BUSINESS_RULES.COMMISSION_MARKETPLACE * 100)}</div>
             <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">کمیسیون پلتفرم</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
             <div className="text-4xl mb-4">🤝</div>
             <h3 className="font-black text-slate-900 mb-2">معرف (Affiliate)</h3>
             <div className="text-3xl font-black text-green-600">٪{(BUSINESS_RULES.AFFILIATE_REWARD_RATE * 100)}</div>
             <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">پاداش معرف از فروش</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-[3.5rem] p-12 mb-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-8">طرح ویژه فروشندگان موسس (Founders) 💎</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <p className="text-indigo-200 font-bold text-lg leading-relaxed">
                    ما <span className="text-white bg-indigo-600 px-2 py-1 rounded-lg">{(BUSINESS_RULES.FOUNDER_PROFIT_POOL_PERCENT * 100)}٪ از کل سود پلتفرم</span> را ماهانه بین <span className="text-white border-b-2 border-indigo-500 font-black">{BUSINESS_RULES.FOUNDER_MAX_SELLERS.toLocaleString()} فروشنده اولی</span> که به ما بپیوندند، تقسیم می‌کنیم.
                  </p>
                  
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                     <h4 className="font-black text-indigo-400 text-sm">اعتبار و انقضای طرح:</h4>
                     <p className="text-xs text-slate-300 font-bold leading-relaxed">
                        این پاداش ویژه تا زمان وقوع یکی از دو شرط زیر پابرجا خواهد بود:
                     </p>
                     <ul className="text-xs space-y-2 text-slate-400">
                        <li className="flex items-center gap-2">
                           <span className="text-indigo-500">●</span> گذشت <span className="text-white font-black">{BUSINESS_RULES.FOUNDER_DURATION_YEARS} سال</span> از زمان راه‌اندازی.
                        </li>
                        <li className="flex items-center gap-2">
                           <span className="text-indigo-500">●</span> رسیدن تعداد کل فروشندگان پلتفرم به <span className="text-white font-black">{BUSINESS_RULES.FOUNDER_TERMINATION_LIMIT.toLocaleString()} نفر</span>.
                        </li>
                     </ul>
                  </div>

                  <ul className="space-y-4 pt-4">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="font-bold">توزیع عادلانه بر اساس امتیاز (Score) ماهانه</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="font-bold">سقف ۵٪ سهم برای هر نفر جهت جلوگیری از انحصار</span>
                    </li>
                  </ul>
               </div>
               <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                  <h4 className="font-black text-indigo-400 mb-6 border-b border-white/5 pb-4">فرمول محاسبه امتیاز (Score)</h4>
                  <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">هر محصول فعال (تا سقف ۵)</span>
                        <span className="font-black text-indigo-300">+{BUSINESS_RULES.SCORE_PER_PRODUCT} امتیاز</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">هر ۱ میلیون تومان فروش</span>
                        <span className="font-black text-indigo-300">+{BUSINESS_RULES.SCORE_PER_MILLION_SALES} امتیاز</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-bold">هر زیرمجموعه (فروشنده) فعال</span>
                        <span className="font-black text-indigo-300">+{BUSINESS_RULES.SCORE_PER_ACTIVE_REFERRAL} امتیاز</span>
                     </div>
                     <div className="h-px bg-white/10 my-2"></div>
                     <p className="text-[10px] text-slate-400 leading-relaxed italic">
                        مثال: اگر شما ۳ محصول فعال داشته باشید و ۱۰ میلیون تومان بفروشید و ۲ فروشنده فعال معرفی کنید، امتیاز شما در آن ماه برابر با (۳ + ۱۰ + ۶) = ۱۹ امتیاز خواهد بود.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-sm">
           <h2 className="text-3xl font-black mb-8">قوانین تسویه حساب (Payout) 💰</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                 <h4 className="font-black text-slate-900 text-xl">روزهای واریز</h4>
                 <div className="flex gap-4">
                    {BUSINESS_RULES.PAYOUT_DAYS.map(day => (
                      <div key={day} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black">{day === 'Saturday' ? 'شنبه‌ها' : 'سه‌شنبه‌ها'}</div>
                    ))}
                 </div>
                 <p className="text-slate-400 text-sm font-bold">واریزها در این روزها به صورت خودکار به شماره شبای ثبت شده در پنل بانکی شما انجام می‌شود.</p>
              </div>
              <div className="space-y-4">
                 <h4 className="font-black text-slate-900 text-xl">حداقل برداشت</h4>
                 <div className="text-4xl font-black text-slate-800">{BUSINESS_RULES.MIN_WITHDRAWAL_AMOUNT.toLocaleString()} <span className="text-sm text-slate-400">تومان</span></div>
                 <p className="text-slate-400 text-sm font-bold">مبالغ کمتر از این مقدار تا رسیدن به سقف، در کیف پول شما محفوظ می‌ماند و در سیکل بعدی واریز خواهد شد.</p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Transparency;
