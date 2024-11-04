import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';
import {FirebaseError} from 'firebase/app';

export interface Litter {
  id: string;
  userId: string;
  userBreedId: string;
  breedId: string;
  breedName: string; // Denormalized for filtering/display
  name: string;
  birthDate: string;
  availableDate: string;
  numberOfPuppies: number;
  availablePuppies: number;
  price?: number;
  status: 'upcoming' | 'available' | 'reserved' | 'sold';
  media: {
    images: string[];
    videos: string[];
  };
  location: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  modifiedAt: FirebaseFirestoreTypes.Timestamp;
}

export class LitterError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export const litterService = {
  fetchLitters: async (params?: {kennelId?: string; status?: string}) => {
    try {
      let query: any = db.collection('litters');

      if (params?.kennelId) {
        query = query.where('kennelId', '==', params.kennelId);
      }
      if (params?.status) {
        query = query.where('status', '==', params.status);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        expectedDate: doc.data().expectedDate?.toDate(), // Convert Firestore timestamp
      })) as Litter[];
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'permission-denied':
            throw new LitterError(
              'You do not have permission to access these litters',
              'permission-denied'
            );
          case 'not-found':
            throw new LitterError(
              'The requested litters do not exist',
              'not-found'
            );
          default:
            throw new LitterError('Failed to fetch litters', 'network-error');
        }
      }
      throw error;
    }
  },

  fetchLitterById: async (id: string) => {
    try {
      const doc = await db.collection('litters').doc(id).get();
      if (!doc.exists) {
        throw new LitterError('Litter not found', 'not-found');
      }
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        expectedDate: data?.expectedDate?.toDate(),
      };
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new LitterError('Failed to fetch litter', 'fetch-error');
      }
      throw error;
    }
  },

  createLitter: async (litter: Omit<Litter, 'id'>) => {
    try {
      const docRef = await db.collection('litters').add(litter);
      const newLitter = {id: docRef.id, ...litter};
      return newLitter;
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        throw new LitterError('Failed to fetch litter', 'fetch-error');
      }
      throw error;
    }
  },

  updateLitter: async (id: string, updatedData: Partial<Litter>) => {
    try {
      await db.collection('litters').doc(id).update(updatedData);
      const updatedLitter = {id, ...updatedData};
      return updatedLitter;
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        throw new LitterError('Failed to fetch litter', 'fetch-error');
      }
      throw error;
    }
  },

  deleteLitter: async (id: string) => {
    try {
      await db.collection('litters').doc(id).delete();
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        throw new LitterError('Failed to fetch litter', 'fetch-error');
      }
      throw error;
    }
  },
};
