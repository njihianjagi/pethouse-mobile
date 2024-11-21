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
import {AdoptionListing} from '../../../api/firebase/listings/useListingData';
import BreedSelector from '../../../components/BreedSelector';
import ImageSelector from '../../../components/ImageSelector';

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

interface AdoptionListingProps {
  formData: Partial<AdoptionListing>;
  onChange: (field: string, value: any) => void;
  onSubmit: () => void;
  loading: boolean;
  error: any;
}

export const AdoptionListingForm = ({
  formData,
  onChange,
  onSubmit,
  loading,
  error,
}: AdoptionListingProps) => {
  const {localized} = useTranslations();
  const [currentStep, setCurrentStep] = useState('BASIC_INFO');

  const isLastStep = currentStep === 'MEDIA';

  const handleNext = async () => {
    if (isLastStep) {
      await onSubmit();
      return;
    }

    const steps = Object.keys(STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as keyof typeof STEPS);
    }
  };

  const handleBack = () => {
    const steps = Object.keys(STEPS);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'BASIC_INFO':
        return <BasicInfoStep formData={formData} onChange={onChange} />;
      case 'PRICING':
        return <PricingStep formData={formData} onChange={onChange} />;
      case 'HEALTH':
        return <HealthStep formData={formData} onChange={onChange} />;
      case 'REQUIREMENTS':
        return <RequirementsStep formData={formData} onChange={onChange} />;
      case 'MEDIA':
        return <MediaStep formData={formData} onChange={onChange} />;
      default:
        return null;
    }
  };

  return (
    <Form>
      <YStack gap='$4' p='$4'>
        <Card elevate>
          <YStack p='$4' gap='$2'>
            <Text fontWeight='bold'>{localized(STEPS[currentStep].title)}</Text>
            <Text color='$gray10'>
              {localized(STEPS[currentStep].description)}
            </Text>
          </YStack>
        </Card>

        {renderStep()}

        <XStack gap='$4' justifyContent='space-between'>
          <Button
            variant='outlined'
            disabled={currentStep === 'BASIC_INFO'}
            onPress={handleBack}
          >
            {localized('Back')}
          </Button>
          <Button theme='active' onPress={handleNext} disabled={loading}>
            {loading ? (
              <Spinner />
            ) : isLastStep ? (
              localized('Submit')
            ) : (
              localized('Next')
            )}
          </Button>
        </XStack>
      </YStack>
    </Form>
  );
};
