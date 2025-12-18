
import React from 'react';
import Header from '../components/Header';

const Docs: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16 w-full">
        <h1 className="text-4xl font-black text-slate-900 mb-8">راهنمای جامع FASTSell</h1>
        
        <div className="space-y-12 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">۱. مدیریت چند فروشگاهی</h2>
            <p className="text-slate-600 leading-relaxed font-bold">
              در سایدبار داشبورد، لیستی از تمامی فروشگاه‌های ساخته شده خود را مشاهده می‌کنید. با کلیک بر روی هر کدام، می‌توانید تنظیمات، محصولات و سفارشات مربوط به همان فروشگاه را به صورت جداگانه مدیریت کنید.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">۲. تنظیمات پیشرفته ارز و تسویه</h2>
            <p className="text-slate-600 leading-relaxed font-bold">
              در تب «پروفایل»، ارز پیش‌فرض فروشگاه را انتخاب کنید. سپس در تب «تنظیمات پرداخت»، اطلاعات مربوطه را وارد نمایید:
              <br/>- <b>ریال ایران:</b> شماره کارت، شبا و نام صاحب حساب برای خریدار نمایش داده می‌شود.
              <br/>- <b>دلار و یورو:</b> فیلدهای PayPal و Stripe فعال می‌شوند.
              <br/>- <b>کریپتوکارنسی:</b> آدرس ولت USDT و انتخاب شبکه (مانند TRC20) برای پرداخت‌های دیجیتال.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">۳. دریافت لینک‌های مستقیم</h2>
            <p className="text-slate-600 leading-relaxed font-bold">
              برای هدایت سریع مشتری از اینستاگرام یا تلگرام به صفحه پرداخت، از دکمه «دریافت لینک مستقیم محصول» در لیست محصولات استفاده کنید. این لینک خریدار را مستقیماً به صفحه تسویه حساب (Checkout) هدایت می‌کند.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">۴. محصولات ویژه و شخصی‌سازی ظاهر</h2>
            <p className="text-slate-600 leading-relaxed font-bold">
              با فعال کردن «محصول ویژه»، کالای شما با نشان متمایز در بالای کاتالوگ قرار می‌گیرد. همچنین در تب «ظاهر و تم»، می‌توانید رنگ برند و رنگ دکمه خرید را به طور کاملاً مجزا تغییر دهید تا با استایل برند شما هماهنگ باشد.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Docs;
