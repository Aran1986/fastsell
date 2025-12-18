
import React, { useState, useMemo, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { SalesLink, Product, Currency } from '../../types';
import { generateProductDescription } from '../../services/geminiService';

interface ProductManagerProps {
  activeLink: SalesLink;
  onAddProduct: (linkId: string, product: Omit<Product, 'id' | 'salesCount'>) => void;
  onDeleteProduct: (linkId: string, productId: string) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ activeLink, onAddProduct, onDeleteProduct }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [curr, setCurr] = useState<Currency>(activeLink.defaultCurrency || Currency.USD);
  const [cat, setCat] = useState(activeLink.categories[0] || 'General');
  const [desc, setDesc] = useState('');
  const [featured, setFeatured] = useState(false);
  const [isGen, setIsGen] = useState(false);
  
  // Image States
  const [tempImg, setTempImg] = useState<string | null>(null);
  const [croppedImg, setCroppedImg] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState(null);

  const filtered = useMemo(() => {
    let p = [...activeLink.products];
    if (search) p = p.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    if (catFilter !== 'all') p = p.filter(i => i.category === catFilter);
    return p.reverse();
  }, [activeLink, search, catFilter]);

  const handleAdd = () => {
    if (!name) return alert('Name is required');
    onAddProduct(activeLink.id, { 
      name, price, currency: curr, category: cat, description: desc, isFeatured: featured,
      image: croppedImg || `https://picsum.photos/seed/${Math.random()}/600/600`
    });
    setIsAdding(false);
    reset();
  };

  const reset = () => {
    setName(''); setPrice(0); setDesc(''); setFeatured(false); setCroppedImg(null);
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
        <input type="text" placeholder="Search items or services..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold" />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold outline-none min-w-[150px]">
          <option value="all">All Categories</option>
          {activeLink.categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setIsAdding(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">+ Add New</button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map(p => (
          <div key={p.id} className={`bg-white p-6 rounded-[2.5rem] border ${p.isFeatured ? 'border-indigo-200 ring-2 ring-indigo-50' : 'border-slate-200'} flex flex-col md:flex-row items-center gap-6 group hover:shadow-xl transition-all`}>
             <img src={p.image} className="w-24 h-24 rounded-[2rem] object-cover shadow-sm group-hover:scale-105 transition-transform" alt="" />
             <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                <p className="text-slate-400 text-xs font-bold mt-1 line-clamp-1">{p.description}</p>
                <div className="mt-3 flex flex-wrap justify-center md:justify-start items-center gap-4">
                  <span className="font-black text-indigo-600 text-lg">{p.currency === Currency.IRR ? '﷼' : p.currency === Currency.CRYPTO ? '₮' : '$'}{p.price.toLocaleString()}</span>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">{p.category}</span>
                </div>
             </div>
             <div className="flex gap-2">
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
            <h2 className="text-3xl font-black mb-8">List New Item or Service</h2>
            <div className="space-y-6">
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visual Representative</label>
                  {tempImg ? (
                    <div className="relative h-72 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-inner">
                      <Cropper image={tempImg} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={(_, p) => setPixels(p)} onZoomChange={setZoom} />
                      <button onClick={finishCrop} className="absolute bottom-6 left-6 right-6 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-2xl">Confirm Crop</button>
                    </div>
                  ) : croppedImg ? (
                    <div className="relative h-48 rounded-[2rem] overflow-hidden group">
                      <img src={croppedImg} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => setCroppedImg(null)} className="absolute inset-0 bg-black/50 text-white font-black opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">Change Image</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-4 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 transition-all group">
                       <span className="text-slate-400 font-black text-sm group-hover:text-indigo-500">Upload Image / Photo</span>
                       <input type="file" className="hidden" onChange={e => {
                         const f = e.target.files?.[0];
                         if(f){ const r = new FileReader(); r.onload = () => setTempImg(r.result as string); r.readAsDataURL(f); }
                       }} />
                    </label>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <select value={cat} onChange={e => setCat(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold">
                      {activeLink.categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</label>
                    <input type="number" value={price || ''} onChange={e => setPrice(Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold" />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Currency</label>
                    <select value={curr} onChange={e => setCurr(e.target.value as Currency)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold">
                      <option value={Currency.USD}>USD ($)</option>
                      <option value={Currency.EUR}>EUR (€)</option>
                      <option value={Currency.CRYPTO}>USDT (₮)</option>
                      <option value={Currency.IRR}>Rial (﷼)</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Description (AI)</label>
                    <button onClick={async () => { if(name){ setIsGen(true); setDesc(await generateProductDescription(name)); setIsGen(false); } }} className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg transition-all">
                      {isGen ? 'Thinking...' : '⚡ Generate AI Pitch'}
                    </button>
                  </div>
                  <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold resize-none" />
               </div>

               <div className="flex items-center gap-3">
                  <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} id="feat" className="w-5 h-5 rounded-lg text-indigo-600" />
                  <label htmlFor="feat" className="text-sm font-black text-slate-600 cursor-pointer">Mark as Featured (Sticky Top)</label>
               </div>

               <div className="flex gap-4 pt-4">
                  <button onClick={handleAdd} className="flex-[2] bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all">Publish Now</button>
                  <button onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[1.5rem] font-black">Cancel</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
