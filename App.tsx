
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SalesLink, Product, Currency, BankDetails, Order } from './types';
import { LanguageProvider } from './context/LanguageContext';
import { ApiService } from './services/apiService';

import Dashboard from './modules/Dashboard';
import PublicLinkView from './modules/PublicLinkView';
import Checkout from './modules/Checkout';
import LandingPage from './modules/LandingPage';
import Register from './modules/Register';
import AdminDashboard from './modules/AdminDashboard';
import Docs from './modules/Docs';
import Marketplace from './modules/Marketplace';
import Header from './components/Header';

const App: React.FC = () => {
  const [links, setLinks] = useState<SalesLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // واکشی داده‌ها از "بک‌اند" در هنگام لود برنامه
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const allStores = await ApiService.getAllStores();
        setLinks(allStores);
      } catch (e) {
        console.error("Failed to fetch from backend", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const refreshData = async () => {
    const allStores = await ApiService.getAllStores();
    setLinks(allStores);
  };

  const createLink = async (linkData: { title: string; slug: string }) => {
    const newLink: SalesLink = {
      id: Math.random().toString(36).substr(2, 9),
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

  const handleUpdateStore = async (updatedStore: SalesLink) => {
    await ApiService.saveStore(updatedStore);
    await refreshData();
  };

  const recordSale = async (slug: string, productId: string, amount: number, customerData: any) => {
    await ApiService.createOrder(slug, {
      productId,
      productName: customerData.productName || 'Product',
      amount,
      currency: customerData.currency || Currency.USD,
      customerEmail: customerData.email,
      customerPhone: customerData.phone,
      customerAddress: customerData.address,
      customerPostalCode: customerData.postalCode,
      transactionHash: customerData.transactionHash
    });
    await refreshData();
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <LanguageProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/marketplace" element={<Marketplace links={links} />} />
            <Route path="/register" element={<Register onCreateLink={createLink} existingLinks={links} />} />
            <Route path="/dashboard" element={
              links.length > 0 ? (
                <div className="flex flex-col flex-1">
                  <Header />
                  <Dashboard 
                    links={links} 
                    onAddProduct={(id, p) => {
                      const store = links.find(l => l.id === id);
                      if(store) handleUpdateStore({...store, products: [...store.products, {...p, id: Math.random().toString(36).substr(2, 9), salesCount: 0}]});
                    }}
                    onDeleteProduct={(id, pid) => {
                      const store = links.find(l => l.id === id);
                      if(store) handleUpdateStore({...store, products: store.products.filter(p => p.id !== pid)});
                    }}
                    onUpdateBankDetails={(id, bank) => {
                      const store = links.find(l => l.id === id);
                      if(store) handleUpdateStore({...store, bankDetails: bank});
                    }}
                    onUpdateProfile={(id, data) => {
                      const store = links.find(l => l.id === id);
                      if(store) handleUpdateStore({...store, ...data});
                    }}
                    onUpdateThemeColor={(id, color, btn) => {
                      const store = links.find(l => l.id === id);
                      if(store) handleUpdateStore({...store, themeColor: color, buyButtonColor: btn});
                    }}
                  />
                </div>
              ) : <Navigate to="/register" />
            } />
            <Route path="/s/:slug" element={<PublicLinkView links={links} />} />
            <Route path="/checkout/:slug/:productId" element={<Checkout links={links} onSaleSuccess={recordSale} />} />
          </Routes>
        </div>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
