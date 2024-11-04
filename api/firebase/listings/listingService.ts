import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';
import {FirebaseError} from 'firebase/app';

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

export class ListingError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export const listingService = {
  fetchListings: async (params?: {userId?: string; kennelId?: string}) => {
    try {
      let query: any = db.collection('listings');

      if (params?.userId) {
        query = query.where('userId', '==', params.userId);
      }
      if (params?.kennelId) {
        query = query.where('kennelId', '==', params.kennelId);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Listing[];
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'permission-denied':
            throw new ListingError(
              'You do not have permission to access these listings',
              'permission-denied'
            );
          case 'not-found':
            throw new ListingError(
              'The requested listings do not exist',
              'not-found'
            );
          default:
            throw new ListingError('Failed to fetch listings', 'network-error');
        }
      }
      throw error;
    }
  },

  createListing: async (listing: Omit<Listing, 'id'>) => {
    try {
      const docRef = await db.collection('listings').add(listing);
      return {
        id: docRef.id,
        ...listing,
      };
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new ListingError('Failed to create listing', 'mutation-error');
      }
      throw error;
    }
  },

  updateListing: async (id: string, data: Partial<Listing>) => {
    try {
      await db.collection('listings').doc(id).update(data);
      return {id, ...data};
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new ListingError('Failed to update listing', 'mutation-error');
      }
      throw error;
    }
  },

  deleteListing: async (id: string) => {
    try {
      await db.collection('listings').doc(id).delete();
      return id;
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new ListingError('Failed to delete listing', 'mutation-error');
      }
      throw error;
    }
  },
};
