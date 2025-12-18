
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useLanguage } from '../context/LanguageContext';
import Header from '../components/Header';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const isRtl = dir === 'rtl';

  return (
    <div className="bg-white">
      <Header />
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 mx-auto max-w-7xl lg:pt-32">
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-indigo-600 uppercase bg-indigo-50 rounded-full font-black">
            {t('heroTitle')} ⚡
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl mb-8 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-4 animate-bounce duration-[3000ms]">
              <Logo size={80} className="text-indigo-600 drop-shadow-2xl" />
            </div>
            <span className="flex items-center" dir="ltr">
                <span className="font-black">FAS</span>
                <span className="logo-t text-indigo-500 font-black">t</span>
                <span className="font-black">Sell</span>
            </span>
            <span className="text-indigo-600 text-4xl sm:text-5xl mt-6 font-black">{t('heroSub')}</span>
          </h1>
          <p className="max-w-2xl mx-auto mb-12 text-xl text-slate-600 leading-relaxed font-bold">
            {t('heroDesc')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button onClick={() => navigate('/register')} className="px-12 py-6 text-2xl font-black text-white bg-indigo-600 rounded-[2.5rem] hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 hover:-translate-y-1 active:scale-95">
              {t('startBtn')}
            </button>
            <button className="px-12 py-6 text-2xl font-black text-slate-700 bg-slate-100 rounded-[2.5rem] hover:bg-slate-200 transition-all">
              {t('viewShops')}
            </button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-slate-900 text-white rounded-[4.5rem] mx-4 mb-20 overflow-hidden relative shadow-2xl">
        <div className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black mb-6">{t('howItWorks')}</h2>
            <p className="text-slate-400 font-bold text-lg">Professional steps to convert your followers into customers.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 items-start">
            {/* Step 1 */}
            <div className="space-y-8 group">
              <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl group-hover:scale-110 transition-transform">1</div>
              <h3 className="text-3xl font-black">{t('step1Title')}</h3>
              <p className="text-slate-400 leading-relaxed font-bold">Choose your brand name and create your slug. This link is your global identity across all platforms.</p>
              <div className="bg-slate-800 p-5 rounded-[2rem] border border-slate-700 shadow-inner">
                <div className="text-xs font-mono text-indigo-400" dir="ltr">fastsell.ir/s/royal-services</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-8 group">
              <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl group-hover:scale-110 transition-transform">2</div>
              <h3 className="text-3xl font-black">{t('step2Title')}</h3>
              <p className="text-slate-400 leading-relaxed font-bold">Enter items or services. Our AI engine will write professional, high-converting descriptions for you instantly.</p>
              <div className="bg-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden h-48 flex flex-col justify-center">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center flex-shrink-0"><Logo size={40} className="text-indigo-200" /></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-2/3 bg-slate-200 rounded-full animate-pulse"></div>
                    <div className="h-3 w-full bg-slate-100 rounded-full"></div>
                    <div className="h-3 w-4/5 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-8 group">
              <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl group-hover:scale-110 transition-transform">3</div>
              <h3 className="text-3xl font-black">{t('step3Title')}</h3>
              <p className="text-slate-400 leading-relaxed font-bold">Share your link. Customers click, enter details, and pay securely via Stripe, PayPal, or Crypto. You get the data instantly.</p>
              <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700">
                <div className="space-y-3">
                  <div className="h-10 w-full bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm uppercase tracking-widest shadow-lg">Checkout Success</div>
                  <div className="h-2 w-1/2 bg-slate-700 rounded-full mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - RESTORED */}
      <section className="py-24 bg-white">
        <div className="px-10 mx-auto max-w-7xl">
           <div className="text-center mb-20">
              <h2 className="text-5xl font-black text-slate-900 mb-6">{t('featuresTitle')}</h2>
              <p className="text-slate-400 font-bold">Everything you need to grow your social commerce.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                  { title: t('feature1Title'), desc: t('feature1Desc'), icon: '🎨' },
                  { title: t('feature2Title'), desc: t('feature2Desc'), icon: '📊' },
                  { title: t('feature3Title'), desc: t('feature3Desc'), icon: '🛡️' }
              ].map((f, i) => (
                  <div key={i} className={`p-12 bg-slate-50 rounded-[3.5rem] border border-slate-100 text-${isRtl ? 'right' : 'left'} hover:shadow-2xl hover:bg-white transition-all group`}>
                      <div className="text-5xl mb-8 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
                      <h3 className="text-3xl font-black mb-6 text-slate-900">{f.title}</h3>
                      <p className="text-slate-500 font-bold text-lg leading-relaxed">{f.desc}</p>
                  </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-20 border-t border-slate-100 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-10 text-center">
              <div className="flex flex-col items-center gap-6">
                 <Logo size={40} className="text-slate-300" />
                 <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Empowering 10,000+ Sellers Worldwide</p>
                 <div className="flex gap-8 text-slate-400 font-bold text-sm">
                    <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
                 </div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
