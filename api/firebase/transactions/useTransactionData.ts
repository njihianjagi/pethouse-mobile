import {useState} from 'react';
import {db} from '../../../firebase/config';
export interface Transaction {
  id: string;
  reservationId?: string;
  bookingId?: string;
  seekerId: string;
  breederId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  commissionFee: number;
  // modTime: timestamp;
}

export const useTransactionData = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (params: {
    seekerId?: string;
    breederId?: string;
    reservationId?: string;
    bookingId?: string;
    status?: string;
  }) => {
    setLoading(true);
    try {
      let query: any = db.collection('transactions');

      if (params.seekerId) {
        query = query.where('seekerId', '==', params.seekerId);
      }
      if (params.breederId) {
        query = query.where('breederId', '==', params.breederId);
      }
      if (params.reservationId) {
        query = query.where('reservationId', '==', params.reservationId);
      }
      if (params.bookingId) {
        query = query.where('bookingId', '==', params.bookingId);
      }
      if (params.status) {
        query = query.where('status', '==', params.status);
      }

      const snapshot = await query.get();
      const fetchedTransactions = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Transaction)
      );

      setTransactions(fetchedTransactions);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching transactions:', err);
    }
    setLoading(false);
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
  };
};
