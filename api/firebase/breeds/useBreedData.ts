import {useEffect, useState} from 'react';
import {db} from '../../../firebase/config'; // Adjust the path as necessary
import breedsData from '../../../assets/data/breeds_with_group_and_traits.json';

export interface DogBreed {
  id: string;
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
export interface UserBreed {
  id?: string;
  userId: string;
  user?: any;
  breedId: string;
  kennelId?: string;
  kennel?: any;
  breedName: string;
  breedGroup: string;
  isOwner: boolean;
  images?: {thumbnailURL: string; downloadURL: string}[];
  videos?: {downloadURL: string}[];
}

export const useBreedData = (userId?: string) => {
  const [allBreeds, setAllBreeds] = useState(breedsData as any);
  const [userBreeds, setUserBreeds] = useState<UserBreed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as any);

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

  const fetchBreedById = async (breedId: string): Promise<DogBreed | null> => {
    try {
      const breedDoc = await db.collection('breeds').doc(breedId).get();
      if (breedDoc.exists) {
        return {id: breedDoc.id, ...breedDoc.data()} as DogBreed;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching breed by ID:', err);
      return null;
    }
  };

  const fetchUserBreeds = async (userId: string) => {
    setLoading(true);
    try {
      const userBreedsSnapshot = await db
        .collection('user_breeds')
        .where('userId', '==', userId)
        .get();
      const userBreedsData = userBreedsSnapshot.docs.map(
        (doc) => ({id: doc.id, ...doc.data()} as UserBreed)
      );
      setUserBreeds(userBreedsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching user breeds:', err);
    }
    setLoading(false);
  };

  const fetchUserBreedById = async (
    userBreedId: string
  ): Promise<UserBreed | null> => {
    setLoading(true);
    try {
      const userBreedDoc = await db
        .collection('user_breeds')
        .doc(userBreedId)
        .get();
      if (userBreedDoc.exists) {
        const userBreedData = {
          id: userBreedDoc.id,
          ...userBreedDoc.data(),
        } as UserBreed;
        setError(null);
        setLoading(false);
        return userBreedData;
      } else {
        setError('User breed not found');
        setLoading(false);
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching user breed by ID:', err);
      setLoading(false);
      return null;
    }
  };

  const addUserBreed = async (userBreed: Omit<UserBreed, 'id'>) => {
    try {
      const docRef = await db.collection('user_breeds').add(userBreed);
      const newUserBreed = {id: docRef.id, ...userBreed};
      setUserBreeds((prev) => [...prev, newUserBreed]);
      return newUserBreed;
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding user breed:', err);
      return null;
    }
  };

  const updateUserBreed = async (
    id: string,
    updatedData: Partial<UserBreed>
  ) => {
    try {
      await db.collection('user_breeds').doc(id).update(updatedData);
      setUserBreeds((prev) =>
        prev.map((breed) =>
          breed.id === id ? {...breed, ...updatedData} : breed
        )
      );
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating user breed:', err);
    }
  };

  const deleteUserBreed = async (id: string) => {
    try {
      await db.collection('user_breeds').doc(id).delete();
      setUserBreeds((prev) => prev.filter((breed) => breed.id !== id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting user breed:', err);
    }
  };

  const fetchUserBreedsByBreedId = async (breedId: string) => {
    setLoading(true);
    try {
      const userBreedsSnapshot = await db
        .collection('user_breeds')
        .where('breedId', '==', breedId)
        .get();

      const userBreedsData = await Promise.all(
        userBreedsSnapshot.docs.map(async (doc) => {
          const data = doc.data() as UserBreed;
          let ownerDetails;
          if (data.isOwner) {
            if (data.kennelId) {
              const kennelDoc = await db
                .collection('kennels')
                .doc(data.kennelId)
                .get();
              ownerDetails = kennelDoc.data();
            } else {
              const userDoc = await db
                .collection('users')
                .doc(data.userId)
                .get();
              ownerDetails = userDoc.data();
            }
          }
          return {
            ...data,
            id: doc.id,
            [data.kennelId ? 'kennel' : 'user']: ownerDetails,
          };
        })
      );

      setUserBreeds(userBreedsData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching user breeds:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) {
      fetchUserBreeds(userId);
    }
  }, [userId]);

  return {
    allBreeds,
    userBreeds,
    loading,
    error,
    fetchAllBreeds,
    findBreedByName,
    fetchBreedByName,
    fetchBreedById,
    fetchUserBreeds,
    fetchUserBreedById,
    fetchUserBreedsByBreedId,
    addUserBreed,
    updateUserBreed,
    deleteUserBreed,
  };
};

export default useBreedData;
