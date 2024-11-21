import React, {useState} from 'react';
import {useRouter} from 'expo-router';
import {Alert} from 'react-native';
import {YStack, Text, Input, Button, Spinner, Tabs} from 'tamagui';
import {updateUser} from '../../../api/firebase/users/userClient';
import {useTranslations} from '../../../dopebase';
import {BasicInfoTab} from './basic-info';
import {BreedsTab} from './breeds';
import {FacilitiesTab} from './facilities';
import useCurrentUser from '../../../hooks/useCurrentUser';

const ONBOARDING_STEPS = {
  BASIC_INFO: {
    title: 'Basic Information',
    subtitle: 'Tell us about your kennel',
    isRequired: true,
  },
  BREEDS: {
    title: 'Breeds',
    subtitle: 'What breeds do you work with?',
    isRequired: true,
  },
  FACILITIES: {
    title: 'Facilities',
    subtitle: 'Tell us about your breeding program',
    isRequired: true,
  },
};

const BREEDER_ONBOARDING_STEPS = {
  BASIC_INFO: {
    title: 'Basic Information',
    fields: ['name', 'email', 'phone', 'location'],
  },
  KENNEL_INFO: {
    title: 'Kennel Information',
    fields: ['kennelName', 'registrationNumber', 'yearsBreeding'],
  },
  FACILITIES: {
    title: 'Facilities & Care',
    fields: ['facilityType', 'breedingPairs', 'veterinarianInfo'],
  },
  BREEDING_PROGRAM: {
    title: 'Breeding Program',
    fields: ['breeds', 'healthTesting', 'guarantees'],
  },
  VERIFICATION: {
    title: 'Documentation',
    fields: ['licenses', 'certifications', 'insurance'],
  },
};

interface BreederFormData {
  // Kennel Information
  kennel: {
    name: string;
    registrationNumber?: string;
    description: string;
    website?: string;
    socialMedia?: {
      instagram?: string;
      facebook?: string;
    };
  };
  // Breeding Information
  breeding: {
    breeds: {
      breedId: string;
      breedName: string;
      yearsBreeding: number;
      healthTesting: {
        dna: boolean;
        hips: boolean;
        eyes: boolean;
        heart: boolean;
      };
    }[];
    facilities: {
      type: 'home' | 'dedicated_facility' | 'both';
      details: string;
      hasWhelping: boolean;
      hasExerciseArea: boolean;
    };
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
}

const BreederOnboardingScreen = () => {
  const router = useRouter();
  const {localized} = useTranslations();
  const currentUser = useCurrentUser();

  const [activeTab, setActiveTab] = useState('BASIC_INFO');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BreederFormData>({
    kennel: {
      name: '',
      description: '',
    },
    breeding: {
      breeds: [],
      facilities: {
        type: 'home',
        details: '',
        hasWhelping: false,
        hasExerciseArea: false,
      },
    },
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
    },
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleAddBreed = (breed: any, healthTesting = {}) => {
    setFormData((prev) => ({
      ...prev,
      breeding: {
        ...prev.breeding,
        breeds: [
          ...prev.breeding.breeds,
          {
            breedId: breed.id,
            breedName: breed.name,
            yearsBreeding: 0,
            healthTesting: {
              dna: false,
              hips: false,
              eyes: false,
              heart: false,
              ...healthTesting,
            },
          },
        ],
      },
    }));
  };

  const handleRemoveBreed = (breedId: string) => {
    setFormData((prev) => ({
      ...prev,
      breeding: {
        ...prev.breeding,
        breeds: prev.breeding.breeds.filter((b) => b.breedId !== breedId),
      },
    }));
  };

  const validateStep = (step: string): boolean => {
    switch (step) {
      case 'BASIC_INFO':
        return (
          formData.kennel.name.length > 0 &&
          formData.location.address.length > 0
        );
      case 'BREEDS':
        return formData.breeding.breeds.length > 0;
      case 'FACILITIES':
        return formData.breeding.facilities.details.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    const steps = Object.keys(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(activeTab);
    if (currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser(currentUser.id, {
        ...formData,
        role: 'breeder',
        profileComplete: true,
        updatedAt: new Date(),
      });
      router.push('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save breeder information');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeTab) {
      case 'BASIC_INFO':
        return (
          <BasicInfoTab formData={formData} onChange={handleInputChange} />
        );
      case 'BREEDS':
        return (
          <BreedsTab
            breeds={formData.breeding.breeds}
            onAddBreed={handleAddBreed}
            onRemoveBreed={handleRemoveBreed}
            onUpdateBreed={() => {}}
          />
        );
      case 'FACILITIES':
        return (
          <FacilitiesTab
            facilities={formData.breeding.facilities}
            onChange={(field, value) =>
              handleInputChange('breeding', `facilities.${field}`, value)
            }
          />
        );
    }
  };

  return (
    <YStack f={1} p='$4'>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        flexGrow={1}
        gap='$4'
      >
        <Tabs.List>
          {Object.entries(ONBOARDING_STEPS).map(([key, {title}]) => (
            <Tabs.Tab key={key} value={key} flex={1}>
              <Text>{localized(title)}</Text>
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {renderStepContent()}
      </Tabs>

      <YStack gap='$4' pt='$4'>
        <Button
          theme='active'
          onPress={activeTab === 'FACILITIES' ? handleSave : handleNext}
          disabled={loading || !validateStep(activeTab)}
          icon={loading ? <Spinner /> : undefined}
        >
          {loading
            ? ''
            : activeTab === 'FACILITIES'
            ? localized('Complete')
            : localized('Next')}
        </Button>
      </YStack>
    </YStack>
  );
};

export default BreederOnboardingScreen;
