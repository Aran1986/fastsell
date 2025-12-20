
/**
 * این سرویس مسئول مدیریت و تایید تراکنش‌های بلاک‌چینی است.
 * انتخاب فنی: برای شبکه ترون (TRC20)، کتابخانه 'tronweb' استانداردترین گزینه است.
 * دستور نصب: npm install tronweb
 */

import { Currency, BankDetails } from '../types';
// @ts-ignore - TronWeb doesn't have official TypeScript types
import TronWeb from 'tronweb';

// آدرس قرارداد تتر (USDT) روی شبکه اصلی ترون
const USDT_TRC20_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

export const initiatePayment = async (
  currency: Currency,
  amount: number,
  bankDetails: BankDetails,
  customerData: { email: string; phone: string }
): Promise<{ success: boolean; url?: string; transactionId?: string; error?: string }> => {

  switch (currency) {
    case Currency.IRR:
      return { success: true, url: 'https://www.zarinpal.com/pg/StartPay/DEMO' };
    case Currency.EUR:
      return { success: true, url: 'https://checkout.stripe.com/pay/demo' };
    case Currency.USD:
      return { success: true, url: 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick' };
    case Currency.CRYPTO:
      // در کریپتو، تراکنش خارج از سایت انجام می‌شود و ما منتظر هش می‌مانیم.
      return { success: true, transactionId: 'AWAITING_TX_HASH' };
    default:
      return { success: false, error: 'ارز پشتیبانی نمی‌شود.' };
  }
};

/**
 * تابع اصلی تایید تراکنش بلاک‌چین
 * @param hash کد TXID که مشتری وارد کرده است
 * @param sellerWallet آدرس ولت فروشنده که در دیتابیس ذخیره شده
 * @param expectedAmount مبلغی که باید واریز شده باشد
 */
export const verifyCryptoHash = async (
  hash: string,
  sellerWallet: string,
  expectedAmount: number
): Promise<boolean> => {
  console.log(`در حال بررسی تراکنش ${hash} برای ولت مقصد ${sellerWallet}`);

  if (!sellerWallet || sellerWallet === 'تنظیم نشده!') {
    console.error("خطا: آدرس ولت فروشنده در سیستم تعریف نشده است.");
    return false;
  }

  try {
    return await verifyTronTransaction(hash, sellerWallet, expectedAmount);
  } catch (e) {
    console.error("خطای سیستمی در تایید تراکنش:", e);
    return false;
  }
};


/**
 * پیاده‌سازی فنی با TronWeb برای شبکه TRC20
 */
async function verifyTronTransaction(hash: string, sellerWallet: string, amount: number): Promise<boolean> {

  const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io'
  });

  try {
    // مرحله ۱: دریافت جزئیات تراکنش از بلاک‌چین
    const tx = await tronWeb.trx.getTransaction(hash);

    if (!tx || !tx.ret || tx.ret[0].contractRet !== 'SUCCESS') {
      console.log('تراکنش یافت نشد یا موفق نبود');
      return false;
    }

    // مرحله ۲: بررسی نوع قرارداد
    const contract = tx.raw_data.contract[0];

    if (contract.type !== 'TriggerSmartContract') {
      console.log('این تراکنش از نوع TRC20 نیست');
      return false;
    }

    const contractData = contract.parameter.value;

    // مرحله ۳: بررسی آدرس قرارداد USDT
    const contractAddress = tronWeb.address.fromHex(contractData.contract_address);

    if (contractAddress !== USDT_TRC20_CONTRACT) {
      console.log('این تراکنش USDT نیست');
      return false;
    }

    // مرحله ۴: دیکود کردن data تراکنش
    // در TRC20، data شامل: 
    // - 8 کاراکتر اول: function selector برای transfer (a9059cbb)
    // - 64 کاراکتر بعدی: آدرس گیرنده
    // - 64 کاراکتر بعدی: مقدار (به wei)

    const data = contractData.data;

    if (!data || data.length < 136) {
      console.log('فرمت data نامعتبر است');
      return false;
    }

    // بررسی function selector (باید a9059cbb باشد برای transfer)
    const functionSelector = data.substring(0, 8);
    if (functionSelector !== 'a9059cbb') {
      console.log('این تراکنش transfer نیست');
      return false;
    }

    // استخراج آدرس گیرنده (64 کاراکتر بعدی، 24 کاراکتر اول صفر است)
    const recipientHex = '41' + data.substring(32, 72); // 41 پیشوند آدرس ترون
    const recipientAddress = tronWeb.address.fromHex(recipientHex);

    // استخراج مقدار (64 کاراکتر آخر به صورت hex)
    const amountHex = data.substring(72, 136);
    const transferredAmount = parseInt(amountHex, 16) / 1e6; // USDT دارای 6 decimal است

    // مرحله ۵: بررسی شرایط
    console.log('اطلاعات تراکنش:');
    console.log('- قرارداد:', contractAddress);
    console.log('- گیرنده:', recipientAddress);
    console.log('- مقدار:', transferredAmount, 'USDT');
    console.log('- انتظار گیرنده:', sellerWallet);
    console.log('- انتظار مقدار:', amount, 'USDT');

    // تبدیل آدرس فروشنده به فرمت استاندارد برای مقایسه
    const normalizedSellerWallet = tronWeb.address.fromHex(
      tronWeb.address.toHex(sellerWallet)
    );

    if (recipientAddress !== normalizedSellerWallet) {
      console.log('❌ آدرس گیرنده مطابقت ندارد');
      return false;
    }

    if (transferredAmount < amount) {
      console.log('❌ مقدار کمتر از مورد انتظار است');
      return false;
    }

    console.log('✅ تراکنش با موفقیت تایید شد');
    return true;

  } catch (err) {
    console.error("خطا در تایید تراکنش:", err);
    return false;
  }
}
