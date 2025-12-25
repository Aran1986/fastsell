
import React, { useState, useMemo } from 'react';
import { SalesLink, Product } from '../../types';

interface PromotionManagerProps {
  activeLink: SalesLink;
}

interface ActiveBoost {
  id: string;
  productName: string;
  packageName: string;
  expiryDate: string;
  viewsGenerated: number;
  clicksGenerated: number;
  status: 'active' | 'expired';
}

const PromotionManager: React.FC<PromotionManagerProps> = ({ activeLink }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [isBoosting, setIsBoosting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const packages = [
    { id: 'silver', name: 'بوست نقره‌ای (۳ روزه)', price: 99000, desc: 'نمایش در نتایج اول جستجوی دسته‌بندی مرتبط', icon: '🥈' },
    { id: 'gold', name: 'بوست طلایی (۷ روزه)', price: 199000, desc: 'نمایش در صدر ویترین عمومی (Marketplace) و پیشنهاد هوشمند', icon: '🥇' },
    { id: 'diamond', name: 'بوست الماس (۱۴ روزه)', price: 499000, desc: 'ویژه شدن کالا در صفحه اصلی پلتفرم و ارسال پیامک سراسری', icon: '💎' },
  ];

  const activeBoosts: ActiveBoost[] = [
    { id: 'b1', productName: 'هندزفری سونی XM5', packageName: 'بوست طلایی', expiryDate: '۱۴۰۲/۱۱/۲۵', viewsGenerated: 1250, clicksGenerated: 45, status: 'active' }
  ];

  const handleBoost = () => {
    if (!selectedProductId || !selectedPackageId) return alert('لطفاً محصول و پلن تبلیغاتی را انتخاب کنید.');
    setIsBoosting(true);
    setTimeout(() => {
      alert('درخواست تبلیغات شما ثبت شد و پس از تایید مالی فعال خواهد شد. 🚀');
      setIsBoosting(false);
      setSelectedProductId('');
      setSelectedPackageId('');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right" dir="rtl">
      {/* Header Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm w-fit">
        <button 
          onClick={() => setShowHistory(false)} 
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${!showHistory ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          پروموت کالا 🚀
        </button>
        <button 
          onClick={() => setShowHistory(true)} 
          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${showHistory ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          گزارش تبلیغات 📊
        </button>
      </div>

      {!showHistory ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Promotion Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
              <h3 className="text-2xl font-black text-slate-900">ایجاد کمپین پروموشن</h3>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">۱. انتخاب محصول برای تبلیغ</label>
                <select 
                  value={selectedProductId} 
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black text-sm focus:ring-2 focus:ring-indigo-100 transition-all"
                >
                  <option value="">انتخاب از لیست محصولات شما...</option>
                  {activeLink.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">۲. انتخاب پلن نمایش</label>
                <div className="grid grid-cols-1 gap-4">
                  {packages.map(pkg => (
                    <button 
                      key={pkg.id} 
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-6 rounded-[2rem] border-2 text-right transition-all flex items-center justify-between group ${selectedPackageId === pkg.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-indigo-200 bg-white'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">{pkg.icon}</div>
                        <div>
                          <div className="font-black text-slate-900 text-sm">{pkg.name}</div>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">{pkg.desc}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-black text-indigo-600">{pkg.price.toLocaleString()} ت</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleBoost}
                disabled={isBoosting}
                className={`w-full py-6 rounded-[2.5rem] font-black text-xl shadow-2xl transition-all ${isBoosting ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-100'}`}
              >
                {isBoosting ? 'در حال اتصال به درگاه...' : 'تایید و پرداخت هزینه‌ی تبلیغ'}
              </button>
            </div>
          </div>

          {/* Sidebar Info - Updated to Clickable Modal Link */}
          <div className="space-y-6">
            <div className="bg-indigo-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-16 -mt-16"></div>
               <h4 className="font-black text-lg mb-4">چرا تبلیغات پولی؟ 📈</h4>
               <ul className="space-y-4">
                 {[
                   'تا ۵ برابر بازدید بیشتر برای کالا',
                   'نمایش در صدر نتایج جستجوی سراسری',
                   'افزایش سریع اعتبار (Trust Score) فروشنده',
                   'نمایش در ویترین صفحه اول پلتفرم'
                 ].map((text, i) => (
                   <li key={i} className="flex items-start gap-3 text-[10px] font-bold text-indigo-200">
                     <span className="text-indigo-400">✓</span>
                     {text}
                   </li>
                 ))}
               </ul>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col items-center text-center">
               <span className="text-2xl mb-2">⚖️</span>
               <h4 className="text-sm font-black text-slate-900 mb-4">شفافیت و قوانین تبلیغات</h4>
               <button 
                 onClick={() => setShowTermsModal(true)}
                 className="w-full py-3 bg-slate-50 text-indigo-600 rounded-xl text-[10px] font-black hover:bg-indigo-50 transition-all border border-indigo-100"
               >
                 این نکات را حتماً مطالعه کنید
               </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
             <h3 className="text-xl font-black">تاریخچه و عملکرد تبلیغات</h3>
             <span className="text-[10px] font-black text-slate-400">نمایش گزارشات زنده</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase">
                <tr>
                  <th className="p-6">محصول تبلیغ شده</th>
                  <th className="p-6">نوع پلن</th>
                  <th className="p-6">انقضا</th>
                  <th className="p-6">بازدید (Reach)</th>
                  <th className="p-6">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeBoosts.map(boost => (
                  <tr key={boost.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="p-6 font-black text-sm text-slate-800">{boost.productName}</td>
                    <td className="p-6 text-[10px] font-black text-indigo-600">{boost.packageName}</td>
                    <td className="p-6 text-[10px] font-bold text-slate-500">{boost.expiryDate}</td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">{boost.viewsGenerated.toLocaleString()}</span>
                        <span className="text-[8px] font-bold text-slate-400">{boost.clicksGenerated} کلیک مستقیم</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black ${boost.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        {boost.status === 'active' ? 'در حال نمایش' : 'پایان یافته'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Transparency Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white rounded-[4rem] p-10 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative text-right" dir="rtl">
              <button onClick={() => setShowTermsModal(false)} className="absolute top-6 left-6 text-slate-300 hover:text-red-500 font-black text-2xl">×</button>
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">📜</div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">منشور شفافیت تبلیغات پولی</h3>
                    <p className="text-xs font-bold text-slate-400">نحوه عملکرد، رتبه‌بندی و حقوق فروشنده</p>
                 </div>
              </div>

              <div className="space-y-8">
                 <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <h4 className="font-black text-slate-800 text-sm mb-3">۱. سیاست عودت وجه و موجودی کالا</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
                       تبلیغات بلافاصله پس از تایید تراکنش بانکی فعال می‌شود. در صورتی که کالای مورد نظر در طول بازه کمپین «ناموجود» شود، نمایش تبلیغ به طور موقت متوقف خواهد شد. توجه داشته باشید که در این حالت، هزینه کمپین مسترد نمی‌گردد؛ لذا توصیه می‌شود قبل از شروع کمپین از موجودی انبار خود اطمینان حاصل کنید.
                    </p>
                 </section>

                 <section>
                    <h4 className="font-black text-slate-800 text-sm mb-4">۲. مکانیزم رتبه‌بندی (Ad Rank)</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold mb-4">
                       حتی با خرید پلن تبلیغاتی، جایگاه اول برای هیچ فروشنده‌ای دائمی نیست. پلتفرم از الگوریتم ترکیبی برای تعیین رتبه استفاده می‌کند:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <li className="p-4 bg-indigo-50/50 rounded-2xl text-[10px] font-bold text-indigo-700 border border-indigo-100 flex items-center gap-2">
                         <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                         نوع پلن خریداری شده (الماس، طلا، نقره)
                       </li>
                       <li className="p-4 bg-indigo-50/50 rounded-2xl text-[10px] font-bold text-indigo-700 border border-indigo-100 flex items-center gap-2">
                         <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                         امتیاز اعتبار (Trust Score) فروشنده
                       </li>
                       <li className="p-4 bg-indigo-50/50 rounded-2xl text-[10px] font-bold text-indigo-700 border border-indigo-100 flex items-center gap-2">
                         <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                         نرخ کلیک (CTR) و جذابیت کالا برای خریدار
                       </li>
                       <li className="p-4 bg-indigo-50/50 rounded-2xl text-[10px] font-bold text-indigo-700 border border-indigo-100 flex items-center gap-2">
                         <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
                         ارتباط دسته‌بندی با جستجوی کاربر
                       </li>
                    </ul>
                 </section>

                 <section className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
                    <h4 className="font-black text-amber-800 text-sm mb-3">۳. چرخش هوشمند (Smart Rotation)</h4>
                    <p className="text-[11px] text-amber-900/70 leading-relaxed font-bold">
                       برای برقراری عدالت در نمایش، زمانی که تعداد آگهی‌های یک پلن (مثلاً الماس) زیاد باشد، سیستم به صورت خودکار آگهی‌ها را در هر بار «تازه‌سازی» صفحه توسط خریداران جابجا می‌کند. این کار تضمین می‌کند که تمامی آگهی‌دهندگان در بازه زمانی خود، شانس برابری برای دیده شدن در ردیف‌های اول داشته باشند.
                    </p>
                 </section>

                 <section>
                    <h4 className="font-black text-slate-800 text-sm mb-3">۴. محدودیت ظرفیت نمایش</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                       پلتفرم برای حفظ کیفیت تجربه کاربری، تعداد آگهی‌های فعال در هر لحظه را محدود می‌کند. خرید پلن به منزله «رزرو سهمیه نمایش» است و الگوریتم پلتفرم متعهد به نمایش آگهی شما به تعداد کاربران مشخص شده در پلن می‌باشد.
                    </p>
                 </section>
              </div>

              <button 
                onClick={() => setShowTermsModal(false)}
                className="w-full mt-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-lg shadow-2xl"
              >
                متوجه شدم و می‌پذیرم
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManager;
