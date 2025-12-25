
import React from 'react';
import Header from '../components/Header';

const Roadmap: React.FC = () => {
  const categories = [
    {
      title: '🔮 برنامه‌های آینده (Future Roadmap)',
      items: [
        { text: 'پشتیبانی از کیف پول داخلی و موجودی حساب (Wallet Balance)', status: 'todo' },
        { text: 'اپلیکیشن اندروید و iOS اختصاصی برای مدیریت فروشندگان', status: 'todo' },
        { text: 'سیستم حراجی زنده (Live Auction) برای محصولات کلکسیونی', status: 'todo' },
        { text: 'یکپارچگی با سیستم انبارداری فیزیکی پلتفرم (Fast Fulfillment)', status: 'todo' },
        { text: 'سیستم تبلیغات کلیکی پیشرفته (Advanced CPC Ads)', status: 'todo' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-slate-900 mb-4">مسیر پیش‌روی FASTSell 🗺️</h1>
          <p className="text-slate-500 font-bold">تمرکز بر توسعه قابلیت‌های نوین و بازارسازی جهانی</p>
        </div>

        <div className="space-y-12">
          <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[3rem] text-indigo-900">
            <h3 className="font-black text-lg mb-2">یادداشت توسعه</h3>
            <p className="text-xs leading-relaxed font-bold opacity-80">
              قابلیت‌های پیاده‌سازی شده به بخش <span className="font-black">«قابلیت‌ها»</span> و موارد نیازمند اصلاح فنی به بخش <span className="font-black">«بدهی فنی»</span> منتقل شده‌اند. این صفحه تنها تمرکز بر فیچرهای آینده دارد.
            </p>
          </div>

          {categories.map((cat, idx) => (
            <section key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
               <h2 className="text-xl font-black mb-8 pb-4 border-b border-slate-50 flex items-center gap-3 text-indigo-600">
                  {cat.title}
               </h2>
               <div className="space-y-4">
                  {cat.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                       <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-slate-100 text-slate-400">
                          ○
                       </div>
                       <div className="text-sm font-bold text-slate-700">
                         {item.text}
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
