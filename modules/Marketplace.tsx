
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SalesLink, Product, Currency } from '../types';
import Header from '../components/Header';

interface MarketplaceProps {
  links: SalesLink[];
}

const Marketplace: React.FC<MarketplaceProps> = ({ links }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('همه');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc' | 'popular'>('newest');

  const allProducts = useMemo(() => {
    const products: (Product & { storeSlug: string; storeName: string; storeColor: string; createdAt: string })[] = [];
    links.forEach(link => {
      link.products.forEach(p => {
        products.push({ ...p, storeSlug: link.slug, storeName: link.title, storeColor: link.themeColor, createdAt: new Date().toISOString() });
      });
    });
    return products;
  }, [links]);

  const categories = useMemo(() => {
    const cats = new Set<string>(['همه']);
    allProducts.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.storeName.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === 'همه' || p.category === activeCategory;
      const matchesPrice = !maxPrice || (p.discountPrice || p.price) <= Number(maxPrice);
      // Fixed rating logic: using (p.rating || 0) to handle potential undefined cases
      const matchesRating = (p.rating || 0) >= minRating;
      const matchesDiscount = !onlyDiscounts || (!!p.discountPrice);
      return matchesSearch && matchesCat && matchesPrice && matchesRating && matchesDiscount;
    });

    result.sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;
      if (sortBy === 'priceAsc') return priceA - priceB;
      if (sortBy === 'priceDesc') return priceB - priceA;
      if (sortBy === 'popular') return b.salesCount - a.salesCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [allProducts, search, activeCategory, maxPrice, minRating, onlyDiscounts, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
           <aside className="lg:w-64 space-y-6">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-24">
                 <h3 className="text-sm font-black text-slate-900 mb-6 border-b border-slate-50 pb-4">فیلترهای هوشمند</h3>
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">جستجو</label>
                       <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="نام کالا یا برند..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">حداقل امتیاز</label>
                       <div className="flex gap-2">
                          {[3, 4, 4.5].map(r => (
                            <button key={r} onClick={() => setMinRating(minRating === r ? 0 : r)} className={`flex-1 py-2 rounded-xl text-[10px] font-black border transition-all ${minRating === r ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {r}+ ⭐
                            </button>
                          ))}
                       </div>
                       {minRating > 0 && <button onClick={() => setMinRating(0)} className="text-[9px] font-black text-red-400 mt-2 hover:underline">حذف فیلتر امتیاز</button>}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                       <span className="text-[10px] font-black text-slate-500">فقط تخفیف‌دارها</span>
                       <input type="checkbox" checked={onlyDiscounts} onChange={e => setOnlyDiscounts(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">دسته‌بندی‌ها</label>
                       <div className="flex flex-wrap gap-2">
                          {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-right px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}>
                              {cat}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </aside>

           <div className="flex-1 space-y-6">
              <div className="flex justify-between items-center bg-white px-8 py-4 rounded-[2rem] border border-slate-200">
                  <span className="text-[10px] font-black text-slate-400 uppercase">{filteredProducts.length} محصول یافت شد</span>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-slate-400">ترتیب:</span>
                     <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="text-[10px] font-black bg-slate-50 border-none outline-none p-2 rounded-xl cursor-pointer">
                        <option value="newest">جدیدترین</option>
                        <option value="popular">محبوب‌ترین (فروش)</option>
                        <option value="priceAsc">ارزان‌ترین</option>
                        <option value="priceDesc">گران‌ترین</option>
                     </select>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full py-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 text-slate-300 font-black italic">هیچ محصولی با این فیلترها پیدا نشد.</div>
                ) : filteredProducts.map(p => {
                  const hasDiscount = !!p.discountPrice;
                  const discountPercent = hasDiscount ? Math.round(((p.price - p.discountPrice!) / p.price) * 100) : 0;
                  
                  return (
                    <Link to={`/checkout/${p.storeSlug}/${p.id}?ref=marketplace`} key={`${p.storeSlug}-${p.id}`} className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col relative">
                      {hasDiscount && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10 shadow-lg animate-pulse">
                          %{discountPercent} تخفیف
                        </div>
                      )}
                      <div className="h-56 overflow-hidden relative">
                         <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
                         <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black shadow-sm border border-slate-100" style={{ color: p.storeColor }}>{p.storeName}</div>
                         <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 font-black">
                           ⭐ {p.rating} <span className="opacity-60 text-[8px]">({p.reviewCount})</span>
                         </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                         <div>
                            <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                            <p className="text-[10px] text-slate-400 font-bold line-clamp-1">{p.category}</p>
                         </div>
                         <div className="mt-6 flex items-center justify-between">
                            <div className="flex flex-col">
                               {hasDiscount && <span className="text-[10px] text-slate-300 line-through font-bold mb-0.5">{p.price.toLocaleString()}</span>}
                               <span className="font-black text-slate-900">{(p.discountPrice || p.price).toLocaleString()} <span className="text-[10px] text-slate-400">{p.currency === Currency.IRR ? 'تومان' : 'USDT'}</span></span>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-indigo-600 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">←</div>
                         </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
