import { transactionsApi } from '../../services/paymentApiService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { txHash } = req.body;

  if (!txHash) {
    return res.status(400).json({ error: 'TX hash is required' });
  }

  try {
    const transaction = await transactionsApi.getTransactionByHash(txHash);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    return res.status(200).json({
      status: transaction.status,
      verified_at: transaction.verified_at,
      block_number: transaction.block_number,
      error_message: transaction.error_message,
    });
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
