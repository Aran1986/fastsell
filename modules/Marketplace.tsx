
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SalesLink, Product, Currency } from '../types';
import Header from '../components/Header';
import Comparison from './Comparison';
import { TrackingService } from '../services/trackingService';
import { ReputationService } from '../services/reputationService';

interface MarketplaceProps {
  links: SalesLink[];
}

const Marketplace: React.FC<MarketplaceProps> = ({ links }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('همه');
  const [selectedStoreSlug, setSelectedStoreSlug] = useState('همه');
  const [storeSearch, setStoreSearch] = useState('');
  const [isStoreSearchOpen, setIsStoreSearchOpen] = useState(false);
  
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);
  const [sortBy, setSortBy] = useState<'smart' | 'newest' | 'priceAsc' | 'priceDesc' | 'popular'>('smart');
  const [notifiedProds, setNotifiedProds] = useState<Set<string>>(new Set());

  // Comparison State
  const [compareList, setCompareList] = useState<(Product & { storeName: string; storeColor: string; storeSlug: string })[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const allProducts = useMemo(() => {
    const products: (Product & { storeSlug: string; storeName: string; storeColor: string; createdAt: string; smartScore: number })[] = [];
    links.forEach(link => {
      link.products.forEach(p => {
        const score = ReputationService.calculateDiscoveryScore(p, link);
        products.push({ 
          ...p, 
          storeSlug: link.slug, 
          storeName: link.title, 
          storeColor: link.themeColor, 
          createdAt: new Date().toISOString(),
          smartScore: score
        });
      });
    });
    return products;
  }, [links]);

  const topRatedStores = useMemo(() => {
    return [...links]
      .sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0))
      .slice(0, 4);
  }, [links]);

  const filteredStoreList = useMemo(() => {
    if (!storeSearch.trim()) return [];
    return links.filter(s => 
      s.title.toLowerCase().includes(storeSearch.toLowerCase()) || 
      s.slug.toLowerCase().includes(storeSearch.toLowerCase())
    ).slice(0, 5);
  }, [storeSearch, links]);

  const categories = useMemo(() => {
    const cats = new Set<string>(['همه']);
    allProducts.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.storeName.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === 'همه' || p.category === activeCategory;
      const matchesStore = selectedStoreSlug === 'همه' || p.storeSlug === selectedStoreSlug;
      const matchesPrice = !maxPrice || (p.discountPrice || p.price) <= Number(maxPrice);
      const productRating = p.rating || 0;
      const matchesRating = productRating >= minRating;
      const matchesDiscount = !onlyDiscounts || (!!p.discountPrice);
      
      return matchesSearch && matchesCat && matchesStore && matchesPrice && matchesRating && matchesDiscount;
    });

    result.sort((a, b) => {
      if (sortBy === 'smart') return b.smartScore - a.smartScore;
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;
      if (sortBy === 'priceAsc') return priceA - priceB;
      if (sortBy === 'priceDesc') return priceB - priceA;
      if (sortBy === 'popular') return b.salesCount - a.salesCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [allProducts, search, activeCategory, selectedStoreSlug, maxPrice, minRating, onlyDiscounts, sortBy]);

  const handleNotifyMe = async (e: React.MouseEvent, slug: string, pId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await TrackingService.requestStockNotification(slug, pId, 'Guest User');
    setNotifiedProds(prev => new Set(prev).add(pId));
    alert('درخواست شما ثبت شد. به محض موجود شدن کالا، اطلاع‌رسانی می‌شود.');
  };

  const toggleCompare = (p: any) => {
    const isSelected = compareList.find(item => item.id === p.id);
    if (isSelected) {
      setCompareList(compareList.filter(item => item.id !== p.id));
    } else {
      if (compareList.length >= 4) {
        alert('حداکثر ۴ مورد را می‌توانید همزمان مقایسه کنید.');
        return;
      }
      setCompareList([...compareList, p]);
    }
  };

  /** فیچر هوشمند برای پیدا کردن رقبای یک کالا در سایر فروشگاه‌ها */
  const smartMarketSearch = (p: any) => {
    const similarItems = allProducts.filter(item => 
      item.id !== p.id && 
      (item.category === p.category || item.name.toLowerCase().includes(p.name.split(' ')[0].toLowerCase())) &&
      item.stock > 0
    ).slice(0, 3);

    if (similarItems.length === 0) {
      alert('کالای مشابهی در سایر فروشگاه‌ها یافت نشد.');
      return;
    }

    setCompareList([p, ...similarItems]);
    setIsComparisonOpen(true);
  };

  const selectedStore = links.find(l => l.slug === selectedStoreSlug);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
           <aside className="lg:w-80 space-y-6">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm sticky top-28">
                 <h3 className="text-sm font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">فیلترهای هوشمند</h3>
                 
                 <div className="space-y-8">
                    <div className="space-y-3 relative">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">فیلتر بر اساس فروشگاه</label>
                       
                       <div className="relative">
                          <input 
                            type="text" 
                            placeholder="جستجوی فروشگاه..." 
                            value={selectedStoreSlug === 'همه' ? storeSearch : selectedStore?.title}
                            onFocus={() => setIsStoreSearchOpen(true)}
                            onChange={(e) => { setStoreSearch(e.target.value); if(selectedStoreSlug !== 'همه') setSelectedStoreSlug('همه'); }}
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                          />
                          {selectedStoreSlug !== 'همه' && (
                            <button onClick={() => { setSelectedStoreSlug('همه'); setStoreSearch(''); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 font-black">×</button>
                          )}
                       </div>

                       {isStoreSearchOpen && (
                         <>
                           <div className="fixed inset-0 z-10" onClick={() => setIsStoreSearchOpen(false)}></div>
                           <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-20 animate-in slide-in-from-top-2">
                              {!storeSearch.trim() && (
                                <div className="p-4 bg-slate-50/50">
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 block">فروشگاه‌های برتر (امتیاز بالا)</span>
                                   <div className="grid grid-cols-1 gap-2">
                                      {topRatedStores.map(s => (
                                        <button key={s.slug} onClick={() => { setSelectedStoreSlug(s.slug); setIsStoreSearchOpen(false); }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all text-right group">
                                           <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-[10px]" style={{ backgroundColor: s.themeColor }}>{s.title.charAt(0)}</div>
                                           <div className="flex-1">
                                              <div className="text-[11px] font-black text-slate-700 group-hover:text-indigo-600">{s.title}</div>
                                              <div className="text-[8px] text-slate-400 font-bold">⭐ {s.trustScore} امتیاز</div>
                                           </div>
                                        </button>
                                      ))}
                                   </div>
                                </div>
                              )}
                              {storeSearch.trim() && filteredStoreList.map(s => (
                                <button key={s.slug} onClick={() => { setSelectedStoreSlug(s.slug); setIsStoreSearchOpen(false); }} className="w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors text-right border-b border-slate-50 last:border-0 group">
                                   <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-[10px]" style={{ backgroundColor: s.themeColor }}>{s.title.charAt(0)}</div>
                                   <div className="flex-1">
                                      <div className="text-xs font-black text-slate-800 group-hover:text-indigo-600">{s.title}</div>
                                      <div className="text-[9px] text-slate-400 font-mono" dir="ltr">/s/{s.slug}</div>
                                   </div>
                                </button>
                              ))}
                           </div>
                         </>
                       )}
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">جستجوی محصول یا خدمت</label>
                       <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="مثلاً: طراحی لوگو..." className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold" />
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">حداقل امتیاز</label>
                       <div className="flex gap-2">
                          {[3, 4, 4.5].map(r => (
                            <button key={r} onClick={() => setMinRating(minRating === r ? 0 : r)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black border transition-all ${minRating === r ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}>
                              {r}+ ⭐
                            </button>
                          ))}
                       </div>
                    </div>

                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">دسته‌بندی‌ها</label>
                       <div className="flex flex-wrap gap-2">
                          {categories.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-right px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-100'}`}>
                              {cat}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </aside>

           <div className="flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-8 py-6 rounded-[2.5rem] border border-slate-200 gap-4 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredProducts.length} مورد بر اساس رتبه‌بندی هوشمند</span>
                    {selectedStoreSlug !== 'همه' && <span className="text-[10px] font-bold text-indigo-500 mt-1">فروشگاه فعال: {selectedStore?.title}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-slate-400">ترتیب نمایش:</span>
                     <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="text-[11px] font-black bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl cursor-pointer outline-none">
                        <option value="smart">✨ پیشنهادی (هوشمند)</option>
                        <option value="popular">محبوب‌ترین‌ها</option>
                        <option value="newest">جدیدترین‌ها</option>
                        <option value="priceAsc">ارزان‌ترین</option>
                        <option value="priceDesc">گران‌ترین</option>
                     </select>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map(p => {
                  const hasDiscount = !!p.discountPrice;
                  const isOutOfStock = p.stock <= 0;
                  const isCompared = compareList.find(item => item.id === p.id);
                  
                  return (
                    <div key={`${p.storeSlug}-${p.id}`} className="group bg-white rounded-[3.5rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col relative">
                      <div className={`absolute top-6 left-6 z-10 text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg border border-white/50 backdrop-blur-md ${isOutOfStock ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-900'}`}>
                        {isOutOfStock ? 'اتمام موجودی' : `موجودی: ${p.stock}`}
                      </div>

                      <div className="h-64 overflow-hidden relative">
                         <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
                         <div className="absolute top-6 right-6 bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-[9px] font-black shadow-sm border border-slate-100" style={{ color: p.storeColor }}>{p.storeName}</div>
                         
                         {/* Market Search Action */}
                         <button 
                            onClick={() => smartMarketSearch(p)} 
                            title="تحلیل قیمت در بازار"
                            className="absolute bottom-18 right-6 w-10 h-10 rounded-xl bg-white/90 text-indigo-600 flex items-center justify-center transition-all hover:bg-indigo-600 hover:text-white shadow-lg"
                         >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                         </button>

                         {/* Compare Toggle */}
                         <button 
                            onClick={() => toggleCompare(p)} 
                            title="افزودن به مقایسه"
                            className={`absolute bottom-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${isCompared ? 'bg-indigo-600 text-white rotate-45' : 'bg-white/90 text-slate-400 hover:text-indigo-600'}`}
                         >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                         </button>

                         <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur text-white text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-2 font-black">
                           ⭐ {p.rating} <span className="opacity-60 text-[8px] font-bold">({p.reviewCount})</span>
                         </div>
                      </div>

                      <div className="p-8 flex-1 flex flex-col justify-between">
                         <div>
                            <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                            <p className="text-[11px] text-slate-400 font-bold line-clamp-1">{p.category}</p>
                         </div>
                         <div className="mt-8 flex items-center justify-between">
                            <div className="flex flex-col">
                               {hasDiscount && <span className="text-xs text-slate-300 line-through font-bold mb-1">{p.price.toLocaleString()}</span>}
                               <span className="font-black text-slate-900 text-lg">{(p.discountPrice || p.price).toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">تومان</span></span>
                            </div>
                            
                            {isOutOfStock ? (
                                <button onClick={(e) => handleNotifyMe(e, p.storeSlug, p.id)} className={`px-5 py-3 rounded-2xl text-[10px] font-black transition-all ${notifiedProds.has(p.id) ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}>
                                  {notifiedProds.has(p.id) ? 'ثبت شد ✓' : 'خبرم کن'}
                                </button>
                            ) : (
                                <Link to={`/checkout/${p.storeSlug}/${p.id}?ref=marketplace`} className="w-12 h-12 rounded-2xl bg-slate-50 text-indigo-600 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner text-xl">←</Link>
                            )}
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </main>

      {/* Floating Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[500] bg-slate-900 text-white rounded-[2.5rem] p-4 flex items-center gap-6 shadow-2xl animate-in slide-in-from-bottom-10">
           <div className="flex -space-x-4 space-x-reverse items-center pr-4">
              {compareList.map(item => (
                <div key={item.id} className="w-12 h-12 rounded-full border-4 border-slate-900 overflow-hidden bg-white">
                  <img src={item.image} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
              {compareList.length < 2 && <div className="text-[10px] font-bold text-slate-400 mr-8">حداقل ۲ مورد را انتخاب کنید</div>}
           </div>
           
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsComparisonOpen(true)}
                disabled={compareList.length < 2}
                className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${compareList.length >= 2 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 text-slate-600'}`}
              >
                تحلیل هوشمند ({compareList.length})
              </button>
              <button onClick={() => setCompareList([])} className="text-slate-500 hover:text-white font-black text-[10px] px-4">پاکسازی</button>
           </div>
        </div>
      )}

      {/* Comparison Modal */}
      {isComparisonOpen && (
        <Comparison 
          items={compareList} 
          onClose={() => setIsComparisonOpen(false)} 
          onRemove={(id) => {
            const newList = compareList.filter(item => item.id !== id);
            setCompareList(newList);
            if (newList.length === 0) setIsComparisonOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Marketplace;
