
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SalesLink, Currency, Product } from '../types';
import { ApiService } from '../services/apiService';
import { TrackingService } from '../services/trackingService';

interface CheckoutProps {
  links: SalesLink[];
  onSaleSuccess: (slug: string, productId: string, amount: number, customerData: { 
    email: string, 
    phone: string, 
    address: string, 
    postalCode: string, 
    transactionHash?: string, 
    source: 'direct' | 'marketplace', 
    trafficSource?: string,
    selectedVariants?: Record<string, string>, 
    shippingFee: number, 
    totalPaid: number 
  }) => void;
  initialProductId?: string;
  initialStoreSlug?: string;
}

const Checkout: React.FC<CheckoutProps> = ({ links, onSaleSuccess, initialProductId, initialStoreSlug }) => {
  const { slug: urlSlug, productId: urlProductId } = useParams<{ slug: string, productId: string }>();
  
  const slug = initialStoreSlug || urlSlug;
  const productId = initialProductId || urlProductId;

  const navigate = useNavigate();
  const location = useLocation();
  const link = links.find(l => l.slug === slug);
  const product = link?.products.find(p => p.id === productId);

  const [step, setStep] = useState<'info' | 'paying' | 'crypto_verify' | 'success' | 'oos'>('info');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [detectedSource, setDetectedSource] = useState('Direct');
  const [notified, setNotified] = useState(false);
  
  const [bundleProduct, setBundleProduct] = useState<(Product & { storeSlug: string, shippingFee: number }) | null>(null);
  const [includeBundle, setIncludeBundle] = useState(false);

  // Simulation state for messaging bridge
  const [messagingStatus, setMessagingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (product && product.stock <= 0) {
      setStep('oos');
    }
    
    const params = new URLSearchParams(location.search);
    const utmSource = params.get('src') || params.get('utm_source');
    if (utmSource) setDetectedSource(utmSource.charAt(0).toUpperCase() + utmSource.slice(1));

    if (product && link) {
      ApiService.getRecommendedProducts(product.id, link.slug).then(recs => {
        if (recs.length > 0) setBundleProduct(recs[0]);
      });
    }
  }, [product, link]);

  const handleEmailBlur = async () => {
    if (email.includes('@')) {
      const history = await ApiService.getLastCustomerDetails(email);
      if (history) {
        setPhone(history.customerPhone || '');
        setAddress(history.customerAddress || '');
        setPostalCode(history.customerPostalCode || '');
      }
    }
  };

  const handleNotifyMe = async () => {
    if (!email || !email.includes('@')) return alert('لطفاً ایمیل معتبر وارد کنید.');
    await TrackingService.requestStockNotification(slug!, productId!, email);
    setNotified(true);
  };

  if (!link || !product) return <div className="p-20 text-center font-black text-slate-400">۴۰۴ - محصول یافت نشد.</div>;

  if (step === 'oos') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-right" dir="rtl">
        <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6 text-3xl">🔔</div>
            <h1 className="text-2xl font-black text-slate-900 mb-4 text-center">این کالا در حال حاضر ناموجود است</h1>
            <p className="text-slate-500 font-bold mb-8 text-center text-sm">با ثبت ایمیل خود، به محض شارژ مجدد موجودی توسط فروشنده، به شما اطلاع‌رسانی خواهیم کرد.</p>
            
            {notified ? (
              <div className="bg-green-50 text-green-600 p-6 rounded-2xl w-full text-center font-black text-sm">درخواست شما ثبت شد! ✓</div>
            ) : (
              <div className="w-full space-y-4">
                <input type="email" placeholder="ایمیل شما" className="w-full px-6 py-4 rounded-xl border border-slate-200 font-bold outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                <button onClick={handleNotifyMe} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black shadow-lg">ثبت درخواست اطلاع‌رسانی</button>
              </div>
            )}
            {!initialProductId && <button onClick={() => navigate(`/s/${slug}`)} className="mt-8 text-sm font-black text-slate-400 hover:text-indigo-600">← بازگشت به فروشگاه</button>}
        </div>
      </div>
    );
  }

  const shippingFee = link.shippingFee || 0;
  const bundleShipping = includeBundle && bundleProduct ? bundleProduct.shippingFee : 0;
  const bundlePrice = includeBundle && bundleProduct ? (bundleProduct.discountPrice || bundleProduct.price) : 0;
  const totalAmount = (product.discountPrice || product.price) + shippingFee + bundlePrice + bundleShipping;

  const handleProcessPayment = () => {
    if (!email || !phone || !address || !postalCode) return alert('لطفاً تمامی فیلدها را تکمیل کنید.');
    setStep('paying');
    setTimeout(() => {
       if (window.confirm(`شبیه‌سازی پرداخت: مبلغ ${totalAmount.toLocaleString()} پرداخت شد؟`)) {
         completeOrder();
       } else {
         setStep('info');
       }
    }, 1500);
  };

  const completeOrder = async () => {
    onSaleSuccess(link.slug, product.id, (product.discountPrice || product.price), { 
      email, phone, address, postalCode, source: 'direct', 
      trafficSource: detectedSource, selectedVariants, shippingFee, totalPaid: totalAmount
    });

    // Simulate Messaging Bridge
    if (link.integrations?.telegramChatId || link.integrations?.whatsappNumber) {
        setMessagingStatus('در حال اطلاع‌رسانی به فروشنده...');
        setTimeout(() => {
            setMessagingStatus('اعلان فروش به تلگرام و واتساپ ارسال شد ✅');
            setTimeout(() => setStep('success'), 1500);
        }, 2000);
    } else {
        setStep('success');
    }
  };

  if (step === 'success') {
    return (
      <div className="p-12 text-center" dir="rtl">
        <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8 animate-bounce"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
            <h1 className="text-3xl font-black mb-4 text-slate-900">سفارش ثبت شد!</h1>
            <p className="text-slate-500 font-bold mb-10 text-sm">پیام تایید برای شما ارسال گردید.</p>
            {messagingStatus && <p className="text-indigo-600 font-black text-[10px] mb-8 bg-indigo-50 px-4 py-2 rounded-full">{messagingStatus}</p>}
            {!initialProductId && <button onClick={() => navigate(`/s/${slug}`)} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black">بازگشت</button>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col lg:flex-row ${!initialProductId ? 'min-h-screen bg-slate-50' : 'h-full bg-white'}`} dir="rtl">
      {messagingStatus && step === 'paying' && (
        <div className="fixed inset-0 z-[2000] bg-slate-900/90 flex flex-col items-center justify-center text-white text-center p-10">
           <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-8"></div>
           <p className="text-xl font-black">{messagingStatus}</p>
        </div>
      )}

      <aside className={`lg:w-96 p-10 flex flex-col order-last lg:order-first overflow-y-auto ${!initialProductId ? 'bg-white border-l border-slate-200' : 'bg-slate-50/50'}`}>
         <h2 className="text-xl font-black mb-8">فاکتور سفارش</h2>
         <div className="space-y-4 mb-8">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 space-y-3 shadow-sm">
               <div className="flex justify-between text-sm font-black text-slate-800">
                  <span>{product.name}</span>
                  <div className="flex flex-col items-end">
                    {product.discountPrice && <span className="text-[10px] text-orange-500 line-through font-black">{(product.price).toLocaleString()}</span>}
                    <span>{(product.discountPrice || product.price).toLocaleString()}</span>
                  </div>
               </div>
               <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>هزینه ارسال</span><span>{shippingFee.toLocaleString()}</span></div>
            </div>
            {includeBundle && bundleProduct && (
              <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100 space-y-3 relative overflow-hidden">
                <div className="flex justify-between text-sm font-black text-slate-800"><span>{bundleProduct.name}</span><span>{(bundleProduct.discountPrice || bundleProduct.price).toLocaleString()}</span></div>
                {bundleProduct.shippingFee > 0 && <div className="flex justify-between text-[10px] font-bold text-amber-600"><span>ارسال مجزا</span><span>{bundleProduct.shippingFee.toLocaleString()}</span></div>}
              </div>
            )}
            <div className="h-px bg-slate-200 my-2"></div>
            <div className="flex justify-between text-2xl font-black text-indigo-600 px-4"><span>جمع کل:</span><span>{totalAmount.toLocaleString()} <span className="text-xs">{product.currency}</span></span></div>
         </div>
         {bundleProduct && !includeBundle && (
            <div className="mb-10 bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl animate-in zoom-in-95">
               <div className="flex items-center gap-3 mb-4"><span className="text-xl">✨</span><span className="text-[10px] font-black uppercase text-indigo-400">پیشنهاد مکمل</span></div>
               <div className="flex gap-4 items-center"><img src={bundleProduct.image} className="w-16 h-16 rounded-2xl object-cover" alt="" /><div className="flex-1"><div className="text-xs font-black truncate">{bundleProduct.name}</div><div className="text-[10px] text-slate-400 mt-1">{(bundleProduct.discountPrice || bundleProduct.price).toLocaleString()} تومان</div></div></div>
               <button onClick={() => setIncludeBundle(true)} className="w-full mt-4 bg-white text-slate-900 py-3 rounded-xl text-[10px] font-black">+ افزودن به سبد</button>
            </div>
         )}
      </aside>
      <main className="flex-1 p-8 lg:p-20 max-w-3xl mx-auto w-full">
         <div className="max-w-md mx-auto">
           <h1 className="text-3xl font-black mb-10">اطلاعات خریدار</h1>
           <div className="space-y-6 text-right">
             <div className="relative"><input type="email" placeholder="ایمیل شما" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-100" value={email} onBlur={handleEmailBlur} onChange={e => setEmail(e.target.value)} /></div>
             <input type="tel" placeholder="شماره تماس" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none text-left focus:ring-2 focus:ring-indigo-100" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} />
             <input type="text" placeholder="کد پستی" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none text-left focus:ring-2 focus:ring-indigo-100" dir="ltr" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
             <textarea rows={4} placeholder="آدرس کامل جهت ارسال پستی" className="w-full px-6 py-4 rounded-[2rem] border border-slate-200 font-bold outline-none resize-none focus:ring-2 focus:ring-indigo-100" value={address} onChange={e => setAddress(e.target.value)} />
             <button onClick={handleProcessPayment} className="w-full py-6 bg-indigo-600 text-white font-black text-xl rounded-[2.5rem] shadow-2xl mt-6 hover:bg-indigo-700 transition-all">تایید و پرداخت نهایی</button>
           </div>
         </div>
      </main>
    </div>
  );
};

export default Checkout;
