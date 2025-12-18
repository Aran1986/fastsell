
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
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'manage-links' | 'profile' | 'appearance' | 'bank'>('products');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Form States for New Product
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
    if (activeLinkId && onUpdateProfile) {
      onUpdateProfile(activeLinkId, { title: profileTitle, bio: profileBio, defaultCurrency: profileCurrency, categories: profileCats });
      alert('پروفایل ذخیره شد.');
    }
  };

  const resetCats = () => {
    setProfileCats(['عمومی', 'تکنولوژی', 'پوشاک']);
  };

  const handleSaveBank = () => {
    if (activeLinkId) {
      onUpdateBankDetails(activeLinkId, bankData);
      alert('تنظیمات پرداخت ذخیره شد.');
    }
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

  // Image Crop Logic
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
      {/* Header */}
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
          <button onClick={() => setIsAddingProduct(true)} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg">محصول جدید +</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-[10px] font-black text-slate-400 px-4 mb-2 uppercase tracking-widest">انتخاب فروشگاه</h2>
            {links.map(l => (
              <button key={l.id} onClick={() => setActiveLinkId(l.id)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeLinkId === l.id ? 'bg-indigo-50 text-indigo-600 font-black border border-indigo-100' : 'hover:bg-slate-50 text-slate-500 font-bold'}`}>
                <span>{l.title}</span>
                {activeLinkId === l.id && <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>}
              </button>
            ))}
            <div className="h-px bg-slate-100 my-4 mx-4"></div>
            {[
              { id: 'products', label: 'محصولات', icon: '📦' },
              { id: 'orders', label: 'سفارشات', icon: '📝' },
              { id: 'manage-links', label: 'مدیریت لینک‌ها', icon: '🔗' },
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
                <input type="text" placeholder="جستجوی محصول..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 px-6 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold" />
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-6 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold outline-none">
                  <option value="all">همه دسته‌ها</option>
                  {activeLink?.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {sortedProducts.map(p => (
                  <div key={p.id} className={`bg-white p-6 rounded-[2.5rem] border ${p.isFeatured ? 'border-indigo-200 bg-indigo-50/10' : 'border-slate-200'} flex flex-col md:flex-row items-center gap-6 transition-all`}>
                    <div className="relative">
                      <img src={p.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm" alt="" />
                      {p.isFeatured && <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] px-2 py-1 rounded-full font-black uppercase tracking-tighter shadow-sm">ویژه</div>}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black">{p.name}</h3>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-1">{p.description}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="font-black text-indigo-600 text-lg">{getCurrencySymbol(p.currency)} {p.price.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-slate-300">فروش: {p.salesCount}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <button 
                        onClick={() => handleCopy(`https://fastsell.ir/#/checkout/${activeLink?.slug}/${p.id}`, 'لینک محصول کپی شد.')} 
                        className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-black text-[11px] hover:bg-indigo-600 hover:text-white transition-all text-center whitespace-nowrap"
                      >
                        دریافت لینک مستقیم محصول
                      </button>
                      <button onClick={() => onDeleteProduct(activeLink!.id, p.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'manage-links' && (
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 space-y-8 animate-in fade-in">
              <h3 className="text-2xl font-black">مدیریت لینک‌های فروش مستقیم</h3>
              <p className="text-slate-500 font-bold text-sm">از لینک‌های زیر برای هدایت مستقیم مشتری به صفحه پرداخت در اینستاگرام و تلگرام استفاده کنید.</p>
              <div className="grid grid-cols-1 gap-4">
                {activeLink?.products.map(p => {
                  const productLink = `https://fastsell.ir/#/checkout/${activeLink.slug}/${p.id}`;
                  return (
                    <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center gap-4 group hover:bg-white hover:shadow-xl transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <img src={p.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt={p.name} />
                        <div>
                          <div className="font-black text-slate-900 text-lg">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold">دسته: {p.category}</div>
                        </div>
                      </div>
                      <div className="flex-1 w-full md:w-auto">
                        <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden px-4 py-3 shadow-inner group-hover:border-indigo-200">
                          <span className="flex-1 text-[11px] font-mono text-indigo-400 truncate text-left dir-ltr">{productLink}</span>
                          <button 
                            onClick={() => handleCopy(productLink, 'لینک محصول کپی شد.')} 
                            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[11px] font-black mr-4 shadow-lg active:scale-95 transition-all"
                          >
                            کپی لینک
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black">
                  <tr><th className="p-4">محصول</th><th className="p-4">خریدار</th><th className="p-4">مبلغ</th><th className="p-4">وضعیت</th><th className="p-4">یادداشت</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeLink?.orders.map(o => (
                    <tr key={o.id}>
                      <td className="p-4 font-bold">{o.productName}</td>
                      <td className="p-4">
                        <div className="font-bold">{o.customerEmail}</div>
                        <div className="text-[9px] text-slate-400">{o.customerAddress}</div>
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
                        <input type="text" placeholder="یادداشت..." value={o.orderNote || ''} onChange={e => onUpdateOrder?.(activeLink.id, o.id, { orderNote: e.target.value })} className="bg-slate-50 border border-slate-100 rounded px-3 py-2 text-[10px] outline-none w-full" />
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
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase">نام فروشگاه</label>
                  <input type="text" value={profileTitle} onChange={e => setProfileTitle(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase">ارز کاتالوگ</label>
                  <select value={profileCurrency} onChange={e => setProfileCurrency(e.target.value as Currency)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-black">
                    <option value={Currency.IRR}>ریال (زرین‌پال)</option>
                    <option value={Currency.USD}>دلار (PayPal)</option>
                    <option value={Currency.EUR}>یورو (Stripe)</option>
                    <option value={Currency.CRYPTO}>کریپتو (USDT)</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSaveProfile} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl">ذخیره پروفایل</button>
            </div>
          )}

          {activeTab === 'bank' && (
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 space-y-10">
              <h3 className="text-2xl font-black">تنظیمات درگاه‌های پرداخت</h3>
              <div className="space-y-8">
                <div className="p-6 bg-green-50 rounded-3xl border border-green-100">
                  <div className="font-black text-green-700 mb-4 flex items-center gap-2">🏦 زرین‌پال (ریال)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="شماره شبا (IR...)" value={bankData.iban || ''} onChange={e => setBankData({...bankData, iban: e.target.value})} className="px-5 py-3 rounded-xl border border-slate-200 text-xs" />
                    <input type="text" placeholder="نام صاحب حساب" value={bankData.holderName || ''} onChange={e => setBankData({...bankData, holderName: e.target.value})} className="px-5 py-3 rounded-xl border border-slate-200 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                    <div className="font-black text-blue-600 mb-4">💳 PayPal Email</div>
                    <input type="email" placeholder="example@paypal.com" value={bankData.paypalEmail || ''} onChange={e => setBankData({...bankData, paypalEmail: e.target.value})} className="w-full px-5 py-3 rounded-xl border border-slate-200" />
                  </div>
                  <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                    <div className="font-black text-orange-600 mb-4">₿ Crypto Wallet (USDT)</div>
                    <input type="text" placeholder="آدرس ولت..." value={bankData.walletAddress || ''} onChange={e => setBankData({...bankData, walletAddress: e.target.value})} className="w-full px-5 py-3 rounded-xl border border-slate-200 font-mono text-[10px]" />
                  </div>
                </div>
              </div>
              <button onClick={handleSaveBank} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl">ذخیره تنظیمات مالی</button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 space-y-10">
              <h3 className="text-2xl font-black">شخصی‌سازی ظاهر</h3>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase">رنگ تم برند</label>
                  <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-20 h-20 rounded-2xl cursor-pointer shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-4 uppercase">رنگ دکمه خرید</label>
                  <input type="color" value={buyButtonColor} onChange={e => setBuyButtonColor(e.target.value)} className="w-20 h-20 rounded-2xl cursor-pointer shadow-sm" />
                </div>
              </div>
              <button onClick={() => onUpdateThemeColor?.(activeLink!.id, themeColor, buyButtonColor)} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl">اعمال تغییرات ظاهری</button>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <h2 className="text-3xl font-black mb-8 text-slate-900">ثبت محصول جدید</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400">تصویر محصول</label>
                {tempImage ? (
                  <div className="relative h-72 bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200">
                    <Cropper image={tempImage} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                    <button onClick={finishCrop} className="absolute bottom-4 left-4 right-4 bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl">تایید و برش</button>
                  </div>
                ) : croppedImage ? (
                  <div className="relative group overflow-hidden rounded-3xl border border-slate-100 shadow-md">
                    <img src={croppedImage} className="w-full h-48 object-cover" alt="" />
                    <button onClick={() => setCroppedImage(null)} className="absolute inset-0 bg-black/50 text-white font-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">تغییر تصویر</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-4 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <span className="text-slate-400 font-bold">انتخاب عکس محصول</span>
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

              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="نام محصول" value={newProductName} onChange={e => setNewProductName(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold" />
                <select value={newProductCategory} onChange={e => setNewProductCategory(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold">
                  {activeLink?.categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="قیمت" value={newProductPrice || ''} onChange={e => setNewProductPrice(Number(e.target.value))} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold" />
                <select value={newProductCurrency} onChange={e => setNewProductCurrency(e.target.value as Currency)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold">
                  <option value={Currency.IRR}>ریال</option>
                  <option value={Currency.USD}>دلار</option>
                  <option value={Currency.EUR}>یورو</option>
                  <option value={Currency.CRYPTO}>کریپتو</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-400">توضیحات کوتاه (AI)</label>
                  <button onClick={async () => { if(newProductName){ setIsGenerating(true); setNewProductDesc(await generateProductDescription(newProductName)); setIsGenerating(false); } }} className="text-[10px] text-indigo-600 font-black hover:underline">
                    {isGenerating ? 'درحال تولید...' : '✨ تولید با هوش مصنوعی'}
                  </button>
                </div>
                <textarea rows={2} value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none font-bold resize-none" />
              </div>

              <div className="flex gap-4 pt-6">
                <button onClick={handleAddProduct} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all">انتشار محصول</button>
                <button onClick={() => setIsAddingProduct(false)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black">لغو</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && activeLink && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-lg z-[600] flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-full max-h-[850px] bg-slate-800 rounded-[3rem] border-[10px] border-slate-700 overflow-hidden shadow-2xl">
            <div className="flex-1 bg-white h-full overflow-y-auto"><PublicLinkView links={[activeLink]} /></div>
            <button onClick={() => setIsPreviewOpen(false)} className="absolute top-4 right-4 bg-black/50 text-white w-10 h-10 rounded-full text-2xl flex items-center justify-center font-black">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
