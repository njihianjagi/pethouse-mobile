import {observable, syncState, when} from '@legendapp/state';
import {configureSynced, synced} from '@legendapp/state/sync';
import {observablePersistAsyncStorage} from '@legendapp/state/persist-plugins/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {enableReactTracking} from '@legendapp/state/config/enableReactTracking';
import {Breed, UserBreed} from '../api/firebase/breeds/useBreedData';
import {ActivityLog} from '../api/firebase/activity_logs/useActivityLogData';
import {Listing} from '../api/firebase/listings/useListingData';
import {BreedFilters} from '../hooks/useBreedSearch';
import {User} from '../api/firebase/auth/authClient';
import {Litter} from '../api/firebase/litters/useLitterData';

// Enable React tracking
enableReactTracking({
  auto: true,
});

// Configure synced persistence
const mySynced = configureSynced(synced, {
  persist: {
    plugin: observablePersistAsyncStorage({
      AsyncStorage,
    }),
  },
});

// Auth Store
export const authStore = observable({
  isAuthenticated: mySynced({
    initial: false,
    persist: {
      name: 'auth-authenticated',
      retrySync: true,
    },
  }),
  shouldShowOnboardingFlow: mySynced({
    initial: true,
    persist: {
      name: 'auth-onboarding',
      retrySync: true,
    },
  }),
  user: mySynced({
    initial: null as User | null,
    persist: {name: 'auth-user'},
  }),
});

// Breed Store
export const breedStore = observable({
  breeds: mySynced({
    initial: [] as Breed[],
    persist: {name: 'breeds-list'},
  }),
  filters: mySynced({
    initial: {
      searchText: '',
      traitPreferences: {},
      sortOption: 'nameAsc',
      page: 1,
    } as BreedFilters,
    persist: {name: 'breeds-filters'},
  }),
  loading: false,
  hasMore: true,
  totalMatches: 0,
});

// Activity Store
export const activityStore = observable({
  logs: mySynced({
    initial: [] as ActivityLog[],
    persist: {name: 'activity-logs'},
  }),
  loading: false,
  error: null as string | null,
});

// Listing Store
export const listingStore = observable({
  listings: mySynced({
    initial: [] as Listing[],
    persist: {name: 'listings-list'},
  }),
  filters: mySynced({
    initial: {
      breed: '',
      location: '',
      ageRange: null,
      sortBy: 'recent',
    },
    persist: {name: 'listings-filters'},
  }),
  loading: false,
  error: null as string | null,
});

// Litter Store
export const litterStore = observable({
  litters: mySynced({
    initial: [] as Litter[],
    persist: {name: 'litters-list'},
  }),
  loading: false,
  error: null as string | null,
});

// Export all stores
export const stores = {
  auth: authStore,
  breeds: breedStore,
  listings: listingStore,
  litters: litterStore,
};

export const checkPersistenceLoaded = async () => {
  // Wait for all stores to load
  await Promise.all([
    when(syncState(stores.auth).isPersistLoaded),
    when(syncState(stores.breeds).isPersistLoaded),
    when(syncState(stores.listings).isPersistLoaded),
    when(syncState(stores.litters).isPersistLoaded),
  ]);
  return true;
};

// Add this helper function
export const debugPersistence = () => {
  const state$ = syncState(authStore);
  console.log({
    isPersistLoaded: state$.isPersistLoaded.get(),
    shouldShowOnboarding: authStore.shouldShowOnboardingFlow.get(),
    isAuthenticated: authStore.isAuthenticated.get(),
    user: authStore.user.get(),
  });
};
