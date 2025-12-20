
import React, { useState, useMemo } from 'react';
import { SalesLink, Product, Currency, BankDetails, Order, AppUser } from '../types';
import PublicLinkView from './PublicLinkView';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

// Modular Sub-components
import ProductManager from './dashboard/ProductManager';
import OrderManager from './dashboard/OrderManager';
import LinkManager from './dashboard/LinkManager';
import ProfileManager from './dashboard/ProfileManager';
import PaymentSettings from './dashboard/PaymentSettings';
import AppearanceSettings from './dashboard/AppearanceSettings';

interface DashboardProps {
  links: SalesLink[];
  allLinksForPurchases: SalesLink[];
  currentUser: AppUser;
  onAddProduct: (linkId: string, product: Omit<Product, 'id' | 'salesCount'>) => void;
  onDeleteProduct: (linkId: string, productId: string) => void;
  onUpdateBankDetails: (linkId: string, bankDetails: BankDetails) => void;
  onUpdateProfile?: (linkId: string, data: { title: string; bio: string; defaultCurrency: Currency; categories: string[] }) => void;
  onUpdateOrder?: (linkId: string, orderId: string, updates: Partial<Order>) => void;
  onUpdateThemeColor?: (linkId: string, color: string, buyButtonColor?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { links, allLinksForPurchases, currentUser } = props;
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeLinkId, setActiveLinkId] = useState<string | null>(links[links.length - 1]?.id || null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'manage-links' | 'profile' | 'appearance' | 'bank' | 'purchases'>('products');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getBaseUrl = () => window.location.href.split('#')[0] + '#';

  const myPurchases = useMemo(() => {
    const orders: Order[] = [];
    allLinksForPurchases.forEach(l => {
      const filtered = (l.orders || []).filter(o => o.customerEmail === currentUser.email);
      orders.push(...filtered);
    });
    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allLinksForPurchases, currentUser.email]);

  const activeLink = links.find(l => l.id === activeLinkId);

  const handleCopy = (text: string, msg: string) => {
    navigator.clipboard.writeText(text).then(() => alert(msg));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {activeTab === 'purchases' ? '🛍️ تاریخچه خریدهای من' : activeLink?.title || 'مدیریت فروشگاه'}
          </h1>
          {activeTab !== 'purchases' && activeLink && (
            <div className="flex items-center gap-2 mt-2" dir="ltr">
              <span className="text-[10px] font-mono text-indigo-400 opacity-70 truncate max-w-[200px]">.../s/{activeLink.slug}</span>
              <button onClick={() => handleCopy(`${getBaseUrl()}/s/${activeLink.slug}`, 'لینک کپی شد!')} className="text-[10px] bg-slate-100 px-3 py-1.5 rounded-xl font-black hover:bg-slate-200 ml-2">کپی لینک</button>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/register')} className="bg-green-50 text-green-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-green-100 transition-all">+ ساخت فروشگاه جدید</button>
          {activeLink && <button onClick={() => setIsPreviewOpen(true)} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-200">پیش‌نمایش زنده</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-[10px] font-black text-slate-400 px-4 mb-4 uppercase tracking-widest">فروشگاه‌های شما</h2>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {links.length === 0 ? <p className="p-4 text-xs font-bold text-slate-300">هنوز فروشگاهی ندارید.</p> : links.map(l => (
                  <button key={l.id} onClick={() => { setActiveLinkId(l.id); if(activeTab === 'purchases') setActiveTab('products'); }} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeLinkId === l.id && activeTab !== 'purchases' ? 'bg-indigo-50 text-indigo-600 font-black border border-indigo-100' : 'hover:bg-slate-50 text-slate-500 font-bold'}`}>
                    <span className="truncate">{l.title}</span>
                    {activeLinkId === l.id && activeTab !== 'purchases' && <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>}
                  </button>
                ))}
            </div>
            
            <div className="h-px bg-slate-100 my-4 mx-4"></div>
            
            <h2 className="text-[10px] font-black text-slate-400 px-4 mb-4 uppercase tracking-widest">بخش خریدار</h2>
            <button onClick={() => setActiveTab('purchases')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-sm ${activeTab === 'purchases' ? 'bg-green-600 text-white shadow-xl shadow-green-100' : 'hover:bg-slate-50 text-slate-600'}`}>
              <span className="text-xl">🛍️</span>
              <span>خرید‌های من ({myPurchases.length})</span>
            </button>

            {activeLink && (
              <>
                <div className="h-px bg-slate-100 my-4 mx-4"></div>
                <h2 className="text-[10px] font-black text-slate-400 px-4 mb-4 uppercase tracking-widest">تنظیمات فروشگاه فعال</h2>
                {[
                  { id: 'products', label: t('products'), icon: '📦' },
                  { id: 'orders', label: t('orders'), icon: '📝' },
                  { id: 'manage-links', label: 'لینک‌های مستقیم', icon: '🔗' },
                  { id: 'profile', label: 'پروفایل', icon: '👤' },
                  { id: 'bank', label: 'بانک', icon: '💳' },
                  { id: 'appearance', label: 'ظاهر', icon: '🎨' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-sm ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'hover:bg-slate-50 text-slate-600'}`}>
                    <span className="text-xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'purchases' ? (
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in fade-in">
              <h3 className="text-xl font-black mb-8">تاریخچه خریدهای شما ({currentUser.email})</h3>
              <div className="space-y-4">
                {myPurchases.length === 0 ? <div className="text-center py-20 text-slate-300 font-bold italic">هنوز خریدی ثبت نکرده‌اید.</div> : myPurchases.map(order => (
                  <div key={order.id} className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-[2rem] border border-slate-100 hover:bg-slate-50 transition-all">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl">🎁</div>
                    <div className="flex-1 text-center md:text-right">
                      <div className="font-black text-slate-900">{order.productName}</div>
                      <div className="text-[10px] text-slate-400 mt-1">شناسه سفارش: {order.id}</div>
                    </div>
                    <div className="text-center md:text-left">
                       <div className="font-black text-indigo-600">{order.amount.toLocaleString()} <span className="text-[10px]">{order.currency}</span></div>
                       <div className={`mt-2 px-3 py-1 rounded-full text-[9px] font-black inline-block ${order.status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{order.status === 'pending' ? 'در حال پردازش' : 'تکمیل شده'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeLink ? (
            <>
              {activeTab === 'products' && <ProductManager activeLink={activeLink} onAddProduct={props.onAddProduct} onDeleteProduct={props.onDeleteProduct} />}
              {activeTab === 'orders' && <OrderManager activeLink={activeLink} onUpdateOrder={props.onUpdateOrder} />}
              {activeTab === 'manage-links' && <LinkManager activeLink={activeLink} />}
              {activeTab === 'profile' && <ProfileManager activeLink={activeLink} onUpdateProfile={props.onUpdateProfile} />}
              {activeTab === 'bank' && <PaymentSettings activeLink={activeLink} onUpdateBankDetails={props.onUpdateBankDetails} />}
              {activeTab === 'appearance' && <AppearanceSettings activeLink={activeLink} onUpdateThemeColor={props.onUpdateThemeColor} />}
            </>
          ) : <div className="bg-white p-20 rounded-[3rem] text-center text-slate-300 font-black italic border-2 border-dashed border-slate-100">یک فروشگاه انتخاب کنید یا فروشگاه جدید بسازید.</div>}
        </div>
      </div>
      {isPreviewOpen && activeLink && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[600] flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-full max-h-[850px] bg-slate-800 rounded-[3.5rem] border-[12px] border-slate-700 overflow-hidden shadow-2xl">
            <div className="flex-1 bg-white h-full overflow-y-auto"><PublicLinkView links={[activeLink]} /></div>
            <button onClick={() => setIsPreviewOpen(false)} className="absolute top-6 right-6 bg-black/60 text-white w-12 h-12 rounded-full text-3xl flex items-center justify-center font-black z-[700]">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
