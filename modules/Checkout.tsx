
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SalesLink, Currency } from '../types';
import { initiatePayment, verifyCryptoHash } from '../services/paymentService';

interface CheckoutProps {
  links: SalesLink[];
  onSaleSuccess: (slug: string, productId: string, amount: number, customerData: { email: string, phone: string, address: string, postalCode: string, transactionHash?: string, source: 'direct' | 'marketplace', selectedVariants?: Record<string, string>, shippingFee: number, totalPaid: number }) => void;
}

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
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [cryptoHash, setCryptoHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!link || !product) return <div className="p-20 text-center font-black text-slate-400">۴۰۴ - محصول یافت نشد.</div>;

  const shippingFee = link.shippingFee || 0;
  const totalAmount = product.price + shippingFee;

  const handleProcessPayment = () => {
    // Check variants
    if (product.variants && product.variants.length > 0) {
      for (const v of product.variants) {
        if (!selectedVariants[v.name]) {
          return alert(`لطفاً ${v.name} را انتخاب کنید.`);
        }
      }
    }

    if (!email || !phone || !address || !postalCode) {
      return alert('لطفاً تمامی فیلدها را برای تکمیل سفارش وارد کنید.');
    }
    
    if (product.currency === Currency.CRYPTO) {
      setStep('crypto_verify');
      return;
    }

    setStep('paying');
    // Simulate gateway
    setTimeout(() => {
       if (window.confirm(`شبیه‌سازی: مبلغ نهایی ${totalAmount.toLocaleString()} به درگاه ارسال شد. آیا پرداخت شد؟`)) {
         completeOrder();
       } else {
         setStep('info');
       }
    }, 1500);
  };

  const completeOrder = (hash?: string) => {
    onSaleSuccess(link.slug, product.id, product.price, { 
      email, phone, address, postalCode, transactionHash: hash,
      source: 'direct', selectedVariants, shippingFee, totalPaid: totalAmount
    });
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <div className="bg-white rounded-[4rem] p-12 max-w-lg w-full shadow-2xl flex flex-col items-center border border-slate-100">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4">سفارش با موفقیت ثبت شد!</h1>
            <p className="text-slate-500 font-bold mb-10 leading-relaxed">فروشنده به زودی محصول را برای شما ارسال خواهد کرد.</p>
            <button onClick={() => navigate(`/s/${slug}`)} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-indigo-100">بازگشت به فروشگاه</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row" dir="rtl">
      <aside className="lg:w-96 bg-white border-l border-slate-200 p-10 flex flex-col order-last lg:order-first">
         <h2 className="text-xl font-black text-slate-900 mb-8">فاکتور سفارش</h2>
         <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8 space-y-4">
            <div className="flex justify-between text-sm font-bold text-slate-600">
               <span>{product.name}</span>
               <span>{product.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-400">
               <span>هزینه ارسال</span>
               <span>{shippingFee.toLocaleString()}</span>
            </div>
            <div className="h-px bg-slate-200 my-2"></div>
            <div className="flex justify-between text-lg font-black text-indigo-600">
               <span>جمع کل:</span>
               <span>{totalAmount.toLocaleString()} <span className="text-xs">{product.currency}</span></span>
            </div>
         </div>
         
         {product.variants && product.variants.map(v => (
            <div key={v.name} className="mb-6">
               <label className="block text-[10px] font-black text-slate-400 uppercase mb-3">{v.name} را انتخاب کنید:</label>
               <div className="flex flex-wrap gap-2">
                  {v.options.map(opt => (
                    <button key={opt} onClick={() => setSelectedVariants({...selectedVariants, [v.name]: opt})} className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${selectedVariants[v.name] === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100'}`}>{opt}</button>
                  ))}
               </div>
            </div>
         ))}
      </aside>

      <main className="flex-1 p-8 lg:p-20 max-w-3xl mx-auto w-full">
         <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-black text-slate-900 mb-10">اطلاعات خریدار</h1>
            <div className="space-y-6 text-right">
                <input type="email" placeholder="ایمیل شما" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="tel" placeholder="شماره تماس" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none text-left" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} />
                <input type="text" placeholder="کد پستی" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none text-left" dir="ltr" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                <textarea rows={4} placeholder="آدرس کامل جهت ارسال پستی" className="w-full px-6 py-4 rounded-[2rem] border border-slate-200 font-bold outline-none resize-none" value={address} onChange={e => setAddress(e.target.value)} />
                <button onClick={handleProcessPayment} className="w-full py-6 bg-indigo-600 text-white font-black text-xl rounded-[2.5rem] shadow-2xl active:scale-95 transition-all mt-6">تایید و پرداخت نهایی</button>
            </div>
         </div>
      </main>
    </div>
  );
};

export default Checkout;
