import {useState, useEffect} from 'react';
import {db} from '../../../firebase/config'; // Adjust the path as necessary

export interface Kennel {
  id: string;
  name: string;
  location: string;
  services: string[];
  breeds: {
    name: string;
    images: string[];
  }[];
  userId: string;
}

export const useKennelData = () => {
  const [kennels, setKennels] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all kennels with their associated breeds
  const fetchAllKennels = async () => {
    setLoading(true);
    try {
      const response = await db.collection('kennels').get();
      const kennelsData = await Promise.all(
        response.docs.map(async (doc) => {
          const kennel: any = {id: doc.id, ...doc.data()};
          const breedsResponse = await db
            .collection('breeds')
            .where('kennel_id', '==', doc.id)
            .get();
          kennel.breeds = breedsResponse.docs.map((breedDoc) => ({
            id: breedDoc.id,
            ...breedDoc.data(),
          }));
          return kennel;
        })
      );
      setKennels(kennelsData);
      console.log('all kennels', kennelsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching kennels:', err);
    }
    setLoading(false);
  };

  const fetchKennelsByBreed = async (breedName: string) => {
    try {
      setLoading(true);
      console.log('fetching kennel for', breedName);
      const response = await db
        .collection('kennels')
        .where('breeds', 'array-contains', {name: breedName})
        .get();

      const kennelsData = response.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Kennel[];

      console.log('kennels data: ', kennelsData);

      setKennels(kennelsData);
      setError(null);
      setLoading(false);
    } catch (err: any) {
      console.log('error: ', err);
      setError(err.message);
      setLoading(false);

      console.error('Error fetching kennels by breed:', err);
    }
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
        return null;
      }

      const kennelData = response.docs[0].data();
      setLoading(false);
      return {id: response.docs[0].id, ...kennelData};
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      console.error('Error fetching kennel by user ID:', err);
      throw err;
    }
  };

  // Add a new kennel
  const addKennel = async (kennel) => {
    try {
      setLoading(true);
      const response = await db.collection('kennels').add(kennel);
      setKennels((prev) => [...prev, {id: response.id, ...kennel}]);
      setLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      console.error('Error adding kennel:', err);
    }
  };

  // Update an existing kennel
  const updateKennel = async (id, updatedData) => {
    try {
      setLoading(true);
      console.log(updatedData);
      await db.collection('kennels').doc(id).update(updatedData);
      setKennels((prev) =>
        prev.map((kennel) =>
          kennel.id === id ? {...kennel, ...updatedData} : kennel
        )
      );
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      console.error('Error updating kennel:', err);
    }
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
    addKennel,
    updateKennel,
    deleteKennel,
    fetchAllKennels,
    fetchKennelsByBreed,
    getKennelByUserId,
  };
};

export default useKennelData;
