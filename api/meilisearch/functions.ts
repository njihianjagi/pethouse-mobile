// functions/src/meilisearch/index.ts

import * as functions from '../../firebase/config';
import {MeiliSearch} from 'meilisearch';
import {db} from '../../firebase/config';

const MEILISEARCH_HOST =
  process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_ADMIN_KEY || '';

const client = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

const INDICES = {
  breeds: 'doghouse-breeds',
  kennels: 'doghouse-kennels',
  listings: 'doghouse-listings',
} as const;

// Batch processing functions
async function batchSyncBreeds(lastDocId?: string, limit = 100) {
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

async function batchSyncKennels(lastDocId?: string, limit = 100) {
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

async function batchSyncListings(lastDocId?: string, limit = 100) {
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

// Main sync function
export const syncMeilisearchIndices = functions.https.onCall(
  async (data, context) => {
    try {
      const stats = {
        breeds: 0,
        kennels: 0,
        listings: 0,
      };

      // Sync breeds with pagination
      let breedSync = {done: false, lastId: null as string | null};
      while (!breedSync.done) {
        breedSync = await batchSyncBreeds(breedSync.lastId!);
        stats.breeds += 100;
        console.log(`Processed ${stats.breeds} breeds`);
      }

      // Sync kennels with pagination
      let kennelSync = {done: false, lastId: null as string | null};
      while (!kennelSync.done) {
        kennelSync = await batchSyncKennels(kennelSync.lastId!);
        stats.kennels += 100;
        console.log(`Processed ${stats.kennels} kennels`);
      }

      // Sync listings with pagination
      let listingSync = {done: false, lastId: null as string | null};
      while (!listingSync.done) {
        listingSync = await batchSyncListings(listingSync.lastId!);
        stats.listings += 100;
        console.log(`Processed ${stats.listings} listings`);
      }

      return {
        success: true,
        stats,
      };
    } catch (error: any) {
      console.error('Sync failed:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  }
);

// Firestore triggers for real-time updates
export const onBreedChanged = functions.firestore
  .document('breeds/{breedId}')
  .onWrite(async (change, context) => {
    const index = client.index(INDICES.breeds);

    if (!change.after.exists) {
      // Document was deleted
      await index.deleteDocument(context.params.breedId);
    } else {
      // Document was created or updated
      const data = change.after.data();
      await index.updateDocuments([
        {
          id: context.params.breedId,
          ...data,
          updatedAt: Date.now(),
        },
      ]);
    }
  });

export const onKennelChanged = functions.firestore
  .document('kennels/{kennelId}')
  .onWrite(async (change, context) => {
    const index = client.index(INDICES.kennels);

    if (!change.after.exists) {
      await index.deleteDocument(context.params.kennelId);
    } else {
      const data = change.after.data();
      await index.updateDocuments([
        {
          id: context.params.kennelId,
          ...data,
          updatedAt: Date.now(),
        },
      ]);
    }
  });

export const onListingChanged = functions.firestore
  .document('listings/{listingId}')
  .onWrite(async (change, context) => {
    const index = client.index(INDICES.listings);

    if (!change.after.exists) {
      await index.deleteDocument(context.params.listingId);
    } else {
      const data = change.after.data();
      await index.updateDocuments([
        {
          id: context.params.listingId,
          ...data,
          updatedAt: Date.now(),
        },
      ]);
    }
  });
