import {useState, useCallback, useMemo, useEffect} from 'react';
import allBreeds from '../assets/data/breeds_with_group_and_traits.json';
import useCurrentUser from './useCurrentUser';
import {DogBreed} from '../api/firebase/breeds/useBreedData';
import {debounce} from 'tamagui';

interface TraitPreferences {
  [key: string]: boolean | number;
}

const traitMapping = {
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
    name: 'Physical Characteristics',
    caption: "The dog's size and adaptability to different environments",
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
];

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

  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [breeds, setBreeds] = useState(
    allBreeds.filter((breed) => breed.breedGroup !== 'hybrid') as DogBreed[]
  );
  const [filteredBreeds, setFilteredBreeds] = useState<DogBreed[]>([]);

  const findBreedByName = useCallback(
    (breedName: string): DogBreed | undefined => {
      return breeds.find(
        (breed) => breed.name.toLowerCase() === breedName.toLowerCase()
      );
    },
    []
  );

  const evaluateTrait = useCallback((breedTrait, preference, traitName) => {
    if (typeof preference === 'boolean') {
      const reverseLogic = [
        'shedding',
        'drooling_potential',
        'potential_for_weight_gain',
        'potential_for_mouthiness',
      ];
      const desiredValue = reverseLogic.includes(traitName)
        ? breedTrait.score <= 3
        : breedTrait.score > 3;
      return preference === desiredValue;
    } else {
      switch (preference) {
        case 0:
          return breedTrait.score <= 2;
        case 1:
          return breedTrait.score === 3;
        case 2:
          return breedTrait.score >= 4;
        default:
          return true;
      }
    }
  }, []);

  const filterBreeds = useMemo(
    () =>
      debounce((preferences: typeof traitPreferences, searchQuery: string) => {
        const filtered = breeds.filter((breed) => {
          if (
            searchQuery &&
            !breed.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            return false;
          }

          return Object.entries(preferences).every(([trait, preference]) => {
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
          });
        });
        console.log('Matched breeds: ', filtered.length);
        setFilteredBreeds(filtered);
      }, 300), // 300ms debounce time, adjust as needed
    [breeds, searchText, evaluateTrait]
  );

  useEffect(() => {
    filterBreeds(traitPreferences, searchText);

    return () => {
      filterBreeds.cancel();
    };
  }, [traitPreferences, searchText, filterBreeds]);

  const updateFilter = useCallback((type, value) => {
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
    setLoading(false);
  }, []);

  return {
    searchText,
    updateFilter,
    traitPreferences,
    traitCategories,
    filteredBreeds,
    loading,
    sortOption,
    allBreeds,
    usePreferences,
    breedGroup,
    lifeSpan,
    weight,
    findBreedByName,
  };
};
