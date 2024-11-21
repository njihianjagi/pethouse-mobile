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
  Slider,
} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import BreedSelector from '../../../components/BreedSelector';
import {WantedListing} from '../../../api/firebase/listings/useListingData';

interface WantedListingProps {
  formData: Partial<WantedListing>;
  onChange: (field: string, value: any) => void;
}

export const WantedListingScreen = ({
  formData,
  onChange,
}: WantedListingProps) => {
  const {localized} = useTranslations();

  return (
    <YStack gap='$4'>
      <Card elevate bordered>
        <YStack gap='$3' p='$4'>
          <Text fontWeight='bold'>{localized('Breed Preferences')}</Text>

          <YStack gap='$2'>
            <Text>{localized('Preferred Breeds')}</Text>
            <BreedSelector
              onSelectBreed={(breeds) => onChange('breeds', breeds)}
            />
          </YStack>

          <YStack gap='$2'>
            <Text>{localized('Sex Preference')}</Text>
            <ToggleGroup
              type='single'
              value={formData.preferences?.sex as string}
              onValueChange={(value) =>
                onChange('preferences', {
                  ...formData.preferences,
                  sex: value as string,
                })
              }
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
                  onChange('preferences', {
                    ...formData.preferences,
                    ageRange: {
                      ...formData.preferences?.ageRange,
                      min: parseInt(value) || 0,
                    },
                  })
                }
                keyboardType='numeric'
                placeholder={localized('Minimum')}
              />
              <Input
                flex={1}
                value={formData.preferences?.ageRange?.max?.toString()}
                onChangeText={(value) =>
                  onChange('preferences', {
                    ...formData.preferences,
                    ageRange: {
                      ...formData.preferences?.ageRange,
                      max: parseInt(value) || 0,
                    },
                  })
                }
                keyboardType='numeric'
                placeholder={localized('Maximum')}
              />
            </XStack>
          </YStack>

          <YStack gap='$2'>
            <Text>{localized('Price Range')}</Text>
            <XStack gap='$4'>
              <Input
                flex={1}
                value={formData.preferences?.priceRange?.min?.toString()}
                onChangeText={(value) =>
                  onChange('preferences', {
                    ...formData.preferences,
                    priceRange: {
                      ...formData.preferences?.priceRange,
                      min: parseInt(value) || 0,
                    },
                  })
                }
                keyboardType='numeric'
                placeholder={localized('Minimum')}
              />
              <Input
                flex={1}
                value={formData.preferences?.priceRange?.max?.toString()}
                onChangeText={(value) =>
                  onChange('preferences', {
                    ...formData.preferences,
                    priceRange: {
                      ...formData.preferences?.priceRange,
                      max: parseInt(value) || 0,
                    },
                  })
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
              onValueChange={(value) =>
                onChange('preferences', {
                  ...formData.preferences,
                  timeline: value,
                })
              }
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
      </Card>

      <Card elevate bordered>
        <YStack gap='$3' p='$4'>
          <Text fontWeight='bold'>{localized('Your Situation')}</Text>

          <YStack gap='$2'>
            {Object.entries(formData.situation || {}).map(([key, value]) =>
              typeof value === 'boolean' ? (
                <XStack key={key} gap='$2' alignItems='center'>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) =>
                      onChange('situation', {
                        ...formData.situation,
                        [key]: checked,
                      })
                    }
                  />
                  <Text>{localized(key)}</Text>
                </XStack>
              ) : key === 'hoursAlone' ? (
                <YStack key={key} gap='$2'>
                  <Text>{localized('Hours Alone Per Day')}</Text>
                  <Slider
                    value={[value as number]}
                    onValueChange={([newValue]) =>
                      onChange('situation', {
                        ...formData.situation,
                        hoursAlone: newValue,
                      })
                    }
                    min={0}
                    max={24}
                    step={1}
                  />
                  <Text>{value} hours</Text>
                </YStack>
              ) : key === 'experience' ? (
                <YStack key={key} gap='$2'>
                  <Text>{localized('Dog Experience')}</Text>
                  <Select
                    value={value as string}
                    onValueChange={(newValue) =>
                      onChange('situation', {
                        ...formData.situation,
                        experience: newValue,
                      })
                    }
                  >
                    <Select.Item index={0} value='first_time'>
                      {localized('First Time Owner')}
                    </Select.Item>
                    <Select.Item index={1} value='some_experience'>
                      {localized('Some Experience')}
                    </Select.Item>
                    <Select.Item index={2} value='experienced'>
                      {localized('Experienced Owner')}
                    </Select.Item>
                  </Select>
                </YStack>
              ) : null
            )}
          </YStack>
        </YStack>
      </Card>

      <Input
        value={formData.description}
        onChangeText={(value) => onChange('description', value)}
        placeholder={localized('Additional details or requirements')}
        multiline
        numberOfLines={4}
      />
    </YStack>
  );
};
