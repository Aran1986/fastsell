
import React from 'react';
import Header from '../components/Header';

const Roadmap: React.FC = () => {
  const categories = [
    {
      title: '🚀 فیچرهای پیاده‌سازی شده (Existing Features)',
      description: 'امکاناتی که در حال حاضر در پلتفرم فعال و قابل استفاده هستند.',
      items: [
        { text: 'مدیریت چند فروشگاهی (Multi-store Management)', status: 'done' },
        { text: 'لینک‌های مستقیم فروش (Direct Purchase Links)', status: 'done' },
        { text: 'تولید محتوای هوشمند محصول با Gemini AI', status: 'done' },
        { text: 'سیستم تسویه حساب چند ارزی (ریال، تتر، پی‌پال، استرایپ)', status: 'done' },
        { text: 'داشبورد آنالیز ترافیک و منابع ورودی (Instagram, Telegram, etc.)', status: 'done' },
        { text: 'سیستم هوشمند رتبه‌بندی محصولات (Discovery Score)', status: 'done' },
        { text: 'لایه اعتبار فروشنده (Reputation Points & Seller Power)', status: 'done' },
        { text: 'سیستم موجود شد خبرم کن (Stock Notifications)', status: 'done' },
        { text: 'جستجوی سراسری هوشمند (محصولات + فروشگاه‌ها) در هدر', status: 'done' },
        { text: 'فیلتر هوشمند فروشگاه‌ها با قابلیت پیشنهاد برترین‌ها', status: 'done' },
        { text: 'طراحی کاملاً ریسپانسیو و منوی مخصوص موبایل (Hamburger Menu)', status: 'done' },
        { text: 'لایه اعتماد (Trust Layer) شامل زمان پاسخگویی و نرخ تحویل', status: 'done' },
        { text: 'نقد و نظر هوشمند (AI Review Summarization)', status: 'done' },
        { text: 'سیستم همکاری در فروش و زیرمجموعه‌گیری (Affiliate System)', status: 'done' },
        { text: 'شفافیت مالی و طرح فروشندگان موسس (Founder Pool)', status: 'done' },
        { text: 'پایش انبار و اینسایت‌های محبوبیت کالا (Inventory Insights)', status: 'done' },
        { text: 'محاسبه خودکار کارمزدها بر اساس منبع فروش (مستقیم یا ویترین)', status: 'done' },
        { text: 'بازیابی خودکار اطلاعات خریداران قبلی (Checkout Auto-fill)', status: 'done' }
      ]
    },
    {
      title: '🛠️ بدهی‌های فنی و اصلاحات ضروری (Technical Debt)',
      description: 'مواردی که برای نسخه نهایی و عمومی باید بازنویسی یا اصلاح شوند.',
      items: [
        { text: 'جایگزینی سیستم ورود سخت‌افزاری (Admin Hardcoded Login) با Auth واقعی', status: 'debt' },
        { text: 'انتقال کامل دیتابیس از LocalStorage به Supabase برای پایداری داده‌ها', status: 'debt' },
        { text: 'بهینه‌سازی سمت سرور برای تایید تراکنش‌های بلاک‌چینی (Crypto Verification)', status: 'debt' },
        { text: 'پیاده‌سازی سیستم آپلود و فشرده‌سازی تصاویر روی Cloud Storage', status: 'debt' },
        { text: 'افزودن تست‌های واحد (Unit Tests) برای محاسبات پیچیده مالی', status: 'debt' }
      ]
    },
    {
      title: '🔮 برنامه‌های آینده (Future Roadmap)',
      description: 'قابلیت‌هایی که در فازهای بعدی به پلتفرم اضافه خواهند شد.',
      items: [
        { text: 'سیستم چت مستقیم خریدار و فروشنده در صفحه محصول', status: 'todo' },
        { text: 'اپلیکیشن اختصاصی فروشندگان (PWA / React Native)', status: 'todo' },
        { text: 'اتصال به پنل‌های پستی ایران برای صدور خودکار بارنامه', status: 'todo' },
        { text: 'سیستم حراجی زنده و محدود (Flash Sales)', status: 'todo' },
        { text: 'پشتیبانی از کیف پول داخلی و پرداخت درون‌شبکه‌ای', status: 'todo' },
        { text: 'ارائه API اختصاصی برای توسعه‌دهندگان خارجی', status: 'todo' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6">نقشه راه توسعه FASTSell 🗺️</h1>
          <p className="text-lg text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
            گزارش وضعیت فعلی، چالش‌های فنی و مسیر پیش روی پلتفرم هوشمند فروش شخصی.
          </p>
        </div>

        <div className="space-y-12">
          {categories.map((cat, idx) => (
            <section key={idx} className="bg-white p-8 sm:p-12 rounded-[3.5rem] border border-slate-200 shadow-sm transition-all hover:shadow-md">
               <div className="mb-10">
                  <h2 className={`text-2xl font-black mb-3 ${
                    cat.title.includes('پیاده‌سازی') ? 'text-green-600' : 
                    cat.title.includes('بدهی') ? 'text-red-500' : 'text-indigo-600'
                  }`}>
                    {cat.title}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold">{cat.description}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-5 rounded-3xl bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                         item.status === 'done' ? 'bg-green-100 text-green-600' : 
                         item.status === 'debt' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 text-slate-400'
                       }`}>
                          {item.status === 'done' ? '✓' : item.status === 'debt' ? '!' : '○'}
                       </div>
                       <div className={`text-sm font-black ${item.status === 'debt' ? 'text-red-900' : 'text-slate-700'}`}>
                         {item.text}
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          ))}
        </div>
        
        <div className="mt-16 bg-slate-900 text-white p-12 rounded-[4rem] text-center shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
           <div className="relative z-10">
              <h4 className="font-black text-xl mb-4 text-indigo-400">یادداشت فنی تیم توسعه</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-bold max-w-3xl mx-auto">
                این نقشه راه به صورت داینامیک بروزرسانی می‌شود. اولویت فعلی تیم، رفع "بدهی‌های فنی" برای اطمینان از امنیت و پایداری داده‌ها قبل از جذب فروشندگان انبوه است. هرگونه تغییر در معماری یا فیچرهای اصلی باید در این لیست ثبت گردد.
              </p>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
