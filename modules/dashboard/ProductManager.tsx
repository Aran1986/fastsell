
import React, { useState, useMemo } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { SalesLink, Product, Currency, ProductVariant, StoreMode } from '../../types';
import { generateProductDescription } from '../../services/geminiService';
import { ApiService } from '../../services/apiService';

interface ProductManagerProps {
  activeLink: SalesLink;
  onAddProduct: (linkId: string, product: Omit<Product, 'id' | 'salesCount'>) => void;
  onDeleteProduct: (linkId: string, productId: string) => void;
  onUpdateProfile?: (linkId: string, data: any) => void;
  refreshData?: () => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ activeLink, onAddProduct, onDeleteProduct, onUpdateProfile, refreshData }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [editingDiscountId, setEditingDiscountId] = useState<string | null>(null);
  const [tempDiscountPrice, setTempDiscountPrice] = useState<string>('');
  
  const mode = activeLink.mode || StoreMode.PRODUCT;

  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState(10);
  const [curr, setCurr] = useState<Currency>(activeLink.defaultCurrency || Currency.USD);
  const [cat, setCat] = useState(activeLink.categories[0] || 'عمومی');
  const [newCatName, setNewCatName] = useState('');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [shipping, setShipping] = useState<'post' | 'delivery' | 'digital'>(mode === StoreMode.PRODUCT ? 'post' : 'digital');
  const [desc, setDesc] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Service & Booking Specific
  const [duration, setDuration] = useState(60);
  const [isOnline, setIsOnline] = useState(true);
  const [slots, setSlots] = useState<string>('09:00, 10:00, 11:00, 14:00, 15:00');

  const [vColor, setVColor] = useState('');
  const [vSize, setVSize] = useState('');
  const [vWeight, setVWeight] = useState('');
  const [customVName, setCustomVName] = useState('');
  const [customVVal, setCustomVVal] = useState('');

  const [tempImg, setTempImg] = useState<string | null>(null);
  const [croppedImg, setCroppedImg] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);

  const getLabels = () => {
    switch(mode) {
      case StoreMode.SERVICE: return { add: 'تعریف خدمت جدید', name: 'عنوان خدمت / دوره', price: 'هزینه دوره', stock: 'ظرفیت ثبت‌نام' };
      case StoreMode.BOOKING: return { add: 'تعریف نوبت جدید', name: 'عنوان مشاوره / نوبت', price: 'هزینه رزرو', stock: 'تعداد نوبت' };
      default: return { add: 'افزودن محصول جدید', name: 'نام کالا', price: 'قیمت کالا', stock: 'موجودی انبار' };
    }
  };

  const labels = getLabels();

  const handleCopyDirectLink = (productId: string) => {
    const loc = window.location;
    const link = `${loc.protocol}//${loc.host}/#/checkout/${activeLink.slug}/${productId}`;
    navigator.clipboard.writeText(link).then(() => alert('لینک مستقیم کپی شد!'));
  };

  const handleAIDesc = async () => {
    if (!name) return alert('ابتدا نام کالا/خدمت را وارد کنید');
    setIsGeneratingDesc(true);
    const result = await generateProductDescription(name);
    setDesc(result);
    setIsGeneratingDesc(false);
  };

  const handleAdd = () => {
    if (!name) return alert('عنوان الزامی است');
    const finalVariants: ProductVariant[] = [];
    if (vColor.trim()) finalVariants.push({ name: 'رنگ', options: vColor.split(',').map(s => s.trim()) });
    if (vSize.trim()) finalVariants.push({ name: 'سایز', options: vSize.split(',').map(s => s.trim()) });
    if (customVName && customVVal) finalVariants.push({ name: customVName, options: customVVal.split(',').map(s => s.trim()) });

    const fallbackImage = `https://loremflickr.com/600/600/${encodeURIComponent(name || cat)},business/all`;
    
    onAddProduct(activeLink.id, { 
      name, price, discountPrice, stock, currency: curr, category: cat, description: desc, isFeatured: featured,
      variants: finalVariants, image: croppedImg || fallbackImage, shippingMethod: shipping,
      durationMinutes: mode !== StoreMode.PRODUCT ? duration : undefined,
      isOnline: mode !== StoreMode.PRODUCT ? isOnline : undefined,
      availableSlots: mode === StoreMode.BOOKING ? slots.split(',').map(s => s.trim()) : undefined,
      rating: 5.0, reviewCount: 0
    });
    setIsAdding(false);
    reset();
  };

  const reset = () => {
    setName(''); setPrice(0); setDiscountPrice(undefined); setStock(10); setDesc(''); setFeatured(false); setCroppedImg(null); 
    setVColor(''); setVSize(''); setVWeight(''); setCustomVName(''); setCustomVVal('');
    setDuration(60); setSlots('09:00, 10:00, 11:00');
  };

  const finishCrop = async () => {
    if (!tempImg || !pixels) return;
    const img = new Image(); img.src = tempImg;
    await new Promise(r => img.onload = r);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = 600; canvas.height = 600;
    ctx.drawImage(img, pixels.x, pixels.y, pixels.width, pixels.height, 0, 0, 600, 600);
    setCroppedImg(canvas.toDataURL('image/jpeg'));
    setTempImg(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <input type="text" placeholder={`جستجو در ${labels.add.split(' ')[1]}...`} value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-right" dir="rtl" />
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">{labels.add}</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {[...activeLink.products].filter(p => p.name.includes(search)).reverse().map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex flex-col sm:flex-row items-center gap-8 group hover:shadow-xl transition-all relative">
              <img src={p.image} className="w-20 h-20 rounded-[1.5rem] object-cover" alt="" />
              <div className="flex-1 text-right">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                    {p.isFeatured && <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full text-[8px] font-black">ویژه</span>}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 items-center text-[10px] font-black">
                    <span className="text-indigo-600">{(p.discountPrice || p.price).toLocaleString()} {p.currency}</span>
                    <span className="text-slate-400">باقیمانده: {p.stock}</span>
                    <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">{p.category}</span>
                  </div>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                  <button onClick={() => handleCopyDirectLink(p.id)} className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black flex items-center gap-1 border border-indigo-100">
                    کپی لینک خرید
                  </button>
                  <button onClick={() => onDeleteProduct(activeLink.id, p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-black">حذف</button>
              </div>
            </div>
          ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[700] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full my-8 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-3xl font-black mb-8 text-right">{labels.add}</h2>
            <div className="space-y-6 text-right" dir="rtl">
               {/* Image Section */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تصویر شاخص</label>
                  {tempImg ? (
                    <div className="relative h-64 rounded-[2rem] overflow-hidden border-2 border-slate-100">
                      <Cropper image={tempImg} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={(_, p) => setPixels(p)} onZoomChange={setZoom} />
                      <button onClick={finishCrop} className="absolute bottom-4 left-4 right-4 bg-indigo-600 text-white py-4 rounded-2xl font-black">تایید تصویر</button>
                    </div>
                  ) : croppedImg ? (
                    <img src={croppedImg} onClick={() => setCroppedImg(null)} className="w-full h-40 object-cover rounded-[2rem] border-2 border-slate-100 cursor-pointer" alt="" />
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 transition-all">
                       <span className="text-slate-400 font-black">انتخاب تصویر برای {mode}</span>
                       <input type="file" className="hidden" onChange={e => {
                         const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = () => setTempImg(r.result as string); r.readAsDataURL(f); }
                       }} />
                    </label>
                  )}
               </div>

               {/* Basic Details */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">{labels.name}</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" placeholder="مثلاً: دوربین کنون / مشاوره تخصصی" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">دسته‌بندی</label>
                    <select value={cat} onChange={e => setCat(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-black text-xs">
                       {activeLink.categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
               </div>

               {/* Mode Specific Fields */}
               {mode !== StoreMode.PRODUCT && (
                 <div className="grid grid-cols-2 gap-4 bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-indigo-400 uppercase">مدت زمان (دقیقه)</label>
                       <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl bg-white border border-indigo-100 outline-none font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-indigo-400 uppercase">نحوه برگزاری</label>
                       <div className="flex bg-white p-1 rounded-xl gap-1">
                          <button onClick={() => setIsOnline(true)} className={`flex-1 py-2 rounded-lg text-[9px] font-black ${isOnline ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>آنلاین</button>
                          <button onClick={() => setIsOnline(false)} className={`flex-1 py-2 rounded-lg text-[9px] font-black ${!isOnline ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>حضوری</button>
                       </div>
                    </div>
                    {mode === StoreMode.BOOKING && (
                      <div className="col-span-2 space-y-2 mt-2">
                         <label className="text-[10px] font-black text-indigo-400 uppercase">اسلات‌های زمانی مجاز (با کاما جدا کنید)</label>
                         <input type="text" value={slots} onChange={e => setSlots(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-indigo-100 outline-none font-mono text-[10px]" placeholder="09:00, 10:30, 12:00" />
                      </div>
                    )}
                 </div>
               )}

               {/* Pricing & Stock */}
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">{labels.price}</label>
                    <input type="number" value={price || ''} onChange={e => setPrice(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-red-400 uppercase">قیمت تخفیفی</label>
                    <input type="number" value={discountPrice || ''} onChange={e => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)} className="w-full px-5 py-4 rounded-xl bg-red-50 border border-red-100 outline-none font-bold text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">{labels.stock}</label>
                    <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" />
                  </div>
               </div>

               {/* Description */}
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase">توضیحات تکمیلی</label>
                    <button onClick={handleAIDesc} disabled={isGeneratingDesc} className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:underline">
                       {isGeneratingDesc ? 'در حال نگارش...' : '✨ نویسنده هوشمند AI'}
                    </button>
                  </div>
                  <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-6 py-4 rounded-[2rem] border border-slate-200 font-bold outline-none resize-none text-sm" placeholder="توضیحات ترغیب‌کننده..." />
               </div>

               <div className="flex gap-4 pt-4">
                  <button onClick={handleAdd} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all">تایید و انتشار نهایی</button>
                  <button onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black">انصراف</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
