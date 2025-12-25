
import React from 'react';
import Header from '../components/Header';

const Roadmap: React.FC = () => {
  const categories = [
    {
      title: '🚀 ویژگی‌های پیاده‌سازی شده (Existing Features)',
      items: [
        { text: 'مدیریت چند فروشگاهی (Multi-store)', status: 'done' },
        { text: 'داشبورد آنالیز ترافیک و فروش اختصاصی', status: 'done' },
        { text: 'سیستم شفافیت مالی و سود ۱۲ درصدی موسسین', status: 'done' },
        { text: 'لینک‌های مستقیم فروش (Direct Purchase Links)', status: 'done' },
        { text: 'تولید محتوای هوشمند محصول با Gemini AI', status: 'done' },
        { text: 'مدیریت تخفیف آنی در همه‌جا (In-place discount editing)', status: 'done' },
        { text: 'جستجوی سراسری هوشمند (محصولات + فروشگاه‌ها) در هدر', status: 'done' },
        { text: 'طراحی کاملاً ریسپانسیو و منوی مخصوص موبایل (Hamburger Menu)', status: 'done' },
        { text: 'فیلتر هوشمند فروشندگان با قابلیت جستجو و پیشنهاد برترین‌ها', status: 'done' },
        { text: 'پیشنهادات باندل هوشمند در Checkout', status: 'done' },
        { text: 'لایه اعتماد (Trust Layer) و نقد و نظر هوشمند', status: 'done' },
        { text: 'سیستم موجود شد خبرم کن (Notification requests)', status: 'done' },
        { text: 'رتبه‌بندی هوشمند محصولات (Smart Ranking) بر اساس Discovery Score', status: 'done' },
        { text: 'سیستم امتیاز اعتبار (Reputation Points) برای فروشندگان', status: 'done' },
        { text: 'داشبورد قدرت فروشنده (Seller Power) جهت پایش Boost خودکار', status: 'done' },
        { text: 'ماژول مقایسه و تحلیل قیمت رقبا (Smart Comparison Module)', status: 'done' }
      ]
    },
    {
      title: '🛠️ بدهی‌های فنی و نیاز به اصلاح (Technical Debt)',
      items: [
        { text: 'اصلاح لاگین ادمین (Admin Hardcoded Login) - باید با سیستم Auth واقعی جایگزین شود', status: 'debt' },
        { text: 'ذخیره‌سازی لوکال به Supabase - در حال حاضر بخشی از دیتاها فقط در localStorage هستند', status: 'debt' },
        { text: 'بهینه‌سازی سایز تصاویر محصولات در آپلود', status: 'debt' },
        { text: 'محدود کردن فیچر مقایسه قیمت به پلن‌های خاص (Pro / Max / Max+) در آینده', status: 'debt' }
      ]
    },
    {
      title: '🔮 برنامه‌های آینده (Future Roadmap)',
      items: [
        { text: 'سیستم چت مستقیم خریدار و فروشنده در صفحه محصول', status: 'todo' },
        { text: 'پشتیبانی از کیف پول داخلی (Wallet Balance)', status: 'todo' },
        { text: 'اپلیکیشن اندروید و iOS اختصاصی فروشندگان', status: 'todo' },
        { text: 'سیستم حراجی زنده (Live Auction)', status: 'todo' },
        { text: 'اتصال مستقیم به پنل‌های پستی ایران برای صدور بارنامه', status: 'todo' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-slate-900 mb-4">دفترچه یادداشت توسعه و نقشه راه 🗺️</h1>
          <p className="text-slate-500 font-bold">پایش فیچرها، بدهی‌های فنی و آینده FASTSell</p>
        </div>

        <div className="space-y-12">
          {categories.map((cat, idx) => (
            <section key={idx} className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
               <h2 className="text-xl font-black mb-8 pb-4 border-b border-slate-50 flex items-center gap-3">
                  {cat.title}
               </h2>
               <div className="space-y-4">
                  {cat.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                         item.status === 'done' ? 'bg-green-100 text-green-600' : 
                         item.status === 'debt' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'
                       }`}>
                          {item.status === 'done' ? '✓' : item.status === 'debt' ? '!' : '○'}
                       </div>
                       <div className={`text-sm font-bold ${item.status === 'debt' ? 'text-red-900' : 'text-slate-700'}`}>
                         {item.text}
                       </div>
                    </div>
                  ))}
               </div>
            </section>
          ))}
        </div>
        
        <div className="mt-12 bg-indigo-900 text-white p-8 rounded-[2.5rem] text-center shadow-2xl">
           <h4 className="font-black text-lg mb-2">یادداشت توسعه‌دهنده</h4>
           <p className="text-xs text-indigo-300 leading-relaxed font-bold">
             تمامی لایه‌ها و فیچرهای پیاده‌سازی شده در این لیست پایش می‌شوند. ماژول مقایسه هوشمند به عنوان ابزاری برای بهینه‌سازی قیمت و سودآوری فروشندگان و خریداران اضافه شده است.
           </p>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
