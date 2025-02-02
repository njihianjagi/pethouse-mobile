import {liteClient} from 'algoliasearch/lite';

// Check if environment variables are set
if (!process.env.EXPO_PUBLIC_ALGOLIA_APP_ID) {
  console.error(
    'EXPO_PUBLIC_ALGOLIA_APP_ID is not set in environment variables'
  );
}
if (!process.env.EXPO_PUBLIC_ALGOLIA_API_KEY) {
  console.error(
    'EXPO_PUBLIC_ALGOLIA_API_KEY is not set in environment variables'
  );
}

export const ALGOLIA_APP_ID = process.env.EXPO_PUBLIC_ALGOLIA_APP_ID as string;
export const ALGOLIA_API_KEY = process.env
  .EXPO_PUBLIC_ALGOLIA_API_KEY as string;

// Initialize the Algolia client
export const searchClient = liteClient(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
