import {instantMeiliSearch} from '@meilisearch/instant-meilisearch';
import type {SearchClient} from 'instantsearch.js';

// Check if environment variables are set
if (!process.env.EXPO_PUBLIC_MEILISEARCH_HOST) {
  console.error(
    'EXPO_PUBLIC_MEILISEARCH_HOST is not set in environment variables'
  );
} else {
  console.info(process.env.EXPO_PUBLIC_MEILISEARCH_HOST);
}

if (!process.env.EXPO_PUBLIC_MEILISEARCH_API_KEY) {
  console.error(
    'EXPO_PUBLIC_MEILISEARCH_API_KEY is not set in environment variables'
  );
} else {
  console.info(process.env.EXPO_PUBLIC_MEILISEARCH_API_KEY);
}

export const MEILISEARCH_HOST = process.env.EXPO_PUBLIC_MEILISEARCH_HOST;
export const MEILISEARCH_API_KEY = process.env.EXPO_PUBLIC_MEILISEARCH_API_KEY;

const {searchClient: meiliSearchClient} = instantMeiliSearch(
  MEILISEARCH_HOST!,
  MEILISEARCH_API_KEY,
  {
    placeholderSearch: false,
    primaryKey: 'id',
  }
);

// Create a properly typed search client that implements the SearchClient interface
export const searchClient: SearchClient = {
  search: async (requests) => {
    try {
      const results = await (meiliSearchClient as any).search(requests);
      return results;
    } catch (error: any) {
      console.error('MeiliSearch search error:', error.message);
      throw error;
    }
  },
  searchForFacetValues: undefined,
};
