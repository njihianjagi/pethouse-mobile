import {useState} from 'react';
import firestore from '@react-native-firebase/firestore';

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'request' | 'review' | 'system';
  message: string;
  metadata: {
    [key: string]: any; // Flexible schema for notification details
  };
  isRead: boolean;
  // createdAt: timestamp;
}

export const useNotificationData = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (params: {
    userId: string;
    isRead?: boolean;
    type?: string;
  }) => {
    setLoading(true);
    try {
      let query = firestore()
        .collection('notifications')
        .where('userId', '==', params.userId)
        .orderBy('createdAt', 'desc');

      if (params.isRead !== undefined) {
        query = query.where('isRead', '==', params.isRead);
      }
      if (params.type) {
        query = query.where('type', '==', params.type);
      }

      const snapshot = await query.get();
      const fetchedNotifications = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Notification)
      );

      setNotifications(fetchedNotifications);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    }
    setLoading(false);
  };

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
  };
};
