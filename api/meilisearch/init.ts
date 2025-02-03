// api/meilisearch/init.ts

import {client, INDICES, indexSettings} from './constants';

export async function initializeIndices() {
  const results: any = [];

  for (const [name, settings] of Object.entries(indexSettings)) {
    try {
      const index = client.index(name);
      await index.updateSettings(settings);
      results.push({
        index: name,
        success: true,
      });
    } catch (error: any) {
      results.push({
        index: name,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

// Helper function to reset indices (useful for development)
export async function resetIndices() {
  const results: any = [];

  for (const name of Object.values(INDICES)) {
    try {
      const index = client.index(name);
      await index.deleteAllDocuments();
      results.push({
        index: name,
        success: true,
      });
    } catch (error: any) {
      results.push({
        index: name,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}

// Function to check index health
export async function checkIndicesHealth() {
  const results: any = [];

  for (const name of Object.values(INDICES)) {
    try {
      const index = client.index(name);
      const stats = await index.getStats();
      results.push({
        index: name,
        success: true,
        stats,
      });
    } catch (error: any) {
      results.push({
        index: name,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
}
