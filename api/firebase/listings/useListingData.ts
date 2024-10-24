import {useState, useEffect} from 'react';
import firestore from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';

export interface Listing {
  id: string;
  userId: string;
  kennelBreedId: string;
  breedId: string;
  kennelId: string;
  name: string;
  breed: string;
  sex: 'male' | 'female';
  age: string;
  traits: {
    [key: string]: number;
  };
  images: string[];
  videos: string[];
}

export const useListingData = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const snapshot = await db
        .collection('listings')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      const fetchedListings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Listing[];

      setListings(fetchedListings);
      setError(null);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchListingsByKennelId = async (kennelId: string) => {
    setLoading(true);
    try {
      const snapshot = await db
        .collection('listings')
        .where('kennelId', '==', kennelId)
        .orderBy('createdAt', 'desc')
        .get();

      const fetchedListings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Listing[];

      setListings(fetchedListings);
      setError(null);
      return fetchedListings;
    } catch (err) {
      console.error('Error fetching listings by kennel ID:', err);
      setError('Failed to fetch listings');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addListing = async (
    listingData: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    try {
      const timestamp = firestore.FieldValue.serverTimestamp();
      const docRef = await db.collection('listings').add({
        ...listingData,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      return docRef.id;
    } catch (err) {
      console.error('Error adding listing:', err);
      throw new Error('Failed to add listing');
    }
  };

  const updateListing = async (id: string, updateData: Partial<Listing>) => {
    try {
      await db
        .collection('listings')
        .doc(id)
        .update({
          ...updateData,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (err) {
      console.error('Error updating listing:', err);
      throw new Error('Failed to update listing');
    }
  };

  const deleteListing = async (id: string) => {
    try {
      await db.collection('listings').doc(id).delete();
    } catch (err) {
      console.error('Error deleting listing:', err);
      throw new Error('Failed to delete listing');
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    loading,
    error,
    fetchListings,
    addListing,
    updateListing,
    deleteListing,
    fetchListingsByKennelId,
  };
};
