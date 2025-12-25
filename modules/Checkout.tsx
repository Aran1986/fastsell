
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { SalesLink, Currency, Product, StoreMode } from '../types';
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
    totalPaid: number,
    bookingTime?: string
  }) => void;
  initialProductId?: string;
  initialStoreSlug?: string;
}

const Checkout: React.FC<CheckoutProps> = ({ links, onSaleSuccess, initialProductId, initialStoreSlug }) => {
  const { slug: urlSlug, productId: urlProductId } = useParams<{ slug: string, productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const slug = initialStoreSlug || urlSlug;
  const productId = initialProductId || urlProductId;
  const queryParams = new URLSearchParams(location.search);
  const requestedSlot = queryParams.get('slot');

  const link = links.find(l => l.slug === slug);
  const product = link?.products.find(p => p.id === productId);
  const storeMode = link?.mode || StoreMode.PRODUCT;
  const isPhysical = storeMode === StoreMode.PRODUCT && product?.shippingMethod !== 'digital';

  const [step, setStep] = useState<'info' | 'paying' | 'success' | 'oos'>('info');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [detectedSource, setDetectedSource] = useState('Direct');
  const [notified, setNotified] = useState(false);
  const [messagingStatus, setMessagingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (product && product.stock <= 0) setStep('oos');
    const utm = queryParams.get('src') || queryParams.get('utm_source');
    if (utm) setDetectedSource(utm.charAt(0).toUpperCase() + utm.slice(1));
  }, [product]);

  const handleEmailBlur = async () => {
    if (email.includes('@')) {
      const history = await ApiService.getLastCustomerDetails(email);
      if (history) {
        setPhone(history.customerPhone || '');
        if (isPhysical) {
            setAddress(history.customerAddress || '');
            setPostalCode(history.customerPostalCode || '');
        }
      }
    }
  };

  if (!link || !product) return <div className="p-20 text-center font-black text-slate-400">۴۰۴ - محصول یافت نشد.</div>;

  const shippingFee = isPhysical ? (link.shippingFee || 0) : 0;
  const totalAmount = (product.discountPrice || product.price) + shippingFee;

  const handleProcessPayment = () => {
    if (!email || !phone) return alert('وارد کردن ایمیل و موبایل الزامی است.');
    if (isPhysical && (!address || !postalCode)) return alert('برای ارسال کالای فیزیکی، آدرس و کد پستی الزامی است.');
    
    setStep('paying');
    setTimeout(() => {
       if (window.confirm(`شبیه‌سازی درگاه: مبلغ ${totalAmount.toLocaleString()} پرداخت شد؟`)) {
         completeOrder();
       } else {
         setStep('info');
       }
    }, 1500);
  };

  const completeOrder = async () => {
    onSaleSuccess(link.slug, product.id, (product.discountPrice || product.price), { 
      email, phone, address, postalCode, source: 'direct', 
      trafficSource: detectedSource, shippingFee, totalPaid: totalAmount,
      bookingTime: requestedSlot || undefined
    });

    const prefs = link.integrations?.prefs;
    const channels = [];
    if (prefs?.telegram === 'yes') channels.push('تلگرام');
    if (prefs?.sms === 'yes') channels.push('پیامک');

    if (channels.length > 0) {
        setMessagingStatus(`در حال اطلاع‌رسانی به فروشنده از طریق ${channels.join(' و ')}...`);
        setTimeout(() => setStep('success'), 2000);
    } else {
        setStep('success');
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 text-right" dir="rtl">
        <div className="bg-white rounded-[3.5rem] p-12 max-w-md w-full shadow-2xl flex flex-col items-center">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8"><svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg></div>
            <h1 className="text-3xl font-black mb-4">عملیات موفقیت‌آمیز</h1>
            <p className="text-slate-500 font-bold mb-10 text-center">
               {storeMode === StoreMode.BOOKING 
                 ? `نوبت شما برای ساعت ${requestedSlot} رزرو شد.` 
                 : storeMode === StoreMode.SERVICE 
                 ? 'لینک دسترسی به خدمات برای شما ایمیل گردید.' 
                 : 'سفارش شما ثبت شد و به زودی ارسال می‌گردد.'}
            </p>
            <button onClick={() => navigate(`/s/${slug}`)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-lg">بازگشت به فروشگاه</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-right" dir="rtl">
      <aside className="lg:w-96 p-10 bg-white border-l border-slate-200 flex flex-col order-last lg:order-first">
         <h2 className="text-xl font-black mb-8">خلاصه فاکتور</h2>
         <div className="space-y-4 mb-8 flex-1">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
               <div className="flex justify-between text-sm font-black text-slate-800">
                  <span>{product.name}</span>
                  <span>{(product.discountPrice || product.price).toLocaleString()}</span>
               </div>
               {requestedSlot && (
                 <div className="flex justify-between text-[10px] font-black text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                    <span>زمان رزرو شده:</span>
                    <span>{requestedSlot}</span>
                 </div>
               )}
               {isPhysical && (
                 <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>هزینه ارسال پستی</span><span>{shippingFee.toLocaleString()}</span></div>
               )}
            </div>
            <div className="h-px bg-slate-200 my-4"></div>
            <div className="flex justify-between text-2xl font-black text-indigo-600 px-4"><span>جمع کل:</span><span>{totalAmount.toLocaleString()} <span className="text-xs">تومان</span></span></div>
         </div>
      </aside>

      <main className="flex-1 p-8 lg:p-20 max-w-3xl mx-auto w-full">
         <div className="max-w-md mx-auto">
           <h1 className="text-3xl font-black mb-10">اطلاعات {storeMode === StoreMode.PRODUCT ? 'خریدار' : 'متقاضی'}</h1>
           <div className="space-y-6">
             <input type="email" placeholder="ایمیل شما" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none" value={email} onBlur={handleEmailBlur} onChange={e => setEmail(e.target.value)} />
             <input type="tel" placeholder="شماره همراه" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none text-left" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} />
             
             {isPhysical && (
               <>
                 <input type="text" placeholder="کد پستی" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none text-left" dir="ltr" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                 <textarea rows={4} placeholder="آدرس دقیق جهت ارسال" className="w-full px-6 py-4 rounded-[2rem] border border-slate-200 font-bold outline-none resize-none" value={address} onChange={e => setAddress(e.target.value)} />
               </>
             )}

             <button onClick={handleProcessPayment} className="w-full py-6 bg-indigo-600 text-white font-black text-xl rounded-[2.5rem] shadow-2xl mt-6 hover:bg-indigo-700 transition-all">تایید نهایی و پرداخت</button>
           </div>
         </div>
      </main>
    </div>
  );
};

export default Checkout;
