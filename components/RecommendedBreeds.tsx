import React from 'react';
import {FlatList, Image} from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Card,
  ScrollView,
  Button,
  H3,
  Spinner,
} from 'tamagui';
import {useTheme} from '../dopebase';
import {EmptyStateCard} from './EmptyStateCard';
import {Filter} from '@tamagui/lucide-icons';
import {useRouter} from 'expo-router';
import BreedCard from '../app/(tabs)/(explore)/breed-card';

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

  const router = useRouter();

  return (
    <ScrollView>
      <YStack gap='$4'>
        <XStack justifyContent='space-between' alignItems='center'>
          <H3 fontWeight='bold'>Recommended for you</H3>
          <Button onPress={() => router.push('/(tabs)/(explore)')}>
            See All
          </Button>
        </XStack>

        {loading ? (
          <Spinner />
        ) : (
          <FlatList
            data={limitedBreeds}
            renderItem={({item, index}) => (
              <BreedCard key={index} breed={item} />
            )}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={{
              gap: 12,
              paddingHorizontal: 2,
              marginBottom: 12,
            }}
          />
        )}
      </YStack>
    </ScrollView>
  );
};
