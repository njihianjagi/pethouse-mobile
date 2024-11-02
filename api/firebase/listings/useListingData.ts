import {useState, useEffect} from 'react';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';

export interface Listing {
  id: string;
  userId: string;
  userBreedId: string;
  breedId: string;
  breedName: string; // Denormalized for filtering/display
  name: string;
  sex: string;
  age: string;
  price?: number;
  status: 'available' | 'pending' | 'sold';
  traits: {
    [traitName: string]: {
      score: number;
      description: string;
    };
  };
  media: {
    images: string[];
    videos: string[];
  };
  location: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp;
  modifiedAt?: FirebaseFirestoreTypes.Timestamp;
}

export const useListingData = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async (params: {
    userId?: string;
    kennelId?: string;
    breedId?: string;
    userBreedId?: string;
  }) => {
    setLoading(true);
    try {
      let query: any = db.collection('listings');

      if (params.userId) {
        query = query.where('userId', '==', params.userId);
      }
      if (params.kennelId) {
        query = query.where('kennelId', '==', params.kennelId);
      }
      if (params.breedId) {
        query = query.where('breedId', '==', params.breedId);
      }
      if (params.userBreedId) {
        query = query.where('userBreedId', '==', params.userBreedId);
      }

      const snapshot = await query.get();
      const fetchedListings = snapshot.docs.map(
        (doc) => ({id: doc.id, ...doc.data()} as Listing)
      );
      setListings(fetchedListings);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching listings:', err);
    }
    setLoading(false);
  };

  const addListing = async (listing: Omit<Listing, 'id'>) => {
    try {
      const docRef = await firestore().collection('listings').add(listing);
      const newListing = {id: docRef.id, ...listing};
      setListings((prev) => [...prev, newListing]);
      return newListing;
    } catch (err: any) {
      setError(err.message);
      console.error('Error adding listing:', err);
      throw err;
    }
  };

  const updateListing = async (id: string, updatedData: Partial<Listing>) => {
    try {
      await firestore().collection('listings').doc(id).update(updatedData);
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === id ? {...listing, ...updatedData} : listing
        )
      );
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating listing:', err);
      throw err;
    }
  };

  const deleteListing = async (id: string) => {
    try {
      await firestore().collection('listings').doc(id).delete();
      setListings((prev) => prev.filter((listing) => listing.id !== id));
    } catch (err: any) {
      setError(err.message);
      console.error('Error deleting listing:', err);
      throw err;
    }
  };

  return {
    listings,
    loading,
    error,
    fetchListings,
    addListing,
    updateListing,
    deleteListing,
  };
};
