
import React, { useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { SalesLink, Currency } from '../types';
import { initiatePayment, verifyCryptoHash } from '../services/paymentService';

interface CheckoutProps {
  links: SalesLink[];
  onSaleSuccess: (slug: string, productId: string, amount: number, customerData: { email: string, phone: string, address: string, postalCode: string, transactionHash?: string, source: 'direct' | 'marketplace' }) => void;
}

const getCurrencySymbol = (curr: Currency) => {
  switch (curr) {
    case Currency.USD: return '$';
    case Currency.EUR: return '€';
    case Currency.IRR: return 'تومان';
    case Currency.CRYPTO: return 'USDT';
    default: return '$';
  }
};

const Checkout: React.FC<CheckoutProps> = ({ links, onSaleSuccess }) => {
  const { slug, productId } = useParams<{ slug: string, productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const link = links.find(l => l.slug === slug);
  const product = link?.products.find(p => p.id === productId);

  // تشخیص منبع از URL
  const queryParams = new URLSearchParams(location.search);
  const orderSource: 'direct' | 'marketplace' = queryParams.get('ref') === 'marketplace' ? 'marketplace' : 'direct';

  const [step, setStep] = useState<'info' | 'paying' | 'crypto_verify' | 'success'>('info');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [cryptoHash, setCryptoHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!link || !product) return <div className="p-20 text-center font-black text-slate-400">۴۰۴ - محصول یافت نشد.</div>;

  const mainColor = link.themeColor || '#6366f1';
  const buyBtnColor = link.buyButtonColor || mainColor;
  const currency = product.currency;

  const handleCopyWallet = () => {
    const addr = link.bankDetails?.walletAddress || '';
    if (addr) {
      navigator.clipboard.writeText(addr);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleProcessPayment = async () => {
    if (!email || !phone || !address || !postalCode) {
      return alert('لطفاً تمامی فیلدها را برای تکمیل سفارش وارد کنید.');
    }
    
    if (currency === Currency.CRYPTO) {
      setStep('crypto_verify');
      return;
    }

    setStep('paying');
    try {
      const result = await initiatePayment(currency, product.price, link.bankDetails || {}, { email, phone });
      if (result.success) {
          setTimeout(() => {
             if (window.confirm(`شبیه‌سازی: شما به درگاه پرداخت متصل شدید.\nآیا پرداخت موفقیت‌آمیز بود؟`)) {
               completeOrder();
             } else {
               setStep('info');
             }
          }, 1500);
      }
    } catch (error) {
      alert('خطا در اتصال به شبکه.');
      setStep('info');
    }
  };

  const handleCryptoVerify = async () => {
    if (!cryptoHash) return alert('کد هش تراکنش الزامی است.');
    setIsVerifying(true);
    
    const isValid = await verifyCryptoHash(
      cryptoHash, 
      link.bankDetails?.walletAddress || '', 
      product.price
    );

    if (isValid) {
      completeOrder(cryptoHash);
    } else {
      alert('تراکنش در بلاک‌چین تایید نشد. لطفاً چند دقیقه صبر کنید و دوباره امتحان کنید یا TXID را بررسی کنید.');
      setIsVerifying(false);
    }
  };

  const completeOrder = (hash?: string) => {
    onSaleSuccess(link.slug, product.id, product.price, { 
      email, phone, address, postalCode, transactionHash: hash,
      source: orderSource // ارسال منبع به سیستم ثبت سفارش
    });
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95" dir="rtl">
        <div className="bg-white rounded-[4rem] p-12 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col items-center">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner animate-bounce">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">پرداخت موفقیت‌آمیز بود! ✨</h1>
            <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                سفارش شما ثبت شد. {orderSource === 'marketplace' ? 'از چرخ زدن در ویترین عمومی سپاسگزاریم!' : 'ممنون که از لینک مستقیم فروشگاه ما استفاده کردید.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <button onClick={() => navigate('/marketplace')} className="bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black shadow-xl">ویترین عمومی</button>
                <button onClick={() => navigate(`/s/${slug}`)} className="bg-slate-100 text-slate-600 px-8 py-5 rounded-2xl font-black">بازگشت به فروشگاه</button>
            </div>
            <Link to="/dashboard" className="mt-8 text-indigo-500 font-black text-sm hover:underline">مشاهده خریدهای من در داشبورد ←</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row" dir="rtl">
      <aside className="lg:w-[450px] bg-white border-l border-slate-200 p-8 lg:p-12 flex flex-col order-first lg:order-last">
         <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-black text-slate-900">خلاصه سفارش</h2>
            <button onClick={() => navigate(-1)} className="text-slate-400 font-black text-sm flex items-center gap-2">بازگشت <span dir="ltr">←</span></button>
         </div>
         <div className="flex gap-6 mb-12 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            <img src={product.image} className="w-24 h-24 rounded-3xl object-cover shadow-lg" alt="" />
            <div className="flex flex-col justify-center">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{product.category}</span>
                <h3 className="font-black text-slate-800 text-xl mb-2">{product.name}</h3>
                <span className="font-black text-2xl" style={{ color: mainColor }}>{product.price.toLocaleString()} <span className="text-sm">{getCurrencySymbol(currency)}</span></span>
            </div>
         </div>
         <div className="space-y-4 border-t border-slate-100 pt-8 text-xs font-bold text-slate-400">
            {orderSource === 'marketplace' ? (
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl flex items-center gap-2">
                <span>🛒 سفارش از طریق ویترین عمومی پلتفرم</span>
              </div>
            ) : (
              <div className="bg-slate-50 text-slate-600 p-3 rounded-xl flex items-center gap-2">
                <span>🔗 سفارش از طریق لینک مستقیم فروشگاه</span>
              </div>
            )}
         </div>
      </aside>
      <main className="flex-1 p-8 lg:p-20 max-w-3xl mx-auto w-full">
         <div className="max-w-md mx-auto">
            <div className="mb-12">
                <div className="flex gap-2 mb-6">
                    <div className="h-2 flex-1 rounded-full bg-indigo-600"></div>
                    <div className={`h-2 flex-1 rounded-full ${step !== 'info' ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                    <div className="h-2 flex-1 rounded-full bg-slate-200"></div>
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">تکمیل اطلاعات</h1>
                <p className="text-slate-400 font-bold">مشخصات تحویل گیرنده را وارد کنید.</p>
            </div>
            {step === 'info' && (
              <div className="space-y-6">
                <div className="space-y-2 text-right">
                    <label className="text-xs font-black text-slate-400 mr-2">آدرس ایمیل</label>
                    <input type="email" placeholder="example@mail.com" className="w-full px-6 py-5 rounded-3xl bg-white border border-slate-200 font-bold outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2 text-right">
                    <label className="text-xs font-black text-slate-400 mr-2">شماره تماس</label>
                    <input type="tel" placeholder="0912XXXXXXX" className="w-full px-6 py-5 rounded-3xl bg-white border border-slate-200 font-bold outline-none text-left" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-right">
                        <label className="text-xs font-black text-slate-400 mr-2">کد پستی</label>
                        <input type="text" placeholder="10 رقمی" className="w-full px-6 py-5 rounded-3xl bg-white border border-slate-200 font-bold outline-none text-left" dir="ltr" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                    </div>
                    <div className="space-y-2 text-right">
                        <label className="text-xs font-black text-slate-400 mr-2">واحد پول پرداخت</label>
                        <div className="w-full px-6 py-5 rounded-3xl bg-slate-100 text-slate-500 font-black text-sm flex items-center justify-between">
                            {getCurrencySymbol(currency)}
                            <span className="text-[10px] opacity-50 uppercase tracking-tighter">{currency}</span>
                        </div>
                    </div>
                </div>
                <div className="space-y-2 text-right">
                    <label className="text-xs font-black text-slate-400 mr-2">آدرس کامل پستی</label>
                    <textarea rows={4} placeholder="استان، شهر، پلاک..." className="w-full px-6 py-5 rounded-[2rem] bg-white border border-slate-200 font-bold outline-none resize-none" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <button onClick={handleProcessPayment} style={{ backgroundColor: buyBtnColor }} className="w-full py-6 text-white font-black text-xl rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-4 mt-8 transition-all active:scale-95">
                  <span>تایید و ادامه</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
              </div>
            )}
            {step === 'crypto_verify' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-10">
                 <div className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-2xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-indigo-900/40 text-3xl font-black">₮</div>
                        <h3 className="text-xl font-black mb-2">واریز به کیف پول شخصی</h3>
                        <p className="text-slate-400 text-sm font-bold text-center mb-8">لطفاً مبلغ <span className="text-white">{product.price} USDT</span> را به آدرس زیر واریز کنید.</p>
                        <div className="w-full space-y-4">
                            <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-slate-700">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Network</span>
                                <span className="font-black text-indigo-400 uppercase">{link.bankDetails?.network || 'TRC20'}</span>
                            </div>
                            <div onClick={handleCopyWallet} className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/10 transition-all">
                                <span className="font-mono text-[10px] text-indigo-200 break-all select-all flex-1 text-left">{link.bankDetails?.walletAddress || 'تنظیم نشده!'}</span>
                                <div className="text-white p-2 bg-indigo-600 rounded-xl">
                                    {copySuccess ? 'کپی شد!' : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>}
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
                 <div className="space-y-4 text-right">
                    <label className="text-xs font-black text-slate-400 mr-2">هش تراکنش (TXID)</label>
                    <input type="text" placeholder="شناسه تراکنش را در اینجا جایگذاری کنید" className="w-full px-6 py-5 rounded-3xl bg-white border border-slate-200 font-mono text-sm outline-none text-left" dir="ltr" value={cryptoHash} onChange={e => setCryptoHash(e.target.value)} />
                 </div>
                 <button onClick={handleCryptoVerify} disabled={isVerifying} style={{ backgroundColor: buyBtnColor }} className="w-full py-6 text-white font-black text-xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all">
                    {isVerifying ? 'در حال تایید تراکنش در بلاک‌چین...' : 'ثبت نهایی و تایید پرداخت'}
                 </button>
              </div>
            )}
         </div>
      </main>
    </div>
  );
};

export default Checkout;
