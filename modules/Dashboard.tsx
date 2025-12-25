
import React, { useState, useEffect, useMemo } from 'react';
import { SalesLink, Product, Currency, BankDetails, Order, AppUser, Integrations } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/apiService';

// Modular Sub-components Imports
import ProductManager from './dashboard/ProductManager';
import OrderManager from './dashboard/OrderManager';
import LinkManager from './dashboard/LinkManager';
import ProfileManager from './dashboard/ProfileManager';
import PaymentSettings from './dashboard/PaymentSettings';
import AppearanceSettings from './dashboard/AppearanceSettings';
import AffiliatePanel from './dashboard/AffiliatePanel';
import FinanceHub from './dashboard/FinanceHub';
import AnalyticsOverview from './dashboard/AnalyticsOverview';
import SellerPower from './dashboard/SellerPower';
import MiniCRM from './dashboard/MiniCRM';
import MarketingManager from './dashboard/MarketingManager';
import PromotionManager from './dashboard/PromotionManager';
import ChatManager from './dashboard/ChatManager';
import CommunicationBridges from './dashboard/CommunicationBridges';

interface DashboardProps {
  links: SalesLink[];
  allLinksForPurchases: SalesLink[];
  currentUser: AppUser;
  onAddProduct: (linkId: string, product: Omit<Product, 'id' | 'salesCount'>) => void;
  onDeleteProduct: (linkId: string, productId: string) => void;
  onUpdateBankDetails: (linkId: string, bankDetails: BankDetails) => void;
  onUpdateProfile?: (linkId: string, data: { title: string; bio: string; defaultCurrency: Currency; categories: string[]; shippingFee: number }) => void;
  onUpdateOrder?: (linkId: string, orderId: string, updates: Partial<Order>) => void;
  onUpdateThemeColor?: (linkId: string, color: string, buyButtonColor?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { links, allLinksForPurchases, currentUser } = props;
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // States
  const [activeLinkId, setActiveLinkId] = useState<string | null>(links[links.length - 1]?.id || null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'manage-links' | 'profile' | 'appearance' | 'bank' | 'purchases' | 'affiliate' | 'finance' | 'analytics' | 'reputation' | 'mini-crm' | 'marketing' | 'promotions' | 'chats' | 'bridges'>('products');
  const [localLinks, setLocalLinks] = useState<SalesLink[]>(links);

  useEffect(() => {
    setLocalLinks(links);
    if (!activeLinkId && links.length > 0) {
      setActiveLinkId(links[links.length - 1].id);
    }
  }, [links, activeLinkId]);

  const refreshLocalData = async () => {
    const all = await ApiService.getAllStores();
    setLocalLinks(all);
  };

  const activeLink = localLinks.find(l => l.id === activeLinkId);

  const myPurchases = useMemo(() => {
    const orders: Order[] = [];
    allLinksForPurchases.forEach(l => {
      const filtered = (l.orders || []).filter(o => o.customerEmail === currentUser.identifier);
      orders.push(...filtered);
    });
    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allLinksForPurchases, currentUser.identifier]);

  const outOfStockInfo = useMemo(() => {
    if (!activeLink) return { count: 0, totalNotifies: 0 };
    const oos = activeLink.products.filter(p => p.stock <= 0);
    const notifies = oos.reduce((acc, p) => acc + (p.notifyMeCount || 0), 0);
    return { count: oos.length, totalNotifies: notifies };
  }, [activeLink]);

  const handleUpdateIntegrations = async (linkId: string, integrations: Integrations) => {
    const store = localLinks.find(l => l.id === linkId);
    if (store) {
      await ApiService.saveStore({ ...store, integrations });
      await refreshLocalData();
    }
  };

  const sidebarItems = [
    { id: 'reputation', label: 'قدرت فروشنده', icon: '👑' },
    { id: 'analytics', label: 'آنالیز ترافیک', icon: '📈' },
    { id: 'promotions', label: 'پروموت و تبلیغات پولی', icon: '🚀' },
    { id: 'marketing', label: 'پیام‌رسانی هوشمند', icon: '📢' },
    { id: 'chats', label: 'پیام‌های خریداران', icon: '💬' },
    { id: 'bridges', label: 'پل‌های ارتباطی', icon: '🔌' },
    { id: 'products', label: 'محصولات', icon: '📦' },
    { id: 'orders', label: 'سفارشات', icon: '📝' },
    { id: 'mini-crm', label: 'مینی CRM', icon: '👥' },
    { id: 'manage-links', label: 'لینک‌های مستقیم', icon: '🔗' },
    { id: 'profile', label: 'پروفایل و دسته‌بندی', icon: '⚙️' },
    { id: 'bank', label: 'تنظیمات پرداخت', icon: '🏦' },
    { id: 'appearance', label: 'ظاهر و تم', icon: '🎨' },
    { id: 'finance', label: 'هاب مالی', icon: '💰' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full" dir="rtl">
      {/* Inventory Report */}
      {outOfStockInfo.count > 0 && activeTab === 'products' && (
        <div className="mb-6 p-6 bg-slate-100 border border-slate-200 rounded-[2rem] flex items-center justify-between animate-in slide-in-from-top-4">
           <div className="flex items-center gap-4">
              <span className="text-2xl">📊</span>
              <div>
                <p className="text-slate-900 text-sm font-black">گزارش موجودی کالا</p>
                <p className="text-slate-500 text-[11px] font-bold mt-1">
                  تعداد {outOfStockInfo.count} کالا در وضعیت ناموجود قرار دارند. مجموعاً {outOfStockInfo.totalNotifies} درخواست اطلاع‌رسانی توسط مشتریان ثبت شده است.
                </p>
              </div>
           </div>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-2xl"><span className="text-2xl">🏪</span></div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {activeTab === 'purchases' ? '🛍️ خریدهای من' : activeTab === 'affiliate' ? '🤝 همکاری در فروش' : activeLink?.title || 'داشبورد'}
            </h1>
            {activeLink && activeTab !== 'purchases' && activeTab !== 'affiliate' && (
              <p className="text-xs font-bold text-slate-400 mt-0.5" dir="ltr">/s/{activeLink.slug}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/register')} className="bg-green-50 text-green-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-green-100 transition-all">+ ساخت فروشگاه جدید</button>
          {activeLink && (
            <button 
              onClick={() => window.open(`/#/s/${activeLink.slug}`, '_blank')} 
              className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
            >
              مشاهده فروشگاه
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-[10px] font-black text-slate-400 px-4 mb-4 uppercase tracking-widest">بخش عمومی</h2>
            <button onClick={() => setActiveTab('purchases')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-sm ${activeTab === 'purchases' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-50 text-slate-600'}`}>
              <span className="text-xl">🛍️</span>
              <span>خریدهای من</span>
            </button>
            <button onClick={() => setActiveTab('affiliate')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-sm ${activeTab === 'affiliate' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-50 text-slate-600'}`}>
              <span className="text-xl">🤝</span>
              <span>زیرمجموعه‌ها</span>
            </button>

            <div className="h-px bg-slate-100 my-4 mx-4"></div>
            <h2 className="text-[10px] font-black text-slate-400 px-4 mb-4 uppercase tracking-widest">مدیریت فروشگاه</h2>
            
            {activeLink ? (
              <div className="space-y-1">
                {sidebarItems.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id as any)} 
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-sm ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-[10px] font-bold text-slate-300 italic">هنوز فروشگاهی ندارید.</div>
            )}
          </div>
        </aside>

        <main className="lg:col-span-3 min-h-[600px]">
          {activeTab === 'purchases' ? (
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in fade-in">
               <h3 className="text-xl font-black mb-8">تاریخچه خریدهای شما</h3>
               {myPurchases.length === 0 ? (
                 <div className="text-center py-20 text-slate-300 italic font-bold">هنوز خریدی انجام نداده‌اید.</div>
               ) : (
                 <div className="space-y-4">
                    {myPurchases.map(o => (
                      <div key={o.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <img src={o.productImage} className="w-12 h-12 rounded-xl object-cover" alt="" />
                          <div>
                            <div className="text-sm font-black text-slate-900">{o.productName}</div>
                            <div className="text-[10px] text-slate-400 font-bold mt-1">خرید از: {o.storeName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-black text-indigo-600">{o.totalPaid.toLocaleString()} {o.currency}</div>
                          <div className={`text-[9px] font-black mt-1 ${o.status === 'delivered' ? 'text-green-500' : 'text-orange-500'}`}>
                            {o.status === 'pending' ? 'در انتظار' : o.status === 'shipped' ? 'ارسال شده' : 'تحویل شده'}
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          ) : activeTab === 'affiliate' ? (
            <AffiliatePanel currentUser={currentUser} allStores={allLinksForPurchases} />
          ) : activeLink ? (
            <div className="animate-in fade-in duration-500">
              {activeTab === 'reputation' && <SellerPower activeLink={activeLink} />}
              {activeTab === 'analytics' && <AnalyticsOverview activeLink={activeLink} />}
              {activeTab === 'promotions' && <PromotionManager activeLink={activeLink} />}
              {activeTab === 'marketing' && <MarketingManager activeLink={activeLink} />}
              {activeTab === 'chats' && <ChatManager activeLink={activeLink} />}
              {activeTab === 'bridges' && <CommunicationBridges activeLink={activeLink} onUpdateIntegrations={handleUpdateIntegrations} />}
              {activeTab === 'products' && <ProductManager activeLink={activeLink} onAddProduct={props.onAddProduct} onDeleteProduct={props.onDeleteProduct} refreshData={refreshLocalData} onUpdateProfile={props.onUpdateProfile} />}
              {activeTab === 'orders' && <OrderManager activeLink={activeLink} onUpdateOrder={props.onUpdateOrder} />}
              {activeTab === 'mini-crm' && <MiniCRM activeLink={activeLink} />}
              {activeTab === 'manage-links' && <LinkManager activeLink={activeLink} refreshData={refreshLocalData} />}
              {activeTab === 'profile' && <ProfileManager activeLink={activeLink} onUpdateProfile={props.onUpdateProfile} />}
              {activeTab === 'bank' && <PaymentSettings activeLink={activeLink} onUpdateBankDetails={props.onUpdateBankDetails} />}
              {activeTab === 'appearance' && <AppearanceSettings activeLink={activeLink} onUpdateThemeColor={props.onUpdateThemeColor} />}
              {activeTab === 'finance' && <FinanceHub activeLink={activeLink} allUsers={[]} allStores={allLinksForPurchases} currentUser={currentUser} />}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-20 border border-slate-200 shadow-sm text-center flex flex-col items-center">
               <div className="text-6xl mb-6">🏜️</div>
               <h3 className="text-xl font-black text-slate-900 mb-2">هنوز فروشگاهی نساخته‌اید</h3>
               <button onClick={() => navigate('/register')} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl transition-all">ساخت اولین فروشگاه</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
