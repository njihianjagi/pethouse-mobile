import React from 'react';
import {
  YStack,
  Text,
  Input,
  Switch,
  XStack,
  Select,
  Card,
  ToggleGroup,
} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {PuppyListing} from '../../../api/firebase/listings/useListingData';
import BreedSelector from '../../../components/BreedSelector';
import ImageSelector from '../../../components/ImageSelector';

interface PuppyListingProps {
  formData: Partial<PuppyListing>;
  onChange: (field: string, value: any) => void;
}

export const PuppyListingScreen = ({formData, onChange}: PuppyListingProps) => {
  const {localized} = useTranslations();

  return (
    <YStack gap='$4'>
      <Card elevate bordered>
        <YStack gap='$3' p='$4'>
          <Text fontWeight='bold'>{localized('Basic Information')}</Text>

          <YStack gap='$2'>
            <Text>{localized('Breed')}</Text>
            <BreedSelector
              onSelectBreed={(breed) => onChange('breed', breed)}
            />
          </YStack>

          <YStack gap='$2'>
            <Text>{localized('Name')}</Text>
            <Input
              value={formData.name}
              onChangeText={(value) => onChange('name', value)}
              placeholder={localized('Puppy Name')}
            />
          </YStack>

          <YStack gap='$2'>
            <Text>{localized('Sex')}</Text>
            <ToggleGroup
              type='single'
              value={formData.sex as string}
              onValueChange={(value) => onChange('sex', value)}
            >
              <ToggleGroup.Item value='male' flex={1}>
                <Text>{localized('Male')}</Text>
              </ToggleGroup.Item>
              <ToggleGroup.Item value='female' flex={1}>
                <Text>{localized('Female')}</Text>
              </ToggleGroup.Item>
            </ToggleGroup>
          </YStack>

          <YStack gap='$2'>
            <Text>{localized('Date of Birth')}</Text>
            {/* <DatePicker
              value={formData.dateOfBirth}
              onChange={(date) => onChange('dateOfBirth', date)}
            /> */}
          </YStack>

          <YStack gap='$2'>
            <Text>{localized('Color')}</Text>
            <Input
              value={formData.color}
              onChangeText={(value) => onChange('color', value)}
              placeholder={localized('Coat Color')}
            />
          </YStack>

          <YStack gap='$2'>
            <Text>{localized('Price')}</Text>
            <Input
              value={formData.price?.toString()}
              onChangeText={(value) =>
                onChange('price', parseFloat(value) || 0)
              }
              placeholder={localized('Price')}
              keyboardType='numeric'
            />
          </YStack>
        </YStack>
      </Card>

      <Card elevate bordered>
        <YStack gap='$3' p='$4'>
          <Text fontWeight='bold'>{localized('Registration')}</Text>

          <Select
            value={formData.registration?.type}
            onValueChange={(value) =>
              onChange('registration', {...formData.registration, type: value})
            }
          >
            <Select.Item index={1} value='limited'>
              {localized('Limited')}
            </Select.Item>
            <Select.Item index={2} value='full'>
              {localized('Full')}
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

          <Input
            value={formData.registration?.number}
            onChangeText={(value) =>
              onChange('registration', {
                ...formData.registration,
                number: value,
              })
            }
            placeholder={localized('Registration Number (Optional)')}
          />
        </YStack>
      </Card>

      <Card elevate bordered>
        <YStack gap='$3' p='$4'>
          <Text fontWeight='bold'>{localized('Health & Training')}</Text>

          <YStack gap='$2'>
            <Text>{localized('Health Status')}</Text>
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

          <Input
            value={formData.health?.medicalNotes}
            onChangeText={(value) =>
              onChange('health', {...formData.health, medicalNotes: value})
            }
            placeholder={localized('Medical Notes (Optional)')}
            multiline
            numberOfLines={3}
          />

          <YStack gap='$2'>
            <Text>{localized('Training Progress')}</Text>
            {Object.entries(formData.training || {}).map(([key, value]) =>
              typeof value === 'boolean' ? (
                <XStack key={key} gap='$2' alignItems='center'>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      onChange('training', {
                        ...formData.training,
                        [key]: checked,
                      })
                    }
                  />
                  <Text>{localized(key)}</Text>
                </XStack>
              ) : null
            )}
          </YStack>
        </YStack>
      </Card>

      <Card elevate bordered>
        <YStack gap='$3' p='$4'>
          <Text fontWeight='bold'>{localized('Adoption Requirements')}</Text>

          {Object.entries(formData.requirements || {}).map(([key, value]) => (
            <XStack key={key} gap='$2' alignItems='center'>
              <Switch
                checked={value as boolean}
                onCheckedChange={(checked) =>
                  onChange('requirements', {
                    ...formData.requirements,
                    [key]: checked,
                  })
                }
              />
              <Text>{localized(key)}</Text>
            </XStack>
          ))}
        </YStack>
      </Card>

      <ImageSelector
        images={formData.images || []}
        onSelectImage={(images) => onChange('images', images)}
        onRemoveImage={() => {}}
        maxImages={10}
      />

      <Input
        value={formData.description}
        onChangeText={(value) => onChange('description', value)}
        placeholder={localized('Describe the puppy')}
        multiline
        numberOfLines={4}
      />
    </YStack>
  );
};
