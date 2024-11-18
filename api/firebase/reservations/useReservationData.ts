import {useState, useCallback, useEffect} from 'react';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {db, firestore} from '../../../firebase/config';

export interface Reservation {
  id: string;
  seekerId: string;
  breederId: string;
  listingId: string;
  kennelId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  deposit?: number;
  totalPrice: number;
  paymentStatus: 'pending' | 'partial' | 'completed';
  meetingPreference?: 'virtual' | 'in-person';
  notes?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  modifiedAt: FirebaseFirestoreTypes.Timestamp;
}

export const useReservationData = (userId?: string) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReservations = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const reservationsRef = db.collection('reservations');
      const q = reservationsRef
        .where('seekerId', '==', userId)
        .orderBy('createdAt', 'desc');

      const snapshot = await q.get();
      const reservationData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Reservation[];

      setReservations(reservationData);
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createReservation = async (
    reservationData: Omit<Reservation, 'id'>
  ) => {
    setLoading(true);
    try {
      const reservationsRef = db.collection('reservations');
      const docRef = await reservationsRef.add({
        ...reservationData,
        createdAt: firestore.Timestamp.now(),
        modifiedAt: firestore.Timestamp.now(),
      });

      const newReservation = {
        id: docRef.id,
        ...reservationData,
      };

      setReservations((prev) => [newReservation, ...prev]);
      setError(null);
      return newReservation;
    } catch (err: any) {
      setError(err);
      console.error('Error creating reservation:', err);
      throw err; // Re-throw to handle in UI
    } finally {
      setLoading(false);
    }
  };

  const updateReservation = async (
    reservationId: string,
    updates: Partial<Reservation>
  ) => {
    setLoading(true);
    try {
      const reservationRef = db.collection('reservations').doc(reservationId);
      await reservationRef.update({
        ...updates,
        modifiedAt: firestore.Timestamp.now(),
      });

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId
            ? {...reservation, ...updates}
            : reservation
        )
      );
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error('Error updating reservation:', err);
      throw err; // Re-throw to handle in UI
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId: string) => {
    setLoading(true);
    try {
      await updateReservation(reservationId, {
        status: 'cancelled',
        modifiedAt: firestore.Timestamp.now(),
      });
      setError(null);
    } catch (err: any) {
      setError(err);
      console.error('Error cancelling reservation:', err);
      throw err; // Re-throw to handle in UI
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates for user's reservations
  useEffect(() => {
    if (!userId) return;

    const reservationsRef = db.collection('reservations');
    const q = reservationsRef
      .where('seekerId', '==', userId)
      .orderBy('createdAt', 'desc');

    const unsubscribe = q.onSnapshot(
      (snapshot) => {
        const reservationData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Reservation[];
        setReservations(reservationData);
      },
      (err) => {
        setError(err as Error);
        console.error('Error in reservation subscription:', err);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    createReservation,
    updateReservation,
    cancelReservation,
  };
};
