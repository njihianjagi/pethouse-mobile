import React from 'react';
import {YStack, Text, Input, Switch, XStack, Select, Card} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {LitterListing} from '../../../api/firebase/listings/useListingData';
import BreedSelector from '../../../components/BreedSelector';
import ImageSelector from '../../../components/ImageSelector';

interface LitterListingProps {
  formData: Partial<LitterListing>;
  onChange: (field: string, value: any) => void;
}

export const LitterListingScreen = ({
  formData,
  onChange,
}: LitterListingProps) => {
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
      </Card>

      <Card elevate bordered>
        <YStack gap='$3' p='$4'>
          <Text fontWeight='bold'>{localized('Pricing & Registration')}</Text>

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
      </Card>

      <Card elevate bordered>
        <YStack gap='$3' p='$4'>
          <Text fontWeight='bold'>{localized('Health Testing')}</Text>

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
      </Card>

      <Card elevate bordered>
        <YStack gap='$3' p='$4'>
          <Text fontWeight='bold'>{localized('Adoption Requirements')}</Text>

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
      </Card>

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

      <Input
        value={formData.description}
        onChangeText={(value) => onChange('description', value)}
        placeholder={localized('Describe the upcoming litter')}
        multiline
        numberOfLines={4}
      />
    </YStack>
  );
};
