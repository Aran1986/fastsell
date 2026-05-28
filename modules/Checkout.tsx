
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SalesLink, StoreMode } from '../types';
import { ApiService } from '../services/apiService';
import PhysicalShippingForm from '../components/checkout/PhysicalShippingForm';
import ServiceAccessForm from '../components/checkout/ServiceAccessForm';
import BookingDetailsForm from '../components/checkout/BookingDetailsForm';

interface CheckoutProps {
  links: SalesLink[];
  onSaleSuccess: (slug: string, productId: string, amount: number, customerData: any) => void;
  // Made optional to support direct routing without prop drilling from App.tsx
  initialProductId?: string;
  initialStoreSlug?: string;
  initialBookingTime?: string;
}

const Checkout: React.FC<CheckoutProps> = ({ links, onSaleSuccess, initialProductId, initialStoreSlug, initialBookingTime }) => {
  // Extract params from URL if not provided via props
  const { slug: paramSlug, productId: paramProductId } = useParams<{ slug: string; productId: string }>();
  
  const effectiveSlug = initialStoreSlug || paramSlug;
  const effectiveProductId = initialProductId || paramProductId;

  const link = links.find(l => l.slug === effectiveSlug);
  const product = link?.products.find(p => p.id === effectiveProductId);
  const storeMode = link?.mode || StoreMode.PRODUCT;
  
  const [step, setStep] = useState<'info' | 'paying' | 'success'>('info');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const isPhysical = storeMode === StoreMode.PRODUCT && product?.shippingMethod !== 'digital';
  const shippingFee = isPhysical ? (link?.shippingFee || 0) : 0;
  const totalAmount = ((product?.discountPrice || product?.price || 0) + shippingFee);

  if (!link || !product) return <div className="p-20 text-center font-black">خطا در بارگذاری اطلاعات.</div>;

  const handleProcessPayment = () => {
    if (!email || !phone) return alert('لطفاً ایمیل و شماره همراه را وارد کنید.');
    if (isPhysical && (!address || !postalCode)) return alert('برای کالای فیزیکی، آدرس الزامی است.');
    
    setStep('paying');
    setTimeout(() => {
       if (window.confirm(`شبیه‌سازی: مبلغ ${totalAmount.toLocaleString()} تومان واریز شد؟`)) {
         onSaleSuccess(link.slug, product.id, (product.discountPrice || product.price), { 
           customerEmail: email, customerPhone: phone, customerAddress: address, customerPostalCode: postalCode,
           shippingFee, totalPaid: totalAmount, bookingTime: initialBookingTime
         });
         setStep('success');
       } else {
         setStep('info');
       }
    }, 1500);
  };

  if (step === 'success') {
    return (
      <div className="h-full flex items-center justify-center p-12 text-center" dir="rtl">
        <div className="space-y-6">
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">✓</div>
            <h1 className="text-3xl font-black">عملیات موفقیت‌آمیز</h1>
            <p className="text-slate-500 font-bold leading-relaxed max-w-xs mx-auto">
               {storeMode === StoreMode.BOOKING 
                 ? `نوبت شما برای ${initialBookingTime} رزرو گردید.` 
                 : storeMode === StoreMode.SERVICE 
                 ? 'لینک دسترسی برای شما ارسال شد.' 
                 : 'سفارش شما با موفقیت ثبت و آماده ارسال شد.'}
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full text-right" dir="rtl">
      <aside className="lg:w-80 p-10 bg-slate-50 border-l border-slate-100 space-y-8">
         <h2 className="text-xl font-black text-slate-800">خلاصه فاکتور</h2>
         <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-sm">
               <div className="flex justify-between text-sm font-black text-slate-700">
                  <span>{product.name}</span>
                  <span>{(product.discountPrice || product.price).toLocaleString()}</span>
               </div>
               {initialBookingTime && (
                 <div className="flex justify-between text-[10px] font-black text-indigo-600 bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                    <span>زمان انتخابی:</span>
                    <span>{initialBookingTime}</span>
                 </div>
               )}
               {isPhysical && (
                 <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>هزینه ارسال</span><span>{shippingFee.toLocaleString()}</span></div>
               )}
            </div>
            <div className="flex justify-between text-2xl font-black text-indigo-600 px-2 pt-4 border-t border-slate-200">
               <span>جمع کل:</span>
               <span>{totalAmount.toLocaleString()} <span className="text-xs">ت</span></span>
            </div>
         </div>
      </aside>

      <main className="flex-1 p-10 lg:p-16 max-w-2xl mx-auto w-full space-y-10">
         <div className="space-y-8">
           <h1 className="text-3xl font-black text-slate-900">مشخصات {storeMode === StoreMode.PRODUCT ? 'تحویل‌گیرنده' : 'متقاضی'}</h1>
           <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">ایمیل جهت رسید</label>
                <input type="email" placeholder="example@mail.com" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" value={email} onChange={e => setEmail(e.target.value)} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تلفن همراه</label>
                <input type="tel" placeholder="0912XXXXXXX" className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none text-left focus:ring-2 focus:ring-indigo-100 transition-all" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} />
             </div>
             
             <div className="pt-6 border-t border-slate-50">
               {storeMode === StoreMode.PRODUCT && isPhysical && <PhysicalShippingForm address={address} setAddress={setAddress} postalCode={postalCode} setPostalCode={setPostalCode} />}
               {storeMode === StoreMode.SERVICE && <ServiceAccessForm />}
               {storeMode === StoreMode.BOOKING && <BookingDetailsForm slot={initialBookingTime || ''} />}
             </div>

             <button onClick={handleProcessPayment} className="w-full py-6 bg-indigo-600 text-white font-black text-xl rounded-[2.5rem] shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all">
               {step === 'paying' ? 'در حال تایید...' : 'پرداخت و نهایی‌سازی'}
             </button>
           </div>
         </div>
      </main>
    </div>
  );
};

export default Checkout;
