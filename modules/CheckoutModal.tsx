import React, { useState, useEffect } from 'react';
import { SalesLink, StoreMode } from '../types';
import { verifyCryptoHash, getExplorerUrl } from '../services/paymentService';
import { paymentSettingsApi, transactionsApi } from '../services/paymentApiService';

interface CheckoutModalProps {
  links: SalesLink[];
  initialStoreSlug: string;
  initialProductId: string;
  onClose: () => void;
  onSaleSuccess: (slug: string, productId: string, amount: number) => void;
}

type CheckoutStep = 'info' | 'payment-select' | 'crypto-pay' | 'crypto-verifying' | 'paying' | 'success' | 'oos' | 'error';
type PaymentMethod = 'fiat' | 'crypto';

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  links,
  initialStoreSlug,
  initialProductId,
  onClose,
  onSaleSuccess,
}) => {
  const link = links.find(l => l.slug === initialStoreSlug);
  const product = link?.products.find(p => p.id === initialProductId);
  const storeMode = link?.mode || StoreMode.PRODUCT;
  const isPhysical = storeMode === StoreMode.PRODUCT && product?.shippingMethod !== 'digital';

  const cryptoEnabled = (link?.bankDetails?.cryptoEnabled && link?.bankDetails?.walletAddress) || true;
  const sellerWallet = link?.bankDetails?.walletAddress || 'TRvL9cWnSNd3FDf9xvnH2bxQm7RbzLkAVA';
  const cryptoNetwork = link?.bankDetails?.network || 'TRC20';

  // State
  const [step, setStep] = useState<CheckoutStep>('info');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('fiat');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [txHash, setTxHash] = useState('');
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [cryptoError, setCryptoError] = useState<string | null>(null);
  const [payingStatus, setPayingStatus] = useState('');
  const [messagingStatus, setMessagingStatus] = useState('');

  if (!link || !product) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-black mb-4">محصول یافت نشد</h2>
          <button
            onClick={onClose}
            className="bg-slate-900 text-white px-6 py-2 rounded-lg"
          >
            بستن
          </button>
        </div>
      </div>
    );
  }

  const shippingFee = isPhysical ? 10000 : 0;
  const totalAmount = (product.discountPrice || product.price) + shippingFee;

  const handleProceedToPayment = () => {
    if (!email || !phone) return alert('وارد کردن ایمیل و موبایل الزامی است.');
    if (isPhysical && (!address || !postalCode)) return alert('برای ارسال کالای فیزیکی، آدرس و کد پستی الزامی است.');
    
    if (cryptoEnabled) {
      setStep('payment-select');
    } else {
      // Simulate fiat payment
      setStep('paying');
      setPayingStatus('در حال پردازش پرداخت...');
      setTimeout(() => {
        completeOrder();
      }, 2000);
    }
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    if (method === 'fiat') {
      setStep('paying');
      setPayingStatus('در حال پردازش پرداخت...');
      setTimeout(() => {
        completeOrder();
      }, 2000);
    } else {
      setStep('crypto-pay');
      setCryptoError(null);
    }
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

    const progressInterval = setInterval(() => {
      setVerificationProgress(prev => Math.min(prev + 15, 90));
    }, 500);

    try {
      const sellerSettings = await paymentSettingsApi.getSettingsByEmail(link.email || '');
      if (!sellerSettings) {
        throw new Error('تنظیمات فروشنده یافت نشد');
      }

      const transaction = await transactionsApi.createTransaction({
        tx_hash: txHash,
        payment_method: 'crypto',
        amount: totalAmount,
        currency: 'USDT',
        seller_id: sellerSettings.seller_id,
        buyer_email: email,
        buyer_wallet: '',
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
        },
      });

      const result = await verifyCryptoHash(txHash, sellerWallet, totalAmount, cryptoNetwork);
      
      clearInterval(progressInterval);
      setVerificationProgress(100);

      if (result.verified) {
        await transactionsApi.updateTransaction(transaction.id!, {
          status: 'verified',
          verified_at: new Date().toISOString(),
          from_address: result.fromAddress,
          block_number: result.blockNumber,
        });

        setTimeout(() => completeOrder(txHash), 500);
      } else {
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
    onSaleSuccess(link.slug, product.id, totalAmount);
    setStep('success');
  };

  const explorerUrl = getExplorerUrl(txHash, cryptoNetwork);

  // Modal content
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl my-8 relative">
        {/* Close button */}
        {step !== 'success' && (
          <button
            onClick={onClose}
            className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 font-black transition-colors z-10"
            title="بستن"
          >
            ×
          </button>
        )}

        <div className="p-8 text-right" dir="rtl">
          {/* STEP 1: Customer Info */}
          {step === 'info' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">اطلاعات خریدار</h2>
              
              <div>
                <label className="block text-sm font-bold mb-2">ایمیل</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">موبایل</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+98..."
                  className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {isPhysical && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2">آدرس</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="آدرس کامل..."
                      className="w-full border-2 border-slate-300 rounded-lg p-3 h-24 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2">کد پستی</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="10000000"
                      className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </>
              )}

              <div className="bg-slate-100 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>قیمت محصول:</span>
                  <span>{(product.discountPrice || product.price).toLocaleString()} تومان</span>
                </div>
                {shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span>هزینه ارسال:</span>
                    <span>{shippingFee.toLocaleString()} تومان</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>جمع کل:</span>
                  <span>{totalAmount.toLocaleString()} تومان</span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black hover:bg-indigo-700 transition"
              >
                تائید و انتخاب درگاه پرداخت
              </button>
            </div>
          )}

          {/* STEP 2: Payment Method Selection */}
          {step === 'payment-select' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">انتخاب روش پرداخت</h2>

              <div className="space-y-4">
                <button
                  onClick={() => handleSelectPaymentMethod('fiat')}
                  className="w-full p-6 border-2 border-slate-300 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition text-right"
                >
                  <h3 className="font-bold text-lg">درگاه بانکی (ریالی)</h3>
                  <p className="text-sm text-slate-600 mt-1">پرداخت از طریق درگاه‌های بانکی ایرانی</p>
                </button>

                {cryptoEnabled && (
                  <button
                    onClick={() => handleSelectPaymentMethod('crypto')}
                    className="w-full p-6 border-2 border-slate-300 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition text-right"
                  >
                    <h3 className="font-bold text-lg">پرداخت کریپتو</h3>
                    <p className="text-sm text-slate-600 mt-1">پرداخت با رمزارز ({cryptoNetwork})</p>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Fiat Paying */}
          {step === 'paying' && (
            <div className="space-y-6 text-center">
              <div className="animate-spin inline-block">
                <div className="w-12 h-12 border-4 border-slate-300 border-t-indigo-600 rounded-full"></div>
              </div>
              <p className="text-lg font-bold">{payingStatus}</p>
              <p className="text-sm text-slate-600">{messagingStatus}</p>
            </div>
          )}

          {/* STEP 4: Crypto Payment */}
          {step === 'crypto-pay' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black">پرداخت از طریق کریپتو</h2>

              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-900 mb-4">کیف پول دریافت کننده:</p>
                <div className="bg-white p-3 rounded-lg font-mono text-sm break-all mb-3 border">
                  {sellerWallet}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sellerWallet);
                    alert('آدرس کپی شد!');
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  کپی کردن آدرس
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-bold">مبلغ: {(totalAmount / 30000).toFixed(2)} USDT</p>
                <p className="text-sm text-slate-600">شبکه: {cryptoNetwork}</p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">هش تراکنش (TX Hash)</label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className="w-full border-2 border-slate-300 rounded-lg p-3 focus:outline-none focus:border-indigo-600"
                />
              </div>

              {cryptoError && (
                <div className="bg-red-50 border-2 border-red-300 p-4 rounded-lg text-red-900 text-sm">
                  {cryptoError}
                </div>
              )}

              <button
                onClick={handleVerifyCrypto}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black hover:bg-indigo-700 transition"
              >
                تایید تراکنش
              </button>
            </div>
          )}

          {/* STEP 5: Crypto Verifying */}
          {step === 'crypto-verifying' && (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-black">تایید تراکنش</h2>
              
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#e2e8f0" strokeWidth="4" fill="none" />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#4f46e5"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${(2 * Math.PI * 40 * verificationProgress) / 100} ${2 * Math.PI * 40}`}
                    style={{ transition: 'stroke-dasharray 0.3s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-black">
                  {verificationProgress}%
                </div>
              </div>

              <p className="text-lg font-bold">در حال بررسی تراکنش...</p>
            </div>
          )}

          {/* STEP 6: Success */}
          {step === 'success' && (
            <div className="space-y-6 text-center">
              <div className="text-6xl">✓</div>
              <h2 className="text-2xl font-black text-green-600">خرید شما تکمیل شد!</h2>
              <p className="text-slate-600">از خریداری‌تان سپاس‌گزاریم. اطلاعات سفارش به ایمیل شما ارسال می‌شود.</p>

              {paymentMethod === 'crypto' && txHash && (
                <div className="bg-slate-100 p-4 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2">هش تراکنش:</p>
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 font-bold break-all text-sm"
                  >
                    {txHash}
                  </a>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-800 transition"
              >
                بستن
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
