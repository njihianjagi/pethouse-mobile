import {useState, useEffect} from 'react';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';

// export interface Listing {
//   id: string;
//   userId: string;
//   userBreedId: string;
//   breedId: string;
//   breedName: string; // Denormalized for filtering/display
//   name: string;
//   sex: string;
//   age: string;
//   ageYears: number;
//   ageMonths: number;
//   price?: number;
//   type: 'adoption' | 'wanted';
//   status: 'available' | 'pending' | 'sold';
//   // traits: {
//   //   [traitName: string]: {
//   //     score: number;
//   //     description: string;
//   //   };
//   // };
//   media: {
//     images: string[];
//     videos: string[];
//   };
//   location: string;
//   medical: {
//     vaccinated: boolean;
//     dewormed: boolean;
//     neutered: boolean;
//     microchipped: boolean;
//     lastVetVisit: string;
//     healthCertificate: any;
//     medicalNotes: string;
//   };
//   createdAt?: FirebaseFirestoreTypes.Timestamp;
//   modifiedAt?: FirebaseFirestoreTypes.Timestamp;
// }

// interface BaseListing {
//   id: string;
//   userId: string;
//   createdAt: Date;
//   updatedAt: Date;
//   status: 'active' | 'pending' | 'completed' | 'cancelled';
//   breedId: string;
//   breedName: string;
// }

// export interface BreederListing extends BaseListing {
//   type: 'adoption';
//   name: string;
//   sex: 'male' | 'female';
//   ageYears: number;
//   ageMonths: number;
//   price: number;
//   media: {
//     images: {downloadURL: string; thumbnailURL: string}[];
//     videos: {downloadURL: string; thumbnailURL: string}[];
//   };
//   medical: {
//     vaccinated: boolean;
//     dewormed: boolean;
//     neutered: boolean;
//     microchipped: boolean;
//     lastVetVisit: string;
//     healthCertificate: {downloadURL: string; thumbnailURL: string}[];
//     medicalNotes: string;
//   };
//   training: {
//     houseTrained: boolean;
//     crateTraining: boolean;
//     basicCommands: boolean;
//     socialization: {
//       goodWithDogs: boolean;
//       goodWithCats: boolean;
//       goodWithChildren: boolean;
//       goodWithStrangers: boolean;
//     };
//     trainingNotes: string;
//   };
//   requirements: {
//     mustHaveYard: boolean;
//     minimumYardSize?: number;
//     noFirstTimeDogOwners?: boolean;
//     noSmallChildren?: boolean;
//     requiresCompanionDog?: boolean;
//     activityLevel: 'low' | 'moderate' | 'high';
//     additionalRequirements?: string;
//   };
// }

// export interface SeekerListing extends BaseListing {
//   type: 'wanted';
//   preferences: {
//     sex: 'male' | 'female' | 'any';
//     ageRange: {
//       min: number;
//       max: number;
//     };
//     priceRange: {
//       min: number;
//       max: number;
//     };
//     lifestyle: {
//       hoursAlonePerDay: number;
//       livingArrangement: 'apartment' | 'house' | 'other';
//       hasYard: boolean;
//       yardDetails?: {
//         isFenced: boolean;
//         size: 'small' | 'medium' | 'large';
//       };
//       activityLevel: 'low' | 'moderate' | 'high';
//       primaryPurpose: 'companion' | 'breeding' | 'showing' | 'working';
//     };
//     experience: {
//       hasDogExperience: boolean;
//       hasBreedExperience: boolean;
//       currentPets: boolean;
//       petDetails?: string;
//     };
//     training: {
//       willingToTrain: boolean;
//       plannedTrainingMethod?: string;
//       trainingGoals?: string[];
//     };
//   };
// }

export interface BaseListing {
  id?: string;
  userId: string;
  // status: 'draft' | 'active' | 'pending' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  location: string;
}

export interface AdoptionListing extends BaseListing {
  type: 'adoption';
  breed: {
    breedId: string;
    breedName: string;
  };
  name: string;
  sex: 'male' | 'female';
  dateOfBirth: Date;
  color: string;
  status: 'available' | 'reserved' | 'closed';
  price: {
    base: number;
    withBreedingRights?: number;
    deposit: number;
    depositRefundable: boolean;
  };
  registration: {
    type: 'limited' | 'full';
    organization: string;
    number?: string;
  };
  health: {
    vaccinated: boolean;
    dewormed: boolean;
    microchipped: boolean;
    vetChecked: boolean;
    healthCertificate?: string[];
    medicalNotes?: string;
  };
  training: {
    houseTrained: boolean;
    crateTrained: boolean;
    basicCommands: boolean;
    additionalTraining?: string;
  };
  requirements: {
    application: boolean;
    contract: boolean;
    spayNeuter: boolean;
    returnPolicy: boolean;
    homeCheck: boolean;
    references: boolean;
    experience: boolean;
    yard: boolean;
    fence: boolean;
    otherPets: 'allowed' | 'no-dogs' | 'no-cats' | 'none';
    children: 'allowed' | 'no-young-children' | 'none';
  };
  images: any;
  videos?: any;
  media: {
    images: {
      downloadURL: string;
      thumbnailURL: string;
      caption?: string;
      date: Date;
    }[];
    videos: {
      downloadURL: string;
      thumbnailURL: string;
      caption?: string;
      date: Date;
    }[];
  };
  description: string;
}

export type Listing = AdoptionListing | LitterListing | WantedListing;

export interface LitterListing extends BaseListing {
  type: 'litter';
  breed: {
    breedId: string;
    breedName: string;
  };
  status: 'upcoming' | 'born' | 'available' | 'reserved' | 'closed';
  expectedDate: Date;
  actualDate?: Date;
  puppyCount: {
    male: number;
    female: number;
    available: number;
    reserved: number;
  };
  price: {
    base: number;
    withBreedingRights?: number;
    deposit: number;
    depositRefundable: boolean;
    withRegistration?: number;
  };
  registration: {
    type: 'limited' | 'full' | 'both';
    organization: string;
  };
  health: {
    dna: boolean;
    hips: boolean;
    eyes: boolean;
    heart: boolean;
    certificates?: string[];
  };
  requirements: {
    application: boolean;
    contract: boolean;
    spayNeuter: boolean;
    returnPolicy: boolean;
    homeCheck: boolean;
    references: boolean;
    experience: boolean;
    yard: boolean;
    fence: boolean;
    otherPets: 'allowed' | 'no-dogs' | 'no-cats' | 'none';
    children: 'allowed' | 'no-young-children' | 'none';
  };
  images: string[];
  description: string;
  media: {
    images: {
      downloadURL: string;
      thumbnailURL: string;
      caption?: string;
      date: Date;
    }[];
    videos: {
      downloadURL: string;
      thumbnailURL: string;
      caption?: string;
      date: Date;
    }[];
  };
}

export interface WantedListing extends BaseListing {
  type: 'wanted';
  breed: {
    breedId: string;
    breedName: string;
    isRequired: boolean;
  };
  status: 'searching' | 'found' | 'closed';
  preferences: {
    sex: 'male' | 'female' | 'either';
    ageRange: {
      min: number;
      max: number;
    };
    priceRange: {
      min: number;
      max: number;
    };
    timeline: 'immediate' | '1-3_months' | '3-6_months' | '6+_months';
    registration: {
      required: boolean;
      type?: 'limited' | 'full' | 'either';
    };
    health: {
      vaccinated: boolean;
      dewormed: boolean;
      microchipped: boolean;
      healthTested: boolean;
    };
    training: {
      houseTrained: boolean;
      crateTrained: boolean;
      basicCommands: boolean;
    };
  };
  situation: {
    hasYard: boolean;
    hasFence: boolean;
    hasChildren: boolean;
    childrenAges?: number[];
    hasOtherPets: boolean;
    otherPets?: Array<{
      type: string;
      details: string;
    }>;
    hoursAlone: number;
    experience: 'first_time' | 'some_experience' | 'experienced';
  };
  description: string;
}

export const useListingData = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);

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
      setLoading(false);
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
      setListings((prev) => [...prev, newListing as Listing]);
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
          listing.id === id
            ? {...listing, ...(updatedData as Listing)}
            : listing
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
