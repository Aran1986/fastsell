
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SalesLink, Product, Currency, AppUser } from './types';
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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [links, setLinks] = useState<SalesLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const user = await ApiService.getCurrentUser();
      setCurrentUser(user);
      const allStores = await ApiService.getAllStores();
      setLinks(allStores);
      setIsLoading(false);
    };
    init();
  }, []);

  const refreshData = async () => {
    const all = await ApiService.getAllStores();
    setLinks(all);
  };

  const handleLogin = async (email: string, referredBy?: string) => {
    const user = await ApiService.login(email, referredBy);
    setCurrentUser(user);
    await refreshData();
  };

  const createLink = async (linkData: { title: string; slug: string }) => {
    if (!currentUser) return;
    const newLink: SalesLink = {
      id: Math.random().toString(36).substr(2, 9),
      ownerEmail: currentUser.email,
      slug: linkData.slug,
      title: linkData.title,
      bio: 'به فروشگاه جدید من خوش آمدید!',
      themeColor: '#6366f1',
      buyButtonColor: '#6366f1',
      totalSales: 0,
      products: [],
      orders: [],
      defaultCurrency: Currency.IRR,
      categories: ['عمومی'],
      bankDetails: { walletAddress: '', network: 'TRC20' }
    };
    await ApiService.saveStore(newLink);
    await refreshData();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <LanguageProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/marketplace" element={<Marketplace links={links} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} onCreateLink={createLink} existingLinks={links} user={currentUser} />} />
            <Route path="/dashboard" element={
              currentUser ? (
                <div className="flex flex-col flex-1">
                  <Header onLogout={() => { ApiService.logout(); setCurrentUser(null); }} user={currentUser} />
                  <Dashboard 
                    links={links.filter(l => l.ownerEmail === currentUser.email)} 
                    allLinksForPurchases={links}
                    currentUser={currentUser}
                    onAddProduct={async (id, p) => {
                      const store = links.find(l => l.id === id);
                      if(store) {
                        const updated = {...store, products: [...store.products, {...p, id: Math.random().toString(36).substr(2, 9), salesCount: 0}]};
                        await ApiService.saveStore(updated);
                        await refreshData();
                      }
                    }}
                    onDeleteProduct={async (id, pid) => {
                      const store = links.find(l => l.id === id);
                      if(store) {
                        const updated = {...store, products: store.products.filter(p => p.id !== pid)};
                        await ApiService.saveStore(updated);
                        await refreshData();
                      }
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
              const targetStore = links.find(l => l.slug === slug);
              const targetProduct = targetStore?.products.find(p => p.id === pid);
              
              await ApiService.createOrder(slug, {
                productId: pid,
                productName: targetProduct?.name || 'Product',
                amount: amt,
                currency: targetProduct?.currency || Currency.IRR,
                customerEmail: data.email,
                customerPhone: data.phone,
                customerAddress: data.address,
                customerPostalCode: data.postalCode,
                transactionHash: data.transactionHash,
                source: data.source
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
