
import React, { useState, useEffect } from 'react';
import { SalesLink, Product, Currency, StoreMode } from '../../types';
import Modal from '../../components/common/Modal';

interface ProductManagerProps {
  activeLink: SalesLink;
  onAddProduct: (linkId: string, product: any) => void;
  onDeleteProduct: (linkId: string, productId: string) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ activeLink, onAddProduct, onDeleteProduct }) => {
  const mode = activeLink.mode || StoreMode.PRODUCT;
  const [isAdding, setIsAdding] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(10);
  const [cat, setCat] = useState('');
  const [desc, setDesc] = useState('');
  const [shipping, setShipping] = useState<'post' | 'delivery' | 'digital'>('post');
  
  // Visual Scheduler States (for Service/Booking)
  const [selectedDays, setSelectedDays] = useState<string[]>(['شنبه', 'یکشنبه', 'دوشنبه']);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    if (!cat) setCat(mode === StoreMode.PRODUCT ? 'کالای فیزیکی' : 'خدمات تخصصی');
  }, [mode, cat]);

  const handleAdd = () => {
    if (!name) return alert('نام مورد الزامی است.');
    
    const generatedSlots = mode === StoreMode.BOOKING ? [
        `روزهای: ${selectedDays.join('، ')}`,
        `ساعت کاری: ${startTime} الی ${endTime}`
    ] : undefined;

    onAddProduct(activeLink.id, { 
      name, price, stock, category: cat, description: desc,
      shippingMethod: mode === StoreMode.PRODUCT ? shipping : 'digital',
      availableSlots: generatedSlots,
      image: `https://loremflickr.com/600/600/${encodeURIComponent(name)}`,
      currency: Currency.IRR,
      rating: 5.0, reviewCount: 0, salesCount: 0
    });
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setName(''); setPrice(0); setDesc(''); setStock(10);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex justify-between items-center">
         <h3 className="font-black text-slate-800">مدیریت لیست {mode === StoreMode.PRODUCT ? 'کالاها' : 'خدمات و نوبت‌ها'}</h3>
         <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-lg">+ ثبت مورد جدید</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[...activeLink.products].reverse().map(p => (
           <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex items-center gap-6 group hover:shadow-xl transition-all">
              <img src={p.image} className="w-16 h-16 rounded-2xl object-cover" alt="" />
              <div className="flex-1 text-right">
                 <div className="font-black text-slate-900">{p.name}</div>
                 <div className="text-[10px] text-slate-400 font-bold mt-1">{p.category} | {p.price.toLocaleString()} تومان</div>
              </div>
              <button onClick={() => onDeleteProduct(activeLink.id, p.id)} className="text-red-400 hover:text-red-600 font-black text-xs transition-colors px-4 py-2 hover:bg-red-50 rounded-xl">حذف</button>
           </div>
        ))}
      </div>

      <Modal isOpen={isAdding} onClose={() => setIsAdding(false)} title={`تعریف مورد جدید در ${activeLink.title}`}>
        <div className="p-8 space-y-8 text-right" dir="rtl">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">عنوان مورد (کالا یا خدمت)</label>
                 <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="مثلاً: آموزش گیتار مقدماتی" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">دسته‌بندی</label>
                 <input type="text" value={cat} onChange={e => setCat(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
           </div>

           {/* COMPLETE PHYSICAL FIELDS RESTORED */}
           {mode === StoreMode.PRODUCT && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-indigo-400 mr-2">روش ارسال پیش‌فرض کالا</label>
                   <select value={shipping} onChange={e => setShipping(e.target.value as any)} className="w-full px-5 py-4 rounded-xl bg-white border border-indigo-200 font-bold outline-none">
                      <option value="post">پست پیشتاز (سراسر کشور)</option>
                      <option value="delivery">پیک شهری (تحویل فوری)</option>
                      <option value="digital">فایل دیجیتال (ارسال خودکار)</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-indigo-400 mr-2">تعداد موجودی انبار</label>
                   <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-white border border-indigo-200 font-bold outline-none" />
                </div>
             </div>
           )}

           {/* VISUAL SCHEDULER FOR BOOKING/SERVICE MODES */}
           {mode !== StoreMode.PRODUCT && (
             <div className="space-y-6 p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100 animate-in slide-in-from-top-2">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-amber-600 mr-2 uppercase tracking-widest">۱. انتخاب روزهای ارائه خدمت در هفته</label>
                   <div className="flex flex-wrap gap-2">
                      {['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'].map(day => (
                        <button 
                          key={day}
                          onClick={() => setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedDays.includes(day) ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-amber-400 border border-amber-100 hover:border-amber-300'}`}
                        >
                          {day}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-amber-600 mr-2 uppercase tracking-widest">۲. بازه زمانی فعالیت (ساعت)</label>
                   <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                         <span className="text-[8px] font-black text-slate-400 block mr-2">از ساعت:</span>
                         <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-white border border-amber-100 font-bold outline-none text-center shadow-inner" />
                      </div>
                      <div className="text-amber-300 text-2xl pt-6 font-black">←</div>
                      <div className="flex-1 space-y-2">
                         <span className="text-[8px] font-black text-slate-400 block mr-2">تا ساعت:</span>
                         <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-white border border-amber-100 font-bold outline-none text-center shadow-inner" />
                      </div>
                   </div>
                </div>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">قیمت نهایی (تومان)</label>
                 <input type="number" value={price || ''} onChange={e => setPrice(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">توضیحات تکمیلی</label>
                 <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 font-bold outline-none resize-none h-14" />
              </div>
           </div>

           <div className="flex gap-4">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all">انصراف</button>
              <button onClick={handleAdd} className="flex-[2] py-5 bg-indigo-600 text-white font-black text-lg rounded-[2rem] shadow-xl hover:bg-indigo-700 transition-all">تایید و انتشار نهایی</button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductManager;
