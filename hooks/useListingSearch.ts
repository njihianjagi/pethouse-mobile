import {useState, useEffect, useMemo, useCallback} from 'react';
import {
  LitterListing,
  AdoptionListing,
  WantedListing,
  useListingData,
  Listing,
} from '../api/firebase/listings/useListingData';
import {debounce} from 'tamagui';

interface UseListingSearchProps {
  initialFilters?: {
    type?: 'puppy' | 'litter' | 'wanted';
    breed?: string;
    priceRange?: {
      min: number;
      max: number;
    };
    sex?: 'male' | 'female' | 'either';
    age?: {
      min: number;
      max: number;
    };
    registration?: boolean;
    health?: {
      vaccinated?: boolean;
      dewormed?: boolean;
      microchipped?: boolean;
      healthTested?: boolean;
    };
  };
}

export const useListingSearch = (props?: UseListingSearchProps) => {
  const [filters, setFilters] = useState(props?.initialFilters || {});
  const [sortBy, setSortBy] = useState<{
    field: keyof Listing;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalMatches, setTotalMatches] = useState(0);
  const [filteredListings, setFilteredListings] = useState<Array<any>>([]);

  const {loading, error, listings, fetchListings} = useListingData();
  const listingsPerPage = 8;

  const sortedListings = useMemo(() => {
    if (!sortBy) return listings;

    return [...listings].sort((a, b) => {
      const aVal = a[sortBy.field as any];
      const bVal = b[sortBy.field as any];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortBy.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortBy.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [listings, sortBy]);

  const filterListings = useMemo(
    () =>
      debounce((currentFilters: typeof filters, currentPage: number) => {
        const filtered = sortedListings.filter((listing) => {
          // Type filter
          if (currentFilters.type && listing.type !== currentFilters.type)
            return false;

          // Breed filter
          if (
            currentFilters.breed &&
            listing.breed.breedId !== currentFilters.breed
          )
            return false;

          // Price range filter
          if (currentFilters.priceRange) {
            const price = 'price' in listing ? listing.price : 0;
            if (
              (typeof price === 'number' &&
                (price < currentFilters.priceRange.min ||
                  price > currentFilters.priceRange.max)) ||
              (typeof price === 'object' &&
                (price.base < currentFilters.priceRange.min ||
                  price.base > currentFilters.priceRange.max))
            ) {
              return false;
            }
          }

          // Health requirements filter
          if (currentFilters.health && 'health' in listing) {
            for (const [key, required] of Object.entries(
              currentFilters.health
            )) {
              if (required && !listing.health[key]) return false;
            }
          }

          return true;
        });

        const start = (currentPage - 1) * listingsPerPage;
        const end = start + listingsPerPage;
        const paginatedListings = filtered.slice(0, end);

        setFilteredListings(paginatedListings);
        setHasMore(filtered.length > end);
        setTotalMatches(filtered.length);
      }, 300),
    [sortedListings]
  );

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
      filterListings(filters, page + 1);
    }
  }, [hasMore, loading, page, filterListings, filters]);

  useEffect(() => {
    filterListings(filters, page);

    return () => {
      filterListings.cancel();
    };
  }, [filters, page, filterListings]);

  const handleRefresh = () => {
    fetchListings({});
  };

  return {
    listings: filteredListings,
    loading,
    error,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    loadMore,
    hasMore,
    totalMatches,
    handleRefresh,
  };
};
