
import React from 'react';
import { SalesLink } from '../../types';

interface SellerPowerProps {
  activeLink: SalesLink;
}

const SellerPower: React.FC<SellerPowerProps> = ({ activeLink }) => {
  const reputation = activeLink.reputationPoints || 0;
  
  const levels = [
    { name: 'فروشنده نوپا', min: 0, icon: '🌱' },
    { name: 'فروشنده فعال', min: 200, icon: '⭐' },
    { name: 'فروشنده مورد اعتماد', min: 1000, icon: '🛡️' },
    { name: 'سوپر سلر (ویژه)', min: 5000, icon: '👑' }
  ];

  const currentLevel = [...levels].reverse().find(l => reputation >= l.min) || levels[0];
  const nextLevel = levels[levels.indexOf(currentLevel) + 1];
  const progress = nextLevel ? ((reputation - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="text-center md:text-right">
              <span className="inline-block bg-indigo-500 text-[10px] font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-[0.2em]">Reputation System</span>
              <h3 className="text-4xl font-black mb-4">قدرت فروشنده: {reputation.toLocaleString()} امتیاز</h3>
              <p className="text-indigo-200 font-bold max-w-md leading-relaxed">
                این امتیاز نشان‌دهنده اعتبار شما در پلتفرم است. هرچه امتیاز بالاتر باشد، محصولات شما در ویترین عمومی بالاتر نمایش داده می‌شوند.
              </p>
            </div>
            
            <div className="w-48 h-48 rounded-full border-[12px] border-white/5 flex flex-col items-center justify-center relative">
               <div className="text-6xl mb-2">{currentLevel.icon}</div>
               <div className="text-xs font-black">{currentLevel.name}</div>
               {/* Progress Circle simulation with CSS */}
               <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                  <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-indigo-400" strokeDasharray="527" strokeDashoffset={527 - (527 * progress / 100)} strokeLinecap="round" />
               </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
           <h4 className="text-xl font-black mb-8">چگونه امتیاز بیشتری بگیریم؟ 🚀</h4>
           <div className="space-y-6">
              {[
                { title: 'ثبت سفارش موفق', points: '+۵', desc: 'هر فروش موفق اعتبار شما را افزایش می‌دهد.' },
                { title: 'ارسال سریع کالا', points: '+۱۵', desc: 'تغییر وضعیت به "ارسال شده" در کمتر از ۲۴ ساعت.' },
                { title: 'رضایت خریدار', points: '+۱۰', desc: 'ثبت نظر ۵ ستاره توسط خریدار نهایی.' },
                { title: 'فعالیت مستمر', points: 'Boost', desc: 'بروزرسانی موجودی یا قیمت در ۲۴ ساعت اخیر.' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                   <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm">{item.points}</div>
                   <div>
                      <div className="text-sm font-black text-slate-800">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{item.desc}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
           <h4 className="text-xl font-black mb-6">مزایای اعتبار بالا 💎</h4>
           <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                نمایش در صدر نتایج ویترین عمومی
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                کاهش کارمزد فروش (به زودی)
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                نشان «فروشنده تایید شده» در صفحه محصول
              </li>
              <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                اولویت در توزیع سود استخر موسسین
              </li>
           </ul>
        </div>
      </div>
    </div>
  );
};

export default SellerPower;
