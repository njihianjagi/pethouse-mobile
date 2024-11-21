import React from 'react';
import {YStack, Text, XStack, Switch, Input, RadioGroup} from 'tamagui';
import {useTranslations} from '../../../dopebase';

interface FacilitiesTabProps {
  facilities: {
    type: 'home' | 'dedicated_facility' | 'both';
    details: string;
    hasWhelping: boolean;
    hasExerciseArea: boolean;
  };
  onChange: (field: string, value: any) => void;
}

export const FacilitiesTab = ({facilities, onChange}: FacilitiesTabProps) => {
  const {localized} = useTranslations();

  const facilityTypes = [
    {value: 'home', label: 'Home Based'},
    {value: 'dedicated_facility', label: 'Dedicated Facility'},
    {value: 'both', label: 'Both'},
  ];

  return (
    <YStack gap='$4' px='$4'>
      <YStack gap='$2'>
        <Text>{localized('Facility Type')}*</Text>
        <RadioGroup
          value={facilities.type}
          onValueChange={(value) => onChange('type', value)}
        >
          <XStack gap='$4'>
            {facilityTypes.map((type) => (
              <RadioGroup.Item key={type.value} value={type.value} size='$4'>
                <RadioGroup.Indicator />
                <Text ml='$2'>{localized(type.label)}</Text>
              </RadioGroup.Item>
            ))}
          </XStack>
        </RadioGroup>
      </YStack>

      <YStack gap='$2'>
        <Text>{localized('Facility Details')}*</Text>
        <Input
          value={facilities.details}
          onChangeText={(value) => onChange('details', value)}
          placeholder={localized('Describe your breeding facilities')}
          multiline
          numberOfLines={4}
          textAlignVertical='top'
        />
      </YStack>

      <YStack gap='$4'>
        <XStack gap='$2' ai='center'>
          <Switch
            checked={facilities.hasWhelping}
            onCheckedChange={(checked) => onChange('hasWhelping', checked)}
          />
          <Text>{localized('Dedicated Whelping Area')}</Text>
        </XStack>

        <XStack gap='$2' ai='center'>
          <Switch
            checked={facilities.hasExerciseArea}
            onCheckedChange={(checked) => onChange('hasExerciseArea', checked)}
          />
          <Text>{localized('Dedicated Exercise Area')}</Text>
        </XStack>
      </YStack>
    </YStack>
  );
};
