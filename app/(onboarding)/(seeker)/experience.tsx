import React from 'react';
import {YStack, XStack, Text, RadioGroup, Button, Input, Card} from 'tamagui';
import {useTranslations} from '../../../dopebase';
import {Plus, X} from '@tamagui/lucide-icons';
import {SeekerProfile} from '../../../api/firebase/users/userClient';

interface ExperienceTabProps {
  formData: SeekerProfile['experience'];
  onChange: (field: string, value: any) => void;
}

export const ExperienceTab = ({formData, onChange}: ExperienceTabProps) => {
  const {localized} = useTranslations();

  const handleAddCurrentPet = () => {
    onChange('currentPets', [
      ...formData.currentPets,
      {type: '', breed: '', age: 0, spayedNeutered: false},
    ]);
  };

  const handleAddPreviousPet = () => {
    onChange('previousPets', [
      ...formData.previousPets,
      {type: '', yearsOwned: 0, whatHappened: ''},
    ]);
  };

  return (
    <YStack gap='$4' px='$4'>
      {/* Dog Experience Level */}
      <YStack gap='$2'>
        <Text fontWeight='bold'>{localized('Dog Experience Level')}*</Text>
        <RadioGroup
          value={formData.dogExperience}
          onValueChange={(value) => onChange('dogExperience', value)}
        >
          <YStack gap='$2'>
            <RadioGroup.Item value='first_time' size='$4'>
              <RadioGroup.Indicator />
              <Text ml='$2'>{localized('First-time Dog Owner')}</Text>
            </RadioGroup.Item>
            <RadioGroup.Item value='some_experience' size='$4'>
              <RadioGroup.Indicator />
              <Text ml='$2'>{localized('Some Experience')}</Text>
            </RadioGroup.Item>
            <RadioGroup.Item value='experienced' size='$4'>
              <RadioGroup.Indicator />
              <Text ml='$2'>{localized('Experienced Dog Owner')}</Text>
            </RadioGroup.Item>
          </YStack>
        </RadioGroup>
      </YStack>

      {/* Current Pets */}
      <YStack gap='$2'>
        <XStack jc='space-between' ai='center'>
          <Text fontWeight='bold'>{localized('Current Pets')}</Text>
          <Button
            icon={Plus}
            size='$3'
            theme='active'
            onPress={handleAddCurrentPet}
          >
            {localized('Add Pet')}
          </Button>
        </XStack>

        {formData.currentPets.map((pet, index) => (
          <Card key={index} p='$4' bordered>
            <YStack gap='$2'>
              <XStack jc='space-between' ai='center'>
                <Text fontSize='$6'>
                  {localized('Pet')} #{index + 1}
                </Text>
                <Button
                  icon={X}
                  size='$3'
                  theme='red'
                  onPress={() => {
                    const newPets = [...formData.currentPets];
                    newPets.splice(index, 1);
                    onChange('currentPets', newPets);
                  }}
                />
              </XStack>

              <Input
                value={pet.type}
                onChangeText={(value) => {
                  const newPets = [...formData.currentPets];
                  newPets[index] = {...pet, type: value};
                  onChange('currentPets', newPets);
                }}
                placeholder={localized('Type of pet')}
              />

              <Input
                value={pet.breed}
                onChangeText={(value) => {
                  const newPets = [...formData.currentPets];
                  newPets[index] = {...pet, breed: value};
                  onChange('currentPets', newPets);
                }}
                placeholder={localized('Breed (if applicable)')}
              />

              <Input
                value={pet.age.toString()}
                onChangeText={(value) => {
                  const newPets = [...formData.currentPets];
                  newPets[index] = {...pet, age: parseInt(value) || 0};
                  onChange('currentPets', newPets);
                }}
                keyboardType='numeric'
                placeholder={localized('Age')}
              />
            </YStack>
          </Card>
        ))}
      </YStack>

      {/* Previous Pets */}
      <YStack gap='$2'>
        <XStack jc='space-between' ai='center'>
          <Text fontWeight='bold'>{localized('Previous Pets')}</Text>
          <Button
            icon={Plus}
            size='$3'
            theme='active'
            onPress={handleAddPreviousPet}
          >
            {localized('Add Previous Pet')}
          </Button>
        </XStack>

        {formData.previousPets.map((pet, index) => (
          <Card key={index} p='$4' bordered>
            <YStack gap='$2'>
              <XStack jc='space-between' ai='center'>
                <Text fontSize='$6'>
                  {localized('Previous Pet')} #{index + 1}
                </Text>
                <Button
                  icon={X}
                  size='$3'
                  theme='red'
                  onPress={() => {
                    const newPets = [...formData.previousPets];
                    newPets.splice(index, 1);
                    onChange('previousPets', newPets);
                  }}
                />
              </XStack>

              <Input
                value={pet.type}
                onChangeText={(value) => {
                  const newPets = [...formData.previousPets];
                  newPets[index] = {...pet, type: value};
                  onChange('previousPets', newPets);
                }}
                placeholder={localized('Type of pet')}
              />

              <Input
                value={pet.yearsOwned.toString()}
                onChangeText={(value) => {
                  const newPets = [...formData.previousPets];
                  newPets[index] = {...pet, yearsOwned: parseInt(value) || 0};
                  onChange('previousPets', newPets);
                }}
                keyboardType='numeric'
                placeholder={localized('Years owned')}
              />

              <Input
                value={pet.whatHappened}
                onChangeText={(value) => {
                  const newPets = [...formData.previousPets];
                  newPets[index] = {...pet, whatHappened: value};
                  onChange('previousPets', newPets);
                }}
                placeholder={localized('What happened to this pet?')}
                multiline
                numberOfLines={2}
              />
            </YStack>
          </Card>
        ))}
      </YStack>
    </YStack>
  );
};
