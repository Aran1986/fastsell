
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

const DEMO_STORE: SalesLink = {
  id: 'demo-123',
  slug: 'demo-store',
  title: 'کافه تخصصی مدرن',
  bio: 'تجربه‌ای متفاوت از قهوه‌های تازه‌رست و اکسسوری‌های خاص دم‌آوری. ارسال سریع به تمام نقاط.',
  themeColor: '#8b5e3c',
  buyButtonColor: '#2d2d2d',
  totalSales: 450,
  products: [
    {
      id: 'p1',
      name: 'قهوه اتیوپی یرگاچف',
      description: 'عطر گلی و طعم یادهای مرکباتی با اسیدیته ملایم و دلنشین.',
      price: 450000,
      currency: Currency.IRR,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600&auto=format&fit=crop',
      category: 'دانه قهوه',
      salesCount: 12,
      isFeatured: true
    },
    {
      id: 'p2',
      name: 'V60 دریپر سرامیکی',
      description: 'طراحی کلاسیک برای عصاره‌گیری حرفه‌ای و شفاف در منزل.',
      price: 890000,
      currency: Currency.IRR,
      image: 'https://images.unsplash.com/photo-1544666107-594691494537?q=80&w=600&auto=format&fit=crop',
      category: 'اکسسوری',
      salesCount: 5
    }
  ],
  orders: [],
  defaultCurrency: Currency.IRR,
  categories: ['دانه قهوه', 'اکسسوری', 'آموزش'],
  bankDetails: { holderName: 'بخش دمو', cardNumber: '6037-XXXX-XXXX-XXXX' }
};

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

  const allLinks = [...links, DEMO_STORE];

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
      defaultCurrency: Currency.IRR,
      categories: ['General'],
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

  const recordSale = (slug: string, productId: string, amount: number, customerData: { email: string, phone: string, address: string, postalCode: string, transactionHash?: string }) => {
    if (slug === 'demo-store') return;
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
          transactionHash: customerData.transactionHash,
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
            <Route path="/admin" element={<AdminDashboard links={allLinks} onUpdateSlug={updateSlug} onUpdateOrder={updateOrder} />} />
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
            <Route path="/s/:slug" element={<PublicLinkView links={allLinks} />} />
            <Route path="/s/:slug/p/:productId" element={<PublicLinkView links={allLinks} />} />
            <Route path="/checkout/:slug/:productId" element={<Checkout links={allLinks} onSaleSuccess={recordSale} />} />
          </Routes>
        </div>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
