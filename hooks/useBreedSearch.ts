import {useState, useCallback, useMemo, useEffect} from 'react';
import allBreeds from '../assets/data/breeds_with_group_and_traits.json';
import useCurrentUser from './useCurrentUser';
import {DogBreed} from '../api/firebase/breeds/useBreedData';
import {debounce} from 'tamagui';
import {updateFilter} from '../redux/reducers/filter';
import {useDispatch, useSelector} from 'react-redux';

interface TraitPreferences {
  [key: string]: boolean | number;
}

export const traitMapping = {
  apartment_friendly: 'adapts_well_to_apartment_living',
  novice_friendly: 'good_for_novice_dog_owners',
  independent: 'tolerates_being_alone',
  sensitivity_level: 'sensitivity_level',
  low_shedding: 'shedding',
  low_drooling: 'drooling_potential',
  easy_grooming: 'easy_to_groom',
  general_health: 'general_health',
  weight_gain_prone: 'potential_for_weight_gain',
  affectionate: 'best_family_dogs',
  kid_friendly: 'kid-friendly',
  dog_friendly: 'dog_friendly',
  stranger_friendly: 'friendly_toward_strangers',
  energy_level: 'high_energy_level',
  intensity: 'intensity',
  playfulness: 'potential_for_playfulness',
  easy_to_train: 'easy_to_train',
  intelligence: 'intelligence',
  mouthiness: 'potential_for_mouthiness',
  size: 'size',
  adaptable_to_weather: ['tolerates_cold_weather', 'tolerates_hot_weather'],
  high_prey_drive: 'prey_drive',
  barks_a_lot: 'tendency_to_bark_or_howl',
  wanderlust: 'wanderlust_potential',
};

const traitCategories = [
  {
    name: 'Physical Characteristics',
    caption: 'Select your preferred dog size and adaptability to environments',
    options: [
      {
        name: 'size',
        type: 'toggle',
        values: ['Small', 'Medium', 'Large'],
        defaultValue: 1, // Medium
      },
      {
        name: 'energy_level',
        type: 'toggle',
        values: ['Low', 'Moderate', 'High'],
        defaultValue: 1, // Moderate
      },
    ],
  },
  {
    name: 'Temperament',
    caption: 'Choose your preferred temperament traits',
    options: [
      {
        name: 'playfulness',
        type: 'switch',
        label: 'Playful',
      },
      {
        name: 'kid_friendly',
        type: 'switch',
        label: 'Kid Friendly',
        // defaultValue: true,
      },
      {
        name: 'stranger_friendly',
        type: 'switch',
        label: 'Stranger Friendly',
        // defaultValue: false,
      },
    ],
  },

  {
    name: 'Training & Obedience',
    caption: 'Pick your preferred learning style',
    options: [
      {
        name: 'easy_to_train',
        type: 'switch',
        label: 'Easy to Train',
      },
      {
        name: 'intelligent',
        type: 'switch',
        label: 'Highly Intelligent',
      },
      {
        name: 'high_prey_drive',
        type: 'switch',
        label: 'High Prey Drive',
        // defaultValue: false,
      },
    ],
  },
  {
    name: 'Lifestyle Fit',
    caption: 'Find a dog that suits your daily life',
    options: [
      {
        name: 'apartment_friendly',
        type: 'switch',
        label: 'Apartment Friendly',
        defaultValue: true,
      },
      {
        name: 'novice_friendly',
        type: 'switch',
        label: 'Good for Novice Owners',
        defaultValue: true,
      },
      {
        name: 'independent',
        type: 'switch',
        label: 'Can Be Left Alone',
        // defaultValue: false,
      },
    ],
  },
  {
    name: 'Care Requirements',
    caption: 'Consider the grooming and health needs',
    options: [
      {
        name: 'low_shedding',
        type: 'switch',
        label: 'Low Shedding',
        defaultValue: true,
      },
      {
        name: 'low_drooling',
        type: 'switch',
        label: 'Low Drooling',
        defaultValue: true,
      },
      {
        name: 'easy_grooming',
        type: 'switch',
        label: 'Easy to Groom',
        defaultValue: true,
      },
    ],
  },
];

export const useBreedSearch = () => {
  const dispatch = useDispatch();

  const {
    searchText,
    traitPreferences,
    usePreferences,
    breedGroup,
    lifeSpan,
    weight,
    sortOption,
  } = useSelector((state: any) => state.filter);

  const [loading, setLoading] = useState(true);
  const [breeds, setBreeds] = useState(allBreeds as DogBreed[]);
  const [filteredBreeds, setFilteredBreeds] = useState<DogBreed[]>([]);

  const evaluateTrait = useCallback((breedTrait, preference, traitName) => {
    if (typeof preference === 'boolean') {
      if (!preference) return true;
      const reverseLogic = [
        'shedding',
        'drooling_potential',
        'potential_for_weight_gain',
        'potential_for_mouthiness',
      ];
      return reverseLogic.includes(traitName)
        ? breedTrait?.score <= 3
        : breedTrait?.score > 3;
    } else {
      if (!breedTrait && preference === 0) return true;
      switch (preference) {
        case 0:
          return true;
        case 1:
          return breedTrait?.score <= 2;
        case 2:
          return breedTrait?.score === 3;
        case 3:
          return breedTrait?.score >= 4;
        default:
          return true;
      }
    }
  }, []);

  const filterBreeds = useMemo(
    () =>
      debounce(() => {
        setLoading(true);
        const filtered = breeds.filter((breed) => {
          // Search text filter
          if (
            searchText &&
            !breed.name.toLowerCase().includes(searchText.toLowerCase())
          ) {
            return false;
          }

          // Breed group filter
          if (breedGroup && breed.breedGroup !== breedGroup) {
            return false;
          }

          // Life span filter
          if (lifeSpan[0] > 0 || lifeSpan[1] < 20) {
            const [min, max] = breed.lifeSpan.split(' - ').map(Number);
            if (min < lifeSpan[0] || max > lifeSpan[1]) {
              return false;
            }
          }

          // Weight filter
          // if (weight[0] > 0 || weight[1] < 100) {
          //   const [min, max] = breed.weight.metric.split(' - ').map(Number);
          //   if (min < weight[0] || max > weight[1]) {
          //     return false;
          //   }
          // }

          // Trait preferences filter
          if (usePreferences) {
            return Object.entries(traitPreferences).every(
              ([trait, preference]) => {
                const mappedTrait = traitMapping[trait] || trait;
                if (Array.isArray(mappedTrait)) {
                  return mappedTrait.every((subTrait) => {
                    const breedTrait = breed.traits && breed.traits[subTrait];
                    if (!breedTrait) return true;
                    return evaluateTrait(breedTrait, preference, subTrait);
                  });
                } else {
                  const breedTrait = breed.traits && breed.traits[mappedTrait];
                  if (!breedTrait) return true;
                  return evaluateTrait(breedTrait, preference, mappedTrait);
                }
              }
            );
          }

          return true;
        });

        console.log('filtered: ', filtered);
        setFilteredBreeds(filtered);
        setLoading(false);
      }, 300),
    [
      breeds,
      searchText,
      breedGroup,
      lifeSpan,
      weight,
      usePreferences,
      traitPreferences,
      evaluateTrait,
    ]
  );

  useEffect(() => {
    filterBreeds();
    return () => {
      filterBreeds.cancel();
    };
  }, [filterBreeds]);

  const handleSearchChange = useCallback(
    (text: string) => {
      dispatch(updateFilter({searchText: text}));
    },
    [dispatch]
  );

  const handleTraitToggle = useCallback(
    (trait: string, value: boolean | number) => {
      dispatch(
        updateFilter({traitPreferences: {...traitPreferences, [trait]: value}})
      );
    },
    [dispatch, traitPreferences]
  );

  const handleSortChange = useCallback(
    (option: string) => {
      dispatch(updateFilter({sortOption: option}));
    },
    [dispatch]
  );

  const sortBreeds = useCallback(
    (breeds: DogBreed[]) => {
      return [...breeds].sort((a, b) => {
        switch (sortOption) {
          case 'nameAsc':
            return a.name.localeCompare(b.name);
          case 'nameDesc':
            return b.name.localeCompare(a.name);
          case 'popular':
            return (b.popularity || 0) - (a.popularity || 0);
          case 'available':
            return (b.available ? 1 : 0) - (a.available ? 1 : 0);
          default:
            return 0;
        }
      });
    },
    [sortOption]
  );

  useEffect(() => {
    const sortedBreeds = sortBreeds(filteredBreeds);
    setFilteredBreeds(sortedBreeds);
  }, [sortOption, sortBreeds, filteredBreeds]);

  return {
    searchText,
    handleSearchChange,
    traitPreferences,
    traitCategories,
    handleTraitToggle,
    filteredBreeds,
    loading,
    sortOption,
    handleSortChange,
    allBreeds,
    usePreferences,
    breedGroup,
    lifeSpan,
    weight,
  };
};
