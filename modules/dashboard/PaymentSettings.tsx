import React, { useState, useEffect, useCallback } from 'react';
import { SalesLink, BankDetails } from '../../types';

interface PaymentSettingsProps {
  activeLink: SalesLink;
  onUpdateBankDetails: (linkId: string, bankDetails: BankDetails) => void;
}

// Wallet address validation per network
const NETWORK_CONFIG: Record<string, { label: string; prefix: string; lengthRange: [number, number]; placeholder: string; fee: string }> = {
  TRC20: { label: 'Tron (TRC20)', prefix: 'T', lengthRange: [34, 34], placeholder: 'T...', fee: '~1 USDT' },
  ERC20: { label: 'Ethereum (ERC20)', prefix: '0x', lengthRange: [42, 42], placeholder: '0x...', fee: '~5-20 USDT' },
  BEP20: { label: 'BSC (BEP20)', prefix: '0x', lengthRange: [42, 42], placeholder: '0x...', fee: '~0.5 USDT' },
  SOL: { label: 'Solana (SPL)', prefix: '', lengthRange: [32, 44], placeholder: 'Solana address...', fee: '~0.01 USDT' },
};

const validateWalletAddress = (address: string, network: string): { valid: boolean; message: string } => {
  if (!address.trim()) return { valid: false, message: 'آدرس ولت الزامی است.' };
  const config = NETWORK_CONFIG[network];
  if (!config) return { valid: false, message: 'شبکه نامعتبر است.' };
  
  if (config.prefix && !address.startsWith(config.prefix)) {
    return { valid: false, message: `آدرس ${config.label} باید با "${config.prefix}" شروع شود.` };
  }
  
  const [minLen, maxLen] = config.lengthRange;
  if (address.length < minLen || address.length > maxLen) {
    return { valid: false, message: `طول آدرس ${config.label} باید ${minLen === maxLen ? minLen : `بین ${minLen} تا ${maxLen}`} کاراکتر باشد.` };
  }
  
  return { valid: true, message: 'آدرس معتبر است.' };
};

const validateIBAN = (iban: string): boolean => {
  if (!iban) return false;
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return cleaned.startsWith('IR') && cleaned.length === 26;
};

const validateCardNumber = (card: string): boolean => {
  if (!card) return false;
  const cleaned = card.replace(/[\s-]/g, '');
  return /^\d{16}$/.test(cleaned);
};

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ activeLink, onUpdateBankDetails }) => {
  const [bankData, setBankData] = useState<BankDetails>(activeLink.bankDetails || {});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [walletValidation, setWalletValidation] = useState<{ valid: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'crypto' | 'zarinpal' | 'stripe' | 'paypal'>('zarinpal');

  useEffect(() => {
    setBankData(activeLink.bankDetails || {});
  }, [activeLink]);

  // Validate wallet on changes
  useEffect(() => {
    if (bankData.walletAddress && bankData.network) {
      setWalletValidation(validateWalletAddress(bankData.walletAddress, bankData.network));
    } else {
      setWalletValidation(null);
    }
  }, [bankData.walletAddress, bankData.network]);

  const handleSaveBank = useCallback(() => {
    setSaveStatus('saving');
    
    // Determine active gateways
    const activeGateways: string[] = [];
    if (bankData.iban || bankData.cardNumber || bankData.zarinpalMerchantId) activeGateways.push('zarinpal');
    if (bankData.stripeKey) activeGateways.push('stripe');
    if (bankData.paypalEmail) activeGateways.push('paypal');
    if (bankData.walletAddress && bankData.cryptoEnabled) activeGateways.push('crypto');

    const finalData: BankDetails = { ...bankData, activeGateways };
    
    try {
      onUpdateBankDetails(activeLink.id, finalData);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [bankData, activeLink.id, onUpdateBankDetails]);

  const tabs = [
    { key: 'zarinpal' as const, label: 'درگاه ریالی (زرین‌پال)', icon: '🏦' },
    { key: 'stripe' as const, label: 'Stripe (EUR/USD)', icon: '💳' },
    { key: 'paypal' as const, label: 'PayPal', icon: '🌍' },
    { key: 'crypto' as const, label: 'رمزارز (USDT)', icon: '₿' },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900">تنظیمات درگاه پرداخت</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">پس از تنظیم هر درگاه، مشتریان شما قادر به پرداخت از آن روش خواهند بود.</p>
        </div>
        <button 
          onClick={handleSaveBank} 
          disabled={saveStatus === 'saving'}
          className={`px-8 py-3 rounded-2xl font-black shadow-lg transition-all text-sm ${
            saveStatus === 'saved' 
              ? 'bg-green-600 text-white shadow-green-100' 
              : saveStatus === 'error' 
              ? 'bg-red-600 text-white shadow-red-100' 
              : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
          }`}
        >
          {saveStatus === 'saving' ? 'در حال ذخیره...' : saveStatus === 'saved' ? 'ذخیره شد' : saveStatus === 'error' ? 'خطا در ذخیره' : 'ذخیره تغییرات'}
        </button>
      </div>

      {/* Active Gateways Summary */}
      <div className="flex flex-wrap gap-3">
        {bankData.zarinpalMerchantId && (
          <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-[10px] font-black">زرین‌پال: فعال</span>
        )}
        {bankData.stripeKey && (
          <span className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black">Stripe: فعال</span>
        )}
        {bankData.paypalEmail && (
          <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black">PayPal: فعال</span>
        )}
        {bankData.walletAddress && bankData.cryptoEnabled && (
          <span className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-black">
            رمزارز ({bankData.network || 'TRC20'}): فعال
          </span>
        )}
        {!bankData.zarinpalMerchantId && !bankData.stripeKey && !bankData.paypalEmail && !(bankData.walletAddress && bankData.cryptoEnabled) && (
          <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black">هیچ درگاهی فعال نیست</span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === tab.key 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <span className="ml-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* ZarinPal */}
        {activeTab === 'zarinpal' && (
          <div className="p-8 bg-green-50/50 rounded-[2rem] border border-green-100 space-y-8 animate-in fade-in duration-200">
            <div>
              <h4 className="font-black text-green-800 text-lg mb-2">درگاه زرین‌پال (ریالی)</h4>
              <p className="text-xs text-green-600/70 font-bold leading-relaxed">
                برای فعال‌سازی درگاه ریالی، مرچنت کد زرین‌پال و اطلاعات حساب بانکی خود را وارد کنید.
                پس از ثبت، مبالغ فروش به حساب بانکی شما واریز خواهد شد.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-3">
                <label className="block text-[10px] font-black text-green-400 uppercase">Merchant ID (زرین‌پال)</label>
                <input 
                  type="text" 
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                  value={bankData.zarinpalMerchantId || ''} 
                  onChange={e => setBankData({...bankData, zarinpalMerchantId: e.target.value})} 
                  className="w-full px-5 py-3.5 rounded-xl border border-green-200 text-xs font-mono outline-none focus:ring-2 focus:ring-green-200 transition-all" 
                  dir="ltr"
                />
                <p className="text-[9px] text-green-400 font-bold">این کد را از پنل زرین‌پال خود دریافت کنید. درخواست تسویه از طریق API زرین‌پال انجام می‌شود.</p>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-green-400 uppercase">شماره شبا (IBAN)</label>
                <input 
                  type="text" 
                  placeholder="IR..." 
                  value={bankData.iban || ''} 
                  onChange={e => setBankData({...bankData, iban: e.target.value})} 
                  className={`w-full px-5 py-3.5 rounded-xl border text-xs font-mono outline-none focus:ring-2 transition-all ${
                    bankData.iban && !validateIBAN(bankData.iban) ? 'border-red-300 focus:ring-red-200' : 'border-green-200 focus:ring-green-200'
                  }`}
                  dir="ltr"
                />
                {bankData.iban && !validateIBAN(bankData.iban) && (
                  <p className="text-[9px] text-red-500 font-bold">شبا باید با IR شروع شود و 26 کاراکتر باشد.</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-green-400 uppercase">شماره کارت</label>
                <input 
                  type="text" 
                  placeholder="6037-xxxx-xxxx-xxxx" 
                  value={bankData.cardNumber || ''} 
                  onChange={e => setBankData({...bankData, cardNumber: e.target.value})} 
                  className={`w-full px-5 py-3.5 rounded-xl border text-sm outline-none focus:ring-2 transition-all ${
                    bankData.cardNumber && !validateCardNumber(bankData.cardNumber) ? 'border-red-300 focus:ring-red-200' : 'border-green-200 focus:ring-green-200'
                  }`}
                  dir="ltr"
                />
                {bankData.cardNumber && !validateCardNumber(bankData.cardNumber) && (
                  <p className="text-[9px] text-red-500 font-bold">شماره کارت باید 16 رقم باشد.</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-green-400 uppercase">نام صاحب حساب</label>
                <input 
                  type="text" 
                  placeholder="نام و نام خانوادگی" 
                  value={bankData.holderName || ''} 
                  onChange={e => setBankData({...bankData, holderName: e.target.value})} 
                  className="w-full px-5 py-3.5 rounded-xl border border-green-200 text-sm outline-none focus:ring-2 focus:ring-green-200 transition-all font-bold" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Stripe */}
        {activeTab === 'stripe' && (
          <div className="p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 space-y-8 animate-in fade-in duration-200">
            <div>
              <h4 className="font-black text-indigo-800 text-lg mb-2">درگاه Stripe (بین‌المللی)</h4>
              <p className="text-xs text-indigo-600/70 font-bold leading-relaxed">
                برای پرداخت‌های بین‌المللی (EUR/USD) کلید Stripe خود را وارد کنید.
                کلید Secret Key را در بک‌اند سرور قرار دهید و Publishable Key را اینجا وارد کنید.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-indigo-400 uppercase">Publishable Key</label>
                <input 
                  type="text" 
                  placeholder="pk_live_..." 
                  value={bankData.stripeKey || ''} 
                  onChange={e => setBankData({...bankData, stripeKey: e.target.value})} 
                  className="w-full px-5 py-3.5 rounded-xl border border-indigo-200 text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-200 transition-all" 
                  dir="ltr"
                />
                <p className="text-[9px] text-indigo-400 font-bold">
                  توجه: Secret Key (sk_...) نباید در فرانت‌اند ذخیره شود. آن را به صورت متغیر محیطی در سرور قرار دهید.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PayPal */}
        {activeTab === 'paypal' && (
          <div className="p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100 space-y-8 animate-in fade-in duration-200">
            <div>
              <h4 className="font-black text-blue-800 text-lg mb-2">درگاه PayPal</h4>
              <p className="text-xs text-blue-600/70 font-bold leading-relaxed">
                ایمیل حساب PayPal تجاری خود را وارد کنید. مشتریان شما قادر به پرداخت از طریق PayPal خواهند بود.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-blue-400 uppercase">PayPal Email</label>
                <input 
                  type="email" 
                  placeholder="merchant@paypal.com" 
                  value={bankData.paypalEmail || ''} 
                  onChange={e => setBankData({...bankData, paypalEmail: e.target.value})} 
                  className="w-full px-5 py-3.5 rounded-xl border border-blue-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition-all" 
                  dir="ltr"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-blue-400 uppercase">Client ID (اختیاری)</label>
                <input 
                  type="text" 
                  placeholder="AX..." 
                  value={bankData.paypalClientId || ''} 
                  onChange={e => setBankData({...bankData, paypalClientId: e.target.value})} 
                  className="w-full px-5 py-3.5 rounded-xl border border-blue-200 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-200 transition-all" 
                  dir="ltr"
                />
                <p className="text-[9px] text-blue-400 font-bold">
                  در صورتی که می‌خواهید از PayPal Checkout SDK استفاده کنید، Client ID را وارد نمایید.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Crypto */}
        {activeTab === 'crypto' && (
          <div className="p-8 bg-orange-50/50 rounded-[2rem] border border-orange-100 space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-orange-800 text-lg mb-2">پرداخت با رمزارز (USDT)</h4>
                <p className="text-xs text-orange-600/70 font-bold leading-relaxed">
                  آدرس کیف پول USDT خود را وارد کنید. خریداران مبلغ USDT را مستقیما به ولت شما واریز می‌کنند
                  و هش تراکنش را برای تایید وارد می‌نمایند. سیستم با بررسی بلاک‌چین، پرداخت را تایید می‌کند.
                </p>
              </div>
              {/* Enable/Disable Toggle */}
              <button
                onClick={() => setBankData({...bankData, cryptoEnabled: !bankData.cryptoEnabled})}
                className={`shrink-0 px-6 py-3 rounded-xl font-black text-xs transition-all ${
                  bankData.cryptoEnabled 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' 
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {bankData.cryptoEnabled ? 'فعال' : 'غیرفعال'}
              </button>
            </div>

            {bankData.cryptoEnabled && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Network Selection */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-orange-400 uppercase">انتخاب شبکه</label>
                    <select 
                      value={bankData.network || 'TRC20'} 
                      onChange={e => setBankData({...bankData, network: e.target.value})}
                      className="w-full px-5 py-3.5 rounded-xl border border-orange-200 font-black text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                    >
                      {Object.entries(NETWORK_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>{config.label} - کارمزد: {config.fee}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-orange-400 font-bold">
                      TRC20 کمترین کارمزد انتقال را دارد و پیشنهاد ما است.
                    </p>
                  </div>

                  {/* Wallet Address */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-orange-400 uppercase">آدرس کیف پول USDT</label>
                    <input 
                      type="text" 
                      placeholder={NETWORK_CONFIG[bankData.network || 'TRC20']?.placeholder || 'آدرس ولت...'} 
                      value={bankData.walletAddress || ''} 
                      onChange={e => setBankData({...bankData, walletAddress: e.target.value})} 
                      className={`w-full px-5 py-3.5 rounded-xl border font-mono text-[11px] outline-none focus:ring-2 transition-all ${
                        walletValidation && !walletValidation.valid 
                          ? 'border-red-300 focus:ring-red-200' 
                          : walletValidation?.valid 
                          ? 'border-green-300 focus:ring-green-200' 
                          : 'border-orange-200 focus:ring-orange-200'
                      }`}
                      dir="ltr"
                    />
                    {walletValidation && (
                      <p className={`text-[9px] font-bold ${walletValidation.valid ? 'text-green-600' : 'text-red-500'}`}>
                        {walletValidation.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* How Crypto Payment Works */}
                <div className="bg-orange-100/50 rounded-2xl p-6 space-y-4">
                  <h5 className="text-xs font-black text-orange-800">نحوه کار پرداخت رمزارزی:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { step: '1', title: 'انتخاب کالا', desc: 'خریدار کالا را انتخاب و رمزارز را به عنوان روش پرداخت برمی‌گزیند.' },
                      { step: '2', title: 'واریز USDT', desc: 'آدرس ولت شما نمایش داده شده و خریدار مبلغ USDT را واریز می‌کند.' },
                      { step: '3', title: 'ثبت هش تراکنش', desc: 'خریدار هش (TX Hash) تراکنش بلاک‌چین خود را در سیستم وارد می‌کند.' },
                      { step: '4', title: 'تایید خودکار', desc: 'سرور با API بلاک‌چین تراکنش را بررسی و در صورت صحت، سفارش را ثبت می‌کند.' },
                    ].map(item => (
                      <div key={item.step} className="text-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-xs font-black mx-auto">
                          {item.step}
                        </div>
                        <h6 className="text-[10px] font-black text-orange-800">{item.title}</h6>
                        <p className="text-[9px] text-orange-600/70 font-bold leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <h5 className="text-[10px] font-black text-slate-600 mb-2">نکات امنیتی:</h5>
                  <ul className="space-y-1.5 text-[9px] text-slate-500 font-bold leading-relaxed">
                    <li>- تایید تراکنش‌ها در سمت سرور (بک‌اند) و از طریق API بلاک‌چین (TronGrid/Etherscan/BscScan) انجام می‌شود.</li>
                    <li>- آدرس مقصد، مبلغ واریزی و قرارداد هوشمند USDT بررسی می‌گردد.</li>
                    <li>- هیچ اطلاعات حساسی در سمت کاربر ذخیره نمی‌شود.</li>
                    <li>- برای امنیت بیشتر، از ولت اختصاصی فروش (نه ولت شخصی) استفاده کنید.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSettings;
