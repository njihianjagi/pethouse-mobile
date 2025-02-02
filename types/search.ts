// types/search.ts

export interface BaseSearchDocument {
  id: string;
  createdAt: number;
  updatedAt?: number;
}

export interface BreedSearchDocument extends BaseSearchDocument {
  name: string;
  description: string;
  breedGroup: string;
  height: string;
  weight: string;
  lifeSpan: string;
  traits: Record<string, any>;
  size?: string;
  careRequirements?: string[];
  images?: string[];
}

export interface KennelSearchDocument extends BaseSearchDocument {
  name: string;
  location: string;
  userId: string;
  services?: string[];
}

export interface ListingSearchDocument extends BaseSearchDocument {
  title: string;
  description?: string;
  price?: number;
  breedId: string;
  breedName: string;
  kennelId: string;
  kennelName: string;
  location?: string;
  images?: string[];
  status: 'active' | 'sold' | 'reserved';
}
