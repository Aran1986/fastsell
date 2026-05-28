
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SalesLink, AppUser, StoreMode, Currency } from './types';
import { LanguageProvider } from './context/LanguageContext';
import { ApiService } from './services/apiService';

import Dashboard from './modules/Dashboard';
import PublicLinkView from './modules/PublicLinkView';
import Checkout from './modules/Checkout';
import LandingPage from './modules/LandingPage';
import Register from './modules/Register';
import Marketplace from './modules/Marketplace';
import Header from './components/Header';
import Transparency from './modules/Transparency';
import Pricing from './modules/Pricing';
import Roadmap from './modules/Roadmap';
import DatabaseSchema from './modules/DatabaseSchema';
import TechnicalDebts from './modules/TechnicalDebts';
import ExistingFeatures from './modules/ExistingFeatures';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [links, setLinks] = useState<SalesLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mappedStore, setMappedStore] = useState<SalesLink | null>(null);

  useEffect(() => {
    const init = async () => {
      const user = await ApiService.getCurrentUser();
      setCurrentUser(user);
      const allStores = await ApiService.getAllStores();
      setLinks(allStores);

      const hostname = window.location.hostname;
      const isMainDomain = hostname.includes('fastsell.ir') || hostname === 'localhost';
      
      if (!isMainDomain) {
        const found = allStores.find(s => s.integrations?.customDomain === hostname);
        if (found) setMappedStore(found);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const refreshData = async () => {
    const all = await ApiService.getAllStores();
    setLinks(all);
    const hostname = window.location.hostname;
    const found = all.find(s => s.integrations?.customDomain === hostname);
    if (found) setMappedStore(found);
  };

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    refreshData();
  };

  const createLink = async (linkData: { title: string; slug: string; mode: StoreMode }) => {
    if (!currentUser) return;
    const newLink: SalesLink = {
      id: '', 
      ownerEmail: currentUser.identifier,
      slug: linkData.slug,
      title: linkData.title,
      bio: 'به فروشگاه جدید من خوش آمدید!',
      mode: linkData.mode,
      themeColor: '#6366f1',
      buyButtonColor: '#6366f1',
      totalSales: 0,
      shippingFee: 0,
      products: [],
      orders: [],
      defaultCurrency: Currency.IRR,
      categories: [
        'عمومی', 'موبایل و تبلت', 'لپ‌تاپ و کامپیوتر', 'پوشاک مردانه', 'پوشاک زنانه', 
        'لوازم خانگی', 'آرایشی و بهداشتی', 'کتاب و لوازم‌التحریر', 'اسباب‌بازی و سرگرمی', 
        'ورزش و سفر', 'خودرو و ابزار', 'کالاهای سوپرمارکتی', 'صنایع دستی', 'پت‌شاپ', 
        'خدمات و آموزش', 'ساعت و اکسسوری', 'طلا و جواهر', 'لوازم دکوری'
      ],
      bankDetails: { walletAddress: '', network: 'TRC20' },
      integrations: { 
        telegramChatId: '', 
        whatsappNumber: '', 
        prefs: { telegram: 'neutral', whatsapp: 'neutral', sms: 'neutral', email: 'neutral' },
        eventPrefs: { orderUpdates: true, newsletters: true, promotions: true, security: true }
      }
    };
    await ApiService.saveStore(newLink);
    await refreshData();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">...</div>;

  if (mappedStore) {
    return (
      <LanguageProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<PublicLinkView links={[mappedStore]} />} />
            <Route path="/checkout/:slug/:productId" element={<Checkout links={[mappedStore]} onSaleSuccess={async (slug, pid, amt, data) => {
              await ApiService.createOrder(slug, {
                productId: pid,
                productName: mappedStore.products.find(p => p.id === pid)?.name || 'Product',
                amount: amt,
                shippingFee: data.shippingFee,
                totalPaid: data.totalPaid,
                currency: Currency.IRR,
                customerEmail: data.email,
                customerPhone: data.phone,
                customerAddress: data.address,
                customerPostalCode: data.postalCode,
                selectedVariants: data.selectedVariants,
                transactionHash: data.transactionHash,
                source: data.source,
                bookingTime: data.bookingTime
              });
              await refreshData();
            }} />} />
            <Route path="/marketplace" element={<Marketplace links={links} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/database" element={<DatabaseSchema />} />
            <Route path="/tech-debts" element={<TechnicalDebts />} />
            <Route path="/features" element={<ExistingFeatures />} />
            <Route path="/marketplace" element={<Marketplace links={links} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} onCreateLink={createLink} existingLinks={links} user={currentUser} />} />
            <Route path="/dashboard" element={
              currentUser ? (
                <div className="flex flex-col flex-1">
                  <Header onLogout={() => { ApiService.logout(); setCurrentUser(null); }} user={currentUser} />
                  <Dashboard 
                    links={links.filter(l => l.ownerEmail === currentUser.identifier)} 
                    allLinksForPurchases={links}
                    currentUser={currentUser}
                    onAddProduct={async (linkId, p) => {
                      await ApiService.saveProduct(linkId, p);
                      await refreshData();
                    }}
                    onDeleteProduct={async (linkId, pid) => {
                      await ApiService.deleteProduct(pid);
                      await refreshData();
                    }}
                    onUpdateBankDetails={async (id, bank) => {
                      const store = links.find(l => l.id === id);
                      if(store) { await ApiService.saveStore({...store, bankDetails: bank}); await refreshData(); }
                    }}
                    onUpdateProfile={async (id, data) => {
                      const store = links.find(l => l.id === id);
                      if(store) { await ApiService.saveStore({...store, ...data}); await refreshData(); }
                    }}
                    onUpdateThemeColor={async (id, color, btn) => {
                      const store = links.find(l => l.id === id);
                      if(store) { await ApiService.saveStore({...store, themeColor: color, buyButtonColor: btn}); await refreshData(); }
                    }}
                    onUpdateOrder={async (linkId, orderId, updates) => {
                      const store = links.find(l => l.id === linkId);
                      if(store) {
                        const updatedOrders = (store.orders || []).map(o => o.id === orderId ? { ...o, ...updates } : o);
                        await ApiService.saveStore({ ...store, orders: updatedOrders });
                        await refreshData();
                      }
                    }}
                  />
                </div>
              ) : <Navigate to="/register" />
            } />
            <Route path="/s/:slug" element={<PublicLinkView links={links} />} />
            <Route path="/checkout/:slug/:productId" element={<Checkout links={links} onSaleSuccess={async (slug, pid, amt, data) => {
              await ApiService.createOrder(slug, {
                productId: pid,
                productName: links.find(l => l.slug === slug)?.products.find(p => p.id === pid)?.name || 'Product',
                amount: amt,
                shippingFee: data.shippingFee,
                totalPaid: data.totalPaid,
                currency: Currency.IRR,
                customerEmail: data.email,
                customerPhone: data.phone,
                customerAddress: data.address,
                customerPostalCode: data.postalCode,
                selectedVariants: data.selectedVariants,
                transactionHash: data.transactionHash,
                source: data.source,
                bookingTime: data.bookingTime
              });
              await refreshData();
            }} />} />
          </Routes>
        </div>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
