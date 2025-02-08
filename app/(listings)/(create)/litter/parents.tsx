import React from 'react';
import {
  YStack,
  XStack,
  Text,
  Input,
  Card,
  Switch,
  Button,
  Select,
} from 'tamagui';
import {useTranslations} from '../../../../dopebase';
import ImageSelector from '../../../../components/ImageSelector';
import BreedSelector from '../../../../components/breed-selector';
import {Check, ChevronDown, ChevronUp} from '@tamagui/lucide-icons';
import {useRouter} from 'expo-router';
import {useLitterForm} from '../../../../hooks/useLitterForm';

const REGISTRY_TYPES = ['AKC', 'UKC', 'CKC', 'other'];
const HEALTH_TESTS = [
  {id: 'dna', label: 'DNA Testing'},
  {id: 'hips', label: 'Hip Evaluation'},
  {id: 'elbows', label: 'Elbow Evaluation'},
  {id: 'eyes', label: 'Eye Examination'},
  {id: 'heart', label: 'Cardiac Evaluation'},
];

const ParentForm = ({
  type,
  parent,
  onChange,
  localized,
}: {
  type: 'sire' | 'dam';
  parent: any;
  onChange: (field: string, value: any) => void;
  localized: (key: string) => string;
}) => {
  const handleChange = (field: string, value: any) => {
    onChange(`parents.${type}.${field}`, value);
  };

  return (
    <Card elevate bordered padding='$4'>
      <YStack gap='$4'>
        <Text fontSize='$6' fontWeight='bold'>
          {localized(type === 'sire' ? 'Sire' : 'Dam')}
        </Text>

        <Input
          placeholder={localized('Name')}
          value={parent?.name}
          onChangeText={(value) => handleChange('name', value)}
        />

        <YStack gap='$2'>
          <Text fontSize='$4'>{localized('Registration')}</Text>
          <XStack gap='$2'>
            <Select
              value={parent?.registryType}
              onValueChange={(value) => handleChange('registryType', value)}
            >
              <Select.Trigger width='$12' iconAfter={ChevronDown}>
                <Select.Value placeholder={localized('Registry')} />
              </Select.Trigger>
              <Select.Content>
                <Select.ScrollUpButton alignItems='center'>
                  <ChevronUp />
                </Select.ScrollUpButton>
                <Select.Viewport>
                  <Select.Group>
                    {REGISTRY_TYPES.map((type, index) => (
                      <Select.Item index={index} key={type} value={type}>
                        <Select.ItemText>{type}</Select.ItemText>
                        <Select.ItemIndicator>
                          <Check size={16} />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Viewport>
                <Select.ScrollDownButton alignItems='center'>
                  <ChevronDown />
                </Select.ScrollDownButton>
              </Select.Content>
            </Select>

            <Input
              flex={1}
              placeholder={localized('Registration Number')}
              value={parent?.registration}
              onChangeText={(value) => handleChange('registration', value)}
            />
          </XStack>
        </YStack>

        <YStack gap='$2'>
          <Text fontSize='$4'>{localized('Breed Information')}</Text>
          <BreedSelector
            // selectedBreed={parent?.breed?.id}
            onSelectBreed={(breed) =>
              handleChange('breed', {id: breed.id, name: breed.name})
            }
            open={false}
            onOpenChange={() => {}}
          />
          <Input
            placeholder={localized('Color')}
            value={parent?.color}
            onChangeText={(value) => handleChange('color', value)}
          />
        </YStack>

        <YStack gap='$2'>
          <Text fontSize='$4'>{localized('Health Testing')}</Text>
          {HEALTH_TESTS.map((test) => (
            <XStack
              key={test.id}
              justifyContent='space-between'
              alignItems='center'
            >
              <Text>{localized(test.label)}</Text>
              <Switch
                checked={parent?.healthTesting?.[test.id]}
                onCheckedChange={(checked) =>
                  handleChange(`healthTesting.${test.id}`, checked)
                }
              />
            </XStack>
          ))}
        </YStack>

        <YStack gap='$2'>
          <Text fontSize='$4'>{localized('Images')}</Text>
          <ImageSelector
            onSelectImage={(image) => {
              const currentImages = parent?.images || [];
              handleChange('images', [...currentImages, image]);
            }}
            maxImages={5}
            images={parent?.images}
            onRemoveImage={(index) => {
              const newImages = [...(parent?.images || [])];
              newImages.splice(index, 1);
              handleChange('images', newImages);
            }}
          />
        </YStack>

        <XStack gap='$2' alignItems='center'>
          <Switch
            checked={parent?.isCoOwned}
            onCheckedChange={(checked) => handleChange('isCoOwned', checked)}
          />
          <Text>{localized('Co-Owned')}</Text>
        </XStack>
      </YStack>
    </Card>
  );
};

export default function ParentsStep() {
  const {localized} = useTranslations();
  const router = useRouter();
  const {formData, handleChange, validateStep} = useLitterForm();

  const handleContinue = () => {
    if (validateStep('parents')) {
      router.push('/litter/pricing');
    }
  };

  return (
    <YStack gap='$4' padding='$4'>
      <ParentForm
        type='sire'
        parent={formData.parents?.sire}
        onChange={handleChange}
        localized={localized}
      />

      <ParentForm
        type='dam'
        parent={formData.parents?.dam}
        onChange={handleChange}
        localized={localized}
      />

      <Button
        theme='active'
        onPress={handleContinue}
        disabled={!validateStep('parents')}
      >
        {localized('Continue')}
      </Button>
    </YStack>
  );
}
