
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

  const allProducts = useMemo(() => {
    const products: (Product & { storeSlug: string; storeName: string; storeColor: string })[] = [];
    links.forEach(link => {
      link.products.forEach(p => {
        products.push({ ...p, storeSlug: link.slug, storeName: link.title, storeColor: link.themeColor });
      });
    });
    return products;
  }, [links]);

  const categories = useMemo(() => {
    const cats = new Set<string>(['همه']);
    allProducts.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }, [allProducts]);

  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.storeName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'همه' || p.category === activeCategory;
    const matchesPrice = !maxPrice || p.price <= Number(maxPrice);
    return matchesSearch && matchesCat && matchesPrice;
  }).reverse();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
           <aside className="lg:w-64 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                 <h3 className="text-sm font-black text-slate-900 mb-6 border-b border-slate-50 pb-4">فیلترهای هوشمند</h3>
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">جستجو</label>
                       <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="نام کالا یا برند..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">حداکثر قیمت</label>
                       <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value ? Number(e.target.value) : '')} placeholder="مبلغ..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold outline-none" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">دسته‌بندی‌ها</label>
                       <div className="flex flex-col gap-2">
                          {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-right px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                              {cat}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </aside>

           <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full py-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 text-slate-300 font-black italic">هیچ محصولی با این فیلترها پیدا نشد.</div>
                ) : filteredProducts.map(p => (
                  /* افزودن پارامتر ref=marketplace برای ردیابی منبع فروش */
                  <Link to={`/checkout/${p.storeSlug}/${p.id}?ref=marketplace`} key={`${p.storeSlug}-${p.id}`} className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col">
                    <div className="h-56 overflow-hidden relative">
                       <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
                       <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black shadow-sm" style={{ color: p.storeColor }}>{p.storeName}</div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                       <div>
                          <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                          <p className="text-[10px] text-slate-400 font-bold line-clamp-1">{p.category}</p>
                       </div>
                       <div className="mt-6 flex items-center justify-between">
                          <span className="font-black text-slate-900">{p.price.toLocaleString()} <span className="text-[10px] text-slate-400">{p.currency === Currency.IRR ? 'تومان' : 'USDT'}</span></span>
                          <div className="w-8 h-8 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">←</div>
                       </div>
                    </div>
                  </Link>
                ))}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
