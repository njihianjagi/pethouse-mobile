import React, {useState} from 'react';
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  Card,
  Switch,
  Form,
  Spinner,
} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {
  AdoptionListing,
  useListingData,
} from '../../../api/firebase/listings/useListingData';
import BreedSelector from '../../../components/BreedSelector';
import ImageSelector from '../../../components/ImageSelector';
import {useRouter} from 'expo-router';
import {Alert} from 'react-native';
import useCurrentUser from '../../../hooks/useCurrentUser';

// ... existing interfaces ...

const STEPS = {
  BASIC_INFO: {
    title: 'Basic Information',
    description: 'Enter basic details about your listing',
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
    title: 'Health & Training',
    description: 'Add health and training information',
  },
  REQUIREMENTS: {
    title: 'Requirements',
    description: 'Set adoption requirements',
  },
};

const BasicInfoStep = ({formData, onChange}) => (
  <YStack gap='$4'>
    <BreedSelector
      onSelectBreed={(breed) =>
        onChange('breed', {breedId: breed.id, breedName: breed.name})
      }
    />
    <Input
      placeholder='Name'
      value={formData.name}
      onChangeText={(value) => onChange('name', value)}
    />
    <XStack gap='$4'>
      <Button
        flex={1}
        variant={formData.sex === 'male' ? undefined : 'outlined'}
        onPress={() => onChange('sex', 'male')}
      >
        Male
      </Button>
      <Button
        flex={1}
        variant={formData.sex === 'female' ? undefined : 'outlined'}
        onPress={() => onChange('sex', 'female')}
      >
        Female
      </Button>
    </XStack>
    <Input
      placeholder='Color'
      value={formData.color}
      onChangeText={(value) => onChange('color', value)}
    />
  </YStack>
);

const PricingStep = ({formData, onChange}) => (
  <YStack gap='$4'>
    <Input
      placeholder='Base Price'
      keyboardType='numeric'
      value={formData.price?.base?.toString()}
      onChangeText={(value) =>
        onChange('price', {...formData.price, base: Number(value)})
      }
    />
    <Input
      placeholder='Deposit Amount'
      keyboardType='numeric'
      value={formData.price?.deposit?.toString()}
      onChangeText={(value) =>
        onChange('price', {...formData.price, deposit: Number(value)})
      }
    />
    <Switch
      checked={formData.price?.depositRefundable}
      onCheckedChange={(value) =>
        onChange('price', {...formData.price, depositRefundable: value})
      }
    >
      <Switch.Thumb />
      <Text>Deposit is Refundable</Text>
    </Switch>
  </YStack>
);

const HealthStep = ({formData, onChange}) => (
  <YStack gap='$4'>
    <Switch
      checked={formData.health?.vaccinated}
      onCheckedChange={(value) =>
        onChange('health', {...formData.health, vaccinated: value})
      }
    >
      <Switch.Thumb />
      <Text>Vaccinated</Text>
    </Switch>
    <Switch
      checked={formData.health?.dewormed}
      onCheckedChange={(value) =>
        onChange('health', {...formData.health, dewormed: value})
      }
    >
      <Switch.Thumb />
      <Text>Dewormed</Text>
    </Switch>
    <Switch
      checked={formData.health?.microchipped}
      onCheckedChange={(value) =>
        onChange('health', {...formData.health, microchipped: value})
      }
    >
      <Switch.Thumb />
      <Text>Microchipped</Text>
    </Switch>
  </YStack>
);

const RequirementsStep = ({formData, onChange}) => {
  const {localized} = useTranslations();

  return (
    <YStack gap='$4'>
      <Input
        placeholder={localized('Home Requirements')}
        value={formData.homeRequirements}
        onChangeText={(value) => onChange('homeRequirements', value)}
        multiline
        numberOfLines={3}
      />

      <Input
        placeholder={localized('Experience Level')}
        value={formData.experienceRequired}
        onChangeText={(value) => onChange('experienceRequired', value)}
      />

      <Switch
        checked={formData.requirements?.fencedYard}
        onCheckedChange={(value) =>
          onChange('requirements', {
            ...formData.requirements,
            fencedYard: value,
          })
        }
      >
        <Switch.Thumb />
        <Text>Fenced Yard Required</Text>
      </Switch>

      <Switch
        checked={formData.requirements?.noSmallChildren}
        onCheckedChange={(value) =>
          onChange('requirements', {
            ...formData.requirements,
            noSmallChildren: value,
          })
        }
      >
        <Switch.Thumb />
        <Text>No Small Children</Text>
      </Switch>

      <Input
        placeholder={localized('Additional Requirements')}
        value={formData.additionalRequirements}
        onChangeText={(value) => onChange('additionalRequirements', value)}
        multiline
        numberOfLines={3}
      />
    </YStack>
  );
};

const MediaStep = ({formData, onChange}) => {
  const {localized} = useTranslations();

  return (
    <YStack gap='$4'>
      <Card elevate bordered>
        <YStack gap='$3' p='$4'>
          <Text fontWeight='bold'>{localized('Photos')}</Text>
          <ImageSelector
            images={
              formData.media?.images?.map((url) => ({
                downloadURL: url,
                thumbnailURL: url,
              })) || []
            }
            onSelectImage={(image) =>
              onChange('media', {
                ...formData.media,
                images: [...(formData.media?.images || []), image],
              })
            }
            onRemoveImage={(index) => {
              const newImages = [...(formData.media?.images || [])];
              newImages.splice(index, 1);
              onChange('media', {
                ...formData.media,
                images: newImages,
              });
            }}
            maxImages={10}
          />
        </YStack>
      </Card>

      <Card elevate bordered>
        <YStack gap='$3' p='$4'>
          <Text fontWeight='bold'>{localized('Videos')}</Text>
          <Text color='$gray10'>{localized('Coming soon')}</Text>
          {/* TODO: Add VideoSelector component */}
        </YStack>
      </Card>
    </YStack>
  );
};

const useAdoptionListingForm = () => {
  const {loading, error, addListing} = useListingData();
  const router = useRouter();
  const currentUser = useCurrentUser();

  const [formData, setFormData] = useState<Partial<AdoptionListing>>({
    type: 'adoption',
    breed: {
      breedId: '',
      breedName: '',
    },
    status: 'available',
    name: '',
    sex: 'male',
    dateOfBirth: new Date(),
    color: '',
    price: {
      base: 0,
      deposit: 0,
      depositRefundable: true,
    },
    registration: {
      type: 'limited',
      organization: '',
    },
    health: {
      vaccinated: false,
      dewormed: false,
      microchipped: false,
      vetChecked: false,
    },
    training: {
      houseTrained: false,
      crateTrained: false,
      basicCommands: false,
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
      } as AdoptionListing);

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

export default function AdoptionListingForm() {
  const {localized} = useTranslations();
  const {formData, loading, error, handleChange, handleSubmit} =
    useAdoptionListingForm();

  const [currentStep, setCurrentStep] = useState(0);
  const steps = Object.values(STEPS);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep formData={formData} onChange={handleChange} />;
      case 1:
        return <MediaStep formData={formData} onChange={handleChange} />;
      case 2:
        return <PricingStep formData={formData} onChange={handleChange} />;
      case 3:
        return <HealthStep formData={formData} onChange={handleChange} />;
      case 4:
        return <RequirementsStep formData={formData} onChange={handleChange} />;
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
