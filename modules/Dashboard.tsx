
import React, { useState, useEffect } from 'react';
import { SalesLink, Product, Currency, BankDetails, Order } from '../types';
import PublicLinkView from './PublicLinkView';
import { useLanguage } from '../context/LanguageContext';

// Modular Sub-components
import ProductManager from './dashboard/ProductManager';
import OrderManager from './dashboard/OrderManager';
import LinkManager from './dashboard/LinkManager';
import ProfileManager from './dashboard/ProfileManager';
import PaymentSettings from './dashboard/PaymentSettings';
import AppearanceSettings from './dashboard/AppearanceSettings';

interface DashboardProps {
  links: SalesLink[];
  onAddProduct: (linkId: string, product: Omit<Product, 'id' | 'salesCount'>) => void;
  onDeleteProduct: (linkId: string, productId: string) => void;
  onUpdateBankDetails: (linkId: string, bankDetails: BankDetails) => void;
  onUpdateProfile?: (linkId: string, data: { title: string; bio: string; defaultCurrency: Currency; categories: string[] }) => void;
  onUpdateOrder?: (linkId: string, orderId: string, updates: Partial<Order>) => void;
  onUpdateThemeColor?: (linkId: string, color: string, buyButtonColor?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
  const { links } = props;
  const { t } = useLanguage();
  const [activeLinkId, setActiveLinkId] = useState<string | null>(links[links.length - 1]?.id || null);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'manage-links' | 'profile' | 'appearance' | 'bank'>('products');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const activeLink = links.find(l => l.id === activeLinkId);

  const handleCopy = (text: string, msg: string) => {
    navigator.clipboard.writeText(text).then(() => alert(msg));
  };

  if (!activeLink && links.length > 0) {
      setActiveLinkId(links[0].id);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
      {/* Header Info */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{activeLink?.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-mono text-indigo-400">fastsell.ir/s/{activeLink?.slug}</span>
            <button onClick={() => handleCopy(`https://fastsell.ir/#/s/${activeLink?.slug}`, 'Link copied!')} className="text-[10px] bg-slate-100 px-3 py-1.5 rounded-xl font-black hover:bg-slate-200 transition-all">Copy Store Link</button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsPreviewOpen(true)} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">Live Preview</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-[10px] font-black text-slate-400 px-4 mb-4 uppercase tracking-widest">Store Selection</h2>
            {links.map(l => (
              <button key={l.id} onClick={() => setActiveLinkId(l.id)} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeLinkId === l.id ? 'bg-indigo-50 text-indigo-600 font-black border border-indigo-100' : 'hover:bg-slate-50 text-slate-500 font-bold'}`}>
                <span>{l.title}</span>
                {activeLinkId === l.id && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200 animate-pulse"></div>}
              </button>
            ))}
            <div className="h-px bg-slate-100 my-6 mx-4"></div>
            {[
              { id: 'products', label: t('products'), icon: '📦' },
              { id: 'orders', label: t('orders'), icon: '📝' },
              { id: 'manage-links', label: t('manageLinks'), icon: '🔗' },
              { id: 'profile', label: t('profile'), icon: '👤' },
              { id: 'bank', label: t('bank'), icon: '💳' },
              { id: 'appearance', label: t('appearance'), icon: '🎨' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-sm ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'hover:bg-slate-50 text-slate-600'}`}>
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Modular Content Area */}
        <div className="lg:col-span-3">
          {activeLink && (
            <>
              {activeTab === 'products' && <ProductManager activeLink={activeLink} onAddProduct={props.onAddProduct} onDeleteProduct={props.onDeleteProduct} />}
              {activeTab === 'orders' && <OrderManager activeLink={activeLink} onUpdateOrder={props.onUpdateOrder} />}
              {activeTab === 'manage-links' && <LinkManager activeLink={activeLink} />}
              {activeTab === 'profile' && <ProfileManager activeLink={activeLink} onUpdateProfile={props.onUpdateProfile} />}
              {activeTab === 'bank' && <PaymentSettings activeLink={activeLink} onUpdateBankDetails={props.onUpdateBankDetails} />}
              {activeTab === 'appearance' && <AppearanceSettings activeLink={activeLink} onUpdateThemeColor={props.onUpdateThemeColor} />}
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && activeLink && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[600] flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-full max-h-[850px] bg-slate-800 rounded-[3.5rem] border-[12px] border-slate-700 overflow-hidden shadow-2xl">
            <div className="flex-1 bg-white h-full overflow-y-auto"><PublicLinkView links={[activeLink]} /></div>
            <button onClick={() => setIsPreviewOpen(false)} className="absolute top-6 right-6 bg-black/60 text-white w-12 h-12 rounded-full text-3xl flex items-center justify-center font-black transition-all hover:scale-110 active:scale-95 z-[700]">×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
