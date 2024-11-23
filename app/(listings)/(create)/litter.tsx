import React, {useState} from 'react';
import {
  YStack,
  XStack,
  Text,
  Input,
  Switch,
  Select,
  Card,
  Button,
  Form,
  Spinner,
} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {
  LitterListing,
  useListingData,
} from '../../../api/firebase/listings/useListingData';
import BreedSelector from '../../../components/BreedSelector';
import ImageSelector from '../../../components/ImageSelector';
import {useRouter} from 'expo-router';
import {Alert} from 'react-native';
import useCurrentUser from '../../../hooks/useCurrentUser';

const STEPS = {
  BASIC_INFO: {
    title: 'Basic Information',
    description: 'Enter basic details about your litter',
  },
  MEDIA: {
    title: 'Photos & Videos',
    description: 'Add photos and videos',
  },
  PRICING: {
    title: 'Pricing & Registration',
    description: 'Set pricing and registration details',
  },
  HEALTH: {
    title: 'Health Testing',
    description: 'Add health testing information',
  },
  REQUIREMENTS: {
    title: 'Requirements',
    description: 'Set adoption requirements',
  },
};

const BasicInfoStep = ({formData, onChange, localized}) => (
  <YStack gap='$4'>
    <YStack gap='$2'>
      <Text>{localized('Breed')}</Text>
      <BreedSelector onSelectBreed={(breed) => onChange('breed', breed)} />
    </YStack>

    <YStack gap='$2'>
      <Text>{localized('Expected Date')}</Text>
      {/* <DatePicker
        value={formData.expectedDate}
        onChange={(date) => onChange('expectedDate', date)}
        minimumDate={new Date()}
      /> */}
    </YStack>

    <YStack gap='$2'>
      <Text>{localized('Puppy Count')}</Text>
      <XStack gap='$4'>
        <Input
          flex={1}
          value={formData.puppyCount?.male?.toString()}
          onChangeText={(value) =>
            onChange('puppyCount', {
              ...formData.puppyCount,
              male: parseInt(value) || 0,
            })
          }
          keyboardType='numeric'
          placeholder={localized('Males')}
        />
        <Input
          flex={1}
          value={formData.puppyCount?.female?.toString()}
          onChangeText={(value) =>
            onChange('puppyCount', {
              ...formData.puppyCount,
              female: parseInt(value) || 0,
            })
          }
          keyboardType='numeric'
          placeholder={localized('Females')}
        />
      </XStack>
    </YStack>
  </YStack>
);

const PricingStep = ({formData, onChange, localized}) => (
  <YStack gap='$4'>
    <YStack gap='$2'>
      <Text>{localized('Price Structure')}</Text>
      <XStack gap='$4'>
        <Input
          flex={1}
          value={formData.price?.base?.toString()}
          onChangeText={(value) =>
            onChange('price', {
              ...formData.price,
              base: parseInt(value) || 0,
            })
          }
          keyboardType='numeric'
          placeholder={localized('Base Price')}
        />
        <Input
          flex={1}
          value={formData.price?.withRegistration?.toString()}
          onChangeText={(value) =>
            onChange('price', {
              ...formData.price,
              withRegistration: parseInt(value) || 0,
            })
          }
          keyboardType='numeric'
          placeholder={localized('With Registration')}
        />
      </XStack>
      <Input
        value={formData.price?.deposit?.toString()}
        onChangeText={(value) =>
          onChange('price', {
            ...formData.price,
            deposit: parseInt(value) || 0,
          })
        }
        keyboardType='numeric'
        placeholder={localized('Required Deposit')}
      />
    </YStack>

    <YStack gap='$2'>
      <Text>{localized('Registration')}</Text>
      <Select
        value={formData.registration?.type}
        onValueChange={(value) =>
          onChange('registration', {
            ...formData.registration,
            type: value,
          })
        }
      >
        <Select.Item index={0} value='limited'>
          {localized('Limited Only')}
        </Select.Item>
        <Select.Item index={1} value='full'>
          {localized('Full Only')}
        </Select.Item>
        <Select.Item index={2} value='both'>
          {localized('Both Available')}
        </Select.Item>
      </Select>
      <Input
        value={formData.registration?.organization}
        onChangeText={(value) =>
          onChange('registration', {
            ...formData.registration,
            organization: value,
          })
        }
        placeholder={localized('Registration Organization (AKC, etc)')}
      />
    </YStack>
  </YStack>
);

const HealthStep = ({formData, onChange, localized}) => (
  <YStack gap='$4'>
    {Object.entries(formData.health || {}).map(([key, value]) =>
      typeof value === 'boolean' ? (
        <XStack key={key} gap='$2' alignItems='center'>
          <Switch
            checked={value}
            onCheckedChange={(checked) =>
              onChange('health', {...formData.health, [key]: checked})
            }
          />
          <Text>{localized(key)}</Text>
        </XStack>
      ) : null
    )}
  </YStack>
);

const RequirementsStep = ({formData, onChange, localized}) => (
  <YStack gap='$4'>
    {Object.entries(formData.requirements || {}).map(([key, value]) => (
      <XStack key={key} gap='$2' alignItems='center'>
        {typeof value === 'boolean' ? (
          <Switch
            checked={value}
            onCheckedChange={(checked) =>
              onChange('requirements', {
                ...formData.requirements,
                [key]: checked,
              })
            }
          />
        ) : (
          <Select
            value={value as string}
            onValueChange={(newValue) =>
              onChange('requirements', {
                ...formData.requirements,
                [key]: newValue,
              })
            }
          >
            {key === 'otherPets' && (
              <>
                <Select.Item value='allowed' index={0}>
                  {localized('Allowed')}
                </Select.Item>
                <Select.Item value='no-dogs' index={1}>
                  {localized('No Dogs')}
                </Select.Item>
                <Select.Item value='no-cats' index={2}>
                  {localized('No Cats')}
                </Select.Item>
                <Select.Item value='none' index={3}>
                  {localized('No Other Pets')}
                </Select.Item>
              </>
            )}
            {key === 'children' && (
              <>
                <Select.Item value='allowed' index={0}>
                  {localized('Allowed')}
                </Select.Item>
                <Select.Item value='no-young-children' index={1}>
                  {localized('No Young Children')}
                </Select.Item>
                <Select.Item value='none' index={2}>
                  {localized('No Children')}
                </Select.Item>
              </>
            )}
          </Select>
        )}
        <Text>{localized(key)}</Text>
      </XStack>
    ))}
  </YStack>
);

const MediaStep = ({formData, onChange}) => (
  <YStack gap='$4'>
    <ImageSelector
      images={
        formData.images?.map((url) => ({
          downloadURL: url,
          thumbnailURL: url,
        })) || []
      }
      onSelectImage={(images) => onChange('images', images)}
      onRemoveImage={() => {}}
      maxImages={10}
    />
  </YStack>
);

const useLitterListingForm = () => {
  const {loading, error, addListing} = useListingData();
  const router = useRouter();
  const currentUser = useCurrentUser();

  const [formData, setFormData] = useState<Partial<LitterListing>>({
    type: 'litter',
    breed: {
      breedId: '',
      breedName: '',
    },
    status: 'upcoming',
    expectedDate: new Date(),
    puppyCount: {
      male: 0,
      female: 0,
      available: 0,
      reserved: 0,
    },
    price: {
      base: 0,
      withBreedingRights: 0,
      deposit: 0,
      depositRefundable: true,
      withRegistration: 0,
    },
    registration: {
      type: 'limited',
      organization: '',
    },
    health: {
      dna: false,
      hips: false,
      eyes: false,
      heart: false,
    },
    requirements: {
      application: false,
      contract: false,
      spayNeuter: false,
      returnPolicy: false,
      homeCheck: false,
      references: false,
      experience: false,
      yard: false,
      fence: false,
      otherPets: 'allowed',
      children: 'allowed',
    },
    media: {
      images: [],
      videos: [],
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
      } as LitterListing);

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

export default function LitterListingForm() {
  const {localized} = useTranslations();
  const {formData, loading, error, handleChange, handleSubmit} =
    useLitterListingForm();

  const [currentStep, setCurrentStep] = useState(0);
  const steps = Object.values(STEPS);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            formData={formData}
            onChange={handleChange}
            localized={localized}
          />
        );
      case 1:
        return <MediaStep formData={formData} onChange={handleChange} />;
      case 2:
        return (
          <PricingStep
            formData={formData}
            onChange={handleChange}
            localized={localized}
          />
        );
      case 3:
        return (
          <HealthStep
            formData={formData}
            onChange={handleChange}
            localized={localized}
          />
        );
      case 4:
        return (
          <RequirementsStep
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
