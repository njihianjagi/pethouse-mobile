import {db} from '../../../firebase/config';
import {getUnixTimeStamp} from '../../../helpers/timeFormat';
import {UserBreed} from '../breeds/useBreedData';

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
  rating?: number;
  reviewCount?: number;
}

export interface BreederProfile extends BaseUser {
  role: 'breeder';

  kennel: {
    name: string;
    yearsOfExperience: number;
    website?: string;
    description?: string;
    primaryBreeds: UserBreed[];
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
    images: {
      id: string;
      url: string;
      type: 'profile' | 'dogs';
    }[];
    registrationStatus: 'pending' | 'verified';
    contact: {
      socialMedia?: {
        instagram?: string;
        facebook?: string;
      };
      primaryVetContact?: string;
    };
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
    // movingPlans: boolean;
    // movingTimeframe?: string;
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
  preferredBreeds: UserBreed[];
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

export const updateUser = async (
  userID,
  newData: BaseUser | BreederProfile | SeekerProfile
) => {
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
