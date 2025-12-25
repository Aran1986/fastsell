
import React from 'react';
import Header from '../components/Header';

const ExistingFeatures: React.FC = () => {
  const categories = [
    {
      title: '📦 مدیریت کالا و ویترین',
      items: [
        'سیستم چند فروشگاهی (Multi-store) برای هر کاربر',
        'تولید محتوای هوشمند محصول با Gemini AI (کپی‌رایتر خودکار)',
        'برش و ویرایش حرفه‌ای تصاویر محصولات قبل از آپلود (Crop)',
        'مدیریت موجودی انبار و سیستم "موجود شد خبرم کن"',
        'تعریف متغیرهای محصول (رنگ، سایز، وزن و فیلد دلخواه)',
        'نشان "محصول ویژه" جهت نمایش متمایز در فروشگاه'
      ]
    },
    {
      title: '📈 آنالیز و بازاریابی',
      items: [
        'داشبورد جامع آنالیز ترافیک بر اساس منابع ورودی (اینستاگرام، تلگرام و...)',
        'سیستم بازاریابی هوشمند (کمپین‌های پیامکی، ایمیلی، واتساپ و تلگرام)',
        'پنل همکاری در فروش (Affiliate) با لینک دعوت اختصاصی',
        'میز مقایسه هوشمند کالاها و تحلیل قیمت رقبا',
        'مدیریت مشتریان (Mini CRM) و شناسایی خریداران وفادار',
        'سیستم رتبه‌بندی محصولات (Discovery Score) برای ویترین عمومی'
      ]
    },
    {
      title: '💬 ارتباطات و اعتماد',
      items: [
        'سیستم چت مستقیم خریدار و فروشنده در لحظه',
        'پیشنهاد پاسخ هوشمند (AI Response) برای فروشندگان در چت',
        'لایه اعتماد (Trust Layer) شامل امتیاز اعتبار و سرعت پاسخگویی',
        'ثبت نظرات هوشمند فقط برای خریداران تایید شده',
        'آنتی‌اسپم هوشمند نظرات با استفاده از هوش مصنوعی',
        'پل‌های ارتباطی (Bridge) جهت مدیریت حریم خصوصی مشتری'
      ]
    },
    {
      title: '💳 مالی و پرداخت',
      items: [
        'پشتیبانی از ارزهای ریال، تتر (USDT)، دلار و یورو',
        'تاییدیه هوشمند تراکنش‌های بلاک‌چین (Tron TRC20)',
        'سیستم شفافیت مالی و توزیع سود ۱۲ درصدی بین موسسین',
        'اتصال به درگاه‌های پرداخت (Stripe, PayPal, ZarinPal)',
        'صدور بارنامه پستی و کد رهگیری مرسوله',
        'لینک‌های تبدیل مستقیم (Direct Checkout) برای بایو اینستاگرام'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-black text-slate-900 mb-12 text-center">دایره‌المعارف قابلیت‌های FASTSell ✨</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((cat, idx) => (
            <section key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
               <h2 className="text-2xl font-black text-indigo-600 mb-8 pb-4 border-b border-slate-50">{cat.title}</h2>
               <ul className="space-y-4">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-slate-700 font-bold text-sm">
                       <span className="text-green-500 mt-1 shrink-0">✓</span>
                       {item}
                    </li>
                  ))}
               </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ExistingFeatures;
