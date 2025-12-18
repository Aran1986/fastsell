
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white" dir="rtl">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 mx-auto max-w-7xl lg:pt-32">
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-indigo-600 uppercase bg-indigo-50 rounded-full font-black">
            همین حالا سریع‌تر بفروش ⚡
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl mb-8 flex flex-col items-center">
            <span className="flex items-center" dir="ltr">
                <span className="font-black">FAS</span>
                <span className="logo-t text-indigo-500 font-black">t</span>
                <span className="font-black">Sell</span>
            </span>
            <span className="text-indigo-600 text-4xl sm:text-5xl mt-4">فروش در لحظه</span>
          </h1>
          <p className="max-w-2xl mx-auto mb-10 text-lg text-slate-600 leading-relaxed font-bold">
            بدون نیاز به دانش فنی، محصولات خود را لیست کنید و لینک پرداخت اختصاصی دریافت کنید. سریع‌ترین پلتفرم برای فروشندگان اینستاگرامی و تلگرامی.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/register')} className="px-10 py-5 text-xl font-black text-white bg-indigo-600 rounded-[2rem] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100">شروع سریع فروش</button>
            <button className="px-10 py-5 text-xl font-black text-slate-700 bg-slate-100 rounded-[2rem] hover:bg-slate-200 transition-all">مشاهده فروشگاه‌ها</button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-slate-900 text-white rounded-[4rem] mx-4 mb-20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-6">سیستم چطور کار می‌کند؟</h2>
            <p className="text-slate-400 font-bold">سه قدم ساده تا تبدیل شدن به یک فروشنده حرفه‌ای</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            {/* Step 1 */}
            <div className="space-y-8">
              <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl">۱</div>
              <h3 className="text-2xl font-black">ساخت فروشگاه و لینک</h3>
              <p className="text-slate-400 leading-relaxed">نام برند خود را انتخاب کنید و لینک اختصاصی (Slug) خود را بسازید. این لینک هویت فروشگاهی شماست.</p>
              <div className="bg-slate-800 p-4 rounded-3xl border border-slate-700 shadow-inner">
                <div className="bg-slate-700 h-8 w-full rounded-xl mb-3 flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                </div>
                <div className="text-[10px] font-mono text-indigo-400">fastsell.ir/s/royal-gallery</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-8">
              <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl">۲</div>
              <h3 className="text-2xl font-black">کاتالوگ محصولات</h3>
              <p className="text-slate-400 leading-relaxed">عکس محصولات را آپلود کنید. هوش مصنوعی ما توضیحات جذاب برای فروش بیشتر را برایتان می‌نویسد.</p>
              <div className="bg-white rounded-3xl p-4 shadow-2xl relative overflow-hidden h-40">
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 bg-slate-200 rounded-full"></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 h-8 bg-indigo-600 rounded-xl"></div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-8">
              <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl">۳</div>
              <h3 className="text-2xl font-black">پرداخت و دریافت دیتا</h3>
              <p className="text-slate-400 leading-relaxed">مشتری با کلیک بر روی لینک، مشخصات و آدرس خود را وارد کرده و مستقیماً پرداخت می‌کند.</p>
              <div className="bg-slate-800 p-4 rounded-3xl border border-slate-700">
                <div className="space-y-2">
                  <div className="h-2 w-1/3 bg-slate-700 rounded-full"></div>
                  <div className="h-8 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 flex items-center text-[8px] text-slate-500">شماره تماس...</div>
                  <div className="h-10 w-full bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xs uppercase">پرداخت نهایی</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="px-6 mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
                { title: 'برندینگ سریع', desc: 'لینک اختصاصی با نام برند شما در کمتر از یک دقیقه.' },
                { title: 'مدیریت سفارشات', desc: 'قابلیت ویرایش وضعیت سفارش و پیگیری دقیق اطلاعات پستی مشتریان.' },
                { title: 'امنیت تضمین شده', desc: 'تسویه حساب هوشمند و امن در سیستم FASTSell.' }
            ].map((f, i) => (
                <div key={i} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-200 shadow-sm text-right hover:shadow-xl transition-all">
                    <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                    <p className="text-slate-500 font-bold leading-relaxed">{f.desc}</p>
                </div>
            ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;