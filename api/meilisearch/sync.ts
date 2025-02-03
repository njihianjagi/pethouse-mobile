// api/meilisearch/sync.ts

import {db, functions} from '../../firebase/config';
import {client, INDICES} from './constants';
import type {
  BreedSearchDocument,
  KennelSearchDocument,
  ListingSearchDocument,
} from '../../types/search';

// Batch processing functions with pagination
export async function batchSyncBreeds(lastDocId?: string, limit = 100) {
  const index = client.index(INDICES.breeds);
  let query = db.collection('breeds').orderBy('__name__').limit(limit);

  if (lastDocId) {
    const lastDoc = await db.collection('breeds').doc(lastDocId).get();
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();
  if (snapshot.empty) return {done: true, lastId: null};

  const breeds = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: Date.now(),
  }));

  await index.addDocuments(breeds);

  return {
    done: breeds.length < limit,
    lastId: snapshot.docs[snapshot.docs.length - 1].id,
  };
}

export async function batchSyncKennels(lastDocId?: string, limit = 100) {
  const index = client.index(INDICES.kennels);
  let query = db.collection('kennels').orderBy('__name__').limit(limit);

  if (lastDocId) {
    const lastDoc = await db.collection('kennels').doc(lastDocId).get();
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();
  if (snapshot.empty) return {done: true, lastId: null};

  const kennels = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: Date.now(),
  }));

  await index.addDocuments(kennels);

  return {
    done: kennels.length < limit,
    lastId: snapshot.docs[snapshot.docs.length - 1].id,
  };
}

export async function batchSyncListings(lastDocId?: string, limit = 100) {
  const index = client.index(INDICES.listings);
  let query = db.collection('listings').orderBy('__name__').limit(limit);

  if (lastDocId) {
    const lastDoc = await db.collection('listings').doc(lastDocId).get();
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();
  if (snapshot.empty) return {done: true, lastId: null};

  const listings = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: Date.now(),
  }));

  await index.addDocuments(listings);

  return {
    done: listings.length < limit,
    lastId: snapshot.docs[snapshot.docs.length - 1].id,
  };
}

// Initial data sync with progress tracking
export async function initialDataSync(
  progressCallback?: (progress: {
    entity: string;
    processed: number;
    total: number;
  }) => void
) {
  const stats = {
    breeds: 0,
    kennels: 0,
    listings: 0,
  };

  // Sync breeds
  let breedSync = {done: false, lastId: null as string | null};
  while (!breedSync.done) {
    breedSync = await batchSyncBreeds(breedSync.lastId!);
    stats.breeds += 100;
    progressCallback?.({
      entity: 'breeds',
      processed: stats.breeds,
      total: -1, // Unknown total
    });
  }

  // Sync kennels
  let kennelSync = {done: false, lastId: null as string | null};
  while (!kennelSync.done) {
    kennelSync = await batchSyncKennels(kennelSync.lastId!);
    stats.kennels += 100;
    progressCallback?.({
      entity: 'kennels',
      processed: stats.kennels,
      total: -1,
    });
  }

  // Sync listings
  let listingSync = {done: false, lastId: null as string | null};
  while (!listingSync.done) {
    listingSync = await batchSyncListings(listingSync.lastId!);
    stats.listings += 100;
    progressCallback?.({
      entity: 'listings',
      processed: stats.listings,
      total: -1,
    });
  }

  return stats;
}

// Update the cloud function definition
export const createSyncFunction = functions().httpsCallable(
  'syncMeilisearchIndices'
);

// And create a function to call it
export async function triggerSync() {
  try {
    const response = await createSyncFunction({});
    return response.data;
  } catch (error: any) {
    console.error('Sync failed:', error);
    throw error;
  }
}
