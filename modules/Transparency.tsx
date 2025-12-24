
import React from 'react';
import Header from '../components/Header';
import { BUSINESS_RULES } from '../constants/businessRules';

const Transparency: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black text-slate-900 mb-6">شفافیت مالی و توزیع سود</h1>
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
             <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest">پاداش معرفی از فروش</p>
          </div>
        </div>

        {/* Detailed Founder Section */}
        <div className="bg-slate-900 text-white rounded-[4rem] p-12 mb-16 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
               <div className="flex-1">
                  <span className="inline-block bg-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-[0.2em]">Founder Program 2025</span>
                  <h2 className="text-5xl font-black mb-8 leading-tight">طرح فروشندگان موسس 💎</h2>
                  <p className="text-indigo-200 font-bold text-lg leading-relaxed mb-8">
                    اولین <span className="text-white border-b-2 border-indigo-400">{BUSINESS_RULES.FOUNDER_MAX_SELLERS.toLocaleString()} نفری</span> که در FASTSell فروشگاه خود را فعال کنند، به عنوان "شریک استراتژیک" شناخته شده و در سود خالص پلتفرم سهیم می‌شوند.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                       <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">۱</div>
                       <div>
                          <h4 className="font-black text-white">تعریف فروشنده فعال (Active)</h4>
                          <p className="text-xs text-slate-400 mt-1 font-bold">داشتن حداقل ۱ محصول موجود + ثبت حداقل ۱ تراکنش موفق در بازه ۳۰ روزه.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">۲</div>
                       <div>
                          <h4 className="font-black text-white">مدت زمان شراکت</h4>
                          <p className="text-xs text-slate-400 mt-1 font-bold">واریز سود به مدت {BUSINESS_RULES.FOUNDER_DURATION_YEARS} سال یا تا رسیدن پلتفرم به {BUSINESS_RULES.FOUNDER_TERMINATION_LIMIT.toLocaleString()} فروشنده.</p>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="w-full lg:w-[400px] bg-white/5 rounded-[3rem] p-8 border border-white/10 backdrop-blur-sm">
                  <h3 className="font-black text-indigo-400 mb-6 text-lg border-b border-white/5 pb-4">مثال عددی توزیع سود</h3>
                  <div className="space-y-6">
                     <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                        <span className="text-xs font-bold text-slate-400">سود خالص کل پلتفرم:</span>
                        <span className="font-black text-white text-lg">۱۰,۰۰۰,۰۰۰,۰۰۰ <span className="text-[10px] opacity-40">تومان</span></span>
                     </div>
                     <div className="flex justify-between items-center bg-indigo-600/20 p-4 rounded-2xl border border-indigo-500/30">
                        <span className="text-xs font-bold text-indigo-200">سهم استخر موسسین (۱۲٪):</span>
                        <span className="font-black text-indigo-300 text-lg">۱,۲۰۰,۰۰۰,۰۰۰ <span className="text-[10px] opacity-40">تومان</span></span>
                     </div>
                     <div className="p-4 space-y-3">
                        <p className="text-[10px] text-slate-400 leading-relaxed font-bold italic">
                           اگر شما در آن ماه ۱۰ امتیاز فعالیت کسب کرده باشید و مجموع امتیازات همه واجدین شرایط در آن ماه، ۵۰۰۰ امتیاز باشد:
                        </p>
                        <div className="bg-green-500/10 p-3 rounded-xl text-center">
                           <span className="text-sm font-black text-green-400">سهم شما: ۲,۴۰۰,۰۰۰ تومان واریز نقدی</span>
                        </div>
                     </div>
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
