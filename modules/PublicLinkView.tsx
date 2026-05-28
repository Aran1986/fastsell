
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SalesLink, Currency, StoreMode, Product } from '../types';
import { TrackingService } from '../services/trackingService';
import { ApiService } from '../services/apiService';
import BookingCalendar from '../components/public/BookingCalendar';
import Modal from '../components/common/Modal';
import ProductCheckout from '../components/checkout/ProductCheckout';
import BookingCheckout from '../components/checkout/BookingCheckout';

interface PublicLinkViewProps {
  links: SalesLink[];
}

const PublicLinkView: React.FC<PublicLinkViewProps> = ({ links: initialLinks }) => {
  const { slug } = useParams<{ slug: string }>();
  const [links, setLinks] = useState(initialLinks);
  const link = links.find(l => l.slug === slug);
  
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Record<string, string>>({}); // pId -> dateTime
  const [isSuccess, setIsSuccess] = useState(false);

  const storeMode = link?.mode || StoreMode.PRODUCT;
  const mainColor = link?.themeColor || '#6366f1';

  useEffect(() => {
    if (link) {
      link.products.forEach(p => TrackingService.trackView(link.slug, p.id));
    }
  }, [link]);

  const handleCheckoutClick = (p: Product) => {
    if (storeMode === StoreMode.BOOKING && !selectedDateTime[p.id]) {
      alert('لطفاً ابتدا روز و ساعت نوبت را انتخاب کنید.');
      return;
    }
    setCheckoutProduct(p);
  };

  const handleConfirmOrder = async (data: any) => {
    if (!link || !checkoutProduct) return;
    
    await ApiService.createOrder(link.slug, {
      productId: checkoutProduct.id,
      productName: checkoutProduct.name,
      amount: checkoutProduct.discountPrice || checkoutProduct.price,
      ...data
    });

    setCheckoutProduct(null);
    setIsSuccess(true);
    const all = await ApiService.getAllStores();
    setLinks(all);
  };

  if (!link) return <div className="p-20 text-center font-black">فروشگاه یافت نشد.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center relative pb-20" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-96 opacity-10 pointer-events-none" style={{ background: `linear-gradient(180deg, ${mainColor} 0%, transparent 100%)` }}></div>

      <header className="w-full max-w-2xl pt-16 pb-12 px-6 text-center z-10">
        <div className="w-24 h-24 rounded-[2.5rem] mx-auto border-8 border-white shadow-2xl flex items-center justify-center text-white text-4xl font-black mb-6" style={{ backgroundColor: mainColor }}>{link.title.charAt(0)}</div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">{link.title}</h1>
        <p className="text-slate-500 max-w-md mx-auto text-sm font-bold bg-white/50 backdrop-blur-sm py-3 px-6 rounded-2xl border border-white/50">{link.bio}</p>
      </header>

      <main className="w-full max-w-2xl px-6 space-y-6">
        {link.products.map(p => (
          <div key={p.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="flex flex-col">
              <div className="w-full h-64 relative overflow-hidden shrink-0">
                 <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={p.name} />
                 {p.durationMinutes && <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full">⏱️ {p.durationMinutes} دقیقه</div>}
              </div>
              <div className="p-8 flex flex-col text-right">
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-black text-slate-900">{p.name}</h3>
                    <span className="text-[10px] font-black bg-slate-50 px-3 py-1 rounded-lg text-slate-400">{p.category}</span>
                 </div>
                 <p className="text-sm text-slate-400 font-bold leading-relaxed mb-6">{p.description}</p>
                 
                 {storeMode === StoreMode.BOOKING && p.stock > 0 && (
                    <BookingCalendar 
                      availableSlots={p.availableSlots || []} 
                      selectedDateTime={selectedDateTime[p.id]} 
                      onSelect={(dt) => setSelectedDateTime({...selectedDateTime, [p.id]: dt})} 
                    />
                 )}

                 <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-8">
                    <div>
                       <span className="block text-[10px] font-black text-slate-300 uppercase mb-1">{storeMode === StoreMode.PRODUCT ? 'قیمت کالا' : 'تعرفه'}</span>
                       <div className="font-black text-slate-900 text-2xl" style={{ color: mainColor }}>
                          {(p.discountPrice || p.price).toLocaleString()} <span className="text-xs mr-1">تومان</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleCheckoutClick(p)} 
                      style={{ backgroundColor: link.buyButtonColor || mainColor }} 
                      className="text-white px-10 py-4 rounded-[1.8rem] text-sm font-black shadow-lg hover:scale-105 transition-all"
                    >
                       {storeMode === StoreMode.BOOKING ? 'رزرو نوبت' : storeMode === StoreMode.SERVICE ? 'ثبت‌نام' : 'خرید محصول'}
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Checkout Modal */}
      <Modal 
        isOpen={!!checkoutProduct} 
        onClose={() => setCheckoutProduct(null)} 
        title={checkoutProduct?.name}
      >
        {checkoutProduct && (
          storeMode === StoreMode.PRODUCT ? (
            <ProductCheckout 
              product={checkoutProduct} 
              link={link} 
              onConfirm={handleConfirmOrder} 
            />
          ) : (
            <BookingCheckout 
              product={checkoutProduct} 
              link={link} 
              selectedTime={selectedDateTime[checkoutProduct.id]} 
              onConfirm={handleConfirmOrder} 
            />
          )
        )}
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={isSuccess} onClose={() => setIsSuccess(false)} title="تراکنش موفق">
         <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
            <p className="text-slate-600 font-bold">سفارش یا رزرو شما با موفقیت ثبت شد و تاییدیه برایتان ارسال گردید.</p>
            <button onClick={() => setIsSuccess(false)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl">بستن</button>
         </div>
      </Modal>
    </div>
  );
};

export default PublicLinkView;
