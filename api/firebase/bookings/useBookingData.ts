import {useState} from 'react';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';

export interface ServiceBooking {
  id: string;
  userId: string;
  serviceId: string;
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  fee: number;
  service?: {
    serviceType: string;
    description: string;
  };
  modTime?: FirebaseFirestoreTypes.Timestamp;
}

export const useBookingData = () => {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async (params: {
    userId?: string;
    serviceId?: string;
    status?: string;
  }) => {
    setLoading(true);
    try {
      let query: any = db.collection('bookings');

      if (params.userId) {
        query = query.where('userId', '==', params.userId);
      }
      if (params.serviceId) {
        query = query.where('serviceId', '==', params.serviceId);
      }
      if (params.status) {
        query = query.where('status', '==', params.status);
      }

      const snapshot = await query.get();
      const fetchedBookings = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const bookingData = doc.data();
          // Fetch associated service data
          const serviceDoc = await db
            .collection('services')
            .doc(bookingData.serviceId)
            .get();

          return {
            id: doc.id,
            ...bookingData,
            service: serviceDoc.exists
              ? {
                  serviceType: serviceDoc.data()?.serviceType,
                  description: serviceDoc.data()?.description,
                }
              : undefined,
          } as ServiceBooking;
        })
      );

      setBookings(fetchedBookings);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching bookings:', err);
    }
    setLoading(false);
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    // ... other CRUD operations
  };
};
