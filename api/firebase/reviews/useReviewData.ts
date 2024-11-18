import {useState} from 'react';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';

export interface Review {
  id: string;
  userId: string;
  targetId: string; // ID of kennel or breeder being reviewed
  targetType: 'kennel' | 'breeder' | 'service';
  rating: number;
  title: string;
  content: string;
  photos?: string[];
  verified: boolean; // Whether reviewer has verified transaction
  transactionId?: string;
  modTime: FirebaseFirestoreTypes.Timestamp;
}

export const useReviewData = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async (params: {
    userId?: string;
    targetId?: string;
    targetType?: string;
    verified?: boolean;
  }) => {
    setLoading(true);
    try {
      let query: any = db.collection('reviews');

      if (params.userId) {
        query = query.where('userId', '==', params.userId);
      }
      if (params.targetId) {
        query = query.where('targetId', '==', params.targetId);
      }
      if (params.targetType) {
        query = query.where('targetType', '==', params.targetType);
      }
      if (params.verified !== undefined) {
        query = query.where('verified', '==', params.verified);
      }

      const snapshot = await query.get();
      const fetchedReviews = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Review)
      );

      setReviews(fetchedReviews);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching reviews:', err);
    }
    setLoading(false);
  };

  return {
    reviews,
    loading,
    error,
    fetchReviews,
  };
};
