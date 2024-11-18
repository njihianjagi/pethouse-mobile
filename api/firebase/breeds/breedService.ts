import {useEffect, useState} from 'react';
import {db} from '../../../firebase/config'; // Adjust the path as necessary
import breedsData from '../../../assets/data/breeds_with_group_and_traits.json';
import {FirebaseError} from '@firebase/util'; // Update import

const allBreeds: any[] = breedsData;

export interface Breed {
  id?: string;
  name: string;
  description: string;
  breedGroup: string;
  height: string;
  weight: string;
  lifeSpan: string;
  traits: {
    [traitGroup: string]: {
      score: number;
      traits: {
        name: string;
        score: number;
      };
    };
  };
  size?: string;
  careRequirements?: string[];
  images?: string[];
  image: string;
  // createdAt: timestamp;
  // modifiedAt: timestamp;
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

export class BreedError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

export const breedService = {
  fetchBreeds: async (params?: {limit?: number; page?: number}) => {
    try {
      let query: any = db.collection('breeds');
      // Handle pagination
      const limit = params?.limit || 10;
      const offset = ((params?.page || 1) - 1) * limit;

      query = query.orderBy('createdAt', 'desc').limit(limit).offset(offset);

      const snapshot = await query.get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      if (error instanceof FirebaseError) {
        // ... error handling
      }
      throw error;
    }
  },

  findBreedByName: (breedName: string): Breed | undefined => {
    const breed = allBreeds.find(
      (breed) => breed.name.toLowerCase() === breedName.toLowerCase()
    );
    return breed;
  },

  fetchBreedByName: async (breedName: string): Promise<Breed | null> => {
    try {
      const breedRef = db.collection('breeds').where('name', '==', breedName);
      const snapshot = await breedRef.get();

      if (snapshot.empty) {
        console.log('No matching breed found');
        return null;
      }

      const breedDoc = snapshot.docs[0];
      const breed = {id: breedDoc.id, ...breedDoc.data()} as Breed;
      return breed;
    } catch (err: any) {
      console.error('Error fetching breed by name:', err);
      return null;
    }
  },

  fetchBreedById: async (breedId: string): Promise<Breed | null> => {
    try {
      const breedDoc = await db.collection('breeds').doc(breedId).get();
      if (breedDoc.exists) {
        return {id: breedDoc.id, ...breedDoc.data()} as Breed;
      }
      return null;
    } catch (err: any) {
      console.error('Error fetching breed by ID:', err);
      return null;
    }
  },

  fetchUserBreeds: async (userId: string) => {
    try {
      const userBreedsSnapshot = await db
        .collection('user_breeds')
        .where('userId', '==', userId)
        .get();

      return userBreedsSnapshot.docs.map(
        (doc) => ({id: doc.id, ...doc.data()} as UserBreed)
      );
    } catch (err: any) {
      console.error('Error fetching user breeds:', err);
    }
  },

  fetchUserBreedById: async (
    userBreedId: string
  ): Promise<UserBreed | null> => {
    try {
      const userBreedDoc = await db
        .collection('user_breeds')
        .doc(userBreedId)
        .get();
      if (userBreedDoc.exists) {
        return {
          id: userBreedDoc.id,
          ...userBreedDoc.data(),
        } as UserBreed;
      } else {
        return null;
      }
    } catch (err: any) {
      console.error('Error fetching user breed by ID:', err);
      return null;
    }
  },

  addUserBreed: async (userBreed: Omit<UserBreed, 'id'>) => {
    try {
      const docRef = await db.collection('user_breeds').add(userBreed);
      const newUserBreed = {id: docRef.id, ...userBreed};
      return newUserBreed;
    } catch (err: any) {
      console.error('Error adding user breed:', err);
      return null;
    }
  },

  updateUserBreed: async (id: string, updatedData: Partial<UserBreed>) => {
    try {
      await db.collection('user_breeds').doc(id).update(updatedData);
    } catch (err: any) {
      console.error('Error updating user breed:', err);
    }
  },

  deleteUserBreed: async (id: string) => {
    try {
      await db.collection('user_breeds').doc(id).delete();
    } catch (err: any) {
      console.error('Error deleting user breed:', err);
    }
  },

  fetchUserBreedsByBreedId: async (breedId: string) => {
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
    } catch (err: any) {
      console.error('Error fetching user breeds:', err);
    }
  },
};
