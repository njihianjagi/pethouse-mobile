import {useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'listing' | 'litter' | 'booking' | 'review' | 'message';
  description: string;
  metadata: {
    [key: string]: any; // Flexible schema for activity details
  };
  // createdAt: timestamp;
}

export const useActivityLogData = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async (params: {
    userId: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    setLoading(true);
    try {
      let query = db
        .collection('activityLogs')
        .where('userId', '==', params.userId)
        .orderBy('createdAt', 'desc');

      if (params.type) {
        query = query.where('type', '==', params.type);
      }
      if (params.startDate) {
        query = query.where('createdAt', '>=', params.startDate);
      }
      if (params.endDate) {
        query = query.where('createdAt', '<=', params.endDate);
      }

      const snapshot = await query.get();
      const fetchedActivities = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ActivityLog)
      );

      setActivities(fetchedActivities);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching activities:', err);
    }
    setLoading(false);
  };

  return {
    activities,
    loading,
    error,
    fetchActivities,
  };
};
