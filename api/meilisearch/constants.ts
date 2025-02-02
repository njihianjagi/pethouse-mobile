export const INDICES = {
  breeds: 'doghouse-breeds',
  kennels: 'doghouse-kennels',
  listings: 'doghouse-listings',
} as const;

export const indexSettings = {
  [INDICES.breeds]: {
    searchableAttributes: [
      'name',
      'description',
      'breedGroup',
      'size',
      'careRequirements',
    ],
    filterableAttributes: ['breedGroup', 'size', 'traits.*.score'],
    sortableAttributes: ['name'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'exactness'],
  },
  [INDICES.kennels]: {
    searchableAttributes: ['name', 'location', 'services', 'description'],
    filterableAttributes: ['services', 'location', 'userId'],
    sortableAttributes: ['name', 'createdAt'],
    rankingRules: ['words', 'typo', 'proximity', 'attribute', 'exactness'],
  },
  [INDICES.listings]: {
    searchableAttributes: [
      'title',
      'description',
      'breedName',
      'kennelName',
      'location',
    ],
    filterableAttributes: [
      'status',
      'breedId',
      'kennelId',
      'price',
      'breedName',
    ],
    sortableAttributes: ['price', 'createdAt'],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
  },
};
