
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="bg-white overflow-x-hidden">
      <Header />
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 mx-auto max-w-7xl lg:pt-32">
        <div className="text-center">
          <span className="inline-block px-5 py-2 mb-8 text-xs font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
            {t('heroTitle')} ⚡
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-8xl mb-8 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-6 animate-pulse">
              <Logo size={100} className="text-indigo-600 drop-shadow-2xl" />
            </div>
            <span className="flex items-center" dir="ltr">
                <span className="font-black">FAS</span>
                <span className="logo-t text-indigo-500 font-black">t</span>
                <span className="font-black">Sell</span>
            </span>
            <span className="text-indigo-600 text-4xl sm:text-5xl mt-6 font-black leading-tight">{t('heroSub')}</span>
          </h1>
          <p className="max-w-2xl mx-auto mb-16 text-xl text-slate-500 leading-relaxed font-bold px-4">
            {t('heroDesc')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button onClick={() => navigate('/register')} className="px-12 py-7 text-2xl font-black text-white bg-indigo-600 rounded-[3rem] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 hover:-translate-y-1 active:scale-95">
              {t('startBtn')}
            </button>
            <button 
              onClick={() => navigate('/marketplace')}
              className="px-12 py-7 text-2xl font-black text-slate-700 bg-slate-100 rounded-[3rem] hover:bg-slate-200 transition-all border border-slate-200"
            >
              🚀 ویترین عمومی محصولات
            </button>
          </div>
        </div>
      </section>

      {/* Visual Showcase - Interactive Mockup Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-100 overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-last lg:order-first">
                <div className="relative mx-auto w-full max-w-sm">
                   {/* Mobile Mockup Frame */}
                   <div className="bg-slate-900 rounded-[4rem] p-4 border-[12px] border-slate-800 shadow-2xl transform rotate-3 relative overflow-hidden h-[750px]">
                      <div className="bg-white rounded-[3rem] h-full overflow-hidden flex flex-col">
                        <div className="bg-slate-50 h-32 flex flex-col items-center justify-center border-b border-slate-100">
                           <div className="w-16 h-16 bg-indigo-600 rounded-2xl mb-2 flex items-center justify-center text-white font-black text-xl">M</div>
                           <div className="h-2 w-20 bg-slate-200 rounded-full"></div>
                        </div>
                        <div className="p-6 flex-1 space-y-6">
                           <div className="bg-slate-50 rounded-[2.5rem] p-4 border border-slate-100 animate-pulse">
                              <div className="h-40 bg-slate-200 rounded-[2rem] mb-4"></div>
                              <div className="h-4 w-3/4 bg-slate-200 rounded-full mb-2"></div>
                              <div className="h-4 w-1/2 bg-slate-200 rounded-full"></div>
                           </div>
                           <div className="bg-slate-50 rounded-[2.5rem] p-4 border border-slate-100">
                              <div className="h-40 bg-slate-200 rounded-[2rem] mb-4"></div>
                              <div className="h-4 w-3/4 bg-slate-200 rounded-full mb-2"></div>
                           </div>
                        </div>
                      </div>
                      {/* Interactive Floaties */}
                      <div className="absolute top-1/2 -right-16 bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-bounce delay-700 hidden sm:block">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-black">✓</div>
                           <div className="font-black text-slate-800 text-sm">سفارش تایید شد</div>
                        </div>
                      </div>
                      <div className="absolute bottom-20 -left-20 bg-indigo-600 p-6 rounded-[2.5rem] shadow-2xl text-white hidden sm:block animate-pulse">
                        <div className="font-black text-sm">سود موسس: ۱۲٪ 🔥</div>
                      </div>
                   </div>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-5xl font-black mb-8 leading-tight">پریویو زنده و حرفه‌ای <br/> مخصوص فروش در اینستاگرام</h2>
                <p className="text-xl text-slate-500 font-bold leading-relaxed mb-12">مشتریان شما با یک کلیک وارد ویترین اختصاصی‌تان می‌شوند. همه چیز برای موبایل بهینه شده تا بالاترین نرخ تبدیل را تجربه کنید.</p>
                <div className="flex flex-col gap-6">
                   <div className="flex items-center gap-4 justify-end p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl">
                      <div className="text-right flex-1">
                        <div className="font-black text-slate-900 text-lg">طراحی مدرن و مینیمال</div>
                        <p className="text-xs font-bold text-slate-400 mt-1">مطابق با استانداردهای ۲۰۲۵ طراحی وب</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-inner">1</div>
                   </div>
                   <div className="flex items-center gap-4 justify-end p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl">
                      <div className="text-right flex-1">
                        <div className="font-black text-slate-900 text-lg">پرداخت ۲ مرحله‌ای فوق سریع</div>
                        <p className="text-xs font-bold text-slate-400 mt-1">کاهش انصراف مشتری در سبد خرید</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-inner">2</div>
                   </div>
                   <div className="flex items-center gap-4 justify-end p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 transition-all hover:shadow-xl">
                      <div className="text-right flex-1">
                        <div className="font-black text-slate-900 text-lg">اتصال هوشمند به بلاک‌چین</div>
                        <p className="text-xs font-bold text-slate-400 mt-1">تایید خودکار واریزی‌های تتر (USDT)</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-inner">3</div>
                   </div>
                </div>
            </div>
         </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-slate-900 text-white rounded-[4.5rem] mx-4 my-20 overflow-hidden relative shadow-2xl">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-24">
            <h2 className="text-6xl font-black mb-6">{t('howItWorks')}</h2>
            <p className="text-slate-400 font-bold text-lg">فقط در ۳ مرحله فروشگاه خود را جهانی کنید.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 items-start text-right">
            <div className="space-y-8 group">
              <div className="bg-indigo-600 w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-xl group-hover:scale-110 transition-transform">1</div>
              <h3 className="text-3xl font-black">{t('step1Title')}</h3>
              <p className="text-slate-400 leading-relaxed font-bold">نام برند خود را انتخاب کنید و لینک اختصاصی بگیرید. این هویت شما در اینترنت است.</p>
              <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 shadow-inner">
                <div className="text-xs font-mono text-indigo-400" dir="ltr">.../s/your-brand</div>
              </div>
            </div>

            <div className="space-y-8 group">
              <div className="bg-indigo-600 w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-xl group-hover:scale-110 transition-transform">2</div>
              <h3 className="text-3xl font-black">{t('step2Title')}</h3>
              <p className="text-slate-400 leading-relaxed font-bold">کالا یا خدمات خود را وارد کنید. هوش مصنوعی ما متن‌های تبلیغاتی جذابی برایتان می‌نویسد.</p>
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 flex items-center justify-center h-48">
                 <div className="animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="w-24 h-2 bg-indigo-500/20 rounded-full"></div>
                        <div className="w-16 h-2 bg-indigo-500/10 rounded-full"></div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="space-y-8 group">
              <div className="bg-indigo-600 w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-xl group-hover:scale-110 transition-transform">3</div>
              <h3 className="text-3xl font-black">{t('step3Title')}</h3>
              <p className="text-slate-400 leading-relaxed font-bold">لینک را به اشتراک بگذارید. مشتریان با هر ارزی که بخواهید پرداخت می‌کنند و شما نوتیفیکیشن می‌گیرید.</p>
              <div className="bg-green-500/20 p-8 rounded-[2rem] border border-green-500/30 text-center">
                 <span className="text-green-400 font-black">پرداخت امن تایید شد! 💰</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-24 border-t border-slate-100 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-10 text-center">
              <div className="flex flex-col items-center gap-8">
                 <div className="flex items-center gap-3">
                    <Logo size={40} className="text-slate-300" />
                    <span className="text-2xl font-black text-slate-300 tracking-tighter">FASTSell</span>
                 </div>
                 <p className="text-slate-400 font-black tracking-widest uppercase text-xs">پلتفرم هوشمند فروش شخصی در شبکه‌های اجتماعی</p>
                 <div className="flex gap-10 text-slate-400 font-bold text-sm">
                    <a href="#" className="hover:text-indigo-600 transition-colors">قوانین</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">امنیت</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">پشتیبانی</a>
                 </div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
