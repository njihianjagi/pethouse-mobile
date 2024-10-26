import {useState, useEffect} from 'react';
import {db} from '../../../firebase/config';
import useBreedData, {UserBreed} from '../breeds/useBreedData';

export interface Litter {
  id?: string;
  userId: string;
  userBreedId: string;
  breedId: string;
  name: string;
  birthDate: string;
  availableDate: string;
  numberOfPuppies: number;
  images: string[];
  videos: string[];
  userBreed: UserBreed;
}

export const useLitterData = () => {
  const [litters, setLitters] = useState<Litter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {fetchUserBreedById} = useBreedData();

  const fetchLitters = async (params: {
    userId?: string;
    userBreedId?: string;
    breedId?: string;
  }) => {
    setLoading(true);
    try {
      let query: any = db.collection('litters');

      if (params.userId) {
        query = query.where('userId', '==', params.userId);
      }
      if (params.userBreedId) {
        query = query.where('userBreedId', '==', params.userBreedId);
      }
      if (params.breedId) {
        query = query.where('breedId', '==', params.breedId);
      }

      const snapshot = await query.get();
      const fetchedLitters = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const litterData = doc.data() as Litter;
          const userBreed = await fetchUserBreedById(litterData.userBreedId);
          return {...litterData, id: doc.id, userBreed};
        })
      );

      setLitters(fetchedLitters);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching litters:', err);
    }
    setLoading(false);
  };

  const addLitter = async (litter: Omit<Litter, 'id'>) => {
    try {
      const docRef = await db.collection('litters').add(litter);
      const newLitter = {id: docRef.id, ...litter};
      setLitters((prev) => [...prev, newLitter]);
      return newLitter;
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding litter:', err);
      throw err;
    }
  };

  const updateLitter = async (id: string, updatedData: Partial<Litter>) => {
    try {
      await db.collection('litters').doc(id).update(updatedData);
      setLitters((prev) =>
        prev.map((litter) =>
          litter.id === id ? {...litter, ...updatedData} : litter
        )
      );
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating litter:', err);
      throw err;
    }
  };

  const deleteLitter = async (id: string) => {
    try {
      await db.collection('litters').doc(id).delete();
      setLitters((prev) => prev.filter((litter) => litter.id !== id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting litter:', err);
      throw err;
    }
  };

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
