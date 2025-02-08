import {useState, useCallback, useMemo, useEffect} from 'react';
import allBreeds from '../assets/data/breeds_with_group_and_traits.json';
import {Breed} from '../api/firebase/breeds/useBreedData';
import {debounce} from 'tamagui';

export interface BreedFilters {
  searchText: string;
  traitPreferences: Record<string, TraitPreferences>;
  sortOption: 'nameAsc' | 'nameDesc' | 'popular' | 'available';
  page: number;
}

export interface TraitPreferences {
  [key: string]: boolean | number;
}

export interface TraitGroup {
  name: string;
  score: number;
  traits: Array<{
    name: string;
    score: number;
  }>;
}

export const useBreedSearch = () => {
  const [searchText, setSearchText] = useState('');
  const [traitPreferences, setTraitPreferences] = useState<TraitPreferences>(
    {}
  );
  const [usePreferences, setUsePreferences] = useState({});
  const [breedGroup, setBreedGroup] = useState('');
  const [lifeSpan, setLifeSpan] = useState([]);
  const [weight, setWeight] = useState([]);
  const [sortOption, setSortOption] = useState('');

  const [traitGroups, setTraitGroups] = useState(
    allBreeds[3].traits as TraitGroup[]
  );

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [breeds, setBreeds] = useState(
    allBreeds.filter((breed) => breed.breedGroup !== 'hybrid') as Breed[]
  );
  const [filteredBreeds, setFilteredBreeds] = useState([] as any);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalMatches, setTotalMatches] = useState(0);

  const breedsPerPage = 8;

  const evaluateTrait = useCallback(
    (breed: Breed, traitName: string, preference: boolean | number) => {
      // Find the trait in the breed's traits array
      let trait: any = null;
      if (breed.traits) {
        for (const traitGroup of breed.traits) {
          const foundTrait = traitGroup.traits.find(
            (t) => t.name === traitName
          );
          if (foundTrait) {
            trait = foundTrait;
            break;
          }
        }
      }
      if (!trait) return true;

      // Helper function to normalize scores for comparison
      const normalizeScore = (score: number) => {
        // Convert 1-5 scale to 0-1 scale for easier comparison
        return (score - 1) / 4;
      };

      if (typeof preference === 'boolean') {
        // For boolean preferences, we're more lenient - any score above midpoint (3) is considered "true"
        const normalizedScore = normalizeScore(trait.score);
        const threshold = 0.5; // Represents score of 3 on 1-5 scale

        // For some traits, lower scores are better
        const reverseLogic = ['Shedding', 'Drooling', 'Barking', 'Prey Drive'];

        if (reverseLogic.includes(trait.name)) {
          return preference === normalizedScore <= threshold;
        }
        return preference === normalizedScore >= threshold;
      } else {
        // For numeric preferences (size, energy level)
        const score = trait.score;

        switch (preference) {
          case 0: // Low
            return score <= 2.5;
          case 1: // Medium
            return score > 2 && score < 4;
          case 2: // High
            return score >= 3.5;
          default:
            return true;
        }
      }
    },
    []
  );

  const filterBreeds = useMemo(
    () =>
      debounce(
        (
          preferences: TraitPreferences,
          searchQuery: string,
          currentPage: number
        ) => {
          const filtered = breeds.filter((breed) => {
            // Search filter
            if (
              searchQuery &&
              !breed.name.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
              return false;
            }

            // If no preferences are set, include all breeds
            if (Object.keys(preferences).length === 0) {
              return true;
            }

            // Trait preferences filter - match ANY preference (OR condition)
            return Object.entries(preferences).every(([trait, preference]) => {
              if (preference === undefined || preference === null) {
                return false;
              }
              return evaluateTrait(breed, trait, preference);
            });
          });

          // Pagination logic
          const start = (currentPage - 1) * breedsPerPage;
          const end = start + breedsPerPage;
          const paginatedBreeds = filtered.slice(0, end);
          const totalMatches = filtered.length;

          setFilteredBreeds(paginatedBreeds);
          setHasMore(filtered.length > end);
          setTotalMatches(totalMatches); // New state to track total matches
          setLoading(false);
        },
        300
      ),
    [breeds, evaluateTrait]
  );

  const loadMoreBreeds = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
      filterBreeds(traitPreferences, searchText, page + 1);
      return () => {
        filterBreeds.cancel();
      };
    }
  }, [hasMore, loading, page, filterBreeds]);

  useEffect(() => {
    filterBreeds(traitPreferences, searchText, page);

    return () => {
      filterBreeds.cancel();
    };
  }, [traitPreferences, searchText, filterBreeds]);

  const updateFilter = useCallback(
    (type, value) => {
      setLoading(true);
      switch (type) {
        case 'searchText':
          setSearchText(value);
          break;
        case 'traitPreferences':
          setTraitPreferences((prev) => ({...prev, ...value}));
          break;
        case 'usePreferences':
          setUsePreferences(value);
          break;
        case 'breedGroup':
          setBreedGroup(value);
          break;
        case 'lifeSpan':
          setLifeSpan(value);
          break;
        case 'weight':
          setWeight(value);
          break;
        case 'sortOption':
          setSortOption(value);
          break;
        default:
          break;
      }
    },
    [loading, setLoading]
  );

  return {
    searchText,
    updateFilter,
    traitPreferences,
    traitGroups,
    filteredBreeds,
    loading,
    sortOption,
    allBreeds,
    usePreferences,
    breedGroup,
    lifeSpan,
    weight,
    page,
    hasMore,
    loadMoreBreeds,
    totalMatches,
  };
};
