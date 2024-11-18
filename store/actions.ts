import {User} from '../api/firebase/auth/authClient';
import {Breed} from '../api/firebase/breeds/useBreedData';
import {Listing} from '../api/firebase/listings/useListingData';
import {Litter} from '../api/firebase/litters/useLitterData';
import {BreedFilters} from '../hooks/useBreedSearch';
import {authStore, breedStore, listingStore, litterStore} from './index';

// Auth actions
export const authActions = {
  setUser: (user: User | null) => {
    authStore.user.set(user);
    authStore.isAuthenticated.set(!!user);
  },

  setShouldShowOnboardingFlow: (shouldShow) => {
    authStore.shouldShowOnboardingFlow.set(shouldShow);
  },

  updateUserPreferences: (preferences: Record<string, any>) => {
    authStore.user.traitPreferences.set(preferences);
  },

  logout: () => {
    authStore.set({
      user: null,
      isAuthenticated: false,
      shouldShowOnboardingFlow: true,
    });
  },
};

// Breed actions
export const breedActions = {
  setBreeds: (breeds: Breed[]) => {
    breedStore.breeds.set(breeds);
  },

  updateFilter: (key: keyof BreedFilters, value: any) => {
    breedStore.filters.set({...breedStore.filters.get(), [key]: value});
  },

  setLoading: (loading: boolean) => {
    breedStore.loading.set(loading);
  },
};

// Add to existing actions file
export const listingActions = {
  setListings: (listings: Listing[]) => {
    listingStore.listings.set(listings);
  },

  setLoading: (loading: boolean) => {
    listingStore.loading.set(loading);
  },
};

export const litterActions = {
  setLitters: (litters: Litter[]) => {
    litterStore.litters.set(litters);
  },

  setLoading: (loading: boolean) => {
    litterStore.loading.set(loading);
  },
};
