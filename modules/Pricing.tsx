
import React from 'react';
import Header from '../components/Header';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: 'رایگان',
      features: [
        'کارمزد لینک مستقیم: 6٪',
        'کارمزد ویترین عمومی: 8٪',
        'درآمد افیلیت: ندارد',
        'تعداد کالا: حداکثر 10 محصول (در هر فروشگاه)',
        'تعداد فروشگاه: 1 فروشگاه',
        'سهم از سود فروشندگان بنیان‌گذار: ندارد',
        'تسویه: هفته‌ای یک‌بار',
        'کف برداشت: 500,000 تومان'
      ],
      color: 'slate'
    },
    {
      name: 'Starter',
      price: '199,000 تومان / ماه',
      features: [
        'کارمزد لینک مستقیم: 5٪',
        'کارمزد ویترین عمومی: 7٪',
        'درآمد افیلیت: 0.05٪',
        'تعداد کالا: حداکثر 30 محصول (در هر فروشگاه)',
        'تعداد فروشگاه: 2 فروشگاه',
        'سهم از سود فروشندگان بنیان‌گذار: دارد',
        'تسویه: هفته‌ای یک‌بار',
        'کف برداشت: 500,000 تومان'
      ],
      color: 'indigo'
    },
    {
      name: 'Pro',
      price: '399,000 تومان / ماه',
      features: [
        'کارمزد لینک مستقیم: 4٪',
        'کارمزد ویترین عمومی: 6٪',
        'درآمد افیلیت: 0.8٪',
        'تعداد کالا: حداکثر 50 محصول (در هر فروشگاه)',
        'تعداد فروشگاه: 5 فروشگاه',
        'سهم از سود فروشندگان بنیان‌گذار: دارد',
        'تسویه: هفته‌ای دو بار',
        'کف برداشت: 500,000 تومان'
      ],
      color: 'purple'
    },
    {
      name: 'Max',
      price: '699,000 تومان / ماه',
      features: [
        'کارمزد لینک مستقیم: 3٪',
        'کارمزد ویترین عمومی: 5٪',
        'درآمد افیلیت: 0.1٪',
        'تعداد کالا: حداکثر 100 محصول (در هر فروشگاه)',
        'تعداد فروشگاه: تا 10 فروشگاه',
        'سهم از سود فروشندگان بنیان‌گذار: دارد',
        'تسویه: 48 ساعت',
        'کف برداشت: 500,000 تومان'
      ],
      color: 'orange'
    },
    {
      name: 'Max+',
      price: '999,000 تومان / ماه',
      features: [
        'ویژگی‌های پلن مکس به علاوه ی فیچرهای بیشتر',
        'تبلیغات هوشمند در کل شبکه خریداران پلتفرم (Global AI Discovery)',
        'دستیار هوشمند تطبیق کالا با سلیقه مشتریان کل سایت'
      ],
      color: 'black',
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 mb-6">پلن‌های عضویت و فروش</h1>
          <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">
            بر اساس حجم فروش و نیاز کسب‌وکار خود، بهترین پلن را انتخاب کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative bg-white rounded-[3rem] p-8 border ${plan.name === 'Max+' ? 'border-slate-900 shadow-2xl ring-4 ring-slate-50' : 'border-slate-200 shadow-sm'} transition-all hover:-translate-y-2 flex flex-col justify-between`}>
              {plan.name === 'Max+' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">پیشنهاد ویژه</div>
              )}
              <div>
                <h2 className={`text-2xl font-black mb-2 ${plan.name === 'Max+' ? 'text-black' : 'text-slate-900'}`}>{plan.name}</h2>
                <div className="text-sm font-black text-slate-400 mb-8">{plan.price}</div>
                
                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-[10px] font-bold text-slate-600 leading-relaxed">
                      <span className="text-green-500 mt-1 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`w-full py-4 rounded-2xl font-black transition-all ${plan.name === 'Max+' ? 'bg-black text-white shadow-xl' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                انتخاب پلن {plan.name}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Pricing;
