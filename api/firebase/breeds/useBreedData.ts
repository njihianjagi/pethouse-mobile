import {useEffect, useState} from 'react';
import {db} from '../../../firebase/config'; // Adjust the path as necessary
import breedsData from '../../../assets/data/breeds_with_group_and_traits.json';

export interface DogBreed {
  name: string;
  description: string;
  height: string;
  lifeSpan: string;
  weight: string;
  image: string;
  breedGroup: string;
  traits: {
    [key: string]: {
      name: string;
      score: number;
    };
  };
  popularity: number;
  available: boolean;
}

export const useBreedData = () => {
  const [allBreeds, setAllBreeds] = useState(breedsData as any);
  const [kennelBreeds, setKennelBreeds] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all breeds
  const fetchAllBreeds = async () => {
    setLoading(true);
    try {
      // const response = await db.collection('breeds').get();
      // const breedsData: any = response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return allBreeds as DogBreed[];
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching all breeds:', err);
    }
    setLoading(false);
  };

  // Fetch all breeds for a specific kennel
  const fetchKennelBreeds = async (kennelId) => {
    if (!kennelId) return;
    try {
      setLoading(true);

      const response = await db
        .collection('kennel_breeds')
        .where('kennel_id', '==', kennelId)
        .get();
      const kennelBreedsData: any = response.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setKennelBreeds(kennelBreedsData);
      setError(null);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);

      console.error('Error fetching kennel breeds:', err);
    }
  };

  // Add a new breed to a kennel
  const addKennelBreed = async (kennelId, breed) => {
    if (!kennelId) return;
    try {
      setLoading(true);
      const response = await db
        .collection('kennel_breeds')
        .add({...breed, kennel_id: kennelId});
      setKennelBreeds((prev) => [...prev, {...breed, id: response.id}]);
      setLoading(false);
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

  const findBreedByName = (breedName: string): DogBreed | undefined => {
    setLoading(true);
    const breed = allBreeds.find(
      (breed) => breed.name.toLowerCase() === breedName.toLowerCase()
    );
    setLoading(true);
    return breed;
  };

  useEffect(() => {
    if (breedsData) {
      setAllBreeds(breedsData);
    }
  }, [breedsData]);

  return {
    allBreeds,
    kennelBreeds,
    loading,
    error,
    addKennelBreed,
    updateKennelBreed,
    deleteKennelBreed,
    fetchKennelBreeds,
    fetchAllBreeds,
    findBreedByName,
  };
};
