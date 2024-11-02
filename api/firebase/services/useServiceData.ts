import {useState} from 'react';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';

export interface Service {
  id: string;
  userId: string;
  kennelId?: string;
  serviceType: 'boarding' | 'training' | 'grooming';
  description: string;
  fee: number;
  availability: {
    [day: string]: {
      start: string;
      end: string;
      available: boolean;
    };
  };
  photos: string[];
  modTime: FirebaseFirestoreTypes.Timestamp;
}

export const useServiceData = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async (params: {
    userId?: string;
    kennelId?: string;
    serviceType?: string;
  }) => {
    setLoading(true);
    try {
      let query: any = db.collection('services');

      if (params.userId) {
        query = query.where('userId', '==', params.userId);
      }
      if (params.kennelId) {
        query = query.where('kennelId', '==', params.kennelId);
      }
      if (params.serviceType) {
        query = query.where('serviceType', '==', params.serviceType);
      }

      const snapshot = await query.get();
      const fetchedServices = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Service)
      );

      setServices(fetchedServices);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching services:', err);
    }
    setLoading(false);
  };

  return {
    services,
    loading,
    error,
    fetchServices,
    // ... other CRUD operations
  };
};
