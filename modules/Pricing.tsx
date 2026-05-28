
import React from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: 'رایگان',
      period: 'همیشگی',
      features: [
        'کارمزد لینک مستقیم: 6٪',
        'کارمزد ویترین عمومی: 8٪',
        'درآمد افیلیت: ندارد',
        'تعداد کالا: حداکثر 10 محصول',
        'تعداد فروشگاه: 1 فروشگاه',
        'سهم از سود فروشندگان بنیان‌گذار: ندارد',
        'تسویه: هفته‌ای یک‌بار',
        'کف برداشت: 500,000 تومان'
      ],
      cta: 'شروع رایگان',
      color: 'slate',
      highlight: false
    },
    {
      name: 'Starter',
      price: '199,000',
      period: 'تومان / ماهانه',
      features: [
        'کارمزد لینک مستقیم: 5٪',
        'کارمزد ویترین عمومی: 7٪',
        'درآمد افیلیت: 0.05٪',
        'تعداد کالا: حداکثر 30 محصول',
        'تعداد فروشگاه: 2 فروشگاه',
        'سهم از سود فروشندگان بنیان‌گذار: دارد',
        'تسویه: هفته‌ای یک‌بار',
        'کف برداشت: 500,000 تومان'
      ],
      cta: 'انتخاب پلن استارتر',
      color: 'indigo',
      highlight: false
    },
    {
      name: 'Pro',
      price: '399,000',
      period: 'تومان / ماهانه',
      features: [
        'کارمزد لینک مستقیم: 4٪',
        'کارمزد ویترین عمومی: 6٪',
        'درآمد افیلیت: 0.8٪',
        'تعداد کالا: حداکثر 50 محصول',
        'تعداد فروشگاه: 5 فروشگاه',
        'سهم از سود فروشندگان بنیان‌گذار: دارد',
        'تسویه: هفته‌ای دو بار',
        'کف برداشت: 300,000 تومان'
      ],
      cta: 'انتخاب پلن پرو',
      color: 'purple',
      highlight: true
    },
    {
      name: 'Max',
      price: '699,000',
      period: 'تومان / ماهانه',
      features: [
        'کارمزد لینک مستقیم: 3٪',
        'کارمزد ویترین عمومی: 5٪',
        'درآمد افیلیت: 0.1٪',
        'تعداد کالا: حداکثر 100 محصول',
        'تعداد فروشگاه: تا 10 فروشگاه',
        'سهم از سود فروشندگان بنیان‌گذار: دارد',
        'تسویه: 48 ساعت کاری',
        'کف برداشت: 100,000 تومان'
      ],
      cta: 'انتخاب پلن مکس',
      color: 'orange',
      highlight: false
    },
    {
      name: 'Max+',
      price: '999,000',
      period: 'تومان / ماهانه',
      features: [
        'تمامی ویژگی‌های پلن مکس',
        'تبلیغات هوشمند در کل شبکه خریداران (Global AI Discovery)',
        'دستیار هوشمند تطبیق کالا با سلیقه مشتریان',
        'پشتیبانی اختصاصی تلفنی',
        'دامنه اختصاصی رایگان (.ir)'
      ],
      cta: 'انتخاب پلن مکس پلاس',
      color: 'zinc',
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 py-16 w-full">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black tracking-widest mb-4">MEMBERSHIP PLANS</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">پلن‌های عضویت و فروش</h1>
          <p className="text-lg md:text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
            بر اساس حجم فروش و نیاز کسب‌وکار خود، بهترین پلن را انتخاب کنید. <br className="hidden md:block"/>
            شما همیشه می‌توانید پلن خود را ارتقا دهید.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`relative bg-white rounded-[2.5rem] p-8 border transition-all duration-300 flex flex-col justify-between group
                ${plan.highlight ? 'border-indigo-600 shadow-2xl scale-105 z-10' : 'border-slate-200 shadow-sm hover:border-indigo-200 hover:-translate-y-1'}
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  پیشنهاد ویژه
                </div>
              )}
              
              <div>
                <h2 className={`text-2xl font-black mb-2 ${plan.highlight ? 'text-indigo-600' : 'text-slate-900'}`}>{plan.name}</h2>
                <div className="mb-8">
                  <span className="text-2xl font-black text-slate-900">{plan.price}</span>
                  <span className="block text-[10px] font-bold text-slate-400 mt-1">{plan.period}</span>
                </div>
                
                <div className="h-px bg-slate-50 mb-8"></div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-slate-600 leading-relaxed">
                      <span className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${plan.highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-green-50 text-green-600'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => navigate('/register')}
                className={`w-full py-4 rounded-2xl font-black text-xs transition-all shadow-lg active:scale-95
                  ${plan.highlight 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' 
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-900 hover:text-white'
                  }
                `}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-white rounded-[3rem] p-10 border border-slate-200 text-center shadow-sm max-w-4xl mx-auto">
           <h3 className="text-2xl font-black text-slate-900 mb-4">سوالات متداول</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right mt-8">
              <div className="bg-slate-50 p-6 rounded-3xl">
                 <h4 className="font-black text-sm mb-2">آیا کارمزد از فروش کسر می‌شود؟</h4>
                 <p className="text-xs text-slate-500 leading-relaxed font-bold">بله، کارمزد به صورت خودکار در لحظه تراکنش کسر شده و مبلغ خالص به کیف پول شما واریز می‌شود.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl">
                 <h4 className="font-black text-sm mb-2">تفاوت لینک مستقیم و ویترین چیست؟</h4>
                 <p className="text-xs text-slate-500 leading-relaxed font-bold">لینک مستقیم کارمزد کمتری دارد چون شما خودتان مشتری را آورده‌اید. در ویترین چون پلتفرم مشتری را جذب کرده، کارمزد کمی بیشتر است.</p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
