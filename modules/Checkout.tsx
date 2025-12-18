
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SalesLink, Currency } from '../types';

interface CheckoutProps {
  links: SalesLink[];
  onSaleSuccess: (slug: string, productId: string, amount: number, customerData: { email: string, phone: string, address: string, postalCode: string }) => void;
}

const getCurrencySymbol = (curr: Currency) => {
  switch (curr) {
    case Currency.USD: return '$';
    case Currency.EUR: return '€';
    case Currency.IRR: return 'ریال';
    case Currency.CRYPTO: return 'USDT';
    default: return '$';
  }
};

const Checkout: React.FC<CheckoutProps> = ({ links, onSaleSuccess }) => {
  const { slug, productId } = useParams<{ slug: string, productId: string }>();
  const navigate = useNavigate();
  const link = links.find(l => l.slug === slug);
  const product = link?.products.find(p => p.id === productId);

  const [step, setStep] = useState<'info' | 'paying' | 'success'>('info');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  if (!link || !product) return <div className="p-10 text-center font-black">۴۰۴ - محصول یافت نشد.</div>;

  const mainColor = link.themeColor || '#6366f1';
  const buyBtnColor = link.buyButtonColor || mainColor;
  const currency = product.currency;

  const handlePay = () => {
    if (!email || !phone || !address || !postalCode) {
      return alert('لطفاً تمامی فیلدها را برای ارسال کالا تکمیل کنید.');
    }
    setStep('paying');
    setTimeout(() => {
      onSaleSuccess(link.slug, product.id, product.price, { email, phone, address, postalCode });
      setStep('success');
    }, 2000);
  };

  if (step === 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 scale-110 shadow-lg">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">تراکنش موفقیت‌آمیز!</h1>
        <p className="text-slate-500 font-bold mb-10 max-w-xs mx-auto">سفارش شما ثبت شد. فروشنده به زودی کالا را برای شما ارسال خواهد کرد.</p>
        <button onClick={() => navigate(`/s/${slug}`)} style={{ backgroundColor: buyBtnColor }} className="text-white px-10 py-4 rounded-2xl font-black shadow-2xl transition-transform active:scale-95">بازگشت به فروشگاه</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 py-10" dir="rtl">
      <h2 className="text-center font-black text-3xl mb-10 text-slate-800">تکمیل خرید</h2>

      <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center gap-6 mb-8 border-b border-slate-50 pb-6">
          <img src={product.image} className="w-20 h-20 rounded-2xl object-cover shadow-md" alt="" />
          <div className="flex-1">
            <h3 className="font-black text-slate-800 text-lg mb-1">{product.name}</h3>
            <span className="font-black text-2xl" style={{ color: mainColor }}>{getCurrencySymbol(currency)} {product.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-4">
          <input type="email" placeholder="آدرس ایمیل" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="tel" placeholder="شماره تماس" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-left" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} />
          <input type="text" placeholder="کد پستی" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-left" dir="ltr" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
          <textarea rows={2} placeholder="آدرس کامل جهت ارسال پستی" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-[3rem] p-8 mb-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">
          {currency === Currency.IRR ? '🏦' : currency === Currency.CRYPTO ? '₿' : '💳'}
        </div>
        <h4 className="font-black text-lg mb-4 text-indigo-400">راهنمای پرداخت:</h4>
        <div className="text-sm font-bold leading-relaxed space-y-3">
          {currency === Currency.IRR ? (
            <>
              <p className="flex justify-between">شماره کارت: <span className="text-indigo-300 font-mono tracking-wider">{link.bankDetails?.cardNumber || '---'}</span></p>
              <p className="flex justify-between">بنام: <span className="text-indigo-300">{link.bankDetails?.holderName || '---'}</span></p>
              <p className="flex flex-col text-[10px] mt-2 text-slate-400">شماره شبا: <span className="font-mono text-indigo-300">{link.bankDetails?.iban || '---'}</span></p>
            </>
          ) : currency === Currency.CRYPTO ? (
            <>
              <p className="text-xs">Wallet (Tether USDT):</p>
              <p className="break-all text-orange-400 font-mono text-[10px] bg-white/5 p-2 rounded-lg">{link.bankDetails?.walletAddress || '---'}</p>
              <p className="text-[10px] text-slate-400">شبکه: {link.bankDetails?.network || 'TRC20'}</p>
            </>
          ) : (
            <>
              <p className="flex justify-between">Pay Via PayPal: <span className="text-blue-400">{link.bankDetails?.paypalEmail || '---'}</span></p>
              {link.bankDetails?.stripeKey && <p className="text-[10px] text-slate-500">Stripe: {link.bankDetails.stripeKey}</p>}
            </>
          )}
        </div>
      </div>

      <button 
        onClick={handlePay} 
        disabled={step === 'paying'} 
        style={{ backgroundColor: buyBtnColor }} 
        className="w-full py-6 text-white font-black text-xl rounded-[2rem] shadow-2xl transition-all active:scale-95 disabled:bg-slate-300"
      >
        {step === 'paying' ? 'درحال پردازش...' : 'تایید نهایی و ثبت سفارش'}
      </button>
    </div>
  );
};

export default Checkout;
