import {useState, useEffect} from 'react';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {db} from '../../../firebase/config';

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
  parents: Parents;
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
    vaccinations: VaccinationRecord[];
    dewormings: DewormingRecord[];
    vetChecks: VetCheckRecord[];
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

export interface ParentInfo {
  name: string;
  registration: string;
  registryType: 'AKC' | 'UKC' | 'CKC' | 'other';
  breed: {
    id: string;
    name: string;
    variety?: string; // For breeds with multiple varieties
  };
  color: string;
  dateOfBirth?: string;
  healthTesting: {
    dna: boolean;
    hips: boolean;
    elbows: boolean;
    eyes: boolean;
    heart: boolean;
    other?: string[];
    certificates?: {
      type: string;
      number: string;
      date: string;
      expiryDate?: string;
    }[];
  };
  titles?: string[]; // Championship titles, etc.
  images: string[];
  isCoOwned: boolean;
  isExternal?: boolean; // For stud services/external sires
}

interface Parents {
  sire: ParentInfo;
  dam: ParentInfo;
}

export interface BaseHealthRecord {
  type: string;
  label: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

export interface VaccinationRecord extends BaseHealthRecord {
  type: 'dhpp_1' | 'dhpp_2' | 'dhpp_3' | 'bordetella';
}

export interface DewormingRecord extends BaseHealthRecord {
  type: 'deworming_1' | 'deworming_2' | 'deworming_3' | 'deworming_4';
  product?: string;
}

export interface VetCheckRecord extends BaseHealthRecord {
  type: 'newborn' | 'two_week' | 'four_week' | 'six_week' | 'final';
  weight?: number;
}

// Define the schedules as arrays
export const HEALTH_SCHEDULES = {
  vaccinations: [
    {
      type: 'dhpp_1',
      label: 'DHPP (1st)',
      description: 'Distemper, Hepatitis, Parainfluenza, Parvovirus',
      weekAfterBirth: 6,
      required: true,
    },
    {
      type: 'dhpp_2',
      label: 'DHPP (2nd)',
      weekAfterBirth: 8,
      required: true,
    },
    {
      type: 'dhpp_3',
      label: 'DHPP (3rd)',
      weekAfterBirth: 12,
      required: true,
    },
    {
      type: 'bordetella',
      label: 'Bordetella',
      description: 'Kennel Cough',
      weekAfterBirth: 8,
      required: false,
    },
  ],
  dewormings: [
    {
      type: 'deworming_1',
      label: 'First Deworming',
      weekAfterBirth: 2,
      required: true,
    },
    {
      type: 'deworming_2',
      label: 'Second Deworming',
      weekAfterBirth: 4,
      required: true,
    },
    {
      type: 'deworming_3',
      label: 'Third Deworming',
      weekAfterBirth: 6,
      required: true,
    },
    {
      type: 'deworming_4',
      label: 'Fourth Deworming',
      weekAfterBirth: 8,
      required: true,
    },
  ],
  vetChecks: [
    {
      type: 'newborn',
      label: 'Newborn Check',
      dayAfterBirth: 1,
      required: true,
    },
    {
      type: 'two_week',
      label: '2-Week Check',
      weekAfterBirth: 2,
      required: true,
    },
    {
      type: 'four_week',
      label: '4-Week Check',
      weekAfterBirth: 4,
      required: true,
    },
    {
      type: 'six_week',
      label: '6-Week Check',
      weekAfterBirth: 6,
      required: true,
    },
    {
      type: 'final',
      label: 'Final Check',
      weekAfterBirth: 8,
      required: true,
    },
  ],
} as const;

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
