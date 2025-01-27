import React from 'react';
import {YStack, XStack, Text, RadioGroup, Input, Select, Button} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {SeekerProfile} from '../../../api/firebase/users/userClient';
import BreedSelector from '../../../components/BreedSelector';

interface PreferencesTabProps {
  formData: SeekerProfile['preferences'];
  onChange: (field: string, value: any) => void;
}

export const PreferencesTab = ({formData, onChange}: PreferencesTabProps) => {
  const {localized} = useTranslations();

  const timelineOptions = [
    {value: 'immediate', label: 'Ready Now'},
    {value: '1-3_months', label: '1-3 Months'},
    {value: '3-6_months', label: '3-6 Months'},
    {value: '6+_months', label: '6+ Months'},
  ];

  const handleAddBreedPreference = (breed: {id: string; name: string}) => {
    onChange('breedPreferences', [
      ...formData.breedPreferences,
      {
        breedId: breed.id,
        breedName: breed.name,
        isRequired: true,
      },
    ]);
  };

  return (
    <YStack gap='$4' px='$4'>
      {/* Breed Preferences */}
      <YStack gap='$2'>
        <Text fontWeight='bold'>{localized('Preferred Breeds')}*</Text>
        <BreedSelector
          onSelectBreed={handleAddBreedPreference}
          onOpenChange={(open) => {}}
          open={false}
        />

        <YStack gap='$2'>
          {formData.breedPreferences.map((breed, index) => (
            <XStack
              key={breed.breedId}
              jc='space-between'
              ai='center'
              p='$2'
              borderWidth={1}
              borderRadius='$4'
            >
              <Text>{breed.breedName}</Text>
              <XStack gap='$2'>
                <Button
                  size='$3'
                  theme={breed.isRequired ? 'active' : 'gray'}
                  onPress={() => {
                    const newPreferences = [...formData.breedPreferences];
                    newPreferences[index] = {
                      ...breed,
                      isRequired: !breed.isRequired,
                    };
                    onChange('breedPreferences', newPreferences);
                  }}
                >
                  {breed.isRequired ? 'Required' : 'Optional'}
                </Button>
                <Button
                  size='$3'
                  theme='red'
                  onPress={() => {
                    onChange(
                      'breedPreferences',
                      formData.breedPreferences.filter(
                        (b) => b.breedId !== breed.breedId
                      )
                    );
                  }}
                >
                  Remove
                </Button>
              </XStack>
            </XStack>
          ))}
        </YStack>
      </YStack>

      {/* Age Range */}
      <YStack gap='$2'>
        <Text fontWeight='bold'>{localized('Age Range (months)')}</Text>
        <XStack gap='$4'>
          <Input
            flex={1}
            value={formData.ageRange.min.toString()}
            onChangeText={(value) =>
              onChange('ageRange', {
                ...formData.ageRange,
                min: parseInt(value) || 0,
              })
            }
            keyboardType='numeric'
            placeholder='Min'
          />
          <Input
            flex={1}
            value={formData.ageRange.max.toString()}
            onChangeText={(value) =>
              onChange('ageRange', {
                ...formData.ageRange,
                max: parseInt(value) || 0,
              })
            }
            keyboardType='numeric'
            placeholder='Max'
          />
        </XStack>
      </YStack>

      {/* Gender Preference */}
      <YStack gap='$2'>
        <Text fontWeight='bold'>{localized('Gender Preference')}</Text>
        <RadioGroup
          value={formData.gender}
          onValueChange={(value) => onChange('gender', value)}
        >
          <XStack gap='$4'>
            <RadioGroup.Item value='male' size='$4'>
              <RadioGroup.Indicator />
              <Text ml='$2'>{localized('Male')}</Text>
            </RadioGroup.Item>
            <RadioGroup.Item value='female' size='$4'>
              <RadioGroup.Indicator />
              <Text ml='$2'>{localized('Female')}</Text>
            </RadioGroup.Item>
            <RadioGroup.Item value='either' size='$4'>
              <RadioGroup.Indicator />
              <Text ml='$2'>{localized('Either')}</Text>
            </RadioGroup.Item>
          </XStack>
        </RadioGroup>
      </YStack>

      {/* Timeline */}
      <YStack gap='$2'>
        <Text fontWeight='bold'>{localized('Timeline')}*</Text>
        <Select
          value={formData.timeline}
          onValueChange={(value) => onChange('timeline', value)}
        >
          <Select.Trigger>
            <Select.Value placeholder={localized('Select timeline')} />
          </Select.Trigger>
          <Select.Content>
            {timelineOptions.map((option, index) => (
              <Select.Item
                index={index}
                key={option.value}
                value={option.value}
              >
                <Select.ItemText>{localized(option.label)}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </YStack>

      {/* Price Range */}
      <YStack gap='$2'>
        <Text fontWeight='bold'>{localized('Price Range')}</Text>
        <XStack gap='$4'>
          <Input
            flex={1}
            value={formData.priceRange.min.toString()}
            onChangeText={(value) =>
              onChange('priceRange', {
                ...formData.priceRange,
                min: parseInt(value) || 0,
              })
            }
            keyboardType='numeric'
            placeholder='Min'
          />
          <Input
            flex={1}
            value={formData.priceRange.max.toString()}
            onChangeText={(value) =>
              onChange('priceRange', {
                ...formData.priceRange,
                max: parseInt(value) || 0,
              })
            }
            keyboardType='numeric'
            placeholder='Max'
          />
        </XStack>
      </YStack>
    </YStack>
  );
};
