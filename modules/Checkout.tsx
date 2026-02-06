import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { SalesLink, Currency, StoreMode } from '../types';
import { ApiService } from '../services/apiService';
import { verifyCryptoHash, getExplorerUrl } from '../services/paymentService';
import { paymentSettingsApi, transactionsApi } from '../services/paymentApiService';

interface CheckoutProps {
  links: SalesLink[];
  onSaleSuccess: (slug: string, productId: string, amount: number, customerData: { 
    email: string, 
    phone: string, 
    address: string, 
    postalCode: string, 
    transactionHash?: string, 
    source: 'direct' | 'marketplace', 
    trafficSource?: string,
    selectedVariants?: Record<string, string>, 
    shippingFee: number, 
    totalPaid: number,
    bookingTime?: string
  }) => void;
  initialProductId?: string;
  initialStoreSlug?: string;
}

type PaymentMethod = 'fiat' | 'crypto';
type CheckoutStep = 'info' | 'payment-select' | 'crypto-pay' | 'crypto-verifying' | 'paying' | 'success' | 'oos' | 'error';

const Checkout: React.FC<CheckoutProps> = ({ links, onSaleSuccess, initialProductId, initialStoreSlug }) => {
  const { slug: urlSlug, productId: urlProductId } = useParams<{ slug: string, productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const slug = initialStoreSlug || urlSlug;
  const productId = initialProductId || urlProductId;
  const queryParams = new URLSearchParams(location.search);
  const requestedSlot = queryParams.get('slot');

  const link = links.find(l => l.slug === slug);
  const product = link?.products.find(p => p.id === productId);
  const storeMode = link?.mode || StoreMode.PRODUCT;
  const isPhysical = storeMode === StoreMode.PRODUCT && product?.shippingMethod !== 'digital';

  // Check if crypto is enabled for this store
  const cryptoEnabled = link?.bankDetails?.cryptoEnabled && link?.bankDetails?.walletAddress;
  const sellerWallet = link?.bankDetails?.walletAddress || '';
  const cryptoNetwork = link?.bankDetails?.network || 'TRC20';

  const [step, setStep] = useState<CheckoutStep>('info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('fiat');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [detectedSource, setDetectedSource] = useState('Direct');
  const [messagingStatus, setMessagingStatus] = useState<string | null>(null);

  // Crypto-specific state
  const [txHash, setTxHash] = useState('');
  const [cryptoError, setCryptoError] = useState<string | null>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);

  useEffect(() => {
    if (product && product.stock <= 0) setStep('oos');
    const utm = queryParams.get('src') || queryParams.get('utm_source');
    if (utm) setDetectedSource(utm.charAt(0).toUpperCase() + utm.slice(1));
  }, [product]);

  const handleEmailBlur = async () => {
    if (email.includes('@')) {
      const history = await ApiService.getLastCustomerDetails(email);
      if (history) {
        setPhone(history.customerPhone || '');
        if (isPhysical) {
          setAddress(history.customerAddress || '');
          setPostalCode(history.customerPostalCode || '');
        }
      }
    }
  };

  if (!link || !product) return <div className="p-20 text-center font-black text-slate-400">{'۴۰۴ - محصول یافت نشد.'}</div>;

  const shippingFee = isPhysical ? (link.shippingFee || 0) : 0;
  const totalAmount = (product.discountPrice || product.price) + shippingFee;

  const handleProceedToPayment = () => {
    if (!email || !phone) return alert('وارد کردن ایمیل و موبایل الزامی است.');
    if (isPhysical && (!address || !postalCode)) return alert('برای ارسال کالای فیزیکی، آدرس و کد پستی الزامی است.');
    
    if (cryptoEnabled) {
      setStep('payment-select');
    } else {
      handleFiatPayment();
    }
  };

  const handleFiatPayment = () => {
    setPaymentMethod('fiat');
    setStep('paying');
    setTimeout(() => {
      if (window.confirm(`شبیه‌سازی درگاه: مبلغ ${totalAmount.toLocaleString()} پرداخت شد؟`)) {
        completeOrder();
      } else {
        setStep(cryptoEnabled ? 'payment-select' : 'info');
      }
    }, 1500);
  };

  const handleCryptoPayment = () => {
    setPaymentMethod('crypto');
    setStep('crypto-pay');
    setCryptoError(null);
    setTxHash('');
  };

  const handleVerifyCrypto = async () => {
    if (!txHash.trim()) {
      setCryptoError('لطفا هش تراکنش (TX Hash) را وارد کنید.');
      return;
    }
    if (txHash.length < 10) {
      setCryptoError('هش تراکنش نامعتبر است. لطفا هش صحیح را وارد نمایید.');
      return;
    }

    setStep('crypto-verifying');
    setCryptoError(null);
    setVerificationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setVerificationProgress(prev => Math.min(prev + 15, 90));
    }, 500);

    try {
      // First, get seller payment settings to find seller_id
      const sellerSettings = await paymentSettingsApi.getSettingsByEmail(link.email || '');
      if (!sellerSettings) {
        throw new Error('تنظیمات فروشنده یافت نشد');
      }

      // Create transaction record
      const transaction = await transactionsApi.createTransaction({
        tx_hash: txHash,
        payment_method: 'crypto',
        amount: totalAmount,
        currency: 'USDT',
        seller_id: sellerSettings.seller_id,
        buyer_email: email,
        buyer_wallet: '', // Could be extracted from blockchain if needed
        product_id: product.id,
        product_name: product.title,
        status: 'pending',
        network: cryptoNetwork,
        to_address: sellerWallet,
        metadata: {
          phone,
          address: isPhysical ? address : undefined,
          postalCode: isPhysical ? postalCode : undefined,
          shippingFee,
          trafficSource: detectedSource,
        },
      });

      // Verify transaction on blockchain
      const result = await verifyCryptoHash(txHash, sellerWallet, totalAmount, cryptoNetwork);
      
      clearInterval(progressInterval);
      setVerificationProgress(100);

      if (result.verified) {
        // Update transaction status to verified
        await transactionsApi.updateTransaction(transaction.id!, {
          status: 'verified',
          verified_at: new Date().toISOString(),
          from_address: result.fromAddress,
          block_number: result.blockNumber,
        });

        setTimeout(() => completeOrder(txHash), 500);
      } else {
        // Update transaction as failed
        await transactionsApi.updateTransaction(transaction.id!, {
          status: 'failed',
          error_message: result.error || 'Verification failed',
        });

        setCryptoError(result.error || 'تراکنش تایید نشد. لطفا هش صحیح را وارد کنید یا منتظر تایید شبکه بمانید.');
        setStep('crypto-pay');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setCryptoError('خطا در ارتباط با شبکه بلاک‌چین. لطفا مجددا تلاش کنید.');
      setStep('crypto-pay');
    }
  };

  const completeOrder = async (transactionHash?: string) => {
    onSaleSuccess(link.slug, product.id, (product.discountPrice || product.price), { 
      email, phone, address, postalCode, source: 'direct', 
      trafficSource: detectedSource, shippingFee, totalPaid: totalAmount,
      bookingTime: requestedSlot || undefined,
      transactionHash
    });

    const prefs = link.integrations?.prefs;
    const channels = [];
    if (prefs?.telegram === 'yes') channels.push('تلگرام');
    if (prefs?.sms === 'yes') channels.push('پیامک');

    if (channels.length > 0) {
      setMessagingStatus(`در حال اطلاع‌رسانی به فروشنده از طریق ${channels.join(' و ')}...`);
      setTimeout(() => setStep('success'), 2000);
    } else {
      setStep('success');
    }
  };

  // --- SUCCESS SCREEN ---
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 text-right" dir="rtl">
        <div className="bg-white rounded-[3.5rem] p-12 max-w-md w-full shadow-2xl flex flex-col items-center">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h1 className="text-3xl font-black mb-4">عملیات موفقیت‌آمیز</h1>
          <p className="text-slate-500 font-bold mb-4 text-center">
            {storeMode === StoreMode.BOOKING 
              ? `نوبت شما برای ساعت ${requestedSlot} رزرو شد.` 
              : storeMode === StoreMode.SERVICE 
              ? 'لینک دسترسی به خدمات برای شما ایمیل گردید.' 
              : 'سفارش شما ثبت شد و به زودی ارسال می‌گردد.'}
          </p>
          {paymentMethod === 'crypto' && txHash && (
            <a 
              href={getExplorerUrl(txHash, cryptoNetwork)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 font-bold mb-6 hover:underline"
            >
              مشاهده تراکنش در بلاک‌اکسپلورر
            </a>
          )}
          <button onClick={() => navigate(`/s/${slug}`)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-lg">بازگشت به فروشگاه</button>
        </div>
      </div>
    );
  }

  // --- CRYPTO VERIFYING SCREEN ---
  if (step === 'crypto-verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 text-right" dir="rtl">
        <div className="bg-white rounded-[3.5rem] p-12 max-w-md w-full shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin mb-8"></div>
          <h2 className="text-2xl font-black mb-4 text-slate-900">در حال تایید تراکنش...</h2>
          <p className="text-sm text-slate-500 font-bold mb-8 text-center">
            سیستم در حال بررسی تراکنش شما در شبکه {cryptoNetwork} است.
          </p>
          <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-500" 
              style={{ width: `${verificationProgress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold font-mono" dir="ltr">{txHash.substring(0, 20)}...</p>
        </div>
      </div>
    );
  }

  // --- PAYMENT SELECT SCREEN ---
  if (step === 'payment-select') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 text-right" dir="rtl">
        <div className="bg-white rounded-[3.5rem] p-12 max-w-lg w-full shadow-2xl">
          <h2 className="text-2xl font-black mb-2 text-slate-900">انتخاب روش پرداخت</h2>
          <p className="text-sm text-slate-400 font-bold mb-10">مبلغ قابل پرداخت: <span className="text-indigo-600">{totalAmount.toLocaleString()} تومان</span></p>
          
          <div className="space-y-4">
            {/* Fiat Gateway */}
            <button 
              onClick={handleFiatPayment}
              className="w-full p-6 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 transition-all flex items-center gap-4 text-right group"
            >
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              </div>
              <div>
                <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">درگاه بانکی (ریالی)</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">پرداخت از طریق درگاه زرین‌پال / کارت بانکی</p>
              </div>
            </button>

            {/* Crypto */}
            <button 
              onClick={handleCryptoPayment}
              className="w-full p-6 rounded-2xl border-2 border-slate-200 hover:border-orange-400 transition-all flex items-center gap-4 text-right group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl shrink-0 font-black">
                {'₿'}
              </div>
              <div>
                <h3 className="font-black text-slate-900 group-hover:text-orange-600 transition-colors">پرداخت با رمزارز (USDT)</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">واریز USDT از طریق شبکه {cryptoNetwork}</p>
              </div>
            </button>
          </div>

          <button 
            onClick={() => setStep('info')} 
            className="w-full mt-6 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors"
          >
            بازگشت به مرحله قبل
          </button>
        </div>
      </div>
    );
  }

  // --- CRYPTO PAY SCREEN ---
  if (step === 'crypto-pay') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 text-right" dir="rtl">
        <div className="bg-white rounded-[3.5rem] p-12 max-w-lg w-full shadow-2xl space-y-8">
          <div>
            <h2 className="text-2xl font-black mb-2 text-slate-900">پرداخت با USDT</h2>
            <p className="text-sm text-slate-400 font-bold">مبلغ USDT را به آدرس زیر واریز کنید و سپس هش تراکنش را وارد نمایید.</p>
          </div>

          {/* Amount & Network */}
          <div className="bg-orange-50 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-orange-400">مبلغ قابل پرداخت:</span>
              <span className="text-lg font-black text-orange-800">{totalAmount.toLocaleString()} {'تومان'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-orange-400">شبکه:</span>
              <span className="text-sm font-black text-orange-800">{cryptoNetwork}</span>
            </div>
            <div className="h-px bg-orange-200"></div>
            <div className="space-y-2">
              <span className="text-[10px] font-black text-orange-400">آدرس کیف پول فروشنده:</span>
              <div className="bg-white rounded-xl p-4 border border-orange-200 flex items-center gap-3">
                <code className="text-[10px] font-mono text-slate-700 break-all flex-1" dir="ltr">
                  {sellerWallet}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(sellerWallet)}
                  className="shrink-0 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-[9px] font-black hover:bg-orange-200 transition-colors"
                >
                  کپی
                </button>
              </div>
            </div>
          </div>

          {/* TX Hash Input */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-600">هش تراکنش (TX Hash):</label>
            <input
              type="text"
              placeholder="هش تراکنش بلاک‌چین خود را اینجا وارد کنید..."
              value={txHash}
              onChange={e => { setTxHash(e.target.value); setCryptoError(null); }}
              className="w-full px-5 py-4 rounded-2xl border border-slate-200 font-mono text-[11px] outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              dir="ltr"
            />
            {cryptoError && (
              <p className="text-[10px] text-red-500 font-bold bg-red-50 p-3 rounded-xl">{cryptoError}</p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button 
              onClick={handleVerifyCrypto}
              disabled={!txHash.trim()}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all ${
                txHash.trim() 
                  ? 'bg-orange-600 text-white shadow-xl shadow-orange-100 hover:bg-orange-700' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              تایید و بررسی تراکنش
            </button>
            <button 
              onClick={() => setStep('payment-select')} 
              className="w-full py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors"
            >
              بازگشت به انتخاب روش پرداخت
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-slate-50 rounded-2xl p-5 space-y-2">
            <h5 className="text-[10px] font-black text-slate-500">راهنما:</h5>
            <ul className="space-y-1.5 text-[9px] text-slate-400 font-bold leading-relaxed">
              <li>{'1. آدرس ولت فروشنده را کپی کرده و در کیف پول خود وارد کنید.'}</li>
              <li>{'2. مبلغ معادل USDT را از طریق شبکه'} {cryptoNetwork} {'واریز نمایید.'}</li>
              <li>{'3. پس از تایید شبکه، هش تراکنش (TX Hash) را از کیف پول خود کپی کنید.'}</li>
              <li>{'4. هش را در فیلد بالا وارد کرده و دکمه تایید را بزنید.'}</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // --- PAYING (FIAT) SCREEN ---
  if (step === 'paying') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 text-right" dir="rtl">
        <div className="bg-white rounded-[3.5rem] p-12 max-w-md w-full shadow-2xl flex flex-col items-center">
          <div className="w-20 h-20 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-8"></div>
          <h2 className="text-2xl font-black mb-4 text-slate-900">در حال انتقال به درگاه پرداخت...</h2>
          <p className="text-sm text-slate-500 font-bold text-center">لطفا صبر کنید.</p>
        </div>
      </div>
    );
  }

  // --- MAIN CHECKOUT FORM ---
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 text-right" dir="rtl">
      <aside className="lg:w-96 p-10 bg-white border-l border-slate-200 flex flex-col order-last lg:order-first">
        <h2 className="text-xl font-black mb-8">خلاصه فاکتور</h2>
        <div className="space-y-4 mb-8 flex-1">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
            <div className="flex justify-between text-sm font-black text-slate-800">
              <span>{product.name}</span>
              <span>{(product.discountPrice || product.price).toLocaleString()}</span>
            </div>
            {requestedSlot && (
              <div className="flex justify-between text-[10px] font-black text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                <span>زمان رزرو شده:</span>
                <span>{requestedSlot}</span>
              </div>
            )}
            {isPhysical && (
              <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>هزینه ارسال پستی</span><span>{shippingFee.toLocaleString()}</span></div>
            )}
          </div>
          <div className="h-px bg-slate-200 my-4"></div>
          <div className="flex justify-between text-2xl font-black text-indigo-600 px-4">
            <span>جمع کل:</span>
            <span>{totalAmount.toLocaleString()} <span className="text-xs">تومان</span></span>
          </div>

          {/* Available payment methods */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 mb-3">روش‌های پرداخت موجود:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[9px] font-black">درگاه بانکی</span>
              {cryptoEnabled && (
                <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[9px] font-black">USDT ({cryptoNetwork})</span>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-20 max-w-3xl mx-auto w-full">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-black mb-10">
            {'اطلاعات '}{storeMode === StoreMode.PRODUCT ? 'خریدار' : 'متقاضی'}
          </h1>
          <div className="space-y-6">
            <input 
              type="email" 
              placeholder="ایمیل شما" 
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
              value={email} 
              onBlur={handleEmailBlur} 
              onChange={e => setEmail(e.target.value)} 
            />
            <input 
              type="tel" 
              placeholder="شماره همراه" 
              className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-left" 
              dir="ltr" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
            
            {isPhysical && (
              <>
                <input 
                  type="text" 
                  placeholder="کد پستی" 
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-left" 
                  dir="ltr" 
                  value={postalCode} 
                  onChange={e => setPostalCode(e.target.value)} 
                />
                <textarea 
                  rows={4} 
                  placeholder="آدرس دقیق جهت ارسال" 
                  className="w-full px-6 py-4 rounded-[2rem] border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none" 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                />
              </>
            )}

            <button 
              onClick={handleProceedToPayment} 
              className="w-full py-6 bg-indigo-600 text-white font-black text-xl rounded-[2.5rem] shadow-2xl mt-6 hover:bg-indigo-700 transition-all active:scale-[0.98]"
            >
              {'تایید نهایی و پرداخت'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
