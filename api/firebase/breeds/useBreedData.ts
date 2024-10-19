import {useEffect, useState} from 'react';
import {db} from '../../../firebase/config'; // Adjust the path as necessary
import breedsData from '../../../assets/data/breeds_with_group_and_traits.json';

export interface DogBreed {
  id?: string;
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

  // Get breed by ID
  const getBreedById = async (id: string): Promise<DogBreed | null> => {
    setLoading(true);
    try {
      const breedDoc = await db.collection('breeds').doc(id).get();

      if (!breedDoc.exists) {
        setLoading(false);
        console.log('No breed found with the given ID');
        return null;
      }

      const breed = {id: breedDoc.id, ...breedDoc.data()} as DogBreed;
      setLoading(false);
      return breed;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      console.error('Error fetching breed by ID:', err);
      return null;
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

  const fetchBreedByName = async (
    breedName: string
  ): Promise<DogBreed | null> => {
    setLoading(true);
    try {
      const breedRef = db.collection('breeds').where('name', '==', breedName);
      const snapshot = await breedRef.get();

      if (snapshot.empty) {
        setLoading(false);
        console.log('No matching breed found');
        return null;
      }

      const breedDoc = snapshot.docs[0];
      const breed = {id: breedDoc.id, ...breedDoc.data()} as DogBreed;
      setLoading(false);
      return breed;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      console.error('Error fetching breed by name:', err);
      return null;
    }
  };

  return {
    allBreeds,
    kennelBreeds,
    loading,
    error,
    getBreedById,
    fetchAllBreeds,
    findBreedByName,
    fetchBreedByName,
  };
};
