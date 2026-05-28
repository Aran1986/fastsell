
import React, { useState, useMemo, useEffect } from 'react';
import { SalesLink, BankDetails, Order, AppUser, StoreMode, Integrations } from '../types';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import { ApiService } from '../services/apiService';

// Core Modules
import ProductManager from './dashboard/ProductManager';
import OrderManager from './dashboard/OrderManager';
import LinkManager from './dashboard/LinkManager';

// Growth & CRM Modules
import AnalyticsOverview from './dashboard/AnalyticsOverview';
import MarketingManager from './dashboard/MarketingManager';
import MiniCRM from './dashboard/MiniCRM';
import ChatManager from './dashboard/ChatManager';
import PromotionManager from './dashboard/PromotionManager';
import SellerPower from './dashboard/SellerPower';

// Finance & Settings Modules
import FinanceHub from './dashboard/FinanceHub';
import AffiliatePanel from './dashboard/AffiliatePanel';
import ProfileManager from './dashboard/ProfileManager';
import PaymentSettings from './dashboard/PaymentSettings';
import IntegrationSettings from './dashboard/IntegrationSettings';
import CommunicationBridges from './dashboard/CommunicationBridges';
import AppearanceSettings from './dashboard/AppearanceSettings';

interface DashboardProps {
  links: SalesLink[];
  allLinksForPurchases: SalesLink[];
  currentUser: AppUser;
  onAddProduct: (linkId: string, product: any) => void;
  onDeleteProduct: (linkId: string, productId: string) => void;
  onUpdateBankDetails: (linkId: string, bankDetails: BankDetails) => void;
  onUpdateProfile?: (linkId: string, data: any) => void;
  onUpdateOrder?: (linkId: string, orderId: string, updates: Partial<Order>) => void;
  onUpdateThemeColor?: (linkId: string, color: string, buyButtonColor?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { links, currentUser, allLinksForPurchases } = props;
  const navigate = useNavigate();
  
  const [activeLinkId, setActiveLinkId] = useState<string | null>(links[0]?.id || null);
  const [activeTab, setActiveTab] = useState<string>('products');
  const [storeSelectorType, setStoreSelectorType] = useState<StoreMode | null>(null);
  
  // State needed for FinanceHub (mocking user list for now if not passed from App)
  const [allUsers, setAllUsers] = useState<AppUser[]>([currentUser]); 

  // Fetch all users for Finance calculations if needed (Simulated)
  useEffect(() => {
     // In a real app, we would fetch this or pass it from App.tsx
     // preserving existing logic.
  }, []);

  const activeLink = useMemo(() => links.find(l => l.id === activeLinkId), [links, activeLinkId]);

  const handleUpdateIntegrations = async (linkId: string, data: Integrations) => {
    const store = links.find(l => l.id === linkId);
    if(store) { 
        await ApiService.saveStore({...store, integrations: data});
        // Trigger parent refresh if needed, or simple alert
    }
  };

  const menuGroups = [
    {
      title: 'مدیریت فروشگاه',
      items: [
        { id: 'products', label: activeLink?.mode === StoreMode.PRODUCT ? 'کالاها' : 'خدمات / نوبت‌ها', icon: '📦' },
        { id: 'orders', label: 'سفارشات', icon: '📝' },
        { id: 'links', label: 'لینک‌های مستقیم', icon: '🔗' },
      ]
    },
    {
      title: 'رشد و مشتریان',
      items: [
        { id: 'analytics', label: 'آمار و تحلیل', icon: '📊' },
        { id: 'crm', label: 'مدیریت مشتریان', icon: '👥' },
        { id: 'chat', label: 'پیام‌ها و چت', icon: '💬' },
        { id: 'marketing', label: 'بازاریابی و کمپین', icon: '📢' },
        { id: 'promotion', label: 'پروموشن (Boost)', icon: '🚀' },
        { id: 'seller-power', label: 'قدرت فروشنده', icon: '👑' },
      ]
    },
    {
      title: 'تنظیمات و مالی',
      items: [
        { id: 'finance', label: 'امور مالی و کیف پول', icon: '💰' },
        { id: 'affiliate', label: 'همکاری در فروش', icon: '🤝' },
        { id: 'profile', label: 'پروفایل و بیو', icon: '⚙️' },
        { id: 'bank', label: 'درگاه پرداخت', icon: '🏦' },
        { id: 'integrations', label: 'اتصال و دامنه', icon: '🔌' },
        { id: 'bridges', label: 'پل‌های ارتباطی', icon: '🛡️' },
        { id: 'appearance', label: 'ظاهر و تم', icon: '🎨' },
      ]
    }
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 sticky top-24 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Store Switcher */}
            <div>
               <h2 className="text-[10px] font-black text-slate-400 px-4 mb-4 uppercase tracking-widest">نوع فروشگاه</h2>
               <div className="space-y-2">
                  <button onClick={() => setStoreSelectorType(StoreMode.PRODUCT)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${activeLink?.mode === StoreMode.PRODUCT ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}>
                    <span className="font-black text-xs">📦 محصولات فیزیکی</span>
                    <span className="text-[10px] opacity-60">{links.filter(l => l.mode === StoreMode.PRODUCT).length}</span>
                  </button>
                  <button onClick={() => setStoreSelectorType(StoreMode.SERVICE)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${activeLink?.mode === StoreMode.SERVICE ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}>
                    <span className="font-black text-xs">🎓 خدمات و آموزش</span>
                    <span className="text-[10px] opacity-60">{links.filter(l => l.mode === StoreMode.SERVICE).length}</span>
                  </button>
                  <button onClick={() => setStoreSelectorType(StoreMode.BOOKING)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${activeLink?.mode === StoreMode.BOOKING ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}>
                    <span className="font-black text-xs">📅 رزرو نوبت</span>
                    <span className="text-[10px] opacity-60">{links.filter(l => l.mode === StoreMode.BOOKING).length}</span>
                  </button>
               </div>
            </div>

            <div className="h-px bg-slate-100 mx-2"></div>

            {/* Menu Items */}
            <div className="space-y-6">
              {menuGroups.map((group, idx) => (
                <div key={idx}>
                  <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{group.title}</h3>
                  <div className="space-y-1">
                    {group.items.map(item => (
                      <button 
                        key={item.id} 
                        disabled={!activeLink} 
                        onClick={() => setActiveTab(item.id)} 
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all font-black text-xs ${activeTab === item.id ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-9 min-h-[700px]">
          {activeLink ? (
            <div className="animate-in fade-in duration-500 space-y-6">
              {/* Top Bar */}
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[1.2rem] bg-indigo-50 flex items-center justify-center text-2xl">🏪</div>
                    <div>
                       <h1 className="text-xl font-black text-slate-900">{activeLink.title}</h1>
                       <span className="text-[10px] font-bold text-slate-400" dir="ltr">fastsell.ir/s/{activeLink.slug}</span>
                    </div>
                 </div>
                 <div className="flex gap-3">
                   <button onClick={() => navigate(`/checkout/${activeLink.slug}/preview`)} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs hover:bg-slate-200 transition-colors">پیش‌نمایش</button>
                   <button onClick={() => window.open(`/#/s/${activeLink.slug}`, '_blank')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-xl hover:bg-indigo-600 transition-colors">مشاهده زنده</button>
                 </div>
              </div>

              {/* Dynamic Content Rendering */}
              {activeTab === 'products' && <ProductManager activeLink={activeLink} onAddProduct={props.onAddProduct} onDeleteProduct={props.onDeleteProduct} />}
              {activeTab === 'orders' && <OrderManager activeLink={activeLink} onUpdateOrder={props.onUpdateOrder} />}
              {activeTab === 'links' && <LinkManager activeLink={activeLink} refreshData={() => {}} />}
              
              {activeTab === 'analytics' && <AnalyticsOverview activeLink={activeLink} />}
              {activeTab === 'crm' && <MiniCRM activeLink={activeLink} />}
              {activeTab === 'chat' && <ChatManager activeLink={activeLink} />}
              {activeTab === 'marketing' && <MarketingManager activeLink={activeLink} />}
              {activeTab === 'promotion' && <PromotionManager activeLink={activeLink} />}
              {activeTab === 'seller-power' && <SellerPower activeLink={activeLink} />}
              
              {activeTab === 'finance' && <FinanceHub activeLink={activeLink} allUsers={allUsers} allStores={allLinksForPurchases} currentUser={currentUser} />}
              {activeTab === 'affiliate' && <AffiliatePanel currentUser={currentUser} allStores={allLinksForPurchases} />}
              {activeTab === 'profile' && <ProfileManager activeLink={activeLink} onUpdateProfile={props.onUpdateProfile} />}
              {activeTab === 'bank' && <PaymentSettings activeLink={activeLink} onUpdateBankDetails={props.onUpdateBankDetails} />}
              {activeTab === 'integrations' && <IntegrationSettings activeLink={activeLink} onUpdateIntegrations={handleUpdateIntegrations} />}
              {activeTab === 'bridges' && <CommunicationBridges activeLink={activeLink} onUpdateIntegrations={handleUpdateIntegrations} />}
              {activeTab === 'appearance' && <AppearanceSettings activeLink={activeLink} onUpdateThemeColor={props.onUpdateThemeColor} />}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-20 border border-slate-200 text-center flex flex-col items-center justify-center h-full min-h-[500px]">
               <div className="text-6xl mb-6">🏜️</div>
               <h3 className="text-xl font-black text-slate-900 mb-4">فروشگاهی انتخاب نشده است</h3>
               <p className="text-slate-400 font-bold mb-8 max-w-md">برای دسترسی به داشبورد، یکی از فروشگاه‌های خود را از منوی سمت راست انتخاب کنید یا یک فروشگاه جدید بسازید.</p>
               <button onClick={() => navigate('/register')} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform">+ ساخت موتور فروش جدید</button>
            </div>
          )}
        </main>
      </div>

      {/* Store Selector Modal */}
      <Modal isOpen={!!storeSelectorType} onClose={() => setStoreSelectorType(null)} title="انتخاب از لیست فروشگاه‌ها">
         <div className="p-8 space-y-4">
            {links.filter(l => l.mode === storeSelectorType).length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {links.filter(l => l.mode === storeSelectorType).map(l => (
                    <button key={l.id} onClick={() => { setActiveLinkId(l.id); setStoreSelectorType(null); }} className={`p-6 rounded-[2.5rem] border-2 text-right transition-all group ${activeLinkId === l.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-indigo-200'}`}>
                       <div className="font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{l.title}</div>
                       <div className="text-[10px] font-bold text-slate-400">fastsell.ir/s/{l.slug}</div>
                    </button>
                  ))}
               </div>
            ) : (
               <div className="text-center py-10">
                  <p className="text-slate-400 font-bold mb-6">شما هنوز فروشگاهی در این دسته‌بندی نساخته‌اید.</p>
                  <button onClick={() => { navigate('/register'); setStoreSelectorType(null); }} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs">همین حالا بسازید</button>
               </div>
            )}
         </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
