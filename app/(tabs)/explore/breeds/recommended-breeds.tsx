import React from 'react';
import {FlatList} from 'react-native';
import {YStack, XStack, ScrollView, Button, H3, Spinner} from 'tamagui';
import {useTheme} from '../../../../dopebase';
import {useRouter} from 'expo-router';
import BreedCard from './breed-card';
import {useBreedMatch} from '../../../../hooks/useBreedMatch';

interface RecommendedBreedsProps {
  filteredBreeds: any[];
  onSelectBreed: (breed: any) => void;
  traitPreferences;
  updateFilter;
  traitGroups;
  loading;
}

export const RecommendedBreeds = ({
  filteredBreeds,
  onSelectBreed,
  traitPreferences,
  updateFilter,
  traitGroups,
  loading,
}: RecommendedBreedsProps) => {
  const {theme, appearance} = useTheme();
  const limitedBreeds = filteredBreeds.slice(0, 4);
  const {calculateBreedMatch} = useBreedMatch();

  const router = useRouter();

  return (
    <YStack gap='$4'>
      <XStack justifyContent='space-between' alignItems='center'>
        <H3 fontWeight='bold'>Recommended breeds</H3>
        <Button onPress={() => router.push('/explore')}>See All</Button>
      </XStack>

      {loading ? (
        <Spinner />
      ) : (
        <FlatList
          data={limitedBreeds.sort((a, b) => {
            const matchA = calculateBreedMatch(a, traitPreferences);
            const matchB = calculateBreedMatch(b, traitPreferences);
            return matchB - matchA;
          })}
          renderItem={({item, index}) => (
            <XStack flex={1} key={index}>
              <BreedCard
                index={index}
                breed={item}
                traitPreferences={traitPreferences}
              />
            </XStack>
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={
            {
              // gap: 12,
              // paddingHorizontal: 2,
              // marginBottom: 12,
            }
          }
        />
      )}
    </YStack>
  );
};
