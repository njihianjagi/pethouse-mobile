import {useState} from 'react';
import {db} from '../../../firebase/config';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

export interface Negotiation {
  id: string;
  reservationId: string;
  seekerId: string;
  breederId: string;
  offerPrice: number;
  counterOffer?: number;
  finalOffer?: number;
  status: 'pending' | 'countered' | 'accepted' | 'rejected';
  modTime: FirebaseFirestoreTypes.Timestamp;
}

export const useNegotiationData = () => {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNegotiations = async (params: {
    seekerId?: string;
    breederId?: string;
    reservationId?: string;
    status?: string;
  }) => {
    setLoading(true);
    try {
      let query: any = db.collection('negotiations');

      if (params.seekerId) {
        query = query.where('seekerId', '==', params.seekerId);
      }
      if (params.breederId) {
        query = query.where('breederId', '==', params.breederId);
      }
      if (params.reservationId) {
        query = query.where('reservationId', '==', params.reservationId);
      }
      if (params.status) {
        query = query.where('status', '==', params.status);
      }

      const snapshot = await query.get();
      const fetchedNegotiations = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Negotiation)
      );

      setNegotiations(fetchedNegotiations);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching negotiations:', err);
    }
    setLoading(false);
  };

  return {
    negotiations,
    loading,
    error,
    fetchNegotiations,
    // ... other CRUD operations
  };
};
