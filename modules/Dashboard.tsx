
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { SalesLink, Product, Currency, BankDetails, Order } from '../types';
import { generateProductDescription } from '../services/geminiService';
import PublicLinkView from './PublicLinkView';

interface DashboardProps {
  links: SalesLink[];
  onAddProduct: (linkId: string, product: Omit<Product, 'id' | 'salesCount'>) => void;
  onDeleteProduct: (linkId: string, productId: string) => void;
  onUpdateBankDetails: (linkId: string, bankDetails: BankDetails) => void;
  onUpdateProfile?: (linkId: string, data: { title: string; bio: string; defaultCurrency: Currency; categories: string[] }) => void;
  onUpdateOrder?: (linkId: string, orderId: string, updates: Partial<Order>) => void;
  onUpdateThemeColor?: (linkId: string, color: string, buyButtonColor?: string) => void;
}

const getCurrencySymbol = (curr: Currency) => {
  switch (curr) {
    case Currency.USD: return '$';
    case Currency.EUR: return '€';
    case Currency.IRR: return 'ریال';
    case Currency.CRYPTO: return 'USDT';
    default: return '$';
  }
};

const Dashboard: React.FC<DashboardProps> = ({ links, onAddProduct, onDeleteProduct, onUpdateBankDetails, onUpdateProfile, onUpdateOrder, onUpdateThemeColor }) => {
  const [activeLinkId, setActiveLinkId] = useState<string | null>(links[links.length - 1]?.id || null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile' | 'appearance' | 'bank'>('products');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modals
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  // Form States
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductCurrency, setNewProductCurrency] = useState<Currency>(Currency.IRR);
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newDetailedDesc, setNewDetailedDesc] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const activeLink = links.find(l => l.id === activeLinkId);

  // Settings states
  const [profileTitle, setProfileTitle] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileCurrency, setProfileCurrency] = useState<Currency>(Currency.IRR);
  const [profileCats, setProfileCats] = useState<string[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [bankData, setBankData] = useState<BankDetails>({});
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [buyButtonColor, setBuyButtonColor] = useState('#6366f1');

  useEffect(() => {
    if (activeLink) {
      setProfileTitle(activeLink.title);
      setProfileBio(activeLink.bio);
      setProfileCurrency(activeLink.defaultCurrency || Currency.IRR);
      setProfileCats(activeLink.categories || []);
      setBankData(activeLink.bankDetails || {});
      setThemeColor(activeLink.themeColor || '#6366f1');
      setBuyButtonColor(activeLink.buyButtonColor || activeLink.themeColor || '#6366f1');
      if (!newProductCategory) setNewProductCategory(activeLink.categories?.[0] || 'عمومی');
      setNewProductCurrency(activeLink.defaultCurrency || Currency.IRR);
    }
  }, [activeLink]);

  const sortedProducts = useMemo(() => {
    if (!activeLink) return [];
    let products = [...activeLink.products];
    if (searchQuery) {
      products = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedCategory !== 'all') {
      products = products.filter(p => p.category === selectedCategory);
    }
    return products.reverse();
  }, [activeLink, searchQuery, selectedCategory]);

  const handleCopy = (text: string, msg: string) => {
    navigator.clipboard.writeText(text).then(() => alert(msg));
  };

  const handleSaveProfile = () => {
    setConfirmModal({
      title: 'بروزرسانی پروفایل',
      message: 'آیا از ذخیره تنظیمات نام، بایو، ارز انتخابی و دسته‌بندی‌ها اطمینان دارید؟',
      onConfirm: () => {
        if (activeLinkId && onUpdateProfile) {
          onUpdateProfile(activeLinkId, { title: profileTitle, bio: profileBio, defaultCurrency: profileCurrency, categories: profileCats });
          setConfirmModal(null);
          alert('پروفایل با موفقیت ذخیره شد.');
        }
      }
    });
  };

  const handleSaveBank = () => {
    setConfirmModal({
      title: 'ذخیره اطلاعات بانکی',
      message: 'اطلاعات پرداخت برای خریداران نمایش داده خواهد شد. آیا از صحت آن‌ها اطمینان دارید؟',
      onConfirm: () => {
        if (activeLinkId) {
          onUpdateBankDetails(activeLinkId, bankData);
          setConfirmModal(null);
          alert('اطلاعات بانکی با موفقیت ثبت شد.');
        }
      }
    });
  };

  const handleDeleteProduct = (id: string, name: string) => {
    setConfirmModal({
      title: 'حذف محصول',
      message: `آیا از حذف «${name}» اطمینان دارید؟ این عمل غیرقابل بازگشت است.`,
      onConfirm: () => {
        if (activeLinkId) {
          onDeleteProduct(activeLinkId, id);
          setConfirmModal(null);
        }
      }
    });
  };

  const resetCats = () => {
    setProfileCats(['عمومی', 'تکنولوژی', 'پوشاک', 'خدمات']);
  };

  const handleAddProduct = () => {
    if (!activeLinkId || !newProductName) return;
    onAddProduct(activeLinkId, { 
      name: newProductName, 
      price: newProductPrice, 
      description: newProductDesc,
      detailedDescription: newDetailedDesc,
      currency: newProductCurrency, 
      category: newProductCategory,
      isFeatured,
      image: croppedImage || `https://picsum.photos/seed/${Math.random()}/400/300`
    });
    setIsAddingProduct(false);
    resetForm();
  };

  const resetForm = () => {
    setNewProductName('');
    setNewProductPrice(0);
    setNewProductDesc('');
    setNewDetailedDesc('');
    setIsFeatured(false);
    setCroppedImage(null);
  };

  // Image Crop
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_: any, pixels: any) => setCroppedAreaPixels(pixels), []);

  const finishCrop = async () => {
    if (!tempImage || !croppedAreaPixels) return;
    const img = new Image();
    img.src = tempImage;
    await new Promise(r => img.onload = r);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 600; canvas.height = 600;
    ctx.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, 600, 600);
    setCroppedImage(canvas.toDataURL('image/jpeg'));
    setTempImage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full" dir="rtl">
      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-2xl font-black mb-4">{confirmModal.title}</h3>
            <p className="text-slate-500 mb-10 text-sm font-bold leading-relaxed">{confirmModal.message}</p>
            <div className="flex gap-4">
              <button onClick={confirmModal.onConfirm} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg">تایید نهایی</button>
              <button onClick={() => setConfirmModal(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">انصراف</button>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">مدیریت فروشگاه: {activeLink?.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-mono text-indigo-400">fastsell.ir/s/{activeLink?.slug}</span>
            <button onClick={() => handleCopy(`https://fastsell.ir/#/s/${activeLink?.slug}`, 'لینک فروشگاه کپی شد.')} className="text-[10px] bg-slate-100 px-2 py-1 rounded-md font-bold hover:bg-slate-200">کپی لینک فروشگاه</button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsPreviewOpen(true)} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-black text-sm">پیش‌نمایش زنده</button>
          <button onClick={() => setIsAddingProduct(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-100">محصول جدید +</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-[10px] font-black text-slate-400 px-4 mb-2 uppercase tracking-widest">انتخاب فروشگاه برای مدیریت</h2>
            {links.map(l => (
              <button key={l.id} onClick={() => setActiveLinkId(l.id)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeLinkId === l.id ? 'bg-indigo-50 text-indigo-600 font-black border border-indigo-100' : 'hover:bg-slate-50 text-slate-500 font-bold border border-transparent'}`}>
                <span>{l.title}</span>
                {activeLinkId === l.id && <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>}
              </button>
            ))}
            <div className="h-px bg-slate-100 my-4 mx-4"></div>
            {[
              { id: 'products', label: 'محصولات', icon: '📦' },
              { id: 'orders', label: 'سفارشات', icon: '📝' },
              { id: 'profile', label: 'پروفایل و دسته‌ها', icon: '👤' },
              { id: 'bank', label: 'تنظیمات پرداخت', icon: '💳' },
              { id: 'appearance', label: 'ظاهر و تم', icon: '🎨' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}>
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-col md:flex-row gap-4">
                <input type="text" placeholder="جستجوی نام محصول..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 px-6 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" />
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-6 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold outline-none">
                  <option value="all">همه دسته‌ها</option>
                  {activeLink?.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {selectedCategory !== 'all' && <button onClick={() => setSelectedCategory('all')} className="text-xs text-indigo-600 font-black">ریست فیلتر</button>}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {sortedProducts.map(p => (
                  <div key={p.id} className={`bg-white p-6 rounded-[2.5rem] border ${p.isFeatured ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-200'} flex flex-col md:flex-row items-center gap-6 group transition-all`}>
                    <div className="relative">
                      <img src={p.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm" alt="" />
                      {p.isFeatured && <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] px-2 py-1 rounded-full font-black uppercase">ویژه</div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black">{p.name}</h3>
                        <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded-full font-black">{p.category}</span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-1">{p.description}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="font-black text-indigo-600 text-lg">{getCurrencySymbol(p.currency)} {p.price.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-slate-300">تعداد فروش: {p.salesCount}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => handleCopy(`https://fastsell.ir/#/checkout/${activeLink?.slug}/${p.id}`, 'لینک محصول کپی شد.')} 
                        className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-black text-[11px] hover:bg-indigo-600 hover:text-white transition-all text-center"
                      >
                        دریافت لینک مستقیم محصول
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id, p.name)} className="p-2 bg-slate-50 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black">
                  <tr><th className="p-4">محصول</th><th className="p-4">خریدار و آدرس</th><th className="p-4">مبلغ</th><th className="p-4">وضعیت</th><th className="p-4">یادداشت فروشنده</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeLink?.orders.map(o => (
                    <tr key={o.id}>
                      <td className="p-4 font-bold">{o.productName}</td>
                      <td className="p-4">
                        <div className="font-bold">{o.customerEmail}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{o.customerAddress}</div>
                      </td>
                      <td className="p-4 font-black text-indigo-600">{getCurrencySymbol(o.currency)} {o.amount}</td>
                      <td className="p-4">
                        <select value={o.status} onChange={e => onUpdateOrder?.(activeLink.id, o.id, { status: e.target.value as any })} className="bg-slate-50 border-0 rounded px-2 py-1 font-bold text-[10px]">
                          <option value="pending">در انتظار</option>
                          <option value="shipped">ارسال شده</option>
                          <option value="delivered">تحویل شده</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <input 
                          type="text" 
                          placeholder="یادداشت..." 
                          value={o.orderNote || ''} 
                          onChange={e => onUpdateOrder?.(activeLink.id, o.id, { orderNote: e.target.value })} 
                          className="bg-slate-50 border border-slate-100 rounded px-3 py-2 text-[10px] outline-none w-full focus:bg-white" 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2">نام فروشگاه</label>
                  <input type="text" value={profileTitle} onChange={e => setProfileTitle(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2">ارز پیش‌فرض فروشگاه</label>
                  <select value={profileCurrency} onChange={e => setProfileCurrency(e.target.value as Currency)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black">
                    <option value={Currency.IRR}>ریال ایران (درگاه بانکی)</option>
                    <option value={Currency.USD}>دلار ($ - پی‌پال)</option>
                    <option value={Currency.EUR}>یورو (€ - استرایپ)</option>
                    <option value={Currency.CRYPTO}>کریپتوکارنسی (USDT)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 mb-2">بایوگرافی فروشگاه</label>
                <textarea rows={3} value={profileBio} onChange={e => setProfileBio(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold resize-none" />
              </div>
              <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black">مدیریت دسته‌ها</h3>
                  <button onClick={resetCats} className="text-xs text-indigo-600 font-black">بازگردانی لیست پیش‌فرض</button>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {profileCats.map(c => (
                    <div key={c} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full font-black text-sm group">
                      {c}
                      <button onClick={() => setProfileCats(profileCats.filter(x => x !== c))} className="text-indigo-300 hover:text-red-500">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 max-w-sm">
                  <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="نام دسته..." className="flex-1 px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" />
                  <button onClick={() => { if(newCatName) setProfileCats([...profileCats, newCatName]); setNewCatName(''); }} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black">افزودن</button>
                </div>
              </div>
              <button onClick={handleSaveProfile} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700">ذخیره تغییرات پروفایل</button>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 space-y-10">
              <h3 className="text-2xl font-black">تنظیمات پرداخت هوشمند</h3>
              <p className="text-slate-400 font-bold text-sm">اطلاعات پرداختی شما بر اساس ارز انتخابی ({getCurrencySymbol(profileCurrency)}) تنظیم می‌شود:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {profileCurrency === Currency.IRR && (
                  <div className="p-6 bg-green-50/50 border border-green-100 rounded-3xl space-y-4 md:col-span-2">
                    <div className="font-black text-green-700">بانک‌های ایرانی (ریال)</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" placeholder="شماره شبا (IR...)" value={bankData.iban || ''} onChange={e => setBankData({...bankData, iban: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 font-bold text-xs" />
                      <input type="text" placeholder="نام صاحب حساب" value={bankData.holderName || ''} onChange={e => setBankData({...bankData, holderName: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 font-bold text-sm" />
                      <input type="text" placeholder="شماره کارت" value={bankData.cardNumber || ''} onChange={e => setBankData({...bankData, cardNumber: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 font-bold text-sm" />
                    </div>
                  </div>
                )}
                {(profileCurrency === Currency.USD || profileCurrency === Currency.EUR) && (
                  <>
                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-4">
                      <div className="font-black text-blue-600">PayPal</div>
                      <input type="email" placeholder="PayPal Email" value={bankData.paypalEmail || ''} onChange={e => setBankData({...bankData, paypalEmail: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 font-bold outline-none" />
                    </div>
                    <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl space-y-4">
                      <div className="font-black text-indigo-600">Stripe</div>
                      <input type="text" placeholder="Stripe Link / API Key" value={bankData.stripeKey || ''} onChange={e => setBankData({...bankData, stripeKey: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 font-bold outline-none" />
                    </div>
                  </>
                )}
                {profileCurrency === Currency.CRYPTO && (
                  <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-3xl space-y-4 md:col-span-2">
                    <div className="font-black text-orange-600">Crypto Wallet (Tether USDT)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Wallet Address" value={bankData.walletAddress || ''} onChange={e => setBankData({...bankData, walletAddress: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 font-mono text-[11px] outline-none" />
                      <select value={bankData.network || 'TRC20'} onChange={e => setBankData({...bankData, network: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 font-bold">
                        <option value="TRC20">TRC20 (Tron)</option>
                        <option value="ERC20">ERC20 (Ethereum)</option>
                        <option value="BEP20">BEP20 (Binance)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={handleSaveBank} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700">بروزرسانی اطلاعات پرداخت</button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 space-y-10">
              <h3 className="text-2xl font-black">شخصی‌سازی ظاهر فروشگاه</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-slate-50 rounded-3xl">
                  <label className="block text-xs font-black text-slate-400 mb-4 uppercase">رنگ تم فروشگاه</label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-16 h-16 rounded-xl border-none p-0 cursor-pointer overflow-hidden shadow-sm" />
                    <span className="font-mono text-sm text-slate-500 uppercase">{themeColor}</span>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl">
                  <label className="block text-xs font-black text-slate-400 mb-4 uppercase">رنگ دکمه «خرید سریع»</label>
                  <div className="flex items-center gap-4">
                    <input type="color" value={buyButtonColor} onChange={e => setBuyButtonColor(e.target.value)} className="w-16 h-16 rounded-xl border-none p-0 cursor-pointer overflow-hidden shadow-sm" />
                    <span className="font-mono text-sm text-slate-500 uppercase">{buyButtonColor}</span>
                  </div>
                </div>
              </div>
              <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl">
                <div className="text-[10px] font-black text-slate-400 mb-6 uppercase text-center">پیش‌نمایش زنده المان‌ها</div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full mb-2" style={{ backgroundColor: themeColor }}></div>
                    <span className="text-[10px] font-bold text-slate-400">رنگ برند</span>
                  </div>
                  <button style={{ backgroundColor: buyButtonColor }} className="px-12 py-4 rounded-2xl text-white font-black shadow-xl">خرید سریع محصول</button>
                </div>
              </div>
              <button onClick={() => onUpdateThemeColor?.(activeLink.id, themeColor, buyButtonColor)} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100">ذخیره تنظیمات ظاهر</button>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <h2 className="text-3xl font-black mb-8 text-slate-900">محصول جدید</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400">تصویر شاخص محصول</label>
                {tempImage ? (
                  <div className="relative h-64 bg-slate-100 rounded-3xl overflow-hidden">
                    <Cropper image={tempImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                    <button onClick={finishCrop} className="absolute bottom-4 left-4 right-4 bg-indigo-600 text-white py-3 rounded-xl font-black shadow-xl">تایید تصویر</button>
                  </div>
                ) : croppedImage ? (
                  <div className="relative group">
                    <img src={croppedImage} className="w-full h-40 object-cover rounded-3xl border border-slate-100" />
                    <button onClick={() => setCroppedImage(null)} className="absolute inset-0 bg-black/40 text-white font-black opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">تغییر عکس</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 transition-colors group">
                    <span className="text-slate-400 font-bold group-hover:text-indigo-600">انتخاب تصویر اصلی</span>
                    <input type="file" className="hidden" onChange={e => {
                      const f = e.target.files?.[0];
                      if(f){
                        const r = new FileReader();
                        r.onload = () => setTempImage(r.result as string);
                        r.readAsDataURL(f);
                      }
                    }} />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-2">نام محصول</label>
                  <input type="text" value={newProductName} onChange={e => setNewProductName(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-2">دسته‌بندی</label>
                  <select value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold">
                    {activeLink?.categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-2">قیمت</label>
                  <input type="number" value={newProductPrice || ''} onChange={e => setNewProductPrice(Number(e.target.value))} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 mr-2">واحد پول کالا</label>
                  <select value={newProductCurrency} onChange={e => setNewProductCurrency(e.target.value as Currency)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold">
                    <option value={Currency.IRR}>ریال</option>
                    <option value={Currency.USD}>دلار</option>
                    <option value={Currency.EUR}>یورو</option>
                    <option value={Currency.CRYPTO}>کریپتو</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-6 h-6 accent-indigo-600 rounded-lg" />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-indigo-900">نمایش به عنوان محصول ویژه</span>
                  <span className="text-[10px] text-indigo-400">این محصول با نشان ویژه در بالای کاتالوگ شما قرار می‌گیرد.</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-400">توضیحات کوتاه هوشمند (برای اینستاگرام/تلگرام)</label>
                  <button onClick={async () => { if(newProductName){ setIsGenerating(true); setNewProductDesc(await generateProductDescription(newProductName)); setIsGenerating(false); } }} className="text-[10px] text-indigo-600 font-black flex items-center gap-1 hover:underline">
                    {isGenerating ? <div className="w-2 h-2 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> : '✨'}
                    {isGenerating ? 'در حال تولید...' : 'تولید متن با هوش مصنوعی'}
                  </button>
                </div>
                <textarea rows={2} value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold resize-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400">توضیحات تفصیلی محصول (مشخصات فنی و شرایط ارسال)</label>
                <textarea rows={4} value={newDetailedDesc} onChange={e => setNewDetailedDesc(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold resize-none" placeholder="مثلاً: ابعاد محصول، وزن، زمان تحویل و ..." />
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={handleAddProduct} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-100 transition-all active:scale-95">تایید و انتشار نهایی</button>
                <button onClick={() => setIsAddingProduct(false)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black">انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {isPreviewOpen && activeLink && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[600] flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-full max-h-[850px] bg-slate-800 rounded-[3rem] border-[8px] border-slate-700 overflow-hidden flex flex-col shadow-2xl">
            <div className="flex-1 bg-white overflow-y-auto"><PublicLinkView links={[activeLink]} /></div>
            <button onClick={() => setIsPreviewOpen(false)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full text-xl hover:bg-black/80 transition-all">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
