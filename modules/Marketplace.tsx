
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SalesLink, Product, Currency, ChatMessage } from '../types';
import Header from '../components/Header';
import Comparison from './Comparison';
import Modal from '../components/common/Modal';
import { TrackingService } from '../services/trackingService';
import { ReputationService } from '../services/reputationService';
import { ApiService } from '../services/apiService';

interface MarketplaceProps {
  links: SalesLink[];
}

// Augmented product type for marketplace display
type MarketplaceProduct = Product & { storeSlug: string; storeName: string; storeColor: string; createdAt: string; smartScore: number };

const Marketplace: React.FC<MarketplaceProps> = ({ links: initialLinks }) => {
  const [links, setLinks] = useState(initialLinks);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('همه');
  const [sortBy, setSortBy] = useState<'smart' | 'newest' | 'priceAsc' | 'priceDesc' | 'popular'>('smart');
  const [notifiedProds, setNotifiedProds] = useState<Set<string>>(new Set());

  // Modals State
  const [compareList, setCompareList] = useState<MarketplaceProduct[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  // Fixed: Updated state type to include storeName and other augmented properties
  const [chattingProduct, setChattingProduct] = useState<MarketplaceProduct | null>(null);

  const navigate = useNavigate();

  const refreshData = async () => {
    const all = await ApiService.getAllStores();
    setLinks(all);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const allProducts = useMemo(() => {
    const products: MarketplaceProduct[] = [];
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

  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.storeName.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === 'همه' || p.category === activeCategory;
      return matchesSearch && matchesCat;
    });

    result.sort((a, b) => {
      if (sortBy === 'smart') return b.smartScore - a.smartScore;
      if (sortBy === 'priceAsc') return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      if (sortBy === 'priceDesc') return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      if (sortBy === 'popular') return b.salesCount - a.salesCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [allProducts, search, activeCategory, sortBy]);

  const handleNotifyMe = async (e: React.MouseEvent, slug: string, pId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await TrackingService.requestStockNotification(slug, pId, 'Guest User');
    setNotifiedProds(prev => new Set(prev).add(pId));
    alert('به محض موجود شدن به شما اطلاع می‌دهیم.');
  };

  const calculateDiscountPercent = (p: Product) => {
    if (!p.discountPrice || p.discountPrice >= p.price) return 0;
    return Math.round(((p.price - p.discountPrice) / p.price) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 lg:pb-0" dir="rtl">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
           <aside className="hidden lg:block lg:w-80 space-y-6">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm sticky top-28">
                 <h3 className="text-sm font-black text-slate-900 mb-8 border-b border-slate-50 pb-4">فیلترهای هوشمند</h3>
                 <div className="space-y-8">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">جستجوی محصول</label>
                       <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="مثلاً: کابل شارژ..." className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">دسته‌بندی‌ها</label>
                       <div className="flex flex-wrap gap-2">
                          {Array.from(new Set(['همه', ...allProducts.map(p => p.category)])).map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-100'}`}>{cat}</button>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </aside>

           <div className="flex-1 space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white px-8 py-6 rounded-[2.5rem] border border-slate-200 gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredProducts.length} مورد یافت شد</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="text-[11px] font-black bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl cursor-pointer outline-none">
                    <option value="smart">✨ پیشنهادی (هوشمند)</option>
                    <option value="newest">جدیدترین‌ها</option>
                    <option value="priceAsc">ارزان‌ترین</option>
                  </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map(p => {
                  const isOutOfStock = p.stock <= 0;
                  const discountPercent = calculateDiscountPercent(p);
                  return (
                    <div 
                      key={`${p.storeSlug}-${p.id}`} 
                      className="group bg-white rounded-[3.5rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col relative"
                    >
                      <div className="h-72 overflow-hidden relative">
                         <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
                         
                         {/* Store Badge */}
                         <div className="absolute top-6 right-6 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl text-[10px] font-black shadow-lg" style={{ color: p.storeColor }}>{p.storeName}</div>
                         
                         {/* Inventory Badge - Restored to Previous Large Style */}
                         <div className="absolute top-6 left-6">
                            {isOutOfStock ? (
                               <div className="flex flex-col items-start gap-1.5">
                                  <span className="bg-red-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black shadow-lg">اتمام موجودی</span>
                                  <button onClick={(e) => handleNotifyMe(e, p.storeSlug, p.id)} className="bg-white/90 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100">خبرم کن</button>
                               </div>
                            ) : (
                               <span className="bg-green-500/90 text-white px-4 py-1.5 rounded-xl text-[10px] font-black shadow-lg">موجود: {p.stock} عدد</span>
                            )}
                         </div>

                         {/* Action Buttons */}
                         <div className="absolute bottom-6 right-6 flex gap-3 z-20">
                             <button onClick={(e) => { e.preventDefault(); setChattingProduct(p); }} className="w-12 h-12 rounded-2xl bg-white/95 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white shadow-xl transition-all border border-slate-50 text-xl">💬</button>
                             <button onClick={(e) => { e.preventDefault(); setCompareList([...compareList, p]); setIsComparisonOpen(true); }} className="w-12 h-12 rounded-2xl bg-white/95 text-slate-600 flex items-center justify-center hover:bg-slate-900 hover:text-white shadow-xl transition-all border border-slate-50 text-xl">⚖️</button>
                         </div>
                      </div>

                      <div className="p-10 flex-1 flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-2">
                               <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{p.name}</h3>
                               {discountPercent > 0 && (
                                  <span className="bg-red-50 text-red-500 px-2 py-1 rounded-lg text-[10px] font-black">%{discountPercent}-</span>
                               )}
                            </div>
                            <p className="text-xs text-slate-400 font-bold mb-4">{p.category}</p>
                         </div>

                         <div className="mt-8 flex items-end justify-between">
                            <div className="flex flex-col gap-1">
                               {p.discountPrice && (
                                  <span className="text-sm text-slate-300 line-through font-bold">{p.price.toLocaleString()}</span>
                               )}
                               <div className="font-black text-slate-900 text-2xl">
                                  {(p.discountPrice || p.price).toLocaleString()} <span className="text-xs text-slate-400 font-bold mr-1">تومان</span>
                               </div>
                            </div>
                            <Link to={`/checkout/${p.storeSlug}/${p.id}`} className="bg-indigo-600 text-white px-8 py-4 rounded-[1.8rem] text-xs font-black hover:scale-105 transition-all shadow-xl shadow-indigo-100">مشاهده و خرید</Link>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </main>

      {/* Comparison Modal */}
      {isComparisonOpen && <Comparison items={compareList} onClose={() => setIsComparisonOpen(false)} onRemove={(id) => setCompareList(compareList.filter(i => i.id !== id))} />}

      {/* Chat Modal */}
      <Modal isOpen={!!chattingProduct} onClose={() => setChattingProduct(null)} title={`گفتگو با ${chattingProduct?.storeName}`}>
         <div className="p-12 text-center space-y-8">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl">💬</div>
            <div>
               <h4 className="text-xl font-black mb-2">سوال خود را بپرسید</h4>
               <p className="text-slate-500 font-bold text-sm leading-relaxed px-10">در حال حاضر سیستم چت مستقیم در حال بروزرسانی است. می‌توانید از طریق دکمه خرید، اطلاعات تماس فروشنده را مشاهده کنید.</p>
            </div>
            <button onClick={() => setChattingProduct(null)} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl w-full">متوجه شدم</button>
         </div>
      </Modal>
    </div>
  );
};

export default Marketplace;
