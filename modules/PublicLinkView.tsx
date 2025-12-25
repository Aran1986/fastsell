
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SalesLink, Currency, Review, ChatMessage, StoreMode, Product } from '../types';
import { TrackingService } from '../services/trackingService';
import { summarizeReviews, checkReviewSpam } from '../services/geminiService';
import { ApiService } from '../services/apiService';

interface PublicLinkViewProps {
  links: SalesLink[];
}

const getCurrencySymbol = (curr: Currency) => {
  switch (curr) {
    case Currency.USD: return '$';
    case Currency.EUR: return '€';
    case Currency.IRR: return 'تومان';
    case Currency.CRYPTO: return 'USDT';
    default: return '$';
  }
};

const PublicLinkView: React.FC<PublicLinkViewProps> = ({ links: initialLinks }) => {
  const { slug, productId } = useParams<{ slug: string, productId?: string }>();
  const navigate = useNavigate();
  const [links, setLinks] = useState(initialLinks);
  const link = links.find(l => l.slug === slug);
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [notifiedProds, setNotifiedProds] = useState<Set<string>>(new Set());
  const [reviewSummary, setReviewSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Mode Specific States
  const [selectedSlot, setSelectedSlot] = useState<Record<string, string>>({}); // productId -> slot

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userMsg, setUserMsg] = useState('');

  // Review System State
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const refreshData = async () => {
    const all = await ApiService.getAllStores();
    setLinks(all);
  };

  useEffect(() => {
    if (link) {
      if (productId) {
        TrackingService.trackView(link.slug, productId);
      } else {
        link.products.forEach(p => TrackingService.trackView(link.slug, p.id));
      }

      const storageKey = `welcome_dismissed_${link.slug}`;
      const isDismissed = localStorage.getItem(storageKey);
      if (!isDismissed) {
        const timer = setTimeout(() => setShowWelcome(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [link, productId]);

  const handleCheckout = (p: Product) => {
    if (link?.mode === StoreMode.BOOKING && !selectedSlot[p.id]) {
      alert('لطفاً ابتدا یک زمان برای رزرو انتخاب کنید.');
      return;
    }
    const slotQuery = selectedSlot[p.id] ? `?slot=${encodeURIComponent(selectedSlot[p.id])}` : '';
    navigate(`/checkout/${link?.slug}/${p.id}${slotQuery}`);
  };

  const handleSummarize = async () => {
    if (!link?.reviews || link.reviews.length === 0) return;
    setIsSummarizing(true);
    const comments = link.reviews.map(r => r.comment);
    const summary = await summarizeReviews(comments);
    setReviewSummary(summary);
    setIsSummarizing(false);
  };

  const handleSubmitReview = async (e: React.FormEvent, prodId: string) => {
    e.preventDefault();
    setReviewError('');
    if (!reviewText.trim()) return setReviewError('لطفاً نظر خود را بنویسید.');
    if (!customerEmail.trim()) return setReviewError('ایمیل برای تایید خرید الزامی است.');

    setIsSubmittingReview(true);
    try {
      const hasPurchased = await ApiService.verifyPurchase(customerEmail, prodId);
      if (!hasPurchased) {
        setReviewError('متاسفانه خریدی با این ایمیل برای این محصول یافت نشد.');
        setIsSubmittingReview(false);
        return;
      }

      const spamCheck = await checkReviewSpam(reviewText);
      if (spamCheck.isSpam) {
        setReviewError(`سیستم هوشمند از ثبت این نظر جلوگیری کرد: ${spamCheck.reason || 'محتوای نامناسب'}`);
        setIsSubmittingReview(false);
        return;
      }

      await ApiService.addReview(link!.slug, {
        productId: prodId,
        orderId: 'VERIFIED',
        customerName: customerEmail.split('@')[0],
        customerEmail: customerEmail,
        rating: reviewRating,
        comment: reviewText
      });

      setReviewText('');
      setCustomerEmail('');
      await refreshData();
      alert('نظر شما با موفقیت تایید و ثبت شد! ✓');
    } catch (err) {
      setReviewError('خطایی در سیستم رخ داد.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleNotifyMe = async (e: React.MouseEvent, pId: string) => {
    e.preventDefault();
    if (link) {
      await TrackingService.requestStockNotification(link.slug, pId, 'Anonymous User');
      setNotifiedProds(prev => new Set(prev).add(pId));
      alert('درخواست شما ثبت شد. به محض موجودی، اطلاع‌رسانی می‌شود.');
    }
  };

  const handleSendChat = () => {
    if (!userMsg.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'buyer',
      text: userMsg,
      timestamp: new Date().toISOString()
    };
    setChatMessages([...chatMessages, newMsg]);
    setUserMsg('');
    setTimeout(() => {
      const sellerReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'seller',
        text: 'سلام! پیام شما دریافت شد. در اسرع وقت پاسخ خواهیم داد.',
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, sellerReply]);
    }, 2000);
  };

  if (!link) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white text-center min-h-screen">
        <h1 className="text-8xl font-black text-slate-100 mb-6 select-none">404</h1>
        <p className="text-slate-600 text-xl font-bold mb-4">فروشگاه مورد نظر پیدا نشد.</p>
        <Link to="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl">ساخت فروشگاه ←</Link>
      </div>
    );
  }

  const displayProducts = productId 
    ? link.products.filter(p => p.id === productId) 
    : link.products;

  const mainColor = link.themeColor || '#6366f1';
  const buyBtnColor = link.buyButtonColor || mainColor;
  const storeMode = link.mode || StoreMode.PRODUCT;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center relative overflow-x-hidden" dir="rtl">
      <div className="absolute top-0 left-0 w-full h-96 opacity-10 pointer-events-none" style={{ background: `linear-gradient(180deg, ${mainColor} 0%, transparent 100%)` }}></div>

      {showWelcome && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white rounded-[3.5rem] p-12 w-full max-sm shadow-2xl relative flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${mainColor}, #a855f7)`, color: 'white' }}>
               <span className="text-4xl">{storeMode === StoreMode.BOOKING ? '📅' : storeMode === StoreMode.SERVICE ? '🎓' : '🛒'}</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">خوش آمدید! ✨</h2>
            <p className="text-slate-500 text-center text-sm leading-relaxed mb-10 font-bold">به ویترین اختصاصی «{link.title}» خوش آمدید.</p>
            <button onClick={() => setShowWelcome(false)} style={{ backgroundColor: buyBtnColor }} className="w-full py-5 text-white font-black rounded-2xl shadow-xl">مشاهده لیست</button>
          </div>
        </div>
      )}

      {/* Floating Chat */}
      <div className="fixed bottom-8 left-8 z-[200]">
         {isChatOpen ? (
           <div className="bg-white rounded-[2.5rem] w-[320px] sm:w-[350px] h-[500px] shadow-2xl flex flex-col border border-slate-100 animate-in slide-in-from-bottom-5 duration-300 overflow-hidden">
              <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black">🏪</div>
                    <div className="text-xs font-black">گفتگو با {link.title}</div>
                 </div>
                 <button onClick={() => setIsChatOpen(false)} className="text-2xl font-black">×</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 text-right">
                 {chatMessages.map(m => (
                   <div key={m.id} className={`flex ${m.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 rounded-2xl text-[11px] font-bold max-w-[80%] ${m.sender === 'buyer' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'}`}>{m.text}</div>
                   </div>
                 ))}
              </div>
              <div className="p-4 border-t border-slate-100 flex gap-2">
                 <input type="text" value={userMsg} onChange={e => setUserMsg(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendChat()} placeholder="سوال شما..." className="flex-1 bg-slate-100 px-4 py-3 rounded-xl text-xs font-bold outline-none" />
                 <button onClick={handleSendChat} className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center">🚀</button>
              </div>
           </div>
         ) : (
           <button onClick={() => setIsChatOpen(true)} style={{ backgroundColor: buyBtnColor }} className="w-16 h-16 rounded-full text-white shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-all">💬</button>
         )}
      </div>

      <header className="w-full max-w-2xl pt-16 pb-12 px-6 text-center z-10">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2.5rem] sm:rounded-[3rem] mx-auto border-8 border-white shadow-2xl flex items-center justify-center text-white text-3xl sm:text-5xl font-black mb-8" style={{ background: `linear-gradient(135deg, ${mainColor}, #a855f7)` }}>
            {link.title.charAt(0)}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 tracking-tight">{link.title}</h1>
        <p className="text-slate-500 max-w-md mx-auto text-sm sm:text-base leading-relaxed font-bold bg-white/50 backdrop-blur-sm py-3 px-6 rounded-2xl border border-white/50 mb-8">{link.bio}</p>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto">
            <div className="bg-white/60 backdrop-blur p-3 sm:p-4 rounded-[2rem] border border-white/50 shadow-sm text-center">
                <div className="text-indigo-600 font-black text-lg sm:text-xl mb-1">⭐ {link.trustScore || '4.5'}</div>
                <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">اعتبار</div>
            </div>
            <div className="bg-white/60 backdrop-blur p-3 sm:p-4 rounded-[2rem] border border-white/50 shadow-sm text-center">
                <div className="text-green-600 font-black text-lg sm:text-xl mb-1">٪۱۰۰</div>
                <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">{storeMode === StoreMode.PRODUCT ? 'ارسال موفق' : 'رضایت'}</div>
            </div>
            <div className="bg-white/60 backdrop-blur p-3 sm:p-4 rounded-[2rem] border border-white/50 shadow-sm text-center">
                <div className="text-orange-600 font-black text-base sm:text-lg mb-1">~۳۰m</div>
                <div className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">پاسخگویی</div>
            </div>
        </div>
      </header>

      <main className="w-full max-w-2xl px-6 pb-24 space-y-8">
        {displayProducts.map(product => {
          const isOutOfStock = product.stock <= 0;
          return (
            <div key={product.id} className="group block bg-white rounded-[3rem] sm:rounded-[3.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 overflow-hidden">
              <div className="flex flex-col sm:row relative">
                  <div className="w-full sm:w-64 h-64 overflow-hidden relative">
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt={product.name} />
                      {isOutOfStock && <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center"><span className="text-white font-black text-sm border-2 border-white px-4 py-2 rounded-xl transform -rotate-12">تکمیل ظرفیت</span></div>}
                      {product.durationMinutes && (
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full">⏱️ {product.durationMinutes} دقیقه</div>
                      )}
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-between text-right">
                      <div>
                          <div className="flex items-start justify-between mb-2">
                             <h3 className="font-black text-slate-900 text-xl sm:text-2xl">{product.name}</h3>
                             <span className="text-[9px] bg-slate-50 px-3 py-1 rounded-full font-black text-slate-400">{product.category}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-400 font-bold leading-relaxed line-clamp-2">{product.description}</p>
                          
                          {/* Booking Slots UI */}
                          {storeMode === StoreMode.BOOKING && !isOutOfStock && (
                            <div className="mt-6 space-y-3">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">انتخاب ساعت رزرو:</p>
                               <div className="flex flex-wrap gap-2">
                                  {(product.availableSlots || []).map(slot => (
                                    <button 
                                      key={slot} 
                                      onClick={() => setSelectedSlot({...selectedSlot, [product.id]: slot})}
                                      className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${selectedSlot[product.id] === slot ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-indigo-200'}`}
                                    >
                                      {slot}
                                    </button>
                                  ))}
                               </div>
                            </div>
                          )}
                      </div>
                      
                      <div className="mt-8 flex items-center justify-between">
                          <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-300 uppercase">{storeMode === StoreMode.PRODUCT ? 'قیمت کالا' : 'هزینه نهایی'}</span>
                              <div className="flex flex-col items-start">
                                  {product.discountPrice && <span className="text-xs text-orange-500 line-through font-black">{product.price.toLocaleString()}</span>}
                                  <span className="font-black text-slate-900 text-xl sm:text-2xl leading-none" style={{ color: mainColor }}>{(product.discountPrice || product.price).toLocaleString()} <span className="text-xs mr-1">{getCurrencySymbol(product.currency)}</span></span>
                              </div>
                          </div>
                          {isOutOfStock ? (
                            <button onClick={(e) => handleNotifyMe(e, product.id)} disabled={notifiedProds.has(product.id)} className={`px-6 sm:px-8 py-4 rounded-[1.8rem] text-xs sm:text-sm font-black shadow-lg transition-all ${notifiedProds.has(product.id) ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white'}`}>{notifiedProds.has(product.id) ? 'ثبت شد ✓' : 'اطلاع از ظرفیت جدید'}</button>
                          ) : (
                            <button onClick={() => handleCheckout(product)} style={{ backgroundColor: buyBtnColor }} className="text-white px-8 py-4 rounded-[1.8rem] text-xs sm:text-sm font-black shadow-lg transform group-hover:-translate-x-2 transition-all">
                               {storeMode === StoreMode.BOOKING ? 'تایید و رزرو نوبت' : storeMode === StoreMode.SERVICE ? 'ثبت‌نام و پرداخت' : 'خرید مستقیم'}
                            </button>
                          )}
                      </div>
                  </div>
              </div>
            </div>
          );
        })}

        {/* Reviews Section */}
        <section className="bg-white rounded-[3rem] sm:rounded-[3.5rem] p-8 sm:p-10 shadow-sm border border-slate-100 mt-12 text-right">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">نظرات خریداران 💬</h3>
                <button onClick={handleSummarize} disabled={isSummarizing || !link.reviews?.length} className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl text-[10px] font-black flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                  {isSummarizing ? 'در حال تحلیل...' : '✨ خلاصه هوشمند (AI)'}
                </button>
            </div>

            {reviewSummary && (
                <div className="bg-indigo-900 text-white p-6 rounded-[2rem] mb-10 shadow-xl relative animate-in zoom-in-95">
                    <div className="absolute -top-3 right-8 bg-indigo-500 text-white px-3 py-1 rounded-full text-[8px] font-black">تحلیل هوشمند</div>
                    <p className="text-sm leading-relaxed font-bold italic">«{reviewSummary}»</p>
                </div>
            )}

            <div className="mb-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
               <h4 className="font-black text-slate-800 text-sm mb-4">ثبت تجربه خریدار تایید شده</h4>
               <form onSubmit={(e) => displayProducts[0] && handleSubmitReview(e, displayProducts[0].id)} className="space-y-4">
                  <div className="flex flex-wrap gap-4 items-center mb-4">
                     <input type="email" placeholder="ایمیل استفاده شده در زمان خرید" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="flex-1 min-w-[200px] px-5 py-3 rounded-xl border border-slate-200 outline-none font-bold text-xs" />
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400">امتیاز:</span>
                        {[1, 2, 3, 4, 5].map(s => <button key={s} type="button" onClick={() => setReviewRating(s)} className={`text-xl transition-all ${reviewRating >= s ? 'grayscale-0 scale-110' : 'grayscale'}`}>⭐</button>)}
                     </div>
                  </div>
                  <textarea rows={3} value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="نظر خود را بنویسید..." className="w-full px-5 py-4 rounded-2xl border border-slate-200 outline-none font-bold text-xs resize-none" />
                  {reviewError && <p className="text-[10px] text-red-500 font-bold">{reviewError}</p>}
                  <button type="submit" disabled={isSubmittingReview} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-indigo-600 transition-all shadow-xl">
                    {isSubmittingReview ? 'در حال بررسی...' : 'ثبت نظر'}
                  </button>
               </form>
            </div>

            <div className="space-y-6">
                {!link.reviews?.length ? (
                    <div className="text-center py-12 text-slate-300 font-bold italic">هنوز نظری ثبت نشده است.</div>
                ) : [...link.reviews].reverse().map(rev => (
                    <div key={rev.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-400 text-xs">{rev.customerName.charAt(0)}</div>
                                <div>
                                    <div className="text-sm font-black text-slate-800">{rev.customerName}</div>
                                    <div className="text-[10px] text-green-500 font-bold">✓ خریدار تایید شده</div>
                                </div>
                            </div>
                            <div className="text-amber-500 font-black text-sm">{'⭐'.repeat(rev.rating)}</div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-bold">{rev.comment}</p>
                    </div>
                ))}
            </div>
        </section>
      </main>
    </div>
  );
};

export default PublicLinkView;
