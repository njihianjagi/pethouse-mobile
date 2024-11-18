import {useState, useEffect} from 'react';
import {db} from '../../../firebase/config'; // Adjust the path as necessary
import {
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  collection,
  deleteDoc,
  updateDoc,
} from '@react-native-firebase/firestore';
import {useBreedData} from '../breeds/useBreedData';

export interface Kennel {
  id: string;
  name: string;
  location: string;
  userId: string;
  services?: string[];
}

export const useKennelData = () => {
  const [kennels, setKennels] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {fetchBreedById} = useBreedData();

  // Fetch all kennels with their associated breeds
  const fetchAllKennels = async () => {
    setLoading(true);
    try {
      const response = await db.collection('kennels').get();
      const kennelsData = response.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setKennels(kennelsData);
      // console.log('all kennels', JSON.stringify(kennelsData));
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching kennels:', err);
    }
    setLoading(false);
  };

  // Get a kennel by user ID
  const getKennelByUserId = async (userId: string): Promise<any | null> => {
    try {
      setLoading(true);
      const response = await db
        .collection('kennels')
        .where('userId', '==', userId)
        .get();

      if (response.empty) {
        setLoading(false);
        console.log('kennel not found');
        return null;
      }

      const kennelData = response.docs[0].data();
      console.log('user kennel', kennelData);

      setLoading(false);
      return {id: response.docs[0].id, ...kennelData};
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      console.error('Error fetching kennel by user ID:', err);
      throw err;
    }
  };

  const addKennel = async (kennelData: Omit<Kennel, 'id'>) => {
    setLoading(true);
    try {
      const kennelsCollection = collection(db, 'kennels');
      const docRef = await addDoc(kennelsCollection, kennelData);
      const newKennel = {id: docRef.id, ...kennelData};
      setKennels((prev) => [...prev, newKennel]);
      setError(null);
      return newKennel;
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding kennel:', err);
    }
    setLoading(false);
  };

  const updateKennel = async (id: string, updatedData: Partial<Kennel>) => {
    setLoading(true);
    try {
      const kennelRef = doc(db, 'kennels', id);
      await updateDoc(kennelRef, updatedData);
      setKennels((prev) =>
        prev.map((kennel) =>
          kennel.id === id ? {...kennel, ...updatedData} : kennel
        )
      );
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating kennel:', err);
    }
    setLoading(false);
  };

  // Delete a kennel
  const deleteKennel = async (id) => {
    try {
      setLoading(true);
      await db.collection('kennels').doc(id).delete();
      setKennels((prev) => prev.filter((kennel) => kennel.id !== id));
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      console.error('Error deleting kennel:', err);
    }
  };

  return {
    kennels,
    loading,
    error,
    fetchAllKennels,
    getKennelByUserId,
    addKennel,
    updateKennel,
    deleteKennel,
  };
};

export default useKennelData;
