
import React, { useState, useMemo } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { SalesLink, Product, Currency, ProductVariant } from '../../types';
import { generateProductDescription } from '../../services/geminiService';

interface ProductManagerProps {
  activeLink: SalesLink;
  onAddProduct: (linkId: string, product: Omit<Product, 'id' | 'salesCount'>) => void;
  onDeleteProduct: (linkId: string, productId: string) => void;
  onUpdateProfile?: (linkId: string, data: any) => void; // For updating store categories inline
}

const ProductManager: React.FC<ProductManagerProps> = ({ activeLink, onAddProduct, onDeleteProduct, onUpdateProfile }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState(10);
  const [curr, setCurr] = useState<Currency>(activeLink.defaultCurrency || Currency.USD);
  const [cat, setCat] = useState(activeLink.categories[0] || 'عمومی');
  const [newCatName, setNewCatName] = useState('');
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [shipping, setShipping] = useState<'post' | 'delivery' | 'digital'>('post');
  const [desc, setDesc] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Predefined Values for Quick Selection
  const colorPresets = ['مشکی', 'سفید', 'قرمز', 'آبی', 'طلایی', 'نقره‌ای', 'سبز'];
  const sizePresets = ['S', 'M', 'L', 'XL', 'XXL', '38', '40', '42'];
  const weightPresets = ['۱۰۰ گرم', '۲۵۰ گرم', '۵۰۰ گرم', '۱ کیلوگرم', '۲ کیلوگرم'];

  // Advanced Variants State
  const [vColor, setVColor] = useState('');
  const [vSize, setVSize] = useState('');
  const [vWeight, setVWeight] = useState('');
  const [customVName, setCustomVName] = useState('');
  const [customVVal, setCustomVVal] = useState('');

  // Image States
  const [tempImg, setTempImg] = useState<string | null>(null);
  const [croppedImg, setCroppedImg] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);

  const getBaseUrl = () => {
    const loc = window.location;
    return `${loc.protocol}//${loc.host}/#`;
  };

  const handleCopyDirectLink = (productId: string) => {
    const link = `${getBaseUrl()}/checkout/${activeLink.slug}/${productId}`;
    navigator.clipboard.writeText(link).then(() => alert('لینک خرید مستقیم برای این کالا کپی شد!'));
  };

  const handleAIDesc = async () => {
    if (!name) return alert('ابتدا نام کالا را وارد کنید');
    setIsGeneratingDesc(true);
    const result = await generateProductDescription(name);
    setDesc(result);
    setIsGeneratingDesc(false);
  };

  const togglePreset = (current: string, val: string, setter: (v: string) => void) => {
    const parts = current.split(',').map(s => s.trim()).filter(s => s);
    if (parts.includes(val)) {
      setter(parts.filter(p => p !== val).join(', '));
    } else {
      setter(current ? `${current}, ${val}` : val);
    }
  };

  const handleAddNewCategory = () => {
    if (!newCatName.trim()) return;
    const updatedCats = [...activeLink.categories, newCatName.trim()];
    onUpdateProfile?.(activeLink.id, { categories: updatedCats });
    setCat(newCatName.trim());
    setNewCatName('');
    setIsAddingNewCat(false);
  };

  const handleAdd = () => {
    if (!name) return alert('نام محصول الزامی است');
    
    const finalVariants: ProductVariant[] = [];
    if (vColor.trim()) finalVariants.push({ name: 'رنگ', options: vColor.split(',').map(s => s.trim()) });
    if (vSize.trim()) finalVariants.push({ name: 'سایز', options: vSize.split(',').map(s => s.trim()) });
    if (vWeight.trim()) finalVariants.push({ name: 'وزن', options: vWeight.split(',').map(s => s.trim()) });
    if (customVName && customVVal) finalVariants.push({ name: customVName, options: customVVal.split(',').map(s => s.trim()) });

    const fallbackImage = `https://loremflickr.com/600/600/${encodeURIComponent(name || cat)},product/all`;
    
    onAddProduct(activeLink.id, { 
      name, price, discountPrice, stock, currency: curr, category: cat, description: desc, isFeatured: featured,
      variants: finalVariants, image: croppedImg || fallbackImage, shippingMethod: shipping,
      rating: 4.5 + Math.random() * 0.5, reviewCount: Math.floor(Math.random() * 20)
    });
    setIsAdding(false);
    reset();
  };

  const reset = () => {
    setName(''); setPrice(0); setDiscountPrice(undefined); setStock(10); setDesc(''); setFeatured(false); setCroppedImg(null); 
    setVColor(''); setVSize(''); setVWeight(''); setCustomVName(''); setCustomVVal('');
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
        <input type="text" placeholder="جستجو در محصولات..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-right" dir="rtl" />
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">افزودن محصول جدید</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeLink.products.filter(p => p.name.includes(search)).reverse().map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex flex-col sm:flex-row items-center gap-8 group hover:shadow-xl transition-all">
               <img src={p.image} className="w-20 h-20 rounded-[1.5rem] object-cover" alt="" />
               <div className="flex-1 text-right">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                    {p.discountPrice && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black">تخفیف</span>}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 items-center text-[10px] font-black">
                    <span className="text-indigo-600">{(p.discountPrice || p.price).toLocaleString()} {p.currency}</span>
                    <span className="text-slate-400">موجودی: {p.stock}</span>
                    <span className="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg">{p.category}</span>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => handleCopyDirectLink(p.id)} className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    کپی لینک خرید
                  </button>
                  <button onClick={() => onDeleteProduct(activeLink.id, p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-black">حذف کالا</button>
               </div>
            </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[700] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full my-8 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-3xl font-black mb-8 text-right">ثبت کالای جدید</h2>
            <div className="space-y-6 text-right" dir="rtl">
               
               {/* Image Section */}
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تصویر محصول</label>
                  {tempImg ? (
                    <div className="relative h-64 rounded-[2rem] overflow-hidden border-2 border-slate-100">
                      <Cropper image={tempImg} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={(_, p) => setPixels(p)} onZoomChange={setZoom} />
                      <button onClick={finishCrop} className="absolute bottom-4 left-4 right-4 bg-indigo-600 text-white py-4 rounded-2xl font-black">تایید تصویر</button>
                    </div>
                  ) : croppedImg ? (
                    <img src={croppedImg} onClick={() => setCroppedImg(null)} className="w-full h-40 object-cover rounded-[2rem] border-2 border-slate-100 cursor-pointer" alt="" />
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 transition-all">
                       <span className="text-slate-400 font-black">انتخاب عکس کالا</span>
                       <input type="file" className="hidden" onChange={e => {
                         const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload = () => setTempImg(r.result as string); r.readAsDataURL(f); }
                       }} />
                    </label>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">نام کالا</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">دسته‌بندی</label>
                    <div className="flex gap-2">
                       {isAddingNewCat ? (
                         <div className="flex-1 flex gap-2">
                            <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl outline-none font-bold text-xs" placeholder="نام دسته..." />
                            <button onClick={handleAddNewCategory} className="bg-indigo-600 text-white px-4 rounded-xl font-black text-[10px]">تایید</button>
                            <button onClick={() => setIsAddingNewCat(false)} className="text-red-500 font-black text-lg">×</button>
                         </div>
                       ) : (
                         <>
                           <select value={cat} onChange={e => setCat(e.target.value)} className="flex-1 px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-black text-xs">
                              {activeLink.categories.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                           <button onClick={() => setIsAddingNewCat(true)} className="bg-slate-100 text-slate-600 px-4 rounded-xl font-black text-lg">+</button>
                         </>
                       )}
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">قیمت اصلی</label>
                    <input type="number" value={price || ''} onChange={e => setPrice(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-red-400 uppercase">قیمت حراج</label>
                    <input type="number" value={discountPrice || ''} onChange={e => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)} className="w-full px-5 py-4 rounded-xl bg-red-50 border border-red-100 outline-none font-bold text-red-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">موجودی انبار</label>
                    <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" />
                  </div>
               </div>

               {/* Description Section with AI */}
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase">توضیحات کالا</label>
                    <button onClick={handleAIDesc} disabled={isGeneratingDesc} className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:underline">
                       {isGeneratingDesc ? 'در حال نگارش...' : '✨ جادوی متن هوشمند'}
                    </button>
                  </div>
                  <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-6 py-4 rounded-[2rem] border border-slate-200 font-bold outline-none resize-none text-sm" placeholder="توضیحاتی کوتاه درباره محصول..." />
               </div>

               {/* Updated Preset Variants Section */}
               <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 space-y-8">
                  <h4 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-3">مشخصات فنی و ظاهری</h4>
                  
                  {/* Color Section */}
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-slate-700">رنگ</label>
                     <input type="text" value={vColor} onChange={e => setVColor(e.target.value)} placeholder="مثلاً: قرمز، آبی" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-xs font-bold" />
                     <div className="flex flex-wrap gap-2">
                        {colorPresets.map(c => (
                          <button key={c} onClick={() => togglePreset(vColor, c, setVColor)} className={`px-3 py-1 rounded-lg text-[9px] font-black border transition-all ${vColor.includes(c) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}>{c}</button>
                        ))}
                     </div>
                  </div>

                  {/* Size Section */}
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-slate-700">سایز</label>
                     <input type="text" value={vSize} onChange={e => setVSize(e.target.value)} placeholder="مثلاً: XL, L, 42" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-xs font-bold" />
                     <div className="flex flex-wrap gap-2">
                        {sizePresets.map(s => (
                          <button key={s} onClick={() => togglePreset(vSize, s, setVSize)} className={`px-3 py-1 rounded-lg text-[9px] font-black border transition-all ${vSize.includes(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}>{s}</button>
                        ))}
                     </div>
                  </div>

                  {/* Weight Section */}
                  <div className="space-y-3">
                     <label className="text-[11px] font-black text-slate-700">وزن</label>
                     <input type="text" value={vWeight} onChange={e => setVWeight(e.target.value)} placeholder="مثلاً: ۵۰۰ گرم" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-xs font-bold" />
                     <div className="flex flex-wrap gap-2">
                        {weightPresets.map(w => (
                          <button key={w} onClick={() => togglePreset(vWeight, w, setVWeight)} className={`px-3 py-1 rounded-lg text-[9px] font-black border transition-all ${vWeight.includes(w) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}>{w}</button>
                        ))}
                     </div>
                  </div>

                  {/* Custom Section */}
                  <div className="p-4 bg-white rounded-2xl border border-indigo-50 flex gap-4">
                     <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-indigo-400">سایر مشخصات (عنوان)</label>
                        <input type="text" value={customVName} onChange={e => setCustomVName(e.target.value)} placeholder="مثلاً: جنس" className="w-full px-4 py-2 rounded-lg border border-slate-100 outline-none text-[10px] font-bold" />
                     </div>
                     <div className="flex-[2] space-y-2">
                        <label className="text-[10px] font-black text-indigo-400">سایر مشخصات (مقادیر)</label>
                        <input type="text" value={customVVal} onChange={e => setCustomVVal(e.target.value)} placeholder="مثلاً: چرم، کتان" className="w-full px-4 py-2 rounded-lg border border-slate-100 outline-none text-[10px] font-bold" />
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button onClick={handleAdd} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all">انتشار کالا در فروشگاه</button>
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
