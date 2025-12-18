
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SalesLink, Currency } from '../types';
import { initiatePayment, verifyCryptoHash } from '../services/paymentService';

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

  const [step, setStep] = useState<'info' | 'paying' | 'crypto_verify' | 'success'>('info');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [cryptoHash, setCryptoHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!link || !product) return <div className="p-10 text-center font-black">۴۰۴ - محصول یافت نشد.</div>;

  const mainColor = link.themeColor || '#6366f1';
  const buyBtnColor = link.buyButtonColor || mainColor;
  const currency = product.currency;

  const handleProcessPayment = async () => {
    if (!email || !phone || !address || !postalCode) {
      return alert('لطفاً تمامی فیلدها را برای ارسال کالا تکمیل کنید.');
    }

    setStep('paying');

    try {
      const result = await initiatePayment(currency, product.price, link.bankDetails || {}, { email, phone });
      
      if (result.success) {
        if (currency === Currency.CRYPTO) {
          setStep('crypto_verify');
        } else if (result.url) {
          // در دنیای واقعی کاربر اینجا به درگاه بانک هدایت می‌شود
          if (window.confirm(`شما در حال انتقال به درگاه پرداخت هستید. مبلغ: ${product.price} ${getCurrencySymbol(currency)}\n\n(این یک شبیه‌سازی است، آیا پرداخت را موفقیت‌آمیز فرض کنیم؟)`)) {
            completeOrder();
          } else {
            setStep('info');
          }
        }
      } else {
        alert(result.error || 'خطا در اتصال به درگاه.');
        setStep('info');
      }
    } catch (error) {
      alert('خطای سیستمی رخ داد.');
      setStep('info');
    }
  };

  const handleCryptoVerify = async () => {
    if (!cryptoHash) return alert('لطفاً کد هش (TXID) تراکنش را وارد کنید.');
    setIsVerifying(true);
    const isValid = await verifyCryptoHash(cryptoHash, link.bankDetails?.walletAddress || '');
    if (isValid) {
      completeOrder();
    } else {
      alert('هش تراکنش معتبر نیست یا هنوز در شبکه تایید نشده است.');
      setIsVerifying(false);
    }
  };

  const completeOrder = () => {
    onSaleSuccess(link.slug, product.id, product.price, { email, phone, address, postalCode });
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center animate-in zoom-in-95">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 scale-110 shadow-lg">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">تراکنش موفقیت‌آمیز!</h1>
        <p className="text-slate-500 font-bold mb-10 max-w-xs mx-auto">سفارش شما با موفقیت ثبت شد. تاییدیه به ایمیل شما ارسال گردید.</p>
        <button onClick={() => navigate(`/s/${slug}`)} style={{ backgroundColor: buyBtnColor }} className="text-white px-10 py-4 rounded-2xl font-black shadow-2xl transition-transform active:scale-95">بازگشت به فروشگاه</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 py-10" dir="rtl">
      <div className="mb-10 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-slate-400 font-bold text-sm">← بازگشت</button>
        <h2 className="font-black text-2xl text-slate-800">تکمیل خرید</h2>
        <div className="w-10"></div>
      </div>

      <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-sm mb-8">
        <div className="flex items-center gap-6 mb-8 border-b border-slate-50 pb-6">
          <img src={product.image} className="w-20 h-20 rounded-2xl object-cover shadow-md" alt="" />
          <div className="flex-1">
            <h3 className="font-black text-slate-800 text-lg mb-1">{product.name}</h3>
            <span className="font-black text-2xl" style={{ color: mainColor }}>{getCurrencySymbol(currency)} {product.price.toLocaleString()}</span>
          </div>
        </div>

        {step === 'info' && (
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 mr-2 uppercase">اطلاعات خریدار و آدرس ارسال</label>
            <input type="email" placeholder="آدرس ایمیل" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="tel" placeholder="شماره تماس" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-left" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="کد پستی" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-left" dir="ltr" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                <div className="flex items-center justify-center bg-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase">ارسال سریع ⚡</div>
            </div>
            <textarea rows={3} placeholder="آدرس کامل پستی جهت تحویل کالا" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
        )}

        {step === 'crypto_verify' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
               <p className="text-[11px] font-bold text-orange-700 leading-relaxed">
                 لطفاً مبلغ <span className="font-black">{product.price} USDT</span> را به آدرس ولت زیر واریز کنید و سپس کد پیگیری (Hash) را در فیلد زیر وارد نمایید:
               </p>
               <div className="mt-4 p-3 bg-white rounded-xl border border-orange-200 font-mono text-[10px] break-all text-center select-all">
                 {link.bankDetails?.walletAddress || 'آدرس ولت ست نشده است'}
               </div>
               <p className="mt-2 text-center text-[9px] font-black text-orange-400 uppercase">Network: {link.bankDetails?.network || 'TRC20'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 mr-2">TXID / Transaction Hash</label>
              <input 
                type="text" 
                placeholder="کد هش تراکنش را اینجا وارد کنید..." 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs outline-none focus:bg-white"
                value={cryptoHash}
                onChange={e => setCryptoHash(e.target.value)}
              />
            </div>
            <button 
              onClick={handleCryptoVerify}
              disabled={isVerifying}
              className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-100 active:scale-95 transition-all disabled:opacity-50"
            >
              {isVerifying ? 'در حال تایید تراکنش...' : 'تایید و ثبت نهایی'}
            </button>
            <button onClick={() => setStep('info')} className="w-full text-center text-[10px] font-black text-slate-400 uppercase">بازگشت و تغییر اطلاعات</button>
          </div>
        )}
      </div>

      {step === 'info' && (
        <button 
          onClick={handleProcessPayment} 
          style={{ backgroundColor: buyBtnColor }} 
          className="w-full py-6 text-white font-black text-xl rounded-[2rem] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          <span>تایید و انتقال به درگاه</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
        </button>
      )}

      {step === 'paying' && (
        <div className="text-center py-10 animate-pulse">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="font-black text-slate-600">در حال اتصال به امن‌ترین درگاه پرداخت...</p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-4 opacity-30 grayscale">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-4" alt="Stripe" />
        <div className="h-4 w-px bg-slate-400"></div>
        <span className="text-[10px] font-black">SSL SECURE</span>
      </div>
    </div>
  );
};

export default Checkout;
