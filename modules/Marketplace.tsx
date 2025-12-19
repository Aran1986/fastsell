
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

  // تخت‌سازی تمام محصولات از تمام فروشگاه‌ها
  const allProducts = useMemo(() => {
    const products: (Product & { storeSlug: string; storeName: string; storeColor: string })[] = [];
    links.forEach(link => {
      link.products.forEach(p => {
        products.push({
          ...p,
          storeSlug: link.slug,
          storeName: link.title,
          storeColor: link.themeColor
        });
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
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                         p.storeName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'همه' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 mb-4">ویترین عمومی پلتفرم</h1>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto">
            بهترین کالاها و خدمات را از تمامی فروشندگان معتبر پلتفرم ما به صورت یکجا جستجو و خریداری کنید.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
           <div className="relative max-w-2xl mx-auto">
              <input 
                type="text" 
                placeholder="جستجوی محصول، برند یا دسته‌بندی..." 
                className="w-full px-8 py-5 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-indigo-50/50 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-lg"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 font-black">🔍</div>
           </div>

           <div className="flex flex-wrap justify-center gap-2">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full text-xs font-black transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-300 font-black">
              محصولی یافت نشد.
            </div>
          ) : (
            filteredProducts.map(p => (
              <Link 
                to={`/checkout/${p.storeSlug}/${p.id}`}
                key={`${p.storeSlug}-${p.id}`} 
                className="group bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                <div className="h-64 overflow-hidden relative">
                   <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
                   <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black shadow-sm" style={{ color: p.storeColor }}>
                      {p.storeName}
                   </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                   <div>
                      <h3 className="text-xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                      <p className="text-xs text-slate-400 font-bold line-clamp-2 leading-relaxed">{p.description}</p>
                   </div>
                   <div className="mt-6 flex items-center justify-between">
                      <span className="font-black text-lg text-slate-900">
                        {p.price.toLocaleString()} <span className="text-[10px] text-slate-400">{p.currency === Currency.IRR ? 'تومان' : 'USDT'}</span>
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        ←
                      </div>
                   </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
