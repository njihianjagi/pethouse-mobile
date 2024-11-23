import React, {useState} from 'react';
import {
  YStack,
  Text,
  Input,
  Switch,
  XStack,
  Select,
  Card,
  ToggleGroup,
  Slider,
  Button,
  Form,
  Spinner,
} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import BreedSelector from '../../../components/BreedSelector';
import {
  WantedListing,
  useListingData,
} from '../../../api/firebase/listings/useListingData';
import {useRouter} from 'expo-router';
import {Alert} from 'react-native';
import useCurrentUser from '../../../hooks/useCurrentUser';

const STEPS = {
  BREED_PREFERENCES: {
    title: 'Breed Preferences',
    description: 'Select your preferred breeds and characteristics',
  },
  HEALTH_TRAINING: {
    title: 'Health & Training',
    description: 'Specify health and training preferences',
  },
  SITUATION: {
    title: 'Your Situation',
    description: 'Tell us about your home and lifestyle',
  },
  TIMELINE_PRICE: {
    title: 'Timeline & Budget',
    description: 'Specify your timeline and budget preferences',
  },
};

const BreedPreferencesStep = ({formData, onChange, localized}) => (
  <YStack gap='$4'>
    <YStack gap='$2'>
      <Text>{localized('Preferred Breeds')}</Text>
      <BreedSelector onSelectBreed={(breeds) => onChange('breeds', breeds)} />
    </YStack>

    <YStack gap='$2'>
      <Text>{localized('Sex Preference')}</Text>
      <ToggleGroup
        type='single'
        value={formData.preferences?.sex}
        onValueChange={(value: string | undefined) => {
          if (value) {
            onChange('preferences.sex', value);
          }
        }}
      >
        <ToggleGroup.Item value='male' flex={1}>
          <Text>{localized('Male')}</Text>
        </ToggleGroup.Item>
        <ToggleGroup.Item value='female' flex={1}>
          <Text>{localized('Female')}</Text>
        </ToggleGroup.Item>
        <ToggleGroup.Item value='either' flex={1}>
          <Text>{localized('Either')}</Text>
        </ToggleGroup.Item>
      </ToggleGroup>
    </YStack>

    <YStack gap='$2'>
      <Text>{localized('Age Range (months)')}</Text>
      <XStack gap='$4'>
        <Input
          flex={1}
          value={formData.preferences?.ageRange?.min?.toString()}
          onChangeText={(value) =>
            onChange('preferences.ageRange.min', parseInt(value) || 0)
          }
          keyboardType='numeric'
          placeholder={localized('Minimum')}
        />
        <Input
          flex={1}
          value={formData.preferences?.ageRange?.max?.toString()}
          onChangeText={(value) =>
            onChange('preferences.ageRange.max', parseInt(value) || 0)
          }
          keyboardType='numeric'
          placeholder={localized('Maximum')}
        />
      </XStack>
    </YStack>
  </YStack>
);

const HealthTrainingStep = ({formData, onChange, localized}) => (
  <YStack gap='$4'>
    <Card elevate bordered>
      <YStack gap='$3' p='$4'>
        <Text fontWeight='bold'>{localized('Health Requirements')}</Text>
        <XStack gap='$4' flexWrap='wrap'>
          <YStack flex={1} gap='$2'>
            <Switch
              checked={formData.health?.vaccinated}
              onCheckedChange={(checked) =>
                onChange('health.vaccinated', checked)
              }
            >
              <Text>{localized('Vaccinated')}</Text>
            </Switch>
            <Switch
              checked={formData.health?.dewormed}
              onCheckedChange={(checked) =>
                onChange('health.dewormed', checked)
              }
            >
              <Text>{localized('Dewormed')}</Text>
            </Switch>
          </YStack>
          <YStack flex={1} gap='$2'>
            <Switch
              checked={formData.health?.microchipped}
              onCheckedChange={(checked) =>
                onChange('health.microchipped', checked)
              }
            >
              <Text>{localized('Microchipped')}</Text>
            </Switch>
            <Switch
              checked={formData.health?.healthTested}
              onCheckedChange={(checked) =>
                onChange('health.healthTested', checked)
              }
            >
              <Text>{localized('Health Tested')}</Text>
            </Switch>
          </YStack>
        </XStack>
      </YStack>
    </Card>

    <Card elevate bordered>
      <YStack gap='$3' p='$4'>
        <Text fontWeight='bold'>{localized('Training Preferences')}</Text>
        <XStack gap='$4' flexWrap='wrap'>
          <YStack flex={1} gap='$2'>
            <Switch
              checked={formData.training?.houseTrained}
              onCheckedChange={(checked) =>
                onChange('training.houseTrained', checked)
              }
            >
              <Text>{localized('House Trained')}</Text>
            </Switch>
            <Switch
              checked={formData.training?.crateTrained}
              onCheckedChange={(checked) =>
                onChange('training.crateTrained', checked)
              }
            >
              <Text>{localized('Crate Trained')}</Text>
            </Switch>
          </YStack>
          <YStack flex={1} gap='$2'>
            <Switch
              checked={formData.training?.basicCommands}
              onCheckedChange={(checked) =>
                onChange('training.basicCommands', checked)
              }
            >
              <Text>{localized('Basic Commands')}</Text>
            </Switch>
          </YStack>
        </XStack>
      </YStack>
    </Card>
  </YStack>
);

const SituationStep = ({formData, onChange, localized}) => (
  <YStack gap='$4'>
    <Card elevate bordered>
      <YStack gap='$3' p='$4'>
        <Text fontWeight='bold'>{localized('Home Environment')}</Text>
        <XStack gap='$4' flexWrap='wrap'>
          <Switch
            checked={formData.situation?.hasYard}
            onCheckedChange={(checked) =>
              onChange('situation.hasYard', checked)
            }
          >
            <Text>{localized('Has Yard')}</Text>
          </Switch>
          {formData.situation?.hasYard && (
            <Switch
              checked={formData.situation?.hasFence}
              onCheckedChange={(checked) =>
                onChange('situation.hasFence', checked)
              }
            >
              <Text>{localized('Has Fence')}</Text>
            </Switch>
          )}
        </XStack>
      </YStack>
    </Card>

    <Card elevate bordered>
      <YStack gap='$3' p='$4'>
        <Text fontWeight='bold'>{localized('Household Members')}</Text>
        <Switch
          checked={formData.situation?.hasChildren}
          onCheckedChange={(checked) =>
            onChange('situation.hasChildren', checked)
          }
        >
          <Text>{localized('Has Children')}</Text>
        </Switch>

        <Switch
          checked={formData.situation?.hasOtherPets}
          onCheckedChange={(checked) =>
            onChange('situation.hasOtherPets', checked)
          }
        >
          <Text>{localized('Has Other Pets')}</Text>
        </Switch>
      </YStack>
    </Card>

    <Card elevate bordered>
      <YStack gap='$3' p='$4'>
        <Text fontWeight='bold'>{localized('Experience Level')}</Text>
        <Select
          value={formData.situation?.experience}
          onValueChange={(value) => onChange('situation.experience', value)}
        >
          <Select.Item value='first_time' index={0}>
            {localized('First Time Owner')}
          </Select.Item>
          <Select.Item value='some_experience' index={1}>
            {localized('Some Experience')}
          </Select.Item>
          <Select.Item value='experienced' index={2}>
            {localized('Experienced')}
          </Select.Item>
        </Select>
      </YStack>
    </Card>
  </YStack>
);

const TimelinePriceStep = ({formData, onChange, localized}) => (
  <YStack gap='$4'>
    <YStack gap='$2'>
      <Text>{localized('Price Range')}</Text>
      <XStack gap='$4'>
        <Input
          flex={1}
          value={formData.preferences?.priceRange?.min?.toString()}
          onChangeText={(value) =>
            onChange('preferences.priceRange.min', parseInt(value) || 0)
          }
          keyboardType='numeric'
          placeholder={localized('Minimum')}
        />
        <Input
          flex={1}
          value={formData.preferences?.priceRange?.max?.toString()}
          onChangeText={(value) =>
            onChange('preferences.priceRange.max', parseInt(value) || 0)
          }
          keyboardType='numeric'
          placeholder={localized('Maximum')}
        />
      </XStack>
    </YStack>

    <YStack gap='$2'>
      <Text>{localized('Timeline')}</Text>
      <Select
        value={formData.preferences?.timeline}
        onValueChange={(value) => onChange('preferences.timeline', value)}
      >
        <Select.Item index={1} value='immediate'>
          {localized('As Soon as Possible')}
        </Select.Item>
        <Select.Item index={2} value='1-3_months'>
          {localized('1-3 Months')}
        </Select.Item>
        <Select.Item index={3} value='3-6_months'>
          {localized('3-6 Months')}
        </Select.Item>
        <Select.Item index={4} value='6+_months'>
          {localized('6+ Months')}
        </Select.Item>
      </Select>
    </YStack>
  </YStack>
);

const useWantedListingForm = () => {
  const {loading, error, addListing} = useListingData();
  const router = useRouter();
  const currentUser = useCurrentUser();

  const [formData, setFormData] = useState<Partial<WantedListing>>({
    type: 'wanted',
    breed: {
      breedId: '',
      breedName: '',
      isRequired: false,
    },
    status: 'searching',
    preferences: {
      sex: 'either',
      ageRange: {
        min: 0,
        max: 12,
      },
      priceRange: {
        min: 0,
        max: 5000,
      },
      timeline: 'immediate',
      registration: {
        required: false,
      },
      health: {
        vaccinated: false,
        dewormed: false,
        microchipped: false,
        healthTested: false,
      },
      training: {
        houseTrained: false,
        crateTrained: false,
        basicCommands: false,
      },
    },
    situation: {
      hasYard: false,
      hasFence: false,
      hasChildren: false,
      hasOtherPets: false,
      hoursAlone: 0,
      experience: 'first_time',
    },
    description: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = {...prev};
      const fieldPath = field.split('.');
      let current = newData as any;

      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) {
          current[fieldPath[i]] = {};
        }
        current = current[fieldPath[i]];
      }
      current[fieldPath[fieldPath.length - 1]] = value;

      return newData;
    });
  };

  const handleSubmit = async () => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'You must be logged in to create a listing');
        return;
      }

      await addListing({
        ...formData,
        userId: currentUser.id,
      } as WantedListing);

      router.push('/(tabs)/listings');
    } catch (error) {
      Alert.alert('Error', 'Failed to create listing');
      console.error(error);
    }
  };

  return {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit,
  };
};

export default function WantedListingForm() {
  const {localized} = useTranslations();
  const {formData, loading, error, handleChange, handleSubmit} =
    useWantedListingForm();

  const [currentStep, setCurrentStep] = useState(0);
  const steps = Object.values(STEPS);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BreedPreferencesStep
            formData={formData}
            onChange={handleChange}
            localized={localized}
          />
        );
      case 1:
        return (
          <HealthTrainingStep
            formData={formData}
            onChange={handleChange}
            localized={localized}
          />
        );
      case 2:
        return (
          <SituationStep
            formData={formData}
            onChange={handleChange}
            localized={localized}
          />
        );
      case 3:
        return (
          <TimelinePriceStep
            formData={formData}
            onChange={handleChange}
            localized={localized}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <YStack gap='$4' pb='$4'>
        <Card elevate bordered p='$4'>
          <YStack gap='$2'>
            <Text fontSize='$6' fontWeight='bold'>
              {steps[currentStep].title}
            </Text>
            <Text color='$gray11'>{steps[currentStep].description}</Text>
          </YStack>
        </Card>

        {renderStep()}

        <XStack gap='$4' justifyContent='space-between'>
          <Button
            disabled={currentStep === 0}
            onPress={() => setCurrentStep((prev) => prev - 1)}
            theme='alt2'
            flex={1}
          >
            {localized('Previous')}
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button
              onPress={() => setCurrentStep((prev) => prev + 1)}
              theme='active'
              flex={1}
            >
              {localized('Next')}
            </Button>
          ) : (
            <Button
              onPress={handleSubmit}
              theme='active'
              flex={1}
              icon={loading ? () => <Spinner /> : undefined}
              disabled={loading}
            >
              {localized('Submit')}
            </Button>
          )}
        </XStack>

        {error && (
          <Text color='$red10' textAlign='center'>
            {error.message}
          </Text>
        )}
      </YStack>
    </Form>
  );
}
