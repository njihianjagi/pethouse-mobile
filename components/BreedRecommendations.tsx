import React from 'react';
import {Image} from 'react-native';
import {YStack, XStack, Text, Card, ScrollView} from 'tamagui';
import {useTheme} from '../dopebase';

interface BreedRecommendationsProps {
  filteredBreeds: any[];
  onSelectBreed: (breed: any) => void;
}

export const BreedRecommendations = ({
  filteredBreeds,
  onSelectBreed,
}: BreedRecommendationsProps) => {
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  return (
    <ScrollView>
      <YStack gap='$4' padding='$4'>
        {/* <Text fontSize='$6' textAlign='center'>
          Based on your preferences, here are some breeds that might be perfect
          for you:
        </Text> */}

        {filteredBreeds.map((breed) => (
          <Card
            key={breed.id}
            bordered
            pressTheme
            onPress={() => onSelectBreed(breed)}
          >
            <Card.Header padded>
              <XStack gap='$4' alignItems='center'>
                {breed.image && (
                  <Image
                    source={{uri: breed.image}}
                    style={{width: 60, height: 60, borderRadius: 30}}
                  />
                )}
                <YStack>
                  <Text
                    fontSize='$5'
                    fontWeight='bold'
                    color={colorSet.primaryForeground}
                  >
                    {breed.name}
                  </Text>
                  <Text fontSize='$3' color={colorSet.secondaryText}>
                    Match Score: {breed.matchScore}%
                  </Text>
                </YStack>
              </XStack>
            </Card.Header>
          </Card>
        ))}
      </YStack>
    </ScrollView>
  );
};
