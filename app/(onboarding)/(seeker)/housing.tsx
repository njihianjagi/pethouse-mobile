import React from 'react';
import {YStack, XStack, Text, RadioGroup, Switch, Select, Input} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {SeekerProfile} from '../../../api/firebase/users/userClient';

interface HousingTabProps {
  formData: SeekerProfile['housing'];
  onChange: (field: string, value: any) => void;
}

export const HousingTab = ({formData, onChange}: HousingTabProps) => {
  const {localized} = useTranslations();

  const propertyTypes = [
    {value: 'house', label: 'House'},
    {value: 'apartment', label: 'Apartment'},
    {value: 'condo', label: 'Condo'},
    {value: 'other', label: 'Other'},
  ];

  const yardSizes = [
    {value: 'small', label: 'Small'},
    {value: 'medium', label: 'Medium'},
    {value: 'large', label: 'Large'},
  ];

  return (
    <YStack gap='$4' px='$4'>
      {/* Housing Type */}
      <YStack gap='$2'>
        <Text fontWeight='bold'>{localized('Housing Type')}*</Text>
        <RadioGroup
          value={formData.type}
          onValueChange={(value) =>
            onChange('type', value as SeekerProfile['housing']['type'])
          }
        >
          <XStack gap='$4'>
            <RadioGroup.Item value='own' size='$4'>
              <RadioGroup.Indicator />
              <Text ml='$2'>{localized('Own')}</Text>
            </RadioGroup.Item>
            <RadioGroup.Item value='rent' size='$4'>
              <RadioGroup.Indicator />
              <Text ml='$2'>{localized('Rent')}</Text>
            </RadioGroup.Item>
            <RadioGroup.Item value='live_with_parents' size='$4'>
              <RadioGroup.Indicator />
              <Text ml='$2'>{localized('Live with Parents')}</Text>
            </RadioGroup.Item>
          </XStack>
        </RadioGroup>
      </YStack>

      {/* Property Type */}
      <YStack gap='$2'>
        <Text fontWeight='bold'>{localized('Property Type')}*</Text>
        <Select
          value={formData.propertyType}
          onValueChange={(value) => onChange('propertyType', value)}
        >
          <Select.Trigger>
            <Select.Value placeholder={localized('Select property type')} />
          </Select.Trigger>
          <Select.Content>
            {propertyTypes.map((type, index) => (
              <Select.Item index={index} key={type.value} value={type.value}>
                <Select.ItemText>{localized(type.label)}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </YStack>

      {/* Landlord Approval (if renting) */}
      {formData.type === 'rent' && (
        <YStack gap='$2'>
          <XStack gap='$2' ai='center'>
            <Switch
              checked={formData.hasLandlordApproval}
              onCheckedChange={(checked) =>
                onChange('hasLandlordApproval', checked)
              }
            />
            <Text>{localized('Have Landlord Approval')}</Text>
          </XStack>
          {formData.hasLandlordApproval && (
            <Input
              value={formData.landlordContact}
              onChangeText={(value) => onChange('landlordContact', value)}
              placeholder={localized('Landlord contact information')}
            />
          )}
        </YStack>
      )}

      {/* Yard Information */}
      <YStack gap='$2'>
        <XStack gap='$2' ai='center'>
          <Switch
            checked={formData.yard.hasYard}
            onCheckedChange={(checked) =>
              onChange('yard', {...formData.yard, hasYard: checked})
            }
          />
          <Text>{localized('Has Yard')}</Text>
        </XStack>

        {formData.yard.hasYard && (
          <YStack gap='$2'>
            <XStack gap='$2' ai='center'>
              <Switch
                checked={formData.yard.isFenced}
                onCheckedChange={(checked) =>
                  onChange('yard', {...formData.yard, isFenced: checked})
                }
              />
              <Text>{localized('Yard is Fenced')}</Text>
            </XStack>

            <Select
              value={formData.yard.yardSize}
              onValueChange={(value) =>
                onChange('yard', {...formData.yard, size: value})
              }
            >
              <Select.Trigger>
                <Select.Value placeholder={localized('Select yard size')} />
              </Select.Trigger>
              <Select.Content>
                {yardSizes.map((size, index) => (
                  <Select.Item
                    index={index}
                    key={size.value}
                    value={size.value}
                  >
                    <Select.ItemText>{localized(size.label)}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </YStack>
        )}
      </YStack>

      {/* Moving Plans */}
      <YStack gap='$2'>
        <XStack gap='$2' ai='center'>
          <Switch
            checked={formData.movingPlans}
            onCheckedChange={(checked) => onChange('movingPlans', checked)}
          />
          <Text>{localized('Planning to Move')}</Text>
        </XStack>

        {formData.movingPlans && (
          <Input
            value={formData.movingTimeframe}
            onChangeText={(value) => onChange('movingTimeframe', value)}
            placeholder={localized('When are you planning to move?')}
          />
        )}
      </YStack>
    </YStack>
  );
};
