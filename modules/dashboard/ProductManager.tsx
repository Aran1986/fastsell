
import React, { useState, useMemo } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { SalesLink, Product, Currency, ProductVariant } from '../../types';
import { generateProductDescription } from '../../services/geminiService';

interface ProductManagerProps {
  activeLink: SalesLink;
  onAddProduct: (linkId: string, product: Omit<Product, 'id' | 'salesCount'>) => void;
  onDeleteProduct: (linkId: string, productId: string) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ activeLink, onAddProduct, onDeleteProduct }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(10);
  const [curr, setCurr] = useState<Currency>(activeLink.defaultCurrency || Currency.USD);
  const [cat, setCat] = useState(activeLink.categories[0] || 'General');
  const [desc, setDesc] = useState('');
  const [featured, setFeatured] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Local helper for variant creation
  const [vName, setVName] = useState('');
  const [vOptions, setVOptions] = useState('');

  const addVariant = () => {
    if (!vName || !vOptions) return;
    setVariants([...variants, { name: vName, options: vOptions.split(',').map(s => s.trim()) }]);
    setVName(''); setVOptions('');
  };

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
    navigator.clipboard.writeText(link).then(() => alert('لینک مستقیم پرداخت کپی شد!'));
  };

  const filtered = useMemo(() => {
    return activeLink.products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).reverse();
  }, [activeLink.products, search]);

  const handleAdd = () => {
    if (!name) return alert('نام محصول الزامی است');
    
    // Improved fallback image logic: Use keyword-based placeholder
    const fallbackImage = `https://loremflickr.com/600/600/${encodeURIComponent(name || cat)},product/all`;
    
    onAddProduct(activeLink.id, { 
      name, price, stock, currency: curr, category: cat, description: desc, isFeatured: featured,
      variants, image: croppedImg || fallbackImage
    });
    setIsAdding(false);
    reset();
  };

  const reset = () => {
    setName(''); setPrice(0); setStock(10); setDesc(''); setFeatured(false); setCroppedImg(null); setVariants([]);
  };

  const handleGenerateAI = async () => {
    if (!name) return alert('ابتدا نام محصول را وارد کنید');
    setIsGeneratingDesc(true);
    try {
      const aiDesc = await generateProductDescription(name);
      setDesc(aiDesc);
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const finishCrop = async () => {
    if (!tempImg || !pixels) return;
    const img = new Image();
    img.src = tempImg;
    await new Promise(r => img.onload = r);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 600; canvas.height = 600;
    ctx.drawImage(img, pixels.x, pixels.y, pixels.width, pixels.height, 0, 0, 600, 600);
    setCroppedImg(canvas.toDataURL('image/jpeg'));
    setTempImg(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <input type="text" placeholder="جستجو در محصولات..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold" />
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">افزودن محصول جدید</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 flex items-center gap-8 group hover:shadow-xl transition-all">
               <img src={p.image} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
               <div className="flex-1 text-right">
                  <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                  <div className="flex gap-4 mt-2 items-center">
                    <span className="text-sm font-black text-indigo-600">{p.price.toLocaleString()} {p.currency}</span>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full ${p.stock <= 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>موجودی: {p.stock}</span>
                    <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full">{p.category}</span>
                  </div>
               </div>
               
               <div className="flex gap-2">
                  <button onClick={() => handleCopyDirectLink(p.id)} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2" title="کپی لینک مستقیم">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                    <span className="text-[10px] font-black hidden lg:inline">لینک مستقیم</span>
                  </button>
                  <button onClick={() => onDeleteProduct(activeLink.id, p.id)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
               </div>
            </div>
        ))}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[700] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <h2 className="text-3xl font-black mb-8 text-right">ثبت کالای جدید</h2>
            <div className="space-y-6">
               <div className="space-y-2 text-right">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تصویر اصلی</label>
                  {tempImg ? (
                    <div className="relative h-64 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-inner">
                      <Cropper image={tempImg} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={(_, p) => setPixels(p)} onZoomChange={setZoom} />
                      <button onClick={finishCrop} className="absolute bottom-4 left-4 right-4 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-2xl">تایید برش و آپلود</button>
                    </div>
                  ) : croppedImg ? (
                    <div className="relative h-40 group cursor-pointer" onClick={() => setCroppedImg(null)}>
                       <img src={croppedImg} className="w-full h-full object-cover rounded-[2rem] border-4 border-white shadow-lg" alt="" />
                       <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black transition-all">تغییر تصویر</div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-4 border-dashed border-slate-100 rounded-[2rem] cursor-pointer hover:bg-slate-50 transition-all">
                       <span className="text-slate-400 font-black">آپلود عکس محصول</span>
                       <span className="text-[9px] text-slate-300 mt-2">(در صورت خالی گذاشتن، تصویر هوشمند ساخته می‌شود)</span>
                       <input type="file" className="hidden" onChange={e => {
                         const f = e.target.files?.[0];
                         if(f){ const r = new FileReader(); r.onload = () => setTempImg(r.result as string); r.readAsDataURL(f); }
                       }} />
                    </label>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-slate-400 uppercase">نام کالا</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-slate-400 uppercase">موجودی انبار</label>
                    <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold" />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-slate-400 uppercase">قیمت واحد</label>
                    <input type="number" value={price || ''} onChange={e => setPrice(Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold" />
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-[10px] font-black text-slate-400 uppercase">واحد پول</label>
                    <select value={curr} onChange={e => setCurr(e.target.value as Currency)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-black">
                       <option value={Currency.IRR}>تومان</option>
                       <option value={Currency.CRYPTO}>تتر (USDT)</option>
                    </select>
                  </div>
               </div>

               {/* Description with AI generation */}
               <div className="space-y-2 text-right">
                  <div className="flex justify-between items-center mb-1">
                    <button 
                      type="button"
                      onClick={handleGenerateAI} 
                      disabled={isGeneratingDesc}
                      className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
                    >
                      {isGeneratingDesc ? 'در حال نوشتن...' : '⚡ تولید توضیحات هوشمند (Gemini)'}
                    </button>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">توضیحات کوتاه محصول</label>
                  </div>
                  <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 outline-none font-bold resize-none focus:bg-white focus:ring-2 focus:ring-indigo-50 transition-all" />
               </div>

               {/* Variants Section */}
               <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
                  <h4 className="text-sm font-black text-slate-900 text-right">ویژگی‌ها (رنگ، سایز، مدل و...)</h4>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {variants.map((v, i) => (
                      <span key={i} className="bg-white px-4 py-2 rounded-xl text-[10px] font-black border border-slate-200 flex items-center gap-2">
                        {v.name}: {v.options.join(', ')}
                        <button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 transition-colors">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2" dir="ltr">
                     <button onClick={addVariant} className="bg-indigo-600 text-white px-5 rounded-xl font-black text-xs shadow-lg shadow-indigo-100">افزودن</button>
                     <input type="text" placeholder="گزینه‌ها (مثلاً: قرمز، آبی)" value={vOptions} onChange={e => setVOptions(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 outline-none text-xs font-bold" />
                     <input type="text" placeholder="عنوان (رنگ)" value={vName} onChange={e => setVName(e.target.value)} className="w-24 px-4 py-3 rounded-xl border border-slate-200 outline-none text-xs font-bold" />
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <button onClick={handleAdd} className="flex-[2] bg-indigo-600 text-white py-5 rounded-[1.8rem] font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all">انتشار کالا در فروشگاه</button>
                  <button onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[1.8rem] font-black hover:bg-slate-200 transition-all">انصراف</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
