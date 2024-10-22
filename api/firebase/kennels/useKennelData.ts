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
  services: string[];
  userId: string;
}

export interface KennelBreed {
  id?: string;
  kennelId: string;
  breedId: string;
  breedName: string;
  breedGroup: string;
  images?: {thumbnailURL: string; downloadURL: string}[];
  videos?: {downloadURL: string}[];
}

export const useKennelData = () => {
  const [kennels, setKennels] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kennelBreeds, setKennelBreeds] = useState([] as any);
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

  const fetchKennelsByBreed = async (breedId: string) => {
    setLoading(true);
    try {
      const kennelBreedsCollection = db.collection('kennel_breeds');
      const q = query(kennelBreedsCollection, where('breedId', '==', breedId));
      const kennelBreedsSnapshot = await getDocs(q);

      const kennelIds = kennelBreedsSnapshot.docs.map(
        (doc) => doc.data().kennelId
      );

      const kennelsData = await Promise.all(
        kennelIds.map(async (id) => {
          const kennelDoc = await getDoc(doc(db, 'kennels', id));
          return {id: kennelDoc.id, ...kennelDoc.data()} as Kennel;
        })
      );

      setKennels(kennelsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching kennels by breed:', err);
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

  // Fetch all breeds for a specific kennel
  const fetchKennelBreeds = async (kennelId: string) => {
    setLoading(true);
    try {
      const kennelBreedsCollection = collection(db, 'kennel_breeds');
      const q = query(
        kennelBreedsCollection,
        where('kennelId', '==', kennelId)
      );
      const querySnapshot = await getDocs(q);

      const kennelBreeds: any = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Populate breed data for each kennel breed
      const populatedBreeds = await Promise.all(
        kennelBreeds.map(async (kennelBreed) => {
          const breedData = await fetchBreedById(kennelBreed.breedId);
          return {
            ...kennelBreed,
            breedName: breedData?.name || 'Unknown Breed',
            breedGroup: breedData?.breedGroup || 'Unknown Group',
          };
        })
      );

      setKennelBreeds(populatedBreeds);
      setError(null);
      setLoading(false);
      return populatedBreeds;
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching kennel breeds:', err);
    }
    setLoading(false);
    return kennelBreeds;
  };

  // Add a new breed to a kennel
  const addKennelBreed = async (kennelBreed: KennelBreed) => {
    try {
      setLoading(true);
      const response = await db.collection('kennel_breeds').add(kennelBreed);
      setKennelBreeds((prev) => [...prev, {...kennelBreed, id: response.id}]);
      setLoading(false);
      return {...kennelBreed, id: response.id};
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      console.error('Error adding kennel breed:', err);
    }
  };

  // Update an existing breed
  const updateKennelBreed = async (id, updatedData) => {
    try {
      setLoading(true);
      await db.collection('kennel_breeds').doc(id).update(updatedData);
      setKennelBreeds((prev) =>
        prev.map((breed) =>
          breed.id === id ? {...breed, ...updatedData} : breed
        )
      );
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      console.error('Error updating kennel breed:', err);
    }
  };

  // Delete a breed
  const deleteKennelBreed = async (id) => {
    try {
      setLoading(true);

      await db.collection('kennel_breeds').doc(id).delete();
      setKennelBreeds((prev) => prev.filter((breed) => breed.id !== id));
      setLoading(false);
    } catch (err: any) {
      setLoading(false);

      setError(err.message);
      console.error('Error deleting kennel breed:', err);
    }
  };

  return {
    kennels,
    loading,
    error,
    kennelBreeds,
    fetchAllKennels,
    fetchKennelsByBreed,
    getKennelByUserId,
    addKennel,
    updateKennel,
    deleteKennel,
    fetchKennelBreeds,
    addKennelBreed,
    updateKennelBreed,
    deleteKennelBreed,
  };
};

export default useKennelData;
