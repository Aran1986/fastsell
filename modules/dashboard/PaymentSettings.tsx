
import React, { useState, useEffect } from 'react';
import { SalesLink, BankDetails } from '../../types';

interface PaymentSettingsProps {
  activeLink: SalesLink;
  onUpdateBankDetails: (linkId: string, bankDetails: BankDetails) => void;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ activeLink, onUpdateBankDetails }) => {
  const [bankData, setBankData] = useState<BankDetails>(activeLink.bankDetails || {});

  useEffect(() => {
    setBankData(activeLink.bankDetails || {});
  }, [activeLink]);

  const handleSaveBank = () => {
    onUpdateBankDetails(activeLink.id, bankData);
    alert('Payment settings saved successfully.');
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 space-y-10 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-900">Payment Gateway Configuration</h3>
          <button onClick={handleSaveBank} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Save Changes</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Stripe */}
        <div className="p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
          <div className="font-black text-indigo-700 mb-6 flex items-center gap-3">
             <span className="text-2xl">💳</span> Stripe (Global / EUR)
          </div>
          <div className="space-y-4">
              <label className="block text-[10px] font-black text-indigo-300 uppercase">Secret/Publishable Key</label>
              <input 
                type="text" 
                placeholder="sk_test_..." 
                value={bankData.stripeKey || ''} 
                onChange={e => setBankData({...bankData, stripeKey: e.target.value})} 
                className="w-full px-5 py-3.5 rounded-xl border border-indigo-200 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-200 transition-all" 
              />
          </div>
        </div>

        {/* PayPal */}
        <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
          <div className="font-black text-blue-700 mb-6 flex items-center gap-3">
             <span className="text-2xl">🌍</span> PayPal (USD)
          </div>
          <div className="space-y-4">
              <label className="block text-[10px] font-black text-blue-300 uppercase">PayPal Email</label>
              <input 
                type="email" 
                placeholder="merchant@paypal.com" 
                value={bankData.paypalEmail || ''} 
                onChange={e => setBankData({...bankData, paypalEmail: e.target.value})} 
                className="w-full px-5 py-3.5 rounded-xl border border-blue-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition-all" 
              />
          </div>
        </div>

        {/* Crypto */}
        <div className="p-8 bg-orange-50/50 rounded-[2rem] border border-orange-100 md:col-span-2">
          <div className="font-black text-orange-700 mb-6 flex items-center gap-3">
             <span className="text-2xl">₿</span> Crypto Wallet (USDT)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                  <label className="block text-[10px] font-black text-orange-300 uppercase">Network Selection</label>
                  <select 
                    value={bankData.network || 'TRC20'} 
                    onChange={e => setBankData({...bankData, network: e.target.value})}
                    className="w-full px-5 py-3.5 rounded-xl border border-orange-200 font-black text-sm outline-none"
                  >
                    <option value="TRC20">Tron (TRC20) - Low Fee</option>
                    <option value="ERC20">Ethereum (ERC20)</option>
                    <option value="BEP20">BSC (BEP20)</option>
                    <option value="SOL">Solana</option>
                  </select>
              </div>
              <div className="space-y-3">
                  <label className="block text-[10px] font-black text-orange-300 uppercase">USDT Wallet Address</label>
                  <input 
                    type="text" 
                    placeholder="Enter wallet address..." 
                    value={bankData.walletAddress || ''} 
                    onChange={e => setBankData({...bankData, walletAddress: e.target.value})} 
                    className="w-full px-5 py-3.5 rounded-xl border border-orange-200 font-mono text-[11px] outline-none focus:ring-2 focus:ring-orange-200 transition-all" 
                  />
              </div>
          </div>
        </div>

        {/* ZarinPal (Persian) - Moved to bottom as requested */}
        <div className="p-8 bg-green-50/50 rounded-[2rem] border border-green-100 md:col-span-2">
          <div className="font-black text-green-700 mb-6 flex items-center gap-3">
             <span className="text-2xl">🏦</span> ZarinPal (Persian Rial)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                  <label className="block text-[10px] font-black text-green-300 uppercase">IBAN (Shaba)</label>
                  <input 
                    type="text" 
                    placeholder="IR..." 
                    value={bankData.iban || ''} 
                    onChange={e => setBankData({...bankData, iban: e.target.value})} 
                    className="w-full px-5 py-3.5 rounded-xl border border-green-200 text-xs font-mono outline-none" 
                  />
              </div>
              <div className="space-y-3">
                  <label className="block text-[10px] font-black text-green-300 uppercase">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="6037..." 
                    value={bankData.cardNumber || ''} 
                    onChange={e => setBankData({...bankData, cardNumber: e.target.value})} 
                    className="w-full px-5 py-3.5 rounded-xl border border-green-200 text-sm outline-none" 
                  />
              </div>
              <div className="space-y-3">
                  <label className="block text-[10px] font-black text-green-300 uppercase">Holder Name</label>
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={bankData.holderName || ''} 
                    onChange={e => setBankData({...bankData, holderName: e.target.value})} 
                    className="w-full px-5 py-3.5 rounded-xl border border-green-200 text-sm outline-none font-bold" 
                  />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
