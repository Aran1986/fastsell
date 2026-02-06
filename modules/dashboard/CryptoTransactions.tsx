import React, { useState, useEffect } from 'react';
import { transactionsApi, Transaction } from '../../services/paymentApiService';
import { supabase } from '../../services/supabaseClient';
import { getExplorerUrl } from '../../services/paymentService';

const CryptoTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'failed'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const allTxs = await transactionsApi.getSellerTransactions(user.id, 100);
      setTransactions(allTxs.filter(tx => tx.payment_method === 'crypto'));
    } catch (error) {
      // Error silently handled
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.status === filter;
  });

  const statusColors = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    verified: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    expired: 'bg-slate-50 text-slate-400 border-slate-200',
  };

  const statusLabels = {
    pending: 'در انتظار تایید',
    verified: 'تایید شده',
    failed: 'ناموفق',
    expired: 'منقضی شده',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-400 font-bold">در حال بارگذاری تراکنش‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900">تراکنش‌های رمزارزی (USDT)</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">لیست پرداخت‌های دریافتی از طریق بلاک‌چین</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'verified', 'pending', 'failed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {f === 'all' ? 'همه' : statusLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💸</div>
          <h4 className="text-lg font-black text-slate-400 mb-2">هیچ تراکنشی یافت نشد</h4>
          <p className="text-xs text-slate-400 font-bold">
            {filter === 'all'
              ? 'هنوز هیچ پرداخت رمزارزی دریافت نکرده‌اید.'
              : `هیچ تراکنش ${statusLabels[filter]} وجود ندارد.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map(tx => (
            <div
              key={tx.id}
              className="p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-100 transition-all space-y-4"
            >
              {/* Top Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 mb-1">{tx.product_name || 'محصول'}</h4>
                  <p className="text-xs text-slate-400 font-bold">
                    مشتری: {tx.buyer_email || 'ناشناس'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="text-xl font-black text-slate-900">
                      {tx.amount.toLocaleString()} <span className="text-sm text-slate-400">USDT</span>
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{tx.network}</div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl border-2 text-xs font-black ${statusColors[tx.status as keyof typeof statusColors]}`}>
                    {statusLabels[tx.status as keyof typeof statusLabels]}
                  </div>
                </div>
              </div>

              {/* TX Hash */}
              {tx.tx_hash && (
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-black uppercase">Transaction Hash</span>
                    <a
                      href={getExplorerUrl(tx.tx_hash, tx.network || 'TRC20')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] text-indigo-600 font-bold hover:underline"
                    >
                      مشاهده در Explorer
                    </a>
                  </div>
                  <div className="font-mono text-[10px] text-slate-600 break-all" dir="ltr">
                    {tx.tx_hash}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-slate-400 font-bold">
                <span>تاریخ: {new Date(tx.created_at!).toLocaleDateString('fa-IR')}</span>
                {tx.verified_at && (
                  <span className="text-green-600">
                    تایید شده: {new Date(tx.verified_at).toLocaleDateString('fa-IR')}
                  </span>
                )}
                {tx.block_number && (
                  <span>Block: #{tx.block_number.toLocaleString()}</span>
                )}
                {tx.error_message && (
                  <span className="text-red-600">خطا: {tx.error_message}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
        <div className="text-center p-6 bg-green-50 rounded-2xl">
          <div className="text-2xl font-black text-green-700">
            {transactions.filter(tx => tx.status === 'verified').length}
          </div>
          <div className="text-[10px] text-green-600 font-bold uppercase mt-1">تایید شده</div>
        </div>
        <div className="text-center p-6 bg-yellow-50 rounded-2xl">
          <div className="text-2xl font-black text-yellow-700">
            {transactions.filter(tx => tx.status === 'pending').length}
          </div>
          <div className="text-[10px] text-yellow-600 font-bold uppercase mt-1">در انتظار</div>
        </div>
        <div className="text-center p-6 bg-indigo-50 rounded-2xl">
          <div className="text-2xl font-black text-indigo-700">
            {transactions.filter(tx => tx.status === 'verified').reduce((acc, tx) => acc + Number(tx.amount), 0).toFixed(2)} <span className="text-sm">USDT</span>
          </div>
          <div className="text-[10px] text-indigo-600 font-bold uppercase mt-1">مجموع دریافتی</div>
        </div>
      </div>
    </div>
  );
};

export default CryptoTransactions;
