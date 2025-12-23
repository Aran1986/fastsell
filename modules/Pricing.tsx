
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
        'تعداد کالا: حداکثر 10 محصول',
        'تعداد فروشگاه: 1 فروشگاه',
        'سهم از سود بنیان‌گذار: ندارد',
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
        'تعداد کالا: حداکثر 30 محصول',
        'تعداد فروشگاه: 2 فروشگاه',
        'سهم از سود بنیان‌گذار: دارد',
        'تسویه: هفته‌ای یک‌بار',
        'کف برداشت: 500,000 تومان'
      ],
      color: 'indigo',
      popular: true
    },
    {
      name: 'Pro',
      price: '399,000 تومان / ماه',
      features: [
        'کارمزد لینک مستقیم: 4٪',
        'کارمزد ویترین عمومی: 6٪',
        'درآمد افیلیت: 0.8٪',
        'تعداد کالا: حداکثر 50 محصول',
        'تعداد فروشگاه: 5 فروشگاه',
        'سهم از سود بنیان‌گذار: دارد',
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
        'تعداد کالا: حداکثر 100 محصول',
        'تعداد فروشگاه: تا 10 فروشگاه',
        'سهم از سود بنیان‌گذار: دارد',
        'تسویه: 48 ساعت',
        'کف برداشت: 500,000 تومان'
      ],
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 mb-6">پلن‌های عضویت و فروش</h1>
          <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto">
            بر اساس حجم فروش و نیاز کسب‌وکار خود، بهترین پلن را انتخاب کنید و از امکانات ویژه بهره‌مند شوید.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative bg-white rounded-[3rem] p-8 border ${plan.popular ? 'border-indigo-600 shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50' : 'border-slate-200 shadow-sm'} transition-all hover:-translate-y-2`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">محبوب‌ترین</div>
              )}
              <h2 className={`text-2xl font-black mb-2 ${plan.popular ? 'text-indigo-600' : 'text-slate-900'}`}>{plan.name}</h2>
              <div className="text-lg font-black text-slate-400 mb-8">{plan.price}</div>
              
              <ul className="space-y-4 mb-10">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                    <span className="text-green-500 mt-1">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-2xl font-black transition-all ${plan.popular ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                انتخاب این پلن
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Pricing;
