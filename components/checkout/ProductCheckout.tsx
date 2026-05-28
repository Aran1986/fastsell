
import React, { useState } from 'react';
import { Product, SalesLink } from '../../types';

interface ProductCheckoutProps {
  product: Product;
  link: SalesLink;
  onConfirm: (data: any) => void;
}

const ProductCheckout: React.FC<ProductCheckoutProps> = ({ product, link, onConfirm }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const shippingFee = product.shippingMethod !== 'digital' ? (link.shippingFee || 0) : 0;
  const total = (product.discountPrice || product.price) + shippingFee;

  return (
    <div className="flex flex-col lg:flex-row h-full" dir="rtl">
      <div className="flex-1 p-10 space-y-8">
        <h4 className="text-2xl font-black">مشخصات گیرنده کالا</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="email" placeholder="ایمیل" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none" />
          <input type="tel" placeholder="شماره تماس" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none text-left" dir="ltr" />
          <input type="text" placeholder="کد پستی ۱۰ رقمی" value={postalCode} onChange={e => setPostalCode(e.target.value)} className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none text-left" dir="ltr" />
          <div className="md:col-span-2">
            <textarea rows={3} placeholder="آدرس دقیق پستی" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none resize-none" />
          </div>
        </div>
        <button 
          onClick={() => onConfirm({ email, phone, address, postalCode, shippingFee, total })}
          className="w-full py-6 bg-indigo-600 text-white font-black text-xl rounded-[2rem] shadow-xl hover:bg-indigo-700 transition-all"
        >
          تایید و پرداخت {(total).toLocaleString()} تومان
        </button>
      </div>
      <aside className="w-full lg:w-80 bg-slate-50 p-10 border-r border-slate-100">
        <h5 className="font-black mb-6">فاکتور نهایی</h5>
        <div className="space-y-4 text-sm font-bold">
           <div className="flex justify-between"><span>قیمت واحد:</span><span>{product.price.toLocaleString()}</span></div>
           {product.discountPrice && <div className="flex justify-between text-orange-500"><span>تخفیف:</span><span>{(product.price - product.discountPrice).toLocaleString()}</span></div>}
           <div className="flex justify-between"><span>هزینه ارسال:</span><span>{shippingFee.toLocaleString()}</span></div>
           <div className="pt-4 border-t border-slate-200 flex justify-between text-indigo-600 font-black text-lg"><span>جمع کل:</span><span>{total.toLocaleString()}</span></div>
        </div>
      </aside>
    </div>
  );
};

export default ProductCheckout;
