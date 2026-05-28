
import React, { useState } from 'react';
import { Product, SalesLink } from '../../types';

interface BookingCheckoutProps {
  product: Product;
  link: SalesLink;
  selectedTime: string;
  onConfirm: (data: any) => void;
}

const BookingCheckout: React.FC<BookingCheckoutProps> = ({ product, link, selectedTime, onConfirm }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const total = (product.discountPrice || product.price);

  return (
    <div className="flex flex-col lg:flex-row h-full" dir="rtl">
      <div className="flex-1 p-10 space-y-8">
        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
           <h4 className="font-black text-amber-900 mb-2">زمان رزرو شده:</h4>
           <div className="text-2xl font-black text-amber-600">{selectedTime}</div>
           <p className="text-[10px] font-bold text-amber-500 mt-2">لطفاً ۱۵ دقیقه قبل از زمان تعیین شده در محل حضور داشته باشید.</p>
        </div>
        
        <div className="space-y-6">
          <input type="email" placeholder="ایمیل جهت دریافت تاییدیه" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none" />
          <input type="tel" placeholder="شماره موبایل" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none text-left" dir="ltr" />
        </div>

        <button 
          onClick={() => onConfirm({ email, phone, bookingTime: selectedTime, total })}
          className="w-full py-6 bg-slate-900 text-white font-black text-xl rounded-[2rem] shadow-xl"
        >
          تایید و رزرو نهایی
        </button>
      </div>
      <aside className="w-full lg:w-80 bg-slate-50 p-10 border-r border-slate-100">
        <h5 className="font-black mb-6">جزئیات رزرو</h5>
        <div className="space-y-4 text-sm font-bold">
           <div className="flex justify-between"><span>هزینه نوبت:</span><span>{total.toLocaleString()}</span></div>
           <div className="pt-4 border-t border-slate-200 flex justify-between text-indigo-600 font-black text-lg"><span>جمع کل:</span><span>{total.toLocaleString()}</span></div>
        </div>
      </aside>
    </div>
  );
};

export default BookingCheckout;
