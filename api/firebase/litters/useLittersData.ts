import {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';

export interface Litter {
  id: string;
  breederId: string;
  breed: string;
  expectedDate: string;
  puppyCount: number;
  availablePuppies: number;
  images: string[];
  description: string;
}

export const useLitterData = () => {
  const [litters, setLitters] = useState<Litter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLitters = async () => {
    setLoading(true);
    try {
      const snapshot = await db
        .collection('litters')
        .orderBy('expectedDate', 'asc')
        .limit(10)
        .get();

      const fetchedLitters = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Litter[];

      setLitters(fetchedLitters);
      setError(null);
    } catch (err) {
      console.error('Error fetching litters:', err);
      setError('Failed to fetch litters');
    } finally {
      setLoading(false);
    }
  };

  const addLitter = async (
    litterData: Omit<Litter, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const timestamp = firestore.FieldValue.serverTimestamp();
      const docRef = await db.collection('litters').add({
        ...litterData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return docRef.id;
    } catch (err) {
      console.error('Error adding litter:', err);
      throw new Error('Failed to add litter');
    }
  };

  const updateLitter = async (id: string, updateData: Partial<Litter>) => {
    try {
      await db
        .collection('litters')
        .doc(id)
        .update({
          ...updateData,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (err) {
      console.error('Error updating litter:', err);
      throw new Error('Failed to update litter');
    }
  };

  const deleteLitter = async (id: string) => {
    try {
      await db.collection('litters').doc(id).delete();
    } catch (err) {
      console.error('Error deleting litter:', err);
      throw new Error('Failed to delete litter');
    }
  };

  useEffect(() => {
    fetchLitters();
  }, []);

  return {
    litters,
    loading,
    error,
    fetchLitters,
    addLitter,
    updateLitter,
    deleteLitter,
  };
};
