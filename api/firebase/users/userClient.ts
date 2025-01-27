import {db} from '../../../firebase/config';
import {getUnixTimeStamp} from '../../../helpers/timeFormat';

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'breeder' | 'seeker';
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'suspended';
  profileComplete: boolean;
}

export interface BreederProfile extends BaseUser {
  role: 'breeder';

  rating?: number;
  reviewCount?: number;

  images: {
    id: string;
    url: string;
    type: 'profile' | 'dogs';
  }[];

  kennel: {
    name: string;
    yearsOfExperience: number;
    website?: string;
    description?: string;
    primaryBreeds: string[];
    facilityType: 'home' | 'dedicated_facility';
    location?: {
      name: string;
      address: string;
      city: string;
      state: string;
      country: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
  };

  breeding: {
    healthTestingCompleted: boolean;
    registrationStatus: 'pending' | 'verified';
  };

  contact: {
    socialMedia?: {
      instagram?: string;
      facebook?: string;
    };
    primaryVetContact?: string;
  };
}

export interface SeekerProfile extends BaseUser {
  role: 'seeker';
  housing: {
    type: 'own' | 'rent' | 'live_with_parents';
    hasLandlordApproval?: boolean;
    landlordContact?: string;
    propertyType: 'house' | 'apartment' | 'condo' | 'other';
    yard: {
      hasYard: boolean;
      isFenced?: boolean;
      fenceHeight?: number;
      yardSize?: 'small' | 'medium' | 'large';
    };
    movingPlans: boolean;
    movingTimeframe?: string;
  };
  household: {
    adults: number;
    children: number;
    childrenAges?: number[];
    hasAllergies: boolean;
    allergyDetails?: string;
    familyAgreement: boolean;
  };
  lifestyle: {
    workSchedule: 'work_from_home' | 'part_time' | 'full_time';
    hoursAlonePerDay: number;
    activityLevel: 'sedentary' | 'moderate' | 'active' | 'very_active';
    travelFrequency: 'rarely' | 'occasionally' | 'frequently';
  };
  experience: {
    currentPets: {
      type: string;
      breed?: string;
      age: number;
      spayedNeutered: boolean;
      upToDateVaccinations: boolean;
    }[];
    previousPets: {
      type: string;
      yearsOwned: number;
      whatHappened: string;
    }[];
    dogExperience: 'first_time' | 'some_experience' | 'experienced';
    breedExperience?: string[];
    trainingExperience?: string[];
  };
  preferences: {
    breedPreferences: {
      breedId: string;
      breedName: string;
      isRequired: boolean;
    }[];
    ageRange: {
      min: number;
      max: number;
    };
    gender: 'male' | 'female' | 'either';
    timeline: 'immediate' | '1-3_months' | '3-6_months' | '6+_months';
    priceRange: {
      min: number;
      max: number;
    };
  };
  veterinary: {
    hasVeterinarian: boolean;
    veterinarian?: {
      name: string;
      clinic: string;
      phone: string;
      email?: string;
    };
  };
  references: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }[];
}

export const usersRef = db.collection('users');

export const updateUser = async (userID, newData) => {
  const dataWithOnlineStatus = {
    ...newData,
    lastOnlineTimestamp: getUnixTimeStamp(),
  };
  try {
    await usersRef.doc(userID).update({...dataWithOnlineStatus});
    const updatedUser = await usersRef.doc(userID).get();

    return {success: true, user: updatedUser.data()};
  } catch (error) {
    return error;
  }
};

export const getUserByID = async (userID) => {
  try {
    const document = await usersRef.doc(userID).get();
    if (document) {
      return document.data();
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updateProfilePhoto = async (userID, profilePictureURL) => {
  try {
    await usersRef.doc(userID).update({profilePictureURL: profilePictureURL});
    return {success: true};
  } catch (error) {
    console.log(error);
    return {error: error};
  }
};
