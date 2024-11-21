import React from 'react';
import {YStack, Input, Text, Form} from 'tamagui';
import {useTranslations} from '../../../dopebase';

interface BasicInfoTabProps {
  formData: {
    kennel: {
      name: string;
      registrationNumber?: string;
      description: string;
    };
  };
  onChange: (section: string, field: string, value: any) => void;
}

export const BasicInfoTab = ({formData, onChange}: BasicInfoTabProps) => {
  const {localized} = useTranslations();

  return (
    <YStack gap='$4' px='$4'>
      <YStack gap='$2'>
        <Text>{localized('Kennel Name')}*</Text>
        <Input
          value={formData.kennel.name}
          onChangeText={(value) => onChange('kennel', 'name', value)}
          placeholder={localized('Enter your kennel name')}
          autoCapitalize='words'
        />
      </YStack>

      <YStack gap='$2'>
        <Text>{localized('Registration Number')}</Text>
        <Input
          value={formData.kennel.registrationNumber}
          onChangeText={(value) =>
            onChange('kennel', 'registrationNumber', value)
          }
          placeholder={localized('Enter registration number (optional)')}
        />
      </YStack>

      <YStack gap='$2'>
        <Text>{localized('Description')}*</Text>
        <Input
          value={formData.kennel.description}
          onChangeText={(value) => onChange('kennel', 'description', value)}
          placeholder={localized('Tell us about your breeding program')}
          multiline
          numberOfLines={4}
          textAlignVertical='top'
        />
      </YStack>

      {/* <LocationInput
        value={formData.location}
        onChange={(location) => onChange('location', '', location)}
      /> */}
    </YStack>
  );
};
