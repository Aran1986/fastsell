
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SalesLink, Product, Currency, BankDetails, Order } from './types';
import { LanguageProvider } from './context/LanguageContext';
import Dashboard from './modules/Dashboard';
import PublicLinkView from './modules/PublicLinkView';
import Checkout from './modules/Checkout';
import LandingPage from './modules/LandingPage';
import Register from './modules/Register';
import AdminDashboard from './modules/AdminDashboard';
import Docs from './modules/Docs';
import Header from './components/Header';

const STORAGE_KEY = 'fastsell_data_v4';

const App: React.FC = () => {
  const [links, setLinks] = useState<SalesLink[]>([]);
  const [userRegistered, setUserRegistered] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setLinks(parsed || []);
      if (parsed && parsed.length > 0) setUserRegistered(true);
    }
  }, []);

  const saveLinks = (updated: SalesLink[]) => {
    setLinks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const createLink = (linkData: { title: string; slug: string }) => {
    const newLink: SalesLink = {
      id: Math.random().toString(36).substr(2, 9),
      slug: linkData.slug,
      title: linkData.title,
      bio: 'Welcome to my new shop!',
      themeColor: '#6366f1',
      buyButtonColor: '#6366f1',
      totalSales: 0,
      products: [],
      orders: [],
      defaultCurrency: Currency.USD, // تغییر ارز پیش‌فرض به دلار
      categories: ['General', 'Tech', 'Fashion'],
      bankDetails: { cardNumber: '', iban: '', holderName: '', paypalEmail: '', walletAddress: '' }
    };
    saveLinks([...links, newLink]);
    setUserRegistered(true);
  };

  const updateSlug = (linkId: string, newSlug: string) => {
    saveLinks(links.map(l => l.id === linkId ? { ...l, slug: newSlug } : l));
  };

  const updateBankDetails = (linkId: string, bankDetails: BankDetails) => {
    saveLinks(links.map(l => l.id === linkId ? { ...l, bankDetails } : l));
  };

  const updateProfile = (linkId: string, data: { title: string; bio: string; defaultCurrency: Currency; categories: string[] }) => {
    saveLinks(links.map(l => l.id === linkId ? { ...l, ...data } : l));
  };

  const updateThemeColor = (linkId: string, themeColor: string, buyButtonColor?: string) => {
    saveLinks(links.map(l => l.id === linkId ? { ...l, themeColor, buyButtonColor: buyButtonColor || l.buyButtonColor } : l));
  };

  const updateOrder = (linkId: string, orderId: string, updates: Partial<Order>) => {
    saveLinks(links.map(l => {
      if (l.id === linkId) {
        const updatedOrders = (l.orders || []).map(o => o.id === orderId ? { ...o, ...updates } : o);
        return { ...l, orders: updatedOrders };
      }
      return l;
    }));
  };

  const addProduct = (linkId: string, productData: Omit<Product, 'id' | 'salesCount'>) => {
    saveLinks(links.map(l => {
      if (l.id === linkId) {
        return { ...l, products: [...l.products, { ...productData, id: Math.random().toString(36).substr(2, 9), salesCount: 0 }] };
      }
      return l;
    }));
  };

  const deleteProduct = (linkId: string, productId: string) => {
    saveLinks(links.map(l => l.id === linkId ? { ...l, products: l.products.filter(p => p.id !== productId) } : l));
  };

  const recordSale = (slug: string, productId: string, amount: number, customerData: { email: string, phone: string, address: string, postalCode: string }) => {
    saveLinks(links.map(l => {
      if (l.slug === slug) {
        const product = l.products.find(p => p.id === productId);
        const newOrder: Order = {
          id: Math.random().toString(36).substr(2, 9),
          productId,
          productName: product?.name || 'Unknown Product',
          amount,
          currency: product?.currency || Currency.USD,
          customerEmail: customerData.email,
          customerPhone: customerData.phone,
          customerAddress: customerData.address,
          customerPostalCode: customerData.postalCode,
          status: 'pending',
          date: new Date().toISOString()
        };
        const updatedProducts = l.products.map(p => p.id === productId ? { ...p, salesCount: (p.salesCount || 0) + 1 } : p);
        return { ...l, totalSales: (l.totalSales || 0) + amount, products: updatedProducts, orders: [...(l.orders || []), newOrder] };
      }
      return l;
    }));
  };

  return (
    <LanguageProvider>
      <HashRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/register" element={<Register onCreateLink={createLink} existingLinks={links} />} />
            <Route path="/admin" element={<AdminDashboard links={links} onUpdateSlug={updateSlug} onUpdateOrder={updateOrder} />} />
            <Route path="/dashboard" element={
              userRegistered ? (
                <div className="flex flex-col flex-1">
                  <Header />
                  <Dashboard 
                    links={links} 
                    onAddProduct={addProduct} 
                    onDeleteProduct={deleteProduct} 
                    onUpdateBankDetails={updateBankDetails}
                    onUpdateProfile={updateProfile}
                    onUpdateOrder={updateOrder}
                    onUpdateThemeColor={updateThemeColor}
                  />
                </div>
              ) : <Navigate to="/register" />
            } />
            <Route path="/s/:slug" element={<PublicLinkView links={links} />} />
            <Route path="/s/:slug/p/:productId" element={<PublicLinkView links={links} />} />
            <Route path="/checkout/:slug/:productId" element={<Checkout links={links} onSaleSuccess={recordSale} />} />
          </Routes>
        </div>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
