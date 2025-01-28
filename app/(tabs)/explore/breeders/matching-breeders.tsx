import React, {useEffect, useState} from 'react';
import {ScrollView, Image, FlatList} from 'react-native';
import {XStack, YStack, Text, Card, Button, H3, View, Spinner} from 'tamagui';
import {MapPin, Star, ChevronRight} from '@tamagui/lucide-icons';
import {useTheme} from '../../../../dopebase';
import {useRouter} from 'expo-router';
import {useBreedData} from '../../../../api/firebase/breeds/useBreedData';
import BreederCard from './breeder-card';

interface MatchingBreedersProps {
  userBreeds: any[];
}

export const MatchingBreeders = ({userBreeds}: MatchingBreedersProps) => {
  const router = useRouter();
  const {theme, appearance} = useTheme();
  const colorSet = theme?.colors[appearance];

  const {loading, error, fetchUserBreedsByBreedId} = useBreedData();
  const [breedersMap, setBreedersMap] = useState<{[key: string]: any[]}>({});

  useEffect(() => {
    const loadBreedersByBreed = async () => {
      const breedersData = {};

      for (const breed of userBreeds) {
        const breedsWithUsers = await fetchUserBreedsByBreedId(breed.breedId);
        if (breedsWithUsers?.length > 0) {
          breedersData[breed.breedId] = breedsWithUsers;
        }
      }

      setBreedersMap(breedersData);
    };

    if (userBreeds?.length > 0) {
      loadBreedersByBreed();
    }
  }, [userBreeds]);

  if (Object.keys(breedersMap).length === 0) {
    return null;
  }

  return (
    <YStack gap='$4'>
      {[userBreeds[0]]?.map((breed) => {
        const breeders = breedersMap[breed.breedId] || [];
        if (breeders.length === 0) return null;

        return (
          <YStack key={breed.breedId} gap='$4'>
            <XStack
              justifyContent='space-between'
              alignItems='center'
              paddingHorizontal='$4'
              width='100%'
            >
              <YStack>
                <H3 fontWeight='bold' textTransform='capitalize'>
                  {breed.breedName} Breeders
                </H3>
                <Text opacity={0.6} fontSize='$2'>
                  Find breeders who have the same breed as you
                </Text>
              </YStack>
              <Button
                chromeless
                onPress={() =>
                  router.push({
                    pathname: '/(breeders)',
                    params: {breedId: breed.breedId},
                  })
                }
              >
                See All
              </Button>
            </XStack>

            {loading ? (
              <View
                flex={1}
                minHeight={128}
                justifyContent='center'
                alignItems='center'
              >
                <Spinner size='large' color={colorSet.primaryForeground} />
              </View>
            ) : error ? (
              <YStack
                flex={1}
                justifyContent='center'
                alignItems='center'
                padding='$4'
              >
                <Text color={colorSet.error}>
                  Unable to load breeders. Please try again later.
                </Text>
              </YStack>
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={breeders}
                renderItem={({item: breeder, index}) => (
                  <BreederCard
                    index={index}
                    key={breeder.id}
                    breeder={breeder}
                  />
                )}
                keyExtractor={(breeder) => breeder.id}
                contentContainerStyle={{gap: 8, paddingHorizontal: 16}}
              />
            )}
          </YStack>
        );
      })}
    </YStack>
  );
};
