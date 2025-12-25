
import React from 'react';
import Header from '../components/Header';

const TechnicalDebts: React.FC = () => {
  const debts = [
    { title: 'سیستم احراز هویت (Auth)', status: 'High', desc: 'جایگزینی لاگین سخت‌افزاری (Hardcoded) با Supabase Auth واقعی.' },
    { title: 'انتقال کامل به Supabase', status: 'Medium', desc: 'در حال حاضر بخشی از دیتاها در localStorage ذخیره می‌شوند که باید به دیتابیس ابری منتقل شوند.' },
    { title: 'اتصال به API پستی', status: 'Medium', desc: 'پیاده‌سازی متدهای واقعی PostalService برای اتصال به پنل‌های پستی ایران (در حال حاضر شبیه‌سازی شده).' },
    { title: 'بهینه‌سازی تصاویر', status: 'Low', desc: 'پیاده‌سازی فشرده‌سازی خودکار تصاویر در سمت سرور یا قبل از آپلود جهت کاهش حجم.' },
    { title: 'مدیریت موجودی آنی', status: 'High', desc: 'جلوگیری از Race Condition در سفارشات همزمان برای کالاهای با موجودی ۱ عدد.' },
    { title: 'سیستم اطلاع‌رسانی Bridge', status: 'Medium', desc: 'اتصال واقعی به وب‌هوک‌های تلگرام و پیامک (در حال حاضر فقط شبیه‌سازی بصری انجام شده).' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-black text-slate-900 mb-8">بدهی‌های فنی و لیست اصلاحات 🛠️</h1>
        <div className="space-y-6">
          {debts.map((debt, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-start gap-6 group hover:border-red-100 transition-all">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs ${
                 debt.status === 'High' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
               }`}>
                 {debt.status}
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">{debt.title}</h3>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed">{debt.desc}</p>
               </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default TechnicalDebts;
