
import React from 'react';
import Header from '../components/Header';

const TechnicalDebts: React.FC = () => {
  const debts = [
    { 
      title: 'اتصال واقعی به درگاه پرداخت (IPG)', 
      status: 'Critical', 
      desc: 'در حال حاضر فرآیند پرداخت شبیه‌سازی شده است. نیاز به پیاده‌سازی متدهای واقعی در paymentService برای اتصال به ZarinPal یا Stripe و مدیریت Callback/Webhook جهت تایید نهایی سفارش.' 
    },
    { 
      title: 'مدیریت و میزبانی تصاویر (Storage)', 
      status: 'High', 
      desc: 'محصولات فعلی از لینک‌های خارجی یا Base64 استفاده می‌کنند. باید به Supabase Storage متصل شود تا تصاویر به صورت فشرده و امن روی سرور اختصاصی ذخیره و لود شوند.' 
    },
    { 
      title: 'سرویس واقعی اطلاع‌رسانی (Bridge API)', 
      status: 'High', 
      desc: 'بخش "پل‌های ارتباطی" در حال حاضر فقط تنظیمات را ذخیره می‌کند. برای ارسال واقعی پیامک یا پیام تلگرام، باید به پنل‌های API (مثل Kavenegar یا Telegram Bot API) در سمت سرور متصل شود.' 
    },
    { 
      title: 'امنیت دیتابیس (Row Level Security)', 
      status: 'Medium', 
      desc: 'جداول Supabase ساخته شده‌اند، اما باید سیاست‌های RLS تنظیم شوند تا هر فروشنده "فقط" به محصولات و سفارشات خودش دسترسی داشته باشد و امکان دستکاری دیتای دیگران وجود نداشته باشد.' 
    },
    { 
      title: 'اتصال زنده به بلاک‌چین (Web3 Auth)', 
      status: 'Medium', 
      desc: 'تایید تراکنش تتر (TRC20) در حال حاضر با چک کردن فرمت هش انجام می‌شود. باید به یک Node شبکه Tron متصل شود تا واریز مبلغ دقیق به ولت فروشنده به صورت اتوماتیک تایید شود.' 
    },
    { 
      title: 'سیستم چت (Real-time Websockets)', 
      status: 'Low', 
      desc: 'چت فعلی بر پایه State مرورگر است. برای استفاده واقعی بین دو کاربر مجزا، باید از قابلیت Realtime دیتابیس Supabase یا Socket.io استفاده شود.' 
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-4">بدهی‌های فنی و نقشه اصلاحات واقعی 🛠️</h1>
          <p className="text-slate-500 font-bold">لیست مواردی که برای خروج از نسخه دمو و ورود به بازار (Production) الزامی هستند.</p>
        </div>
        
        <div className="space-y-6">
          {debts.map((debt, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-start gap-6 group hover:border-indigo-100 transition-all">
               <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 font-black text-[10px] shadow-sm ${
                 debt.status === 'Critical' ? 'bg-red-500 text-white' : 
                 debt.status === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'
               }`}>
                 {debt.status}
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">{debt.title}</h3>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed text-justify">{debt.desc}</p>
               </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-slate-900 rounded-[3rem] text-white">
           <h4 className="font-black text-lg mb-4 flex items-center gap-2">
             <span className="text-2xl">💡</span> وضعیت فعلی هسته سیستم:
           </h4>
           <p className="text-xs leading-relaxed font-bold text-slate-400">
             تمام زیرساخت‌های لازم برای موارد بالا (تایپ‌ها، رابط کاربری، و توابع کمکی) در کد تعبیه شده است. برای "واقعی کردن" هر بخش، تنها نیاز به وارد کردن API Key سرویس مربوطه و نوشتن چند خط کد ارتباطی (Connector) است.
           </p>
        </div>
      </main>
    </div>
  );
};

export default TechnicalDebts;
