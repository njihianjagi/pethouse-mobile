import React from 'react';
import {YStack, Text, Button, XStack, Switch, Input, Card} from 'tamagui';
import BreedSelector from '../../../components/BreedSelector';
import {useTranslations} from '../../../dopebase';

interface BreedsTabProps {
  breeds: Array<{
    breedId: string;
    breedName: string;
    yearsBreeding: number;
    healthTesting: {
      dna: boolean;
      hips: boolean;
      eyes: boolean;
      heart: boolean;
    };
  }>;
  onAddBreed: (breed: any) => void;
  onRemoveBreed: (breedId: string) => void;
  onUpdateBreed: (breedId: string, field: string, value: any) => void;
}

export const BreedsTab = ({
  breeds,
  onAddBreed,
  onRemoveBreed,
  onUpdateBreed,
}: BreedsTabProps) => {
  const {localized} = useTranslations();

  const healthTests = ['dna', 'hips', 'eyes', 'heart'];

  return (
    <YStack gap='$4' px='$4'>
      <BreedSelector
        onSelectBreed={onAddBreed}
        buttonText={localized('Add Breed')}
      />

      {breeds.map((breed) => (
        <Card key={breed.breedId} elevate bordered p='$4'>
          <YStack gap='$3'>
            <XStack jc='space-between' ai='center'>
              <Text fontSize='$6' fontWeight='bold'>
                {breed.breedName}
              </Text>
              <Button
                theme='red'
                size='$3'
                onPress={() => onRemoveBreed(breed.breedId)}
              >
                {localized('Remove')}
              </Button>
            </XStack>

            <YStack gap='$2'>
              <Text>{localized('Years Breeding')}</Text>
              <Input
                value={breed.yearsBreeding.toString()}
                onChangeText={(value) =>
                  onUpdateBreed(
                    breed.breedId,
                    'yearsBreeding',
                    parseInt(value) || 0
                  )
                }
                keyboardType='numeric'
              />
            </YStack>

            <YStack gap='$2'>
              <Text fontWeight='bold'>{localized('Health Testing')}</Text>
              <XStack flexWrap='wrap' gap='$4'>
                {healthTests.map((test) => (
                  <XStack key={test} gap='$2' ai='center'>
                    <Switch
                      checked={breed.healthTesting[test]}
                      onCheckedChange={(checked) =>
                        onUpdateBreed(
                          breed.breedId,
                          `healthTesting.${test}`,
                          checked
                        )
                      }
                    />
                    <Text textTransform='capitalize'>{localized(test)}</Text>
                  </XStack>
                ))}
              </XStack>
            </YStack>
          </YStack>
        </Card>
      ))}
    </YStack>
  );
};
