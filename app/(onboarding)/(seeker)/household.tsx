import React from 'react';
import {YStack, XStack, Text, Input, Switch, Button} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {SeekerProfile} from '../../../api/firebase/users/userClient';

interface HouseholdTabProps {
  formData: SeekerProfile['household'];
  onChange: (field: string, value: any) => void;
}

export const HouseholdTab = ({formData, onChange}: HouseholdTabProps) => {
  const {localized} = useTranslations();

  const handleAddChildAge = (age: number) => {
    const currentAges = formData.childrenAges || [];
    onChange('childrenAges', [...currentAges, age]);
  };

  const handleRemoveChildAge = (index: number) => {
    const currentAges = formData.childrenAges || [];
    onChange(
      'childrenAges',
      currentAges.filter((_, i) => i !== index)
    );
  };

  return (
    <YStack gap='$4' px='$4'>
      {/* Adults */}
      <YStack gap='$2'>
        <Text fontWeight='bold'>{localized('Number of Adults')}*</Text>
        <Input
          value={formData.adults.toString()}
          onChangeText={(value) => onChange('adults', parseInt(value) || 1)}
          keyboardType='numeric'
          placeholder='1'
        />
      </YStack>

      {/* Children */}
      <YStack gap='$2'>
        <Text fontWeight='bold'>{localized('Number of Children')}*</Text>
        <Input
          value={formData.children.toString()}
          onChangeText={(value) => onChange('children', parseInt(value) || 0)}
          keyboardType='numeric'
          placeholder='0'
        />

        {formData.children > 0 && (
          <YStack gap='$2'>
            <Text>{localized('Children Ages')}</Text>
            <XStack flexWrap='wrap' gap='$2'>
              {formData.childrenAges?.map((age, index) => (
                <XStack
                  key={index}
                  borderWidth={1}
                  borderRadius='$4'
                  p='$2'
                  ai='center'
                >
                  <Text mr='$2'>{age}</Text>
                  <Button
                    size='$2'
                    theme='red'
                    onPress={() => handleRemoveChildAge(index)}
                  >
                    ✕
                  </Button>
                </XStack>
              ))}
            </XStack>
            <Input
              placeholder={localized('Add child age')}
              keyboardType='numeric'
              onSubmitEditing={(e) => {
                const age = parseInt(e.nativeEvent.text);
                if (age) handleAddChildAge(age);
                //e.currentTarget.clear();
              }}
            />
          </YStack>
        )}
      </YStack>

      {/* Allergies */}
      <YStack gap='$2'>
        <XStack gap='$2' ai='center'>
          <Switch
            checked={formData.hasAllergies}
            onCheckedChange={(checked) => onChange('hasAllergies', checked)}
          />
          <Text>{localized('Anyone in household has allergies')}</Text>
        </XStack>

        {formData.hasAllergies && (
          <Input
            value={formData.allergyDetails}
            onChangeText={(value) => onChange('allergyDetails', value)}
            placeholder={localized(
              'Please provide details about the allergies'
            )}
            multiline
            numberOfLines={3}
          />
        )}
      </YStack>

      {/* Family Agreement */}
      <XStack gap='$2' ai='center'>
        <Switch
          checked={formData.familyAgreement}
          onCheckedChange={(checked) => onChange('familyAgreement', checked)}
        />
        <Text>{localized('All family members agree to getting a dog')}</Text>
      </XStack>
    </YStack>
  );
};
